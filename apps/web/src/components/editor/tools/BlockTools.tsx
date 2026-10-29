"use client";

import { useState } from "react";
import { isLayout } from "@ig-layout/core/project/blocks";
import { GRID_LINE, SLIDE_GRIDS, SLIDE_LAYOUTS, slideLayoutById } from "@ig-layout/core/templates/slideLayouts";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Thumb } from "../NewSlideSheet";
import { Slider, Swatches, ToolSheet } from "./controls";

// Sheets of a layout block (M17, editor-v2/08 §4–5). Both work on the draft: ✓ is one
// undo step, ✕ puts the block back as it was.

function useBlock(id: string) {
  const el = useViewDoc()?.elements.find((e) => e.id === id);
  return isLayout(el) ? el : undefined;
}

/** Another split for the block; photos keep their order, extras go beside it. */
export function BlockLayoutTool({ elementId, onClose, onOutside }: { elementId: string; onClose: () => void; onOutside: (n: number) => void }) {
  const t = useT();
  const block = useBlock(elementId);
  const [outside, setOutside] = useState(0);
  const { relayoutDraft, applyDraft, cancelDraft } = useEditor.getState();
  if (!block) return null;
  const aspect = block.width / block.height;
  const list = (title: string, items: typeof SLIDE_GRIDS, label: (i: number) => string) => (
    <section className="pb-3">
      <h3 className="pb-1.5 text-[12px] font-semibold text-muted">{title}</h3>
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
        {items.map((l, i) => (
          <button
            key={l.id}
            type="button"
            aria-label={label(i + 1)}
            aria-pressed={block.layout === l.id}
            onClick={() => setOutside(relayoutDraft(block.id, l.id))}
            className={`rounded-md p-0.5 ${block.layout === l.id ? "ring-2 ring-accent" : ""}`}
          >
            <Thumb layout={l} aspect={aspect} />
          </button>
        ))}
      </div>
    </section>
  );
  return (
    <ToolSheet
      title={t("block.layout")}
      onApply={() => {
        applyDraft();
        if (outside) onOutside(outside);
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div className="max-h-[40dvh] overflow-y-auto">
        {list(t("newSlide.grids"), SLIDE_GRIDS, (i) => t("newSlide.gridItem", { index: i }))}
        {list(t("newSlide.layouts"), SLIDE_LAYOUTS, (i) => t("newSlide.layoutItem", { index: i }))}
      </div>
    </ToolSheet>
  );
}

/** Gap, margin, corners and background of a block (editor-v2/08 §5). */
export function BlockAdjustTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const block = useBlock(elementId);
  const { patchDraft, applyDraft, cancelDraft } = useEditor.getState();
  if (!block) return null;
  const def = block.layout ? slideLayoutById(block.layout) : undefined;
  const spaced = def?.kind === "grid";
  const W = block.width;
  const px = (v: number | undefined, fallback: number) => Math.round((v ?? fallback) * W);
  return (
    <ToolSheet
      title={t("block.adjust")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      {spaced ? (
        <>
          <Slider label={t("block.gap")} value={px(block.gap, GRID_LINE)} min={0} max={80} defaultValue={Math.round(GRID_LINE * W)} format={(v) => `${v}px`} onChange={(v) => patchDraft(block.id, { gap: v / W })} />
          <Slider label={t("block.padding")} value={px(block.padding, 0)} min={0} max={120} defaultValue={0} format={(v) => `${v}px`} onChange={(v) => patchDraft(block.id, { padding: v / W })} />
        </>
      ) : (
        <p className="pb-1 text-xs text-muted">{t("block.legacy")}</p>
      )}
      <Slider label={t("block.radius")} value={px(block.radius, 0)} min={0} max={160} defaultValue={0} format={(v) => `${v}px`} onChange={(v) => patchDraft(block.id, { radius: v / W })} />
      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0 text-[13px] text-muted">{t("block.fill")}</span>
        <button
          type="button"
          aria-pressed={!block.fill}
          onClick={() => patchDraft(block.id, { fill: null })}
          className={`h-8 shrink-0 rounded-full px-3 text-[12px] ${!block.fill ? "bg-text font-bold text-bg" : "border border-border"}`}
        >
          {t("block.none")}
        </button>
      </div>
      <Swatches value={block.fill ?? "#ffffff"} onChange={(c) => patchDraft(block.id, { fill: c })} />
    </ToolSheet>
  );
}
