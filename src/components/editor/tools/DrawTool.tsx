"use client";

import { Icon } from "@/components/ui/Icon";
import { useEditor } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, Swatches, ToolSheet } from "./controls";

/** Freehand drawing (M11, S17): colour, brush size, undo stroke; ✓ adds one drawing element. */
export function DrawTool({ onClose }: { onClose: () => void }) {
  const t = useT();
  const drawing = useEditor((s) => s.drawing);
  const { setDrawing, undoStroke, finishDrawing, cancelDrawing } = useEditor.getState();
  if (!drawing) return null;

  return (
    <ToolSheet
      title={t("tool.draw")}
      onApply={() => {
        finishDrawing();
        onClose();
      }}
      onCancel={() => {
        cancelDrawing();
        onClose();
      }}
    >
      <div className="flex items-center justify-between pb-1 text-[13px] text-muted">
        <span>{t("draw.hint")}</span>
        <button
          type="button"
          aria-label={t("draw.undo")}
          disabled={drawing.strokes.length === 0}
          onClick={undoStroke}
          className="flex h-9 w-10 items-center justify-center rounded-[10px] text-text disabled:text-disabled"
        >
          <Icon name="undo" size={20} />
        </button>
      </div>
      <Swatches value={drawing.color} onChange={(color) => setDrawing({ color })} />
      <Slider label={t("tool.brush")} value={drawing.size} min={2} max={80} defaultValue={12} onChange={(size) => setDrawing({ size })} />
    </ToolSheet>
  );
}
