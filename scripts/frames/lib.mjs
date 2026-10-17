// Frame generators (M20 C7, D-107): torn paper, film, instant photos — drawn as SVG and
// rendered with sharp. The point is to look natural: the big shape first (a tear drifts,
// changes direction, jerks; edges and corners are uneven), then the details (fibres,
// paper grain, shadows that are not even). Every frame is fully decided by its seed.

export function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
export const range = (r, a, b) => lerp(a, b, r());
export const pick = (r, list) => list[Math.floor(r() * list.length)];

/** 1-D value noise in -1..1 with a random lattice (period = `scale` units). */
export function noise1(r, scale) {
  const lattice = Array.from({ length: 512 }, () => r() * 2 - 1);
  return (x) => {
    const u = x / scale;
    const i = Math.floor(u);
    const f = smooth(u - i);
    const a = lattice[((i % 512) + 512) % 512];
    const b = lattice[(((i + 1) % 512) + 512) % 512];
    return lerp(a, b, f);
  };
}

/** Several octaves of noise (fractal), roughly -1..1. */
export function fbm(r, scale, octaves = 4) {
  const layers = Array.from({ length: octaves }, (_, i) => ({ n: noise1(r, scale / 2 ** i), a: 0.5 ** i }));
  const total = layers.reduce((s, l) => s + l.a, 0);
  return (x) => layers.reduce((s, l) => s + l.n(x) * l.a, 0) / total;
}

/**
 * Points of one edge from p0 to p1 (p1 excluded). `out` is the outward normal.
 * torn = false: a cut edge (scissors), almost straight.
 * The tear: a slow wander + a slant + a few sudden jerks + mid ripples + fine jitter.
 */
export function edge(r, p0, p1, { torn, depth = 1, step = 3 }) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const L = Math.hypot(dx, dy);
  const t = [dx / L, dy / L];
  const n = [t[1], -t[0]];
  const steps = Math.max(2, Math.round(L / step));
  const pts = [];
  if (!torn) {
    const wob = fbm(r, L * 0.6, 2);
    for (let i = 0; i < steps; i++) {
      const s = (i / steps) * L;
      const o = wob(s) * 0.8;
      pts.push([p0[0] + t[0] * s + n[0] * o, p0[1] + t[1] * s + n[1] * o]);
    }
    return pts;
  }
  const amp = depth * L;
  const wander = fbm(r, L * range(r, 0.35, 0.8), 3);
  const slant = range(r, -1, 1) * amp * 0.025;
  const ripple = fbm(r, range(r, 18, 40), 3);
  const jerks = Array.from({ length: Math.floor(range(r, 0, 3.2)) }, () => ({ at: range(r, 0.1, 0.9) * L, size: (r() < 0.5 ? -1 : 1) * range(r, 3, 12) * depth, w: range(r, 4, 22) }));
  for (let i = 0; i < steps; i++) {
    const s = (i / steps) * L;
    // Ends meet the corners: fade the offsets in and out.
    const env = Math.min(1, s / 25, (L - s) / 25);
    let o = wander(s) * amp * 0.035 + slant * (s / L - 0.5) + ripple(s) * 4.5 * depth;
    for (const j of jerks) o += j.size * smooth(Math.min(1, Math.max(0, (s - j.at) / j.w + 0.5)));
    o += (r() - 0.5) * 2.2 * depth;
    o *= env;
    // A tear is not monotonic: it can bite back a little along the edge.
    const back = (r() - 0.5) * 1.2;
    pts.push([p0[0] + t[0] * (s + back) + n[0] * o, p0[1] + t[1] * (s + back) + n[1] * o]);
  }
  return pts;
}

/** A quadrilateral that is not quite square: corners pushed around, sides uneven. */
export function looseQuad(r, w, h, x = 0, y = 0, amount = 0.035, narrow = true) {
  const j = () => (r() - 0.5) * 2 * amount;
  const quad = [
    [x + w * j(), y + h * j()],
    [x + w * (1 + j()), y + h * j()],
    [x + w * (1 + j()), y + h * (1 + j())],
    [x + w * j(), y + h * (1 + j())],
  ];
  // Sometimes the piece narrows towards one end.
  if (narrow && r() < 0.35) {
    const side = Math.floor(r() * 4);
    const k = range(r, 0.02, 0.07);
    const a = quad[side];
    const b = quad[(side + 1) % 4];
    const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    for (const p of [a, b]) {
      p[0] += (c[0] - p[0]) * k * 2;
      p[1] += (c[1] - p[1]) * k * 2;
    }
  }
  return quad;
}

