"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_GRADIENTS, type Gradient, gradientCss, isGradient, mainColor, parseGradient } from "@/lib/color/paint";
import { useBrand } from "@/lib/storage/library";
import { useT } from "@/store/settings";

// Colour picker (owner, 2026-10-20): one round swatch with the chosen colour; tapping it
// opens a panel — Solid / Gradient tabs, each with Custom, Saved and Default — and an
// eyedropper with a magnifier that picks a colour from the canvas.

export const SWATCHES = [
  "#ffffff", "#f2f2f2", "#d9d9d9", "#b3b3b3", "#808080", "#4d4d4d", "#111111", "#000000",
  "#e53935", "#fb8c00", "#fdd835", "#43a047", "#00acc1", "#1e88e5", "#8e24aa", "#d81b60",
  "#8e1c1c", "#b85c00", "#b8a000", "#1b5e20", "#006064", "#0d47a1", "#4a148c", "#880e4f",
  "#ffcdd2", "#ffe0b2", "#fff9c4", "#c8e6c9", "#b2ebf2", "#bbdefb", "#e1bee7", "#f8bbd0",
  "#f3e3c3", "#e9e4da", "#d9728a", "#f2b84b", "#9dbf8e", "#6e8fb3", "#8e8fc9", "#3b2f25",
];

// ---------------------------------------------------------------- saved paints

const SAVED_KEY = "ig-layout:saved-colors";
const SAVED_GRAD_KEY = "ig-layout:saved-gradients";
const OLD_RECENT_KEY = "ig-layout:colors";

function load(key: string, fallbackKey?: string): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(key) ?? (fallbackKey ? localStorage.getItem(fallbackKey) : null);
    return (JSON.parse(raw ?? "[]") as string[]).slice(0, 30);
  } catch {
    return [];
  }
}
function store(key: string, list: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage blocked: the list just won't survive a reload.
  }
}

/** Colours and gradients the user saved on this device (the old "recent" colours come along). */
export const useSaved = create<{ colors: string[]; gradients: string[]; save: (p: string) => void; remove: (p: string) => void }>()((set, get) => ({
  colors: load(SAVED_KEY, OLD_RECENT_KEY),
  gradients: load(SAVED_GRAD_KEY),
  save: (p) => {
    if (isGradient(p)) {
      const gradients = [p, ...get().gradients.filter((x) => x !== p)].slice(0, 30);
      set({ gradients });
      store(SAVED_GRAD_KEY, gradients);
    } else {
      const colors = [p.toLowerCase(), ...get().colors.filter((x) => x !== p.toLowerCase())].slice(0, 30);
      set({ colors });
      store(SAVED_KEY, colors);
    }
  },
  remove: (p) => {
    const colors = get().colors.filter((x) => x !== p);
    const gradients = get().gradients.filter((x) => x !== p);
    set({ colors, gradients });
    store(SAVED_KEY, colors);
    store(SAVED_GRAD_KEY, gradients);
  },
}));

// ---------------------------------------------------------------- eyedropper state

/** The eyedropper: while on, sheets and menus hide and a magnifier picks from the canvas. */
export const useEyedropper = create<{ active: boolean; pick: ((hex: string) => void) | null; start: (pick: (hex: string) => void) => void; finish: (hex?: string) => void }>()((set, get) => ({
  active: false,
  pick: null,
  start: (pick) => set({ active: true, pick }),
  finish: (hex) => {
    const pick = get().pick;
    set({ active: false, pick: null });
    if (hex && pick) pick(hex);
  },
}));

// ---------------------------------------------------------------- colour maths

function hexToHsv(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, max ? d / max : 0, max];
}

