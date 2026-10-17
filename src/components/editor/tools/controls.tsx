"use client";

import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
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
export const SWATCHES = [
  "#ffffff", "#f2f2f2", "#d9d9d9", "#b3b3b3", "#808080", "#4d4d4d", "#111111", "#000000",
  "#e53935", "#fb8c00", "#fdd835", "#43a047", "#00acc1", "#1e88e5", "#8e24aa", "#d81b60",
  "#8e1c1c", "#b85c00", "#b8a000", "#1b5e20", "#006064", "#0d47a1", "#4a148c", "#880e4f",
  "#ffcdd2", "#ffe0b2", "#fff9c4", "#c8e6c9", "#b2ebf2", "#bbdefb", "#e1bee7", "#f8bbd0",
  "#f3e3c3", "#e9e4da", "#d9728a", "#f2b84b", "#9dbf8e", "#6e8fb3", "#8e8fc9", "#3b2f25",
];

const RECENT_KEY = "ig-layout:colors";

/** Custom colours used lately on this device (newest first). */
const useRecentColors = create<{ colors: string[]; add: (c: string) => void }>()((set, get) => ({
  colors: (() => {
    try {
      return typeof window === "undefined" ? [] : (JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]).slice(0, 12);
    } catch {
      return [];
    }
  })(),
  add: (c) => {
    const colors = [c, ...get().colors.filter((x) => x !== c)].slice(0, 12);
    set({ colors });
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(colors));
    } catch {
      // Storage blocked: the list just won't survive a reload.
    }
  },
}));

function Dot(props: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={props.color}
      aria-pressed={props.active}
      onClick={props.onClick}
      className={`h-8 w-8 shrink-0 rounded-full border ${props.active ? "border-2 border-accent ring-2 ring-accent/40" : "border-border-2"}`}
      style={{ background: props.color }}
    />
  );
}

/**
 * The shared colour palette (editor-v2/08 §3), used everywhere a colour is picked:
 * a custom colour (wheel + HEX), the ones used lately, and the default colours.
 */
export function Swatches(props: { value: string; onChange: (color: string) => void; colors?: string[] }) {
  const t = useT();
  const recent = useRecentColors();
  const value = props.value.toLowerCase();
  const [hex, setHex] = useState<string | null>(null);
  const custom = (c: string) => {
    props.onChange(c);
    recent.add(c.toLowerCase());
  };
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
        <label
          className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border-2"
          style={{ background: "conic-gradient(#f28b82,#f2b84b,#9dbf8e,#7cc4f2,#8e8fc9,#f28b82)" }}
        >
          <span className="sr-only">{t("tool.customColor")}</span>
          <input type="color" value={props.value} onChange={(e) => custom(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
        <input
          aria-label="HEX"
          value={hex ?? value}
          onChange={(e) => setHex(e.target.value)}
          onBlur={() => {
            const v = (hex ?? "").trim().replace(/^#?/, "#");
            if (/^#[0-9a-fA-F]{6}$/.test(v)) custom(v.toLowerCase());
            setHex(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="h-8 w-[84px] shrink-0 rounded-full border border-border bg-surface-2 px-3 font-mono text-[12px] outline-none"
        />
        {recent.colors.map((c) => (
          <Dot key={`r${c}`} color={c} active={value === c} onClick={() => props.onChange(c)} />
        ))}
      </div>
      <div className="no-scrollbar grid auto-cols-max grid-flow-col grid-rows-2 gap-2 overflow-x-auto pb-0.5">
        {(props.colors ?? SWATCHES).map((c) => (
          <Dot key={c} color={c} active={value === c} onClick={() => props.onChange(c)} />
        ))}
      </div>
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
