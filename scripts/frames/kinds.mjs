// The four frame generators (M20 C7). Each takes a seed and returns { svg, width, height,
// windows, info }: the art (transparent where the photos show) and its windows.
import { bbox, d, edge, fbm, fibreRim, grain, hairPath, looseQuad, normals, pick, range, rng, windowOf } from "./lib.mjs";

const RATIOS = [4 / 5, 1, 3 / 4, 5 / 4, 2 / 3, 3 / 2];

/** Outline of a quad with a torn / cut flag per point. */
function flaggedOutline(r, quad, tornSides, depth) {
  const pts = [];
  const flags = [];
  for (let i = 0; i < 4; i++) {
    const e = edge(r, quad[i], quad[(i + 1) % 4], { torn: tornSides[i], depth });
    pts.push(...e);
    flags.push(...e.map(() => tornSides[i]));
  }
  return { pts, flags };
}

function sides(r, p, atLeast = 2) {
  const s = [0, 1, 2, 3].map(() => r() < p);
  while (s.filter(Boolean).length < atLeast) s[Math.floor(r() * 4)] = true;
  return s;
}

/** A drop shadow that never falls inside `shape` (the art lies above the photo). */
function shadow(id, shape, { dx, dy, blur, opacity }, W, H) {
  return `<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><path d="${shape}" fill="#000"/></mask>
  <filter id="${id}b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${blur}"/></filter>
  <g mask="url(#${id}m)"><path d="${shape}" transform="translate(${dx} ${dy})" fill="#000" opacity="${opacity}" filter="url(#${id}b)"/></g>`;
}

/** A photo printed on paper, torn out: the photo is the whole piece, white core along the tears. */
export function tornPhoto(seed) {
  const r = rng(seed);
  const ratio = pick(r, RATIOS);
  const long = 1100;
  const w = ratio >= 1 ? long : long * ratio;
  const h = ratio >= 1 ? long / ratio : long;
  const pad = 70;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const quad = looseQuad(r, w, h, pad, pad, range(r, 0.012, 0.04));
  const torn = sides(r, 0.75);
  const depth = range(r, 0.7, 1.5);
  const { pts, flags } = flaggedOutline(r, quad, torn, depth);
  const core = pick(r, ["#fbfaf6", "#f7f3ea", "#fffdf9", "#f3efe6"]);
  const rim = fibreRim(r, pts, { width: range(r, 5, 12), torn: (i) => flags[i] });
  const outer = d(rim.out);
  const inner = d(pts);
  const sh = { dx: range(r, 1, 5), dy: range(r, 3, 8), blur: range(r, 4, 9), opacity: range(r, 0.22, 0.4) };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 2.2, strength: 0.035, seed })}</defs>
  ${shadow("s", outer, sh, W, H)}
  <path d="${d(rim.fuzz)}${inner}" fill-rule="evenodd" fill="${core}" opacity="0.45"/>
  <path d="${outer}${inner}" fill-rule="evenodd" fill="${core}" filter="url(#g)"/>
  <path d="${hairPath(rim.hairs)}" fill="none" stroke="${core}" stroke-width="0.6" stroke-linecap="round" opacity="0.55"/>
  <path d="${inner}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="0.9"/>
</svg>`;
  return { svg, width: W, height: H, windows: [windowOf(pts, W, H)], info: { ratio, torn } };
}

const PAPERS = [
  ["kraft", "#c49b6c", true],
  ["white", "#f4f1ea", false],
  ["cream", "#efe5cf", true],
  ["pink", "#f1d3cf", false],
  ["blue", "#cddaea", false],
  ["mint", "#d2e5d4", false],
  ["black", "#232221", false],
  ["newsprint", "#e6e1d6", true],
  ["yellow", "#f3e3a6", false],
];

/** A sheet of paper with a hole torn in it: the photo shows through the hole. */
export function tornPaper(seed) {
  const r = rng(seed);
  const ratio = pick(r, RATIOS);
  const long = 1150;
  const w = ratio >= 1 ? long : long * ratio;
  const h = ratio >= 1 ? long / ratio : long;
  const pad = 60;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const [paperName, paper, warm] = pick(r, PAPERS);
  const quad = looseQuad(r, w, h, pad, pad, range(r, 0.01, 0.03));
  const outerTorn = sides(r, 0.45, 1);
  const o = flaggedOutline(r, quad, outerTorn, range(r, 0.6, 1.2));
  // The hole: margins differ per side; the tear is deeper than the outside.
  const m = [range(r, 0.08, 0.17), range(r, 0.07, 0.15), range(r, 0.1, 0.22), range(r, 0.07, 0.15)];
  const hq = looseQuad(r, w * (1 - m[1] - m[3]), h * (1 - m[0] - m[2]), pad + w * m[3], pad + h * m[0], range(r, 0.02, 0.06));
  const hole = flaggedOutline(r, hq, [true, true, true, true], range(r, 0.9, 1.6));
  const coreColor = paperName === "black" ? "#d9d6cf" : "#fbfaf6";
  const holeRim = fibreRim(r, hole.pts, { width: range(r, 6, 13), torn: () => true });
  const outRim = fibreRim(r, o.pts, { width: range(r, 3, 7), torn: (i) => o.flags[i] });
  const outer = d(outRim.out);
  const sh = { dx: range(r, 1, 4), dy: range(r, 3, 7), blur: range(r, 4, 8), opacity: range(r, 0.2, 0.34) };
  const holeD = d(hole.pts);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 0.85, strength: paperName === "kraft" ? 0.2 : 0.12, seed, warm })}${grain("gc", { freq: 2.2, strength: 0.035, seed: seed + 1 })}
    <clipPath id="hole"><path d="${holeD}"/></clipPath>
    <filter id="ib" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${range(r, 4, 8).toFixed(1)}"/></filter></defs>
  ${shadow("s", outer, sh, W, H)}
  <path d="${d(outRim.fuzz)}${d(o.pts)}" fill-rule="evenodd" fill="${coreColor}" opacity="0.45"/>
  <path d="${outer}${d(o.pts)}" fill-rule="evenodd" fill="${coreColor}" filter="url(#gc)"/>
  <path d="${d(o.pts)}${d(holeRim.out)}" fill-rule="evenodd" fill="${paper}" filter="url(#g)"/>
  <path d="${d(holeRim.out)}${holeD}" fill-rule="evenodd" fill="${coreColor}" filter="url(#gc)"/>
  <path d="${d(holeRim.fuzz)}${d(holeRim.out)}" fill-rule="evenodd" fill="${coreColor}" opacity="0.4"/>
  <g clip-path="url(#hole)"><path d="${holeD}" transform="translate(${range(r, 1, 4).toFixed(1)} ${range(r, 2, 6).toFixed(1)})" fill="none" stroke="#000" stroke-opacity="${range(r, 0.25, 0.45).toFixed(2)}" stroke-width="${range(r, 8, 16).toFixed(1)}" filter="url(#ib)"/></g>
  <path d="${holeD}" fill="none" stroke="#000" stroke-opacity="0.14" stroke-width="0.9"/>
</svg>`;
  return { svg, width: W, height: H, windows: [windowOf(hole.pts, W, H)], info: { ratio, paper: paperName } };
}

