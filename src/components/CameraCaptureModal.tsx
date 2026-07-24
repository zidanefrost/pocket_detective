import React, { useRef, useState, useEffect } from 'react';
import { playSound } from '../utils/audio';
import {
  prepareImageDataUrl,
  validateSourceImage,
} from '../utils/image';

interface CameraCaptureModalProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  title,
  subtitle,
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setIsCameraActive(false);
      setCameraError("Camera unavailable or restricted in this browser frame. Use file selection or upload below.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const sourceWidth = video.videoWidth || 640;
    const sourceHeight = video.videoHeight || 480;
    const scale = Math.min(1, 1600 / Math.max(sourceWidth, sourceHeight));
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setIsPreparingImage(true);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setCameraError('The browser could not capture this photo.');
            setIsPreparingImage(false);
            return;
          }
          void prepareImageDataUrl(blob)
            .then((dataUrl) => {
              playSound.scan();
              setCapturedImage(dataUrl);
              stopCamera();
            })
            .catch((error: unknown) => {
              setCameraError(
                error instanceof Error
                  ? error.message
                  : 'The browser could not process this photo.',
              );
            })
            .finally(() => setIsPreparingImage(false));
        },
        'image/jpeg',
        0.86,
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    setIsPreparingImage(true);
    try {
      validateSourceImage(file);
      const result = await prepareImageDataUrl(file);
      playSound.scan();
      setCapturedImage(result);
      stopCamera();
    } catch (error) {
      setCameraError(
        error instanceof Error ? error.message : 'Could not use that image.',
      );
      e.target.value = '';
    } finally {
      setIsPreparingImage(false);
    }
  };

  const toggleCamera = () => {
    playSound.click();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleConfirm = () => {
    if (capturedImage) {
      playSound.click();
      onCapture(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  };

  const handleClose = () => {
    playSound.click();
    setCapturedImage(null);
    setCameraError(null);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0a0b0e] glass-panel rounded-[32px] p-6 flex flex-col gap-4 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Corner Brackets */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-white/20 pointer-events-none" />

        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif italic font-bold text-xl text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="font-sans text-xs text-white/60 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Viewfinder / Preview Frame */}
        <div className="relative aspect-[3/4] w-full bg-[#121316] rounded-2xl overflow-hidden border border-emerald-500/40 flex items-center justify-center">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Snapshot preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />
              {!isCameraActive && (
                <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400 text-5xl opacity-80">
                    photo_camera
                  </span>
                  <p className="text-xs text-white/60 font-sans">
                    {cameraError || "Ready to capture solution photo"}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Scanner corner overlays */}
          <div className="absolute inset-0 border-2 border-emerald-400/40 m-4 rounded pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className="w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
              <div className="w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
            </div>
            <div className="flex justify-between">
              <div className="w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
              <div className="w-5 h-5 border-b-2 border-r-2 border-emerald-400" />
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2">
          {capturedImage ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playSound.click();
                  setCapturedImage(null);
                }}
                className="flex-1 py-3 px-4 rounded-full border border-white/20 text-white font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider hover:bg-white/5 active:scale-95 transition-all"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider btn-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-emerald-400/30"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                Confirm Photo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {isCameraActive && (
                <div className="flex gap-2">
                  <button
                    onClick={toggleCamera}
                    className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:border-emerald-500/50 active:scale-95 transition-all"
                    title="Flip camera"
                  >
                    <span className="material-symbols-outlined">flip_camera_ios</span>
                  </button>
                  <button
                    onClick={takeSnapshot}
                    disabled={isPreparingImage}
                    className="flex-1 py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider btn-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-400/30 shadow-lg disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">camera</span>
                    {isPreparingImage ? 'Optimizing…' : 'Snap Solution'}
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPreparingImage}
                className="w-full py-3 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                {isPreparingImage ? 'Optimizing Photo…' : 'Select Photo From Device'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
