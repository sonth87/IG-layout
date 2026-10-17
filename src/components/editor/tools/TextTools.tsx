"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { FONT_KEYS, type TextElement } from "@/lib/project/types";
import { FONT_CATEGORIES, type FontCategory, fontWeight, nearestWeight, TEXT_FONTS } from "@/lib/text/fonts";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, Swatches, ToolSheet } from "./controls";

interface ToolProps {
  elementId: string;
  onClose: () => void;
}

function useDraftText(id: string) {
  const el = useViewDoc()?.elements.find((e) => e.id === id);
  const updateDraft = useEditor((s) => s.updateDraft);
  const patch = (p: Partial<TextElement>) => updateDraft((d) => updateEl(d, id, p));
  return { el: el?.type === "text" ? el : undefined, patch };
}

type Tab = "font" | "style" | "color" | "effects";

/** Text styling (wireframe 11). Edits a draft: ✕ / ✓. */
export function TextTool({ elementId, onClose }: ToolProps) {
  const t = useT();
  const { el, patch } = useDraftText(elementId);
  const applyDraft = useEditor((s) => s.applyDraft);
  const cancelDraft = useEditor((s) => s.cancelDraft);
  const [tab, setTab] = useState<Tab>("font");
  if (!el) return null;
  const toggle = (on: boolean) => (on ? "bg-text font-bold text-bg" : "border border-border");

  return (
    <ToolSheet
      title={t("tool.text")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div role="tablist" className="mb-2 flex gap-5 border-b border-border">
        {(["font", "style", "color", "effects"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`h-10 text-sm ${tab === k ? "border-b-2 border-accent font-bold" : "text-muted"}`}
          >
            {t(`text.tab.${k}`)}
          </button>
        ))}
      </div>

      {tab === "font" && <FontPicker el={el} patch={patch} />}

      {tab === "style" && (
        <>
          <div className="flex items-center gap-2 py-1">
            <button
              type="button"
              aria-pressed={fontWeight(el) >= 600}
              onClick={() => {
                const bold = fontWeight(el) < 600;
                patch({ bold, weight: nearestWeight(el.font, bold ? 700 : 400) });
              }}
              className={`h-10 rounded-xl px-4 text-sm font-bold ${toggle(fontWeight(el) >= 600)}`}
            >
              B
            </button>
            <div role="radiogroup" aria-label={t("text.align")} className="flex gap-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={el.align === a}
                  aria-label={t(`text.align.${a}`)}
                  onClick={() => patch({ align: a })}
                  className={`flex h-10 w-11 items-center justify-center rounded-xl ${toggle(el.align === a)}`}
                >
                  <Icon name={`align${a[0].toUpperCase()}${a.slice(1)}` as "alignLeft"} size={18} />
                </button>
              ))}
            </div>
          </div>
          <Slider label={t("text.size")} value={Math.round(el.fontSize)} min={16} max={400} defaultValue={97} onChange={(v) => patch({ fontSize: v })} />
          <Slider label={t("text.spacing")} value={Math.round(el.letterSpacing)} min={-10} max={60} defaultValue={0} onChange={(v) => patch({ letterSpacing: v })} />
          <Slider
            label={t("text.lineHeight")}
            value={Math.round(el.lineHeight * 100)}
            min={80}
            max={200}
            step={5}
            defaultValue={115}
            format={(v) => (v / 100).toFixed(2)}
            onChange={(v) => patch({ lineHeight: v / 100 })}
          />
        </>
      )}

      {tab === "color" && <Swatches value={el.color} onChange={(color) => patch({ color })} />}

      {tab === "effects" && (
        <>
          <Slider
            label={t("text.stroke")}
            value={Math.round(el.stroke?.width ?? 0)}
            min={0}
            max={24}
            defaultValue={0}
            onChange={(v) => patch({ stroke: v > 0 ? { color: el.stroke?.color ?? "#111111", width: v } : null })}
          />
          {el.stroke && <Swatches value={el.stroke.color} onChange={(color) => patch({ stroke: { ...el.stroke!, color } })} />}
          <label className="flex items-center justify-between py-2 text-sm">
            <span>{t("tool.shadow")}</span>
            <input type="checkbox" checked={el.shadow} onChange={(e) => patch({ shadow: e.target.checked })} className="h-[22px] w-[22px] accent-accent" />
          </label>
          <label className="flex items-center justify-between py-2 text-sm">
            <span>{t("text.background")}</span>
            <input
              type="checkbox"
              checked={!!el.background}
              onChange={(e) =>
                patch({ background: e.target.checked ? { color: "#111111", padding: el.fontSize * 0.3, radius: el.fontSize * 0.2 } : null })
              }
              className="h-[22px] w-[22px] accent-accent"
            />
          </label>
          {el.background && (
            <>
              <Swatches value={el.background.color} onChange={(color) => patch({ background: { ...el.background!, color } })} />
              <Slider
                label={t("tool.corner")}
                value={Math.round(el.background.radius)}
                min={0}
                max={Math.round(el.fontSize)}
                defaultValue={Math.round(el.fontSize * 0.2)}
                onChange={(v) => patch({ background: { ...el.background!, radius: v } })}
              />
            </>
          )}
        </>
      )}
    </ToolSheet>
  );
}

