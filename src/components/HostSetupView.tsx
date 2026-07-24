import React, { useState, useRef } from 'react';
import { SAMPLE_ROOMS } from '../data/sampleRooms';
import { playSound } from '../utils/audio';
import {
  prepareImageDataUrl,
  validateSourceImage,
} from '../utils/image';

const PHOTO_STEP_TITLES = [
  'Photo 1: Main Room Angle (Required)',
  'Photo 2: Secondary Angle (Optional)',
  'Photo 3: Detail Angle (Optional)',
];

interface HostSetupViewProps {
  onStartQuest: (images: string[]) => void;
  isLoading: boolean;
}

export const HostSetupView: React.FC<HostSetupViewProps> = ({
  onStartQuest,
  isLoading,
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInputError(null);
    setIsPreparingImage(true);
    try {
      validateSourceImage(file);
      const result = await prepareImageDataUrl(file);
      playSound.scan();
      setSelectedImages((prev) => {
        const next = [...prev];
        next[activeStepIndex] = result;
        return next;
      });
      setSelectedRoomId('custom');
      if (activeStepIndex < 2) {
        setActiveStepIndex((prev) => prev + 1);
      }
    } catch (error) {
      setInputError(
        error instanceof Error ? error.message : 'Could not use that image.',
      );
    } finally {
      e.target.value = '';
      setIsPreparingImage(false);
    }
  };

  const handleSampleSelect = async (sampleId: string) => {
    playSound.click();
    const sample = SAMPLE_ROOMS.find((room) => room.id === sampleId);
    if (!sample) return;

    setInputError(null);
    setSelectedRoomId(sample.id);
    setIsPreparingImage(true);
    try {
      const response = await fetch(sample.imageUrl);
      if (!response.ok) {
        throw new Error('The sample room could not be loaded.');
      }
      const imageBlob = await response.blob();
      validateSourceImage(imageBlob);
      const dataUrl = await prepareImageDataUrl(imageBlob);
      setSelectedImages([dataUrl]);
      setActiveStepIndex(0);
      setSelectedRoomId(sample.id);
      playSound.scan();
    } catch {
      setSelectedRoomId(null);
      setInputError(
        'That sample room is unavailable. Upload or take your own photo instead.',
      );
    } finally {
      setIsPreparingImage(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    playSound.click();
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    if (activeStepIndex >= index && activeStepIndex > 0) {
      setActiveStepIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSubmit = () => {
    if (selectedImages.length === 0 || isPreparingImage) return;
    playSound.click();
    onStartQuest(selectedImages);
  };

  const currentPreviewImage = selectedImages[activeStepIndex] || selectedImages[0] || null;

  return (
    <main className="pt-[88px] pb-[100px] px-5 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative z-10 max-w-md mx-auto w-full">
      {/* Central Glass Card */}
      <div className="w-full bg-[#0a0b0e] glass-card rounded-[32px] p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(16,185,129,0.12)] mb-6 border border-white/10 relative overflow-hidden">
        {/* Corner Bracket Frame Accents */}
        <div className="absolute top-5 left-5 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-5 right-5 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-5 left-5 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-5 right-5 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2 inline-block mb-1">
            Host Room Setup
          </span>
          <h1 className="font-serif italic font-bold text-2xl text-white mb-1">
            Room Photo Wizard
          </h1>
          <p className="font-sans text-xs text-white/60">
            Provide 1 to 3 wide-angle photos of your physical space for Gemini analysis.
          </p>
        </div>

        {/* Step Indicator Wizard Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          {[0, 1, 2].map((stepIdx) => {
            const hasPhoto = Boolean(selectedImages[stepIdx]);
            const isActive = activeStepIndex === stepIdx;
            return (
              <button
                type="button"
                key={stepIdx}
                onClick={() => {
                  playSound.click();
                  setActiveStepIndex(stepIdx);
                }}
                className={`flex-1 py-2 px-1 rounded-xl text-center border transition-all text-[11px] font-['Space_Grotesk'] flex flex-col items-center gap-0.5 ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : hasPhoto
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#121316] border-white/10 text-white/40'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>Photo {stepIdx + 1}</span>
                  {hasPhoto && (
                    <span className="material-symbols-outlined text-xs text-emerald-400">
                      check_circle
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-normal opacity-70">
                  {stepIdx === 0 ? 'Main' : stepIdx === 1 ? 'Angle 2' : 'Detail'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Active Step Title */}
        <div className="bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-center">
          <span className="font-['Space_Grotesk'] text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            {PHOTO_STEP_TITLES[activeStepIndex]}
          </span>
        </div>

        {/* Room Scan Viewfinder Box */}
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#121316] flex items-center justify-center border border-emerald-500/40 group shadow-inner">
          {currentPreviewImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{ backgroundImage: `url('${currentPreviewImage}')` }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/45">
              <span className="material-symbols-outlined text-5xl text-emerald-400/70">
                add_a_photo
              </span>
              <span className="text-xs uppercase tracking-widest text-center px-4">
                Add {PHOTO_STEP_TITLES[activeStepIndex]}
              </span>
            </div>
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-[#08090a]/30 pointer-events-none" />

          {/* Viewfinder Corners */}
          <div className="absolute inset-0 border-2 border-emerald-400/40 m-4 rounded flex flex-col justify-between p-4 pointer-events-none">
            <div className="flex justify-between w-full">
              <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
              <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-emerald-400 text-[48px] opacity-80 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                center_focus_weak
              </span>
            </div>
            <div className="flex justify-between w-full">
              <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
              <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-1 rounded-full font-['Space_Grotesk'] text-[10px] text-emerald-400 tracking-widest border border-emerald-500/40 uppercase shadow-lg">
            {selectedImages.length > 0
              ? `${selectedImages.length} ROOM PHOTO${selectedImages.length > 1 ? 'S' : ''} READY`
              : 'AWAITING SCAN'}
          </div>
        </div>

        {/* Thumbnail Gallery Row */}
        {selectedImages.length > 0 && (
          <div className="flex gap-2 justify-center">
            {selectedImages.map((img, idx) => (
              <div
                key={idx}
                className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 group transition-all ${
                  activeStepIndex === idx
                    ? 'border-emerald-400 ring-2 ring-emerald-500/50'
                    : 'border-white/20 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Room Photo ${idx + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    playSound.click();
                    setActiveStepIndex(idx);
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(idx);
                  }}
                  className="absolute top-0.5 right-0.5 bg-rose-600/90 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File Upload / Controls */}
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              {selectedImages[activeStepIndex]
                ? `Retake Photo ${activeStepIndex + 1}`
                : `Upload Photo ${activeStepIndex + 1}`}
            </button>
          </div>

          {inputError && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-xl p-3">
              {inputError}
            </p>
          )}

          {/* Sample preset selector */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-white/50">
              Or choose a sample room:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_ROOMS.map((room) => (
                <button
                  type="button"
                  key={room.id}
                  onClick={() => void handleSampleSelect(room.id)}
                  disabled={isPreparingImage}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all text-xs disabled:opacity-50 ${
                    selectedRoomId === room.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-[#121316] border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  <img
                    src={room.imageUrl}
                    alt={room.title}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <span className="font-medium truncate">
                    {isPreparingImage && selectedRoomId === room.id
                      ? 'Loading…'
                      : room.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="w-full">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isPreparingImage || selectedImages.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] font-bold text-sm tracking-wider py-4 rounded-full btn-glow-emerald active:scale-95 transition-all flex justify-center items-center gap-2.5 border border-emerald-400/40 shadow-xl uppercase disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          Analyze Space & Build Quest ({selectedImages.length} Photo{selectedImages.length !== 1 ? 's' : ''})
        </button>
      </div>
    </main>
  );
};
