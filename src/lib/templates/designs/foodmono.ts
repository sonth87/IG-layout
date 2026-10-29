import type { Template } from "../types";
import { art, block, cells, design, icon, INK, KRAFT, photo, strip, t, tape, text, WHITE_FRAME } from "./kit";

// Food and black & white (owner, 2026-10-29): two groups of their own, with more sample
// photos (food: noodles, night markets, desserts, family dinners; mono: couples, buildings,
// cafés, beaches).

const CREAM = "#f6efe2";
const TOMATO = "#c8452f";
const GREY = "#8a8378";
const P = 0.8;
const monoStrip = strip(0, 0, 0.3, 0.47, 0.34, 4, -3, P, "#111111");

export const FOOD: Template[] = [
  design("food-menu", "food", t("Today's menu", "Thực đơn hôm nay"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    shapes: [block(0, 0.06, 0.05, 0.88, 0.003, INK), block(0, 0.06, 0.95, 0.88, 0.003, INK)],
    slots: [photo(0, 0, 0.5, 0.1, 0.44, 0.56, { mask: "arch" }), photo(1, 0, 0.5, 0.7, 0.44, 0.22)],
    texts: [
      text(0, 0.06, 0.09, 0.42, t("Menu", "Thực đơn"), { font: "playfair", size: 0.1, color: INK, align: "left", italic: true, bold: true }),
      text(0, 0.06, 0.21, 0.42, t("SUNDAY · AT HOME", "CHỦ NHẬT · Ở NHÀ"), { font: "spaceGrotesk", size: 0.026, color: GREY, align: "left", letterSpacing: 0.2 }),
      ...[t("Beef noodle soup", "Phở bò"), t("Spring rolls", "Nem rán"), t("Grilled fish", "Cá nướng"), t("Mango sticky rice", "Xôi xoài"), t("Iced coffee", "Cà phê sữa đá")].map((w, i) =>
        text(0, 0.06, 0.32 + i * 0.11, 0.4, w, { font: "cormorant", size: 0.05, color: INK, align: "left", italic: true }),
      ),
    ],
  }),
  design("food-review", "food", t("Food review", "Review quán"), {
    format: "story",
    themes: ["food"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 0.66)],
    background: { kind: "color", color: "#fff8ef" },
    widgets: [{ slide: 0, x: 0.08, y: 0.6, w: 0.84, kind: "starRating", variant: "card", fields: { title: t("The corner noodle shop", "Quán phở đầu ngõ"), comment: t("Broth for days. Coming back tomorrow.", "Nước dùng đậm, mai ăn tiếp."), score: t("4.8 / 5", "4,8 / 5") } }],
  }),
  design("food-tour", "food", t("Food tour", "Food tour"), {
    themes: ["food"],
    slides: 4,
    background: { kind: "color", color: "#1d1c1a" },
    slots: [photo(0, 0, 0, 0.3, 1, 0.7), ...[1, 2, 3].map((s) => photo(s, s, 0.06, 0.06, 0.88, 0.72, { mask: "rounded", cornerRadius: 0.03 }))],
    texts: [
      text(0, 0.06, 0.05, 0.88, t("FOOD\nTOUR", "FOOD\nTOUR"), { font: "anton", size: 0.13, color: "#ffd84d", align: "left", lineHeight: 0.9 }),
      text(0, 0.5, 0.16, 0.44, t("3 stops, 1 stomach", "3 điểm, 1 cái bụng"), { font: "patrickHand", size: 0.045, color: "#ffffff", align: "right" }),
      ...[t("01 · noodles", "01 · bún"), t("02 · grill", "02 · đồ nướng"), t("03 · dessert", "03 · tráng miệng")].map((w, i) => text(i + 1, 0.06, 0.82, 0.6, w, { font: "anton", size: 0.06, color: "#ffffff", align: "left", letterSpacing: 0.04 })),
      ...[t("35k", "35k"), t("80k", "80k"), t("25k", "25k")].map((w, i) => text(i + 1, 0.66, 0.83, 0.28, w, { font: "beVietnam", size: 0.04, color: INK, bold: true, background: { color: "#ffd84d", padding: 0.5, radius: 0.6 } })),
    ],
  }),
  design("food-receipt", "food", t("The bill", "Hoá đơn"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#e9e4da" },
    slots: [photo(0, 0, 0.06, 0.06, 0.52, 0.66, { shadow: true, rotation: -3 })],
    widgets: [{ slide: 0, x: 0.5, y: 0.34, w: 0.44, kind: "receipt", variant: "thermal", rotation: 4, fields: { storeName: t("DINNER WITH YOU", "BỮA TỐI CÙNG CẬU"), line1: t("2x noodles ........ 70k", "2x phở .......... 70k"), line2: t("1x spring rolls ... 40k", "1x nem .......... 40k"), line3: t("laughs ......... free", "tiếng cười ...... 0đ"), total: t("TOTAL: worth it", "TỔNG: đáng lắm") } }],
  }),
  design("food-recipe", "food", t("Recipe card", "Thẻ công thức"), {
    themes: ["food"],
    slides: 2,
    background: { kind: "color", color: "#f3efe6" },
    slots: [photo(0, 0, 0, 0, 1, 1), photo(1, 1, 0.06, 0.06, 0.88, 0.44, { mask: "rounded", cornerRadius: 0.03 })],
    texts: [text(0, 0.06, 0.8, 0.88, t("homemade, step by step →", "tự nấu, từng bước →"), { font: "beVietnam", size: 0.034, color: INK, bold: true, align: "left", background: { color: "#ffffff", padding: 0.5, radius: 0.5 } })],
    widgets: [{ slide: 1, x: 0.06, y: 0.54, w: 0.88, kind: "recipeCard", variant: "lined", fields: { dishName: t("Mum's beef noodle soup", "Phở bò của mẹ"), prepTime: t("3 hours", "3 tiếng"), servings: t("4 bowls", "4 bát"), ingredients: t("Beef bones • star anise • ginger • rice noodles", "Xương bò • hoa hồi • gừng • bánh phở"), tip: t("Char the onion and ginger first", "Nướng hành gừng trước cho thơm") } }],
  }),
  design("food-week", "food", t("What I ate this week", "Tuần này ăn gì"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: cells(0, 0, [0.04, 0.14, 0.92, 0.82], 3, 3, 0.012),
    texts: [
      text(0, 0.04, 0.04, 0.92, t("what I ate this week", "tuần này mình ăn gì"), { font: "anton", size: 0.07, color: INK, cutout: { style: "classic", seed: 5, mess: 0.3, wave: 0.12 } }),
    ],
  }),
  design("food-kraft-polaroids", "food", t("Eating my way around", "Ăn sập thành phố"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    shapes: [tape(0, 0.3, 0.06, -6), tape(0, 0.74, 0.12, 6), tape(0, 0.46, 0.5, -3)],
    slots: [photo(0, 0, 0.06, 0.08, 0.44, 0.42, { frame: "polaroid", shadow: true, rotation: -5 }), photo(1, 0, 0.52, 0.13, 0.42, 0.4, { frame: "polaroid", shadow: true, rotation: 4 }), photo(2, 0, 0.26, 0.52, 0.44, 0.42, { frame: "polaroid", shadow: true, rotation: 2 })],
    texts: [text(0, 0.62, 0.66, 0.34, t("eating my\nway around\nthe city", "ăn sập\nthành phố"), { font: "patrickHand", size: 0.05, color: INK, align: "left", lineHeight: 1.05, rotation: 4 })],
  }),
  design("food-street-night", "food", t("Street food night", "Đêm ăn vặt"), {
    format: "story",
    themes: ["food"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.04, 0.13, 0.92, t("street\nfood\nnight", "đêm\năn vặt"), { font: "anton", size: 0.14, color: INK, lineHeight: 1, cutout: { style: "neon", seed: 6, mess: 0.4, wave: 0.25 } }),
      text(0, 0.08, 0.8, 0.84, t("📍 the night market", "📍 chợ đêm"), { font: "beVietnam", size: 0.04, color: INK, bold: true, background: { color: "#ffffff", padding: 0.5, radius: 0.6 } }),
    ],
  }),
  design("food-bowl", "food", t("Morning bowl", "Bát phở sáng"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#f1e7d6" },
    slots: [photo(0, 0, 0.14, 0.14, 0.72, 0.576, { mask: "circle", border: { width: 0.02, color: "#ffffff" }, shadow: true })],
    texts: [
      text(0, 0.06, 0.04, 0.88, t("good morning", "chào buổi sáng"), { font: "greatVibes", size: 0.08, color: TOMATO }),
      text(0, 0.06, 0.78, 0.88, t("a bowl of noodles\nfixes everything", "một bát phở\nchữa lành mọi thứ"), { font: "cormorant", size: 0.065, color: INK, italic: true, lineHeight: 1.05 }),
    ],
  }),
  design("food-cafe-hopping", "food", t("Café hopping", "Đi cà phê"), {
    themes: ["food"],
    slides: 3,
    background: { kind: "color", color: "#efe6d6" },
    art: [art("gen-stamps/stamp-10", 0, 0.08, 0.2, 0.5, { rotation: -4 }), art("gen-stamps/stamp-15", 0, 0.5, 0.42, 0.44, { rotation: 5, photo: 1 })],
    slots: [photo(2, 1, 0.06, 0.06, 0.88, 0.62, WHITE_FRAME), photo(3, 2, 0.06, 0.06, 0.43, 0.6, WHITE_FRAME), photo(4, 2, 0.51, 0.3, 0.43, 0.6, WHITE_FRAME)],
    texts: [
      text(0, 0.06, 0.05, 0.88, t("café hopping", "cà phê dạo"), { font: "greatVibes", size: 0.1, color: "#5b3a24", align: "left" }),
      text(1, 0.06, 0.74, 0.88, t("stop no. 2 — the one with the cat", "quán số 2 — quán có con mèo"), { font: "patrickHand", size: 0.05, color: "#5b3a24", align: "left" }),
    ],
  }),
  design("food-sweet-tooth", "food", t("Sweet tooth", "Hảo ngọt"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#fde8ee" },
    slots: [photo(0, 0, 0.06, 0.16, 0.42, 0.56, { mask: "arch", border: { width: 0.012, color: "#ffffff" } }), photo(1, 0, 0.52, 0.3, 0.42, 0.56, { mask: "arch", border: { width: 0.012, color: "#ffffff" } })],
    icons: [icon("doodle-heartFilled", 0, 0.82, 0.06, 0.12, { color: "#e86f9a" }), icon("doodle-sparkle", 0, 0.08, 0.78, 0.1, { color: "#e86f9a" })],
    texts: [text(0, 0.06, 0.04, 0.7, t("sweet tooth", "hảo ngọt"), { font: "anton", size: 0.09, color: INK, align: "left", cutout: { style: "pastel", seed: 4, mess: 0.4, wave: 0.2 } })],
  }),
  design("food-issue", "food", t("The food issue", "Số đặc biệt: ăn uống"), {
    themes: ["food"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0, 0, 1, 1), photo(1, 1, 0.06, 0.06, 0.42, 0.56), photo(2, 1, 0.52, 0.38, 0.42, 0.56)],
    texts: [
      text(0, 0.04, 0.03, 0.92, t("FOOD", "ĂN"), { font: "playfair", size: 0.28, color: "#ffffff", bold: true, shadow: true }),
      text(0, 0.06, 0.86, 0.88, t("THE TASTE ISSUE · 12 PLACES WE LOVED", "SỐ VỊ GIÁC · 12 QUÁN MÌNH THƯƠNG"), { font: "spaceGrotesk", size: 0.028, color: "#ffffff", align: "left", letterSpacing: 0.18, shadow: true }),
      text(1, 0.06, 0.68, 0.42, t("“Eat slowly,\nthen order\none more.”", "“Ăn chậm,\nrồi gọi\nthêm món.”"), { font: "cormorant", size: 0.06, color: INK, align: "left", italic: true, lineHeight: 1 }),
    ],
  }),
  design("food-before-after", "food", t("Before / after", "Trước / sau khi ăn"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#f4f1ec" },
    slots: [photo(0, 0, 0.04, 0.18, 0.45, 0.66), photo(1, 0, 0.51, 0.18, 0.45, 0.66)],
    texts: [
      text(0, 0.04, 0.05, 0.92, t("the meal, in two acts", "bữa ăn, hai hồi"), { font: "playfair", size: 0.065, color: INK, bold: true }),
      text(0, 0.04, 0.87, 0.45, t("BEFORE", "TRƯỚC"), { font: "spaceGrotesk", size: 0.035, color: INK, letterSpacing: 0.25 }),
      text(0, 0.51, 0.87, 0.45, t("AFTER (oops)", "SAU (hết sạch)"), { font: "spaceGrotesk", size: 0.035, color: INK, letterSpacing: 0.25 }),
    ],
  }),
];

