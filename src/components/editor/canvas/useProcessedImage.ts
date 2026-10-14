"use client";

import { useMemo } from "react";
import { filterById } from "@/lib/color/filters";
import { isNeutral, shaderParams } from "@/lib/color/params";
import { processImage } from "@/lib/color/processor";
import type { ImageElement } from "@/lib/project/types";

/** Long edge of photos while editing; exports use full resolution. */
export const PREVIEW_MAX = 1600;

// Downscaled copies used while editing (M7 performance): drawing 4000 px photos on
// every frame made redraws ~10× slower. One copy per source image.
const previews = new WeakMap<HTMLImageElement, HTMLCanvasElement | HTMLImageElement>();

function previewOf(image: HTMLImageElement) {
  let p = previews.get(image);
  if (!p) {
    const scale = PREVIEW_MAX / Math.max(image.naturalWidth, image.naturalHeight);
    if (scale >= 1) p = image;
    else {
      const c = document.createElement("canvas");
      c.width = Math.round(image.naturalWidth * scale);
      c.height = Math.round(image.naturalHeight * scale);
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, c.width, c.height);
      p = c;
    }
    previews.set(image, p);
  }
  return p;
}

/**
 * The photo to draw: downscaled while editing, full size while exporting, with its
 * filter + adjustments applied (WebGL, synchronous and cached). Callers scale
 * crops by `result.width / original.width`.
 */
export function useProcessedImage(
  image: HTMLImageElement | null,
  el: Pick<ImageElement, "adjust" | "filter">,
  opts: { original: boolean; full: boolean },
) {
  const neutral = opts.original || isNeutral(el.adjust, el.filter);
  const preset = filterById(el.filter?.id)?.preset;
  const params = useMemo(
    () => (neutral ? null : shaderParams(el.adjust, preset, el.filter?.intensity ?? 0)),
    [neutral, el.adjust, preset, el.filter?.intensity],
  );
  return useMemo(() => {
    if (!image) return null;
    const source = opts.full ? image : previewOf(image);
    if (!params) return source;
    return processImage(source as HTMLImageElement, params, opts.full ? Infinity : PREVIEW_MAX) ?? source;
  }, [image, params, opts.full]);
}
