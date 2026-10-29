import type { Template } from "../types";
import { art, block, cells, design, icon, INK, KRAFT, photo, strip, t, tape, text, WHITE_FRAME } from "./kit";

// Christmas, New Year and winter, second batch (2026-10-28): digital camera and notebook
// frames (gen-camera, gen-notebook), stamps, envelopes, a photo tree, baubles on strings.

const RED = "#b3202a";
const PINE = "#14382a";
const CREAM = "#f5ecd9";
const GOLD = "#e9c46a";
const SNOW = "#eef3f8";
const NIGHT = "#101827";
const ICE = "#2d5b8a";
const P = 0.8;

const booth = strip(0, 0, 0.3, 0.47, 0.34, 4, -4, P, CREAM);

/** Three rows of round photos in a triangle, a star on top: a Christmas tree of photos. */
function photoTree() {
  const rows = [1, 2, 3];
  const d = 0.24;
  const out = [];
  let n = 0;
  for (let r = 0; r < rows.length; r++) {
    const count = rows[r];
    const y = 0.2 + r * (d * P + 0.015);
    const x0 = 0.5 - (count * d + (count - 1) * 0.02) / 2;
    for (let i = 0; i < count; i++) out.push(photo(n++, 0, x0 + i * (d + 0.02), y, d, d * P, { mask: "circle", border: { width: 0.008, color: GOLD } }));
  }
  return out;
}

/** Round photos hanging from the top edge on strings, like baubles. */
/** A string across two slides turned 7°: its height (slide units) at `x`. */
const GARLAND_Y = 0.3;
const garlandAt = (x: number) => GARLAND_Y + (x - 1) * Math.tan((7 * Math.PI) / 180) * P;

const BAUBLES = [
  { x: 0.1, len: 0.18, d: 0.26 },
  { x: 0.4, len: 0.34, d: 0.22 },
  { x: 0.68, len: 0.12, d: 0.24 },
];

