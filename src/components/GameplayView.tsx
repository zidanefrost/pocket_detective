import React from 'react';
import { ClueItem } from '../types';
import { playSound } from '../utils/audio';

interface GameplayViewProps {
  currentStage: number;
  totalStages: number;
  openingNarrative: string;
  currentClue: ClueItem;
  onOpenCamera: () => void;
}

export const GameplayView: React.FC<GameplayViewProps> = ({
  currentStage,
  totalStages,
  openingNarrative,
  currentClue,
  onOpenCamera,
}) => {
  return (
    <main className="relative z-10 pt-[88px] pb-[100px] px-5 min-h-[calc(100vh-80px)] flex flex-col justify-between max-w-lg mx-auto w-full custom-scrollbar">
      <div className="flex flex-col gap-6">
        {/* Story Narrative Panel */}
        <div className="glass-panel rounded-[24px] p-6 relative overflow-hidden group border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/50 border-l-2 border-emerald-500 pl-3 font-semibold">
                The Story Unfolds
              </h2>
            </div>
            
            <p className="text-base font-serif leading-relaxed text-white/90 italic">
              "{openingNarrative}"
            </p>
          </div>
        </div>

        {/* The Riddle Card - Artistic Flair Signature Box */}
        <div className="relative w-full bg-gradient-to-br from-emerald-500/15 via-indigo-500/10 to-emerald-500/5 rounded-[36px] p-1 border border-white/20 shadow-2xl flex flex-col my-1">
          <div className="bg-[#0a0b0e] rounded-[34px] p-8 flex flex-col items-center text-center relative overflow-hidden border border-white/10">
            {/* Corner Bracket Frame Accents */}
            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-white/20 pointer-events-none" />
            <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-white/20 pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-white/20 pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/20 pointer-events-none" />

            {/* Emblem Circle */}
            <div className="mb-5">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-500/50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold shadow-md">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </div>
              </div>
            </div>

            <h3 className="text-xs uppercase tracking-[0.4em] text-emerald-400 mb-4 font-bold">
              The Clue
            </h3>

            <blockquote className="text-xl sm:text-2xl font-serif italic text-white leading-relaxed px-2 font-light">
              "{currentClue.poetic_clue}"
            </blockquote>

            <div className="mt-8 w-full pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  playSound.click();
                  onOpenCamera();
                }}
                className="group relative inline-flex items-center justify-center w-full py-4 px-8 font-bold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-500 focus:outline-none shadow-xl hover:shadow-emerald-500/30 active:scale-95 border border-emerald-400/30 tracking-wider text-sm uppercase gap-2"
              >
                <span className="material-symbols-outlined text-xl">photo_camera</span>
                SNAP SOLUTION PHOTO
              </button>
              <p className="mt-3 text-[10px] text-white/40 uppercase tracking-widest font-medium text-center">
                Requires camera or photo selection
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
