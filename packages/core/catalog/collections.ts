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

/**
 * Collections from the most specific to the most general (owner, 2026-10-19: the "Bộ"
 * view had everything piled under "Vintage"): an occasion, then a place, a subject, a
 * look, and the broad styles (journal, vintage, cute…) last.
 */
const SPECIFIC: CollectionId[] = [
  "tet", "midAutumn", "christmas", "halloween", "valentine", "easter", "womensDay", "teachersDay", "newYear",
  "birthday", "wedding", "graduation", "baby", "backToSchool",
  "vietnam", "japan", "korea",
  "autumn", "summer", "beach", "travel", "coffee", "food", "floral", "nature", "pets", "music", "sport", "school", "shop", "love",
  "film", "tornPaper", "handDrawn", "y2k", "neon", "digital", "grunge",
  "retro", "minimal", "vintage", "journal", "cute",
];

/** Packs whose listed collections miss their real theme. */
const PACK_MAIN: Record<string, CollectionId> = {
  botanical: "floral",
  "butterflies-insects": "nature",
  "birds-animals": "nature",
  "vintage-maps-compass": "travel",
  "vietnam-heritage": "vietnam",
  "gen-paper-scraps": "tornPaper",
  "gen-notes": "journal",
  "gen-washi": "journal",
  // Stamps, wax seals and ink stamps sit with the old labels, not with travel.
  "vintage-stamps": "vintage",
  "vintage-postcards": "vintage",
  "ink-stamps": "vintage",
};

/**
 * The one collection an item is listed under in the "Bộ" view: its pack's theme, so a
 * pack stays together — unless the item is tagged for an occasion (a Tết item of the
 * Vietnam pack goes to Tết).
 */
export function mainCollection(item: CollectionId[], pack: CollectionId[], packId: string): CollectionId | undefined {
  const best = (list: CollectionId[]) => list.filter((c) => c !== "featured").sort((a, b) => rank(a) - rank(b))[0];
  const occasion = best(item);
  if (occasion && rank(occasion) <= LAST_OCCASION) return occasion;
  return PACK_MAIN[packId] ?? best(pack) ?? best(item);
}

const rank = (c: CollectionId) => {
  const i = SPECIFIC.indexOf(c);
  return i < 0 ? SPECIFIC.length : i;
};
const LAST_OCCASION = SPECIFIC.indexOf("backToSchool");

/**
 * Order of the "Bộ" groups: the ones in season this month, then the year-round themes,
 * then the occasions of other months.
 */
export function collectionOrder(month: number): CollectionId[] {
  const now = inSeason(month);
  // Year-round: the specific themes before the broad styles.
  const yearRound = COLLECTION_IDS.filter((c) => !COLLECTIONS[c].season && c !== "featured").sort((a, b) => rank(a) - rank(b));
  const later = COLLECTION_IDS.filter((c) => COLLECTIONS[c].season && !now.includes(c));
  // Later occasions from the next month on, so the nearest come first.
  const next = (c: CollectionId) => Math.min(...COLLECTIONS[c].season!.map((m) => (m - month + 12) % 12));
  return [...now, ...yearRound, ...later.sort((a, b) => next(a) - next(b))];
}