export const WINTER: Template[] = [
  // ── Christmas ───────────────────────────────────────────────────────────
  design("xmas-photo-tree", "seasonal", t("Photo tree", "Cây thông ảnh"), {
    themes: ["christmas", "friends", "kids"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: PINE },
    shapes: [block(0, 0.455, 0.8, 0.09, 0.07, "#6b4a32")],
    art: [art("christmas/xmas-glowing-top-star", 0, 0.43, 0.06, 0.14)],
    slots: photoTree(),
    texts: [text(0, 0.06, 0.88, 0.88, t("merry & bright", "an lành & rực rỡ"), { font: "greatVibes", size: 0.075, color: CREAM })],
  }),
  design("xmas-baubles", "seasonal", t("Photo baubles", "Quả châu ảnh"), {
    themes: ["christmas", "portrait", "couple"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: RED },
    shapes: BAUBLES.map((b) => block(0, b.x + b.d / 2 - 0.002, 0, 0.004, b.len, GOLD)),
    slots: BAUBLES.map((b, i) => photo(i, 0, b.x, b.len, b.d, b.d * P, { mask: "circle", border: { width: 0.01, color: GOLD } })),
    icons: BAUBLES.map((b) => icon("star", 0, b.x + b.d / 2 - 0.025, b.len - 0.03, 0.05, { color: GOLD })),
    texts: [text(0, 0.06, 0.74, 0.88, t("deck the halls", "giáng sinh về"), { font: "greatVibes", size: 0.12, color: CREAM })],
  }),
  design("xmas-camera", "seasonal", t("Christmas digicam", "Máy ảnh Giáng sinh"), {
    themes: ["christmas", "friends", "party"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: "#f4e9e1" },
    art: [
      art("gen-camera/camera-16", 0, 0.04, 0.22, 0.92, { rotation: -3 }),
      art("christmas/xmas-candy-cane-bow", 0, 0.78, 0.06, 0.16, { rotation: 14 }),
      art("christmas/xmas-glass-bauble-ornament", 0, 0.06, 0.78, 0.13, { rotation: -10 }),
    ],
    slots: [],
    texts: [
      text(0, 0.06, 0.06, 0.7, t("xmas '26", "noel '26"), { font: "anton", size: 0.11, color: RED, align: "left" }),
      text(0, 0.36, 0.84, 0.58, t("caught on camera", "bắt trọn khoảnh khắc"), { font: "patrickHand", size: 0.05, color: INK, align: "right" }),
    ],
  }),
  design("xmas-plaid", "seasonal", t("Tartan", "Kẻ caro Noel"), {
    themes: ["christmas", "winter", "friends"],
    events: ["christmas", "winter"],
    slides: 2,
    background: { kind: "color", color: RED },
    shapes: [0, 1].flatMap((s) => [
      ...[0.12, 0.42, 0.72].map((x) => block(s, x, 0, 0.12, 1, PINE, { opacity: 0.35 })),
      ...[0.15, 0.55].map((y) => block(s, 0, y, 1, 0.1, PINE, { opacity: 0.35 })),
      ...[0.3, 0.86].map((y) => block(s, 0, y, 1, 0.012, GOLD, { opacity: 0.6 })),
    ]),
    slots: [photo(0, 0, 0.12, 0.1, 0.76, 0.62, WHITE_FRAME), photo(1, 1, 0.06, 0.08, 0.42, 0.52, { ...WHITE_FRAME, rotation: -3 }), photo(2, 1, 0.52, 0.38, 0.42, 0.52, { ...WHITE_FRAME, rotation: 3 })],
    texts: [text(0, 0.08, 0.78, 0.84, t("'tis the season", "mùa lễ hội"), { font: "greatVibes", size: 0.1, color: CREAM, shadow: true })],
  }),
  design("dear-santa", "seasonal", t("Dear Santa", "Thư gửi ông già Noel"), {
    themes: ["kids", "christmas"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: "#e9eef3" },
    art: [art("gen-envelopes/envelope-6", 0, 0.08, 0.04, 0.6, { rotation: -4 }), art("christmas/xmas-santa-claus-portrait", 0, 0.66, 0.58, 0.3, { rotation: 6 })],
    slots: [],
    texts: [
      text(0, 0.08, 0.66, 0.54, t("Dear Santa,", "Ông già Noel ơi,"), { font: "greatVibes", size: 0.075, color: RED, align: "left" }),
      text(0, 0.08, 0.75, 0.54, t("I've been (mostly)\ngood this year…", "năm nay con ngoan\n(gần như) cả năm…"), { font: "patrickHand", size: 0.045, color: INK, align: "left", lineHeight: 1.1 }),
    ],
  }),
  design("xmas-stamps", "seasonal", t("Season's stamps", "Tem mùa lễ"), {
    themes: ["christmas", "winter", "travel", "food"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    art: [
      art("gen-stamps/stamp-3", 0, 0.06, 0.16, 0.44, { rotation: -5 }),
      art("gen-stamps/stamp-7", 0, 0.52, 0.12, 0.4, { rotation: 4, photo: 1 }),
      art("gen-stamps/stamp-11", 0, 0.08, 0.54, 0.4, { rotation: 3, photo: 2 }),
      art("gen-stamps/stamp-14", 0, 0.52, 0.52, 0.42, { rotation: -3, photo: 3 }),
      art("christmas/xmas-holly-berry-wreath", 0, 0.4, 0.42, 0.2),
    ],
    slots: [],
    texts: [text(0, 0.06, 0.03, 0.88, t("season's greetings", "mừng mùa lễ hội"), { font: "greatVibes", size: 0.085, color: RED })],
  }),
  design("xmas-booth", "seasonal", t("Holiday photobooth", "Photobooth Giáng sinh"), {
    themes: ["couple", "friends", "christmas"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: RED },
    shapes: [booth.shape],
    slots: booth.slots,
    art: [art("christmas/xmas-golden-jingle-bell", 0, 0.64, 0.6, 0.22, { rotation: 10 })],
    texts: [text(0, 0.54, 0.16, 0.42, t("jingle\nall the\nway", "leng keng\nleng keng\nnoel về"), { font: "greatVibes", size: 0.1, color: CREAM, align: "left", lineHeight: 0.95 })],
  }),
  design("snow-globe", "seasonal", t("Snow globe", "Quả cầu tuyết"), {
    format: "story",
    themes: ["winter", "christmas", "couple"],
    events: ["christmas", "winter"],
    slides: 1,
    background: { kind: "color", color: NIGHT },
    shapes: [block(0, 0.27, 0.61, 0.46, 0.045, "#7a5636", { shape: "roundRect" })],
    slots: [photo(0, 0, 0.12, 0.2, 0.76, 0.4275, { mask: "circle", border: { width: 0.014, color: "#dfe9f2" } })],
    icons: [
      icon("doodle-sparkle", 0, 0.12, 0.17, 0.08, { color: "#ffffff" }),
      icon("doodle-sparkle", 0, 0.8, 0.24, 0.06, { color: "#ffffff" }),
      icon("doodle-dots", 0, 0.7, 0.7, 0.16, { color: "#ffffff", opacity: 0.6 }),
    ],
    texts: [text(0, 0.08, 0.68, 0.84, t("let it snow", "tuyết rơi rồi"), { font: "greatVibes", size: 0.13, color: "#ffffff" })],
  }),
  design("xmas-market", "seasonal", t("Christmas market", "Chợ Giáng sinh"), {
    themes: ["christmas", "food", "city", "winter"],
    events: ["christmas"],
    slides: 3,
    background: { kind: "color", color: CREAM },
    art: [art("christmas/xmas-hot-cocoa-marshmallows", 1, 0.7, 0.72, 0.24, { rotation: 8 }), art("christmas/xmas-holiday-cookie", 2, 0.06, 0.74, 0.18, { rotation: -10 })],
    slots: [photo(0, 0, 0, 0, 1, 0.7), ...cells(1, 1, [0.06, 0.06, 0.88, 0.7], 2, 2, 0.025), photo(5, 2, 0.12, 0.08, 0.76, 0.6, { frame: "polaroid", shadow: true, rotation: 2 })],
    texts: [
      text(0, 0.06, 0.74, 0.88, t("CHRISTMAS\nMARKET", "CHỢ\nGIÁNG SINH"), { font: "anton", size: 0.09, color: RED, align: "left", lineHeight: 0.95 }),
      text(0, 0.5, 0.78, 0.44, t("mulled wine, lights\n& too many cookies", "rượu nóng, đèn nháy\n& quá nhiều bánh quy"), { font: "patrickHand", size: 0.036, color: INK, align: "right" }),
      text(2, 0.3, 0.8, 0.64, t("same time next year?", "hẹn mùa sau nhé?"), { font: "greatVibes", size: 0.07, color: RED, align: "right" }),
    ],
  }),
  design("xmas-movie-night", "seasonal", t("Movie night", "Đêm phim Noel"), {
    themes: ["christmas", "couple", "food"],
    events: ["christmas", "winter"],
    slides: 1,
    background: { kind: "color", color: "#1b1512" },
    art: [art("gen-film/film-8", 0, 0.08, 0.1, 0.84, { rotation: -2 }), art("christmas/xmas-hot-cocoa-marshmallows", 0, 0.64, 0.66, 0.28)],
    slots: [],
    widgets: [{ slide: 0, x: 0.06, y: 0.76, w: 0.54, kind: "nowPlaying", variant: "card", fields: { songTitle: t("Last Christmas", "Last Christmas"), artist: t("on repeat", "nghe hoài") } }],
  }),
  design("xmas-wish-list", "seasonal", t("Wish list", "Danh sách điều ước"), {
    format: "story",
    themes: ["christmas", "portrait"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: "#e7d6c3" },
    art: [art("gen-notebook/notebook-14", 0, 0.08, 0.14, 0.84, { rotation: -2 }), art("christmas/xmas-wrapped-gift-box", 0, 0.66, 0.66, 0.26, { rotation: 8 })],
    slots: [],
    icons: [0, 1, 2].map((i) => icon("doodle-check", 0, 0.16, 0.615 + i * 0.04, 0.05, { color: RED })),
    texts: [0, 1, 2].map((i) =>
      text(0, 0.24, 0.612 + i * 0.04, 0.44, [t("cozy socks", "đôi tất ấm"), t("a trip somewhere", "một chuyến đi"), t("more of this ♡", "thêm nhiều thế này ♡")][i], { font: "patrickHand", size: 0.045, color: INK, align: "left" }),
    ),
  }),
  design("xmas-garland", "seasonal", t("Polaroid garland", "Dây ảnh polaroid"), {
    themes: ["christmas", "friends", "couple"],
    events: ["christmas"],
    group: "seamless",
    slides: 2,
    background: { kind: "color", color: "#f1ebe2" },
    shapes: [block(0, -0.05, GARLAND_Y - 0.003, 2.1, 0.006, "#6b4a32", { rotation: 7 })],
    slots: [0, 1, 2, 3].map((i) => photo(i, 0, 0.08 + i * 0.48, garlandAt(0.26 + i * 0.48) + 0.02, 0.36, 0.4, { frame: "polaroid", shadow: true, rotation: [-6, 4, -3, 6][i] })),
    icons: [0, 1, 2, 3].map((i) => icon("clip", 0, 0.225 + i * 0.48, garlandAt(0.26 + i * 0.48) - 0.03, 0.07, { color: GOLD })),
    texts: [
      text(0, 0.08, 0.82, 0.8, t("our little christmas", "giáng sinh nhỏ của tụi mình"), { font: "greatVibes", size: 0.07, color: RED, align: "left" }),
      text(1, 0.4, 0.06, 0.54, t("✦ 24.12 ✦", "✦ 24.12 ✦"), { font: "spaceGrotesk", size: 0.035, color: INK, align: "right", letterSpacing: 0.2 }),
    ],
  }),
  design("xmas-eve-menu", "seasonal", t("Christmas Eve menu", "Thực đơn đêm Noel"), {
    themes: ["food", "christmas"],
    events: ["christmas"],
    slides: 2,
    background: { kind: "color", color: PINE },
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.52, { border: { width: 0.008, color: GOLD } }), ...cells(1, 1, [0.08, 0.08, 0.84, 0.84], 2, 2, 0.03, P, { border: { width: 0.006, color: GOLD } })],
    texts: [
      text(0, 0.08, 0.64, 0.84, t("Christmas Eve", "Đêm Giáng sinh"), { font: "greatVibes", size: 0.1, color: GOLD }),
      text(0, 0.14, 0.76, 0.72, t("ROAST · SALAD · YULE LOG · WINE", "GÀ NƯỚNG · SALAD · BÁNH KHÚC CÂY · VANG"), { font: "spaceGrotesk", size: 0.026, color: CREAM, letterSpacing: 0.18 }),
      text(0, 0.14, 0.84, 0.72, t("for the people at my table", "cho những người cùng bàn"), { font: "cormorant", size: 0.045, color: CREAM, italic: true }),
    ],
  }),
  design("ho-ho-ho", "seasonal", t("Ho ho ho", "Ho ho ho"), {
    format: "story",
    themes: ["kids", "christmas", "party"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: "#fbeee9" },
    art: [art("christmas/xmas-santa-claus-portrait", 0, 0.52, 0.6, 0.42, { rotation: 4 }), art("christmas/xmas-red-fireplace-stocking", 0, 0.06, 0.14, 0.16, { rotation: -8 })],
    slots: [photo(0, 0, 0.18, 0.18, 0.66, 0.42, { mask: "arch", border: { width: 0.012, color: RED } })],
    texts: [text(0, 0.06, 0.64, 0.5, t("HO HO\nHO!", "HO HO\nHO!"), { font: "anton", size: 0.14, color: RED, align: "left", lineHeight: 0.95 })],
  }),
  design("xmas-ornament-frame", "seasonal", t("Gilded Christmas", "Khung vàng Noel"), {
    themes: ["portrait", "couple", "christmas"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: "#5a1219" },
    art: [art("gilded-frames/gilded-louis-xv-regency", 0, 0.14, 0.08, 0.72), art("christmas/xmas-lit-wax-candle", 0, 0.04, 0.66, 0.14), art("christmas/xmas-evergreen-fir-tree", 0, 0.76, 0.6, 0.2)],
    slots: [],
    texts: [text(0, 0.06, 0.86, 0.88, t("a very merry christmas", "giáng sinh thật an lành"), { font: "cormorant", size: 0.055, color: GOLD, italic: true })],
  }),
  design("xmas-reindeer", "seasonal", t("Oh deer", "Tuần lộc"), {
    themes: ["christmas", "winter", "nature"],
    events: ["christmas", "winter"],
    slides: 1,
    background: { kind: "color", color: SNOW },
    art: [art("christmas/xmas-reindeer-stag", 0, 0.58, 0.5, 0.38)],
    slots: [photo(0, 0, 0.06, 0.06, 0.6, 0.6, { shadow: true }), photo(1, 0, 0.5, 0.12, 0.4, 0.36, { ...WHITE_FRAME, rotation: 5 })],
    texts: [text(0, 0.06, 0.72, 0.5, t("oh deer,\nit's december", "ôi, tháng 12\nrồi đó"), { font: "patrickHand", size: 0.06, color: ICE, align: "left", lineHeight: 1.05 })],
  }),

  // ── New year ────────────────────────────────────────────────────────────
  design("ny-big-year", "seasonal", t("Big year", "Năm mới, số to"), {
    themes: ["party", "friends", "city"],
    events: ["newYear"],
    slides: 1,
    background: { kind: "color", color: "#0d0d0f" },
    slots: cells(0, 0, [0.04, 0.04, 0.92, 0.92], 2, 2, 0.02),
    texts: [text(0, 0.02, 0.36, 0.96, t("2027", "2027"), { font: "anton", size: 0.32, color: "#ffffff", stroke: { color: "#0d0d0f", width: 0.04 }, letterSpacing: 0.02 })],
  }),
  design("ny-recap", "seasonal", t("Year recap", "Tổng kết năm"), {
    themes: ["travel", "friends", "food", "nature"],
    events: ["newYear"],
    slides: 3,
    background: { kind: "color", color: "#f6f2ea" },
    slots: [photo(0, 0, 0.08, 0.3, 0.84, 0.6), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 3, 3, 0.015), ...cells(10, 2, [0.06, 0.06, 0.88, 0.62], 2, 1, 0.02)],
    texts: [
      text(0, 0.08, 0.06, 0.84, t("2026,\nin photos", "2026,\nqua những tấm ảnh"), { font: "cormorant", size: 0.1, color: INK, align: "left", bold: true, lineHeight: 0.95 }),
      text(2, 0.06, 0.74, 0.88, t("thank you, 2026.\nhello, whatever's next.", "cảm ơn 2026.\nxin chào, những gì phía trước."), { font: "patrickHand", size: 0.055, color: INK, align: "left", lineHeight: 1.1 }),
    ],
  }),
  design("ny-cheers", "seasonal", t("Cheers", "Nâng ly"), {
    format: "story",
    themes: ["party", "friends"],
    events: ["newYear", "christmas"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    art: [art("celebrations/cel-popping-champagne-bottle", 0, 0.62, 0.6, 0.3, { rotation: -12 })],
    texts: [
      text(0, 0.06, 0.15, 0.88, t("cheers to\nnew beginnings", "nâng ly cho\nnhững khởi đầu mới"), { font: "greatVibes", size: 0.11, color: "#ffffff", shadow: true, lineHeight: 0.95 }),
      text(0, 0.06, 0.76, 0.5, t("31.12 → 01.01", "31.12 → 01.01"), { font: "spaceGrotesk", size: 0.04, color: "#ffffff", align: "left", letterSpacing: 0.15, shadow: true }),
    ],
  }),
  design("ny-fireworks", "seasonal", t("Fireworks", "Pháo hoa"), {
    themes: ["party", "city"],
    events: ["newYear", "tet"],
    slides: 1,
    background: { kind: "color", color: NIGHT },
    slots: [photo(0, 0, 0.16, 0.22, 0.68, 0.56, { mask: "arch", border: { width: 0.01, color: GOLD } })],
    icons: [
      icon("doodle-burst", 0, 0.04, 0.04, 0.22, { color: GOLD }),
      icon("doodle-burst", 0, 0.74, 0.1, 0.18, { color: "#ff8fab" }),
      icon("doodle-sparkle", 0, 0.82, 0.62, 0.1, { color: GOLD }),
      icon("doodle-sparkle", 0, 0.06, 0.7, 0.08, { color: "#ffffff" }),
    ],
    texts: [text(0, 0.06, 0.82, 0.88, t("happy new year", "chúc mừng năm mới"), { font: "greatVibes", size: 0.1, color: "#ffffff" })],
  }),
  design("ny-last-photo", "seasonal", t("Last photo of the year", "Tấm ảnh cuối năm"), {
    format: "story",
    themes: ["friends", "party", "portrait"],
    events: ["newYear"],
    slides: 1,
    background: { kind: "color", color: "#111111" },
    art: [art("gen-camera/camera-23", 0, 0.12, 0.14, 0.76)],
    slots: [],
    texts: [text(0, 0.08, 0.74, 0.84, t("last photo\nof the year", "tấm ảnh cuối\ncủa năm"), { font: "anton", size: 0.09, color: "#ffffff", lineHeight: 1 })],
  }),
  design("ny-goals", "seasonal", t("New year notes", "Sổ tay năm mới"), {
    themes: ["minimal", "portrait", "nature"],
    events: ["newYear"],
    slides: 1,
    background: { kind: "color", color: "#dfe5ea" },
    art: [art("gen-notebook/notebook-13", 0, 0.1, 0.03, 0.62, { rotation: -3 }), art("gen-notes/note-13", 0, 0.58, 0.5, 0.36, { rotation: 6 })],
    slots: [],
    texts: [
      text(0, 0.18, 0.66, 0.44, t("2027 / chapter one", "2027 / chương một"), { font: "patrickHand", size: 0.042, color: INK, align: "left", rotation: -3 }),
      text(0, 0.62, 0.56, 0.3, t("✓ more sunsets\n✓ less scrolling\n✓ say yes", "✓ ngắm hoàng hôn\n✓ bớt lướt điện thoại\n✓ dám thử"), { font: "patrickHand", size: 0.034, color: INK, align: "left", rotation: 6, lineHeight: 1.2 }),
    ],
  }),

  // ── Winter ──────────────────────────────────────────────────────────────
  design("winter-knits", "seasonal", t("Knit season", "Mùa áo len"), {
    themes: ["winter", "portrait", "fashion"],
    events: ["winter"],
    slides: 1,
    background: { kind: "color", color: "#ece3d7" },
    art: [art("christmas/xmas-warm-winter-gloves", 0, 0.66, 0.06, 0.26, { rotation: 12 }), art("christmas/xmas-knitted-red-scarf", 0, 0.02, 0.7, 0.3, { rotation: -10 })],
    slots: [photo(0, 0, 0.1, 0.1, 0.52, 0.56, { shadow: true }), photo(1, 0, 0.42, 0.42, 0.48, 0.48, { ...WHITE_FRAME, rotation: 4 })],
    texts: [text(0, 0.3, 0.9, 0.6, t("knit season", "mùa áo len"), { font: "cormorant", size: 0.06, color: INK, italic: true, align: "right" })],
  }),
  design("snow-day", "seasonal", t("Snow day", "Ngày tuyết rơi"), {
    themes: ["winter", "nature", "kids"],
    events: ["winter", "christmas"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    art: [art("christmas/xmas-classic-snowman", 0, 0.72, 0.74, 0.22), art("christmas/xmas-crystal-snowflake", 0, 0.04, 0.03, 0.1)],
    slots: cells(0, 0, [0.06, 0.15, 0.88, 0.62], 2, 2, 0.02, P, { cornerRadius: 0.02 }),
    texts: [
      text(0, 0.18, 0.04, 0.7, t("SNOW DAY", "NGÀY TUYẾT"), { font: "anton", size: 0.085, color: ICE, align: "left", letterSpacing: 0.08 }),
      text(0, 0.06, 0.82, 0.6, t("cold hands, warm heart", "tay lạnh, tim ấm"), { font: "patrickHand", size: 0.05, color: ICE, align: "left" }),
    ],
  }),
  design("winter-slopes", "seasonal", t("On the slopes", "Trượt tuyết"), {
    format: "story",
    themes: ["winter", "travel", "nature"],
    events: ["winter"],
    slides: 1,
    background: { kind: "color", color: "#dfeaf4" },
    art: [art("christmas/xmas-winter-skier", 0, 0.6, 0.62, 0.32, { rotation: -6 })],
    slots: [photo(0, 0, 0, 0, 1, 0.56), photo(1, 0, 0.06, 0.5, 0.48, 0.27, { ...WHITE_FRAME, rotation: -4 })],
    texts: [text(0, 0.06, 0.8, 0.6, t("powder day", "tuyết mới rơi"), { font: "anton", size: 0.08, color: ICE, align: "left" })],
  }),
  design("winter-tape", "seasonal", t("Cold days", "Những ngày lạnh"), {
    themes: ["winter", "city", "mono"],
    events: ["winter"],
    slides: 2,
    background: { kind: "color", color: "#e4e7ea" },
    shapes: [tape(0, 0.5, 0.08, -4, "#cfe2ef"), tape(1, 0.28, 0.06, 6, "#cfe2ef"), tape(1, 0.72, 0.5, -5, "#cfe2ef")],
    slots: [photo(0, 0, 0.12, 0.08, 0.76, 0.66, { shadow: true }), photo(1, 1, 0.06, 0.06, 0.44, 0.4, { shadow: true, rotation: -3 }), photo(2, 1, 0.48, 0.5, 0.46, 0.4, { shadow: true, rotation: 3 })],
    texts: [
      text(0, 0.12, 0.8, 0.76, t("cold days, slow days", "ngày lạnh, ngày chậm"), { font: "cormorant", size: 0.07, color: INK, italic: true }),
      text(1, 0.06, 0.66, 0.4, t("—5°C\nand loving it", "—5°C\nmà vẫn thích"), { font: "patrickHand", size: 0.05, color: INK, align: "left" }),
    ],
  }),
];
