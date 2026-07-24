import React from 'react';
import { VerificationResult, ClueItem } from '../types';
import { playSound } from '../utils/audio';

interface FeedbackModalProps {
  isCorrect: boolean;
  result: VerificationResult;
  currentClue: ClueItem;
  isFinalStage: boolean;
  onNextClue: () => void;
  onTryAgain: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isCorrect,
  result,
  currentClue,
  isFinalStage,
  onNextClue,
  onTryAgain,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md z-10 relative">
        {isCorrect ? (
          /* SUCCESS MODAL */
          <section className="bg-[#0a0b0e] glass-panel success-glow rounded-[32px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.25)] animate-in fade-in zoom-in-95 duration-300">
            {/* Corner Brackets */}
            <div className="absolute top-5 left-5 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
            <div className="absolute top-5 right-5 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
            <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

            {/* Floating Particles */}
            <div className="absolute top-1/2 left-1/4 w-2 h-2 particle" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 particle" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-2/3 left-1/3 w-2.5 h-2.5 particle" style={{ animationDelay: '1.2s' }} />

            {/* Glowing Check Icon */}
            <div className="relative w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <span className="material-symbols-outlined text-5xl text-emerald-400">
                check_circle
              </span>
              <div className="absolute inset-0 rounded-full border border-emerald-400/60 animate-ping" />
            </div>

            <h1 className="font-serif italic font-bold text-2xl text-white tracking-wide mb-1 uppercase neon-text-glow">
              EVIDENCE UNLOCKED!
            </h1>

            <p className="font-sans font-semibold text-xs text-emerald-400 tracking-wide mb-3">
              Object Verified: {currentClue.target_object_name}
            </p>

            {/* Storyline Continuation */}
            <div className="bg-[#121316] border border-white/10 rounded-2xl p-4 my-3 text-left w-full shadow-inner">
              <span className="font-['Space_Grotesk'] text-[10px] text-indigo-400 uppercase tracking-wider font-bold block mb-1">
                Storyline Progress:
              </span>
              <p className="font-serif italic text-xs text-white/90 leading-relaxed">
                "{currentClue.storyline_continuation || result.feedback_message}"
              </p>
            </div>

            <button
              onClick={() => {
                playSound.click();
                onNextClue();
              }}
              className="w-full mt-2 py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest btn-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl border border-emerald-400/30"
            >
              {isFinalStage ? 'Complete Quest & Escape' : 'Next Clue'}
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </button>
          </section>
        ) : (
          /* FAILURE MODAL */
          <section className="bg-[#0a0b0e] glass-panel error-glow rounded-[32px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-rose-400/40 shadow-[0_0_40px_rgba(244,63,94,0.2)] animate-in fade-in zoom-in-95 duration-300">
            {/* Corner Brackets */}
            <div className="absolute top-5 left-5 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
            <div className="absolute top-5 right-5 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
            <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

            <div className="relative w-16 h-16 mb-3 flex items-center justify-center rounded-full bg-rose-500/10 border border-rose-400/30">
              <span className="material-symbols-outlined text-4xl text-rose-300">
                warning
              </span>
            </div>

            <h2 className="font-serif italic font-bold text-xl text-rose-300 tracking-wide mb-2 uppercase">
              INCORRECT OBJECT
            </h2>

            <div className="bg-[#121316] border border-rose-400/20 rounded-2xl p-4 my-3 text-left w-full">
              <span className="font-['Space_Grotesk'] text-[10px] text-rose-300 uppercase tracking-wider font-bold block mb-1">
                Gamemaster Feedback:
              </span>
              <p className="font-sans text-xs text-white/80 leading-relaxed">
                {result.feedback_message || `The photo submitted does not appear to show "${currentClue.target_object_name}". Look closely at the riddle and try again!`}
              </p>
            </div>

            <button
              onClick={() => {
                playSound.click();
                onTryAgain();
              }}
              className="mt-2 py-3.5 px-6 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-200 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest hover:bg-rose-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 w-full"
            >
              Try Again
              <span className="material-symbols-outlined text-base">sync</span>
            </button>
          </section>
        )}
      </div>
    </div>
  );
};