const FILMS = [
  ["black", "#141311", "#d8a23e"],
  ["brown", "#2c2017", "#e0a54a"],
  ["amber", "#9a4f1d", "#3b1d0b"],
  ["grey", "#2b2b2b", "#cfcfcf"],
];

/** A film strip: 1–4 frames, sprocket holes, edge print, sometimes a light leak. */
export function film(seed) {
  const r = rng(seed);
  const n = pick(r, [1, 2, 3, 3, 4]);
  const vertical = r() < 0.4;
  const fr = pick(r, [1.5, 1.5, 1.33, 1]);
  const fw = 520;
  const fh = fw / fr;
  const gap = fw * range(r, 0.06, 0.09);
  // 35 mm film: the strip is the same width whatever the frame; sizes from a 24 mm frame height.
  const u = fw / 1.5;
  const band = u * range(r, 0.21, 0.25);
  const len = n * fw + (n + 1) * gap;
  const thick = Math.max(fh, u) + band * 2;
  const [filmName, body, ink] = pick(r, FILMS);
  // Built horizontal, turned for vertical strips.
  const holes = [];
  const pitch = u * range(r, 0.19, 0.205);
  const hw = u * 0.083;
  const hh = u * 0.116;
  for (const y of [band * 0.5, thick - band * 0.5])
    for (let x = pitch * 0.6; x < len - hw; x += pitch) {
      const jx = (r() - 0.5) * 0.8;
      const jy = (r() - 0.5) * 0.8;
      holes.push(`<rect x="${(x + jx).toFixed(1)}" y="${(y - hh / 2 + jy).toFixed(1)}" width="${hw.toFixed(1)}" height="${(hh * range(r, 0.97, 1.03)).toFixed(1)}" rx="${(hw * 0.22).toFixed(1)}"/>`);
    }
  const frames = [];
  for (let i = 0; i < n; i++) {
    const x = gap + i * (fw + gap) + (r() - 0.5) * 1.5;
    const y = (thick - fh) / 2 + (r() - 0.5) * 1.5;
    frames.push({ x, y, w: fw + (r() - 0.5) * 2, h: fh + (r() - 0.5) * 2 });
  }
  const label = pick(r, ["FILM 400", "SAFETY FILM", "COLOR 200", "B&amp;W 400", "PHOTO 100"]);
  const num0 = Math.floor(range(r, 1, 30));
  const prints = frames
    .map((f, i) => {
      const op = range(r, 0.45, 0.9).toFixed(2);
      const t1 = `<text x="${(f.x + f.w * 0.06).toFixed(1)}" y="${(thick - band * 0.08).toFixed(1)}" font-family="monospace" font-size="${(band * 0.2).toFixed(1)}" fill="${ink}" opacity="${op}">▶ ${num0 + i}  ${num0 + i}A</text>`;
      const t2 = i % 2 === 0 ? `<text x="${(f.x + f.w * 0.55).toFixed(1)}" y="${(band * 0.24).toFixed(1)}" font-family="monospace" font-size="${(band * 0.18).toFixed(1)}" letter-spacing="2" fill="${ink}" opacity="${(+op * 0.8).toFixed(2)}">${label}</text>` : "";
      return t1 + t2;
    })
    .join("");
  const leak = r() < 0.45;
  const lx = range(r, 0, len);
  const frameRects = frames.map((f) => `M${f.x.toFixed(1)},${f.y.toFixed(1)}h${f.w.toFixed(1)}v${f.h.toFixed(1)}h${(-f.w).toFixed(1)}Z`).join("");
  const W = Math.round(vertical ? thick : len);
  const H = Math.round(vertical ? len : thick);
  const turn = vertical ? `transform="translate(${thick} 0) rotate(90)"` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 1.4, strength: 0.1, seed })}
    <mask id="holes" maskUnits="userSpaceOnUse" x="0" y="0" width="${len}" height="${thick}"><rect width="${len}" height="${thick}" fill="#fff"/><g fill="#000">${holes.join("")}</g><path d="${frameRects}" fill="#000"/></mask>
    <radialGradient id="leak" cx="${(lx / len).toFixed(2)}" cy="${r() < 0.5 ? 0 : 1}" r="0.5"><stop offset="0" stop-color="#ff7a2a" stop-opacity="0.75"/><stop offset="0.5" stop-color="#ff3d1f" stop-opacity="0.25"/><stop offset="1" stop-color="#ff3d1f" stop-opacity="0"/></radialGradient></defs>
  <g ${turn}>
    <rect width="${len}" height="${thick}" rx="${(band * 0.08).toFixed(1)}" fill="${body}" mask="url(#holes)" filter="url(#g)"/>
    ${prints}
    ${leak ? `<rect width="${len}" height="${thick}" fill="url(#leak)" mask="url(#holes)"/>` : ""}
  </g>
