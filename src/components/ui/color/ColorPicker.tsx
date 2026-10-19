"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_GRADIENTS, type Gradient, gradientCss, isGradient, mainColor, parseGradient } from "@/lib/color/paint";
import { useBrand } from "@/lib/storage/library";
import { useT } from "@/store/settings";

// Colour picker (owner, 2026-10-20, laid out like the owner's reference screenshots): a row
// "Label ◉ ›" opens a bottom sheet — ‹ · Solid | Gradient · ✕; Custom colour; Brand colours
// (Edit, +); Saved; Defaults. Custom colour: hue bar, opacity bar, %, HEX, eyedropper.
// Gradient: stop bar, Stops (% and colour), Angle, Style (linear / radial / conic), Saved.

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
  const n = parseInt(hex.slice(1, 7), 16);
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

/** "#rrggbb" or "#rrggbbaa" (with opacity). */
const validHex = (v: string) => /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v);
const alphaOf = (hex: string) => (hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1);
const withAlpha = (hex6: string, a: number) => (a >= 0.995 ? hex6 : `${hex6}${Math.round(a * 255).toString(16).padStart(2, "0")}`);
const CHECKER = "repeating-conic-gradient(#d0d0d0 0 25%, #f4f4f4 0 50%) 0 0 / 14px 14px";

// ---------------------------------------------------------------- pieces

/** Round button of the sheet header (‹, ✕, eyedropper). */
function RoundButton({ label, icon, onClick }: { label: string; icon: "back" | "close" | "pipette"; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 active:scale-95">
      <Icon name={icon} size={22} />
    </button>
  );
}

function Header({ left, title, right }: { left?: React.ReactNode; title: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-3">
      <div className="w-11 shrink-0">{left}</div>
      <div className="flex min-w-0 flex-1 justify-center text-[16px] font-bold">{title}</div>
      <div className="w-11 shrink-0">{right}</div>
    </div>
  );
}

function Circle({ paint, active, label, onClick, onRemove }: { paint: string; active?: boolean; label?: string; onClick: () => void; onRemove?: () => void }) {
  return (
    <span className="relative flex justify-center">
      <button
        type="button"
        aria-label={label ?? paint}
        aria-pressed={!!active}
        onClick={onClick}
        className={`block aspect-square w-full max-w-11 rounded-full active:scale-95 ${active ? "ring-2 ring-text ring-offset-2 ring-offset-surface" : ""}`}
        style={{ background: alphaOf(paint) < 1 ? `linear-gradient(${paint}, ${paint}), ${CHECKER}` : paint }}
      />
      {onRemove && (
        <button type="button" aria-label={`× ${label ?? paint}`} onClick={onRemove} className="absolute -top-1 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-text text-[12px] font-bold text-surface">
          ×
        </button>
      )}
    </span>
  );
}

function PlusCircle({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <span className="flex justify-center">
      <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex aspect-square w-full max-w-11 items-center justify-center rounded-full bg-surface-2 disabled:opacity-30">
        <Icon name="plus" size={22} />
      </button>
    </span>
  );
}

function Section({ title, icon, action, children }: { title: string; icon?: "palette"; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[15px] font-bold">
          {icon && <Icon name={icon} size={18} />}
          {title}
        </h4>
        {action}
      </div>
      {children}
    </section>
  );
}

const Grid = ({ cols, children }: { cols: number; children: React.ReactNode }) => (
  <div className="grid gap-x-3 gap-y-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {children}
  </div>
);

/** A bar dragged along: calls `onAt` with 0..1. */
function useBarDrag(onAt: (u: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const at = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) onAt(Math.min(1, Math.max(0, (e.clientX - r.left - 18) / Math.max(1, r.width - 36))));
  };
  return {
    ref,
    onPointerDown: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      at(e);
    },
    onPointerMove: (e: React.PointerEvent) => e.buttons && at(e),
  };
}

