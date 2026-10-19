"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  contentFields,
  fieldLabel,
  LONG_FIELDS,
  rowsOf,
  WIDGET_LISTS,
  WIDGET_PICKS,
  WIDGET_THEMES,
  WIDGET_VALUES,
  hasCard,
  WIDGET_ACCENT,
  WIDGET_VARIANTS,
  widgetSize,
  widgetThumb,
  widgetValue,
  withDate,
  withValue,
  type WidgetData,
} from "@/lib/elements/widgets";
import { useEditor, useViewDoc } from "@/store/editor";
import { type Locale, useSettings, useT } from "@/store/settings";
import { Slider, ToolSheet } from "./controls";
import { ColorPicker } from "@/components/ui/color/ColorPicker";
import { contrastInk, palette } from "@/lib/elements/widgetKit";

// Card widget sheets (D-114, D-118): each toolbar button of a widget opens one of these,
// doing just that job. ✕ cancels, ✓ is one undo step.

type Props = { elementId: string; onClose: () => void };
const INPUT = "w-full min-w-0 rounded-xl bg-black/5 px-3 py-2 text-[16px] outline-none focus:ring-2 focus:ring-accent dark:bg-white/10";
const lang = (pair: [string, string], locale: Locale) => pair[locale === "vi" ? 1 : 0];

/** The selected widget and a way to change it; its height follows the content (width and top stay). */
function useWidget(elementId: string) {
  const el = useViewDoc()?.elements.find((e) => e.id === elementId);
  const locale = useSettings((s) => s.locale);
  if (!el || el.type !== "icon" || !el.widget) return null;
  const change = (next: WidgetData) => {
    const st = useEditor.getState();
    // The draft can be gone (an undo, another tool): start a new one rather than lose the edit.
    if (!st.draft) st.beginDraft();
    const size = widgetSize(next, el.color, locale);
    st.patchDraft(el.id, { widget: next, height: (el.width * size.h) / size.w });
  };
  return { el, widget: el.widget, change, locale };
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <ToolSheet
      title={title}
      onApply={() => {
        useEditor.getState().applyDraft();
        onClose();
      }}
      onCancel={() => {
        useEditor.getState().cancelDraft();
        onClose();
      }}
    >
      <div className="max-h-[46dvh] overflow-y-auto overscroll-contain px-4">{children}</div>
    </ToolSheet>
  );
}

/** Content: every text of the widget. */
export function WidgetContentTool({ elementId, onClose }: Props) {
  const t = useT();
  const w = useWidget(elementId);
  if (!w) return null;
  return (
    <Sheet title={t("widget.content")} onClose={onClose}>
      <div className="flex flex-col gap-2.5">
        {contentFields(w.widget.kind).map((f) => {
          const props = {
            "aria-label": fieldLabel(f, w.locale),
            value: w.widget.fields[f] ?? "",
            onChange: (e: { target: { value: string } }) => w.change({ ...w.widget, fields: { ...w.widget.fields, [f]: e.target.value } }),
            // 16 px keeps iOS from zooming the page in on focus.
            className: INPUT,
          };
          return (
            <label key={f} className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold opacity-60">{fieldLabel(f, w.locale)}</span>
              {LONG_FIELDS.has(f) ? <textarea rows={2} {...props} className={`${INPUT} resize-none`} /> : <input type="text" {...props} />}
            </label>
          );
        })}
      </div>
    </Sheet>
  );
}

