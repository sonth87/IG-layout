import type { Template } from "../types";
import { art, design, INK, KRAFT, t, text } from "./kit";

// Torn paper (2026-10-28, owner's second SCRL batch): photos on ripped sheets, torn strips
// and pieces, from the frame packs gen-torn-collage / gen-torn-photos / gen-torn-backed.

const PILL = { color: "#ffffff", padding: 0.45, radius: 0.6 };
const WHITE_SHADOW = { color: "#ffffff", shadow: true } as const;

export const TORN: Template[] = [
  design("torn-strips", "torn", t("Torn strips", "Ba dải xé"), {
    themes: ["travel", "beach", "nature"],
    slides: 1,
    background: { kind: "color", color: "#efeae2" },
    art: [art("gen-torn-collage/torn-collage-6", 0, 0, 0.007, 1)],
    slots: [],
    texts: [text(0, 0.06, 0.06, 0.6, t("📍 somewhere by the sea", "📍 đâu đó gần biển"), { font: "beVietnam", size: 0.032, color: INK, align: "left", bold: true, background: PILL })],
  }),
  design("torn-four", "torn", t("Torn in four", "Bốn mảnh xé"), {
    themes: ["friends", "city", "food"],
    slides: 1,
    background: { kind: "color", color: "#efeae2" },
    art: [art("gen-torn-collage/torn-collage-1", 0, 0, 0.007, 1)],
    slots: [],
    texts: [text(0, 0.06, 0.8, 0.6, t("weekend", "cuối tuần"), { font: "greatVibes", size: 0.13, ...WHITE_SHADOW, align: "left" })],
  }),
  design("torn-friday", "torn", t("My Friday", "Thứ sáu của mình"), {
    format: "story",
    themes: ["city", "portrait", "retro"],
    slides: 1,
    background: { kind: "color", color: "#ebe6de" },
    art: [art("gen-torn-collage/torn-collage-13", 0, 0, 0.02, 1)],
    slots: [],
    texts: [text(0, 0.06, 0.7, 0.88, t("my Friday", "thứ sáu của mình"), { font: "greatVibes", size: 0.15, ...WHITE_SHADOW, align: "left" })],
  }),
  design("torn-halves", "torn", t("Then & now", "Ngày ấy & bây giờ"), {
    format: "story",
    themes: ["beach", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#ebe6de" },
    art: [art("gen-torn-collage/torn-collage-15", 0, 0, 0.02, 1)],
    slots: [],
    texts: [text(0, 0.25, 0.47, 0.5, t("same place, new day", "chốn cũ, ngày mới"), { font: "patrickHand", size: 0.045, color: INK, background: PILL })],
  }),
  design("torn-columns", "torn", t("Torn columns", "Ba cột xé"), {
    themes: ["fashion", "city", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#f1ece4" },
    art: [art("gen-torn-collage/torn-collage-12", 0, 0, 0.007, 1)],
    slots: [],
  }),
  design("torn-summer", "torn", t("Pieces of summer", "Mảnh ghép mùa hè"), {
    themes: ["beach", "friends", "travel"],
    events: ["summer"],
    slides: 3,
    background: { kind: "color", color: KRAFT },
    art: [
      art("gen-torn-collage/torn-collage-7", 0, 0, 0.007, 1),
      art("gen-torn-collage/torn-collage-10", 1, 0.03, 0.008, 0.94, { photo: 2 }),
      art("gen-torn-photos/torn-piece-2", 2, 0.15, 0.04, 0.7, { photo: 5 }),
    ],
    slots: [],
    texts: [
      text(0, 0.07, 0.07, 0.6, t("pieces of\nsummer", "mảnh ghép\nmùa hè"), { font: "greatVibes", size: 0.12, ...WHITE_SHADOW, align: "left", lineHeight: 0.9 }),
      text(2, 0.1, 0.84, 0.8, t("until next summer ✿", "hẹn mùa hè sau ✿"), { font: "patrickHand", size: 0.05, color: INK }),
    ],
  }),
  design("torn-scatter", "torn", t("Torn pieces", "Mảnh ảnh xé"), {
    themes: ["friends", "food", "travel"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    art: [
      art("gen-torn-photos/torn-piece-7", 0, 0.05, 0.04, 0.55, { rotation: -4 }),
      art("gen-torn-photos/torn-piece-1", 0, 0.42, 0.3, 0.55, { photo: 1, rotation: 5 }),
      art("gen-torn-photos/torn-piece-14", 0, 0.08, 0.5, 0.45, { photo: 2, rotation: 3 }),
      art("gen-washi/washi-12", 0, 0.2, 0.03, 0.26, { rotation: -10 }),
      art("gen-washi/washi-7", 0, 0.66, 0.29, 0.22, { rotation: 12 }),
    ],
    slots: [],
    texts: [text(0, 0.56, 0.78, 0.38, t("bits & pieces", "góp nhặt"), { font: "patrickHand", size: 0.06, color: INK, rotation: -4 })],
  }),
  design("torn-backed", "torn", t("Notes from the weekend", "Ghi chép cuối tuần"), {
    themes: ["portrait", "food", "nature"],
    slides: 1,
    background: { kind: "color", color: "#f6f2ea" },
    art: [art("gen-torn-backed/torn-backed-2", 0, 0.04, 0.06, 0.55, { rotation: -3 }), art("gen-torn-backed/torn-backed-4", 0, 0.42, 0.55, 0.55, { photo: 1, rotation: 4 })],
    slots: [],
    texts: [
      text(0, 0.62, 0.14, 0.34, t("notes from\nthe weekend", "ghi chép\ncuối tuần"), { font: "patrickHand", size: 0.06, color: INK, align: "left", lineHeight: 1.1 }),
      text(0, 0.06, 0.74, 0.34, t("— slow mornings", "— sáng chậm"), { font: "patrickHand", size: 0.045, color: "#6b6357", align: "left" }),
    ],
  }),
  design("torn-band", "torn", t("Torn band", "Dải xé ngang"), {
    themes: ["city", "travel", "nature"],
    slides: 1,
    background: { kind: "photo", photo: 0 },
    art: [art("gen-torn-photos/torn-piece-24", 0, -0.05, 0.06, 1.1, { photo: 1 })],
    slots: [],
    texts: [text(0, 0.06, 0.84, 0.88, t("the long way home", "đường về nhà xa"), { font: "cormorant", size: 0.075, ...WHITE_SHADOW, align: "left", bold: true })],
  }),
  design("torn-circle", "torn", t("Torn circle", "Vòng tròn xé"), {
    themes: ["party", "friends", "city"],
    slides: 1,
    background: { kind: "photo", photo: 0 },
    art: [art("gen-torn-photos/torn-piece-33", 0, 0.15, 0.2, 0.7, { photo: 1 })],
    slots: [],
    texts: [text(0, 0.06, 0.75, 0.7, t("good times", "những ngày vui"), { font: "greatVibes", size: 0.12, ...WHITE_SHADOW, align: "left" })],
  }),
  design("torn-off-duty", "torn", t("Off duty", "Tạm nghỉ"), {
    format: "story",
    themes: ["beach", "travel", "portrait"],
    slides: 1,
    background: { kind: "photo", photo: 0 },
    art: [art("gen-torn-photos/torn-piece-31", 0, 0.13, 0.17, 0.74, { photo: 1, rotation: -3 })],
    slots: [],
    texts: [text(0, 0.08, 0.76, 0.84, t("off duty", "tạm nghỉ"), { font: "greatVibes", size: 0.14, ...WHITE_SHADOW })],
  }),
  design("torn-double", "torn", t("Torn grid", "Lưới giấy xé"), {
    themes: ["food", "city", "friends", "nature"],
    slides: 2,
    background: { kind: "color", color: "#efeae2" },
    art: [art("gen-torn-collage/torn-collage-16", 0, 0, 0.007, 1), art("gen-torn-collage/torn-collage-22", 1, 0, 0.007, 1, { photo: 4 })],
    slots: [],
  }),
  design("torn-across", "torn", t("Torn across", "Xé vắt ngang"), {
    group: "seamless",
    themes: ["travel", "beach", "friends"],
    slides: 3,
    background: { kind: "color", color: "#e9e3d9" },
    art: [
      art("gen-torn-photos/torn-piece-7", 0, 0.08, 0.12, 0.55, { rotation: -3 }),
      art("gen-torn-photos/torn-piece-16", 0, 0.72, 0.5, 0.62, { photo: 1, rotation: 4 }),
      art("gen-torn-photos/torn-piece-20", 1, 0.45, 0.06, 0.5, { photo: 2, rotation: 2 }),
      art("gen-torn-photos/torn-piece-22", 1, 0.88, 0.48, 0.6, { photo: 3, rotation: -3 }),
      art("gen-torn-photos/torn-piece-14", 2, 0.5, 0.04, 0.46, { photo: 4, rotation: 3 }),
    ],
    slots: [],
    texts: [text(0, 0.08, 0.72, 0.5, t("torn &\ntogether", "xé ra\nvẫn bên nhau"), { font: "patrickHand", size: 0.07, color: INK, align: "left", lineHeight: 1 })],
  }),
  design("torn-dump-story", "torn", t("Weekend dump", "Cuối tuần ghép"), {
    format: "story",
    themes: ["friends", "food", "city"],
    slides: 1,
    background: { kind: "color", color: "#ebe6de" },
    art: [art("gen-torn-collage/torn-collage-2", 0, 0, 0.02, 1)],
    slots: [],
    texts: [text(0, 0.25, 0.465, 0.5, t("weekend dump", "cuối tuần"), { font: "greatVibes", size: 0.08, color: INK, background: { color: "#ffffff", padding: 0.3 } })],
  }),
];
