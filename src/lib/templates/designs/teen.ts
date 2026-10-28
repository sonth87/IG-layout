import type { Template } from "../types";
import { art, cells, design, icon, INK, photo, strip, t, text } from "./kit";

// Cute & teen (2026-10-28): pastel paper, sticky notes, washi, bubbly stickers.

const PINK = "#ffe3ec";
const HOT = "#ff5c93";
const pinkStrip = strip(0, 0, 0.72, 0.5, 0.32, 3, 5, 0.8, "#ffb3cb");

export const TEEN: Template[] = [
  design("pastel-notes", "teen", t("Pastel notes", "Giấy note pastel"), {
    themes: ["friends", "food", "portrait"],
    slides: 1,
    background: { kind: "color", color: PINK },
    art: [art("gen-notes/note-13", 0, 0.54, 0.06, 0.4, { rotation: 5 }), art("gen-washi/washi-36", 0, 0.12, 0.08, 0.3, { rotation: -14 })],
    slots: [
      photo(0, 0, 0.06, 0.1, 0.48, 0.42, { frame: "polaroid", shadow: true, rotation: -5 }),
      photo(1, 0, 0.42, 0.42, 0.5, 0.44, { frame: "polaroid", shadow: true, rotation: 4 }),
    ],
    icons: [icon("heart", 0, 0.12, 0.66, 0.14, { color: HOT, rotation: -12 }), icon("sparkle", 0, 0.3, 0.78, 0.1, { color: "#ffc93c" })],
    texts: [text(0, 0.57, 0.12, 0.34, t("today was\ncute ♡", "hôm nay\ndễ thương ♡"), { font: "patrickHand", size: 0.055, color: INK, rotation: 5, lineHeight: 1.05 })],
  }),
  design("bff", "teen", t("BFF", "Bạn thân"), {
    themes: ["friends"],
    slides: 1,
    background: { kind: "color", color: "#cfe8ff" },
    slots: [photo(0, 0, 0.06, 0.3, 0.5, 0.4, { mask: "circle" }), photo(1, 0, 0.46, 0.46, 0.48, 0.384, { mask: "circle" })],
    icons: [
      icon("star", 0, 0.78, 0.26, 0.12, { color: "#ffc93c", rotation: 12 }),
      icon("heart", 0, 0.08, 0.76, 0.12, { color: HOT, rotation: -10 }),
      icon("doodle-sparkle", 0, 0.5, 0.3, 0.08, { color: "#ffffff" }),
    ],
    texts: [
      text(0, 0.06, 0.04, 0.88, t("BFF", "BFF"), { font: "montserrat", size: 0.22, color: HOT, bold: true, align: "left", stroke: { color: "#ffffff", width: 0.08 } }),
      text(0, 0.46, 0.12, 0.48, t("since forever", "từ thuở nào"), { font: "patrickHand", size: 0.05, color: INK, align: "right" }),
    ],
  }),
  design("sticker-bomb", "teen", t("Sticker bomb", "Dán sticker"), {
    themes: ["portrait", "friends", "party"],
    slides: 1,
    background: { kind: "color", color: "#fff3b0" },
    slots: [photo(0, 0, 0.12, 0.12, 0.76, 0.66, { border: { width: 0.02, color: "#ffffff" }, shadow: true, rotation: -2 })],
    icons: [
      icon("smiley", 0, 0.04, 0.06, 0.18, { color: "#ffc93c", rotation: -12 }),
      icon("star", 0, 0.76, 0.04, 0.16, { color: HOT, rotation: 14 }),
      icon("bolt", 0, 0.82, 0.58, 0.12, { color: "#5b8cff", rotation: 10 }),
      icon("heart", 0, 0.06, 0.66, 0.15, { color: "#ff6b6b", rotation: -8 }),
      icon("flower", 0, 0.64, 0.76, 0.14, { color: "#b78bff" }),
      icon("sparkle", 0, 0.4, 0.82, 0.1, { color: "#2fbf71" }),
    ],
    texts: [text(0, 0.2, 0.86, 0.6, t("no thoughts, just vibes", "chẳng nghĩ gì, chỉ vui"), { font: "patrickHand", size: 0.045, color: INK })],
  }),
  design("cute-diary", "teen", t("Cute diary", "Nhật ký xinh"), {
    themes: ["food", "friends", "school"],
    slides: 2,
    background: { kind: "color", color: "#fdf4f0" },
    art: [
      art("gen-paper-scraps/scrap-11", 0, 0.04, 0.5, 0.56, { rotation: -3, under: true }),
      art("gen-washi/washi-26", 0, 0.38, 0.05, 0.28, { rotation: 8 }),
      art("gen-paper-scraps/scrap-13", 1, 0.5, 0.56, 0.44, { rotation: 4, under: true }),
      art("gen-washi/washi-25", 1, 0.08, 0.06, 0.26, { rotation: -10 }),
    ],
    slots: [photo(0, 0, 0.3, 0.08, 0.62, 0.44, { shadow: true, rotation: 3 }), photo(1, 1, 0.06, 0.08, 0.5, 0.42, { shadow: true, rotation: -3 }), photo(2, 1, 0.08, 0.54, 0.4, 0.38, { shadow: true, rotation: 2 })],
    icons: [icon("doodle-heart", 0, 0.78, 0.6, 0.12, { color: HOT }), icon("doodle-star", 1, 0.8, 0.12, 0.1, { color: "#ffb02e" })],
    texts: [
      text(0, 0.1, 0.6, 0.46, t("dear diary,\ntoday I ate cake\nand was happy", "nhật ký ơi,\nhôm nay ăn bánh\nvà thấy vui"), { font: "patrickHand", size: 0.042, color: "#30476e", align: "left", rotation: -3, lineHeight: 1.25 }),
      text(1, 0.55, 0.64, 0.36, t("p.s. more cake\ntomorrow", "tái bút: mai\năn tiếp"), { font: "patrickHand", size: 0.042, color: "#30476e", align: "left", rotation: 4, lineHeight: 1.25 }),
    ],
  }),
  design("mood-grid", "teen", t("Today's mood", "Mood hôm nay"), {
    themes: ["food", "flowers", "friends"],
    slides: 1,
    background: { kind: "color", color: "#e8e1ff" },
    slots: cells(0, 0, [0.06, 0.16, 0.88, 0.78], 2, 3, 0.03, 0.8, { mask: "rounded", cornerRadius: 0.05 }),
    icons: [icon("cloud", 0, 0.76, 0.03, 0.16, { color: "#ffffff" })],
    texts: [text(0, 0.06, 0.04, 0.7, t("today's mood ☁︎", "mood hôm nay ☁︎"), { font: "patrickHand", size: 0.07, color: "#5a4a9c", align: "left" })],
  }),
  design("kawaii-story", "teen", t("Sweet heart", "Trái tim ngọt"), {
    format: "story",
    themes: ["portrait", "friends"],
    slides: 1,
    background: { kind: "gradient", from: "#ffd1e3", to: "#d7e8ff", angle: 180 },
    slots: [photo(0, 0, 0.1, 0.22, 0.8, 0.45, { mask: "heart" })],
    icons: [
      icon("sparkle", 0, 0.12, 0.15, 0.1, { color: "#ffffff" }),
      icon("star", 0, 0.78, 0.18, 0.1, { color: "#ffd84d", rotation: 10 }),
      icon("ribbon", 0, 0.38, 0.14, 0.24, { color: HOT }),
    ],
    texts: [text(0, 0.1, 0.7, 0.8, t("soft & sweet", "ngọt ngào"), { font: "greatVibes", size: 0.12, color: "#ffffff", shadow: true })],
  }),
  design("weekend-energy", "teen", t("Weekend energy", "Năng lượng cuối tuần"), {
    themes: ["friends", "beach", "party"],
    slides: 1,
    background: { kind: "color", color: "#fff6e9" },
    art: [art("hand-doodles/doodle-jumping-joy", 0, 0.5, 0.6, 0.44)],
    slots: [photo(0, 0, 0.06, 0.06, 0.56, 0.5, { mask: "rounded", cornerRadius: 0.04 }), photo(1, 0, 0.66, 0.06, 0.28, 0.24, { mask: "rounded", cornerRadius: 0.04 }), photo(2, 0, 0.66, 0.32, 0.28, 0.24, { mask: "rounded", cornerRadius: 0.04 })],
    texts: [text(0, 0.06, 0.62, 0.46, t("weekend\nenergy", "năng lượng\ncuối tuần"), { font: "montserrat", size: 0.08, color: "#ef3e5c", align: "left", bold: true, lineHeight: 1 })],
  }),
  design("besties-strip", "teen", t("Besties", "Hội bạn thân"), {
    themes: ["friends"],
    slides: 1,
    background: { kind: "color", color: "#fff0f5" },
    shapes: [pinkStrip.shape],
    slots: [...pinkStrip.slots, photo(3, 0, 0.06, 0.18, 0.44, 0.4, { frame: "polaroid", shadow: true, rotation: -6 })],
    icons: [icon("heart", 0, 0.42, 0.12, 0.12, { color: HOT, rotation: 14 }), icon("heart", 0, 0.08, 0.68, 0.09, { color: "#ffb3cb", rotation: -10 }), icon("sparkle", 0, 0.38, 0.62, 0.08, { color: "#ffc93c" })],
    texts: [text(0, 0.06, 0.78, 0.5, t("besties ♡", "hội bạn ♡"), { font: "greatVibes", size: 0.12, color: HOT, align: "left" })],
  }),
  design("sticky-wall", "teen", t("Sticky wall", "Tường giấy note"), {
    themes: ["school", "friends", "food"],
    events: ["backToSchool"],
    slides: 1,
    background: { kind: "color", color: "#f4efe6" },
    art: [
      art("gen-notes/note-8", 0, 0.06, 0.6, 0.3, { rotation: -6, under: true }),
      art("gen-notes/note-27", 0, 0.66, 0.06, 0.28, { rotation: 7 }),
      art("gen-notes/note-15", 0, 0.66, 0.68, 0.28, { rotation: -4, under: true }),
    ],
    slots: [photo(0, 0, 0.06, 0.06, 0.56, 0.48, { shadow: true, rotation: -2 }), photo(1, 0, 0.4, 0.4, 0.52, 0.42, { shadow: true, rotation: 3 })],
    icons: [icon("pin", 0, 0.3, 0.04, 0.07, { color: "#e0402f" }), icon("pin", 0, 0.64, 0.38, 0.07, { color: "#3a6fd8" })],
    texts: [
      text(0, 0.07, 0.66, 0.28, t("to do:\nsmile more", "việc cần làm:\ncười nhiều"), { font: "patrickHand", size: 0.04, color: INK, rotation: -6, lineHeight: 1.1 }),
      text(0, 0.67, 0.11, 0.26, t("don't forget\n♡", "đừng quên\n♡"), { font: "patrickHand", size: 0.04, color: INK, rotation: 7, lineHeight: 1.1 }),
    ],
  }),
  design("class-notes", "teen", t("Class notes", "Vở ghi"), {
    themes: ["school", "friends"],
    events: ["backToSchool", "graduation"],
    slides: 2,
    background: { kind: "color", color: "#eef3f8" },
    art: [art("gen-paper-scraps/scrap-18", 0, 0.05, 0.04, 0.9, { under: true }), art("gen-washi/washi-19", 0, 0.62, 0.02, 0.3, { rotation: 6 })],
    slots: [photo(0, 0, 0.14, 0.3, 0.5, 0.42, { shadow: true, rotation: -3 }), photo(1, 0, 0.5, 0.46, 0.4, 0.36, { shadow: true, rotation: 4 }), ...cells(2, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.025)],
    icons: [icon("doodle-star", 0, 0.12, 0.76, 0.08, { color: "#3a6fd8" }), icon("doodle-check", 0, 0.24, 0.78, 0.07, { color: "#2f9e5b" })],
    texts: [text(0, 0.16, 0.1, 0.66, t("back to\nschool!", "tựu trường\nrồi!"), { font: "patrickHand", size: 0.08, color: "#30476e", align: "left", lineHeight: 1 })],
  }),
];
