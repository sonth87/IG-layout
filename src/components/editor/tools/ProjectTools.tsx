"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Background } from "@/lib/project/types";
import { MAX_SLIDES } from "@/lib/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, Swatches, ToolSheet } from "./controls";

const GRADIENTS: [string, string][] = [
  ["#f3e3c3", "#d9728a"],
  ["#6e8fb3", "#f0c08a"],
  ["#111214", "#3b3f6b"],
  ["#9dbf8e", "#f6e58d"],
  ["#e6e3dd", "#ffffff"],
  ["#8e8fc9", "#f28b82"],
];

export function BackgroundTool({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const assets = useEditor((s) => s.assets);
  const updateDraft = useEditor((s) => s.updateDraft);
  const applyDraft = useEditor((s) => s.applyDraft);
  const cancelDraft = useEditor((s) => s.cancelDraft);
  const [tab, setTab] = useState<Background["kind"]>(doc?.background.kind ?? "color");
  if (!doc) return null;
  const bg = doc.background;
  const set = (background: Background) => updateDraft((d) => ({ ...d, background }));
  const usedAssets = Object.values(assets).filter((a) => doc.elements.some((el) => el.assetId === a.id));

  return (
    <ToolSheet
      title={t("tool.background")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div role="tablist" className="mb-2 flex gap-5 border-b border-border">
        {(["color", "gradient", "blur"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`h-10 text-sm ${tab === k ? "border-b-2 border-accent font-bold" : "text-muted"}`}
          >
            {t(`bg.${k}`)}
          </button>
        ))}
      </div>

      {tab === "color" && (
        <Swatches value={bg.kind === "color" ? bg.color : "#ffffff"} onChange={(color) => set({ kind: "color", color })} />
      )}

      {tab === "gradient" && (
        <>
          <div className="flex flex-wrap gap-2 py-2">
            {GRADIENTS.map(([from, to]) => {
              const active = bg.kind === "gradient" && bg.from === from && bg.to === to;
              return (
                <button
                  key={from + to}
                  type="button"
                  aria-label={`${from} → ${to}`}
                  aria-pressed={active}
                  onClick={() => set({ kind: "gradient", from, to, angle: bg.kind === "gradient" ? bg.angle : 90 })}
                  className={`h-10 w-10 rounded-xl border ${active ? "border-2 border-accent" : "border-border-2"}`}
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                />
              );
            })}
          </div>
          {bg.kind === "gradient" && (
            <Slider
              label={t("bg.angle")}
              value={bg.angle}
              min={0}
              max={360}
              step={5}
              defaultValue={90}
              format={(v) => `${v}°`}
              onChange={(angle) => set({ ...bg, angle })}
            />
          )}
        </>
      )}

      {tab === "blur" && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {usedAssets.length === 0 && <p className="text-sm text-muted">{t("bg.noPhotos")}</p>}
          {usedAssets.map((a) => {
            const active = bg.kind === "blur" && bg.assetId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={active}
                aria-label={a.name}
                onClick={() => set({ kind: "blur", assetId: a.id })}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl ${active ? "ring-2 ring-accent" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob thumbnail */}
                <img src={a.url} alt="" className="h-full w-full object-cover blur-[2px]" />
              </button>
            );
          })}
        </div>
      )}
    </ToolSheet>
  );
}

/** Slide management acts directly (each action = one history step). */
export function SlidesTool({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const current = useEditor((s) => s.currentSlide);
  const { insertSlide, deleteSlide, moveSlide, setCurrentSlide } = useEditor.getState();
  if (!doc) return null;
  const index = Math.min(current, doc.slideCount - 1);

  const button = "flex h-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-border text-[11px] disabled:text-disabled";

  return (
    <section aria-label={t("editor.slides")} className="rounded-t-[20px] bg-surface px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-[15px] font-bold">{t("slides.title", { index: index + 1, count: doc.slideCount })}</h2>
        <button type="button" onClick={onClose} className="h-8 rounded-[10px] border border-border px-3 text-[13px] font-semibold">
          {t("common.done")}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className={button}
          disabled={index === 0}
          onClick={() => {
            moveSlide(index, -1);
            setCurrentSlide(index - 1);
          }}
        >
          <Icon name="back" />
          {t("slides.moveLeft")}
        </button>
        <button
          type="button"
          className={button}
          disabled={index >= doc.slideCount - 1}
          onClick={() => {
            moveSlide(index, 1);
            setCurrentSlide(index + 1);
          }}
        >
          <span className="rotate-180">
            <Icon name="back" />
          </span>
          {t("slides.moveRight")}
        </button>
        <button type="button" className={button} disabled={doc.slideCount >= MAX_SLIDES} onClick={() => insertSlide(index)}>
          <Icon name="plus" />
          {t("slides.add")}
        </button>
        <button
          type="button"
          className={`${button} text-danger`}
          disabled={doc.slideCount <= 1}
          onClick={() => {
            deleteSlide(index);
            setCurrentSlide(Math.max(0, index - 1));
          }}
        >
          <Icon name="trash" />
          {t("slides.delete")}
        </button>
      </div>
    </section>
  );
}
