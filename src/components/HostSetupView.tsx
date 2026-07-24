import React, { useState, useRef } from 'react';
import { SAMPLE_ROOMS } from '../data/sampleRooms';
import { playSound } from '../utils/audio';

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

interface HostSetupViewProps {
  onStartQuest: (base64Image: string) => void;
  isLoading: boolean;
}

export const HostSetupView: React.FC<HostSetupViewProps> = ({
  onStartQuest,
  isLoading,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fileToDataUrl = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Image conversion failed.'));
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.readAsDataURL(file);
    });

  const validateImage = (file: Blob) => {
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      throw new Error('Use a JPEG, PNG, or WebP image.');
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error('Please use an image smaller than 15 MB.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInputError(null);
    try {
      validateImage(file);
      void fileToDataUrl(file).then(
        (result) => {
          playSound.scan();
          setSelectedImage(result);
          setSelectedRoomId('custom');
        },
        () => setInputError('Could not read that image. Please try another file.'),
      );
    } catch (error) {
      setInputError(
        error instanceof Error ? error.message : 'Could not use that image.',
      );
      e.target.value = '';
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
      validateImage(imageBlob);
      const dataUrl = await fileToDataUrl(imageBlob);
      setSelectedImage(dataUrl);
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

  const handleSubmit = () => {
    if (!selectedImage || isPreparingImage) return;
    playSound.click();
    onStartQuest(selectedImage);
  };

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
            Initialization
          </span>
          <h1 className="font-serif italic font-bold text-2xl text-white mb-1">
            Room Analysis
          </h1>
          <p className="font-sans text-xs text-white/60">
            Photograph your physical space to transform it into an AI escape room.
          </p>
        </div>

        {/* Room Scan Viewfinder Box */}
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#121316] flex items-center justify-center border border-emerald-500/40 group shadow-inner">
          {/* Background Image Preview */}
          {selectedImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{ backgroundImage: `url('${selectedImage}')` }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/45">
              <span className="material-symbols-outlined text-5xl text-emerald-400/70">
                add_a_photo
              </span>
              <span className="text-xs uppercase tracking-widest">
                Add a room photo
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
            {selectedImage ? 'SCAN READY' : 'AWAITING SCAN'}
          </div>
        </div>

        {/* File Upload / Sample Room Controls */}
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              Take or Upload Photo
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
          disabled={isLoading || isPreparingImage || !selectedImage}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] font-bold text-sm tracking-wider py-4 rounded-full btn-glow-emerald active:scale-95 transition-all flex justify-center items-center gap-2.5 border border-emerald-400/40 shadow-xl uppercase disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          Analyze Space & Build Quest
        </button>
      </div>
    </main>
  );
};
