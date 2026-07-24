import { useEffect, useState } from "react";

import { generateQuest, verifySolution } from "./api/roomQuest";
import { BackgroundShader } from "./components/BackgroundShader";
import { BottomNav } from "./components/BottomNav";
import { CameraCaptureModal } from "./components/CameraCaptureModal";
import { FeedbackModal } from "./components/FeedbackModal";
import { GameplayView } from "./components/GameplayView";
import { Header } from "./components/Header";
import { HostSetupView } from "./components/HostSetupView";
import { InventoryDrawer } from "./components/InventoryDrawer";
import { LoadingScreenView } from "./components/LoadingScreenView";
import { QuestCompleteView } from "./components/QuestCompleteView";
import { VerificationView } from "./components/VerificationView";
import type {
  ClueItem,
  GameState,
  QuestData,
  SolvedInventoryItem,
  VerificationResult,
} from "./types";
import { playSound } from "./utils/audio";

const QUEST_DURATION_SECONDS = 42 * 60 + 15;

export default function App() {
  const [step, setStep] = useState<GameState>("SCAN_ROOM");
  const [gameData, setGameData] = useState<QuestData | null>(null);
  const [currentClueIdx, setCurrentClueIdx] = useState(0);
  const [lastFeedback, setLastFeedback] =
    useState<VerificationResult | null>(null);

  const [activeTab, setActiveTab] = useState<
    "scan" | "clues" | "inventory" | "map"
  >("scan");
  const [solutionImage, setSolutionImage] = useState<string | null>(null);
  const [inventory, setInventory] = useState<SolvedInventoryItem[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(QUEST_DURATION_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) {
      return;
    }
    const interval = window.setInterval(() => {
      setTimerSeconds((previous) => Math.max(0, previous - 1));
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    setIsInventoryOpen(activeTab === "inventory" || activeTab === "map");
  }, [activeTab]);

  const handleAnalyzeRoom = async (roomImages: string[]) => {
    setStep("LOADING_QUEST");
    setErrorMessage(null);
    setLastFeedback(null);

    try {
      const quest = await generateQuest(roomImages);
      setGameData(quest);
      setCurrentClueIdx(0);
      setInventory([]);
      setTimerSeconds(QUEST_DURATION_SECONDS);
      setIsTimerRunning(true);
      setStep("PLAYING_CLUE");
      setActiveTab("clues");
      playSound.success();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not build this quest. Please try another room photo.",
      );
      setStep("SCAN_ROOM");
    }
  };

  const recordSolvedClue = (
    currentClue: ClueItem,
    verifiedImage?: string,
  ) => {
    const solvedItem: SolvedInventoryItem = {
      stage: currentClueIdx + 1,
      target_object_name: currentClue.target_object_name,
      poetic_clue: currentClue.poetic_clue,
      storyline_continuation: currentClue.storyline_continuation,
      verified_image: verifiedImage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setInventory((previous) => [
      ...previous.filter((item) => item.stage !== solvedItem.stage),
      solvedItem,
    ]);
  };

  const handleVerifySolution = async (capturedImage: string) => {
    const currentClue = gameData?.clues[currentClueIdx];
    if (!currentClue) {
      setErrorMessage("The current clue is unavailable. Build a new quest.");
      return;
    }

    setSolutionImage(capturedImage);
    setLastFeedback(null);
    setErrorMessage(null);
    setStep("VERIFYING_PHOTO");

    try {
      const result = await verifySolution(
        capturedImage,
        currentClue.target_object_name,
      );
      setLastFeedback(result);

      if (result.is_correct) {
        recordSolvedClue(currentClue, capturedImage);
        playSound.success();
      } else {
        playSound.failure();
      }
      setStep("PLAYING_CLUE");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not verify the photo. Please try again.",
      );
      setSolutionImage(null);
      setStep("PLAYING_CLUE");
    }
  };

  const handleNextClue = () => {
    if (!gameData) {
      return;
    }
    if (currentClueIdx < gameData.clues.length - 1) {
      setCurrentClueIdx((previous) => previous + 1);
      setSolutionImage(null);
      setLastFeedback(null);
      setActiveTab("clues");
      return;
    }

    setIsTimerRunning(false);
    setLastFeedback(null);
    setStep("GAME_OVER");
    playSound.success();
  };

  const handleTryAgain = () => {
    setSolutionImage(null);
    setLastFeedback(null);
    setActiveTab("clues");
  };

  const handleHostOverride = () => {
    const currentClue = gameData?.clues[currentClueIdx];
    if (!currentClue) {
      return;
    }
    recordSolvedClue(currentClue, solutionImage ?? undefined);
    playSound.success();
    handleNextClue();
  };

  const handleResetQuest = () => {
    setIsTimerRunning(false);
    setStep("SCAN_ROOM");
    setActiveTab("scan");
    setGameData(null);
    setCurrentClueIdx(0);
    setSolutionImage(null);
    setLastFeedback(null);
    setInventory([]);
    setTimerSeconds(QUEST_DURATION_SECONDS);
    setIsCameraModalOpen(false);
    setIsInventoryOpen(false);
    setErrorMessage(null);
  };

  const currentClue: ClueItem | undefined =
    gameData?.clues[currentClueIdx];
  const totalStages = gameData?.clues.length ?? 3;
  const currentStage = gameData
    ? Math.min(currentClueIdx + 1, totalStages)
    : undefined;
  const feedbackIsOpen =
    step === "PLAYING_CLUE" && Boolean(lastFeedback && currentClue);

  return (
    <div className="min-h-screen text-[#dae2fd] relative overflow-x-hidden font-['Inter'] selection:bg-[#06b6d4]/30">
      <BackgroundShader />

      <Header
        currentStage={currentStage}
        totalStages={totalStages}
        timerSeconds={isTimerRunning ? timerSeconds : undefined}
        showBack={step !== "SCAN_ROOM"}
        onBack={handleResetQuest}
      />

      {errorMessage && (
        <div className="fixed top-[76px] left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-rose-500/90 text-white text-xs font-['Space_Grotesk'] p-3 rounded-xl border border-rose-400 shadow-lg flex justify-between items-center">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-white/80 hover:text-white font-bold ml-2"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {step === "SCAN_ROOM" && (
        <HostSetupView onStartQuest={handleAnalyzeRoom} isLoading={false} />
      )}

      {step === "LOADING_QUEST" && <LoadingScreenView />}

      {step === "PLAYING_CLUE" && gameData && currentClue && (
        <GameplayView
          currentStage={currentClueIdx + 1}
          totalStages={totalStages}
          openingNarrative={gameData.opening_narrative}
          currentClue={currentClue}
          onOpenCamera={() => setIsCameraModalOpen(true)}
        />
      )}

      {step === "VERIFYING_PHOTO" && (
        <VerificationView solutionImage={solutionImage} />
      )}

      {feedbackIsOpen && lastFeedback && currentClue && (
        <FeedbackModal
          isCorrect={lastFeedback.is_correct}
          result={lastFeedback}
          currentClue={currentClue}
          isFinalStage={currentClueIdx === totalStages - 1}
          onNextClue={handleNextClue}
          onTryAgain={handleTryAgain}
          onHostOverride={handleHostOverride}
        />
      )}

      {step === "GAME_OVER" && (
        <QuestCompleteView
          inventory={inventory}
          elapsedSeconds={QUEST_DURATION_SECONDS - timerSeconds}
          onNewQuest={handleResetQuest}
        />
      )}

      <CameraCaptureModal
        title="Submit your solution"
        subtitle="Photograph the physical item described by the current riddle."
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleVerifySolution}
      />

      <InventoryDrawer
        inventory={inventory}
        allClues={gameData?.clues || []}
        currentStage={currentStage ?? 1}
        isOpen={isInventoryOpen}
        onClose={() => {
          setIsInventoryOpen(false);
          setActiveTab(step === "SCAN_ROOM" ? "scan" : "clues");
        }}
      />

      <BottomNav
        gameState={step}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        solvedCount={inventory.length}
      />
    </div>
  );
}
