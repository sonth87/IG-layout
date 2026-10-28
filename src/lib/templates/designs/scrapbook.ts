import type { Template } from "../types";
import { block, design, INK, KRAFT, photo, t, tape, text, WHITE_FRAME } from "./kit";

// Scrapbook: tape, notes, handwriting, photos at an angle (2026-10-28).

const PEN = "#2b4a7a";
const PINK_TAPE = "#f5c6c6";
const MINT_TAPE = "#c9e2d5";

export const SCRAPBOOK: Template[] = [
  design("taped", "scrapbook", t("Taped up", "Dán băng keo"), {
    themes: ["friends", "food", "travel"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    shapes: [tape(0, 0.32, 0.085, -10), tape(0, 0.72, 0.16, 8, PINK_TAPE), tape(0, 0.31, 0.52, -4, MINT_TAPE), tape(0, 0.72, 0.56, 6)],
    slots: [
      photo(0, 0, 0.07, 0.08, 0.5, 0.4, { ...WHITE_FRAME, rotation: -4 }),
      photo(1, 0, 0.5, 0.16, 0.44, 0.36, { ...WHITE_FRAME, rotation: 5 }),
      photo(2, 0, 0.1, 0.52, 0.42, 0.34, { ...WHITE_FRAME, rotation: 3 }),
      photo(3, 0, 0.5, 0.56, 0.44, 0.36, { ...WHITE_FRAME, rotation: -3 }),
    ],
    texts: [text(0, 0.06, 0.9, 0.42, t("pieces of us", "những mảnh ghép"), { font: "patrickHand", size: 0.045, color: INK, align: "left" })],
  }),
  design("dear-diary", "scrapbook", t("Dear diary", "Nhật ký thân mến"), {
    themes: ["portrait", "food", "nature"],
    slides: 2,
    background: { kind: "color", color: "#fbf8f1" },
    shapes: [
      block(0, 0.12, 0, 0.003, 1, "#e7a3a3"),
      block(1, 0.12, 0, 0.003, 1, "#e7a3a3"),
      block(0, 0.16, 0.86, 0.76, 0.002, "#d5dfeb"),
      block(1, 0.16, 0.92, 0.6, 0.002, "#d5dfeb"),
      tape(0, 0.5, 0.2, -3),
      tape(1, 0.4, 0.08, 6, PINK_TAPE),
      tape(1, 0.67, 0.42, -5, MINT_TAPE),
    ],
    slots: [
      photo(0, 0, 0.2, 0.2, 0.6, 0.46, { frame: "polaroid", shadow: true, rotation: -3 }),
      photo(1, 1, 0.18, 0.08, 0.44, 0.36, { ...WHITE_FRAME, rotation: 4 }),
      photo(2, 1, 0.44, 0.42, 0.46, 0.36, { ...WHITE_FRAME, rotation: -3 }),
    ],
    texts: [
      text(0, 0.16, 0.06, 0.7, t("dear diary,", "nhật ký thân mến,"), { font: "patrickHand", size: 0.08, color: PEN, align: "left" }),
      text(0, 0.16, 0.79, 0.76, t("today was one of those days ♡", "hôm nay là một ngày như thế ♡"), { font: "patrickHand", size: 0.05, color: PEN, align: "left" }),
      text(1, 0.16, 0.85, 0.6, t("more tomorrow.", "mai viết tiếp."), { font: "patrickHand", size: 0.05, color: PEN, align: "left" }),
    ],
  }),
  design("polaroid-wall", "scrapbook", t("Polaroid wall", "Tường polaroid"), {
    themes: ["friends", "couple", "beach"],
    slides: 1,
    background: { kind: "color", color: "#ece6dc" },
    shapes: [0, 1, 2, 3, 4, 5].map((i) => tape(0, 0.19 + (i % 3) * 0.32, i < 3 ? 0.085 : 0.495, i % 2 ? 6 : -6, [undefined, PINK_TAPE, MINT_TAPE][i % 3], 0.12)),
    slots: [0, 1, 2, 3, 4, 5].map((i) =>
      photo(i, 0, 0.04 + (i % 3) * 0.32, i < 3 ? 0.08 : 0.49, 0.3, 0.33, { frame: "polaroid", shadow: true, rotation: [-4, 3, -2, 2, -3, 4][i] }),
    ),
    texts: [text(0, 0.06, 0.9, 0.88, t("our wall of fame", "bức tường kỷ niệm"), { font: "patrickHand", size: 0.045, color: INK })],
  }),
  design("morning-evening", "scrapbook", t("Morning to evening", "Từ sáng đến tối"), {
    themes: ["food", "portrait", "city"],
    slides: 3,
    background: { kind: "color", color: "#ffffff" },
    shapes: [0, 1, 2].map((i) => tape(i, 0.62, 0.52, i % 2 ? 7 : -7)),
    slots: [0, 1, 2].flatMap((i) => [photo(i * 2, i, 0.24, 0.07, 0.68, 0.5, { shadow: true }), photo(i * 2 + 1, i, 0.36, 0.52, 0.56, 0.42, { shadow: true })]),
    texts: [t("morning", "buổi sáng"), t("afternoon", "buổi chiều"), t("evening", "buổi tối")].map((label, i) =>
      text(i, -0.12, 0.45, 0.46, label, { font: "greatVibes", size: 0.1, color: INK, rotation: -90 }),
    ),
  }),
  design("sticky-note", "scrapbook", t("Sticky note", "Giấy ghi chú"), {
    themes: ["friends", "food"],
    slides: 1,
    background: { kind: "color", color: "#f7f0e6" },
    shapes: [
      block(0, 0.55, 0.45, 0.38, 0.3, "#fff2a1", { rotation: 4 }),
      tape(0, 0.38, 0.085, -5),
      tape(0, 0.33, 0.6, 5, PINK_TAPE),
      { slide: 0, x: 0.78, y: 0.08, w: 0.12, h: 0.096, shape: "circle", fill: "#e86f5a" },
    ],
    slots: [photo(0, 0, 0.08, 0.08, 0.6, 0.5, { ...WHITE_FRAME, rotation: -3 }), photo(1, 0, 0.12, 0.6, 0.42, 0.32, { ...WHITE_FRAME, rotation: 4 })],
    texts: [text(0, 0.57, 0.52, 0.34, t("remember\nthis one", "nhớ mãi\nngày này"), { font: "patrickHand", size: 0.06, color: INK, rotation: 4, lineHeight: 1.1 })],
  }),
  design("keep-these", "scrapbook", t("Keep these", "Giữ lại"), {
    format: "story",
    themes: ["friends", "couple", "beach"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    shapes: [tape(0, 0.41, 0.155, -8), tape(0, 0.62, 0.405, 6, PINK_TAPE)],
    slots: [photo(0, 0, 0.1, 0.16, 0.62, 0.3, { ...WHITE_FRAME, rotation: -4 }), photo(1, 0, 0.32, 0.41, 0.6, 0.3, { ...WHITE_FRAME, rotation: 3 })],
    texts: [text(0, 0.08, 0.68, 0.5, t("keep\nthese", "giữ\nlại nhé"), { font: "patrickHand", size: 0.1, color: INK, align: "left", lineHeight: 1 })],
  }),
];
