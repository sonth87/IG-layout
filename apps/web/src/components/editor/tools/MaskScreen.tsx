"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { type ImageAsset, type ImageElement, newId } from "@ig-layout/core/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { useHtmlImage } from "../canvas/useHtmlImage";
import { Slider } from "./controls";

// Background tools that need a finger (M19, editor-v2/09 §9), full screen on black:
// - Cut out: draw a closed line around what to keep; outside turns red, ✓ keeps the inside.
// - Eraser: paint to make parts transparent, "Restore" paints the original back.
// The result is a new PNG of the same size; the original stays for "Restore background".

type Stroke = { points: [number, number][]; size: number; restore: boolean };

/** Pointer position in image pixels. */
function toImage(e: React.PointerEvent<HTMLCanvasElement>, w: number, h: number): [number, number] {
  const r = e.currentTarget.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * w, ((e.clientY - r.top) / r.height) * h];
}

/** Adds the line to the current path; `fresh` starts a new path first. */
function trace(ctx: CanvasRenderingContext2D, pts: [number, number][], fresh = true) {
  if (fresh) ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

export function MaskScreen({ elementId, mode, onClose }: { elementId: string; mode: "cutout" | "erase"; onClose: () => void }) {
  const t = useT();
  const found = useViewDoc()?.elements.find((e) => e.id === elementId);
  const el = found?.type === "image" ? (found as ImageElement) : undefined;
  const assets = useEditor((s) => s.assets);
  const asset = el?.assetId ? assets[el.assetId] : undefined;
  const original = el?.originalAssetId ? assets[el.originalAssetId] : asset;
  const image = useHtmlImage(asset?.url);
  const originalImage = useHtmlImage(original?.url);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [path, setPath] = useState<[number, number][]>([]);
  const [closed, setClosed] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);
  const [size, setSize] = useState(60);
  const [restore, setRestore] = useState(false);
  const drawing = useRef(false);
  const [busy, setBusy] = useState(false);

  /** The image with the erase / restore strokes so far (full size). */
  function erased(img: HTMLImageElement, list: Stroke[]) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    for (const s of list) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = s.size;
      if (s.restore && originalImage) {
        // Paint the original back inside the stroke.
        trace(ctx, s.points);
        const m = document.createElement("canvas");
        m.width = c.width;
        m.height = c.height;
        const mc = m.getContext("2d")!;
        mc.lineCap = "round";
        mc.lineJoin = "round";
        mc.lineWidth = s.size;
        trace(mc, s.points);
        mc.stroke();
        mc.globalCompositeOperation = "source-in";
        mc.drawImage(originalImage, 0, 0, c.width, c.height);
        ctx.drawImage(m, 0, 0);
      } else {
        ctx.globalCompositeOperation = "destination-out";
        trace(ctx, s.points);
        ctx.stroke();
      }
      ctx.restore();
    }
    return c;
  }

  // What the screen shows.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !image) return;
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    const k = Math.max(c.width, c.height) / 400; // line widths in screen-ish units
    if (mode === "erase") {
      ctx.drawImage(erased(image, strokes), 0, 0);
      return;
    }
    ctx.drawImage(image, 0, 0);
    if (path.length < 2) return;
    if (closed) {
      // Outside the line in translucent red: that part goes.
      ctx.save();
      ctx.fillStyle = "rgba(239,68,68,0.45)";
      ctx.beginPath();
      ctx.rect(0, 0, c.width, c.height);
      trace(ctx, path, false);
      ctx.closePath();
      ctx.fill("evenodd");
      ctx.restore();
    }
    ctx.save();
    ctx.setLineDash([6 * k, 4 * k]);
    ctx.lineWidth = 2.5 * k;
    ctx.strokeStyle = "#facc15";
    trace(ctx, path);
    if (closed) ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#facc15";
    for (const [x, y] of [path[0], path.at(-1)!]) {
      ctx.beginPath();
      ctx.arc(x, y, 5 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  if (!el || !asset) return null;
  const W = image?.naturalWidth ?? 1;
  const H = image?.naturalHeight ?? 1;

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!image) return; // still loading
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = toImage(e, W, H);
    if (mode === "cutout") {
      setPath([p]);
      setClosed(false);
    } else {
      // Brush size is set in screen terms; strokes keep it in image pixels.
      const r = e.currentTarget.getBoundingClientRect();
      setStrokes((s) => [...s, { points: [p], size: (size * W) / r.width / 3, restore }]);
      setRedo([]);
    }
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = toImage(e, W, H);
    if (mode === "cutout") setPath((pts) => [...pts, p]);
    else setStrokes((s) => [...s.slice(0, -1), { ...s.at(-1)!, points: [...s.at(-1)!.points, p] }]);
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    // The line closes itself from its end back to its start.
    if (mode === "cutout") setClosed(path.length > 2);
  }

  async function apply() {
    if (!image) return;
    let out: HTMLCanvasElement;
    if (mode === "cutout") {
      if (!closed) return;
      out = document.createElement("canvas");
      out.width = W;
      out.height = H;
      const ctx = out.getContext("2d")!;
      trace(ctx, path);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(image, 0, 0);
    } else {
      if (!strokes.length) return onClose();
      out = erased(image, strokes);
    }
    setBusy(true);
    const blob = await new Promise<Blob | null>((r) => out.toBlob(r, "image/png"));
    setBusy(false);
    if (!blob) return;
    const next: ImageAsset = { id: newId(), blob, url: URL.createObjectURL(blob), width: W, height: H, name: `${asset!.name.replace(/\.\w+$/, "")}-${mode}.png` };
    useEditor.getState().swapAsset(elementId, next);
    onClose();
  }

  const canUndo = mode === "cutout" ? path.length > 0 : strokes.length > 0;
  const round = "flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white disabled:opacity-35";
  return (
    <div role="dialog" aria-label={mode === "cutout" ? t("bg.cutout") : t("bg.erase")} className="fixed inset-0 z-40 flex flex-col bg-black text-white">
      <header className="flex shrink-0 items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button type="button" aria-label={t("common.cancel")} onClick={onClose} className={round}>
          <Icon name="close" />
        </button>
        <span className="text-[15px] font-semibold">{mode === "cutout" ? t("bg.cutout") : t("bg.erase")}</span>
        <div className="flex items-center gap-2">
          <div className="flex h-11 items-center rounded-full bg-white/12 px-1">
            <button
              type="button"
              aria-label={t("edit.undo")}
              disabled={!canUndo}
              onClick={() => {
                if (mode === "cutout") {
                  setPath([]);
                  setClosed(false);
                } else {
                  setRedo((r) => [strokes.at(-1)!, ...r]);
                  setStrokes((s) => s.slice(0, -1));
                }
              }}
              className="flex h-10 w-10 items-center justify-center disabled:opacity-35"
            >
              <Icon name="undo" />
            </button>
            <button
              type="button"
              aria-label={t("edit.redo")}
              disabled={mode === "cutout" || !redo.length}
              onClick={() => {
                setStrokes((s) => [...s, redo[0]]);
                setRedo((r) => r.slice(1));
              }}
              className="flex h-10 w-10 items-center justify-center disabled:opacity-35"
            >
              <Icon name="redo" />
            </button>
          </div>
          <button type="button" aria-label={t("tool.apply")} disabled={busy || (mode === "cutout" && !closed)} onClick={() => void apply()} className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-accent disabled:opacity-40">
            <Icon name="check" />
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center p-3" style={{ background: "repeating-conic-gradient(#2a2a2a 0 25%, #1c1c1c 0 50%) 0 0 / 18px 18px" }}>
        <canvas
          ref={canvasRef}
          aria-label={mode === "cutout" ? t("bg.cutoutHint") : t("bg.eraseHint")}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ touchAction: "none", aspectRatio: `${W} / ${H}` }}
          className="block max-h-full max-w-full"
        />
      </div>
      <footer className="shrink-0 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] [&_.text-muted]:text-white/60">
        <p className="pb-2 text-center text-[13px] text-white/70">{mode === "cutout" ? t("bg.cutoutHint") : t("bg.eraseHint")}</p>
        {mode === "erase" && (
          <>
            <div className="flex gap-2 pb-1">
              {[false, true].map((r) => (
                <button key={String(r)} type="button" aria-pressed={restore === r} onClick={() => setRestore(r)} className={`h-10 flex-1 rounded-full text-sm ${restore === r ? "bg-white font-semibold text-black" : "bg-white/12"}`}>
                  {r ? t("bg.restoreMode") : t("bg.eraseMode")}
                </button>
              ))}
            </div>
            <Slider label={t("bg.brush")} value={size} min={10} max={160} defaultValue={60} onChange={setSize} />
          </>
        )}
      </footer>
    </div>
  );
}
