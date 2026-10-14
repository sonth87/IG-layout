"use client";

import { create } from "zustand";
import { en, type MessageKey } from "@/lib/i18n/en";
import { vi } from "@/lib/i18n/vi";

// Per-device preferences, kept in localStorage (a convenience: losing it only
// resets to defaults). The inline script in app/layout.tsx applies the theme
// before first paint using the same key.

export type ThemeSetting = "system" | "light" | "dark";
export type Locale = "en" | "vi";

export const SETTINGS_KEY = "ig-layout:settings";

const DICTS: Record<Locale, Record<MessageKey, string>> = { en, vi };

interface SettingsState {
  theme: ThemeSetting;
  locale: Locale;
  setTheme: (theme: ThemeSetting) => void;
  setLocale: (locale: Locale) => void;
}

function read(): Pick<SettingsState, "theme" | "locale"> {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    return {
      theme: ["light", "dark"].includes(raw.theme) ? raw.theme : "system",
      locale: raw.locale === "vi" ? "vi" : "en",
    };
  } catch {
    return { theme: "system", locale: "en" };
  }
}

function write(state: Pick<SettingsState, "theme" | "locale">) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
  } catch {
    // Private mode or blocked storage: settings just won't persist.
  }
}

export function applyTheme(theme: ThemeSetting) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
}

export const useSettings = create<SettingsState>()((set, get) => ({
  // Read synchronously on the client so the first render already uses saved settings.
  ...(typeof window === "undefined" ? { theme: "system" as const, locale: "en" as const } : read()),
  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
    write({ theme, locale: get().locale });
  },
  setLocale: (locale) => {
    set({ locale });
    document.documentElement.lang = locale;
    write({ theme: get().theme, locale });
  },
}));

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>) {
  let text: string = DICTS[locale][key] ?? en[key];
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