export const MONO: Template[] = [
  design("mono-gallery", "mono", t("Gallery print", "Bản in triển lãm"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.12, 0.1, 0.76, 0.66)],
    texts: [
      text(0, 0.12, 0.8, 0.5, t("Untitled, 2026", "Không tên, 2026"), { font: "cormorant", size: 0.045, color: INK, align: "left", italic: true }),
      text(0, 0.5, 0.805, 0.38, t("silver gelatin print", "bản in bạc"), { font: "spaceGrotesk", size: 0.024, color: GREY, align: "right", letterSpacing: 0.15 }),
    ],
  }),
  design("mono-contact", "mono", t("Contact sheet", "Tờ in thử đen trắng"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#0e0e0e" },
    slots: cells(0, 0, [0.05, 0.09, 0.9, 0.8], 3, 3, 0.015),
    icons: [icon("doodle-circle", 0, 0.34, 0.34, 0.34, { color: "#ffffff" })],
    texts: [
      text(0, 0.05, 0.03, 0.6, t("HP5 · ROLL 21", "HP5 · CUỘN 21"), { font: "spaceGrotesk", size: 0.03, color: "#d6d6d6", align: "left", letterSpacing: 0.2 }),
      text(0, 0.5, 0.91, 0.45, t("print this one", "in tấm này"), { font: "patrickHand", size: 0.045, color: "#ffffff", align: "right" }),
    ],
  }),
  design("mono-diptych", "mono", t("Diptych", "Hai tấm song đôi"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#111111" },
    slots: [photo(0, 0, 0.05, 0.12, 0.44, 0.76), photo(1, 0, 0.51, 0.12, 0.44, 0.76)],
    texts: [text(0, 0.05, 0.9, 0.9, t("I · II", "I · II"), { font: "cormorant", size: 0.04, color: "#bdbdbd", letterSpacing: 0.4 })],
  }),
  design("mono-poem", "mono", t("Typed poem", "Thơ đánh máy"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#f2f0eb" },
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.5)],
    texts: [
      text(0, 0.12, 0.64, 0.76, t("the city slept,\nwe didn't.\nthe sea kept\nall our secrets.", "thành phố ngủ,\ntụi mình thì không.\nbiển giữ hết\nnhững điều thầm kín."), { font: "spaceMono", size: 0.042, color: INK, align: "left", lineHeight: 1.45 }),
    ],
  }),
  design("mono-quote-story", "mono", t("Big quote", "Câu nói lớn"), {
    format: "story",
    themes: ["mono"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.06, 0.6, 0.88, t("“Some days are\nmeant to be\nblack and white.”", "“Có những ngày\nchỉ nên là\nđen và trắng.”"), { font: "cormorant", size: 0.075, color: "#ffffff", align: "left", italic: true, bold: true, shadow: true, lineHeight: 1.05 }),
    ],
  }),
  design("mono-grid", "mono", t("Black & white grid", "Lưới đen trắng"), {
    format: "grid",
    themes: ["mono"],
    slides: 9,
    shapes: [block(4, 0, 0, 1, 1, "#111111")],
    slots: [0, 1, 2, 3, 5, 6, 7, 8].map((s, i) => photo(i, s, 0, 0, 1, 1)),
    texts: [text(4, 0.08, 0.36, 0.84, t("in\nmono", "đen\ntrắng"), { font: "playfair", size: 0.2, color: "#ffffff", italic: true, bold: true, lineHeight: 0.95 })],
  }),
  design("mono-chapters", "mono", t("Chapters", "Chương"), {
    themes: ["mono"],
    slides: 3,
    background: { kind: "color", color: "#ffffff" },
    slots: [0, 1, 2].map((s) => photo(s, s, 0.1, 0.18, 0.8, 0.66)),
    texts: [0, 1, 2].flatMap((s) => [
      text(s, 0.1, 0.05, 0.8, t(["I.", "II.", "III."][s], ["I.", "II.", "III."][s]), { font: "cormorant", size: 0.08, color: INK, align: "left" }),
      text(s, 0.1, 0.87, 0.8, [t("the beginning", "khởi đầu"), t("the middle", "giữa chừng"), t("the end, for now", "kết thúc, tạm thời")][s], { font: "cormorant", size: 0.045, color: INK, align: "left", italic: true }),
    ]),
  }),
  design("mono-noir", "mono", t("Noir", "Noir"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#050505" },
    slots: [photo(0, 0, 0.06, 0.06, 0.88, 0.7)],
    shapes: [block(0, -0.1, 0.1, 1.2, 0.04, "#000000", { rotation: -14, opacity: 0.35, above: true }), block(0, -0.1, 0.24, 1.2, 0.04, "#000000", { rotation: -14, opacity: 0.35, above: true })],
    texts: [
      text(0, 0.06, 0.8, 0.88, t("NOIR", "NOIR"), { font: "playfair", size: 0.12, color: "#ffffff", align: "left", bold: true, letterSpacing: 0.3 }),
      text(0, 0.5, 0.84, 0.44, t("a story told\nin shadows", "câu chuyện kể\nbằng bóng tối"), { font: "cormorant", size: 0.04, color: "#bdbdbd", align: "right", italic: true }),
    ],
  }),
  design("mono-cover", "mono", t("Monochrome cover", "Bìa đen trắng"), {
    format: "story",
    themes: ["mono"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.04, 0.13, 0.92, t("MONO", "MONO"), { font: "bodoni", size: 0.3, color: "#ffffff", bold: true, letterSpacing: 0.04 }),
      text(0, 0.06, 0.76, 0.6, t("THE GREYSCALE ISSUE", "SỐ ĐEN TRẮNG"), { font: "spaceGrotesk", size: 0.032, color: "#ffffff", align: "left", letterSpacing: 0.25, shadow: true }),
    ],
  }),
  design("mono-booth", "mono", t("Black & white booth", "Photobooth đen trắng"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#e9e7e2" },
    shapes: [monoStrip.shape],
    slots: monoStrip.slots,
    texts: [text(0, 0.54, 0.36, 0.42, t("4 frames,\nno colour,\nall feeling", "4 khung,\nkhông màu,\nđầy cảm xúc"), { font: "spaceMono", size: 0.045, color: INK, align: "left", lineHeight: 1.3 })],
  }),
  design("mono-panorama", "mono", t("Grey panorama", "Toàn cảnh xám"), {
    themes: ["mono"],
    group: "panorama",
    slides: 3,
    background: { kind: "photo", photo: 0 },
    slots: [],
    texts: [
      text(0, 0.08, 0.1, 0.84, t("quiet\ncoast", "bờ biển\nlặng"), { font: "cormorant", size: 0.12, color: "#ffffff", align: "left", italic: true, shadow: true, lineHeight: 0.95 }),
      text(2, 0.08, 0.88, 0.84, t("— swipe slowly", "— vuốt chậm thôi"), { font: "spaceGrotesk", size: 0.03, color: "#ffffff", align: "right", letterSpacing: 0.2, shadow: true }),
    ],
  }),
  design("mono-square-date", "mono", t("Dated square", "Ô vuông có ngày"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#fafafa" },
    shapes: [block(0, 0.1, 0.17, 0.8, 0.64, "#ffffff", { shape: "rect" })],
    slots: [photo(0, 0, 0.14, 0.2, 0.72, 0.576, { border: { width: 0.003, color: "#1d1c1a" } })],
    texts: [text(0, 0.14, 0.82, 0.72, t("29.10.2026", "29.10.2026"), { font: "spaceMono", size: 0.03, color: INK, align: "right", letterSpacing: 0.2 })],
  }),
];
