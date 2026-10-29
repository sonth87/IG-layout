"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { TextElement } from "@ig-layout/core/project/types";
import { fontInfo } from "@ig-layout/core/text/fonts";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, Swatches } from "./controls";
import { FontPicker } from "./TextTools";

// Text sheets of the typing session (M19, editor-v2/10 §3–4). They change the editing
// draft; the whole session is recorded as one step when typing ends.

function useText(id: string) {
  const el = useViewDoc()?.elements.find((e) => e.id === id);
  const patch = (p: Partial<TextElement>) => useEditor.getState().patchDraft(id, p);
  return { el: el?.type === "text" ? el : undefined, patch };
}

const PANEL = "max-h-[44dvh] overflow-y-auto rounded-t-[22px] bg-surface px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]";

/** Format (§3): B I U S, then font, colour, size, spacing, outline, background. */
export function TextFormatPanel({ elementId }: { elementId: string }) {
  const t = useT();
  const { el, patch } = useText(elementId);
  const [panel, setPanel] = useState<"main" | "font" | "color" | "size" | "spacing" | "outline" | "background">("main");
  if (!el) return null;
  const weight = el.weight ?? (el.bold ? 700 : 400);
  const toggles: [string, string, boolean, Partial<TextElement>][] = [
    ["B", t("fmt.bold"), weight >= 600, { bold: weight < 600, weight: weight < 600 ? 700 : 400 }],
    ["I", t("fmt.italic"), !!el.italic, { italic: !el.italic }],
    ["U", t("fmt.underline"), !!el.underline, { underline: !el.underline }],
    ["S", t("fmt.strike"), !!el.strike, { strike: !el.strike }],
  ];
  const row = (to: typeof panel, label: string, value: React.ReactNode) => (
    <button key={to} type="button" onClick={() => setPanel(to)} className="flex h-11 w-full items-center justify-between border-t border-border text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-2 text-muted">
        {value}
        <Icon name="chevronRight" size={16} />
      </span>
    </button>
  );
  return (
    <section aria-label={t("type.format")} className={PANEL}>
      {panel !== "main" && (
        <button type="button" onClick={() => setPanel("main")} className="mb-1 flex h-9 items-center gap-1 text-[13px] text-muted">
          <Icon name="back" size={18} />
          {t("type.format")}
        </button>
      )}
      {panel === "main" && (
        <>
          <div className="flex gap-2 pb-2">
            {toggles.map(([key, label, on, p]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                aria-pressed={on}
                onClick={() => patch(p)}
                className={`h-11 flex-1 rounded-xl text-[17px] ${on ? "bg-text text-bg" : "bg-surface-2"}`}
                style={{
                  fontWeight: key === "B" ? 800 : 500,
                  fontStyle: key === "I" ? "italic" : undefined,
                  textDecoration: key === "U" ? "underline" : key === "S" ? "line-through" : undefined,
                }}
              >
                {key}
              </button>
            ))}
          </div>
          {row("font", t("fmt.font"), <span style={{ fontFamily: fontInfo(el.font).family }}>{fontInfo(el.font).label}</span>)}
          {row("color", t("fmt.color"), <span className="h-5 w-5 rounded-full border border-border-2" style={{ background: el.color }} />)}
          {row("size", t("fmt.size"), `${Math.round(el.fontSize)} px`)}
          {row("spacing", t("fmt.spacing"), `${Math.round(el.letterSpacing)} · ${Math.round(el.lineHeight * 100)} %`)}
          {row("outline", t("fmt.outline"), `${Math.round(el.stroke?.width ?? 0)}`)}
          {row("background", t("fmt.background"), el.background ? "●" : "—")}
        </>
      )}
      {panel === "font" && <FontPicker el={el} patch={patch} />}
      {panel === "color" && <Swatches value={el.color} gradient onChange={(color) => patch({ color })} />}
      {panel === "size" && <Slider label={t("fmt.size")} value={Math.round(el.fontSize)} min={16} max={400} defaultValue={97} onChange={(v) => patch({ fontSize: v })} />}
      {panel === "spacing" && (
        <>
          <Slider label={t("text.spacing")} value={Math.round(el.letterSpacing)} min={-10} max={60} defaultValue={0} onChange={(v) => patch({ letterSpacing: v })} />
          <Slider label={t("text.lineHeight")} value={Math.round(el.lineHeight * 100)} min={80} max={200} step={5} defaultValue={115} format={(v) => `${v}%`} onChange={(v) => patch({ lineHeight: v / 100 })} />
        </>
      )}
      {panel === "outline" && (
        <>
          <Slider label={t("text.stroke")} value={Math.round(el.stroke?.width ?? 0)} min={0} max={24} defaultValue={0} onChange={(v) => patch({ stroke: v > 0 ? { color: el.stroke?.color ?? "#111111", width: v } : null })} />
          <Swatches value={el.stroke?.color ?? "#111111"} onChange={(color) => patch({ stroke: { width: Math.max(el.stroke?.width ?? 0, 4), color } })} />
        </>
      )}
      {panel === "background" && (
        <>
          <label className="flex items-center justify-between py-2 text-sm">
            <span>{t("fmt.background")}</span>
            <input
              type="checkbox"
              checked={!!el.background}
              onChange={(e) => patch({ background: e.target.checked ? { color: "#111111", padding: el.fontSize * 0.3, radius: el.fontSize * 0.2 } : null })}
              className="h-[22px] w-[22px] accent-accent"
            />
          </label>
          {el.background && (
            <>
              <Swatches value={el.background.color.slice(0, 7)} onChange={(color) => patch({ background: { ...el.background!, color } })} />
              <Slider label={t("tool.corner")} value={Math.round(el.background.radius)} min={0} max={Math.round(el.fontSize)} defaultValue={Math.round(el.fontSize * 0.2)} onChange={(v) => patch({ background: { ...el.background!, radius: v } })} />
            </>
          )}
          <label className="flex items-center justify-between py-2 text-sm">
            <span>{t("fmt.shadow")}</span>
            <input type="checkbox" checked={el.shadow} onChange={(e) => patch({ shadow: e.target.checked })} className="h-[22px] w-[22px] accent-accent" />
          </label>
        </>
      )}
    </section>
  );
}

/** Align (§4): left, centre, right, justified. */
export function TextAlignPanel({ elementId }: { elementId: string }) {
  const t = useT();
  const { el, patch } = useText(elementId);
  if (!el) return null;
  const options: [TextElement["align"], IconName][] = [
    ["left", "alignLeft"],
    ["center", "alignCenter"],
    ["right", "alignRight"],
    ["justify", "alignJustify"],
  ];
  return (
    <section aria-label={t("type.align")} className={PANEL}>
      <div role="radiogroup" aria-label={t("text.align")} className="flex gap-2">
        {options.map(([a, icon]) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={el.align === a}
            aria-label={t(`text.align.${a}`)}
            onClick={() => patch({ align: a })}
            className={`flex h-12 flex-1 items-center justify-center rounded-xl ${el.align === a ? "bg-text text-bg" : "bg-surface-2"}`}
          >
            <Icon name={icon} />
          </button>
        ))}
      </div>
    </section>
  );
}
