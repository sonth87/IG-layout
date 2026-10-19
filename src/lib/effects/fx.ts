// The pixel work of the effects (editor-v2/14). Each effect turns the element's picture
// (drawn with room around it) into the result, in place. Coordinates are canvas pixels;
// `k` turns the settings' element units into them.
import { effectParams, type ElementEffect } from "./catalog";

export interface FxCtx {
  /** Canvas size. */
  W: number;
  H: number;
  /** The element's box inside the canvas. */
  x0: number;
  y0: number;
  w: number;
  h: number;
  /** Canvas pixels per element unit. */
  k: number;
  p: Record<string, number | string | boolean>;
  seed: number;
}

/** Room around the element (element units) the effect may draw into. */
export interface Pad {
  l: number;
  t: number;
  r: number;
  b: number;
}

const num = (v: unknown, d = 0) => (typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || d : d);
const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

function rng(seed: number) {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hex(c: unknown): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(c ?? ""));
  const n = m ? parseInt(m[1], 16) : 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Extends the room in a direction (deg; 0 = →, 90 = ↓). */
function padToward(deg: number, len: number, pad: Pad = { l: 0, t: 0, r: 0, b: 0 }): Pad {
  const dx = Math.cos(rad(deg));
  const dy = Math.sin(rad(deg));
  if (dx > 0.01) pad.r = Math.max(pad.r, dx * len);
  if (dx < -0.01) pad.l = Math.max(pad.l, -dx * len);
  if (dy > 0.01) pad.b = Math.max(pad.b, dy * len);
  if (dy < -0.01) pad.t = Math.max(pad.t, -dy * len);
  return pad;
}
const all = (v: number): Pad => ({ l: v, t: v, r: v, b: v });

export function effectPad(e: ElementEffect, w: number, h: number): Pad {
  const p = effectParams(e);
  const d = num(p.dir, 90);
  switch (e.id) {
    case "melt": {
      const along = Math.abs(Math.cos(rad(d))) * w + Math.abs(Math.sin(rad(d))) * h;
      const across = Math.abs(Math.sin(rad(d))) * w + Math.abs(Math.cos(rad(d))) * h;
      return padToward(d, Math.max(along, across * 0.35) * 1.6 * (num(p.amount) / 100) + 4);
    }
    case "drape": {
      const along = d === 90 ? h : w;
      return padToward(d, along * 1.1 * (num(p.droop) / 100) + along * 0.2);
    }
    case "wave": {
      const a = (num(p.amp) / 100) * 0.2 * Math.min(w, h) + 2;
      return p.axis === "h" ? { l: a, r: a, t: 0, b: 0 } : p.axis === "v" ? { l: 0, r: 0, t: a, b: a } : all(a);
    }
    case "arc": {
      const b = Math.abs(num(p.bend)) / 100;
      if (b < 0.01) return all(0);
      const th = b * Math.PI;
      const sag = (w / th + h) * (1 - Math.cos(th / 2)) + 4;
      return num(p.bend) > 0 ? { l: 0, r: 0, t: 0, b: sag } : { l: 0, r: 0, t: sag, b: 0 };
    }
    case "glitch": {
      const a = (num(p.amount) / 100) * 0.15 * w + (num(p.split) / 100) * 0.03 * w + 2;
      return { l: a, r: a, t: 0, b: 0 };
    }
    case "rgbSplit":
      return all(num(p.amount) + 2);
    case "longShadow":
      return padToward(d, num(p.length) + 2);
    case "offsetShadow":
      return padToward(d, num(p.offset) * num(p.layers, 1) + 2);
    case "outline": {
      const e2 = num(p.width) + num(p.width2) + 2;
      return { l: e2 + 6, r: e2 + 6, t: e2 + 6, b: e2 + 6 + (num(p.shadow) / 100) * 18 };
    }
    case "reflection": {
      const along = d === 90 || d === 270 ? h : w;
      return padToward(d, num(p.gap) + along * (num(p.length) / 100) + 2);
    }
    case "echo": {
      const n = num(p.count, 5);
      const grow = Math.max(0, num(p.grow)) / 100;
      return padToward(d, n * num(p.spacing), all(Math.max(w, h) * grow * 0.5 + 2));
    }
    case "flag": {
      const a = (num(p.wind, 50) / 100) * 0.08 * (p.edge === "top" ? h : w) + 2;
      return p.edge === "top" ? { l: a, r: a, t: 0, b: 0 } : { l: 0, r: 0, t: a, b: a };
    }
    case "perspective": {
      const q = tiltQuad(w, h, num(p.tiltX, 25), num(p.tiltY), num(p.depth, 50));
      const xs = q.map((v) => v[0]);
      const ys = q.map((v) => v[1]);
      return { l: Math.max(0, -Math.min(...xs) - w / 2) + 2, r: Math.max(0, Math.max(...xs) - w / 2) + 2, t: Math.max(0, -Math.min(...ys) - h / 2) + 2, b: Math.max(0, Math.max(...ys) - h / 2) + 2 };
    }
    case "tear": {
      const vert = p.way !== "h";
      const g = (num(p.gap, 25) / 100) * 0.06 * (vert ? w : h) + 2;
      const s2 = (num(p.shift, 20) / 100) * 0.04 * (vert ? h : w) + 2;
      return vert ? { l: g, r: g, t: s2, b: s2 } : { l: s2, r: s2, t: g, b: g };
    }
    case "glow":
      return all(num(p.radius, 20) * 2.2 + 4);
    case "extrude":
      return padToward(d, num(p.depth, 30) * 1.8 + 8, all(num(p.depth, 30) * 0.5 + 4));
    case "rays":
      return all(Math.max(w, h) * (num(p.length, 60) / 100) * 0.5 + 4);
    case "motionBlur": {
      // The trail is behind the movement.
      const L = (num(p.length, 40) / 100) * 0.3 * Math.max(w, h) + 2;
      return padToward(d + 180, L);
    }
    case "zoomBlur":
      return all(Math.max(w, h) * (num(p.amount, 40) / 100) * 0.2 + 2);
    case "shatter":
      return all((num(p.spread, 30) / 100) * 0.2 * Math.max(w, h) + 4);
    case "watercolor":
      return all(((num(p.bleed, 40) / 100) * 14 + 4) * 0.7);
    case "crayon":
      return all(4);
    case "smoke":
      return padToward(d, Math.max(w, h) * 0.9, all(Math.max(w, h) * 0.08));
    case "fire": {
      const hf = (num(p.height, 25) / 100) * Math.min(w, h) * 1.2 + 4;
      return padToward(d, hf * 1.6 + 6, all(hf * 0.4 + 4));
    }
    case "frost":
      return all((num(p.ice, 40) / 100) * 16 + 6);
    default:
      return all(2);
  }
}

// ---------------------------------------------------------------- sampling

/** Premultiplied copy: smooth sampling without dark fringes. */
function premul(src: Uint8ClampedArray) {
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3] / 255;
    out[i] = src[i] * a;
    out[i + 1] = src[i + 1] * a;
    out[i + 2] = src[i + 2] * a;
    out[i + 3] = src[i + 3];
  }
  return out;
}

/** Bilinear sample at (x, y) into `o` (premultiplied rgba). */
function sample(pm: Float32Array, W: number, H: number, x: number, y: number, o: Float32Array) {
  x -= 0.5;
  y -= 0.5;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  o[0] = o[1] = o[2] = o[3] = 0;
  for (let j = 0; j < 2; j++) {
    const yy = y0 + j;
    if (yy < 0 || yy >= H) continue;
    const wy = j ? fy : 1 - fy;
    for (let i = 0; i < 2; i++) {
      const xx = x0 + i;
      if (xx < 0 || xx >= W) continue;
      const wgt = wy * (i ? fx : 1 - fx);
      const n = (yy * W + xx) * 4;
      o[0] += pm[n] * wgt;
      o[1] += pm[n + 1] * wgt;
      o[2] += pm[n + 2] * wgt;
      o[3] += pm[n + 3] * wgt;
    }
  }
}

function put(d: Uint8ClampedArray, n: number, o: Float32Array) {
  const a = o[3];
  if (a <= 0.01) {
    d[n] = d[n + 1] = d[n + 2] = d[n + 3] = 0;
    return;
  }
  const inv = 255 / a;
  d[n] = o[0] * inv;
  d[n + 1] = o[1] * inv;
  d[n + 2] = o[2] * inv;
  d[n + 3] = a;
}

/** Every output pixel takes the colour at map(x, y) of the input (null = transparent). */
function warp(img: ImageData, map: (x: number, y: number, out: number[]) => boolean, after?: (x: number, y: number, n: number, d: Uint8ClampedArray) => void) {
  const { width: W, height: H, data } = img;
  const pm = premul(data);
  const o = new Float32Array(4);
  const at = [0, 0];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      if (map(x + 0.5, y + 0.5, at)) {
        sample(pm, W, H, at[0], at[1], o);
        put(data, n, o);
      } else data[n] = data[n + 1] = data[n + 2] = data[n + 3] = 0;
      after?.(x, y, n, data);
    }
}

/** Puts the original back over what the effect drew behind it. */
function over(base: Uint8ClampedArray, top: Uint8ClampedArray) {
  for (let i = 0; i < base.length; i += 4) {
    const ta = top[i + 3] / 255;
    if (ta <= 0) continue;
    const ba = base[i + 3] / 255;
    const a = ta + ba * (1 - ta);
    for (let c = 0; c < 3; c++) base[i + c] = (top[i + c] * ta + base[i + c] * ba * (1 - ta)) / a;
    base[i + 3] = a * 255;
  }
}

/** Separable box blur of one channel, `passes` times (≈ gaussian). */
function blurAlpha(a: Float32Array, W: number, H: number, r: number, passes = 3) {
  r = Math.max(1, Math.round(r));
  const tmp = new Float32Array(a.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < H; y++) {
      let acc = 0;
      const row = y * W;
      for (let x = -r; x <= r; x++) acc += a[row + clamp(x, 0, W - 1)];
      for (let x = 0; x < W; x++) {
        tmp[row + x] = acc / (2 * r + 1);
        acc += a[row + clamp(x + r + 1, 0, W - 1)] - a[row + clamp(x - r, 0, W - 1)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
      for (let y = 0; y < H; y++) {
        a[y * W + x] = acc / (2 * r + 1);
        acc += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x];
      }
    }
  }
}

/** Distance (pixels, approx.) from each pixel to the nearest solid one: chamfer 3-4. */
function distanceOut(data: Uint8ClampedArray, W: number, H: number, threshold = 128) {
  const INF = 1e9;
  const d = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) d[i] = data[i * 4 + 3] >= threshold ? 0 : INF;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 3);
      if (y > 0) {
        v = Math.min(v, d[i - W] + 3);
        if (x > 0) v = Math.min(v, d[i - W - 1] + 4);
        if (x < W - 1) v = Math.min(v, d[i - W + 1] + 4);
      }
      d[i] = v;
    }
  for (let y = H - 1; y >= 0; y--)
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      let v = d[i];
      if (x < W - 1) v = Math.min(v, d[i + 1] + 3);
      if (y < H - 1) {
        v = Math.min(v, d[i + W] + 3);
        if (x < W - 1) v = Math.min(v, d[i + W + 1] + 4);
        if (x > 0) v = Math.min(v, d[i + W - 1] + 4);
      }
      d[i] = v;
    }
  for (let i = 0; i < d.length; i++) d[i] /= 3;
  return d;
}

// ---------------------------------------------------------------- effects

type Fx = (img: ImageData, c: FxCtx) => void;

/**
 * Drip profile across the width (0..1): a broad sag plus drips of different lengths with
 * round ends. `aspect` (width / length): a wide thing gets more, narrower drips.
 */
function drips(c: FxCtx, count: number, vary: number, thick: number, aspect = 1) {
  const rnd = rng(c.seed * 7919 + count);
  const n = Math.round(count * Math.max(1, aspect / 1.5));
  const narrow = 1 / Math.max(1, aspect / 1.5);
  const list = Array.from({ length: n }, () => ({ at: 0.05 + rnd() * 0.9, len: 1 - vary * rnd() * 0.85, wid: (0.02 + thick * 0.05 + rnd() * 0.015) * narrow }));
  return {
    list,
    at(u: number) {
      let v = 0.12 * Math.pow(Math.max(0, Math.sin(Math.PI * u)), 1.2);
      for (const d of list) {
        const x = (u - d.at) / d.wid;
        // A rounded tongue: full length in the middle, a soft shoulder at the sides.
        if (Math.abs(x) < 1.6) v = Math.max(v, d.len * (Math.abs(x) < 1 ? Math.sqrt(1 - x * x) : 0) + 0.08 * d.len * Math.exp(-x * x));
      }
      return v;
    },
  };
}

/** Axis frame for a direction: along D, across N; the element's extent on both. */
function frame(c: FxCtx, deg: number) {
  const D = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  const N = [-D[1], D[0]];
  const corners = [
    [c.x0, c.y0],
    [c.x0 + c.w, c.y0],
    [c.x0, c.y0 + c.h],
    [c.x0 + c.w, c.y0 + c.h],
  ];
  const ts = corners.map(([x, y]) => x * D[0] + y * D[1]);
  const ss = corners.map(([x, y]) => x * N[0] + y * N[1]);
  const tMin = Math.min(...ts);
  const sMin = Math.min(...ss);
  return { D, N, tMin, L: Math.max(...ts) - tMin, sMin, S: Math.max(...ss) - sMin };
}

/**
 * Melt (owner, 2026-10-19: "not like a cow's teats"): the lower part sags a little and
 * unevenly, then drips run from its lowest edge — a thin stream with a flared root, ending
 * in a round bead a bit wider than the stream, in the colour where it leaves, with a wet
 * highlight. Lengths and widths differ.
 */
