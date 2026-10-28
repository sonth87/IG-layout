import type { Template } from "../types";
import { art, cells, design, icon, INK, photo, strip, t, text, WHITE_FRAME } from "./kit";

// Love (2026-10-28): love letters, hearts, roses, rings — Valentine's comes up in February.

const ROSE = "#c2304b";
const BLUSH = "#f8e1e4";
const kissStrip = strip(0, 0, 0.5, 0.46, 0.38, 4, 2, 0.5625, "#8f1b2c");

export const LOVE: Template[] = [
  design("love-letter", "love", t("Love letter", "Thư tình"), {
    themes: ["couple"],
    events: ["valentine"],
    slides: 1,
    background: { kind: "color", color: BLUSH },
    art: [art("gen-envelopes/envelope-10", 0, 0.15, 0.04, 0.7), art("celebrations/cel-heart-box-ribbon", 0, 0.68, 0.66, 0.24, { rotation: 10 })],
    slots: [],
    texts: [text(0, 0.06, 0.85, 0.64, t("to you, with love", "gửi cậu, thương thật nhiều"), { font: "greatVibes", size: 0.075, color: ROSE, align: "left" })],
  }),
  design("be-mine", "love", t("Be my valentine", "Làm valentine của tớ"), {
    themes: ["couple", "flowers"],
    events: ["valentine"],
    slides: 3,
    background: { kind: "color", color: "#ffd9df" },
    art: [art("celebrations/cel-red-romance-rose", 0, 0.62, 0.52, 0.3, { rotation: 12 })],
    slots: [photo(0, 1, 0.06, 0.08, 0.43, 0.84), photo(1, 1, 0.51, 0.08, 0.43, 0.84), photo(2, 2, 0.1, 0.08, 0.8, 0.66, { mask: "heart" })],
    icons: [icon("doodle-hearts", 0, 0.08, 0.68, 0.24, { color: ROSE })],
    texts: [
      text(0, 0.08, 0.14, 0.84, t("be my\nvalentine", "làm valentine\ncủa tớ nhé"), { font: "playfair", size: 0.12, color: ROSE, align: "left", bold: true, lineHeight: 0.95 }),
      text(2, 0.1, 0.8, 0.8, t("yes, always ♡", "luôn luôn ♡"), { font: "greatVibes", size: 0.09, color: ROSE }),
    ],
  }),
  design("our-story", "love", t("Our story", "Chuyện của mình"), {
    themes: ["couple", "travel"],
    events: ["valentine"],
    slides: 3,
    background: { kind: "color", color: "#f6efe8" },
    slots: [0, 1, 2].map((i) => photo(i, i, 0.16, 0.1, 0.68, 0.6, { frame: "polaroid", shadow: true, rotation: [-3, 2, -1][i] })),
    icons: [icon("doodle-heart", 0, 0.76, 0.06, 0.12, { color: ROSE }), icon("doodle-arrowStraight", 1, 0.72, 0.84, 0.18, { color: INK })],
    texts: [t("how we met", "lần đầu gặp"), t("our first trip", "chuyến đi đầu tiên"), t("and still us", "và vẫn là mình")].map((w, i) =>
      text(i, 0.1, 0.83, 0.8, w, { font: "greatVibes", size: 0.085, color: INK }),
    ),
  }),
  design("letter-story", "love", t("A letter for you", "Lá thư cho cậu"), {
    format: "story",
    themes: ["couple"],
    events: ["valentine"],
    slides: 1,
    background: { kind: "color", color: "#a3263d" },
    art: [art("gen-envelopes/envelope-1", 0, 0.12, 0.16, 0.76)],
    slots: [],
    texts: [
      text(0, 0.1, 0.68, 0.8, t("open when you miss me", "mở ra khi nhớ tớ"), { font: "greatVibes", size: 0.08, color: "#fbe9ec" }),
      text(0, 0.1, 0.75, 0.8, t("FEB 14", "14 THÁNG 2"), { font: "spaceGrotesk", size: 0.032, color: "#f3c4cd", letterSpacing: 0.4 }),
    ],
  }),
  design("days-together", "love", t("365 days", "365 ngày"), {
    themes: ["couple"],
    slides: 1,
    background: { kind: "color", color: "#fbf3ee" },
    slots: [photo(0, 0, 0.36, 0.08, 0.56, 0.6, { shadow: true })],
    icons: [icon("doodle-heartFilled", 0, 0.08, 0.6, 0.1, { color: ROSE })],
    texts: [
      text(0, 0.06, 0.08, 0.3, t("365", "365"), { font: "anton", size: 0.13, color: ROSE, align: "left" }),
      text(0, 0.06, 0.26, 0.3, t("days of\nyou & me", "ngày\nbên nhau"), { font: "cormorant", size: 0.055, color: INK, align: "left", lineHeight: 1.05 }),
      text(0, 0.06, 0.76, 0.88, t("and counting", "và còn tiếp"), { font: "greatVibes", size: 0.1, color: INK, align: "left" }),
    ],
  }),
  design("kiss-booth", "love", t("Kiss booth", "Photobooth đôi"), {
    format: "story",
    themes: ["couple"],
    events: ["valentine"],
    slides: 1,
    background: { kind: "color", color: "#ffd9df" },
    shapes: [kissStrip.shape],
    slots: kissStrip.slots,
    icons: [icon("heart", 0, 0.7, 0.14, 0.14, { color: ROSE, rotation: 12 }), icon("heart", 0, 0.14, 0.7, 0.1, { color: "#ff8fa6", rotation: -14 })],
  }),
  design("pressed-roses", "love", t("Pressed roses", "Hoa hồng ép"), {
    themes: ["portrait", "couple", "flowers"],
    events: ["womensDay", "vnWomensDay"],
    slides: 1,
    background: { kind: "color", color: "#fbf6f4" },
    art: [
      art("botanical/rose-gallica-pontiana", 0, -0.04, 0.02, 0.32, { rotation: -14 }),
      art("botanical/rose-indica-redoute", 0, 0.74, 0.04, 0.28, { rotation: 16 }),
      art("botanical/rose-hudsoniana", 0, 0.7, 0.62, 0.3, { rotation: -8 }),
    ],
    slots: [photo(0, 0, 0.2, 0.14, 0.6, 0.66)],
    texts: [text(0, 0.2, 0.84, 0.6, t("happy\nlittle days", "những ngày\nbé xinh"), { font: "cormorant", size: 0.042, color: INK, background: { color: "#efe2c7", padding: 0.15, radius: 0.05 }, lineHeight: 1 })],
  }),
  design("forever", "love", t("Forever & always", "Mãi mãi"), {
    themes: ["couple"],
    slides: 1,
    background: { kind: "color", color: "#f5f1ea" },
    art: [art("celebrations/cel-interlocked-gold-rings", 0, 0.4, 0.04, 0.2)],
    slots: [photo(0, 0, 0.1, 0.22, 0.38, 0.5, { mask: "arch" }), photo(1, 0, 0.52, 0.22, 0.38, 0.5, { mask: "arch" })],
    texts: [text(0, 0.1, 0.78, 0.8, t("forever & always", "mãi mãi về sau"), { font: "greatVibes", size: 0.1, color: INK })],
  }),
  design("love-grid", "love", t("Love in nine", "Chín khung yêu thương"), {
    themes: ["couple", "travel", "food"],
    events: ["valentine"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: cells(0, 0, [0, 0, 1, 1], 3, 3, 0.008).filter((_, i) => i !== 4).map((s, i) => ({ ...s, photo: i })),
    shapes: [{ slide: 0, x: 0.336, y: 0.336, w: 0.328, h: 0.328, shape: "rect", fill: "#ffd9df" }],
    icons: [icon("heart", 0, 0.41, 0.38, 0.18, { color: ROSE })],
    texts: [text(0, 0.336, 0.54, 0.328, t("us", "mình"), { font: "greatVibes", size: 0.07, color: ROSE })],
  }),
  design("sweetheart", "love", t("Sweetheart", "Người thương"), {
    themes: ["couple", "flowers"],
    slides: 2,
    background: { kind: "color", color: "#fff1f1" },
    slots: [
      photo(0, 0, 0.1, 0.1, 0.5, 0.42, { ...WHITE_FRAME, rotation: -5 }),
      photo(1, 0, 0.44, 0.38, 0.5, 0.42, { ...WHITE_FRAME, rotation: 4 }),
      photo(2, 1, 0.08, 0.08, 0.84, 0.66, WHITE_FRAME),
    ],
    icons: [icon("heartOutline", 0, 0.66, 0.12, 0.16, { color: ROSE, rotation: 10 }), icon("doodle-hearts", 0, 0.08, 0.66, 0.2, { color: ROSE })],
    texts: [text(1, 0.08, 0.79, 0.84, t("my sweetheart", "người thương của mình"), { font: "greatVibes", size: 0.1, color: ROSE })],
  }),
];