</svg>`;
  const windows = frames.map((f) => {
    const b = vertical ? { x: thick - f.y - f.h, y: f.x, w: f.h, h: f.w } : { x: f.x, y: f.y, w: f.w, h: f.h };
    return { x: +(b.x / W).toFixed(4), y: +(b.y / H).toFixed(4), w: +(b.w / W).toFixed(4), h: +(b.h / H).toFixed(4) };
  });
  return { svg, width: W, height: H, windows, info: { n, vertical, film: filmName, leak } };
}

const BORDERS = [
  ["white", "#f7f5f0"],
  ["cream", "#f1ead9"],
  ["black", "#1d1c1b"],
  ["pink", "#f2d6d6"],
  ["blue", "#d5e2ee"],
  ["sage", "#d9e2cf"],
];
const TAPES = ["#f2d39b", "#cfe2ef", "#f0c3cc", "#e7e4da", "#d6e8c8", "#f6e58f"];

/** An instant photo: thick bottom, slightly uneven, aged a little; sometimes taped. */
export function polaroid(seed) {
  const r = rng(seed);
  const kind = pick(r, ["square", "square", "portrait", "wide"]);
  const pw = kind === "wide" ? 980 : 760;
  const ph = kind === "square" ? pw : kind === "portrait" ? pw * 1.25 : pw * 0.72;
  const side = pw * range(r, 0.055, 0.075);
  const top = side * range(r, 0.95, 1.15);
  // Real instant prints: the bottom is about 0.28–0.38 of the picture width.
  const bottom = pw * range(r, 0.27, 0.36);
  const w = pw + side * 2;
  const h = ph + top + bottom;
  const pad = 70;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const [borderName, border] = pick(r, BORDERS);
  const quad = looseQuad(r, w, h, pad, pad, 0.003, false);
  const card = d([...quad]);
  const wx = pad + side + (r() - 0.5) * 3;
  const wy = pad + top + (r() - 0.5) * 3;
  const win = `M${wx.toFixed(1)},${wy.toFixed(1)}h${pw}v${ph}h${-pw}Z`;
  const age = range(r, 0.06, 0.22);
  const tape = r() < 0.55;
  let tapeSvg = "";
  if (tape) {
    const tw = w * range(r, 0.28, 0.42);
    const th = w * range(r, 0.075, 0.1);
    const cx = pad + w * range(r, 0.3, 0.7);
    const cy = pad + range(r, -0.3, 0.4) * th;
    const rot = range(r, -9, 9);
    const zig = (x0, dir) => {
      const pts = [];
      const steps = 9;
      for (let i = 0; i <= steps; i++) pts.push([x0 + (i % 2 ? dir * range(r, 1.5, 4) : 0), -th / 2 + (th * i) / steps]);
      return pts;
    };
    const left = zig(-tw / 2, -1);
    const right = zig(tw / 2, 1).reverse();
    const pts = [...left, ...right];
    tapeSvg = `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(1)})"><path d="${d(pts)}" fill="${pick(r, TAPES)}" fill-opacity="${range(r, 0.72, 0.86).toFixed(2)}" filter="url(#gt)"/></g>`;
  }
  const sh = { dx: range(r, 1, 4), dy: range(r, 4, 9), blur: range(r, 5, 10), opacity: range(r, 0.2, 0.32) };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 1, strength: 0.07, seed, warm: true })}${grain("gt", { freq: 0.7, strength: 0.1, seed: seed + 2 })}
    <radialGradient id="age" cx="${range(r, 0.2, 0.8).toFixed(2)}" cy="${range(r, 0.6, 1).toFixed(2)}" r="0.9"><stop offset="0" stop-color="#c9a65a" stop-opacity="0"/><stop offset="1" stop-color="#b58b3f" stop-opacity="${age.toFixed(2)}"/></radialGradient>
    <clipPath id="win"><path d="${win}"/></clipPath>
    <filter id="ib" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3"/></filter></defs>
  ${shadow("s", card, sh, W, H)}
  <path d="${card}${win}" fill-rule="evenodd" fill="${border}" filter="url(#g)"/>
  <path d="${card}${win}" fill-rule="evenodd" fill="url(#age)"/>
  <g clip-path="url(#win)"><path d="${win}" fill="none" stroke="#000" stroke-opacity="0.28" stroke-width="6" filter="url(#ib)"/></g>
  ${tapeSvg}
</svg>`;
  return { svg, width: W, height: H, windows: [{ x: +(wx / W).toFixed(4), y: +(wy / H).toFixed(4), w: +(pw / W).toFixed(4), h: +(ph / H).toFixed(4) }], info: { kind, border: borderName, tape } };
}

export const KINDS = { tornPhoto, tornPaper, film, polaroid };
// Unused here, kept for callers.
export { bbox, fbm, normals };

/** Rotate / scale a quad around a point. */
function transformQuad(q, cx, cy, k, deg, dx = 0, dy = 0) {
  const a = (deg * Math.PI) / 180;
  return q.map(([x, y]) => {
    const ux = (x - cx) * k;
    const uy = (y - cy) * k;
    return [cx + ux * Math.cos(a) - uy * Math.sin(a) + dx, cy + ux * Math.sin(a) + uy * Math.cos(a) + dy];
  });
}

/** A torn photo laid on a torn piece of coloured paper: both torn on the outside. */
export function tornBacked(seed) {
  const r = rng(seed);
  const ratio = pick(r, RATIOS);
  const long = 1000;
  const w = ratio >= 1 ? long : long * ratio;
  const h = ratio >= 1 ? long / ratio : long;
  const pad = 150;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const photoQuad = looseQuad(r, w, h, pad, pad, range(r, 0.012, 0.035));
  const backQuad = transformQuad(looseQuad(r, w, h, pad, pad, range(r, 0.015, 0.04)), W / 2, H / 2, range(r, 1.08, 1.2), range(r, -5, 5), range(r, -20, 20), range(r, -20, 20));
  const photo = flaggedOutline(r, photoQuad, sides(r, 0.8), range(r, 0.7, 1.4));
  const back = flaggedOutline(r, backQuad, sides(r, 0.7), range(r, 0.8, 1.5));
  const [paperName, paper] = pick(r, PAPERS);
  const core = "#fbfaf6";
  const pr = fibreRim(r, photo.pts, { width: range(r, 5, 11), torn: (i) => photo.flags[i] });
  const br = fibreRim(r, back.pts, { width: range(r, 3, 8), torn: (i) => back.flags[i] });
  const inner = d(photo.pts);
  const pOuter = d(pr.out);
  const bOuter = d(br.out);
  const sh = { dx: range(r, 1, 5), dy: range(r, 3, 8), blur: range(r, 5, 9), opacity: range(r, 0.2, 0.32) };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 0.85, strength: paperName === "kraft" ? 0.2 : 0.12, seed, warm: paperName !== "black" })}${grain("gc", { freq: 2.2, strength: 0.035, seed: seed + 1 })}
    <mask id="ph" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><path d="${inner}" fill="#000"/></mask></defs>
  ${shadow("sb", bOuter, sh, W, H)}
  <g mask="url(#ph)">
    <path d="${d(br.fuzz)}${d(back.pts)}" fill-rule="evenodd" fill="${core}" opacity="0.45"/>
    <path d="${bOuter}${d(back.pts)}" fill-rule="evenodd" fill="${core}" filter="url(#gc)"/>
    <path d="${d(back.pts)}" fill="${paper}" filter="url(#g)"/>
  </g>
  ${shadow("sp", pOuter, { ...sh, opacity: sh.opacity * 0.9, blur: sh.blur * 0.7 }, W, H)}
  <path d="${d(pr.fuzz)}${inner}" fill-rule="evenodd" fill="${core}" opacity="0.45"/>
  <path d="${pOuter}${inner}" fill-rule="evenodd" fill="${core}" filter="url(#gc)"/>
  <path d="${hairPath(pr.hairs)}" fill="none" stroke="${core}" stroke-width="0.6" stroke-linecap="round" opacity="0.55"/>
  <path d="${inner}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="0.9"/>
</svg>`;
  return { svg, width: W, height: H, windows: [windowOf(photo.pts, W, H)], info: { ratio, paper: paperName } };
}

