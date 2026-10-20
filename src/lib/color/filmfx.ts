// Film FX (D-132, docs/discussions/2026-10-20-filter-v2.md): layers drawn over a photo after
// its colour — texture, light, frame, distress — plus a date stamp, like VSCO's Film FX.
// All generated in code (no artwork to license), sized to the photo, random per seed so
// "Shuffle" gives a new leak / dust pattern. Retro cameras bundle a filter + layers.

export const FX_KINDS = ["texture", "light", "frame", "distress"] as const;
export type FxKind = (typeof FX_KINDS)[number];

export interface FilmFxLayer {
  id: string;
  /** 0..100 */
  amount: number;
  seed: number;
}

export interface FilmFx {
  texture?: FilmFxLayer;
  light?: FilmFxLayer;
  frame?: FilmFxLayer;
  distress?: FilmFxLayer;
  /** Date stamp text ("'98 10 20"); absent = none. */
  date?: string;
  /** Retro camera that set this look (highlighted in the sheet). */
  camera?: string;
}

type Mode = "screen" | "multiply" | "soft-light" | "source-over";
interface FxDef {
  id: string;
  kind: FxKind;
  name: { en: string; vi: string };
  /** How the layer mixes with the photo; its base is black / white / grey / clear to match. */
  mode: Mode;
  draw: (c: CanvasRenderingContext2D, w: number, h: number, r: () => number) => void;
}

/** Small deterministic random generator. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const newSeed = () => Math.floor(Math.random() * 1e9);

function glow(c: CanvasRenderingContext2D, x: number, y: number, rad: number, color: string, alpha = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, color);
  g.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
  c.globalAlpha = alpha;
  c.fillStyle = g;
  c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  c.globalAlpha = 1;
}

/** A point on one edge of the picture (side 0 top, 1 right, 2 bottom, 3 left), t along it. */
function edgePoint(w: number, h: number, side: number, t: number, out = 0.05): [number, number] {
  if (side === 0) return [w * t, -h * out];
  if (side === 1) return [w * (1 + out), h * t];
  if (side === 2) return [w * t, h * (1 + out)];
  return [-w * out, h * t];
}

function specks(c: CanvasRenderingContext2D, w: number, h: number, r: () => number, color: string) {
  const m = Math.min(w, h);
  const n = Math.min(2600, Math.round((w * h) / 1600));
  c.fillStyle = color;
  for (let i = 0; i < n; i++) {
    c.globalAlpha = 0.25 + r() * 0.7;
    const big = r() > 0.96;
    const size = m * (big ? 0.0025 + r() * 0.004 : 0.0006 + r() * 0.0016);
    const x = r() * w;
    const y = r() * h;
    c.beginPath();
    c.arc(x, y, size, 0, Math.PI * 2);
    if (big) c.arc(x + size * (r() - 0.5) * 1.6, y + size * (r() - 0.5) * 1.6, size * (0.5 + r() * 0.5), 0, Math.PI * 2);
    c.fill();
  }
  // Hairs and fibres.
  c.strokeStyle = color;
  c.lineCap = "round";
  const fibres = 6 + Math.floor(r() * 10);
  for (let i = 0; i < fibres; i++) {
    c.globalAlpha = 0.35 + r() * 0.45;
    c.lineWidth = m * (0.0008 + r() * 0.0012);
    const x = r() * w;
    const y = r() * h;
    const L = m * (0.03 + r() * 0.08);
    c.beginPath();
    c.moveTo(x, y);
    c.bezierCurveTo(x + (r() - 0.5) * L, y + (r() - 0.5) * L, x + (r() - 0.5) * L * 1.4, y + (r() - 0.5) * L * 1.4, x + (r() - 0.5) * L * 1.6, y + (r() - 0.5) * L * 1.6);
    c.stroke();
  }
  c.globalAlpha = 1;
}

/** Fills everything but a rounded window (a frame's opening). */
function frameAround(c: CanvasRenderingContext2D, w: number, h: number, color: string, inset: [number, number, number, number], radius: number) {
  const [t, rt, b, l] = inset;
  c.fillStyle = color;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = "destination-out";
  c.beginPath();
  c.roundRect(l, t, w - l - rt, h - t - b, radius);
  c.fill();
  c.globalCompositeOperation = "source-over";
}

