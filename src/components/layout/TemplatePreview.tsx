"use client";

import { useMemo } from "react";
import { canvasSize, slideRect } from "@/lib/project/layout";
import { type AspectRatio, frameColor, stillUrl, type ImageAsset, type ImageElement, type ProjectDoc, type ProjectType } from "@/lib/project/types";
import { applyTemplate } from "@/lib/templates/apply";
import type { Template, TemplateOptions } from "@/lib/templates/types";
import { TEXT_FONTS, fontWeight } from "@/lib/text/fonts";
import { useSettings } from "@/store/settings";

/** Soft placeholder tones for empty photo cells (template library, before photos are added). */
const PLACEHOLDERS = ["#cfc6b8", "#b9c4c9", "#d6c2bd", "#c3cbb8", "#cdbfd2", "#bcc9c0"];

function cssBackground(doc: ProjectDoc) {
  const bg = doc.background;
  if (bg.kind === "color") return bg.color;
  if (bg.kind === "gradient") return `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  return "#9a9a9a";
}

function radius(el: ImageElement, k: number) {
  if (el.mask === "circle") return "50%";
  if (el.mask === "rounded") return `${el.cornerRadius * k}px`;
  if (el.mask === "arch") return `${(el.width * k) / 2}px ${(el.width * k) / 2}px 0 0`;
  return undefined;
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
  const doc = useMemo(
    () =>
      applyTemplate(
        { type, ratio, slideCount: slides, grid, background: { kind: "color", color: "#ffffff" }, elements: [] },
        template,
        photos,
        options,
        locale,
      ),
    [template, photos, ratio, slides, options, type, grid, locale],
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
      {doc.elements.map((el) => {
        if (el.type === "shape")
          return (
            <div
              key={el.id}
              className="absolute"
              style={{ left: el.x * k, top: el.y * k, width: el.width * k, height: el.height * k, background: el.fill }}
            />
          );
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
                fontFamily: TEXT_FONTS[el.font].family,
                fontWeight: fontWeight(el),
                fontSize: el.fontSize * k,
                lineHeight: el.lineHeight,
                letterSpacing: el.letterSpacing * k,
                color: el.color,
                textAlign: el.align,
                background: el.background?.color,
                padding: el.background ? el.background.padding * k : undefined,
                borderRadius: el.background ? el.background.radius * k : undefined,
              }}
            >
              {el.text}
            </div>
          );
        if (el.type !== "image") return null;
        const tone = PLACEHOLDERS[cell++ % PLACEHOLDERS.length];
        const asset = el.assetId ? byId.get(el.assetId) : undefined;
        const framed = el.frame !== "none" && el.frame !== "film";
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
              border: framed
                ? `${Math.max(1.5, el.width * k * (el.frame === "gallery" ? 0.11 : 0.05))}px solid ${frameColor(el.frame)}`
                : el.border
                  ? `${Math.max(1, el.border.width * k)}px solid ${el.border.color}`
                  : undefined,
              borderBottomWidth: polaroid ? Math.max(3, el.width * k * 0.18) : undefined,
              boxShadow: el.shadow ? "0 2px 4px rgba(0,0,0,0.3)" : undefined,
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
