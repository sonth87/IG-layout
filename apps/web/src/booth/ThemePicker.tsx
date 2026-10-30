"use client";

import type { ReactNode } from "react";
import { THEME_GROUPS, THEMES, type BoothTheme, type ThemeGroup } from "@ig-layout/core/booth/themes";
import { loadLobby, type LobbyId } from "./lobby/themes";

/** The lobby scene's own group goes first (owner, 2026-10-30: the inside follows the lobby). */
const SCENE_GROUP: Record<LobbyId, ThemeGroup> = { cinema: "cinema", noel: "xmas", tet: "tet", halloween: "halloween", cyber: "cyber", glitch: "glitch" };
import { useT } from "@/store/settings";
import { mono } from "./ui";

// Themes in their groups (D-161 step 3): a row per group, each theme a paper card — its
// preview (the roll in that theme, while decorating) or its colours (before shooting).

export function ThemePicker({ value, onPick, preview, compact }: { value: string; onPick: (t: BoothTheme) => void; preview?: (t: BoothTheme) => ReactNode; compact?: boolean }) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t("booth.tab.theme")} className={compact ? "flex gap-2 overflow-x-auto px-5 pt-2 pb-3" : "flex flex-col gap-3 px-5 pt-3 pb-4"}>
      {[SCENE_GROUP[loadLobby()], ...THEME_GROUPS.filter((g) => g !== SCENE_GROUP[loadLobby()])].map((g) => {
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
              className={`flex shrink-0 flex-col items-center gap-1.5 border-2 border-[var(--c-ink)] p-1.5 transition-[transform,box-shadow] duration-100 ${compact ? "w-[72px]" : "w-[92px]"} ${on ? "-translate-y-1 bg-[var(--c-ink)] text-[var(--c-paper)] shadow-[4px_4px_0_var(--c-red)]" : "bg-[var(--c-paper2)] shadow-[3px_3px_0_var(--c-shadow)]"}`}
            >
              {preview ? (
                <span className="flex h-[96px] items-center">{preview(th)}</span>
              ) : (
                <span aria-hidden className="flex h-9 w-full overflow-hidden border border-[var(--c-ink)]/40">
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
            <p className={`${mono} text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--c-red)]`}>{t(`booth.group.${g}` as Parameters<typeof t>[0])}</p>
            <div className="mt-1.5 flex gap-3 overflow-x-auto pt-1 pb-2 md:flex-wrap md:overflow-visible">{cards}</div>
          </section>
        );
      })}
    </div>
  );
}
