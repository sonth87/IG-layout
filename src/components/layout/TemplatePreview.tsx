"use client";

import { useMemo } from "react";
import { canvasSize, slideRect } from "@/lib/project/layout";
import type { AspectRatio, ImageAsset, ImageElement, ProjectDoc, ProjectType } from "@/lib/project/types";
import { applyTemplate } from "@/lib/templates/apply";
import type { Template, TemplateOptions } from "@/lib/templates/types";

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
}) {
  const { template, photos, ratio, slides, options, width, type = "post", grid } = props;
  const doc = useMemo(
    () =>
      applyTemplate(
        { type, ratio, slideCount: slides, grid, background: { kind: "color", color: "#ffffff" }, elements: [] },
        template,
        photos,
        options,
      ),
    [template, photos, ratio, slides, options, type, grid],
  );
  const size = canvasSize(doc);
  const k = width / size.width;
  const byId = new Map(photos.map((p) => [p.id, p]));

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
        if (el.type !== "image") return null;
        const asset = el.assetId ? byId.get(el.assetId) : undefined;
        const framed = el.frame === "polaroid" || el.frame === "white";
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
                ? `${Math.max(1.5, el.width * k * 0.05)}px solid #ffffff`
                : el.border
                  ? `${Math.max(1, el.border.width * k)}px solid ${el.border.color}`
                  : undefined,
              borderBottomWidth: el.frame === "polaroid" ? Math.max(3, el.width * k * 0.18) : undefined,
              boxShadow: el.shadow ? "0 2px 4px rgba(0,0,0,0.3)" : undefined,
              background: asset ? `center / cover no-repeat url(${asset.url})` : "#d9d5cd",
            }}
          />
        );
      })}
      {Array.from({ length: doc.slideCount }, (_, i) => slideRect(doc, i)).map((r, i) => (
        <div
          key={i}
          className="absolute border border-dashed border-white/70"
          style={{ left: r.x * k, top: r.y * k, width: r.width * k, height: r.height * k }}
        />
      ))}
    </div>
  );
}
