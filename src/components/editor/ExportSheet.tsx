"use client";

import type Konva from "konva";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { canShareFiles, downloadEach, downloadZip, shareFiles } from "@/lib/export/deliver";
import { exportSlides } from "@/lib/export/slices";
import { SLIDE_SIZE } from "@/lib/project/types";
import { useEditor } from "@/store/editor";

const BASE_NAME = "post";

interface Props {
  contentLayerRef: React.RefObject<Konva.Layer | null>;
  viewScale: number;
  onClose: () => void;
}

export function ExportSheet({ contentLayerRef, viewScale, onClose }: Props) {
  const doc = useEditor((s) => s.doc)!;
  const [files, setFiles] = useState<File[] | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const size = SLIDE_SIZE[doc.ratio];

  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];
    const layer = contentLayerRef.current;
    if (!layer) return;
    exportSlides(layer, doc, viewScale, BASE_NAME)
      .then((result) => {
        if (cancelled) return;
        urls = result.map((f) => URL.createObjectURL(f));
        setFiles(result);
        setPreviews(urls);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [contentLayerRef, doc, viewScale]);

  async function run(action: () => Promise<unknown>) {
    try {
      setError(null);
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const shareable = files ? canShareFiles(files) : false;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="export-title" className="fixed inset-0 z-10 flex flex-col bg-bg">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <header className="flex items-center gap-1 px-2 pt-2.5 pb-1">
          <button type="button" aria-label="Back to editor" onClick={onClose} className="flex h-11 w-11 items-center justify-center">
            <Icon name="back" />
          </button>
          <h1 id="export-title" className="font-display text-xl font-semibold">
            Preview &amp; export
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          {!files && !error && <p className="py-10 text-center text-muted">Rendering {doc.slideCount} images…</p>}
          {previews.length > 0 && (
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pt-2 pb-3">
              {previews.map((url, i) => (
                <figure key={url} className="w-[78%] shrink-0 snap-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={url} alt={`Slide ${i + 1}`} className="w-full rounded-lg border border-border" />
                  <figcaption className="mt-1 text-xs text-muted">{files?.[i].name}</figcaption>
                </figure>
              ))}
            </div>
          )}

          {files && (
            <>
              <p className="text-[13px] text-muted">
                {files.length} images · JPEG · {size.width} × {size.height}
              </p>
              <aside className="mt-3 rounded-2xl border border-border bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-text-2">
                <strong className="text-text">Posting tip:</strong> select the photos in order 01 → {String(files.length).padStart(2, "0")}.
                When Instagram asks for the size, keep <strong className="text-text">{doc.ratio}</strong> — don’t crop to square.
              </aside>
            </>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-border px-5 pt-3 pb-[max(1.6rem,env(safe-area-inset-bottom))]">
          {shareable && (
            <button
              type="button"
              onClick={() => run(() => shareFiles(files!))}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent text-[17px] font-bold text-on-accent"
            >
              <Icon name="share" />
              Save {files!.length} images to Photos
            </button>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={!files}
              onClick={() => run(() => downloadZip(files!, `${BASE_NAME}.zip`))}
              className={`h-12 flex-1 rounded-[14px] text-sm font-semibold disabled:opacity-50 ${
                shareable ? "border border-border-2" : "bg-accent text-on-accent"
              }`}
            >
              Download ZIP
            </button>
            <button
              type="button"
              disabled={!files}
              onClick={() => run(() => downloadEach(files!))}
              className="h-12 flex-1 rounded-[14px] border border-border-2 text-sm font-semibold disabled:opacity-50"
            >
              One by one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
