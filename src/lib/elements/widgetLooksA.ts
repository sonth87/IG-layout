// More looks of the info widgets (D-121): calendar day, countdown, weather, quote, now
// playing. One widget, one job; the looks change its shape and its material.
import {
  type C,
  type F,
  type Pal,
  type TextOpts,
  MONO,
  SERIF,
  HAND,
  MARKER,
  TYPEWRITER,
  bare,
  blackboard,
  card,
  chalkText,
  dateOf,
  drawLines,
  fillRR,
  isVi,
  lifted,
  linesH,
  onPhoto,
  rr,
  seconds,
  seeded,
  tape,
  text,
  textW,
  wrap,
} from "./widgetKit";

type Size = { w: number; h: number };
const P = 36;

// ---------------------------------------------------------------- calendar day

export function calendarLook(c: C, f: F, pal: Pal, v: string): Size {
  switch (v) {
    case "pill":
      return dayPill(c, f, pal);
    case "desk":
      return dayDesk(c, f, pal);
    case "filmStamp":
      return dayFilmStamp(c, f);
    case "big":
      return dayBig(c, f, pal);
    case "month":
      return dayMonth(c, f, pal);
    default:
      return dayWeek(c, f, pal);
  }
}

function dayPill(c: C, f: F, pal: Pal): Size {
  const t1: TextOpts = { size: 28, weight: 800, color: pal.fg, lh: 1.2 };
  const t2: TextOpts = { size: 22, weight: 500, color: pal.sub, lh: 1.2 };
  const inner = Math.max(textW(c, f.weekday, t1), textW(c, f.month, t2));
  const w = Math.min(640, 14 + 76 + 18 + inner + 36);
  const h = 104;
  card(c, w, h, pal, 52);
  c.beginPath();
  c.arc(14 + 38, h / 2, 38, 0, Math.PI * 2);
  c.fillStyle = pal.theme === "color" ? pal.fg : pal.color;
  c.fill();
  text(c, f.day, 14 + 38, h / 2 - 24, { size: 36, weight: 800, color: pal.theme === "color" ? pal.bg : pal.onAc, align: "center", lh: 48 / 36 });
  text(c, f.weekday, 108, 20, t1, w - 130);
  text(c, f.month, 108, 56, t2, w - 130);
  return { w, h };
}

/** A tent calendar on a desk: two rings, a header, the big day. */
function dayDesk(c: C, f: F, pal: Pal): Size {
  const w = 440;
  const h = 420;
  // Back leg.
  c.save();
  c.fillStyle = pal.theme === "dark" ? "#111113" : "#d8d4cc";
  c.beginPath();
  c.moveTo(40, 40);
  c.lineTo(w - 40, 40);
  c.lineTo(w - 10, h - 10);
  c.lineTo(10, h - 10);
  c.closePath();
  c.fill();
  c.restore();
  lifted(c, () => fillRR(c, 30, 40, w - 60, h - 70, 18, pal.bg), 20, 10, 0.22);
  c.save();
  rr(c, 30, 40, w - 60, h - 70, 18);
  c.clip();
  c.fillStyle = pal.theme === "color" ? "rgba(0,0,0,0.18)" : pal.color;
  c.fillRect(30, 40, w - 60, 80);
  c.restore();
  // Rings.
  for (const x of [130, w - 130]) {
    fillRR(c, x - 9, 20, 18, 44, 9, "#9a9a9e");
    fillRR(c, x - 5, 24, 10, 36, 5, "#d9d9dc");
  }
  text(c, (f.month ?? "").toUpperCase(), w / 2, 60, { size: 28, weight: 800, color: pal.theme === "color" ? pal.fg : pal.onAc, align: "center", lh: 1.4 }, w - 100);
  text(c, f.day, w / 2, 126, { size: 150, weight: 800, color: pal.fg, align: "center", lh: 1.1 }, w - 80);
  text(c, f.weekday, w / 2, 300, { size: 28, weight: 600, color: pal.sub, align: "center", lh: 1.3 }, w - 100);
  return { w, h };
}

/** The orange date a film camera prints in the corner: '26 10 19. */
function dayFilmStamp(c: C, f: F): Size {
  const d = dateOf(f);
  const s = `'${String(d.getFullYear()).slice(2)}  ${d.getMonth() + 1}  ${d.getDate()}`;
  const o: TextOpts = { size: 110, weight: 700, color: "#ff9a3c", family: '"DS-Digital", "Digital-7", ' + MONO, lh: 1.1 };
  const w = textW(c, s, o) + 40;
  const h = 150;
  c.save();
  c.shadowColor = "#ff6a00";
  for (const blur of [26, 10]) {
    c.shadowBlur = blur;
    text(c, s, 20, 14, { ...o, color: "rgba(255,140,40,0.85)" });
  }
  c.restore();
  text(c, s, 20, 14, { ...o, color: "#ffc27a" });
  return { w, h };
}

