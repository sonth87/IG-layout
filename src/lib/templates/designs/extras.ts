import type { Template } from "../types";
import { art, design, INK, photo, t, text } from "./kit";

// Templates with card widgets (now playing, weather, boarding pass…) and more film,
// stamp and story looks (2026-10-28).

const PILL = { color: "#ffffff", padding: 0.45, radius: 0.6 };

export const EXTRAS: Template[] = [
  design("on-repeat", "teen", t("On repeat", "Nghe mãi không chán"), {
    format: "story",
    themes: ["portrait", "retro"],
    slides: 1,
    background: { kind: "color", color: "#1c1c1e" },
    slots: [photo(0, 0, 0.08, 0.15, 0.84, 0.46, { mask: "rounded", cornerRadius: 0.05 })],
    widgets: [{ slide: 0, x: 0.12, y: 0.63, w: 0.76, kind: "nowPlaying", variant: "card" }],
    texts: [text(0, 0.08, 0.77, 0.84, t("song of the week", "bài hát của tuần"), { font: "patrickHand", size: 0.05, color: "#ffffff" })],
  }),
  design("sunny-day", "travel", t("Sunny day", "Ngày nắng"), {
    format: "story",
    themes: ["beach", "travel"],
    events: ["summer"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    widgets: [{ slide: 0, x: 0.1, y: 0.15, w: 0.5, kind: "weather", variant: "glass" }],
    texts: [text(0, 0.08, 0.74, 0.84, t("perfect beach weather", "thời tiết đi biển"), { font: "greatVibes", size: 0.1, color: "#ffffff", shadow: true })],
  }),
  design("trip-ticket", "travel", t("Trip ticket", "Vé chuyến đi"), {
    themes: ["travel", "city"],
    slides: 1,
    background: { kind: "color", color: "#e8eef4" },
    slots: [photo(0, 0, 0.06, 0.06, 0.88, 0.56, { mask: "rounded", cornerRadius: 0.04 })],
    widgets: [{ slide: 0, x: 0.08, y: 0.62, w: 0.84, kind: "boardingPass" }],
  }),
  design("dated", "film", t("Date stamp", "Dấu ngày"), {
    themes: ["portrait", "beach", "retro"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    widgets: [{ slide: 0, x: 0.6, y: 0.86, w: 0.34, kind: "calendarDate", variant: "filmStamp" }],
  }),
  design("exif", "film", t("Camera settings", "Thông số máy"), {
    themes: ["city", "nature", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#111111" },
    slots: [photo(0, 0, 0.06, 0.06, 0.88, 0.7)],
    widgets: [{ slide: 0, x: 0.06, y: 0.8, w: 0.88, kind: "filmExif", variant: "strip" }],
  }),
  design("hashtags", "teen", t("Hashtags", "Hashtag"), {
    themes: ["friends", "food", "beach"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    widgets: [{ slide: 0, x: 0.08, y: 0.8, w: 0.7, kind: "hashtagPill" }],
  }),
  design("big-frame", "film", t("Frame 24", "Khung 24"), {
    themes: ["city", "portrait", "beach"],
    slides: 1,
    background: { kind: "color", color: "#ece8e1" },
    art: [art("gen-film/film-7", 0, 0.06, 0.1, 0.88)],
    slots: [],
    texts: [text(0, 0.06, 0.82, 0.88, t("FRAME 24  ·  ISO 400", "KHUNG 24  ·  ISO 400"), { font: "spaceGrotesk", size: 0.03, color: INK, letterSpacing: 0.25 })],
  }),
  design("stamp-stack", "retro", t("Stamp stack", "Chồng tem"), {
    format: "story",
    themes: ["travel", "nature"],
    slides: 1,
    background: { kind: "color", color: "#e9e1d2" },
    art: [
      art("gen-stamps/stamp-7", 0, 0.1, 0.13, 0.42, { rotation: -6 }),
      art("gen-stamps/stamp-12", 0, 0.48, 0.3, 0.42, { photo: 1, rotation: 5 }),
      art("gen-stamps/stamp-23", 0, 0.16, 0.47, 0.42, { photo: 2, rotation: -2 }),
    ],
    slots: [],
    texts: [text(0, 0.08, 0.77, 0.84, t("collected along the way", "góp nhặt dọc đường"), { font: "cormorant", size: 0.055, color: INK })],
  }),
  design("film-column", "film", t("Film column", "Cột phim"), {
    themes: ["travel", "friends", "city"],
    slides: 1,
    background: { kind: "color", color: "#f2ede5" },
    art: [art("gen-film/film-4", 0, 0.62, 0.04, 0.2, { rotation: 3 })],
    slots: [photo(4, 0, 0.06, 0.08, 0.5, 0.62, { shadow: true })],
    texts: [text(0, 0.06, 0.76, 0.5, t("rolls from\nthe weekend", "phim của\ncuối tuần"), { font: "cormorant", size: 0.07, color: INK, align: "left", bold: true, lineHeight: 1 })],
  }),
  design("black-instants", "film", t("Black instants", "Ảnh lấy liền đen"), {
    themes: ["mono", "friends", "city"],
    slides: 1,
    background: { kind: "color", color: "#d8d4cc" },
    art: [art("gen-instant/instant-16", 0, 0.06, 0.08, 0.46, { rotation: -5 }), art("gen-instant/instant-21", 0, 0.48, 0.38, 0.46, { photo: 1, rotation: 4 })],
    slots: [],
    texts: [text(0, 0.6, 0.12, 0.34, t("after hours", "sau giờ làm"), { font: "patrickHand", size: 0.055, color: INK, align: "left" })],
  }),
  design("torn-backed-story", "torn", t("Torn snapshot", "Ảnh xé nền giấy"), {
    format: "story",
    themes: ["nature", "travel", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#e3ddd2" },
    art: [art("gen-torn-backed/torn-backed-14", 0, 0.08, 0.15, 0.84, { rotation: -2 })],
    slots: [],
    texts: [text(0, 0.08, 0.75, 0.84, t("keep this one", "giữ tấm này nhé"), { font: "patrickHand", size: 0.065, color: INK })],
  }),
  design("on-our-way", "travel", t("On our way", "Đang trên đường"), {
    format: "story",
    themes: ["travel", "city", "portrait"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 0.5), photo(1, 0, 0, 0.505, 1, 0.495)],
    texts: [
      text(0, 0.06, 0.15, 0.6, t("on our way to", "đang trên đường tới"), { font: "beVietnam", size: 0.032, color: INK, align: "left", background: PILL }),
      text(0, 0.06, 0.2, 0.5, t("📍 Barcelona", "📍 Đà Lạt"), { font: "beVietnam", size: 0.04, color: INK, align: "left", bold: true, background: PILL }),
      text(0, 0.5, 0.75, 0.44, t("📍 day one", "📍 ngày đầu"), { font: "beVietnam", size: 0.036, color: INK, align: "right", bold: true, background: PILL }),
    ],
  }),
];