const melt: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const f = frame(c, num(c.p.dir, 90));
  const scale = Math.max(f.L, f.S * 0.35);
  const amt = num(c.p.amount, 55) / 100;
  const b = num(c.p.start, 70) / 100;
  const vary = num(c.p.vary, 60) / 100;
  const thick = num(c.p.thick, 50) / 100;
  const gloss = num(c.p.gloss, 30) / 100;
  const rnd = rng(c.seed * 7919 + 5);
  // 1. Uneven sag of the part past "starts at".
  const waves = Array.from({ length: 4 }, () => ({ f: 1.5 + rnd() * 5, ph: rnd() * 6.28, a: 0.3 + rnd() * 0.7 }));
  const sag = (u: number) => {
    let v = 0.55 * Math.pow(Math.max(0, Math.sin(Math.PI * u)), 1.2);
    for (const w of waves) v += 0.22 * w.a * Math.sin(w.f * u * Math.PI * 2 + w.ph);
    return Math.max(0, v);
  };
  const sagAmt = (amt * 0.14 * scale) / f.L;
  warp(img, (x, y, o) => {
    const t = x * f.D[0] + y * f.D[1];
    const s = x * f.N[0] + y * f.N[1];
    const u = clamp((s - f.sMin) / f.S, 0, 1);
    let tn = (t - f.tMin) / f.L;
    if (tn > b) tn = b + ((tn - b) * (1 - b)) / (1 - b + sagAmt * sag(u));
    const tt = f.tMin + tn * f.L;
    o[0] = s * f.N[0] + tt * f.D[0];
    o[1] = s * f.N[1] + tt * f.D[1];
    return tn <= 1.0001;
  });
  // 2. Drips from the lowest solid point of their column.
  const aspect = f.S / f.L;
  const count = Math.round(num(c.p.drips, 4) * Math.max(1, aspect / 1.5));
  const alphaAt = (x: number, y: number) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    return xi < 0 || yi < 0 || xi >= W || yi >= H ? 0 : data[(yi * W + xi) * 4 + 3];
  };
  for (let i = 0; i < count; i++) {
    const u = 0.05 + rnd() * 0.9;
    const len = amt * scale * 1.15 * (0.2 + 0.8 * (1 - vary * rnd()));
    const sw = Math.max(2, scale * (0.016 + thick * 0.04) * (0.65 + rnd() * 0.7));
    const s0 = f.sMin + u * f.S;
    // Search from beyond the far edge back towards the start.
    let t0 = NaN;
    for (let t = f.tMin + f.L * (1 + sagAmt * 1.6); t > f.tMin + f.L * b; t -= 1) {
      if (alphaAt(s0 * f.N[0] + t * f.D[0], s0 * f.N[1] + t * f.D[1]) >= 150) {
        t0 = t;
        break;
      }
    }
    if (!Number.isFinite(t0) || len < sw) continue;
    // Its colour: just inside the edge.
    const cx = Math.round(s0 * f.N[0] + (t0 - 2) * f.D[0]);
    const cy = Math.round(s0 * f.N[1] + (t0 - 2) * f.D[1]);
    const ci = (clamp(cy, 0, H - 1) * W + clamp(cx, 0, W - 1)) * 4;
    const col = [data[ci], data[ci + 1], data[ci + 2]];
    const rb = sw * (0.62 + rnd() * 0.25);
    const neck = sw / 2;
    const tEnd = t0 + len;
    const tBead = tEnd - rb;
    // The drip's box, in canvas pixels.
    const pts = [
      [s0 - sw * 2.5, t0 - sw],
      [s0 + sw * 2.5, t0 - sw],
      [s0 - sw * 2.5, tEnd + 2],
      [s0 + sw * 2.5, tEnd + 2],
    ].map(([ss, tt]) => [ss * f.N[0] + tt * f.D[0], ss * f.N[1] + tt * f.D[1]]);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(H - 1, Math.ceil(Math.max(...ys))); y++)
      for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(W - 1, Math.ceil(Math.max(...xs))); x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const t = px * f.D[0] + py * f.D[1];
        const ds = px * f.N[0] + py * f.N[1] - s0;
        const tt = t - t0;
        if (tt < -sw) continue;
        // Stream: flared where it leaves the edge, thin, then the bead.
        const r = neck * (0.92 + 0.08 * Math.sin(tt / (sw * 3))) + sw * 1.3 * Math.exp(-Math.max(0, tt) / (sw * 1.1));
        let cov = 0;
        let rel = 1;
        if (t <= tBead) {
          cov = clamp(r - Math.abs(ds) + 0.5, 0, 1);
          rel = Math.abs(ds) / r;
        }
        const db = Math.hypot(ds, t - tBead);
        const cb = clamp(rb - db + 0.5, 0, 1);
        if (cb > cov) {
          cov = cb;
          rel = db / rb;
        }
        if (cov <= 0) continue;
        const n = (y * W + x) * 4;
        // A round body: a little darker at the sides, a wet highlight on one side.
        const body = 0.82 + 0.18 * (1 - rel * rel);
        const hl = gloss * 0.7 * Math.exp(-((((ds / Math.max(1, t <= tBead ? r : rb)) + 0.4) / 0.18) ** 2)) * (t > t0 + sw ? 1 : 0.3);
        const spec = gloss * 0.9 * Math.exp(-((Math.hypot(ds + rb * 0.32, t - tBead + rb * 0.3) / (rb * 0.22)) ** 2));
        const a0 = data[n + 3] / 255;
        const a = cov + a0 * (1 - cov);
        for (let k = 0; k < 3; k++) {
          let v = col[k] * body;
          v += (255 - v) * Math.min(1, hl + spec);
          data[n + k] = (v * cov + data[n + k] * a0 * (1 - cov)) / Math.max(1e-3, a);
        }
        data[n + 3] = a * 255;
      }
  }
};

const drape: Fx = (img, c) => {
  const deg = num(c.p.dir, 90);
  const f = frame(c, deg);
  const fold = num(c.p.fold, 50) / 100;
  const flat = (num(c.p.flat, 60) / 100) * 0.75;
  const droop = (num(c.p.droop, 50) / 100) * 1.1;
  const nd = Math.round(num(c.p.drips, 2));
  const prof = drips(c, Math.max(1, nd), 0.6, 0.3);
  const shade = num(c.p.shade, 50) / 100;
  const startTop = fold * flat;
  warp(
    img,
    (x, y, o) => {
      const t = x * f.D[0] + y * f.D[1];
      const s = x * f.N[0] + y * f.N[1];
      const u = clamp((s - f.sMin) / f.S, 0, 1);
      let tn = (t - f.tMin) / f.L;
      if (tn < startTop) return false;
      if (tn < fold) tn = (tn - startTop) / (1 - flat);
      else {
        const dr = droop * (0.35 * Math.pow(Math.sin(Math.PI * u), 1.4) + (nd ? 0.65 * prof.at(u) : 0));
        tn = fold + ((tn - fold) * (1 - fold)) / (1 - fold + dr);
      }
      const tt = f.tMin + tn * f.L;
      o[0] = s * f.N[0] + tt * f.D[0];
      o[1] = s * f.N[1] + tt * f.D[1];
      return tn <= 1.0001;
    },
    shade > 0
      ? (x, y, n, d) => {
          if (d[n + 3] < 5) return;
          const tn = (x * f.D[0] + y * f.D[1] - f.tMin) / f.L;
          let k = 0;
          if (tn > fold && tn < fold + 0.14) k = -0.45 * shade * (1 - (tn - fold) / 0.14);
          else if (tn > fold - 0.04 && tn <= fold) k = 0.3 * shade * (1 - (fold - tn) / 0.04);
          if (k < 0) for (let i = 0; i < 3; i++) d[n + i] *= 1 + k;
          else if (k > 0) for (let i = 0; i < 3; i++) d[n + i] += (255 - d[n + i]) * k;
        }
      : undefined,
  );
};

const twirl: Fx = (img, c) => {
  const cx = c.x0 + (num(c.p.cx, 50) / 100) * c.w;
  const cy = c.y0 + (num(c.p.cy, 50) / 100) * c.h;
  const R = (num(c.p.radius, 60) / 100) * Math.max(c.w, c.h) * 0.75;
  const a = rad(num(c.p.angle, 180));
  warp(img, (x, y, o) => {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.hypot(dx, dy);
    if (r < R) {
      const th = -a * (1 - r / R) ** 2;
      const co = Math.cos(th);
      const si = Math.sin(th);
      o[0] = cx + dx * co - dy * si;
      o[1] = cy + dx * si + dy * co;
    } else {
      o[0] = x;
      o[1] = y;
    }
    return true;
  });
};

const bulge: Fx = (img, c) => {
  const cx = c.x0 + (num(c.p.cx, 50) / 100) * c.w;
  const cy = c.y0 + (num(c.p.cy, 50) / 100) * c.h;
  const R = (num(c.p.radius, 50) / 100) * Math.max(c.w, c.h) * 0.75;
  const s = num(c.p.amount, 50) / 100;
  warp(img, (x, y, o) => {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.hypot(dx, dy);
    if (r < R && r > 0) {
      const rn = r / R;
      // Bulge: the inside is taken from nearer the centre (bigger); pinch: from farther.
      const e = s > 0 ? 1 + s * 1.2 : 1 / (1 - s * 1.2);
      // Blend back to normal towards the edge of the circle.
      const sr = Math.pow(rn, e) * (1 - rn ** 4) + rn * rn ** 4;
      const k2 = (sr * R) / r;
      o[0] = cx + dx * k2;
      o[1] = cy + dy * k2;
    } else {
      o[0] = x;
      o[1] = y;
    }
    return true;
  });
};

const wave: Fx = (img, c) => {
  const A = (num(c.p.amp, 30) / 100) * 0.2 * Math.min(c.w, c.h);
  const n = num(c.p.count, 2);
  const ph = rad(num(c.p.phase));
  const axis = c.p.axis ?? "h";
  warp(img, (x, y, o) => {
    o[0] = axis === "v" ? x : x - A * Math.sin((2 * Math.PI * n * (y - c.y0)) / c.h + ph);
    o[1] = axis === "h" ? y : y - A * Math.sin((2 * Math.PI * n * (x - c.x0)) / c.w + ph);
    return true;
  });
};

const arc: Fx = (img, c) => {
  const b = num(c.p.bend, 40) / 100;
  if (Math.abs(b) < 0.01) return;
  const th = Math.abs(b) * Math.PI;
  const R = c.w / th;
  const cx = c.x0 + c.w / 2;
  if (b > 0) {
    // Arch: centre below; the bottom edge on radius R.
    const cy = c.y0 + c.h + R;
    warp(img, (x, y, o) => {
      const dx = x - cx;
      const dy = cy - y;
      const r = Math.hypot(dx, dy);
      const phi = Math.atan2(dx, dy);
      if (Math.abs(phi) > th / 2 + 0.02) return false;
      o[0] = cx + phi * R;
      o[1] = c.y0 + c.h - (r - R);
      return true;
    });
  } else {
    // Smile: centre above; the top edge on radius R.
    const cy = c.y0 - R;
    warp(img, (x, y, o) => {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy);
      const phi = Math.atan2(dx, dy);
      if (Math.abs(phi) > th / 2 + 0.02) return false;
      o[0] = cx - phi * R;
      o[1] = c.y0 + (r - R);
      return true;
    });
  }
};

const glitch: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const src = data.slice();
  const rnd = rng(c.seed * 104729 + 3);
  const amt = num(c.p.amount, 40) / 100;
  const n = Math.round(num(c.p.slices, 12));
  const maxOff = amt * 0.15 * c.w;
  const split = Math.round((num(c.p.split, 40) / 100) * 0.03 * c.w);
  const rows = new Float32Array(H);
  for (let i = 0; i < n; i++) {
    if (rnd() > 0.35 + amt * 0.6) continue;
    const y0 = Math.floor(c.y0 + rnd() * c.h);
    const hh = Math.max(2, Math.floor((rnd() * c.h) / n) * 1.6);
    const off = (rnd() - 0.5) * 2 * maxOff;
    for (let y = y0; y < Math.min(H, y0 + hh); y++) rows[y] = off;
  }
  const px = (x: number, y: number, ch: number) => {
    const xx = Math.round(x);
    return xx < 0 || xx >= W ? 0 : src[(y * W + xx) * 4 + ch];
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n4 = (y * W + x) * 4;
      const sx = x - rows[y];
      const ar = px(sx - split, y, 3);
      const ag = px(sx, y, 3);
      const ab = px(sx + split, y, 3);
      data[n4] = px(sx - split, y, 0);
      data[n4 + 1] = px(sx, y, 1);
      data[n4 + 2] = px(sx + split, y, 2);
      data[n4 + 3] = Math.max(ar, ag, ab);
    }
  // Noise blocks.
  const blocks = Math.round((num(c.p.blocks) / 100) * 14);
  for (let i = 0; i < blocks; i++) {
    const bw = Math.floor(c.w * (0.05 + rnd() * 0.25));
    const bh = Math.floor(c.h * (0.01 + rnd() * 0.05));
    const bx = Math.floor(c.x0 + rnd() * (c.w - bw));
    const by = Math.floor(c.y0 + rnd() * (c.h - bh));
    const tint = [rnd() * 255, rnd() * 255, rnd() * 255];
    for (let y = by; y < by + bh; y++)
      for (let x = bx; x < bx + bw; x++) {
        const k = (y * W + x) * 4;
        if (data[k + 3] < 10) continue;
        const g = rnd();
        data[k] = (data[k] + tint[0] * g) / 2;
        data[k + 1] = (data[k + 1] + tint[1] * g) / 2;
        data[k + 2] = (data[k + 2] + tint[2] * g) / 2;
      }
  }
  const scan = num(c.p.scan) / 100;
  if (scan > 0) {
    const step = Math.max(2, Math.round(c.k * 3));
    for (let y = 0; y < H; y++) {
      if (Math.floor(y / step) % 2) continue;
      for (let x = 0; x < W; x++) {
        const k = (y * W + x) * 4;
        data[k] *= 1 - scan * 0.5;
        data[k + 1] *= 1 - scan * 0.5;
        data[k + 2] *= 1 - scan * 0.5;
      }
    }
  }
};

const pixelate: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const s = Math.max(2, Math.round(num(c.p.size, 16) * c.k));
  const gap = Math.round(num(c.p.gap) * c.k);
  const circle = c.p.shape === "circle";
  const src = data.slice();
  // Blocks lined up with the element's corner.
  const ox = c.x0 % s;
  const oy = c.y0 % s;
  for (let by = -oy; by < H; by += s)
    for (let bx = -ox; bx < W; bx += s) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        n = 0;
      for (let y = Math.max(0, by); y < Math.min(H, by + s); y++)
        for (let x = Math.max(0, bx); x < Math.min(W, bx + s); x++) {
          const k = (y * W + x) * 4;
          const al = src[k + 3];
          r += src[k] * al;
          g += src[k + 1] * al;
          b += src[k + 2] * al;
          a += al;
          n++;
        }
      const avgA = n ? a / n : 0;
      for (let y = Math.max(0, by); y < Math.min(H, by + s); y++)
        for (let x = Math.max(0, bx); x < Math.min(W, bx + s); x++) {
          const k = (y * W + x) * 4;
          const lx = x - bx;
          const ly = y - by;
          let on = lx >= gap / 2 && ly >= gap / 2 && lx < s - gap / 2 && ly < s - gap / 2;
          if (circle) on = Math.hypot(lx + 0.5 - s / 2, ly + 0.5 - s / 2) <= s / 2 - gap / 2 - 0.5;
          if (!on || a === 0) {
            data[k + 3] = 0;
            continue;
          }
          data[k] = r / a;
          data[k + 1] = g / a;
          data[k + 2] = b / a;
          data[k + 3] = avgA;
        }
    }
};

