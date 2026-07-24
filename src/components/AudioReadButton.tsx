import type { FC } from "react";

interface AudioReadButtonProps {
  onToggle: () => void;
  isSpeaking: boolean;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export const AudioReadButton: FC<AudioReadButtonProps> = ({
  onToggle,
  isSpeaking,
  isLoading = false,
  label = "Listen",
  className = "",
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      onToggle();
    }}
    aria-label={
      isLoading
        ? "Loading voice narration"
        : isSpeaking
          ? "Stop voice narration"
          : "Play voice narration"
    }
    aria-pressed={isSpeaking}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-['Space_Grotesk'] text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
      isSpeaking
        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        : isLoading
          ? "cursor-wait border-indigo-400/30 bg-indigo-500/10 text-indigo-300"
          : "border-white/20 bg-white/5 text-white/80 hover:border-emerald-500/50 hover:bg-white/15 hover:text-white"
    } ${className}`}
  >
    {isLoading ? (
      <>
        <span className="material-symbols-outlined animate-spin text-sm">
          progress_activity
        </span>
        <span>Voice AI</span>
      </>
    ) : isSpeaking ? (
      <>
        <span className="material-symbols-outlined text-sm">stop_circle</span>
        <span>Stop</span>
      </>
    ) : (
      <>
        <span className="material-symbols-outlined text-sm text-emerald-400">
          volume_up
        </span>
        <span>{label}</span>
      </>
    )}
  </button>
);