function dayBig(c: C, f: F, pal: Pal): Size {
  const ink = bare(pal);
  const big: TextOpts = { size: 230, weight: 800, color: ink, lh: 1 };
  const dw = textW(c, f.day, big);
  const side = Math.max(textW(c, f.weekday, { size: 34, weight: 700, color: "" }), textW(c, f.month, { size: 30, weight: 500, color: "" }));
  const w = dw + 30 + side + 10;
  const h = 240;
  onPhoto(c, pal, () => {
    text(c, f.day, 0, 0, big);
    c.fillStyle = ink;
    c.fillRect(dw + 14, 60, 4, 120);
    text(c, f.weekday, dw + 32, 66, { size: 34, weight: 700, color: ink, lh: 1.3 });
    text(c, f.month, dw + 32, 116, { size: 30, weight: 500, color: ink, lh: 1.3 });
  });
  return { w, h };
}

const WEEK_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WEEK_EN = ["M", "T", "W", "T", "F", "S", "S"];

/** The month as a grid, the day circled. */
function dayMonth(c: C, f: F, pal: Pal): Size {
  const d = dateOf(f);
  const vi = isVi(f.month, f.weekday);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const rows = Math.ceil((lead + days) / 7);
  const cell = 64;
  const w = P * 2 + cell * 7;
  const h = P + 50 + 14 + 36 + rows * cell + P - 10;
  card(c, w, h, pal, 36);
  const title = vi ? `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}` : `${first.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()}`;
  text(c, title, P, P, { size: 34, weight: 800, color: pal.fg, lh: 1.3 }, w - P * 2);
  const heads = vi ? WEEK_VI : WEEK_EN;
  heads.forEach((hd, i) => text(c, hd, P + cell * i + cell / 2, P + 64, { size: 20, weight: 700, color: i > 4 ? pal.ac : pal.sub, align: "center", lh: 1.2 }));
  for (let n = 1; n <= days; n++) {
    const idx = lead + n - 1;
    const x = P + (idx % 7) * cell + cell / 2;
    const y = P + 100 + Math.floor(idx / 7) * cell + cell / 2;
    const on = n === d.getDate();
    if (on) {
      c.beginPath();
      c.arc(x, y, 27, 0, Math.PI * 2);
      c.fillStyle = pal.theme === "color" ? pal.fg : pal.color;
      c.fill();
    }
    text(c, String(n), x, y - 15, { size: 24, weight: on ? 800 : 500, color: on ? (pal.theme === "color" ? pal.bg : pal.onAc) : pal.fg, align: "center", lh: 30 / 24 });
  }
  return { w, h };
}

/** Seven days around the date, the day circled. */
function dayWeek(c: C, f: F, pal: Pal): Size {
  const d = dateOf(f);
  const vi = isVi(f.month, f.weekday);
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const cell = 84;
  const w = P * 2 + cell * 7 - 20;
  const h = P + 30 + 14 + 100 + P;
  card(c, w, h, pal, 36);
  text(c, f.note || f.month, P, P - 4, { size: 24, weight: 700, color: pal.sub, lh: 1.3 }, w - P * 2);
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const x = P + i * cell;
    const on = day.getDate() === d.getDate();
    if (on) fillRR(c, x - 4, P + 40, cell - 12, 100, 22, pal.theme === "color" ? pal.fg : pal.color);
    const col = on ? (pal.theme === "color" ? pal.bg : pal.onAc) : pal.fg;
    text(c, (vi ? WEEK_VI : WEEK_EN)[i], x + (cell - 20) / 2, P + 52, { size: 20, weight: 700, color: on ? col : pal.sub, align: "center", lh: 1.2 });
    text(c, String(day.getDate()), x + (cell - 20) / 2, P + 84, { size: 34, weight: 800, color: col, align: "center", lh: 1.2 });
  }
  return { w, h };
}

// ---------------------------------------------------------------- countdown

/** The number in "Còn 14" / "D-14". */
const countNumber = (s?: string) => /\d+/.exec(s ?? "")?.[0] ?? (s ?? "");

export function countdownLook(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "big") return countBig(c, f, pal);
  if (v === "ring") return countRing(c, f, pal);
  if (v === "flip") return countFlip(c, f, pal);
  return countPill(c, f, pal);
}

function countBig(c: C, f: F, pal: Pal): Size {
  const ink = bare(pal);
  const big: TextOpts = { size: 200, weight: 900, color: ink, align: "center", lh: 1 };
  const w = Math.max(420, textW(c, f.count, big) + 60, textW(c, f.title, { size: 32, weight: 700, color: "" }) + 40);
  const h = 340;
  onPhoto(c, pal, () => {
    text(c, (f.title ?? "").toUpperCase(), w / 2, 0, { size: 30, weight: 800, color: ink, align: "center", lh: 1.3 }, w);
    text(c, f.count, w / 2, 52, big, w);
    text(c, f.unit, w / 2, 262, { size: 36, weight: 600, color: ink, align: "center", lh: 1.3 }, w);
  });
  return { w, h };
}

