"use client";

import { create } from "zustand";
import { en, type MessageKey } from "@ig-layout/core/i18n/en";
import { vi } from "@ig-layout/core/i18n/vi";
import type { Locale } from "@ig-layout/core/i18n/locale";

// Per-device preferences, kept in localStorage (a convenience: losing it only
// resets to defaults). The inline script in app/layout.tsx applies the theme
// before first paint using the same key.

export type ThemeSetting = "system" | "light" | "dark";
export type { Locale };

export const SETTINGS_KEY = "ig-layout:settings";

const DICTS: Record<Locale, Record<MessageKey, string>> = { en, vi };

interface SettingsState {
  theme: ThemeSetting;
  locale: Locale;
  /** Guides, equal-size ruler and angle snapping (project ⋯ → Snap, editor-v2/12 §2). */
  snap: boolean;
  setTheme: (theme: ThemeSetting) => void;
  setLocale: (locale: Locale) => void;
  setSnap: (on: boolean) => void;
}

function read(): Pick<SettingsState, "theme" | "locale" | "snap"> {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    return {
      theme: ["light", "dark"].includes(raw.theme) ? raw.theme : "system",
      locale: raw.locale === "vi" ? "vi" : "en",
      snap: raw.snap !== false,
    };
  } catch {
    return { theme: "system", locale: "en", snap: true };
  }
}

function write(state: Pick<SettingsState, "theme" | "locale" | "snap">) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
  } catch {
    // Private mode or blocked storage: settings just won't persist.
  }
}

const THEME_COLOR = { light: "#f6f5f2", dark: "#111214" };

/**
 * The chosen theme on <html>, and told to the browser too: `color-scheme` (keyboard,
 * form controls, overscroll) and the status-bar colour follow the app, not the system.
 */
export function applyTheme(theme: ThemeSetting) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  root.style.colorScheme = theme === "system" ? "light dark" : theme;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    const media = m.getAttribute("media") ?? "";
    m.content = theme === "system" ? (media.includes("dark") ? THEME_COLOR.dark : THEME_COLOR.light) : THEME_COLOR[theme];
  });
}

export const useSettings = create<SettingsState>()((set, get) => ({
  // Read synchronously on the client so the first render already uses saved settings.
  ...(typeof window === "undefined" ? { theme: "system" as const, locale: "en" as const, snap: true } : read()),
  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
    write({ theme, locale: get().locale, snap: get().snap });
  },
  setLocale: (locale) => {
    set({ locale });
    document.documentElement.lang = locale;
    write({ theme: get().theme, locale, snap: get().snap });
  },
  setSnap: (snap) => {
    set({ snap });
    write({ theme: get().theme, locale: get().locale, snap });
  },
}));

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>) {
  // A missing key shows the key itself rather than breaking the screen.
  let text: string = DICTS[locale][key] ?? en[key] ?? key;
  if (vars) {
    // Plurals: "{count|photo|photos}" picks the form by the value of `count`.
    text = text.replace(/\{(\w+)\|([^|}]*)\|([^}]*)\}/g, (_, k: string, one: string, many: string) =>
      Number(vars[k]) === 1 ? one : many,
    );
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

export function useT() {
  const locale = useSettings((s) => s.locale);
  return (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
}
