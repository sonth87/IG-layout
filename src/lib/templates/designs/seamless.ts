import type { Template } from "../types";
import { design, INK, photo, t, text, WHITE_FRAME } from "./kit";

// Seamless carousels: photos crossing the swipe, panoramas (2026-10-28).

export const SEAMLESS: Template[] = [
  design("step-by-step", "seamless", t("Step by step", "Từng bước"), {
    group: "seamless",
    themes: ["travel", "city", "nature"],
    slides: 3,
    background: { kind: "color", color: "#f2f0eb" },
    slots: [
      photo(0, 0, 0.08, 0.1, 0.56, 0.4, { shadow: true }),
      photo(1, 0, 0.72, 0.48, 0.56, 0.4, { shadow: true }),
      photo(2, 1, 0.4, 0.1, 0.56, 0.4, { shadow: true }),
      photo(3, 1, 0.96, 0.52, 0.56, 0.4, { shadow: true }),
      photo(4, 2, 0.62, 0.1, 0.32, 0.4, { shadow: true }),
    ],
    texts: [
      text(0, 0.08, 0.6, 0.5, t("step by\nstep", "từng\nbước"), { font: "playfair", size: 0.08, color: INK, align: "left", bold: true, lineHeight: 1 }),
      text(2, 0.5, 0.84, 0.44, t("fin.", "hết."), { font: "cormorant", size: 0.08, color: INK, align: "right" }),
    ],
  }),
  design("wide-open", "seamless", t("Wide open", "Rộng mở"), {
    group: "seamless",
    themes: ["nature", "travel", "beach"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.08, 0.1, 1.84, 0.62), photo(1, 0, 0.08, 0.76, 0.3, 0.18), photo(2, 0, 0.4, 0.76, 0.3, 0.18)],
    texts: [text(1, 0.4, 0.78, 0.52, t("wide open", "rộng mở"), { font: "cormorant", size: 0.08, color: INK, align: "right", bold: true })],
  }),
  design("collected", "seamless", t("Collected", "Góp nhặt"), {
    group: "seamless",
    themes: ["friends", "food", "beach"],
    slides: 3,
    background: { kind: "color", color: "#e4ddd2" },
    slots: [
      photo(0, 0, 0.1, 0.2, 0.6, 0.58, { ...WHITE_FRAME, rotation: -2 }),
      photo(1, 0, 0.8, 0.12, 0.4, 0.4, { ...WHITE_FRAME, rotation: 3 }),
      photo(2, 1, 0.4, 0.5, 0.5, 0.4, { ...WHITE_FRAME, rotation: -3 }),
      photo(3, 1, 0.86, 0.12, 0.36, 0.36, { ...WHITE_FRAME, rotation: 4 }),
      photo(4, 2, 0.36, 0.46, 0.56, 0.46, { ...WHITE_FRAME, rotation: -2 }),
    ],
    texts: [text(0, 0.1, 0.04, 0.6, t("collected", "góp nhặt"), { font: "greatVibes", size: 0.1, color: INK, align: "left" })],
  }),
  design("four-wide", "seamless", t("Four frames wide", "Bốn khung liền"), {
    group: "panorama",
    themes: ["travel", "nature"],
    slides: 4,
    background: { kind: "photo", photo: 0 },
    slots: [],
    texts: [
      text(0, 0.07, 0.08, 0.86, t("FOUR\nFRAMES\nWIDE", "BỐN\nKHUNG\nLIỀN"), { font: "anton", size: 0.12, color: "#ffffff", align: "left", lineHeight: 0.95 }),
      text(3, 0.07, 0.9, 0.86, t("↺ swipe back", "↺ vuốt lại"), { font: "spaceGrotesk", size: 0.03, color: "#ffffff", align: "right", letterSpacing: 0.2 }),
    ],
  }),
  design("view-band", "seamless", t("The view", "Khung cảnh"), {
    group: "seamless",
    themes: ["nature", "travel"],
    slides: 3,
    background: { kind: "color", color: "#f4f1ea" },
    slots: [photo(0, 0, 0, 0.25, 3, 0.5)],
    texts: [
      text(0, 0.08, 0.08, 0.84, t("the view", "khung cảnh"), { font: "playfair", size: 0.1, color: INK, align: "left", bold: true }),
      text(2, 0.08, 0.8, 0.84, t("from up here", "từ trên cao"), { font: "lora", size: 0.045, color: INK, align: "right" }),
    ],
  }),
];
