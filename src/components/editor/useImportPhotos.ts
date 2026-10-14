"use client";

import { useState } from "react";
import { importImage } from "@/lib/image/import";
import { type ImageAsset, newId } from "@/lib/project/types";
import { useEditor } from "@/store/editor";

/** Imports picked files (sequentially, to limit memory on phones) and adds them to the project. */
export function useImportPhotos() {
  const addImages = useEditor((s) => s.addImages);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function importFiles(files: FileList | File[], firstSlide = 0) {
    setBusy(true);
    setErrors([]);
    const assets: ImageAsset[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const img = await importImage(file);
        assets.push({
          id: newId(),
          blob: img.blob,
          url: URL.createObjectURL(img.blob),
          width: img.width,
          height: img.height,
          name: file.name,
        });
      } catch (err) {
        failed.push(err instanceof Error ? err.message : String(err));
      }
    }
    addImages(assets, firstSlide);
    setErrors(failed);
    setBusy(false);
  }

  return { importFiles, busy, errors };
}
