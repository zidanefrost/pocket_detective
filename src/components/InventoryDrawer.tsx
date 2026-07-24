import React from 'react';
import { SolvedInventoryItem, ClueItem } from '../types';
import { playSound } from '../utils/audio';

interface InventoryDrawerProps {
  inventory: SolvedInventoryItem[];
  allClues: ClueItem[];
  currentStage: number;
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  inventory,
  allClues,
  currentStage,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0a0b0e] glass-panel rounded-[32px] p-6 flex flex-col gap-4 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] max-h-[85vh] overflow-hidden relative">
        {/* Corner Brackets */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">
              inventory_2
            </span>
            <h3 className="font-serif italic font-bold text-xl text-white">
              Evidence Inventory & Map
            </h3>
          </div>
          <button
            onClick={() => {
              playSound.click();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {/* Unlocked Items */}
          <div className="space-y-2">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
              Discovered Evidence ({inventory.length} / 3)
            </span>

            {inventory.length === 0 ? (
              <div className="bg-[#121316] rounded-2xl p-4 text-center border border-white/5">
                <p className="text-xs text-white/50 font-serif italic">
                  No evidence unlocked yet. Solve Stage 1's riddle to collect your first item!
                </p>
              </div>
            ) : (
              inventory.map((item) => (
                <div
                  key={item.stage}
                  className="bg-[#121316] border border-emerald-500/30 rounded-2xl p-3.5 flex gap-3.5 items-center shadow-sm"
                >
                  {item.verified_image ? (
                    <img
                      src={item.verified_image}
                      alt={item.target_object_name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
                      <span className="material-symbols-outlined">key</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif font-bold text-xs text-white truncate">
                        {item.target_object_name}
                      </h4>
                      <span className="text-[10px] font-['Space_Grotesk'] text-indigo-400 font-semibold">
                        Stage {item.stage}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/70 line-clamp-2 mt-0.5 font-sans">
                      {item.storyline_continuation}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Map & Sector Status */}
          <div className="bg-[#121316] rounded-2xl p-4 border border-white/10 space-y-2">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">
              Room Sector Matrix
            </span>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3].map((s) => {
                const isDone = inventory.some((i) => i.stage === s);
                const isCurrent = currentStage === s && !isDone;
                return (
                  <div
                    key={s}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                        : isCurrent
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isDone ? 'check_circle' : isCurrent ? 'lock_open' : 'lock'}
                    </span>
                    <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase">
                      Sector {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