const rgbSplit: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const pm = premul(data);
  const o = new Float32Array(4);
  const amt = num(c.p.amount, 8) * c.k;
  const ang = rad(num(c.p.angle));
  const radial = c.p.mode === "radial";
  const cx = c.x0 + c.w / 2;
  const cy = c.y0 + c.h / 2;
  const half = Math.hypot(c.w, c.h) / 2;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let dx = Math.cos(ang) * amt;
      let dy = Math.sin(ang) * amt;
      if (radial) {
        const vx = x - cx;
        const vy = y - cy;
        const r = Math.hypot(vx, vy) || 1;
        const k = (r / half) ** 2 * amt;
        dx = (vx / r) * k;
        dy = (vy / r) * k;
      }
      sample(pm, W, H, x + 0.5 - dx, y + 0.5 - dy, o);
      const ra = o[3];
      const rr = ra > 0 ? o[0] / ra : 0;
      sample(pm, W, H, x + 0.5, y + 0.5, o);
      const ga = o[3];
      const gg = ga > 0 ? o[1] / ga : 0;
      sample(pm, W, H, x + 0.5 + dx, y + 0.5 + dy, o);
      const ba = o[3];
      const bb = ba > 0 ? o[2] / ba : 0;
      const n = (y * W + x) * 4;
      const a = Math.max(ra, ga, ba);
      data[n] = rr * (ra / Math.max(1, a)) * 255;
      data[n + 1] = gg * (ga / Math.max(1, a)) * 255;
      data[n + 2] = bb * (ba / Math.max(1, a)) * 255;
      data[n + 3] = a;
    }
};

const halftone: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const src = data.slice();
  const s = Math.max(2, num(c.p.size, 8) * c.k);
  const a = rad(num(c.p.angle, 45));
  const co = Math.cos(a);
  const si = Math.sin(a);
  const ink = hex(c.p.ink);
  const keep = !!c.p.keep;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      // Into the turned screen, find the cell centre, back out to sample it.
      const u = x * co + y * si;
      const v = -x * si + y * co;
      const cu = (Math.floor(u / s) + 0.5) * s;
      const cv = (Math.floor(v / s) + 0.5) * s;
      const sx = Math.round(cu * co - cv * si);
      const sy = Math.round(cu * si + cv * co);
      const n = (y * W + x) * 4;
      if (sx < 0 || sy < 0 || sx >= W || sy >= H) {
        data[n + 3] = 0;
        continue;
      }
      const k = (sy * W + sx) * 4;
      const al = src[k + 3] / 255;
      const lum = (0.299 * src[k] + 0.587 * src[k + 1] + 0.114 * src[k + 2]) / 255;
      const rDot = (s / 2) * Math.sqrt(1 - lum) * 1.25 * al;
      const d = Math.hypot(u - cu, v - cv);
      const cov = clamp(rDot - d + 0.5, 0, 1);
      if (keep) {
        data[n] = src[k];
        data[n + 1] = src[k + 1];
        data[n + 2] = src[k + 2];
      } else {
        data[n] = ink[0];
        data[n + 1] = ink[1];
        data[n + 2] = ink[2];
      }
      data[n + 3] = 255 * cov;
    }
};

const duotone: Fx = (img, c) => {
  const d = img.data;
  const lo = hex(c.p.dark);
  const hi = hex(c.p.light);
  const ct = 1 + num(c.p.contrast) / 50;
  const mix = num(c.p.mix, 100) / 100;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    let l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    l = clamp((l - 0.5) * ct + 0.5, 0, 1);
    for (let k = 0; k < 3; k++) d[i + k] = d[i + k] * (1 - mix) + (lo[k] + (hi[k] - lo[k]) * l) * mix;
  }
};

const longShadow: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const ang = rad(num(c.p.dir, 45));
  const L = num(c.p.length, 120) * c.k;
  const fade = num(c.p.fade, 60) / 100;
  const col = hex(c.p.color);
  const alpha = num(c.p.alpha, 35) / 100;
  const stripes = c.p.kind === "stripes";
  // Distance along the ray back to the shape, by doubling steps.
  const INF = 1e9;
  const dist = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) dist[i] = data[i * 4 + 3] > 100 ? 0 : INF;
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  for (let step = 1; step <= L; step *= 2) {
    const sx = Math.round(dx * step);
    const sy = Math.round(dy * step);
    const prev = dist.slice();
    for (let y = 0; y < H; y++) {
      const yy = y - sy;
      if (yy < 0 || yy >= H) continue;
      for (let x = 0; x < W; x++) {
        const xx = x - sx;
        if (xx < 0 || xx >= W) continue;
        const v = prev[yy * W + xx] + step;
        const i = y * W + x;
        if (v < dist[i]) dist[i] = v;
      }
    }
  }
  for (let i = 0; i < W * H; i++) {
    const n = i * 4;
    const dd = dist[i];
    if (dd > L || dd === 0) {
      data[n + 3] = 0;
      continue;
    }
    if (stripes && Math.floor(dd / Math.max(2, 4 * c.k)) % 2) {
      data[n + 3] = 0;
      continue;
    }
    data[n] = col[0];
    data[n + 1] = col[1];
    data[n + 2] = col[2];
    data[n + 3] = 255 * alpha * (1 - fade * (dd / L));
  }
  over(data, top);
};

const offsetShadow: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const ang = rad(num(c.p.dir, 45));
  const off = num(c.p.offset, 12) * c.k;
  const layers = Math.round(num(c.p.layers, 1));
  const cols = [hex(c.p.color), hex(c.p.color2)];
  const outline = c.p.kind === "outline";
  data.fill(0);
  for (let i = layers; i >= 1; i--) {
    const sx = Math.round(Math.cos(ang) * off * i);
    const sy = Math.round(Math.sin(ang) * off * i);
    const col = cols[(i - 1) % 2];
    const layer = new Uint8ClampedArray(data.length);
    for (let y = 0; y < H; y++) {
      const yy = y - sy;
      if (yy < 0 || yy >= H) continue;
      for (let x = 0; x < W; x++) {
        const xx = x - sx;
        if (xx < 0 || xx >= W) continue;
        let a = top[(yy * W + xx) * 4 + 3];
        if (outline && a > 0) {
          // Keep only the rim of the copy.
          const t = Math.max(1, Math.round(2 * c.k));
          const inner = Math.min(
            top[(yy * W + Math.min(W - 1, xx + t)) * 4 + 3],
            top[(yy * W + Math.max(0, xx - t)) * 4 + 3],
            top[(Math.min(H - 1, yy + t) * W + xx) * 4 + 3],
            top[(Math.max(0, yy - t) * W + xx) * 4 + 3],
          );
          a = a - inner;
        }
        const n = (y * W + x) * 4;
        layer[n] = col[0];
        layer[n + 1] = col[1];
        layer[n + 2] = col[2];
        layer[n + 3] = a;
      }
    }
    over(data, layer);
  }
  over(data, top);
};

const outlineFx: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const w1 = num(c.p.width, 14) * c.k;
  const w2 = num(c.p.width2) * c.k;
  const c1 = hex(c.p.color);
  const c2 = hex(c.p.color2);
  const dist = distanceOut(data, W, H, 100);
  const edge = new Uint8ClampedArray(data.length);
  for (let i = 0; i < W * H; i++) {
    const d = dist[i];
    const n = i * 4;
    if (d <= w1 + 0.5) {
      edge[n] = c1[0];
      edge[n + 1] = c1[1];
      edge[n + 2] = c1[2];
      edge[n + 3] = 255 * clamp(w1 + 0.5 - d, 0, 1);
    } else if (w2 > 0 && d <= w1 + w2 + 0.5) {
      edge[n] = c2[0];
      edge[n + 1] = c2[1];
      edge[n + 2] = c2[2];
      edge[n + 3] = 255 * clamp(w1 + w2 + 0.5 - d, 0, 1);
    }
  }
  data.fill(0);
  const sh = num(c.p.shadow, 40) / 100;
  if (sh > 0) {
    const a = new Float32Array(W * H);
    const dy = Math.round(6 * c.k);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const yy = y - dy;
        if (yy >= 0) a[y * W + x] = Math.max(edge[(yy * W + x) * 4 + 3], top[(yy * W + x) * 4 + 3]) / 255;
      }
    blurAlpha(a, W, H, 6 * c.k);
    for (let i = 0; i < W * H; i++) data[i * 4 + 3] = a[i] * 255 * sh * 0.6;
  }
  over(data, edge);
  over(data, top);
  const gloss = num(c.p.gloss) / 100;
  if (gloss > 0)
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const n = (y * W + x) * 4;
        if (data[n + 3] < 10) continue;
        const band = Math.exp(-((((x - c.x0) / c.w - (y - c.y0) / c.h) * 3 + 0.4) ** 2) * 6);
        const k = gloss * 0.45 * band;
        for (let i = 0; i < 3; i++) data[n + i] += (255 - data[n + i]) * k;
      }
};

/**
 * Reflection, as on a mirror or on water (owner, 2026-10-19: ripples "like a water
 * surface"). Ripples move the picture sideways, more the farther from the edge; "Natural
 * water" breaks them up (several waves, uneven along the surface); light streaks and a
 * soft smear finish the water look.
 */
const reflection: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const pm = premul(top);
  const o = new Float32Array(4);
  const acc = new Float32Array(4);
  const deg = Math.round(num(c.p.dir, 90));
  const len = num(c.p.length, 50) / 100;
  const a0 = num(c.p.alpha, 40) / 100;
  const gap = num(c.p.gap) * c.k;
  const rip = (num(c.p.ripple) / 100) * 0.06 * Math.max(c.w, c.h);
  const nat = num(c.p.natural, 50) / 100;
  const size = Math.max(1, (num(c.p.waveSize, 40) / 100) * 0.06 * Math.max(c.w, c.h));
  const streaks = num(c.p.streaks) / 100;
  const smear = (num(c.p.blur) / 100) * 0.02 * Math.max(c.w, c.h);
  const rnd = rng(c.seed * 1013 + 7);
  const waves = Array.from({ length: 4 }, (_, i) => ({ f: (1 + i * 0.73 + rnd() * 0.5) / size, ph: rnd() * 6.28, a: i === 0 ? 1 : nat * (0.7 - i * 0.12), across: nat * (0.004 + rnd() * 0.01) }));
  const vertical = deg === 90 || deg === 270;
  const span = (vertical ? c.h : c.w) * len;
  // Position across the surface for the "across" part of the waves.
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let t: number;
      let across: number;
      let sx = x + 0.5;
      let sy = y + 0.5;
      if (deg === 90) {
        t = y + 0.5 - (c.y0 + c.h) - gap;
        sy = c.y0 + c.h - t;
        across = x;
      } else if (deg === 270) {
        t = c.y0 - gap - (y + 0.5);
        sy = c.y0 + t;
        across = x;
      } else if (deg === 0) {
        t = x + 0.5 - (c.x0 + c.w) - gap;
        sx = c.x0 + c.w - t;
        across = y;
      } else {
        t = c.x0 - gap - (x + 0.5);
        sx = c.x0 + t;
        across = y;
      }
      if (t < 0 || t > span) continue;
      // Waves: stronger farther out; natural water mixes several and lets them vary along the surface.
      let wv = 0;
      for (const w of waves) wv += w.a * Math.sin(t * w.f + w.ph + across * w.across + Math.sin(across * w.across * 0.7 + w.ph) * nat * 2);
      const disp = rip * (0.25 + 0.75 * (t / span)) * wv;
      if (vertical) sx += disp;
      else sy += disp;
      // Soft smear along the surface.
      acc[0] = acc[1] = acc[2] = acc[3] = 0;
      const taps = smear > 0.5 ? 5 : 1;
      for (let i = 0; i < taps; i++) {
        const off = taps === 1 ? 0 : (i / (taps - 1) - 0.5) * smear * 2 * (0.4 + t / span);
        sample(pm, W, H, vertical ? sx + off : sx, vertical ? sy : sy + off, o);
        acc[0] += o[0];
        acc[1] += o[1];
        acc[2] += o[2];
        acc[3] += o[3];
      }
      const k = (a0 * (1 - t / span)) / taps;
      // Light streaks across the water.
      const glint = streaks > 0 ? 1 + streaks * 0.5 * Math.max(0, Math.sin(t * waves[0].f * 1.7 + waves[1].ph)) * (0.5 + 0.5 * Math.sin(across * 0.05 + t * 0.02)) : 1;
      acc[0] = Math.min(acc[3], acc[0] * glint) * k;
      acc[1] = Math.min(acc[3], acc[1] * glint) * k;
      acc[2] = Math.min(acc[3], acc[2] * glint) * k;
      acc[3] *= k;
      put(data, (y * W + x) * 4, acc);
    }
  over(data, top);
};

const echo: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const pm = premul(top);
  const o = new Float32Array(4);
  const n = Math.round(num(c.p.count, 5));
  const ang = rad(num(c.p.dir, 135));
  const sp = num(c.p.spacing, 16) * c.k;
  const fade = num(c.p.fade, 60) / 100;
  const grow = num(c.p.grow) / 100;
  const tint = c.p.tint;
  const one = hex(c.p.color);
  const cx = c.x0 + c.w / 2;
  const cy = c.y0 + c.h / 2;
  data.fill(0);
  for (let i = n; i >= 1; i--) {
    const ox = Math.cos(ang) * sp * i;
    const oy = Math.sin(ang) * sp * i;
    const sc = 1 + (grow * i) / n;
    const k = 1 - fade * (i / (n + 1));
    const rb = tint === "rainbow" ? hsl((i / n) * 300, 0.85, 0.6) : one;
    const layer = new Uint8ClampedArray(data.length);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const sx = (x + 0.5 - ox - cx) / sc + cx;
        const sy = (y + 0.5 - oy - cy) / sc + cy;
        sample(pm, W, H, sx, sy, o);
        if (o[3] < 1) continue;
        const m = (y * W + x) * 4;
        put(layer, m, o);
        if (tint !== "keep") {
          layer[m] = rb[0];
          layer[m + 1] = rb[1];
          layer[m + 2] = rb[2];
        }
        layer[m + 3] *= k;
      }
    over(data, layer);
  }
  over(data, top);
};

function hsl(h: number, s: number, l: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}

const GLITTER: Record<string, [number, number, number][]> = {
  gold: [
    [255, 214, 102],
    [214, 160, 40],
    [255, 241, 180],
  ],
  silver: [
    [230, 232, 238],
    [170, 176, 190],
    [255, 255, 255],
  ],
  pink: [
    [255, 140, 190],
    [230, 80, 150],
    [255, 210, 230],
  ],
};

