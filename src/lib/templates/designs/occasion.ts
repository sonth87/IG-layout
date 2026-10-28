import type { Template } from "../types";
import { art, cells, design, INK, photo, t, text, WHITE_FRAME } from "./kit";

// Special occasions: birthdays, weddings, graduation, new year (2026-10-28).

const BERRY = "#d6455d";
const GOLD = "#d8b45a";

export const OCCASION: Template[] = [
  design("wedding-arch", "occasion", t("Wedding arch", "Vòm hoa cưới"), {
    themes: ["couple", "flowers"],
    slides: 3,
    background: { kind: "color", color: "#fbf8f3" },
    art: [art("celebrations/cel-bridal-flower-bouquet", 0, 0.66, 0.62, 0.3, { rotation: 10 })],
    slots: [photo(0, 0, 0.12, 0.1, 0.62, 0.66, { mask: "arch" }), ...cells(1, 1, [0.06, 0.06, 0.88, 0.88], 2, 2, 0.025), photo(5, 2, 0.06, 0.06, 0.88, 0.7)],
    texts: [
      text(0, 0.1, 0.8, 0.6, t("just married", "vừa cưới"), { font: "greatVibes", size: 0.1, color: GOLD, align: "left" }),
      text(2, 0.06, 0.82, 0.88, t("12 · 12 · 2026", "12 · 12 · 2026"), { font: "spaceGrotesk", size: 0.04, color: INK, letterSpacing: 0.3 }),
    ],
  }),
  design("baby-hello", "occasion", t("Hello baby", "Chào con"), {
    themes: ["kids", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#eaf3f8" },
    art: [art("celebrations/cel-plush-teddy-bear", 0, 0.66, 0.64, 0.28, { rotation: 6 })],
    slots: [photo(0, 0, 0.14, 0.1, 0.62, 0.62, { mask: "circle", border: { width: 0.014, color: "#ffffff" } })],
    texts: [
      text(0, 0.08, 0.66, 0.6, t("hello,\nlittle one", "chào con,\nbé yêu"), { font: "greatVibes", size: 0.1, color: "#4a6f8a", align: "left", lineHeight: 0.95 }),
      text(0, 0.08, 0.9, 0.6, t("3.2 kg · 50 cm · 06:42", "3,2 kg · 50 cm · 06:42"), { font: "spaceGrotesk", size: 0.03, color: "#4a6f8a", align: "left", letterSpacing: 0.15 }),
    ],
  }),
  design("anniversary-gold", "occasion", t("Then & now, in gold", "Kỷ niệm viền vàng"), {
    themes: ["couple"],
    slides: 2,
    background: { kind: "color", color: "#1f1a17" },
    slots: [photo(0, 0, 0.08, 0.08, 0.4, 0.5, { border: { width: 0.008, color: GOLD } }), photo(1, 0, 0.52, 0.42, 0.4, 0.5, { border: { width: 0.008, color: GOLD } }), photo(2, 1, 0.06, 0.06, 0.88, 0.88)],
    texts: [
      text(0, 0.08, 0.64, 0.4, t("then", "ngày ấy"), { font: "cormorant", size: 0.07, color: GOLD, align: "left", italic: true }),
      text(0, 0.52, 0.3, 0.4, t("now", "bây giờ"), { font: "cormorant", size: 0.07, color: GOLD, align: "right", italic: true }),
      text(0, 0.08, 0.74, 0.4, t("5 YEARS", "5 NĂM"), { font: "anton", size: 0.06, color: GOLD, align: "left", letterSpacing: 0.3 }),
    ],
  }),
  design("trophy-win", "occasion", t("We won", "Thắng rồi"), {
    themes: ["friends", "party", "school"],
    slides: 1,
    background: { kind: "color", color: "#ffd84d" },
    art: [art("celebrations/cel-golden-winner-trophy", 0, 0.62, 0.52, 0.32, { rotation: 8 }), art("celebrations/cel-confetti-ball-open", 0, 0.04, 0.02, 0.2)],
    slots: [photo(0, 0, 0.12, 0.14, 0.62, 0.56, { shadow: true, rotation: -3 })],
    texts: [text(0, 0.06, 0.76, 0.6, t("CHAMPIONS!", "VÔ ĐỊCH!"), { font: "anton", size: 0.1, color: INK, align: "left" })],
  }),
  design("housewarming", "occasion", t("New home", "Nhà mới"), {
    themes: ["minimal", "friends", "food"],
    slides: 2,
    background: { kind: "color", color: "#f1ede6" },
    slots: [photo(0, 0, 0.18, 0.2, 0.64, 0.66, { mask: "arch" }), photo(1, 1, 0.06, 0.06, 0.43, 0.43), photo(2, 1, 0.51, 0.06, 0.43, 0.43), photo(3, 1, 0.06, 0.51, 0.88, 0.43)],
    texts: [text(0, 0.06, 0.05, 0.88, t("home sweet home", "tổ ấm mới"), { font: "greatVibes", size: 0.1, color: INK })],
  }),
  design("birthday-post", "occasion", t("Happy birthday", "Mừng sinh nhật"), {
    themes: ["party", "friends"],
    slides: 2,
    background: { kind: "color", color: "#fde4e4" },
    shapes: [
      { slide: 0, x: 0.8, y: 0.1, w: 0.06, h: 0.048, shape: "circle", fill: "#f2b84b" },
      { slide: 0, x: 0.7, y: 0.27, w: 0.04, h: 0.032, shape: "circle", fill: "#7cc6b4" },
      { slide: 0, x: 0.9, y: 0.33, w: 0.035, h: 0.028, shape: "circle", fill: BERRY },
    ],
    slots: [
      photo(0, 0, 0.06, 0.33, 0.56, 0.58, { frame: "polaroid", shadow: true, rotation: -3 }),
      photo(1, 0, 0.56, 0.45, 0.38, 0.4, { frame: "polaroid", shadow: true, rotation: 5 }),
      ...cells(2, 1, [0.06, 0.06, 0.88, 0.7], 2, 2, 0.025),
    ],
    texts: [
      text(0, 0.06, 0.05, 0.7, t("HAPPY\nBIRTHDAY", "MỪNG\nSINH NHẬT"), { font: "anton", size: 0.14, color: BERRY, align: "left", lineHeight: 0.92 }),
      text(1, 0.06, 0.81, 0.88, t("make a wish ✦", "ước đi nào ✦"), { font: "greatVibes", size: 0.09, color: BERRY }),
    ],
  }),
  design("just-married", "occasion", t("Just married", "Vừa cưới"), {
    themes: ["couple"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.1, 0.08, 0.8, 0.62)],
    texts: [
      text(0, 0.1, 0.72, 0.8, t("Just married", "Về chung một nhà"), { font: "greatVibes", size: 0.11, color: INK }),
      text(0, 0.1, 0.88, 0.8, t("10 · 28 · 2026", "28 · 10 · 2026"), { font: "spaceGrotesk", size: 0.028, color: "#6b6760", letterSpacing: 0.4 }),
    ],
  }),
  design("wedding-day", "occasion", t("Wedding day", "Ngày cưới"), {
    themes: ["couple"],
    slides: 3,
    background: { kind: "color", color: "#f5f1ea" },
    slots: [photo(0, 1, 0.08, 0.08, 0.84, 0.84), photo(1, 2, 0.08, 0.08, 0.41, 0.6), photo(2, 2, 0.51, 0.32, 0.41, 0.6)],
    texts: [
      text(0, 0.08, 0.22, 0.84, t("Our\nwedding\nday", "Ngày\ncưới của\nchúng mình"), { font: "cormorant", size: 0.13, color: INK, bold: true, lineHeight: 1 }),
      text(0, 0.08, 0.72, 0.84, t("a few favourite moments", "vài khoảnh khắc yêu thích"), { font: "lora", size: 0.038, color: "#6b6760" }),
      text(2, 0.06, 0.74, 0.44, t("forever starts here", "mãi mãi bắt đầu từ đây"), { font: "greatVibes", size: 0.07, color: INK, align: "left" }),
    ],
  }),
  design("class-of", "occasion", t("Class of 2026", "Khoá 2026"), {
    events: ["graduation"],
    themes: ["portrait", "friends"],
    slides: 1,
    background: { kind: "color", color: "#14213d" },
    slots: [photo(0, 0, 0.1, 0.24, 0.8, 0.54, { border: { width: 0.015, color: GOLD } })],
    texts: [
      text(0, 0.1, 0.05, 0.8, t("CLASS OF", "KHOÁ"), { font: "spaceGrotesk", size: 0.035, color: GOLD, letterSpacing: 0.4, bold: true }),
      text(0, 0.1, 0.09, 0.8, t("2026", "2026"), { font: "anton", size: 0.13, color: "#f5efe2", letterSpacing: 0.06 }),
      text(0, 0.1, 0.82, 0.8, t("we did it.", "tụi mình làm được rồi."), { font: "greatVibes", size: 0.085, color: "#f5efe2" }),
    ],
  }),
  design("hello-new-year", "occasion", t("Hello new year", "Chào năm mới"), {
    events: ["newYear"],
    themes: ["party", "friends"],
    slides: 2,
    background: { kind: "color", color: "#0e0e10" },
    slots: [
      photo(0, 0, 0.44, 0.42, 0.5, 0.5, { ...WHITE_FRAME, rotation: 4 }),
      photo(1, 0, 0.08, 0.5, 0.38, 0.38, { ...WHITE_FRAME, rotation: -5 }),
      ...cells(2, 1, [0.06, 0.14, 0.88, 0.8], 3, 3, 0.012),
    ],
    texts: [
      text(0, 0.08, 0.08, 0.84, t("hello\n2027", "chào\n2027"), { font: "anton", size: 0.17, color: "#f3d27a", align: "left", lineHeight: 0.92 }),
      text(1, 0.06, 0.05, 0.88, t("2026 IN NINE", "2026 TRONG CHÍN KHUNG HÌNH"), { font: "spaceGrotesk", size: 0.034, color: "#f3d27a", align: "left", letterSpacing: 0.25 }),
    ],
  }),
  design("you-and-me", "occasion", t("You & me", "Mình và cậu"), {
    events: ["valentine"],
    themes: ["couple"],
    slides: 1,
    background: { kind: "color", color: "#f6e1e1" },
    slots: [photo(0, 0, 0.15, 0.08, 0.7, 0.58, { mask: "heart" })],
    texts: [text(0, 0.1, 0.7, 0.8, t("you & me,\nalways", "mình & cậu,\nmãi luôn"), { font: "greatVibes", size: 0.1, color: "#a8344a", lineHeight: 1 })],
  }),
  design("merry-bright", "occasion", t("Merry & bright", "An lành & rực rỡ"), {
    events: ["christmas", "winter"],
    format: "story",
    themes: ["friends", "party", "couple"],
    slides: 1,
    background: { kind: "color", color: "#1f3d2b" },
    slots: [photo(0, 0, 0.12, 0.17, 0.76, 0.42, { frame: "polaroid", shadow: true, rotation: -3 })],
    texts: [text(0, 0.08, 0.64, 0.84, t("Merry\n& bright", "An lành\n& rực rỡ"), { font: "greatVibes", size: 0.13, color: "#f1e3c6", lineHeight: 0.95 })],
  }),
];
