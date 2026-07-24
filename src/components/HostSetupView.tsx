import React, { useState, useRef } from 'react';
import { SAMPLE_ROOMS } from '../data/sampleRooms';
import { playSound } from '../utils/audio';
import {
  MAX_ROOM_PHOTO_BYTES,
  prepareImageDataUrl,
  validateSourceImage,
} from '../utils/image';

const MAX_ROOM_PHOTOS = 3;
const PHOTO_STEP_TITLES = [
  'Main room angle (required)',
  'Second angle (optional)',
  'Detail angle (optional)',
];

interface HostSetupViewProps {
  onStartQuest: (images: string[]) => void;
  isLoading: boolean;
}

export const HostSetupView: React.FC<HostSetupViewProps> = ({
  onStartQuest,
  isLoading,
}) => {
  const [selectedImages, setSelectedImages] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
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
      const result = await prepareImageDataUrl(file, MAX_ROOM_PHOTO_BYTES);
      playSound.scan();
      setSelectedImages((previous) =>
        previous.map((image, index) =>
          index === activeStepIndex ? result : image,
        ),
      );
      setSelectedRoomId('custom');
      if (activeStepIndex < MAX_ROOM_PHOTOS - 1) {
        setActiveStepIndex((previous) => previous + 1);
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
      const dataUrl = await prepareImageDataUrl(
        imageBlob,
        MAX_ROOM_PHOTO_BYTES,
      );
      setSelectedImages([dataUrl, null, null]);
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

  const handleRemovePhoto = (indexToRemove: number) => {
    playSound.click();
    setSelectedImages((previous) => {
      const remaining = previous.filter(
        (image, index): image is string =>
          index !== indexToRemove && typeof image === 'string',
      );
      return Array.from(
        { length: MAX_ROOM_PHOTOS },
        (_, index) => remaining[index] ?? null,
      );
    });
    setActiveStepIndex((previous) =>
      Math.min(previous, Math.max(0, selectedImageCount - 2)),
    );
    setSelectedRoomId('custom');
  };

  const handleSubmit = () => {
    const roomImages = selectedImages.filter(
      (image): image is string => typeof image === 'string',
    );
    if (roomImages.length === 0 || isPreparingImage) return;
    playSound.click();
    onStartQuest(roomImages);
  };

  const selectedImageCount = selectedImages.filter(Boolean).length;
  const currentPreviewImage = selectedImages[activeStepIndex];

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
            Add one to three angles so the Gamemaster can understand your space.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PHOTO_STEP_TITLES.map((title, stepIndex) => {
            const hasPhoto = Boolean(selectedImages[stepIndex]);
            const isActive = activeStepIndex === stepIndex;
            const isDisabled = stepIndex > 0 && !selectedImages[0];
            return (
              <button
                type="button"
                key={title}
                disabled={isDisabled || isPreparingImage}
                onClick={() => {
                  playSound.click();
                  setActiveStepIndex(stepIndex);
                }}
                className={`rounded-xl border px-1 py-2 text-center font-['Space_Grotesk'] text-[10px] uppercase tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-35 ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : hasPhoto
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-[#121316] text-white/45'
                }`}
              >
                <span className="block font-bold">Photo {stepIndex + 1}</span>
                <span className="mt-0.5 block normal-case tracking-normal opacity-70">
                  {stepIndex === 0 ? 'Main' : 'Optional'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121316] px-3 py-2 text-center">
          <span className="font-['Space_Grotesk'] text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            {PHOTO_STEP_TITLES[activeStepIndex]}
          </span>
        </div>

        {/* Room Scan Viewfinder Box */}
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#121316] flex items-center justify-center border border-emerald-500/40 group shadow-inner">
          {/* Background Image Preview */}
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
              <span className="px-5 text-center text-xs uppercase tracking-widest">
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
            {selectedImageCount > 0
              ? `${selectedImageCount} PHOTO${selectedImageCount === 1 ? '' : 'S'} READY`
              : 'AWAITING SCAN'}
          </div>
        </div>

        {selectedImageCount > 0 && (
          <div className="flex justify-center gap-2" aria-label="Selected room photos">
            {selectedImages.map(
              (image, imageIndex) =>
                image && (
                  <div
                    key={`${imageIndex}-${image.slice(-12)}`}
                    className={`group relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
                      activeStepIndex === imageIndex
                        ? 'border-emerald-400 ring-2 ring-emerald-500/40'
                        : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(imageIndex)}
                      className="h-full w-full"
                      aria-label={`Edit room photo ${imageIndex + 1}`}
                    >
                      <img
                        src={image}
                        alt={`Room angle ${imageIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(imageIndex)}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600/95 text-xs text-white shadow"
                      aria-label={`Remove room photo ${imageIndex + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ),
            )}
          </div>
        )}

        {/* File Upload / Sample Room Controls */}
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPreparingImage}
              className="flex-1 py-3 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              {currentPreviewImage
                ? `Replace Photo ${activeStepIndex + 1}`
                : `Add Photo ${activeStepIndex + 1}`}
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
              Or choose sample room:
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
          disabled={
            isLoading || isPreparingImage || selectedImageCount === 0
          }
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] font-bold text-sm tracking-wider py-4 rounded-full btn-glow-emerald active:scale-95 transition-all flex justify-center items-center gap-2.5 border border-emerald-400/40 shadow-xl uppercase disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          {isPreparingImage
            ? 'Optimizing Photo…'
            : `Build Quest (${selectedImageCount} Photo${selectedImageCount === 1 ? '' : 's'})`}
        </button>
      </div>
    </main>
  );
};
