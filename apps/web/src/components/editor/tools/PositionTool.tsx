"use client";

import { useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { moveUnit, units } from "@ig-layout/core/project/blocks";
import { type Align, alignPatch, type Fill, fillPatch, flipPatch } from "@ig-layout/core/project/position";
import type { CanvasElement } from "@ig-layout/core/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { ToolSheet } from "./controls";

// "Position" sheet (M17, editor-v2/08 §1): arrange, nudge, align, fill, flip; exact
// numbers in "Advanced". Works on the draft: ✓ is one undo step, ✕ puts everything back.

type Key = Parameters<ReturnType<typeof useT>>[0];

function Grid(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="pb-3">
      <h3 className="pb-1.5 text-[12px] font-semibold text-muted">{props.title}</h3>
      <div className="grid grid-cols-4 gap-1">{props.children}</div>
    </section>
  );
}

function Cell(props: { label: string; icon: IconName; disabled?: boolean; onClick: () => void; repeat?: boolean }) {
  // Nudge buttons repeat while held, faster and faster.
  const timer = useRef(0);
  const stop = () => clearTimeout(timer.current);
  const hold = (delay: number) => {
    props.onClick();
    timer.current = window.setTimeout(() => hold(Math.max(30, delay * 0.8)), delay);
  };
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.repeat ? undefined : props.onClick}
      onPointerDown={props.repeat ? () => hold(350) : undefined}
      onPointerUp={props.repeat ? stop : undefined}
      onPointerLeave={props.repeat ? stop : undefined}
      onPointerCancel={props.repeat ? stop : undefined}
      className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] leading-tight hover:bg-surface-2 disabled:opacity-35"
    >
      <Icon name={props.icon} size={21} />
      <span className="px-0.5 text-center">{props.label}</span>
    </button>
  );
}

function NumberField(props: { label: string; value: number; onCommit: (v: number) => void; suffix?: string }) {
  const [text, setText] = useState<string | null>(null);
  const commit = () => {
    if (text === null) return;
    const v = Number(text.replace(",", "."));
    if (Number.isFinite(v)) props.onCommit(v);
    setText(null);
  };
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-[12px] text-muted">
      {props.label}
      <span className="flex items-center rounded-xl border border-border bg-surface-2 px-3">
        <input
          inputMode="decimal"
          value={text ?? String(Math.round(props.value))}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-text tabular-nums outline-none"
        />
        {props.suffix && <span className="text-[13px]">{props.suffix}</span>}
      </span>
    </label>
  );
}