export const FILM_FX: FxDef[] = [
  // ── Texture ──
  { id: "dust", kind: "texture", name: { en: "Dust", vi: "Bụi" }, mode: "screen", draw: (c, w, h, r) => specks(c, w, h, r, "#ffffff") },
  { id: "dirt", kind: "texture", name: { en: "Dirt", vi: "Bụi đen" }, mode: "multiply", draw: (c, w, h, r) => specks(c, w, h, r, "#000000") },
  {
    id: "scratches",
    kind: "texture",
    name: { en: "Scratches", vi: "Vết xước" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const m = Math.min(w, h);
      c.strokeStyle = "#ffffff";
      const n = 8 + Math.floor(r() * 14);
      for (let i = 0; i < n; i++) {
        c.globalAlpha = 0.18 + r() * 0.5;
        c.lineWidth = m * (0.0006 + r() * 0.0016);
        let x = r() * w;
        const y0 = r() < 0.4 ? 0 : r() * h * 0.6;
        const y1 = r() < 0.4 ? h : y0 + h * (0.2 + r() * 0.6);
        c.beginPath();
        c.moveTo(x, y0);
        for (let y = y0; y < y1; y += h / 30) {
          x += (r() - 0.5) * m * 0.004;
          c.lineTo(x, y);
        }
        c.stroke();
      }
      specks(c, w, h, () => r() * 0.35 + (r() > 0.5 ? 0.65 : 0), "#ffffff");
    },
  },
  {
    id: "paper",
    kind: "texture",
    name: { en: "Paper", vi: "Giấy" },
    mode: "multiply",
    draw: (c, w, h, r) => {
      const img = c.getImageData(0, 0, w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 228 + r() * 27;
        img.data[i] = v;
        img.data[i + 1] = v - 4;
        img.data[i + 2] = v - 12;
      }
      c.putImageData(img, 0, 0);
      const m = Math.min(w, h);
      c.strokeStyle = "#b3a68f";
      for (let i = 0; i < 160; i++) {
        c.globalAlpha = 0.08 + r() * 0.14;
        c.lineWidth = m * (0.0006 + r() * 0.001);
        const x = r() * w;
        const y = r() * h;
        const L = m * 0.05;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + (r() - 0.5) * L, y + (r() - 0.5) * L, x + (r() - 0.5) * L * 1.5, y + (r() - 0.5) * L * 1.5);
        c.stroke();
      }
    },
  },

  // ── Light ──
  {
    id: "leakWarm",
    kind: "light",
    name: { en: "Warm leak", vi: "Vệt sáng ấm" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const m = Math.max(w, h);
      const side = Math.floor(r() * 4);
      const t = 0.15 + r() * 0.7;
      const [x, y] = edgePoint(w, h, side, t);
      glow(c, x, y, m * (0.55 + r() * 0.25), "rgba(255,110,30,0.95)");
      const [x2, y2] = edgePoint(w, h, side, Math.min(1, t + 0.25), 0);
      glow(c, x2, y2, m * 0.35, "rgba(255,190,80,0.8)");
      const [x3, y3] = edgePoint(w, h, side, Math.max(0, t - 0.3), 0.02);
      glow(c, x3, y3, m * 0.3, "rgba(255,40,30,0.75)");
    },
  },
  {
    id: "leakRed",
    kind: "light",
    name: { en: "Red streak", vi: "Vệt đỏ" },
    mode: "screen",
    draw: (c, w, h, r) => {
      // A band of light across the frame from a gap in the camera back.
      const vertical = w < h ? r() < 0.75 : r() < 0.3;
      const at = (r() < 0.5 ? 0.08 + r() * 0.2 : 0.72 + r() * 0.2) * (vertical ? w : h);
      const half = (vertical ? w : h) * (0.1 + r() * 0.1);
      const g = vertical ? c.createLinearGradient(at - half, 0, at + half, 0) : c.createLinearGradient(0, at - half, 0, at + half);
      g.addColorStop(0, "rgba(255,30,0,0)");
      g.addColorStop(0.3, "rgba(255,40,10,0.75)");
      g.addColorStop(0.5, "rgba(255,170,90,0.95)");
      g.addColorStop(0.7, "rgba(255,60,20,0.75)");
      g.addColorStop(1, "rgba(255,30,0,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      const [x, y] = vertical ? [at, r() * h] : [r() * w, at];
      glow(c, x, y, Math.max(w, h) * 0.3, "rgba(255,220,160,0.7)");
    },
  },
  {
    id: "leakPink",
    kind: "light",
    name: { en: "Pink leak", vi: "Vệt hồng" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const m = Math.max(w, h);
      const side = Math.floor(r() * 4);
      const t = 0.2 + r() * 0.6;
      const [x, y] = edgePoint(w, h, side, t);
      glow(c, x, y, m * 0.6, "rgba(255,60,150,0.9)");
      const [x2, y2] = edgePoint(w, h, side, Math.min(1, t + 0.3), 0);
      glow(c, x2, y2, m * 0.4, "rgba(150,80,255,0.75)");
      glow(c, x, y, m * 0.2, "rgba(255,200,220,0.7)");
    },
  },
  {
    id: "leakCorner",
    kind: "light",
    name: { en: "Corner glow", vi: "Loé góc" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const m = Math.max(w, h);
      const x = r() < 0.5 ? 0 : w;
      const y = r() < 0.5 ? 0 : h;
      glow(c, x, y, m * 0.75, "rgba(255,130,40,0.85)");
      glow(c, x, y, m * 0.38, "rgba(255,220,140,0.95)");
    },
  },
  {
    id: "flare",
    kind: "light",
    name: { en: "Lens flare", vi: "Loé ống kính" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const m = Math.min(w, h);
      const sx = w * (0.15 + r() * 0.7);
      const sy = h * (0.05 + r() * 0.3);
      glow(c, sx, sy, m * 0.9, "rgba(255,150,60,0.45)");
      glow(c, sx, sy, m * 0.28, "rgba(255,230,180,0.95)");
      glow(c, sx, sy, m * 0.06, "rgba(255,255,255,1)");
      // Ghosts along the line through the centre.
      const dx = w / 2 - sx;
      const dy = h / 2 - sy;
      const ghosts: [number, number, string][] = [
        [0.55, 0.035, "rgba(120,255,170,0.35)"],
        [0.9, 0.06, "rgba(160,110,255,0.3)"],
        [1.25, 0.022, "rgba(255,200,90,0.45)"],
        [1.6, 0.1, "rgba(90,170,255,0.22)"],
        [1.9, 0.045, "rgba(255,120,80,0.35)"],
      ];
      for (const [t, rad, col] of ghosts) glow(c, sx + dx * t, sy + dy * t, m * rad * (0.8 + r() * 0.5), col);
    },
  },
  {
    id: "prism",
    kind: "light",
    name: { en: "Prism", vi: "Lăng kính" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const m = Math.max(w, h);
      c.save();
      c.translate(w * (0.25 + r() * 0.5), h * (0.25 + r() * 0.5));
      c.rotate((r() - 0.5) * 1.6);
      const half = m * (0.12 + r() * 0.08);
      const g = c.createLinearGradient(-half, 0, half, 0);
      const cols = ["rgba(255,0,0,0)", "rgba(255,50,60,0.5)", "rgba(255,190,0,0.55)", "rgba(80,255,120,0.5)", "rgba(40,150,255,0.55)", "rgba(170,60,255,0.5)", "rgba(170,60,255,0)"];
      cols.forEach((col, i) => g.addColorStop(i / (cols.length - 1), col));
      c.fillStyle = g;
      c.fillRect(-half, -m, half * 2, m * 2);
      c.restore();
    },
  },
  {
    id: "haze",
    kind: "light",
    name: { en: "Sun haze", vi: "Nắng mờ" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(255,190,120,0.75)");
      g.addColorStop(0.55, "rgba(255,150,90,0.12)");
      g.addColorStop(1, "rgba(255,150,90,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      glow(c, w * (0.2 + r() * 0.6), 0, Math.max(w, h) * 0.5, "rgba(255,230,190,0.7)");
    },
  },

  // ── Frames ──
  {
    id: "film35",
    kind: "frame",
    name: { en: "35 mm", vi: "Film 35 mm" },
    mode: "source-over",
    draw: (c, w, h, r) => {
      const wide = w >= h;
      const long = wide ? w : h;
      const short = wide ? h : w;
      const band = short * 0.11;
      const side = short * 0.03;
      frameAround(c, w, h, "#0d0c0b", wide ? [band, side, band, side] : [side, band, side, band], short * 0.012);
      // Sprocket holes along both long edges, lit from behind.
      const holeW = long * 0.028;
      const holeH = band * 0.34;
      const step = holeW * 2.1;
      const offset = r() * step;
      c.fillStyle = "#e9e3d3";
      for (let p = offset - step; p < long; p += step)
        for (const across of [band * 0.14, short - band * 0.14 - holeH]) {
          c.beginPath();
          if (wide) c.roundRect(p, across, holeW, holeH, holeH * 0.2);
          else c.roundRect(across, p, holeH, holeW, holeH * 0.2);
          c.fill();
        }
      // Edge print.
      const n = 1 + Math.floor(r() * 36);
      c.fillStyle = "#f2a145";
      c.font = `600 ${Math.round(band * 0.2)}px ui-monospace, Menlo, monospace`;
      c.textBaseline = "middle";
      const label = `FILM 400   ▶ ${n}   ${n}A   ▶ ${n + 1}`;
      const at = band * 0.78;
      if (wide) c.fillText(label, long * 0.08, at);
      else {
        c.save();
        c.translate(at, short * 0 + long * 0.08);
        c.rotate(Math.PI / 2);
        c.fillText(label, 0, 0);
        c.restore();
      }
    },
  },
  {
    id: "negative",
    kind: "frame",
    name: { en: "Negative edge", vi: "Mép phim" },
    mode: "source-over",
    draw: (c, w, h, r) => {
      const m = Math.min(w, h);
      const b = m * 0.045;
      frameAround(c, w, h, "#0b0a09", [b, b, b, b], 0);
      // Rough, filed-out opening.
      c.fillStyle = "#0b0a09";
      const bumps = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
        const steps = 90;
        c.beginPath();
        c.moveTo(x0, y0);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const d = m * (0.002 + r() * 0.01) * (r() < 0.1 ? 2.2 : 1);
          c.lineTo(x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d);
        }
        c.lineTo(x1, y1);
        c.closePath();
        c.fill();
      };
      bumps(b, b, w - b, b, 0, 1);
      bumps(b, h - b, w - b, h - b, 0, -1);
      bumps(b, b, b, h - b, 1, 0);
      bumps(w - b, b, w - b, h - b, -1, 0);
    },
  },
  {
    id: "instant",
    kind: "frame",
    name: { en: "Instant", vi: "Ảnh lấy liền" },
    mode: "source-over",
    draw: (c, w, h) => {
      const m = Math.min(w, h);
      const s = m * 0.06;
      frameAround(c, w, h, "#f3f0e8", [s, s, w >= h ? s : m * 0.24, s], m * 0.004);
    },
  },
  {
    id: "super8",
    kind: "frame",
    name: { en: "Super 8", vi: "Super 8" },
    mode: "source-over",
    draw: (c, w, h, r) => {
      const m = Math.min(w, h);
      const s = m * 0.05;
      frameAround(c, w, h, "#0c0b0a", [s, s * 1.8, s, s * 1.8], m * 0.07);
      c.fillStyle = "#e6dfcd";
      const holeH = m * 0.11;
      c.beginPath();
      c.roundRect(s * 0.35, h * (0.2 + r() * 0.1), s * 0.95, holeH, s * 0.2);
      c.fill();
    },
  },
  {
    id: "slide",
    kind: "frame",
    name: { en: "Slide mount", vi: "Khung slide" },
    mode: "source-over",
    draw: (c, w, h) => {
      const m = Math.min(w, h);
      const s = m * 0.1;
      frameAround(c, w, h, "#ebe5d6", [s, s, s, s], m * 0.025);
      c.strokeStyle = "rgba(0,0,0,0.18)";
      c.lineWidth = m * 0.004;
      c.beginPath();
      c.roundRect(s, s, w - s * 2, h - s * 2, m * 0.025);
      c.stroke();
    },
  },
  {
    id: "print",
    kind: "frame",
    name: { en: "White print", vi: "Viền trắng" },
    mode: "source-over",
    draw: (c, w, h) => {
      const s = Math.min(w, h) * 0.035;
      frameAround(c, w, h, "#fbfaf6", [s, s, s, s], 0);
    },
  },

  // ── Distressed ──
  {
    id: "burn",
    kind: "distress",
    name: { en: "Film burn", vi: "Cháy film" },
    mode: "screen",
    draw: (c, w, h, r) => {
      const m = Math.max(w, h);
      const side = Math.floor(r() * 4);
      const [x, y] = edgePoint(w, h, side, 0.1 + r() * 0.8, 0.02);
      glow(c, x, y, m * 0.8, "rgba(255,60,0,0.95)");
      glow(c, x, y, m * 0.42, "rgba(255,150,40,1)");
      glow(c, x, y, m * 0.2, "rgba(255,245,220,1)");
      for (let i = 0; i < 4; i++) {
        const [px, py] = edgePoint(w, h, side, r(), 0);
        glow(c, px, py, m * (0.1 + r() * 0.2), "rgba(255,90,20,0.8)");
      }
    },
  },
  {
    id: "stains",
    kind: "distress",
    name: { en: "Stains", vi: "Vết ố" },
    mode: "soft-light",
    draw: (c, w, h, r) => {
      const m = Math.max(w, h);
      const cols = ["rgba(255,0,170,0.9)", "rgba(0,220,255,0.8)", "rgba(255,210,0,0.8)", "rgba(110,0,40,0.8)"];
      for (let i = 0; i < 9; i++) glow(c, r() * w, r() * h, m * (0.12 + r() * 0.3), cols[Math.floor(r() * cols.length)], 0.5 + r() * 0.5);
    },
  },
  {
    id: "fadedEdge",
    kind: "distress",
    name: { en: "Faded edges", vi: "Phai mép" },
    mode: "screen",
    draw: (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.hypot(w, h) / 2);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(235,225,205,0.85)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    },
  },
];

