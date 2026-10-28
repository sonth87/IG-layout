import type { Template } from "../types";
import { block, cells, design, INK, KRAFT, photo, strip, t, tape, text, WHITE_FRAME } from "./kit";

// Autumn & Halloween (seasonal, 2026-10-28): first on the home screen this time of year.

const PUMPKIN = "#e0662b";
const NIGHT = "#141210";

const nightStrip = strip(0, 0, 0.72, 0.38, 0.36, 3, 4);
const spookyStrip = strip(0, 0, 0.5, 0.43, 0.34, 4, -3, 0.5625);

export const AUTUMN: Template[] = [
  design("halloween-night", "seasonal", t("Made for Halloween", "Halloween"), {
    events: ["halloween"],
    themes: ["autumn", "friends", "mono"],
    slides: 1,
    background: { kind: "color", color: NIGHT },
    shapes: [nightStrip.shape],
    slots: [...nightStrip.slots, photo(3, 0, 0.06, 0.14, 0.44, 0.36, { frame: "polaroid", shadow: true, rotation: -7 })],
    texts: [
      text(0, 0.06, 0.68, 0.6, t("Made for", "Dành cho"), { font: "greatVibes", size: 0.11, color: "#f4efe8", align: "left" }),
      text(0, 0.06, 0.79, 0.88, t("HALLOWEEN", "HALLOWEEN"), { font: "anton", size: 0.15, color: PUMPKIN, align: "left", letterSpacing: 0.02 }),
    ],
  }),
  design("pumpkin-patch", "seasonal", t("Pumpkin patch", "Vườn bí ngô"), {
    events: ["halloween", "autumn"],
    themes: ["autumn", "food", "friends"],
    slides: 2,
    background: { kind: "color", color: "#f4ead9" },
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.62), ...cells(1, 1, [0.08, 0.08, 0.84, 0.84], 2, 2, 0.03)],
    texts: [
      text(0, 0.08, 0.73, 0.84, t("pumpkin\npatch", "vườn\nbí ngô"), { font: "playfair", size: 0.1, color: "#7a3413", align: "left", bold: true, lineHeight: 0.95 }),
      text(0, 0.5, 0.9, 0.42, t("OCTOBER · WEEKEND", "THÁNG MƯỜI · CUỐI TUẦN"), { font: "spaceGrotesk", size: 0.026, color: "#7a3413", align: "right", letterSpacing: 0.15 }),
    ],
  }),
  design("fall-recap", "seasonal", t("Fall recap", "Thu này"), {
    events: ["autumn"],
    themes: ["autumn", "food", "portrait"],
    slides: 3,
    background: { kind: "color", color: KRAFT },
    shapes: [tape(0, 0.41, 0.1, -6), tape(0, 0.66, 0.48, 8), tape(1, 0.36, 0.07, 4), tape(1, 0.64, 0.5, -7), tape(2, 0.5, 0.1, -3)],
    slots: [
      photo(0, 0, 0.1, 0.1, 0.62, 0.5, { ...WHITE_FRAME, rotation: -4 }),
      photo(1, 0, 0.4, 0.48, 0.52, 0.42, { ...WHITE_FRAME, rotation: 5 }),
      photo(2, 1, 0.08, 0.07, 0.56, 0.5, { ...WHITE_FRAME, rotation: -3 }),
      photo(3, 1, 0.36, 0.5, 0.56, 0.42, { ...WHITE_FRAME, rotation: 4 }),
      photo(4, 2, 0.12, 0.1, 0.76, 0.6, { frame: "polaroid", shadow: true, rotation: -2 }),
    ],
    texts: [
      text(0, 0.05, 0.66, 0.34, t("Fall\nrecap", "Thu\nnày"), { font: "greatVibes", size: 0.13, color: INK, align: "left", lineHeight: 0.9, rotation: -6 }),
      text(1, 0.06, 0.66, 0.28, t("morning", "buổi sáng"), { font: "patrickHand", size: 0.06, color: INK, align: "left", rotation: -4 }),
      text(2, 0.1, 0.84, 0.8, t("and the evening, slowly", "và buổi tối, thật chậm"), { font: "patrickHand", size: 0.055, color: INK }),
    ],
  }),
  design("october-dump", "seasonal", t("October dump", "Tháng mười"), {
    events: ["autumn", "halloween"],
    themes: ["autumn", "food", "friends", "nature"],
    slides: 3,
    background: { kind: "color", color: "#fbfaf7" },
    slots: [
      ...cells(0, 0, [0, 0, 1, 1], 2, 2, 0.006),
      photo(4, 1, 0, 0, 0.597, 1),
      photo(5, 1, 0.603, 0, 0.397, 0.497),
      photo(6, 1, 0.603, 0.503, 0.397, 0.497),
      ...cells(7, 2, [0, 0, 1, 1], 3, 3, 0.006),
    ],
    texts: [
      text(0, 0.22, 0.43, 0.56, t("october dump", "tháng mười"), { font: "greatVibes", size: 0.09, color: "#8a3b17", background: { color: "#fbfaf7", padding: 0.3 } }),
    ],
  }),
  design("cozy-season", "seasonal", t("Cozy season", "Mùa ấm áp"), {
    events: ["autumn", "winter"],
    format: "story",
    themes: ["autumn", "food"],
    slides: 1,
    background: { kind: "color", color: "#efe3d3" },
    slots: [photo(0, 0, 0.14, 0.15, 0.72, 0.46, { mask: "arch" })],
    texts: [
      text(0, 0.08, 0.63, 0.84, t("cozy\nseason", "mùa\nấm áp"), { font: "cormorant", size: 0.15, color: "#4a2c1a", bold: true, lineHeight: 0.9 }),
      text(0, 0.08, 0.79, 0.84, t("SWEATERS · TEA · RAIN", "ÁO LEN · TRÀ · MƯA"), { font: "spaceGrotesk", size: 0.032, color: "#7b5a43", letterSpacing: 0.25 }),
    ],
  }),
  design("spooky-season", "seasonal", t("Spooky season", "Mùa ma quái"), {
    events: ["halloween"],
    format: "story",
    themes: ["friends", "autumn", "mono"],
    slides: 1,
    background: { kind: "color", color: NIGHT },
    shapes: [spookyStrip.shape],
    slots: spookyStrip.slots,
    texts: [text(0, 0.08, 0.75, 0.84, t("spooky season", "mùa ma quái"), { font: "greatVibes", size: 0.1, color: PUMPKIN })],
  }),
  design("golden-weeks", "seasonal", t("Golden weeks", "Những tuần vàng"), {
    events: ["autumn"],
    group: "seamless",
    themes: ["autumn", "nature", "portrait"],
    slides: 3,
    background: { kind: "color", color: "#ead9c2" },
    slots: [
      photo(0, 0, 0.08, 0.3, 0.6, 0.55, { shadow: true }),
      photo(1, 0, 0.78, 0.1, 0.48, 0.42, { shadow: true }),
      photo(2, 1, 0.4, 0.52, 0.5, 0.4, { shadow: true }),
      photo(3, 1, 0.9, 0.14, 0.5, 0.34, { shadow: true }),
      photo(4, 2, 0.5, 0.5, 0.42, 0.42, { shadow: true }),
    ],
    texts: [
      text(0, 0.08, 0.08, 0.6, t("golden\nweeks", "những tuần\nvàng"), { font: "playfair", size: 0.1, color: "#5a2e14", align: "left", bold: true, lineHeight: 1 }),
      text(2, 0.06, 0.6, 0.4, t("AUTUMN\n2026", "THU\n2026"), { font: "spaceGrotesk", size: 0.04, color: "#5a2e14", align: "left", letterSpacing: 0.2, lineHeight: 1.3 }),
    ],
  }),
  design("autumn-slowly", "seasonal", t("Autumn, slowly", "Thu, thật chậm"), {
    events: ["autumn"],
    themes: ["autumn", "nature"],
    slides: 1,
    background: { kind: "color", color: "#2b211b" },
    slots: [photo(0, 0, 0.1, 0.08, 0.8, 0.66)],
    texts: [
      text(0, 0.1, 0.77, 0.8, t("Autumn, slowly.", "Thu, thật chậm."), { font: "cormorant", size: 0.085, color: "#f1e6d6", align: "left" }),
      text(0, 0.1, 0.89, 0.8, t("a collection of quiet afternoons", "những buổi chiều yên ả"), { font: "lora", size: 0.032, color: "#c8b9a6", align: "left" }),
    ],
  }),
  design("leaf-peeping", "seasonal", t("Leaf peeping", "Ngắm lá"), {
    events: ["autumn"],
    themes: ["autumn", "nature", "travel"],
    slides: 2,
    background: { kind: "color", color: "#f6efe4" },
    shapes: [block(0, 0, 0.62, 1, 0.38, "#b4532a")],
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.7, { shadow: true }), photo(1, 1, 0.08, 0.08, 0.41, 0.84), photo(2, 1, 0.51, 0.08, 0.41, 0.41), photo(3, 1, 0.51, 0.51, 0.41, 0.41)],
    texts: [text(0, 0.08, 0.83, 0.84, t("LEAF PEEPING", "NGẮM LÁ"), { font: "anton", size: 0.1, color: "#f6efe4", align: "left", letterSpacing: 0.04 })],
  }),
];
