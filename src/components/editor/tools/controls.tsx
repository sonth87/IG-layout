"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { traceMask } from "@/lib/project/masks";
import type { MaskShape } from "@/lib/project/types";
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
      className="rounded-t-[20px] bg-surface pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          aria-label={t("common.cancel")}
          onClick={props.onCancel}
          className="flex h-12 w-12 items-center justify-center"
        >
          <Icon name="close" size={24} />
        </button>
        <h2 className="text-[15px] font-bold">{props.title}</h2>
        <button
          type="button"
          aria-label={t("tool.apply")}
          onClick={props.onApply}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-accent"
        >
          <Icon name="check" size={24} />
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
  return (
    <label className="flex items-center gap-3 py-2 text-[13px]">
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
    </label>
  );
}

export const SWATCHES = [
  "#ffffff",
  "#111111",
  "#f3e3c3",
  "#e9e4da",
  "#d9728a",
  "#f2b84b",
  "#9dbf8e",
  "#6e8fb3",
  "#8e8fc9",
  "#3b2f25",
];

export function Swatches(props: { value: string; onChange: (color: string) => void; colors?: string[] }) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {(props.colors ?? SWATCHES).map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          aria-pressed={props.value.toLowerCase() === c}
          onClick={() => props.onChange(c)}
          className={`h-8 w-8 rounded-full border ${
            props.value.toLowerCase() === c ? "border-2 border-accent ring-2 ring-accent/40" : "border-border-2"
          }`}
          style={{ background: c }}
        />
      ))}
      <label
        className="relative h-8 w-8 overflow-hidden rounded-full border border-border-2"
        style={{ background: "conic-gradient(#f28b82,#f2b84b,#9dbf8e,#7cc4f2,#8e8fc9,#f28b82)" }}
      >
        <span className="sr-only">{t("tool.customColor")}</span>
        <input
          type="color"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
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
