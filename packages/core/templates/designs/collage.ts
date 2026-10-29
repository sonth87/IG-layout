import type { Template } from "../types";
import { art, block, cells, design, icon, INK, KRAFT, PAPER, photo, t, tape, text, WHITE_FRAME } from "./kit";

// One-slide collages, second batch (2026-10-28): mosaics without gaps, overlapping prints,
// circles, a magazine cut-up, photo corners, a contact sheet, frames from the packs.

export const COLLAGE: Template[] = [
  design("mosaic-tight", "collage", t("Tight mosaic", "Mosaic sát nhau"), {
    themes: ["food", "city", "friends"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 0.6, 0.5), photo(1, 0, 0.6, 0, 0.4, 0.3), photo(2, 0, 0.6, 0.3, 0.4, 0.4), photo(3, 0, 0, 0.5, 0.35, 0.5), photo(4, 0, 0.35, 0.5, 0.25, 0.25), photo(5, 0, 0.35, 0.75, 0.25, 0.25), photo(6, 0, 0.6, 0.7, 0.4, 0.3)],
  }),
  design("overlap-prints", "collage", t("Overlapping prints", "Ảnh in chồng nhau"), {
    themes: ["travel", "nature", "friends"],
    slides: 1,
    background: { kind: "color", color: "#ebe7e0" },
    slots: [
      photo(0, 0, 0.05, 0.05, 0.6, 0.48, { ...WHITE_FRAME, rotation: -4 }),
      photo(1, 0, 0.42, 0.22, 0.52, 0.42, { ...WHITE_FRAME, rotation: 5 }),
      photo(2, 0, 0.1, 0.5, 0.5, 0.42, { ...WHITE_FRAME, rotation: 2 }),
      photo(3, 0, 0.5, 0.6, 0.42, 0.34, { ...WHITE_FRAME, rotation: -6 }),
    ],
  }),
  design("bubbles", "collage", t("Bubbles", "Bong bóng"), {
    themes: ["kids", "flowers", "friends"],
    slides: 1,
    background: { kind: "color", color: "#fdf0e8" },
    slots: [
      photo(0, 0, 0.06, 0.06, 0.56, 0.448, { mask: "circle" }),
      photo(1, 0, 0.6, 0.12, 0.34, 0.272, { mask: "circle" }),
      photo(2, 0, 0.52, 0.46, 0.42, 0.336, { mask: "circle" }),
      photo(3, 0, 0.1, 0.56, 0.36, 0.288, { mask: "circle" }),
    ],
    texts: [text(0, 0.06, 0.88, 0.88, t("little joys", "niềm vui nhỏ"), { font: "patrickHand", size: 0.06, color: "#c4614f" })],
  }),
  design("cutup-magazine", "collage", t("Magazine cut-up", "Cắt dán tạp chí"), {
    themes: ["fashion", "portrait", "city"],
    slides: 1,
    background: { kind: "color", color: "#f2efe9" },
    shapes: [block(0, 0.58, 0.04, 0.38, 0.22, "#e2472f"), block(0, 0.04, 0.7, 0.3, 0.26, "#1d1c1a")],
    slots: [photo(0, 0, 0.08, 0.08, 0.52, 0.6, { rotation: -2 }), photo(1, 0, 0.56, 0.3, 0.38, 0.36, { rotation: 3 }), photo(2, 0, 0.38, 0.66, 0.5, 0.3, { rotation: -1 })],
    texts: [
      text(0, 0.6, 0.08, 0.34, t("ISSUE\nNO. 7", "SỐ\n07"), { font: "anton", size: 0.075, color: "#ffffff", align: "left", lineHeight: 0.95 }),
      text(0, 0.06, 0.74, 0.26, t("street\nstyle", "phong cách\nđường phố"), { font: "cormorant", size: 0.055, color: "#ffffff", align: "left", italic: true }),
    ],
  }),
  design("photo-corners", "collage", t("Album corners", "Góc dán album"), {
    themes: ["retro", "couple", "kids"],
    slides: 1,
    background: { kind: "color", color: "#26241f" },
    art: [art("gen-album/album-5", 0, 0.04, 0.04, 0.46, { rotation: -3 }), art("gen-album/album-8", 0, 0.5, 0.08, 0.46, { rotation: 3, photo: 1 }), art("gen-album/album-4", 0, 0.12, 0.56, 0.76, { rotation: -1, photo: 2 })],
    slots: [],
    texts: [text(0, 0.1, 0.92, 0.8, t("family album, vol. 2", "album gia đình, tập 2"), { font: "cormorant", size: 0.045, color: "#efe6d8", italic: true })],
  }),
  design("contact-sheet-red", "collage", t("Red-pen contact sheet", "Tờ in thử bút đỏ"), {
    themes: ["mono", "portrait", "city"],
    slides: 1,
    background: { kind: "color", color: "#111111" },
    slots: cells(0, 0, [0.06, 0.1, 0.88, 0.78], 3, 4, 0.02),
    icons: [icon("doodle-circle", 0, 0.34, 0.28, 0.34, { color: "#e5383b" }), icon("doodle-cross", 0, 0.68, 0.71, 0.12, { color: "#e5383b" })],
    texts: [
      text(0, 0.06, 0.03, 0.6, t("ROLL 12 · HP5", "CUỘN 12 · HP5"), { font: "spaceGrotesk", size: 0.032, color: "#d6d6d6", align: "left", letterSpacing: 0.2 }),
      text(0, 0.5, 0.91, 0.44, t("this one ↑", "tấm này ↑"), { font: "patrickHand", size: 0.045, color: "#e5383b", align: "right" }),
    ],
  }),
  design("frame-wall", "collage", t("Frame wall", "Tường khung ảnh"), {
    themes: ["minimal", "travel", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#e8e2d6" },
    art: [
      art("gen-picture-frames/picture-frame-7", 0, 0.06, 0.06, 0.4),
      art("gen-picture-frames/picture-frame-3", 0, 0.5, 0.1, 0.44, { photo: 1 }),
      art("gen-picture-frames/picture-frame-12", 0, 0.1, 0.52, 0.38, { photo: 2 }),
      art("gen-picture-frames/picture-frame-9", 0, 0.54, 0.48, 0.38, { photo: 3 }),
    ],
    slots: [],
  }),
  design("taped-wall", "collage", t("Taped to the wall", "Dán băng keo lên tường"), {
    themes: ["friends", "party", "city"],
    slides: 1,
    background: { kind: "color", color: "#f7f7f5" },
    shapes: [tape(0, 0.28, 0.06, -8), tape(0, 0.74, 0.12, 6), tape(0, 0.3, 0.5, 4), tape(0, 0.72, 0.56, -5)],
    slots: [
      photo(0, 0, 0.06, 0.07, 0.44, 0.38, { shadow: true, rotation: -2 }),
      photo(1, 0, 0.52, 0.13, 0.42, 0.36, { shadow: true, rotation: 3 }),
      photo(2, 0, 0.08, 0.51, 0.44, 0.4, { shadow: true, rotation: 2 }),
      photo(3, 0, 0.52, 0.57, 0.42, 0.36, { shadow: true, rotation: -3 }),
    ],
  }),
  design("inset-print", "collage", t("Print on a photo", "Ảnh in đặt trên ảnh"), {
    themes: ["travel", "nature", "beach"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1), photo(1, 0, 0.5, 0.52, 0.42, 0.4, { ...WHITE_FRAME, rotation: 4 })],
    texts: [text(0, 0.06, 0.06, 0.6, t("here & there", "nơi này & nơi kia"), { font: "greatVibes", size: 0.09, color: "#ffffff", align: "left", shadow: true })],
  }),
  design("diagonal-strips", "collage", t("Slanted strips", "Dải chéo"), {
    themes: ["beach", "travel", "city"],
    slides: 1,
    background: { kind: "color", color: "#fbfaf7" },
    slots: [0, 1, 2, 3].map((i) => photo(i, 0, -0.08 + i * 0.27, -0.05, 0.25, 1.1, { rotation: 8 })),
    texts: [text(0, 0.06, 0.86, 0.88, t("summer, in pieces", "mùa hè, từng mảnh"), { font: "beVietnam", size: 0.04, color: INK, bold: true, background: { color: "#ffffff", padding: 0.5, radius: 0.3 } })],
  }),
  design("kraft-trio", "collage", t("Kraft paper trio", "Ba ảnh giấy kraft"), {
    themes: ["travel", "food", "retro"],
    slides: 1,
    background: { kind: "color", color: KRAFT },
    art: [art("gen-washi/washi-20", 0, 0.3, 0.04, 0.4, { rotation: 4 }), art("gen-notes/note-27", 0, 0.62, 0.64, 0.28, { rotation: 8 })],
    slots: [photo(0, 0, 0.08, 0.08, 0.84, 0.48, WHITE_FRAME), photo(1, 0, 0.08, 0.6, 0.26, 0.32, WHITE_FRAME), photo(2, 0, 0.36, 0.6, 0.26, 0.32, WHITE_FRAME)],
    texts: [text(0, 0.66, 0.71, 0.22, t("good\nfood,\ngood\nmood", "ăn\nngon,\nvui\nvẻ"), { font: "patrickHand", size: 0.04, color: INK, rotation: 8, lineHeight: 1 })],
  }),
  design("paper-cards", "collage", t("Paper cards", "Thẻ giấy"), {
    themes: ["minimal", "flowers", "fashion"],
    slides: 1,
    background: { kind: "color", color: PAPER },
    shapes: [block(0, 0.04, 0.06, 0.5, 0.5, "#e8d5c4", { rotation: -3 }), block(0, 0.46, 0.44, 0.5, 0.5, "#cbd5c0", { rotation: 4 })],
    slots: [photo(0, 0, 0.1, 0.1, 0.4, 0.42, { rotation: -3 }), photo(1, 0, 0.52, 0.48, 0.4, 0.42, { rotation: 4 })],
    texts: [
      text(0, 0.56, 0.16, 0.38, t("soft\ntones", "tông\nmàu dịu"), { font: "cormorant", size: 0.075, color: INK, align: "left", italic: true, lineHeight: 0.95 }),
      text(0, 0.08, 0.76, 0.36, t("— a mood", "— một tâm trạng"), { font: "spaceGrotesk", size: 0.03, color: INK, align: "left", letterSpacing: 0.15 }),
    ],
  }),
];
