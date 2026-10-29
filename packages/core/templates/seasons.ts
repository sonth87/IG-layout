// Seasons and events (owner, 2026-10-28): the home screen moves the templates of what is
// coming up — Halloween, Christmas, Tết, Mid-Autumn, Valentine's… and the season — to the
// top by itself. Lunar dates (Tết, Mid-Autumn) come from a table.

export type EventId =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "halloween"
  | "christmas"
  | "newYear"
  | "tet"
  | "valentine"
  | "womensDay"
  | "vnWomensDay"
  | "midAutumn"
  | "teachersDay"
  | "mothersDay"
  | "childrensDay"
  | "graduation"
  | "backToSchool";

const t = (en: string, vi: string) => ({ en, vi });

/** Tết (1st day of the lunar year) and Mid-Autumn (15th of the 8th lunar month), month is 1-based. */
const TET: Record<number, [number, number]> = {
  2025: [1, 29], 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13], 2030: [2, 3], 2031: [1, 23], 2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8],
};
const MID_AUTUMN: Record<number, [number, number]> = {
  2025: [10, 6], 2026: [9, 25], 2027: [9, 15], 2028: [10, 3], 2029: [9, 22], 2030: [9, 12], 2031: [10, 1], 2032: [9, 19], 2033: [9, 8], 2034: [9, 27], 2035: [9, 16],
};

/** The n-th Sunday of a month (Mother's Day). */
function nthSunday(year: number, month: number, n: number): [number, number] {
  const first = new Date(year, month - 1, 1).getDay();
  return [month, 1 + ((7 - first) % 7) + (n - 1) * 7];
}

interface EventDef {
  id: EventId;
  name: { en: string; vi: string };
  sub: { en: string; vi: string };
  /** The day (month 1-based) in a year, if any. */
  day?: (year: number) => [number, number] | undefined;
  /** Shown this many days before the day… */
  before?: number;
  /** …and this many after. */
  after?: number;
  /** Whole months instead of a day (seasons, graduation…), 1-based, inclusive. */
  months?: number[];
}

export const EVENTS: EventDef[] = [
  { id: "halloween", name: t("Made for Halloween", "Halloween tới rồi"), sub: t("Pumpkins, ghosts and spooky nights", "Bí ngô, ma quái và những đêm rùng rợn"), day: () => [10, 31], before: 24, after: 1 },
  { id: "christmas", name: t("Merry Christmas", "Giáng sinh an lành"), sub: t("Twinkle lights, gifts and cocoa", "Đèn nháy, quà và cacao nóng"), day: () => [12, 25], before: 30, after: 2 },
  { id: "newYear", name: t("Hello new year", "Chào năm mới"), sub: t("Your year in photos, and what's next", "Một năm qua ảnh, và năm tới"), day: () => [1, 1], before: 6, after: 7 },
  { id: "tet", name: t("Lunar New Year", "Tết đến xuân về"), sub: t("Red envelopes, apricot blossoms, family", "Lì xì, hoa mai, sum vầy"), day: (y) => TET[y], before: 21, after: 7 },
  { id: "valentine", name: t("Valentine's Day", "Valentine"), sub: t("Love letters and the two of you", "Thư tình và hai người"), day: () => [2, 14], before: 12, after: 1 },
  { id: "womensDay", name: t("Women's Day", "Mùng 8 tháng 3"), sub: t("Flowers for the women you love", "Hoa cho những người phụ nữ bạn thương"), day: () => [3, 8], before: 7, after: 1 },
  { id: "mothersDay", name: t("Mother's Day", "Ngày của mẹ"), sub: t("For mum, with love", "Gửi mẹ, với tất cả yêu thương"), day: (y) => nthSunday(y, 5, 2), before: 9, after: 1 },
  { id: "childrensDay", name: t("Children's Day", "Quốc tế thiếu nhi"), sub: t("Little ones, big smiles", "Những nụ cười bé xíu"), day: () => [6, 1], before: 6, after: 1 },
  { id: "midAutumn", name: t("Mid-Autumn Festival", "Trung thu"), sub: t("Lanterns, mooncakes and the full moon", "Đèn lồng, bánh trung thu và trăng rằm"), day: (y) => MID_AUTUMN[y], before: 14, after: 2 },
  { id: "vnWomensDay", name: t("Vietnamese Women's Day", "Mừng ngày 20/10"), sub: t("Flowers and thanks", "Hoa và lời cảm ơn"), day: () => [10, 20], before: 7, after: 1 },
  { id: "teachersDay", name: t("Teachers' Day", "Ngày Nhà giáo 20/11"), sub: t("Thank you, teacher", "Tri ân thầy cô"), day: () => [11, 20], before: 10, after: 1 },
  { id: "graduation", name: t("Graduation season", "Mùa tốt nghiệp"), sub: t("Caps in the air", "Tung mũ lên trời"), months: [5, 6] },
  { id: "backToSchool", name: t("Back to school", "Mùa tựu trường"), sub: t("New notebooks, old friends", "Vở mới, bạn cũ"), months: [8, 9] },
  { id: "spring", name: t("Hello spring", "Xin chào mùa xuân"), sub: t("Blossoms and soft light", "Hoa nở và nắng dịu"), months: [3, 4, 5] },
  { id: "summer", name: t("Summer days", "Ngày hè"), sub: t("Sea, sun and long evenings", "Biển, nắng và những buổi tối dài"), months: [6, 7, 8] },
  { id: "autumn", name: t("Autumn mood", "Mùa thu"), sub: t("Falling leaves and cosy afternoons", "Lá rơi và những buổi chiều ấm"), months: [9, 10, 11] },
  { id: "winter", name: t("Winter is here", "Mùa đông"), sub: t("Knits, snow and warm drinks", "Áo len, tuyết và đồ uống nóng"), months: [12, 1, 2] },
];

const DAY = 86_400_000;

/**
 * Events running on `today`, the most pressing first: dated events by how close the day
 * is, then month-long ones (graduation…), then the season.
 */
export function activeEvents(today: Date): EventDef[] {
  const y = today.getFullYear();
  const now = new Date(y, today.getMonth(), today.getDate()).getTime();
  const dated: { e: EventDef; dist: number }[] = [];
  const monthly: EventDef[] = [];
  for (const e of EVENTS) {
    if (e.months) {
      if (e.months.includes(today.getMonth() + 1)) monthly.push(e);
      continue;
    }
    // This year's day, or next / last year's when the window wraps the new year.
    for (const year of [y - 1, y, y + 1]) {
      const d = e.day?.(year);
      if (!d) continue;
      const at = new Date(year, d[0] - 1, d[1]).getTime();
      if (now >= at - (e.before ?? 7) * DAY && now <= at + (e.after ?? 1) * DAY) dated.push({ e, dist: Math.abs(at - now) });
    }
  }
  dated.sort((a, b) => a.dist - b.dist);
  const seasons = new Set<EventId>(["spring", "summer", "autumn", "winter"]);
  return [...dated.map((x) => x.e), ...monthly.filter((e) => !seasons.has(e.id)), ...monthly.filter((e) => seasons.has(e.id))];
}

/** Today, or the date in `?today=2026-12-20` (to try other seasons). */
export function homeToday(): Date {
  if (typeof location !== "undefined") {
    const q = new URLSearchParams(location.search).get("today");
    const d = q ? new Date(`${q}T12:00:00`) : null;
    if (d && !Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}
