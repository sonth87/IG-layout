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

/** A piece of washi tape: translucent, torn ends, a pattern, paper fibres. */
export function washi(seed) {
  const r = rng(seed);
  const len = range(r, 360, 720);
  const h = range(r, 62, 92);
  const pad = 14;
  const W = Math.round(len + pad * 2);
  const H = Math.round(h + pad * 2);
  const base = pick(r, TAPE_COLORS);
  const left = tornEnd(r, pad, h, -1).map(([x, y]) => [x, y + pad]);
  const right = tornEnd(r, pad + len, h, 1).map(([x, y]) => [x, y + pad]).reverse();
  // Long edges: almost straight, a tiny wave.
  const shape = [...left, ...right.map(([x, y], i) => [x, y + (i === 0 ? (r() - 0.5) * 1.5 : 0)])];
  const p = pattern(r, "p", W, H, base);
  const alpha = range(r, 0.78, 0.9).toFixed(2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 1.6, strength: 0.09, seed })}<clipPath id="c"><path d="${d(shape)}"/></clipPath>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.06"/></linearGradient></defs>
  <g clip-path="url(#c)" opacity="${alpha}" filter="url(#g)">${p.svg}<rect width="${W}" height="${H}" fill="url(#sheen)"/></g>
</svg>`;
  return { svg, width: W, height: H, info: { pattern: p.kind, base } };
}

const NOTE_COLORS = [
  ["yellow", "#f8e36f"],
  ["pink", "#f6b8c8"],
  ["blue", "#a9d6f0"],
  ["green", "#bfe3a2"],
  ["orange", "#f7c08a"],
  ["purple", "#d4c1ef"],
  ["white", "#f7f5ef"],
];

/** A sticky note: one corner curling up, the glue strip a shade darker, soft shadow. */
export function note(seed) {
  const r = rng(seed);
  const s = range(r, 380, 460);
  const pad = 40;
  const W = Math.round(s + pad * 2);
  const H = Math.round(s + pad * 2);
  const [name, color] = pick(r, NOTE_COLORS);
  const curl = range(r, 0.06, 0.16) * s;
  const corner = pick(r, ["br", "bl"]);
  // Square with one curled corner (a curve instead of the point).
  const x0 = pad;
  const y0 = pad;
  const x1 = pad + s;
  const y1 = pad + s;
  const body =
    corner === "br"
      ? `M${x0},${y0}H${x1}V${y1 - curl}Q${x1 - curl * 0.15},${y1 - curl * 0.15} ${x1 - curl},${y1}H${x0}Z`
      : `M${x0},${y0}H${x1}V${y1}H${x0 + curl}Q${x0 + curl * 0.15},${y1 - curl * 0.15} ${x0},${y1 - curl}Z`;
  const shadowD = corner === "br" ? `M${x0 + 4},${y0 + 8}H${x1 + 2}V${y1 - curl * 0.4}L${x1 - curl * 0.2},${y1 + curl * 0.35}H${x0 + 4}Z` : `M${x0 - 2},${y0 + 8}H${x1 - 4}V${y1 + 2}H${x0 + curl * 0.2}L${x0 - 2},${y1 - curl * 0.4}Z`;
  const glue = range(r, 0.12, 0.18) * s;
  const lines = r() < 0.35;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${grain("g", { freq: 1.3, strength: 0.06, seed })}
    <filter id="b" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="${range(r, 6, 10).toFixed(1)}"/></filter>
    <linearGradient id="curl" x1="${corner === "br" ? 1 : 0}" y1="1" x2="${corner === "br" ? 0.55 : 0.45}" y2="0.55"><stop offset="0" stop-color="#000" stop-opacity="0.16"/><stop offset="0.35" stop-color="#000" stop-opacity="0"/></linearGradient>
    <clipPath id="c"><path d="${body}"/></clipPath></defs>
  <path d="${shadowD}" fill="#000" opacity="${range(r, 0.18, 0.28).toFixed(2)}" filter="url(#b)"/>
  <path d="${body}" fill="${color}" filter="url(#g)"/>
  <g clip-path="url(#c)">
    <rect x="${x0}" y="${y0}" width="${s}" height="${glue}" fill="#000" opacity="0.045"/>
    ${lines ? Array.from({ length: 7 }, (_, i) => `<path d="M${x0 + s * 0.06},${y0 + s * (0.28 + i * 0.1)}H${x1 - s * 0.06}" stroke="#000" stroke-opacity="0.09" stroke-width="1.5"/>`).join("") : ""}
    <rect x="${x0}" y="${y0}" width="${s}" height="${s}" fill="url(#curl)"/>
  </g>
</svg>`;
  return { svg, width: W, height: H, info: { color: name, curl: corner, lines } };
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
