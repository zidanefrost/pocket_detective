import { useCallback, useEffect, useRef, useState } from "react";

const audioCache = new Map<string, string>();

interface SpeechState {
  isSpeaking: boolean;
  isLoading: boolean;
  speakingText: string | null;
  errorMessage: string | null;
}

const INITIAL_STATE: SpeechState = {
  isSpeaking: false,
  isLoading: false,
  speakingText: null,
  errorMessage: null,
};

function getDeviceVoice(): SpeechSynthesisVoice | undefined {
  if (!("speechSynthesis" in window)) {
    return undefined;
  }
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "en-gb") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

export function useSpeech() {
  const [state, setState] = useState<SpeechState>(INITIAL_STATE);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestSequenceRef = useRef(0);

  const clearPlayback = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
  }, []);

  const stop = useCallback(() => {
    requestSequenceRef.current += 1;
    clearPlayback();
    setState(INITIAL_STATE);
  }, [clearPlayback]);

  const speakWithDevice = useCallback(
    (text: string, notice?: string) => {
      if (
        !("speechSynthesis" in window) ||
        typeof SpeechSynthesisUtterance === "undefined"
      ) {
        setState({
          isSpeaking: false,
          isLoading: false,
          speakingText: null,
          errorMessage:
            "Voice narration is unavailable in this browser. You can still read the text on screen.",
        });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = getDeviceVoice() ?? null;
      utterance.lang = utterance.voice?.lang || "en-GB";
      utterance.rate = 0.88;
      utterance.pitch = 0.82;
      utterance.onstart = () => {
        setState({
          isSpeaking: true,
          isLoading: false,
          speakingText: text,
          errorMessage: notice ?? null,
        });
      };
      utterance.onend = () => {
        utteranceRef.current = null;
        setState((previous) => ({
          ...previous,
          isSpeaking: false,
          isLoading: false,
          speakingText: null,
        }));
      };
      utterance.onerror = (event) => {
        utteranceRef.current = null;
        if (event.error === "canceled" || event.error === "interrupted") {
          return;
        }
        setState({
          isSpeaking: false,
          isLoading: false,
          speakingText: null,
          errorMessage:
            "Device narration could not play. You can still read the text on screen.",
        });
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  const playAudio = useCallback(
    async (audioUrl: string, text: string): Promise<boolean> => {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => {
        setState({
          isSpeaking: true,
          isLoading: false,
          speakingText: text,
          errorMessage: null,
        });
      };
      audio.onended = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        setState((previous) => ({
          ...previous,
          isSpeaking: false,
          isLoading: false,
          speakingText: null,
        }));
      };
      audio.onerror = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };

      try {
        await audio.play();
        return true;
      } catch {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        return false;
      }
    },
    [],
  );

  const speak = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) {
        return;
      }
      if (
        state.speakingText === text &&
        (state.isSpeaking || state.isLoading)
      ) {
        stop();
        return;
      }

      stop();
      const requestId = requestSequenceRef.current;
      setState({
        isSpeaking: false,
        isLoading: true,
        speakingText: text,
        errorMessage: null,
      });

      const cachedAudio = audioCache.get(text);
      if (cachedAudio) {
        const played = await playAudio(cachedAudio, text);
        if (!played && requestId === requestSequenceRef.current) {
          speakWithDevice(
            text,
            "Using this device's voice because AI audio playback was blocked.",
          );
        }
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("AI narration is unavailable.");
        }
        const audioBlob = await response.blob();
        if (!audioBlob.type.startsWith("audio/") || audioBlob.size === 0) {
          throw new Error("The narration response was not valid audio.");
        }
        if (requestId !== requestSequenceRef.current) {
          return;
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        audioCache.set(text, audioUrl);
        const played = await playAudio(audioUrl, text);
        if (!played && requestId === requestSequenceRef.current) {
          speakWithDevice(
            text,
            "Using this device's voice because AI audio playback was blocked.",
          );
        }
      } catch (error) {
        if (
          controller.signal.aborted ||
          requestId !== requestSequenceRef.current
        ) {
          return;
        }
        console.warn("AI narration unavailable; using device voice.", error);
        speakWithDevice(
          text,
          "Using this device's voice while AI narration is unavailable.",
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [
      playAudio,
      speakWithDevice,
      state.isLoading,
      state.isSpeaking,
      state.speakingText,
      stop,
    ],
  );

  useEffect(
    () => () => {
      requestSequenceRef.current += 1;
      clearPlayback();
    },
    [clearPlayback],
  );

  return {
    speak,
    stop,
    isSpeaking: state.isSpeaking,
    isLoading: state.isLoading,
    speakingText: state.speakingText,
    errorMessage: state.errorMessage,
  };
}
