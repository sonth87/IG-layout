// Clock widgets (D-119): one clock, many looks. Analogue faces (round, square, hand-drawn,
// melting…; numbers, quarters, ticks, roman) and digital ones (plain, flip, LED, LCD, neon,
// dot matrix). Two time zones or a date are other widgets, added beside it (owner, 2026-10-19).
import { type C, type F, type Pal, SANS, SERIF, fillRR, rr, text, textW } from "./widgetKit";

export const CLOCK_VARIANTS = [
  { id: "classic", name: ["Classic", "Cổ điển"], theme: "light" },
  { id: "quarters", name: ["12 · 3 · 6 · 9", "12 · 3 · 6 · 9"], theme: "light" },
  { id: "ticks", name: ["Bars", "Vạch"], theme: "dark" },
  { id: "roman", name: ["Roman", "La Mã"], theme: "light" },
  { id: "square", name: ["Square", "Vuông"], theme: "light" },
  { id: "squareTicks", name: ["Square bars", "Vuông vạch"], theme: "dark" },
  { id: "wobbly", name: ["Hand-drawn", "Vẽ tay"], theme: "light" },
  { id: "melting", name: ["Melting", "Chảy"], theme: "light" },
  { id: "digital", name: ["Big digits", "Số lớn"], theme: "dark" },
  { id: "flip", name: ["Flip", "Số lật"], theme: "dark" },
  { id: "led", name: ["LED", "LED"], theme: "dark" },
  { id: "lcd", name: ["LCD", "LCD"], theme: "light" },
  { id: "neon", name: ["Neon", "Neon"], theme: "color" },
  { id: "dots", name: ["Dot matrix", "Chấm pixel"], theme: "dark" },
] as const satisfies readonly { id: string; name: [string, string]; theme: "light" | "dark" | "color" }[];
export type ClockVariant = (typeof CLOCK_VARIANTS)[number]["id"];

/** Hours and minutes of "10:09" (or "9:41 PM"). */
function hm(s: string | undefined) {
  const m = /(\d{1,2})\s*[:.h]\s*(\d{2})/.exec(s ?? "");
  let h = m ? Number(m[1]) : 10;
  const min = m ? Number(m[2]) : 9;
  if (/pm/i.test(s ?? "") && h < 12) h += 12;
  return { h: h % 24, m: min % 60 };
}
const two = (n: number) => String(n).padStart(2, "0");

export function drawClock(c: C, f: F, pal: Pal, variant: string): { w: number; h: number } {
  const t = hm(f.time);
  switch (variant as ClockVariant) {
    case "digital":
      return digital(c, t, pal);
    case "flip":
      return flip(c, t, pal);
    case "led":
    case "lcd":
      return segments(c, t, pal, variant === "lcd");
    case "neon":
      return neon(c, t, pal);
    case "dots":
      return dots(c, t, pal);
    case "melting":
      return melting(c, t, pal);
    default:
      return analogue(c, t, pal, variant as ClockVariant);
  }
}

// ---------------------------------------------------------------- analogue

const R = 200;

/** Point at angle `a` (0 = 12 o'clock, clockwise) on a circle or a square of "radius" r. */
function onFace(a: number, r: number, square: boolean) {
  const s = Math.sin(a);
  const co = -Math.cos(a);
  const k = square ? 1 / Math.max(Math.abs(s), Math.abs(co)) : 1;
  return { x: s * r * k, y: co * r * k };
}

/** A slightly uneven circle, the same every time. */
function wobble(c: C, r: number, seed: number) {
  c.beginPath();
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const rr2 = r * (1 + 0.025 * Math.sin(5 * a + seed) + 0.015 * Math.sin(11 * a + seed * 2));
    const x = Math.sin(a) * rr2;
    const y = -Math.cos(a) * rr2;
    if (i) c.lineTo(x, y);
    else c.moveTo(x, y);
  }
  c.closePath();
}

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const HAND = '"Marker Felt", "Chalkboard SE", "Comic Sans MS", "Segoe Print", cursive';

