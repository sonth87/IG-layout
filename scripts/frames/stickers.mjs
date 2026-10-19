// Generated stickers (M20): washi tape, sticky notes, torn notebook scraps — same idea as
// the frames (D-107): uneven, a little worn, never perfectly straight.
import { d, edge, fibreRim, grain, hairPath, looseQuad, pick, range, rng } from "./lib.mjs";

const TAPE_COLORS = ["#f2c6a0", "#a9c7d8", "#f0b9c4", "#c9dfb0", "#f4e08c", "#d7c8ec", "#f5d2b8", "#bfe0dc", "#e8e3d6", "#f7b0a0", "#9fb8d9", "#e4c79a"];
const INKS = ["#ffffff", "#5b4636", "#c0392b", "#2c5d8f", "#f2f2f2", "#7a5c99", "#d98c8c", "#3d7a5a"];

/** The two torn ends of a tape: small irregular teeth. */
function tornEnd(r, x, h, dir) {
  const pts = [];
  const teeth = Math.round(range(r, 7, 13));
  for (let i = 0; i <= teeth; i++) {
    const y = (h * i) / teeth + (i > 0 && i < teeth ? (r() - 0.5) * (h / teeth) * 0.5 : 0);
    pts.push([x + dir * (i % 2 ? range(r, 3, 9) : range(r, 0, 2.5)), y]);
  }
  return pts;
}

function pattern(r, id, w, h, base) {
  const ink = pick(r, INKS);
  const kind = pick(r, ["solid", "stripes", "dots", "grid", "gingham", "diagonal", "dash", "waves", "hearts", "stars"]);
  const s = range(r, 14, 26);
  const op = range(r, 0.45, 0.8).toFixed(2);
  let body = "";
  if (kind === "stripes") for (let x = 0; x < w + s; x += s * 2) body += `<rect x="${x}" y="0" width="${s}" height="${h}" fill="${ink}" opacity="${op}"/>`;
  if (kind === "diagonal") for (let x = -h; x < w + h; x += s * 1.6) body += `<path d="M${x},${h}L${x + h},0" stroke="${ink}" stroke-width="${(s * 0.45).toFixed(1)}" opacity="${op}"/>`;
  if (kind === "dots") for (let x = s / 2; x < w; x += s * 1.3) for (let y = s / 2; y < h; y += s * 1.3) body += `<circle cx="${(x + ((y / s) % 2 ? s * 0.65 : 0)).toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * 0.22).toFixed(1)}" fill="${ink}" opacity="${op}"/>`;
  if (kind === "grid") for (let x = 0; x < w; x += s) body += `<path d="M${x},0V${h}" stroke="${ink}" stroke-width="1.6" opacity="${op}"/>`;
  if (kind === "grid") for (let y = 0; y < h; y += s) body += `<path d="M0,${y}H${w}" stroke="${ink}" stroke-width="1.6" opacity="${op}"/>`;
  if (kind === "gingham") {
    for (let x = 0; x < w; x += s * 2) body += `<rect x="${x}" y="0" width="${s}" height="${h}" fill="${ink}" opacity="${(op * 0.55).toFixed(2)}"/>`;
    for (let y = 0; y < h; y += s * 2) body += `<rect x="0" y="${y}" width="${w}" height="${s}" fill="${ink}" opacity="${(op * 0.55).toFixed(2)}"/>`;
  }
  if (kind === "dash") body += `<path d="M0,${h / 2}H${w}" stroke="${ink}" stroke-width="3" stroke-dasharray="${s} ${s * 0.7}" opacity="${op}"/>`;
  if (kind === "waves") for (let y = s * 0.8; y < h; y += s * 1.4) body += `<path d="M0,${y}${Array.from({ length: Math.ceil(w / s) }, (_, i) => `Q${(i + 0.5) * s},${y + (i % 2 ? -s * 0.4 : s * 0.4)} ${(i + 1) * s},${y}`).join("")}" fill="none" stroke="${ink}" stroke-width="2.2" opacity="${op}"/>`;
  if (kind === "hearts" || kind === "stars")
    for (let x = s; x < w; x += s * 2.2)
      for (let y = s * 0.9; y < h; y += s * 1.8) {
        const k = s * 0.32;
        const shape =
          kind === "hearts"
            ? `M${x},${y + k}C${x - k * 1.6},${y - k * 0.2} ${x - k * 0.6},${y - k * 1.4} ${x},${y - k * 0.4}C${x + k * 0.6},${y - k * 1.4} ${x + k * 1.6},${y - k * 0.2} ${x},${y + k}Z`
            : `M${Array.from({ length: 10 }, (_, i) => {
                const a = -Math.PI / 2 + (i * Math.PI) / 5;
                const rr = i % 2 ? k * 0.45 : k;
                return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
              }).join("L")}Z`;
        body += `<path d="${shape}" fill="${ink}" opacity="${op}"/>`;
      }
  return { kind, svg: `<rect width="${w}" height="${h}" fill="${base}"/>${body}` };
}

