import type { Template } from "../types";
import { art, block, cells, design, icon, KRAFT, photo, t, tape, text, WHITE_FRAME } from "./kit";

// Tết, second batch (2026-10-28): the days of Tết (mùng 1 / 2 / 3), the flower market,
// going home, lion dance, Đông Hồ prints, wishes. Stickers from the packs tet,
// vietnam-heritage; frames gen-camera, gen-stamps, gen-instant.

const RED = "#b71c1c";
const DEEP = "#7f1010";
const GOLD = "#f2c75c";
const CREAM = "#fbf1e1";
const PEACH = "#f7c6cf";
const P = 0.8;

export const TET: Template[] = [
  design("tet-three-days", "seasonal", t("Three days of Tết", "Mùng 1, 2, 3"), {
    themes: ["lunar", "kids", "food"],
    events: ["tet"],
    slides: 4,
    background: { kind: "color", color: CREAM },
    art: [art("tet/tet-red-paper-lantern", 0, 0.76, 0.02, 0.16), art("tet/tet-apricot-blossom-branch", 3, 0.56, 0.02, 0.42, { rotation: 8 })],
    slots: [photo(0, 0, 0.1, 0.3, 0.8, 0.6, { border: { width: 0.012, color: RED } }), photo(1, 1, 0.08, 0.2, 0.84, 0.62, WHITE_FRAME), photo(2, 2, 0.08, 0.2, 0.84, 0.62, WHITE_FRAME), photo(3, 3, 0.08, 0.2, 0.84, 0.62, WHITE_FRAME)],
    texts: [
      text(0, 0.08, 0.07, 0.7, t("Tết\nat home", "Tết\nnhà mình"), { font: "playfair", size: 0.1, color: RED, align: "left", bold: true, lineHeight: 0.95 }),
      ...[t("day 1 — dad's side", "mùng 1 — tết cha"), t("day 2 — mum's side", "mùng 2 — tết mẹ"), t("day 3 — our teachers", "mùng 3 — tết thầy")].map((w, i) =>
        text(i + 1, 0.08, 0.07, 0.84, w, { font: "patrickHand", size: 0.065, color: RED, align: "left" }),
      ),
      ...[1, 2, 3].map((s) => text(s, 0.08, 0.86, 0.84, t(`0${s}`, `0${s}`), { font: "anton", size: 0.07, color: GOLD, align: "right", stroke: { color: RED, width: 0.04 } })),
    ],
  }),
  design("tet-flower-market", "seasonal", t("Flower market", "Chợ hoa ngày Tết"), {
    themes: ["lunar", "flowers", "city"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: "#fff6ea" },
    art: [
      art("gen-stamps/stamp-5", 0, 0.05, 0.12, 0.5, { rotation: -4 }),
      art("gen-stamps/stamp-9", 0, 0.52, 0.18, 0.42, { rotation: 5, photo: 1 }),
      art("gen-stamps/stamp-16", 0, 0.2, 0.55, 0.42, { rotation: 2, photo: 2 }),
      art("tet/tet-pink-peach-blossom", 0, 0.66, 0.66, 0.28, { rotation: -10 }),
    ],
    slots: [],
    texts: [text(0, 0.06, 0.03, 0.88, t("flower market, 28th of Tết", "chợ hoa 28 Tết"), { font: "greatVibes", size: 0.08, color: RED })],
  }),
  design("tet-homecoming", "seasonal", t("Going home for Tết", "Về nhà ăn Tết"), {
    format: "story",
    themes: ["lunar", "travel", "portrait"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: RED },
    art: [art("tet/tet-peach-blossom-branch", 0, 0.5, 0.11, 0.5, { rotation: 10 })],
    slots: [photo(0, 0, 0.1, 0.2, 0.8, 0.4, { border: { width: 0.012, color: CREAM }, rotation: -2 })],
    widgets: [{ slide: 0, x: 0.08, y: 0.64, w: 0.84, kind: "boardingPass", fields: { fromCode: t("SGN", "SGN"), fromCity: t("Saigon", "Sài Gòn"), toCode: t("HOME", "NHÀ"), toCity: t("Home", "Quê nhà"), date: t("Tết", "29 Tết") } }],
    texts: [text(0, 0.08, 0.13, 0.84, t("going home", "về nhà ăn Tết"), { font: "greatVibes", size: 0.1, color: GOLD, align: "left" })],
  }),
  design("tet-lion-dance", "seasonal", t("Lion dance", "Múa lân"), {
    themes: ["lunar", "city", "kids"],
    events: ["tet", "midAutumn"],
    slides: 1,
    background: { kind: "color", color: "#ffd84d" },
    art: [art("tet/tet-lion-dance-head", 0, 0.54, 0.56, 0.42, { rotation: -6 }), art("tet/tet-firecracker-string", 0, 0.04, 0, 0.14)],
    slots: [photo(0, 0, 0.2, 0.08, 0.7, 0.56, { shadow: true, rotation: 3 })],
    texts: [text(0, 0.06, 0.74, 0.5, t("TÙNG\nTÙNG\nCHENG!", "TÙNG\nTÙNG\nCHENG!"), { font: "anton", size: 0.08, color: RED, align: "left", lineHeight: 0.95 })],
  }),
  design("tet-dong-ho", "seasonal", t("Đông Hồ Tết", "Tết tranh Đông Hồ"), {
    themes: ["lunar", "retro", "kids"],
    events: ["tet"],
    slides: 2,
    background: { kind: "color", color: "#efe0c2" },
    art: [art("vietnam-heritage/vn-dong-ho-ga-dan", 0, 0.06, 0.06, 0.4, { rotation: -3 }), art("vietnam-heritage/vn-dong-ho-chuot-ruoc-den", 1, 0.08, 0.6, 0.46, { rotation: 2 })],
    slots: [photo(0, 0, 0.42, 0.22, 0.5, 0.6, { border: { width: 0.01, color: DEEP } }), photo(1, 1, 0.06, 0.06, 0.88, 0.5, { border: { width: 0.01, color: DEEP } })],
    texts: [
      text(0, 0.06, 0.62, 0.34, t("old-school\nTết", "Tết\nxưa"), { font: "cormorant", size: 0.09, color: DEEP, align: "left", bold: true, lineHeight: 0.95 }),
      text(1, 0.56, 0.68, 0.38, t("warm, full house,\nlike the old days", "ấm cúng, đông đủ,\nnhư ngày xưa"), { font: "patrickHand", size: 0.045, color: DEEP, align: "right" }),
    ],
  }),
  design("tet-wishes", "seasonal", t("New year wishes", "Lời chúc đầu năm"), {
    themes: ["lunar", "portrait", "kids"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: DEEP },
    shapes: [block(0, 0.05, 0.035, 0.9, 0.004, GOLD), block(0, 0.05, 0.96, 0.9, 0.004, GOLD)],
    slots: [photo(0, 0, 0.27, 0.1, 0.46, 0.368, { mask: "circle", border: { width: 0.012, color: GOLD } })],
    art: [art("tet/tet-chu-phuc-diamond", 0, 0.06, 0.06, 0.16), art("tet/tet-chu-phuc-diamond", 0, 0.78, 0.06, 0.16)],
    texts: [
      text(0, 0.06, 0.52, 0.88, t("Happy\nLunar New Year", "Chúc mừng\nnăm mới"), { font: "greatVibes", size: 0.1, color: GOLD, lineHeight: 0.95 }),
      text(0, 0.1, 0.78, 0.8, t("HEALTH · PEACE · LUCK · JOY", "AN KHANG · THỊNH VƯỢNG · VẠN SỰ NHƯ Ý"), { font: "spaceGrotesk", size: 0.028, color: CREAM, letterSpacing: 0.15 }),
    ],
  }),
  design("tet-kumquat", "seasonal", t("Kumquat & polaroids", "Quất & polaroid"), {
    themes: ["lunar", "kids", "friends"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: "#fdf3e4" },
    art: [art("tet/tet-kumquat-bonsai-pot", 0, 0.62, 0.54, 0.34)],
    slots: [
      photo(0, 0, 0.06, 0.06, 0.44, 0.42, { frame: "polaroid", shadow: true, rotation: -5 }),
      photo(1, 0, 0.48, 0.08, 0.44, 0.42, { frame: "polaroid", shadow: true, rotation: 4 }),
      photo(2, 0, 0.12, 0.5, 0.44, 0.42, { frame: "polaroid", shadow: true, rotation: 2 }),
    ],
    texts: [text(0, 0.6, 0.9, 0.36, t("Tết 2027", "Tết 2027"), { font: "patrickHand", size: 0.05, color: RED })],
  }),
  design("tet-camera", "seasonal", t("Tết digicam", "Máy ảnh ngày Tết"), {
    themes: ["lunar", "friends", "portrait"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: PEACH },
    art: [art("gen-camera/camera-19", 0, 0.2, 0.06, 0.6, { rotation: 4 }), art("tet/tet-red-envelope-lucky", 0, 0.04, 0.64, 0.18, { rotation: -14 }), art("tet/tet-pink-peach-blossom", 0, 0.7, 0.66, 0.26)],
    slots: [],
    texts: [text(0, 0.06, 0.88, 0.88, t("first photo of the year", "tấm ảnh đầu năm"), { font: "patrickHand", size: 0.05, color: DEEP })],
  }),
  design("tet-ao-dai-story", "seasonal", t("Áo dài in spring", "Áo dài du xuân"), {
    format: "story",
    themes: ["lunar", "portrait", "spring"],
    events: ["tet", "spring"],
    slides: 1,
    background: { kind: "color", color: "#fff2f2" },
    art: [art("tet/tet-apricot-blossom-branch", 0, -0.06, 0.1, 0.5, { rotation: -14 }), art("tet/tet-apricot-blossom-branch", 0, 0.62, 0.7, 0.4, { rotation: 160 })],
    slots: [photo(0, 0, 0.16, 0.2, 0.68, 0.46, { mask: "arch", border: { width: 0.01, color: GOLD } })],
    texts: [text(0, 0.08, 0.69, 0.6, t("spring in\nan áo dài", "du xuân\ncùng áo dài"), { font: "greatVibes", size: 0.1, color: RED, align: "left", lineHeight: 0.95 })],
  }),
  design("tet-five-fruits", "seasonal", t("Five-fruit tray", "Mâm ngũ quả"), {
    themes: ["lunar", "food"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: RED },
    art: [art("tet/tet-mam-ngu-qua-tray", 0, 0.3, 0.68, 0.4)],
    slots: cells(0, 0, [0.06, 0.15, 0.88, 0.5], 3, 1, 0.025, P, { border: { width: 0.008, color: GOLD } }),
    texts: [text(0, 0.06, 0.04, 0.88, t("the Tết table", "bàn thờ ngày Tết"), { font: "greatVibes", size: 0.085, color: GOLD })],
  }),
  design("tet-banh-chung", "seasonal", t("Wrapping bánh chưng", "Gói bánh chưng"), {
    themes: ["lunar", "food", "kids"],
    events: ["tet"],
    slides: 3,
    background: { kind: "color", color: "#eef3e2" },
    art: [art("tet/tet-banh-chung-square", 0, 0.66, 0.04, 0.28, { rotation: 8 }), art("tet/tet-banh-tet-cylinder", 2, 0.06, 0.74, 0.26, { rotation: -10 })],
    shapes: [tape(1, 0.3, 0.07, -6), tape(1, 0.72, 0.5, 5)],
    slots: [photo(0, 0, 0.08, 0.26, 0.84, 0.64), photo(1, 1, 0.06, 0.08, 0.5, 0.44, WHITE_FRAME), photo(2, 1, 0.44, 0.52, 0.5, 0.42, WHITE_FRAME), photo(3, 2, 0.1, 0.08, 0.8, 0.62, { shadow: true })],
    texts: [
      text(0, 0.08, 0.07, 0.6, t("wrapping\nbánh chưng", "gói bánh\nchưng"), { font: "playfair", size: 0.09, color: "#2f5d32", align: "left", bold: true, lineHeight: 0.95 }),
      text(1, 0.06, 0.62, 0.34, t("all night\nby the pot", "canh nồi\ncả đêm"), { font: "patrickHand", size: 0.055, color: "#2f5d32", align: "left" }),
      text(2, 0.36, 0.8, 0.58, t("tastes like home", "vị của nhà"), { font: "greatVibes", size: 0.08, color: "#2f5d32", align: "right" }),
    ],
  }),
  design("tet-firecrackers", "seasonal", t("Firecrackers", "Dây pháo"), {
    format: "story",
    themes: ["lunar", "party", "friends"],
    events: ["tet", "newYear"],
    slides: 1,
    background: { kind: "color", color: "#1a0d0d" },
    art: [art("tet/tet-firecracker-string", 0, 0.02, 0.1, 0.16), art("tet/tet-firecracker-string", 0, 0.82, 0.1, 0.16)],
    slots: [photo(0, 0, 0.2, 0.18, 0.6, 0.5, { border: { width: 0.01, color: GOLD } })],
    icons: [icon("doodle-burst", 0, 0.66, 0.66, 0.2, { color: GOLD }), icon("doodle-sparkle", 0, 0.12, 0.72, 0.08, { color: GOLD })],
    texts: [text(0, 0.1, 0.74, 0.8, t("new year,\nnew luck", "năm mới\nphát tài"), { font: "anton", size: 0.09, color: GOLD, lineHeight: 1 })],
  }),
  design("tet-li-xi-grid", "seasonal", t("Lucky money haul", "Thu hoạch lì xì"), {
    themes: ["lunar", "kids", "friends"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: "#fff1d6" },
    art: [art("tet/tet-red-envelope-lucky", 0, 0.66, 0.02, 0.14, { rotation: 18 }), art("tet/tet-red-envelope-lucky", 0, 0.78, 0.07, 0.14, { rotation: -10 })],
    slots: [photo(0, 0, 0.06, 0.18, 0.56, 0.5), photo(1, 0, 0.64, 0.18, 0.3, 0.24), photo(2, 0, 0.64, 0.44, 0.3, 0.24), ...cells(3, 0, [0.06, 0.7, 0.88, 0.24], 3, 1, 0.02)],
    texts: [text(0, 0.06, 0.05, 0.6, t("lucky money\nhaul", "mùa lì xì\nbội thu"), { font: "patrickHand", size: 0.06, color: RED, align: "left", lineHeight: 1 })],
  }),
  design("tet-card", "seasonal", t("New year card", "Thiệp xuân"), {
    themes: ["lunar", "portrait"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    art: [art("gen-instant/instant-11", 0, 0.24, 0.06, 0.52, { rotation: -3 }), art("tet/tet-dragon-head-emblem", 0, 0.04, 0.62, 0.3, { rotation: -6 }), art("tet/tet-apricot-blossom-branch", 0, 0.64, 0.6, 0.34, { rotation: 6 })],
    slots: [],
    texts: [text(0, 0.3, 0.84, 0.4, t("xuân an lành", "xuân an lành"), { font: "greatVibes", size: 0.075, color: RED })],
  }),
  design("spring-picnic", "seasonal", t("Spring picnic", "Dã ngoại mùa xuân"), {
    themes: ["spring", "flowers", "friends", "food"],
    events: ["spring"],
    slides: 2,
    background: { kind: "color", color: "#f4f8ec" },
    art: [art("gen-washi/washi-24", 0, 0.3, 0.05, 0.4, { rotation: -4 }), art("botanical/rose-anemonoides", 1, 0.72, 0.66, 0.24, { rotation: 10 })],
    slots: [photo(0, 0, 0.1, 0.08, 0.8, 0.6, WHITE_FRAME), ...cells(1, 1, [0.06, 0.06, 0.88, 0.58], 2, 1, 0.03)],
    texts: [
      text(0, 0.1, 0.76, 0.8, t("a spring picnic", "dã ngoại mùa xuân"), { font: "greatVibes", size: 0.09, color: "#5b7a3a" }),
      text(1, 0.06, 0.72, 0.6, t("strawberries, sunshine\n& no plans", "dâu tây, nắng\n& không kế hoạch"), { font: "patrickHand", size: 0.05, color: "#5b7a3a", align: "left" }),
    ],
  }),
];