const glitter: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const rnd = rng(c.seed * 31337 + 11);
  const g = Math.max(1, Math.round(num(c.p.grain, 2) * c.k));
  const sparkle = num(c.p.sparkle, 40) / 100;
  const tone = String(c.p.tone ?? "gold");
  const cols = GLITTER[tone];
  const cw = Math.ceil(W / g);
  const ch = Math.ceil(H / g);
  const cells = new Float32Array(cw * ch);
  for (let i = 0; i < cells.length; i++) cells[i] = rnd();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      if (data[n + 3] < 8) continue;
      const v = cells[Math.floor(y / g) * cw + Math.floor(x / g)];
      const bright = 0.55 + v * 0.6 + (v > 1 - sparkle * 0.25 ? 0.6 : 0);
      let base: [number, number, number];
      if (tone === "rainbow") base = hsl(v * 360, 0.8, 0.62);
      else if (tone === "own") base = [data[n], data[n + 1], data[n + 2]];
      else base = cols[Math.floor(v * 2.99)];
      for (let k = 0; k < 3; k++) data[n + k] = clamp(base[k] * bright, 0, 255);
    }
  // ✦ stars on the shape.
  const stars = Math.round(num(c.p.stars, 5));
  for (let i = 0; i < stars; i++) {
    let sx = 0,
      sy = 0,
      ok = false;
    for (let t = 0; t < 30 && !ok; t++) {
      sx = Math.floor(c.x0 + rnd() * c.w);
      sy = Math.floor(c.y0 + rnd() * c.h);
      ok = sx >= 0 && sy >= 0 && sx < W && sy < H && data[(sy * W + sx) * 4 + 3] > 100;
    }
    if (!ok) continue;
    const R = (4 + rnd() * 10) * c.k;
    for (let y = Math.floor(sy - R); y <= sy + R; y++)
      for (let x = Math.floor(sx - R); x <= sx + R; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const dx = Math.abs(x - sx);
        const dy = Math.abs(y - sy);
        const v = Math.max(0, 1 - (Math.sqrt(dx * dy) / (R * 0.12) + Math.hypot(dx, dy) / R));
        if (v <= 0) continue;
        const n = (y * W + x) * 4;
        for (let k = 0; k < 3; k++) data[n + k] += (255 - data[n + k]) * v;
        data[n + 3] = Math.max(data[n + 3], 255 * v);
      }
  }
};

// ---------------------------------------------------------------- round 2 (editor-v2/14 §8)

/** Blurs all four channels (premultiplied), box passes ≈ gaussian. */
function blurRGBA(pm: Float32Array, W: number, H: number, r: number, passes = 2) {
  const ch = new Float32Array(W * H);
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i < W * H; i++) ch[i] = pm[i * 4 + k];
    blurAlpha(ch, W, H, r, passes);
    for (let i = 0; i < W * H; i++) pm[i * 4 + k] = ch[i];
  }
}

function fromPremul(pm: Float32Array, d: Uint8ClampedArray) {
  for (let i = 0; i < d.length; i += 4) {
    const a = pm[i + 3];
    if (a <= 0.01) {
      d[i + 3] = 0;
      continue;
    }
    d[i] = (pm[i] * 255) / a;
    d[i + 1] = (pm[i + 1] * 255) / a;
    d[i + 2] = (pm[i + 2] * 255) / a;
    d[i + 3] = a;
  }
}

const centreOf = (c: FxCtx) => [c.x0 + (num(c.p.cx, 50) / 100) * c.w, c.y0 + (num(c.p.cy, 50) / 100) * c.h];

const flag: Fx = (img, c) => {
  const n = num(c.p.folds, 3);
  // Wave height follows the length of the cloth (a long banner waves more).
  const A = (num(c.p.wind, 50) / 100) * 0.08 * (c.p.edge === "top" ? c.h : c.w) / Math.max(1, n / 2);
  const shade = num(c.p.shade, 50) / 100;
  const edge = c.p.edge ?? "left";
  const wave = (q: number) => Math.sin(2 * Math.PI * n * q - 0.6);
  warp(
    img,
    (x, y, o) => {
      if (edge === "top") {
        const q = clamp((y - c.y0) / c.h, 0, 1);
        o[0] = x - A * q * wave(q);
        o[1] = y;
      } else {
        const q = clamp(edge === "left" ? (x - c.x0) / c.w : (c.x0 + c.w - x) / c.w, 0, 1);
        o[0] = x;
        o[1] = y - A * q * wave(q);
      }
      return true;
    },
    shade > 0
      ? (x, y, n4, d) => {
          if (d[n4 + 3] < 5) return;
          const q = clamp(edge === "top" ? (y - c.y0) / c.h : edge === "left" ? (x - c.x0) / c.w : (c.x0 + c.w - x) / c.w, 0, 1);
          // Slope of the cloth: light on one side of each fold, shadow on the other.
          const slope = Math.cos(2 * Math.PI * n * q - 0.6) * q;
          const k = shade * 0.35 * slope;
          for (let i = 0; i < 3; i++) d[n4 + i] = k > 0 ? d[n4 + i] + (255 - d[n4 + i]) * k : d[n4 + i] * (1 + k);
        }
      : undefined,
  );
};

const ripple: Fx = (img, c) => {
  const [cx, cy] = centreOf(c);
  const size = Math.max(c.w, c.h);
  const amp = (num(c.p.amp, 30) / 100) * 0.03 * size;
  const lam = (num(c.p.spacing, 8) / 100) * size;
  const decay = (num(c.p.decay, 50) / 100) * 4;
  const ph = rad(num(c.p.phase));
  const light = num(c.p.light, 20) / 100;
  const at = (r: number) => Math.sin((2 * Math.PI * r) / lam - ph) * Math.exp((-r / size) * decay);
  warp(
    img,
    (x, y, o) => {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy) || 1;
      const d = amp * at(r);
      o[0] = x + (dx / r) * d;
      o[1] = y + (dy / r) * d;
      return true;
    },
    light > 0
      ? (x, y, n4, d) => {
          if (d[n4 + 3] < 5) return;
          const r = Math.hypot(x - cx, y - cy);
          const k = light * 0.35 * Math.max(0, Math.cos((2 * Math.PI * r) / lam - ph)) * Math.exp((-r / size) * decay);
          for (let i = 0; i < 3; i++) d[n4 + i] += (255 - d[n4 + i]) * k;
        }
      : undefined,
  );
};

/** 3 × 3 matrix taking the four points `from` to `to` (projective). */
function homography(from: number[][], to: number[][]) {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = from[i];
    const [u, v] = to[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  // Gaussian elimination on the 8 × 9 system.
  for (let col = 0; col < 8; col++) {
    let piv = col;
    for (let r = col + 1; r < 8; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    [A[col], A[piv]] = [A[piv], A[col]];
    const p = A[col][col] || 1e-9;
    for (let k = col; k < 9; k++) A[col][k] /= p;
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const f = A[r][col];
      for (let k = col; k < 9; k++) A[r][k] -= f * A[col][k];
    }
  }
  return [A[0][8], A[1][8], A[2][8], A[3][8], A[4][8], A[5][8], A[6][8], A[7][8], 1];
}

/** Where the element's corners land when tilted (element units, origin at its centre). */
function tiltQuad(w: number, h: number, tx: number, ty: number, depth: number) {
  const ax = rad(tx);
  const ay = rad(ty);
  const d = Math.max(w, h) * (3.2 - depth * 0.025);
  return [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([x, y]) => {
    // Turn about x (tilt back), then about y.
    const y1 = y * Math.cos(ax);
    const z1 = y * Math.sin(ax);
    const x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
    const z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
    const k = d / (d + z2);
    return [x2 * k, y1 * k];
  });
}

const perspective: Fx = (img, c) => {
  const q = tiltQuad(c.w, c.h, num(c.p.tiltX, 25), num(c.p.tiltY), num(c.p.depth, 50));
  const cx = c.x0 + c.w / 2;
  const cy = c.y0 + c.h / 2;
  const dst = q.map(([x, y]) => [cx + x, cy + y]);
  const src = [
    [c.x0, c.y0],
    [c.x0 + c.w, c.y0],
    [c.x0 + c.w, c.y0 + c.h],
    [c.x0, c.y0 + c.h],
  ];
  const m = homography(dst, src);
  warp(img, (x, y, o) => {
    const z = m[6] * x + m[7] * y + 1;
    o[0] = (m[0] * x + m[1] * y + m[2]) / z;
    o[1] = (m[3] * x + m[4] * y + m[5]) / z;
    return o[0] >= c.x0 - 1 && o[0] <= c.x0 + c.w + 1 && o[1] >= c.y0 - 1 && o[1] <= c.y0 + c.h + 1;
  });
};

const fisheye: Fx = (img, c) => {
  const [cx, cy] = centreOf(c);
  const R = Math.hypot(c.w, c.h) / 2;
  const a = num(c.p.amount, 60) / 100;
  const round = !!c.p.round;
  const rc = Math.min(c.w, c.h) / 2;
  warp(img, (x, y, o) => {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.hypot(dx, dy);
    if (round && r > rc) return false;
    const rn = r / R;
    const k = r > 0 ? (R * Math.pow(rn, 1 + a * 1.4)) / r : 1;
    o[0] = cx + dx * k;
    o[1] = cy + dy * k;
    return true;
  });
};

const mirror: Fx = (img, c) => {
  const mode = String(c.p.mode ?? "lr");
  const ax = c.x0 + (num(c.p.axis, 50) / 100) * c.w;
  const ay = c.y0 + (num(c.p.axis, 50) / 100) * c.h;
  warp(img, (x, y, o) => {
    o[0] = x;
    o[1] = y;
    if ((mode === "lr" || mode === "quad") && x > ax) o[0] = 2 * ax - x;
    if (mode === "rl" && x < ax) o[0] = 2 * ax - x;
    if ((mode === "tb" || mode === "quad") && y > ay) o[1] = 2 * ay - y;
    if (mode === "bt" && y < ay) o[1] = 2 * ay - y;
    return true;
  });
};

const kaleidoscope: Fx = (img, c) => {
  const [cx, cy] = centreOf(c);
  const n = Math.round(num(c.p.segments, 6));
  const seg = (2 * Math.PI) / n;
  const turn = rad(num(c.p.angle));
  const zoom = num(c.p.zoom, 100) / 100;
  const R = Math.min(c.w, c.h) / 2;
  warp(img, (x, y, o) => {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.hypot(dx, dy) / zoom;
    let a = (((Math.atan2(dy, dx) - turn) % seg) + seg) % seg;
    if (a > seg / 2) a = seg - a;
    // Keep the slice inside the picture.
    const rr = r % (R * 2);
    o[0] = cx + Math.cos(a + turn) * rr;
    o[1] = cy + Math.sin(a + turn) * rr;
    return true;
  });
};

const stretch: Fx = (img, c) => {
  const f = frame(c, num(c.p.dir, 0));
  const cut = num(c.p.cut, 60) / 100;
  const wob = (num(c.p.wobble) / 100) * 0.02 * f.S;
  warp(img, (x, y, o) => {
    const t = x * f.D[0] + y * f.D[1];
    let s = x * f.N[0] + y * f.N[1];
    let tn = (t - f.tMin) / f.L;
    if (tn > cut) {
      s += wob * Math.sin((tn - cut) * 30) * (tn - cut) * 3;
      tn = cut;
    }
    const tt = f.tMin + tn * f.L;
    o[0] = s * f.N[0] + tt * f.D[0];
    o[1] = s * f.N[1] + tt * f.D[1];
    return true;
  });
};

const tear: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const pm = premul(data.slice());
  const o = new Float32Array(4);
  const vert = c.p.way !== "h";
  const rnd = rng(c.seed * 4241 + 9);
  const at = num(c.p.at, 50) / 100;
  const gap = (num(c.p.gap, 25) / 100) * 0.12 * (vert ? c.w : c.h);
  const shift = (num(c.p.shift, 20) / 100) * 0.08 * (vert ? c.h : c.w);
  const edgeW = (num(c.p.edge, 60) / 100) * 0.018 * Math.max(c.w, c.h);
  const jag = (num(c.p.jag, 50) / 100) * 0.04 * (vert ? c.w : c.h);
  // A ragged line: a few slow bends plus fine teeth.
  const bends = Array.from({ length: 4 }, () => ({ f: 1 + rnd() * 4, p: rnd() * 6.28, a: rnd() }));
  const teeth = Array.from({ length: 3 }, () => ({ f: 20 + rnd() * 50, p: rnd() * 6.28, a: rnd() }));
  const cutAt = (q: number) => {
    let v = 0;
    for (const b of bends) v += b.a * Math.sin(q * b.f * 6.28 + b.p) * 0.6;
    for (const t of teeth) v += t.a * Math.sin(q * t.f * 6.28 + t.p) * 0.25;
    return v * jag;
  };
  const line = vert ? c.x0 + at * c.w : c.y0 + at * c.h;
  const fiber = (q: number, d: number) => 0.5 + 0.5 * Math.sin(q * 400 + d * 0.7);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n4 = (y * W + x) * 4;
      data[n4 + 3] = 0;
      for (const side of [-1, 1]) {
        // Undo this piece's move: half the gap apart, half the shift along the tear.
        const sx = vert ? x + 0.5 - (side * gap) / 2 : x + 0.5 + (side * shift) / 2;
        const sy = vert ? y + 0.5 + (side * shift) / 2 : y + 0.5 - (side * gap) / 2;
        const q = vert ? (sy - c.y0) / c.h : (sx - c.x0) / c.w;
        const cut = line + cutAt(q);
        const across = vert ? sx - cut : sy - cut;
        if (side * across < 0) continue;
        sample(pm, W, H, sx, sy, o);
        if (o[3] < 1) continue;
        put(data, n4, o);
        // Paper fibres along the torn edge.
        const dEdge = Math.abs(across);
        if (dEdge < edgeW * (0.6 + 0.6 * fiber(q, dEdge))) {
          const k = clamp(1 - dEdge / (edgeW * 1.2), 0, 1);
          for (let i = 0; i < 3; i++) data[n4 + i] += (250 - data[n4 + i]) * (0.55 + 0.45 * k);
        }
        break;
      }
    }
};

