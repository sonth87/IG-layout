"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { FONT_KEYS, type TextElement } from "@/lib/project/types";
import { TEXT_FONTS } from "@/lib/text/fonts";
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

      {tab === "font" && (
        <div role="radiogroup" aria-label={t("text.tab.font")} className="grid grid-cols-2 gap-2">
          {FONT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={el.font === key}
              onClick={() => patch({ font: key })}
              className={`flex h-16 flex-col items-start justify-center rounded-xl px-3 ${
                el.font === key ? "border-2 border-accent bg-accent-soft" : "border border-border bg-surface-2"
              }`}
            >
              <span style={{ fontFamily: TEXT_FONTS[key].family, fontWeight: 700 }} className="text-xl leading-tight">
                Đà Lạt
              </span>
              <span className="text-[11px] text-muted">{TEXT_FONTS[key].label}</span>
            </button>
          ))}
        </div>
      )}

      {tab === "style" && (
        <>
          <div className="flex items-center gap-2 py-1">
            <button
              type="button"
              aria-pressed={el.bold}
              onClick={() => patch({ bold: !el.bold })}
              className={`h-10 rounded-xl px-4 text-sm font-bold ${toggle(el.bold)}`}
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
          style={{ fontFamily: TEXT_FONTS[el.font].family, fontWeight: el.bold ? 700 : 400 }}
        />
      </div>
    </div>
  );
}
