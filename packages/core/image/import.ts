// Image import: decode (honouring EXIF orientation), downscale, re-encode.
// Rules from docs/architecture/storage.md (D-24, D-29).

const MAX_LONG_EDGE = 4000;
const PANORAMA_RATIO = 2;
const MAX_PANORAMA_SHORT_EDGE = 2400;
// Stay under iOS Safari's canvas area limit (~16.7M px).
const MAX_PIXELS = 16_000_000;
const JPEG_QUALITY = 0.92;

export class ImportError extends Error {
  constructor(
    readonly code: "unreadable" | "failed",
    readonly fileName: string,
  ) {
    super(`${code}: ${fileName}`);
  }
}

export interface ImportedImage {
  blob: Blob;
  width: number;
  height: number;
}

export function targetSize(width: number, height: number) {
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  let scale =
    long / short > PANORAMA_RATIO
      ? Math.min(1, MAX_PANORAMA_SHORT_EDGE / short)
      : Math.min(1, MAX_LONG_EDGE / long);
  const pixels = width * height * scale * scale;
  if (pixels > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / pixels);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function importImage(file: File): Promise<ImportedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImportError("unreadable", file.name);
  }

  const { width, height } = targetSize(bitmap.width, bitmap.height);
  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImportError("failed", file.name);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, keepAlpha ? "image/png" : "image/jpeg", JPEG_QUALITY),
  );
  // Release the canvas memory right away (matters on iOS).
  canvas.width = canvas.height = 0;
  if (!blob) throw new ImportError("failed", file.name);
  return { blob, width, height };
}
