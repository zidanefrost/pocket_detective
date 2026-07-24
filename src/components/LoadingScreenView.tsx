import React, { useState, useEffect } from 'react';
import { OrbitalRings3D } from './OrbitalRings3D';

const STATUS_MESSAGES = [
  "Gemini Vision inspecting objects...",
  "Drafting poetic riddles...",
  "Locking room sequence...",
];

export const LoadingScreenView: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative z-10 w-full px-5 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Central Glassmorphic Card */}
      <div className="bg-[#0a0b0e] glass-panel rounded-[32px] p-8 w-full max-w-sm flex flex-col items-center justify-center border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.18)] relative overflow-hidden">
        {/* Corner Brackets */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

        {/* 3D Orbital Rings Animation Container */}
        <div className="mb-6">
          <OrbitalRings3D />
        </div>

        {/* Status Text Cycler */}
        <div className="relative h-12 w-full flex items-center justify-center overflow-hidden">
          <p className="font-serif italic text-base text-emerald-400 text-center font-medium tracking-wide transition-all duration-500 animate-pulse">
            "{STATUS_MESSAGES[msgIndex]}"
          </p>
        </div>

        {/* Pulsing Dots */}
        <div className="w-full mt-6 flex justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-ping" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 animate-pulse" />
        </div>
      </div>
    </main>
  );
};
