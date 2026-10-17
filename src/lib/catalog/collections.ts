// Collections ("bộ", M20 §9): themes that cut across kinds — a pack's items and single
// items can belong to several. Seasonal ones come first near their date.
// Data in collections.json (shared with scripts/assets); `season` = months promoted (1–12).

import data from "./collections.json";

type Collection = { en: string; vi: string; season?: number[] };

export const COLLECTIONS: Record<keyof typeof data, Collection> = data;
export type CollectionId = keyof typeof data;
export const COLLECTION_IDS = Object.keys(data) as CollectionId[];

/** Collections in season this month. */
export function inSeason(month: number): CollectionId[] {
  return COLLECTION_IDS.filter((id) => COLLECTIONS[id].season?.includes(month));
}
