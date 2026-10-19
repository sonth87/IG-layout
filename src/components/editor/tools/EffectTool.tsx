"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { EFFECT_BY_ID, EFFECT_GROUPS, EFFECTS, type EffectGroup, effectParams, type ElementEffect, newEffect, type ParamSpec } from "@/lib/effects/catalog";
import { useEditor, useViewDoc } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";
import { effectPreview, roughFor } from "../canvas/useFx";
import { Slider, ToolSheet } from "./controls";

// Effects sheet (editor-v2/14): groups, a preview of each effect on this very element,
// then the settings of the chosen one. One effect per element; ✓ is one undo step.

const ARROWS: Record<number, string> = { 0: "→", 45: "↘", 90: "↓", 135: "↙", 180: "←", 225: "↖", 270: "↑", 315: "↗" };
const PRESETS = ["#000000", "#ffffff", "#ff4f8b", "#ffd23f", "#2f80ed", "#34c759", "#ff9500", "#af52de", "#1d1a6b", "#ff7eb6"];

export function EffectTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const lang = (p: [string, string]) => p[locale === "vi" ? 1 : 0];
  const el = useViewDoc()?.elements.find((e) => e.id === elementId);
  const canvas = useEditor((s) => s.canvas);
  const current = el?.effect;
  const [group, setGroup] = useState<EffectGroup>(() => (current && EFFECT_BY_ID[current.id]?.group) || "distort");
  const [more, setMore] = useState(false);

  // Previews: the element without its effect, then with each effect at its defaults.
  const plainKey = el ? JSON.stringify({ ...el, x: 0, y: 0, rotation: 0, effect: undefined }) : "";
  const previews = useMemo(() => {
    const node = el && canvas?.layer.getStage()?.findOne(`#${el.id}`);
    if (!node || !el) return {} as Record<string, string>;
    const plain = { ...el, effect: undefined };
    const out: Record<string, string> = { none: effectPreview(node, plain, null, 120) };
    for (const e of EFFECTS.filter((x) => x.group === group && (!x.only || x.only.includes(el.type as "image")))) {
      try {
        out[e.id] = effectPreview(node, plain, newEffect(e.id), 120);
      } catch {
        // A preview that cannot be drawn just shows the name.
      }
    }
    return out;
    // plainKey stands for el.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainKey, group, canvas]);

  if (!el) return null;
  /** Effects this kind of element takes. */
  const fits = (e: (typeof EFFECTS)[number]) => !e.only || e.only.includes(el.type as "image");
  const set = (effect: ElementEffect | undefined) => {
    const st = useEditor.getState();
    if (!st.draft) st.beginDraft();
    st.patchDraft(el.id, { effect });
  };
  const spec = current ? EFFECT_BY_ID[current.id] : undefined;
  const values = current ? effectParams(current) : {};
  const setParam = (key: string, v: number | string | boolean) => {
    if (!current) return;
    // Quick, rough drawing while a slider moves; sharp once it rests.
    roughFor();
    set({ ...current, params: { ...current.params, [key]: v } });
  };

  const control = (p: ParamSpec) => {
    const label = lang(p.label);
    if (p.type === "range")
      return <Slider key={p.key} label={label} value={Number(values[p.key])} min={p.min} max={p.max} step={p.step ?? 1} defaultValue={p.def} format={(v) => `${v}${p.unit ?? ""}`} onChange={(v) => setParam(p.key, v)} />;
    if (p.type === "dir") {
      const dirs = p.only ?? [270, 315, 0, 45, 90, 135, 180, 225];
      return (
        <div key={p.key} className="flex items-center gap-2 py-2 text-[13px]">
          <span className="w-24 shrink-0 text-muted">{label}</span>
          <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
            {dirs.map((d) => (
              <button key={d} type="button" role="radio" aria-checked={Number(values[p.key]) === d} aria-label={`${label} ${ARROWS[d]}`} onClick={() => setParam(p.key, d)} className={`flex h-9 w-9 items-center justify-center rounded-full text-[18px] font-bold ${Number(values[p.key]) === d ? "bg-accent text-black" : "bg-black/5 dark:bg-white/10"}`}>
                {ARROWS[d]}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (p.type === "select")
      return (
        <div key={p.key} className="flex items-center gap-2 py-2 text-[13px]">
          <span className="w-24 shrink-0 text-muted">{label}</span>
          <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
            {p.options.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={values[p.key] === o.id} onClick={() => setParam(p.key, o.id)} className={`h-9 rounded-full px-3 text-[13px] font-semibold ${values[p.key] === o.id ? "bg-accent text-black" : "bg-black/5 dark:bg-white/10"}`}>
                {lang(o.label)}
              </button>
            ))}
          </div>
        </div>
      );
    if (p.type === "color")
      return (
        <div key={p.key} className="flex items-center gap-2 py-2 text-[13px]">
          <span className="w-24 shrink-0 text-muted">{label}</span>
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {PRESETS.map((c) => (
              <button key={c} type="button" aria-label={c} aria-pressed={String(values[p.key]).toLowerCase() === c} onClick={() => setParam(p.key, c)} style={{ background: c }} className={`h-8 w-8 shrink-0 rounded-full border border-black/15 ${String(values[p.key]).toLowerCase() === c ? "ring-2 ring-accent ring-offset-2" : ""}`} />
            ))}
            <input type="color" aria-label={label} value={String(values[p.key])} onChange={(e) => setParam(p.key, e.target.value)} className="h-8 w-10 shrink-0 cursor-pointer rounded-md border-0 bg-transparent" />
          </div>
        </div>
      );
    return (
      <label key={p.key} className="flex items-center gap-2 py-2 text-[13px]">
        <span className="w-24 shrink-0 text-muted">{label}</span>
        <input type="checkbox" checked={!!values[p.key]} onChange={(e) => setParam(p.key, e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
      </label>
    );
  };

  const tile = (id: string, name: string, on: boolean, onClick: () => void) => (
    <button key={id} type="button" aria-label={name} aria-pressed={on} onClick={onClick} className={`flex flex-col items-stretch gap-1 rounded-[14px] p-1.5 ${on ? "bg-accent/25 ring-2 ring-accent" : "bg-black/5 dark:bg-white/10"}`}>
      <span className="flex h-16 items-center justify-center overflow-hidden" style={{ backgroundImage: "repeating-conic-gradient(#0000000d 0 25%, transparent 0 50%)", backgroundSize: "12px 12px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn on a canvas */}
        {previews[id] && <img src={previews[id]} alt="" className="max-h-full max-w-full object-contain" />}
      </span>
      <span className="truncate text-center text-[11px] font-semibold opacity-75">{name}</span>
    </button>
  );

  const main = spec?.params.filter((p) => !p.more) ?? [];
  const extra = spec?.params.filter((p) => p.more) ?? [];

  return (
    <ToolSheet
      title={t("tool.effect")}
      onApply={() => {
        useEditor.getState().applyDraft();
        onClose();
      }}
      onCancel={() => {
        useEditor.getState().cancelDraft();
        onClose();
      }}
    >
      <div className="max-h-[50dvh] overflow-y-auto overscroll-contain px-4">
        <div role="tablist" aria-label={t("tool.effect")} className="no-scrollbar -mx-4 mb-2 flex gap-1.5 overflow-x-auto px-4">
          {EFFECT_GROUPS.map((g) => (
            <button key={g.id} type="button" role="tab" aria-selected={group === g.id} onClick={() => setGroup(g.id)} className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold ${group === g.id ? "bg-text text-surface" : "bg-black/5 dark:bg-white/10"}`}>
              {lang(g.name)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {tile("none", t("effect.none"), !current, () => set(undefined))}
          {EFFECTS.filter((e) => e.group === group && fits(e)).map((e) => tile(e.id, lang(e.name), current?.id === e.id, () => current?.id !== e.id && set(newEffect(e.id))))}
        </div>
        {spec && current && (
          <section aria-label={lang(spec.name)} className="mt-3 border-t border-black/5 pt-2 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold">{lang(spec.name)}</h3>
              <div className="flex gap-1">
                {spec.random && (
                  <button type="button" onClick={() => set({ ...current, seed: (current.seed ?? 1) + 1 })} className="flex h-9 items-center gap-1 rounded-full bg-black/5 px-3 text-[13px] font-semibold dark:bg-white/10">
                    🎲 {t("effect.shuffle")}
                  </button>
                )}
                <button type="button" onClick={() => set({ ...current, params: {} })} className="flex h-9 items-center gap-1 rounded-full bg-black/5 px-3 text-[13px] font-semibold dark:bg-white/10">
                  <Icon name="reset" size={16} /> {t("effect.reset")}
                </button>
              </div>
            </div>
            {main.map(control)}
            {extra.length > 0 && (
              <>
                <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="mt-1 flex h-9 items-center gap-1 text-[13px] font-semibold text-muted">
                  <Icon name={more ? "arrowUp" : "arrowDown"} size={16} /> {t("effect.more")}
                </button>
                {more && extra.map(control)}
              </>
            )}
          </section>
        )}
      </div>
    </ToolSheet>
  );
}
