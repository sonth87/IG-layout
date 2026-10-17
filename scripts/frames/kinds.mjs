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