/** Rows: poll options, checklist items, tags, receipt lines, chat messages, ingredients — add / remove. */
export function WidgetListTool({ elementId, onClose }: Props) {
  const t = useT();
  const w = useWidget(elementId);
  const spec = w && WIDGET_LISTS[w.widget.kind];
  if (!w || !spec) return null;
  const rows = rowsOf(w.widget)[spec.key] ?? [];
  const set = (next: Record<string, string>[]) => w.change({ ...w.widget, lists: { ...w.widget.lists, [spec.key]: next } });
  const patch = (i: number, key: string, value: string) => set(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const blank = () => Object.fromEntries(spec.columns.map((c) => [c.key, c.type === "side" ? (rows.at(-1)?.side === "in" ? "out" : "in") : ""]));
  const percent = spec.columns.some((c) => c.type === "percent");
  return (
    <Sheet title={lang(spec.label, w.locale)} onClose={onClose}>
      <ul className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            {spec.columns.map((c) => {
              const label = `${lang(c.label, w.locale)} ${i + 1}`;
              if (c.type === "check")
                return (
                  <button key={c.key} type="button" role="checkbox" aria-checked={r.done === "1"} aria-label={label} onClick={() => patch(i, c.key, r.done === "1" ? "" : "1")} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 ${r.done === "1" ? "border-accent bg-accent text-black" : "border-black/25 dark:border-white/30"}`}>
                    {r.done === "1" && <Icon name="check" size={18} />}
                  </button>
                );
              if (c.type === "side")
                return (
                  <button key={c.key} type="button" aria-label={label} onClick={() => patch(i, c.key, r.side === "out" ? "in" : "out")} className="h-9 shrink-0 rounded-full bg-black/5 px-3 text-[12px] font-semibold dark:bg-white/10">
                    {r.side === "out" ? t("widget.sideOut") : t("widget.sideIn")}
                  </button>
                );
              if (c.type === "percent")
                return <input key={c.key} type="text" inputMode="decimal" aria-label={label} value={r[c.key] ?? ""} onChange={(e) => patch(i, c.key, e.target.value)} className={`${INPUT} w-20! shrink-0 text-right`} />;
              return <input key={c.key} type="text" aria-label={label} value={r[c.key] ?? ""} onChange={(e) => patch(i, c.key, e.target.value)} className={INPUT} />;
            })}
            <button type="button" aria-label={`${t("widget.removeRow")} ${i + 1}`} disabled={rows.length <= spec.min} onClick={() => set(rows.filter((_, j) => j !== i))} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full opacity-70 disabled:opacity-20">
              <Icon name="minus" size={20} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={rows.length >= spec.max} onClick={() => set([...rows, blank()])} className="flex h-10 items-center gap-1.5 rounded-full bg-black/5 px-4 text-[14px] font-semibold disabled:opacity-30 dark:bg-white/10">
          <Icon name="plus" size={18} />
          {t("widget.addRow")}
        </button>
        {percent && (
          <button
            type="button"
            onClick={() => {
              // Even split that adds up to 100.
              const n = rows.length;
              set(rows.map((r, i) => ({ ...r, percent: `${Math.floor(100 / n) + (i < 100 % n ? 1 : 0)}%` })));
            }}
            className="h-10 rounded-full bg-black/5 px-4 text-[14px] font-semibold dark:bg-white/10"
          >
            {t("widget.evenSplit")}
          </button>
        )}
      </div>
    </Sheet>
  );
}

/** Card style: light / dark / coloured card. */
export function WidgetLookTool({ elementId, onClose }: Props) {
  const t = useT();
  const w = useWidget(elementId);
  if (!w) return null;
  return (
    <Sheet title={t("widget.look")} onClose={onClose}>
      <div role="radiogroup" aria-label={t("widget.look")} className="flex gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
        {WIDGET_THEMES.map((th) => (
          <button key={th} type="button" role="radio" aria-checked={w.widget.theme === th} onClick={() => w.change({ ...w.widget, theme: th })} className={`h-10 flex-1 rounded-full text-[14px] font-semibold ${w.widget.theme === th ? "bg-surface shadow" : "opacity-70"}`}>
            {t(`widget.theme.${th}`)}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/** A slider: stars, level, how far the song has played. */
export function WidgetValueTool({ elementId, onClose }: Props) {
  const w = useWidget(elementId);
  const spec = w && WIDGET_VALUES[w.widget.kind];
  if (!w || !spec) return null;
  const label = lang(spec.label, w.locale);
  return (
    <Sheet title={label} onClose={onClose}>
      <Slider
        label={label}
        value={widgetValue(w.widget)}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        defaultValue={spec.max}
        format={(v) => (spec.max === 5 ? `${v} ★` : `${v}%`)}
        onChange={(v) => w.change({ ...w.widget, fields: withValue(w.widget, v) })}
      />
    </Sheet>
  );
}

/** A quick pick: the weather symbol, the mood emoji. */
export function WidgetPickTool({ elementId, onClose }: Props) {
  const w = useWidget(elementId);
  const spec = w && WIDGET_PICKS[w.widget.kind];
  if (!w || !spec) return null;
  const now = w.widget.fields[spec.field];
  return (
    <Sheet title={lang(spec.label, w.locale)} onClose={onClose}>
      <div className="grid grid-cols-8 gap-1.5">
        {spec.options.map((o) => (
          <button key={o} type="button" aria-label={o} aria-pressed={now === o} onClick={() => w.change({ ...w.widget, fields: { ...w.widget.fields, [spec.field]: o } })} className={`flex aspect-square items-center justify-center rounded-xl text-[26px] ${now === o ? "bg-accent/30 ring-2 ring-accent" : "bg-black/5 dark:bg-white/10"}`}>
            {o}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/** A date: fills the calendar sheet's month / day / weekday, or the countdown's days left. */
export function WidgetDateTool({ elementId, onClose }: Props) {
  const t = useT();
  const w = useWidget(elementId);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  if (!w) return null;
  return (
    <Sheet title={t("widget.date")} onClose={onClose}>
      <input type="date" aria-label={t("widget.date")} value={w.widget.fields.date ?? today} onChange={(e) => e.target.value && w.change({ ...w.widget, fields: withDate(w.widget, e.target.value, w.locale) })} className={INPUT} />
    </Sheet>
  );
}

/** Style: the same widget in its other looks (D-119), each drawn with this widget's texts. */
export function WidgetStyleTool({ elementId, onClose }: Props) {
  const t = useT();
  const w = useWidget(elementId);
  const looks = w && WIDGET_VARIANTS[w.widget.kind];
  if (!w || !looks) return null;
  return (
    <Sheet title={t("widget.style")} onClose={onClose}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {looks.map((v) => {
          const on = (w.widget.variant ?? looks[0].id) === v.id;
          return (
            <button key={v.id} type="button" aria-label={lang([v.name[0], v.name[1]], w.locale)} aria-pressed={on} onClick={() => w.change({ ...w.widget, variant: v.id, theme: v.theme, bw: undefined })} className={`flex flex-col items-stretch gap-1 rounded-[14px] p-1.5 ${on ? "bg-accent/25 ring-2 ring-accent" : "bg-black/5 dark:bg-white/10"}`}>
              <span className="flex h-20 items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- drawn on a canvas */}
                <img src={widgetThumb(w.widget.kind, w.locale, 220, v.id, { data: w.widget, color: w.el.color })} alt="" className="max-h-full max-w-full object-contain" />
              </span>
              <span className="truncate text-center text-[11px] font-semibold opacity-70">{lang([v.name[0], v.name[1]], w.locale)}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/** Time of a clock. */
export function WidgetTimeTool({ elementId, onClose }: Props) {
  const t = useT();
  const w = useWidget(elementId);
  if (!w) return null;
  const m = /(\d{1,2})\s*[:.h]\s*(\d{2})/.exec(w.widget.fields.time ?? "");
  const value = m ? `${m[1].padStart(2, "0")}:${m[2]}` : "10:09";
  return (
    <Sheet title={t("widget.time")} onClose={onClose}>
      <input type="time" aria-label={t("widget.time")} value={value} onChange={(e) => e.target.value && w.change({ ...w.widget, fields: { ...w.widget.fields, time: e.target.value } })} className={INPUT} />
    </Sheet>
  );
}

/**
 * Colours of a widget (owner, 2026-10-20: "why go through light / dark / colour?"): the
 * card colour (solid or gradient) and the accent, each one tap away; "Original colours"
 * goes back to the look's own.
 */
export function WidgetColorTool({ elementId, onClose }: Props) {
  const t = useT();
  const w = useWidget(elementId);
  if (!w) return null;
  const pal = palette(w.widget.theme, w.el.color, w.widget.bg);
  const cardNow = w.widget.bg ?? pal.bg;
  const setAccent = (color: string) => {
    const st = useEditor.getState();
    if (!st.draft) st.beginDraft();
    st.patchDraft(w.el.id, { color });
  };
  // A new card colour: unless a text colour was picked, the texts turn black or white to stay readable.
  const setCard = (bg: string) => w.change({ ...w.widget, bg, ...(w.widget.ink && !w.widget.inkAuto ? {} : { ink: contrastInk(bg), inkAuto: true }) });
  return (
    <Sheet title={t("tool.color")} onClose={onClose}>
      <div className="flex flex-col gap-1">
        {hasCard(w.widget) && <ColorPicker value={cardNow} gradient label={t("color.card")} onChange={setCard} />}
        <ColorPicker value={w.widget.ink ?? pal.fg} label={t("color.text")} onChange={(ink) => w.change({ ...w.widget, ink, inkAuto: false })} />
        <ColorPicker value={w.el.color} label={t("color.accent")} onChange={setAccent} />
        <button
          type="button"
          onClick={() => {
            w.change({ ...w.widget, bg: undefined, ink: undefined, inkAuto: undefined });
            setAccent(WIDGET_ACCENT[w.widget.kind]);
          }}
          className="mt-2 flex h-10 items-center gap-1.5 self-start rounded-full bg-black/5 px-4 text-[14px] font-semibold dark:bg-white/10"
        >
          <Icon name="reset" size={16} /> {t("color.reset")}
        </button>
      </div>
    </Sheet>
  );
}
