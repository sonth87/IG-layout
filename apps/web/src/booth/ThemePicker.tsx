"use client";

import type { ReactNode } from "react";
import { THEME_GROUPS, THEMES, type BoothTheme } from "@ig-layout/core/booth/themes";
import { useT } from "@/store/settings";
import { mono } from "./ui";

// Themes in their groups (D-161 step 3): a row per group, each theme a paper card — its
// preview (the roll in that theme, while decorating) or its colours (before shooting).

export function ThemePicker({ value, onPick, preview, compact }: { value: string; onPick: (t: BoothTheme) => void; preview?: (t: BoothTheme) => ReactNode; compact?: boolean }) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t("booth.tab.theme")} className={compact ? "flex gap-2 overflow-x-auto px-5 pt-2 pb-3" : "flex flex-col gap-3 px-5 pt-3 pb-4"}>
      {THEME_GROUPS.map((g) => {
        const list = THEMES.filter((th) => th.group === g);
        const cards = list.map((th) => {
          const on = th.id === value;
          return (
            <button
              key={th.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t(`booth.theme.${th.id}` as Parameters<typeof t>[0])}
              data-theme-id={th.id}
              onClick={() => onPick(th)}
              className={`flex shrink-0 flex-col items-center gap-1.5 border-2 border-[#1d1612] p-1.5 transition-[transform,box-shadow] duration-100 ${compact ? "w-[72px]" : "w-[92px]"} ${on ? "-translate-y-1 bg-[#1d1612] text-[#f3e9d6] shadow-[4px_4px_0_#c8432f]" : "bg-[#e7d9bd] shadow-[3px_3px_0_#0b0806]"}`}
            >
              {preview ? (
                <span className="flex h-[96px] items-center">{preview(th)}</span>
              ) : (
                <span aria-hidden className="flex h-9 w-full overflow-hidden border border-[#1d1612]/40">
                  {th.swatch.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
              )}
              <span className={`${mono} text-center text-[9.5px] font-bold uppercase leading-tight tracking-wider`}>{t(`booth.theme.${th.id}` as Parameters<typeof t>[0])}</span>
            </button>
          );
        });
        if (compact) return cards;
        return (
          <section key={g}>
            <p className={`${mono} text-[10px] font-bold uppercase tracking-[0.25em] text-[#c8432f]`}>{t(`booth.group.${g}` as Parameters<typeof t>[0])}</p>
            <div className="mt-1.5 flex gap-3 overflow-x-auto pt-1 pb-2 lg:flex-wrap lg:overflow-visible">{cards}</div>
          </section>
        );
      })}
    </div>
  );
}
