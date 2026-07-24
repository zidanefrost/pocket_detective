import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechState {
  isSpeaking: boolean;
  speakingText: string | null;
  errorMessage: string | null;
}

const INITIAL_STATE: SpeechState = {
  isSpeaking: false,
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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const clearPlayback = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearPlayback();
    setState(INITIAL_STATE);
  }, [clearPlayback]);

  const speak = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) {
        return;
      }
      if (state.speakingText === text && state.isSpeaking) {
        stop();
        return;
      }

      stop();
      if (
        !("speechSynthesis" in window) ||
        typeof SpeechSynthesisUtterance === "undefined"
      ) {
        setState({
          isSpeaking: false,
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
          speakingText: text,
          errorMessage: null,
        });
      };
      utterance.onend = () => {
        utteranceRef.current = null;
        setState((previous) => ({
          ...previous,
          isSpeaking: false,
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
          speakingText: null,
          errorMessage:
            "Device narration could not play. You can still read the text on screen.",
        });
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [state.isSpeaking, state.speakingText, stop],
  );

  useEffect(
    () => () => {
      clearPlayback();
    },
    [clearPlayback],
  );

  return {
    speak,
    stop,
    isSpeaking: state.isSpeaking,
    isLoading: false,
    speakingText: state.speakingText,
    errorMessage: state.errorMessage,
  };
}