const fold: Fx = (img, c) => {
  const d = img.data;
  const W = img.width;
  const cols = Math.round(num(c.p.cols, 2));
  const rows = Math.round(num(c.p.rows, 1));
  const depth = num(c.p.depth, 40) / 100;
  const light = rad(num(c.p.dir, 225));
  const lx = Math.cos(light);
  const ly = Math.sin(light);
  const wr = num(c.p.wrinkles) / 100;
  const rnd = rng(c.seed * 1931 + 3);
  const wrinkles = Array.from({ length: 6 }, () => ({ a: rnd() * Math.PI, f: 8 + rnd() * 20, p: rnd() * 6.28 }));
  for (let y = 0; y < img.height; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      if (d[n + 3] < 5) continue;
      const u = (x - c.x0) / c.w;
      const v = (y - c.y0) / c.h;
      // Each panel leans one way or the other: a slope in x (columns) and in y (rows).
      const pu = (u * (cols + 1)) % 1;
      const pv = (v * (rows + 1)) % 1;
      const iu = Math.floor(u * (cols + 1));
      const iv = Math.floor(v * (rows + 1));
      const sx = cols ? (iu % 2 ? -1 : 1) : 0;
      const sy = rows ? (iv % 2 ? -1 : 1) : 0;
      let k = depth * 0.22 * (sx * lx + sy * ly);
      // Sharp crease lines.
      const creaseU = cols ? Math.min(pu, 1 - pu) * (cols + 1) * c.w : 1e9;
      const creaseV = rows ? Math.min(pv, 1 - pv) * (rows + 1) * c.h : 1e9;
      const cr = Math.min(creaseU, creaseV);
      if (cr < 3 * c.k) k -= depth * 0.25 * (1 - cr / (3 * c.k));
      if (wr > 0) for (const w of wrinkles) k += wr * 0.05 * Math.sin((u * Math.cos(w.a) + v * Math.sin(w.a)) * w.f + w.p);
      for (let i = 0; i < 3; i++) d[n + i] = k > 0 ? d[n + i] + (255 - d[n + i]) * k : d[n + i] * (1 + k);
    }
};

