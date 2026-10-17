"use client";

import { DragSheet } from "../DragSheet";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { newEmoji, newFramedPhoto, newIcon, newOverlay, newShape, newSticker } from "@/lib/elements/create";
import { EmojiStickers } from "./EmojiStickers";
import { OVERLAY_KINDS, OVERLAYS, overlayBlob, drawOverlay, type OverlayKind } from "@/lib/elements/overlays";
import { STICKER_KEYS, STICKERS } from "@/lib/elements/stickers";
import { newId, slideSize } from "@/lib/project/types";
import { iconDataUrl, ICON_KEYS } from "@/lib/elements/icons";
import { drawShape } from "@/lib/elements/shapes";
import type { CanvasElement, FrameStyle, ShapeKind } from "@/lib/project/types";
import { SHAPES } from "@/lib/project/types";
import { slideRect } from "@/lib/project/layout";
import { useEditor, useViewDoc } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";

type Tab = "all" | "stickers" | "overlays" | "shapes" | "icons" | "frames";
const PHOTO_FRAMES: FrameStyle[] = ["polaroid", "polaroidBlack", "white", "black", "gallery", "film"];

function OverlayPreview({ kind }: { kind: OverlayKind }) {
  return (
    <canvas
      aria-hidden="true"
      width={60}
      height={60}
      className="h-10 w-10 rounded-md"
      ref={(c) => {
        if (c) drawOverlay(c.getContext("2d")!, kind, 60, 60);
      }}
    />
  );
}

function ShapePreview({ shape }: { shape: ShapeKind }) {
  return (
    <canvas
      aria-hidden="true"
      width={64}
      height={64}
      className="h-8 w-8 text-text"
      ref={(c) => {
        if (!c) return;
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, 64, 64);
        const color = getComputedStyle(c).color;
        const box = shape === "line" ? [64, 8] : shape === "arrow" ? [64, 26] : shape === "film" ? [64, 30] : [56, 56];
        ctx.save();
        ctx.translate((64 - box[0]) / 2, (64 - box[1]) / 2);
        drawShape(ctx, shape, box[0], box[1], color);
        ctx.restore();
      }}
    />
  );
}

