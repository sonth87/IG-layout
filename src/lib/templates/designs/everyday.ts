import type { Template } from "../types";
import { cells, design, INK, photo, t, text, WHITE_FRAME } from "./kit";

// Everyday carousels and one-slide collages (2026-10-28).

export const EVERYDAY: Template[] = [
  design("day-in-life", "carousel", t("A day in my life", "Một ngày của mình"), {
    themes: ["food", "city", "friends", "nature"],
    slides: 4,
    background: { kind: "color", color: "#f7f4ef" },
    slots: [0, 1, 2, 3].map((s) => photo(s, s, 0.08, 0.16, 0.84, 0.7)),
    texts: [0, 1, 2, 3].flatMap((s) => [
      text(s, 0.08, 0.05, 0.4, t(["07:30", "12:15", "17:40", "22:00"][s], ["07:30", "12:15", "17:40", "22:00"][s]), { font: "spaceGrotesk", size: 0.05, color: INK, align: "left", bold: true }),
      text(s, 0.4, 0.06, 0.52, [t("coffee first", "cà phê trước đã"), t("lunch break", "nghỉ trưa"), t("golden hour", "giờ vàng"), t("lights out", "tắt đèn")][s], { font: "patrickHand", size: 0.05, color: INK, align: "right" }),
    ]),
  }),
  design("dump-mixed", "carousel", t("Mixed dump", "Photo dump lộn xộn"), {
    themes: ["friends", "food", "party", "city"],
    slides: 3,
    background: { kind: "color", color: "#ffffff" },
    slots: [
      photo(0, 0, 0.04, 0.04, 0.92, 0.92),
      photo(1, 1, 0.04, 0.04, 0.6, 0.5), photo(2, 1, 0.66, 0.04, 0.3, 0.5), photo(3, 1, 0.04, 0.56, 0.3, 0.4), photo(4, 1, 0.36, 0.56, 0.6, 0.4),
      photo(5, 2, 0.04, 0.04, 0.44, 0.44), photo(6, 2, 0.52, 0.04, 0.44, 0.44), photo(7, 2, 0.04, 0.52, 0.92, 0.44),
    ],
  }),
  design("week-recap", "carousel", t("Week recap", "Tổng kết tuần"), {
    themes: ["food", "nature", "city", "friends"],
    slides: 2,
    background: { kind: "color", color: "#1d1c1a" },
    slots: [photo(0, 0, 0.06, 0.2, 0.88, 0.72), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 3, 0.02)],
    texts: [text(0, 0.06, 0.05, 0.88, t("WEEK 44", "TUẦN 44"), { font: "anton", size: 0.1, color: "#ffffff", align: "left", letterSpacing: 0.04 })],
  }),
  design("coffee-diary", "carousel", t("Coffee diary", "Nhật ký cà phê"), {
    themes: ["food", "city", "minimal"],
    slides: 3,
    background: { kind: "color", color: "#efe5d8" },
    slots: [photo(0, 0, 0.1, 0.1, 0.8, 0.64, { mask: "rounded", cornerRadius: 0.03 }), photo(1, 1, 0.06, 0.06, 0.43, 0.6, { mask: "rounded", cornerRadius: 0.03 }), photo(2, 1, 0.51, 0.34, 0.43, 0.6, { mask: "rounded", cornerRadius: 0.03 }), photo(3, 2, 0.1, 0.1, 0.8, 0.64, { mask: "rounded", cornerRadius: 0.03 })],
    texts: [
      text(0, 0.1, 0.78, 0.8, t("coffee diary, vol. 9", "nhật ký cà phê, tập 9"), { font: "cormorant", size: 0.065, color: "#5b3a24", italic: true }),
      text(1, 0.06, 0.72, 0.4, t("oat latte\n★★★★☆", "latte yến mạch\n★★★★☆"), { font: "patrickHand", size: 0.045, color: "#5b3a24", align: "left" }),
      text(2, 0.1, 0.78, 0.8, t("where to next?", "quán nào tiếp?"), { font: "patrickHand", size: 0.055, color: "#5b3a24" }),
    ],
  }),
  design("rounded-cards", "carousel", t("Rounded cards", "Thẻ bo tròn"), {
    themes: ["travel", "nature", "beach"],
    slides: 3,
    background: { kind: "gradient", from: "#fde2cf", to: "#e7d7f3", angle: 135 },
    slots: [0, 1, 2].map((s) => photo(s, s, 0.1, 0.08, 0.8, 0.72, { mask: "rounded", cornerRadius: 0.06, shadow: true })),
    texts: [0, 1, 2].map((s) => text(s, 0.1, 0.84, 0.8, [t("first,", "đầu tiên,"), t("then,", "sau đó,"), t("finally.", "cuối cùng.")][s], { font: "cormorant", size: 0.06, color: INK, italic: true })),
  }),
  design("caption-pills", "carousel", t("Caption pills", "Chú thích dạng viên"), {
    themes: ["city", "food", "friends"],
    slides: 3,
    slots: [0, 1, 2].map((s) => photo(s, s, 0, 0, 1, 1)),
    texts: [0, 1, 2].map((s) => text(s, 0.06, 0.88, 0.6, [t("📍 the corner bakery", "📍 tiệm bánh góc phố"), t("🍜 noodles at 10 pm", "🍜 mì lúc 10 giờ tối"), t("🌙 walking home", "🌙 đi bộ về nhà")][s], { font: "beVietnam", size: 0.034, color: INK, align: "left", bold: true, background: { color: "#ffffff", padding: 0.5, radius: 0.6 } })),
  }),
  design("before-during-after", "carousel", t("Before, during, after", "Trước, trong, sau"), {
    themes: ["food", "party", "friends"],
    slides: 1,
    background: { kind: "color", color: "#fbfaf7" },
    slots: cells(0, 0, [0.04, 0.16, 0.92, 0.62], 3, 1, 0.02),
    texts: [
      text(0, 0.04, 0.05, 0.92, t("the party, in three acts", "bữa tiệc, ba hồi"), { font: "playfair", size: 0.065, color: INK, bold: true }),
      ...[t("before", "trước"), t("during", "trong"), t("after", "sau")].map((w, i) => text(0, 0.04 + i * 0.313, 0.82, 0.293, w, { font: "spaceGrotesk", size: 0.032, color: INK, letterSpacing: 0.2 })),
    ],
  }),
  design("sunday-reset", "carousel", t("Sunday reset", "Chủ nhật sạc pin"), {
    themes: ["minimal", "food", "flowers"],
    slides: 2,
    background: { kind: "color", color: "#e9efe6" },
    slots: [photo(0, 0, 0.12, 0.26, 0.76, 0.64, { mask: "arch" }), photo(1, 1, 0.06, 0.06, 0.43, 0.88), photo(2, 1, 0.51, 0.06, 0.43, 0.43), photo(3, 1, 0.51, 0.51, 0.43, 0.43)],
    texts: [text(0, 0.1, 0.07, 0.8, t("sunday reset", "chủ nhật sạc pin"), { font: "greatVibes", size: 0.1, color: "#3f5a3a" })],
  }),
  // ── Carousel ──────────────────────────────────────────────────────────
  design("weekend-notes", "carousel", t("Weekend notes", "Ghi chú cuối tuần"), {
    themes: ["friends", "food", "city"],
    slides: 4,
    background: { kind: "color", color: "#ffffff" },
    slots: [
      photo(0, 0, 0, 0, 1, 1),
      photo(1, 1, 0.06, 0.05, 0.88, 0.44),
      photo(2, 1, 0.06, 0.51, 0.88, 0.44),
      ...cells(3, 2, [0.06, 0.05, 0.88, 0.9], 2, 2, 0.03),
      photo(7, 3, 0.06, 0.05, 0.88, 0.76),
    ],
    texts: [
      text(0, 0.07, 0.07, 0.86, t("weekend\nnotes", "ghi chú\ncuối tuần"), { font: "playfair", size: 0.1, color: "#ffffff", align: "left", bold: true, lineHeight: 1 }),
      text(3, 0.06, 0.85, 0.88, t("see you next weekend", "hẹn cuối tuần sau"), { font: "patrickHand", size: 0.055, color: INK, align: "left" }),
    ],
  }),
  design("daily-mosaic", "carousel", t("Daily mosaic", "Ô ghép thường ngày"), {
    themes: ["city", "food", "nature", "beach"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [
      photo(0, 0, 0, 0, 0.5, 0.4),
      photo(1, 0, 0.505, 0, 0.495, 0.25),
      photo(2, 0, 0.505, 0.255, 0.245, 0.145),
      photo(3, 0, 0.755, 0.255, 0.245, 0.145),
      ...cells(4, 0, [0, 0.405, 1, 0.3], 3, 1, 0.005),
      photo(7, 0, 0, 0.71, 0.6, 0.29),
      photo(8, 0, 0.605, 0.71, 0.395, 0.29),
    ],
  }),
  design("week-in-review", "carousel", t("Week in review", "Một tuần nhìn lại"), {
    themes: ["city", "food", "portrait"],
    slides: 3,
    background: { kind: "color", color: "#f6f3ee" },
    slots: [0, 1, 2].map((i) => photo(i, i, 0.08, 0.14, 0.84, 0.7)),
    texts: [
      ...[t("MON — TUE", "THỨ HAI — BA"), t("WED — THU", "THỨ TƯ — NĂM"), t("FRI — SUN", "THỨ SÁU — CN")].flatMap((day, i) => [
        text(i, 0.08, 0.06, 0.6, day, { font: "spaceGrotesk", size: 0.032, color: INK, align: "left", letterSpacing: 0.2 }),
        text(i, 0.6, 0.05, 0.32, t(`0${i + 1}/03`, `0${i + 1}/03`), { font: "playfair", size: 0.045, color: INK, align: "right", bold: true }),
      ]),
      text(0, 0.08, 0.87, 0.84, t("a little of everything", "mỗi thứ một chút"), { font: "lora", size: 0.04, color: "#5d5a55", align: "left" }),
    ],
  }),
  design("quote-first", "carousel", t("Quote first", "Mở đầu bằng câu nói"), {
    themes: ["portrait", "nature"],
    slides: 3,
    background: { kind: "color", color: "#1f2a24" },
    slots: [photo(0, 1, 0.08, 0.08, 0.84, 0.84), photo(1, 2, 0.08, 0.08, 0.41, 0.84), photo(2, 2, 0.51, 0.08, 0.41, 0.84)],
    texts: [
      text(0, 0.1, 0.33, 0.8, t("Small days,\nbig feelings.", "Ngày nhỏ,\ncảm xúc lớn."), { font: "cormorant", size: 0.11, color: "#efe8dc", lineHeight: 1.05 }),
      text(0, 0.1, 0.88, 0.8, t("swipe →", "vuốt →"), { font: "spaceGrotesk", size: 0.032, color: "#a9b5ab", letterSpacing: 0.2 }),
    ],
  }),
  design("this-and-that", "carousel", t("This & that", "Cái này, cái kia"), {
    themes: ["fashion", "city"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    slots: [0, 1].flatMap((s) => [photo(s * 2, s, 0.05, 0.12, 0.44, 0.7), photo(s * 2 + 1, s, 0.51, 0.12, 0.44, 0.7)]),
    texts: [
      text(0, 0.05, 0.87, 0.9, t("THIS  &  THAT", "CÁI NÀY  &  CÁI KIA"), { font: "spaceGrotesk", size: 0.038, color: INK, letterSpacing: 0.3 }),
      text(1, 0.05, 0.87, 0.9, t("&  MORE", "&  NỮA"), { font: "spaceGrotesk", size: 0.038, color: INK, letterSpacing: 0.3 }),
    ],
  }),
  design("full-bleed-trio", "carousel", t("Full bleed", "Tràn khung"), {
    themes: ["beach", "travel"],
    slides: 3,
    slots: [0, 1, 2].map((i) => photo(i, i, 0, 0, 1, 1)),
    texts: [0, 1, 2].flatMap((i) => [
      text(i, 0.06, 0.05, 0.4, t(`${i + 1} / 3`, `${i + 1} / 3`), { font: "spaceGrotesk", size: 0.032, color: "#ffffff", align: "left", letterSpacing: 0.15 }),
      text(i, 0.06, 0.88, 0.88, [t("salt water", "nước mặn"), t("sun on skin", "nắng trên da"), t("and nowhere to be", "và chẳng phải đi đâu")][i], { font: "lora", size: 0.045, color: "#ffffff", align: "left" }),
    ]),
  }),
  design("cafe-hopping", "carousel", t("Café hopping", "Đi cà phê"), {
    themes: ["food", "city"],
    slides: 3,
    background: { kind: "color", color: "#efe6da" },
    slots: [
      photo(0, 0, 0.08, 0.36, 0.84, 0.56),
      ...cells(1, 1, [0.08, 0.07, 0.84, 0.74], 2, 2, 0.03),
      photo(5, 2, 0.16, 0.08, 0.68, 0.6, { frame: "polaroid", shadow: true, rotation: 3 }),
    ],
    texts: [
      text(0, 0.08, 0.07, 0.84, t("café\nhopping", "đi\ncà phê"), { font: "playfair", size: 0.12, color: "#4b2e1e", align: "left", bold: true, lineHeight: 0.95 }),
      text(1, 0.08, 0.86, 0.84, t("flat white, croissant, rain outside", "bạc xỉu, bánh sừng bò, ngoài trời mưa"), { font: "lora", size: 0.035, color: "#4b2e1e", align: "left" }),
      text(2, 0.1, 0.84, 0.8, t("10 / 10 would return", "nhất định quay lại"), { font: "patrickHand", size: 0.06, color: "#4b2e1e" }),
    ],
  }),
  design("what-i-ate", "carousel", t("What I ate", "Tuần này ăn gì"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: cells(0, 0, [0.05, 0.13, 0.9, 0.82], 3, 3, 0.015),
    texts: [text(0, 0.05, 0.035, 0.9, t("what I ate this week", "tuần này mình ăn gì"), { font: "playfair", size: 0.065, color: INK, align: "left", bold: true })],
  }),
  design("hello-month", "carousel", t("Hello, month", "Xin chào tháng mới"), {
    themes: ["nature", "food", "portrait"],
    slides: 2,
    slots: [photo(0, 0, 0, 0, 1, 1), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 3, 0.02)],
    background: { kind: "color", color: "#f5f2ec" },
    texts: [text(0, 0.06, 0.38, 0.88, t("hello,\nNovember", "xin chào\ntháng mười một"), { font: "greatVibes", size: 0.13, color: "#ffffff", lineHeight: 0.95 })],
  }),

  // ── Collage (one slide) ─────────────────────────────────────────────────
  design("grid-nine", "collage", t("Nine squares", "Chín ô"), {
    group: "grid",
    themes: ["city", "food", "beach", "friends"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: cells(0, 0, [0, 0, 1, 1], 3, 3, 0.01),
  }),
  design("hero-four", "collage", t("One big, four small", "Một lớn bốn nhỏ"), {
    themes: ["travel", "food", "city"],
    slides: 1,
    background: { kind: "color", color: "#f7f5f1" },
    slots: [photo(0, 0, 0.05, 0.04, 0.9, 0.52), ...cells(1, 0, [0.05, 0.58, 0.9, 0.38], 4, 1, 0.02)],
  }),
  design("circles", "collage", t("Full circle", "Vòng tròn"), {
    themes: ["portrait", "food", "nature"],
    slides: 1,
    background: { kind: "color", color: "#e9e1d6" },
    slots: [
      photo(0, 0, 0.08, 0.08, 0.5, 0.4, { mask: "circle" }),
      photo(1, 0, 0.5, 0.32, 0.42, 0.336, { mask: "circle" }),
      photo(2, 0, 0.12, 0.55, 0.36, 0.288, { mask: "circle" }),
      photo(3, 0, 0.56, 0.68, 0.28, 0.224, { mask: "circle" }),
    ],
    texts: [text(0, 0.6, 0.11, 0.34, t("full\ncircle", "trọn\nvẹn"), { font: "dancing", size: 0.07, color: INK, align: "right", lineHeight: 1 })],
  }),
  design("photo-pile", "collage", t("Photo pile", "Chồng ảnh"), {
    themes: ["friends", "beach", "travel"],
    slides: 1,
    background: { kind: "color", color: "#faf8f5" },
    slots: [
      photo(0, 0, 0.05, 0.06, 0.5, 0.4, { ...WHITE_FRAME, rotation: -3 }),
      photo(1, 0, 0.48, 0.04, 0.46, 0.34, { ...WHITE_FRAME, rotation: 4 }),
      photo(2, 0, 0.3, 0.3, 0.44, 0.36, { ...WHITE_FRAME, rotation: -1 }),
      photo(3, 0, 0.04, 0.5, 0.4, 0.32, { ...WHITE_FRAME, rotation: 3 }),
      photo(4, 0, 0.56, 0.42, 0.4, 0.3, { ...WHITE_FRAME, rotation: -4 }),
      photo(5, 0, 0.2, 0.7, 0.36, 0.26, { ...WHITE_FRAME, rotation: -2 }),
      photo(6, 0, 0.58, 0.7, 0.36, 0.26, { ...WHITE_FRAME, rotation: 5 }),
    ],
  }),
];