function countRing(c: C, f: F, pal: Pal): Size {
  const w = 440;
  const h = 520;
  const cx = w / 2;
  const cy = 210;
  card(c, w, h, pal, 40);
  c.lineCap = "round";
  c.lineWidth = 26;
  c.beginPath();
  c.arc(cx, cy, 150, 0, Math.PI * 2);
  c.strokeStyle = pal.soft;
  c.stroke();
  // How far along: a steady share from the number (fewer days left = fuller ring).
  const n = parseInt(countNumber(f.count), 10);
  const done = Number.isFinite(n) ? Math.max(0.08, Math.min(0.95, 1 - n / 60)) : 0.7;
  c.beginPath();
  c.arc(cx, cy, 150, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * done);
  c.strokeStyle = pal.ac;
  c.stroke();
  text(c, countNumber(f.count), cx, cy - 76, { size: 120, weight: 900, color: pal.fg, align: "center", lh: 1.1 });
  text(c, f.unit, cx, cy + 56, { size: 26, weight: 600, color: pal.sub, align: "center", lh: 1.2 }, 240);
  text(c, f.title, cx, 400, { size: 30, weight: 800, color: pal.fg, align: "center", lh: 1.3 }, w - 60);
  text(c, f.targetDate, cx, 446, { size: 22, weight: 500, color: pal.sub, align: "center", lh: 1.3 }, w - 60);
  return { w, h };
}

function countFlip(c: C, f: F, pal: Pal): Size {
  const digits = [...countNumber(f.count)].slice(0, 4);
  const cw = 150;
  const chh = 200;
  const gap = 14;
  const w = Math.max(460, digits.length * (cw + gap) - gap + 40);
  const h = 60 + chh + 70;
  const cardBg = pal.theme === "light" ? "#1c1c1e" : pal.theme === "dark" ? "#2c2c2e" : pal.color;
  const ink = pal.theme === "color" ? pal.onAc : "#f5f5f5";
  const label = bare(pal);
  onPhoto(c, pal, () => text(c, (f.title ?? "").toUpperCase(), w / 2, 0, { size: 28, weight: 800, color: label, align: "center", lh: 1.4 }, w));
  let x = (w - (digits.length * (cw + gap) - gap)) / 2;
  for (const dgt of digits) {
    lifted(c, () => fillRR(c, x, 56, cw, chh, 20, cardBg), 16, 6, 0.3);
    c.fillStyle = "rgba(0,0,0,0.18)";
    c.fillRect(x, 56 + chh / 2, cw, chh / 2);
    text(c, dgt, x + cw / 2, 56 + chh / 2 - 82, { size: 150, weight: 800, color: ink, align: "center", lh: 164 / 150 });
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fillRect(x, 56 + chh / 2 - 2, cw, 4);
    x += cw + gap;
  }
  onPhoto(c, pal, () => text(c, f.unit, w / 2, 56 + chh + 16, { size: 30, weight: 600, color: label, align: "center", lh: 1.3 }, w));
  return { w, h };
}

function countPill(c: C, f: F, pal: Pal): Size {
  const t1: TextOpts = { size: 26, weight: 800, color: pal.fg, lh: 1.2 };
  const t2: TextOpts = { size: 22, weight: 500, color: pal.sub, lh: 1.2 };
  const num = countNumber(f.count);
  const nw = Math.max(76, textW(c, num, { size: 36, weight: 900, color: "" }) + 36);
  const inner = Math.max(textW(c, f.title, t1), textW(c, f.unit, t2));
  const w = Math.min(680, 14 + nw + 18 + inner + 36);
  const h = 104;
  card(c, w, h, pal, 52);
  fillRR(c, 14, 14, nw, h - 28, (h - 28) / 2, pal.theme === "color" ? pal.fg : pal.color);
  text(c, num, 14 + nw / 2, h / 2 - 24, { size: 36, weight: 900, color: pal.theme === "color" ? pal.bg : pal.onAc, align: "center", lh: 48 / 36 });
  text(c, f.title, 14 + nw + 18, 20, t1, w - nw - 60);
  text(c, f.unit, 14 + nw + 18, 56, t2, w - nw - 60);
  return { w, h };
}

// ---------------------------------------------------------------- weather

export function weatherLook(c: C, f: F, pal: Pal, v: string): Size {
  switch (v) {
    case "big":
      return weatherBig(c, f, pal);
    case "pill":
      return weatherPill(c, f, pal);
    case "sky":
      return weatherSky(c, f);
    case "icon":
      return weatherIcon(c, f, pal);
    case "thermo":
      return weatherThermo(c, f, pal);
    default:
      return weatherGlass(c, f);
  }
}

function weatherBig(c: C, f: F, pal: Pal): Size {
  const ink = bare(pal);
  const big: TextOpts = { size: 200, weight: 200, color: ink, lh: 1 };
  const tw = textW(c, f.temperature, big);
  const w = Math.max(tw + 130, 460);
  const h = 300;
  onPhoto(c, pal, () => {
    text(c, f.temperature, 0, 30, big);
    text(c, f.icon, w, 30, { size: 100, color: ink, align: "right", lh: 1.1 });
    text(c, [f.city, f.condition].filter(Boolean).join("  ·  "), 6, 246, { size: 30, weight: 600, color: ink, lh: 1.3 }, w);
  });
  return { w, h };
}