/** The face, its marks and hands, centred on (0, 0), radius R. */
function face(c: C, t: { h: number; m: number }, pal: Pal, v: ClockVariant, shadow = true) {
  const square = v === "square" || v === "squareTicks";
  const bg = v === "roman" && pal.theme === "light" ? "#f7f0e1" : pal.bg;
  const ink = v === "roman" && pal.theme === "light" ? "#2b2118" : pal.fg;
  // Case.
  c.save();
  if (shadow) {
    c.shadowColor = "rgba(0,0,0,0.22)";
    c.shadowBlur = 26;
    c.shadowOffsetY = 8;
  }
  if (square) rr(c, -R, -R, R * 2, R * 2, 56);
  else if (v === "wobbly") wobble(c, R, 1.3);
  else {
    c.beginPath();
    c.arc(0, 0, R, 0, Math.PI * 2);
  }
  c.fillStyle = bg;
  c.fill();
  c.restore();
  if (v === "wobbly") {
    c.lineWidth = 6;
    c.strokeStyle = ink;
    wobble(c, R - 4, 2.1);
    c.stroke();
  } else if (v === "roman" || v === "classic") {
    c.lineWidth = v === "roman" ? 10 : 6;
    c.strokeStyle = v === "roman" ? "#8a6a3b" : pal.line;
    c.beginPath();
    c.arc(0, 0, R - c.lineWidth / 2, 0, Math.PI * 2);
    c.stroke();
  }
  // Marks.
  const inner = square ? R - 26 : R - 22;
  if (v === "classic" || v === "square" || v === "wobbly") {
    // Minute ticks, then numbers 1–12.
    if (v !== "wobbly")
      for (let i = 0; i < 60; i++) {
        if (i % 5 === 0) continue;
        const a = (i / 60) * Math.PI * 2;
        const p0 = onFace(a, inner, square);
        const p1 = onFace(a, inner - 8, square);
        c.strokeStyle = pal.sub;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(p0.x, p0.y);
        c.lineTo(p1.x, p1.y);
        c.stroke();
      }
    for (let i = 1; i <= 12; i++) {
      const p = onFace((i / 12) * Math.PI * 2, inner - (square ? 34 : 32), square);
      text(c, String(i), p.x, p.y - 22, { size: v === "wobbly" ? 40 : 36, weight: v === "wobbly" ? 400 : 600, color: ink, family: v === "wobbly" ? HAND : SANS, align: "center", lh: 44 / 36 });
    }
  } else if (v === "quarters") {
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (i % 3 === 0) {
        const p = onFace(a, inner - 30, false);
        text(c, String(i), p.x, p.y - 30, { size: 52, weight: 700, color: ink, align: "center", lh: 60 / 52 });
      } else {
        const p = onFace(a, inner - 12, false);
        c.beginPath();
        c.arc(p.x, p.y, 5, 0, Math.PI * 2);
        c.fillStyle = pal.sub;
        c.fill();
      }
    }
  } else if (v === "roman") {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const p = onFace(a, inner - 40, false);
      text(c, ROMAN[i], p.x, p.y - 20, { size: 32, weight: 600, color: ink, family: SERIF, align: "center", lh: 40 / 32 });
    }
    c.beginPath();
    c.arc(0, 0, inner - 70, 0, Math.PI * 2);
    c.strokeStyle = "rgba(138,106,59,0.35)";
    c.lineWidth = 2;
    c.stroke();
  } else {
    // Bars only (round or square).
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const long = i % 3 === 0;
      const p0 = onFace(a, inner, square);
      const p1 = onFace(a, inner - (long ? 40 : 26), square);
      c.strokeStyle = long ? pal.fg : pal.sub;
      c.lineWidth = long ? 10 : 6;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.stroke();
    }
  }
  // Hands.
  const ha = (((t.h % 12) + t.m / 60) / 12) * Math.PI * 2;
  const ma = (t.m / 60) * Math.PI * 2;
  const hand = (a: number, len: number, width: number, color: string) => {
    c.save();
    c.rotate(a);
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineCap = "round";
    c.beginPath();
    if (v === "wobbly") {
      c.moveTo(0, 14);
      c.quadraticCurveTo(width * 0.6, -len / 2, 0, -len);
    } else {
      c.moveTo(0, 18);
      c.lineTo(0, -len);
    }
    c.stroke();
    c.restore();
  };
  const handInk = v === "roman" && pal.theme === "light" ? "#2b2118" : pal.fg;
  hand(ha, R * 0.5, v === "roman" ? 10 : 14, handInk);
  hand(ma, R * 0.74, v === "roman" ? 7 : 10, handInk);
  // A thin accent second hand on the classic faces.
  if (v === "classic" || v === "square" || v === "ticks" || v === "squareTicks") hand((36 / 60) * Math.PI * 2, R * 0.8, 3, pal.ac);
  c.beginPath();
  c.arc(0, 0, 11, 0, Math.PI * 2);
  c.fillStyle = v === "classic" || v === "square" || v === "ticks" || v === "squareTicks" ? pal.ac : handInk;
  c.fill();
}

