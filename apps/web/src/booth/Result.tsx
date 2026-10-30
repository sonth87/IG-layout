"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteRoll, type BoothRoll } from "@ig-layout/core/storage/booth";
import { useT } from "@/store/settings";
import { FrameCanvas } from "./FrameCanvas";
import { HandoffSheet } from "./HandoffSheet";
import { formatBlob, lookOptions, rollFrame, useRollImages, useStickersLoaded, type Format } from "./look";
import { Btn, Confirm, display, mono, serif } from "./ui";

// The print (design §2.6, ColorME's printer): a little booth printer — sign, blinking light,
// slot — pushes the print out in motor steps with a whirr (tap to skip). Then one main button
// to save, flip (D-153), tap a photo to retake it, take the missing ones, new roll.

const PRINT_MS = 2600;
const FORMATS: Format[] = ["print", "post", "story"];

export function Result({ roll, sound, onChange, onRetake, onDecorate, onAgain, onHome, inRoom }: {
  roll: BoothRoll;
  sound: boolean;
  onChange: (roll: BoothRoll) => void;
  /** Retake / fill shots (solo); a group roll can't (everyone was in each shot). */
  onRetake?: (shots: number[]) => void;
  onDecorate: () => void;
  onAgain: () => void;
  onHome: () => void;
  /** Shot in a group room: "New roll" goes back to the room, no lobby button. */
  inRoom?: boolean;
}) {
  const t = useT();
  const frame = useMemo(() => rollFrame(roll), [roll]);
  const images = useRollImages(roll);
  const loaded = useStickersLoaded(roll.stickers);
  const look = useMemo(() => lookOptions(roll), [roll, loaded]); // eslint-disable-line react-hooks/exhaustive-deps -- `loaded`: redraw when the sticker pictures arrive
  // Reduced motion: no feed animation (its end would never come), the print is just there.
  const [printed, setPrinted] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [selected, setSelected] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [format, setFormat] = useState<Format>("print");
  const [handoff, setHandoff] = useState(false);
  const missing = !onRetake ? [] : Array.from({ length: frame.shots }, (_, i) => i).filter((i) => !roll.shots[i]);
  const date = new Date(roll.createdAt);
  const printing = !!images && !printed;

  // The motor's whirr while the print comes out.
  useEffect(() => {
    if (!printing || !sound) return;
    return whirr(PRINT_MS);
  }, [printing, sound]);

  async function save() {
    if (!images) return;
    setSaving(true);
    try {
      const blob = await formatBlob(roll, format);
      const pad = (n: number) => String(n).padStart(2, "0");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `booth_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${format === "print" ? "" : `_${format}`}.jpg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    } finally {
      setSaving(false);
    }
  }

  const status = printing ? t("booth.printing") : missing.length ? t("booth.missing", { count: missing.length }) : selected !== null ? t("booth.retakeShot", { n: selected + 1 }) : t("booth.tapCell");

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="relative flex min-h-0 flex-1 flex-col items-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] lg:pt-8">
        {/* The printer. */}
        <div className="relative z-10 w-full max-w-[340px] shrink-0 rounded-t-[18px] lg:max-w-[640px] border-2 border-[#0b0806] bg-[#3a2a20] px-4 pt-3 pb-4 shadow-[5px_5px_0_#0b0806]">
          <div className="flex items-center justify-between">
            <span aria-hidden className="flex gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full border border-[#0b0806] ${printing ? "animate-[booth-led_0.5s_steps(2)_infinite] bg-[#eaa63c]" : "bg-[#6fbf73]"}`} />
              <span className="h-2.5 w-2.5 rounded-full border border-[#0b0806] bg-[#c8432f]/60" />
            </span>
            <p className={`${serif} text-xl text-[#f3e9d6] [text-shadow:0_0_12px_rgba(234,166,60,0.5)]`} style={display}>
              {t("booth.title")}
            </p>
            <span aria-hidden className={`${mono} text-[9px] font-bold tracking-[0.2em] text-[#eaa63c]/70`}>
              Nº{String(date.getDate()).padStart(2, "0")}
            </span>
          </div>
          {/* The slot. */}
          <div className="mt-3 h-3 rounded-full bg-[#0b0806] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />
        </div>

        {/* The print, clipped at the slot so it seems to come out of it. */}
        <div className="-mt-2.5 flex min-h-0 w-full max-w-[300px] flex-1 justify-center overflow-hidden lg:max-w-[600px]" onClick={() => setPrinted(true)}>
          {images && (
            <div
              className={`h-fit max-h-full transition-transform duration-500 ${printed ? "rotate-[-1.5deg]" : "animate-[booth-feed_2.6s_linear_both]"}`}
              onAnimationEnd={() => setPrinted(true)}
            >
              <FrameCanvas
                frame={frame}
                images={images}
                scale={Math.min(1, 1200 / Math.max(frame.width, frame.height))}
                look={look}
                numbers
                className="block max-h-[calc(100dvh-440px)] lg:max-h-[calc(100dvh-150px)] max-w-full shadow-[5px_6px_0_rgba(11,8,6,0.85)]"
                onCell={printed && onRetake ? (shot) => setSelected((s) => (s === shot ? null : shot)) : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t-2 border-[#0b0806] bg-[#f3e9d6] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-[#1d1612] lg:flex lg:w-[420px] lg:flex-col lg:justify-center lg:border-t-0 lg:border-l-2 lg:px-8">
        <p className={`${mono} text-center text-[13px] font-bold uppercase tracking-[0.18em] ${printing ? "" : missing.length ? "text-[#c8432f]" : "opacity-60"}`} aria-live="polite">
          {printed && !missing.length && selected === null ? t("booth.printDone") : status}
        </p>
        {printed && onRetake && !missing.length && selected === null && <p className={`${mono} mt-0.5 text-center text-xs opacity-60`}>{t("booth.tapCell")}</p>}
        <div className="mx-auto mt-3 flex max-w-sm flex-col gap-3">
          {selected !== null && onRetake && <Btn onClick={() => onRetake([selected])}>↺ {t("booth.retakeShot", { n: selected + 1 })}</Btn>}
          {missing.length > 0 ? (
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Btn tone="main" className="py-4 text-[15px]" onClick={() => onRetake?.(missing)}>
                {t("booth.fill")}
              </Btn>
              <Btn className="py-4 text-[15px]" onClick={onDecorate}>
                ✎ {t("booth.decorate")}
              </Btn>
            </div>
          ) : (
            <>
              {/* Save as: the print itself, or the print on an Instagram-sized sheet. */}
              <div role="radiogroup" aria-label={t("booth.saveAs")} className="grid grid-cols-3 border-2 border-[#1d1612]">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={format === f}
                    onClick={() => setFormat(f)}
                    className={`${mono} border-r-2 border-[#1d1612] py-2 text-xs font-bold uppercase tracking-[0.1em] last:border-r-0 ${format === f ? "bg-[#1d1612] text-[#f3e9d6]" : ""}`}
                  >
                    {t(`booth.format.${f}`)}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <Btn tone="main" className="py-4 text-[15px]" disabled={!images || saving} onClick={save}>
                  ↓ {t("booth.save")}
                </Btn>
                <Btn className="py-4 text-[15px]" onClick={onDecorate}>
                  ✎ {t("booth.decorate")}
                </Btn>
              </div>
              <Btn tone="ink" className="py-3.5 text-[13px]" disabled={!images} onClick={() => setHandoff(true)}>
                ▦ {t("booth.openInLayout")}
              </Btn>
            </>
          )}
          <div className={`grid gap-2 ${inRoom ? "grid-cols-3" : "grid-cols-4"}`}>
            <Btn aria-pressed={roll.flip} className={`px-1 py-3 text-[11px] leading-tight tracking-[0.06em] ${roll.flip ? "!bg-[#1d1612] !text-[#f3e9d6]" : ""}`} onClick={() => onChange({ ...roll, flip: !roll.flip })}>
              <span aria-hidden className="mb-1 block text-2xl leading-none">⇋</span>
              {t("booth.flip")}
            </Btn>
            <Btn className="px-1 py-3 text-[11px] leading-tight tracking-[0.06em]" onClick={onAgain}>
              <span aria-hidden className="mb-1 block text-2xl leading-none">✶</span>
              {inRoom ? t("booth.room.back") : t("booth.again")}
            </Btn>
            {!inRoom && (
              <Btn className="px-1 py-3 text-[11px] leading-tight tracking-[0.06em]" onClick={onHome}>
                <span aria-hidden className="mb-1 block text-2xl leading-none">⌂</span>
                {t("booth.home")}
              </Btn>
            )}
            <Btn tone="danger" className="px-1 py-3 text-[11px] leading-tight tracking-[0.06em]" onClick={() => setDeleting(true)}>
              <span aria-hidden className="mb-1 block text-2xl leading-none">✕</span>
              {t("booth.deleteRoll")}
            </Btn>
          </div>
        </div>
      </div>

      {handoff && <HandoffSheet roll={roll} onClose={() => setHandoff(false)} />}
      {deleting && (
        <Confirm
          title={t("booth.deleteConfirm")}
          yes={t("common.delete")}
          no={t("common.cancel")}
          danger
          onNo={() => setDeleting(false)}
          onYes={() => {
            void deleteRoll(roll.id).finally(onHome);
          }}
        />
      )}
    </div>
  );
}

/** A printer motor: filtered noise in four pushes over `ms` (no sound file). Returns stop. */
function whirr(ms: number): () => void {
  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioContext();
    const len = Math.floor(ctx.sampleRate * (ms / 1000));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 700;
    band.Q.value = 3;
    const g = ctx.createGain();
    g.gain.value = 0;
    // The same pushes as the booth-feed keyframes (fractions of the run).
    const t0 = ctx.currentTime;
    for (const [a, b] of [[0, 0.12], [0.2, 0.35], [0.43, 0.58], [0.66, 0.82], [0.9, 1]]) {
      g.gain.setTargetAtTime(0.35, t0 + a * (ms / 1000), 0.01);
      g.gain.setTargetAtTime(0, t0 + b * (ms / 1000), 0.02);
    }
    src.connect(band).connect(g).connect(ctx.destination);
    src.start();
  } catch {}
  return () => void ctx?.close().catch(() => {});
}