const crt: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const vhs = c.p.mode !== "crt";
  const rnd = rng(c.seed * 7717 + 1);
  const curve = (num(c.p.curve, 20) / 100) * 0.12;
  const bleed = (num(c.p.bleed, 40) / 100) * 0.012 * c.w;
  const noise = num(c.p.noise, 30) / 100;
  const scan = num(c.p.scan, 40) / 100;
  const band = num(c.p.band, 20) / 100;
  const bandY = c.y0 + rnd() * c.h;
  const bandH = c.h * 0.06;
  const pm = premul(data.slice());
  const o = new Float32Array(4);
  const cx = c.x0 + c.w / 2;
  const cy = c.y0 + c.h / 2;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let sx = x + 0.5;
      let sy = y + 0.5;
      if (curve > 0) {
        const nx = (sx - cx) / (c.w / 2);
        const ny = (sy - cy) / (c.h / 2);
        const r2 = nx * nx + ny * ny;
        sx = cx + nx * (1 + curve * r2) * (c.w / 2);
        sy = cy + ny * (1 + curve * r2) * (c.h / 2);
      }
      const inBand = band > 0 && Math.abs(sy - bandY) < bandH;
      if (inBand) sx += (rnd() - 0.3) * band * 0.04 * c.w;
      // Colour bleeds sideways: red to one side, blue to the other.
      sample(pm, W, H, sx - bleed, sy, o);
      const ra = o[3];
      const r = ra ? (o[0] / ra) * 255 : 0;
      sample(pm, W, H, sx, sy, o);
      const ga = o[3];
      const g = ga ? (o[1] / ga) * 255 : 0;
      const b0 = ga ? (o[2] / ga) * 255 : 0;
      sample(pm, W, H, sx + bleed, sy, o);
      const ba = o[3];
      const b = ba ? (o[2] / ba) * 255 : b0;
      const n4 = (y * W + x) * 4;
      let a = Math.max(ra, ga, ba);
      if (curve > 0 && (sx < c.x0 || sx > c.x0 + c.w || sy < c.y0 || sy > c.y0 + c.h)) a = 0;
      let rr = r;
      let gg = g;
      let bb = b;
      if (vhs) {
        // Tape: a little washed out and warm.
        const l = 0.3 * rr + 0.59 * gg + 0.11 * bb;
        rr = l + (rr - l) * 0.8 + 8;
        gg = l + (gg - l) * 0.8;
        bb = l + (bb - l) * 0.8 - 6;
      }
      const lineDark = scan > 0 && Math.floor(y / Math.max(2, Math.round(c.k * 2))) % 2 ? 1 - scan * 0.4 : 1;
      const nz = noise > 0 ? (rnd() - 0.5) * noise * 70 : 0;
      const bz = inBand ? (rnd() - 0.5) * 120 * band : 0;
      data[n4] = (rr + nz + bz) * lineDark;
      data[n4 + 1] = (gg + nz + bz) * lineDark;
      data[n4 + 2] = (bb + nz + bz) * lineDark;
      data[n4 + 3] = a;
    }
  const osd = c.p.osd;
  if (osd === "play" || osd === "rec") {
    // Text on the screen, drawn with a canvas and laid on.
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const g2 = cv.getContext("2d");
    if (!g2) return;
    g2.putImageData(img, 0, 0);
    const size = Math.max(10, c.h * 0.07);
    g2.font = `700 ${size}px ui-monospace, Menlo, monospace`;
    g2.textBaseline = "top";
    g2.shadowColor = "rgba(0,0,0,0.6)";
    g2.shadowBlur = size * 0.2;
    if (osd === "play") {
      g2.fillStyle = "#ffffff";
      g2.fillText("PLAY ▶", c.x0 + c.w * 0.05, c.y0 + c.h * 0.05);
    } else {
      g2.fillStyle = "#ff3b30";
      g2.beginPath();
      g2.arc(c.x0 + c.w * 0.05 + size * 0.4, c.y0 + c.h * 0.05 + size * 0.5, size * 0.35, 0, Math.PI * 2);
      g2.fill();
      g2.fillStyle = "#ffffff";
      g2.fillText("REC", c.x0 + c.w * 0.05 + size, c.y0 + c.h * 0.05);
    }
    const now = new Date();
    g2.fillStyle = "#ffffff";
    g2.fillText(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}   ${now.toLocaleDateString("en-US", { month: "short" }).toUpperCase()} ${now.getDate()} ${now.getFullYear()}`, c.x0 + c.w * 0.05, c.y0 + c.h * 0.88);
    img.data.set(g2.getImageData(0, 0, W, H).data);
  }
};

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const dither: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const s = Math.max(1, Math.round(num(c.p.size, 2) * c.k));
  const ct = 1 + num(c.p.contrast) / 50;
  const pal: number[][] =
    c.p.palette === "gb"
      ? [
          [15, 56, 15],
          [48, 98, 48],
          [139, 172, 15],
          [155, 188, 15],
        ]
      : c.p.palette === "two"
        ? [hex(c.p.dark), hex(c.p.light)]
        : [
            [0, 0, 0],
            [255, 255, 255],
          ];
  const gw = Math.ceil(W / s);
  const gh = Math.ceil(H / s);
  const lum = new Float32Array(gw * gh);
  const al = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++)
    for (let gx = 0; gx < gw; gx++) {
      const n = (Math.min(H - 1, gy * s + (s >> 1)) * W + Math.min(W - 1, gx * s + (s >> 1))) * 4;
      lum[gy * gw + gx] = clamp(((0.299 * data[n] + 0.587 * data[n + 1] + 0.114 * data[n + 2]) / 255 - 0.5) * ct + 0.5, 0, 1);
      al[gy * gw + gx] = data[n + 3];
    }
  const levels = pal.length - 1;
  const out = new Uint8Array(gw * gh);
  if (c.p.kind === "bayer") {
    for (let i = 0; i < gw * gh; i++) {
      const gx = i % gw;
      const gy = Math.floor(i / gw);
      const th = (BAYER[(gy % 4) * 4 + (gx % 4)] + 0.5) / 16;
      out[i] = clamp(Math.floor(lum[i] * levels + th), 0, levels);
    }
  } else {
    for (let gy = 0; gy < gh; gy++)
      for (let gx = 0; gx < gw; gx++) {
        const i = gy * gw + gx;
        const q = clamp(Math.round(lum[i] * levels), 0, levels);
        out[i] = q;
        const err = lum[i] - q / levels;
        if (gx + 1 < gw) lum[i + 1] += (err * 7) / 16;
        if (gy + 1 < gh) {
          if (gx > 0) lum[i + gw - 1] += (err * 3) / 16;
          lum[i + gw] += (err * 5) / 16;
          if (gx + 1 < gw) lum[i + gw + 1] += err / 16;
        }
      }
  }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = Math.floor(y / s) * gw + Math.floor(x / s);
      const n = (y * W + x) * 4;
      const col = pal[out[i]];
      data[n] = col[0];
      data[n + 1] = col[1];
      data[n + 2] = col[2];
      data[n + 3] = al[i] > 127 ? 255 : 0;
    }
};

const RISO: Record<string, string[]> = {
  pinkBlue: ["#ff48b0", "#0078bf"],
  pinkYellow: ["#ff48b0", "#ffe800"],
  blueOrange: ["#0078bf", "#ff6c2f"],
  greenRed: ["#00a95c", "#ff4c65"],
  pink: ["#ff48b0"],
};

const riso: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const src = data.slice();
  const inks = (RISO[String(c.p.inks)] ?? RISO.pinkBlue).map(hex);
  const off = Math.round(num(c.p.offset, 4) * c.k);
  const grain = num(c.p.grain, 40) / 100;
  const screen = num(c.p.screen, 30) / 100;
  const rnd = rng(c.seed * 3011 + 17);
  const cell = Math.max(3, 4 * c.k);
  const amount = (x: number, y: number, ink: number) => {
    const xi = clamp(Math.round(x), 0, W - 1);
    const yi = clamp(Math.round(y), 0, H - 1);
    const n = (yi * W + xi) * 4;
    if (src[n + 3] < 10) return 0;
    const r = src[n] / 255;
    const g = src[n + 1] / 255;
    const b = src[n + 2] / 255;
    const l = 0.3 * r + 0.59 * g + 0.11 * b;
    // First ink: the darks; second: the warm / saturated parts.
    return inks.length === 1 || ink === 0 ? 1 - l : clamp((r - b) * 0.8 + (1 - l) * 0.45, 0, 1);
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      const a = src[n + 3];
      if (a < 10) {
        data[n + 3] = 0;
        continue;
      }
      let rr = 255;
      let gg = 255;
      let bb = 255;
      inks.forEach((ink, i) => {
        const dx = i === 0 ? 0 : off;
        const dy = i === 0 ? 0 : -off * 0.6;
        let cov = amount(x - dx, y - dy, i);
        if (screen > 0) {
          // Halftone dot of this ink.
          const u = ((x + i * cell * 0.5) % cell) / cell - 0.5;
          const v = ((y + i * cell * 0.3) % cell) / cell - 0.5;
          const dot = Math.hypot(u, v) < Math.sqrt(cov) * 0.55 ? 1 : 0;
          cov = cov * (1 - screen) + dot * screen;
        }
        if (grain > 0) cov *= 1 - grain * 0.6 * rnd();
        rr *= 1 - cov * (1 - ink[0] / 255);
        gg *= 1 - cov * (1 - ink[1] / 255);
        bb *= 1 - cov * (1 - ink[2] / 255);
      });
      data[n] = rr;
      data[n + 1] = gg;
      data[n + 2] = bb;
      data[n + 3] = a;
    }
};

const emboss: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const h = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const n = i * 4;
    const a = data[n + 3] / 255;
    const l = (0.299 * data[n] + 0.587 * data[n + 1] + 0.114 * data[n + 2]) / 255;
    h[i] = a * (0.7 + 0.3 * l);
  }
  blurAlpha(h, W, H, Math.max(1, (num(c.p.soft, 30) / 100) * 4 * c.k + 1), 2);
  const depth = (num(c.p.depth, 40) / 100) * 6 * (c.p.kind === "press" ? -1 : 1);
  const L = rad(num(c.p.dir, 225));
  const lx = Math.cos(L);
  const ly = Math.sin(L);
  const mat = c.p.material;
  const base: Record<string, number[]> = { paper: [244, 241, 234], gold: [212, 168, 70], silver: [192, 196, 204] };
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const n = i * 4;
      if (data[n + 3] < 3) continue;
      const gx = (h[i + 1] - h[i - 1]) * depth;
      const gy = (h[i + W] - h[i - W]) * depth;
      // Surface facing the light is brighter.
      const shade = clamp(0.5 - (gx * lx + gy * ly) * 2.2, 0, 1);
      const col = mat && mat !== "keep" ? base[String(mat)] : [data[n], data[n + 1], data[n + 2]];
      const metal = mat === "gold" || mat === "silver" ? 1.25 : 1;
      for (let k = 0; k < 3; k++) data[n + k] = clamp(col[k] * (0.55 + shade * 0.9 * metal), 0, 255);
    }
};

const glow: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const col = hex(c.p.color);
  const R = num(c.p.radius, 20) * c.k;
  const inten = num(c.p.intensity, 100) / 100;
  const core = num(c.p.core, 40) / 100;
  const tube = !!c.p.outline;
  const flick = num(c.p.flicker) / 100;
  const rnd = rng(c.seed * 9091 + 4);
  const A = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) A[i] = top[i * 4 + 3] / 255;
  // Broken tube: a few dark gaps along the shape.
  const gaps = flick > 0 ? Array.from({ length: Math.round(1 + flick * 4) }, () => ({ x: c.x0 + rnd() * c.w, wd: c.w * (0.02 + rnd() * 0.05) })) : [];
  const off = (x: number) => gaps.some((g) => Math.abs(x - g.x) < g.wd / 2);
  // The tube: only the rim of the shape.
  let shape = A;
  if (tube) {
    const t = Math.max(1, Math.round(2.5 * c.k));
    shape = new Float32Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (A[i] < 0.3) continue;
        const inner = Math.min(A[y * W + Math.min(W - 1, x + t)], A[y * W + Math.max(0, x - t)], A[Math.min(H - 1, y + t) * W + x], A[Math.max(0, y - t) * W + x]);
        shape[i] = Math.max(0, A[i] - inner);
      }
  }
  if (gaps.length) for (let i = 0; i < W * H; i++) if (off(i % W)) shape[i] *= 0.15;
  const near = Float32Array.from(shape);
  const far = Float32Array.from(shape);
  blurAlpha(near, W, H, R * 0.3, 2);
  blurAlpha(far, W, H, R, 3);
  for (let i = 0; i < W * H; i++) {
    const n = i * 4;
    const g = clamp((near[i] * 1.4 + far[i] * 1.1) * inten, 0, 1);
    data[n] = col[0];
    data[n + 1] = col[1];
    data[n + 2] = col[2];
    data[n + 3] = g * 255;
  }
  // The shape itself: lit, its centre close to white.
  const lit = new Uint8ClampedArray(data.length);
  for (let i = 0; i < W * H; i++) {
    const n = i * 4;
    const a = tube ? shape[i] : A[i] * (off(i % W) ? 0.35 : 1);
    if (a <= 0) continue;
    if (tube) {
      // The tube: the glow colour, white-hot in the middle.
      const mixC = 0.35 + core * 0.65;
      for (let k = 0; k < 3; k++) lit[n + k] = col[k] * (1 - mixC) + 255 * mixC;
    } else {
      // The element keeps its colours, a little lit up by the white core.
      const mixC = core * 0.3;
      for (let k = 0; k < 3; k++) lit[n + k] = top[n + k] * (1 - mixC) + 255 * mixC;
    }
    lit[n + 3] = a * 255;
  }
  over(data, lit);
};

const extrude: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const ang = rad(num(c.p.dir, 45));
  const L = num(c.p.depth, 30) * c.k;
  const side = hex(c.p.side);
  const INF = 1e9;
  const dist = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) dist[i] = top[i * 4 + 3] > 100 ? 0 : INF;
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  for (let step = 1; step <= L; step *= 2) {
    const sx = Math.round(dx * step);
    const sy = Math.round(dy * step);
    const prev = dist.slice();
    for (let y = 0; y < H; y++) {
      const yy = y - sy;
      if (yy < 0 || yy >= H) continue;
      for (let x = 0; x < W; x++) {
        const xx = x - sx;
        if (xx < 0 || xx >= W) continue;
        const v = prev[yy * W + xx] + step;
        if (v < dist[y * W + x]) dist[y * W + x] = v;
      }
    }
  }
  data.fill(0);
  if (c.p.shadow !== false) {
    const sh = new Float32Array(W * H);
    const ox = Math.round(dx * L * 1.3);
    const oy = Math.round(dy * L * 1.3);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const xx = x - ox;
        const yy = y - oy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H) sh[y * W + x] = dist[yy * W + xx] <= L ? 1 : 0;
      }
    blurAlpha(sh, W, H, L * 0.4 + 2, 2);
    for (let i = 0; i < W * H; i++) data[i * 4 + 3] = sh[i] * 90;
  }
  const body = new Uint8ClampedArray(data.length);
  for (let i = 0; i < W * H; i++) {
    const d = dist[i];
    if (d === 0 || d > L) continue;
    const n = i * 4;
    const k = 0.95 - 0.45 * (d / L);
    body[n] = side[0] * k;
    body[n + 1] = side[1] * k;
    body[n + 2] = side[2] * k;
    body[n + 3] = 255;
  }
  over(data, body);
  // Bevel: a bright rim on the edge facing away from the depth.
  const bev = num(c.p.bevel, 2) * c.k;
  if (bev > 0.5) {
    const b = Math.round(bev);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const n = (y * W + x) * 4;
        if (top[n + 3] < 100) continue;
        const xx = Math.round(x + dx * b);
        const yy = Math.round(y + dy * b);
        const outside = xx < 0 || yy < 0 || xx >= W || yy >= H || top[(yy * W + xx) * 4 + 3] < 100;
        const xb = Math.round(x - dx * b);
        const yb = Math.round(y - dy * b);
        const rim = xb < 0 || yb < 0 || xb >= W || yb >= H || top[(yb * W + xb) * 4 + 3] < 100;
        if (rim) for (let k = 0; k < 3; k++) top[n + k] += (255 - top[n + k]) * 0.35;
        else if (outside) for (let k = 0; k < 3; k++) top[n + k] *= 0.8;
      }
  }
  over(data, top);
};

const rays: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  let [cx, cy] = centreOf(c);
  const len = num(c.p.length, 60) / 100;
  const inten = num(c.p.intensity, 50) / 100;
  const th = num(c.p.threshold, 60) / 100;
  const tone = c.p.tone;
  // Work at a quarter size: rays are soft anyway.
  const s = 4;
  const w = Math.ceil(W / s);
  const h = Math.ceil(H / s);
  const mask = new Float32Array(w * h * 3);
  // A see-through element (text, sticker) shines by its shape; a photo by its bright parts.
  let sumA = 0;
  for (let i = 3; i < data.length; i += 16) sumA += data[i];
  const byShape = sumA / (data.length / 16) < 200;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      // The strongest pixel of the cell (thin letters must not slip through).
      let n = (Math.min(H - 1, y * s) * W + Math.min(W - 1, x * s)) * 4;
      for (let yy = y * s; yy < Math.min(H, y * s + s); yy++)
        for (let xx = x * s; xx < Math.min(W, x * s + s); xx++) {
          const m2 = (yy * W + xx) * 4;
          if (data[m2 + 3] > data[n + 3]) n = m2;
        }
      const a = data[n + 3] / 255;
      const l = (0.299 * data[n] + 0.587 * data[n + 1] + 0.114 * data[n + 2]) / 255;
      const m = byShape ? a * (1 - th * 0.5) : a * clamp((l - th * 0.8) / 0.25, 0, 1);
      const i = (y * w + x) * 3;
      const col = tone === "white" ? [255, 255, 255] : tone === "warm" || (byShape && data[n] + data[n + 1] + data[n + 2] < 150) ? [255, 214, 140] : [data[n], data[n + 1], data[n + 2]];
      mask[i] = col[0] * m;
      mask[i + 1] = col[1] * m;
      mask[i + 2] = col[2] * m;
    }
  // Default centre: the middle of what is drawn (a text's letters may sit to one side of its box).
  if (num(c.p.cx, 50) === 50 && num(c.p.cy, 50) === 50) {
    let sx = 0,
      sy = 0,
      sw = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const n = (Math.min(H - 1, y * s) * W + Math.min(W - 1, x * s)) * 4;
        const a = data[n + 3];
        sx += x * a;
        sy += y * a;
        sw += a;
      }
    if (sw > 0) {
      cx = (sx / sw) * s;
      cy = (sy / sw) * s;
    }
  }
  const out = new Float32Array(w * h * 3);
  const N = 36;
  const decay = 0.9 + len * 0.08;
  const ccx = cx / s;
  const ccy = cy / s;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let wgt = 1;
      let r = 0,
        g = 0,
        b = 0;
      const stepX = ((x - ccx) / N) * (0.3 + len * 0.7);
      const stepY = ((y - ccy) / N) * (0.3 + len * 0.7);
      let px = x;
      let py = y;
      for (let i = 0; i < N; i++) {
        px -= stepX;
        py -= stepY;
        const xi = Math.round(px);
        const yi = Math.round(py);
        if (xi < 0 || yi < 0 || xi >= w || yi >= h) break;
        const k = (yi * w + xi) * 3;
        r += mask[k] * wgt;
        g += mask[k + 1] * wgt;
        b += mask[k + 2] * wgt;
        wgt *= decay;
      }
      const k = (y * w + x) * 3;
      out[k] = r / N;
      out[k + 1] = g / N;
      out[k + 2] = b / N;
    }
  const top = data.slice();
  // Separate rays: brightness varies with the angle round the source.
  const streak = (a: number) => 0.45 + 0.55 * clamp(0.5 + 0.28 * Math.sin(a * 11 + 0.7) + 0.18 * Math.sin(a * 23 + 2.1) + 0.12 * Math.sin(a * 41 + 4.3), 0, 1);
  // Fade out well before the edge of the room around the element.
  const room = Math.max(1, Math.min(c.x0, c.y0, W - c.x0 - c.w, H - c.y0 - c.h));
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = (Math.min(h - 1, Math.floor(y / s)) * w + Math.min(w - 1, Math.floor(x / s))) * 3;
      const n = (y * W + x) * 4;
      const outside = Math.max(c.x0 - x, x - c.x0 - c.w, c.y0 - y, y - c.y0 - c.h, 0);
      const fade = clamp(1 - outside / (room * 0.95), 0, 1) ** 1.5 * streak(Math.atan2(y - cy, x - cx));
      const r = out[k] * inten * 4 * fade;
      const g = out[k + 1] * inten * 4 * fade;
      const b = out[k + 2] * inten * 4 * fade;
      const a = clamp(Math.max(r, g, b) / 255, 0, 1);
      data[n] = a > 0 ? r / a : 0;
      data[n + 1] = a > 0 ? g / a : 0;
      data[n + 2] = a > 0 ? b / a : 0;
      data[n + 3] = a * 255;
    }
  over(data, top);
  // Rays also brighten the element itself (screen).
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      if (top[n + 3] < 10) continue;
      const k = (Math.min(h - 1, Math.floor(y / s)) * w + Math.min(w - 1, Math.floor(x / s))) * 3;
      for (let i = 0; i < 3; i++) data[n + i] = 255 - ((255 - data[n + i]) * (255 - clamp(out[k + i] * inten, 0, 255))) / 255;
    }
};

const motionBlur: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const pm = premul(data);
  const o = new Float32Array(4);
  const acc = new Float32Array(4);
  const ang = rad(num(c.p.dir, 0));
  const L = (num(c.p.length, 40) / 100) * 0.3 * Math.max(c.w, c.h);
  const keep = num(c.p.keep, 50) / 100;
  const N = Math.min(40, Math.max(4, Math.round(L / Math.max(1, c.k))));
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      acc[0] = acc[1] = acc[2] = acc[3] = 0;
      // Trail behind the movement: samples from the past positions.
      for (let i = 0; i < N; i++) {
        const t = (i / (N - 1)) * L;
        sample(pm, W, H, x + 0.5 + dx * t, y + 0.5 + dy * t, o);
        const wgt = 1 - (i / N) * 0.6;
        acc[0] += o[0] * wgt;
        acc[1] += o[1] * wgt;
        acc[2] += o[2] * wgt;
        acc[3] += o[3] * wgt;
      }
      const norm = N * 0.7;
      sample(pm, W, H, x + 0.5, y + 0.5, o);
      for (let k = 0; k < 4; k++) acc[k] = (acc[k] / norm) * (1 - keep) + Math.max(o[k], (acc[k] / norm) * 0.3) * keep;
      put(data, (y * W + x) * 4, acc);
    }
};

const zoomBlur: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const pm = premul(data);
  const o = new Float32Array(4);
  const acc = new Float32Array(4);
  const [cx, cy] = centreOf(c);
  const amt = (num(c.p.amount, 40) / 100) * 0.35;
  const sharp = (num(c.p.sharp, 30) / 100) * Math.min(c.w, c.h) * 0.5;
  const N = 24;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = Math.hypot(x - cx, y - cy);
      const k = clamp((r - sharp) / Math.max(1, sharp), 0, 1) * amt;
      acc[0] = acc[1] = acc[2] = acc[3] = 0;
      for (let i = 0; i < N; i++) {
        const s = 1 - (k * i) / N;
        sample(pm, W, H, cx + (x + 0.5 - cx) * s, cy + (y + 0.5 - cy) * s, o);
        acc[0] += o[0];
        acc[1] += o[1];
        acc[2] += o[2];
        acc[3] += o[3];
      }
      for (let j = 0; j < 4; j++) acc[j] /= N;
      put(data, (y * W + x) * 4, acc);
    }
};

const tiltShift: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const sharp = premul(data);
  const blur = Float32Array.from(sharp);
  blurRGBA(blur, W, H, (num(c.p.blur, 60) / 100) * 0.02 * Math.max(c.w, c.h) + 1, 2);
  const at = c.y0 + (num(c.p.at, 50) / 100) * c.h;
  const half = (num(c.p.width, 20) / 100) * c.h * 0.5;
  const circle = c.p.kind === "circle";
  const cx = c.x0 + c.w / 2;
  const boost = num(c.p.boost, 30) / 100;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = circle ? Math.hypot(x - cx, y - at) : Math.abs(y - at);
      const k = clamp((d - half) / Math.max(1, half * 1.5), 0, 1);
      const n = (y * W + x) * 4;
      for (let j = 0; j < 4; j++) sharp[n + j] = sharp[n + j] * (1 - k) + blur[n + j] * k;
    }
  fromPremul(sharp, data);
  if (boost > 0)
    for (let i = 0; i < data.length; i += 4) {
      const l = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      for (let j = 0; j < 3; j++) data[i + j] = clamp(l + (data[i + j] - l) * (1 + boost * 0.6), 0, 255);
    }
};

// ---------------------------------------------------------------- round 3 (editor-v2/14 §8)

/** Smooth value noise in [0, 1], the same for the same seed. */
function noise2(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const at = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const cc = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v;
  };
  return {
    at,
    /** Layers of noise, finer and fainter. */
    fbm(x: number, y: number, oct = 4) {
      let v = 0;
      let amp = 0.5;
      let f = 1;
      for (let i = 0; i < oct; i++) {
        v += amp * at(x * f, y * f);
        f *= 2.03;
        amp *= 0.5;
      }
      return v / (1 - Math.pow(0.5, oct));
    },
  };
}

const lumAt = (d: Uint8ClampedArray, n: number) => (0.299 * d[n] + 0.587 * d[n + 1] + 0.114 * d[n + 2]) / 255;

const shatter: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const pm = premul(data.slice());
  const o = new Float32Array(4);
  const rnd = rng(c.seed * 6007 + 1);
  const n = Math.round(num(c.p.pieces, 18));
  const [cx, cy] = centreOf(c);
  const spread = (num(c.p.spread, 30) / 100) * 0.12 * Math.max(c.w, c.h);
  const turn = (num(c.p.turn, 20) / 100) * 0.5;
  const edge = num(c.p.edge, 40) / 100;
  // Cell centres, more of them near the break point.
  const pts = Array.from({ length: n }, () => {
    const a = rnd() * Math.PI * 2;
    const r = Math.pow(rnd(), 1.6) * Math.max(c.w, c.h) * 0.7;
    return [clamp(cx + Math.cos(a) * r, c.x0, c.x0 + c.w), clamp(cy + Math.sin(a) * r, c.y0, c.y0 + c.h)];
  });
  // Which piece each pixel of the element belongs to.
  const owner = new Int16Array(W * H).fill(-1);
  const second = new Float32Array(W * H);
  for (let y = Math.max(0, Math.floor(c.y0)); y < Math.min(H, Math.ceil(c.y0 + c.h)); y++)
    for (let x = Math.max(0, Math.floor(c.x0)); x < Math.min(W, Math.ceil(c.x0 + c.w)); x++) {
      let b1 = 1e18,
        b2 = 1e18,
        id = -1;
      for (let i = 0; i < n; i++) {
        const d = (x - pts[i][0]) ** 2 + (y - pts[i][1]) ** 2;
        if (d < b1) {
          b2 = b1;
          b1 = d;
          id = i;
        } else if (d < b2) b2 = d;
      }
      owner[y * W + x] = id;
      // Distance to the crack between the two nearest centres.
      second[y * W + x] = (Math.sqrt(b2) - Math.sqrt(b1)) / 2;
    }
  // Each piece moves out from the break point and turns a little.
  const moves = pts.map(([px, py]) => {
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const push = spread * (0.4 + (dist / Math.max(c.w, c.h)) * 1.4) * (0.7 + rnd() * 0.6);
    return { tx: (dx / dist) * push, ty: (dy / dist) * push, a: (rnd() - 0.5) * turn, px, py };
  });
  data.fill(0);
  const gapPx = Math.max(1, 1.2 * c.k);
  for (let i = 0; i < n; i++) {
    const m = moves[i];
    const co = Math.cos(m.a);
    const si = Math.sin(m.a);
    const R = Math.max(c.w, c.h);
    const x0 = Math.max(0, Math.floor(m.px + m.tx - R));
    const x1 = Math.min(W - 1, Math.ceil(m.px + m.tx + R));
    const y0 = Math.max(0, Math.floor(m.py + m.ty - R));
    const y1 = Math.min(H - 1, Math.ceil(m.py + m.ty + R));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        // Back to where this pixel was before the piece moved.
        const dx = x + 0.5 - m.px - m.tx;
        const dy = y + 0.5 - m.py - m.ty;
        const sx = m.px + dx * co + dy * si;
        const sy = m.py - dx * si + dy * co;
        const xi = Math.floor(sx);
        const yi = Math.floor(sy);
        if (xi < 0 || yi < 0 || xi >= W || yi >= H || owner[yi * W + xi] !== i) continue;
        const crack = second[yi * W + xi];
        if (crack < gapPx * 0.5) continue;
        sample(pm, W, H, sx, sy, o);
        if (o[3] < 1) continue;
        const k4 = (y * W + x) * 4;
        put(data, k4, o);
        if (edge > 0 && crack < gapPx * 3) {
          const k = edge * 0.6 * (1 - crack / (gapPx * 3));
          for (let j = 0; j < 3; j++) data[k4 + j] += (255 - data[k4 + j]) * k;
        }
      }
  }
};

const POP: Record<string, number[][]> = {
  warhol: [
    [40, 20, 60],
    [255, 60, 150],
    [255, 210, 40],
    [120, 220, 255],
  ],
  comic: [
    [20, 20, 30],
    [220, 40, 40],
    [40, 110, 220],
    [255, 225, 60],
  ],
  mint: [
    [30, 50, 60],
    [255, 110, 100],
    [120, 230, 200],
    [255, 245, 220],
  ],
  night: [
    [10, 10, 40],
    [110, 40, 200],
    [255, 70, 160],
    [90, 240, 255],
  ],
};

const popArt: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const src = data.slice();
  const levels = Math.round(num(c.p.levels, 4));
  const lines = num(c.p.lines, 50) / 100;
  const dots = num(c.p.dots, 30) / 100;
  const pal = POP[String(c.p.palette)];
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) lum[i] = lumAt(src, i * 4);
  const cell = Math.max(3, 6 * c.k);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const n = i * 4;
      if (src[n + 3] < 10) continue;
      const l = lum[i];
      const band = Math.min(levels - 1, Math.floor(l * levels));
      if (pal) {
        const col = pal[Math.min(pal.length - 1, Math.floor((band / Math.max(1, levels - 1)) * (pal.length - 1) + 0.5))];
        data[n] = col[0];
        data[n + 1] = col[1];
        data[n + 2] = col[2];
      } else
        for (let k = 0; k < 3; k++) {
          const v = src[n + k] / 255;
          data[n + k] = (Math.round(v * (levels - 1)) / (levels - 1)) * 255;
        }
      // Dots in the darker half.
      if (dots > 0 && l < 0.55) {
        const u = (x % cell) / cell - 0.5;
        const v = (y % cell) / cell - 0.5;
        if (Math.hypot(u, v) < (0.55 - l) * dots * 1.1) for (let k = 0; k < 3; k++) data[n + k] *= 0.35;
      }
      // Black outlines where the tone jumps.
      if (lines > 0) {
        const gx = lum[i + 1] - lum[i - 1];
        const gy = lum[i + W] - lum[i - W];
        const ea = Math.abs(src[n + 7] - src[n - 1]) + Math.abs(src[(i + W) * 4 + 3] - src[(i - W) * 4 + 3]);
        if (Math.hypot(gx, gy) > 0.25 - lines * 0.18 || ea > 200) data[n] = data[n + 1] = data[n + 2] = 15;
      }
    }
};

const ASCII_SETS: Record<string, string> = { classic: "@%#*+=-:. ", blocks: "█▓▒░ ", digits: "10 " };

const ascii: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const src = data.slice();
  const cell = Math.max(4, Math.round(num(c.p.size, 12) * c.k));
  const chars = ASCII_SETS[String(c.p.set)] ?? ASCII_SETS.classic;
  const mode = c.p.colour ?? "one";
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  if (!g) return;
  const bg = c.p.bg !== false;
  g.font = `700 ${cell}px ui-monospace, Menlo, Consolas, monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let y = 0; y < H; y += cell)
    for (let x = 0; x < W; x += cell) {
      const n = (Math.min(H - 1, Math.floor(y + cell / 2)) * W + Math.min(W - 1, Math.floor(x + cell / 2))) * 4;
      if (src[n + 3] < 30) continue;
      if (bg) {
        g.fillStyle = mode === "ink" ? "#f6f1e6" : mode === "one" ? "#06140a" : "#0d0d0f";
        g.fillRect(x, y, cell, cell);
      }
      const l = lumAt(src, n);
      const ch = chars[Math.min(chars.length - 1, Math.floor((mode === "ink" ? l : 1 - l) * chars.length))];
      if (ch === " ") continue;
      g.fillStyle = mode === "one" ? "#39ff6a" : mode === "ink" ? "#1a1a1a" : `rgb(${src[n]},${src[n + 1]},${src[n + 2]})`;
      g.fillText(ch, x + cell / 2, y + cell / 2 + cell * 0.05);
    }
  data.set(g.getImageData(0, 0, W, H).data);
};

