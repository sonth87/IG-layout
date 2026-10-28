import type { Template } from "../types";
import { art, block, cells, design, icon, INK, photo, sketch, t, text, WHITE_FRAME } from "./kit";

// Holidays and seasons (2026-10-28): each one tagged with its event (seasons.ts) so the
// home screen brings it up at the right time. Stickers from the packs christmas, tet,
// mid-autumn, celebrations, botanical.

const XMAS_RED = "#b3202a";
const PINE = "#14382a";
const CREAM = "#f5ecd9";
const GOLD = "#f2c75c";
const TET_RED = "#b71c1c";
const NAVY = "#14213d";
const PUMPKIN = "#e0662b";

export const HOLIDAYS: Template[] = [
  // ── Christmas ───────────────────────────────────────────────────────────
  design("xmas-postcard", "seasonal", t("Christmas postcard", "Bưu thiếp Giáng sinh"), {
    themes: ["christmas", "winter"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: PINE },
    art: [
      art("postcards/postcard-frame-xmas-dpla", 0, 0.05, 0.2, 0.9),
      art("christmas/xmas-glass-bauble-ornament", 0, 0.78, 0.04, 0.14, { rotation: 8 }),
      art("christmas/xmas-glowing-top-star", 0, 0.06, 0.06, 0.14),
    ],
    slots: [],
    texts: [text(0, 0.06, 0.72, 0.88, t("Merry Christmas", "Giáng sinh an lành"), { font: "greatVibes", size: 0.12, color: CREAM })],
  }),
  design("cozy-christmas", "seasonal", t("Cozy Christmas", "Giáng sinh ấm áp"), {
    format: "story",
    themes: ["christmas", "winter"],
    events: ["christmas", "winter"],
    slides: 1,
    background: { kind: "color", color: "#f3e9dc" },
    art: [art("christmas/xmas-hot-cocoa-marshmallows", 0, 0.6, 0.5, 0.32), art("christmas/xmas-candy-cane-bow", 0, 0.06, 0.48, 0.16, { rotation: -12 })],
    slots: [photo(0, 0, 0.1, 0.15, 0.8, 0.42, { frame: "polaroid", shadow: true, rotation: -3 })],
    texts: [text(0, 0.08, 0.7, 0.84, t("cozy christmas", "giáng sinh ấm áp"), { font: "greatVibes", size: 0.11, color: XMAS_RED })],
  }),
  design("wreath", "seasonal", t("Christmas wreath", "Vòng nguyệt quế"), {
    themes: ["christmas", "friends", "couple"],
    events: ["christmas"],
    slides: 3,
    background: { kind: "color", color: XMAS_RED },
    art: [art("christmas/xmas-holly-berry-wreath", 0, 0.2, 0.08, 0.6)],
    slots: [
      photo(0, 0, 0.32, 0.2, 0.36, 0.288, { mask: "circle" }),
      ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.025, 0.8, WHITE_FRAME),
      photo(5, 2, 0.12, 0.08, 0.76, 0.62, { frame: "polaroid", shadow: true, rotation: 2 }),
    ],
    texts: [
      text(0, 0.06, 0.66, 0.88, t("Merry\nChristmas", "Giáng sinh\nan lành"), { font: "greatVibes", size: 0.12, color: CREAM, lineHeight: 0.92 }),
      text(2, 0.06, 0.84, 0.88, t("see you in the new year ✦", "hẹn gặp năm mới ✦"), { font: "patrickHand", size: 0.05, color: CREAM }),
    ],
  }),
  design("december-dump", "seasonal", t("December dump", "Tháng mười hai"), {
    themes: ["christmas", "winter", "friends", "food"],
    events: ["christmas", "winter"],
    slides: 1,
    background: { kind: "color", color: "#dfe9f2" },
    art: [art("christmas/xmas-crystal-snowflake", 0, 0.82, 0.02, 0.12), art("christmas/xmas-crystal-snowflake", 0, 0.03, 0.88, 0.1, { rotation: 20 })],
    slots: cells(0, 0, [0.06, 0.14, 0.88, 0.8], 3, 3, 0.02),
    texts: [text(0, 0.06, 0.03, 0.7, t("december dump", "tháng mười hai"), { font: "greatVibes", size: 0.09, color: "#23406b", align: "left" })],
  }),
  design("all-i-want", "seasonal", t("All I want", "Điều ước Giáng sinh"), {
    format: "story",
    themes: ["couple", "christmas"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: PINE },
    art: [art("christmas/xmas-wrapped-gift-box", 0, 0.62, 0.56, 0.26, { rotation: 8 })],
    slots: [photo(0, 0, 0.14, 0.15, 0.72, 0.46, { mask: "arch" })],
    texts: [text(0, 0.08, 0.66, 0.6, t("all I want\nfor christmas\nis you", "điều ước\ngiáng sinh\nlà cậu"), { font: "greatVibes", size: 0.08, color: CREAM, align: "left", lineHeight: 1 })],
  }),
  design("tree-trio", "seasonal", t("Under the tree", "Dưới gốc thông"), {
    themes: ["christmas", "friends", "kids"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: "#f6efe4" },
    art: [art("christmas/xmas-decorated-pine-tree", 0, 0.66, 0.5, 0.28), art("christmas/xmas-gingerbread-man", 0, 0.06, 0.78, 0.14, { rotation: -10 })],
    slots: [
      photo(0, 0, 0.06, 0.06, 0.46, 0.4, { frame: "polaroid", shadow: true, rotation: -5 }),
      photo(1, 0, 0.48, 0.08, 0.46, 0.4, { frame: "polaroid", shadow: true, rotation: 4 }),
      photo(2, 0, 0.22, 0.46, 0.44, 0.38, { frame: "polaroid", shadow: true, rotation: -1 }),
    ],
    texts: [text(0, 0.24, 0.9, 0.6, t("ho ho ho", "ho ho ho"), { font: "patrickHand", size: 0.05, color: XMAS_RED })],
  }),

  // ── New year ────────────────────────────────────────────────────────────
  design("nye-countdown", "seasonal", t("Countdown", "Đếm ngược"), {
    themes: ["party", "friends"],
    events: ["newYear", "christmas"],
    slides: 1,
    background: { kind: "color", color: "#0e0e10" },
    slots: [photo(0, 0, 0, 0, 1, 0.66)],
    widgets: [{ slide: 0, x: 0.14, y: 0.6, w: 0.72, kind: "countdown", variant: "flip", fields: { title: t("New year", "Năm mới") } }],
    texts: [text(0, 0.06, 0.06, 0.88, t("NYE", "GIAO THỪA"), { font: "anton", size: 0.12, color: "#ffffff", align: "left", shadow: true })],
  }),
  design("year-in-twelve", "seasonal", t("A year in 12", "Một năm, 12 tháng"), {
    themes: ["travel", "friends", "food", "nature"],
    events: ["newYear"],
    slides: 2,
    background: { kind: "color", color: "#f7f4ee" },
    slots: [...cells(0, 0, [0.06, 0.06, 0.88, 0.88], 2, 3, 0.03), ...cells(6, 1, [0.06, 0.06, 0.88, 0.88], 2, 3, 0.03)],
    texts: [0, 1].flatMap((s) =>
      [0, 1, 2, 3, 4, 5].map((i) => {
        const m = s * 6 + i;
        const names = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return text(s, 0.08 + (i % 2) * 0.455, 0.08 + Math.floor(i / 2) * 0.298, 0.2, t(names[m], `T${m + 1}`), { font: "spaceGrotesk", size: 0.03, color: INK, bold: true, letterSpacing: 0.15, background: { color: "#ffffff", padding: 0.3, radius: 0.5 } });
      }),
    ),
  }),
  design("new-year-card", "seasonal", t("New year card", "Thiệp năm mới"), {
    themes: ["party", "friends", "couple"],
    events: ["newYear"],
    slides: 1,
    background: { kind: "color", color: "#f3ead8" },
    art: [art("postcards/postcard-frame-new-year-734", 0, 0.04, 0.2, 0.92), art("celebrations/cel-clinking-champagne-glasses", 0, 0.7, 0.66, 0.24)],
    slots: [],
    texts: [
      text(0, 0.06, 0.05, 0.88, t("Happy New Year", "Chúc mừng năm mới"), { font: "greatVibes", size: 0.1, color: "#8a5a17" }),
      text(0, 0.06, 0.78, 0.6, t("cheers to new chapters", "nâng ly cho chương mới"), { font: "patrickHand", size: 0.045, color: INK, align: "left" }),
    ],
  }),
  design("resolutions", "seasonal", t("Resolutions", "Mục tiêu năm mới"), {
    themes: ["portrait", "nature"],
    events: ["newYear"],
    slides: 1,
    background: { kind: "color", color: "#fbf8f1" },
    art: [art("gen-notes/note-35", 0, 0.5, 0.08, 0.44, { rotation: 3, under: true })],
    slots: [photo(0, 0, 0.06, 0.08, 0.42, 0.56, { shadow: true, rotation: -3 })],
    icons: [0, 1, 2].map((i) => icon("doodle-check", 0, 0.55, 0.2 + i * 0.075, 0.05, { color: "#2f9e5b" })),
    texts: [
      text(0, 0.55, 0.11, 0.38, t("this year:", "năm nay:"), { font: "patrickHand", size: 0.055, color: INK, align: "left", rotation: 3 }),
      ...[t("read more", "đọc nhiều hơn"), t("travel somewhere new", "đi một nơi mới"), t("call mum often", "gọi mẹ thường xuyên")].map((w, i) =>
        text(0, 0.62, 0.2 + i * 0.075, 0.32, w, { font: "patrickHand", size: 0.038, color: INK, align: "left", rotation: 3 }),
      ),
      text(0, 0.06, 0.76, 0.88, t("new year,\nsame me (but better)", "năm mới,\nvẫn là mình (xịn hơn)"), { font: "cormorant", size: 0.065, color: INK, align: "left", bold: true, lineHeight: 1 }),
    ],
  }),

  // ── Tết ────────────────────────────────────────────────────────────────
  design("tet-story", "seasonal", t("Lunar New Year", "Chúc mừng năm mới"), {
    format: "story",
    themes: ["lunar", "portrait"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: TET_RED },
    art: [art("tet/tet-apricot-blossom-branch", 0, 0.46, 0.11, 0.56, { rotation: 8 }), art("tet/tet-red-paper-lantern", 0, 0.06, 0.13, 0.18)],
    slots: [photo(0, 0, 0.14, 0.24, 0.72, 0.4, { mask: "arch", border: { width: 0.012, color: GOLD } })],
    texts: [text(0, 0.08, 0.67, 0.84, t("Happy\nLunar New Year", "Chúc mừng\nnăm mới"), { font: "greatVibes", size: 0.1, color: GOLD, lineHeight: 0.95 })],
  }),
  design("tet-together", "seasonal", t("Together for Tết", "Tết sum vầy"), {
    themes: ["lunar", "kids", "food"],
    events: ["tet"],
    slides: 3,
    background: { kind: "color", color: "#fbf1e1" },
    art: [
      art("tet/tet-cau-doi-red-scrolls", 0, 0.02, 0.1, 0.26),
      art("tet/tet-cau-doi-red-scrolls", 0, 0.72, 0.1, 0.26),
      art("tet/tet-banh-chung-square", 2, 0.66, 0.6, 0.28, { rotation: 6 }),
    ],
    slots: [photo(0, 0, 0.3, 0.14, 0.4, 0.5, { border: { width: 0.012, color: TET_RED } }), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.025), photo(5, 2, 0.08, 0.08, 0.64, 0.56, WHITE_FRAME)],
    texts: [
      text(0, 0.06, 0.7, 0.88, t("together for Tết", "Tết sum vầy"), { font: "playfair", size: 0.1, color: TET_RED, bold: true }),
      text(2, 0.08, 0.76, 0.56, t("peace & prosperity", "an khang thịnh vượng"), { font: "greatVibes", size: 0.075, color: TET_RED, align: "left" }),
    ],
  }),
  design("li-xi", "seasonal", t("Lucky money", "Lì xì đầu năm"), {
    themes: ["lunar", "kids", "friends"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: "#fff4e0" },
    art: [
      art("tet/tet-peach-blossom-branch", 0, -0.04, -0.02, 0.5, { rotation: -6 }),
      art("tet/tet-red-envelope-lucky", 0, 0.7, 0.58, 0.2, { rotation: 12 }),
      art("tet/tet-red-envelope-lucky", 0, 0.58, 0.64, 0.18, { rotation: -8 }),
    ],
    slots: [photo(0, 0, 0.24, 0.14, 0.52, 0.5, { frame: "polaroid", shadow: true, rotation: 3 })],
    texts: [text(0, 0.06, 0.76, 0.52, t("lucky money,\nlucky year", "lì xì đầu năm\nmay mắn cả năm"), { font: "greatVibes", size: 0.07, color: TET_RED, align: "left", lineHeight: 1 })],
  }),
  design("spring-ao-dai", "seasonal", t("Spring is here", "Xuân về"), {
    themes: ["lunar", "spring"],
    events: ["tet", "spring"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    art: [art("tet/tet-peach-blossom-branch", 0, 0.62, -0.02, 0.42, { rotation: 10 })],
    texts: [text(0, 0.06, 0.8, 0.88, t("spring is here", "xuân về"), { font: "greatVibes", size: 0.13, color: "#ffffff", shadow: true, align: "left" })],
  }),
  design("phuc-grid", "seasonal", t("Fortune grid", "Lưới chữ Phúc"), {
    themes: ["lunar", "food", "kids"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    shapes: [block(0, 0.336, 0.336, 0.328, 0.328, TET_RED)],
    art: [art("tet/tet-chu-phuc-diamond", 0, 0.39, 0.345, 0.22)],
    slots: cells(0, 0, [0, 0, 1, 1], 3, 3, 0.008).filter((_, i) => i !== 4).map((s, i) => ({ ...s, photo: i })),
  }),

  // ── Mid-Autumn ──────────────────────────────────────────────────────────
  design("lantern-night", "seasonal", t("Lantern night", "Đêm rước đèn"), {
    format: "story",
    themes: ["lunar", "kids"],
    events: ["midAutumn"],
    slides: 1,
    background: { kind: "color", color: NAVY },
    art: [art("mid-autumn/mid-full-harvest-moon", 0, 0.58, 0.17, 0.34), art("mid-autumn/mid-star-lantern-five-point", 0, 0.68, 0.62, 0.24, { rotation: 8 })],
    slots: [photo(0, 0, 0.08, 0.34, 0.84, 0.36, { mask: "rounded", cornerRadius: 0.05 })],
    texts: [text(0, 0.08, 0.15, 0.5, t("Happy\nMid-Autumn", "Trung thu\nan lành"), { font: "greatVibes", size: 0.1, color: GOLD, align: "left", lineHeight: 0.95 })],
  }),
  design("full-moon", "seasonal", t("Under the full moon", "Đêm trăng rằm"), {
    themes: ["lunar", "food", "kids"],
    events: ["midAutumn"],
    slides: 1,
    background: { kind: "color", color: "#f7e9cf" },
    art: [art("mid-autumn/mid-mooncake-stamped", 0, 0.68, 0.56, 0.26, { rotation: 8 }), art("mid-autumn/mid-jade-rabbit-face", 0, 0.05, 0.6, 0.2, { rotation: -8 })],
    slots: [photo(0, 0, 0.08, 0.06, 0.84, 0.58, { shadow: true })],
    texts: [text(0, 0.06, 0.82, 0.88, t("under the full moon", "đêm trăng rằm"), { font: "greatVibes", size: 0.1, color: "#8a3b17" })],
  }),
  design("lantern-carousel", "seasonal", t("Lanterns", "Đèn lồng"), {
    themes: ["lunar", "kids", "food"],
    events: ["midAutumn"],
    slides: 2,
    background: { kind: "color", color: "#7a1f1f" },
    art: [art("mid-autumn/mid-carp-lantern-hoi-an", 0, 0.62, 0.62, 0.32, { rotation: -6 }), art("mid-autumn/mid-accordion-paper-lantern", 1, 0.8, 0.02, 0.14)],
    slots: [photo(0, 0, 0, 0, 1, 0.74), ...cells(1, 1, [0.06, 0.14, 0.88, 0.8], 2, 2, 0.025, 0.8, { border: { width: 0.008, color: GOLD } })],
    texts: [
      text(0, 0.06, 0.79, 0.6, t("a night of\nlanterns", "một đêm\nđèn lồng"), { font: "greatVibes", size: 0.09, color: GOLD, align: "left", lineHeight: 0.95 }),
      text(1, 0.06, 0.05, 0.7, t("MID-AUTUMN", "TRUNG THU"), { font: "anton", size: 0.07, color: GOLD, align: "left", letterSpacing: 0.06 }),
    ],
  }),
  design("moon-kids", "seasonal", t("Little lanterns", "Rước đèn"), {
    themes: ["kids", "lunar"],
    events: ["midAutumn", "childrensDay"],
    slides: 1,
    background: { kind: "color", color: "#fff1d0" },
    art: [art("mid-autumn/mid-chu-cuoi-banyan-tree", 0, 0.58, 0.04, 0.36), art("mid-autumn/mid-revolving-lantern-keo-quan", 0, 0.06, 0.64, 0.18, { rotation: -6 })],
    slots: [photo(0, 0, 0.1, 0.12, 0.52, 0.416, { mask: "circle", border: { width: 0.012, color: "#ffffff" } })],
    texts: [text(0, 0.3, 0.7, 0.66, t("little lanterns,\nbig smiles", "đèn bé xíu,\nnụ cười to"), { font: "patrickHand", size: 0.065, color: "#7a3413", align: "left", lineHeight: 1.05 })],
  }),

  // ── Women's days, teachers, mums, children ──────────────────────────────
  design("flowers-for-her", "seasonal", t("Flowers for her", "Hoa tặng nàng"), {
    themes: ["flowers", "portrait"],
    events: ["womensDay", "vnWomensDay", "mothersDay"],
    slides: 1,
    background: { kind: "color", color: "#fdeef0" },
    art: [art("celebrations/cel-pink-spring-tulip", 0, 0.7, 0.54, 0.24, { rotation: 10 }), art("celebrations/cel-red-romance-rose", 0, 0.06, 0.04, 0.18, { rotation: -14 })],
    slots: [photo(0, 0, 0.2, 0.08, 0.6, 0.6, { mask: "arch" })],
    texts: [text(0, 0.06, 0.74, 0.88, t("for every woman\nI love", "gửi những người phụ nữ\nmình thương"), { font: "greatVibes", size: 0.075, color: "#b03a5b", lineHeight: 1.05 })],
  }),
  design("october-20", "seasonal", t("Women's Day 20.10", "Mừng 20.10"), {
    themes: ["flowers", "portrait"],
    events: ["vnWomensDay", "womensDay"],
    slides: 2,
    background: { kind: "color", color: "#fbf6f1" },
    art: [art("botanical/rose-redoute-bouquet", 0, 0.62, 0.38, 0.34, { rotation: 8 })],
    slots: [photo(0, 0, 0.08, 0.3, 0.52, 0.5, { frame: "polaroid", shadow: true, rotation: -3 }), photo(1, 1, 0.08, 0.08, 0.84, 0.66, WHITE_FRAME)],
    texts: [
      text(0, 0.08, 0.06, 0.84, t("20.10", "20.10"), { font: "anton", size: 0.16, color: "#c2304b", align: "left" }),
      text(0, 0.46, 0.13, 0.46, t("for the women\nof my life", "gửi những\nngười phụ nữ"), { font: "cormorant", size: 0.045, color: INK, align: "right", lineHeight: 1.05 }),
      text(1, 0.08, 0.8, 0.84, t("thank you for everything", "cảm ơn vì tất cả"), { font: "greatVibes", size: 0.08, color: "#c2304b" }),
    ],
  }),
  design("thank-you-teacher", "seasonal", t("Thank you, teacher", "Tri ân thầy cô"), {
    themes: ["school", "kids"],
    events: ["teachersDay", "graduation"],
    slides: 1,
    background: { kind: "color", color: "#eef3f8" },
    art: [art("gen-paper-scraps/scrap-8", 0, 0.05, 0.56, 0.6, { rotation: -3, under: true }), art("celebrations/cel-rolled-diploma-red-ribbon", 0, 0.66, 0.66, 0.28, { rotation: -10 })],
    slots: [photo(0, 0, 0.14, 0.06, 0.72, 0.5, { shadow: true, rotation: 2 })],
    texts: [text(0, 0.1, 0.63, 0.5, t("thank you,\nteacher ♡", "cảm ơn\nthầy cô ♡"), { font: "patrickHand", size: 0.07, color: "#30476e", align: "left", rotation: -3, lineHeight: 1.05 })],
  }),
  design("chalkboard", "seasonal", t("Chalkboard", "Bảng đen"), {
    themes: ["school", "kids"],
    events: ["teachersDay", "backToSchool"],
    slides: 1,
    background: { kind: "color", color: "#2f4a3a" },
    slots: [photo(0, 0, 0.12, 0.2, 0.76, 0.5, { border: { width: 0.015, color: "#f4f1e8" } })],
    icons: [icon("doodle-star", 0, 0.06, 0.06, 0.1, { color: "#f4f1e8" }), icon("doodle-sparkle", 0, 0.82, 0.74, 0.1, { color: "#f4f1e8" }), icon("doodle-underlineWave", 0, 0.2, 0.86, 0.6, { color: "#f4f1e8" })],
    texts: [
      text(0, 0.18, 0.06, 0.7, t("Teachers' Day", "Ngày Nhà giáo"), { font: "patrickHand", size: 0.075, color: "#f4f1e8" }),
      text(0, 0.1, 0.76, 0.8, t("thank you for everything", "cảm ơn thầy cô"), { font: "patrickHand", size: 0.06, color: "#f4f1e8" }),
    ],
  }),
  design("love-you-mum", "seasonal", t("Love you, mum", "Thương mẹ"), {
    themes: ["kids", "flowers", "portrait"],
    events: ["mothersDay"],
    slides: 1,
    background: { kind: "color", color: "#fbf3ee" },
    art: [art("botanical/rose-centifolia-bloom", 0, -0.04, 0.56, 0.36, { rotation: -10 }), art("botanical/rose-alba-regalis", 0, 0.7, 0.02, 0.3, { rotation: 12 })],
    slots: [photo(0, 0, 0.18, 0.1, 0.64, 0.6, { shadow: true })],
    texts: [text(0, 0.24, 0.76, 0.7, t("love you, mum", "thương mẹ nhiều"), { font: "greatVibes", size: 0.1, color: "#9c3550" })],
  }),
  design("kids-day", "seasonal", t("Children's Day", "Ngày thiếu nhi"), {
    themes: ["kids"],
    events: ["childrensDay"],
    slides: 1,
    background: { kind: "color", color: "#e7f6ff" },
    art: [art("celebrations/cel-pastel-balloon-bunch", 0, 0.64, 0.04, 0.3, { rotation: 6 }), art("celebrations/cel-plush-teddy-bear", 0, 0.06, 0.68, 0.22, { rotation: -6 })],
    slots: [photo(0, 0, 0.1, 0.12, 0.56, 0.448, { mask: "circle", border: { width: 0.014, color: "#ffffff" } }), photo(1, 0, 0.42, 0.52, 0.5, 0.4, { frame: "polaroid", shadow: true, rotation: 4 })],
    texts: [text(0, 0.06, 0.03, 0.6, t("1.6", "1.6"), { font: "anton", size: 0.1, color: "#ff6b6b", align: "left" })],
  }),

  // ── Graduation, seasons ─────────────────────────────────────────────────
  design("graduated", "seasonal", t("Graduated!", "Tốt nghiệp rồi!"), {
    themes: ["school", "friends"],
    events: ["graduation"],
    slides: 2,
    background: { kind: "color", color: "#f4efe6" },
    art: [art("celebrations/cel-graduation-mortarboard", 0, 0.54, 0.06, 0.36, { rotation: 12 })],
    slots: [photo(0, 0, 0.1, 0.22, 0.6, 0.58, { frame: "polaroid", shadow: true, rotation: -3 }), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.025)],
    texts: [
      text(0, 0.06, 0.06, 0.5, t("we did it!", "làm được rồi!"), { font: "patrickHand", size: 0.07, color: INK, align: "left" }),
      text(0, 0.64, 0.66, 0.32, t("caps in\nthe air", "tung mũ\nlên trời"), { font: "greatVibes", size: 0.07, color: INK, align: "left", lineHeight: 1 }),
    ],
  }),
  design("diploma-story", "seasonal", t("Diploma day", "Ngày nhận bằng"), {
    format: "story",
    themes: ["school"],
    events: ["graduation"],
    slides: 1,
    background: { kind: "color", color: NAVY },
    art: [art("celebrations/cel-diploma-paper-scroll", 0, 0.62, 0.6, 0.3, { rotation: -8 })],
    slots: [photo(0, 0, 0.1, 0.16, 0.8, 0.44, { border: { width: 0.012, color: GOLD } })],
    texts: [text(0, 0.08, 0.64, 0.56, t("officially\ngraduated", "chính thức\ntốt nghiệp"), { font: "cormorant", size: 0.085, color: "#f5efe2", align: "left", bold: true, lineHeight: 1 })],
  }),
  design("hello-spring", "seasonal", t("Hello spring", "Xin chào mùa xuân"), {
    themes: ["spring", "flowers"],
    events: ["spring", "tet"],
    slides: 1,
    background: { kind: "color", color: "#fdeff2" },
    art: [art("tet/tet-pink-peach-blossom", 0, 0.66, 0.52, 0.28, { rotation: 10 })],
    slots: [photo(0, 0, 0.16, 0.08, 0.68, 0.62, { mask: "arch" })],
    texts: [text(0, 0.06, 0.76, 0.6, t("hello\nspring", "xin chào\nmùa xuân"), { font: "greatVibes", size: 0.1, color: "#c45a7a", align: "left", lineHeight: 0.92 })],
  }),
  design("winter-mood", "seasonal", t("Winter mood", "Mùa đông"), {
    themes: ["winter"],
    events: ["winter", "christmas"],
    slides: 2,
    background: { kind: "color", color: "#e9eef3" },
    art: [art("christmas/xmas-knitted-red-scarf", 0, 0.7, 0.62, 0.24, { rotation: 8 }), art("christmas/xmas-crystal-snowflake", 0, 0.06, 0.06, 0.1)],
    slots: [photo(0, 0, 0.1, 0.12, 0.62, 0.6, { shadow: true }), photo(1, 1, 0.06, 0.06, 0.43, 0.88), photo(2, 1, 0.51, 0.06, 0.43, 0.43), photo(3, 1, 0.51, 0.51, 0.43, 0.43)],
    texts: [text(0, 0.1, 0.78, 0.6, t("winter mood", "mùa đông"), { font: "cormorant", size: 0.09, color: "#23406b", align: "left", bold: true })],
  }),

  // ── Halloween ───────────────────────────────────────────────────────────
  design("ghost-o-clock", "seasonal", t("Ghost o'clock", "Giờ của ma"), {
    format: "story",
    themes: ["autumn", "friends"],
    events: ["halloween"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.06, 0.4, 0.88, t("it's ghost-o-clock", "đến giờ ma rồi"), { font: "cormorant", size: 0.1, color: "#ffffff", bold: true, shadow: true }),
      text(0, 0.1, 0.76, 0.8, t("Halloween party · 31 Oct · 9 pm", "Tiệc Halloween · 31/10 · 21h"), { font: "lora", size: 0.035, color: "#ffffff", shadow: true }),
    ],
  }),
  design("happy-halloween", "seasonal", t("Happy Halloween", "Halloween vui vẻ"), {
    format: "story",
    themes: ["mono", "portrait"],
    events: ["halloween"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.06, 0.4, 0.88, t("HAPPY\nHALLOWEEN", "HAPPY\nHALLOWEEN"), { font: "anton", size: 0.16, color: PUMPKIN, stroke: { color: "#111111", width: 0.06 }, lineHeight: 0.95 }),
      text(0, 0.1, 0.6, 0.8, t("(halloween is my personality)", "(halloween là chính mình)"), { font: "cormorant", size: 0.04, color: "#ffffff", shadow: true }),
    ],
  }),

  // ── Birthdays ───────────────────────────────────────────────────────────
  design("ransom-birthday", "occasion", t("Cut-out birthday", "Sinh nhật chữ cắt"), {
    themes: ["portrait", "party"],
    slides: 1,
    background: { kind: "color", color: "#2b2b2b" },
    art: [art("gen-instant/instant-5", 0, 0.16, 0.24, 0.68, { rotation: 3 })],
    shapes: [block(0, 0.3, 0.89, 0.42, 0.02, "#7aa7ff", { rotation: -3, opacity: 0.9, above: true })],
    slots: [],
    texts: [text(0, 0.04, 0.02, 0.92, t("HAPPY\nBIRTHDAY", "CHÚC MỪNG\nSINH NHẬT"), { font: "anton", size: 0.1, color: INK, lineHeight: 1, cutout: { style: "magazine", seed: 3, mess: 0.6, wave: 0.35 } }), text(0, 0.28, 0.85, 0.46, t("BESTIE", "BẠN THÂN"), { font: "patrickHand", size: 0.06, color: INK, rotation: -3 })],
  }),
  design("doodle-birthday", "occasion", t("Doodled birthday", "Sinh nhật vẽ tay"), {
    themes: ["party", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#d9d9d6" },
    shapes: sketch(0, 0.22, 0.24, 0.56, 0.52),
    slots: [photo(0, 0, 0.22, 0.24, 0.56, 0.52)],
    icons: [icon("doodle-star", 0, 0.1, 0.24, 0.08, { color: INK }), icon("doodle-sparkle", 0, 0.82, 0.62, 0.08, { color: INK }), icon("doodle-swirl", 0, 0.8, 0.2, 0.07, { color: INK })],
    texts: [
      text(0, 0.1, 0.08, 0.8, t("HAPPY", "CHÚC MỪNG"), { font: "patrickHand", size: 0.09, color: INK, letterSpacing: 0.08 }),
      text(0, 0.1, 0.83, 0.8, t("BIRTHDAY", "SINH NHẬT"), { font: "patrickHand", size: 0.09, color: INK, letterSpacing: 0.08 }),
    ],
  }),
  design("make-a-wish", "occasion", t("Make a wish", "Ước đi nào"), {
    format: "story",
    themes: ["party", "friends"],
    slides: 1,
    background: { kind: "color", color: "#fff0e6" },
    art: [art("celebrations/cel-bunting-flag-garland", 0, 0.08, 0.12, 0.84), art("celebrations/cel-birthday-cake-candles", 0, 0.6, 0.56, 0.32)],
    slots: [photo(0, 0, 0.16, 0.25, 0.6, 0.3375, { mask: "circle", border: { width: 0.014, color: "#ffffff" } })],
    texts: [text(0, 0.08, 0.66, 0.5, t("make a\nwish ✦", "ước đi\nnào ✦"), { font: "greatVibes", size: 0.11, color: "#d6455d", align: "left", lineHeight: 0.95 })],
  }),
  design("birthday-balloons", "occasion", t("Birthday balloons", "Bóng bay sinh nhật"), {
    themes: ["party", "friends", "portrait"],
    slides: 3,
    background: { kind: "color", color: "#fde9d9" },
    art: [art("celebrations/cel-red-party-balloon", 0, 0.66, 0.08, 0.26, { rotation: 8 }), art("celebrations/cel-party-popper-confetti", 2, 0.06, 0.72, 0.2, { rotation: -10 })],
    slots: [photo(0, 0, 0.08, 0.38, 0.56, 0.54, { frame: "polaroid", shadow: true, rotation: -3 }), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.025), photo(5, 2, 0.16, 0.08, 0.68, 0.6, { frame: "polaroid", shadow: true, rotation: 2 })],
    texts: [
      text(0, 0.08, 0.08, 0.6, t("it's my\nbirthday!", "sinh nhật\nmình nè!"), { font: "playfair", size: 0.1, color: "#d6455d", align: "left", bold: true, lineHeight: 0.95 }),
      text(2, 0.32, 0.8, 0.6, t("another year older", "thêm một tuổi mới"), { font: "patrickHand", size: 0.055, color: INK, align: "right" }),
    ],
  }),
];
