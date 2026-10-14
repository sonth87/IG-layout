"use client";

import { useMemo } from "react";
import { filterById } from "@/lib/color/filters";
import { isNeutral, shaderParams } from "@/lib/color/params";
import { processImage } from "@/lib/color/processor";
import type { ImageElement } from "@/lib/project/types";

/** Long edge of processed photos while editing; exports use full resolution. */
export const PREVIEW_MAX = 1600;

/**
 * The photo with its filter + adjustments applied (WebGL, synchronous and cached),
 * or the original when nothing is applied / WebGL is unavailable.
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
    if (!image || !params) return image;
    return processImage(image, params, opts.full ? Infinity : PREVIEW_MAX) ?? image;
  }, [image, params, opts.full]);
}
