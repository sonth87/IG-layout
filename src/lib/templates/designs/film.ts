import type { Template } from "../types";
import { block, cells, design, INK, photo, strip, t, text } from "./kit";

// Film & analog: contact sheets, photobooth strips, film frames (2026-10-28).

const AMBER = "#e8a33d";
const DARK = "#121212";

const leftStrip = strip(0, 0, 0.3, 0.46, 0.3, 4, -4);
const rightStrip = strip(4, 0, 0.7, 0.5, 0.3, 4, 3);
const storyStrip = strip(0, 0, 0.5, 0.46, 0.4, 4, -3, 0.5625);

export const FILM: Template[] = [
  design("contact-sheet", "film", t("Contact sheet", "Tờ in thử"), {
    themes: ["mono", "city", "friends"],
    slides: 1,
    background: { kind: "color", color: DARK },
    slots: cells(0, 0, [0.06, 0.12, 0.88, 0.74], 3, 4, 0.02),
    texts: [
      text(0, 0.06, 0.05, 0.88, t("CONTACT SHEET — ROLL 07", "TỜ IN THỬ — CUỘN 07"), { font: "spaceGrotesk", size: 0.028, color: AMBER, align: "left", letterSpacing: 0.2 }),
      text(0, 0.06, 0.9, 0.88, t("36 EXP  ·  ISO 400  ·  2026", "36 KIỂU  ·  ISO 400  ·  2026"), { font: "spaceGrotesk", size: 0.028, color: AMBER, align: "right", letterSpacing: 0.2 }),
    ],
  }),
  design("photobooth", "film", t("Photobooth", "Chụp hình lấy liền"), {
    themes: ["friends", "couple"],
    slides: 1,
    background: { kind: "color", color: "#efe9df" },
    shapes: [leftStrip.shape, rightStrip.shape],
    slots: [...leftStrip.slots, ...rightStrip.slots],
    texts: [text(0, 0.1, 0.9, 0.8, t("say cheese!", "cười lên nào!"), { font: "patrickHand", size: 0.05, color: INK })],
  }),
  design("film-frames", "film", t("Film frames", "Khung phim"), {
    themes: ["city", "beach", "portrait"],
    slides: 3,
    background: { kind: "color", color: "#e9e5de" },
    slots: [0, 1, 2].map((i) => photo(i, i, 0.1, 0.12, 0.8, 0.62, { frame: "film" })),
    texts: [
      ...[0, 1, 2].map((i) => text(i, 0.1, 0.8, 0.5, t(`FRAME 0${i + 1}`, `KHUNG 0${i + 1}`), { font: "spaceGrotesk", size: 0.03, color: INK, align: "left", letterSpacing: 0.25 })),
      text(0, 0.5, 0.79, 0.4, t("shot on film", "chụp bằng phim"), { font: "cormorant", size: 0.05, color: INK, align: "right" }),
    ],
  }),
  design("after-dark", "film", t("After dark", "Khi trời tối"), {
    themes: ["mono", "friends", "city"],
    slides: 1,
    background: { kind: "color", color: "#1a1a1a" },
    slots: [
      photo(0, 0, 0.08, 0.08, 0.48, 0.42, { frame: "polaroidBlack", shadow: true, rotation: -6 }),
      photo(1, 0, 0.46, 0.2, 0.46, 0.4, { frame: "polaroidBlack", shadow: true, rotation: 5 }),
      photo(2, 0, 0.22, 0.5, 0.5, 0.42, { frame: "polaroidBlack", shadow: true, rotation: -1 }),
    ],
    texts: [text(0, 0.56, 0.06, 0.38, t("after dark", "khi trời tối"), { font: "greatVibes", size: 0.08, color: "#f0e9de", align: "right" })],
  }),
  design("35mm", "film", t("35mm", "35mm"), {
    themes: ["portrait", "nature", "city"],
    slides: 1,
    background: { kind: "color", color: "#0f0f0f" },
    slots: [photo(0, 0, 0.08, 0.14, 0.84, 0.6)],
    texts: [
      text(0, 0.08, 0.04, 0.4, t("35MM", "35MM"), { font: "anton", size: 0.065, color: "#f3efe7", align: "left" }),
      text(0, 0.52, 0.065, 0.4, t("ISO 400", "ISO 400"), { font: "spaceGrotesk", size: 0.03, color: "#f3efe7", align: "right", letterSpacing: 0.2 }),
      text(0, 0.08, 0.765, 0.4, t("▶ 24A", "▶ 24A"), { font: "spaceGrotesk", size: 0.028, color: AMBER, align: "left", letterSpacing: 0.15 }),
      text(0, 0.08, 0.83, 0.84, t("the light was perfect", "ánh sáng hôm ấy thật đẹp"), { font: "cormorant", size: 0.065, color: "#f3efe7", align: "left" }),
    ],
  }),
  design("film-strip-story", "film", t("Photo strip", "Dải ảnh"), {
    format: "story",
    themes: ["friends", "couple", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#e7e1d6" },
    shapes: [storyStrip.shape],
    slots: storyStrip.slots,
  }),
  design("black-and-white", "film", t("Black & white", "Trắng đen"), {
    themes: ["mono"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0, 0, 1, 0.8), photo(1, 1, 0.06, 0.06, 0.43, 0.62), photo(2, 1, 0.51, 0.32, 0.43, 0.62)],
    texts: [
      text(0, 0.06, 0.83, 0.88, t("black &\nwhite", "trắng\n& đen"), { font: "playfair", size: 0.075, color: INK, align: "left", bold: true, lineHeight: 1 }),
      text(1, 0.06, 0.74, 0.4, t("no colour needed", "chẳng cần màu"), { font: "lora", size: 0.035, color: "#5d5a55", align: "left" }),
    ],
  }),
  design("film-band", "film", t("Film band", "Dải phim ngang"), {
    themes: ["travel", "beach", "city"],
    slides: 1,
    background: { kind: "color", color: "#f1ece4" },
    shapes: [{ slide: 0, x: 0, y: 0.3, w: 1, h: 0.4, shape: "film", fill: "#171717" }],
    slots: [0, 1, 2].map((i) => photo(i, 0, 0.035 + i * 0.315, 0.355, 0.3, 0.29)),
    texts: [
      text(0, 0.06, 0.12, 0.88, t("three frames\nof summer", "ba khung hình\nmùa hè"), { font: "playfair", size: 0.075, color: INK, align: "left", bold: true, lineHeight: 1 }),
      text(0, 0.06, 0.78, 0.88, t("COLOUR 200  ·  24 EXP", "PHIM MÀU 200  ·  24 KIỂU"), { font: "spaceGrotesk", size: 0.03, color: "#6b6357", align: "left", letterSpacing: 0.25 }),
    ],
  }),
  design("darkroom", "film", t("Darkroom", "Phòng tối"), {
    themes: ["mono", "portrait"],
    slides: 2,
    background: { kind: "color", color: "#2a0f0f" },
    shapes: [block(0, 0, 0, 1, 0.012, "#b42a20"), block(1, 0, 0.988, 1, 0.012, "#b42a20")],
    slots: [photo(0, 0, 0.12, 0.1, 0.76, 0.62, { frame: "white", shadow: true }), photo(1, 1, 0.06, 0.08, 0.43, 0.5, { frame: "white" }), photo(2, 1, 0.51, 0.3, 0.43, 0.5, { frame: "white" })],
    texts: [
      text(0, 0.12, 0.78, 0.76, t("developed\nslowly", "tráng\nthật chậm"), { font: "cormorant", size: 0.075, color: "#f0d9cf", align: "left", lineHeight: 1 }),
      text(1, 0.06, 0.86, 0.88, t("PRINTS 01 — 02", "ẢNH IN 01 — 02"), { font: "spaceGrotesk", size: 0.028, color: "#f0d9cf", align: "left", letterSpacing: 0.25 }),
    ],
  }),
];