/** One end of a tape, from top (y0) to bottom (y1) at x, pointing `dir` (−1 left, 1 right). */
function tapeEnd(r, kind, x, y0, y1, dir) {
  const h = y1 - y0;
  const pts = [];
  if (kind === "cut") return [[x + (r() - 0.5) * 1.5, y0], [x + (r() - 0.5) * 1.5, y1]];
  if (kind === "angle") {
    const k = range(r, 0.15, 0.45) * h * (r() < 0.5 ? -1 : 1);
    return [[x - (k * dir) / 2, y0], [x + (k * dir) / 2, y1]];
  }
  if (kind === "pinking") {
    const teeth = Math.round(h / range(r, 7, 10));
    for (let i = 0; i <= teeth * 2; i++) pts.push([x + (i % 2 ? dir * 5 : 0), y0 + (h * i) / (teeth * 2)]);
    return pts;
  }
  // torn: irregular small teeth, sometimes a deeper bite
  const n = Math.round(range(r, 7, 14));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    let d = (i % 2 ? range(r, 2, 8) : range(r, -1, 2.5)) + Math.sin(t * Math.PI) * range(r, 0, 4);
    if (r() < 0.12) d += range(r, 3, 7);
    pts.push([x + dir * d, y0 + t * h + (i > 0 && i < n ? (r() - 0.5) * (h / n) * 0.5 : 0)]);
  }
  return pts;
}

const TAPE_TYPES = ["washi", "washi", "washi", "clear", "masking", "cloth", "kraft", "foil"];
const FOILS = [["#d4af37", "#f7e7a1"], ["#c0c0c8", "#f2f2f7"], ["#d8a39b", "#f6d8cf"], ["#9fd3c7", "#e3fff6"]];

/**
 * A piece of tape, of many kinds (owner, 2026-10-19): patterned washi, clear tape with air
 * bubbles and a shiny edge, crêpe masking tape, frayed cloth / duct tape, gummed kraft,
 * glitter foil. Ends torn, cut straight, cut at an angle or with pinking shears — each end
 * its own; length and width vary; laid slightly bent, with creases.
 */