function weatherPill(c: C, f: F, pal: Pal): Size {
  const t1: TextOpts = { size: 36, weight: 800, color: pal.fg, lh: 1.2 };
  const t2: TextOpts = { size: 24, weight: 600, color: pal.sub, lh: 1.2 };
  const tw = textW(c, f.temperature, t1);
  const cw = textW(c, f.city, t2);
  const w = 20 + 66 + 14 + tw + 22 + cw + 36;
  const h = 100;
  card(c, w, h, pal, 50);
  text(c, f.icon, 20 + 33, h / 2 - 34, { size: 52, color: pal.fg, align: "center", lh: 68 / 52 });
  text(c, f.temperature, 100, h / 2 - 22, { ...t1, lh: 44 / 36 });
  text(c, f.city, 100 + tw + 22, h / 2 - 15, { ...t2, lh: 30 / 24 });
  return { w, h };
}

/** Sky colours from the weather symbol. */
function skyOf(icon?: string): [string, string] {
  const s = icon ?? "";
  if (/🌙|🌕|🌛|🌜/.test(s)) return ["#1b1f4b", "#4b3f8f"];
  if (/⛈|🌩|🌧|🌦/.test(s)) return ["#3b4a5c", "#6f8193"];
  if (/❄|🌨/.test(s)) return ["#9cc3e6", "#e5f1fb"];
  if (/☁|🌫|🌬/.test(s)) return ["#7d8fa6", "#b9c6d6"];
  if (/⛅|🌤/.test(s)) return ["#3d8fdc", "#9fd0f5"];
  if (/🔥/.test(s)) return ["#e8572a", "#f6b34a"];
  return ["#2d8be0", "#7cc7f6"];
}

function weatherSky(c: C, f: F): Size {
  const w = 520;
  const h = 360;
  const [a, b] = skyOf(f.icon);
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  lifted(c, () => fillRR(c, 0, 0, w, h, 40, a), 26, 10, 0.25);
  fillRR(c, 0, 0, w, h, 40, g);
  text(c, f.city, P, P, { size: 32, weight: 700, color: "#ffffff", lh: 1.3 }, w - 140);
  text(c, f.temperature, P - 4, P + 44, { size: 120, weight: 300, color: "#ffffff", lh: 1.05 }, w - 160);
  text(c, f.icon, w - P, P - 4, { size: 90, color: "#ffffff", align: "right", lh: 1.1 });
  text(c, f.condition, P, h - P - 36, { size: 26, weight: 600, color: "rgba(255,255,255,0.9)", lh: 1.3 }, w - P * 2);
  return { w, h };
}

/** A big weather symbol like a sticker, the temperature under it. */
function weatherIcon(c: C, f: F, pal: Pal): Size {
  const w = 360;
  const h = 360;
  const ink = bare(pal);
  text(c, f.icon, w / 2, 0, { size: 200, color: "#000", align: "center", lh: 1.15 });
  onPhoto(c, pal, () => {
    text(c, f.temperature, w / 2, 230, { size: 64, weight: 800, color: ink, align: "center", lh: 1.2 }, w);
    text(c, f.city, w / 2, 310, { size: 26, weight: 600, color: ink, align: "center", lh: 1.3 }, w);
  });
  return { w, h };
}

/** A thermometer filled to the temperature (−10 to 40 °). */
function weatherThermo(c: C, f: F, pal: Pal): Size {
  const w = 420;
  const h = 520;
  card(c, w, h, pal, 40);
  const t = parseFloat((f.temperature ?? "").replace(",", "."));
  const level = Number.isFinite(t) ? Math.max(0.05, Math.min(1, (t + 10) / 50)) : 0.6;
  const tx = 110;
  const top = 60;
  const bottom = h - 120;
  fillRR(c, tx - 24, top, 48, bottom - top + 30, 24, pal.soft);
  c.beginPath();
  c.arc(tx, bottom + 30, 46, 0, Math.PI * 2);
  c.fillStyle = pal.soft;
  c.fill();
  const red = pal.theme === "color" ? pal.fg : "#ff453a";
  const ly = bottom - (bottom - top - 20) * level;
  fillRR(c, tx - 12, ly, 24, bottom - ly + 30, 12, red);
  c.beginPath();
  c.arc(tx, bottom + 30, 32, 0, Math.PI * 2);
  c.fillStyle = red;
  c.fill();
  for (let i = 0; i <= 5; i++) {
    const y = bottom - ((bottom - top - 20) * i) / 5;
    c.fillStyle = pal.sub;
    c.fillRect(tx + 34, y - 1.5, 22, 3);
  }
  text(c, f.temperature, 190, 120, { size: 76, weight: 800, color: pal.fg, lh: 1.1 }, w - 210);
  text(c, f.icon, 190, 220, { size: 60, color: pal.fg, lh: 1.2 });
  text(c, f.city, 190, 310, { size: 28, weight: 700, color: pal.fg, lh: 1.3 }, w - 210);
  drawLines(c, wrap(c, f.condition, { size: 22, weight: 500, color: pal.sub }, w - 210, 3), 190, 352, { size: 22, weight: 500, color: pal.sub, lh: 1.3 });
  return { w, h };
}

