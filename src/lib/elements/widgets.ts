/**
 * Card widgets (D-114): small cards dressed as familiar UI — weather, calendar, countdown,
 * now playing, poll, chat, boarding pass, receipt… Each is an icon element carrying
 * `widget` (its kind, texts and theme), drawn here on a canvas at a base size and scaled
 * to the element. The texts come from assets/text/widget-samples.json (G6).
 *
 * Drawn with system fonts: they look like phone UI and are always ready (no web font
 * that might still be loading when the canvas is drawn or exported).
 */
import data from "../../../assets/text/widget-samples.json";
import type { Locale } from "@/store/settings";

export const CARD_WIDGETS = [
  "weather",
  "calendarDate",
  "countdown",
  "nowPlaying",
  "starRating",
  "poll",
  "chatConvo",
  "phoneNotification",
  "questionBox",
  "priceTag",
  "hashtagPill",
  "mentionTag",
  "progressBar",
  "boardingPass",
  "recipeCard",
  "filmExif",
  "checklist",
  "moodMeter",
  "searchBar",
  "bookQuote",
  "receipt",
  "stepCounter",
] as const;
export type CardWidgetKind = (typeof CARD_WIDGETS)[number];
export const WIDGET_THEMES = ["light", "dark", "color"] as const;
export type WidgetTheme = (typeof WIDGET_THEMES)[number];

export interface WidgetData {
  kind: CardWidgetKind;
  fields: Record<string, string>;
  theme: WidgetTheme;
}

interface Spec {
  id: string;
  name: { en: string; vi: string };
  fields: string[];
  samples: { en: Record<string, string>; vi: Record<string, string> };
}
const SPECS = new Map((data.widgets as unknown as Spec[]).map((s) => [s.id, s]));

export function widgetName(kind: CardWidgetKind, locale: Locale) {
  return SPECS.get(kind)?.name[locale] ?? kind;
}

export function widgetFields(kind: CardWidgetKind): string[] {
  return SPECS.get(kind)?.fields ?? [];
}

/** Starting colour of each kind (the Color tool changes it). */
export const WIDGET_ACCENT: Record<CardWidgetKind, string> = {
  weather: "#2f80ed",
  calendarDate: "#ff3b30",
  countdown: "#ff2d55",
  nowPlaying: "#fc3c44",
  starRating: "#f5b301",
  poll: "#7b61ff",
  chatConvo: "#0a84ff",
  phoneNotification: "#34c759",
  questionBox: "#833ab4",
  priceTag: "#e8453c",
  hashtagPill: "#2f80ed",
  mentionTag: "#c13584",
  progressBar: "#34c759",
  boardingPass: "#1f4fa3",
  recipeCard: "#e07a2f",
  filmExif: "#ffb000",
  checklist: "#34c759",
  moodMeter: "#ff9f0a",
  searchBar: "#8e8e93",
  bookQuote: "#b5835a",
  receipt: "#111111",
  stepCounter: "#ff375f",
};

const DARK_KINDS: CardWidgetKind[] = ["nowPlaying", "filmExif"];

export function newWidgetData(kind: CardWidgetKind, locale: Locale): WidgetData {
  return { kind, fields: { ...(SPECS.get(kind)?.samples[locale] ?? {}) }, theme: DARK_KINDS.includes(kind) ? "dark" : "light" };
}

/** Labels of the fields in the edit sheet. */
const FIELD_LABELS: Record<string, [en: string, vi: string]> = {
  icon: ["Icon", "Biểu tượng"],
  temperature: ["Temperature", "Nhiệt độ"],
  condition: ["Condition", "Thời tiết"],
  city: ["City", "Thành phố"],
  month: ["Month", "Tháng"],
  day: ["Day", "Ngày"],
  weekday: ["Weekday", "Thứ"],
  note: ["Note", "Ghi chú"],
  title: ["Title", "Tiêu đề"],
  count: ["Count", "Số"],
  unit: ["Unit", "Đơn vị"],
  targetDate: ["Date", "Ngày"],
  songTitle: ["Song", "Bài hát"],
  artist: ["Artist", "Nghệ sĩ"],
  currentTime: ["Played", "Đã phát"],
  totalTime: ["Length", "Thời lượng"],
  stars: ["Stars (★☆)", "Sao (★☆)"],
  score: ["Score", "Điểm"],
  comment: ["Comment", "Nhận xét"],
  question: ["Question", "Câu hỏi"],
  optionA: ["Option A", "Lựa chọn A"],
  percentA: ["Percent A", "Phần trăm A"],
  optionB: ["Option B", "Lựa chọn B"],
  percentB: ["Percent B", "Phần trăm B"],
  senderName: ["Name", "Tên"],
  incomingText: ["Their message", "Tin nhắn đến"],
  outgoingText: ["Your reply", "Tin trả lời"],
  timestamp: ["Time", "Giờ"],
  appName: ["App", "Ứng dụng"],
  timeAgo: ["When", "Thời điểm"],
  body: ["Text", "Nội dung"],
  prompt: ["Prompt", "Lời mời"],
  answer: ["Answer", "Trả lời"],
  itemName: ["Item", "Sản phẩm"],
  originalPrice: ["Old price", "Giá cũ"],
  salePrice: ["Price", "Giá mới"],
  badge: ["Badge", "Nhãn"],
  tag1: ["Tag 1", "Thẻ 1"],
  tag2: ["Tag 2", "Thẻ 2"],
  tag3: ["Tag 3", "Thẻ 3"],
  handle: ["Handle", "Tên tài khoản"],
  role: ["Role", "Vai trò"],
  label: ["Label", "Nhãn"],
  percentage: ["Percent", "Phần trăm"],
  status: ["Status", "Trạng thái"],
  fromCode: ["From (code)", "Đi (mã)"],
  fromCity: ["From (city)", "Đi (thành phố)"],
  toCode: ["To (code)", "Đến (mã)"],
  toCity: ["To (city)", "Đến (thành phố)"],
  flight: ["Flight", "Chuyến bay"],
  date: ["Date", "Ngày"],
  seat: ["Seat", "Ghế"],
  dishName: ["Dish", "Món"],
  prepTime: ["Time", "Thời gian"],
  servings: ["Serves", "Khẩu phần"],
  ingredients: ["Ingredients (• between)", "Nguyên liệu (cách bằng •)"],
  tip: ["Tip", "Mẹo"],
  camera: ["Camera", "Máy ảnh"],
  lens: ["Lens", "Ống kính"],
  settings: ["Settings", "Thông số"],
  filmStock: ["Film", "Phim"],
  item1: ["Item 1 (☑ / ☐)", "Mục 1 (☑ / ☐)"],
  item2: ["Item 2", "Mục 2"],
  item3: ["Item 3", "Mục 3"],
  emoji: ["Emoji", "Emoji"],
  moodText: ["Mood", "Tâm trạng"],
  level: ["Level", "Mức"],
  query: ["Search", "Từ khoá"],
  hint: ["Hint", "Gợi ý"],
  heading: ["Heading", "Tiêu đề"],
  page: ["Page", "Trang"],
  thought: ["Quote", "Trích dẫn"],
  storeName: ["Store", "Cửa hàng"],
  line1: ["Line 1", "Dòng 1"],
  line2: ["Line 2", "Dòng 2"],
  line3: ["Line 3", "Dòng 3"],
  total: ["Total", "Tổng"],
  steps: ["Steps", "Số bước"],
  distance: ["Distance", "Quãng đường"],
  caption: ["Caption", "Chú thích"],
};

