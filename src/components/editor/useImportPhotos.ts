"use client";

import { useState } from "react";
import { ImportError, importImage } from "@/lib/image/import";
import { type ImageAsset, newId } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { useT } from "@/store/settings";

/**
 * Decodes picked files (sequentially, to limit memory on phones).
 * `importFiles` also adds them to the open project.
 */
export function useImportPhotos() {
  const addImages = useEditor((s) => s.addImages);
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function decodeFiles(files: FileList | File[]) {
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
        const code = err instanceof ImportError ? err.code : "failed";
        failed.push(t(code === "unreadable" ? "import.unreadable" : "import.failed", { name: file.name }));
      }
    }
    setErrors(failed);
    setBusy(false);
    return assets;
  }

  async function importFiles(files: FileList | File[], firstSlide = 0) {
    addImages(await decodeFiles(files), firstSlide);
  }

  return { decodeFiles, importFiles, busy, errors };
}
