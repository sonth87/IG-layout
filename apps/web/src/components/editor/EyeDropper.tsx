"use client";

import { useEffect, useRef, useState } from "react";
import { useEyedropper } from "@/components/ui/color/ColorPicker";
import { useEditor } from "@/store/editor";
import { useT } from "@/store/settings";

// The eyedropper (owner, 2026-10-20): sheets and menus step aside; a magnifier follows the
// finger over the canvas and shows the pixel under it; lifting the finger picks it.

const LOUPE = 132;
/** Device pixels shown across the magnifier. */
const SPAN = 13;

export function EyeDropper() {
  const t = useT();
  const active = useEyedropper((s) => s.active);
  const canvas = useEditor((s) => s.canvas);
  const [at, setAt] = useState<{ x: number; y: number; hex: string } | null>(null);
  const loupe = useRef<HTMLCanvasElement>(null);

  // The pixels of the canvas as shown (the content layer, without handles or guides).
  const source = () => {
    const layer = canvas?.layer;
    const stage = layer?.getStage();
    if (!layer || !stage) return null;
    const native = layer.getNativeCanvasElement();
    const rect = stage.container().getBoundingClientRect();
    return { native, rect, k: native.width / stage.width() };
  };

  const read = (x: number, y: number) => {
    const s = source();
    if (!s) return null;
    const px = Math.round((x - s.rect.left) * s.k);
    const py = Math.round((y - s.rect.top) * s.k);
    const ctx = s.native.getContext("2d");
    if (!ctx || px < 0 || py < 0 || px >= s.native.width || py >= s.native.height) return null;
    const d = ctx.getImageData(px, py, 1, 1).data;
    if (d[3] < 8) return null;
    return `#${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  };

  // Draw the magnified pixels around the finger.
  useEffect(() => {
    const out = loupe.current;
    const s = source();
    if (!out || !at || !s) return;
    const g = out.getContext("2d");
    if (!g) return;
    const dpr = window.devicePixelRatio || 1;
    out.width = LOUPE * dpr;
    out.height = LOUPE * dpr;
    g.imageSmoothingEnabled = false;
    g.fillStyle = "#e6e3dd";
    g.fillRect(0, 0, out.width, out.height);
    const px = (at.x - s.rect.left) * s.k;
    const py = (at.y - s.rect.top) * s.k;
    g.drawImage(s.native, px - SPAN / 2, py - SPAN / 2, SPAN, SPAN, 0, 0, out.width, out.height);
    // The picked pixel.
    const cell = out.width / SPAN;
    g.strokeStyle = "#ffffff";
    g.lineWidth = 2 * dpr;
    g.strokeRect(out.width / 2 - cell / 2, out.height / 2 - cell / 2, cell, cell);
    g.strokeStyle = "rgba(0,0,0,0.6)";
    g.lineWidth = dpr;
    g.strokeRect(out.width / 2 - cell / 2 - 2 * dpr, out.height / 2 - cell / 2 - 2 * dpr, cell + 4 * dpr, cell + 4 * dpr);
    // canvas is stable while picking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at]);

  if (!active) return null;
  const move = (e: React.PointerEvent) => {
    const hex = read(e.clientX, e.clientY);
    setAt({ x: e.clientX, y: e.clientY, hex: hex ?? at?.hex ?? "#ffffff" });
  };
  const lx = at ? Math.min(window.innerWidth - LOUPE - 8, Math.max(8, at.x - LOUPE / 2)) : 0;
  const ly = at ? Math.max(8, at.y - LOUPE - 70) : 0;
  return (
    <div
      role="application"
      aria-label={t("color.eyedropper")}
      className="fixed inset-0 z-[70] touch-none"
      style={{ cursor: "crosshair" }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => (e.buttons || e.pointerType === "mouse") && move(e)}
      onPointerUp={(e) => {
        const hex = read(e.clientX, e.clientY) ?? at?.hex;
        setAt(null);
        useEyedropper.getState().finish(hex ?? undefined);
      }}
    >
      {!at && (
        <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto w-fit rounded-full bg-black/75 px-4 py-2 text-[14px] font-semibold text-white">
          {t("color.eyedropperHint")}
        </div>
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => useEyedropper.getState().finish()}
        className="absolute top-4 right-4 rounded-full bg-black/75 px-4 py-2 text-[14px] font-semibold text-white"
      >
        {t("common.cancel")}
      </button>
      {at && (
        <div className="pointer-events-none absolute flex flex-col items-center gap-1.5" style={{ left: lx, top: ly }}>
          <canvas ref={loupe} style={{ width: LOUPE, height: LOUPE }} className="rounded-full border-4 shadow-xl" aria-hidden="true" />
          <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 font-mono text-[13px] text-white">
            <span className="h-3.5 w-3.5 rounded-full border border-white/60" style={{ background: at.hex }} />
            {at.hex}
          </span>
        </div>
      )}
    </div>
  );
}
