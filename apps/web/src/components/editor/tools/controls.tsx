"use client";

import { useEffect, useRef } from "react";
import { ColorPicker } from "@/components/ui/color/ColorPicker";
import { Icon } from "@/components/ui/Icon";
import { traceMask } from "@ig-layout/core/project/masks";
import type { MaskShape } from "@ig-layout/core/project/types";
import { useT } from "@/store/settings";

/** Bottom sheet for a tool: ✕ cancels the draft, ✓ records one history step (D-12). */
export function ToolSheet(props: {
  title: string;
  onCancel: () => void;
  onApply: () => void;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <section
      aria-label={props.title}
      className="rounded-t-[28px] bg-surface pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      {/* Header like the colour sheet (D-129): round ✕ · title · round ✓. */}
      <div className="flex items-center gap-2 px-4 pb-1">
        <button
          type="button"
          aria-label={t("common.cancel")}
          onClick={props.onCancel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 active:scale-95"
        >
          <Icon name="close" size={22} />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-center text-[16px] font-bold">{props.title}</h2>
        <button
          type="button"
          aria-label={t("tool.apply")}
          onClick={props.onApply}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent active:scale-95"
        >
          <Icon name="check" size={22} />
        </button>
      </div>
      <div className="px-4 pt-2">{props.children}</div>
    </section>
  );
}

export function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const t = useT();
  return (
    <label className="flex items-center gap-2 py-2 text-[13px]">
      <span className="w-24 shrink-0 text-muted">{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        // Double-tap / double-click resets (docs/user/features.md).
        onDoubleClick={() => props.onChange(props.defaultValue)}
        className="h-7 flex-1 accent-accent"
      />
      <span className="w-12 text-right font-display tabular-nums">
        {props.format ? props.format(props.value) : props.value}
      </span>
      {/* Visible reset: double-tap on a slider is unreliable on phones (UX-13). */}
      <button
        type="button"
        aria-label={t("tool.reset", { name: props.label })}
        disabled={props.value === props.defaultValue}
        onClick={() => props.onChange(props.defaultValue)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted disabled:invisible"
      >
        <Icon name="reset" size={16} />
      </button>
    </label>
  );
}


/** Default colours of the shared palette (editor-v2/08 §3): greys, then hues bright → deep → pastel → earthy. */
export { SWATCHES } from "@/components/ui/color/ColorPicker";

/**
 * The shared colour control (editor-v2/08 §3; compact since 2026-10-20): one round swatch,
 * tapping it opens the colour panel (custom, saved, default, eyedropper; gradients where
 * the element can draw them).
 */
export function Swatches(props: { value: string; onChange: (color: string) => void; colors?: string[]; gradient?: boolean; label?: string }) {
  return (
    <div className="py-1">
      <ColorPicker value={props.value} onChange={props.onChange} colors={props.colors} gradient={props.gradient} label={props.label} />
    </div>
  );
}

/** Small preview of a mask shape. */
export function MaskPreview({ shape, size = 28 }: { shape: MaskShape; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    traceMask(ctx, shape, size, size, size * 0.25);
    ctx.fillStyle = getComputedStyle(canvas).color;
    ctx.fill();
  }, [shape, size]);
  return <canvas ref={ref} aria-hidden="true" style={{ width: size, height: size }} />;
}