/** Edit the words of a text element in a real text box (phone keyboard). One history step. */
export function TextEditDialog({ elementId, onClose }: ToolProps) {
  const t = useT();
  const el = useViewDoc()?.elements.find((e) => e.id === elementId);
  const updateElement = useEditor((s) => s.updateElement);
  const [value, setValue] = useState(el?.type === "text" ? el.text : "");
  if (el?.type !== "text") return null;

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/60">
      <div role="dialog" aria-modal="true" aria-label={t("text.edit")} className="rounded-t-[20px] bg-surface px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pb-2">
          <button type="button" onClick={onClose} className="h-10 px-2 text-sm font-semibold">
            {t("common.cancel")}
          </button>
          <h2 className="text-[15px] font-bold">{t("text.edit")}</h2>
          <button
            type="button"
            onClick={() => {
              const text = value.trim() ? value : el.text;
              if (text !== el.text) updateElement(el.id, { text });
              onClose();
            }}
            className="h-10 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent"
          >
            {t("common.done")}
          </button>
        </div>
        <textarea
          autoFocus
          aria-label={t("text.edit")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => e.target.select()}
          rows={4}
          className="w-full rounded-xl border border-border bg-surface-2 p-3 text-lg outline-none focus:border-accent"
          style={{ fontFamily: TEXT_FONTS[el.font].family, fontWeight: fontWeight(el) }}
        />
      </div>
    </div>
  );
}

/**
 * Font list (M11, S12): category chips, each font shown in itself, then the weight.
 * Off-screen rows are not rendered (content-visibility), so their font files are not
 * fetched until scrolled to.
 */
export function FontPicker({ el, patch }: { el: TextElement; patch: (p: Partial<TextElement>) => void }) {
  const t = useT();
  const [category, setCategory] = useState<FontCategory>(TEXT_FONTS[el.font].category);
  const keys = FONT_KEYS.filter((k) => TEXT_FONTS[k].category === category);
  const weights = TEXT_FONTS[el.font].weights;
  const weight = fontWeight(el);
  const setWeight = (w: number) => patch({ weight: w, bold: w >= 600 });

  return (
    <>
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {FONT_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`h-8 shrink-0 rounded-full px-3 text-[13px] ${category === c ? "bg-text font-semibold text-bg" : "border border-border"}`}
          >
            {t(`font.category.${c}`)}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label={t("text.tab.font")} className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={el.font === key}
            aria-label={TEXT_FONTS[key].label}
            onClick={() => patch({ font: key, weight: nearestWeight(key, weight) })}
            style={{ contentVisibility: "auto", containIntrinsicSize: "auto 56px" }}
            className={`flex h-14 flex-col items-start justify-center rounded-xl px-3 ${
              el.font === key ? "border-2 border-accent bg-accent-soft" : "border border-border bg-surface-2"
            }`}
          >
            <span style={{ fontFamily: TEXT_FONTS[key].family, fontWeight: nearestWeight(key, 600) }} className="truncate text-lg leading-tight">
              Đà Lạt
            </span>
            <span className="max-w-full truncate text-[11px] text-muted">{TEXT_FONTS[key].label}</span>
          </button>
        ))}
      </div>
      {Array.isArray(weights) ? (
        weights.length > 1 && (
          <div role="radiogroup" aria-label={t("text.weight")} className="flex flex-wrap gap-1.5 pt-2.5">
            {weights.map((w) => (
              <button
                key={w}
                type="button"
                role="radio"
                aria-checked={weight === w}
                onClick={() => setWeight(w)}
                style={{ fontFamily: TEXT_FONTS[el.font].family, fontWeight: w }}
                className={`h-9 min-w-11 rounded-lg px-2 text-sm ${weight === w ? "bg-text text-bg" : "border border-border"}`}
              >
                {w}
              </button>
            ))}
          </div>
        )
      ) : (
        <Slider label={t("text.weight")} value={weight} min={weights.min} max={weights.max} step={10} defaultValue={nearestWeight(el.font, 400)} onChange={setWeight} />
      )}
    </>
  );
}
