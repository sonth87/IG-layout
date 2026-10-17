"use client";

import { coverCrop, innerFrame } from "@/lib/project/geometry";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { BLEND_MODES, type CanvasElement, FRAME_STYLES, type FrameStyle, type ImageElement, MASK_SHAPES, type ShadowStyle } from "@/lib/project/types";
import { defaultShadow } from "../canvas/ImageNode";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { MaskPreview, Slider, Swatches, ToolSheet } from "./controls";

interface ToolProps {
  elementId: string;
  onClose: () => void;
}

function useDraftElement(id: string) {
  const found = useViewDoc()?.elements.find((e) => e.id === id);
  const el = found?.type === "image" ? found : undefined;
  const updateDraft = useEditor((s) => s.updateDraft);
  const patch = (p: Partial<ImageElement>) => updateDraft((d) => updateEl(d, id, p));
  return { el, patch };
}

function useSheetActions(onClose: () => void) {
  const applyDraft = useEditor((s) => s.applyDraft);
  const cancelDraft = useEditor((s) => s.cancelDraft);
  return {
    onApply: () => {
      applyDraft();
      onClose();
    },
    onCancel: () => {
      cancelDraft();
      onClose();
    },
  };
}

export function MaskTool({ elementId, onClose }: ToolProps) {
  const t = useT();
  const { el, patch } = useDraftElement(elementId);
  const actions = useSheetActions(onClose);
  if (!el) return null;
  const shortSide = Math.min(el.width, el.height);

  return (
    <ToolSheet title={t("tool.mask")} {...actions}>
      <div role="radiogroup" aria-label={t("tool.mask")} className="grid grid-cols-4 gap-2.5">
        {MASK_SHAPES.map((shape) => (
          <button
            key={shape}
            type="button"
            role="radio"
            aria-checked={el.mask === shape}
            onClick={() => patch({ mask: shape })}
            className={`flex h-[70px] flex-col items-center justify-center gap-1.5 rounded-xl text-[11px] ${
              el.mask === shape
                ? "border-2 border-accent bg-accent-soft font-bold text-accent-text"
                : "border border-border bg-surface-2"
            }`}
          >
            <MaskPreview shape={shape} />
            {t(`mask.${shape}`)}
          </button>
        ))}
      </div>
      {el.mask === "rounded" && (
        <Slider
          label={t("tool.corner")}
          value={Math.round(el.cornerRadius)}
          min={0}
          max={Math.round(shortSide / 2)}
          defaultValue={40}
          onChange={(v) => patch({ cornerRadius: v })}
        />
      )}
    </ToolSheet>
  );
}

