import type { Template } from "../types";
import { art, block, design, icon, INK, KRAFT, photo, t, text } from "./kit";

// Retro & vintage (2026-10-28): postage stamps, film strips from the frame packs, photo
// albums, museum frames, 70s colours and diner signs.

const MUSTARD = "#e3a72f";
const RUST = "#c4572b";
const BROWN = "#5b3a24";

export const RETRO: Template[] = [
  design("retro-digicam-2004", "retro", t("Digicam 2004", "Máy ảnh số 2004"), {
    themes: ["friends", "party", "retro"],
    slides: 2,
    background: { kind: "color", color: "#cfd8e3" },
    art: [art("gen-camera/camera-3", 0, 0.04, 0.22, 0.92, { rotation: -2 }), art("gen-camera/camera-24", 1, 0.2, 0.06, 0.6, { rotation: 3, photo: 1 })],
    slots: [],
    texts: [
      text(0, 0.06, 0.06, 0.88, t("found on an old SD card", "tìm thấy trong thẻ nhớ cũ"), { font: "spaceGrotesk", size: 0.034, color: "#25406b", align: "left", letterSpacing: 0.08 }),
      text(1, 0.06, 0.88, 0.88, t("DSC_0042.JPG", "DSC_0042.JPG"), { font: "spaceGrotesk", size: 0.034, color: "#25406b", letterSpacing: 0.15 }),
    ],
  }),
  design("retro-70s-bands", "retro", t("70s bands", "Sọc thập niên 70"), {
    themes: ["retro", "beach", "fashion"],
    slides: 1,
    background: { kind: "color", color: "#f4e6cc" },
    shapes: [block(0, 0, 0.7, 1, 0.06, MUSTARD), block(0, 0, 0.76, 1, 0.06, RUST), block(0, 0, 0.82, 1, 0.06, BROWN)],
    slots: [photo(0, 0, 0.14, 0.08, 0.72, 0.56, { mask: "rounded", cornerRadius: 0.2 })],
    texts: [text(0, 0.06, 0.9, 0.88, t("groovy days", "những ngày groovy"), { font: "playfair", size: 0.055, color: BROWN, bold: true, italic: true })],
  }),
  design("retro-tv", "retro", t("Old TV", "TV đời cũ"), {
    themes: ["retro", "kids", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#e9dcc6" },
    shapes: [block(0, 0.08, 0.16, 0.84, 0.66, BROWN, { shape: "roundRect" }), block(0, 0.68, 0.24, 0.18, 0.5, "#3b2716", { shape: "roundRect" })],
    slots: [photo(0, 0, 0.13, 0.21, 0.52, 0.56, { mask: "rounded", cornerRadius: 0.06 })],
    icons: [icon("circle", 0, 0.73, 0.3, 0.08, { color: MUSTARD }), icon("circle", 0, 0.73, 0.42, 0.08, { color: MUSTARD })],
    texts: [
      text(0, 0.08, 0.05, 0.84, t("now showing", "đang chiếu"), { font: "patrickHand", size: 0.06, color: BROWN }),
      text(0, 0.08, 0.86, 0.84, t("channel 7 · family hour", "kênh 7 · giờ gia đình"), { font: "spaceGrotesk", size: 0.03, color: BROWN, letterSpacing: 0.15 }),
    ],
  }),
  design("retro-cassette", "retro", t("Mixtape", "Băng cát-xét"), {
    format: "story",
    themes: ["retro", "friends", "couple"],
    slides: 1,
    background: { kind: "color", color: "#f2d7b6" },
    slots: [photo(0, 0, 0.1, 0.14, 0.8, 0.42, { shadow: true, rotation: -2 })],
    widgets: [{ slide: 0, x: 0.12, y: 0.6, w: 0.76, kind: "nowPlaying", variant: "cassette", fields: { songTitle: t("Summer mixtape", "Băng mùa hè"), artist: t("side A", "mặt A") } }],
  }),
  design("retro-diner", "retro", t("Diner", "Quán ăn kiểu Mỹ"), {
    themes: ["food", "retro", "friends"],
    slides: 1,
    background: { kind: "color", color: "#fbf3e4" },
    shapes: [...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => block(0, i * 0.125, 0, 0.0625, 0.1, "#d6453d")), block(0, 0, 0.1, 1, 0.012, "#d6453d")],
    slots: [photo(0, 0, 0.08, 0.18, 0.5, 0.5, { mask: "circle", border: { width: 0.012, color: "#d6453d" } }), photo(1, 0, 0.52, 0.44, 0.4, 0.46, { border: { width: 0.015, color: "#ffffff" }, shadow: true, rotation: 4 })],
    texts: [
      text(0, 0.56, 0.18, 0.4, t("milkshakes\n& fries", "sữa lắc\n& khoai chiên"), { font: "playfair", size: 0.065, color: "#d6453d", align: "left", bold: true, italic: true, lineHeight: 1 }),
      text(0, 0.06, 0.86, 0.5, t("OPEN 24/7", "MỞ CỬA 24/7"), { font: "anton", size: 0.05, color: "#2f6b8f", align: "left", letterSpacing: 0.1 }),
    ],
  }),
  design("retro-slide-mount", "retro", t("Slide mounts", "Khung phim dương bản"), {
    themes: ["retro", "travel", "nature"],
    slides: 1,
    background: { kind: "color", color: "#2d2a26" },
    shapes: [0, 1, 2, 3].map((i) => block(0, 0.08 + (i % 2) * 0.44, 0.1 + Math.floor(i / 2) * 0.42, 0.4, 0.38, "#f1ece0", { shape: "roundRect" })),
    slots: [0, 1, 2, 3].map((i) => photo(i, 0, 0.13 + (i % 2) * 0.44, 0.15 + Math.floor(i / 2) * 0.42, 0.3, 0.24)),
    texts: [0, 1, 2, 3].map((i) => text(0, 0.1 + (i % 2) * 0.44, 0.41 + Math.floor(i / 2) * 0.42, 0.36, t(`KODA · 0${i + 1}`, `PHIM · 0${i + 1}`), { font: "spaceGrotesk", size: 0.022, color: "#6b6357", letterSpacing: 0.2 })),
  }),
  design("stamp-collection", "retro", t("Stamp collection", "Bộ sưu tập tem"), {
    themes: ["travel", "nature", "city"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    art: [
      art("gen-stamps/stamp-1", 0, 0.05, 0.06, 0.46, { rotation: -4 }),
      art("gen-stamps/stamp-8", 0, 0.52, 0.1, 0.42, { photo: 1, rotation: 5 }),
      art("gen-stamps/stamp-13", 0, 0.08, 0.5, 0.42, { photo: 2, rotation: 3 }),
      art("gen-stamps/stamp-20", 0, 0.5, 0.56, 0.46, { photo: 3, rotation: -3 }),
    ],
    slots: [],
    texts: [text(0, 0.06, 0.9, 0.88, t("SENT FROM SOMEWHERE NICE", "GỬI TỪ MỘT NƠI THẬT ĐẸP"), { font: "spaceGrotesk", size: 0.026, color: BROWN, letterSpacing: 0.25 })],
  }),
  design("clipped-stamp", "retro", t("Clipped stamp", "Tem kẹp giấy"), {
    format: "story",
    themes: ["beach", "travel"],
    slides: 1,
    background: { kind: "color", color: "#232323" },
    art: [art("gen-stamps/stamp-19", 0, 0.1, 0.17, 0.8, { rotation: -2 })],
    slots: [],
    icons: [icon("clip", 0, 0.2, 0.13, 0.1, { color: "#c9c9c9", rotation: -6 })],
    texts: [text(0, 0.1, 0.74, 0.8, t("postmarked: summer", "dấu bưu điện: mùa hè"), { font: "cormorant", size: 0.06, color: "#efe8dc" })],
  }),
  design("groovy", "retro", t("Groovy", "Groovy"), {
    themes: ["retro", "portrait", "beach"],
    events: ["summer"],
    slides: 1,
    background: { kind: "color", color: "#f4e3c3" },
    shapes: [block(0, 0, 0.62, 1, 0.07, MUSTARD), block(0, 0, 0.69, 1, 0.07, RUST), block(0, 0, 0.76, 1, 0.07, BROWN)],
    slots: [photo(0, 0, 0.2, 0.06, 0.6, 0.66, { mask: "arch" })],
    texts: [text(0, 0.06, 0.85, 0.88, t("stay groovy", "cứ chill thôi"), { font: "playfair", size: 0.09, color: BROWN, bold: true })],
  }),
  design("film-pair", "retro", t("Two rolls", "Hai cuộn phim"), {
    format: "story",
    themes: ["city", "travel", "beach"],
    slides: 1,
    background: { kind: "color", color: "#101010" },
    art: [art("gen-film/film-1", 0, 0.06, 0.12, 0.42, { rotation: -2 }), art("gen-film/film-13", 0, 0.55, 0.15, 0.36, { photo: 3, rotation: 2 })],
    slots: [],
  }),
  design("summer-79", "retro", t("Summer '79", "Hè '79"), {
    themes: ["beach", "retro", "travel"],
    events: ["summer"],
    slides: 1,
    background: { kind: "color", color: "#efe2cd" },
    art: [art("gen-film/film-11", 0, 0, 0.38, 1)],
    slots: [],
    texts: [
      text(0, 0.06, 0.1, 0.88, t("SUMMER '79", "HÈ '79"), { font: "anton", size: 0.15, color: RUST, align: "left" }),
      text(0, 0.06, 0.74, 0.88, t("found in a shoebox", "tìm thấy trong hộp giày"), { font: "cormorant", size: 0.06, color: BROWN, align: "left" }),
    ],
  }),
  design("family-album", "retro", t("Family album", "Album gia đình"), {
    themes: ["kids", "mono", "nature"],
    events: ["mothersDay", "childrensDay"],
    slides: 2,
    background: { kind: "color", color: "#e9dfcc" },
    art: [art("gen-album/album-2", 0, 0.06, 0.06, 0.5, { rotation: -3 }), art("gen-album/album-1", 0, 0.38, 0.5, 0.56, { photo: 1, rotation: 3 }), art("gen-album/album-6", 1, 0.06, 0.1, 0.88, { photo: 2 })],
    slots: [],
    texts: [
      text(0, 0.6, 0.12, 0.34, t("family\nalbum", "album\ngia đình"), { font: "cormorant", size: 0.075, color: BROWN, align: "left", bold: true, lineHeight: 1 }),
      text(1, 0.06, 0.84, 0.88, t("the good old days", "ngày xưa ấy"), { font: "greatVibes", size: 0.09, color: BROWN }),
    ],
  }),
  design("instant-trio", "retro", t("Instant trio", "Ba ảnh lấy liền"), {
    themes: ["friends", "beach", "food"],
    slides: 1,
    background: { kind: "color", color: "#e8eef0" },
    art: [
      art("gen-instant/instant-2", 0, 0.04, 0.06, 0.44, { rotation: -6 }),
      art("gen-instant/instant-9", 0, 0.52, 0.12, 0.44, { photo: 1, rotation: 5 }),
      art("gen-instant/instant-6", 0, 0.26, 0.44, 0.46, { photo: 2, rotation: -2 }),
    ],
    slots: [],
  }),
  design("museum-piece", "retro", t("Museum piece", "Tác phẩm bảo tàng"), {
    themes: ["portrait", "fashion"],
    slides: 1,
    background: { kind: "color", color: "#2c3e33" },
    art: [art("gilded-frames/gilded-louis-xv-regency", 0, 0.14, 0.06, 0.72)],
    slots: [],
    shapes: [block(0, 0.3, 0.84, 0.4, 0.09, "#f3efe6")],
    texts: [
      text(0, 0.3, 0.852, 0.4, t("Portrait of a friend", "Chân dung một người bạn"), { font: "cormorant", size: 0.03, color: INK, bold: true }),
      text(0, 0.3, 0.885, 0.4, t("oil on phone, 2026", "sơn dầu trên điện thoại, 2026"), { font: "cormorant", size: 0.022, color: "#6b6357" }),
    ],
  }),
  design("diner", "retro", t("Open 24h", "Mở cửa 24h"), {
    themes: ["retro", "food", "city"],
    slides: 2,
    background: { kind: "color", color: "#fdf5e6" },
    shapes: [block(0, 0, 0, 1, 0.16, "#d62f2f"), block(1, 0, 0.84, 1, 0.16, "#2a9d8f")],
    slots: [photo(0, 0, 0.06, 0.22, 0.88, 0.72, { mask: "rounded", cornerRadius: 0.04 }), photo(1, 1, 0.06, 0.06, 0.43, 0.74, { mask: "rounded", cornerRadius: 0.04 }), photo(2, 1, 0.51, 0.06, 0.43, 0.74, { mask: "rounded", cornerRadius: 0.04 })],
    texts: [
      text(0, 0.06, 0.035, 0.88, t("OPEN 24H", "MỞ CỬA 24H"), { font: "anton", size: 0.1, color: "#fdf5e6", letterSpacing: 0.06 }),
      text(1, 0.06, 0.875, 0.88, t("milkshakes & late talks", "sữa lắc & chuyện khuya"), { font: "greatVibes", size: 0.07, color: "#fdf5e6" }),
    ],
  }),
  design("oval-portrait", "retro", t("Oval portrait", "Chân dung bầu dục"), {
    format: "story",
    themes: ["mono", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#d9cdb8" },
    art: [art("vintage-photo-mounts/mount-rijksmuseum-oval-214", 0, 0.12, 0.17, 0.76)],
    slots: [],
    texts: [text(0, 0.1, 0.74, 0.8, t("circa 2026", "khoảng năm 2026"), { font: "cormorant", size: 0.06, color: BROWN })],
  }),
  design("ticket-stub", "retro", t("Ticket stub", "Cuống vé"), {
    themes: ["city", "retro", "friends"],
    slides: 1,
    background: { kind: "color", color: "#1f2b3a" },
    art: [art("vintage-labels/label-havana-cigar-1871", 0, 0.52, 0.66, 0.42, { rotation: 6, opacity: 0.95 })],
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.56, { border: { width: 0.015, color: "#f2e6cf" } })],
    texts: [
      text(0, 0.08, 0.7, 0.44, t("ADMIT\nONE", "VÉ\nVÀO CỬA"), { font: "anton", size: 0.09, color: "#f2e6cf", align: "left", lineHeight: 0.95 }),
      text(0, 0.08, 0.9, 0.44, t("NO. 000271", "SỐ 000271"), { font: "spaceGrotesk", size: 0.028, color: "#f2e6cf", align: "left", letterSpacing: 0.3 }),
    ],
  }),
];
