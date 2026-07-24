import React from 'react';
import { playSound } from '../utils/audio';

interface HeaderProps {
  currentStage?: number;
  totalStages?: number;
  timerSeconds?: number;
  score?: number;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  totalStages = 3,
  timerSeconds,
  score,
  onBack,
  showBack = false,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timerSeconds !== undefined && timerSeconds < 120;

  return (
    <header className="fixed top-0 w-full z-50 bg-[#08090a]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
      <div className="flex justify-between items-center px-5 py-3 h-[72px] max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack && onBack ? (
            <button
              onClick={() => {
                playSound.click();
                onBack();
              }}
              className="text-emerald-400 hover:text-white transition-all active:scale-95 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-emerald-500/50"
              title="Return to host setup"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : null}

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-2xl font-bold">
              mystery
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold leading-tight">
                Mission Active
              </span>
              <h1 className="font-serif tracking-tight text-white/90 italic text-xl leading-none">
                RoomQuest <span className="text-[10px] align-top not-italic text-white/30 ml-0.5 font-sans">v3.6</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStage ? (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Progress</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`w-5 h-1 rounded-full transition-all ${
                        s <= currentStage ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-xl font-serif italic text-white/50">
                0{currentStage}/0{totalStages}
              </div>
            </div>
          ) : null}

          {score !== undefined ? (
            <div
              className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-amber-300"
              title="Current score"
            >
              <span className="material-symbols-outlined text-base">stars</span>
              <span className="font-['Space_Grotesk'] text-xs font-bold tracking-wider">
                {score}
              </span>
            </div>
          ) : null}

          {timerSeconds !== undefined ? (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 border backdrop-blur-md transition-colors ${
                isLowTime
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
              title="Mission time remaining"
            >
              <span className="material-symbols-outlined text-base">timer</span>
              <span className="font-['Space_Grotesk'] font-bold text-xs tracking-wider">
                {formatTime(timerSeconds)}
              </span>
            </div>
          ) : (
            <div className="bg-emerald-500/10 text-emerald-400 font-['Space_Grotesk'] text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Vision Live
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