/** Closed outline from a quad: each side torn or cut. `tornSides` = [top, right, bottom, left]. */
export function outline(r, quad, tornSides, depth = 1) {
  const pts = [];
  for (let i = 0; i < 4; i++) pts.push(...edge(r, quad[i], quad[(i + 1) % 4], { torn: tornSides[i], depth }));
  return pts;
}

/** Signed area > 0 = counter-clockwise in screen coords (y down → appears clockwise). */
function area(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** Outward normals (unit) of a closed outline, smoothed over a few neighbours. */
export function normals(pts, k = 3) {
  const sign = area(pts) > 0 ? 1 : -1;
  const N = pts.length;
  return pts.map((_, i) => {
    const a = pts[(i - k + N) % N];
    const b = pts[(i + k) % N];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    return [(ty / l) * sign, (-tx / l) * sign];
  });
}

/**
 * The white paper core showing along a tear: an outer outline at a width that changes
 * along the edge (wide here, almost nothing there), with fibre spikes. Only where
 * `mask(i)` is true (torn parts); cut parts get a hairline.
 */
export function fibreRim(r, pts, { width = 6, dir = 1, torn = () => true }) {
  const nn = normals(pts);
  const N = pts.length;
  const wide = fbm(r, range(r, 40, 110), 3);
  const fine = fbm(r, 7, 2);
  // Tufts: soft bumps a few points wide where fibres pull out further.
  const tuft = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    if (!torn(i) || r() > 0.025) continue;
    const size = range(r, 0.6, 1.6) * width * 0.5;
    const span = Math.floor(range(r, 2, 6));
    for (let k = -span; k <= span; k++) tuft[(i + k + N) % N] += size * (1 - Math.abs(k) / (span + 1)) ** 2;
  }
  const widthAt = pts.map((_, i) => (torn(i) ? width * Math.max(0.1, 0.85 + wide(i * 3) * 1.2) + Math.max(0, fine(i * 3)) * width * 0.5 + tuft[i] : 0.6));
  const at = (i, extra) => [pts[i][0] + nn[i][0] * (widthAt[i] + extra) * dir, pts[i][1] + nn[i][1] * (widthAt[i] + extra) * dir];
  const out = pts.map((_, i) => at(i, 0));
  // A thin, half-transparent fuzz beyond the rim: torn paper has no hard outer line.
  const fuzzN = fbm(r, 3, 2);
  const fuzz = pts.map((_, i) => at(i, torn(i) ? Math.max(0, 0.8 + fuzzN(i * 5) * 1.6) * (width / 6) : 0));
  // Hairs: a few short, thin, curved strands.
  const hairs = [];
  pts.forEach((p, i) => {
    if (!torn(i) || r() > 0.02) return;
    const o = out[i];
    const len = range(r, 1.5, 4.5) * (width / 6);
    const a = Math.atan2(nn[i][1] * dir, nn[i][0] * dir) + range(r, -1.1, 1.1);
    const bend = range(r, -0.8, 0.8);
    const e = [o[0] + Math.cos(a) * len, o[1] + Math.sin(a) * len];
    const c = [o[0] + Math.cos(a + bend) * len * 0.6, o[1] + Math.sin(a + bend) * len * 0.6];
    hairs.push([o, c, e]);
  });
  return { out, fuzz, hairs };
}

/** SVG path of the hairs. */
export const hairPath = (hairs) => hairs.map(([a, c, e]) => `M${a[0].toFixed(1)},${a[1].toFixed(1)}Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${e[0].toFixed(1)},${e[1].toFixed(1)}`).join("");

export const d = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}Z`;

export function bbox(pts) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Paper grain as an SVG filter (fractal noise blended into the fill). */
export function grain(id, { freq = 0.9, strength = 0.12, seed = 1, warm = false } = {}) {
  const tint = warm ? "0.35 0.3 0.2" : "0.3 0.3 0.3";
  const [tr, tg, tb] = tint.split(" ");
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 ${tr}  0 0 0 0 ${tg}  0 0 0 0 ${tb}  0 0 0 ${strength * 4} -${strength * 1.6}" result="g"/>
    <feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge>
  </filter>`;
}

/** Window points normalised to their own box, and the box normalised to the art. */
export function windowOf(pts, W, H) {
  const b = bbox(pts);
  const points = pts.flatMap((p) => [+((p[0] - b.x) / b.w).toFixed(4), +((p[1] - b.y) / b.h).toFixed(4)]);
  return { x: +(b.x / W).toFixed(4), y: +(b.y / H).toFixed(4), w: +(b.w / W).toFixed(4), h: +(b.h / H).toFixed(4), points };
}