export function fxById(id: string | undefined) {
  return id ? FILM_FX.find((f) => f.id === id) : undefined;
}

const BASE: Record<Mode, string | null> = { screen: "#000000", multiply: "#ffffff", "soft-light": "#808080", "source-over": null };

// Layers are cached per (effect, seed, size): video frames and redraws reuse them.
const cache = new Map<string, HTMLCanvasElement>();
function layerCanvas(def: FxDef, seed: number, w: number, h: number) {
  const key = `${def.id}|${seed}|${w}|${h}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  const base = BASE[def.mode];
  if (base) {
    c.fillStyle = base;
    c.fillRect(0, 0, w, h);
  }
  def.draw(c, w, h, rng(seed));
  c.globalAlpha = 1;
  c.globalCompositeOperation = "source-over";
  cache.set(key, canvas);
  while (cache.size > 12) cache.delete(cache.keys().next().value!);
  return canvas;
}

export function hasFilmFx(fx: FilmFx | undefined) {
  return !!fx && (FX_KINDS.some((k) => fx[k]) || !!fx.date);
}

/** Draws the layers and the date over a photo occupying (0, 0, w, h) in `c`. */
export function drawFilmFx(c: CanvasRenderingContext2D, w: number, h: number, fx: FilmFx | undefined) {
  if (!fx || w < 2 || h < 2) return;
  // Layers are drawn at most ~1600 px and stretched: textures stay crisp enough, cost stays low.
  const s = Math.min(1, 1600 / Math.max(w, h));
  const lw = Math.max(2, Math.round(w * s));
  const lh = Math.max(2, Math.round(h * s));
  c.save();
  for (const kind of ["distress", "light", "texture", "frame"] as const) {
    const layer = fx[kind];
    const def = fxById(layer?.id);
    if (!layer || !def || layer.amount <= 0) continue;
    c.globalAlpha = Math.min(1, layer.amount / 100);
    c.globalCompositeOperation = def.mode;
    c.drawImage(layerCanvas(def, layer.seed, lw, lh), 0, 0, w, h);
  }
  c.restore();
  if (fx.date) drawDate(c, w, h, fx.date, fx.frame ? fxById(fx.frame.id) : undefined);
}

/** Orange LED date of a 90s compact camera, bottom right (inside a frame's opening). */
function drawDate(c: CanvasRenderingContext2D, w: number, h: number, text: string, frame: FxDef | undefined) {
  const m = Math.min(w, h);
  const size = m * 0.045;
  const inset = m * (frame ? (frame.id === "instant" ? 0.09 : frame.id === "film35" ? 0.14 : 0.12) : 0.05);
  c.save();
  c.font = `700 ${Math.round(size)}px ui-monospace, "SF Mono", Menlo, monospace`;
  c.textAlign = "right";
  c.textBaseline = "alphabetic";
  c.shadowColor = "rgba(255,120,30,0.9)";
  c.shadowBlur = size * 0.5;
  c.fillStyle = "#ff9b3d";
  const y = h - inset - (frame?.id === "instant" && h >= w ? m * 0.18 : 0);
  c.fillText(text, w - inset, y);
  c.shadowBlur = 0;
  c.globalAlpha = 0.6;
  c.fillStyle = "#ffe0b0";
  c.fillText(text, w - inset, y);
  c.restore();
}

/** Today as a date stamp: "'26 10 20". */
export function todayStamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `'${p(d.getFullYear() % 100)} ${p(d.getMonth() + 1)} ${p(d.getDate())}`;
}

