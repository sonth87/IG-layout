import type Konva from "konva";
import { exportOrder, slideRect } from "@/lib/project/layout";
import type { ProjectDoc, Rect } from "@/lib/project/types";

// Export = cut the continuous canvas exactly at slide boundaries (D-30).
// Grid gaps (profile-gap compensation) are simply not exported.
// Rendered one slide at a time to stay within mobile canvas limits.

const JPEG_QUALITY = 0.92;

/** File-name base from the project name: lowercase, no Vietnamese accents, dashes (UX-16). */
export function fileBase(projectName: string, fallback: string) {
  const slug = projectName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || fallback;
}

/**
 * Where an area of the canvas (export px) is on the stage, for `layer.toCanvas` & co.
 * The stage only covers the visible part and is shifted while scrolling (D-69), so
 * add its offset. Konva renders areas outside the visible part just the same.
 */
export function layerRegion(layer: Konva.Layer, r: Rect, viewScale: number) {
  const o = layer.getStage()?.position() ?? { x: 0, y: 0 };
  return { x: o.x + r.x * viewScale, y: o.y + r.y * viewScale, width: r.width * viewScale, height: r.height * viewScale };
}

export function fileName(base: string, index: number, ext: "jpg" | "mp4" = "jpg") {
  return `${base}_${String(index + 1).padStart(2, "0")}.${ext}`;
}

/** Slides with video (M13): which ones, and how to render them (loaded only when needed). */
export interface VideoExport {
  isVideoSlide: (index: number) => boolean;
  render: (index: number, onProgress: (p: number) => void) => Promise<Blob>;
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
  video?: VideoExport,
  /** Slide n (0-based, posting order) of total, 0..1 within the slide (videos). */
  onProgress?: (n: number, total: number, p: number) => void,
  /** Resolution: 1 = 1080 px wide, 2 = 2160 px (editor-v2/12 §5). Photos only. */
  scale = 1,
): Promise<File[]> {
  const files: File[] = [];
  const order = exportOrder(doc);
  // File n = n-th image to post (Grid: bottom-right tile first).
  for (const [n, i] of order.entries()) {
    onProgress?.(n, order.length, 0);
    if (video?.isVideoSlide(i)) {
      const blob = await video.render(i, (p) => onProgress?.(n, order.length, p));
      files.push(new File([blob], fileName(baseName, n, "mp4"), { type: "video/mp4" }));
      continue;
    }
    const r = slideRect(doc, i);
    const rendered = layer.toCanvas({ ...layerRegion(layer, r, viewScale), pixelRatio: scale / viewScale });
    // Float rounding can make Konva's canvas a pixel off: redraw at the exact size.
    const exact = document.createElement("canvas");
    exact.width = Math.round(r.width * scale);
    exact.height = Math.round(r.height * scale);
    const ctx = exact.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(rendered, 0, 0, exact.width, exact.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      exact.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/jpeg", JPEG_QUALITY),
    );
    rendered.width = rendered.height = exact.width = exact.height = 0; // free memory (iOS)
    files.push(new File([blob], fileName(baseName, n), { type: "image/jpeg" }));
  }
  return files;
}