export function fieldLabel(field: string, locale: Locale) {
  const l = FIELD_LABELS[field];
  return l ? l[locale === "vi" ? 1 : 0] : field;
}

/** Fields worth a few lines in the edit sheet. */
export const LONG_FIELDS = new Set(["condition", "note", "comment", "question", "incomingText", "outgoingText", "body", "answer", "ingredients", "tip", "moodText", "thought", "caption", "status"]);

// ---------------------------------------------------------------- drawing

type C = CanvasRenderingContext2D;
type F = Record<string, string>;
interface Pal {
  bg: string;
  fg: string;
  sub: string;
  line: string;
  soft: string;
  /** Accent on this background (white on a coloured card). */
  ac: string;
  /** The chosen colour itself. */
  color: string;
  /** Text on an accent fill. */
  onAc: string;
  theme: WidgetTheme;
}

const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace';
const P = 36;

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0.3;
  const n = parseInt(m[1], 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

function palette(theme: WidgetTheme, color: string): Pal {
  const onAc = luminance(color) > 0.65 ? "#111111" : "#ffffff";
  if (theme === "dark") return { bg: "#1c1c1e", fg: "#ffffff", sub: "#98989d", line: "#3a3a3c", soft: "#2c2c2e", ac: color, color, onAc, theme };
  if (theme === "color") {
    const lightCard = onAc === "#111111";
    return {
      bg: color,
      fg: onAc,
      sub: lightCard ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.78)",
      line: lightCard ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.3)",
      soft: lightCard ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.2)",
      ac: onAc,
      color,
      onAc: lightCard ? "#ffffff" : color,
      theme,
    };
  }
  return { bg: "#ffffff", fg: "#111111", sub: "#8e8e93", line: "#e5e5ea", soft: "#f2f2f7", ac: color, color, onAc, theme };
}

interface TextOpts {
  size: number;
  weight?: number;
  color: string;
  family?: string;
  italic?: boolean;
  align?: CanvasTextAlign;
  /** Line height, times the size. */
  lh?: number;
  strike?: boolean;
}

function setFont(c: C, o: TextOpts) {
  c.font = `${o.italic ? "italic " : ""}${o.weight ?? 400} ${o.size}px ${o.family ?? SANS}`;
}

/** Cut to `max` px with an ellipsis. */
function clip(c: C, s: string, max: number) {
  if (c.measureText(s).width <= max) return s;
  const chars = Array.from(s);
  while (chars.length && c.measureText(chars.join("") + "…").width > max) chars.pop();
  return chars.join("").trimEnd() + "…";
}

/** Word-wrapped lines (long words break anywhere), at most `maxLines` (the last ends in "…"). */
function wrap(c: C, s: string, o: TextOpts, max: number, maxLines = 4): string[] {
  setFont(c, o);
  const out: string[] = [];
  for (const para of (s ?? "").split("\n")) {
    let cur = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = cur ? `${cur} ${word}` : word;
      if (c.measureText(next).width <= max) cur = next;
      else if (!cur) {
        // A word wider than the line: break it by characters.
        let part = "";
        for (const ch of Array.from(word)) {
          if (c.measureText(part + ch).width > max && part) {
            out.push(part);
            part = ch;
          } else part += ch;
        }
        cur = part;
      } else {
        out.push(cur);
        cur = word;
      }
    }
    out.push(cur);
  }
  const lines = out.length > 1 && out.every((l) => !l) ? [""] : out;
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = clip(c, `${kept[maxLines - 1]} ${lines[maxLines]}`, max);
  return kept;
}

/** Height of wrapped lines. */
const linesH = (n: number, o: TextOpts) => n * o.size * (o.lh ?? 1.3);

/** Draws lines from the top `y`; returns the height used. */
function drawLines(c: C, lines: string[], x: number, y: number, o: TextOpts) {
  setFont(c, o);
  c.fillStyle = o.color;
  c.textAlign = o.align ?? "left";
  c.textBaseline = "middle";
  const lh = o.size * (o.lh ?? 1.3);
  lines.forEach((l, i) => {
    const cy = y + lh * i + lh / 2;
    c.fillText(l, x, cy);
    if (o.strike) {
      const w = c.measureText(l).width;
      const x0 = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x;
      c.fillRect(x0, cy - o.size * 0.06, w, Math.max(2, o.size * 0.07));
    }
  });
  return lh * lines.length;
}

/** One line cut to `max`; returns its height. */
function text(c: C, s: string, x: number, y: number, o: TextOpts, max = 10000) {
  setFont(c, o);
  return drawLines(c, [clip(c, s ?? "", max)], x, y, o);
}

function textW(c: C, s: string, o: TextOpts) {
  setFont(c, o);
  return c.measureText(s ?? "").width;
}

function rr(c: C, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

function fillRR(c: C, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  rr(c, x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
}

/** The card, with a soft shadow on light themes. */
function card(c: C, w: number, h: number, pal: Pal, r = 36, bg = pal.bg) {
  c.save();
  c.shadowColor = pal.theme === "dark" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.16)";
  c.shadowBlur = 28;
  c.shadowOffsetY = 8;
  fillRR(c, 0, 0, w, h, r, bg);
  c.restore();
}

function dashed(c: C, x0: number, y: number, x1: number, color: string, width = 2, dash = [10, 8]) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = width;
  c.setLineDash(dash);
  c.beginPath();
  c.moveTo(x0, y);
  c.lineTo(x1, y);
  c.stroke();
  c.restore();
}

function star(c: C, cx: number, cy: number, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  c.closePath();
}

const pct = (s: string | undefined) => {
  const n = parseFloat((s ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n / 100)) : 0;
};

const seconds = (s: string | undefined) => {
  const parts = (s ?? "").split(":").map((p) => parseInt(p, 10));
  return parts.every(Number.isFinite) ? parts.reduce((a, b) => a * 60 + b, 0) : 0;
};

type Draw = (c: C, f: F, pal: Pal, locale: Locale) => { w: number; h: number };

