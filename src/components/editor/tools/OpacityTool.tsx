"use client";

import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, ToolSheet } from "./controls";

/** Opacity of any element (editor-v2/10 §5): one slider; ✓ one undo step, ✕ back. */
export function OpacityTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const el = useViewDoc()?.elements.find((e) => e.id === elementId);
  const { patchDraft, applyDraft, cancelDraft } = useEditor.getState();
  if (!el) return null;
  return (
    <ToolSheet
      title={t("tool.opacityTitle")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <Slider label={t("tool.opacity")} value={Math.round(el.opacity * 100)} min={5} max={100} defaultValue={100} format={(v) => `${v}%`} onChange={(v) => patchDraft(el.id, { opacity: v / 100 })} />
    </ToolSheet>
  );
}