// ── Retro cameras: a filter + layers in one tap; each tap re-rolls the random parts. ──

export interface RetroCamera {
  id: string;
  name: string;
  filter: string;
  layers: Partial<Record<FxKind, { id: string; amount: number }>>;
  date?: boolean;
}

export const CAMERAS: RetroCamera[] = [
  { id: "disposable", name: "Disposable", filter: "flash", layers: { light: { id: "leakWarm", amount: 70 }, texture: { id: "dust", amount: 55 } }, date: true },
  { id: "compact98", name: "Compact 98", filter: "gold200", layers: { light: { id: "leakCorner", amount: 45 }, texture: { id: "dust", amount: 40 } }, date: true },
  { id: "instantcam", name: "Instant", filter: "linen", layers: { frame: { id: "instant", amount: 100 }, distress: { id: "fadedEdge", amount: 45 }, texture: { id: "dirt", amount: 30 } } },
  { id: "digicam", name: "Digicam 03", filter: "ccd03", layers: {}, date: true },
  { id: "lomo", name: "Lomo", filter: "cross", layers: { light: { id: "leakPink", amount: 40 } } },
  { id: "toycam", name: "Toy Cam", filter: "vivid100", layers: { light: { id: "leakRed", amount: 60 }, texture: { id: "dust", amount: 35 } } },
  { id: "super8cam", name: "Super 8", filter: "rust", layers: { frame: { id: "super8", amount: 100 }, texture: { id: "scratches", amount: 55 } } },
  { id: "nightcine", name: "Night Cine", filter: "tungsten800", layers: { frame: { id: "film35", amount: 100 } } },
  { id: "expiredroll", name: "Expired Roll", filter: "expired", layers: { distress: { id: "stains", amount: 55 }, light: { id: "leakWarm", amount: 35 }, texture: { id: "dust", amount: 45 } } },
  { id: "darkroom", name: "Darkroom", filter: "press400", layers: { frame: { id: "negative", amount: 100 }, texture: { id: "scratches", amount: 50 } } },
  { id: "slideshow", name: "Slide Show", filter: "slide100", layers: { frame: { id: "slide", amount: 100 }, texture: { id: "dust", amount: 30 } } },
  { id: "sunburnt", name: "Sunburnt", filter: "honey400", layers: { distress: { id: "burn", amount: 65 }, texture: { id: "dust", amount: 35 } } },
];

export function cameraById(id: string | undefined) {
  return id ? CAMERAS.find((c) => c.id === id) : undefined;
}

/** The camera's layers with fresh random seeds. */
export function cameraFx(cam: RetroCamera, date = todayStamp()): FilmFx {
  const fx: FilmFx = { camera: cam.id };
  for (const k of FX_KINDS) {
    const l = cam.layers[k];
    if (l) fx[k] = { ...l, seed: newSeed() };
  }
  if (cam.date) fx.date = date;
  return fx;
}