function analogue(c: C, t: { h: number; m: number }, pal: Pal, v: ClockVariant) {
  const size = R * 2 + 40;
  c.save();
  c.translate(size / 2, size / 2);
  face(c, t, pal, v);
  c.restore();
  return { w: size, h: size };
}

/**
 * Melting clock (owner's example): the top half lies flat on a table edge, the bottom half
 * hangs down and droops further in places. The round face is drawn once, then warped in
 * thin vertical strips.
 */
const melted = new Map<string, HTMLCanvasElement>();
function melting(c: C, t: { h: number; m: number }, pal: Pal) {
  const S = R * 2 + 40;
  const top = S * 0.5 * 0.4; // the flat half, seen at a low angle
  const droop = S * 0.5;
  const w = S;
  const h = top + S * 0.5 + droop;
  // Sharp at any zoom: drawn at the pixel scale the context draws at.
  const m = c.getTransform();
  const k = Math.min(4, Math.max(1, Math.hypot(m.a, m.b)));
  const key = JSON.stringify([t, pal, Math.round(k * 4)]);
  let out = melted.get(key);
  if (!out) {
    const img = document.createElement("canvas");
    img.width = img.height = Math.ceil(S * k);
    const o = img.getContext("2d")!;
    o.scale(k, k);
    o.translate(S / 2, S / 2);
    face(o, t, pal, "classic", false);
    // Warp in thin vertical strips: top half squashed flat, bottom half hanging and drooping.
    out = document.createElement("canvas");
    out.width = Math.ceil(w * k);
    out.height = Math.ceil(h * k);
    const q = out.getContext("2d")!;
    q.scale(k, k);
    const N = 160;
    const sw = img.width / N;
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N;
      // A broad sag, a long drip right of the middle and a short one left.
      const sag = Math.pow(Math.sin(Math.PI * u), 1.4);
      const d = droop * (0.3 * sag + 0.62 * Math.exp(-(((u - 0.66) / 0.06) ** 2)) + 0.28 * Math.exp(-(((u - 0.3) / 0.05) ** 2)));
      const dx = (i / N) * w;
      const dw = w / N + 0.5;
      q.drawImage(img, i * sw, 0, sw, img.height / 2, dx, 0, dw, top);
      q.drawImage(img, i * sw, img.height / 2, sw, img.height / 2, dx, top, dw, S / 2 + d);
    }
    // Shade the fold over the edge: light on top, dark just below, fading down.
    q.globalCompositeOperation = "source-atop";
    const g = q.createLinearGradient(0, top - 14, 0, top + 70);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.15, "rgba(255,255,255,0.3)");
    g.addColorStop(0.2, "rgba(0,0,0,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    q.fillStyle = g;
    q.fillRect(0, 0, w, h);
    // Rounder sides of the hanging part.
    const side = q.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, "rgba(0,0,0,0.18)");
    side.addColorStop(0.15, "rgba(0,0,0,0)");
    side.addColorStop(0.85, "rgba(0,0,0,0)");
    side.addColorStop(1, "rgba(0,0,0,0.18)");
    q.fillStyle = side;
    q.fillRect(0, top, w, h - top);
    if (melted.size > 20) melted.clear();
    melted.set(key, out);
  }
  // Contact shadow under the part lying on the table, then the clock with a soft drop shadow.
  c.save();
  c.fillStyle = "rgba(0,0,0,0.18)";
  c.beginPath();
  c.ellipse(w / 2, top * 0.55, S * 0.5, top * 0.6, 0, 0, Math.PI * 2);
  c.filter = "blur(6px)";
  c.fill();
  c.restore();
  c.save();
  c.shadowColor = "rgba(0,0,0,0.25)";
  c.shadowBlur = 18;
  c.shadowOffsetY = 10;
  c.drawImage(out, 0, 0, w, h);
  c.restore();
  return { w, h };
}