/**
 * Several torn photos making one picture (like a story template): the splits wander and
 * slant, pieces overlap a little, the upper piece's torn edge lies over the lower photo,
 * its shadow too — and a lower piece's edge never shows over an upper photo.
 */
export function tornCollage(seed) {
  const r = rng(seed);
  const layout = pick(r, ["2v", "2h", "3v", "3h", "4", "4", "1+2"]);
  const ratio = pick(r, [4 / 5, 9 / 16, 1, 3 / 4]);
  const long = 1300;
  const w = ratio >= 1 ? long : long * ratio;
  const h = ratio >= 1 ? long / ratio : long;
  const pad = 40;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const X = (u) => pad + u * w;
  const Y = (v) => pad + v * h;
  const j = (a) => (r() - 0.5) * 2 * a;
  // Split lines as two end values (a slant), each a little off-centre.
  const cut = (at) => [at + j(0.06), at + j(0.06)];
  const pieces = [];
  if (layout === "2v" || layout === "3v") {
    const n = layout === "2v" ? 2 : 3;
    const cuts = Array.from({ length: n - 1 }, (_, i) => cut((i + 1) / n));
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? [0, 0] : cuts[i - 1];
      const b = i === n - 1 ? [1, 1] : cuts[i];
      pieces.push({ q: [[X(a[0]), Y(0)], [X(b[0]), Y(0)], [X(b[1]), Y(1)], [X(a[1]), Y(1)]], inside: [false, i < n - 1, false, i > 0] });
    }
  } else if (layout === "2h" || layout === "3h") {
    const n = layout === "2h" ? 2 : 3;
    const cuts = Array.from({ length: n - 1 }, (_, i) => cut((i + 1) / n));
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? [0, 0] : cuts[i - 1];
      const b = i === n - 1 ? [1, 1] : cuts[i];
      pieces.push({ q: [[X(0), Y(a[0])], [X(1), Y(a[1])], [X(1), Y(b[1])], [X(0), Y(b[0])]], inside: [i > 0, false, i < n - 1, false] });
    }
  } else {
    // 2 × 2 (or one on top, two below): the row split, then each row's own column split.
    const row = cut(layout === "1+2" ? 0.55 : 0.5);
    const top = layout === "1+2" ? null : cut(range(r, 0.4, 0.6));
    const bottom = cut(range(r, 0.38, 0.62));
    const at = (c, t) => c[0] + (c[1] - c[0]) * t;
    const rowAt = (u) => row[0] + (row[1] - row[0]) * u;
    if (top) {
      pieces.push({ q: [[X(0), Y(0)], [X(top[0]), Y(0)], [X(top[1]), Y(rowAt(at(top, 1)))], [X(0), Y(row[0])]], inside: [false, true, true, false] });
      pieces.push({ q: [[X(top[0]), Y(0)], [X(1), Y(0)], [X(1), Y(row[1])], [X(top[1]), Y(rowAt(at(top, 1)))]], inside: [false, false, true, true] });
    } else pieces.push({ q: [[X(0), Y(0)], [X(1), Y(0)], [X(1), Y(row[1])], [X(0), Y(row[0])]], inside: [false, false, true, false] });
    pieces.push({ q: [[X(0), Y(row[0])], [X(bottom[0]), Y(rowAt(bottom[0]))], [X(bottom[1]), Y(1)], [X(0), Y(1)]], inside: [true, true, false, false] });
    pieces.push({ q: [[X(bottom[0]), Y(rowAt(bottom[0]))], [X(1), Y(row[1])], [X(1), Y(1)], [X(bottom[1]), Y(1)]], inside: [true, false, false, true] });
  }
  // Inside edges move outwards a little so neighbours overlap; outside edges stay cut.
  const overlap = range(r, 10, 22);
  const outerTorn = r() < 0.35;
  const shaped = pieces.map((p) => {
    const cx = p.q.reduce((s, v) => s + v[0], 0) / 4;
    const cy = p.q.reduce((s, v) => s + v[1], 0) / 4;
    const q = p.q.map(([x, y], i) => {
      const prev = p.inside[(i + 3) % 4];
      const next = p.inside[i];
      const k = (prev || next ? overlap : 0) / Math.max(1, Math.hypot(x - cx, y - cy));
      const m = pad * 0.6;
      return [Math.min(W - m, Math.max(m, x + (x - cx) * k * (prev || next ? 1 : 0))), Math.min(H - m, Math.max(m, y + (y - cy) * k * (prev || next ? 1 : 0)))];
    });
    const torn = p.inside.map((ins) => ins || (outerTorn && r() < 0.6));
    const o = flaggedOutline(r, q, torn, range(r, 0.8, 1.5));
    const rim = fibreRim(r, o.pts, { width: range(r, 5, 11), torn: (i) => o.flags[i] });
    return { ...o, rim };
  });
  // Stacking: a random order; windows follow it (lower first).
  const order = shaped.map((_, i) => i).sort(() => r() - 0.5);
  const stack = order.map((i) => shaped[i]);
  const core = "#fbfaf6";
  const sh = { dx: range(r, 1, 4), dy: range(r, 3, 7), blur: range(r, 4, 8), opacity: range(r, 0.22, 0.36) };
  let body = "";
  stack.forEach((p, i) => {
    const above = stack.slice(i + 1).map((q) => d(q.pts)).join("");
    const outer = d(p.rim.out);
    body += `<mask id="m${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><path d="${above}" fill="#000"/></mask>
    <mask id="s${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><path d="${above}${outer}" fill="#000"/></mask>
    <g mask="url(#s${i})"><path d="${outer}" transform="translate(${sh.dx.toFixed(1)} ${sh.dy.toFixed(1)})" fill="#000" opacity="${sh.opacity.toFixed(2)}" filter="url(#b)"/></g>
    <g mask="url(#m${i})">
      <path d="${d(p.rim.fuzz)}${d(p.pts)}" fill-rule="evenodd" fill="${core}" opacity="0.45"/>
      <path d="${outer}${d(p.pts)}" fill-rule="evenodd" fill="${core}" filter="url(#gc)"/>
      <path d="${hairPath(p.rim.hairs)}" fill="none" stroke="${core}" stroke-width="0.6" opacity="0.55"/>
      <path d="${d(p.pts)}" fill="none" stroke="#000" stroke-opacity="0.15" stroke-width="0.9"/>
    </g>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("gc", { freq: 2.2, strength: 0.035, seed })}<filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${sh.blur.toFixed(1)}"/></filter></defs>
  ${body}
</svg>`;
  return { svg, width: W, height: H, windows: stack.map((p) => windowOf(p.pts, W, H)), info: { layout, ratio, n: stack.length } };
}

KINDS.tornBacked = tornBacked;
KINDS.tornCollage = tornCollage;

const STAMP_COLORS = ["#fbfaf6", "#f4ecd8", "#f6e0dc", "#dfe8f1", "#e3eedc", "#f7efc8"];
const STAMP_INKS = ["#b23b3b", "#2f5d8a", "#2f6b4f", "#7a4b8f", "#a0522d", "#333333"];

/** A postage stamp: perforated edge, a printed border, a value, sometimes a postmark over it. */
export function stamp(seed) {
  const r = rng(seed);
  const ratio = pick(r, [4 / 5, 5 / 6, 1, 6 / 5]);
  const w = ratio >= 1 ? 700 : 700 * ratio;
  const h = ratio >= 1 ? 700 / ratio : 700;
  const pad = 50;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const paper = pick(r, STAMP_COLORS);
  const ink = pick(r, STAMP_INKS);
  const hole = range(r, 9, 13);
  const pitch = hole * range(r, 2.5, 2.9);
  // Perforations: half-holes bitten out of every edge, slightly uneven.
  const bites = [];
  for (let x = pad + pitch / 2; x < pad + w; x += pitch) for (const y of [pad, pad + h]) bites.push([x + (r() - 0.5), y + (r() - 0.5) * 1.5, hole * range(r, 0.92, 1.06)]);
  for (let y = pad + pitch / 2; y < pad + h; y += pitch) for (const x of [pad, pad + w]) bites.push([x + (r() - 0.5) * 1.5, y + (r() - 0.5), hole * range(r, 0.92, 1.06)]);
  const margin = range(r, 0.07, 0.11) * Math.min(w, h);
  const bottom = margin * range(r, 1.6, 2.6);
  const win = { x: pad + margin, y: pad + margin, w: w - margin * 2, h: h - margin - bottom };
  const value = pick(r, ["5", "10", "20", "25", "50", "100", "1đ", "2đ", "5đ"]);
  const word = pick(r, ["POSTAGE", "POSTES", "BƯU CHÍNH", "AIR MAIL", "PAR AVION", "SOUVENIR"]);
  const mark = r() < 0.5;
  const mx = pad + w * range(r, 0.55, 0.9);
  const my = pad + h * range(r, 0.6, 0.9);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 1.2, strength: 0.07, seed, warm: true })}
    <mask id="perf" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><g fill="#000">${bites.map(([x, y, rr]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}"/>`).join("")}</g><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="#000"/></mask>
    <filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter></defs>
  <rect x="${pad + 2}" y="${pad + 5}" width="${w}" height="${h}" fill="#000" opacity="0.18" filter="url(#b)" mask="url(#perf)"/>
  <g mask="url(#perf)">
    <rect x="${pad}" y="${pad}" width="${w}" height="${h}" fill="${paper}" filter="url(#g)"/>
    <rect x="${win.x - 6}" y="${win.y - 6}" width="${win.w + 12}" height="${win.h + 12}" fill="none" stroke="${ink}" stroke-width="3" opacity="0.85"/>
    <text x="${pad + margin}" y="${(pad + h - bottom * 0.38).toFixed(1)}" font-family="Georgia, serif" font-size="${(bottom * 0.34).toFixed(1)}" letter-spacing="3" fill="${ink}">${word}</text>
    <text x="${(pad + w - margin).toFixed(1)}" y="${(pad + h - bottom * 0.3).toFixed(1)}" text-anchor="end" font-family="Georgia, serif" font-weight="bold" font-size="${(bottom * 0.55).toFixed(1)}" fill="${ink}">${value}</text>
  </g>
  ${mark ? `<g transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${range(r, -25, 25).toFixed(1)})" fill="none" stroke="#2b2b2b" stroke-opacity="${range(r, 0.35, 0.6).toFixed(2)}" stroke-width="3"><circle r="${(w * 0.17).toFixed(1)}"/><circle r="${(w * 0.13).toFixed(1)}"/>${Array.from({ length: 4 }, (_, i) => `<path d="M${(w * 0.2).toFixed(1)},${(-18 + i * 12).toFixed(1)}q${(w * 0.08).toFixed(1)},-10 ${(w * 0.16).toFixed(1)},0t${(w * 0.16).toFixed(1)},0"/>`).join("")}</g>` : ""}
</svg>`;
  return { svg, width: W, height: H, windows: [{ x: +(win.x / W).toFixed(4), y: +(win.y / H).toFixed(4), w: +(win.w / W).toFixed(4), h: +(win.h / H).toFixed(4) }], info: { ratio, mark, ink } };
}

const WOODS = [
  ["oak", "#b8874f", "#7c5530"],
  ["walnut", "#6b4a32", "#3d2a1c"],
  ["white", "#f2efe8", "#c9c3b6"],
  ["black", "#2a2826", "#111"],
  ["gold", "#d9b45a", "#8a6a22"],
  ["natural", "#d9c3a0", "#a38662"],
];

/** A picture frame: bevelled moulding with grain, sometimes a mat around the picture. */
export function pictureFrame(seed) {
  const r = rng(seed);
  const ratio = pick(r, [4 / 5, 1, 3 / 4, 5 / 4, 2 / 3]);
  const long = 1000;
  const w = ratio >= 1 ? long : long * ratio;
  const h = ratio >= 1 ? long / ratio : long;
  const pad = 50;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const [woodName, wood, dark] = pick(r, WOODS);
  const m = Math.min(w, h) * range(r, 0.06, 0.12);
  const mat = r() < 0.55 ? Math.min(w, h) * range(r, 0.06, 0.12) : 0;
  const matColor = pick(r, ["#f7f5ef", "#efe9dc", "#fbfbf9", "#e9e4da"]);
  const x0 = pad;
  const y0 = pad;
  const x1 = pad + w;
  const y1 = pad + h;
  const ix0 = x0 + m;
  const iy0 = y0 + m;
  const ix1 = x1 - m;
  const iy1 = y1 - m;
  const win = { x: ix0 + mat, y: iy0 + mat, w: ix1 - ix0 - mat * 2, h: iy1 - iy0 - mat * 2 };
  // Four mitred sides, each lit differently (light from the top left).
  const side = (pts, shade) => `<path d="${d(pts)}" fill="${wood}" filter="url(#g)"/><path d="${d(pts)}" fill="${shade > 0 ? "#fff" : "#000"}" opacity="${Math.abs(shade).toFixed(2)}"/>`;
  const gold = woodName === "gold";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="g" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${gold ? "0.9 0.9" : "0.012 0.35"}" numOctaves="3" seed="${seed}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.13  0 0 0 0 0.05  0 0 0 0.55 -0.12" result="t"/>
      <feComposite in="t" in2="SourceGraphic" operator="in" result="ti"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="ti"/></feMerge>
    </filter>
    <filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="ib" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="4"/></filter>
    <clipPath id="win"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}"/></clipPath>
    <mask id="hole" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#000"/></mask></defs>
  <rect x="${x0 + 3}" y="${y0 + 9}" width="${w}" height="${h}" fill="#000" opacity="0.3" filter="url(#b)" mask="url(#hole)"/>
  ${mat ? `<path d="M${ix0},${iy0}H${ix1}V${iy1}H${ix0}ZM${win.x},${win.y}v${win.h}h${win.w}v${-win.h}Z" fill="${matColor}"/><path d="M${win.x - 3},${win.y - 3}h${win.w + 6}v${win.h + 6}h${-win.w - 6}Z" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>` : ""}
  ${side([[x0, y0], [x1, y0], [ix1, iy0], [ix0, iy0]], 0.22)}
  ${side([[x1, y0], [x1, y1], [ix1, iy1], [ix1, iy0]], -0.12)}
  ${side([[x1, y1], [x0, y1], [ix0, iy1], [ix1, iy1]], -0.28)}
  ${side([[x0, y1], [x0, y0], [ix0, iy0], [ix0, iy1]], 0.08)}
  <path d="M${x0},${y0}H${x1}V${y1}H${x0}Z" fill="none" stroke="${dark}" stroke-width="2"/>
  <path d="M${ix0},${iy0}H${ix1}V${iy1}H${ix0}Z" fill="none" stroke="${dark}" stroke-width="2" opacity="0.8"/>
  ${gold ? `<path d="M${x0 + m * 0.35},${y0 + m * 0.35}H${x1 - m * 0.35}V${y1 - m * 0.35}H${x0 + m * 0.35}Z" fill="none" stroke="#fff3c4" stroke-opacity="0.55" stroke-width="${(m * 0.12).toFixed(1)}" stroke-dasharray="${(m * 0.18).toFixed(1)} ${(m * 0.1).toFixed(1)}"/>` : ""}
  <g clip-path="url(#win)"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="10" filter="url(#ib)"/></g>
</svg>`;
  return { svg, width: W, height: H, windows: [{ x: +(win.x / W).toFixed(4), y: +(win.y / H).toFixed(4), w: +(win.w / W).toFixed(4), h: +(win.h / H).toFixed(4) }], info: { ratio, wood: woodName, mat: !!mat } };
}

/** A photo held on an album page by four paper corners. */
export function photoCorners(seed) {
  const r = rng(seed);
  const ratio = pick(r, RATIOS);
  const long = 1000;
  const w = ratio >= 1 ? long : long * ratio;
  const h = ratio >= 1 ? long / ratio : long;
  const pad = 40;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const page = pick(r, [["kraft", "#c49b6c"], ["black", "#232221"], ["cream", "#efe5cf"], ["white", "#f6f4ee"], ["sage", "#cdd8c3"]]);
  const cornerColor = pick(r, ["#1d1c1b", "#f7f5ef", "#c9a24b", "#8c2f2f", "#33415c"]);
  const border = Math.min(w, h) * range(r, 0.09, 0.14);
  const photo = { x: pad + border, y: pad + border, w: w - border * 2, h: h - border * 2 };
  const rot = range(r, -2.5, 2.5);
  const cs = Math.min(photo.w, photo.h) * range(r, 0.11, 0.15);
  const corner = (x, y, sx, sy) => `<path d="M${x},${y}l${sx * cs},0l${-sx * cs},${sy * cs}Z" transform="translate(${(-sx * 3).toFixed(1)} ${(-sy * 3).toFixed(1)})" fill="${cornerColor}"/><path d="M${x + (sx * cs) / 2},${y}L${x},${y + (sy * cs) / 2}" stroke="#000" stroke-opacity="0.15" stroke-width="2"/>`;
  const cx = pad + w / 2;
  const cy = pad + h / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 0.85, strength: page[0] === "kraft" ? 0.2 : 0.1, seed, warm: true })}
    <filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <g transform="rotate(${rot.toFixed(2)} ${cx} ${cy})">
    <path d="M${pad},${pad}h${w}v${h}h${-w}ZM${photo.x},${photo.y}v${photo.h}h${photo.w}v${-photo.h}Z" fill-rule="evenodd" fill="${page[1]}" filter="url(#g)"/>
    <path d="M${photo.x + 2},${photo.y + photo.h}h${photo.w}v${-photo.h + 4}" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="4" filter="url(#b)"/>
    ${corner(photo.x, photo.y, 1, 1)}${corner(photo.x + photo.w, photo.y, -1, 1)}${corner(photo.x + photo.w, photo.y + photo.h, -1, -1)}${corner(photo.x, photo.y + photo.h, 1, -1)}
  </g>
</svg>`;
  // The window turns with the page.
  return { svg, width: W, height: H, windows: [{ x: +(photo.x / W).toFixed(4), y: +(photo.y / H).toFixed(4), w: +(photo.w / W).toFixed(4), h: +(photo.h / H).toFixed(4), rotation: +rot.toFixed(2) }], info: { ratio, page: page[0] } };
}

