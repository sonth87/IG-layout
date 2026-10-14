"use client";

import { MASK_SHAPES, type ImageElement } from "@/lib/project/types";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { MaskPreview, Slider, Swatches, ToolSheet } from "./controls";

interface ToolProps {
  elementId: string;
  onClose: () => void;
}

function useDraftElement(id: string) {
  const el = useViewDoc()?.elements.find((e) => e.id === id) as ImageElement | undefined;
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
  if (!el) return null;
  const border = el.border ?? { width: 0, color: "#ffffff" };

  return (
    <ToolSheet title={t("tool.style")} {...actions}>
      <Slider
        label={t("tool.borderWidth")}
        value={border.width}
        min={0}
        max={80}
        defaultValue={0}
        onChange={(v) => patch({ border: v > 0 ? { ...border, width: v } : null })}
      />
      <Swatches
        value={border.color}
        onChange={(color) => patch({ border: { width: Math.max(border.width, 16), color } })}
      />
      <Slider
        label={t("tool.opacity")}
        value={Math.round(el.opacity * 100)}
        min={10}
        max={100}
        defaultValue={100}
        format={(v) => `${v}%`}
        onChange={(v) => patch({ opacity: v / 100 })}
      />
      <label className="flex items-center justify-between py-2 text-sm">
        <span>{t("tool.shadow")}</span>
        <input
          type="checkbox"
          checked={el.shadow}
          onChange={(e) => patch({ shadow: e.target.checked })}
          className="h-[22px] w-[22px] accent-accent"
        />
      </label>
    </ToolSheet>
  );
}
