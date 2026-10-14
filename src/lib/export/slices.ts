import type Konva from "konva";
import { type ProjectDoc, SLIDE_SIZE } from "@/lib/project/types";

// Export = cut the continuous canvas exactly at slide boundaries (D-30).
// Rendered one slide at a time to stay within mobile canvas limits.

const JPEG_QUALITY = 0.92;

export function fileName(base: string, index: number) {
  return `${base}_${String(index + 1).padStart(2, "0")}.jpg`;
}

/**
 * @param layer content layer (background + elements only, no selection UI)
 * @param viewScale stage pixels per export pixel
 */
export async function exportSlides(
  layer: Konva.Layer,
  doc: ProjectDoc,
  viewScale: number,
  baseName: string,
): Promise<File[]> {
  const slide = SLIDE_SIZE[doc.ratio];
  const files: File[] = [];
  for (let i = 0; i < doc.slideCount; i++) {
    const blob = (await layer.toBlob({
      x: i * slide.width * viewScale,
      y: 0,
      width: slide.width * viewScale,
      height: slide.height * viewScale,
      pixelRatio: 1 / viewScale,
      mimeType: "image/jpeg",
      quality: JPEG_QUALITY,
    })) as Blob;
    files.push(new File([blob], fileName(baseName, i), { type: "image/jpeg" }));
  }
  return files;
}
