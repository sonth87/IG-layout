// Loads the asset catalog on demand (M20, docs/architecture/asset-catalog.md §7):
// catalog.json once, each pack's items when its library is opened. The service worker
// keeps what was fetched, so opened packs work offline.

import { create } from "zustand";
import { newId, type ImageAsset } from "@/lib/project/types";
import type { Catalog, CatalogItem, CatalogKind, CatalogPack } from "./types";

const BASE = "/packs/";
const EMPTY: Catalog = { version: 1, packs: [], fonts: [], credits: [] };

interface CatalogState {
  catalog: Catalog | null;
  /** Items of the packs loaded so far, by pack id. */
  items: Record<string, CatalogItem[]>;
}

export const useCatalog = create<CatalogState>(() => ({ catalog: null, items: {} }));

let catalogLoad: Promise<Catalog> | null = null;
const packLoads = new Map<string, Promise<CatalogItem[]>>();

/** The catalog (empty when there is none yet or offline before the first visit). */
export function loadCatalog(): Promise<Catalog> {
  catalogLoad ??= fetch(`${BASE}catalog.json`)
    .then((r) => (r.ok ? (r.json() as Promise<Catalog>) : EMPTY))
    .catch(() => EMPTY)
    .then((catalog) => {
      useCatalog.setState({ catalog });
      return catalog;
    });
  return catalogLoad;
}

/** Every item of a pack (its preview until loaded). */
export function loadPack(pack: CatalogPack): Promise<CatalogItem[]> {
  let load = packLoads.get(pack.id);
  if (!load) {
    load = fetch(BASE + pack.file)
      .then((r) => (r.ok ? (r.json() as Promise<CatalogItem[]>) : pack.preview))
      .catch(() => pack.preview)
      .then((items) => {
        useCatalog.setState((s) => ({ items: { ...s.items, [pack.id]: items } }));
        return items;
      });
    packLoads.set(pack.id, load);
  }
  return load;
}

/** Packs of one kind, in library order. */
export function packsOf(catalog: Catalog | null, kind: CatalogKind) {
  return (catalog?.packs ?? []).filter((p) => p.kind === kind).sort((a, b) => a.order - b.order);
}

export const packUrl = (path: string) => BASE + path;

/** Downloads an item's picture as a project asset: the project keeps its own copy. */
export async function catalogAsset(item: CatalogItem): Promise<ImageAsset> {
  const res = await fetch(packUrl(item.file));
  if (!res.ok) throw new Error(`asset ${item.id}: ${res.status}`);
  const blob = await res.blob();
  return { id: newId(), blob, url: URL.createObjectURL(blob), width: item.width, height: item.height, name: `${item.id.replace("/", "-")}.webp` };
}

/** Lower case without Vietnamese marks, so "ve" finds "vé" (search). */
export function fold(s: string) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();
}