const Knob = ({ u, color }: { u: number; color: string }) => (
  <span className="pointer-events-none absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md" style={{ left: `calc(18px + ${u} * (100% - 36px))`, background: color }} />
);

/** Pill showing a value; tap to type it. */
function ValuePill({ label, value, onCommit, width = "w-[88px]" }: { label: string; value: string; onCommit: (v: string) => void; width?: string }) {
  const [text, setText] = useState<string | null>(null);
  return (
    <input
      aria-label={label}
      value={text ?? value}
      onChange={(e) => setText(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => {
        if (text !== null) onCommit(text.trim());
        setText(null);
      }}
      onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
      className={`h-11 ${width} shrink-0 rounded-full bg-surface-2 px-3 text-center text-[16px] font-semibold tabular-nums outline-none focus:ring-2 focus:ring-accent`}
    />
  );
}

// ---------------------------------------------------------------- screens

type Screen = { kind: "main" } | { kind: "custom"; stop?: number } | { kind: "gradient" };

function BrandAndSaved({ value, onChange, plus, gradients }: { value: string; onChange: (p: string) => void; plus?: boolean; gradients?: boolean }) {
  const t = useT();
  const saved = useSaved();
  const brand = useBrand();
  const [edit, setEdit] = useState(false);
  const cur = value.toLowerCase();
  const list = gradients ? saved.gradients : saved.colors;
  return (
    <>
      {!gradients && (
        <Section
          title={t("color.brand")}
          icon="palette"
          action={
            brand.colors.length + saved.colors.length > 0 && (
              <button type="button" onClick={() => setEdit(!edit)} className="flex h-8 items-center gap-1 rounded-full bg-surface-2 px-3 text-[13px] font-semibold">
                <Icon name="pencil" size={14} />
                {edit ? t("common.done") : t("color.edit")}
              </button>
            )
          }
        >
          <Grid cols={7}>
            {brand.colors.map((c) => (
              <Circle key={c} paint={c} active={cur === c.toLowerCase()} onClick={() => onChange(c)} onRemove={edit ? () => brand.removeColor(c) : undefined} />
            ))}
            <PlusCircle label={t("color.addBrand")} disabled={isGradient(value)} onClick={() => brand.addColor(value)} />
          </Grid>
        </Section>
      )}
      {(list.length > 0 || plus) && (
        <Section title={t("color.saved")}>
          <Grid cols={7}>
            {list.map((c) => (
              <Circle key={c} paint={c} active={(gradients ? value : cur) === c} onClick={() => onChange(c)} onRemove={edit || (gradients && plus) ? () => saved.remove(c) : undefined} />
            ))}
            {plus && <PlusCircle label={t("color.save")} disabled={gradients ? !isGradient(value) : isGradient(value)} onClick={() => saved.save(value)} />}
          </Grid>
        </Section>
      )}
    </>
  );
}

function CustomColorScreen({ value, onChange, onBack }: { value: string; onChange: (hex: string) => void; onBack: () => void }) {
  const t = useT();
  const start = validHex(value) ? value.toLowerCase() : "#ff3b30";
  const [hsv, setHsv] = useState(() => hexToHsv(start));
  const [alpha, setAlpha] = useState(() => alphaOf(start));
  const hex6 = hsvToHex(...hsv);
  const emit = (next: [number, number, number], a = alpha) => {
    setHsv(next);
    setAlpha(a);
    onChange(withAlpha(hsvToHex(...next), a));
  };
  const hue = useBarDrag((u) => {
    // A grey or black has no hue to show: picking one makes it colourful.
    const [, s0, v0] = hsv;
    emit([u * 359, s0 < 0.08 ? 0.85 : s0, v0 < 0.12 ? 0.95 : v0]);
  });
  const opacity = useBarDrag((u) => emit(hsv, Math.round(u * 100) / 100));
  return (
    <>
      <Header
        left={<RoundButton label={t("common.back")} icon="back" onClick={onBack} />}
        title={t("color.customTitle")}
        right={<RoundButton label={t("color.eyedropper")} icon="pipette" onClick={() => useEyedropper.getState().start((hex) => emit(hexToHsv(hex), 1))} />}
      />
      <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-2">
        <div className="flex flex-col gap-3">
          <div
            {...hue}
            role="slider"
            aria-label={t("color.hue")}
            aria-valuenow={Math.round(hsv[0])}
            className="relative h-11 touch-none rounded-full"
            style={{ background: "linear-gradient(to right, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)" }}
          >
            <Knob u={hsv[0] / 359} color={hsvToHex(hsv[0], 1, 1)} />
          </div>
          <div className="flex items-center gap-2">
            <div {...opacity} role="slider" aria-label={t("color.opacity")} aria-valuenow={Math.round(alpha * 100)} className="relative h-11 flex-1 touch-none rounded-full" style={{ background: `linear-gradient(to right, ${hex6}00, ${hex6}), ${CHECKER}` }}>
              <Knob u={alpha} color={withAlpha(hex6, alpha)} />
            </div>
            <ValuePill
              label={t("color.opacity")}
              value={`${Math.round(alpha * 100)}%`}
              onCommit={(v) => {
                const n = parseFloat(v);
                if (Number.isFinite(n)) emit(hsv, Math.min(1, Math.max(0, n / 100)));
              }}
            />
            <ValuePill
              label="HEX"
              width="w-[112px]"
              value={hex6.toUpperCase()}
              onCommit={(v) => {
                const h = v.replace(/^#?/, "#").toLowerCase();
                if (validHex(h)) emit(hexToHsv(h), h.length === 9 ? alphaOf(h) : alpha);
              }}
            />
          </div>
        </div>
        <BrandAndSaved value={withAlpha(hex6, alpha)} onChange={(c) => emit(hexToHsv(c), alphaOf(c))} plus />
      </div>
    </>
  );
}

const STYLES: Gradient["kind"][] = ["linear", "radial", "conic"];

function GradientScreen({ value, onChange, onBack, onEditStop }: { value: Gradient; onChange: (g: Gradient) => void; onBack: () => void; onEditStop: (i: number) => void }) {
  const t = useT();
  const g = value;
  const [active, setActive] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const flat = gradientCss({ ...g, kind: "linear", angle: 90 });
  const posOf = (e: React.PointerEvent) => {
    const r = bar.current?.getBoundingClientRect();
    return r ? Math.min(1, Math.max(0, (e.clientX - r.left - 18) / Math.max(1, r.width - 36))) : 0;
  };
  const setStop = (i: number, patch: Partial<Gradient["stops"][number]>) => onChange({ ...g, stops: g.stops.map((s, n) => (n === i ? { ...s, ...patch } : s)) });
  return (
    <>
      <Header left={<RoundButton label={t("common.back")} icon="back" onClick={onBack} />} title={t("color.gradient")} />
      <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-2">
        <div
          ref={bar}
          role="group"
          aria-label={t("color.stops")}
          className="relative h-11 touch-none rounded-full"
          style={{ background: flat }}
          onPointerDown={(e) => {
            // On a stop: drag it; elsewhere: add one there (up to 5).
            const u = posOf(e);
            let i = g.stops.findIndex((s) => Math.abs(s.at - u) < 0.06);
            if (i < 0 && g.stops.length < 5) {
              const near = [...g.stops].sort((a, b) => Math.abs(a.at - u) - Math.abs(b.at - u))[0];
              onChange({ ...g, stops: [...g.stops, { color: near.color, at: u }] });
              i = g.stops.length;
            }
            setActive(Math.max(0, i));
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => e.buttons && setStop(active, { at: posOf(e) })}
        >
          {g.stops.map((s, i) => (
            <span key={i} className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-white shadow-md ${i === active ? "h-10 w-10 border-[3px]" : "h-8 w-8 border-2"}`} style={{ left: `calc(18px + ${s.at} * (100% - 36px))`, background: s.color }} />
          ))}
        </div>
        <Section title={t("color.stops")}>
          <div className="flex flex-col gap-2.5">
            {g.stops.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <ValuePill
                  label={`${t("color.stop")} ${i + 1} %`}
                  value={`${Math.round(s.at * 100)}%`}
                  onCommit={(v) => {
                    const n = parseFloat(v);
                    if (Number.isFinite(n)) setStop(i, { at: Math.min(1, Math.max(0, n / 100)) });
                  }}
                />
                <button
                  type="button"
                  aria-label={`${t("color.stop")} ${i + 1}`}
                  onClick={() => {
                    setActive(i);
                    onEditStop(i);
                  }}
                  className={`flex h-11 flex-1 items-center gap-3 rounded-full bg-surface-2 pr-4 pl-1.5 text-[16px] font-semibold ${i === active ? "ring-2 ring-text/30" : ""}`}
                >
                  <span className="h-8 w-8 rounded-full border border-black/10" style={{ background: s.color }} />
                  {s.color.slice(0, 7).toUpperCase()}
                </button>
                <button type="button" aria-label={`${t("color.removeStop")} ${i + 1}`} disabled={g.stops.length <= 2} onClick={() => onChange({ ...g, stops: g.stops.filter((_, n) => n !== i) })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-20">
                  <Icon name="minus" size={20} />
                </button>
              </div>
            ))}
          </div>
        </Section>
        {g.kind !== "radial" && (
          <Section title={t("color.angle")}>
            <div className="flex items-center gap-3">
              <input type="range" aria-label={t("color.angle")} min={0} max={360} value={g.angle} onChange={(e) => onChange({ ...g, angle: Number(e.target.value) })} className="flex-1 accent-text" />
              <ValuePill
                label={`${t("color.angle")} °`}
                value={`${Math.round(g.angle)}°`}
                onCommit={(v) => {
                  const n = parseFloat(v);
                  if (Number.isFinite(n)) onChange({ ...g, angle: ((n % 360) + 360) % 360 });
                }}
              />
            </div>
          </Section>
        )}
        <Section title={t("color.style")}>
          <div className="flex gap-3">
            {STYLES.map((k) => (
              <button key={k} type="button" aria-label={t(k === "linear" ? "color.linear" : k === "radial" ? "color.radial" : "color.conic")} aria-pressed={g.kind === k} onClick={() => onChange({ ...g, kind: k })} className={`h-14 w-20 rounded-xl ${g.kind === k ? "ring-[3px] ring-text" : ""}`} style={{ background: gradientCss({ ...g, kind: k }) }} />
            ))}
          </div>
        </Section>
        <BrandAndSaved value={gradientCss(g)} onChange={(p) => { const n = parseGradient(p); if (n) onChange(n); }} plus gradients />
      </div>
    </>
  );
}

function Panel({ value, onChange, gradient, colors, onClose }: { value: string; onChange: (p: string) => void; gradient: boolean; colors?: string[]; onClose: () => void }) {
  const t = useT();
  const [tab, setTab] = useState<"solid" | "gradient">(gradient && isGradient(value) ? "gradient" : "solid");
  const [screen, setScreen] = useState<Screen>({ kind: "main" });
  const picking = useEyedropper((s) => s.active);
  const saved = useSaved();
  const cur = value.toLowerCase();
  const fallback = validHex(value) ? value.slice(0, 7) : "#ffffff";
  const grad = parseGradient(value) ?? { kind: "linear" as const, angle: 90, stops: [{ color: fallback, at: 0 }, { color: "#0b00e6", at: 1 }] };

  let content: React.ReactNode;
  if (screen.kind === "custom") {
    const stop = screen.stop;
    content = (
      <CustomColorScreen
        key={stop ?? "solid"}
        value={stop === undefined ? (isGradient(value) ? mainColor(value) : value) : grad.stops[stop].color}
        onChange={(hex) => (stop === undefined ? onChange(hex) : onChange(gradientCss({ ...grad, stops: grad.stops.map((s, n) => (n === stop ? { ...s, color: hex } : s)) })))}
        onBack={() => setScreen(stop === undefined ? { kind: "main" } : { kind: "gradient" })}
      />
    );
  } else if (screen.kind === "gradient")
    content = <GradientScreen value={grad} onChange={(g) => onChange(gradientCss(g))} onBack={() => setScreen({ kind: "main" })} onEditStop={(i) => setScreen({ kind: "custom", stop: i })} />;
  else
    content = (
      <>
        <Header
          left={<RoundButton label={t("common.back")} icon="back" onClick={onClose} />}
          title={
            gradient ? (
              <div role="tablist" aria-label={t("color.title")} className="flex w-full gap-1">
                {(["solid", "gradient"] as const).map((k) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-11 flex-1 rounded-full text-[15px] font-semibold ${tab === k ? "bg-text text-surface" : ""}`}>
                    {t(k === "solid" ? "color.solid" : "color.gradient")}
                  </button>
                ))}
              </div>
            ) : (
              t("color.title")
            )
          }
          right={<RoundButton label={t("common.close")} icon="close" onClick={onClose} />}
        />
        <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-2">
          <button type="button" onClick={() => setScreen(tab === "solid" ? { kind: "custom" } : { kind: "gradient" })} className="flex h-12 items-center justify-center gap-2 rounded-full bg-surface-2 text-[16px] font-semibold active:scale-[0.99]">
            <Icon name="sliders" size={20} />
            {t(tab === "solid" ? "color.custom" : "color.customGradient")}
          </button>
          {tab === "solid" ? (
            <>
              <BrandAndSaved value={value} onChange={onChange} />
              <Section title={t("color.default")}>
                <Grid cols={8}>
                  {(colors ?? SWATCHES).map((c) => (
                    <Circle key={c} paint={c} active={cur === c} onClick={() => onChange(c)} />
                  ))}
                </Grid>
              </Section>
            </>
          ) : (
            <>
              {saved.gradients.length > 0 && (
                <Section title={t("color.saved")}>
                  <Grid cols={7}>
                    {saved.gradients.map((g) => (
                      <Circle key={g} paint={g} active={value === g} onClick={() => onChange(g)} />
                    ))}
                  </Grid>
                </Section>
              )}
              <Section title={t("color.default")}>
                <Grid cols={7}>
                  {DEFAULT_GRADIENTS.map((g) => (
                    <Circle key={g} paint={g} active={value === g} onClick={() => onChange(g)} />
                  ))}
                </Grid>
              </Section>
            </>
          )}
        </div>
      </>
    );

  return (
    <div
      role="dialog"
      aria-label={t("color.title")}
      className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-h-[80dvh] max-w-xl flex-col rounded-t-[28px] bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.25)]"
      style={{ visibility: picking ? "hidden" : undefined, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {content}
    </div>
  );
}

/**
 * The colour control: a row "Label ◉ ›" (like a settings row); tapping it opens the
 * colour sheet. `gradient`: gradients may be picked too (where the element can draw them).
 */
export function ColorPicker(props: { value: string; onChange: (paint: string) => void; gradient?: boolean; colors?: string[]; label?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const label = props.label ?? t("tool.color");
  return (
    <>
      <button type="button" aria-label={label} aria-haspopup="dialog" onClick={() => setOpen(true)} className="flex h-14 w-full items-center gap-3 text-left">
        <span className="flex-1 text-[15px] font-semibold">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-border-2">
          <span className="h-7 w-7 rounded-full" style={{ background: alphaOf(props.value) < 1 ? `linear-gradient(${props.value}, ${props.value}), ${CHECKER}` : props.value }} />
        </span>
        <Icon name="chevronRight" size={18} />
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
