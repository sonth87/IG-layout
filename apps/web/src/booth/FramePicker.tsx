"use client";

import { FRAMES } from "@ig-layout/core/booth/frames";
import type { RenderOptions } from "@ig-layout/core/booth/render";
import { useT } from "@/store/settings";
import { FrameCanvas } from "./FrameCanvas";
import { mono, useFrameName } from "./ui";

// The frames as paper cards (the one picked lifts, inked, red shadow). Used before shooting
// and while decorating (D-147: the frame can change after the shots).

const EMPTY: never[] = [];

export function FramePicker({ value, onChange, look }: { value: string; onChange: (id: string) => void; look?: RenderOptions }) {
  const t = useT();
  const frameName = useFrameName();
  return (
    <div role="radiogroup" aria-label={t("booth.frame")} className="flex gap-3 overflow-x-auto px-5 pt-3 pb-4 lg:flex-wrap lg:overflow-visible">
      {FRAMES.map((f) => {
        const on = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(f.id)}
            className={`flex w-[100px] shrink-0 flex-col items-center gap-1.5 border-2 border-[#1d1612] p-2 transition-[transform,box-shadow] duration-100 ${on ? "-translate-y-1 bg-[#1d1612] text-[#f3e9d6] shadow-[4px_4px_0_#c8432f]" : "bg-[#e7d9bd] shadow-[3px_3px_0_#0b0806]"}`}
          >
            <span className="flex h-[88px] items-center">
              <FrameCanvas frame={f} images={EMPTY} look={look} scale={220 / Math.max(f.width, f.height)} className="max-h-[88px] max-w-[84px] shadow-[2px_2px_0_rgba(11,8,6,0.5)]" />
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