const ENVELOPES = [["kraft", "#c8a374"], ["white", "#f4f1ea"], ["pink", "#efcfd0"], ["blue", "#cdd9e8"], ["sage", "#d3dec8"], ["red", "#b8443e"]];

/** An open envelope with the photo sliding out of it. */
export function envelope(seed) {
  const r = rng(seed);
  const ew = 1000;
  const eh = ew * range(r, 0.58, 0.66);
  const photoW = ew * range(r, 0.78, 0.86);
  const photoH = photoW * pick(r, [0.75, 1, 1.2]);
  const out = photoH * range(r, 0.55, 0.75);
  const pad = 60;
  const W = Math.round(ew + pad * 2);
  const H = Math.round(eh + out + pad * 2);
  const top = pad + out;
  const [name, color] = pick(r, ENVELOPES);
  const px = pad + (ew - photoW) / 2 + range(r, -15, 15);
  const py = top - out;
  // Front pocket: the two side flaps and the bottom flap over the photo.
  const pocket = `M${pad},${top + eh * 0.12}L${pad + ew * 0.5},${top + eh * 0.62}L${pad + ew},${top + eh * 0.12}V${top + eh}H${pad}Z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 0.9, strength: name === "kraft" ? 0.18 : 0.09, seed, warm: true })}
    <filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
    <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect x="${px}" y="${py}" width="${photoW}" height="${photoH}" fill="#000"/></mask></defs>
  <g mask="url(#m)">
    <rect x="${pad + 3}" y="${top + 8}" width="${ew}" height="${eh}" fill="#000" opacity="0.25" filter="url(#b)"/>
    <rect x="${pad}" y="${top}" width="${ew}" height="${eh}" fill="${color}" filter="url(#g)"/>
    <path d="M${pad},${top}L${pad + ew * 0.5},${top - eh * 0.45}L${pad + ew},${top}Z" fill="${color}" filter="url(#g)"/>
    <path d="M${pad},${top}L${pad + ew * 0.5},${top - eh * 0.45}L${pad + ew},${top}" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>
  </g>
  <path d="${pocket}" transform="translate(0 -4)" fill="#000" opacity="0.18" filter="url(#b)"/>
  <path d="${pocket}" fill="${color}" filter="url(#g)"/>
  <path d="M${pad},${top + eh * 0.12}L${pad + ew * 0.5},${top + eh * 0.62}L${pad + ew},${top + eh * 0.12}" fill="none" stroke="#000" stroke-opacity="0.15" stroke-width="2"/>
  <path d="M${pad},${top + eh}L${pad + ew * 0.5},${top + eh * 0.62}L${pad + ew},${top + eh}" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="2"/>
</svg>`;
  return { svg, width: W, height: H, windows: [{ x: +(px / W).toFixed(4), y: +(py / H).toFixed(4), w: +(photoW / W).toFixed(4), h: +(photoH / H).toFixed(4) }], info: { color: name } };
}

