import { useEffect, useState } from "react";
import type { ShotImage } from "@ig-layout/core/booth/render";

// Decoded shots for drawing, decoded once per Blob (EXIF rotation applied by the browser).

const cache = new WeakMap<Blob, Promise<ShotImage | null>>();

function decode(blob: Blob): Promise<ShotImage | null> {
  let p = cache.get(blob);
  if (!p) {
    p = createImageBitmap(blob).then(
      (b) => ({ source: b, width: b.width, height: b.height }),
      () => null,
    );
    cache.set(blob, p);
  }
  return p;
}

export function shotImages(blobs: (Blob | null)[]): Promise<(ShotImage | null)[]> {
  return Promise.all(blobs.map((b) => (b ? decode(b) : null)));
}

/** The decoded shots; null until they're ready. */
export function useShotImages(blobs: (Blob | null)[]) {
  const [images, setImages] = useState<{ for: (Blob | null)[]; images: (ShotImage | null)[] } | null>(null);
  useEffect(() => {
    let gone = false;
    void shotImages(blobs).then((images) => !gone && setImages({ for: blobs, images }));
    return () => {
      gone = true;
    };
  }, [blobs]);
  return images?.for === blobs ? images.images : null;
}