/** Frosted glass on the photo: pale, see-through, a bright rim. */
function weatherGlass(c: C, f: F): Size {
  const w = 520;
  const h = 300;
  lifted(c, () => fillRR(c, 0, 0, w, h, 40, "rgba(255,255,255,0.22)"), 30, 10, 0.18);
  const g = c.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "rgba(255,255,255,0.32)");
  g.addColorStop(1, "rgba(255,255,255,0.08)");
  fillRR(c, 0, 0, w, h, 40, g);
  c.strokeStyle = "rgba(255,255,255,0.6)";
  c.lineWidth = 2;
  rr(c, 1, 1, w - 2, h - 2, 39);
  c.stroke();
  const ink = "#ffffff";
  c.save();
  c.shadowColor = "rgba(0,0,0,0.25)";
  c.shadowBlur = 8;
  text(c, f.city, P, P, { size: 30, weight: 700, color: ink, lh: 1.3 }, w - 160);
  text(c, f.temperature, P - 4, P + 42, { size: 110, weight: 300, color: ink, lh: 1.05 }, w - 170);
  text(c, f.condition, P, h - P - 34, { size: 24, weight: 600, color: ink, lh: 1.3 }, w - P * 2);
  c.restore();
  text(c, f.icon, w - P, P, { size: 84, color: ink, align: "right", lh: 1.1 });
  return { w, h };
}

// ---------------------------------------------------------------- quote

export function quoteLook(c: C, f: F, pal: Pal, v: string): Size {
  switch (v) {
    case "marks":
      return quoteMarks(c, f, pal);
    case "typewriter":
      return quoteTypewriter(c, f);
    case "note":
      return quoteNote(c, f);
    case "line":
      return quoteLine(c, f, pal);
    case "chalk":
      return quoteChalk(c, f);
    default:
      return quoteBook(c, f);
  }
}

function quoteMarks(c: C, f: F, pal: Pal): Size {
  const w = 620;
  const ink = bare(pal);
  const q: TextOpts = { size: 44, weight: 500, color: ink, family: SERIF, italic: true, align: "center", lh: 1.35 };
  const lines = wrap(c, f.thought, q, w - 60, 6);
  const h = 120 + linesH(lines.length, q) + 30 + 40;
  onPhoto(c, pal, () => {
    text(c, "“", w / 2, -20, { size: 200, weight: 700, color: pal.theme === "color" ? pal.color : ink, family: SERIF, align: "center", lh: 1 });
    drawLines(c, lines, w / 2, 110, q);
    text(c, f.heading ? `— ${f.heading}` : "", w / 2, 110 + linesH(lines.length, q) + 24, { size: 26, weight: 600, color: ink, align: "center", lh: 1.3 }, w);
  });
  return { w, h };
}

function quoteTypewriter(c: C, f: F): Size {
  const w = 580;
  const q: TextOpts = { size: 30, weight: 400, color: "#2a2a2a", family: TYPEWRITER, lh: 1.5 };
  const lines = wrap(c, f.thought, q, w - 100, 8);
  const h = 70 + 40 + 20 + linesH(lines.length, q) + 30 + 30 + 60;
  lifted(c, () => {
    c.fillStyle = "#f7f3ea";
    c.fillRect(0, 0, w, h);
  }, 20, 8, 0.2);
  // Faint paper texture and a typed header.
  const r = seeded(f.thought ?? "");
  c.fillStyle = "rgba(120,100,70,0.06)";
  for (let i = 0; i < 300; i++) c.fillRect(r() * w, r() * h, 2, 2);
  text(c, (f.heading ?? "").toUpperCase(), 50, 60, { size: 22, weight: 700, color: "#555", family: TYPEWRITER, lh: 1.4 }, w - 100);
  c.fillStyle = "rgba(0,0,0,0.12)";
  c.fillRect(50, 104, w - 100, 2);
  drawLines(c, lines, 50, 130, q);
  text(c, [f.page, f.date].filter(Boolean).join("  ·  "), w - 50, h - 70, { size: 20, color: "#777", family: TYPEWRITER, align: "right", lh: 1.4 }, w - 100);
  return { w, h };
}

function quoteNote(c: C, f: F): Size {
  const w = 500;
  const q: TextOpts = { size: 36, weight: 400, color: "#3b2f1e", family: HAND, lh: 1.35 };
  const lines = wrap(c, f.thought, q, w - 90, 7);
  const h = Math.max(460, 90 + linesH(lines.length, q) + 90);
  c.save();
  c.translate(w / 2, h / 2);
  c.rotate(-0.025);
  c.translate(-w / 2, -h / 2);
  lifted(c, () => {
    c.fillStyle = "#ffe877";
    c.fillRect(0, 10, w, h - 10);
  }, 18, 10, 0.25);
  // Curled corner.
  const g = c.createLinearGradient(w - 80, h - 80, w, h);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.12)");
  c.fillStyle = g;
  c.fillRect(w - 120, h - 120, 120, 120);
  tape(c, w / 2, 14, 140, 0.04);
  drawLines(c, lines, 45, 80, q);
  text(c, f.heading ? `— ${f.heading}` : "", w - 45, h - 70, { size: 26, color: "#5b4a30", family: HAND, align: "right", lh: 1.3 }, w - 90);
  c.restore();
  return { w, h };
}

