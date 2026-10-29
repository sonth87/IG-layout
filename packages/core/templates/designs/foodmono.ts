import type { Template } from "../types";
import { art, block, cells, design, icon, INK, photo, strip, t, tape, text, WHITE_FRAME } from "./kit";

// Food & drinks and black & white (owner, 2026-10-29). Food, second round: the look of food
// accounts — warm creams, mocha and olive, lots of room, small italic serifs, top-down photos
// edge to edge. Sample themes: food (dishes), drinks, foodspot (cafés, night markets).

const CREAM = "#f4ede3";
const OAT = "#e9dfd1";
const MOCHA = "#6b4f3a";
const OLIVE = "#5f6b4e";
const TERRA = "#c46a4a";
const MATCHA = "#e6eadb";
const GREY = "#8a8378";
const P = 0.8;
const SMALL = { font: "spaceGrotesk", size: 0.026, letterSpacing: 0.22 } as const;
const monoStrip = strip(0, 0, 0.3, 0.47, 0.34, 4, -3, P, "#111111");

export const FOOD: Template[] = [
  design("food-flatlay", "food", t("Top-down", "Chụp từ trên xuống"), {
    themes: ["food"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.05, 0.9, 0.5, t("sunday brunch", "brunch chủ nhật"), { font: "cormorant", size: 0.055, color: "#ffffff", align: "left", italic: true, shadow: true }),
      text(0, 0.5, 0.915, 0.45, t("10:30 AM", "10:30 SÁNG"), { ...SMALL, color: "#ffffff", align: "right", shadow: true }),
    ],
  }),
  design("food-cafe-diary", "food", t("Café diary", "Nhật ký quán cà phê"), {
    themes: ["drinks", "food"],
    slides: 3,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0.14, 0.12, 0.72, 0.66, { mask: "arch" }), photo(1, 1, 0.08, 0.1, 0.4, 0.58, { mask: "rounded", cornerRadius: 0.02 }), photo(2, 1, 0.52, 0.32, 0.4, 0.58, { mask: "rounded", cornerRadius: 0.02 }), photo(3, 2, 0.1, 0.1, 0.8, 0.6, { mask: "rounded", cornerRadius: 0.02 })],
    texts: [
      text(0, 0.1, 0.83, 0.8, t("café diary", "nhật ký cà phê"), { font: "cormorant", size: 0.075, color: MOCHA, italic: true }),
      text(0, 0.1, 0.92, 0.8, t("NO. 12 · OAT FLAT WHITE", "SỐ 12 · BẠC XỈU SỮA YẾN MẠCH"), { ...SMALL, color: GREY }),
      text(1, 0.08, 0.76, 0.4, t("slow sip,\nslow morning", "nhâm nhi chậm,\nsáng chậm"), { font: "cormorant", size: 0.05, color: MOCHA, align: "left", italic: true, lineHeight: 1.05 }),
      text(2, 0.1, 0.76, 0.8, t("★★★★☆  would come back", "★★★★☆  sẽ quay lại"), { ...SMALL, size: 0.03, color: MOCHA, align: "left" }),
      text(2, 0.1, 0.84, 0.8, t("📍 the quiet corner café", "📍 quán góc phố yên tĩnh"), { font: "cormorant", size: 0.05, color: MOCHA, align: "left", italic: true }),
    ],
  }),
  design("food-latte-circle", "food", t("But first, coffee", "Cà phê trước đã"), {
    themes: ["drinks"],
    slides: 1,
    background: { kind: "color", color: OAT },
    slots: [photo(0, 0, 0.16, 0.16, 0.68, 0.544, { mask: "circle", shadow: true })],
    texts: [
      text(0, 0.1, 0.06, 0.8, t("but first,", "trước hết,"), { font: "cormorant", size: 0.06, color: MOCHA, italic: true }),
      text(0, 0.1, 0.77, 0.8, t("coffee", "cà phê"), { font: "playfair", size: 0.12, color: MOCHA, italic: true }),
      text(0, 0.1, 0.92, 0.8, t("LATTE · 07:45", "LATTE · 07:45"), { ...SMALL, color: GREY }),
    ],
  }),
  design("food-menu", "food", t("Menu card", "Thẻ thực đơn"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    shapes: [block(0, 0.06, 0.4, 0.88, 0.003, MOCHA), block(0, 0.06, 0.408, 0.88, 0.0012, MOCHA), block(0, 0.06, 0.94, 0.88, 0.0012, MOCHA)],
    slots: cells(0, 0, [0, 0, 1, 0.34], 3, 1, 0),
    texts: [
      text(0, 0.06, 0.43, 0.88, t("Menu", "Thực đơn"), { font: "playfair", size: 0.09, color: MOCHA, italic: true }),
      text(0, 0.06, 0.54, 0.88, t("SUNDAY · AT HOME", "CHỦ NHẬT · Ở NHÀ"), { ...SMALL, color: GREY }),
      ...[
        [t("Beef noodle soup", "Phở bò"), "45"],
        [t("Crispy spring rolls", "Nem rán giòn"), "30"],
        [t("Mango sticky rice", "Xôi xoài"), "25"],
        [t("Iced milk coffee", "Cà phê sữa đá"), "20"],
      ].map(([w, price], i) => [
        text(0, 0.12, 0.62 + i * 0.075, 0.6, w as { en: string; vi: string }, { font: "cormorant", size: 0.048, color: INK, align: "left", italic: true }),
        text(0, 0.72, 0.625 + i * 0.075, 0.16, t(price as string, price as string), { ...SMALL, size: 0.03, color: MOCHA, align: "right" }),
      ]).flat(),
    ],
  }),
  design("food-matcha", "food", t("Matcha mood", "Tâm trạng matcha"), {
    themes: ["drinks"],
    slides: 1,
    background: { kind: "color", color: MATCHA },
    slots: [photo(0, 0, 0.06, 0.06, 0.52, 0.62, { mask: "rounded", cornerRadius: 0.03 }), photo(1, 0, 0.62, 0.06, 0.32, 0.3, { mask: "rounded", cornerRadius: 0.03 }), photo(2, 0, 0.62, 0.38, 0.32, 0.3, { mask: "rounded", cornerRadius: 0.03 })],
    texts: [
      text(0, 0.06, 0.74, 0.88, t("matcha mood", "tâm trạng matcha"), { font: "playfair", size: 0.09, color: OLIVE, align: "left", italic: true }),
      text(0, 0.06, 0.88, 0.88, t("CEREMONIAL GRADE · OAT MILK · LESS SUGAR", "LOẠI THƯỢNG HẠNG · SỮA YẾN MẠCH · ÍT ĐƯỜNG"), { ...SMALL, color: OLIVE, align: "left" }),
    ],
  }),
  design("food-recipe", "food", t("Recipe card", "Thẻ công thức"), {
    themes: ["food"],
    slides: 2,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0, 0, 1, 1), photo(1, 1, 0.06, 0.06, 0.88, 0.42, { mask: "rounded", cornerRadius: 0.02 })],
    texts: [text(0, 0.06, 0.88, 0.88, t("homemade · recipe inside →", "tự nấu · công thức bên trong →"), { font: "cormorant", size: 0.05, color: "#ffffff", align: "left", italic: true, shadow: true })],
    widgets: [{ slide: 1, x: 0.06, y: 0.52, w: 0.88, kind: "recipeCard", variant: "lined", fields: { dishName: t("Mum's beef noodle soup", "Phở bò của mẹ"), prepTime: t("3 hours", "3 tiếng"), servings: t("4 bowls", "4 bát"), ingredients: t("Beef bones • star anise • ginger • rice noodles", "Xương bò • hoa hồi • gừng • bánh phở"), tip: t("Char the onion and ginger first", "Nướng hành gừng trước cho thơm") } }],
  }),
  design("food-tour", "food", t("Food tour", "Food tour"), {
    themes: ["food"],
    slides: 4,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0, 0, 1, 0.68), ...[1, 2, 3].map((s) => photo(s, s, 0.08, 0.08, 0.84, 0.7, { mask: "rounded", cornerRadius: 0.02 }))],
    texts: [
      text(0, 0.06, 0.72, 0.88, t("a little\nfood tour", "food tour\nnho nhỏ"), { font: "playfair", size: 0.085, color: MOCHA, align: "left", italic: true, lineHeight: 1 }),
      text(0, 0.06, 0.92, 0.88, t("3 STOPS · 1 HAPPY STOMACH", "3 ĐIỂM · 1 CÁI BỤNG VUI"), { ...SMALL, color: GREY, align: "left" }),
      ...[t("noodles", "bún chả"), t("grill", "đồ nướng"), t("dessert", "tráng miệng")].map((w, i) => text(i + 1, 0.08, 0.81, 0.6, w, { font: "cormorant", size: 0.065, color: MOCHA, align: "left", italic: true })),
      ...[1, 2, 3].map((s) => text(s, 0.6, 0.83, 0.32, t(`0${s} / 03`, `0${s} / 03`), { ...SMALL, color: GREY, align: "right" })),
    ],
  }),
  design("food-brunch-grid", "food", t("Brunch, four ways", "Bốn góc bữa brunch"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: cells(0, 0, [0.04, 0.04, 0.92, 0.82], 2, 2, 0.012),
    texts: [
      text(0, 0.04, 0.9, 0.6, t("brunch club", "hội ăn brunch"), { font: "cormorant", size: 0.055, color: INK, align: "left", italic: true }),
      text(0, 0.5, 0.91, 0.46, t("EVERY SUNDAY", "MỖI CHỦ NHẬT"), { ...SMALL, color: GREY, align: "right" }),
    ],
  }),
  design("food-sweet-tooth", "food", t("Sweet tooth", "Hảo ngọt"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: "#f7e6e4" },
    slots: [photo(0, 0, 0.06, 0.2, 0.42, 0.58, { mask: "arch" }), photo(1, 0, 0.52, 0.14, 0.42, 0.58, { mask: "arch" })],
    texts: [
      text(0, 0.06, 0.05, 0.88, t("sweet tooth", "hảo ngọt"), { font: "playfair", size: 0.09, color: "#a24b5a", italic: true }),
      text(0, 0.06, 0.85, 0.88, t("one slice was never enough", "một miếng chưa bao giờ đủ"), { font: "cormorant", size: 0.05, color: "#a24b5a", italic: true }),
    ],
  }),
  design("food-pho-story", "food", t("Morning bowl", "Bát phở 6 giờ sáng"), {
    format: "story",
    themes: ["food"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.06, 0.14, 0.88, t("6 a.m.\nnoodles", "phở\n6 giờ sáng"), { font: "playfair", size: 0.11, color: "#ffffff", align: "left", italic: true, shadow: true, lineHeight: 0.95 }),
      text(0, 0.06, 0.78, 0.7, t("📍 the stall with no name", "📍 quán không tên đầu ngõ"), { font: "beVietnam", size: 0.034, color: INK, align: "left", bold: true, background: { color: "#ffffff", padding: 0.5, radius: 0.6 } }),
    ],
  }),
  design("food-review", "food", t("Review card", "Thẻ review"), {
    format: "story",
    themes: ["food", "drinks"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0.06, 0.14, 0.88, 0.48, { mask: "rounded", cornerRadius: 0.04 })],
    widgets: [{ slide: 0, x: 0.06, y: 0.64, w: 0.88, kind: "starRating", variant: "card", fields: { title: t("The corner noodle shop", "Quán phở đầu ngõ"), comment: t("Broth for days. Coming back tomorrow.", "Nước dùng đậm, mai ăn tiếp."), score: t("4.8 / 5", "4,8 / 5") } }],
  }),
  design("food-receipt", "food", t("The bill", "Hoá đơn"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: OAT },
    slots: [photo(0, 0, 0.06, 0.06, 0.56, 0.7, { mask: "rounded", cornerRadius: 0.02, shadow: true })],
    widgets: [{ slide: 0, x: 0.5, y: 0.38, w: 0.44, kind: "receipt", variant: "thermal", rotation: 4, fields: { storeName: t("DINNER WITH YOU", "BỮA TỐI CÙNG CẬU"), line1: t("2x noodles ........ 70k", "2x phở .......... 70k"), line2: t("1x spring rolls ... 40k", "1x nem .......... 40k"), line3: t("laughs ......... free", "tiếng cười ...... 0đ"), total: t("TOTAL: worth it", "TỔNG: đáng lắm") } }],
  }),
  design("food-coffee-week", "food", t("A week of coffee", "Một tuần cà phê"), {
    themes: ["drinks"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    slots: cells(0, 0, [0.06, 0.16, 0.88, 0.7], 3, 2, 0.02, P, { mask: "rounded", cornerRadius: 0.015 }),
    texts: [
      text(0, 0.06, 0.05, 0.88, t("seven days, seven cups", "bảy ngày, bảy ly"), { font: "cormorant", size: 0.065, color: MOCHA, align: "left", italic: true }),
      text(0, 0.06, 0.89, 0.88, t("MON  TUE  WED  THU  FRI  SAT", "T2  T3  T4  T5  T6  T7"), { ...SMALL, color: GREY }),
    ],
  }),
  design("food-bubble-tea", "food", t("Bubble tea?", "Trà sữa không?"), {
    format: "story",
    themes: ["drinks"],
    slides: 1,
    background: { kind: "color", color: "#fde7ef" },
    slots: [photo(0, 0, 0.14, 0.2, 0.72, 0.5, { mask: "arch", border: { width: 0.014, color: "#ffffff" } })],
    icons: [icon("doodle-hearts", 0, 0.68, 0.14, 0.2, { color: "#e86f9a" }), icon("doodle-sparkle", 0, 0.1, 0.72, 0.1, { color: "#e86f9a" })],
    texts: [text(0, 0.06, 0.74, 0.88, t("bubble tea?\nalways yes", "trà sữa không?\nluôn luôn có"), { font: "patrickHand", size: 0.075, color: "#c2306b", lineHeight: 1.05 })],
  }),
  design("food-cocktail", "food", t("Friday drinks", "Tối thứ sáu"), {
    themes: ["drinks"],
    slides: 2,
    background: { kind: "color", color: "#1b1512" },
    slots: [photo(0, 0, 0.1, 0.1, 0.8, 0.66, { mask: "arch" }), photo(1, 1, 0.06, 0.06, 0.43, 0.7), photo(2, 1, 0.51, 0.24, 0.43, 0.7)],
    texts: [
      text(0, 0.1, 0.8, 0.8, t("friday drinks", "tối thứ sáu"), { font: "playfair", size: 0.08, color: "#e8c98b", italic: true }),
      text(0, 0.1, 0.91, 0.8, t("SHAKEN · STIRRED · SHARED", "LẮC · KHUẤY · CHIA NHAU"), { ...SMALL, color: "#a8977a" }),
    ],
  }),
  design("food-cafe-hopping", "food", t("Café hopping", "Cà phê dạo"), {
    themes: ["foodspot", "drinks"],
    slides: 3,
    background: { kind: "color", color: "#efe6d6" },
    art: [art("gen-stamps/stamp-10", 0, 0.08, 0.2, 0.5, { rotation: -4 }), art("gen-stamps/stamp-15", 0, 0.5, 0.42, 0.44, { rotation: 5, photo: 1 })],
    slots: [photo(2, 1, 0.06, 0.06, 0.88, 0.62, WHITE_FRAME), photo(3, 2, 0.06, 0.06, 0.43, 0.6, WHITE_FRAME), photo(4, 2, 0.51, 0.3, 0.43, 0.6, WHITE_FRAME)],
    texts: [
      text(0, 0.06, 0.05, 0.88, t("café hopping", "cà phê dạo"), { font: "playfair", size: 0.08, color: MOCHA, align: "left", italic: true }),
      text(1, 0.06, 0.74, 0.88, t("stop no. 2 — the one with the cat", "quán số 2 — quán có con mèo"), { font: "cormorant", size: 0.05, color: MOCHA, align: "left", italic: true }),
    ],
  }),
  design("food-night-market", "food", t("Night market", "Đêm chợ"), {
    format: "story",
    themes: ["foodspot"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.04, 0.13, 0.92, t("night\nmarket", "đêm\nchợ"), { font: "anton", size: 0.15, color: INK, lineHeight: 1, cutout: { style: "neon", seed: 6, mess: 0.4, wave: 0.25 } }),
      text(0, 0.08, 0.8, 0.84, t("grilled everything, until midnight", "nướng đủ món, tới nửa đêm"), { font: "beVietnam", size: 0.034, color: INK, bold: true, background: { color: "#ffffff", padding: 0.5, radius: 0.6 } }),
    ],
  }),
  design("food-family-dinner", "food", t("Home cooking", "Cơm nhà"), {
    themes: ["food"],
    slides: 2,
    background: { kind: "color", color: "#f3ead9" },
    shapes: [tape(1, 0.3, 0.06, -6, "#e8d5b5"), tape(1, 0.72, 0.5, 5, "#e8d5b5")],
    slots: [photo(0, 0, 0, 0, 1, 0.74), photo(1, 1, 0.06, 0.08, 0.5, 0.42, { ...WHITE_FRAME, rotation: -3 }), photo(2, 1, 0.44, 0.52, 0.5, 0.4, { ...WHITE_FRAME, rotation: 3 })],
    texts: [
      text(0, 0.06, 0.78, 0.88, t("home cooking", "cơm nhà"), { font: "playfair", size: 0.085, color: TERRA, align: "left", italic: true }),
      text(0, 0.06, 0.9, 0.88, t("MUM'S KITCHEN · SUNDAY 6 PM", "BẾP CỦA MẸ · 6 GIỜ CHIỀU CHỦ NHẬT"), { ...SMALL, color: GREY, align: "left" }),
      text(1, 0.06, 0.6, 0.36, t("nothing\ntastes like\nhome", "không gì\nngon bằng\ncơm mẹ nấu"), { font: "cormorant", size: 0.055, color: TERRA, align: "left", italic: true, lineHeight: 1.05 }),
    ],
  }),
  design("food-before-after", "food", t("Before / after", "Trước / sau khi ăn"), {
    themes: ["food"],
    slides: 1,
    background: { kind: "color", color: CREAM },
    slots: [photo(0, 0, 0.04, 0.16, 0.45, 0.66, { mask: "rounded", cornerRadius: 0.02 }), photo(1, 0, 0.51, 0.16, 0.45, 0.66, { mask: "rounded", cornerRadius: 0.02 })],
    texts: [
      text(0, 0.04, 0.05, 0.92, t("the meal, in two acts", "bữa ăn, hai hồi"), { font: "cormorant", size: 0.065, color: MOCHA, italic: true }),
      text(0, 0.04, 0.86, 0.45, t("BEFORE", "TRƯỚC"), { ...SMALL, color: MOCHA }),
      text(0, 0.51, 0.86, 0.45, t("AFTER (oops)", "SAU (hết sạch)"), { ...SMALL, color: MOCHA }),
    ],
  }),
  design("food-issue", "food", t("The taste issue", "Số đặc biệt: vị giác"), {
    themes: ["food", "drinks"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0, 0, 1, 1), photo(1, 1, 0.06, 0.06, 0.42, 0.56), photo(2, 1, 0.52, 0.38, 0.42, 0.56)],
    texts: [
      text(0, 0.04, 0.04, 0.92, t("taste", "vị"), { font: "playfair", size: 0.24, color: "#ffffff", italic: true, shadow: true }),
      text(0, 0.06, 0.88, 0.88, t("THE TASTE ISSUE · 12 PLACES WE LOVED", "SỐ VỊ GIÁC · 12 QUÁN MÌNH THƯƠNG"), { ...SMALL, color: "#ffffff", align: "left", shadow: true }),
      text(1, 0.06, 0.68, 0.42, t("“Eat slowly,\nthen order\none more.”", "“Ăn chậm,\nrồi gọi\nthêm món.”"), { font: "cormorant", size: 0.06, color: INK, align: "left", italic: true, lineHeight: 1 }),
    ],
  }),
];

