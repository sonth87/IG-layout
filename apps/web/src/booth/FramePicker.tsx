"use client";

import { FRAMES } from "@ig-layout/core/booth/frames";
import type { RenderOptions } from "@ig-layout/core/booth/render";
import { useT } from "@/store/settings";
import { FrameCanvas } from "./FrameCanvas";
import { mono, useFrameName } from "./ui";

// The frames as paper cards (the one picked lifts, inked, red shadow). Used before shooting
// and while decorating (D-147: the frame can change after the shots).

const EMPTY: never[] = [];

export function FramePicker({ value, onChange, look, compact }: { value: string; onChange: (id: string) => void; look?: RenderOptions; compact?: boolean }) {
  const t = useT();
  const frameName = useFrameName();
  return (
    <div
      role="radiogroup"
      aria-label={t("booth.frame")}
      className={compact ? "flex gap-2.5 overflow-x-auto px-4 py-2.5" : "flex gap-3 overflow-x-auto px-5 pt-3 pb-4 md:flex-wrap md:overflow-visible"}
    >
      {FRAMES.map((f) => {
        const on = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(f.id)}
            className={`flex shrink-0 flex-col items-center border-2 border-[var(--c-ink)] transition-[transform,box-shadow] duration-100 ${compact ? "w-[84px] gap-1 p-1.5" : "w-[100px] gap-1.5 p-2"} ${on ? "-translate-y-1 bg-[var(--c-ink)] text-[var(--c-paper)] shadow-[4px_4px_0_var(--c-red)]" : "bg-[var(--c-paper2)] shadow-[3px_3px_0_var(--c-shadow)]"}`}
          >
            <span className={`flex items-center ${compact ? "h-[58px]" : "h-[88px]"}`}>
              <FrameCanvas
                frame={f}
                images={EMPTY}
                look={{ ...look, placeholders: true }}
                scale={(compact ? 160 : 220) / Math.max(f.width, f.height)}
                className={`${compact ? "max-h-[58px] max-w-[68px]" : "max-h-[88px] max-w-[84px]"} shadow-[2px_2px_0_rgba(11,8,6,0.5)]`}
              />
            </span>
            <span className={`${mono} text-[10px] font-bold uppercase leading-tight tracking-wider`}>{frameName(f.id)}</span>
            <span className={`${mono} text-[9px] opacity-60`}>
              {f.size} · {t("booth.shots", { count: f.shots })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
