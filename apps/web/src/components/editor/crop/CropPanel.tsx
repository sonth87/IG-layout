"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { clampView, cropWindow, minZoom } from "@ig-layout/core/project/cropView";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, ToolSheet } from "../tools/controls";
import { picSize, tiltOf, viewOf, windowResizable, writeView } from "./cropModel";

export type RatioKey = "free" | "original" | "1:1" | "2:3" | "3:4" | "4:3" | "4:5" | "9:16" | "16:9";
const FIXED: Partial<Record<RatioKey, number>> = { "1:1": 1, "2:3": 2 / 3, "3:4": 3 / 4, "4:3": 4 / 3, "4:5": 4 / 5, "9:16": 9 / 16, "16:9": 16 / 9 };
const RATIOS: RatioKey[] = ["free", "original", "1:1", "2:3", "3:4", "4:3", "4:5", "9:16", "16:9"];

/** Aspect kept while resizing the window (null = free). */
export function ratioAspect(key: RatioKey, pic: { width: number; height: number } | undefined) {
  if (key === "free") return null;
  if (key === "original") return pic ? pic.width / pic.height : null;
  return FIXED[key]!;
}

/** The Crop bar under the canvas (D-111): turn, window ratio, 90°, flips, reset; ✕ / ✓. */
export function CropPanel({ elementId, ratio, onRatio, onClose }: { elementId: string; ratio: RatioKey; onRatio: (r: RatioKey) => void; onClose: () => void }) {
  const t = useT();
  const found = useViewDoc()?.elements.find((e) => e.id === elementId);
  const el = found?.type === "image" ? found : undefined;
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const { applyDraft, cancelDraft, patchDraft } = useEditor.getState();
  /** The window when Crop opened: Reset goes back to it (not to the last ratio picked). */
  const [opening] = useState(() => (el ? { x: el.x, y: el.y, width: el.width, height: el.height } : null));
  if (!el || !asset) return null;
  const pic = picSize(asset);
  const resizable = windowResizable(el);

  const turn = (deg: number) => {
    const { view } = viewOf(el, asset);
    writeView(el, asset, { ...view, theta: deg });
  };
  /** 3D tilt (D-111 part 2): the picture zooms up as needed to keep covering the window. */
  const tiltTo = (axis: "x" | "y", deg: number) => {
    const { view } = viewOf(el, asset);
    writeView(el, asset, view, undefined, { ...tiltOf(el), [axis]: deg });
  };
  /** The window takes a shape, inside the current one, around the same centre. */
  const shape = (key: RatioKey) => {
    onRatio(key);
    const a = ratioAspect(key, pic);
    if (!a) return;
    const w = el.width / el.height > a ? el.height * a : el.width;
    const h = w / a;
    const { view } = viewOf(el, asset);
    writeView(el, asset, view, { width: w, height: h, x: el.x + (el.width - w) / 2, y: el.y + (el.height - h) / 2 });
  };
  const reset = () => {
    onRatio("free");
    const frame = resizable && opening ? opening : undefined;
    const win = cropWindow(frame ? { ...el, ...frame } : el);
    patchDraft(el.id, { flipX: false, flipY: false });
    writeView({ ...el, flipX: false, flipY: false }, asset, clampView({ z: minZoom(0, win, pic), theta: 0, px: 0, py: 0 }, win, pic), frame, { x: 0, y: 0 });
  };
  const button = "flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px]";
  const pill = (active: boolean) => `h-9 shrink-0 rounded-full px-3 text-[13px] ${active ? "bg-text font-bold text-bg" : "border border-border"}`;

  return (
    <ToolSheet
      title={t("tool.crop")}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
      onApply={() => {
        applyDraft();
        onClose();
      }}
    >
      <Slider label={t("tool.straighten")} value={el.straighten} min={-45} max={45} step={0.5} defaultValue={0} format={(v) => `${v}°`} onChange={turn} />
      <Slider label={t("crop.tiltX")} value={el.tiltX ?? 0} min={-25} max={25} step={0.5} defaultValue={0} format={(v) => `${v}°`} onChange={(v) => tiltTo("x", v)} />
      <Slider label={t("crop.tiltY")} value={el.tiltY ?? 0} min={-25} max={25} step={0.5} defaultValue={0} format={(v) => `${v}°`} onChange={(v) => tiltTo("y", v)} />
      {resizable && (
        <div role="radiogroup" aria-label={t("crop.ratio")} className="no-scrollbar flex gap-2 overflow-x-auto py-1.5">
          {RATIOS.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={ratio === r} onClick={() => shape(r)} className={pill(ratio === r)}>
              {r === "free" || r === "original" ? (
                t(`crop.${r}`)
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block rounded-[2px] border-[1.5px] border-current" style={{ width: FIXED[r]! >= 1 ? 14 : 14 * FIXED[r]!, height: FIXED[r]! >= 1 ? 14 / FIXED[r]! : 14 }} />
                  {r}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <div className="flex pt-1">
        <button type="button" className={button} onClick={() => patchDraft(el.id, { rotation: (el.rotation + 90) % 360 })}>
          <Icon name="rotate" />
          {t("crop.rotate")}
        </button>
        <button type="button" className={button} onClick={() => patchDraft(el.id, { flipX: !el.flipX })}>
          <Icon name="flipH" />
          {t("crop.flipH")}
        </button>
        <button type="button" className={button} onClick={() => patchDraft(el.id, { flipY: !el.flipY })}>
          <Icon name="flipV" />
          {t("crop.flipV")}
        </button>
        <button type="button" className={button} onClick={reset}>
          <Icon name="reset" />
          {t("crop.reset")}
        </button>
      </div>
    </ToolSheet>
  );
}
