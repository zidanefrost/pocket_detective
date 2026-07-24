import React from 'react';

interface AudioReadButtonProps {
  onToggle: () => void;
  isSpeaking: boolean;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export const AudioReadButton: React.FC<AudioReadButtonProps> = ({
  onToggle,
  isSpeaking,
  isLoading = false,
  label = "Listen",
  className = "",
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      type="button"
      disabled={isLoading}
      aria-label={isSpeaking ? "Pause Voice" : "Play Voice Narration"}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider font-['Space_Grotesk'] uppercase transition-all duration-200 border ${
        isSpeaking
          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
          : isLoading
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-wait'
          : 'bg-white/5 hover:bg-white/15 border-white/20 text-white/80 hover:text-white shadow-sm hover:border-emerald-500/50'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <span className="material-symbols-outlined text-sm animate-spin text-emerald-400">progress_activity</span>
          <span>Voice AI...</span>
        </>
      ) : isSpeaking ? (
        <>
          {/* Animated Equalizer Bars */}
          <div className="flex items-end gap-[2px] h-3 w-3">
            <span className="w-[2px] bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
            <span className="w-[2px] bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-3/4" />
            <span className="w-[2px] bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-1/2" />
          </div>
          <span>Playing...</span>
          <span className="material-symbols-outlined text-sm ml-0.5">volume_up</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-sm text-emerald-400">volume_up</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