// ---------------------------------------------------------------- digital

/** Text colour of the card-less clocks: white on photos by default (like a lock screen). */
const bare = (pal: Pal) => (pal.theme === "light" ? "#ffffff" : pal.theme === "dark" ? "#111111" : pal.color);

function digital(c: C, t: { h: number; m: number }, pal: Pal) {
  const s = `${t.h}:${two(t.m)}`;
  const o = { size: 200, weight: 700, color: bare(pal), align: "center" as const, lh: 1.05 };
  const w = Math.max(320, textW(c, s, o) + 40);
  const h = 230;
  c.save();
  if (pal.theme === "light") {
    c.shadowColor = "rgba(0,0,0,0.35)";
    c.shadowBlur = 20;
  }
  text(c, s, w / 2, 8, o);
  c.restore();
  return { w, h };
}

function flip(c: C, t: { h: number; m: number }, pal: Pal) {
  const cw = 230;
  const ch = 260;
  const gap = 18;
  const w = cw * 2 + gap;
  const h = ch;
  const cardBg = pal.theme === "light" ? "#ffffff" : pal.theme === "dark" ? "#1c1c1e" : pal.color;
  const ink = pal.theme === "light" ? "#111111" : pal.theme === "dark" ? "#f5f5f5" : pal.onAc === pal.color ? "#ffffff" : pal.fg;
  [two(t.h), two(t.m)].forEach((s, i) => {
    const x = i * (cw + gap);
    c.save();
    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowBlur = 18;
    c.shadowOffsetY = 6;
    fillRR(c, x, 0, cw, ch, 26, cardBg);
    c.restore();
    // Lower half a touch darker, then the hinge.
    c.save();
    rr(c, x, 0, cw, ch, 26);
    c.clip();
    c.fillStyle = "rgba(0,0,0,0.08)";
    c.fillRect(x, ch / 2, cw, ch / 2);
    c.restore();
    text(c, s, x + cw / 2, ch / 2 - 84, { size: 150, weight: 800, color: ink, align: "center", lh: 168 / 150 });
    c.fillStyle = pal.theme === "light" ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.6)";
    c.fillRect(x, ch / 2 - 2, cw, 4);
    for (const side of [x - 3, x + cw - 5]) fillRR(c, side, ch / 2 - 12, 8, 24, 3, pal.theme === "light" ? "#d0d0d0" : "#3a3a3c");
  });
  return { w, h };
}

/** Seven-segment digits: which of a b c d e f g are lit. */
const SEG: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg" };

function segDigit(c: C, x: number, y: number, dw: number, dh: number, digit: string, on: string, off: string) {
  const th = dw * 0.18;
  const segs: Record<string, [number, number, boolean]> = {
    a: [0, 0, true],
    g: [0, dh / 2, true],
    d: [0, dh, true],
    f: [0, 0, false],
    b: [dw, 0, false],
    e: [0, dh / 2, false],
    c: [dw, dh / 2, false],
  };
  const lit = SEG[digit] ?? "";
  for (const [k, [sx, sy, horiz]] of Object.entries(segs)) {
    const len = horiz ? dw : dh / 2;
    c.save();
    c.translate(x + sx, y + sy);
    if (!horiz) c.rotate(Math.PI / 2);
    // A long hexagon.
    c.beginPath();
    c.moveTo(th * 0.6, 0);
    c.lineTo(th, -th / 2);
    c.lineTo(len - th, -th / 2);
    c.lineTo(len - th * 0.6, 0);
    c.lineTo(len - th, th / 2);
    c.lineTo(th, th / 2);
    c.closePath();
    c.fillStyle = lit.includes(k) ? on : off;
    c.fill();
    c.restore();
  }
}

