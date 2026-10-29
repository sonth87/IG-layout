import type { Template } from "../types";
import { design, INK, PAPER, photo, t, text, WHITE_FRAME } from "./kit";

// The first designed templates (M10, M18).

export const CLASSIC: Template[] = [
  // ── Carousel ──────────────────────────────────────────────────────────
  design("photo-dump", "carousel", t("Photo dump", "Photo dump"), {
    events: ["summer"],
    themes: ["friends", "food", "beach"],
    slides: 3,
    background: { kind: "color", color: PAPER },
    slots: [
      photo(0, 0, 0.08, 0.2, 0.84, 0.62),
      photo(1, 1, 0.08, 0.07, 0.84, 0.42),
      photo(2, 1, 0.08, 0.51, 0.84, 0.42),
      photo(3, 2, 0.08, 0.07, 0.84, 0.7),
    ],
    texts: [
      text(0, 0.08, 0.06, 0.84, t("summer dump", "mùa hè này"), { font: "playfair", size: 0.1, color: INK, align: "left", bold: true }),
      text(0, 0.08, 0.86, 0.84, t("swipe →", "vuốt →"), { font: "spaceGrotesk", size: 0.035, color: INK, align: "right", letterSpacing: 0.1 }),
      text(2, 0.08, 0.82, 0.84, t("until next time.", "hẹn gặp lại."), { font: "dancing", size: 0.075, color: INK, align: "left" }),
    ],
  }),
  design("travel-journal", "travel", t("Travel journal", "Nhật ký du lịch"), {
    themes: ["travel", "nature"],
    slides: 3,
    background: { kind: "color", color: "#ece4d6" },
    slots: [
      photo(0, 0, 0.08, 0.08, 0.84, 0.6),
      photo(1, 1, 0.06, 0.08, 0.5, 0.5, WHITE_FRAME),
      photo(2, 1, 0.44, 0.42, 0.5, 0.5, { ...WHITE_FRAME, rotation: 4 }),
      photo(3, 2, 0.16, 0.1, 0.68, 0.6, { frame: "polaroid", shadow: true, rotation: -4 }),
    ],
    texts: [
      text(0, 0.08, 0.72, 0.84, t("Weekend in\nthe hills", "Cuối tuần\ntrên đồi"), { font: "playfair", size: 0.095, color: INK, align: "left", bold: true, lineHeight: 1.05 }),
      text(0, 0.08, 0.92, 0.84, t("DAY 01 — 02", "NGÀY 01 — 02"), { font: "spaceGrotesk", size: 0.03, color: "#6b6357", align: "left", letterSpacing: 0.2 }),
      text(1, 0.06, 0.64, 0.36, t("slow mornings\n& pine air", "sáng chậm\nvà mùi thông"), { font: "dancing", size: 0.06, color: INK, align: "left" }),
      text(2, 0.1, 0.8, 0.8, t("see you soon ♡", "hẹn sớm gặp lại ♡"), { font: "dancing", size: 0.08, color: INK }),
    ],
  }),
  design("editorial", "editorial", t("Editorial", "Tạp chí"), {
    themes: ["fashion", "mono"],
    slides: 2,
    background: { kind: "color", color: "#111111" },
    slots: [photo(0, 0, 0, 0, 1, 0.78), photo(1, 1, 0.06, 0.06, 0.42, 0.6), photo(2, 1, 0.52, 0.34, 0.42, 0.6)],
    texts: [
      text(0, 0.06, 0.81, 0.88, t("THE ISSUE", "SỐ ĐẶC BIỆT"), { font: "montserrat", size: 0.1, color: "#ffffff", align: "left", bold: true, letterSpacing: 0.08 }),
      text(0, 0.06, 0.93, 0.88, t("VOL. 01  ·  STORIES FROM THE CITY", "SỐ 01  ·  CHUYỆN THÀNH PHỐ"), { font: "spaceGrotesk", size: 0.028, color: "#bdbdbd", align: "left", letterSpacing: 0.15 }),
      text(1, 0.06, 0.72, 0.42, t("Notes on light,\nconcrete and\nlate trains.", "Ghi chép về ánh sáng,\nbê tông và\nnhững chuyến tàu muộn."), { font: "lora", size: 0.04, color: "#e8e8e8", align: "left" }),
    ],
  }),
  design("numbered", "carousel", t("Numbered", "Đánh số"), {
    themes: ["city", "food"],
    slides: 3,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.1, 0.1, 0.8, 0.68), photo(1, 1, 0.1, 0.1, 0.8, 0.68), photo(2, 2, 0.1, 0.1, 0.8, 0.68)],
    texts: [0, 1, 2].flatMap((i) => [
      text(i, 0.1, 0.82, 0.3, t(`0${i + 1}`, `0${i + 1}`), { font: "playfair", size: 0.09, color: INK, align: "left", bold: true }),
      text(i, 0.42, 0.85, 0.48, t("Add a caption", "Thêm chú thích"), { font: "beVietnam", size: 0.035, color: "#5d5a55", align: "right" }),
    ]),
  }),
  design("before-after", "carousel", t("Before / after", "Trước / sau"), {
    themes: ["minimal"],
    slides: 1,
    background: { kind: "color", color: "#f4f1ec" },
    slots: [photo(0, 0, 0.04, 0.16, 0.45, 0.72), photo(1, 0, 0.51, 0.16, 0.45, 0.72)],
    texts: [
      text(0, 0.04, 0.06, 0.92, t("the glow up", "lột xác"), { font: "playfair", size: 0.08, color: INK, bold: true }),
      text(0, 0.04, 0.9, 0.45, t("BEFORE", "TRƯỚC"), { font: "spaceGrotesk", size: 0.035, color: INK, letterSpacing: 0.25 }),
      text(0, 0.51, 0.9, 0.45, t("AFTER", "SAU"), { font: "spaceGrotesk", size: 0.035, color: INK, letterSpacing: 0.25 }),
    ],
  }),

  // ── Seamless (one picture across the swipe) ─────────────────────────────
  design("panorama-title", "seamless", t("Panorama + title", "Panorama + tiêu đề"), {
    themes: ["travel"],
    group: "panorama",
    slides: 3,
    background: { kind: "photo", photo: 0 },
    slots: [],
    texts: [
      text(0, 0.08, 0.1, 0.84, t("Somewhere\nnew", "Một nơi\nmới"), { font: "playfair", size: 0.13, color: "#ffffff", align: "left", bold: true, lineHeight: 1 }),
      text(0, 0.08, 0.88, 0.84, t("SWIPE  →", "VUỐT  →"), { font: "spaceGrotesk", size: 0.032, color: "#ffffff", align: "left", letterSpacing: 0.3 }),
      text(2, 0.08, 0.88, 0.84, t("— the end", "— hết"), { font: "lora", size: 0.045, color: "#ffffff", align: "right" }),
    ],
  }),
  design("seamless-collage", "seamless", t("Seamless collage", "Collage liền mạch"), {
    themes: ["friends", "beach", "food"],
    group: "seamless",
    slides: 3,
    background: { kind: "color", color: "#efe9e1" },
    slots: [
      photo(0, 0, 0.08, 0.3, 0.62, 0.5, { shadow: true }),
      photo(1, 0, 0.78, 0.12, 0.5, 0.42, { shadow: true }),
      photo(2, 1, 0.42, 0.5, 0.56, 0.4, { shadow: true }),
      photo(3, 2, 0.12, 0.14, 0.54, 0.46, { shadow: true }),
      photo(4, 2, 0.38, 0.6, 0.52, 0.32, { shadow: true }),
    ],
    texts: [
      text(0, 0.08, 0.1, 0.6, t("a little\ncollection", "một chút\nkỷ niệm"), { font: "playfair", size: 0.085, color: INK, align: "left", bold: true, lineHeight: 1.05 }),
      text(1, 0.06, 0.18, 0.4, t("of good days", "của ngày đẹp"), { font: "dancing", size: 0.07, color: INK, align: "left" }),
    ],
  }),
  design("film-roll", "film", t("Film roll", "Cuộn phim"), {
    themes: ["mono", "city"],
    group: "seamless",
    slides: 3,
    background: { kind: "color", color: "#e9e4dc" },
    shapes: [{ slide: 0, x: 0, y: 0.24, w: 3, h: 0.52, shape: "film", fill: "#171717" }],
    slots: [0, 1, 2, 3, 4].map((i) => photo(i, 0, 0.12 + i * 0.58, 0.32, 0.5, 0.36)),
    texts: [
      text(0, 0.08, 0.08, 0.84, t("ROLL 01", "CUỘN 01"), { font: "spaceGrotesk", size: 0.05, color: INK, align: "left", bold: true, letterSpacing: 0.2 }),
      text(2, 0.08, 0.84, 0.84, t("shot on memories", "chụp bằng kỷ niệm"), { font: "lora", size: 0.045, color: INK, align: "right" }),
    ],
  }),
  design("scrapbook-wide", "scrapbook", t("Scrapbook", "Sổ tay"), {
    themes: ["friends", "couple"],
    group: "scrapbook",
    slides: 3,
    background: { kind: "color", color: "#f1e7d8" },
    slots: [
      photo(0, 0, 0.1, 0.1, 0.56, 0.42, { ...WHITE_FRAME, rotation: -6 }),
      photo(1, 0, 0.55, 0.45, 0.6, 0.44, { ...WHITE_FRAME, rotation: 5 }),
      photo(2, 1, 0.5, 0.08, 0.56, 0.42, { ...WHITE_FRAME, rotation: -3 }),
      photo(3, 2, 0.08, 0.3, 0.6, 0.46, { frame: "polaroid", shadow: true, rotation: 4 }),
    ],
    texts: [
      text(0, 0.1, 0.62, 0.42, t("little things", "những điều nhỏ"), { font: "dancing", size: 0.075, color: INK, align: "left", rotation: -4 }),
      text(1, 0.06, 0.7, 0.5, t("we laughed\nso much", "cười\nthật nhiều"), { font: "dancing", size: 0.07, color: INK, align: "left" }),
      text(2, 0.56, 0.12, 0.38, t("♡", "♡"), { font: "dancing", size: 0.14, color: "#b5524a" }),
    ],
  }),

  // ── Collage (one slide) ─────────────────────────────────────────────────
  design("mood-board", "collage", t("Mood board", "Mood board"), {
    themes: ["minimal", "fashion"],
    slides: 1,
    background: { kind: "color", color: "#f7f4ef" },
    slots: [
      photo(0, 0, 0.05, 0.14, 0.55, 0.42),
      photo(1, 0, 0.63, 0.14, 0.32, 0.25),
      photo(2, 0, 0.63, 0.41, 0.32, 0.33),
      photo(3, 0, 0.05, 0.58, 0.27, 0.36),
      photo(4, 0, 0.34, 0.58, 0.26, 0.36),
    ],
    texts: [
      text(0, 0.05, 0.04, 0.6, t("mood board", "mood board"), { font: "playfair", size: 0.07, color: INK, align: "left", bold: true }),
      text(0, 0.63, 0.78, 0.32, t("palette · texture\nlight · space", "màu · chất liệu\nánh sáng · khoảng trống"), { font: "spaceGrotesk", size: 0.026, color: "#6b6760", align: "left", lineHeight: 1.5 }),
    ],
  }),
  design("grid-caption", "collage", t("Grid with caption", "Lưới có chú thích"), {
    themes: ["food", "minimal"],
    group: "grid",
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [
      photo(0, 0, 0.05, 0.05, 0.44, 0.36),
      photo(1, 0, 0.51, 0.05, 0.44, 0.36),
      photo(2, 0, 0.05, 0.43, 0.44, 0.36),
      photo(3, 0, 0.51, 0.43, 0.44, 0.36),
    ],
    texts: [
      text(0, 0.05, 0.83, 0.9, t("Sunday, slowly", "Chủ nhật, thong thả"), { font: "lora", size: 0.06, color: INK, align: "left" }),
      text(0, 0.05, 0.92, 0.9, t("4 moments", "4 khoảnh khắc"), { font: "spaceGrotesk", size: 0.03, color: "#77736c", align: "left", letterSpacing: 0.15 }),
    ],
  }),
  design("polaroid-stack", "collage", t("Polaroid stack", "Chồng polaroid"), {
    themes: ["couple", "friends"],
    slides: 1,
    background: { kind: "gradient", from: "#f4e3d3", to: "#e4cfc9", angle: 160 },
    slots: [
      photo(0, 0, 0.1, 0.1, 0.5, 0.42, { frame: "polaroid", shadow: true, rotation: -8 }),
      photo(1, 0, 0.42, 0.22, 0.5, 0.42, { frame: "polaroid", shadow: true, rotation: 6 }),
      photo(2, 0, 0.2, 0.47, 0.5, 0.42, { frame: "polaroid", shadow: true, rotation: -2 }),
    ],
    texts: [text(0, 0.5, 0.86, 0.46, t("us, lately", "dạo này"), { font: "dancing", size: 0.08, color: INK, align: "right" })],
  }),

  // ── Story (9:16) ────────────────────────────────────────────────────────
  design("story-title", "story", t("Big title", "Tiêu đề lớn"), {
    themes: ["portrait"],
    format: "story",
    slides: 1,
    background: { kind: "color", color: "#f2ede5" },
    slots: [photo(0, 0, 0.07, 0.14, 0.86, 0.48)],
    texts: [
      text(0, 0.07, 0.64, 0.86, t("New\nchapter", "Chương\nmới"), { font: "playfair", size: 0.16, color: INK, align: "left", bold: true, lineHeight: 0.95 }),
      text(0, 0.07, 0.79, 0.86, t("read more on my feed", "xem thêm trên trang của mình"), { font: "beVietnam", size: 0.035, color: "#6b665f", align: "left" }),
    ],
  }),
  design("story-three", "story", t("Three frames", "Ba khung"), {
    themes: ["city", "nature"],
    format: "story",
    slides: 1,
    background: { kind: "color", color: "#1b1b1d" },
    slots: [photo(0, 0, 0.08, 0.14, 0.84, 0.2), photo(1, 0, 0.08, 0.355, 0.84, 0.2), photo(2, 0, 0.08, 0.57, 0.84, 0.2)],
    texts: [text(0, 0.08, 0.78, 0.84, t("today in 3", "hôm nay, 3 khung hình"), { font: "spaceGrotesk", size: 0.045, color: "#f0f0f0", align: "left", letterSpacing: 0.05 })],
  }),
  design("story-polaroid", "story", t("Polaroid", "Polaroid"), {
    events: ["summer"],
    themes: ["beach"],
    format: "story",
    slides: 1,
    background: { kind: "gradient", from: "#cfd9df", to: "#e2ebf0", angle: 180 },
    slots: [photo(0, 0, 0.14, 0.22, 0.72, 0.42, { frame: "polaroid", shadow: true, rotation: -4 })],
    texts: [text(0, 0.1, 0.7, 0.8, t("a moment worth keeping", "khoảnh khắc đáng giữ"), { font: "dancing", size: 0.085, color: INK })],
  }),
  design("story-quote", "story", t("Quote", "Trích dẫn"), {
    themes: ["portrait"],
    format: "story",
    slides: 1,
    background: { kind: "color", color: "#c9b79c" },
    slots: [photo(0, 0, 0.25, 0.16, 0.5, 0.28, { mask: "circle" })],
    texts: [
      text(0, 0.1, 0.5, 0.8, t("“Collect moments,\nnot things.”", "“Sưu tầm khoảnh khắc,\nđừng sưu tầm đồ vật.”"), { font: "lora", size: 0.07, color: "#2b241b", lineHeight: 1.3 }),
      text(0, 0.1, 0.72, 0.8, t("— note to self", "— tự nhắc mình"), { font: "spaceGrotesk", size: 0.034, color: "#4a4033", letterSpacing: 0.1 }),
    ],
  }),

  // ── Special occasions (M18) ─────────────────────────────────────────────
  design("birthday-story", "occasion", t("Birthday", "Sinh nhật"), {
    themes: ["party", "friends"],
    format: "story",
    slides: 1,
    background: { kind: "gradient", from: "#ffd6e0", to: "#fff1d6", angle: 180 },
    slots: [photo(0, 0, 0.16, 0.24, 0.68, 0.4, { frame: "polaroid", shadow: true, rotation: 3 })],
    texts: [
      text(0, 0.08, 0.14, 0.84, t("Happy birthday!", "Chúc mừng sinh nhật!"), { font: "dancing", size: 0.1, color: "#b03a5b" }),
      text(0, 0.1, 0.72, 0.8, t("another trip around the sun", "thêm một vòng quanh mặt trời"), { font: "beVietnam", size: 0.04, color: "#6b4a55" }),
    ],
  }),
  design("anniversary", "occasion", t("Anniversary", "Kỷ niệm"), {
    events: ["valentine"],
    themes: ["couple"],
    slides: 2,
    background: { kind: "color", color: "#f6efe6" },
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.62), photo(1, 1, 0.08, 0.08, 0.4, 0.4), photo(2, 1, 0.52, 0.08, 0.4, 0.4), photo(3, 1, 0.08, 0.52, 0.84, 0.4)],
    texts: [
      text(0, 0.08, 0.76, 0.84, t("One year of us", "Một năm bên nhau"), { font: "playfair", size: 0.075, color: INK, align: "left", bold: true }),
      text(0, 0.08, 0.86, 0.84, t("thank you for every day", "cảm ơn vì từng ngày"), { font: "lora", size: 0.038, color: "#5d564d", align: "left" }),
    ],
  }),

  // ── Minimal ─────────────────────────────────────────────────────────────
  design("gallery-border", "minimal", t("Gallery border", "Viền triển lãm"), {
    themes: ["minimal"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.12, 0.1, 0.76, 0.7)],
    texts: [text(0, 0.12, 0.85, 0.76, t("Untitled, 2026", "Không đề, 2026"), { font: "lora", size: 0.038, color: "#4c4a46", align: "left" })],
  }),
  design("arch", "minimal", t("Arch", "Mái vòm"), {
    themes: ["beach", "nature"],
    slides: 1,
    background: { kind: "color", color: "#ede6dc" },
    slots: [photo(0, 0, 0.18, 0.08, 0.64, 0.64, { mask: "arch" })],
    texts: [
      text(0, 0.1, 0.76, 0.8, t("golden hour", "giờ vàng"), { font: "playfair", size: 0.08, color: "#3b2f25", bold: true }),
      text(0, 0.1, 0.87, 0.8, t("06:12 PM", "18:12"), { font: "spaceGrotesk", size: 0.03, color: "#7a6c5d", letterSpacing: 0.3 }),
    ],
  }),
  design("circle-duo", "minimal", t("Circle duo", "Đôi tròn"), {
    themes: ["couple", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#e8ece6" },
    slots: [photo(0, 0, 0.08, 0.2, 0.46, 0.37, { mask: "circle" }), photo(1, 0, 0.46, 0.42, 0.46, 0.37, { mask: "circle" })],
    texts: [text(0, 0.08, 0.84, 0.84, t("you & me", "mình & cậu"), { font: "dancing", size: 0.09, color: "#2f3a2c" })],
  }),

  // ── Grid (one picture over the profile) ─────────────────────────────────
  design("grid-launch", "grid", t("Profile reveal", "Ra mắt trên profile"), {
    themes: ["nature"],
    format: "grid",
    group: "panorama",
    slides: "any",
    background: { kind: "photo", photo: 0 },
    slots: [],
    texts: [
      text(4, 0.08, 0.36, 0.84, t("NEW\nSEASON", "MÙA\nMỚI"), { font: "montserrat", size: 0.2, color: "#ffffff", bold: true, lineHeight: 0.95, letterSpacing: 0.04 }),
    ],
  }),
];
