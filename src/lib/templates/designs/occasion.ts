import type { Template } from "../types";
import { cells, design, INK, photo, t, text, WHITE_FRAME } from "./kit";

// Special occasions: birthdays, weddings, graduation, new year (2026-10-28).

const BERRY = "#d6455d";
const GOLD = "#d8b45a";

export const OCCASION: Template[] = [
  design("birthday-post", "occasion", t("Happy birthday", "Mừng sinh nhật"), {
    themes: ["party", "friends"],
    slides: 2,
    background: { kind: "color", color: "#fde4e4" },
    shapes: [
      { slide: 0, x: 0.8, y: 0.1, w: 0.06, h: 0.048, shape: "circle", fill: "#f2b84b" },
      { slide: 0, x: 0.7, y: 0.27, w: 0.04, h: 0.032, shape: "circle", fill: "#7cc6b4" },
      { slide: 0, x: 0.9, y: 0.33, w: 0.035, h: 0.028, shape: "circle", fill: BERRY },
    ],
    slots: [
      photo(0, 0, 0.06, 0.33, 0.56, 0.58, { frame: "polaroid", shadow: true, rotation: -3 }),
      photo(1, 0, 0.56, 0.45, 0.38, 0.4, { frame: "polaroid", shadow: true, rotation: 5 }),
      ...cells(2, 1, [0.06, 0.06, 0.88, 0.7], 2, 2, 0.025),
    ],
    texts: [
      text(0, 0.06, 0.05, 0.7, t("HAPPY\nBIRTHDAY", "MỪNG\nSINH NHẬT"), { font: "anton", size: 0.14, color: BERRY, align: "left", lineHeight: 0.92 }),
      text(1, 0.06, 0.81, 0.88, t("make a wish ✦", "ước đi nào ✦"), { font: "greatVibes", size: 0.09, color: BERRY }),
    ],
  }),
  design("just-married", "occasion", t("Just married", "Vừa cưới"), {
    themes: ["couple"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.1, 0.08, 0.8, 0.62)],
    texts: [
      text(0, 0.1, 0.72, 0.8, t("Just married", "Về chung một nhà"), { font: "greatVibes", size: 0.11, color: INK }),
      text(0, 0.1, 0.88, 0.8, t("10 · 28 · 2026", "28 · 10 · 2026"), { font: "spaceGrotesk", size: 0.028, color: "#6b6760", letterSpacing: 0.4 }),
    ],
  }),
  design("wedding-day", "occasion", t("Wedding day", "Ngày cưới"), {
    themes: ["couple"],
    slides: 3,
    background: { kind: "color", color: "#f5f1ea" },
    slots: [photo(0, 1, 0.08, 0.08, 0.84, 0.84), photo(1, 2, 0.08, 0.08, 0.41, 0.6), photo(2, 2, 0.51, 0.32, 0.41, 0.6)],
    texts: [
      text(0, 0.08, 0.22, 0.84, t("Our\nwedding\nday", "Ngày\ncưới của\nchúng mình"), { font: "cormorant", size: 0.13, color: INK, bold: true, lineHeight: 1 }),
      text(0, 0.08, 0.72, 0.84, t("a few favourite moments", "vài khoảnh khắc yêu thích"), { font: "lora", size: 0.038, color: "#6b6760" }),
      text(2, 0.06, 0.74, 0.44, t("forever starts here", "mãi mãi bắt đầu từ đây"), { font: "greatVibes", size: 0.07, color: INK, align: "left" }),
    ],
  }),
  design("class-of", "occasion", t("Class of 2026", "Khoá 2026"), {
    events: ["graduation"],
    themes: ["portrait", "friends"],
    slides: 1,
    background: { kind: "color", color: "#14213d" },
    slots: [photo(0, 0, 0.1, 0.24, 0.8, 0.54, { border: { width: 0.015, color: GOLD } })],
    texts: [
      text(0, 0.1, 0.05, 0.8, t("CLASS OF", "KHOÁ"), { font: "spaceGrotesk", size: 0.035, color: GOLD, letterSpacing: 0.4, bold: true }),
      text(0, 0.1, 0.09, 0.8, t("2026", "2026"), { font: "anton", size: 0.13, color: "#f5efe2", letterSpacing: 0.06 }),
      text(0, 0.1, 0.82, 0.8, t("we did it.", "tụi mình làm được rồi."), { font: "greatVibes", size: 0.085, color: "#f5efe2" }),
    ],
  }),
  design("hello-new-year", "occasion", t("Hello new year", "Chào năm mới"), {
    events: ["newYear"],
    themes: ["party", "friends"],
    slides: 2,
    background: { kind: "color", color: "#0e0e10" },
    slots: [
      photo(0, 0, 0.44, 0.42, 0.5, 0.5, { ...WHITE_FRAME, rotation: 4 }),
      photo(1, 0, 0.08, 0.5, 0.38, 0.38, { ...WHITE_FRAME, rotation: -5 }),
      ...cells(2, 1, [0.06, 0.14, 0.88, 0.8], 3, 3, 0.012),
    ],
    texts: [
      text(0, 0.08, 0.08, 0.84, t("hello\n2027", "chào\n2027"), { font: "anton", size: 0.17, color: "#f3d27a", align: "left", lineHeight: 0.92 }),
      text(1, 0.06, 0.05, 0.88, t("2026 IN NINE", "2026 TRONG CHÍN KHUNG HÌNH"), { font: "spaceGrotesk", size: 0.034, color: "#f3d27a", align: "left", letterSpacing: 0.25 }),
    ],
  }),
  design("you-and-me", "occasion", t("You & me", "Mình và cậu"), {
    events: ["valentine"],
    themes: ["couple"],
    slides: 1,
    background: { kind: "color", color: "#f6e1e1" },
    slots: [photo(0, 0, 0.15, 0.08, 0.7, 0.58, { mask: "heart" })],
    texts: [text(0, 0.1, 0.7, 0.8, t("you & me,\nalways", "mình & cậu,\nmãi luôn"), { font: "greatVibes", size: 0.1, color: "#a8344a", lineHeight: 1 })],
  }),
  design("merry-bright", "occasion", t("Merry & bright", "An lành & rực rỡ"), {
    events: ["christmas", "winter"],
    format: "story",
    themes: ["friends", "party", "couple"],
    slides: 1,
    background: { kind: "color", color: "#1f3d2b" },
    slots: [photo(0, 0, 0.12, 0.17, 0.76, 0.42, { frame: "polaroid", shadow: true, rotation: -3 })],
    texts: [text(0, 0.08, 0.64, 0.84, t("Merry\n& bright", "An lành\n& rực rỡ"), { font: "greatVibes", size: 0.13, color: "#f1e3c6", lineHeight: 0.95 })],
  }),
];
