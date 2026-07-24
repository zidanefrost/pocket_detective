import React from 'react';
import { SolvedInventoryItem } from '../types';
import { playSound } from '../utils/audio';

interface QuestCompleteViewProps {
  inventory: SolvedInventoryItem[];
  elapsedSeconds: number;
  onNewQuest: () => void;
}

export const QuestCompleteView: React.FC<QuestCompleteViewProps> = ({
  inventory,
  elapsedSeconds,
  onNewQuest,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <main className="relative z-10 pt-[90px] pb-[100px] px-5 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center max-w-md mx-auto w-full custom-scrollbar">
      <div className="bg-[#0a0b0e] glass-panel success-glow rounded-[32px] p-8 w-full flex flex-col items-center text-center gap-5 border border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Corner Brackets */}
        <div className="absolute top-5 left-5 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-5 right-5 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-5 right-5 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

        <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          <span className="material-symbols-outlined text-5xl text-emerald-400 animate-bounce">
            key
          </span>
        </div>

        <div>
          <span className="font-['Space_Grotesk'] text-xs text-indigo-400 uppercase tracking-widest font-bold">
            MISSION ACCOMPLISHED
          </span>
          <h1 className="font-serif italic font-extrabold text-3xl text-white tracking-tight uppercase mt-1 neon-text-glow">
            ROOM ESCAPED!
          </h1>
          <p className="font-sans text-xs text-white/70 mt-1">
            Total Escape Time: <span className="text-emerald-400 font-bold">{formatTime(elapsedSeconds)}</span>
          </p>
        </div>

        {/* Evidence Log Summary */}
        <div className="w-full text-left bg-[#121316] rounded-2xl p-5 border border-white/10 space-y-3 shadow-inner">
          <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-wider text-emerald-400 font-bold border-b border-white/10 pb-2">
            Unlocked Evidence Log ({inventory.length}/3)
          </h3>
          <div className="space-y-3">
            {inventory.map((item) => (
              <div key={item.stage} className="flex gap-3 items-start text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold text-[10px] flex-shrink-0 mt-0.5">
                  {item.stage}
                </div>
                <div>
                  <h4 className="font-bold text-white font-serif">{item.target_object_name}</h4>
                  <p className="text-white/70 text-[11px] mt-0.5 leading-normal font-sans">
                    {item.storyline_continuation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            playSound.click();
            onNewQuest();
          }}
          className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest btn-glow-emerald active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 border border-emerald-400/30"
        >
          <span className="material-symbols-outlined text-lg">autorenew</span>
          Build New Room Quest
        </button>
      </div>
    </main>
  );
};