const glass: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const pm = premul(data);
  const blurR = num(c.p.blur, 8) * c.k * 0.5;
  if (blurR >= 1) blurRGBA(pm, W, H, blurR, 2);
  const o = new Float32Array(4);
  const style = String(c.p.style ?? "fluted");
  const ribs = num(c.p.ribs, 20);
  const refr = (num(c.p.refract, 40) / 100) * 0.06 * Math.max(c.w, c.h);
  const rim = num(c.p.rim, 30) / 100;
  const tint = hex(c.p.tint);
  const nz = noise2(c.seed * 97 + 13);
  const out = new Uint8ClampedArray(data.length);
  const rw = c.w / ribs;
  const rh = c.h / ribs;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let dx = 0;
      let dy = 0;
      let shade = 0;
      if (style === "frosted") {
        dx = (nz.at(x / (2 * c.k), y / (2 * c.k)) - 0.5) * refr * 0.6;
        dy = (nz.at(x / (2 * c.k) + 50, y / (2 * c.k)) - 0.5) * refr * 0.6;
      } else {
        const fu = (((x - c.x0) / rw) % 1 + 1) % 1;
        const fv = (((y - c.y0) / rh) % 1 + 1) % 1;
        // Each rib is a little cylinder lens: shifts towards its middle, bright on one side.
        if (style === "fluted" || style === "grid") {
          dx = (fu - 0.5) * refr * -2;
          shade += (0.5 - fu) * 0.5;
        }
        if (style === "ribbedH" || style === "grid") {
          dy = (fv - 0.5) * refr * -2;
          shade += (0.5 - fv) * 0.5;
        }
      }
      sample(pm, W, H, x + 0.5 + dx, y + 0.5 + dy, o);
      const n = (y * W + x) * 4;
      put(out, n, o);
      if (out[n + 3] < 2) continue;
      for (let k = 0; k < 3; k++) {
        let v = out[n + k] * 0.82 + tint[k] * 0.18;
        v = shade > 0 ? v + (255 - v) * shade * rim * 1.2 : v * (1 + shade * rim);
        out[n + k] = v;
      }
    }
  data.set(out);
};

const watercolor: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const nz = noise2(c.seed * 503 + 2);
  const bleed = num(c.p.bleed, 40) / 100;
  const edges = num(c.p.edges, 50) / 100;
  const paper = num(c.p.paper, 40) / 100;
  const detail = num(c.p.detail, 3);
  const pm = premul(data);
  blurRGBA(pm, W, H, Math.max(1, (6 - detail) * 2.2 * c.k), 2);
  const soft = new Uint8ClampedArray(data.length);
  fromPremul(pm, soft);
  // Ragged, bled edges: the outline moved by noise.
  const A = new Float32Array(W * H);
  const sc = 1 / (14 * c.k);
  const amp = (2 + bleed * 14) * c.k;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const ox = (nz.fbm(x * sc, y * sc, 3) - 0.5) * amp;
      const oy = (nz.fbm(x * sc + 31, y * sc + 17, 3) - 0.5) * amp;
      const xi = clamp(Math.round(x + ox), 0, W - 1);
      const yi = clamp(Math.round(y + oy), 0, H - 1);
      A[y * W + x] = soft[(yi * W + xi) * 4 + 3] / 255;
    }
  const B = Float32Array.from(A);
  blurAlpha(B, W, H, 2 * c.k + 1, 1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const n = i * 4;
      const a = clamp((A[i] - 0.35) * 3, 0, 1);
      if (a <= 0) {
        data[n + 3] = 0;
        continue;
      }
      // Pigment piles up at the edges of a wash.
      const rim = clamp((1 - B[i]) * 3, 0, 1) * edges;
      // Paper: soft, fine tooth; the wash: slow patches of more and less pigment.
      const pg = 1 - paper * 0.1 * (nz.at(x / (2.5 * c.k), y / (2.5 * c.k)) * 0.6 + nz.at(x / (6 * c.k), y / (6 * c.k)) * 0.4);
      const flow = 0.92 + 0.16 * nz.fbm(x * sc * 0.7, y * sc * 0.7, 3);
      for (let k = 0; k < 3; k++) {
        // Lighter like thin paint, darker at the rim.
        let v = soft[n + k] + (255 - soft[n + k]) * 0.18;
        v *= (1 - rim * 0.45) * pg * flow;
        data[n + k] = clamp(v, 0, 255);
      }
      data[n + 3] = a * 255 * (0.82 + 0.18 * pg);
    }
};

const inkWash: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const nz = noise2(c.seed * 211 + 5);
  const dens = num(c.p.density, 60) / 100;
  const tones = Math.round(num(c.p.tones, 4));
  const fib = (num(c.p.fibres, 30) / 100) * 4 * c.k;
  const paperKind = c.p.paper ?? "ivory";
  const paper = paperKind === "white" ? [250, 250, 248] : [238, 228, 205];
  const src = data.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      // Ink seeps along paper fibres.
      const ox = (nz.at(x / (0.8 * c.k), y / (6 * c.k)) - 0.5) * fib;
      const oy = (nz.at(x / (6 * c.k) + 9, y / (0.8 * c.k)) - 0.5) * fib;
      const xi = clamp(Math.round(x + ox), 0, W - 1);
      const yi = clamp(Math.round(y + oy), 0, H - 1);
      const m = (yi * W + xi) * 4;
      const a = src[m + 3] / 255;
      const inside = x >= c.x0 && x < c.x0 + c.w && y >= c.y0 && y < c.y0 + c.h;
      if (a < 0.05) {
        if (paperKind !== "none" && inside) {
          data[n] = paper[0];
          data[n + 1] = paper[1];
          data[n + 2] = paper[2];
          data[n + 3] = 255;
        } else data[n + 3] = 0;
        continue;
      }
      // Soft steps of ink.
      const dark = 1 - lumAt(src, m);
      const q = Math.round(dark * dens * 1.4 * (tones - 1)) / (tones - 1);
      const ink = clamp(q * a * (0.85 + 0.3 * nz.at(x / (3 * c.k), y / (3 * c.k))), 0, 1);
      const base = paperKind === "none" ? [255, 255, 255] : paper;
      for (let k = 0; k < 3; k++) data[n + k] = base[k] * (1 - ink) + 18 * ink;
      data[n + 3] = paperKind === "none" ? clamp(ink * 1.6, 0, 1) * 255 : 255;
    }
  if (c.p.seal) {
    // A red seal in the lower right corner.
    const s = Math.min(c.w, c.h) * 0.14;
    const sx = c.x0 + c.w - s * 1.4;
    const sy = c.y0 + c.h - s * 1.4;
    for (let y = Math.floor(sy); y < sy + s; y++)
      for (let x = Math.floor(sx); x < sx + s; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const u = (x - sx) / s;
        const v = (y - sy) / s;
        const white = (u > 0.1 && u < 0.9 && v > 0.1 && v < 0.9 && (Math.abs(u - 0.33) < 0.05 || Math.abs(u - 0.67) < 0.05 || Math.abs(v - 0.5) < 0.05)) || nz.at(x / c.k, y / c.k) > 0.82;
        const n = (y * W + x) * 4;
        if (white) continue;
        data[n] = 190;
        data[n + 1] = 30;
        data[n + 2] = 35;
        data[n + 3] = 235;
      }
  }
};

const sketch: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const src = data.slice();
  const lines = num(c.p.lines, 50) / 100;
  const hatch = num(c.p.hatch, 50) / 100;
  const ang = rad(num(c.p.angle, 45));
  const co = Math.cos(ang);
  const si = Math.sin(ang);
  const lead = c.p.lead ?? "graphite";
  const paperKind = c.p.paper ?? "white";
  const paper = paperKind === "ivory" ? [246, 240, 225] : [255, 255, 255];
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) lum[i] = lumAt(src, i * 4);
  const bl = Float32Array.from(lum);
  blurAlpha(bl, W, H, c.k + 0.5, 1);
  const nz = noise2(41);
  const sp = Math.max(3, 4 * c.k);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const n = i * 4;
      const a = src[n + 3] / 255;
      if (a < 0.05) {
        data[n + 3] = 0;
        continue;
      }
      const gx = bl[i + 1] - bl[i - 1];
      const gy = bl[i + W] - bl[i - W];
      const edge = clamp(Math.hypot(gx, gy) * 6 * lines, 0, 1);
      // Hatching: lines across the darker parts, a second set across the darkest.
      const d = 1 - lum[i];
      const u = (x * co + y * si) / sp;
      const v = (-x * si + y * co) / sp;
      let h = 0;
      if (d > 0.35) h = Math.max(h, (1 - Math.abs((u % 1) - 0.5) * 4) * (d - 0.35) * 1.6);
      if (d > 0.65) h = Math.max(h, (1 - Math.abs((v % 1) - 0.5) * 4) * (d - 0.65) * 2);
      h = clamp(h, 0, 1) * hatch * (0.7 + 0.3 * nz.at(x / (2 * c.k), y / (2 * c.k)));
      const g = clamp(Math.max(edge, h), 0, 1);
      const ink = lead === "charcoal" ? [25, 22, 22] : lead === "colour" ? [src[n] * 0.6, src[n + 1] * 0.6, src[n + 2] * 0.6] : [70, 72, 78];
      const base = paperKind === "none" ? ink : paper;
      for (let k = 0; k < 3; k++) data[n + k] = base[k] * (1 - g) + ink[k] * g;
      data[n + 3] = paperKind === "none" ? g * 255 * a : 255 * a;
    }
};

