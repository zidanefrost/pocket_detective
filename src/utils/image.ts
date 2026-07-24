const MAX_SOURCE_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PROCESSED_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_ROOM_PHOTO_BYTES = 900 * 1024;
const MAX_IMAGE_SIDE = 1_600;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateSourceImage(image: Blob): void {
  if (!SUPPORTED_IMAGE_TYPES.has(image.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }
  if (image.size <= 0) {
    throw new Error("The selected image is empty.");
  }
  if (image.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error("Please use an image smaller than 15 MB.");
  }
}

function loadImage(image: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(image);
    const element = new Image();

    const release = () => URL.revokeObjectURL(objectUrl);
    element.onload = () => {
      release();
      resolve(element);
    };
    element.onerror = () => {
      release();
      reject(new Error("The selected file could not be decoded as an image."));
    };
    element.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The browser could not process this image.")),
      "image/jpeg",
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The browser could not read the processed image."));
    reader.onerror = () =>
      reject(new Error("The browser could not read the processed image."));
    reader.readAsDataURL(blob);
  });
}

export async function prepareImageDataUrl(
  image: Blob,
  maxProcessedBytes = MAX_PROCESSED_IMAGE_BYTES,
): Promise<string> {
  validateSourceImage(image);
  if (
    !Number.isFinite(maxProcessedBytes) ||
    maxProcessedBytes <= 0 ||
    maxProcessedBytes > MAX_PROCESSED_IMAGE_BYTES
  ) {
    throw new Error("The requested image size limit is invalid.");
  }

  const source = await loadImage(image);
  const initialScale = Math.min(
    1,
    MAX_IMAGE_SIDE / Math.max(source.naturalWidth, source.naturalHeight),
  );

  const scaleAttempts = [initialScale, initialScale * 0.8, initialScale * 0.65];
  const qualityAttempts = [0.86, 0.76, 0.66, 0.56];
  let smallestBlob: Blob | undefined;

  for (const scale of scaleAttempts) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("This browser cannot process the selected image.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    for (const quality of qualityAttempts) {
      const processedBlob = await canvasToBlob(canvas, quality);
      if (!smallestBlob || processedBlob.size < smallestBlob.size) {
        smallestBlob = processedBlob;
      }
      if (processedBlob.size <= maxProcessedBytes) {
        return blobToDataUrl(processedBlob);
      }
    }
  }

  if (smallestBlob && smallestBlob.size <= maxProcessedBytes) {
    return blobToDataUrl(smallestBlob);
  }
  throw new Error(
    "This image could not be reduced enough for upload. Choose a smaller photo.",
  );
}
