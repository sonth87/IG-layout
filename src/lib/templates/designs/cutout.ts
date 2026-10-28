import type { Template } from "../types";
import { art, block, cells, design, icon, INK, KRAFT, photo, strip, t, tape, text, WHITE_FRAME } from "./kit";

// Cut-out letters (D-141): templates whose title is one cut-out text element (any words,
// any style from lib/text/cutout), so the user changes the words and keeps the look.

const booth = strip(0, 0, 0.72, 0.5, 0.32, 3, 5, 0.8, "#ffffff");

export const CUTOUT: Template[] = [
  design("cut-weekend", "cutout", t("Weekend, cut out", "Cuối tuần chữ cắt"), {
    themes: ["friends", "city", "food"],
    slides: 2,
    background: { kind: "color", color: "#efe9df" },
    slots: [photo(0, 0, 0.08, 0.28, 0.84, 0.64, WHITE_FRAME), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.025)],
    texts: [text(0, 0.04, 0.03, 0.92, t("weekend mood", "cuối tuần vui"), { font: "anton", size: 0.11, color: INK, cutout: { style: "newspaper", seed: 4, mess: 0.55, wave: 0.35 } })],
  }),
  design("cut-breaking-news", "cutout", t("Breaking news", "Tin nóng"), {
    themes: ["friends", "portrait", "party"],
    slides: 1,
    background: { kind: "color", color: "#f1ece2" },
    shapes: [block(0, 0.06, 0.33, 0.88, 0.004, INK), block(0, 0.06, 0.92, 0.88, 0.004, INK)],
    slots: [photo(0, 0, 0.06, 0.36, 0.88, 0.53, { rotation: -1 })],
    texts: [
      text(0, 0.04, 0.03, 0.92, t("BREAKING\nNEWS", "TIN\nNÓNG"), { font: "anton", size: 0.12, color: INK, lineHeight: 0.95, cutout: { style: "headline", seed: 9, mess: 0.6, wave: 0.25 } }),
      text(0, 0.06, 0.935, 0.88, t("local girl has the best day ever · more on p. 2", "cô gái có ngày vui nhất đời · chi tiết trang 2"), { font: "spaceGrotesk", size: 0.024, color: INK, letterSpacing: 0.1 }),
    ],
  }),
  design("cut-bff-story", "cutout", t("Bestie (cut-out)", "Bạn thân chữ cắt"), {
    format: "story",
    themes: ["friends", "party"],
    slides: 1,
    background: { kind: "color", color: "#ffe3ec" },
    slots: [photo(0, 0, 0.1, 0.32, 0.8, 0.45, { mask: "rounded", cornerRadius: 0.05, border: { width: 0.014, color: "#ffffff" } })],
    icons: [icon("doodle-hearts", 0, 0.7, 0.78, 0.2, { color: "#ff5c93" }), icon("doodle-sparkle", 0, 0.08, 0.8, 0.1, { color: "#ff5c93" })],
    texts: [text(0, 0.06, 0.14, 0.88, t("best friends\nforever", "bạn thân\nmãi mãi"), { font: "anton", size: 0.14, color: INK, cutout: { style: "pastel", seed: 2, mess: 0.6, wave: 0.4, curve: 0.25 } })],
  }),
  design("cut-y2k", "cutout", t("Y2K letters", "Chữ Y2K"), {
    themes: ["fashion", "party", "portrait"],
    slides: 1,
    background: { kind: "gradient", from: "#e6d8ff", to: "#ffd6ec", angle: 160 },
    slots: [photo(0, 0, 0.16, 0.3, 0.68, 0.6, { mask: "star" })],
    texts: [text(0, 0.04, 0.04, 0.92, t("it's giving y2k", "chất y2k"), { font: "anton", size: 0.11, color: INK, cutout: { style: "y2k", seed: 5, mess: 0.55, wave: 0.45, curve: 0.4 } })],
  }),
  design("cut-mixtape", "cutout", t("Label maker", "Máy in nhãn"), {
    themes: ["retro", "city", "friends"],
    slides: 1,
    background: { kind: "color", color: "#2a2826" },
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.62, { border: { width: 0.015, color: "#f1ece0" } })],
    texts: [text(0, 0.04, 0.76, 0.92, t("note to self:\nslow down", "nhắc mình:\nchậm lại"), { font: "anton", size: 0.075, color: INK, lineHeight: 1, cutout: { style: "labelMaker", seed: 7, by: "word", mess: 0.35, wave: 0.2 } })],
  }),
  design("cut-ticket-trip", "cutout", t("Ticket letters", "Chữ vé"), {
    themes: ["travel", "beach", "city"],
    slides: 2,
    background: { kind: "color", color: "#f4efe3" },
    shapes: [tape(1, 0.3, 0.06, -6), tape(1, 0.72, 0.5, 5)],
    slots: [photo(0, 0, 0, 0.3, 1, 0.7), photo(1, 1, 0.06, 0.08, 0.5, 0.44, WHITE_FRAME), photo(2, 1, 0.44, 0.52, 0.5, 0.42, WHITE_FRAME)],
    texts: [text(0, 0.04, 0.05, 0.92, t("road trip!", "đi chơi thôi!"), { font: "anton", size: 0.11, color: INK, cutout: { style: "ticket", seed: 3, mess: 0.45, wave: 0.3, curve: 0.3 } })],
  }),
  design("cut-xmas", "cutout", t("Christmas cut-outs", "Noel chữ cắt"), {
    themes: ["christmas", "friends", "winter"],
    events: ["christmas"],
    slides: 1,
    background: { kind: "color", color: "#14382a" },
    art: [art("christmas/xmas-wrapped-gift-box", 0, 0.72, 0.74, 0.22, { rotation: 8 })],
    slots: [photo(0, 0, 0.12, 0.3, 0.6, 0.56, { frame: "polaroid", shadow: true, rotation: -3 })],
    texts: [text(0, 0.04, 0.03, 0.92, t("merry\nchristmas", "giáng sinh\nvui vẻ"), { font: "anton", size: 0.1, color: INK, lineHeight: 1, cutout: { style: "christmas", seed: 6, mess: 0.55, wave: 0.35 } })],
  }),
  design("cut-tet", "cutout", t("Tết cut-outs", "Tết chữ cắt"), {
    themes: ["lunar", "kids", "friends"],
    events: ["tet"],
    slides: 1,
    background: { kind: "color", color: "#fff4e0" },
    art: [art("tet/tet-apricot-blossom-branch", 0, 0.58, 0.58, 0.44, { rotation: 160 })],
    slots: [photo(0, 0, 0.14, 0.3, 0.6, 0.56, { border: { width: 0.012, color: "#b71c1c" }, rotation: 2 })],
    texts: [text(0, 0.04, 0.03, 0.92, t("happy\nlunar new year", "chúc mừng\nnăm mới"), { font: "anton", size: 0.1, color: INK, lineHeight: 1, cutout: { style: "tet", seed: 8, mess: 0.5, wave: 0.3 } })],
  }),
  design("cut-love-note", "cutout", t("Love in letters", "Thư tình chữ cắt"), {
    themes: ["couple"],
    events: ["valentine"],
    slides: 1,
    background: { kind: "color", color: "#f8e1e4" },
    slots: [photo(0, 0, 0.18, 0.08, 0.64, 0.58, { mask: "heart" })],
    texts: [text(0, 0.04, 0.68, 0.92, t("you're my\nfavourite person", "cậu là người\nmình thương nhất"), { font: "anton", size: 0.075, color: INK, lineHeight: 1.1, cutout: { style: "love", seed: 5, mess: 0.4, wave: 0.2 } })],
  }),
  design("cut-booth-scraps", "cutout", t("Booth & scraps", "Photobooth chữ xé"), {
    themes: ["friends", "couple"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    shapes: [booth.shape],
    slots: booth.slots,
    texts: [text(0, 0.04, 0.18, 0.5, t("us\nagain", "lại là\ntụi mình"), { font: "anton", size: 0.11, color: INK, lineHeight: 1, cutout: { style: "scraps", seed: 11, mess: 0.6, wave: 0.4 } })],
  }),
  design("cut-notebook-quote", "cutout", t("Notebook letters", "Chữ giấy vở"), {
    themes: ["school", "friends", "food"],
    events: ["backToSchool"],
    slides: 1,
    background: { kind: "color", color: "#e9edf0" },
    art: [art("gen-notebook/notebook-18", 0, 0.12, 0.2, 0.62, { rotation: -3 })],
    slots: [],
    texts: [text(0, 0.04, 0.03, 0.92, t("school days", "ngày đi học"), { font: "anton", size: 0.1, color: INK, cutout: { style: "lined", seed: 4, mess: 0.55, wave: 0.35, curve: 0.2 } })],
  }),
  design("cut-neon-night", "cutout", t("Neon night", "Đêm neon"), {
    format: "story",
    themes: ["party", "city"],
    slides: 1,
    background: { kind: "color", color: "#0b0b14" },
    slots: [photo(0, 0, 0.08, 0.3, 0.84, 0.48, { mask: "rounded", cornerRadius: 0.04 })],
    texts: [text(0, 0.04, 0.13, 0.92, t("party\nall night", "quẩy\ncả đêm"), { font: "anton", size: 0.12, color: INK, lineHeight: 1, cutout: { style: "neon", seed: 3, mess: 0.45, wave: 0.3 } })],
  }),
];