// Each kind measures its texts, draws its card at the right height, then its content.
const KINDS: Record<CardWidgetKind, Draw> = {
  weather(c, f, pal) {
    const w = 520;
    const cond: TextOpts = { size: 26, weight: 500, color: pal.sub };
    const condL = wrap(c, f.condition, cond, w - P * 2, 2);
    const h = P + 36 + 6 + 112 + linesH(condL.length, cond) + P;
    card(c, w, h, pal, 40);
    text(c, f.city, P, P, { size: 30, weight: 700, color: pal.fg }, w - P * 2 - 90);
    text(c, f.icon, w - P, P - 6, { size: 72, color: pal.fg, align: "right", lh: 1.1 });
    text(c, f.temperature, P - 4, P + 42, { size: 104, weight: 300, color: pal.theme === "light" ? pal.ac : pal.fg, lh: 1.08 }, w - P * 2);
    drawLines(c, condL, P, P + 42 + 112, cond);
    return { w, h };
  },

  calendarDate(c, f, pal) {
    const w = 380;
    const band = 84;
    const note: TextOpts = { size: 24, weight: 600, color: pal.ac, align: "center" };
    const noteL = f.note ? wrap(c, f.note, note, w - P * 2, 2) : [];
    const h = band + 6 + 176 + 38 + (noteL.length ? 12 + linesH(noteL.length, note) : 0) + P;
    card(c, w, h, pal, 40);
    c.save();
    rr(c, 0, 0, w, h, 40);
    c.clip();
    c.fillStyle = pal.theme === "color" ? "rgba(0,0,0,0.18)" : pal.color;
    c.fillRect(0, 0, w, band);
    c.restore();
    text(c, (f.month ?? "").toUpperCase(), w / 2, 0, { size: 30, weight: 700, color: pal.theme === "color" ? pal.fg : pal.onAc, align: "center", lh: band / 30 }, w - P * 2);
    text(c, f.day, w / 2, band + 6, { size: 160, weight: 700, color: pal.fg, align: "center", lh: 1.1 }, w - 20);
    text(c, f.weekday, w / 2, band + 6 + 176, { size: 30, weight: 600, color: pal.sub, align: "center", lh: 1.25 }, w - P * 2);
    if (noteL.length) drawLines(c, noteL, w / 2, band + 6 + 176 + 38 + 12, note);
    return { w, h };
  },

  countdown(c, f, pal) {
    const w = 540;
    const big: TextOpts = { size: 84, weight: 800, color: pal.ac, lh: 1.15 };
    const unit: TextOpts = { size: 32, weight: 600, color: pal.fg, lh: 1.3 };
    const countW = textW(c, f.count, big);
    const unitW = textW(c, f.unit, unit);
    const inline = countW + 16 + unitW <= w - P * 2;
    const h = P + 32 + 8 + 97 + (inline ? 0 : 42) + 14 + 30 + P;
    card(c, w, h, pal, 40);
    text(c, (f.title ?? "").toUpperCase(), P, P, { size: 24, weight: 700, color: pal.sub }, w - P * 2);
    let y = P + 40;
    text(c, f.count, P - 2, y, big, w - P * 2);
    if (inline) text(c, f.unit, P + countW + 16, y + 97 - 50, unit);
    else {
      y += 42;
      text(c, f.unit, P, y + 60, unit, w - P * 2);
    }
    y += 97 + 14;
    // A small calendar mark, then the date.
    c.strokeStyle = pal.sub;
    c.lineWidth = 3;
    rr(c, P, y + 3, 24, 22, 4);
    c.stroke();
    c.fillStyle = pal.sub;
    c.fillRect(P, y + 3, 24, 7);
    text(c, f.targetDate, P + 36, y, { size: 24, weight: 500, color: pal.sub, lh: 1.2 }, w - P * 2 - 36);
    return { w, h };
  },

  nowPlaying(c, f, pal) {
    const w = 620;
    const art = 140;
    const h = P + art + 34 + 10 + 34 + 64 + P - 10;
    card(c, w, h, pal, 40);
    const g = c.createLinearGradient(P, P, P + art, P + art);
    g.addColorStop(0, pal.color);
    g.addColorStop(1, pal.theme === "dark" ? "#2c2c2e" : "#ffd3a1");
    fillRR(c, P, P, art, art, 22, g);
    text(c, "♪", P + art / 2, P + art / 2 - 50, { size: 80, weight: 700, color: "rgba(255,255,255,0.9)", align: "center", lh: 1.25 });
    const tx = P + art + 26;
    const tw = w - tx - P;
    text(c, f.songTitle, tx, P + 26, { size: 32, weight: 700, color: pal.fg }, tw);
    text(c, f.artist, tx, P + 72, { size: 26, weight: 500, color: pal.sub }, tw);
    let y = P + art + 34;
    const total = seconds(f.totalTime);
    const frac = total > 0 ? Math.max(0, Math.min(1, seconds(f.currentTime) / total)) : 0.4;
    const bw = w - P * 2;
    fillRR(c, P, y, bw, 8, 4, pal.line);
    fillRR(c, P, y, Math.max(8, bw * frac), 8, 4, pal.fg);
    c.beginPath();
    c.arc(P + bw * frac, y + 4, 9, 0, Math.PI * 2);
    c.fillStyle = pal.fg;
    c.fill();
    y += 18;
    text(c, f.currentTime, P, y, { size: 20, weight: 500, color: pal.sub, lh: 1.2 });
    text(c, f.totalTime, w - P, y, { size: 20, weight: 500, color: pal.sub, align: "right", lh: 1.2 });
    // ⏮ ⏸ ⏭
    const cy = y + 34 + 26;
    c.fillStyle = pal.fg;
    const tri = (x: number, dir: number, s: number) => {
      c.beginPath();
      c.moveTo(x, cy - s);
      c.lineTo(x + dir * s * 1.4, cy);
      c.lineTo(x, cy + s);
      c.closePath();
      c.fill();
    };
    const mid = w / 2;
    fillRR(c, mid - 16, cy - 22, 11, 44, 4, pal.fg);
    fillRR(c, mid + 5, cy - 22, 11, 44, 4, pal.fg);
    tri(mid - 90, -1, 16);
    tri(mid - 112, -1, 16);
    tri(mid + 90, 1, 16);
    tri(mid + 112, 1, 16);
    return { w, h };
  },

  starRating(c, f, pal) {
    const w = 540;
    const title: TextOpts = { size: 32, weight: 700, color: pal.fg };
    const com: TextOpts = { size: 26, weight: 400, color: pal.sub, lh: 1.35 };
    const titleL = wrap(c, f.title, title, w - P * 2, 2);
    const comL = f.comment ? wrap(c, f.comment, com, w - P * 2, 4) : [];
    const h = P + 48 + 18 + linesH(titleL.length, title) + (comL.length ? 6 + linesH(comL.length, com) : 0) + P;
    card(c, w, h, pal, 36);
    const s = f.stars ?? "";
    const full = (s.match(/★/g) ?? []).length;
    const empty = (s.match(/☆/g) ?? []).length;
    if (full + empty > 0) {
      for (let i = 0; i < Math.min(full + empty, 10); i++) {
        star(c, P + 22 + i * 50, P + 24, 22);
        c.fillStyle = i < full ? pal.ac : pal.line;
        c.fill();
      }
    } else text(c, s, P, P, { size: 34, weight: 700, color: pal.ac, lh: 1.4 }, w / 2);
    text(c, f.score, w - P, P + 4, { size: 26, weight: 700, color: pal.fg, align: "right", lh: 1.5 });
    let y = P + 48 + 18;
    y += drawLines(c, titleL, P, y, title);
    if (comL.length) drawLines(c, comL, P, y + 6, com);
    return { w, h };
  },

  poll(c, f, pal) {
    const w = 560;
    const q: TextOpts = { size: 34, weight: 700, color: pal.fg, align: "center", lh: 1.25 };
    const qL = wrap(c, f.question, q, w - P * 2, 3);
    const row = 76;
    const h = P + linesH(qL.length, q) + 24 + row * 2 + 14 + P;
    card(c, w, h, pal, 36);
    let y = P + drawLines(c, qL, w / 2, P, q) + 24;
    const bw = w - P * 2;
    for (const [opt, per] of [
      [f.optionA, f.percentA],
      [f.optionB, f.percentB],
    ]) {
      fillRR(c, P, y, bw, row, row / 2, pal.soft);
      const p = pct(per);
      if (p > 0) {
        c.save();
        rr(c, P, y, bw, row, row / 2);
        c.clip();
        const g = c.createLinearGradient(P, 0, P + bw, 0);
        g.addColorStop(0, pal.ac);
        g.addColorStop(1, pal.theme === "color" ? pal.ac : pal.color + "aa");
        c.globalAlpha = pal.theme === "color" ? 0.3 : 0.32;
        c.fillStyle = g;
        c.fillRect(P, y, bw * p, row);
        c.restore();
      }
      const perW = textW(c, per, { size: 28, weight: 800, color: pal.fg });
      text(c, opt, P + 28, y + (row - 36) / 2, { size: 27, weight: 600, color: pal.fg, lh: 36 / 27 }, bw - perW - 72);
      text(c, per, P + bw - 28, y + (row - 36) / 2, { size: 28, weight: 800, color: pal.theme === "color" ? pal.fg : pal.ac, align: "right", lh: 36 / 28 });
      y += row + 14;
    }
    return { w, h };
  },

  chatConvo(c, f, pal) {
    const w = 600;
    const msg: TextOpts = { size: 27, weight: 400, color: pal.fg, lh: 1.3 };
    const max = w * 0.68;
    const inL = f.incomingText ? wrap(c, f.incomingText, msg, max - 44, 5) : [];
    const outL = f.outgoingText ? wrap(c, f.outgoingText, msg, max - 44, 5) : [];
    const bubble = (n: number) => (n ? linesH(n, msg) + 30 : 0);
    const h = P + 60 + 24 + bubble(inL.length) + (inL.length && outL.length ? 12 : 0) + bubble(outL.length) + P;
    card(c, w, h, pal, 40);
    // Header: round avatar with the first letter, name, time.
    c.beginPath();
    c.arc(P + 30, P + 30, 30, 0, Math.PI * 2);
    c.fillStyle = pal.theme === "color" ? pal.soft : pal.color;
    c.fill();
    text(c, Array.from(f.senderName ?? "?")[0]?.toUpperCase() ?? "?", P + 30, P + 30 - 17, { size: 28, weight: 700, color: pal.theme === "color" ? pal.fg : pal.onAc, align: "center", lh: 34 / 28 });
    text(c, f.senderName, P + 76, P + 2, { size: 26, weight: 700, color: pal.fg, lh: 1.25 }, w - P * 2 - 80);
    text(c, f.timestamp, P + 76, P + 34, { size: 20, weight: 500, color: pal.sub, lh: 1.2 }, w - P * 2 - 80);
    let y = P + 60 + 24;
    const widest = (lines: string[]) => Math.max(...lines.map((l) => textW(c, l, msg)));
    if (inL.length) {
      const bw = widest(inL) + 44;
      fillRR(c, P, y, bw, bubble(inL.length), 26, pal.soft);
      drawLines(c, inL, P + 22, y + 15, msg);
      y += bubble(inL.length) + 12;
    }
    if (outL.length) {
      const bw = widest(outL) + 44;
      const bg = pal.theme === "color" ? pal.fg : pal.color;
      fillRR(c, w - P - bw, y, bw, bubble(outL.length), 26, bg);
      drawLines(c, outL, w - P - bw + 22, y + 15, { ...msg, color: pal.theme === "color" ? pal.bg : pal.onAc });
    }
    return { w, h };
  },

  phoneNotification(c, f, pal) {
    const w = 660;
    const p = 28;
    const title: TextOpts = { size: 28, weight: 700, color: pal.fg, lh: 1.28 };
    const body: TextOpts = { size: 26, weight: 400, color: pal.fg, lh: 1.3 };
    const titleL = f.title ? wrap(c, f.title, title, w - p * 2, 2) : [];
    const bodyL = f.body ? wrap(c, f.body, body, w - p * 2, 3) : [];
    const h = p + 44 + 14 + linesH(titleL.length, title) + linesH(bodyL.length, body) + p;
    const bg = pal.theme === "light" ? "rgba(246,246,248,0.96)" : pal.theme === "dark" ? "rgba(44,44,46,0.96)" : pal.bg;
    card(c, w, h, pal, 40, bg);
    fillRR(c, p, p, 44, 44, 11, pal.theme === "color" ? pal.soft : pal.color);
    // A bell on the app icon.
    c.fillStyle = pal.theme === "color" ? pal.fg : pal.onAc;
    c.beginPath();
    c.moveTo(p + 12, p + 30);
    c.quadraticCurveTo(p + 14, p + 10, p + 22, p + 10);
    c.quadraticCurveTo(p + 30, p + 10, p + 32, p + 30);
    c.closePath();
    c.fill();
    c.beginPath();
    c.arc(p + 22, p + 33, 4, 0, Math.PI * 2);
    c.fill();
    const ago = textW(c, f.timeAgo, { size: 22, color: pal.sub });
    text(c, (f.appName ?? "").toUpperCase(), p + 58, p + 8, { size: 22, weight: 600, color: pal.sub, lh: 28 / 22 }, w - p * 2 - 70 - ago);
    text(c, f.timeAgo, w - p, p + 8, { size: 22, weight: 400, color: pal.sub, align: "right", lh: 28 / 22 });
    let y = p + 44 + 14;
    y += drawLines(c, titleL, p, y, title);
    drawLines(c, bodyL, p, y, body);
    return { w, h };
  },

  questionBox(c, f, pal) {
    const w = 560;
    const head: TextOpts = { size: 28, weight: 700, color: pal.theme === "color" ? pal.fg : pal.onAc, align: "center", lh: 1.25 };
    const q: TextOpts = { size: 32, weight: 700, color: pal.fg, align: "center", lh: 1.28 };
    const a: TextOpts = { size: 26, weight: 500, color: pal.sub, align: "center", lh: 1.32 };
    const headL = wrap(c, f.prompt, head, w - P * 2, 2);
    const qL = wrap(c, f.question, q, w - P * 2, 3);
    const aL = f.answer ? wrap(c, f.answer, a, w - P * 2 - 40, 3) : [];
    const headH = linesH(headL.length, head) + 44;
    const h = headH + 26 + linesH(qL.length, q) + (aL.length ? 20 + linesH(aL.length, a) + 32 : 0) + P - 6;
    card(c, w, h, pal, 34);
    c.save();
    rr(c, 0, 0, w, h, 34);
    c.clip();
    if (pal.theme === "color") c.fillStyle = "rgba(0,0,0,0.16)";
    else {
      const g = c.createLinearGradient(0, 0, w, headH);
      g.addColorStop(0, pal.color);
      g.addColorStop(1, "#fd1d1d");
      c.fillStyle = g;
    }
    c.fillRect(0, 0, w, headH);
    c.restore();
    drawLines(c, headL, w / 2, 22, head);
    let y = headH + 26;
    y += drawLines(c, qL, w / 2, y, q);
    if (aL.length) {
      y += 20;
      fillRR(c, P, y, w - P * 2, linesH(aL.length, a) + 32, 20, pal.soft);
      drawLines(c, aL, w / 2, y + 16, a);
    }
    return { w, h };
  },

  priceTag(c, f, pal) {
    const w = 500;
    const name: TextOpts = { size: 30, weight: 700, color: pal.fg, lh: 1.25 };
    const nameL = wrap(c, f.itemName, name, w - P * 2, 2);
    const h = P + 44 + 18 + linesH(nameL.length, name) + 10 + 34 + 70 + P - 10;
    card(c, w, h, pal, 28);
    // The tag's eyelet.
    c.beginPath();
    c.arc(P + 14, P + 22, 13, 0, Math.PI * 2);
    c.fillStyle = pal.soft;
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = pal.line;
    c.stroke();
    if (f.badge) {
      const bwid = textW(c, f.badge, { size: 22, weight: 800, color: "" }) + 32;
      fillRR(c, w - P - bwid, P + 2, bwid, 40, 20, pal.theme === "color" ? pal.fg : pal.color);
      text(c, f.badge, w - P - bwid / 2, P + 2, { size: 22, weight: 800, color: pal.theme === "color" ? pal.bg : pal.onAc, align: "center", lh: 40 / 22 });
    }
    let y = P + 44 + 18;
    y += drawLines(c, nameL, P, y, name) + 10;
    if (f.originalPrice) text(c, f.originalPrice, P, y, { size: 26, weight: 500, color: pal.sub, strike: true, lh: 34 / 26 }, w - P * 2);
    y += 34;
    text(c, f.salePrice, P - 2, y, { size: 58, weight: 800, color: pal.theme === "light" ? pal.ac : pal.fg, lh: 70 / 58 }, w - P * 2);
    return { w, h };
  },

  hashtagPill(c, f, pal) {
    const o: TextOpts = { size: 28, weight: 700, color: pal.theme === "color" ? pal.fg : pal.ac, lh: 56 / 28 };
    const tags = [f.tag1, f.tag2, f.tag3].filter((s) => s?.trim());
    const pad = 26;
    const max = 640;
    const sizes = tags.map((s) => Math.min(max, textW(c, s, o) + pad * 2));
    // Rows of pills, each row as wide as fits.
    const rows: number[][] = [];
    let cur: number[] = [];
    let curW = 0;
    sizes.forEach((sw, i) => {
      if (cur.length && curW + 12 + sw > max) {
        rows.push(cur);
        cur = [];
        curW = 0;
      }
      curW += (cur.length ? 12 : 0) + sw;
      cur.push(i);
    });
    if (cur.length) rows.push(cur);
    const rowW = (r: number[]) => r.reduce((a, i) => a + sizes[i], 0) + (r.length - 1) * 12;
    const w = Math.max(120, ...rows.map(rowW));
    const h = Math.max(56, rows.length * 56 + (rows.length - 1) * 12);
    rows.forEach((r, ri) => {
      let x = (w - rowW(r)) / 2;
      const y = ri * 68;
      for (const i of r) {
        c.save();
        c.shadowColor = "rgba(0,0,0,0.14)";
        c.shadowBlur = 14;
        c.shadowOffsetY = 4;
        fillRR(c, x, y, sizes[i], 56, 28, pal.bg);
        c.restore();
        text(c, tags[i], x + pad, y, o, sizes[i] - pad * 2);
        x += sizes[i] + 12;
      }
    });
    return { w, h };
  },

  mentionTag(c, f, pal) {
    const handle: TextOpts = { size: 28, weight: 700, color: pal.fg, lh: 1.2 };
    const role: TextOpts = { size: 22, weight: 500, color: pal.sub, lh: 1.2 };
    const inner = Math.max(textW(c, f.handle, handle), f.role ? textW(c, f.role, role) : 0);
    const w = Math.min(640, 18 + 60 + 18 + inner + 34);
    const h = 96;
    card(c, w, h, pal, 48);
    const g = c.createLinearGradient(18, 18, 78, 78);
    g.addColorStop(0, "#feda75");
    g.addColorStop(0.5, pal.color);
    g.addColorStop(1, "#4f5bd5");
    c.beginPath();
    c.arc(48, 48, 30, 0, Math.PI * 2);
    c.fillStyle = g;
    c.fill();
    text(c, "@", 48, 48 - 18, { size: 30, weight: 700, color: "#ffffff", align: "center", lh: 1.2 });
    const tw = w - 96 - 34;
    if (f.role) {
      text(c, f.handle, 96, 16, handle, tw);
      text(c, f.role, 96, 52, role, tw);
    } else text(c, f.handle, 96, 48 - 17, handle, tw);
    return { w, h };
  },

  progressBar(c, f, pal) {
    const w = 560;
    const st: TextOpts = { size: 24, weight: 500, color: pal.sub, lh: 1.3 };
    const stL = f.status ? wrap(c, f.status, st, w - P * 2, 2) : [];
    const h = P + 36 + 16 + 24 + (stL.length ? 16 + linesH(stL.length, st) : 0) + P;
    card(c, w, h, pal, 36);
    const perW = textW(c, f.percentage, { size: 28, weight: 800, color: "" });
    text(c, f.label, P, P, { size: 28, weight: 700, color: pal.fg, lh: 36 / 28 }, w - P * 2 - perW - 16);
    text(c, f.percentage, w - P, P, { size: 28, weight: 800, color: pal.ac, align: "right", lh: 36 / 28 });
    const y = P + 36 + 16;
    const bw = w - P * 2;
    fillRR(c, P, y, bw, 24, 12, pal.soft);
    const p = pct(f.percentage);
    if (p > 0) fillRR(c, P, y, Math.max(24, bw * p), 24, 12, pal.ac);
    if (stL.length) drawLines(c, stL, P, y + 24 + 16, st);
    return { w, h };
  },

  boardingPass(c, f, pal) {
    const w = 660;
    const band = 72;
    const h = band + 28 + 84 + 30 + 34 + 26 + 30 + 34 + P;
    card(c, w, h, pal, 32);
    c.save();
    rr(c, 0, 0, w, h, 32);
    c.clip();
    c.fillStyle = pal.theme === "color" ? "rgba(0,0,0,0.18)" : pal.color;
    c.fillRect(0, 0, w, band);
    c.restore();
    const onBand = pal.theme === "color" ? pal.fg : pal.onAc;
    text(c, "BOARDING PASS", P, 0, { size: 22, weight: 800, color: onBand, lh: band / 22 });
    text(c, f.flight, w - P, 0, { size: 24, weight: 700, color: onBand, family: MONO, align: "right", lh: band / 24 });
    let y = band + 28;
    const code: TextOpts = { size: 76, weight: 800, color: pal.fg, family: MONO, lh: 84 / 76 };
    text(c, f.fromCode, P, y, code, 220);
    text(c, f.toCode, w - P, y, { ...code, align: "right" }, 220);
    // Plane between the codes on a dotted path.
    const mid = w / 2;
    dashed(c, mid - 80, y + 42, mid + 80, pal.line, 3, [6, 8]);
    c.save();
    c.translate(mid, y + 42);
    c.fillStyle = pal.ac;
    c.beginPath();
    c.moveTo(24, 0);
    c.lineTo(-8, -6);
    c.lineTo(-18, -24);
    c.lineTo(-24, -24);
    c.lineTo(-18, -5);
    c.lineTo(-26, -4);
    c.lineTo(-32, -12);
    c.lineTo(-36, -12);
    c.lineTo(-32, 0);
    c.lineTo(-36, 12);
    c.lineTo(-32, 12);
    c.lineTo(-26, 4);
    c.lineTo(-18, 5);
    c.lineTo(-24, 24);
    c.lineTo(-18, 24);
    c.lineTo(-8, 6);
    c.closePath();
    c.fill();
    c.restore();
    y += 84;
    text(c, f.fromCity, P, y, { size: 22, weight: 500, color: pal.sub, lh: 30 / 22 }, 250);
    text(c, f.toCity, w - P, y, { size: 22, weight: 500, color: pal.sub, align: "right", lh: 30 / 22 }, 250);
    y += 30 + 17;
    dashed(c, P, y, w - P, pal.line, 3, [12, 10]);
    y += 17 + 26;
    const cols: [string, string][] = [
      ["FLIGHT", f.flight],
      ["DATE", f.date],
      ["SEAT", f.seat],
    ];
    const cw = (w - P * 2) / 3;
    cols.forEach(([k, v], i) => {
      const x = P + cw * i;
      text(c, k, x, y - 26, { size: 18, weight: 700, color: pal.sub, lh: 26 / 18 }, cw - 10);
      text(c, v, x, y + 2, { size: 28, weight: 800, color: pal.fg, family: MONO, lh: 34 / 28 }, cw - 10);
    });
    return { w, h };
  },

  recipeCard(c, f, pal) {
    const w = 580;
    const bg = pal.theme === "light" ? "#fffaf0" : pal.bg;
    const dish: TextOpts = { size: 38, weight: 700, color: pal.fg, family: SERIF, lh: 1.2 };
    const ing: TextOpts = { size: 25, weight: 400, color: pal.fg, lh: 1.32 };
    const tip: TextOpts = { size: 23, weight: 400, color: pal.sub, italic: true, lh: 1.32 };
    const dishL = wrap(c, f.dishName, dish, w - P * 2, 2);
    const items = (f.ingredients ?? "").split(/•|\n|;/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
    const itemL = items.map((s) => wrap(c, s, ing, w - P * 2 - 30, 2));
    const tipL = f.tip ? wrap(c, `💡 ${f.tip}`, tip, w - P * 2 - 40, 3) : [];
    const itemsH = itemL.reduce((a, l) => a + linesH(l.length, ing) + 6, 0);
    const h = P + linesH(dishL.length, dish) + 12 + 32 + 22 + 3 + 20 + itemsH + (tipL.length ? 14 + linesH(tipL.length, tip) + 28 : 0) + P;
    card(c, w, h, pal, 28, bg);
    let y = P;
    y += drawLines(c, dishL, P, y, dish) + 12;
    const meta = [f.prepTime && `⏱️ ${f.prepTime}`, f.servings && `🍽️ ${f.servings}`].filter(Boolean).join("   ·   ");
    text(c, meta, P, y, { size: 24, weight: 500, color: pal.sub, lh: 32 / 24 }, w - P * 2);
    y += 32 + 22;
    fillRR(c, P, y, 64, 4, 2, pal.ac);
    y += 3 + 20;
    itemL.forEach((l) => {
      c.beginPath();
      c.arc(P + 8, y + ing.size * 0.65, 6, 0, Math.PI * 2);
      c.fillStyle = pal.ac;
      c.fill();
      y += drawLines(c, l, P + 30, y, ing) + 6;
    });
    if (tipL.length) {
      y += 14;
      fillRR(c, P, y, w - P * 2, linesH(tipL.length, tip) + 28, 18, pal.soft);
      drawLines(c, tipL, P + 20, y + 14, tip);
    }
    return { w, h };
  },

  filmExif(c, f, pal) {
    const w = 620;
    const strip = 30;
    const h = strip + 26 + 40 + 6 + 34 + 6 + 34 + 6 + 34 + 26 + strip;
    const bg = pal.theme === "light" ? "#f4efe4" : pal.theme === "dark" ? "#141414" : pal.bg;
    card(c, w, h, pal, 10, bg);
    // Sprocket holes along both edges.
    const hole = pal.theme === "light" ? "#ffffff" : pal.theme === "dark" ? "#3a3a3a" : pal.soft;
    for (let x = 16; x < w - 20; x += 40) {
      fillRR(c, x, 8, 22, 14, 3, hole);
      fillRR(c, x, h - 22, 22, 14, 3, hole);
    }
    const fg = pal.theme === "light" ? "#1a1a1a" : pal.fg;
    const ac = pal.theme === "color" ? pal.fg : pal.color;
    let y = strip + 26;
    text(c, f.camera, P, y, { size: 32, weight: 800, color: fg, family: MONO, lh: 40 / 32 }, w - P * 2);
    y += 46;
    text(c, f.lens, P, y, { size: 24, weight: 500, color: fg, family: MONO, lh: 34 / 24 }, w - P * 2);
    y += 40;
    text(c, f.settings, P, y, { size: 24, weight: 700, color: ac, family: MONO, lh: 34 / 24 }, w - P * 2);
    y += 40;
    text(c, f.filmStock, P, y, { size: 24, weight: 500, color: pal.theme === "light" ? "#6b6457" : pal.sub, family: MONO, lh: 34 / 24 }, w - P * 2);
    return { w, h };
  },

  checklist(c, f, pal) {
    const w = 540;
    const title: TextOpts = { size: 32, weight: 800, color: pal.fg, lh: 1.25 };
    const item: TextOpts = { size: 26, weight: 500, color: pal.fg, lh: 1.3 };
    const titleL = f.title ? wrap(c, f.title, title, w - P * 2, 2) : [];
    const items = [f.item1, f.item2, f.item3]
      .filter((s) => s?.trim())
      .map((s) => {
        const done = /^\s*(☑|✅|✔|✓|\[x\])/i.test(s);
        const label = s.replace(/^\s*(☑️?|✅|✔️?|✓|☐|□|\[x\]|\[ \])\s*/i, "");
        return { done, lines: wrap(c, label, item, w - P * 2 - 54, 2) };
      });
    const rowH = (n: number) => Math.max(36, linesH(n, item));
    const h = P + (titleL.length ? linesH(titleL.length, title) + 18 : 0) + items.reduce((a, it) => a + rowH(it.lines.length) + 14, 0) - (items.length ? 14 : 0) + P;
    card(c, w, h, pal, 36);
    let y = P;
    if (titleL.length) y += drawLines(c, titleL, P, y, title) + 18;
    for (const it of items) {
      const by = y + Math.min(rowH(it.lines.length), 36) / 2 - 17 + 1;
      if (it.done) {
        fillRR(c, P, by, 34, 34, 10, pal.ac);
        c.strokeStyle = pal.theme === "color" ? pal.bg : pal.onAc;
        c.lineWidth = 4;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(P + 8, by + 18);
        c.lineTo(P + 15, by + 25);
        c.lineTo(P + 27, by + 10);
        c.stroke();
      } else {
        rr(c, P + 1.5, by + 1.5, 31, 31, 9);
        c.strokeStyle = pal.sub;
        c.lineWidth = 3;
        c.stroke();
      }
      drawLines(c, it.lines, P + 54, y + (rowH(it.lines.length) - linesH(it.lines.length, item)) / 2, { ...item, color: it.done ? pal.sub : pal.fg, strike: it.done });
      y += rowH(it.lines.length) + 14;
    }
    return { w, h };
  },

  moodMeter(c, f, pal) {
    const w = 540;
    const mood: TextOpts = { size: 32, weight: 700, color: pal.fg, lh: 1.25 };
    const moodL = wrap(c, f.moodText, mood, w - P * 2 - 118, 3);
    const rowH = Math.max(96, linesH(moodL.length, mood));
    const h = P + 30 + 16 + rowH + 28 + 20 + P;
    card(c, w, h, pal, 36);
    text(c, (f.label ?? "").toUpperCase(), P, P, { size: 22, weight: 700, color: pal.sub, lh: 30 / 22 }, w - P * 2);
    let y = P + 30 + 16;
    text(c, f.emoji, P, y + rowH / 2 - 50, { size: 80, color: pal.fg, lh: 100 / 80 }, 110);
    drawLines(c, moodL, P + 118, y + (rowH - linesH(moodL.length, mood)) / 2, mood);
    y += rowH + 28;
    const bw = w - P * 2;
    const g = c.createLinearGradient(P, 0, P + bw, 0);
    g.addColorStop(0, "#7cc6ff");
    g.addColorStop(0.5, "#ffd166");
    g.addColorStop(1, pal.theme === "color" ? "#ffffff" : pal.color);
    fillRR(c, P, y, bw, 20, 10, g);
    const kx = P + 10 + (bw - 20) * pct(f.level);
    c.save();
    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowBlur = 8;
    c.beginPath();
    c.arc(kx, y + 10, 17, 0, Math.PI * 2);
    c.fillStyle = "#ffffff";
    c.fill();
    c.restore();
    return { w, h };
  },

  searchBar(c, f, pal) {
    const w = 660;
    const bar = 88;
    const top = f.hint ? 40 : 0;
    const h = top + bar;
    if (f.hint) text(c, f.hint, 20, 0, { size: 24, weight: 600, color: pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#ffffff" : "#111111", lh: 32 / 24 }, w - 40);
    c.save();
    c.shadowColor = "rgba(0,0,0,0.16)";
    c.shadowBlur = 22;
    c.shadowOffsetY = 6;
    fillRR(c, 0, top, w, bar, bar / 2, pal.bg);
    c.restore();
    // Magnifier.
    c.strokeStyle = pal.theme === "light" ? pal.ac : pal.sub;
    c.lineWidth = 4.5;
    c.lineCap = "round";
    c.beginPath();
    c.arc(46, top + bar / 2 - 4, 14, 0, Math.PI * 2);
    c.moveTo(56, top + bar / 2 + 6);
    c.lineTo(66, top + bar / 2 + 16);
    c.stroke();
    text(c, f.query, 88, top + bar / 2 - 19, { size: 29, weight: 500, color: pal.fg, lh: 38 / 29 }, w - 88 - 72);
    // Cursor + clear button.
    fillRR(c, w - 52 - 18, top + bar / 2 - 18, 36, 36, 18, pal.soft);
    c.strokeStyle = pal.sub;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(w - 52 - 7, top + bar / 2 - 7);
    c.lineTo(w - 52 + 7, top + bar / 2 + 7);
    c.moveTo(w - 52 + 7, top + bar / 2 - 7);
    c.lineTo(w - 52 - 7, top + bar / 2 + 7);
    c.stroke();
    return { w, h };
  },

  bookQuote(c, f, pal) {
    const w = 580;
    const bg = pal.theme === "light" ? "#fbf7ee" : pal.theme === "dark" ? "#1f1d1a" : pal.bg;
    const quote: TextOpts = { size: 33, weight: 400, color: pal.fg, family: SERIF, lh: 1.38 };
    const quoteL = wrap(c, f.thought, quote, w - P * 2, 6);
    const h = P + 30 + 56 + linesH(quoteL.length, quote) + 26 + 2 + 18 + 28 + P;
    card(c, w, h, pal, 24, bg);
    text(c, f.heading, P, P, { size: 23, weight: 400, color: pal.sub, family: SERIF, italic: true, lh: 30 / 23 }, w - P * 2);
    text(c, "“", P - 4, P + 22, { size: 110, weight: 700, color: pal.ac, family: SERIF, lh: 1 });
    let y = P + 30 + 56;
    y += drawLines(c, quoteL, P, y, quote) + 26;
    c.fillStyle = pal.line;
    c.fillRect(P, y, w - P * 2, 2);
    y += 18;
    text(c, f.page, P, y, { size: 22, weight: 400, color: pal.sub, family: SERIF, lh: 28 / 22 }, w / 2 - P);
    text(c, f.date, w - P, y, { size: 22, weight: 400, color: pal.sub, family: SERIF, align: "right", lh: 28 / 22 }, w / 2 - P);
    return { w, h };
  },

  receipt(c, f, pal) {
    const w = 480;
    const teeth = 14;
    const bg = pal.theme === "light" ? "#ffffff" : pal.theme === "dark" ? "#232323" : pal.bg;
    const fg = pal.theme === "color" ? pal.fg : pal.theme === "dark" ? "#f2f2f2" : "#1a1a1a";
    const store: TextOpts = { size: 28, weight: 800, color: fg, family: MONO, align: "center", lh: 1.25 };
    const ln: TextOpts = { size: 21, weight: 500, color: fg, family: MONO, lh: 1.35 };
    const tot: TextOpts = { size: 25, weight: 800, color: fg, family: MONO, align: "center", lh: 1.3 };
    const storeL = wrap(c, f.storeName, store, w - P * 2, 2);
    const lines = [f.line1, f.line2, f.line3].filter((s) => s?.trim()).map((s) => wrap(c, s, ln, w - P * 2, 2));
    const totL = f.total ? wrap(c, f.total, tot, w - P * 2, 2) : [];
    const linesHt = lines.reduce((a, l) => a + linesH(l.length, ln) + 6, 0);
    const h = teeth + 28 + linesH(storeL.length, store) + 20 + 2 + 20 + linesHt + 14 + 2 + 20 + linesH(totL.length, tot) + 24 + 56 + 28 + teeth;
    // Paper with zig-zag top and bottom edges.
    c.save();
    c.shadowColor = "rgba(0,0,0,0.16)";
    c.shadowBlur = 22;
    c.shadowOffsetY = 6;
    c.beginPath();
    const n = Math.round(w / (teeth * 2));
    const step = w / n;
    c.moveTo(0, teeth);
    for (let i = 0; i < n; i++) {
      c.lineTo(i * step + step / 2, 0);
      c.lineTo((i + 1) * step, teeth);
    }
    c.lineTo(w, h - teeth);
    for (let i = n; i > 0; i--) {
      c.lineTo(i * step - step / 2, h);
      c.lineTo((i - 1) * step, h - teeth);
    }
    c.closePath();
    c.fillStyle = bg;
    c.fill();
    c.restore();
    let y = teeth + 28;
    y += drawLines(c, storeL, w / 2, y, store) + 20;
    dashed(c, P, y, w - P, fg, 2, [6, 6]);
    y += 2 + 20;
    for (const l of lines) y += drawLines(c, l, P, y, ln) + 6;
    y += 14;
    dashed(c, P, y, w - P, fg, 2, [6, 6]);
    y += 2 + 20;
    y += drawLines(c, totL, w / 2, y, tot) + 24;
    // Barcode, from the store name so it stays the same.
    let seed = 7;
    for (const ch of f.storeName ?? "") seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
    c.fillStyle = fg;
    let x = P + 20;
    while (x < w - P - 20) {
      seed = (seed * 73 + 41) % 9973;
      const bw = 2 + (seed % 3) * 2;
      if (x + bw > w - P - 20) break;
      c.fillRect(x, y, bw, 56);
      x += bw + 2 + ((seed >> 3) % 3) * 2;
    }
    return { w, h };
  },

  stepCounter(c, f, pal) {
    const w = 540;
    const cap: TextOpts = { size: 25, weight: 500, color: pal.fg, lh: 1.32 };
    const capL = f.caption ? wrap(c, f.caption, cap, w - P * 2, 3) : [];
    const ring = 150;
    const h = P + ring + (capL.length ? 22 + linesH(capL.length, cap) : 0) + P;
    card(c, w, h, pal, 40);
    const cx = P + ring / 2;
    const cy = P + ring / 2;
    c.lineWidth = 18;
    c.lineCap = "round";
    c.beginPath();
    c.arc(cx, cy, ring / 2 - 9, 0, Math.PI * 2);
    c.strokeStyle = pal.soft;
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, ring / 2 - 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.78);
    c.strokeStyle = pal.ac;
    c.stroke();
    text(c, "👟", cx, cy - 27, { size: 44, align: "center", color: pal.fg, lh: 54 / 44 });
    const tx = P + ring + 28;
    const tw = w - tx - P;
    const steps: TextOpts = { size: 40, weight: 800, color: pal.fg, lh: 1.15 };
    const stepsL = wrap(c, f.steps, steps, tw, 2);
    const block = linesH(stepsL.length, steps) + 8 + 32;
    let y = P + (ring - block) / 2;
    y += drawLines(c, stepsL, tx, y, steps) + 8;
    text(c, f.distance, tx, y, { size: 26, weight: 600, color: pal.sub, lh: 32 / 26 }, tw);
    if (capL.length) drawLines(c, capL, P, P + ring + 22, cap);
    return { w, h };
  },
};

let scratch: C | null = null;
const sizes = new Map<string, { w: number; h: number }>();

/** Size of the card at its base scale (measured once per content). */
export function widgetSize(w: WidgetData, color: string, locale: Locale = "vi") {
  const key = JSON.stringify([w, color]);
  const hit = sizes.get(key);
  if (hit) return hit;
  scratch ??= document.createElement("canvas").getContext("2d");
  if (!scratch) return { w: 500, h: 300 };
  scratch.save();
  const size = KINDS[w.kind](scratch, w.fields, palette(w.theme, color), locale);
  scratch.restore();
  if (sizes.size > 400) sizes.clear();
  sizes.set(key, size);
  return size;
}

/** Draws the card into a `width` px wide box from the context's origin. */
export function drawWidget(c: C, w: WidgetData, color: string, width: number, locale: Locale = "vi") {
  const base = widgetSize(w, color, locale);
  c.save();
  c.scale(width / base.w, width / base.w);
  KINDS[w.kind](c, w.fields, palette(w.theme, color), locale);
  c.restore();
}

const thumbs = new Map<string, string>();

/** A small picture of a kind with its sample texts, for the library. */
export function widgetThumb(kind: CardWidgetKind, locale: Locale, width = 360) {
  const key = `${kind}:${locale}:${width}`;
  const hit = thumbs.get(key);
  if (hit) return hit;
  const data = newWidgetData(kind, locale);
  const color = WIDGET_ACCENT[kind];
  const size = widgetSize(data, color, locale);
  // Room for the shadow around the card.
  const pad = 14;
  const k = width / (size.w + pad * 2);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.ceil((size.h + pad * 2) * k);
  const c = canvas.getContext("2d");
  if (!c) return "";
  c.scale(k, k);
  c.translate(pad, pad);
  drawWidget(c, data, color, size.w, locale);
  const url = canvas.toDataURL("image/png");
  thumbs.set(key, url);
  return url;
}

/** How the library groups the kinds. */
export const WIDGET_GROUPS: { id: "info" | "social" | "keepsake"; kinds: CardWidgetKind[] }[] = [
  { id: "social", kinds: ["poll", "questionBox", "chatConvo", "phoneNotification", "hashtagPill", "mentionTag", "searchBar", "starRating"] },
  { id: "info", kinds: ["weather", "calendarDate", "countdown", "nowPlaying", "progressBar", "stepCounter", "moodMeter", "checklist"] },
  { id: "keepsake", kinds: ["boardingPass", "receipt", "priceTag", "filmExif", "recipeCard", "bookQuote"] },
];
