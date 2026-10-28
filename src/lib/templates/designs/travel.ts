import type { Template } from "../types";
import { art, block, cells, design, icon, INK, photo, t, tape, text, WHITE_FRAME } from "./kit";

// Travel: postcards, tickets, city recaps, road trips (2026-10-28).

const SEA = "#1e4e66";

export const TRAVEL: Template[] = [
  design("pc-stamps-trip", "travel", t("Stamped trip", "Chuyến đi đóng tem"), {
    themes: ["travel", "city", "nature"],
    slides: 2,
    background: { kind: "color", color: "#efe6d6" },
    art: [art("gen-stamps/stamp-1", 0, 0.06, 0.06, 0.5, { rotation: -4 }), art("gen-stamps/stamp-12", 0, 0.5, 0.36, 0.44, { rotation: 5, photo: 1 }), art("vintage-maps-compass/compass-rose-1607", 1, 0.62, 0.6, 0.32), art("gen-stamps/stamp-20", 1, 0.06, 0.08, 0.6, { rotation: 3, photo: 2 })],
    slots: [],
    texts: [
      text(0, 0.06, 0.74, 0.5, t("greetings\nfrom afar", "lời chào\ntừ phương xa"), { font: "greatVibes", size: 0.085, color: "#8a3b17", align: "left", lineHeight: 0.95 }),
      text(1, 0.06, 0.7, 0.5, t("N 16°03′ · E 108°12′", "N 16°03′ · E 108°12′"), { font: "spaceGrotesk", size: 0.03, color: INK, align: "left", letterSpacing: 0.15 }),
    ],
  }),
  design("pc-luggage", "travel", t("Packed & ready", "Xếp đồ lên đường"), {
    format: "story",
    themes: ["travel", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#f1e9dd" },
    slots: [photo(0, 0, 0.08, 0.14, 0.84, 0.44, { shadow: true, rotation: -2 })],
    widgets: [{ slide: 0, x: 0.1, y: 0.62, w: 0.8, kind: "luggageTag" }],
    texts: [text(0, 0.08, 0.84, 0.84, t("out of office ✈", "nghỉ phép rồi ✈"), { font: "patrickHand", size: 0.055, color: INK })],
  }),
  design("pc-route", "travel", t("Flight route", "Đường bay"), {
    themes: ["travel", "city", "beach"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0, 0, 1, 0.58), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.02)],
    widgets: [{ slide: 0, x: 0.08, y: 0.62, w: 0.84, kind: "flightRoute", variant: "line" }],
  }),
  design("pc-passport", "travel", t("Passport stamp", "Dấu hộ chiếu"), {
    themes: ["travel", "city"],
    slides: 1,
    background: { kind: "color", color: "#e7ecef" },
    slots: [photo(0, 0, 0.08, 0.08, 0.6, 0.6, { shadow: true, rotation: -3 }), photo(1, 0, 0.5, 0.46, 0.42, 0.42, { ...WHITE_FRAME, rotation: 4 })],
    widgets: [{ slide: 0, x: 0.6, y: 0.08, w: 0.34, kind: "passportStamp", rotation: 12 }],
    texts: [text(0, 0.08, 0.76, 0.4, t("arrived.", "đã tới."), { font: "cormorant", size: 0.08, color: INK, align: "left", italic: true })],
  }),
  design("pc-vintage-card", "travel", t("Vintage postcard", "Bưu thiếp cổ"), {
    themes: ["travel", "retro", "nature"],
    slides: 2,
    background: { kind: "color", color: "#e9dfc9" },
    shapes: [block(1, 0.06, 0.06, 0.88, 0.88, "#f8f2e4"), block(1, 0.5, 0.14, 0.003, 0.72, "#b9a988")],
    slots: [photo(0, 0, 0.06, 0.06, 0.88, 0.88, { border: { width: 0.02, color: "#f8f2e4" } })],
    art: [art("vintage-stamps/stamp-us-niagara-5c-1901", 1, 0.74, 0.1, 0.16, { rotation: 4 })],
    texts: [
      text(0, 0.1, 0.12, 0.8, t("Greetings from\nthe coast", "Thân gửi từ\nmiền biển"), { font: "greatVibes", size: 0.1, color: "#ffffff", align: "left", shadow: true, lineHeight: 0.95 }),
      text(1, 0.1, 0.16, 0.36, t("Having the best time.\nThe sea is warm,\nthe food is better.\nSee you soon —\nme", "Đang vui lắm nè.\nBiển ấm,\nđồ ăn còn ngon hơn.\nGặp sớm nha —\nmình"), { font: "patrickHand", size: 0.04, color: "#3b4a6b", align: "left", lineHeight: 1.3 }),
      text(1, 0.56, 0.5, 0.34, t("To: you\nSomewhere sunny", "Gửi: cậu\nMột nơi nhiều nắng"), { font: "patrickHand", size: 0.04, color: "#3b4a6b", align: "left", lineHeight: 1.6 }),
    ],
  }),
  design("pc-map-pins", "travel", t("Pinned places", "Những nơi đã ghim"), {
    themes: ["travel", "city", "food"],
    slides: 1,
    background: { kind: "color", color: "#dfe9e6" },
    slots: [photo(0, 0, 0.06, 0.08, 0.42, 0.36, WHITE_FRAME), photo(1, 0, 0.52, 0.2, 0.42, 0.36, WHITE_FRAME), photo(2, 0, 0.14, 0.54, 0.42, 0.36, WHITE_FRAME)],
    icons: [icon("pin", 0, 0.23, 0.05, 0.08, { color: "#e5383b" }), icon("pin", 0, 0.69, 0.17, 0.08, { color: "#e5383b" }), icon("pin", 0, 0.31, 0.51, 0.08, { color: "#e5383b" }), icon("doodle-arrowCurve", 0, 0.6, 0.62, 0.3, { color: INK })],
    texts: [text(0, 0.6, 0.86, 0.36, t("3 cities, 1 week", "3 thành phố, 1 tuần"), { font: "patrickHand", size: 0.045, color: INK })],
  }),
  design("pc-window-seat", "travel", t("Seat 12A", "Ghế 12A"), {
    format: "story",
    themes: ["travel", "nature"],
    slides: 1,
    background: { kind: "color", color: "#dfe7ef" },
    slots: [photo(0, 0, 0.18, 0.18, 0.64, 0.46, { mask: "rounded", cornerRadius: 0.3, border: { width: 0.03, color: "#f7f7f5" }, shadow: true })],
    texts: [
      text(0, 0.08, 0.7, 0.84, t("window seat,\nalways", "luôn chọn\nghế cửa sổ"), { font: "cormorant", size: 0.08, color: "#2a3b55", italic: true, lineHeight: 1 }),
      text(0, 0.08, 0.13, 0.84, t("SEAT 12A", "GHẾ 12A"), { font: "spaceGrotesk", size: 0.032, color: "#2a3b55", letterSpacing: 0.3 }),
    ],
  }),
  design("pc-city-guide", "travel", t("City guide", "Cẩm nang thành phố"), {
    themes: ["city", "food", "travel"],
    slides: 4,
    background: { kind: "color", color: "#fffaf0" },
    slots: [photo(0, 0, 0, 0, 1, 0.66), ...[1, 2, 3].map((s) => photo(s, s, 0.06, 0.18, 0.88, 0.62))],
    texts: [
      text(0, 0.06, 0.7, 0.88, t("48 hours in\nthe old town", "48 giờ ở\nphố cổ"), { font: "playfair", size: 0.09, color: INK, align: "left", bold: true, lineHeight: 1 }),
      ...[t("01 · EAT", "01 · ĂN"), t("02 · SEE", "02 · NGẮM"), t("03 · STAY", "03 · NGỦ")].map((w, i) => text(i + 1, 0.06, 0.06, 0.88, w, { font: "anton", size: 0.07, color: "#c4572b", align: "left", letterSpacing: 0.06 })),
      ...[t("the noodle stall by the river", "quán mì cạnh bờ sông"), t("the bridge at sunset", "cây cầu lúc hoàng hôn"), t("a tiny room with a balcony", "phòng nhỏ có ban công")].map((w, i) => text(i + 1, 0.06, 0.84, 0.88, w, { font: "lora", size: 0.04, color: INK, align: "left", italic: true })),
    ],
  }),
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
