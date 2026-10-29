"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ImageElement, MediaSettings } from "@ig-layout/core/project/types";
import { filmstrip, waveform } from "@ig-layout/core/video/analyze";
import { defaultMedia, pause as pauseProject } from "@ig-layout/core/video/playback";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";

const MIN_PART = 0.5;
const THUMBS = 10;
const BUCKETS = 120;
const SPEEDS = [0.5, 1, 1.5, 2];
const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

/**
 * Trim a video (M13.2): strip of frames + waveform with two handles, the frame under a
 * handle is shown while dragging, "play part" plays only the chosen part (with sound),
 * fine ±0.1 s steps, speed and loop. ✓ = one undo step.
 */
export function TrimTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const el = useViewDoc()?.elements.find((e) => e.id === elementId) as ImageElement | undefined;
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const updateElement = useEditor((s) => s.updateElement);
  const duration = asset?.video?.duration ?? 1;
  const [media, setMedia] = useState<MediaSettings>(() => el?.media ?? defaultMedia(duration));
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(media.start);
  const video = useRef<HTMLVideoElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const wave = useRef<HTMLCanvasElement>(null);
  const drag = useRef<"start" | "end" | "seek" | null>(null);
  const speed = media.speed ?? 1;

  useEffect(() => {
    pauseProject();
    if (!asset?.video) return;
    let alive = true;
    void filmstrip(asset, THUMBS).then((u) => alive && setThumbs(u));
    void waveform(asset, BUCKETS).then((p) => alive && setPeaks(p));
    return () => {
      alive = false;
    };
  }, [asset]);

  // Waveform: bars, the chosen part brighter.
  useEffect(() => {
    const c = wave.current;
    if (!c || !peaks) return;
    const ctx = c.getContext("2d")!;
    const w = c.width;
    const h = c.height;
    ctx.clearRect(0, 0, w, h);
    const bw = w / peaks.length;
    const accent = getComputedStyle(c).color;
    peaks.forEach((p, i) => {
      const time = ((i + 0.5) / peaks.length) * duration;
      ctx.fillStyle = time >= media.start && time <= media.end ? accent : "rgba(128,128,128,0.35)";
      const bh = Math.max(2, p * h * 0.95);
      ctx.fillRect(i * bw + 0.5, (h - bh) / 2, Math.max(1, bw - 1), bh);
    });
  }, [peaks, media.start, media.end, duration]);

  // Preview loop inside the chosen part.
  useEffect(() => {
    const v = video.current;
    if (!v || !playing) return;
    let frame = 0;
    const tick = () => {
      if (v.currentTime >= media.end || v.currentTime < media.start - 0.05) v.currentTime = media.start;
      setNow(v.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, media.start, media.end]);

  if (!el || !asset?.video) return null;

  const show = (time: number) => {
    const v = video.current;
    if (v && Math.abs(v.currentTime - time) > 0.03) v.currentTime = time;
    setNow(time);
  };

  function togglePreview() {
    const v = video.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
      return;
    }
    v.playbackRate = speed;
    v.muted = media.muted || speed !== 1;
    v.volume = media.volume;
    if (v.currentTime < media.start || v.currentTime >= media.end - 0.05) v.currentTime = media.start;
    void v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  const set = (patch: Partial<MediaSettings>) => setMedia((m) => ({ ...m, ...patch }));
  const setStart = (s: number) => {
    const start = Math.max(0, Math.min(s, media.end - MIN_PART));
    set({ start });
    show(start);
  };
  const setEnd = (e: number) => {
    const end = Math.min(duration, Math.max(e, media.start + MIN_PART));
    set({ end });
    show(end);
  };

  function timeAt(clientX: number) {
    const r = strip.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration;
  }

  function onPointerDown(e: React.PointerEvent) {
    const time = timeAt(e.clientX);
    const r = strip.current!.getBoundingClientRect();
    const px = (s: number) => (s / duration) * r.width;
    const near = (s: number) => Math.abs(px(time) - px(s)) < 28;
    drag.current = near(media.start) && (!near(media.end) || time < media.start) ? "start" : near(media.end) ? "end" : "seek";
    e.currentTarget.setPointerCapture(e.pointerId);
    if (playing) togglePreview();
    onPointerMove(e);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const time = timeAt(e.clientX);
    if (drag.current === "start") setStart(time);
    else if (drag.current === "end") setEnd(time);
    else show(Math.max(media.start, Math.min(media.end, time)));
  }

  const pct = (s: number) => `${(s / duration) * 100}%`;
  const partSeconds = (media.end - media.start) / speed;
  const nudge = "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm font-bold";

  return (
    <div role="dialog" aria-modal="true" aria-label={t("trim.title")} className="fixed inset-0 z-30 flex flex-col bg-bg">
      <header className="flex items-center justify-between px-2 pt-2.5 pb-1">
        <button type="button" aria-label={t("common.cancel")} onClick={onClose} className="flex h-11 w-11 items-center justify-center">
          <Icon name="close" />
        </button>
        <h2 className="text-[15px] font-bold">{t("trim.title")}</h2>
        <button
          type="button"
          aria-label={t("tool.apply")}
          onClick={() => {
            video.current?.pause();
            updateElement(elementId, { media });
            onClose();
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-accent"
        >
          <Icon name="check" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center bg-canvas p-3">
        <video
          ref={video}
          src={asset.url}
          poster={asset.video.posterUrl}
          playsInline
          muted
          preload="auto"
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => (e.currentTarget.currentTime = media.start)}
          className="max-h-full max-w-full rounded-lg"
        />
      </div>

      <section className="flex flex-col gap-3 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={playing ? t("trim.pausePart") : t("trim.playPart")}
            onClick={togglePreview}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-text text-bg"
          >
            <Icon name={playing ? "pause" : "play"} size={18} />
          </button>
          <div className="flex flex-1 flex-col text-xs">
            <span className="font-semibold tabular-nums">{t("trim.part", { length: partSeconds.toFixed(1) })}</span>
            <span className="text-muted tabular-nums">
              {fmt(media.start)} – {fmt(media.end)} · {t("trim.at", { time: fmt(now) })}
            </span>
          </div>
        </div>

        {/* Strip of frames with the chosen part between two handles. */}
        <div
          ref={strip}
          role="group"
          aria-label={t("trim.strip")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          className="relative h-16 touch-none overflow-hidden rounded-lg bg-surface-2 select-none"
        >
          <div className="absolute inset-0 flex">
            {thumbs.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element -- generated thumbnail
              <img key={u} src={u} alt="" className="h-full min-w-0 flex-1 object-cover" draggable={false} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 bg-black/55" style={{ width: pct(media.start) }} />
          <div className="absolute inset-y-0 right-0 bg-black/55" style={{ width: `calc(100% - ${pct(media.end)})` }} />
          <div className="absolute inset-y-0 border-y-[3px] border-accent" style={{ left: pct(media.start), width: `calc(${pct(media.end)} - ${pct(media.start)})` }} />
          {(["start", "end"] as const).map((k) => (
            <div
              key={k}
              aria-hidden="true"
              className="absolute inset-y-0 flex w-4 items-center justify-center bg-accent"
              style={{ left: `calc(${pct(media[k])} - ${k === "start" ? "0px" : "16px"})` }}
            >
              <span className="h-6 w-0.5 rounded bg-on-accent" />
            </div>
          ))}
          <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: pct(now) }} />
        </div>
        <canvas ref={wave} width={600} height={56} aria-label={t("trim.waveform")} className={`h-10 w-full text-accent ${peaks ? "" : "hidden"}`} />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label={t("trim.startEarlier")} onClick={() => setStart(media.start - 0.1)} className={nudge}>
              −
            </button>
            <span className="w-12 text-center tabular-nums">{fmt(media.start)}</span>
            <button type="button" aria-label={t("trim.startLater")} onClick={() => setStart(media.start + 0.1)} className={nudge}>
              +
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label={t("trim.endEarlier")} onClick={() => setEnd(media.end - 0.1)} className={nudge}>
              −
            </button>
            <span className="w-12 text-center tabular-nums">{fmt(media.end)}</span>
            <button type="button" aria-label={t("trim.endLater")} onClick={() => setEnd(media.end + 0.1)} className={nudge}>
              +
            </button>
          </div>
        </div>

        <div role="radiogroup" aria-label={t("trim.speed")} className="flex items-center gap-1.5">
          <span className="w-20 shrink-0 text-[13px] text-muted">{t("trim.speed")}</span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={speed === s}
              onClick={() => {
                set({ speed: s === 1 ? undefined : s });
                if (video.current) video.current.playbackRate = s;
              }}
              className={`h-8 flex-1 rounded-full text-[13px] ${speed === s ? "bg-text font-bold text-bg" : "border border-border"}`}
            >
              {s}×
            </button>
          ))}
        </div>
        {speed !== 1 && asset.video.hasAudio && <p className="-mt-1 text-xs text-muted">{t("trim.speedMutes")}</p>}
        <label className="flex items-center justify-between text-sm">
          <span>{t("trim.loop")}</span>
          <input type="checkbox" checked={media.loop !== false} onChange={(e) => set({ loop: e.target.checked ? undefined : false })} className="h-[22px] w-[22px] accent-accent" />
        </label>
      </section>
    </div>
  );
}
