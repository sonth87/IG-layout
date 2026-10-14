"use client";

import type Konva from "konva";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { canShareFiles, downloadEach, downloadZip, shareFiles } from "@/lib/export/deliver";
import { exportSlides } from "@/lib/export/slices";
import { loadFont } from "@/lib/text/fonts";
import { SLIDE_SIZE } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { useT } from "@/store/settings";


interface Props {
  contentLayerRef: React.RefObject<Konva.Layer | null>;
  viewScale: number;
  onClose: () => void;
}

export function ExportSheet({ contentLayerRef, viewScale, onClose }: Props) {
  const t = useT();
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
    const { setExporting } = useEditor.getState();
    // Re-render photos at full resolution, wait for the canvas to redraw, then cut slides.
    setExporting(true);
    const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
    // Text must be drawn with its web font: wait for every font in use.
    const fonts = doc.elements.flatMap((el) => (el.type === "text" ? [loadFont(el.font, el.bold)] : []));
    Promise.all(fonts)
      .then(nextFrame)
      .then(nextFrame)
      .then(() => {
        layer.draw();
        return exportSlides(layer, doc, viewScale, doc.type);
      })
      .finally(() => setExporting(false))
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
          <button type="button" aria-label={t("export.backToEditor")} onClick={onClose} className="flex h-11 w-11 items-center justify-center">
            <Icon name="back" />
          </button>
          <h1 id="export-title" className="font-display text-xl font-semibold">
            {t("export.title")}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          {!files && !error && <p className="py-10 text-center text-muted">{t("export.rendering", { count: doc.slideCount })}</p>}
          {previews.length > 0 && (
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pt-2 pb-3">
              {previews.map((url, i) => (
                <figure key={url} className="w-[78%] shrink-0 snap-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={url} alt={t("export.slide", { index: i + 1 })} className="w-full rounded-lg border border-border" />
                  <figcaption className="mt-1 text-xs text-muted">{files?.[i].name}</figcaption>
                </figure>
              ))}
            </div>
          )}

          {files && (
            <>
              <p className="text-[13px] text-muted">
                {t("export.summary", { count: files.length, width: size.width, height: size.height })}
              </p>
              <aside className="mt-3 rounded-2xl border border-border bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-text-2">
                <strong className="text-text">{t("export.tipTitle")}</strong>{" "}
                {t(`export.tip.${doc.type}`, { last: String(files.length).padStart(2, "0"), ratio: doc.ratio })}
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
              {t("export.saveToPhotos", { count: files!.length })}
            </button>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={!files}
              onClick={() => run(() => downloadZip(files!, `${doc.type}.zip`))}
              className={`h-12 flex-1 rounded-[14px] text-sm font-semibold disabled:opacity-50 ${
                shareable ? "border border-border-2" : "bg-accent text-on-accent"
              }`}
            >
              {t("export.zip")}
            </button>
            <button
              type="button"
              disabled={!files}
              onClick={() => run(() => downloadEach(files!))}
              className="h-12 flex-1 rounded-[14px] border border-border-2 text-sm font-semibold disabled:opacity-50"
            >
              {t("export.oneByOne")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
