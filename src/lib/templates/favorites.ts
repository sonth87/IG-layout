import { create } from "zustand";

// Templates the user liked (♡), kept on this device (editor-v2/03 §4).

const KEY = "ig-layout:favorites";

function read(): string[] {
  try {
    return typeof window === "undefined" ? [] : (JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return [];
  }
}

export const useFavorites = create<{ ids: string[]; toggle: (id: string) => void }>()((set, get) => ({
  ids: read(),
  toggle: (id) => {
    const ids = get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [id, ...get().ids];
    set({ ids });
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // Storage blocked: likes last for this visit only.
    }
  },
}));
