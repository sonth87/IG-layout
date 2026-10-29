import type { Template } from "../types";
import { art, block, cells, design, icon, INK, KRAFT, photo, t, tape, text, WHITE_FRAME } from "./kit";

// Concerts, mirror selfies and outfits (2026-10-29): templates made for the owner's own sample
// photos (themes concert, mirror, ootd) — nights out, fit checks, city walks.

const NIGHT = "#0d0b1a";
const NEON = "#ff4fd8";
const P = 0.8;

export const MOMENTS: Template[] = [
  // ── Concerts ────────────────────────────────────────────────────────────
  design("concert-night", "story", t("Concert night", "Đêm concert"), {
    format: "story",
    themes: ["concert"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    widgets: [{ slide: 0, x: 0.1, y: 0.66, w: 0.8, kind: "nowPlaying", variant: "card", fields: { songTitle: t("Blinding Lights", "Blinding Lights"), artist: t("The Weeknd", "The Weeknd") } }],
    texts: [text(0, 0.04, 0.13, 0.92, t("concert\nnight", "đêm\nconcert"), { font: "anton", size: 0.13, color: INK, lineHeight: 1, cutout: { style: "neon", seed: 3, mess: 0.4, wave: 0.25 } })],
  }),
  design("concert-ticket", "scrapbook", t("Ticket stub", "Cuống vé"), {
    themes: ["concert"],
    slides: 1,
    background: { kind: "color", color: "#14121f" },
    shapes: [tape(0, 0.3, 0.07, -8, "#f2d39b"), tape(0, 0.74, 0.43, 6, "#f0c3cc")],
    slots: [photo(0, 0, 0.06, 0.08, 0.5, 0.6, { ...WHITE_FRAME, rotation: -4 }), photo(1, 0, 0.5, 0.36, 0.44, 0.54, { ...WHITE_FRAME, rotation: 5 })],
    texts: [
      text(0, 0.03, 0.78, 0.48, t("ADMIT\nONE", "VÉ VÀO\nCỬA"), { font: "anton", size: 0.065, color: INK, lineHeight: 1, align: "left", cutout: { style: "ticket", seed: 2, mess: 0.3, wave: 0.15 } }),
    ],
  }),
  design("concert-recap", "carousel", t("Live & loud", "Cháy hết mình"), {
    themes: ["concert"],
    slides: 3,
    background: { kind: "color", color: NIGHT },
    slots: [photo(0, 0, 0, 0, 1, 0.72), photo(1, 1, 0.06, 0.06, 0.43, 0.6), photo(2, 1, 0.51, 0.34, 0.43, 0.6)],
    texts: [
      text(0, 0.06, 0.76, 0.88, t("LIVE & LOUD", "CHÁY HẾT MÌNH"), { font: "anton", size: 0.1, color: "#ffffff", align: "left", letterSpacing: 0.04 }),
      text(0, 0.06, 0.9, 0.88, t("one night only · swipe for the setlist", "chỉ một đêm · vuốt xem setlist"), { font: "spaceGrotesk", size: 0.028, color: "#b9b4d6", align: "left", letterSpacing: 0.12 }),
      text(1, 0.06, 0.72, 0.4, t("lost my voice,\nworth it", "mất giọng,\nmà đáng"), { font: "patrickHand", size: 0.055, color: NEON, align: "left", lineHeight: 1.05 }),
      text(2, 0.1, 0.08, 0.8, t("SETLIST", "SETLIST"), { font: "anton", size: 0.09, color: NEON, align: "left", letterSpacing: 0.08 }),
      // The owner's photos are from a The Weeknd show (2026-10-29).
      ...["01  Starboy", "02  The Hills", "03  Save Your Tears", "04  Die For You", "05  Blinding Lights ♡"].map((name) => t(name, name)).map((w, i) =>
        text(2, 0.1, 0.24 + i * 0.1, 0.8, w, { font: "spaceGrotesk", size: 0.042, color: "#ffffff", align: "left" }),
      ),
      text(2, 0.1, 0.84, 0.8, t("best night of the year", "đêm vui nhất năm"), { font: "greatVibes", size: 0.08, color: "#ffffff", align: "left" }),
    ],
  }),
  design("concert-film", "film", t("Concert on film", "Concert trên phim"), {
    themes: ["concert"],
    slides: 1,
    background: { kind: "color", color: "#0e0e10" },
    art: [art("gen-film/film-17", 0, 0.3, 0.02, 0.4, { rotation: -2 })],
    slots: [],
    texts: [
      text(0, 0.04, 0.4, 0.26, t("ROLL\n07", "CUỘN\n07"), { font: "anton", size: 0.07, color: "#ffffff", align: "left", lineHeight: 0.95 }),
      text(0, 0.72, 0.42, 0.26, t("ISO 3200\nno flash", "ISO 3200\nkhông flash"), { font: "spaceGrotesk", size: 0.026, color: "#e8a33d", align: "left", letterSpacing: 0.1 }),
    ],
  }),
  design("concert-countdown", "story", t("Show day", "Ngày đi show"), {
    format: "story",
    themes: ["concert"],
    slides: 1,
    background: { kind: "gradient", from: "#1a0b3d", to: "#ff4fd8", angle: 160 },
    slots: [photo(0, 0, 0.14, 0.14, 0.72, 0.42, { mask: "rounded", cornerRadius: 0.05, border: { width: 0.012, color: "#ffffff" } })],
    widgets: [{ slide: 0, x: 0.16, y: 0.6, w: 0.68, kind: "countdown", variant: "flip", fields: { title: t("Show day", "Ngày đi show"), count: t("3", "3"), unit: t("days to go", "ngày nữa") } }],
  }),
  design("concert-torn", "torn", t("Torn concert", "Concert ảnh xé"), {
    themes: ["concert"],
    slides: 1,
    background: { kind: "color", color: "#1b1820" },
    art: [art("gen-torn-collage/torn-collage-4", 0, 0.12, 0.01, 0.76)],
    slots: [],
    texts: [text(0, 0.06, 0.88, 0.88, t("still ringing in my ears", "tai vẫn còn ù"), { font: "patrickHand", size: 0.05, color: "#ffffff" })],
  }),

  // ── Mirror selfies ──────────────────────────────────────────────────────
  design("mirror-fit-check", "story", t("Fit check", "Fit check"), {
    format: "story",
    themes: ["mirror"],
    slides: 1,
    background: { kind: "color", color: "#efe6da" },
    slots: [photo(0, 0, 0.12, 0.22, 0.76, 0.56, { mask: "arch", border: { width: 0.014, color: "#ffffff" }, shadow: true })],
    texts: [
      text(0, 0.04, 0.12, 0.92, t("fit check", "fit check"), { font: "anton", size: 0.12, color: INK, cutout: { style: "classic", seed: 4, mess: 0.35, wave: 0.15 } }),
      text(0, 0.1, 0.8, 0.8, t("rate it 1–10 ↓", "chấm điểm 1–10 ↓"), { font: "beVietnam", size: 0.04, color: INK, bold: true }),
    ],
  }),
  design("mirror-duo", "love", t("Mirror, us", "Gương và tụi mình"), {
    themes: ["mirror"],
    slides: 1,
    background: { kind: "color", color: "#f6e9e4" },
    slots: [photo(0, 0, 0.05, 0.12, 0.44, 0.62, { ...WHITE_FRAME, rotation: -3 }), photo(1, 0, 0.51, 0.18, 0.44, 0.62, { ...WHITE_FRAME, rotation: 3 })],
    icons: [icon("doodle-hearts", 0, 0.4, 0.04, 0.2, { color: "#c2304b" }), icon("doodle-heart", 0, 0.82, 0.82, 0.1, { color: "#c2304b" })],
    texts: [text(0, 0.06, 0.84, 0.7, t("same mirror, same us", "chiếc gương cũ, vẫn tụi mình"), { font: "greatVibes", size: 0.065, color: "#c2304b", align: "left" })],
  }),
  design("mirror-digicam", "retro", t("Mirror digicam", "Gương & máy ảnh số"), {
    themes: ["mirror"],
    slides: 1,
    background: { kind: "color", color: "#d9dde3" },
    art: [art("gen-camera/camera-7", 0, 0.22, 0.04, 0.56, { rotation: -3 })],
    slots: [],
    texts: [text(0, 0.06, 0.88, 0.88, t("outfit of the day, 2004 edition", "outfit hôm nay, bản 2004"), { font: "spaceGrotesk", size: 0.032, color: "#25406b", letterSpacing: 0.06 })],
  }),

  // ── Outfits ─────────────────────────────────────────────────────────────
  design("ootd-cover", "editorial", t("OOTD cover", "Bìa OOTD"), {
    format: "story",
    themes: ["ootd"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    icons: [icon("doodle-arrowCurve", 0, 0.66, 0.42, 0.18, { color: "#ffffff", rotation: 160 }), icon("doodle-arrowStraight", 0, 0.1, 0.64, 0.16, { color: "#ffffff", rotation: 20 })],
    texts: [
      text(0, 0.04, 0.12, 0.92, t("OOTD", "OOTD"), { font: "playfair", size: 0.3, color: "#ffffff", bold: true, shadow: true }),
      text(0, 0.62, 0.36, 0.34, t("striped knit", "áo len sọc"), { font: "patrickHand", size: 0.045, color: "#ffffff", shadow: true }),
      text(0, 0.06, 0.6, 0.34, t("comfy bag", "túi đeo chéo"), { font: "patrickHand", size: 0.045, color: "#ffffff", shadow: true }),
      text(0, 0.06, 0.78, 0.6, t("ISSUE 29 · CITY WALKS", "SỐ 29 · DẠO PHỐ"), { font: "spaceGrotesk", size: 0.03, color: "#ffffff", align: "left", letterSpacing: 0.2, shadow: true }),
    ],
  }),
  design("ootd-lookbook", "carousel", t("Week of outfits", "Một tuần outfit"), {
    themes: ["ootd"],
    slides: 4,
    background: { kind: "color", color: "#f7f4ef" },
    slots: [0, 1, 2, 3].map((s) => photo(s, s, 0.1, 0.12, 0.8, 0.72, { mask: "rounded", cornerRadius: 0.03 })),
    texts: [0, 1, 2, 3].flatMap((s) => [
      text(s, 0.1, 0.04, 0.6, [t("MON", "THỨ 2"), t("WED", "THỨ 4"), t("FRI", "THỨ 6"), t("SUN", "CHỦ NHẬT")][s], { font: "anton", size: 0.06, color: INK, align: "left", letterSpacing: 0.08 }),
      text(s, 0.1, 0.87, 0.8, [t("coffee run", "đi cà phê"), t("museum day", "đi bảo tàng"), t("mall & dinner", "đi mall & ăn tối"), t("lazy stroll", "đi dạo lười")][s], { font: "cormorant", size: 0.05, color: INK, align: "left", italic: true }),
    ]),
  }),
  design("ootd-grid", "grid", t("Outfit grid", "Lưới outfit"), {
    format: "grid",
    themes: ["ootd"],
    slides: 9,
    shapes: [1, 3, 5, 7].map((s, i) => block(s, 0, 0, 1, 1, i % 2 ? "#1d1c1a" : "#f6e7c1")),
    slots: [0, 2, 4, 6, 8].map((s, i) => photo(i, s, 0, 0, 1, 1)),
    texts: [1, 3, 5, 7].map((s, i) =>
      text(s, 0.06, 0.4, 0.88, [t("fit", "fit"), t("of", "của"), t("the", "hôm"), t("day", "nay")][i], { font: "playfair", size: 0.22, color: i % 2 ? "#f6e7c1" : INK, italic: true, bold: true }),
    ),
  }),
  design("ootd-polaroids", "scrapbook", t("Outfit polaroids", "Polaroid outfit"), {
    themes: ["ootd"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    shapes: [tape(0, 0.28, 0.05, -6), tape(0, 0.74, 0.1, 7), tape(0, 0.3, 0.5, 5), tape(0, 0.72, 0.54, -4)],
    slots: [
      photo(0, 0, 0.05, 0.06, 0.42, 0.42, { frame: "polaroid", shadow: true, rotation: -4 }),
      photo(1, 0, 0.53, 0.1, 0.42, 0.42, { frame: "polaroid", shadow: true, rotation: 3 }),
      photo(2, 0, 0.07, 0.51, 0.42, 0.42, { frame: "polaroid", shadow: true, rotation: 2 }),
      photo(3, 0, 0.51, 0.55, 0.42, 0.42, { frame: "polaroid", shadow: true, rotation: -3 }),
    ],
  }),
  design("ootd-cutout", "cutout", t("Outfit of the day", "Outfit hôm nay"), {
    themes: ["ootd"],
    slides: 1,
    background: { kind: "color", color: "#f2efe8" },
    slots: [photo(0, 0, 0.14, 0.26, 0.72, 0.68, { shadow: true })],
    texts: [text(0, 0.04, 0.03, 0.92, t("outfit of\nthe day", "outfit\nhôm nay"), { font: "anton", size: 0.1, color: INK, lineHeight: 1, cutout: { style: "classic", seed: 7, mess: 0.35, wave: 0.15 } })],
  }),
  design("ootd-stairs", "story", t("Two takes", "Hai kiểu tạo dáng"), {
    format: "story",
    themes: ["ootd"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.04, 0.13, 0.56, 0.4), photo(1, 0, 0.4, 0.45, 0.56, 0.4)],
    texts: [
      text(0, 0.64, 0.2, 0.32, t("take 1", "kiểu 1"), { font: "patrickHand", size: 0.06, color: INK, align: "left" }),
      text(0, 0.04, 0.72, 0.32, t("take 2", "kiểu 2"), { font: "patrickHand", size: 0.06, color: INK, align: "right" }),
    ],
  }),
  design("ootd-city-girl", "teen", t("City girl", "Cô gái thành phố"), {
    themes: ["ootd"],
    slides: 1,
    background: { kind: "color", color: "#ffe1ee" },
    slots: [photo(0, 0, 0.18, 0.14, 0.64, 0.66, { mask: "arch", border: { width: 0.014, color: "#ffffff" } })],
    icons: [icon("doodle-starFilled", 0, 0.06, 0.08, 0.12, { color: "#ffcc4d" }), icon("sparkle", 0, 0.82, 0.18, 0.1, { color: "#ff5c93" }), icon("heart", 0, 0.08, 0.66, 0.12, { color: "#ff5c93" })],
    texts: [text(0, 0.04, 0.83, 0.92, t("city girl era", "kỷ nguyên cô gái thành phố"), { font: "patrickHand", size: 0.06, color: "#ff5c93" })],
  }),
  design("ootd-gallery", "minimal", t("On display", "Trưng bày"), {
    themes: ["ootd"],
    slides: 1,
    background: { kind: "color", color: "#f1eee8" },
    art: [art("gen-picture-frames/picture-frame-8", 0, 0.2, 0.06, 0.6)],
    slots: [],
    texts: [
      text(0, 0.22, 0.84, 0.56, t("Untitled (me), 2026", "Không tên (tôi), 2026"), { font: "cormorant", size: 0.045, color: INK, italic: true, align: "left" }),
      text(0, 0.22, 0.9, 0.56, t("knit, denim, a good mood", "len, jean, tâm trạng tốt"), { font: "spaceGrotesk", size: 0.024, color: "#8a8378", align: "left", letterSpacing: 0.1 }),
    ],
  }),
  design("ootd-seamless", "seamless", t("Outfit panorama", "Outfit liền mạch"), {
    themes: ["ootd"],
    group: "seamless",
    slides: 3,
    background: { kind: "color", color: "#f4efe6" },
    shapes: [block(0, 0.6, 0.12, 1.8, 0.76, "#e8d5c4")],
    slots: [photo(0, 0, 0.08, 0.1, 0.62, 0.8, { shadow: true }), photo(1, 0, 0.82, 0.2, 0.56, 0.7, { shadow: true, rotation: 3 }), photo(2, 1, 0.58, 0.06, 0.56, 0.7, { shadow: true, rotation: -3 }), photo(3, 2, 0.3, 0.16, 0.62, 0.78, { shadow: true })],
    texts: [text(1, 0.06, 0.82, 0.5, t("swipe the look →", "vuốt xem trọn bộ →"), { font: "spaceGrotesk", size: 0.032, color: INK, align: "left", letterSpacing: 0.12 })],
  }),
  design("ootd-notes", "doodle", t("Outfit notes", "Ghi chú outfit"), {
    themes: ["ootd"],
    slides: 1,
    background: { kind: "color", color: "#fbf9f4" },
    slots: [photo(0, 0, 0.2, 0.1, 0.6, 0.8, { shadow: true, rotation: 2 })],
    icons: [icon("doodle-arrowCurve", 0, 0.02, 0.28, 0.2, { color: "#e0402f", rotation: -10 }), icon("doodle-arrowCurve", 0, 0.78, 0.6, 0.2, { color: "#e0402f", rotation: 170 }), icon("doodle-circle", 0, 0.6, 0.48, 0.24, { color: "#e0402f" })],
    texts: [
      text(0, 0.02, 0.18, 0.26, t("glasses\non ✓", "kính\nđủ ✓"), { font: "patrickHand", size: 0.045, color: "#e0402f", lineHeight: 1.05 }),
      text(0, 0.74, 0.8, 0.26, t("the bag\ngoes with\neverything", "túi này\nhợp với\nmọi thứ"), { font: "patrickHand", size: 0.04, color: "#e0402f", lineHeight: 1.05 }),
    ],
  }),
  design("ootd-city-diary", "travel", t("City diary", "Nhật ký thành phố"), {
    themes: ["ootd"],
    slides: 2,
    background: { kind: "color", color: "#efe6d6" },
    art: [art("gen-stamps/stamp-6", 0, 0.58, 0.58, 0.36, { rotation: 6, photo: 1 }), art("vintage-maps-compass/compass-rose-1595", 1, 0.66, 0.68, 0.28)],
    slots: [photo(0, 0, 0.06, 0.06, 0.56, 0.7, WHITE_FRAME), ...cells(2, 1, [0.06, 0.06, 0.88, 0.6], 3, 1, 0.025, P)],
    texts: [
      text(0, 0.06, 0.82, 0.5, t("city diary,\nday 03", "nhật ký\nthành phố, ngày 3"), { font: "patrickHand", size: 0.05, color: INK, align: "left", lineHeight: 1.05 }),
      text(1, 0.06, 0.72, 0.6, t("malls, museums &\none giant pink elephant", "mall, bảo tàng &\nmột chú voi hồng khổng lồ"), { font: "cormorant", size: 0.05, color: INK, align: "left", italic: true, lineHeight: 1.05 }),
    ],
  }),
];