/** "Add element" sheet (wireframe 12): shapes, icons, photo frames, with search. */
export function ElementsSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const current = useEditor((s) => s.currentSlide);
  const addElement = useEditor((s) => s.addElement);
  const addAssetElement = useEditor((s) => s.addAssetElement);
  const locale = useSettings((s) => s.locale);
  const [making, setMaking] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  if (!doc) return null;
  const slide = slideRect(doc, Math.min(current, doc.slideCount - 1));

  const q = query.trim().toLowerCase();
  const match = (label: string, key: string) => !q || label.toLowerCase().includes(q) || key.includes(q);
  const add = (el: CanvasElement) => {
    addElement(el);
    onClose();
  };
  const shapes = SHAPES.filter((s) => match(t(`shape.${s}`), s));
  const icons = ICON_KEYS.filter((k) => match(t(`icon.${k}` as "icon.heart"), k));
  const frames = PHOTO_FRAMES.filter((f) => match(t(`frame.${f}`), f));
  const stickers = STICKER_KEYS.filter((k) => match(STICKERS[k].name[locale], k));
  const overlays = OVERLAY_KINDS.filter((k) => match(OVERLAYS[k].name[locale], k));
  const show = (k: Tab) => tab === "all" || tab === k;

  /** Overlays are generated at slide resolution and stored like a photo. */
  async function addOverlay(kind: OverlayKind) {
    if (!doc || making) return;
    setMaking(true);
    try {
      const { width, height } = slideSize(doc.ratio);
      const blob = await overlayBlob(kind, width, height);
      const asset = { id: newId(), blob, url: URL.createObjectURL(blob), width, height, name: `${kind}.jpg` };
      addAssetElement(asset, newOverlay(slide, asset, OVERLAYS[kind].blend));
      onClose();
    } finally {
      setMaking(false);
    }
  }
  const tile = "flex h-[72px] flex-col items-center justify-center gap-1 rounded-xl bg-surface-2 text-[11px]";

  return (
    <DragSheet title={t("elements.title")} onClose={onClose}>
        <label className="mx-4 flex h-11 items-center gap-2.5 rounded-xl bg-surface-2 px-3 text-muted">
          <Icon name="search" size={18} />
          <span className="sr-only">{t("elements.search")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("elements.search")}
            className="flex-1 bg-transparent text-sm text-text outline-none"
          />
        </label>
        <nav className="flex gap-2 overflow-x-auto px-4 pt-3 pb-2">
          {(["all", "stickers", "overlays", "shapes", "icons", "frames"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={tab === k}
              onClick={() => setTab(k)}
              className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] ${tab === k ? "bg-text font-semibold text-bg" : "border border-border"}`}
            >
              {t(`elements.${k}`)}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-1 pb-2">
          {show("stickers") && stickers.length > 0 && (
            <section>
              <h3 className="pb-2 text-[13px] font-bold">{t("elements.stickers")}</h3>
              <div className="grid grid-cols-4 gap-2">
                {stickers.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-label={STICKERS[k].name[locale]}
                    className="flex h-[68px] items-center justify-center rounded-xl bg-surface-2 p-2"
                    onClick={() => add(newSticker(doc.ratio, slide, k))}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG */}
                    <img src={iconDataUrl(k, STICKERS[k].color, 96)} alt="" className="max-h-full max-w-full" />
                  </button>
                ))}
              </div>
            </section>
          )}
          {show("stickers") && (
            <section>
              <h3 className="pb-2 text-[13px] font-bold">{t("elements.emoji")}</h3>
              <EmojiStickers query={query} onPick={(name, body) => add(newEmoji(doc.ratio, slide, name, body))} />
            </section>
          )}
          {show("overlays") && overlays.length > 0 && (
            <section>
              <h3 className="pb-2 text-[13px] font-bold">{t("elements.overlays")}</h3>
              <div className="grid grid-cols-4 gap-2">
                {overlays.map((k) => (
                  <button key={k} type="button" disabled={making} className={tile} onClick={() => void addOverlay(k)}>
                    <OverlayPreview kind={k} />
                    {OVERLAYS[k].name[locale]}
                  </button>
                ))}
              </div>
            </section>
          )}
          {show("frames") && frames.length > 0 && (
            <section>
              <h3 className="pb-2 text-[13px] font-bold">{t("elements.frames")}</h3>
              <div className="grid grid-cols-3 gap-2">
                {frames.map((f) => (
                  <button key={f} type="button" className={tile} onClick={() => add(newFramedPhoto(doc.ratio, slide, f))}>
                    <span
                      aria-hidden="true"
                      className={`block h-10 w-8 ${
                        f === "film"
                          ? "border-y-[5px] border-[#161616] bg-[#9cb1c4]"
                          : f === "polaroid"
                            ? "border-[3px] border-b-[9px] border-white bg-[#9cb1c4] shadow"
                            : f === "polaroidBlack"
                              ? "border-[3px] border-b-[9px] border-[#141414] bg-[#c4b49c] shadow"
                              : f === "black"
                                ? "border-[3px] border-[#141414] bg-[#d9728a] shadow"
                                : f === "gallery"
                                  ? "border-[6px] border-white bg-[#9cb1c4] shadow outline outline-1 -outline-offset-[7px] outline-black/30"
                                  : "border-[3px] border-white bg-[#d9728a] shadow"
                      }`}
                    />
                    {t(`frame.${f}`)}
                  </button>
                ))}
              </div>
            </section>
          )}
          {show("shapes") && shapes.length > 0 && (
            <section>
              <h3 className="pb-2 text-[13px] font-bold">{t("elements.shapes")}</h3>
              <div className="grid grid-cols-4 gap-2">
                {shapes.map((s) => (
                  <button key={s} type="button" className={tile} onClick={() => add(newShape(doc.ratio, slide, s, s === "film" ? "#161616" : "#ffffff"))}>
                    <ShapePreview shape={s} />
                    {t(`shape.${s}`)}
                  </button>
                ))}
              </div>
            </section>
          )}
          {show("icons") && icons.length > 0 && (
            <section>
              <h3 className="pb-2 text-[13px] font-bold">{t("elements.icons")}</h3>
              <div className="grid grid-cols-6 gap-2">
                {icons.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-label={t(`icon.${k}` as "icon.heart")}
                    className="flex h-12 items-center justify-center rounded-xl bg-surface-2"
                    onClick={() => add(newIcon(doc.ratio, slide, k, "#ffffff"))}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG */}
                    <img src={iconDataUrl(k, "#888888", 24)} alt="" width={24} height={24} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
    </DragSheet>
  );
}