function quoteLine(c: C, f: F, pal: Pal): Size {
  const ink = bare(pal);
  const q: TextOpts = { size: 36, weight: 400, color: ink, family: SERIF, italic: true, align: "center", lh: 1.35 };
  const w = 720;
  const lines = wrap(c, f.thought, q, w, 3);
  const h = linesH(lines.length, q) + 70;
  onPhoto(c, pal, () => {
    drawLines(c, lines, w / 2, 0, q);
    const y = linesH(lines.length, q) + 22;
    c.fillStyle = ink;
    c.fillRect(w / 2 - 30, y, 60, 2);
    text(c, f.heading, w / 2, y + 12, { size: 22, weight: 600, color: ink, align: "center", lh: 1.3 }, w);
  });
  return { w, h };
}

function quoteChalk(c: C, f: F): Size {
  const w = 640;
  const q: TextOpts = { size: 40, weight: 400, color: "#f4f1e8", family: MARKER, align: "center", lh: 1.35 };
  const lines = wrap(c, f.thought, q, w - 120, 6);
  const h = 90 + linesH(lines.length, q) + 90;
  blackboard(c, w, h);
  chalkText(c, lines, w / 2, 60, q);
  chalkText(c, [f.heading ? `— ${f.heading}` : ""], w / 2, h - 90, { size: 26, color: "#e8e4d8", family: MARKER, align: "center", lh: 1.3 });
  return { w, h };
}

/** An open book: the quote on the right page. */
function quoteBook(c: C, f: F): Size {
  const w = 760;
  const q: TextOpts = { size: 28, weight: 400, color: "#2b2118", family: SERIF, lh: 1.45 };
  const page = w / 2 - 40;
  const lines = wrap(c, f.thought, q, page - 70, 8);
  const h = Math.max(440, 90 + linesH(lines.length, q) + 100);
  lifted(c, () => {
    c.fillStyle = "#e9e0cc";
    c.beginPath();
    c.moveTo(10, 30);
    c.quadraticCurveTo(w / 4, 0, w / 2, 24);
    c.quadraticCurveTo((w * 3) / 4, 0, w - 10, 30);
    c.lineTo(w - 10, h - 10);
    c.quadraticCurveTo((w * 3) / 4, h - 34, w / 2, h - 12);
    c.quadraticCurveTo(w / 4, h - 34, 10, h - 10);
    c.closePath();
    c.fill();
  }, 26, 12, 0.3);
  for (const side of [0, 1]) {
    const g = c.createLinearGradient(side ? w / 2 : w / 2, 0, side ? w - 20 : 20, 0);
    g.addColorStop(0, "#d9cdb3");
    g.addColorStop(0.12, "#faf5ea");
    g.addColorStop(1, "#f4ecdc");
    c.fillStyle = g;
    c.beginPath();
    if (side) {
      c.moveTo(w / 2, 32);
      c.quadraticCurveTo((w * 3) / 4, 10, w - 20, 38);
      c.lineTo(w - 20, h - 20);
      c.quadraticCurveTo((w * 3) / 4, h - 42, w / 2, h - 22);
    } else {
      c.moveTo(w / 2, 32);
      c.quadraticCurveTo(w / 4, 10, 20, 38);
      c.lineTo(20, h - 20);
      c.quadraticCurveTo(w / 4, h - 42, w / 2, h - 22);
    }
    c.closePath();
    c.fill();
  }
  // Left page: the heading as a chapter title, faint lines of text.
  text(c, f.heading, w / 4 + 10, 90, { size: 26, weight: 700, color: "#5b4a30", family: SERIF, italic: true, align: "center", lh: 1.3 }, page - 60);
  c.fillStyle = "rgba(60,40,20,0.13)";
  for (let i = 0; i < 9; i++) c.fillRect(60, 150 + i * 30, page - 70 - (i % 3) * 30, 6);
  drawLines(c, lines, w / 2 + 44, 80, q);
  text(c, f.page, w - 70, h - 74, { size: 20, color: "#7d6a4e", family: SERIF, align: "right", lh: 1.3 });
  return { w, h };
}

// ---------------------------------------------------------------- now playing

export function musicLook(c: C, f: F, pal: Pal, v: string): Size {
  switch (v) {
    case "mini":
      return musicMini(c, f, pal);
    case "vinyl":
      return musicVinyl(c, f, pal);
    case "cassette":
      return musicCassette(c, f, pal);
    case "code":
      return musicCode(c, f, pal);
    default:
      return musicMinimal(c, f, pal);
  }
}

const played = (f: F) => {
  const total = seconds(f.totalTime);
  return total > 0 ? Math.max(0, Math.min(1, seconds(f.currentTime) / total)) : 0.4;
};

