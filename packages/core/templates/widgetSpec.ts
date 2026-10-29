import { type CardWidgetKind, drawWidget, newWidgetData, WIDGET_ACCENT, type WidgetData, widgetSize } from "../elements/widgets";
import type { TemplateWidget } from "./types";

// Widgets placed by templates (2026-10-28). A module of its own: the widget drawings are
// big, so the home screen loads them only once a template with a widget is shown.

export function widgetFromSpec(spec: TemplateWidget, locale: "en" | "vi") {
  const kind = spec.kind as CardWidgetKind;
  const widget = newWidgetData(kind, locale, spec.variant);
  if (spec.fields) widget.fields = { ...widget.fields, ...Object.fromEntries(Object.entries(spec.fields).map(([k, v]) => [k, v[locale]])) };
  const color = spec.color ?? WIDGET_ACCENT[kind];
  const size = widgetSize(widget, color, locale);
  return { widget, color, aspect: size.w / size.h };
}

const pictures = new Map<string, string>();

/** A widget as a PNG `width` px wide (template previews). */
export function widgetPicture(widget: WidgetData, color: string, width: number) {
  const w = Math.max(40, Math.round(width * 2));
  const key = JSON.stringify([widget, color, w]);
  const hit = pictures.get(key);
  if (hit) return hit;
  const size = widgetSize(widget, color);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = Math.ceil((w * size.h) / size.w);
  const c = canvas.getContext("2d");
  if (!c) return "";
  drawWidget(c, widget, color, w);
  const url = canvas.toDataURL("image/png");
  if (pictures.size > 200) pictures.clear();
  pictures.set(key, url);
  return url;
}