const oil: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const r = Math.max(1, Math.round(num(c.p.brush, 6) * c.k * 0.6));
  // Summed-area tables: per quadrant mean colour and brightness variance (Kuwahara).
  const S = (W + 1) * (H + 1);
  const sr = new Float64Array(S);
  const sg = new Float64Array(S);
  const sb = new Float64Array(S);
  const sl = new Float64Array(S);
  const sl2 = new Float64Array(S);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      const i = (y + 1) * (W + 1) + x + 1;
      const l = lumAt(data, n);
      sr[i] = data[n] + sr[i - 1] + sr[i - W - 1] - sr[i - W - 2];
      sg[i] = data[n + 1] + sg[i - 1] + sg[i - W - 1] - sg[i - W - 2];
      sb[i] = data[n + 2] + sb[i - 1] + sb[i - W - 1] - sb[i - W - 2];
      sl[i] = l + sl[i - 1] + sl[i - W - 1] - sl[i - W - 2];
      sl2[i] = l * l + sl2[i - 1] + sl2[i - W - 1] - sl2[i - W - 2];
    }
  const box = (t: Float64Array, x0: number, y0: number, x1: number, y1: number) => t[(y1 + 1) * (W + 1) + x1 + 1] - t[y0 * (W + 1) + x1 + 1] - t[(y1 + 1) * (W + 1) + x0] + t[y0 * (W + 1) + x0];
  const src = data.slice();
  const lumOut = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      if (src[n + 3] < 5) continue;
      let best = 1e9;
      let br = 0,
        bg = 0,
        bb = 0;
      for (const [qx, qy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const x0 = clamp(qx < 0 ? x - r : x, 0, W - 1);
        const x1 = clamp(qx < 0 ? x : x + r, 0, W - 1);
        const y0 = clamp(qy < 0 ? y - r : y, 0, H - 1);
        const y1 = clamp(qy < 0 ? y : y + r, 0, H - 1);
        const cnt = (x1 - x0 + 1) * (y1 - y0 + 1);
        const m = box(sl, x0, y0, x1, y1) / cnt;
        const v = box(sl2, x0, y0, x1, y1) / cnt - m * m;
        if (v < best) {
          best = v;
          br = box(sr, x0, y0, x1, y1) / cnt;
          bg = box(sg, x0, y0, x1, y1) / cnt;
          bb = box(sb, x0, y0, x1, y1) / cnt;
        }
      }
      data[n] = br;
      data[n + 1] = bg;
      data[n + 2] = bb;
      lumOut[y * W + x] = (0.299 * br + 0.587 * bg + 0.114 * bb) / 255;
    }
  // Thick paint: light the strokes from the top left, a little shine.
  const thick = (num(c.p.thick, 40) / 100) * 3;
  const shine = num(c.p.shine, 30) / 100;
  const nz = noise2(77);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const n = i * 4;
      if (src[n + 3] < 5) continue;
      const tex = nz.at(x / (r * 0.8), y / (r * 2.5)) * 0.3;
      const gx = lumOut[i + 1] - lumOut[i - 1] + (nz.at((x + 1) / (r * 0.8), y / (r * 2.5)) * 0.3 - tex);
      const gy = lumOut[i + W] - lumOut[i - W];
      const k = clamp(-(gx + gy) * thick, -0.3, 0.3);
      const spec = Math.max(0, k) * shine * 1.5;
      for (let j = 0; j < 3; j++) data[n + j] = clamp(data[n + j] * (1 + k * 0.6) + 255 * spec, 0, 255);
    }
};

const crayon: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const src = data.slice();
  const nz = noise2(c.seed * 331 + 8);
  const kind = c.p.kind ?? "crayon";
  const grain = num(c.p.grain, 50) / 100;
  const ang = rad(num(c.p.angle, 30));
  const co = Math.cos(ang);
  const si = Math.sin(ang);
  const wob = (num(c.p.wobble, 30) / 100) * 3 * c.k;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const n = (y * W + x) * 4;
      const xi = clamp(Math.round(x + (nz.at(x / (5 * c.k), y / (5 * c.k)) - 0.5) * wob * 2), 0, W - 1);
      const yi = clamp(Math.round(y + (nz.at(x / (5 * c.k) + 7, y / (5 * c.k)) - 0.5) * wob * 2), 0, H - 1);
      const m = (yi * W + xi) * 4;
      const a = src[m + 3] / 255;
      if (a < 0.05) {
        data[n + 3] = 0;
        continue;
      }
      // Paper tooth: streaks along the stroke direction, gaps where the paper is low.
      const u = x * co + y * si;
      const v = -x * si + y * co;
      const tooth = nz.at(u / (6 * c.k), v / (0.9 * c.k)) * 0.6 + nz.at(x / (1.2 * c.k), y / (1.2 * c.k)) * 0.4;
      const cover = clamp((tooth - grain * 0.45) * 3, 0, 1);
      let col = [src[m], src[m + 1], src[m + 2]];
      if (kind === "chalk") col = col.map((v2) => v2 + (255 - v2) * 0.45);
      if (kind === "pastel") col = col.map((v2) => v2 + (255 - v2) * 0.25);
      data[n] = col[0];
      data[n + 1] = col[1];
      data[n + 2] = col[2];
      data[n + 3] = a * 255 * (kind === "pastel" ? 0.55 + cover * 0.45 : cover);
    }
};

const smoke: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const nz = noise2(c.seed * 991 + 3);
  const dens = num(c.p.density, 50) / 100;
  const sc = 1 / ((3 + num(c.p.scale, 4) * 6) * c.k);
  const col = hex(c.p.color);
  const ang = rad(num(c.p.dir, 270));
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const fade = num(c.p.fade, 30) / 100;
  const top = data.slice();
  // How far "downwind" each pixel is from the shape, by doubling steps.
  const INF = 1e9;
  const dist = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) dist[i] = top[i * 4 + 3] > 60 ? 0 : INF;
  const L = Math.max(W, H);
  for (let step = 1; step <= L; step *= 2) {
    const sx = Math.round(dx * step);
    const sy = Math.round(dy * step);
    const prev = dist.slice();
    for (let y = 0; y < H; y++) {
      const yy = y - sy;
      if (yy < 0 || yy >= H) continue;
      for (let x = 0; x < W; x++) {
        const xx = x - sx;
        if (xx < 0 || xx >= W) continue;
        const v = prev[yy * W + xx] + step;
        if (v < dist[y * W + x]) dist[y * W + x] = v;
      }
    }
  }
  const reach = Math.max(c.w, c.h) * 0.45;
  // The plume: strong right over the shape, spreading and thinning as it rises (soft sides).
  const plume = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) plume[i] = dist[i] < INF ? Math.exp(-dist[i] / reach) : 0;
  blurAlpha(plume, W, H, Math.max(c.w, c.h) * 0.08 + 2, 3);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const n = i * 4;
      // Swirls drift and curl with the smoke.
      const along = (x * dx + y * dy) * sc;
      const warp1 = nz.fbm(x * sc * 0.5 + 3, y * sc * 0.5 - along * 0.3, 3);
      const f = nz.fbm(x * sc + warp1 * 1.8, y * sc + warp1 * 1.2 - along * 0.6, 5);
      const pl = plume[i];
      const a = clamp((f * (0.6 + pl) - 0.62 + (1 - pl) * 0.15) * 3.2, 0, 1) * pl * dens * 1.6;
      // Dissolve the element where the smoke rises from it.
      if (top[n + 3] > 0 && fade > 0) {
        const keep = clamp((f - fade * 0.7) * 4 + 0.5, 0, 1);
        top[n + 3] *= 1 - (1 - keep) * fade;
      }
      data[n] = col[0];
      data[n + 1] = col[1];
      data[n + 2] = col[2];
      data[n + 3] = clamp(a, 0, 1) * 220;
    }
  over(data, top);
  // A little smoke in front, too.
  for (let i = 0; i < W * H; i++) {
    const n = i * 4;
    if (top[n + 3] < 10) continue;
    const f = nz.fbm((i % W) * sc, Math.floor(i / W) * sc, 4);
    const k = clamp((f - 0.55) * 2, 0, 1) * dens * 0.5;
    for (let j = 0; j < 3; j++) data[n + j] += (col[j] - data[n + j]) * k;
  }
};

const FIRE: Record<string, number[][]> = {
  red: [
    [0, 0, 0, 0],
    [180, 20, 0, 180],
    [255, 110, 0, 230],
    [255, 210, 60, 255],
    [255, 255, 220, 255],
  ],
  blue: [
    [0, 0, 0, 0],
    [20, 40, 180, 170],
    [40, 140, 255, 230],
    [140, 220, 255, 255],
    [240, 250, 255, 255],
  ],
  purple: [
    [0, 0, 0, 0],
    [90, 0, 140, 170],
    [190, 40, 255, 230],
    [255, 120, 255, 255],
    [255, 230, 255, 255],
  ],
};

const fire: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const nz = noise2(c.seed * 1201 + 9);
  // Flame height: a share of the element's shorter side.
  const Hf = (num(c.p.height, 25) / 100) * Math.min(c.w, c.h) * 1.2 + 4 * c.k;
  const ang = rad(num(c.p.dir, 270));
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const turb = num(c.p.turb, 50) / 100;
  const inten = num(c.p.intensity, 70) / 100;
  const pal = FIRE[String(c.p.palette)] ?? FIRE.red;
  const INF = 1e9;
  const dist = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) dist[i] = top[i * 4 + 3] > 100 ? 0 : INF;
  for (let step = 1; step <= Hf * 1.5; step *= 2) {
    const sx = Math.round(dx * step);
    const sy = Math.round(dy * step);
    const prev = dist.slice();
    for (let y = 0; y < H; y++) {
      const yy = y - sy;
      if (yy < 0 || yy >= H) continue;
      for (let x = 0; x < W; x++) {
        const xx = x - sx;
        if (xx < 0 || xx >= W) continue;
        const v = prev[yy * W + xx] + step;
        if (v < dist[y * W + x]) dist[y * W + x] = v;
      }
    }
  }
  const sc = 1 / (Hf * 0.35 + 2);
  data.fill(0);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      // Flames: tongues from the noise, shorter where it is low.
      const across = -x * dy + y * dx;
      const along = x * dx + y * dy;
      const f = nz.fbm(across * sc, along * sc * 0.6, 4);
      const lick = Hf * (0.35 + 0.95 * f) * (0.7 + turb * 0.6);
      // Wobble sideways.
      const wx = Math.round(x - dy * (nz.at(along * sc * 2, across * sc) - 0.5) * turb * Hf * 0.6);
      const wy = Math.round(y + dx * (nz.at(along * sc * 2, across * sc) - 0.5) * turb * Hf * 0.6);
      const d = wx >= 0 && wy >= 0 && wx < W && wy < H ? dist[wy * W + wx] : INF;
      if (d >= INF || d > lick) continue;
      const heat = clamp((1 - d / lick) * inten * 1.3, 0, 1);
      const t = heat * (pal.length - 1);
      const k = Math.min(pal.length - 2, Math.floor(t));
      const fr = t - k;
      const n = i * 4;
      for (let j = 0; j < 4; j++) data[n + j] = pal[k][j] + (pal[k + 1][j] - pal[k][j]) * fr;
    }
  over(data, top);
};

const frost: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const nz = noise2(c.seed * 1607 + 4);
  const ice = (num(c.p.ice, 40) / 100) * 10 * c.k;
  const branches = num(c.p.branches, 50) / 100;
  const snow = num(c.p.snow, 30) / 100;
  const tint = c.p.tone === "white" ? [255, 255, 255] : [210, 238, 255];
  const top = data.slice();
  const outD = distanceOut(top, W, H, 100);
  // Inside distance: from the outside of the shape.
  const inv = new Uint8ClampedArray(top.length);
  for (let i = 0; i < W * H; i++) inv[i * 4 + 3] = top[i * 4 + 3] >= 100 ? 0 : 255;
  const inD = distanceOut(inv, W, H, 128);
  const rnd = rng(c.seed * 77 + 1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const n = i * 4;
      const crystal = nz.fbm(x / (2.2 * c.k), y / (2.2 * c.k), 3);
      // Icy crust around the outside, ragged.
      const o = outD[i];
      if (o > 0 && o < ice * (0.6 + crystal)) {
        const k = 1 - o / (ice * (0.6 + crystal));
        data[n] = tint[0];
        data[n + 1] = tint[1];
        data[n + 2] = tint[2];
        data[n + 3] = 255 * clamp(k * 1.4, 0, 0.95);
        continue;
      }
      if (top[n + 3] < 100) continue;
      // Ferns growing in from the edge: thin bright lines in the noise ridges.
      const di = inD[i];
      const reach = ice * 3 + branches * Math.min(c.w, c.h) * 0.12;
      if (di < reach) {
        const ridge = 1 - Math.abs(nz.fbm(x / (5 * c.k), y / (5 * c.k), 4) - 0.5) * 2;
        const fern = clamp((ridge - 0.86) * 8, 0, 1) * branches * (1 - di / reach);
        const frostFog = clamp(1 - di / (ice * 2.5 + 1), 0, 1) * 0.55;
        const k = clamp(fern + frostFog, 0, 1);
        for (let j = 0; j < 3; j++) data[n + j] = data[n + j] + (tint[j] - data[n + j]) * k;
      }
    }
  // Snow specks.
  const count = Math.round(snow * (c.w * c.h) / (900 * c.k * c.k));
  for (let s = 0; s < count; s++) {
    const x = Math.floor(c.x0 - ice + rnd() * (c.w + ice * 2));
    const y = Math.floor(c.y0 - ice + rnd() * (c.h + ice * 2));
    const r = (0.6 + rnd() * 1.6) * c.k;
    for (let yy = Math.floor(y - r); yy <= y + r; yy++)
      for (let xx = Math.floor(x - r); xx <= x + r; xx++) {
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const k = clamp(r - Math.hypot(xx - x, yy - y) + 0.5, 0, 1);
        const n = (yy * W + xx) * 4;
        for (let j = 0; j < 3; j++) data[n + j] += (255 - data[n + j]) * k;
        data[n + 3] = Math.max(data[n + 3], k * 240);
      }
  }
};

const FX: Record<string, Fx> = { shatter, popArt, ascii, glass, watercolor, inkWash, sketch, oil, crayon, smoke, fire, frost, flag, ripple, perspective, fisheye, mirror, kaleidoscope, stretch, tear, fold, crt, dither, riso, emboss, glow, extrude, rays, motionBlur, zoomBlur, tiltShift, melt, drape, twirl, bulge, wave, arc, glitch, pixelate, rgbSplit, halftone, duotone, longShadow, offsetShadow, outline: outlineFx, reflection, glitter, echo };

/** Runs the element's effect on its picture (in place). */
export function runEffect(img: ImageData, e: ElementEffect, box: { x0: number; y0: number; w: number; h: number; k: number }) {
  const fx = FX[e.id];
  if (!fx) return;
  fx(img, { W: img.width, H: img.height, ...box, p: effectParams(e), seed: e.seed ?? 1 });
}
