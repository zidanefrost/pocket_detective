import React from 'react';
import { GameState } from '../types';
import { playSound } from '../utils/audio';

interface BottomNavProps {
  gameState: GameState;
  activeTab: 'scan' | 'clues' | 'inventory' | 'map';
  setActiveTab: (tab: 'scan' | 'clues' | 'inventory' | 'map') => void;
  solvedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  gameState,
  activeTab,
  setActiveTab,
  solvedCount,
}) => {
  if (gameState === 'QUEST_LOADING' || gameState === 'VERIFYING') {
    return null; // Suppressed during loading / verification overlay as specified
  }

  const handleTab = (tab: 'scan' | 'clues' | 'inventory' | 'map') => {
    playSound.click();
    setActiveTab(tab);
  };

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#08090a]/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(16,185,129,0.1)] rounded-t-[20px]">
      <div className="flex justify-around items-center h-[72px] max-w-2xl mx-auto px-3 pb-safe">
        <button
          onClick={() => handleTab('scan')}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 ${
            activeTab === 'scan'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-white/50 hover:text-emerald-400'
          }`}
        >
          <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
          <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider mt-0.5">
            Scan
          </span>
        </button>

        <button
          onClick={() => handleTab('clues')}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl relative transition-all duration-200 ${
            activeTab === 'clues'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-white/50 hover:text-emerald-400'
          }`}
        >
          {gameState === 'GAMEPLAY' && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          )}
          <span className="material-symbols-outlined text-xl">search_check</span>
          <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider mt-0.5">
            Clues
          </span>
        </button>

        <button
          onClick={() => handleTab('inventory')}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl relative transition-all duration-200 ${
            activeTab === 'inventory'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-white/50 hover:text-emerald-400'
          }`}
        >
          {solvedCount > 0 && (
            <span className="absolute top-1 right-2 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]">
              {solvedCount}
            </span>
          )}
          <span className="material-symbols-outlined text-xl">inventory_2</span>
          <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider mt-0.5">
            Inventory
          </span>
        </button>

        <button
          onClick={() => handleTab('map')}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 ${
            activeTab === 'map'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-white/50 hover:text-emerald-400'
          }`}
        >
          <span className="material-symbols-outlined text-xl">explore</span>
          <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider mt-0.5">
            Map
          </span>
        </button>
      </div>
    </nav>
  );
};