function hsvToHex(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))));
  };
  return `#${[f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

const validHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

// ---------------------------------------------------------------- pieces

/** Saturation / brightness square plus a hue bar, and the HEX. */
function CustomColor({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const t = useT();
  const [hsv, setHsv] = useState(() => hexToHsv(validHex(value) ? value : "#ff0000"));
  const [hex, setHex] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const emit = (next: [number, number, number]) => {
    setHsv(next);
    onChange(hsvToHex(...next));
  };
  const moveSV = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    emit([hsv[0], s, v]);
  };
  const shown = hsvToHex(...hsv);
  return (
    <div className="flex flex-col gap-2.5">
      <div
        ref={box}
        role="slider"
        aria-label={t("color.shade")}
        aria-valuenow={Math.round(hsv[1] * 100)}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          moveSV(e);
        }}
        onPointerMove={(e) => e.buttons && moveSV(e)}
        className="relative h-36 touch-none rounded-xl"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(hsv[0], 1, 1)})` }}
      >
        <span className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${hsv[1] * 100}%`, bottom: `${hsv[2] * 100}%`, background: shown }} />
      </div>
      <input
        type="range"
        aria-label={t("color.hue")}
        min={0}
        max={359}
        value={Math.round(hsv[0])}
        onChange={(e) => emit([Number(e.target.value), hsv[1] || 0.9, hsv[2] || 0.9])}
        className="hue-range h-3 w-full cursor-pointer appearance-none rounded-full"
        style={{ background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
      />
      <input
        aria-label="HEX"
        value={hex ?? shown}
        onChange={(e) => setHex(e.target.value)}
        onBlur={() => {
          const v = (hex ?? "").trim().replace(/^#?/, "#").toLowerCase();
          if (validHex(v)) emit(hexToHsv(v));
          setHex(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="h-9 w-28 rounded-full border border-border bg-surface-2 px-3 font-mono text-[16px] outline-none"
      />
    </div>
  );
}

function Chip({ paint, active, label, onClick, onRemove }: { paint: string; active: boolean; label?: string; onClick: () => void; onRemove?: () => void }) {
  return (
    <span className="relative shrink-0">
      <button
        type="button"
        aria-label={label ?? paint}
        aria-pressed={active}
        onClick={onClick}
        className={`block h-9 w-9 rounded-full border border-black/15 ${active ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
        style={{ background: paint }}
      />
      {onRemove && (
        <button type="button" aria-label={`× ${label ?? paint}`} onClick={onRemove} className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-text text-[11px] font-bold text-surface">
          ×
        </button>
      )}
    </span>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[12px] font-bold tracking-wide text-muted uppercase">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Gradient editor: linear / radial, angle, 2–4 stops (each edited with the colour square). */
function CustomGradient({ value, onChange }: { value: Gradient; onChange: (g: Gradient) => void }) {
  const t = useT();
  const [stop, setStop] = useState(0);
  const g = value;
  const i = Math.min(stop, g.stops.length - 1);
  return (
    <div className="flex flex-col gap-3">
      <div className="h-10 rounded-xl border border-black/10" style={{ background: gradientCss(g) }} />
      <div role="radiogroup" aria-label={t("color.gradientKind")} className="flex gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
        {(["linear", "radial"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={g.kind === k} onClick={() => onChange({ ...g, kind: k })} className={`h-8 flex-1 rounded-full text-[13px] font-semibold ${g.kind === k ? "bg-surface shadow" : "opacity-70"}`}>
            {t(k === "linear" ? "color.linear" : "color.radial")}
          </button>
        ))}
      </div>
      {g.kind === "linear" && (
        <label className="flex items-center gap-2 text-[13px]">
          <span className="w-16 shrink-0 text-muted">{t("color.angle")}</span>
          <input type="range" min={0} max={360} value={g.angle} onChange={(e) => onChange({ ...g, angle: Number(e.target.value) })} className="flex-1" />
          <span className="w-10 text-right tabular-nums">{Math.round(g.angle)}°</span>
        </label>
      )}
      <div className="flex items-center gap-2">
        {g.stops.map((s, n) => (
          <Chip key={n} paint={s} active={n === i} label={`${t("color.stop")} ${n + 1}`} onClick={() => setStop(n)} onRemove={g.stops.length > 2 && n === i ? () => onChange({ ...g, stops: g.stops.filter((_, k) => k !== n) }) : undefined} />
        ))}
        {g.stops.length < 4 && (
          <button type="button" aria-label={t("color.addStop")} onClick={() => onChange({ ...g, stops: [...g.stops, g.stops.at(-1)!] })} className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border-2">
            <Icon name="plus" size={18} />
          </button>
        )}
      </div>
      <CustomColor key={`${i}-${g.stops.length}`} value={g.stops[i]} onChange={(hex) => onChange({ ...g, stops: g.stops.map((s, n) => (n === i ? hex : s)) })} />
    </div>
  );
}

// ---------------------------------------------------------------- the panel

function Panel({ value, onChange, gradient, colors, onClose }: { value: string; onChange: (p: string) => void; gradient: boolean; colors?: string[]; onClose: () => void }) {
  const t = useT();
  const [tab, setTab] = useState<"solid" | "gradient">(gradient && isGradient(value) ? "gradient" : "solid");
  const [custom, setCustom] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const saved = useSaved();
  const brand = useBrand((s) => s.colors);
  const picking = useEyedropper((s) => s.active);
  const cur = value.toLowerCase();
  const grad = parseGradient(value) ?? { kind: "linear" as const, angle: 135, stops: [isGradient(value) ? "#ff7eb3" : validHex(value) ? value : "#ff7eb3", "#7ac6ff"] };

  return (
    <div
      role="dialog"
      aria-label={t("color.title")}
      className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-h-[78dvh] max-w-xl flex-col rounded-t-[22px] bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.2)]"
      style={{ visibility: picking ? "hidden" : undefined, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className="h-9 w-9 shrink-0 rounded-full border border-black/15" style={{ background: value }} />
        {gradient ? (
          <div role="tablist" aria-label={t("color.title")} className="flex flex-1 gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
            {(["solid", "gradient"] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-8 flex-1 rounded-full text-[13px] font-semibold ${tab === k ? "bg-surface shadow" : "opacity-70"}`}>
                {t(k === "solid" ? "color.solid" : "color.gradient")}
              </button>
            ))}
          </div>
        ) : (
          <h3 className="flex-1 text-[15px] font-bold">{t("color.title")}</h3>
        )}
        <button type="button" aria-label={t("color.eyedropper")} onClick={() => useEyedropper.getState().start((hex) => onChange(hex))} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
          <Icon name="pipette" size={20} />
        </button>
        <button type="button" aria-label={t("common.done")} onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black">
          <Icon name="check" size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-2">
        {tab === "solid" ? (
          <>
            <button type="button" aria-expanded={custom} onClick={() => setCustom(!custom)} className="flex h-10 items-center gap-2 self-start rounded-full bg-black/5 px-4 text-[14px] font-semibold dark:bg-white/10">
              <span className="h-5 w-5 rounded-full" style={{ background: "conic-gradient(#f28b82,#f2b84b,#9dbf8e,#7cc4f2,#8e8fc9,#f28b82)" }} />
              {t("color.custom")}
            </button>
            {custom && <CustomColor value={isGradient(value) ? mainColor(value) : value} onChange={onChange} />}
            <Section
              title={t("color.saved")}
              action={
                saved.colors.length > 0 && (
                  <button type="button" onClick={() => setEditSaved(!editSaved)} className="text-[12px] font-semibold text-muted">
                    {editSaved ? t("common.done") : t("color.edit")}
                  </button>
                )
              }
            >
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
                <button type="button" aria-label={t("color.save")} disabled={isGradient(value)} onClick={() => saved.save(value)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border-2 disabled:opacity-30">
                  <Icon name="plus" size={18} />
                </button>
                {brand.map((c) => (
                  <Chip key={`b${c}`} paint={c} active={cur === c.toLowerCase()} onClick={() => onChange(c)} />
                ))}
                {brand.length > 0 && saved.colors.length > 0 && <span className="h-6 w-px shrink-0 bg-border" />}
                {saved.colors.map((c) => (
                  <Chip key={c} paint={c} active={cur === c} onClick={() => onChange(c)} onRemove={editSaved ? () => saved.remove(c) : undefined} />
                ))}
              </div>
            </Section>
            <Section title={t("color.default")}>
              <div className="grid grid-cols-8 gap-2">
                {(colors ?? SWATCHES).map((c) => (
                  <Chip key={c} paint={c} active={cur === c} onClick={() => onChange(c)} />
                ))}
              </div>
            </Section>
          </>
        ) : (
          <>
            <button type="button" aria-expanded={custom} onClick={() => setCustom(!custom)} className="flex h-10 items-center gap-2 self-start rounded-full bg-black/5 px-4 text-[14px] font-semibold dark:bg-white/10">
              <span className="h-5 w-5 rounded-full" style={{ background: gradientCss(grad) }} />
              {t("color.customGradient")}
            </button>
            {custom && <CustomGradient value={grad} onChange={(g) => onChange(gradientCss(g))} />}
            <Section
              title={t("color.saved")}
              action={
                saved.gradients.length > 0 && (
                  <button type="button" onClick={() => setEditSaved(!editSaved)} className="text-[12px] font-semibold text-muted">
                    {editSaved ? t("common.done") : t("color.edit")}
                  </button>
                )
              }
            >
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
                <button type="button" aria-label={t("color.save")} disabled={!isGradient(value)} onClick={() => saved.save(value)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border-2 disabled:opacity-30">
                  <Icon name="plus" size={18} />
                </button>
                {saved.gradients.map((g) => (
                  <Chip key={g} paint={g} active={value === g} onClick={() => onChange(g)} onRemove={editSaved ? () => saved.remove(g) : undefined} />
                ))}
              </div>
            </Section>
            <Section title={t("color.default")}>
              <div className="grid grid-cols-6 gap-2">
                {DEFAULT_GRADIENTS.map((g) => (
                  <Chip key={g} paint={g} active={value === g} onClick={() => onChange(g)} />
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The colour control: one round swatch (and its HEX); tapping it opens the panel.
 * `gradient`: gradients may be picked too (where the element can draw them).
 */
export function ColorPicker(props: { value: string; onChange: (paint: string) => void; gradient?: boolean; colors?: string[]; label?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const label = props.label ?? t("tool.color");
  return (
    <>
      <button type="button" aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)} className="flex h-11 items-center gap-2.5 rounded-full py-1 pr-3 pl-1 text-[13px]">
        <span className="h-9 w-9 shrink-0 rounded-full border border-black/15 shadow-sm" style={{ background: props.value }} />
        <span className="font-mono text-muted">{isGradient(props.value) ? t("color.gradient") : props.value}</span>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div aria-hidden="true" className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
            <Panel value={props.value} onChange={props.onChange} gradient={!!props.gradient} colors={props.colors} onClose={() => setOpen(false)} />
          </>,
          document.body,
        )}
    </>
  );
}
