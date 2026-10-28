import type { Template } from "../types";
import { art, block, cells, design, icon, INK, KRAFT, PAPER, photo, t, tape, text, WHITE_FRAME } from "./kit";

// Scrapbook, second batch (2026-10-28): spiral notebook pages and digital cameras (new
// frame packs gen-notebook, gen-camera), sticky notes, an open journal across two slides,
// pressed flowers, butterflies.

const HAND = { font: "patrickHand", color: INK, align: "left" } as const;

export const JOURNAL: Template[] = [
  design("nb-trip-diary", "scrapbook", t("Trip diary", "Nhật ký chuyến đi"), {
    themes: ["travel", "nature", "food"],
    slides: 2,
    background: { kind: "color", color: "#e6e1d8" },
    art: [art("gen-notebook/notebook-8", 0, 0.06, 0.03, 0.62, { rotation: -3 }), art("gen-notebook/notebook-20", 1, 0.3, 0.06, 0.62, { rotation: 3, photo: 2 })],
    slots: [photo(1, 0, 0.56, 0.5, 0.38, 0.38, { frame: "polaroid", shadow: true, rotation: 6 }), photo(3, 1, 0.04, 0.5, 0.36, 0.36, { frame: "polaroid", shadow: true, rotation: -5 })],
    texts: [
      text(0, 0.14, 0.74, 0.4, t("day one —\nlost, happily", "ngày một —\nlạc, mà vui"), { ...HAND, size: 0.045, rotation: -3, lineHeight: 1.1 }),
      text(1, 0.44, 0.8, 0.46, t("day two — the sea", "ngày hai — biển"), { ...HAND, size: 0.045, rotation: 3 }),
    ],
  }),
  design("nb-grid-page", "scrapbook", t("Grid page & stamps", "Trang ô ly & tem"), {
    themes: ["travel", "city", "food"],
    slides: 1,
    background: { kind: "color", color: "#d9d4ca" },
    art: [art("gen-notebook/notebook-11", 0, 0.08, 0.02, 0.84), art("gen-stamps/stamp-2", 0, 0.62, 0.62, 0.3, { rotation: 8, photo: 1 })],
    slots: [],
    texts: [text(0, 0.16, 0.72, 0.42, t("notes from\nthe city", "ghi chép\nthành phố"), { ...HAND, size: 0.05, lineHeight: 1.1 })],
  }),
  design("cam-saved", "scrapbook", t("Saved to memories", "Đã lưu vào kỷ niệm"), {
    themes: ["friends", "party", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#fde7ee" },
    art: [art("gen-camera/camera-2", 0, 0.06, 0.2, 0.88, { rotation: 3 }), art("gen-washi/washi-49", 0, 0.28, 0.16, 0.44, { rotation: -6 })],
    slots: [],
    icons: [icon("doodle-heart", 0, 0.8, 0.06, 0.12, { color: "#e86f9a" }), icon("doodle-sparkle", 0, 0.06, 0.08, 0.1, { color: "#e86f9a" })],
    texts: [text(0, 0.1, 0.84, 0.8, t("saved to memories ♡", "đã lưu vào kỷ niệm ♡"), { ...HAND, size: 0.055, color: "#b0466c", align: "center" })],
  }),
  design("sticky-board", "scrapbook", t("Sticky notes", "Giấy note"), {
    themes: ["friends", "school", "food"],
    slides: 1,
    background: { kind: "color", color: "#f4f2ee" },
    art: [
      art("gen-notes/note-9", 0, 0.58, 0.04, 0.34, { rotation: 6, under: true }),
      art("gen-notes/note-15", 0, 0.06, 0.62, 0.32, { rotation: -5, under: true }),
      art("gen-notes/note-13", 0, 0.62, 0.66, 0.32, { rotation: 4, under: true }),
    ],
    slots: [photo(0, 0, 0.06, 0.06, 0.5, 0.5, { shadow: true, rotation: -2 }), photo(1, 0, 0.4, 0.36, 0.48, 0.42, { shadow: true, rotation: 3 })],
    texts: [
      text(0, 0.62, 0.1, 0.26, t("don't\nforget\nthis day", "đừng\nquên\nngày này"), { ...HAND, size: 0.042, rotation: 6, lineHeight: 1.05 }),
      text(0, 0.1, 0.7, 0.26, t("best\nlunch\never", "bữa trưa\nngon\nnhất"), { ...HAND, size: 0.042, rotation: -5, lineHeight: 1.05 }),
      text(0, 0.66, 0.74, 0.26, t("see you\nsoon!", "hẹn gặp\nlại nha!"), { ...HAND, size: 0.042, rotation: 4, lineHeight: 1.05 }),
    ],
  }),
  design("washi-week", "scrapbook", t("A week in washi", "Một tuần băng dính"), {
    themes: ["food", "city", "friends", "nature"],
    slides: 1,
    background: { kind: "color", color: PAPER },
    slots: cells(0, 0, [0.06, 0.12, 0.88, 0.76], 2, 3, 0.05, 0.8, WHITE_FRAME),
    art: [0, 1, 2, 3, 4, 5].map((i) => art(`gen-washi/washi-${[8, 23, 29, 15, 53, 24][i]}`, 0, 0.13 + (i % 2) * 0.465, 0.1 + Math.floor(i / 2) * 0.27, 0.26, { rotation: [-6, 4, 7, -3, 5, -7][i] })),
    texts: [
      text(0, 0.06, 0.02, 0.88, t("this week ✎", "tuần này ✎"), { ...HAND, size: 0.06 }),
      text(0, 0.06, 0.9, 0.88, t("mon · tue · wed · thu · fri · sat", "t2 · t3 · t4 · t5 · t6 · t7"), { font: "spaceGrotesk", size: 0.028, color: INK, letterSpacing: 0.2 }),
    ],
  }),
  design("wish-you-were-here", "scrapbook", t("Wish you were here", "Ước gì cậu ở đây"), {
    themes: ["travel", "beach", "couple"],
    slides: 1,
    background: { kind: "color", color: "#e3eaf0" },
    art: [art("gen-envelopes/envelope-4", 0, 0.08, 0.04, 0.64, { rotation: 4 }), art("gen-paper-scraps/scrap-5", 0, 0.38, 0.58, 0.56, { rotation: -5 })],
    slots: [],
    texts: [text(0, 0.46, 0.7, 0.42, t("wish you\nwere here ♡", "ước gì cậu\nở đây ♡"), { ...HAND, size: 0.05, rotation: -5, lineHeight: 1.1 })],
  }),
  design("journal-spread", "scrapbook", t("Open journal", "Sổ mở hai trang"), {
    themes: ["travel", "couple", "nature"],
    group: "seamless",
    slides: 2,
    background: { kind: "color", color: "#f6f0e4" },
    shapes: [
      block(0, 0.94, 0, 0.12, 1, "#000000", { opacity: 0.07 }),
      block(0, 0.99, 0, 0.02, 1, "#000000", { opacity: 0.1 }),
      tape(0, 0.32, 0.1, -6),
      tape(0, 1.66, 0.48, 5),
    ],
    slots: [photo(0, 0, 0.1, 0.12, 0.66, 0.5, { shadow: true, rotation: -3 }), photo(1, 0, 1.2, 0.5, 0.66, 0.42, { shadow: true, rotation: 3 })],
    art: [art("botanical/rose-gallica-pontiana", 0, 0.62, 0.66, 0.3, { rotation: 10 })],
    texts: [
      text(0, 0.1, 0.72, 0.6, t("pages from\na slow summer", "những trang của\nmột mùa hè chậm"), { font: "cormorant", size: 0.07, color: INK, align: "left", italic: true, lineHeight: 1 }),
      text(0, 1.2, 0.12, 0.66, t("we stayed until\nthe lights came on", "tụi mình ở lại đến\nkhi đèn đường bật"), { ...HAND, size: 0.05, lineHeight: 1.15 }),
    ],
  }),
  design("pressed-flowers", "scrapbook", t("Pressed flowers", "Hoa ép"), {
    themes: ["flowers", "portrait", "spring"],
    slides: 1,
    background: { kind: "color", color: "#f3ede2" },
    art: [
      art("gen-album/album-3", 0, 0.2, 0.06, 0.6, { rotation: 2 }),
      art("botanical/rose-inermis-redoute", 0, -0.04, 0.5, 0.36, { rotation: -16 }),
      art("botanical/rose-damascena-aurora", 0, 0.68, 0.02, 0.3, { rotation: 18 }),
    ],
    slots: [],
    texts: [text(0, 0.38, 0.84, 0.56, t("kept between the pages", "giữ giữa những trang sổ"), { font: "cormorant", size: 0.05, color: "#6b4b3a", italic: true, align: "right" })],
  }),
  design("butterfly-notes", "scrapbook", t("Butterfly notes", "Bướm và trang sổ"), {
    themes: ["nature", "flowers", "minimal"],
    slides: 1,
    background: { kind: "color", color: "#e9edf0" },
    art: [
      art("gen-notebook/notebook-4", 0, 0.12, 0.03, 0.62, { rotation: -2 }),
      art("butterflies-insects/morpho-achilles", 0, 0.68, 0.08, 0.26, { rotation: 18 }),
      art("butterflies-insects/morpho-helenor-pindarus", 0, 0.66, 0.6, 0.22, { rotation: -12 }),
    ],
    slots: [],
    texts: [text(0, 0.22, 0.7, 0.4, t("small wings,\nbig world", "cánh nhỏ,\nthế giới lớn"), { ...HAND, size: 0.045, rotation: -2, lineHeight: 1.1 })],
  }),
  design("nature-journal", "scrapbook", t("Nature journal", "Sổ thiên nhiên"), {
    themes: ["nature", "travel"],
    slides: 2,
    background: { kind: "color", color: KRAFT },
    art: [art("birds-animals/bird-gould-plate-146", 0, 0.6, 0.5, 0.36, { rotation: 6 }), art("gen-paper-scraps/scrap-13", 1, 0.48, 0.56, 0.48, { rotation: 4, under: true })],
    slots: [photo(0, 0, 0.08, 0.08, 0.6, 0.56, WHITE_FRAME), photo(1, 1, 0.06, 0.06, 0.5, 0.48, { ...WHITE_FRAME, rotation: -3 }), photo(2, 1, 0.56, 0.08, 0.38, 0.4, { ...WHITE_FRAME, rotation: 4 })],
    texts: [
      text(0, 0.08, 0.72, 0.5, t("field notes,\nno. 3", "ghi chép\nthực địa, số 3"), { font: "cormorant", size: 0.07, color: INK, align: "left", bold: true, lineHeight: 1 }),
      text(1, 0.54, 0.64, 0.4, t("heard: two birds\nseen: one fox\nfelt: very calm", "nghe: hai chú chim\nthấy: một con cáo\ncảm thấy: rất bình yên"), { ...HAND, size: 0.036, rotation: 4, lineHeight: 1.25 }),
    ],
  }),
  design("cam-and-notes", "scrapbook", t("Camera & notes", "Máy ảnh & ghi chú"), {
    format: "story",
    themes: ["friends", "city", "party"],
    slides: 1,
    background: { kind: "color", color: "#efeae3" },
    art: [art("gen-camera/camera-14", 0, 0.04, 0.16, 0.92, { rotation: -4 }), art("gen-notes/note-34", 0, 0.38, 0.5, 0.56, { rotation: 5 })],
    slots: [photo(1, 0, 0.08, 0.6, 0.4, 0.2, { frame: "polaroid", shadow: true, rotation: -6 })],
    texts: [text(0, 0.44, 0.535, 0.46, t("friday night,\nno regrets", "tối thứ sáu,\nkhông hối tiếc"), { ...HAND, size: 0.05, rotation: 5, lineHeight: 1.1 })],
  }),
];
