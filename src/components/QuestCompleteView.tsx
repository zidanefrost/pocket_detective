import React from 'react';
import { SolvedInventoryItem } from '../types';
import { playSound } from '../utils/audio';

const CONFETTI_COLORS = ['#10b981', '#34d399', '#6366f1', '#f59e0b'];
const CONFETTI_PIECES = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 100}%`,
  delay: `${(index % 12) * 0.12}s`,
  duration: `${2.8 + (index % 7) * 0.24}s`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));

interface QuestCompleteViewProps {
  inventory: SolvedInventoryItem[];
  elapsedSeconds: number;
  score: number;
  outcome: 'completed' | 'timeout';
  totalStages: number;
  onNewQuest: () => void;
}

export const QuestCompleteView: React.FC<QuestCompleteViewProps> = ({
  inventory,
  elapsedSeconds,
  score,
  outcome,
  totalStages,
  onNewQuest,
}) => {
  const completed = outcome === 'completed';
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <main className="relative z-10 pt-[90px] pb-[100px] px-5 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center max-w-md mx-auto w-full custom-scrollbar">
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {completed &&
          CONFETTI_PIECES.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                backgroundColor: piece.color,
              }}
            />
          ))}
      </div>

      <div
        className={`bg-[#0a0b0e] glass-panel rounded-[32px] p-8 w-full flex flex-col items-center text-center gap-5 border animate-in fade-in zoom-in-95 duration-300 relative z-10 overflow-hidden ${
          completed
            ? 'success-glow border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.3)]'
            : 'error-glow border-rose-400/40 shadow-[0_0_50px_rgba(244,63,94,0.2)]'
        }`}
      >
        {/* Corner Brackets */}
        <div className="absolute top-5 left-5 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-5 right-5 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-5 right-5 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

        <div
          className={`relative w-20 h-20 flex items-center justify-center rounded-full border ${
            completed
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
              : 'bg-rose-500/10 border-rose-400/40 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-5xl ${
              completed ? 'text-emerald-400 animate-bounce' : 'text-rose-300'
            }`}
          >
            {completed ? 'key' : 'timer_off'}
          </span>
        </div>

        <div>
          <span
            className={`font-['Space_Grotesk'] text-xs uppercase tracking-widest font-bold ${
              completed ? 'text-indigo-400' : 'text-rose-300'
            }`}
          >
            {completed ? 'MISSION ACCOMPLISHED' : 'MISSION CLOCK EXPIRED'}
          </span>
          <h1 className="font-serif italic font-extrabold text-3xl text-white tracking-tight uppercase mt-1 neon-text-glow">
            {completed ? 'ROOM ESCAPED!' : 'TIME EXPIRED'}
          </h1>
          <p className="font-sans text-xs text-white/70 mt-1">
            {completed
              ? 'Every object was recovered before the mission clock ran out.'
              : 'The 20-minute clock ran out, but your recovered evidence still counts.'}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#121316] p-4">
            <span className="font-['Space_Grotesk'] text-[9px] font-bold uppercase tracking-widest text-white/45">
              Final score
            </span>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-bold text-amber-300">
              {score}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#121316] p-4">
            <span className="font-['Space_Grotesk'] text-[9px] font-bold uppercase tracking-widest text-white/45">
              {completed ? 'Escape time' : 'Mission time'}
            </span>
            <p className="mt-1 font-['Space_Grotesk'] text-lg font-bold text-emerald-400">
              {formatTime(elapsedSeconds)}
            </p>
          </div>
        </div>

        {/* Evidence Log Summary */}
        <div className="w-full text-left bg-[#121316] rounded-2xl p-5 border border-white/10 space-y-3 shadow-inner">
          <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-wider text-emerald-400 font-bold border-b border-white/10 pb-2">
            Unlocked Evidence Log ({inventory.length}/{totalStages})
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
