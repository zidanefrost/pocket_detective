import React from 'react';

interface VerificationViewProps {
  solutionImage: string | null;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  solutionImage,
}) => {
  return (
    <main className="relative z-10 pt-[90px] pb-[100px] px-5 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center max-w-sm mx-auto w-full">
      {/* Verification Glass Panel */}
      <div className="bg-[#0a0b0e] glass-panel rounded-[32px] w-full p-6 flex flex-col items-center gap-5 relative overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.18)]">
        {/* Corner Bracket Accents */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-emerald-500/15 rounded-full blur-[40px] animate-pulse" />
        </div>

        <div className="relative z-10 text-center w-full flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="material-symbols-outlined text-emerald-400 text-3xl animate-spin">
              memory
            </span>
            <h2 className="font-serif italic font-bold text-2xl text-emerald-400 tracking-tight uppercase neon-text-glow">
              Verifying
            </h2>
          </div>

          {/* Target Image Container with Scanner Beam */}
          <div className="relative w-full aspect-square bg-[#121316] rounded-[20px] overflow-hidden border border-emerald-500/40 shadow-inner my-2">
            {solutionImage ? (
              <img
                src={solutionImage}
                alt="Submitted Solution"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0a0b0e]">
                <span className="material-symbols-outlined text-4xl text-emerald-400">
                  image
                </span>
              </div>
            )}

            {/* Scanner Beam Animation */}
            <div className="absolute inset-0 overflow-hidden rounded-[20px] pointer-events-none">
              <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] absolute top-0 left-0 animate-scan" />
            </div>

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          </div>

          <div className="space-y-1">
            <p className="font-['Space_Grotesk'] text-xs text-indigo-400 uppercase tracking-widest font-semibold animate-pulse">
              VISION ENGINE ANALYZING
            </p>
            <p className="font-sans text-xs text-white/70 leading-snug">
              Gemini is comparing your evidence against the current riddle
              without revealing the answer...
            </p>
          </div>
        </div>

        {/* Animated Progress Line */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1 relative z-10">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </main>
  );
};