function musicMini(c: C, f: F, pal: Pal): Size {
  const t1: TextOpts = { size: 26, weight: 800, color: pal.fg, lh: 1.2 };
  const t2: TextOpts = { size: 21, weight: 500, color: pal.sub, lh: 1.2 };
  const inner = Math.min(380, Math.max(textW(c, f.songTitle, t1), textW(c, f.artist, t2)));
  const w = 14 + 76 + 18 + inner + 24 + 64 + 18;
  const h = 104;
  card(c, w, h, pal, 52);
  const g = c.createLinearGradient(14, 14, 90, 90);
  g.addColorStop(0, pal.color);
  g.addColorStop(1, "#ffb36b");
  c.beginPath();
  c.arc(14 + 38, h / 2, 38, 0, Math.PI * 2);
  c.fillStyle = g;
  c.fill();
  text(c, "♪", 14 + 38, h / 2 - 26, { size: 40, weight: 700, color: "#ffffff", align: "center", lh: 1.3 });
  text(c, f.songTitle, 108, 20, t1, inner);
  text(c, f.artist, 108, 56, t2, inner);
  // Play button with the progress around it.
  const bx = w - 18 - 32;
  c.lineWidth = 5;
  c.beginPath();
  c.arc(bx, h / 2, 28, 0, Math.PI * 2);
  c.strokeStyle = pal.soft;
  c.stroke();
  c.beginPath();
  c.arc(bx, h / 2, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * played(f));
  c.strokeStyle = pal.ac;
  c.lineCap = "round";
  c.stroke();
  c.fillStyle = pal.fg;
  fillRR(c, bx - 10, h / 2 - 11, 7, 22, 2, pal.fg);
  fillRR(c, bx + 3, h / 2 - 11, 7, 22, 2, pal.fg);
  return { w, h };
}

/** A record: grooves, a coloured label, the tone arm; title under it. */
function musicVinyl(c: C, f: F, pal: Pal): Size {
  const R = 210;
  const w = R * 2 + 90;
  const h = R * 2 + 140;
  const cx = R + 20;
  const cy = R + 20;
  lifted(c, () => {
    c.beginPath();
    c.arc(cx, cy, R, 0, Math.PI * 2);
    c.fillStyle = "#111111";
    c.fill();
  }, 26, 10, 0.35);
  for (let r = R - 12; r > R * 0.38; r -= 6) {
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.strokeStyle = r % 18 === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.035)";
    c.lineWidth = 1.5;
    c.stroke();
  }
  // Sheen.
  c.save();
  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.clip();
  const sh = c.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  sh.addColorStop(0.35, "rgba(255,255,255,0)");
  sh.addColorStop(0.5, "rgba(255,255,255,0.12)");
  sh.addColorStop(0.65, "rgba(255,255,255,0)");
  c.fillStyle = sh;
  c.fillRect(cx - R, cy - R, R * 2, R * 2);
  c.restore();
  c.beginPath();
  c.arc(cx, cy, R * 0.34, 0, Math.PI * 2);
  c.fillStyle = pal.color;
  c.fill();
  text(c, f.songTitle, cx, cy - 34, { size: 20, weight: 800, color: "#ffffff", align: "center", lh: 1.2 }, R * 0.56);
  text(c, f.artist, cx, cy + 12, { size: 15, weight: 500, color: "rgba(255,255,255,0.85)", align: "center", lh: 1.2 }, R * 0.56);
  c.beginPath();
  c.arc(cx, cy, 7, 0, Math.PI * 2);
  c.fillStyle = "#f2f2f2";
  c.fill();
  // Tone arm.
  c.save();
  c.lineCap = "round";
  c.strokeStyle = "#cfcfd4";
  c.lineWidth = 9;
  c.beginPath();
  c.moveTo(w - 30, 40);
  c.lineTo(w - 50, 250);
  c.lineTo(cx + R * 0.6, cy + R * 0.35);
  c.stroke();
  c.beginPath();
  c.arc(w - 30, 40, 22, 0, Math.PI * 2);
  c.fillStyle = "#a9a9ae";
  c.fill();
  fillRR(c, cx + R * 0.6 - 16, cy + R * 0.35 - 10, 34, 22, 5, "#8d8d92");
  c.restore();
  const ink = bare(pal);
  onPhoto(c, pal, () => {
    text(c, f.songTitle, w / 2, R * 2 + 52, { size: 32, weight: 800, color: ink, align: "center", lh: 1.25 }, w - 20);
    text(c, f.artist, w / 2, R * 2 + 94, { size: 22, weight: 500, color: ink, align: "center", lh: 1.25 }, w - 20);
  });
  return { w, h };
}

