"use client";

import { useEffect, useMemo, useState } from "react";
import { stickerSvg } from "@/lib/elements/stickers";
import { canvasSize, slideRect } from "@/lib/project/layout";
import { type AspectRatio, type CanvasElement, frameColor, stillUrl, type ImageAsset, type ImageElement, type ProjectDoc, type ProjectType } from "@/lib/project/types";
import { applyTemplate, PACK_ART } from "@/lib/templates/apply";
import type { Template, TemplateOptions } from "@/lib/templates/types";
import { fontInfo, fontWeight } from "@/lib/text/fonts";
import { useSettings } from "@/store/settings";

/** Soft placeholder tones for empty photo cells (template library, before photos are added). */
const PLACEHOLDERS = ["#cfc6b8", "#b9c4c9", "#d6c2bd", "#c3cbb8", "#cdbfd2", "#bcc9c0"];

function cssBackground(doc: ProjectDoc) {
  const bg = doc.background;
  if (bg.kind === "color") return bg.color;
  if (bg.kind === "gradient") return `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  if (bg.kind === "texture") return "#f5f3ee";
  return "#9a9a9a";
}

function radius(el: ImageElement, k: number) {
  if (el.mask === "circle") return "50%";
  if (el.mask === "rounded") return `${el.cornerRadius * k}px`;
  if (el.mask === "arch") return `${(el.width * k) / 2}px ${(el.width * k) / 2}px 0 0`;
  return undefined;
}

/** Frame / film / border of a photo cell as longhand CSS. */
function borderOf(el: ImageElement, k: number, polaroid: boolean) {
  const framed = el.frame !== "none" && el.frame !== "film";
  const width = framed
    ? Math.max(1.5, el.width * k * (el.frame === "gallery" ? 0.11 : 0.05))
    : el.frame === "film"
      ? Math.max(2, el.width * k * 0.06)
      : el.border
        ? Math.max(1, el.border.width * k)
        : 0;
  if (!width) return {};
  const color = framed ? frameColor(el.frame) : el.frame === "film" ? "#161616" : el.border!.color;
  return { borderStyle: "solid", borderColor: color, borderWidth: width, ...(polaroid && { borderBottomWidth: Math.max(3, el.width * k * 0.18) }) };
}

type WidgetModule = typeof import("@/lib/templates/widgetSpec");

/** Pack pictures are drawn above their frame's cells (like the canvas): move each frame after its last cell. */
function drawOrder(elements: CanvasElement[]) {
  const out = elements.filter((e) => !(e.type === "layout" && e.art));
  for (const block of elements) {
    if (block.type !== "layout" || !block.art) continue;
    let at = -1;
    out.forEach((e, i) => e.parentId === block.id && (at = i));
    out.splice(at < 0 ? out.length : at + 1, 0, block);
  }
  return out;
}

/** URL of a pack picture placed by a template preview (asset id "pack:<catalog id>"). */
function packUrlOf(assetId: string | null | undefined) {
  if (!assetId?.startsWith("pack:")) return undefined;
  const info = PACK_ART[assetId.slice(5)];
  return info && `/packs/${info.file}`;
}

/** Small DOM rendering of a template filled with the user's photos (approximate). */
export function TemplatePreview(props: {
  template: Template;
  photos: ImageAsset[];
  ratio: AspectRatio;
  slides: number;
  type?: ProjectType;
  grid?: ProjectDoc["grid"];
  options: TemplateOptions;
  width: number;
  /** Hide the dashed slide boundaries (home library cards). */
  plain?: boolean;
}) {
  const { template, photos, ratio, slides, options, width, type = "post", grid, plain } = props;
  const locale = useSettings((s) => s.locale);
  // Widget drawings are loaded only for templates that have widgets.
  const [widgets, setWidgets] = useState<WidgetModule | null>(null);
  const wantsWidgets = !!template.widgets?.length;
  useEffect(() => {
    if (!wantsWidgets || widgets) return;
    let alive = true;
    void import("@/lib/templates/widgetSpec").then((m) => alive && setWidgets(m));
    return () => {
      alive = false;
    };
  }, [wantsWidgets, widgets]);
  const doc = useMemo(
    () =>
      applyTemplate(
        { type, ratio, slideCount: slides, grid, background: { kind: "color", color: "#ffffff" }, elements: [] },
        template,
        photos,
        options,
        locale,
        widgets ? { widget: widgets.widgetFromSpec } : {},
      ),
    [template, photos, ratio, slides, options, type, grid, locale, widgets],
  );
  const size = canvasSize(doc);
  const k = width / size.width;
  const byId = new Map(photos.map((p) => [p.id, p]));
  let cell = 0;

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-[4px]"
      style={{ width, height: size.height * k, background: cssBackground(doc) }}
    >
      {drawOrder(doc.elements).map((el) => {
        const box = {
          left: el.x * k,
          top: el.y * k,
          width: el.width * k,
          height: el.height * k,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          opacity: el.opacity,
        };
        if (el.type === "layout") {
          const url = packUrlOf(el.art?.assetId);
          // eslint-disable-next-line @next/next/no-img-element -- pack frame art
          return url ? <img key={el.id} src={url} alt="" className="absolute max-w-none" style={box} /> : null;
        }
        if (el.type === "icon") {
          const src = el.widget
            ? widgets?.widgetPicture(el.widget, el.color, el.width * k)
            : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stickerSvg(el.icon, el.color, Math.max(16, Math.round(el.width * k))))}`;
          // eslint-disable-next-line @next/next/no-img-element -- sticker / widget picture
          return src ? <img key={el.id} src={src} alt="" className="absolute max-w-none" style={box} /> : null;
        }
        if (el.type === "shape") {
          const h = el.height * k;
          return (
            <div
              key={el.id}
              className="absolute"
              style={{
                left: el.x * k,
                top: el.y * k,
                width: el.width * k,
                height: h,
                background: el.fill,
                opacity: el.opacity,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                borderRadius: el.shape === "circle" ? "50%" : el.shape === "roundRect" ? Math.min(el.width, el.height) * k * 0.18 : el.shape === "line" ? h / 2 : undefined,
              }}
            >
              {el.shape === "film" && (
                // Sprocket holes along both edges, like drawShape.
                <div
                  className="absolute inset-x-0"
                  style={{
                    top: h * 0.035,
                    bottom: h * 0.035,
                    backgroundImage: `repeating-linear-gradient(90deg, transparent 0 ${h * 0.048}px, rgba(255,255,255,0.88) ${h * 0.048}px ${h * 0.108}px)`,
                    maskImage: `linear-gradient(#000 0 ${h * 0.045}px, transparent ${h * 0.045}px calc(100% - ${h * 0.045}px), #000 0)`,
                  }}
                />
              )}
            </div>
          );
        }
        if (el.type === "text")
          return (
            <div
              key={el.id}
              className="absolute whitespace-pre-wrap"
              style={{
                left: el.x * k,
                top: el.y * k,
                width: el.width * k,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                fontFamily: fontInfo(el.font).family,
                fontWeight: fontWeight(el),
                fontSize: el.fontSize * k,
                lineHeight: el.lineHeight,
                letterSpacing: el.letterSpacing * k,
                color: el.color,
                textAlign: el.align,
                fontStyle: el.italic ? "italic" : undefined,
                opacity: el.opacity,
                WebkitTextStroke: el.stroke ? `${Math.max(0.5, el.stroke.width * k)}px ${el.stroke.color}` : undefined,
                paintOrder: el.stroke ? "stroke fill" : undefined,
                textShadow: el.shadow ? "0 1px 3px rgba(0,0,0,0.45)" : undefined,
                background: el.background?.color,
                padding: el.background ? el.background.padding * k : undefined,
                borderRadius: el.background ? el.background.radius * k : undefined,
              }}
            >
              {el.text}
            </div>
          );
        if (el.type !== "image") return null;
        const pack = packUrlOf(el.assetId);
        // eslint-disable-next-line @next/next/no-img-element -- pack sticker
        if (pack) return <img key={el.id} src={pack} alt="" className="absolute max-w-none" style={box} />;
        const tone = PLACEHOLDERS[cell++ % PLACEHOLDERS.length];
        const asset = el.assetId ? byId.get(el.assetId) : undefined;
        const torn = el.maskPoints?.length
          ? `polygon(${Array.from({ length: el.maskPoints.length / 2 }, (_, i) => `${el.maskPoints![i * 2] * 100}% ${el.maskPoints![i * 2 + 1] * 100}%`).join(",")})`
          : undefined;
        const polaroid = el.frame === "polaroid" || el.frame === "polaroidBlack";
        return (
          <div
            key={el.id}
            className="absolute box-border"
            style={{
              left: el.x * k,
              top: el.y * k,
              width: el.width * k,
              height: el.height * k,
              transform: `rotate(${el.rotation}deg)`,
              borderRadius: radius(el, k),
              // Longhand only: React warns when `border` and `borderBottomWidth` are mixed.
              ...borderOf(el, k, polaroid),
              boxShadow: el.shadow ? "0 2px 4px rgba(0,0,0,0.3)" : undefined,
              clipPath: torn,
              opacity: el.opacity,
              background: asset ? `center / cover no-repeat url("${stillUrl(asset)}")` : tone,
            }}
          />
        );
      })}
      {!plain && Array.from({ length: doc.slideCount }, (_, i) => slideRect(doc, i)).map((r, i) => (
        <div
          key={i}
          className="absolute border border-dashed border-white/70"
          style={{ left: r.x * k, top: r.y * k, width: r.width * k, height: r.height * k }}
        />
      ))}
    </div>
  );
}
