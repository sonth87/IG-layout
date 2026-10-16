"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { motionDuration } from "@/lib/motion/motion";
import { ANIM_IN, ANIM_OUT, KEN_BURNS, type Motion } from "@/lib/project/types";
import { pause, play, seek } from "@/lib/video/playback";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, ToolSheet } from "./controls";

type Tab = "in" | "out" | "kenBurns";

/**
 * Animation of the selected element (M13.3): entrance, exit (and Ken Burns for photos /
 * videos), their timing, and how long animated slides last. "Preview" plays the
 * project from the start. Draft tool (✕ / ✓ = one undo step).
 */
export function AnimationTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const el = doc?.elements.find((e) => e.id === elementId);
  const { updateDraft, applyDraft, cancelDraft } = useEditor.getState();
  const [tab, setTab] = useState<Tab>("in");
  if (!doc || !el) return null;
  const m: Motion = el.motion ?? {};
  const isPicture = el.type === "image";
  const set = (patch: Partial<Motion>) =>
    updateDraft((d) => {
      const next = { ...m, ...patch };
      for (const k of Object.keys(next) as (keyof Motion)[]) if (next[k] === undefined) delete next[k];
      return updateEl(d, elementId, { motion: Object.keys(next).length ? next : undefined });
    });
  const finish = (fn: () => void) => () => {
    pause();
    seek(0);
    fn();
    onClose();
  };
  const tabs: Tab[] = isPicture ? ["in", "out", "kenBurns"] : ["in", "out"];
  const chip = (on: boolean) => `h-9 shrink-0 rounded-full px-3.5 text-[13px] ${on ? "bg-text font-bold text-bg" : "border border-border"}`;
  const options: readonly string[] = tab === "in" ? ANIM_IN.filter((a) => a !== "typewriter" || el.type === "text") : tab === "out" ? ANIM_OUT : KEN_BURNS;
  const value = tab === "in" ? m.in : tab === "out" ? m.out : m.kenBurns;
  const pick = (v: string | undefined) => set(tab === "in" ? { in: v as Motion["in"] } : tab === "out" ? { out: v as Motion["out"] } : { kenBurns: v as Motion["kenBurns"] });

  return (
    <ToolSheet title={t("anim.title")} onApply={finish(applyDraft)} onCancel={finish(cancelDraft)}>
      <div role="tablist" className="mb-2 flex gap-5 border-b border-border">
        {tabs.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`h-10 text-sm ${tab === k ? "border-b-2 border-accent font-bold" : "text-muted"}`}
          >
            {t(`anim.tab.${k}`)}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label={t(`anim.tab.${tab}`)} className="flex gap-2 overflow-x-auto pb-1">
        <button type="button" role="radio" aria-checked={!value} onClick={() => pick(undefined)} className={chip(!value)}>
          {t("anim.none")}
        </button>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => pick(o)} className={chip(value === o)}>
            {t(`anim.${o}` as "anim.fade")}
          </button>
        ))}
      </div>
      {tab === "in" && m.in && (
        <>
          <Slider label={t("anim.duration")} value={m.inDuration ?? 0.6} min={0.2} max={3} step={0.1} defaultValue={0.6} format={(v) => `${v.toFixed(1)} s`} onChange={(v) => set({ inDuration: v })} />
          <Slider label={t("anim.delay")} value={m.delay ?? 0} min={0} max={5} step={0.1} defaultValue={0} format={(v) => `${v.toFixed(1)} s`} onChange={(v) => set({ delay: v || undefined })} />
        </>
      )}
      {tab === "out" && m.out && (
        <Slider label={t("anim.duration")} value={m.outDuration ?? 0.6} min={0.2} max={3} step={0.1} defaultValue={0.6} format={(v) => `${v.toFixed(1)} s`} onChange={(v) => set({ outDuration: v })} />
      )}
      <Slider
        label={t("anim.slideLength")}
        value={motionDuration(doc)}
        min={2}
        max={15}
        step={0.5}
        defaultValue={5}
        format={(v) => `${v} s`}
        onChange={(v) => updateDraft((d) => ({ ...d, motionDuration: v === 5 ? undefined : v }))}
      />
      <p className="pb-1 text-xs text-muted">{t("anim.slideLengthHint")}</p>
      <button
        type="button"
        onClick={() => {
          seek(0);
          play();
        }}
        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-2 text-sm font-semibold"
      >
        <Icon name="play" size={16} />
        {t("anim.preview")}
      </button>
    </ToolSheet>
  );
}