function musicCassette(c: C, f: F, pal: Pal): Size {
  const w = 620;
  const h = 390;
  const shell = pal.theme === "dark" ? "#2a2a2e" : pal.theme === "color" ? pal.color : "#e9e4da";
  lifted(c, () => fillRR(c, 0, 0, w, h, 26, shell), 24, 10, 0.3);
  // Screws.
  for (const [x, y] of [
    [22, 22],
    [w - 22, 22],
    [22, h - 22],
    [w - 22, h - 22],
    [w / 2, h - 30],
  ]) {
    c.beginPath();
    c.arc(x, y, 8, 0, Math.PI * 2);
    c.fillStyle = "rgba(0,0,0,0.25)";
    c.fill();
  }
  // Label.
  fillRR(c, 40, 34, w - 80, 230, 14, "#fbf7ee");
  c.fillStyle = pal.theme === "color" ? "#111111" : pal.color;
  c.fillRect(40, 34, w - 80, 16);
  c.fillRect(40, 54, w - 80, 6);
  text(c, f.songTitle, 70, 70, { size: 34, weight: 400, color: "#222", family: HAND, lh: 1.25 }, w - 140);
  text(c, f.artist, 70, 116, { size: 24, weight: 400, color: "#555", family: HAND, lh: 1.25 }, w - 140);
  // Window with the two reels.
  fillRR(c, 150, 166, w - 300, 80, 40, "#3a3530");
  for (const x of [205, w - 205]) {
    c.beginPath();
    c.arc(x, 206, 30, 0, Math.PI * 2);
    c.fillStyle = "#f2efe8";
    c.fill();
    c.fillStyle = "#3a3530";
    for (let i = 0; i < 6; i++) {
      c.save();
      c.translate(x, 206);
      c.rotate((i / 6) * Math.PI * 2);
      c.fillRect(-3, 8, 6, 14);
      c.restore();
    }
  }
  // Tape: wound more on the right as it plays.
  const p = played(f);
  c.beginPath();
  c.arc(205, 206, 30 + 14 * (1 - p), 0, Math.PI * 2);
  c.arc(w - 205, 206, 30 + 14 * p, 0, Math.PI * 2);
  c.fillStyle = "rgba(60,40,25,0.55)";
  c.fill("evenodd");
  // Bottom trapezoid.
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.beginPath();
  c.moveTo(130, h);
  c.lineTo(160, h - 90);
  c.lineTo(w - 160, h - 90);
  c.lineTo(w - 130, h);
  c.closePath();
  c.fill();
  text(c, "A", 64, 214, { size: 34, weight: 800, color: pal.theme === "dark" ? "#ffffff" : "#222", lh: 1.2 });
  return { w, h };
}

/** A scan code: bars of different heights from the title, beside a round sound mark. */
function musicCode(c: C, f: F, pal: Pal): Size {
  const w = 620;
  const h = 200;
  const bg = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#1c1c1e" : "#ffffff";
  const ink = pal.theme === "color" ? pal.onAc === pal.color ? "#ffffff" : pal.fg : pal.theme === "dark" ? "#ffffff" : "#111111";
  card(c, w, 130, pal, 65, bg);
  c.beginPath();
  c.arc(65, 65, 34, 0, Math.PI * 2);
  c.fillStyle = ink;
  c.fill();
  c.strokeStyle = bg;
  c.lineWidth = 5;
  c.lineCap = "round";
  for (const [r, a] of [
    [12, 0.9],
    [20, 0.8],
    [28, 0.7],
  ] as const) {
    c.beginPath();
    c.arc(52, 65, r, -a, a);
    c.stroke();
  }
  const rnd = seeded(`${f.songTitle}|${f.artist}`);
  const n = 23;
  const x0 = 130;
  const step = (w - x0 - 40) / n;
  for (let i = 0; i < n; i++) {
    const hh = 14 + Math.round(rnd() * 7) * 9 * (i === 0 || i === n - 1 ? 0 : 1);
    fillRR(c, x0 + i * step, 65 - hh / 2, step * 0.55, Math.max(14, hh), 6, ink);
  }
  const t = bare(pal);
  onPhoto(c, pal, () => text(c, [f.songTitle, f.artist].filter(Boolean).join(" — "), w / 2, 150, { size: 26, weight: 700, color: t, align: "center", lh: 1.3 }, w));
  return { w, h };
}

function musicMinimal(c: C, f: F, pal: Pal): Size {
  const ink = bare(pal);
  const w = 600;
  const h = 170;
  onPhoto(c, pal, () => {
    text(c, `♪  ${f.songTitle ?? ""}`, 0, 0, { size: 40, weight: 800, color: ink, lh: 1.25 }, w);
    text(c, f.artist, 0, 56, { size: 26, weight: 500, color: ink, lh: 1.25 }, w);
    c.globalAlpha = 0.4;
    fillRR(c, 0, 120, w, 6, 3, ink);
    c.globalAlpha = 1;
    fillRR(c, 0, 120, Math.max(6, w * played(f)), 6, 3, ink);
    c.beginPath();
    c.arc(Math.max(6, w * played(f)), 123, 10, 0, Math.PI * 2);
    c.fillStyle = ink;
    c.fill();
    text(c, f.currentTime, 0, 136, { size: 18, weight: 600, color: ink, lh: 1.3 });
    text(c, f.totalTime, w, 136, { size: 18, weight: 600, color: ink, align: "right", lh: 1.3 });
  });
  return { w, h };
}