export function PositionTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const { patchDraft, updateDraft, applyDraft, cancelDraft } = useEditor.getState();
  const [tab, setTab] = useState<"position" | "advanced">("position");
  const [keepRatio, setKeepRatio] = useState(true);
  const el = doc?.elements.find((e) => e.id === elementId);
  if (!doc || !el) return null;
  const list = units(doc);
  const at = list.findIndex((u) => u[0].id === el.id);
  const top = at === list.length - 1;
  const bottom = at === 0;
  const fixed = !!el.locked || !!el.parentId;
  const isText = el.type === "text";
  const patch = (p: Partial<CanvasElement>) => patchDraft(el.id, p);
  const layer = (to: (from: number, count: number) => number) => updateDraft((d) => moveUnit(d, el.id, to));
  const nudge = (dx: number, dy: number) => {
    // Reads the latest draft: held buttons call this many times.
    const cur = useEditor.getState().draft?.elements.find((e) => e.id === el.id);
    if (cur) patch({ x: cur.x + dx, y: cur.y + dy });
  };
  const align = (how: Align) => patch(alignPatch(doc, el, how));
  const fill = (how: Fill) => patch(fillPatch(doc, el, how));
  const flip = flipPatch(el, "x");

  return (
    <ToolSheet
      title={t("pos.title")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div role="tablist" className="mb-3 flex gap-1 rounded-full bg-surface-2 p-1">
        {(["position", "advanced"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`h-9 flex-1 rounded-full text-[13px] ${tab === k ? "bg-surface font-bold shadow-sm" : "text-muted"}`}
          >
            {t(k === "position" ? "pos.tab" : "pos.advanced")}
          </button>
        ))}
      </div>
      {tab === "position" ? (
        <div className="max-h-[42dvh] overflow-y-auto">
          <Grid title={t("pos.layer")}>
            <Cell label={t("pos.toFront")} icon="toFront" disabled={top || !!el.parentId} onClick={() => layer((_f, n) => n - 1)} />
            <Cell label={t("pos.forward")} icon="layerUp" disabled={top || !!el.parentId} onClick={() => layer((f) => f + 1)} />
            <Cell label={t("pos.backward")} icon="layerDown" disabled={bottom || !!el.parentId} onClick={() => layer((f) => f - 1)} />
            <Cell label={t("pos.toBack")} icon="toBack" disabled={bottom || !!el.parentId} onClick={() => layer(() => 0)} />
          </Grid>
          <Grid title={t("pos.nudge")}>
            <Cell label={t("pos.left")} icon="arrowLeft" disabled={fixed} repeat onClick={() => nudge(-1, 0)} />
            <Cell label={t("pos.right")} icon="arrowRight" disabled={fixed} repeat onClick={() => nudge(1, 0)} />
            <Cell label={t("pos.up")} icon="arrowUp" disabled={fixed} repeat onClick={() => nudge(0, -1)} />
            <Cell label={t("pos.down")} icon="arrowDown" disabled={fixed} repeat onClick={() => nudge(0, 1)} />
          </Grid>
          <section className="pb-3">
            <h3 className="pb-1.5 text-[12px] font-semibold text-muted">{t("pos.align")}</h3>
            <div className="grid grid-cols-6 gap-1">
              {(
                [
                  ["left", "alignLeft", "pos.alignLeft"],
                  ["centerX", "alignCenter", "pos.alignCenterX"],
                  ["right", "alignRight", "pos.alignRight"],
                  ["top", "alignTop", "pos.alignTop"],
                  ["centerY", "alignMiddle", "pos.alignCenterY"],
                  ["bottom", "alignBottom", "pos.alignBottom"],
                ] as [Align, IconName, Key][]
              ).map(([how, icon, label]) => (
                <Cell key={how} label={t(label)} icon={icon} disabled={fixed} onClick={() => align(how)} />
              ))}
            </div>
          </section>
          <Grid title={t("pos.fill")}>
            <Cell label={t("pos.fillHeight")} icon="fillHeight" disabled={fixed || isText} onClick={() => fill("height")} />
            <Cell label={t("pos.fillWidth")} icon="fillWidth" disabled={fixed || isText} onClick={() => fill("width")} />
            <Cell label={t("pos.fillWidth2")} icon="fillWidth2" disabled={fixed || isText || doc.slideCount < 2} onClick={() => fill("width2")} />
          </Grid>
          <Grid title={t("pos.flip")}>
            <Cell label={t("pos.flipH")} icon="flipH" disabled={!flip} onClick={() => patch(flipPatch(el, "x")!)} />
            <Cell label={t("pos.flipV")} icon="flipV" disabled={!flip} onClick={() => patch(flipPatch(el, "y")!)} />
          </Grid>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-end gap-2">
            <NumberField
              label={t("pos.width")}
              value={el.width}
              onCommit={(w) => {
                if (w < 10 || fixed) return;
                const h = keepRatio ? (el.height * w) / el.width : el.height;
                patch({ width: w, height: h, x: el.x + (el.width - w) / 2, y: el.y + (el.height - h) / 2 });
              }}
            />
            <button
              type="button"
              aria-label={t("pos.lockRatio")}
              aria-pressed={keepRatio}
              onClick={() => setKeepRatio(!keepRatio)}
              className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${keepRatio ? "bg-accent-soft text-accent-text" : "text-muted"}`}
            >
              <Icon name={keepRatio ? "lock" : "unlock"} size={18} />
            </button>
            <NumberField
              label={t("pos.height")}
              value={el.height}
              onCommit={(h) => {
                if (h < 10 || fixed || isText) return;
                const w = keepRatio ? (el.width * h) / el.height : el.width;
                patch({ width: w, height: h, x: el.x + (el.width - w) / 2, y: el.y + (el.height - h) / 2 });
              }}
            />
          </div>
          <div className="flex gap-2">
            <NumberField label={t("pos.x")} value={el.x} onCommit={(x) => !fixed && patch({ x })} />
            <NumberField label={t("pos.y")} value={el.y} onCommit={(y) => !fixed && patch({ y })} />
            <NumberField label={t("pos.rotation")} value={el.rotation} suffix="°" onCommit={(r) => {
                if (fixed) return;
                const n = ((r % 360) + 360) % 360;
                patch({ rotation: n > 180 ? n - 360 : n });
              }} />
          </div>
        </div>
      )}
    </ToolSheet>
  );
}
