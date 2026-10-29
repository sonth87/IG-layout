"use client";

import { useEffect, useRef } from "react";
import { frameById } from "@ig-layout/core/booth/frames";
import { ARRANGES, SHAPES, layoutFrame, newSeed, shapePath, type Arrange, type CellShape, type LayoutChoice } from "@ig-layout/core/booth/layout";
import type { RenderOptions } from "@ig-layout/core/booth/render";
import { useT } from "@/store/settings";
import { FrameCanvas } from "./FrameCanvas";
import { FramePicker } from "./FramePicker";
import { Btn, Label, mono } from "./ui";

// The Layout tab (D-161): the frame (sheet + number of shots), how its cells are arranged
// (straight, staggered, scattered, free) — each previewed on the roll's own frame —, the
// cell shape, 🎲 shuffle (a new seed for the random ones) and realign (back to straight
// positions, in free).

const EMPTY: never[] = [];

export function LayoutPanel({ frameId, layout, look, onFrame, onLayout }: {
  frameId: string;
  layout: LayoutChoice;
  look: RenderOptions;
  onFrame: (id: string) => void;
  onLayout: (l: LayoutChoice) => void;
}) {
  const t = useT();
  const arrange = layout.arrange ?? "straight";
  const shape = layout.shape ?? "rect";
  const base = frameById(frameId);
  const chip = (on: boolean) => `flex shrink-0 flex-col items-center gap-1 border-2 border-[#1d1612] p-1.5 transition-[transform,box-shadow] duration-100 ${on ? "-translate-y-0.5 bg-[#1d1612] text-[#f3e9d6] shadow-[3px_3px_0_#c8432f]" : "bg-[#e7d9bd] shadow-[2px_2px_0_#0b0806]"}`;

  return (
    <div className="pb-2">
      <Label className="px-5 pt-3">{t("booth.frame")}</Label>
      <FramePicker value={frameId} look={look} onChange={onFrame} />

      <Label className="px-5">{t("booth.arrange")}</Label>
      <div role="radiogroup" aria-label={t("booth.arrange")} className="flex gap-2.5 overflow-x-auto px-5 pt-2 pb-3">
        {ARRANGES.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={arrange === a}
            className={`${chip(arrange === a)} w-[76px]`}
            onClick={() => {
              if (a === arrange) return;
              // Free starts from what's on screen now.
              const cells = a === "free" ? layoutFrame(base, layout).cells : undefined;
              onLayout({ ...layout, arrange: a, cells, seed: layout.seed ?? newSeed() });
            }}
          >
            <span className="flex h-14 items-center">
              <FrameCanvas frame={layoutFrame(base, { arrange: a === "free" ? "scatter" : a, shape, seed: layout.seed ?? 1 })} images={EMPTY} look={{ ...look, showDate: false, title: "" }} scale={140 / Math.max(base.width, base.height)} className="max-h-14 max-w-[60px]" />
            </span>
            <span className={`${mono} text-[9px] font-bold uppercase tracking-wider`}>{t(`booth.arrange.${a}`)}</span>
          </button>
        ))}
      </div>

      <Label className="px-5">{t("booth.shape")}</Label>
      <div role="radiogroup" aria-label={t("booth.shape")} className="flex gap-2 overflow-x-auto px-5 pt-2 pb-3">
        {SHAPES.map((s) => (
          <button key={s} type="button" role="radio" aria-checked={shape === s} aria-label={t(`booth.shape.${s}`)} title={t(`booth.shape.${s}`)} className={`${chip(shape === s)} w-12`} onClick={() => onLayout({ ...layout, shape: s })}>
            <ShapeIcon shape={s} on={shape === s} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5">
        {(arrange === "stagger" || arrange === "scatter") && (
          <Btn className="py-2" onClick={() => onLayout({ ...layout, seed: newSeed() })}>
            🎲 {t("booth.shuffle")}
          </Btn>
        )}
        {arrange === "free" && (
          <>
            <Btn className="py-2" onClick={() => onLayout({ ...layout, cells: layoutFrame(base, { arrange: "straight" }).cells })}>
              ⊞ {t("booth.realign")}
            </Btn>
            <p className={`${mono} w-full text-[10px] leading-relaxed opacity-60`}>{t("booth.freeHint")}</p>
          </>
        )}
      </div>
    </div>
  );
}

/** The shape itself, small. */
function ShapeIcon({ shape, on }: { shape: CellShape; on: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    const d = devicePixelRatio || 1;
    ref.current!.width = 32 * d;
    ref.current!.height = 32 * d;
    c.setTransform(d, 0, 0, d, 16 * d, 16 * d);
    if (shape === "polaroid") {
      c.fillStyle = on ? "#f3e9d6" : "#1d1612";
      c.fillRect(-11, -13, 22, 26);
      c.fillStyle = on ? "#1d1612" : "#e7d9bd";
      c.fillRect(-9, -11, 18, 17);
      return;
    }
    c.fillStyle = on ? "#f3e9d6" : "#1d1612";
    shapePath(c, shape, 22, 24, 3, 0);
    c.fill();
  }, [shape, on]);
  return <canvas ref={ref} className="h-8 w-8" />;
}

export type { Arrange };
