import type { Template } from "../types";
import { cells, design, INK, photo, strip, t, text, WHITE_FRAME } from "./kit";

// Stories, minimal posts and profile grids (2026-10-28).

const booth = strip(0, 0, 0.5, 0.46, 0.4, 4, -3, 0.5625, "#ffffff");

export const SIMPLE: Template[] = [
  // ── Story (9:16) ────────────────────────────────────────────────────────
  design("booth-story", "story", t("Photobooth", "Photobooth"), {
    format: "story",
    themes: ["friends", "couple"],
    slides: 1,
    background: { kind: "color", color: "#f0d9d4" },
    shapes: [booth.shape],
    slots: booth.slots,
  }),
  design("then-now", "story", t("Then / now", "Ngày ấy / bây giờ"), {
    format: "story",
    themes: ["portrait", "mono"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0, 0, 1, 0.47), photo(1, 0, 0, 0.53, 1, 0.47)],
    texts: [text(0, 0.1, 0.476, 0.8, t("then  /  now", "ngày ấy  /  bây giờ"), { font: "playfair", size: 0.065, color: INK, bold: true })],
  }),
  design("camera-roll", "story", t("Camera roll", "Thư viện ảnh"), {
    format: "story",
    themes: ["city", "food", "friends"],
    slides: 1,
    background: { kind: "color", color: "#111111" },
    slots: cells(0, 0, [0.06, 0.13, 0.88, 0.6], 2, 3, 0.02, 0.5625),
    texts: [text(0, 0.06, 0.755, 0.88, t("camera roll, today", "thư viện ảnh hôm nay"), { font: "spaceGrotesk", size: 0.04, color: "#ffffff", align: "left" })],
  }),
  design("new-post", "story", t("New post", "Bài mới"), {
    format: "story",
    themes: ["beach", "portrait"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [text(0, 0.28, 0.7, 0.44, t("new post ↗", "bài mới ↗"), { font: "beVietnam", size: 0.042, color: INK, bold: true, background: { color: "#ffffff", padding: 0.6 } })],
  }),
  design("home-video", "story", t("Home video", "Video gia đình"), {
    format: "story",
    themes: ["friends", "beach"],
    slides: 1,
    background: { kind: "color", color: "#111111" },
    slots: [photo(0, 0, 0.08, 0.22, 0.84, 0.46, { frame: "film" })],
    texts: [
      text(0, 0.08, 0.15, 0.4, t("REC ●", "REC ●"), { font: "spaceGrotesk", size: 0.04, color: "#e5483b", align: "left", bold: true }),
      text(0, 0.52, 0.15, 0.4, t("00:24:12", "00:24:12"), { font: "spaceGrotesk", size: 0.04, color: "#ffffff", align: "right" }),
      text(0, 0.08, 0.72, 0.84, t("home video", "thước phim nhà làm"), { font: "cormorant", size: 0.09, color: "#ffffff" }),
    ],
  }),
  design("lately", "story", t("Lately", "Dạo này"), {
    format: "story",
    themes: ["friends", "food", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#efe8de" },
    slots: [
      photo(0, 0, 0.06, 0.14, 0.56, 0.3, { ...WHITE_FRAME, rotation: -3 }),
      photo(1, 0, 0.4, 0.3, 0.54, 0.29, { ...WHITE_FRAME, rotation: 4 }),
      photo(2, 0, 0.1, 0.5, 0.5, 0.27, { ...WHITE_FRAME, rotation: -2 }),
    ],
    texts: [text(0, 0.6, 0.62, 0.34, t("lately", "dạo này"), { font: "greatVibes", size: 0.12, color: INK, align: "right" })],
  }),

  // ── Minimal ─────────────────────────────────────────────────────────────
  design("quiet", "minimal", t("Quiet", "Tĩnh lặng"), {
    themes: ["minimal"],
    slides: 1,
    background: { kind: "color", color: "#f6f5f2" },
    slots: [photo(0, 0, 0.3, 0.3, 0.4, 0.4)],
    texts: [text(0, 0.2, 0.75, 0.6, t("quiet", "tĩnh lặng"), { font: "cormorant", size: 0.05, color: "#55524c" })],
  }),
  design("pair", "minimal", t("Pair", "Một cặp"), {
    themes: ["minimal", "fashion"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.1, 0.18, 0.37, 0.6), photo(1, 0, 0.53, 0.18, 0.37, 0.6)],
    texts: [text(0, 0.1, 0.84, 0.8, t("I  ·  II", "I  ·  II"), { font: "spaceGrotesk", size: 0.03, color: INK, letterSpacing: 0.5 })],
  }),
  design("here", "minimal", t("Here", "Ở đây"), {
    themes: ["nature", "beach"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [text(0, 0.06, 0.86, 0.5, t("here.", "ở đây."), { font: "cormorant", size: 0.07, color: "#ffffff", align: "left" })],
  }),
  design("still-life", "minimal", t("Still life", "Tĩnh vật"), {
    themes: ["minimal"],
    slides: 1,
    background: { kind: "color", color: "#ebe7e0" },
    slots: [photo(0, 0, 0, 0.1, 0.68, 0.8)],
    texts: [
      text(0, 0.62, 0.48, 0.5, t("STILL LIFE", "TĨNH VẬT"), { font: "spaceGrotesk", size: 0.03, color: INK, letterSpacing: 0.4, rotation: 90 }),
      text(0, 0.74, 0.84, 0.22, t("no. 7", "số 7"), { font: "cormorant", size: 0.05, color: INK, align: "left" }),
    ],
  }),
  design("one-two-three", "minimal", t("One, two, three", "Một, hai, ba"), {
    themes: ["minimal", "nature"],
    slides: 3,
    background: { kind: "color", color: "#f1efea" },
    slots: [photo(0, 0, 0.1, 0.1, 0.5, 0.5), photo(1, 1, 0.3, 0.25, 0.4, 0.5), photo(2, 2, 0.4, 0.4, 0.5, 0.5)],
    texts: [
      text(0, 0.1, 0.64, 0.5, t("one", "một"), { font: "cormorant", size: 0.05, color: INK, align: "left" }),
      text(1, 0.3, 0.79, 0.4, t("two", "hai"), { font: "cormorant", size: 0.05, color: INK }),
      text(2, 0.4, 0.3, 0.5, t("three", "ba"), { font: "cormorant", size: 0.05, color: INK, align: "right" }),
    ],
  }),

  // ── Grid (one picture over the profile) ─────────────────────────────────
  design("grid-hello", "grid", t("Hello there", "Xin chào"), {
    format: "grid",
    group: "panorama",
    themes: ["portrait", "beach"],
    slides: "any",
    background: { kind: "photo", photo: 0 },
    slots: [],
    texts: [text(4, 0.04, 0.34, 0.92, t("hello\nthere", "xin\nchào"), { font: "greatVibes", size: 0.24, color: "#ffffff", lineHeight: 0.9 })],
  }),
  design("grid-coming-soon", "grid", t("Coming soon", "Sắp ra mắt"), {
    format: "grid",
    group: "panorama",
    themes: ["fashion", "city"],
    slides: "any",
    background: { kind: "photo", photo: 0 },
    slots: [],
    texts: [
      text(3, 0.04, 0.38, 0.92, t("COMING", "SẮP"), { font: "anton", size: 0.2, color: "#ffffff", letterSpacing: 0.04 }),
      text(4, 0.04, 0.38, 0.92, t("SOON", "RA MẮT"), { font: "anton", size: 0.2, color: "#ffffff", letterSpacing: 0.04 }),
      text(5, 0.04, 0.38, 0.92, t("11.11", "11.11"), { font: "anton", size: 0.2, color: "#ffffff", letterSpacing: 0.04 }),
    ],
  }),
];