export function StyleTool({ elementId, onClose }: ToolProps) {
  const t = useT();
  const { el, patch } = useDraftElement(elementId);
  const actions = useSheetActions(onClose);
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const [panel, setPanel] = useState<"main" | "shadow" | "border">("main");
  if (!el) return null;
  const border = el.border ?? { width: 0, color: "#ffffff" };
  const shadow = el.shadowStyle ?? defaultShadow(el.width, el.height);
  const setShadow = (p: Partial<ShadowStyle>) => patch({ shadow: true, shadowStyle: { ...shadow, ...p } });
  const setFrame = (frame: FrameStyle) =>
    // The photo fills the inside of the frame: re-fit the crop to that area.
    patch({ frame, crop: asset ? coverCrop(asset, innerFrame({ ...el, frame })) : el.crop });
  // Corners only round a rectangle (or an already rounded photo).
  const roundable = el.frame === "none" && (el.mask === "none" || el.mask === "rounded");
  const radius = (v: number) => patch({ cornerRadius: v, corners: undefined, mask: v > 0 ? "rounded" : "none" });
  // Rounded now by one radius (0 when not rounded): the starting point for each corner.
  const r0 = el.mask === "rounded" ? el.cornerRadius : 0;
  const corners = el.corners ?? ([r0, r0, r0, r0] as [number, number, number, number]);
  const setCorner = (i: number, v: number) => {
    const next = [...corners] as [number, number, number, number];
    next[i] = v;
    patch({ corners: next, mask: next.some((c) => c > 0) ? "rounded" : "none" });
  };
  const max = Math.round(Math.min(el.width, el.height) / 2);
  const back = (
    <button type="button" onClick={() => setPanel("main")} className="mb-1 flex h-9 items-center gap-1 text-[13px] text-muted">
      <Icon name="back" size={18} />
      {t("tool.style")}
    </button>
  );
  const row = (label: string, value: string, to: "shadow" | "border") => (
    <button type="button" onClick={() => setPanel(to)} className="flex h-11 w-full items-center justify-between border-t border-border text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-1 text-muted">
        {value}
        <Icon name="chevronRight" size={16} />
      </span>
    </button>
  );

  return (
    <ToolSheet title={t("tool.style")} {...actions}>
      <div className="max-h-[44dvh] overflow-y-auto">
        {panel === "shadow" ? (
          <>
            {back}
            <label className="flex items-center justify-between py-2 text-sm">
              <span>{t("tool.shadow")}</span>
              <input type="checkbox" checked={el.shadow} onChange={(e) => patch({ shadow: e.target.checked })} className="h-[22px] w-[22px] accent-accent" />
            </label>
            {el.shadow && (
              <>
                <Slider label={t("style.shadowOpacity")} value={Math.round(shadow.opacity * 100)} min={0} max={100} defaultValue={35} format={(v) => `${v}%`} onChange={(v) => setShadow({ opacity: v / 100 })} />
                <Slider label={t("style.angle")} value={Math.round(shadow.angle)} min={0} max={359} defaultValue={90} format={(v) => `${v}°`} onChange={(v) => setShadow({ angle: v })} />
                <Slider label={t("style.distance")} value={Math.round(shadow.distance)} min={0} max={200} defaultValue={Math.round(defaultShadow(el.width, el.height).distance)} onChange={(v) => setShadow({ distance: v })} />
                <Slider label={t("style.blur")} value={Math.round(shadow.blur)} min={0} max={200} defaultValue={Math.round(defaultShadow(el.width, el.height).blur)} onChange={(v) => setShadow({ blur: v })} />
                <Swatches value={shadow.color} onChange={(color) => setShadow({ color })} />
              </>
            )}
          </>
        ) : panel === "border" ? (
          <>
            {back}
            <Slider label={t("style.width")} value={border.width} min={0} max={80} defaultValue={0} onChange={(v) => patch({ border: v > 0 ? { ...border, width: v } : null })} />
            <Swatches value={border.color} onChange={(color) => patch({ border: { width: Math.max(border.width, 16), color } })} />
          </>
        ) : (
          <>
            <div role="radiogroup" aria-label={t("tool.frame")} className="flex gap-2 overflow-x-auto pb-1">
              {FRAME_STYLES.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={el.frame === f}
                  onClick={() => setFrame(f)}
                  className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] ${el.frame === f ? "bg-text font-bold text-bg" : "border border-border"}`}
                >
                  {t(`frame.${f}`)}
                </button>
              ))}
            </div>
            <Slider label={t("tool.opacity")} value={Math.round(el.opacity * 100)} min={10} max={100} defaultValue={100} format={(v) => `${v}%`} onChange={(v) => patch({ opacity: v / 100 })} />
            {roundable && (
              <>
                {el.corners ? (
                  ([0, 1, 2, 3] as const).map((i) => (
                    <Slider key={i} label={t(CORNER_KEYS[i])} value={Math.round(corners[i])} min={0} max={max} defaultValue={0} onChange={(v) => setCorner(i, v)} />
                  ))
                ) : (
                  <Slider label={t("style.corners")} value={el.mask === "rounded" ? Math.round(el.cornerRadius) : 0} min={0} max={max} defaultValue={0} onChange={radius} />
                )}
                <label className="flex items-center justify-between py-1.5 text-sm">
                  <span>{t("style.eachCorner")}</span>
                  <input
                    type="checkbox"
                    checked={!!el.corners}
                    onChange={(e) => patch(e.target.checked ? { corners: corners } : { corners: undefined, cornerRadius: corners[0], mask: corners[0] > 0 ? "rounded" : "none" })}
                    className="h-[22px] w-[22px] accent-accent"
                  />
                </label>
              </>
            )}
            {row(t("tool.shadow"), el.shadow ? t("style.on") : t("style.off"), "shadow")}
            {row(t("tool.borderWidth"), `${Math.round(border.width)} px`, "border")}
            {/* Blend with what is below (M11, overlays). */}
            <div role="radiogroup" aria-label={t("tool.blend")} className="flex items-center gap-2 overflow-x-auto border-t border-border py-1.5">
              <span className="w-24 shrink-0 text-[13px] text-muted">{t("tool.blend")}</span>
              {BLEND_MODES.map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={(el.blend ?? "normal") === b}
                  onClick={() => patch({ blend: b === "normal" ? undefined : b })}
                  className={`h-8 shrink-0 rounded-full px-3 text-[12px] ${(el.blend ?? "normal") === b ? "bg-text font-bold text-bg" : "border border-border"}`}
                >
                  {t(`blend.${b}`)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolSheet>
  );
}

const CORNER_KEYS = ["style.topLeft", "style.topRight", "style.bottomRight", "style.bottomLeft"] as const;

/** Colour + opacity for shapes and icons. */
export function FillTool({ elementId, onClose }: ToolProps) {
  const t = useT();
  const found = useViewDoc()?.elements.find((e) => e.id === elementId);
  const updateDraft = useEditor((s) => s.updateDraft);
  const actions = useSheetActions(onClose);
  if (!found || (found.type !== "shape" && found.type !== "icon" && found.type !== "drawing")) return null;
  const fixedColors = found.type === "icon" && !!found.svg; // emoji: only opacity
  const color = found.type === "shape" ? found.fill : found.color;
  const patch = (p: Partial<CanvasElement>) => updateDraft((d) => updateEl(d, elementId, p));

  return (
    <ToolSheet title={t("tool.color")} {...actions}>
      {!fixedColors && <Swatches value={color} onChange={(c) => patch(found.type === "shape" ? { fill: c } : { color: c })} />}
      <Slider
        label={t("tool.opacity")}
        value={Math.round(found.opacity * 100)}
        min={10}
        max={100}
        defaultValue={100}
        format={(v) => `${v}%`}
        onChange={(v) => patch({ opacity: v / 100 })}
      />
    </ToolSheet>
  );
}
