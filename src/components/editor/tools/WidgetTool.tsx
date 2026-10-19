"use client";

import { fieldLabel, LONG_FIELDS, WIDGET_THEMES, widgetFields, widgetSize, type WidgetData } from "@/lib/elements/widgets";
import { useEditor, useViewDoc } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";
import { Swatches, ToolSheet } from "./controls";

/** Edit a card widget (D-114): its texts, light / dark / colour card, and its colour. ✓ one undo step. */
export function WidgetTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const el = useViewDoc()?.elements.find((e) => e.id === elementId);
  const { patchDraft, applyDraft, cancelDraft } = useEditor.getState();
  if (!el || el.type !== "icon" || !el.widget) return null;
  const widget = el.widget;

  /** New texts / look; the height follows the content, the width and top stay. */
  const change = (next: WidgetData, color = el.color) => {
    const size = widgetSize(next, color, locale);
    patchDraft(el.id, { widget: next, color, height: (el.width * size.h) / size.w });
  };

  return (
    <ToolSheet
      title={t("widget.edit")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div className="max-h-[42dvh] overflow-y-auto overscroll-contain px-4">
        <div role="radiogroup" aria-label={t("widget.look")} className="mb-3 flex gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
          {WIDGET_THEMES.map((th) => (
            <button
              key={th}
              type="button"
              role="radio"
              aria-checked={widget.theme === th}
              onClick={() => change({ ...widget, theme: th })}
              className={`h-9 flex-1 rounded-full text-[13px] font-semibold ${widget.theme === th ? "bg-surface shadow" : "opacity-70"}`}
            >
              {t(`widget.theme.${th}`)}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {widgetFields(widget.kind).map((f) => {
            const props = {
              "aria-label": fieldLabel(f, locale),
              value: widget.fields[f] ?? "",
              onChange: (e: { target: { value: string } }) => change({ ...widget, fields: { ...widget.fields, [f]: e.target.value } }),
              // 16 px keeps iOS from zooming the page in on focus.
              className: "w-full rounded-xl bg-black/5 px-3 py-2 text-[16px] outline-none focus:ring-2 focus:ring-accent dark:bg-white/10",
            };
            return (
              <label key={f} className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold opacity-60">{fieldLabel(f, locale)}</span>
                {LONG_FIELDS.has(f) ? <textarea rows={2} {...props} className={`${props.className} resize-none`} /> : <input type="text" {...props} />}
              </label>
            );
          })}
        </div>
      </div>
      <p className="mt-3 mb-1 px-4 text-[12px] font-semibold opacity-60">{t("tool.color")}</p>
      <Swatches value={el.color} onChange={(c) => change(widget, c)} />
    </ToolSheet>
  );
}