export const MONO: Template[] = [
  design("mono-full-caption", "mono", t("Noir et blanc", "Noir et blanc"), {
    themes: ["mono"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.05, 0.9, 0.6, t("noir et blanc", "noir et blanc"), { font: "cormorant", size: 0.055, color: "#ffffff", align: "left", italic: true, shadow: true }),
      text(0, 0.55, 0.915, 0.4, t("NO. 01", "SỐ 01"), { ...SMALL, color: "#ffffff", align: "right", shadow: true }),
    ],
  }),
  design("mono-film-border", "mono", t("Film border", "Viền phim"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#0c0c0c" },
    slots: [photo(0, 0, 0.07, 0.12, 0.86, 0.72)],
    texts: [
      text(0, 0.07, 0.05, 0.4, t("▶ 24A", "▶ 24A"), { ...SMALL, color: "#e8a33d", align: "left" }),
      text(0, 0.5, 0.05, 0.43, t("ISO 400 · B&W", "ISO 400 · ĐEN TRẮNG"), { ...SMALL, color: "#e8a33d", align: "right" }),
      text(0, 0.07, 0.88, 0.86, t("shot on film, developed at home", "chụp phim, tự tráng ở nhà"), { font: "cormorant", size: 0.045, color: "#bdbdbd", align: "left", italic: true }),
    ],
  }),
  design("mono-one-word", "mono", t("One word", "Một chữ"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0, 0, 0.62, 1)],
    texts: [text(0, 0.62, 0.42, 0.38, t("still.", "lặng."), { font: "playfair", size: 0.1, color: INK, italic: true })],
  }),
  design("mono-black-polaroids", "mono", t("Black instants", "Polaroid đen"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#3a3a3a" },
    slots: [photo(0, 0, 0.06, 0.08, 0.44, 0.44, { frame: "polaroidBlack", shadow: true, rotation: -5 }), photo(1, 0, 0.5, 0.14, 0.44, 0.44, { frame: "polaroidBlack", shadow: true, rotation: 4 }), photo(2, 0, 0.26, 0.5, 0.46, 0.46, { frame: "polaroidBlack", shadow: true, rotation: -1 })],
  }),
  design("mono-street-notes", "mono", t("Street notes", "Ghi chép đường phố"), {
    themes: ["mono"],
    slides: 3,
    background: { kind: "color", color: "#f2f2f0" },
    slots: [0, 1, 2].map((s) => photo(s, s, 0.08, 0.08, 0.84, 0.74)),
    texts: [0, 1, 2].flatMap((s) => [
      text(s, 0.08, 0.86, 0.5, [t("07:12", "07:12"), t("12:40", "12:40"), t("18:05", "18:05")][s], { font: "spaceMono", size: 0.04, color: INK, align: "left" }),
      text(s, 0.46, 0.865, 0.46, [t("first light", "nắng đầu ngày"), t("lunch crowd", "giờ trưa đông"), t("going home", "đường về")][s], { font: "cormorant", size: 0.045, color: INK, align: "right", italic: true }),
    ]),
  }),
  design("mono-in-grey", "mono", t("You & me, in grey", "Cậu & mình, màu xám"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#e6e5e1" },
    slots: [photo(0, 0, 0.06, 0.1, 0.42, 0.62), photo(1, 0, 0.52, 0.28, 0.42, 0.62)],
    texts: [text(0, 0.06, 0.78, 0.44, t("you & me,\nin grey", "cậu & mình,\nmàu xám"), { font: "cormorant", size: 0.07, color: INK, align: "left", italic: true, lineHeight: 1 })],
  }),
  design("mono-lines", "mono", t("Lines & light", "Đường nét & ánh sáng"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    shapes: [block(0, 0.06, 0.06, 0.88, 0.0015, INK), block(0, 0.06, 0.94, 0.88, 0.0015, INK)],
    slots: [photo(0, 0, 0.06, 0.1, 0.56, 0.76), photo(1, 0, 0.64, 0.1, 0.3, 0.37), photo(2, 0, 0.64, 0.49, 0.3, 0.37)],
    texts: [text(0, 0.06, 0.885, 0.88, t("LINES & LIGHT", "ĐƯỜNG NÉT & ÁNH SÁNG"), { ...SMALL, color: INK, align: "left" })],
  }),
  design("mono-salt", "mono", t("Salt", "Muối biển"), {
    format: "story",
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#f4f4f2" },
    slots: [photo(0, 0, 0.08, 0.2, 0.84, 0.52)],
    texts: [
      text(0, 0.08, 0.76, 0.84, t("salt.", "muối."), { font: "playfair", size: 0.12, color: INK, align: "left", italic: true }),
      text(0, 0.08, 0.86, 0.84, t("the sea, without colour", "biển, không màu"), { font: "cormorant", size: 0.05, color: GREY, align: "left", italic: true }),
    ],
  }),
  design("mono-cafe-7am", "mono", t("Café, 7 a.m.", "Quán, 7 giờ sáng"), {
    themes: ["mono"],
    slides: 1,
    background: { kind: "color", color: "#ebeae6" },
    slots: [photo(0, 0, 0.2, 0.1, 0.6, 0.66, { mask: "arch" })],
    texts: [text(0, 0.1, 0.82, 0.8, t("café, 7 a.m. — nobody yet", "quán, 7 giờ sáng — chưa ai tới"), { font: "spaceMono", size: 0.036, color: INK })],
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
