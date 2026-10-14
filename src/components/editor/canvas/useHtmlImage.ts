"use client";

import { useEffect, useState } from "react";

export function useHtmlImage(url: string | undefined) {
  const [loaded, setLoaded] = useState<{ url: string; image: HTMLImageElement } | null>(null);
  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.onload = () => setLoaded({ url, image: img });
    img.src = url;
    return () => {
      img.onload = null;
    };
  }, [url]);
  return loaded && loaded.url === url ? loaded.image : null;
}

/** Cheap blur: shrink the image a lot, let the browser smooth it back up. */
export function useBlurredImage(url: string | undefined, aspect: number) {
  const image = useHtmlImage(url);
  const [result, setResult] = useState<{ source: HTMLImageElement; aspect: number; canvas: HTMLCanvasElement } | null>(null);

  useEffect(() => {
    if (!image) return;
    const small = document.createElement("canvas");
    small.width = 24;
    small.height = Math.max(1, Math.round(24 / aspect));
    // Cover-crop the photo to the canvas aspect.
    let sw = image.width;
    let sh = sw / aspect;
    if (sh > image.height) {
      sh = image.height;
      sw = sh * aspect;
    }
    small.getContext("2d")!.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, 0, 0, small.width, small.height);
    const big = document.createElement("canvas");
    big.width = 480;
    big.height = Math.max(1, Math.round(480 / aspect));
    const ctx = big.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(small, 0, 0, big.width, big.height);
    // Darken slightly so photos on top stand out.
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, big.width, big.height);
    const id = requestAnimationFrame(() => setResult({ source: image, aspect, canvas: big }));
    return () => cancelAnimationFrame(id);
  }, [image, aspect]);

  return result && result.source === image && result.aspect === aspect ? result.canvas : null;
}