KINDS.stamp = stamp;
KINDS.pictureFrame = pictureFrame;
KINDS.photoCorners = photoCorners;
KINDS.envelope = envelope;

/** Corners of a piece of paper as torn by hand: never square (D-107, owner 2026-10-18). */
function pieceShape(r, w, h, pad) {
  const shape = pick(r, ["quad", "quad", "trapezoid", "skew", "poly", "poly", "round", "corner", "strip"]);
  const cx = pad + w / 2;
  const cy = pad + h / 2;
  const jit = (a) => (r() - 0.5) * 2 * a;
  if (shape === "poly" || shape === "round") {
    const n = shape === "round" ? Math.round(range(r, 9, 13)) : Math.round(range(r, 5, 8));
    const start = r() * Math.PI * 2;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = start + (i / n) * Math.PI * 2 + jit((Math.PI / n) * (shape === "round" ? 0.2 : 0.55));
      const k = shape === "round" ? range(r, 0.93, 1) : range(r, 0.72, 1);
      return [cx + Math.cos(a) * (w / 2) * k, cy + Math.sin(a) * (h / 2) * k];
    });
    // Clockwise on screen (like the quads) so edge normals point out.
    return { shape, corners: pts };
  }
  const x0 = pad;
  const y0 = pad;
  const x1 = pad + w;
  const y1 = pad + h;
  if (shape === "trapezoid") {
    const inset = range(r, 0.08, 0.2) * w;
    const top = r() < 0.5;
    return { shape, corners: top ? [[x0 + inset + jit(10), y0 + jit(12)], [x1 - inset * range(r, 0.4, 1.3), y0 + jit(12)], [x1 + jit(10), y1 + jit(12)], [x0 + jit(10), y1 + jit(12)]] : [[x0 + jit(10), y0 + jit(12)], [x1 + jit(10), y0 + jit(12)], [x1 - inset * range(r, 0.4, 1.3), y1 + jit(12)], [x0 + inset, y1 + jit(12)]] };
  }
  if (shape === "skew") {
    const sk = range(r, 0.05, 0.14) * w * (r() < 0.5 ? -1 : 1);
    return { shape, corners: [[x0 + Math.max(0, sk) + jit(8), y0 + jit(20)], [x1 + Math.min(0, sk) + jit(8), y0 + jit(30)], [x1 - Math.max(0, sk) + jit(8), y1 + jit(20)], [x0 - Math.min(0, sk) + jit(8), y1 + jit(30)]] };
  }
  if (shape === "corner") {
    // A corner torn off along a slant: five corners.
    const a = range(r, 0.2, 0.45);
    const b = range(r, 0.2, 0.45);
    const which = Math.floor(r() * 4);
    const c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => [x + jit(14), y + jit(14)]);
    const prev = c[(which + 3) % 4];
    const cur = c[which];
    const next = c[(which + 1) % 4];
    const p1 = [cur[0] + (prev[0] - cur[0]) * a, cur[1] + (prev[1] - cur[1]) * a];
    const p2 = [cur[0] + (next[0] - cur[0]) * b, cur[1] + (next[1] - cur[1]) * b];
    const out = [];
    for (let i = 0; i < 4; i++) {
      if (i === which) out.push(p1, p2);
      else out.push(c[i]);
    }
    return { shape, corners: out, diagonal: which };
  }
  if (shape === "strip") {
    const thin = range(r, 0.3, 0.45);
    const horizontal = w >= h;
    const corners = horizontal
      ? [[x0 + jit(15), cy - (h * thin) / 2 + jit(20)], [x1 + jit(15), cy - (h * thin) / 2 + jit(30)], [x1 + jit(15), cy + (h * thin) / 2 + jit(30)], [x0 + jit(15), cy + (h * thin) / 2 + jit(20)]]
      : [[cx - (w * thin) / 2 + jit(20), y0 + jit(15)], [cx + (w * thin) / 2 + jit(30), y0 + jit(15)], [cx + (w * thin) / 2 + jit(30), y1 + jit(15)], [cx - (w * thin) / 2 + jit(20), y1 + jit(15)]];
    return { shape, corners };
  }
  // A quad with uneven sides: corners pushed hard, one side often shorter.
  return { shape, corners: looseQuad(r, w, h, pad, pad, range(r, 0.04, 0.09)) };
}