function segments(c: C, t: { h: number; m: number }, pal: Pal, lcd: boolean) {
  const dw = 100;
  const dh = 170;
  const gap = 34;
  const pad = 44;
  const w = pad * 2 + dw * 4 + gap * 3 + 40;
  const h = pad * 2 + dh;
  const panel = lcd ? (pal.theme === "dark" ? "#28302a" : "#b9c6a6") : pal.theme === "light" ? "#101010" : pal.theme === "dark" ? "#050505" : "#111111";
  const on = lcd ? (pal.theme === "dark" ? "#c6d6b4" : "#1f261d") : pal.theme === "color" ? pal.color : pal.color;
  const off = lcd ? (pal.theme === "dark" ? "rgba(198,214,180,0.08)" : "rgba(31,38,29,0.08)") : "rgba(255,255,255,0.05)";
  c.save();
  c.shadowColor = "rgba(0,0,0,0.3)";
  c.shadowBlur = 22;
  c.shadowOffsetY = 8;
  fillRR(c, 0, 0, w, h, lcd ? 26 : 30, panel);
  c.restore();
  if (lcd) {
    c.strokeStyle = "rgba(0,0,0,0.25)";
    c.lineWidth = 6;
    rr(c, 10, 10, w - 20, h - 20, 18);
    c.stroke();
  }
  const ds = [...two(t.h), ...two(t.m)];
  let x = pad;
  c.save();
  if (!lcd) {
    c.shadowColor = on;
    c.shadowBlur = 18;
  }
  // A slight forward slant, like a bedside clock.
  c.translate(dh * 0.04, 0);
  c.transform(1, 0, -0.08, 1, pad * 0.08 + 8, 0);
  ds.forEach((d, i) => {
    segDigit(c, x, pad, dw, dh, d, on, off);
    x += dw + gap;
    if (i === 1) {
      // Colon.
      for (const yy of [pad + dh * 0.3, pad + dh * 0.7]) {
        c.beginPath();
        c.arc(x + 2, yy, 10, 0, Math.PI * 2);
        c.fillStyle = on;
        c.fill();
      }
      x += 40 - gap + 10;
    }
  });
  c.restore();
  return { w, h };
}

function neon(c: C, t: { h: number; m: number }, pal: Pal) {
  const s = `${two(t.h)}:${two(t.m)}`;
  const glow = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#ff4fd8" : "#4ff3ff";
  const o = { size: 180, weight: 300, color: "#ffffff", align: "center" as const, lh: 1.1, family: '"Avenir Next", "Futura", "Century Gothic", ' + SANS };
  const w = textW(c, s, o) + 120;
  const h = 260;
  // Glow passes, then a white core.
  for (const [blur, alpha] of [
    [60, 0.8],
    [30, 0.9],
    [12, 1],
  ] as const) {
    c.save();
    c.shadowColor = glow;
    c.shadowBlur = blur;
    c.globalAlpha = alpha;
    text(c, s, w / 2, 30, { ...o, color: glow });
    c.restore();
  }
  text(c, s, w / 2, 30, { ...o, color: "#ffffff" });
  return { w, h };
}

/** 5 × 7 dot font for digits and the colon. */
const DOTS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ":": ["0", "0", "1", "0", "1", "0", "0"],
};

function dots(c: C, t: { h: number; m: number }, pal: Pal) {
  const s = `${two(t.h)}:${two(t.m)}`;
  const cell = 26;
  const pad = 36;
  const cols = [...s].reduce((a, ch) => a + (DOTS[ch]?.[0].length ?? 0) + 1, -1);
  const w = pad * 2 + cols * cell;
  const h = pad * 2 + 7 * cell;
  const panel = pal.theme === "light" ? "#ffffff" : pal.theme === "dark" ? "#0d0d0d" : pal.bg;
  const on = pal.theme === "color" ? pal.fg : pal.color;
  const off = pal.theme === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)";
  c.save();
  c.shadowColor = "rgba(0,0,0,0.25)";
  c.shadowBlur = 22;
  c.shadowOffsetY = 8;
  fillRR(c, 0, 0, w, h, 30, panel);
  c.restore();
  let col = 0;
  for (const ch of s) {
    const g = DOTS[ch];
    if (!g) continue;
    for (let row = 0; row < 7; row++)
      for (let k = 0; k < g[row].length; k++) {
        c.beginPath();
        c.arc(pad + (col + k) * cell + cell / 2, pad + row * cell + cell / 2, cell * 0.38, 0, Math.PI * 2);
        c.fillStyle = g[row][k] === "1" ? on : off;
        c.fill();
      }
    col += g[0].length + 1;
  }
  return { w, h };
}
