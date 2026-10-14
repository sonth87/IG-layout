import type Konva from "konva";
import { exportOrder, slideRect } from "@/lib/project/layout";
import type { ProjectDoc } from "@/lib/project/types";

// Export = cut the continuous canvas exactly at slide boundaries (D-30).
// Grid gaps (profile-gap compensation) are simply not exported.
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
  const files: File[] = [];
  // File n = n-th image to post (Grid: bottom-right tile first).
  for (const [n, i] of exportOrder(doc).entries()) {
    const r = slideRect(doc, i);
    const rendered = layer.toCanvas({
      x: r.x * viewScale,
      y: r.y * viewScale,
      width: r.width * viewScale,
      height: r.height * viewScale,
      pixelRatio: 1 / viewScale,
    });
    // Float rounding can make Konva's canvas a pixel off: redraw at the exact size.
    const exact = document.createElement("canvas");
    exact.width = Math.round(r.width);
    exact.height = Math.round(r.height);
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
