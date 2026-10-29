import type { Template } from "../types";
import { design, icon, INK, photo, sketch, t, text } from "./kit";

// Scribbles by hand (2026-10-28): hand-drawn borders, arrows, circles, stars and notes
// (drawn stickers of lib/elements/doodles), like a photo journal written in pen.

const RED = "#e0402f";
const BLUE = "#3a6fd8";
const CREAM = "#fbf9f4";

export const DOODLE: Template[] = [
  design("doodle-arrows", "doodle", t("Look here", "Nhìn đây nè"), {
    themes: ["portrait", "friends"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0.18, 0.16, 0.64, 0.6, { shadow: true, rotation: 2 })],
    icons: [icon("doodle-arrowCurve", 0, 0.02, 0.62, 0.2, { color: RED, rotation: -20 }), icon("doodle-circle", 0, 0.56, 0.1, 0.32, { color: RED }), icon("doodle-sparkleLines", 0, 0.78, 0.66, 0.14, { color: INK })],
    texts: [
      text(0, 0.04, 0.84, 0.5, t("me, obviously", "là mình chứ ai"), { font: "patrickHand", size: 0.055, color: RED, align: "left", rotation: -4 }),
      text(0, 0.6, 0.04, 0.36, t("best day", "ngày đẹp nhất"), { font: "patrickHand", size: 0.04, color: RED, rotation: 6 }),
    ],
  }),
  design("doodle-crown", "doodle", t("Crowned", "Đội vương miện"), {
    format: "story",
    themes: ["portrait", "kids", "friends"],
    slides: 1,
    background: { kind: "color", color: "#fff5d6" },
    slots: [photo(0, 0, 0.12, 0.22, 0.76, 0.48, { mask: "rounded", cornerRadius: 0.04 })],
    icons: [icon("doodle-crown", 0, 0.34, 0.14, 0.32, { color: "#e3a72f", rotation: -8 }), icon("doodle-starFilled", 0, 0.08, 0.72, 0.1, { color: "#e3a72f" }), icon("doodle-star", 0, 0.82, 0.68, 0.1, { color: INK })],
    texts: [text(0, 0.1, 0.76, 0.8, t("main character\nenergy", "năng lượng\nnhân vật chính"), { font: "patrickHand", size: 0.07, color: INK, lineHeight: 1.05 })],
  }),
  design("doodle-blue-pen", "doodle", t("Blue pen", "Bút bi xanh"), {
    themes: ["school", "friends", "city"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    shapes: [...sketch(0, 0.12, 0.12, 0.76, 0.56, 0.8, BLUE), ...sketch(1, 0.08, 0.08, 0.4, 0.4, 0.8, BLUE), ...sketch(1, 0.52, 0.5, 0.4, 0.4, 0.8, BLUE)],
    slots: [photo(0, 0, 0.12, 0.12, 0.76, 0.56), photo(1, 1, 0.08, 0.08, 0.4, 0.4), photo(2, 1, 0.52, 0.5, 0.4, 0.4)],
    icons: [icon("doodle-underlineSwoosh", 0, 0.2, 0.86, 0.6, { color: BLUE })],
    texts: [
      text(0, 0.12, 0.76, 0.76, t("notes in the margin", "ghi chú bên lề"), { font: "patrickHand", size: 0.065, color: BLUE }),
      text(1, 0.54, 0.16, 0.4, t("← this\nwas fun", "← vui\nghê"), { font: "patrickHand", size: 0.06, color: BLUE, align: "left" }),
      text(1, 0.08, 0.6, 0.4, t("so was\nthis →", "cả cái\nnày →"), { font: "patrickHand", size: 0.06, color: BLUE, align: "right" }),
    ],
  }),
  design("doodle-speech", "doodle", t("Doodled bubble", "Bong bóng vẽ tay"), {
    themes: ["portrait", "friends", "kids"],
    slides: 1,
    background: { kind: "color", color: "#e8f1fb" },
    slots: [photo(0, 0, 0.08, 0.3, 0.84, 0.64, { shadow: true })],
    icons: [icon("doodle-bubble", 0, 0.42, 0.02, 0.5, { color: INK })],
    texts: [text(0, 0.47, 0.08, 0.4, t("hi, it's\nme again", "lại là\nmình nè"), { font: "patrickHand", size: 0.05, color: INK, lineHeight: 1.05 })],
  }),
  design("doodle-music", "doodle", t("On repeat", "Nghe đi nghe lại"), {
    themes: ["party", "friends", "city"],
    slides: 1,
    background: { kind: "color", color: "#1d1c1a" },
    slots: [photo(0, 0, 0.14, 0.12, 0.72, 0.6)],
    icons: [icon("doodle-music", 0, 0.04, 0.04, 0.16, { color: "#ffffff" }), icon("doodle-music", 0, 0.82, 0.56, 0.12, { color: "#ffd84d", rotation: 14 }), icon("doodle-scribble", 0, 0.62, 0.8, 0.3, { color: "#ffd84d" })],
    texts: [text(0, 0.1, 0.78, 0.6, t("on repeat\nall night", "bật cả\nđêm luôn"), { font: "patrickHand", size: 0.065, color: "#ffffff", align: "left", lineHeight: 1.05 })],
  }),
  design("doodle-checklist", "doodle", t("Weekend checklist", "Việc cuối tuần"), {
    themes: ["food", "nature", "friends"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0.5, 0.08, 0.44, 0.4, { shadow: true, rotation: 3 }), photo(1, 0, 0.5, 0.52, 0.44, 0.4, { shadow: true, rotation: -2 })],
    icons: [0, 1, 2, 3].map((i) => icon(i < 3 ? "doodle-check" : "doodle-cross", 0, 0.06, 0.26 + i * 0.12, 0.07, { color: i < 3 ? "#2f9e5b" : RED })),
    texts: [
      text(0, 0.06, 0.08, 0.42, t("weekend\nto-do:", "cuối tuần\ncần làm:"), { font: "patrickHand", size: 0.065, color: INK, align: "left", lineHeight: 1 }),
      ...[t("sleep in", "ngủ nướng"), t("eat well", "ăn ngon"), t("see friends", "gặp bạn"), t("emails", "trả lời mail")].map((w, i) =>
        text(0, 0.15, 0.265 + i * 0.12, 0.32, w, { font: "patrickHand", size: 0.05, color: INK, align: "left" }),
      ),
    ],
  }),
  design("doodle-hearts-rain", "doodle", t("Raining hearts", "Mưa tim"), {
    format: "story",
    themes: ["couple", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#ffeef0" },
    slots: [photo(0, 0, 0.14, 0.28, 0.72, 0.42, { shadow: true, rotation: -2 })],
    icons: [
      icon("doodle-hearts", 0, 0.06, 0.13, 0.22, { color: RED }),
      icon("doodle-heart", 0, 0.7, 0.17, 0.14, { color: RED, rotation: 12 }),
      icon("doodle-heartFilled", 0, 0.78, 0.66, 0.12, { color: RED }),
      icon("doodle-heart", 0, 0.06, 0.7, 0.1, { color: RED, rotation: -10 }),
    ],
    texts: [text(0, 0.12, 0.76, 0.76, t("heart eyes", "mắt tim"), { font: "patrickHand", size: 0.08, color: RED })],
  }),
  design("doodle-sun-day", "doodle", t("Sunny scribbles", "Nắng vẽ tay"), {
    themes: ["beach", "nature", "travel"],
    slides: 2,
    background: { kind: "color", color: "#fff8e6" },
    slots: [photo(0, 0, 0.08, 0.24, 0.84, 0.68), photo(1, 1, 0.08, 0.08, 0.84, 0.56)],
    icons: [icon("doodle-sun", 0, 0.7, 0.02, 0.24, { color: "#f2a541" }), icon("doodle-cloud", 1, 0.06, 0.7, 0.24, { color: BLUE }), icon("doodle-arrowLoop", 1, 0.6, 0.7, 0.3, { color: INK })],
    texts: [
      text(0, 0.08, 0.06, 0.6, t("sunny\nside up", "ngày\nđầy nắng"), { font: "patrickHand", size: 0.075, color: INK, align: "left", lineHeight: 1 }),
      text(1, 0.34, 0.86, 0.6, t("again tomorrow?", "mai nữa nhé?"), { font: "patrickHand", size: 0.05, color: INK, align: "right" }),
    ],
  }),
  design("sketch-pair", "doodle", t("Sketched frames", "Khung vẽ tay"), {
    themes: ["fashion", "portrait"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    shapes: [...sketch(0, 0.1, 0.08, 0.56, 0.5), ...sketch(0, 0.44, 0.48, 0.48, 0.42)],
    slots: [photo(0, 0, 0.1, 0.08, 0.56, 0.5), photo(1, 0, 0.44, 0.48, 0.48, 0.42)],
    texts: [text(0, 0.08, 0.66, 0.32, t("outfit\nnotes", "ghi chú\ntrang phục"), { font: "patrickHand", size: 0.06, color: INK, align: "left", lineHeight: 1.05 })],
  }),
  design("circled", "doodle", t("This one!", "Cái này nè!"), {
    themes: ["friends", "party"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.07, 0.07, 0.86, 0.68)],
    icons: [icon("doodle-circle", 0, 0.42, 0.18, 0.42, { color: RED, rotation: -8 }), icon("doodle-arrowCurve", 0, 0.16, 0.74, 0.24, { color: RED, rotation: -30 })],
    texts: [text(0, 0.38, 0.82, 0.56, t("this one!!", "đứa này nè!!"), { font: "patrickHand", size: 0.075, color: RED, align: "left" })],
  }),
  design("days-worth-keeping", "doodle", t("Days worth keeping", "Ngày đáng giữ"), {
    themes: ["beach", "portrait"],
    events: ["summer"],
    slides: 1,
    background: { kind: "color", color: "#f6f1e7" },
    slots: [photo(0, 0, 0, 0.46, 1, 0.54)],
    icons: [
      icon("doodle-star", 0, 0.1, 0.08, 0.09, { color: BLUE, rotation: 10 }),
      icon("doodle-swirl", 0, 0.3, 0.16, 0.1, { color: BLUE }),
      icon("doodle-starFilled", 0, 0.62, 0.06, 0.07, { color: BLUE, rotation: -12 }),
      icon("doodle-swirl", 0, 0.78, 0.2, 0.08, { color: BLUE, rotation: 40 }),
      icon("doodle-sparkle", 0, 0.5, 0.3, 0.08, { color: BLUE }),
      icon("doodle-star", 0, 0.14, 0.33, 0.07, { color: BLUE, rotation: -20 }),
      icon("doodle-starFilled", 0, 0.84, 0.36, 0.06, { color: BLUE }),
      icon("doodle-swirl", 0, 0.08, 0.6, 0.09, { color: "#ffffff", rotation: 20 }),
      icon("doodle-star", 0, 0.82, 0.62, 0.08, { color: "#ffffff" }),
    ],
    texts: [
      text(0, 0.36, 0.06, 0.3, t("days", "những ngày"), { font: "cormorant", size: 0.045, color: BLUE }),
      text(0, 0.52, 0.22, 0.3, t("worth", "đáng"), { font: "cormorant", size: 0.045, color: BLUE }),
      text(0, 0.28, 0.37, 0.4, t("keeping", "để giữ"), { font: "cormorant", size: 0.045, color: BLUE }),
    ],
  }),
  design("main-character", "doodle", t("Main character", "Nhân vật chính"), {
    themes: ["portrait", "fashion"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    icons: [icon("doodle-crown", 0, 0.36, 0.06, 0.28, { color: "#ffd84d", rotation: -6 }), icon("doodle-sparkleLines", 0, 0.7, 0.12, 0.16, { color: "#ffffff" })],
    texts: [text(0, 0.06, 0.85, 0.88, t("main character energy", "năng lượng nhân vật chính"), { font: "patrickHand", size: 0.06, color: "#ffffff", align: "left", shadow: true })],
  }),
  design("hearts-story", "doodle", t("Scribbled hearts", "Tim vẽ tay"), {
    format: "story",
    themes: ["couple", "friends", "portrait"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    icons: [
      icon("doodle-hearts", 0, 0.62, 0.16, 0.28, { color: "#ffffff", rotation: 8 }),
      icon("doodle-sparkle", 0, 0.12, 0.2, 0.14, { color: "#ffffff" }),
      icon("doodle-heart", 0, 0.1, 0.64, 0.18, { color: "#ff6b8b", rotation: -12 }),
      icon("doodle-underlineWave", 0, 0.2, 0.79, 0.6, { color: "#ffffff" }),
    ],
    texts: [text(0, 0.1, 0.72, 0.8, t("my favourite people", "những người mình thương"), { font: "patrickHand", size: 0.07, color: "#ffffff", shadow: true })],
  }),
  design("arrow-notes", "doodle", t("Arrow notes", "Ghi chú mũi tên"), {
    themes: ["travel", "food", "city"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0.06, 0.06, 0.5, 0.4, { shadow: true }), photo(1, 0, 0.44, 0.34, 0.5, 0.36, { shadow: true }), photo(2, 0, 0.1, 0.62, 0.42, 0.32, { shadow: true })],
    icons: [
      icon("doodle-arrowCurve", 0, 0.6, 0.12, 0.2, { color: INK, rotation: 160 }),
      icon("doodle-arrowLoop", 0, 0.14, 0.47, 0.22, { color: INK, rotation: 10 }),
      icon("doodle-arrowStraight", 0, 0.55, 0.8, 0.2, { color: INK, rotation: 200 }),
    ],
    texts: [
      text(0, 0.62, 0.06, 0.34, t("best coffee\nin town", "cà phê ngon\nnhất phố"), { font: "patrickHand", size: 0.048, color: INK, align: "left", lineHeight: 1.05 }),
      text(0, 0.06, 0.52, 0.34, t("got lost here", "lạc ở đây"), { font: "patrickHand", size: 0.048, color: INK, align: "left" }),
      text(0, 0.58, 0.88, 0.38, t("new favourite", "chỗ ruột mới"), { font: "patrickHand", size: 0.048, color: INK, align: "left" }),
    ],
  }),
  design("bucket-list", "doodle", t("Bucket list", "Danh sách mơ ước"), {
    themes: ["beach", "travel", "friends"],
    events: ["summer"],
    slides: 2,
    background: { kind: "color", color: "#fff8e8" },
    slots: [photo(0, 1, 0.06, 0.06, 0.43, 0.42), photo(1, 1, 0.51, 0.06, 0.43, 0.42), photo(2, 1, 0.06, 0.52, 0.88, 0.42), photo(3, 0, 0.56, 0.5, 0.38, 0.42, { frame: "polaroid", shadow: true, rotation: 4 })],
    icons: [
      ...[0, 1, 2, 3].map((i) => icon("doodle-check", 0, 0.07, 0.29 + i * 0.1, 0.06, { color: i < 3 ? "#2f9e5b" : "#c9c2b4" })),
      icon("doodle-underlineSwoosh", 0, 0.06, 0.2, 0.5, { color: "#f2a541" }),
    ],
    texts: [
      text(0, 0.06, 0.07, 0.8, t("summer\nbucket list", "những việc\nmùa hè"), { font: "patrickHand", size: 0.08, color: INK, align: "left", lineHeight: 1 }),
      ...[t("swim at sunrise", "bơi lúc bình minh"), t("road trip", "đi phượt"), t("ice cream daily", "ngày nào cũng kem"), t("learn to surf", "học lướt sóng")].map((w, i) =>
        text(0, 0.15, 0.295 + i * 0.1, 0.42, w, { font: "patrickHand", size: 0.045, color: INK, align: "left" }),
      ),
    ],
  }),
  design("speech-bubble", "doodle", t("Speech bubble", "Bong bóng thoại"), {
    themes: ["portrait", "friends"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.08, 0.2, 0.84, 0.72, { shadow: true })],
    icons: [icon("doodle-bubble", 0, 0.46, 0.03, 0.46, { color: INK, rotation: 4 }), icon("doodle-exclaim", 0, 0.08, 0.06, 0.1, { color: RED })],
    texts: [text(0, 0.52, 0.09, 0.34, t("hi, it's me", "hi, mình nè"), { font: "patrickHand", size: 0.05, color: INK, rotation: 4 })],
  }),
  design("underlined", "doodle", t("Underlined", "Gạch chân"), {
    themes: ["nature", "travel", "food"],
    slides: 3,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0.08, 0.36, 0.84, 0.56), photo(1, 1, 0.08, 0.08, 0.84, 0.6), photo(2, 2, 0.08, 0.08, 0.41, 0.6), photo(3, 2, 0.51, 0.08, 0.41, 0.6)],
    icons: [icon("doodle-underlineSwoosh", 0, 0.08, 0.26, 0.56, { color: RED }), icon("doodle-sparkle", 0, 0.78, 0.08, 0.12, { color: INK }), icon("doodle-arrowDown", 1, 0.76, 0.73, 0.1, { color: INK })],
    texts: [
      text(0, 0.08, 0.07, 0.84, t("my little\nlist of joys", "danh sách\nniềm vui nhỏ"), { font: "playfair", size: 0.09, color: INK, align: "left", bold: true, lineHeight: 1 }),
      text(1, 0.08, 0.74, 0.66, t("1. long walks", "1. đi bộ thật xa"), { font: "patrickHand", size: 0.06, color: INK, align: "left" }),
      text(2, 0.08, 0.74, 0.84, t("2. good food, better company", "2. đồ ngon, bạn còn ngon hơn"), { font: "patrickHand", size: 0.055, color: INK, align: "left" }),
    ],
  }),
  design("scribble-burst", "doodle", t("Scribble burst", "Nét vẽ bùng nổ"), {
    format: "story",
    themes: ["party", "friends"],
    slides: 1,
    background: { kind: "color", color: "#ffe14d" },
    slots: [photo(0, 0, 0.12, 0.2, 0.76, 0.46, { border: { width: 0.012, color: INK } })],
    icons: [
      icon("doodle-burst", 0, 0.66, 0.13, 0.26, { color: INK }),
      icon("doodle-lightning", 0, 0.06, 0.6, 0.14, { color: INK, rotation: -14 }),
      icon("doodle-scribble", 0, 0.2, 0.7, 0.6, { color: "#ff5a8a" }),
    ],
    texts: [text(0, 0.08, 0.72, 0.84, t("IT'S THE WEEKEND", "CUỐI TUẦN RỒI"), { font: "anton", size: 0.1, color: INK })],
  }),
];
