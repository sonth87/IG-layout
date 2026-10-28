import type { Template } from "../types";
import { block, cells, design, INK, photo, t, tape, text, WHITE_FRAME } from "./kit";

// Travel: postcards, tickets, city recaps, road trips (2026-10-28).

const SEA = "#1e4e66";

export const TRAVEL: Template[] = [
  design("postcard", "travel", t("Postcard", "Bưu thiếp"), {
    themes: ["travel", "beach", "city"],
    slides: 1,
    background: { kind: "color", color: "#e8e2d6" },
    shapes: [
      block(0, 0.06, 0.18, 0.88, 0.6, "#fbf8f2"),
      block(0, 0.615, 0.24, 0.004, 0.48, "#c9bfae"),
      block(0, 0.64, 0.68, 0.26, 0.003, "#c9bfae"),
      block(0, 0.64, 0.72, 0.26, 0.003, "#c9bfae"),
    ],
    slots: [photo(0, 0, 0.09, 0.21, 0.5, 0.54), photo(1, 0, 0.77, 0.22, 0.14, 0.14, { border: { width: 0.012, color: "#ffffff" }, shadow: true })],
    texts: [
      text(0, 0.06, 0.06, 0.88, t("wish you were here", "ước gì cậu ở đây"), { font: "patrickHand", size: 0.06, color: INK }),
      text(0, 0.64, 0.42, 0.28, t("Greetings\nfrom", "Gửi lời chào\ntừ"), { font: "greatVibes", size: 0.06, color: INK, align: "left", lineHeight: 1 }),
      text(0, 0.64, 0.56, 0.28, t("THE COAST", "BỜ BIỂN"), { font: "anton", size: 0.055, color: SEA, align: "left", letterSpacing: 0.04 }),
      text(0, 0.06, 0.84, 0.88, t("POSTMARKED 28.10", "DẤU BƯU ĐIỆN 28.10"), { font: "spaceGrotesk", size: 0.028, color: "#6b6357", letterSpacing: 0.25 }),
    ],
  }),
  design("boarding-pass", "travel", t("Boarding pass", "Thẻ lên máy bay"), {
    themes: ["travel", "city"],
    slides: 2,
    background: { kind: "color", color: "#2f5d8a" },
    shapes: [block(0, 0.07, 0.12, 0.86, 0.76, "#fbfaf6", { shape: "roundRect" }), block(0, 0.11, 0.765, 0.78, 0.003, "#cfc9bd")],
    slots: [photo(0, 0, 0.11, 0.16, 0.78, 0.42), photo(1, 1, 0.07, 0.07, 0.86, 0.5), photo(2, 1, 0.07, 0.6, 0.42, 0.33), photo(3, 1, 0.51, 0.6, 0.42, 0.33)],
    texts: [
      text(0, 0.11, 0.6, 0.78, t("BOARDING PASS", "THẺ LÊN MÁY BAY"), { font: "spaceGrotesk", size: 0.03, color: "#2f5d8a", align: "left", letterSpacing: 0.3, bold: true }),
      text(0, 0.11, 0.645, 0.78, t("HAN  →  LIS", "HAN  →  LIS"), { font: "anton", size: 0.1, color: INK, align: "left", letterSpacing: 0.04 }),
      text(0, 0.11, 0.79, 0.78, t("GATE 12    SEAT 3A    06:40", "CỬA 12    GHẾ 3A    06:40"), { font: "spaceGrotesk", size: 0.028, color: "#6b665f", align: "left", letterSpacing: 0.1 }),
    ],
  }),
  design("city-recap", "travel", t("City recap", "Thành phố này"), {
    themes: ["city", "food"],
    slides: 3,
    background: { kind: "color", color: "#ffffff" },
    slots: [
      ...cells(0, 0, [0, 0, 1, 1], 2, 2, 0.006),
      photo(4, 1, 0, 0, 1, 0.62),
      photo(5, 1, 0, 0.627, 0.497, 0.373),
      photo(6, 1, 0.503, 0.627, 0.497, 0.373),
      photo(7, 2, 0, 0, 0.497, 1),
      photo(8, 2, 0.503, 0, 0.497, 0.497),
      photo(9, 2, 0.503, 0.503, 0.497, 0.497),
    ],
    texts: [text(0, 0.2, 0.42, 0.6, t("city recap", "thành phố này"), { font: "greatVibes", size: 0.1, color: "#c2362f", background: { color: "#ffffff", padding: 0.3 } })],
  }),
  design("places-guide", "travel", t("Places to see", "Những nơi nên đến"), {
    themes: ["travel", "city"],
    slides: 3,
    background: { kind: "color", color: "#f2efe9" },
    slots: [photo(0, 0, 0.08, 0.4, 0.84, 0.52), photo(1, 1, 0.08, 0.08, 0.84, 0.56), photo(2, 2, 0.08, 0.08, 0.84, 0.56)],
    texts: [
      text(0, 0.08, 0.08, 0.84, t("2 places\nworth the trip", "2 nơi\nđáng để đi"), { font: "playfair", size: 0.1, color: INK, align: "left", bold: true, lineHeight: 1 }),
      text(1, 0.08, 0.68, 0.84, t("01  Old town", "01  Phố cổ"), { font: "playfair", size: 0.065, color: INK, align: "left", bold: true }),
      text(1, 0.08, 0.79, 0.84, t("Cobblestones, bells at noon, the best bakery.", "Đường lát đá, chuông trưa, tiệm bánh ngon nhất."), { font: "lora", size: 0.035, color: "#5d5a55", align: "left" }),
      text(2, 0.08, 0.68, 0.84, t("02  The lake", "02  Hồ"), { font: "playfair", size: 0.065, color: INK, align: "left", bold: true }),
      text(2, 0.08, 0.79, 0.84, t("Go early. Take a jacket. Stay for sunset.", "Đi sớm. Mang áo khoác. Ở lại ngắm hoàng hôn."), { font: "lora", size: 0.035, color: "#5d5a55", align: "left" }),
    ],
  }),
  design("itinerary", "travel", t("Itinerary", "Lịch trình"), {
    format: "story",
    themes: ["travel", "food", "city"],
    slides: 1,
    background: { kind: "color", color: "#f4efe7" },
    slots: [0, 1, 2].map((i) => photo(i, 0, 0.08, 0.15 + i * 0.215, 0.5, 0.19)),
    texts: [
      ...[0, 1, 2].flatMap((i) => [
        text(0, 0.62, 0.18 + i * 0.215, 0.32, t(`DAY ${i + 1}`, `NGÀY ${i + 1}`), { font: "anton", size: 0.075, color: INK, align: "left" }),
        text(0, 0.62, 0.245 + i * 0.215, 0.32, [t("arrive, wander", "đến nơi, lang thang"), t("hike & swim", "leo núi & bơi"), t("eat everything", "ăn mọi thứ")][i], { font: "lora", size: 0.038, color: "#5d5a55", align: "left" }),
      ]),
      text(0, 0.08, 0.79, 0.84, t("the plan, more or less", "kế hoạch, đại loại vậy"), { font: "patrickHand", size: 0.05, color: INK, align: "left" }),
    ],
  }),
  design("window-seat", "travel", t("Window seat", "Ghế cạnh cửa sổ"), {
    themes: ["travel", "nature"],
    slides: 1,
    background: { kind: "color", color: "#dfe7ee" },
    slots: [photo(0, 0, 0.2, 0.08, 0.6, 0.64, { mask: "rounded", cornerRadius: 0.16 })],
    texts: [
      text(0, 0.1, 0.76, 0.8, t("window seat", "ghế cạnh cửa sổ"), { font: "cormorant", size: 0.085, color: INK, bold: true }),
      text(0, 0.1, 0.88, 0.8, t("always.", "luôn luôn."), { font: "patrickHand", size: 0.05, color: "#55606b" }),
    ],
  }),
  design("beach-days", "travel", t("Beach days", "Những ngày biển"), {
    events: ["summer"],
    themes: ["beach"],
    slides: 2,
    background: { kind: "color", color: "#cfe3ea" },
    slots: [
      photo(0, 0, 0.08, 0.1, 0.56, 0.46, { frame: "polaroid", shadow: true, rotation: -5 }),
      photo(1, 0, 0.38, 0.42, 0.54, 0.44, { frame: "polaroid", shadow: true, rotation: 4 }),
      photo(2, 1, 0.08, 0.08, 0.84, 0.6, WHITE_FRAME),
    ],
    texts: [
      text(0, 0.04, 0.7, 0.32, t("beach\ndays", "ngày\nbiển"), { font: "greatVibes", size: 0.11, color: SEA, align: "left", lineHeight: 0.9 }),
      text(1, 0.08, 0.76, 0.84, t("salt, sun & slow mornings", "muối, nắng & những buổi sáng chậm"), { font: "lora", size: 0.045, color: SEA }),
    ],
  }),
  design("road-trip", "seamless", t("Road trip", "Đi phượt"), {
    group: "seamless",
    themes: ["travel", "nature"],
    slides: 3,
    background: { kind: "color", color: "#efe6d8" },
    slots: [
      photo(0, 0, 0.08, 0.14, 0.62, 0.5, { ...WHITE_FRAME, rotation: -2 }),
      photo(1, 0, 0.82, 0.36, 0.6, 0.48, { ...WHITE_FRAME, rotation: 3 }),
      photo(2, 1, 0.55, 0.1, 0.6, 0.46, { ...WHITE_FRAME, rotation: -3 }),
      photo(3, 2, 0.3, 0.5, 0.62, 0.42, { ...WHITE_FRAME, rotation: 2 }),
    ],
    texts: [
      text(0, 0.08, 0.72, 0.6, t("road trip", "đi phượt"), { font: "greatVibes", size: 0.11, color: INK, align: "left" }),
      text(2, 0.4, 0.14, 0.52, t("1,240 KM LATER", "1.240 KM SAU"), { font: "spaceGrotesk", size: 0.035, color: INK, align: "right", letterSpacing: 0.2 }),
    ],
  }),
  design("greetings-story", "travel", t("Greetings from", "Gửi lời chào"), {
    format: "story",
    themes: ["travel", "beach"],
    slides: 1,
    background: { kind: "color", color: "#f2ebe0" },
    shapes: [tape(0, 0.5, 0.165, -4, "#efe4c8", 0.22)],
    slots: [photo(0, 0, 0.1, 0.16, 0.8, 0.5, { ...WHITE_FRAME, rotation: -2 })],
    texts: [
      text(0, 0.08, 0.68, 0.84, t("Greetings from", "Gửi lời chào từ"), { font: "greatVibes", size: 0.09, color: INK }),
      text(0, 0.08, 0.745, 0.84, t("SOMEWHERE NEW", "MỘT NƠI MỚI"), { font: "anton", size: 0.08, color: SEA, letterSpacing: 0.04 }),
    ],
  }),
];