export function washi(seed) {
  const r = rng(seed);
  const type = pick(r, TAPE_TYPES);
  const len = type === "clear" ? range(r, 300, 620) : range(r, 260, 760);
  const h = type === "cloth" ? range(r, 80, 120) : type === "kraft" ? range(r, 70, 100) : range(r, 44, 100);
  const pad = 20;
  const W = Math.round(len + pad * 2);
  const H = Math.round(h + pad * 2 + 30);
  const top = (H - h) / 2;
  const endKinds = type === "clear" ? ["cut", "pinking", "angle"] : type === "cloth" ? ["torn", "torn", "cut"] : ["torn", "torn", "cut", "angle", "pinking"];
  const left = tapeEnd(r, pick(r, endKinds), pad, top, top + h, -1);
  const right = tapeEnd(r, pick(r, endKinds), pad + len, top, top + h, 1).reverse();
  const shape = [...left, ...right];
  // Laid slightly bent: a gentle arc applied to every point.
  const bend = range(r, -10, 10);
  const bent = shape.map(([x, y]) => [x, y + Math.sin(((x - pad) / len) * Math.PI) * bend]);
  const path = d(bent);
  let fill = "";
  let opacity = 0.9;
  let extra = "";
  let info = { type, pattern: "solid" };
  let defs = "";
  if (type === "washi") {
    const base = pick(r, TAPE_COLORS);
    const p = pattern(r, "p", W, H, base);
    fill = p.svg;
    opacity = range(r, 0.78, 0.9);
    info = { type, pattern: p.kind };
  } else if (type === "clear") {
    fill = `<rect width="${W}" height="${H}" fill="#eef4f8" opacity="0.28"/>`;
    opacity = 1;
    // Shiny edges and air bubbles.
    extra += `<path d="M${pad},${top + 2 + bend * 0}h${len}" stroke="#fff" stroke-opacity="0.8" stroke-width="2"/><path d="M${pad},${top + h - 2}h${len}" stroke="#fff" stroke-opacity="0.5" stroke-width="1.5"/>`;
    for (let i = 0; i < Math.round(range(r, 3, 9)); i++) {
      const bx = pad + range(r, 0.1, 0.9) * len;
      const by = top + range(r, 0.2, 0.8) * h;
      const rx = range(r, 3, 12);
      extra += `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * range(r, 0.5, 0.9)).toFixed(1)}" fill="#ffffff" fill-opacity="0.25" stroke="#ffffff" stroke-opacity="0.75" stroke-width="1"/>`;
    }
  } else if (type === "masking") {
    const base = pick(r, ["#efe3c2", "#f2e8cf", "#e9dab8", "#f4efe2"]);
    fill = `<rect width="${W}" height="${H}" fill="${base}"/>`;
    for (let x = pad; x < pad + len; x += range(r, 3, 6)) fill += `<path d="M${x.toFixed(1)},0V${H}" stroke="#000" stroke-opacity="${range(r, 0.02, 0.06).toFixed(3)}" stroke-width="1.2"/>`;
    opacity = 0.95;
  } else if (type === "cloth") {
    const base = pick(r, ["#b8bcc2", "#2d2f33", "#c9493f", "#3e6fb0", "#d9b53c", "#4f8a55"]);
    fill = `<rect width="${W}" height="${H}" fill="${base}"/>`;
    for (let y = 0; y < H; y += 3) fill += `<path d="M0,${y}H${W}" stroke="#fff" stroke-opacity="0.07" stroke-width="1"/>`;
    for (let x = 0; x < W; x += 3) fill += `<path d="M${x},0V${H}" stroke="#000" stroke-opacity="0.06" stroke-width="1"/>`;
    // Frayed threads at the ends.
    for (const e of [left, right]) for (let i = 0; i < 6; i++) {
      const [ex, ey] = pick(r, e);
      const dir = e === left ? -1 : 1;
      extra += `<path d="M${ex.toFixed(1)},${ey.toFixed(1)}l${(dir * range(r, 3, 9)).toFixed(1)},${range(r, -2, 2).toFixed(1)}" stroke="${base}" stroke-width="1.2" stroke-linecap="round"/>`;
    }
    opacity = 1;
    info = { type, pattern: "solid" };
  } else if (type === "kraft") {
    fill = `<rect width="${W}" height="${H}" fill="#b98a55"/>`;
    for (let i = 0; i < 70; i++) {
      const x = range(r, 0, W);
      const y = range(r, 0, H);
      fill += `<path d="M${x.toFixed(1)},${y.toFixed(1)}l${range(r, -20, 20).toFixed(1)},${range(r, -3, 3).toFixed(1)}" stroke="#5c3a17" stroke-opacity="0.18" stroke-width="${range(r, 0.4, 1.2).toFixed(1)}"/>`;
    }
    opacity = 1;
  } else {
    const [c0, c1] = pick(r, FOILS);
    fill = `<rect width="${W}" height="${H}" fill="url(#foil)"/>`;
    for (let i = 0; i < 120; i++) fill += `<circle cx="${range(r, 0, W).toFixed(1)}" cy="${range(r, 0, H).toFixed(1)}" r="${range(r, 0.6, 1.8).toFixed(1)}" fill="#fff" opacity="${range(r, 0.3, 0.9).toFixed(2)}"/>`;
    defs = `<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="0.45" stop-color="${c1}"/><stop offset="1" stop-color="${c0}"/></linearGradient>`;
    opacity = 1;
  }
  // Creases: a few light / dark diagonal folds across the tape.
  let creases = "";
  for (let i = 0; i < Math.floor(range(r, 0, 3)); i++) {
    const x = pad + range(r, 0.15, 0.85) * len;
    const k = range(r, -0.4, 0.4) * h;
    creases += `<path d="M${(x - k / 2).toFixed(1)},0L${(x + k / 2).toFixed(1)},${H}" stroke="#fff" stroke-opacity="0.35" stroke-width="2.5"/><path d="M${(x - k / 2 + 2.5).toFixed(1)},0L${(x + k / 2 + 2.5).toFixed(1)},${H}" stroke="#000" stroke-opacity="0.08" stroke-width="2"/>`;
  }
  const shadow = type === "clear" ? 0.06 : range(r, 0.1, 0.2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}${grain("g", { freq: 1.6, strength: type === "clear" ? 0.03 : 0.09, seed })}<clipPath id="c"><path d="${path}"/></clipPath>
    <filter id="b" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.06"/></linearGradient></defs>
  <path d="${path}" transform="translate(1 3)" fill="#000" opacity="${shadow.toFixed(2)}" filter="url(#b)"/>
  <g clip-path="url(#c)" opacity="${opacity.toFixed(2)}" filter="url(#g)">${fill}<rect width="${W}" height="${H}" fill="url(#sheen)"/>${creases}</g>
  <g clip-path="url(#c)">${type === "cloth" ? "" : extra}</g>
  ${type === "cloth" ? extra : ""}
</svg>`;
  return { svg, width: W, height: H, info: { ...info, ends: [left.length, right.length], len: Math.round(len) } };
}

const NOTE_COLORS = [
  ["yellow", "#f8e36f"],
  ["pink", "#f6b8c8"],
  ["blue", "#a9d6f0"],
  ["green", "#bfe3a2"],
  ["orange", "#f7c08a"],
  ["purple", "#d4c1ef"],
  ["white", "#f7f5ef"],
  ["mint", "#bfe9dc"],
  ["coral", "#f59f8b"],
];

/**
 * A sticky note of many shapes (owner, 2026-10-19): square, tall, wide or a thin index
 * strip; plain, lined, grid or dotted; a curled corner, a dog-ear fold, the bottom lifting
 * off, or a torn top from the pad; shadows of different strength.
 */
export function note(seed) {
  const r = rng(seed);
  const shape = pick(r, ["square", "square", "tall", "wide", "strip", "strip-wide"]);
  const base = range(r, 360, 460);
  const [w, h] = shape === "square" ? [base, base] : shape === "tall" ? [base * 0.78, base * 1.25] : shape === "wide" ? [base * 1.35, base * 0.8] : shape === "strip" ? [base * 0.32, base * 1.2] : [base * 1.3, base * 0.3];
  const pad = 40;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const [name, color] = pick(r, NOTE_COLORS);
  const lift = pick(r, ["curl-br", "curl-bl", "dog-ear", "lift", "flat", "torn"]);
  const x0 = pad;
  const y0 = pad;
  const x1 = pad + w;
  const y1 = pad + h;
  const curl = range(r, 0.07, 0.16) * Math.min(w, h);
  let body;
  let topPts = `M${x0},${y0}H${x1}`;
  if (lift === "torn") {
    // Torn off the pad: a ragged top.
    const n = Math.round(w / 6);
    topPts = `M${x0},${(y0 + range(r, 0, 3)).toFixed(1)}` + Array.from({ length: n }, (_, i) => `L${(x0 + ((i + 1) * w) / n).toFixed(1)},${(y0 + range(r, 0, 4)).toFixed(1)}`).join("");
  }
  if (lift === "curl-br") body = `${topPts}V${y1 - curl}Q${x1 - curl * 0.15},${y1 - curl * 0.15} ${x1 - curl},${y1}H${x0}Z`;
  else if (lift === "curl-bl") body = `${topPts}V${y1}H${x0 + curl}Q${x0 + curl * 0.15},${y1 - curl * 0.15} ${x0},${y1 - curl}Z`;
  else if (lift === "dog-ear") body = `${topPts}V${y1 - curl}L${x1 - curl},${y1}H${x0}Z`;
  else body = `${topPts}V${y1}H${x0}Z`;
  const shadowK = lift === "flat" ? range(r, 0.1, 0.16) : range(r, 0.18, 0.3);
  const shadowD = lift === "lift" ? `M${x0 + 6},${y0 + 10}H${x1 + 4}V${y1 + 10}Q${(x0 + x1) / 2},${y1 - 6} ${x0 + 2},${y1 + 10}Z` : body;
  const glue = Math.min(w, h) * range(r, 0.1, 0.16);
  const rule = pick(r, ["plain", "plain", "lines", "grid", "dots"]);
  let rules = "";
  const step = range(r, 22, 30);
  if (rule === "lines") for (let y = y0 + glue + step; y < y1 - step / 2; y += step) rules += `<path d="M${x0 + w * 0.06},${y.toFixed(1)}H${x1 - w * 0.06}" stroke="#000" stroke-opacity="0.1" stroke-width="1.5"/>`;
  if (rule === "grid") {
    for (let y = y0 + glue; y < y1; y += step * 0.75) rules += `<path d="M${x0},${y.toFixed(1)}H${x1}" stroke="#000" stroke-opacity="0.07" stroke-width="1"/>`;
    for (let x = x0; x < x1; x += step * 0.75) rules += `<path d="M${x.toFixed(1)},${y0 + glue}V${y1}" stroke="#000" stroke-opacity="0.07" stroke-width="1"/>`;
  }
  if (rule === "dots") for (let y = y0 + glue + step / 2; y < y1; y += step * 0.75) for (let x = x0 + step / 2; x < x1; x += step * 0.75) rules += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="#000" fill-opacity="0.16"/>`;
  const fold = lift === "dog-ear" ? `<path d="M${x1},${y1 - curl}L${x1 - curl},${y1}L${x1 - curl * 0.9},${y1 - curl * 0.9}Z" fill="${color}"/><path d="M${x1},${y1 - curl}L${x1 - curl},${y1}L${x1 - curl * 0.9},${y1 - curl * 0.9}Z" fill="#000" opacity="0.12"/>` : "";
  const curlShade = lift.startsWith("curl") ? `<linearGradient id="cs" x1="${lift === "curl-br" ? 1 : 0}" y1="1" x2="${lift === "curl-br" ? 0.55 : 0.45}" y2="0.55"><stop offset="0" stop-color="#000" stop-opacity="0.16"/><stop offset="0.35" stop-color="#000" stop-opacity="0"/></linearGradient>` : "";
  const liftShade = lift === "lift" ? `<linearGradient id="ls" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.1"/></linearGradient>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 1.3, strength: 0.06, seed })}${curlShade}${liftShade}
    <filter id="b" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="${range(r, 5, 10).toFixed(1)}"/></filter>
    <clipPath id="c"><path d="${body}"/></clipPath></defs>
  <path d="${shadowD}" transform="translate(3 6)" fill="#000" opacity="${shadowK.toFixed(2)}" filter="url(#b)"/>
  <path d="${body}" fill="${color}" filter="url(#g)"/>
  <g clip-path="url(#c)">
    ${lift === "torn" ? "" : `<rect x="${x0}" y="${y0}" width="${w}" height="${glue}" fill="#000" opacity="0.045"/>`}
    ${rules}
    ${curlShade ? `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#cs)"/>` : ""}
    ${liftShade ? `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#ls)"/>` : ""}
  </g>
  ${fold}
</svg>`;
  return { svg, width: W, height: H, info: { color: name, shape, lift, rule } };
}

/** A scrap torn from a notebook page: ruled lines, a margin, sometimes the punched holes. */
export function scrap(seed) {
  const r = rng(seed);
  const w = range(r, 380, 620);
  const h = w * range(r, 0.55, 1.1);
  const pad = 40;
  const W = Math.round(w + pad * 2);
  const H = Math.round(h + pad * 2);
  const quad = looseQuad(r, w, h, pad, pad, range(r, 0.02, 0.05));
  const torn = [r() < 0.7, r() < 0.5, r() < 0.7, r() < 0.5];
  if (!torn.some(Boolean)) torn[0] = true;
  const pts = [];
  const flags = [];
  for (let i = 0; i < 4; i++) {
    const e = edge(r, quad[i], quad[(i + 1) % 4], { torn: torn[i], depth: range(r, 0.6, 1.2) });
    pts.push(...e);
    flags.push(...e.map(() => torn[i]));
  }
  const rim = fibreRim(r, pts, { width: range(r, 3, 6), torn: (i) => flags[i] });
  const paper = pick(r, ["#fbfaf5", "#f6f1e3", "#fdfcf8", "#f3f0e6"]);
  const line = pick(r, ["#8fb3d9", "#9ec0dd", "#b7c6d6"]);
  const grid = r() < 0.3;
  const step = range(r, 28, 36);
  let rules = "";
  if (grid) for (let x = pad; x < W; x += step * 0.8) rules += `<path d="M${x.toFixed(1)},0V${H}" stroke="${line}" stroke-opacity="0.45" stroke-width="1.2"/>`;
  for (let y = pad + step * range(r, 0.6, 1.4); y < H; y += grid ? step * 0.8 : step) rules += `<path d="M0,${y.toFixed(1)}H${W}" stroke="${line}" stroke-opacity="0.6" stroke-width="1.4"/>`;
  const margin = !grid && r() < 0.6 ? `<path d="M${(pad + w * range(r, 0.1, 0.16)).toFixed(1)},0V${H}" stroke="#e08a8a" stroke-opacity="0.7" stroke-width="1.6"/>` : "";
  const holes = r() < 0.35 ? Array.from({ length: Math.floor(h / 90) }, (_, i) => `<circle cx="${pad + 26}" cy="${(pad + 45 + i * 90).toFixed(1)}" r="9"/>`).join("") : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 1.1, strength: 0.05, seed, warm: true })}
    <clipPath id="c"><path d="${d(pts)}"/></clipPath>
    <mask id="h" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><g fill="#000">${holes}</g></mask>
    <filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter></defs>
  <g mask="url(#h)">
    <path d="${d(rim.out)}" transform="translate(2 5)" fill="#000" opacity="0.2" filter="url(#b)"/>
    <path d="${d(rim.fuzz)}" fill="${paper}" opacity="0.5"/>
    <path d="${d(rim.out)}" fill="${paper}" filter="url(#g)"/>
    <path d="${hairPath(rim.hairs)}" fill="none" stroke="${paper}" stroke-width="0.6" opacity="0.5"/>
    <g clip-path="url(#c)">${rules}${margin}</g>
  </g>
</svg>`;
  return { svg, width: W, height: H, info: { grid, holes: !!holes } };
}

export const STICKER_KINDS = { washi, note, scrap };
