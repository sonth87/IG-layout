import type { Template } from "../types";
import { art, block, cells, design, INK, photo, strip, t, text } from "./kit";

// Minimal posts and stories, second batch (2026-10-28): lots of white, one thin line of
// type, small photos, a digital camera, a notebook page.

const S = 0.5625;
const GREY = "#8a8378";
const booth = strip(0, 0, 0.5, 0.48, 0.34, 3, 0, S, "#ffffff");

export const MINIMAL: Template[] = [
  // ── Minimal (post) ──────────────────────────────────────────────────────
  design("white-band", "minimal", t("White band", "Dải trắng"), {
    themes: ["minimal", "city", "nature"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0, 0, 1, 0.84)],
    texts: [
      text(0, 0.05, 0.89, 0.5, t("Saturday", "Thứ bảy"), { font: "cormorant", size: 0.05, color: INK, align: "left", italic: true }),
      text(0, 0.45, 0.895, 0.5, t("16:42", "16:42"), { font: "spaceGrotesk", size: 0.032, color: GREY, align: "right", letterSpacing: 0.2 }),
    ],
  }),
  design("caption-under", "minimal", t("Caption below", "Chú thích bên dưới"), {
    themes: ["minimal", "travel", "food"],
    slides: 3,
    background: { kind: "color", color: "#fbfaf8" },
    slots: [0, 1, 2].map((s) => photo(s, s, 0.12, 0.1, 0.76, 0.66)),
    texts: [0, 1, 2].flatMap((s) => [
      text(s, 0.12, 0.8, 0.5, [t("morning", "buổi sáng"), t("afternoon", "buổi chiều"), t("evening", "buổi tối")][s], { font: "cormorant", size: 0.05, color: INK, align: "left", italic: true }),
      text(s, 0.5, 0.81, 0.38, t(`${s + 1} / 3`, `${s + 1} / 3`), { font: "spaceGrotesk", size: 0.03, color: GREY, align: "right", letterSpacing: 0.2 }),
    ]),
  }),
  design("four-small", "minimal", t("Four small", "Bốn ảnh nhỏ"), {
    themes: ["minimal", "food", "flowers"],
    slides: 1,
    background: { kind: "color", color: "#f3f1ec" },
    slots: cells(0, 0, [0.2, 0.18, 0.6, 0.56], 2, 2, 0.03),
    texts: [text(0, 0.2, 0.8, 0.6, t("four quiet moments", "bốn khoảnh khắc lặng"), { font: "cormorant", size: 0.045, color: INK, italic: true })],
  }),
  design("thin-frame", "minimal", t("Thin line", "Viền mảnh"), {
    themes: ["mono", "portrait", "city"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    shapes: [block(0, 0.06, 0.05, 0.88, 0.0025, INK), block(0, 0.06, 0.945, 0.88, 0.0025, INK)],
    slots: [photo(0, 0, 0.06, 0.1, 0.88, 0.72)],
    texts: [
      text(0, 0.06, 0.86, 0.5, t("Untitled, 2026", "Không tên, 2026"), { font: "cormorant", size: 0.045, color: INK, align: "left", italic: true }),
      text(0, 0.5, 0.865, 0.44, t("35mm", "35mm"), { font: "spaceGrotesk", size: 0.03, color: GREY, align: "right", letterSpacing: 0.2 }),
    ],
  }),
  design("one-word", "minimal", t("One word", "Một chữ"), {
    themes: ["nature", "minimal", "beach"],
    slides: 2,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 1, 0, 0, 1, 1)],
    texts: [
      text(0, 0.1, 0.44, 0.8, t("breathe.", "thở."), { font: "cormorant", size: 0.11, color: INK, italic: true }),
      text(0, 0.1, 0.9, 0.8, t("swipe", "vuốt"), { font: "spaceGrotesk", size: 0.026, color: GREY, letterSpacing: 0.4 }),
    ],
  }),
  design("grey-trio", "minimal", t("Three in a row", "Ba ảnh một hàng"), {
    themes: ["minimal", "food", "city"],
    slides: 1,
    background: { kind: "color", color: "#ecebe8" },
    slots: cells(0, 0, [0.06, 0.34, 0.88, 0.32], 3, 1, 0.02),
    texts: [text(0, 0.06, 0.72, 0.88, t("the week, quietly", "một tuần, lặng lẽ"), { font: "cormorant", size: 0.045, color: INK, italic: true, align: "left" })],
  }),
  design("digicam-minimal", "minimal", t("Digicam", "Máy ảnh số"), {
    themes: ["portrait", "friends", "city"],
    slides: 1,
    background: { kind: "color", color: "#f2f2f0" },
    art: [art("gen-camera/camera-1", 0, 0.08, 0.26, 0.84)],
    slots: [],
    texts: [text(0, 0.08, 0.84, 0.84, t("point & shoot", "chụp là xong"), { font: "spaceGrotesk", size: 0.032, color: GREY, letterSpacing: 0.25 })],
  }),
  design("notebook-page", "minimal", t("Notebook page", "Trang sổ"), {
    themes: ["minimal", "food", "flowers"],
    slides: 1,
    background: { kind: "color", color: "#e9e6e0" },
    art: [art("gen-notebook/notebook-10", 0, 0.14, 0.04, 0.72, { rotation: 2 })],
    slots: [],
    texts: [text(0, 0.22, 0.72, 0.56, t("today I noticed…", "hôm nay mình để ý…"), { font: "patrickHand", size: 0.045, color: INK, align: "left", rotation: 2 })],
  }),
  design("black-border", "minimal", t("Black border", "Viền đen"), {
    themes: ["mono", "city", "portrait"],
    slides: 2,
    background: { kind: "color", color: "#0f0f0f" },
    slots: [photo(0, 0, 0.05, 0.05, 0.9, 0.9), photo(1, 1, 0.05, 0.05, 0.9, 0.9)],
  }),
  design("soft-arch", "minimal", t("Soft arch", "Vòm dịu"), {
    themes: ["minimal", "flowers", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#efe7dd" },
    slots: [photo(0, 0, 0.26, 0.14, 0.48, 0.6, { mask: "arch" })],
    texts: [text(0, 0.1, 0.8, 0.8, t("slow living", "sống chậm"), { font: "cormorant", size: 0.06, color: "#6b5a48", italic: true })],
  }),

  // ── Story ───────────────────────────────────────────────────────────────
  design("story-white-booth", "story", t("White photobooth", "Photobooth trắng"), {
    format: "story",
    themes: ["friends", "couple", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#1d1c1a" },
    shapes: [booth.shape],
    slots: booth.slots,
    texts: [text(0, 0.1, 0.8, 0.8, t("us, in three", "tụi mình, ba tấm"), { font: "patrickHand", size: 0.05, color: "#ffffff" })],
  }),
  design("story-digicam", "story", t("Digicam story", "Story máy ảnh số"), {
    format: "story",
    themes: ["friends", "party", "portrait"],
    slides: 1,
    background: { kind: "color", color: "#f7d9e3" },
    art: [art("gen-camera/camera-8", 0, 0.12, 0.16, 0.76, { rotation: -3 })],
    slots: [],
    texts: [text(0, 0.08, 0.76, 0.84, t("y2k mood", "chất y2k"), { font: "anton", size: 0.1, color: "#7a3b4b" })],
  }),
  design("story-notebook", "story", t("Diary page", "Trang nhật ký"), {
    format: "story",
    themes: ["minimal", "food", "nature"],
    slides: 1,
    background: { kind: "color", color: "#dfd7cc" },
    art: [art("gen-notebook/notebook-21", 0, 0.06, 0.14, 0.88, { rotation: -2 }), art("gen-washi/washi-29", 0, 0.62, 0.62, 0.34, { rotation: 30 })],
    slots: [],
    texts: [text(0, 0.16, 0.555, 0.68, t("dear diary,\ntoday was a good day", "nhật ký thân mến,\nhôm nay là một ngày đẹp"), { font: "patrickHand", size: 0.045, color: INK, align: "left", rotation: -2, lineHeight: 1.4 })],
  }),
  design("story-split-three", "story", t("Three bands", "Ba dải ngang"), {
    format: "story",
    themes: ["travel", "beach", "nature"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: cells(0, 0, [0, 0, 1, 1], 1, 3, 0.012, S),
    texts: [text(0, 0.06, 0.315, 0.88, t("morning · noon · night", "sáng · trưa · tối"), { font: "beVietnam", size: 0.034, color: INK, bold: true, background: { color: "#ffffff", padding: 0.5, radius: 0.5 } })],
  }),
  design("story-question", "story", t("Ask me", "Hỏi mình đi"), {
    format: "story",
    themes: ["portrait", "fashion"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.14, 0.6, 0.72, t("ask me anything", "hỏi mình bất cứ điều gì"), { font: "beVietnam", size: 0.045, color: INK, bold: true, background: { color: "#ffffff", padding: 0.7, radius: 0.4 } }),
      text(0, 0.18, 0.68, 0.64, t("type something…", "nhập gì đó…"), { font: "beVietnam", size: 0.035, color: "#9a9a9a", background: { color: "#efefef", padding: 0.6, radius: 0.6 } }),
    ],
  }),
  design("story-polaroid-pair", "story", t("Polaroid pair", "Cặp polaroid"), {
    format: "story",
    themes: ["couple", "friends", "travel"],
    slides: 1,
    background: { kind: "color", color: "#e9e3d8" },
    slots: [photo(0, 0, 0.08, 0.14, 0.62, 0.36, { frame: "polaroid", shadow: true, rotation: -5 }), photo(1, 0, 0.3, 0.44, 0.62, 0.36, { frame: "polaroid", shadow: true, rotation: 4 })],
    texts: [text(0, 0.08, 0.82, 0.84, t("you & me, again", "lại là cậu & mình"), { font: "greatVibes", size: 0.08, color: INK })],
  }),
  design("story-mag-cover", "story", t("Cover story", "Bìa tạp chí"), {
    format: "story",
    themes: ["fashion", "portrait"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.04, 0.13, 0.92, t("MOOD", "MOOD"), { font: "anton", size: 0.3, color: "#ffffff", letterSpacing: 0.02 }),
      text(0, 0.06, 0.74, 0.5, t("the new\nsoft era", "kỷ nguyên\nnhẹ nhàng"), { font: "cormorant", size: 0.06, color: "#ffffff", align: "left", italic: true, shadow: true, lineHeight: 1 }),
      text(0, 0.56, 0.78, 0.38, t("ISSUE 04\nNOV 2026", "SỐ 04\nTHÁNG 11"), { font: "spaceGrotesk", size: 0.028, color: "#ffffff", align: "right", letterSpacing: 0.2, shadow: true }),
    ],
  }),
  design("story-weather", "story", t("Today's weather", "Thời tiết hôm nay"), {
    format: "story",
    themes: ["travel", "nature", "city"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    widgets: [{ slide: 0, x: 0.08, y: 0.62, w: 0.6, kind: "weather", variant: "big" }],
  }),
];