/**
 * A piece of a torn photo (owner, 2026-10-18): the photo shows to the very edge; the
 * edge is the torn paper — white core, fibres, uneven. Any number of sides torn (1 to
 * all), any shape (uneven quad, trapezoid, slanted, 5–8 sides, round, corner torn off,
 * strip); tears scoop in here and there and the core shows wide in places.
 */
export function tornPiece(seed) {
  const r = rng(seed);
  const ratio = pick(r, RATIOS);
  const long = 1050;
  const w = ratio >= 1 ? long : long * ratio;
  const h = ratio >= 1 ? long / ratio : long;
  const pad = 80;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const { shape, corners, diagonal } = pieceShape(r, w, h, pad);
  const n = corners.length;
  // How many sides are torn: anything from one to all (round pieces: all).
  let torn;
  if (shape === "round") torn = corners.map(() => true);
  else {
    const k = Math.max(1, Math.min(n, Math.round(range(r, 0.6, n + 0.49))));
    const order = corners.map((_, i) => i).sort(() => r() - 0.5);
    torn = corners.map((_, i) => order.indexOf(i) < k);
    if (diagonal !== undefined) torn[diagonal] = true; // the slanted corner is always a tear
  }
  const depth = range(r, 0.7, 1.6);
  const pts = [];
  const flags = [];
  for (let i = 0; i < n; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % n];
    const e = edge(r, a, b, { torn: torn[i], depth, bites: torn[i] && r() < 0.45 ? Math.round(range(r, 1, 2.4)) : 0 });
    pts.push(...e);
    flags.push(...e.map(() => torn[i]));
  }
  const core = pick(r, ["#fbfaf6", "#f7f3ea", "#fffdf9", "#f3efe6"]);
  const rim = fibreRim(r, pts, { width: range(r, 5, 12), torn: (i) => flags[i], peel: Math.round(range(r, 0, 3.4)) });
  const outer = d(rim.out);
  const inner = d(pts);
  const sh = { dx: range(r, 1, 5), dy: range(r, 3, 8), blur: range(r, 4, 9), opacity: range(r, 0.22, 0.38) };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 2.2, strength: 0.035, seed })}</defs>
  ${shadow("s", outer, sh, W, H)}
  <path d="${d(rim.fuzz)}${inner}" fill-rule="evenodd" fill="${core}" opacity="0.45"/>
  <path d="${outer}${inner}" fill-rule="evenodd" fill="${core}" filter="url(#g)"/>
  <path d="${hairPath(rim.hairs)}" fill="none" stroke="${core}" stroke-width="0.6" stroke-linecap="round" opacity="0.55"/>
  <path d="${inner}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="0.9"/>
</svg>`;
  return { svg, width: W, height: H, windows: [windowOf(pts, W, H)], info: { ratio, shape, torn: torn.filter(Boolean).length, sides: n } };
}

KINDS.tornPiece = tornPiece;
