import type { Template } from "../types";
import { block, design, INK, photo, t, text } from "./kit";

// Editorial: magazine covers, lookbooks, archive pages (2026-10-28).

export const EDITORIAL: Template[] = [
  design("mag-masthead", "editorial", t("Masthead", "Tên tạp chí"), {
    themes: ["fashion", "portrait"],
    slides: 3,
    slots: [photo(0, 0, 0, 0, 1, 1), photo(1, 1, 0.06, 0.2, 0.56, 0.7), photo(2, 2, 0, 0, 1, 0.62)],
    background: { kind: "color", color: "#f4f0e8" },
    texts: [
      text(0, 0.04, 0.02, 0.92, t("ÉTÉ", "HÈ"), { font: "playfair", size: 0.26, color: "#ffffff", bold: true, letterSpacing: 0.04 }),
      text(0, 0.06, 0.86, 0.6, t("THE SUMMER ISSUE\nNO. 12 · 2026", "SỐ MÙA HÈ\nSỐ 12 · 2026"), { font: "spaceGrotesk", size: 0.03, color: "#ffffff", align: "left", letterSpacing: 0.18, shadow: true }),
      text(1, 0.66, 0.2, 0.3, t("“Dress\nfor the\nweather\nyou\nwant.”", "“Mặc\ncho\nthời tiết\nmình\nmuốn.”"), { font: "cormorant", size: 0.065, color: INK, align: "left", italic: true, lineHeight: 1 }),
      text(1, 0.06, 0.06, 0.88, t("INTERVIEW", "PHỎNG VẤN"), { font: "anton", size: 0.06, color: "#c2362f", align: "left", letterSpacing: 0.1 }),
      text(2, 0.06, 0.66, 0.88, t("Linen, salt\nand slow mornings", "Vải lanh, muối biển\nvà những buổi sáng chậm"), { font: "playfair", size: 0.07, color: INK, align: "left", bold: true, lineHeight: 1.05 }),
      text(2, 0.06, 0.88, 0.88, t("PHOTOGRAPHED BY YOU", "ẢNH: CHÍNH BẠN"), { font: "spaceGrotesk", size: 0.026, color: "#7a756c", align: "left", letterSpacing: 0.2 }),
    ],
  }),
  design("mag-index", "editorial", t("Contents page", "Trang mục lục"), {
    themes: ["travel", "food", "city"],
    slides: 1,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.5, 0.06, 0.44, 0.44), photo(1, 0, 0.5, 0.52, 0.44, 0.42)],
    texts: [
      text(0, 0.06, 0.06, 0.4, t("Contents", "Mục lục"), { font: "playfair", size: 0.08, color: INK, align: "left", bold: true }),
      ...[t("04  Morning walks", "04  Đi bộ buổi sáng"), t("12  The corner café", "12  Quán cà phê góc phố"), t("18  Markets", "18  Chợ"), t("26  Night trains", "26  Tàu đêm"), t("34  Home again", "34  Về nhà")].map((w, i) =>
        text(0, 0.06, 0.24 + i * 0.12, 0.4, w, { font: "lora", size: 0.036, color: INK, align: "left" }),
      ),
    ],
  }),
  design("mag-red-bar", "editorial", t("Red bar", "Thanh đỏ"), {
    themes: ["portrait", "fashion", "mono"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    shapes: [block(0, 0, 0.82, 1, 0.12, "#c2362f")],
    texts: [
      text(0, 0.05, 0.835, 0.9, t("THE NEW CLASSICS", "KINH ĐIỂN MỚI"), { font: "anton", size: 0.075, color: "#ffffff", align: "left", letterSpacing: 0.04 }),
      text(0, 0.05, 0.05, 0.9, t("VOL. 3", "TẬP 3"), { font: "spaceGrotesk", size: 0.03, color: "#ffffff", align: "right", letterSpacing: 0.3, shadow: true }),
    ],
  }),
  design("mag-split-type", "editorial", t("Big type, small photo", "Chữ lớn, ảnh nhỏ"), {
    themes: ["city", "fashion"],
    slides: 2,
    background: { kind: "color", color: "#e9e4da" },
    slots: [photo(0, 0, 0.56, 0.42, 0.36, 0.46), photo(1, 1, 0.06, 0.06, 0.88, 0.88)],
    texts: [
      text(0, 0.04, 0.04, 0.92, t("CITY\nLIGHTS", "PHỐ\nĐÊM"), { font: "anton", size: 0.26, color: INK, align: "left", lineHeight: 0.88 }),
      text(0, 0.06, 0.8, 0.44, t("a short essay on\nwalking home late", "một bài viết ngắn về\nnhững lần về nhà muộn"), { font: "lora", size: 0.034, color: INK, align: "left", italic: true }),
    ],
  }),
  design("mag-interview", "editorial", t("Q & A", "Hỏi & đáp"), {
    themes: ["portrait", "friends"],
    slides: 2,
    background: { kind: "color", color: "#faf8f4" },
    slots: [photo(0, 0, 0.06, 0.06, 0.42, 0.56), photo(1, 1, 0, 0, 1, 0.7)],
    texts: [
      text(0, 0.54, 0.08, 0.4, t("Q.\nWhat made you\nsmile today?", "H.\nĐiều gì làm bạn\ncười hôm nay?"), { font: "playfair", size: 0.048, color: INK, align: "left", bold: true, lineHeight: 1.1 }),
      text(0, 0.54, 0.34, 0.4, t("A.\nThe light at 5 pm,\nand a good friend.", "Đ.\nÁnh nắng lúc 5 giờ\nvà một người bạn tốt."), { font: "lora", size: 0.04, color: INK, align: "left", lineHeight: 1.2 }),
      text(0, 0.06, 0.7, 0.88, t("“I just keep\nthe camera close.”", "“Mình chỉ luôn\nđể máy ảnh gần bên.”"), { font: "cormorant", size: 0.075, color: INK, align: "left", italic: true, lineHeight: 1 }),
      text(1, 0.06, 0.76, 0.88, t("continued →", "còn tiếp →"), { font: "spaceGrotesk", size: 0.03, color: INK, align: "right", letterSpacing: 0.2 }),
    ],
  }),
  design("mag-columns", "editorial", t("Newspaper", "Trang báo"), {
    themes: ["mono", "city", "retro"],
    slides: 1,
    background: { kind: "color", color: "#efebe2" },
    shapes: [block(0, 0.05, 0.155, 0.9, 0.003, INK), block(0, 0.05, 0.165, 0.9, 0.001, INK)],
    slots: [photo(0, 0, 0.05, 0.2, 0.58, 0.46), photo(1, 0, 0.66, 0.2, 0.29, 0.24), photo(2, 0, 0.66, 0.46, 0.29, 0.2)],
    texts: [
      text(0, 0.05, 0.03, 0.9, t("The Daily Weekend", "Nhật Báo Cuối Tuần"), { font: "playfair", size: 0.075, color: INK, bold: true }),
      text(0, 0.05, 0.12, 0.9, t("SATURDAY EDITION · FREE · ALL GOOD NEWS", "SỐ THỨ BẢY · MIỄN PHÍ · TOÀN TIN VUI"), { font: "spaceGrotesk", size: 0.022, color: INK, letterSpacing: 0.15 }),
      text(0, 0.05, 0.69, 0.58, t("LOCAL FRIENDS FINALLY\nMEET FOR BRUNCH", "HỘI BẠN THÂN CUỐI CÙNG\nCŨNG HẸN ĐƯỢC BỮA SÁNG"), { font: "anton", size: 0.05, color: INK, align: "left", lineHeight: 1 }),
      text(0, 0.05, 0.82, 0.9, t("Witnesses report too much coffee and very loud laughing. More on page 2.", "Nhân chứng cho biết có quá nhiều cà phê và tiếng cười rất to. Chi tiết ở trang 2."), { font: "lora", size: 0.03, color: INK, align: "left" }),
    ],
  }),
  design("mag-cover-story", "editorial", t("Cover story", "Bài trang bìa"), {
    format: "story",
    themes: ["fashion", "portrait"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.04, 0.12, 0.92, t("VOGUISH", "THỜI THƯỢNG"), { font: "playfair", size: 0.16, color: "#ffffff", bold: true }),
      text(0, 0.06, 0.56, 0.4, t("10 ways\nto wear\nwhite", "10 cách\nmặc\nmàu trắng"), { font: "anton", size: 0.06, color: "#ffffff", align: "left", lineHeight: 1, shadow: true }),
      text(0, 0.56, 0.66, 0.38, t("+ the new\nsoft tailoring", "+ đường may\nmềm mại mới"), { font: "cormorant", size: 0.05, color: "#ffffff", align: "right", italic: true, shadow: true }),
    ],
  }),
  design("mag-lookbook", "editorial", t("Three looks", "Lookbook ba bộ"), {
    themes: ["fashion"],
    slides: 3,
    background: { kind: "color", color: "#ffffff" },
    slots: [photo(0, 0, 0.06, 0.12, 0.88, 0.78), photo(1, 1, 0.06, 0.12, 0.43, 0.78), photo(2, 1, 0.51, 0.12, 0.43, 0.78), photo(3, 2, 0.06, 0.12, 0.88, 0.78)],
    texts: [0, 1, 2].flatMap((s) => [
      text(s, 0.06, 0.04, 0.6, t("LOOKBOOK — AW26", "LOOKBOOK — THU ĐÔNG 26"), { font: "spaceGrotesk", size: 0.028, color: INK, align: "left", letterSpacing: 0.25 }),
      text(s, 0.06, 0.92, 0.88, t(`LOOK 0${s + 1}`, `LOOK 0${s + 1}`), { font: "spaceGrotesk", size: 0.028, color: INK, align: "right", letterSpacing: 0.25 }),
    ]),
  }),
  design("mag-black-white", "editorial", t("Black & white feature", "Chuyên mục đen trắng"), {
    themes: ["mono", "portrait", "city"],
    slides: 2,
    background: { kind: "color", color: "#0e0e0e" },
    slots: [photo(0, 0, 0.1, 0.18, 0.8, 0.64), photo(1, 1, 0, 0, 0.5, 1), photo(2, 1, 0.5, 0, 0.5, 1)],
    texts: [
      text(0, 0.1, 0.06, 0.8, t("in black\n& white", "đen\n& trắng"), { font: "cormorant", size: 0.075, color: "#ffffff", align: "left", italic: true, lineHeight: 0.95 }),
      text(0, 0.1, 0.86, 0.8, t("A PHOTO ESSAY", "TẢN VĂN ẢNH"), { font: "spaceGrotesk", size: 0.028, color: "#bdbdbd", align: "right", letterSpacing: 0.3 }),
    ],
  }),
  design("cover", "editorial", t("Magazine cover", "Bìa tạp chí"), {
    themes: ["fashion", "portrait"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.04, 0.03, 0.92, t("MUSE", "MUSE"), { font: "playfair", size: 0.25, color: "#ffffff", bold: true, letterSpacing: 0.06 }),
      text(0, 0.04, 0.27, 0.92, t("THE NOVEMBER ISSUE", "SỐ THÁNG MƯỜI MỘT"), { font: "spaceGrotesk", size: 0.026, color: "#ffffff", letterSpacing: 0.4 }),
      text(0, 0.06, 0.72, 0.5, t("Quiet\nluxury", "Sang trọng\nthầm lặng"), { font: "cormorant", size: 0.075, color: "#ffffff", align: "left", bold: true, lineHeight: 0.95 }),
      text(0, 0.06, 0.9, 0.6, t("+ 24 looks for the cold", "+ 24 bộ đồ cho ngày lạnh"), { font: "spaceGrotesk", size: 0.028, color: "#ffffff", align: "left", letterSpacing: 0.1 }),
    ],
  }),
  design("lookbook", "editorial", t("Lookbook", "Lookbook"), {
    themes: ["fashion", "portrait"],
    slides: 3,
    background: { kind: "color", color: "#fafafa" },
    slots: [0, 1, 2].map((i) => photo(i, i, 0.12, 0.08, 0.76, 0.74)),
    texts: [0, 1, 2].flatMap((i) => [
      text(i, 0.12, 0.85, 0.36, t(`LOOK 0${i + 1}`, `LOOK 0${i + 1}`), { font: "spaceGrotesk", size: 0.034, color: INK, align: "left", letterSpacing: 0.25 }),
      text(i, 0.48, 0.85, 0.4, [t("coat · boots", "áo khoác · bốt"), t("knit · denim", "len · denim"), t("all black", "toàn đen")][i], { font: "cormorant", size: 0.045, color: "#55524c", align: "right" }),
    ]),
  }),
  design("red-issue", "editorial", t("Red issue", "Số màu đỏ"), {
    themes: ["mono", "fashion"],
    slides: 1,
    background: { kind: "color", color: "#8f1d1d" },
    slots: [photo(0, 0, 0.18, 0.1, 0.64, 0.62, { border: { width: 0.02, color: "#f2e6dc" }, shadow: true, rotation: 2 })],
    texts: [
      text(0, 0.06, 0.76, 0.6, t("RED", "ĐỎ"), { font: "anton", size: 0.2, color: "#f2e6dc", align: "left", letterSpacing: 0.02 }),
      text(0, 0.56, 0.86, 0.38, t("issue no. 4", "số 4"), { font: "cormorant", size: 0.055, color: "#f2e6dc", align: "right" }),
    ],
  }),
  design("archive", "editorial", t("From the archive", "Từ kho lưu trữ"), {
    themes: ["mono", "minimal", "fashion"],
    slides: 2,
    background: { kind: "color", color: "#f4f2ee" },
    slots: [
      photo(0, 0, 0.08, 0.1, 0.38, 0.42),
      photo(1, 0, 0.54, 0.28, 0.38, 0.46),
      photo(2, 0, 0.2, 0.62, 0.3, 0.28),
      photo(3, 1, 0.1, 0.08, 0.8, 0.62),
    ],
    texts: [
      text(0, 0.56, 0.06, 0.38, t("from the\narchive", "từ kho\nlưu trữ"), { font: "cormorant", size: 0.07, color: INK, align: "left", lineHeight: 1 }),
      text(0, 0.08, 0.535, 0.38, t("FIG. 01 — 1998", "HÌNH 01 — 1998"), { font: "spaceGrotesk", size: 0.022, color: "#6d6a64", align: "left", letterSpacing: 0.15 }),
      text(0, 0.54, 0.755, 0.38, t("FIG. 02", "HÌNH 02"), { font: "spaceGrotesk", size: 0.022, color: "#6d6a64", align: "left", letterSpacing: 0.15 }),
      text(1, 0.1, 0.73, 0.8, t("FIG. 03 — collected moments", "HÌNH 03 — những khoảnh khắc góp nhặt"), { font: "spaceGrotesk", size: 0.022, color: "#6d6a64", align: "left", letterSpacing: 0.15 }),
    ],
  }),
  design("new-classics", "editorial", t("The new classics", "Kinh điển mới"), {
    themes: ["fashion"],
    slides: 1,
    background: { kind: "color", color: "#e9e4dc" },
    slots: [photo(0, 0, 0.5, 0, 0.5, 1)],
    texts: [
      text(0, 0.06, 0.08, 0.4, t("the\nnew\nclassics", "kinh\nđiển\nmới"), { font: "playfair", size: 0.1, color: INK, align: "left", bold: true, lineHeight: 0.95 }),
      text(0, 0.06, 0.7, 0.38, t("Notes on dressing for slow days.", "Ghi chép về cách mặc cho những ngày chậm."), { font: "lora", size: 0.032, color: "#4c4a46", align: "left" }),
      text(0, 0.06, 0.9, 0.38, t("P. 12", "TR. 12"), { font: "spaceGrotesk", size: 0.026, color: "#4c4a46", align: "left", letterSpacing: 0.2 }),
    ],
  }),
  design("style-diary", "editorial", t("Style diary", "Nhật ký phong cách"), {
    themes: ["fashion", "city"],
    slides: 2,
    background: { kind: "color", color: "#111111" },
    slots: [photo(0, 0, 0.06, 0.42, 0.88, 0.52), photo(1, 1, 0.06, 0.06, 0.43, 0.6), photo(2, 1, 0.51, 0.06, 0.43, 0.6)],
    texts: [
      text(0, 0.06, 0.05, 0.88, t("STYLE\nDIARY", "NHẬT KÝ\nPHONG CÁCH"), { font: "anton", size: 0.16, color: "#f2efe9", align: "left", lineHeight: 0.95 }),
      text(1, 0.06, 0.72, 0.88, t("worn on repeat", "mặc đi mặc lại"), { font: "cormorant", size: 0.07, color: "#f2efe9", align: "left" }),
    ],
  }),
  design("the-edit", "editorial", t("The edit", "Tuyển chọn"), {
    format: "story",
    themes: ["fashion", "portrait"],
    slides: 1,
    slots: [photo(0, 0, 0, 0, 1, 1)],
    texts: [
      text(0, 0.06, 0.14, 0.88, t("The edit", "Tuyển chọn"), { font: "playfair", size: 0.15, color: "#ffffff", align: "left", bold: true }),
      text(0, 0.06, 0.245, 0.88, t("VOL. 12 — WINTER", "SỐ 12 — MÙA ĐÔNG"), { font: "spaceGrotesk", size: 0.03, color: "#ffffff", align: "left", letterSpacing: 0.3 }),
      text(0, 0.06, 0.77, 0.88, t("read the story ↗", "đọc bài viết ↗"), { font: "beVietnam", size: 0.038, color: "#ffffff", align: "left" }),
    ],
  }),
  design("details", "editorial", t("In the details", "Từng chi tiết"), {
    themes: ["fashion", "minimal"],
    slides: 2,
    background: { kind: "color", color: "#f3efe8" },
    slots: [
      photo(0, 0, 0.08, 0.08, 0.84, 0.84),
      photo(1, 1, 0.08, 0.08, 0.27, 0.216, { mask: "circle" }),
      photo(2, 1, 0.365, 0.08, 0.27, 0.216, { mask: "circle" }),
      photo(3, 1, 0.65, 0.08, 0.27, 0.216, { mask: "circle" }),
      photo(4, 1, 0.08, 0.4, 0.84, 0.52),
    ],
    texts: [text(0, 0.12, 0.83, 0.76, t("in the details", "từng chi tiết"), { font: "cormorant", size: 0.07, color: "#ffffff", align: "left", bold: true })],
  }),
];
