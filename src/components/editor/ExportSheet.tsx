"use client";

import type Konva from "konva";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { canShareFiles, downloadEach, downloadZip, shareFiles } from "@/lib/export/deliver";
import { exportSlides, fileBase } from "@/lib/export/slices";
import { fontWeight, loadFont } from "@/lib/text/fonts";
import { slideSize } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { useT } from "@/store/settings";
import { CarouselPreview, type PreviewTab, previewTabs, ProfilePreview, StoryPreview, videoUrls } from "@/components/export/InstagramPreview";
import { pause as pausePlayback, seek as seekPlayback } from "@/lib/video/playback";
import { hasMotion, slideHasMotion } from "@/lib/motion/motion";


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
  const assets = useEditor((s) => s.assets);
  // Video (M13): export with sound unless switched off; progress per slide.
  // Slides with video or animation (M13.3) are exported as MP4.
  const hasVideo = doc.elements.some((el) => (el.type === "image" && !!el.assetId && !!assets[el.assetId]?.video) || hasMotion(el));
  const hasSound = !!doc.music || doc.elements.some((el) => el.type === "image" && !!el.assetId && !!assets[el.assetId]?.video?.hasAudio);
  const [withAudio, setWithAudio] = useState(true);
  /** 1 = 1080 px wide, 2 = 2160 px (editor-v2/12 §5). */
  const [scale, setScale] = useState<1 | 2>(1);
  const [progress, setProgress] = useState<{ n: number; total: number; p: number } | null>(null);
  const size = slideSize(doc.ratio);
  const tabs = previewTabs(doc.type);
  const [tab, setTab] = useState<PreviewTab>(tabs[0]);

  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];
    const layer = contentLayerRef.current;
    if (!layer) return;
    const { setExporting } = useEditor.getState();
    // Start from 0 s: elements at their real positions (no animation state) for still slides.
    pausePlayback();
    seekPlayback(0);
    // Re-render photos at full resolution, wait for the canvas to redraw, then cut slides.
    setExporting(true);
    const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
    // Text must be drawn with its web font: wait for every font in use.
    const fonts = doc.elements.flatMap((el) => (el.type === "text" ? [loadFont(el.font, fontWeight(el))] : []));
    Promise.all(fonts)
      .then(nextFrame)
      .then(nextFrame)
      .then(() => {
        layer.draw();
        const base = fileBase(useEditor.getState().projectName, doc.type);
        if (!hasVideo) return exportSlides(layer, doc, viewScale, base, undefined, undefined, scale);
        return import("@/lib/video/export").then(({ exportVideoSlide, slideVideos }) => {
          const assets = useEditor.getState().assets;
          return exportSlides(
            layer,
            doc,
            viewScale,
            base,
            {
              isVideoSlide: (i) => slideVideos(doc, i, assets).length > 0 || slideHasMotion(doc, i),
              render: (index, onProgress) => exportVideoSlide({ layer, doc, index, viewScale, assets, withAudio, onProgress }),
            },
            (n, total, p) => !cancelled && setProgress({ n, total, p }),
            scale,
          );
        });
      })
      .finally(() => setExporting(false))
      .then((result) => {
        if (cancelled) return;
        urls = result.map((f) => URL.createObjectURL(f));
        result.forEach((f, i) => f.type.startsWith("video/") && videoUrls.add(urls[i]));
        setProgress(null);
        setFiles(result);
        setPreviews(urls);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
      urls.forEach((u) => {
        URL.revokeObjectURL(u);
        videoUrls.delete(u);
      });
    };
  }, [contentLayerRef, doc, viewScale, hasVideo, withAudio, scale]);

  // The whole carousel as one 9:16 video (M13.4): made on request.
  const [reel, setReel] = useState<{ file: File; url: string } | null>(null);
  const [reelProgress, setReelProgress] = useState<number | null>(null);
  async function makeReel() {
    const layer = contentLayerRef.current;
    if (!layer) return;
    setError(null);
    setReelProgress(0);
    const { setExporting } = useEditor.getState();
    setExporting(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      layer.draw();
      const { exportReel } = await import("@/lib/video/reel");
      const blob = await exportReel({ layer, doc, viewScale, assets: useEditor.getState().assets, withAudio, onProgress: setReelProgress });
      const file = new File([blob], `${fileBase(useEditor.getState().projectName, doc.type)}_reel.mp4`, { type: "video/mp4" });
      setReel({ file, url: URL.createObjectURL(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
      setReelProgress(null);
    }
  }
  useEffect(
    () => () => {
      if (reel) URL.revokeObjectURL(reel.url);
    },
    [reel],
  );

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
      <div className="mx-auto flex h-full w-full max-w-md flex-col md:max-w-2xl">
        <header className="flex items-center gap-1 px-2 pt-2.5 pb-1">
          <button type="button" aria-label={t("export.backToEditor")} onClick={onClose} className="flex h-11 w-11 items-center justify-center">
            <Icon name="back" />
          </button>
          <h1 id="export-title" className="font-display text-xl font-semibold">
            {t("export.title")}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          <div role="radiogroup" aria-label={t("export.resolution")} className="mb-3 flex items-center justify-between rounded-xl bg-surface px-3.5 py-2 text-sm">
            <span>{t("export.resolution")}</span>
            <span className="flex gap-1 rounded-full bg-surface-2 p-1">
              {([1, 2] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={scale === k}
                  disabled={!files && !error}
                  onClick={() => {
                    if (k === scale) return;
                    setFiles(null);
                    setPreviews([]);
                    setScale(k);
                  }}
                  className={`h-8 rounded-full px-3 text-[13px] ${scale === k ? "bg-surface font-bold shadow-sm" : "text-muted"}`}
                >
                  {k}× · {1080 * k} px
                </button>
              ))}
            </span>
          </div>
          {hasSound && (
            <label className="mb-3 flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5 text-sm">
              <span>{t("export.withSound")}</span>
              <input
                type="checkbox"
                checked={withAudio}
                disabled={!files && !error}
                onChange={(e) => {
                  setFiles(null);
                  setPreviews([]);
                  setWithAudio(e.target.checked);
                }}
                className="h-[22px] w-[22px] accent-accent"
              />
            </label>
          )}
          {!files && !error && (
            <div className="py-10 text-center text-muted" role="status">
              <p>{progress && progress.p > 0 ? t("export.videoProgress", { index: progress.n + 1, total: progress.total, pct: Math.round(progress.p * 100) }) : t("export.rendering", { count: doc.slideCount })}</p>
              {progress && progress.p > 0 && (
                <div className="mx-auto mt-3 h-2 w-56 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.round(progress.p * 100)}%` }} />
                </div>
              )}
            </div>
          )}
          {previews.length > 0 && (
            <>
              {tabs.length > 1 && (
                <div role="tablist" aria-label={t("preview.mode")} className="mb-3 flex rounded-xl bg-surface p-1">
                  {tabs.map((tb) => (
                    <button
                      key={tb}
                      type="button"
                      role="tab"
                      aria-selected={tab === tb}
                      onClick={() => setTab(tb)}
                      className={`h-9 flex-1 rounded-[9px] text-sm ${tab === tb ? "bg-text font-semibold text-bg" : "text-muted"}`}
                    >
                      {t(`preview.${tb}`)}
                    </button>
                  ))}
                </div>
              )}
              {tab === "carousel" && <CarouselPreview urls={previews} aspect={size.width / size.height} />}
              {/* Profile: newest post first. Grid files are numbered in posting order, so reverse them. */}
              {tab === "profile" && <ProfilePreview newestFirst={doc.type === "grid" ? [...previews].reverse() : previews.slice(0, 1)} />}
              {tab === "story" && <StoryPreview urls={previews} />}

              <h2 className="pt-4 pb-1.5 text-[13px] font-semibold text-muted">{t("preview.files")}</h2>
              <div className="flex gap-2 overflow-x-auto pb-3">
                {previews.map((url, i) => (
                  <figure key={url} className="w-20 shrink-0">
                    {videoUrls.has(url) ? (
                      <video src={url} aria-label={t("export.slide", { index: i + 1 })} className="w-full rounded-md border border-border" muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                      <img src={url} alt={t("export.slide", { index: i + 1 })} className="w-full rounded-md border border-border" />
                    )}
                    <figcaption className="mt-1 truncate text-[11px] text-muted">{files?.[i].name}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}

          {files && (
            <>
              <p className="text-[13px] text-muted">
                {t("export.summary", { count: files.length, width: size.width * scale, height: size.height * scale })}
              </p>
              <aside className="mt-3 rounded-2xl border border-border bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-text-2">
                <strong className="text-text">{t("export.tipTitle")}</strong>{" "}
                {t(`export.tip.${doc.type}`, { last: String(files.length).padStart(2, "0"), ratio: doc.ratio })}
              </aside>
            </>
          )}
          {files && doc.type !== "grid" && (
            <section aria-label={t("reel.title")} className="mt-3 rounded-2xl border border-border bg-surface px-3.5 py-3">
              <h2 className="text-sm font-bold">{t("reel.title")}</h2>
              <p className="pt-0.5 text-[13px] leading-relaxed text-text-2">{t("reel.body")}</p>
              {reel ? (
                <div className="mt-2.5 flex items-center gap-3">
                  <video src={reel.url} aria-label={t("reel.title")} className="h-28 rounded-md border border-border" muted playsInline autoPlay loop />
                  <div className="flex flex-1 flex-col gap-2">
                    {canShareFiles([reel.file]) && (
                      <button type="button" onClick={() => run(() => shareFiles([reel.file]))} className="h-10 rounded-xl bg-accent text-sm font-bold text-on-accent">
                        {t("reel.save")}
                      </button>
                    )}
                    <button type="button" onClick={() => run(() => downloadEach([reel.file]))} className="h-10 rounded-xl border border-border-2 text-sm font-semibold">
                      {t("reel.download")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={reelProgress !== null}
                  onClick={() => void makeReel()}
                  className="mt-2.5 h-11 w-full rounded-xl border border-border-2 text-sm font-semibold disabled:opacity-60"
                >
                  {reelProgress !== null ? t("reel.making", { pct: Math.round(reelProgress * 100) }) : t("reel.make")}
                </button>
              )}
            </section>
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
              onClick={() => run(() => downloadZip(files!, `${fileBase(useEditor.getState().projectName, doc.type)}.zip`))}
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
