import { create } from "zustand";
import { type ImageAsset, newId } from "@/lib/project/types";
import { db, type LibraryItem } from "./db";

// The user's own library, on this device, shared by every project (M19, editor-v2/11
// §3, §8): saved stickers, Brand Kit logos and assets, brand colours.

export async function listLibrary(kind: LibraryItem["kind"]) {
  const items = await (await db()).getAllFromIndex("library", "kind", kind);
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveLibrary(kind: LibraryItem["kind"], blob: Blob, width: number, height: number, name: string) {
  const item: LibraryItem = { id: newId(), kind, blob, width, height, name, createdAt: Date.now() };
  await (await db()).put("library", item);
  return item;
}

export async function deleteLibrary(id: string) {
  await (await db()).delete("library", id);
}

/** A library item as a new asset of the open project. */
export function libraryAsset(item: LibraryItem): ImageAsset {
  return { id: newId(), blob: item.blob, url: URL.createObjectURL(item.blob), width: item.width, height: item.height, name: item.name };
}

const BRAND_KEY = "ig-layout:brand-colors";
const RECENT_KEY = "ig-layout:recent-stickers";

function read<T>(key: string, fallback: T): T {
  try {
    return typeof window === "undefined" ? fallback : (JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback);
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: kept for this visit only.
  }
}

/** A sticker added lately: one of ours, or an emoji (with its SVG). */
export type RecentSticker = { kind: "sticker"; key: string } | { kind: "emoji"; name: string; body: string };

export const useBrand = create<{
  colors: string[];
  recent: RecentSticker[];
  addColor: (c: string) => void;
  removeColor: (c: string) => void;
  used: (s: RecentSticker) => void;
}>()((set, get) => ({
  colors: read<string[]>(BRAND_KEY, []),
  recent: read<RecentSticker[]>(RECENT_KEY, []),
  addColor: (c) => {
    const colors = [c, ...get().colors.filter((x) => x !== c)].slice(0, 16);
    set({ colors });
    write(BRAND_KEY, colors);
  },
  removeColor: (c) => {
    const colors = get().colors.filter((x) => x !== c);
    set({ colors });
    write(BRAND_KEY, colors);
  },
  used: (s) => {
    const same = (x: RecentSticker) => (x.kind === "sticker" && s.kind === "sticker" ? x.key === s.key : x.kind === "emoji" && s.kind === "emoji" && x.name === s.name);
    const recent = [s, ...get().recent.filter((x) => !same(x))].slice(0, 12);
    set({ recent });
    write(RECENT_KEY, recent);
  },
}));
