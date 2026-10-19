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

const melt: Fx = (img, c) => {
  const f = frame(c, num(c.p.dir, 90));
  // A flat thing (a line of text) drips by its width too, not only its thin height.
  const amt = (num(c.p.amount) / 100) * 1.5 * (Math.max(f.L, f.S * 0.35) / f.L);
  const b = num(c.p.start) / 100;
  const prof = drips(c, Math.round(num(c.p.drips, 4)), num(c.p.vary) / 100, num(c.p.thick) / 100, f.S / f.L);
  const gloss = num(c.p.gloss) / 100;
  warp(
    img,
    (x, y, o) => {
      const t = x * f.D[0] + y * f.D[1];
      const s = x * f.N[0] + y * f.N[1];
      const u = (s - f.sMin) / f.S;
      let tn = (t - f.tMin) / f.L;
      if (tn > b) {
        const dr = amt * prof.at(clamp(u, 0, 1));
        tn = b + ((tn - b) * (1 - b)) / (1 - b + dr);
      }
      const tt = f.tMin + tn * f.L;
      o[0] = s * f.N[0] + tt * f.D[0];
      o[1] = s * f.N[1] + tt * f.D[1];
      return tn <= 1.0001;
    },
    gloss > 0
      ? (x, y, n, d) => {
          if (d[n + 3] < 10) return;
          const s = (x * f.N[0] + y * f.N[1] - f.sMin) / f.S;
          const tn = (x * f.D[0] + y * f.D[1] - f.tMin) / f.L;
          if (tn < b) return;
          let hl = 0;
          for (const dp of prof.list) hl = Math.max(hl, Math.exp(-(((s - dp.at + dp.wid * 0.35) / (dp.wid * 0.22)) ** 2)));
          const k = gloss * 0.55 * hl * clamp((tn - b) * 4, 0, 1);
          d[n] += (255 - d[n]) * k;
          d[n + 1] += (255 - d[n + 1]) * k;
          d[n + 2] += (255 - d[n + 2]) * k;
        }
      : undefined,
  );
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

const reflection: Fx = (img, c) => {
  const { width: W, height: H, data } = img;
  const top = data.slice();
  const pm = premul(top);
  const o = new Float32Array(4);
  const deg = Math.round(num(c.p.dir, 90));
  const len = num(c.p.length, 50) / 100;
  const a0 = num(c.p.alpha, 40) / 100;
  const gap = num(c.p.gap) * c.k;
  const rip = (num(c.p.ripple) / 100) * 0.02 * c.w;
  data.fill(0);
  const vertical = deg === 90 || deg === 270;
  const span = (vertical ? c.h : c.w) * len;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let t: number; // distance past the element's edge
      let sx = x + 0.5;
      let sy = y + 0.5;
      if (deg === 90) {
        t = y + 0.5 - (c.y0 + c.h) - gap;
        sy = c.y0 + c.h - t;
        sx += rip * Math.sin(t / Math.max(1, 3 * c.k));
      } else if (deg === 270) {
        t = c.y0 - gap - (y + 0.5);
        sy = c.y0 + t;
        sx += rip * Math.sin(t / Math.max(1, 3 * c.k));
      } else if (deg === 0) {
        t = x + 0.5 - (c.x0 + c.w) - gap;
        sx = c.x0 + c.w - t;
        sy += rip * Math.sin(t / Math.max(1, 3 * c.k));
      } else {
        t = c.x0 - gap - (x + 0.5);
        sx = c.x0 + t;
        sy += rip * Math.sin(t / Math.max(1, 3 * c.k));
      }
      if (t < 0 || t > span) continue;
      sample(pm, W, H, sx, sy, o);
      const k = a0 * (1 - t / span);
      o[0] *= k;
      o[1] *= k;
      o[2] *= k;
      o[3] *= k;
      put(data, (y * W + x) * 4, o);
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

const FX: Record<string, Fx> = { melt, drape, twirl, bulge, wave, arc, glitch, pixelate, rgbSplit, halftone, duotone, longShadow, offsetShadow, outline: outlineFx, reflection, glitter, echo };

/** Runs the element's effect on its picture (in place). */
export function runEffect(img: ImageData, e: ElementEffect, box: { x0: number; y0: number; w: number; h: number; k: number }) {
  const fx = FX[e.id];
  if (!fx) return;
  fx(img, { W: img.width, H: img.height, ...box, p: effectParams(e), seed: e.seed ?? 1 });
}
