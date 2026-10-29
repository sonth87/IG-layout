// Generates procedural light-effect (screen on black) and paper/stain/crease (multiply on white)
// overlays into assets/overlay/<pack>/src/ and updates assets/overlay/<pack>/manifest.json.
// Usage: node scripts/assets/gen-overlays.mjs

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ASSETS, PACKS } from "./common.mjs";

const SCRIPT_URL = "https://github.com/sonth87/IG-layout/blob/main/scripts/assets/gen-overlays.mjs";
const RETRIEVED = "2026-10-18";

/** Deterministic PRNG (Mulberry32). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 2D value noise for organic stains, paper clouds, and smoke/film grain. */
function createValueNoise2D(seed, gridW = 64, gridH = 64) {
  const rng = mulberry32(seed);
  const grid = new Float32Array(gridW * gridH);
  for (let i = 0; i < grid.length; i++) grid[i] = rng();

  const sample = (x, y, freq = 1) => {
    const fx = ((x * freq) % gridW + gridW) % gridW;
    const fy = ((y * freq) % gridH + gridH) % gridH;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const x1 = (x0 + 1) % gridW;
    const y1 = (y0 + 1) % gridH;
    const dx = fx - x0;
    const dy = fy - y0;
    const sx = dx * dx * (3 - 2 * dx);
    const sy = dy * dy * (3 - 2 * dy);
    const v00 = grid[y0 * gridW + x0];
    const v10 = grid[y0 * gridW + x1];
    const v01 = grid[y1 * gridW + x0];
    const v11 = grid[y1 * gridW + x1];
    const ix0 = v00 + sx * (v10 - v00);
    const ix1 = v01 + sx * (v11 - v01);
    return ix0 + sy * (ix1 - ix0);
  };

  const fbm = (x, y, octaves = 4) => {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      val += amp * sample(x, y, freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return val / norm;
  };

  return { sample, fbm };
}

function makeSource(title) {
  return {
    provider: "IG Layout",
    url: SCRIPT_URL,
    author: "IG Layout Procedural Generator",
    title,
    license: "CC0-1.0",
    retrieved: RETRIEVED,
  };
}

/** Render an SVG string onto a raw RGB buffer via sharp. */
async function renderSvgToPng(svg, outPath, width, height) {
  await sharp(Buffer.from(svg))
    .resize(width, height, { fit: "fill" })
    .png({ compressionLevel: 6 })
    .toFile(outPath);
}

// ============================================================================
// PACK 1: light-effects (blend: "screen", pure black background)
// ============================================================================

const LIGHT_ITEMS = [
  {
    id: "ov-film-burn-orange-left",
    name: { en: "Warm Orange Left Edge Film Burn", vi: "Rò sáng phim cam ấm cạnh trái" },
    tags: {
      en: ["light leak", "film burn", "orange", "warm"],
      vi: ["rò sáng", "cháy phim", "cam ấm", "cổ điển"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 101,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="g1" cx="0%" cy="38%" r="68%" fx="0%" fy="38%">
            <stop offset="0%" stop-color="#fff4d2" stop-opacity="0.95"/>
            <stop offset="18%" stop-color="#ff8a1e" stop-opacity="0.88"/>
            <stop offset="48%" stop-color="#d92b04" stop-opacity="0.45"/>
            <stop offset="78%" stop-color="#520800" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="g2" cx="6%" cy="76%" r="52%">
            <stop offset="0%" stop-color="#ffb732" stop-opacity="0.82"/>
            <stop offset="45%" stop-color="#e83808" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="edge" x1="0%" y1="0%" x2="32%" y2="0%">
            <stop offset="0%" stop-color="#ff6a00" stop-opacity="0.72"/>
            <stop offset="45%" stop-color="#b81d00" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#edge)"/>
        <ellipse cx="${Math.round(w * 0.04)}" cy="${Math.round(h * 0.38)}" rx="${Math.round(w * 0.62)}" ry="${Math.round(h * 0.48)}" fill="url(#g1)"/>
        <ellipse cx="${Math.round(w * 0.08)}" cy="${Math.round(h * 0.78)}" rx="${Math.round(w * 0.46)}" ry="${Math.round(h * 0.34)}" fill="url(#g2)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-film-burn-crimson-corner",
    name: { en: "Crimson Corner Dual Film Leak", vi: "Quầng rò sáng đỏ thẫm hai góc" },
    tags: {
      en: ["light leak", "crimson", "red", "corner"],
      vi: ["rò sáng", "đỏ thẫm", "góc ảnh", "phim nhựa"],
    },
    collections: ["vintage"],
    blend: "screen",
    seed: 102,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="c1" cx="96%" cy="8%" r="65%">
            <stop offset="0%" stop-color="#ffe0b5" stop-opacity="0.92"/>
            <stop offset="22%" stop-color="#ff4d1c" stop-opacity="0.78"/>
            <stop offset="55%" stop-color="#9e0b22" stop-opacity="0.36"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="c2" cx="4%" cy="94%" r="58%">
            <stop offset="0%" stop-color="#ff9442" stop-opacity="0.80"/>
            <stop offset="40%" stop-color="#bd112a" stop-opacity="0.40"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#c1)"/>
        <rect width="${w}" height="${h}" fill="url(#c2)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-light-leak-rose-gold",
    name: { en: "Rose Gold Right Edge Light Leak", vi: "Vệt rò sáng hồng vàng cạnh phải" },
    tags: {
      en: ["light leak", "rose gold", "pink", "pastel"],
      vi: ["rò sáng", "hồng đào", "vàng kim", "dịu dàng"],
    },
    collections: ["vintage", "cute"],
    blend: "screen",
    seed: 103,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="rg1" cx="98%" cy="46%" r="62%">
            <stop offset="0%" stop-color="#fff0f5" stop-opacity="0.90"/>
            <stop offset="25%" stop-color="#ff7aa8" stop-opacity="0.72"/>
            <stop offset="58%" stop-color="#d4426e" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="rg2" cx="82%" cy="18%" r="48%">
            <stop offset="0%" stop-color="#ffd28a" stop-opacity="0.76"/>
            <stop offset="50%" stop-color="#e36448" stop-opacity="0.26"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#rg1)"/>
        <rect width="${w}" height="${h}" fill="url(#rg2)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-light-leak-sunset-strip",
    name: { en: "35mm Vertical Sunset Film Strip Leak", vi: "Dải lộ sáng dọc màu hoàng hôn" },
    tags: {
      en: ["film strip", "light leak", "vertical", "sunset"],
      vi: ["dải sáng", "lộ sáng", "hoàng hôn", "phim 35mm"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 104,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <linearGradient id="vs1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="8%" stop-color="#ff4500" stop-opacity="0.55"/>
            <stop offset="15%" stop-color="#ffbe3b" stop-opacity="0.82"/>
            <stop offset="23%" stop-color="#bf1540" stop-opacity="0.32"/>
            <stop offset="40%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="76%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="88%" stop-color="#7c1868" stop-opacity="0.38"/>
            <stop offset="95%" stop-color="#ff6238" stop-opacity="0.72"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="vfade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
            <stop offset="45%" stop-color="#ffffff" stop-opacity="0.35"/>
            <stop offset="85%" stop-color="#ffffff" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
          </linearGradient>
          <mask id="m1"><rect width="${w}" height="${h}" fill="url(#vfade)"/></mask>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#vs1)" mask="url(#m1)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-diagonal-warm-streaks",
    name: { en: "Warm Diagonal Light Streaks", vi: "Ba vệt sáng chéo màu nắng ấm" },
    tags: {
      en: ["streaks", "diagonal", "sunlight", "warm"],
      vi: ["vệt sáng", "chéo", "nắng ấm", "lấp lánh"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 105,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <filter id="blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="52"/>
          </filter>
          <linearGradient id="st" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff3c4" stop-opacity="0.88"/>
            <stop offset="45%" stop-color="#ff9933" stop-opacity="0.52"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <g filter="url(#blur)">
          <polygon points="-80,120 260,-80 960,920 720,1080" fill="url(#st)"/>
          <polygon points="220,-60 480,-60 1180,860 960,980" fill="url(#st)" opacity="0.72"/>
          <polygon points="-100,520 120,420 740,1260 520,1360" fill="url(#st)" opacity="0.58"/>
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-prism-rainbow-streak",
    name: { en: "Soft Optical Prism Rainbow Streak", vi: "Vệt tán sắc cầu vồng qua lăng kính" },
    tags: {
      en: ["prism", "rainbow", "spectrum", "refraction"],
      vi: ["lăng kính", "cầu vồng", "tán sắc", "ánh sáng"],
    },
    collections: ["summer", "cute"],
    blend: "screen",
    seed: 106,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <filter id="pblur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="34"/>
          </filter>
          <linearGradient id="rain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff2e4c" stop-opacity="0"/>
            <stop offset="14%" stop-color="#ff384b" stop-opacity="0.72"/>
            <stop offset="30%" stop-color="#ff9a2e" stop-opacity="0.76"/>
            <stop offset="46%" stop-color="#ffe84a" stop-opacity="0.78"/>
            <stop offset="62%" stop-color="#35e08e" stop-opacity="0.70"/>
            <stop offset="78%" stop-color="#369bff" stop-opacity="0.74"/>
            <stop offset="92%" stop-color="#9b4dff" stop-opacity="0.68"/>
            <stop offset="100%" stop-color="#9b4dff" stop-opacity="0"/>
          </linearGradient>
          <radialGradient id="fade" cx="50%" cy="50%" r="52%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="65%" stop-color="#ffffff" stop-opacity="0.65"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <mask id="pmask"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <g mask="url(#pmask)" filter="url(#pblur)">
          <rect x="-120" y="420" width="${w + 240}" height="290" transform="rotate(-28 560 700)" fill="url(#rain)"/>
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-anamorphic-blue-flare",
    name: { en: "Cinematic Anamorphic Horizontal Blue Flare", vi: "Tia sáng ngang ống kính điện ảnh xanh lam" },
    tags: {
      en: ["anamorphic", "lens flare", "cinematic", "blue"],
      vi: ["tia sáng", "ống kính", "điện ảnh", "xanh lam"],
    },
    collections: ["vintage"],
    blend: "screen",
    seed: 107,
    width: 1400,
    height: 1050,
    render: async (outPath, w, h) => {
      const cy = Math.round(h * 0.36);
      const cx = Math.round(w * 0.64);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="core" cx="64%" cy="36%" r="32%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>
            <stop offset="16%" stop-color="#a8e4ff" stop-opacity="0.78"/>
            <stop offset="45%" stop-color="#1e78ff" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="bar" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="20%" stop-color="#1a66ff" stop-opacity="0.38"/>
            <stop offset="64%" stop-color="#d8f3ff" stop-opacity="0.92"/>
            <stop offset="90%" stop-color="#1a66ff" stop-opacity="0.42"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
          <filter id="b1"><feGaussianBlur stdDeviation="14"/></filter>
          <filter id="b2"><feGaussianBlur stdDeviation="3"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#core)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(w * 0.48)}" ry="34" fill="url(#bar)" filter="url(#b1)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(w * 0.46)}" ry="7" fill="url(#bar)" filter="url(#b2)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-golden-sun-flare",
    name: { en: "Golden Hour Corner Sun Lens Flare", vi: "Quầng nắng vàng và phản xạ thấu kính góc trên" },
    tags: {
      en: ["sun flare", "golden hour", "lens", "warm"],
      vi: ["quầng nắng", "hoàng hôn", "thấu kính", "vàng ấm"],
    },
    collections: ["summer", "vintage"],
    blend: "screen",
    seed: 108,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="sun" cx="12%" cy="10%" r="62%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="18%" stop-color="#ffe799" stop-opacity="0.88"/>
            <stop offset="46%" stop-color="#ff9429" stop-opacity="0.42"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="orb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffd480" stop-opacity="0.16"/>
            <stop offset="75%" stop-color="#ff8833" stop-opacity="0.34"/>
            <stop offset="92%" stop-color="#ffae52" stop-opacity="0.48"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#sun)"/>
        <circle cx="380" cy="410" r="78" fill="url(#orb)"/>
        <circle cx="540" cy="590" r="128" fill="url(#orb)" opacity="0.75"/>
        <circle cx="740" cy="820" r="64" fill="url(#orb)" opacity="0.85"/>
        <circle cx="890" cy="990" r="165" fill="url(#orb)" opacity="0.55"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-soft-halo-ring-flare",
    name: { en: "Optical Halo Ring Refraction Flare", vi: "Vòng tròn khúc xạ ánh sáng dịu" },
    tags: {
      en: ["halo", "ring flare", "optical", "refraction"],
      vi: ["vòng sáng", "khúc xạ", "quầng sáng", "thấu kính"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 109,
    width: 1200,
    height: 1200,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="58%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="72%" stop-color="#ff9e44" stop-opacity="0.36"/>
            <stop offset="80%" stop-color="#ffe299" stop-opacity="0.58"/>
            <stop offset="88%" stop-color="#c85aff" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="spot" cx="24%" cy="22%" r="36%">
            <stop offset="0%" stop-color="#fff6d6" stop-opacity="0.9"/>
            <stop offset="40%" stop-color="#ff9d3b" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <circle cx="560" cy="580" r="460" fill="url(#ring)"/>
        <rect width="${w}" height="${h}" fill="url(#spot)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-bokeh-golden-circles",
    name: { en: "Warm Golden Bokeh Light Discs", vi: "Đốm sáng tròn Bokeh vàng kim ấm áp" },
    tags: {
      en: ["bokeh", "golden", "circles", "lights"],
      vi: ["bokeh", "đốm sáng", "vàng kim", "lung linh"],
    },
    collections: ["christmas", "vintage", "wedding"],
    blend: "screen",
    seed: 110,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      const colors = ["#ffe699", "#ffbe55", "#ff9233", "#fff3cc", "#ffd278"];
      let circles = "";
      for (let i = 0; i < 38; i++) {
        const cx = Math.round(rng() * w);
        const cy = Math.round(rng() * h);
        const r = Math.round(28 + rng() * 115);
        const col = colors[Math.floor(rng() * colors.length)];
        const op = (0.14 + rng() * 0.38).toFixed(2);
        circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-width="3" stroke-opacity="${(Number(op) * 1.35).toFixed(2)}"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs><filter id="b"><feGaussianBlur stdDeviation="8"/></filter></defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <g filter="url(#b)">${circles}</g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-bokeh-pastel-dream",
    name: { en: "Pastel Pink & Mint Dream Bokeh", vi: "Đốm sáng Bokeh hồng phấn và xanh bạc hà" },
    tags: {
      en: ["bokeh", "pastel", "dreamy", "pink"],
      vi: ["bokeh", "mộng mơ", "hồng phấn", "pastel"],
    },
    collections: ["cute", "wedding", "birthday"],
    blend: "screen",
    seed: 111,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      const colors = ["#ff9ec6", "#ffc2e2", "#a3f5e0", "#c5a8ff", "#ffe5b8"];
      let circles = "";
      for (let i = 0; i < 34; i++) {
        const cx = Math.round(rng() * w);
        const cy = Math.round(rng() * h);
        const r = Math.round(35 + rng() * 125);
        const col = colors[Math.floor(rng() * colors.length)];
        const op = (0.14 + rng() * 0.34).toFixed(2);
        circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-width="2.5" stroke-opacity="${(Number(op) * 1.25).toFixed(2)}"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs><filter id="b"><feGaussianBlur stdDeviation="11"/></filter></defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <g filter="url(#b)">${circles}</g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-bokeh-christmas-warm",
    name: { en: "Festive Red & Gold Bokeh Border", vi: "Viền đốm sáng Bokeh đỏ vàng mùa lễ hội" },
    tags: {
      en: ["bokeh", "festive", "christmas", "border"],
      vi: ["bokeh", "lễ hội", "giáng sinh", "tết"],
    },
    collections: ["christmas", "tet"],
    blend: "screen",
    seed: 112,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      const colors = ["#ff3b30", "#ffcc4d", "#ff9500", "#ffea9f", "#38d976"];
      let circles = "";
      for (let i = 0; i < 42; i++) {
        // Bias toward edges so center subject stays clear
        const edgeSide = i % 4;
        let cx, cy;
        if (edgeSide === 0) {
          cx = rng() * w;
          cy = rng() * h * 0.25;
        } else if (edgeSide === 1) {
          cx = rng() * w;
          cy = h * (0.75 + rng() * 0.25);
        } else if (edgeSide === 2) {
          cx = rng() * w * 0.26;
          cy = rng() * h;
        } else {
          cx = w * (0.74 + rng() * 0.26);
          cy = rng() * h;
        }
        const r = Math.round(24 + rng() * 95);
        const col = colors[i % colors.length];
        const op = (0.16 + rng() * 0.36).toFixed(2);
        circles += `<circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="${r}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-width="2.5" stroke-opacity="${(Number(op) * 1.3).toFixed(2)}"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs><filter id="b"><feGaussianBlur stdDeviation="9"/></filter></defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <g filter="url(#b)">${circles}</g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-sunbeams-top-right",
    name: { en: "Morning Golden Sunbeams from Top Right", vi: "Chùm tia nắng sớm chiếu xiên từ góc phải" },
    tags: {
      en: ["sunbeams", "god rays", "morning", "sunlight"],
      vi: ["tia nắng", "nắng sớm", "chiếu xiên", "ấm áp"],
    },
    collections: ["summer", "vintage"],
    blend: "screen",
    seed: 113,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const ox = w + 60;
      const oy = -60;
      const rays = [
        [-200, 1400, 120, 1400, 0.34],
        [180, 1400, 480, 1400, 0.42],
        [520, 1400, 820, 1400, 0.28],
        [-200, 620, -200, 980, 0.38],
        [-200, 180, -200, 480, 0.25],
      ]
        .map(
          ([x1, y1, x2, y2, op]) =>
            `<polygon points="${ox},${oy} ${x1},${y1} ${x2},${y2}" fill="url(#ray)" opacity="${op}"/>`
        )
        .join("");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="ray" cx="95%" cy="5%" r="92%">
            <stop offset="0%" stop-color="#fff7d6" stop-opacity="0.95"/>
            <stop offset="35%" stop-color="#ffbe55" stop-opacity="0.55"/>
            <stop offset="78%" stop-color="#ff7b1c" stop-opacity="0.14"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="rb"><feGaussianBlur stdDeviation="28"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <g filter="url(#rb)">${rays}</g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-starburst-sparkles",
    name: { en: "Vintage Cross Screen Starburst Sparkles", vi: "Ánh sao lấp lánh 4 cánh kiểu kính lọc cổ điển" },
    tags: {
      en: ["starburst", "sparkles", "glitter", "stars"],
      vi: ["ánh sao", "lấp lánh", "tia sao", "lễ hội"],
    },
    collections: ["christmas", "birthday", "wedding"],
    blend: "screen",
    seed: 114,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      let stars = "";
      for (let i = 0; i < 26; i++) {
        const cx = Math.round(80 + rng() * (w - 160));
        const cy = Math.round(80 + rng() * (h - 160));
        const len = Math.round(36 + rng() * 95);
        const col = i % 3 === 0 ? "#ffe599" : i % 3 === 1 ? "#ffffff" : "#ffc9a3";
        const op = (0.45 + rng() * 0.5).toFixed(2);
        stars += `<g transform="translate(${cx},${cy}) rotate(15)" opacity="${op}">
          <ellipse cx="0" cy="0" rx="${len}" ry="2.2" fill="${col}"/>
          <ellipse cx="0" cy="0" rx="2.2" ry="${len}" fill="${col}"/>
          <ellipse cx="0" cy="0" rx="${Math.round(len * 0.45)}" ry="1.4" transform="rotate(45)" fill="${col}"/>
          <ellipse cx="0" cy="0" rx="1.4" ry="${Math.round(len * 0.45)}" transform="rotate(45)" fill="${col}"/>
          <circle cx="0" cy="0" r="${Math.round(len * 0.14)}" fill="#ffffff"/>
        </g>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs><filter id="sb"><feGaussianBlur stdDeviation="1.8"/></filter></defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <g filter="url(#sb)">${stars}</g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-film-dust-specks",
    name: { en: "Darkroom Film Dust & Lint Specks", vi: "Hạt bụi trắng và sợi tơ buồng tối trên nền đen" },
    tags: {
      en: ["dust", "film", "specks", "analog"],
      vi: ["bụi phim", "hạt bụi", "phim cổ", "buồng tối"],
    },
    collections: ["vintage"],
    blend: "screen",
    seed: 115,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      let elements = "";
      // Fine dust specks
      for (let i = 0; i < 420; i++) {
        const cx = (rng() * w).toFixed(1);
        const cy = (rng() * h).toFixed(1);
        const r = (0.7 + rng() * 2.4).toFixed(1);
        const op = (0.18 + rng() * 0.65).toFixed(2);
        elements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f7f2e8" fill-opacity="${op}"/>`;
      }
      // Tiny curved lint hairs
      for (let i = 0; i < 38; i++) {
        const x0 = rng() * w;
        const y0 = rng() * h;
        const dx1 = (rng() - 0.5) * 32;
        const dy1 = (rng() - 0.5) * 32;
        const dx2 = dx1 + (rng() - 0.5) * 28;
        const dy2 = dy1 + (rng() - 0.5) * 28;
        const op = (0.25 + rng() * 0.55).toFixed(2);
        elements += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${(x0 + dx1).toFixed(1)} ${(y0 + dy1).toFixed(1)} ${(x0 + dx2).toFixed(1)} ${(y0 + dy2).toFixed(1)}" fill="none" stroke="#f5efe4" stroke-width="${(0.8 + rng() * 1.1).toFixed(1)}" stroke-opacity="${op}" stroke-linecap="round"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <rect width="${w}" height="${h}" fill="#000000"/>
        ${elements}
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-film-scratches-vertical",
    name: { en: "35mm Vertical Film Scratches & Dust", vi: "Vệt xước dọc phim nhựa 35mm và bụi mịn" },
    tags: {
      en: ["scratches", "film", "vertical", "vintage"],
      vi: ["xước phim", "phim cũ", "vệt xước", "hoài cổ"],
    },
    collections: ["vintage"],
    blend: "screen",
    seed: 116,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      let lines = "";
      for (let i = 0; i < 14; i++) {
        let x = 70 + rng() * (w - 140);
        let y = rng() * h * 0.15;
        const yMax = y + h * (0.45 + rng() * 0.55);
        const baseSw = 0.5 + rng() * 1.1;
        while (y < Math.min(h, yMax)) {
          const segLen = 35 + rng() * 110;
          const nextY = Math.min(h, y + segLen);
          const nextX = x + (rng() - 0.5) * 3.2;
          if (rng() > 0.22) {
            const op = (0.14 + rng() * 0.48).toFixed(2);
            const sw = (baseSw * (0.6 + rng() * 0.7)).toFixed(2);
            lines += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${nextX.toFixed(1)}" y2="${nextY.toFixed(1)}" stroke="#fff9ee" stroke-width="${sw}" stroke-opacity="${op}" stroke-linecap="round"/>`;
          }
          x = nextX;
          y = nextY + rng() * 18;
        }
      }
      for (let i = 0; i < 210; i++) {
        const cx = (rng() * w).toFixed(1);
        const cy = (rng() * h).toFixed(1);
        const r = (0.6 + rng() * 2.1).toFixed(1);
        const op = (0.15 + rng() * 0.52).toFixed(2);
        lines += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff8eb" fill-opacity="${op}"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <rect width="${w}" height="${h}" fill="#000000"/>
        ${lines}
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
];

// ============================================================================
// PACK 2: film-paper-grain (mix of screen grain on black & multiply creases/stains on white)
// ============================================================================

const PAPER_ITEMS = [
  {
    id: "ov-fine-35mm-grain-screen",
    name: { en: "Fine Silver 35mm Film Grain on Black", vi: "Hạt bạc phim 35mm mịn trên nền đen" },
    tags: {
      en: ["film grain", "analog", "silver", "noise"],
      vi: ["hạt phim", "phim 35mm", "mịn", "cổ điển"],
    },
    collections: ["vintage"],
    blend: "screen",
    seed: 201,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      const noise = createValueNoise2D(seed + 7, 96, 96);
      const buf = Buffer.alloc(w * h * 3);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 3;
          const clumped = noise.fbm(x / 18, y / 18, 3);
          const fine = rng();
          const v = Math.max(0, (clumped * 0.55 + fine * 0.45 - 0.58) * 185);
          const g = Math.min(255, Math.round(v));
          buf[idx] = g;
          buf[idx + 1] = Math.round(g * 0.97);
          buf[idx + 2] = Math.round(g * 0.92);
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .blur(0.6)
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-folded-quad-creases",
    name: { en: "Quarter-Folded Paper Cross Crease Lines", vi: "Nếp gấp giấy chia bốn ô chữ thập" },
    tags: {
      en: ["folded", "crease", "cross", "paper"],
      vi: ["nếp gấp", "gấp tư", "chữ thập", "giấy trắng"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 202,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      const cx = w * 0.5;
      const cy = h * 0.5;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n = noise.fbm(x / 140, y / 140, 4);
          const wobbleX = (n - 0.5) * 9;
          const wobbleY = (noise.fbm(y / 140, x / 140, 4) - 0.5) * 9;
          const dx = Math.abs(x - (cx + wobbleX));
          const dy = Math.abs(y - (cy + wobbleY));
          // Shadow ridge along vertical and horizontal fold lines
          const foldV = Math.exp(-(dx * dx) / 140) * 0.24 + Math.exp(-(dx * dx) / 1800) * 0.08;
          const foldH = Math.exp(-(dy * dy) / 140) * 0.24 + Math.exp(-(dy * dy) / 1800) * 0.08;
          const paperGrain = (noise.sample(x / 6, y / 6, 1) - 0.5) * 0.03;
          const shade = Math.max(0.62, Math.min(1.0, 0.99 - foldV - foldH + paperGrain));
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(shade * 255);
          buf[idx + 1] = Math.round(shade * 252);
          buf[idx + 2] = Math.round(shade * 246);
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-folded-eight-grid",
    name: { en: "Eight-Panel Folded Letter Paper Grid", vi: "Nếp gấp bức thư chia tám ô chữ nhật" },
    tags: {
      en: ["folded", "grid", "letter", "crease"],
      vi: ["nếp gấp", "bức thư", "chia ô", "nhật ký"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 203,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      const vLine = w * 0.5;
      const hLines = [h * 0.25, h * 0.5, h * 0.75];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n = noise.fbm(x / 120, y / 120, 4);
          const wx = (n - 0.5) * 7;
          const dx = Math.abs(x - (vLine + wx));
          let fold = Math.exp(-(dx * dx) / 110) * 0.22 + Math.exp(-(dx * dx) / 1400) * 0.06;
          for (const hl of hLines) {
            const dy = Math.abs(y - (hl + wx));
            fold += Math.exp(-(dy * dy) / 110) * 0.20 + Math.exp(-(dy * dy) / 1400) * 0.06;
          }
          const shade = Math.max(0.64, Math.min(1.0, 0.995 - fold));
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(shade * 255);
          buf[idx + 1] = Math.round(shade * 251);
          buf[idx + 2] = Math.round(shade * 244);
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-diagonal-envelope-fold",
    name: { en: "Diagonal X-Crease Paper Fold Lines", vi: "Hai đường nếp gấp chéo chữ X trên giấy trắng" },
    tags: {
      en: ["diagonal", "crease", "fold", "paper"],
      vi: ["gấp chéo", "nếp gấp", "chữ X", "giấy trắng"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 204,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n = (noise.fbm(x / 100, y / 100, 4) - 0.5) * 10;
          const yDiag1 = (y / h) * w;
          const yDiag2 = (1 - y / h) * w;
          const d1 = Math.abs(x - yDiag1 + n) * 0.7;
          const d2 = Math.abs(x - yDiag2 - n) * 0.7;
          const f1 = Math.exp(-(d1 * d1) / 120) * 0.22 + Math.exp(-(d1 * d1) / 1600) * 0.06;
          const f2 = Math.exp(-(d2 * d2) / 120) * 0.22 + Math.exp(-(d2 * d2) / 1600) * 0.06;
          const shade = Math.max(0.65, Math.min(1.0, 0.995 - f1 - f2));
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(shade * 255);
          buf[idx + 1] = Math.round(shade * 252);
          buf[idx + 2] = Math.round(shade * 245);
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-coffee-cup-ring-single",
    name: { en: "Single Espresso Cup Ring Stain on White", vi: "Vòng vết ố đáy cốc cà phê ở góc dưới" },
    tags: {
      en: ["coffee stain", "cup ring", "espresso", "journal"],
      vi: ["vết cà phê", "đáy cốc", "vết ố", "sổ tay"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 205,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      const cx = w * 0.68;
      const cy = h * 0.72;
      const radius = 245;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const warp = (noise.fbm(x / 75, y / 75, 4) - 0.5) * 26;
          const r = Math.hypot(x - cx, y - cy) + warp;
          const distToRim = Math.abs(r - radius);
          const angleMod = 0.55 + 0.45 * noise.fbm(x / 180, y / 180, 3);
          // Dark coffee rim + light interior wash
          const rim = Math.exp(-(distToRim * distToRim) / 120) * 0.48 * angleMod;
          const inner = r < radius ? 0.06 * angleMod : 0;
          // Small splatter droplets nearby
          const dDrop1 = Math.hypot(x - (cx - 290), y - (cy - 120));
          const dDrop2 = Math.hypot(x - (cx - 240), y - (cy + 190));
          const drop =
            (dDrop1 < 14 ? (1 - dDrop1 / 14) * 0.35 : 0) +
            (dDrop2 < 9 ? (1 - dDrop2 / 9) * 0.32 : 0);
          const stain = Math.min(0.68, rim + inner + drop);
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(255 * (1 - stain * 0.42));
          buf[idx + 1] = Math.round(255 * (1 - stain * 0.68));
          buf[idx + 2] = Math.round(255 * (1 - stain * 0.88));
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-coffee-double-stain",
    name: { en: "Overlapping Double Coffee Mug Rings", vi: "Hai vòng đáy cốc cà phê giao nhau ở góc trên" },
    tags: {
      en: ["coffee rings", "double stain", "cafe", "vintage"],
      vi: ["vết cà phê", "hai vòng cốc", "quán cà phê", "cổ điển"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 206,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      const c1x = w * 0.32,
        c1y = h * 0.28,
        r1 = 220;
      const c2x = w * 0.44,
        c2y = h * 0.36,
        r2 = 205;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const w1 = (noise.fbm(x / 70, y / 70, 4) - 0.5) * 22;
          const w2 = (noise.fbm((x + 200) / 70, (y + 200) / 70, 4) - 0.5) * 22;
          const d1 = Math.abs(Math.hypot(x - c1x, y - c1y) + w1 - r1);
          const d2 = Math.abs(Math.hypot(x - c2x, y - c2y) + w2 - r2);
          const mod = 0.5 + 0.5 * noise.fbm(x / 160, y / 160, 3);
          const rim1 = Math.exp(-(d1 * d1) / 110) * 0.44 * mod;
          const rim2 = Math.exp(-(d2 * d2) / 95) * 0.38 * mod;
          const stain = Math.min(0.72, rim1 + rim2);
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(255 * (1 - stain * 0.40));
          buf[idx + 1] = Math.round(255 * (1 - stain * 0.66));
          buf[idx + 2] = Math.round(255 * (1 - stain * 0.86));
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-tea-wash-blotch",
    name: { en: "Organic Dried Tea Spill Blotch", vi: "Vệt nước trà khô loang tự nhiên trên nền trắng" },
    tags: {
      en: ["tea stain", "waterblotch", "organic", "aged"],
      vi: ["vết trà", "loang màu", "ố vàng", "thủ công"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 207,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      const cx = w * 0.26,
        cy = h * 0.68,
        rad = 290;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const warp = (noise.fbm(x / 95, y / 95, 4) - 0.5) * 115;
          const d = Math.hypot(x - cx, y - cy) + warp;
          let stain = 0;
          if (d < rad) {
            const edgeDist = rad - d;
            // Pigment ring darkening at dried boundary
            const ring = Math.exp(-(edgeDist * edgeDist) / 280) * 0.28;
            const wash = 0.11 * (0.7 + 0.3 * noise.fbm(x / 60, y / 60, 3));
            stain = ring + wash;
          }
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(255 * (1 - stain * 0.28));
          buf[idx + 1] = Math.round(255 * (1 - stain * 0.54));
          buf[idx + 2] = Math.round(255 * (1 - stain * 0.78));
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-vintage-foxing-spots",
    name: { en: "Antique Book Page Foxing Spots", vi: "Đốm ố thời gian trên trang sách cổ" },
    tags: {
      en: ["foxing", "antique", "book page", "spots"],
      vi: ["đốm ố", "sách cổ", "thời gian", "giấy cũ"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 208,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 96, 96);
      const fineNoise = createValueNoise2D(seed + 19, 128, 128);
      const buf = Buffer.alloc(w * h * 3);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = Math.abs(x / w - 0.5) * 2;
          const dy = Math.abs(y / h - 0.5) * 2;
          const edgeFactor = 0.25 + 0.75 * Math.pow(Math.max(dx, dy), 1.6);
          const n1 = noise.fbm(x / 52, y / 52, 4);
          const n2 = fineNoise.fbm(x / 16, y / 16, 3);
          const combined = n1 * 0.65 + n2 * 0.35;
          const threshold = 0.66 - edgeFactor * 0.10;
          const fox = combined > threshold ? Math.min(0.52, (combined - threshold) * 2.2) : 0;
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(255 * (1 - fox * 0.28));
          buf[idx + 1] = Math.round(255 * (1 - fox * 0.56));
          buf[idx + 2] = Math.round(255 * (1 - fox * 0.82));
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-burnt-charred-edges",
    name: { en: "Warm Scorched Paper Vignette Border", vi: "Viền bốn cạnh giấy rám nắng nâu ấm" },
    tags: {
      en: ["scorched", "vignette", "border", "aged"],
      vi: ["viền giấy", "rám nắng", "nâu ấm", "cổ điển"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 209,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = Math.min(x, w - 1 - x) / (w * 0.22);
          const ny = Math.min(y, h - 1 - y) / (h * 0.22);
          const warp = (noise.fbm(x / 85, y / 85, 4) - 0.5) * 0.45;
          const d = Math.min(1, Math.min(nx, ny) + warp);
          const burn = d < 1 ? Math.pow(1 - Math.max(0, d), 2.2) * 0.58 : 0;
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(255 * (1 - burn * 0.35));
          buf[idx + 1] = Math.round(255 * (1 - burn * 0.64));
          buf[idx + 2] = Math.round(255 * (1 - burn * 0.86));
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-do-paper-fibers",
    name: { en: "Vietnamese Mulberry Dó Paper Silk Fibers", vi: "Vân sợi vỏ cây giấy dó thủ công trên nền trắng" },
    tags: {
      en: ["mulberry", "fibers", "handmade", "do paper"],
      vi: ["giấy dó", "sợi giấy", "thủ công", "truyền thống"],
    },
    collections: ["vietnam", "tet", "vintage", "journal"],
    blend: "multiply",
    seed: 210,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      let fibers = "";
      for (let i = 0; i < 380; i++) {
        const x0 = rng() * w;
        const y0 = rng() * h;
        const angle = rng() * Math.PI * 2;
        const len = 18 + rng() * 68;
        const x1 = x0 + Math.cos(angle) * len * 0.5 + (rng() - 0.5) * 16;
        const y1 = y0 + Math.sin(angle) * len * 0.5 + (rng() - 0.5) * 16;
        const x2 = x0 + Math.cos(angle) * len;
        const y2 = y0 + Math.sin(angle) * len;
        const sw = (0.7 + rng() * 1.6).toFixed(1);
        const op = (0.12 + rng() * 0.28).toFixed(2);
        fibers += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#9e8264" stroke-width="${sw}" stroke-opacity="${op}" stroke-linecap="round"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <rect width="${w}" height="${h}" fill="#ffffff"/>
        ${fibers}
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-subtle-halftone-dots",
    name: { en: "Subtle Corner Halftone Print Dots", vi: "Hạt trame in báo cổ điển mờ dần từ bốn góc" },
    tags: {
      en: ["halftone", "dots", "print", "newspaper"],
      vi: ["hạt trame", "chấm bi", "in báo", "cổ điển"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 211,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const step = 16;
      let dots = "";
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const dx = (x - w / 2) / (w / 2);
          const dy = (y - h / 2) / (h / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 0.45) continue;
          const r = Math.min(4.8, (dist - 0.45) * 5.2);
          dots += `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#5c5346" fill-opacity="0.28"/>`;
        }
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <rect width="${w}" height="${h}" fill="#ffffff"/>
        ${dots}
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-magazine-spine-wear",
    name: { en: "Vertical Magazine Center Spine Fold Wear", vi: "Nếp gấp dọc giữa trang tạp chí kèm vết sờn nhẹ" },
    tags: {
      en: ["magazine", "spine", "center fold", "crease"],
      vi: ["gáy sách", "nếp gấp dọc", "tạp chí", "vết sờn"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 212,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      const cx = w * 0.5;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = Math.abs(x - cx);
          const spineShadow = Math.exp(-(dx * dx) / 260) * 0.28 + Math.exp(-(dx * dx) / 3600) * 0.11;
          const tick = Math.sin(y / 9) > 0.7 && dx < 18 ? (1 - dx / 18) * 0.08 * noise.sample(x, y, 1) : 0;
          const shade = Math.max(0.60, Math.min(1.0, 0.995 - spineShadow - tick));
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(shade * 255);
          buf[idx + 1] = Math.round(shade * 252);
          buf[idx + 2] = Math.round(shade * 246);
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
  {
    id: "ov-aged-parchment-border",
    name: { en: "Aged Parchment Paper Corner Patina", vi: "Quầng ố vàng nâu cổ điển ở bốn góc giấy" },
    tags: {
      en: ["parchment", "patina", "aged", "corners"],
      vi: ["giấy cổ", "ố vàng", "bốn góc", "hoài niệm"],
    },
    collections: ["vintage", "journal"],
    blend: "multiply",
    seed: 213,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h, seed) => {
      const noise = createValueNoise2D(seed, 64, 64);
      const buf = Buffer.alloc(w * h * 3);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = (x - w * 0.5) / (w * 0.5);
          const dy = (y - h * 0.5) / (h * 0.5);
          const r = Math.hypot(dx, dy);
          const cloud = noise.fbm(x / 110, y / 110, 4);
          const patina = Math.max(0, (r - 0.52) * 0.55 * (0.6 + 0.6 * cloud));
          const idx = (y * w + x) * 3;
          buf[idx] = Math.round(255 * (1 - patina * 0.24));
          buf[idx + 1] = Math.round(255 * (1 - patina * 0.46));
          buf[idx + 2] = Math.round(255 * (1 - patina * 0.72));
        }
      }
      await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
        .png({ compressionLevel: 6 })
        .toFile(outPath);
    },
  },
];

// ============================================================================
// PACK 3: lens-flares (blend: "screen", pure black background, 20 items)
// ============================================================================

function polyPoints(cx, cy, r, sides = 6, rotDeg = 15) {
  const pts = [];
  const rot = (rotDeg * Math.PI) / 180;
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * 2 * Math.PI) / sides;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function starNeedles(cx, cy, spikes, rLong, rShort, width, rotDeg = 0, fill = "#ffffff", opacity = 0.85) {
  let out = "";
  for (let i = 0; i < spikes; i++) {
    const a = ((rotDeg + (i * 360) / spikes) * Math.PI) / 180;
    const len = i % 2 === 0 ? rLong : rShort;
    const tx = cx + Math.cos(a) * len;
    const ty = cy + Math.sin(a) * len;
    const px = -Math.sin(a) * width;
    const py = Math.cos(a) * width;
    out += `<polygon points="${(cx + px).toFixed(1)},${(cy + py).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${(cx - px).toFixed(1)},${(cy - py).toFixed(1)}" fill="${fill}" fill-opacity="${opacity}"/>`;
  }
  return out;
}

function ghostChainSvg(sx, sy, tx, ty, specs) {
  let out = "";
  const dx = tx - sx;
  const dy = ty - sy;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  for (const g of specs) {
    const gx = sx + dx * g.t;
    const gy = sy + dy * g.t;
    const sides = g.sides || 6;
    const pts = polyPoints(gx, gy, g.r, sides, angleDeg + (g.rot || 0));
    if (g.ring) {
      out += `<polygon points="${pts}" fill="${g.col}" fill-opacity="${(g.op * 0.25).toFixed(2)}" stroke="${g.col}" stroke-width="${g.sw || 3}" stroke-opacity="${g.op}"/>`;
    } else {
      out += `<polygon points="${pts}" fill="${g.col}" fill-opacity="${g.op}" stroke="${g.col}" stroke-width="1.5" stroke-opacity="${Math.min(1, g.op * 1.4).toFixed(2)}"/>`;
    }
  }
  return out;
}

const FLARE_ITEMS = [
  {
    id: "ov-flare-helios-swirl-gold",
    name: { en: "Vintage Helios Swirly Golden Ring Flare", vi: "Quầng lóe xoáy ống kính cổ Helios vàng ấm" },
    tags: {
      en: ["lens flare", "helios", "swirl", "golden", "vintage"],
      vi: ["lóe ống kính", "xoáy", "vàng ấm", "cổ điển", "helios"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 301,
    width: 1200,
    height: 1200,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="hcore" cx="18%" cy="16%" r="48%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="16%" stop-color="#ffe8a3" stop-opacity="0.88"/>
            <stop offset="44%" stop-color="#ff8c24" stop-opacity="0.44"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="hring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="68%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="79%" stop-color="#ff7722" stop-opacity="0.32"/>
            <stop offset="86%" stop-color="#ffe484" stop-opacity="0.72"/>
            <stop offset="92%" stop-color="#68d8ff" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="hmaskg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="55%" stop-color="#ffffff" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9"/>
          </linearGradient>
          <mask id="hm"><rect width="${w}" height="${h}" fill="url(#hmaskg)"/></mask>
          <filter id="hb"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <ellipse cx="620" cy="610" rx="510" ry="440" transform="rotate(-24 620 610)" fill="url(#hring)" mask="url(#hm)" filter="url(#hb)"/>
        <rect width="${w}" height="${h}" fill="url(#hcore)"/>
        <g filter="url(#hb)">
          ${ghostChainSvg(216, 192, 980, 1010, [
            { t: 0.28, r: 52, col: "#ffd27a", op: 0.34, sides: 8 },
            { t: 0.46, r: 94, col: "#ff9442", op: 0.28, sides: 8, ring: true, sw: 4 },
            { t: 0.68, r: 64, col: "#82f0c8", op: 0.26, sides: 8 },
            { t: 0.88, r: 132, col: "#ffc46b", op: 0.24, sides: 8, ring: true, sw: 5 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-hex-aperture-chain",
    name: { en: "Hexagonal Aperture Ghost Chain Sun Flare", vi: "Chuỗi phản xạ lá khẩu lục giác nắng chiều" },
    tags: {
      en: ["hexagonal", "aperture", "lens flare", "sun", "ghosts"],
      vi: ["lá khẩu", "lục giác", "phản xạ", "nắng chiều", "ống kính"],
    },
    collections: ["summer", "vintage"],
    blend: "screen",
    seed: 302,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const sx = 145, sy = 165, tx = 995, ty = 1260;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="sunc" cx="13%" cy="12%" r="46%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="15%" stop-color="#fff0b8" stop-opacity="0.92"/>
            <stop offset="42%" stop-color="#ff8e2b" stop-opacity="0.46"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="gb"><feGaussianBlur stdDeviation="6"/></filter>
          <filter id="sb"><feGaussianBlur stdDeviation="2.5"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#sunc)"/>
        <g filter="url(#sb)">${starNeedles(sx, sy, 12, 340, 165, 5, 12, "#fff5d6", 0.72)}</g>
        <g filter="url(#gb)">
          ${ghostChainSvg(sx, sy, tx, ty, [
            { t: 0.18, r: 36, col: "#ffe89e", op: 0.42, sides: 6 },
            { t: 0.31, r: 68, col: "#ff9b42", op: 0.32, sides: 6, ring: true, sw: 4 },
            { t: 0.44, r: 44, col: "#74f2ce", op: 0.34, sides: 6 },
            { t: 0.58, r: 108, col: "#ffc864", op: 0.26, sides: 6, ring: true, sw: 5 },
            { t: 0.71, r: 58, col: "#ff6e8e", op: 0.30, sides: 6 },
            { t: 0.85, r: 88, col: "#ffe082", op: 0.28, sides: 6 },
            { t: 1.02, r: 156, col: "#ff8c3b", op: 0.22, sides: 6, ring: true, sw: 6 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-octa-chromatic-ghosts",
    name: { en: "Multi-Coated Octagonal Chromatic Lens Ghosts", vi: "Phản xạ lá khẩu bát giác tán sắc lục lam" },
    tags: {
      en: ["octagonal", "multi-coated", "lens flare", "cyan", "emerald"],
      vi: ["bát giác", "tráng phủ", "lục lam", "phản xạ", "thấu kính"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 303,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const sx = 960, sy = 180, tx = 140, ty = 1240;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="oc" cx="86%" cy="13%" r="44%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="18%" stop-color="#d4fff5" stop-opacity="0.86"/>
            <stop offset="48%" stop-color="#2ad4b8" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="ob"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#oc)"/>
        <g filter="url(#ob)">
          ${ghostChainSvg(sx, sy, tx, ty, [
            { t: 0.20, r: 48, col: "#64ffda", op: 0.36, sides: 8 },
            { t: 0.35, r: 92, col: "#38b6ff", op: 0.30, sides: 8, ring: true, sw: 4 },
            { t: 0.50, r: 62, col: "#b388ff", op: 0.32, sides: 8 },
            { t: 0.64, r: 118, col: "#4ce8b5", op: 0.26, sides: 8, ring: true, sw: 5 },
            { t: 0.79, r: 74, col: "#ffd56b", op: 0.30, sides: 8 },
            { t: 0.95, r: 152, col: "#52abff", op: 0.24, sides: 8, ring: true, sw: 6 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-anamorphic-cyan-double",
    name: { en: "Dual Horizontal Anamorphic Cyan Sci-Fi Flare", vi: "Tia lóe ngang điện ảnh kép màu xanh băng" },
    tags: {
      en: ["anamorphic", "cyan", "horizontal", "cinematic", "flare"],
      vi: ["tia sáng ngang", "điện ảnh", "xanh băng", "anamorphic", "lóe sáng"],
    },
    collections: ["vintage"],
    blend: "screen",
    seed: 304,
    width: 1400,
    height: 1050,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="ac1" cx="32%" cy="28%" r="34%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="18%" stop-color="#a8f5ff" stop-opacity="0.82"/>
            <stop offset="50%" stop-color="#0088ff" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="ac2" cx="74%" cy="68%" r="28%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92"/>
            <stop offset="22%" stop-color="#80deea" stop-opacity="0.72"/>
            <stop offset="55%" stop-color="#1e56ff" stop-opacity="0.24"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="abar" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="12%" stop-color="#0077ff" stop-opacity="0.42"/>
            <stop offset="32%" stop-color="#ffffff" stop-opacity="0.95"/>
            <stop offset="68%" stop-color="#4dd0e1" stop-opacity="0.65"/>
            <stop offset="92%" stop-color="#0066ff" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
          <filter id="ab1"><feGaussianBlur stdDeviation="16"/></filter>
          <filter id="ab2"><feGaussianBlur stdDeviation="3.5"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#ac1)"/>
        <rect width="${w}" height="${h}" fill="url(#ac2)"/>
        <ellipse cx="700" cy="294" rx="680" ry="30" fill="url(#abar)" filter="url(#ab1)"/>
        <ellipse cx="700" cy="294" rx="660" ry="6" fill="url(#abar)" filter="url(#ab2)"/>
        <ellipse cx="740" cy="714" rx="620" ry="24" fill="url(#abar)" filter="url(#ab1)" opacity="0.82"/>
        <ellipse cx="740" cy="714" rx="600" ry="5" fill="url(#abar)" filter="url(#ab2)" opacity="0.88"/>
        <ellipse cx="920" cy="294" rx="95" ry="38" fill="none" stroke="#64ffda" stroke-width="3" stroke-opacity="0.36" filter="url(#ab2)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-anamorphic-amber-cinema",
    name: { en: "Warm Amber Gold Anamorphic Cinema Flare", vi: "Tia lóe ngang điện ảnh vàng hổ phách" },
    tags: {
      en: ["anamorphic", "amber", "gold", "cinema", "streak"],
      vi: ["tia lóe ngang", "hổ phách", "vàng kim", "điện ảnh", "ấm áp"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 305,
    width: 1400,
    height: 1050,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="amc" cx="46%" cy="48%" r="42%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="16%" stop-color="#ffe596" stop-opacity="0.86"/>
            <stop offset="45%" stop-color="#ff7b1c" stop-opacity="0.36"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="ambar" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="14%" stop-color="#ff6600" stop-opacity="0.45"/>
            <stop offset="46%" stop-color="#fff8dc" stop-opacity="0.96"/>
            <stop offset="82%" stop-color="#ff8811" stop-opacity="0.48"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
          <filter id="amb1"><feGaussianBlur stdDeviation="18"/></filter>
          <filter id="amb2"><feGaussianBlur stdDeviation="3.5"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#amc)"/>
        <ellipse cx="680" cy="504" rx="680" ry="38" fill="url(#ambar)" filter="url(#amb1)"/>
        <ellipse cx="680" cy="504" rx="660" ry="7" fill="url(#ambar)" filter="url(#amb2)"/>
        <ellipse cx="320" cy="504" rx="110" ry="48" fill="#ffb74d" fill-opacity="0.22" stroke="#ffd54f" stroke-width="3" stroke-opacity="0.45" filter="url(#amb2)"/>
        <ellipse cx="1040" cy="504" rx="140" ry="56" fill="none" stroke="#ff9800" stroke-width="4" stroke-opacity="0.38" filter="url(#amb2)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-anamorphic-rose-neon",
    name: { en: "Neon Rose & Violet Anamorphic Lens Streak", vi: "Tia lóe ngang hồng tím neon hiện đại" },
    tags: {
      en: ["anamorphic", "neon", "rose", "violet", "cyber"],
      vi: ["tia lóe", "hồng tím", "neon", "điện ảnh", "ban đêm"],
    },
    collections: ["cute", "vintage"],
    blend: "screen",
    seed: 306,
    width: 1400,
    height: 1050,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="rnc" cx="62%" cy="38%" r="40%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="18%" stop-color="#ffb2e6" stop-opacity="0.84"/>
            <stop offset="50%" stop-color="#9c27b0" stop-opacity="0.36"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="rnbar" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="16%" stop-color="#7c4dff" stop-opacity="0.52"/>
            <stop offset="62%" stop-color="#ffffff" stop-opacity="0.96"/>
            <stop offset="88%" stop-color="#ff4081" stop-opacity="0.58"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
          <filter id="rnb1"><feGaussianBlur stdDeviation="16"/></filter>
          <filter id="rnb2"><feGaussianBlur stdDeviation="3.5"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#rnc)"/>
        <ellipse cx="700" cy="399" rx="680" ry="34" fill="url(#rnbar)" filter="url(#rnb1)"/>
        <ellipse cx="700" cy="399" rx="660" ry="6.5" fill="url(#rnbar)" filter="url(#rnb2)"/>
        <ellipse cx="420" cy="399" rx="96" ry="42" fill="#e040fb" fill-opacity="0.22" stroke="#ff80ab" stroke-width="3" stroke-opacity="0.45" filter="url(#rnb2)"/>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-sunset-corner-burst",
    name: { en: "Blazing Sunset Corner Starburst Lens Flare", vi: "Nắng hoàng hôn bùng sáng góc trái kèm tia sao" },
    tags: {
      en: ["sunset", "starburst", "corner flare", "warm", "sun"],
      vi: ["hoàng hôn", "tia sao", "quầng nắng", "góc trái", "rực rỡ"],
    },
    collections: ["summer", "vintage"],
    blend: "screen",
    seed: 307,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const sx = 85, sy = 95;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="scb" cx="8%" cy="7%" r="68%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="16%" stop-color="#ffe58f" stop-opacity="0.92"/>
            <stop offset="42%" stop-color="#ff6d1f" stop-opacity="0.54"/>
            <stop offset="75%" stop-color="#9e1900" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="scblur"><feGaussianBlur stdDeviation="4"/></filter>
          <filter id="gblur"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#scb)"/>
        <g filter="url(#scblur)">${starNeedles(sx, sy, 16, 620, 280, 7, 8, "#fff2c2", 0.78)}</g>
        <g filter="url(#gblur)">
          ${ghostChainSvg(sx, sy, 980, 1280, [
            { t: 0.32, r: 54, col: "#ffd166", op: 0.34, sides: 6 },
            { t: 0.52, r: 112, col: "#ff7b29", op: 0.28, sides: 6, ring: true, sw: 5 },
            { t: 0.74, r: 68, col: "#64dfdf", op: 0.28, sides: 6 },
            { t: 0.92, r: 148, col: "#ffb703", op: 0.24, sides: 6, ring: true, sw: 6 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-morning-peach-corner",
    name: { en: "Dreamy Morning Peach & Champagne Corner Glow", vi: "Quầng nắng sớm hồng đào dịu góc phải" },
    tags: {
      en: ["morning", "peach", "champagne", "soft flare", "wedding"],
      vi: ["nắng sớm", "hồng đào", "dịu dàng", "lãng mạn", "góc phải"],
    },
    collections: ["wedding", "cute", "summer"],
    blend: "screen",
    seed: 308,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const sx = w - 95, sy = 110;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="mp1" cx="92%" cy="8%" r="66%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="20%" stop-color="#ffe4d6" stop-opacity="0.88"/>
            <stop offset="48%" stop-color="#ff9ebb" stop-opacity="0.46"/>
            <stop offset="80%" stop-color="#d46a92" stop-opacity="0.14"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="mpb"><feGaussianBlur stdDeviation="9"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#mp1)"/>
        <g filter="url(#mpb)">
          <circle cx="720" cy="440" r="88" fill="#ffd6e0" fill-opacity="0.24" stroke="#ffacc5" stroke-width="3" stroke-opacity="0.42"/>
          <circle cx="520" cy="690" r="142" fill="#fff0c2" fill-opacity="0.16" stroke="#ffe099" stroke-width="4" stroke-opacity="0.36"/>
          <circle cx="310" cy="960" r="96" fill="#ffc2d4" fill-opacity="0.24" stroke="#ff9ebb" stroke-width="3" stroke-opacity="0.38"/>
          <circle cx="170" cy="1150" r="175" fill="none" stroke="#ffd6a5" stroke-width="5" stroke-opacity="0.28"/>
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-rainbow-prism-arc",
    name: { en: "Spectral Rainbow Diffraction Arc Lens Flare", vi: "Cung tròn cầu vồng tán sắc quang học" },
    tags: {
      en: ["rainbow", "prism arc", "diffraction", "spectrum", "flare"],
      vi: ["cầu vồng", "cung tròn", "tán sắc", "quang học", "lăng kính"],
    },
    collections: ["summer", "cute"],
    blend: "screen",
    seed: 309,
    width: 1200,
    height: 1200,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="parc" cx="18%" cy="18%" r="72%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>
            <stop offset="14%" stop-color="#fff3b0" stop-opacity="0.72"/>
            <stop offset="35%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="66%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="71%" stop-color="#ff3b56" stop-opacity="0.48"/>
            <stop offset="75%" stop-color="#ffaa2b" stop-opacity="0.54"/>
            <stop offset="79%" stop-color="#ffee4a" stop-opacity="0.56"/>
            <stop offset="83%" stop-color="#38e884" stop-opacity="0.50"/>
            <stop offset="87%" stop-color="#36a2ff" stop-opacity="0.52"/>
            <stop offset="91%" stop-color="#a64dff" stop-opacity="0.46"/>
            <stop offset="96%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="pb"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#parc)" filter="url(#pb)"/>
        <g filter="url(#pb)">${starNeedles(216, 216, 8, 220, 110, 4, 22, "#ffffff", 0.85)}</g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-crystal-diamond-star",
    name: { en: "Eight-Point Crystal Diamond Starburst Flare", vi: "Tia sao kim cương tám cánh kèm vòng sáng" },
    tags: {
      en: ["starburst", "diamond", "crystal", "eight point", "flare"],
      vi: ["tia sao", "kim cương", "tám cánh", "lấp lánh", "quầng sáng"],
    },
    collections: ["wedding", "christmas", "cute"],
    blend: "screen",
    seed: 310,
    width: 1200,
    height: 1200,
    render: async (outPath, w, h) => {
      const cx = 340, cy = 320;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="dcore" cx="28.3%" cy="26.6%" r="36%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="18%" stop-color="#e8f4ff" stop-opacity="0.86"/>
            <stop offset="48%" stop-color="#94b8ff" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="dring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="76%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="85%" stop-color="#ffd180" stop-opacity="0.42"/>
            <stop offset="92%" stop-color="#b388ff" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="db"><feGaussianBlur stdDeviation="3"/></filter>
          <filter id="db2"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <circle cx="${cx}" cy="${cy}" r="250" fill="url(#dring)" filter="url(#db2)"/>
        <rect width="${w}" height="${h}" fill="url(#dcore)"/>
        <g filter="url(#db)">${starNeedles(cx, cy, 8, 420, 210, 6, 0, "#ffffff", 0.92)}</g>
        <g filter="url(#db2)">
          ${ghostChainSvg(cx, cy, 980, 960, [
            { t: 0.42, r: 58, col: "#82b1ff", op: 0.32, sides: 8 },
            { t: 0.72, r: 96, col: "#ea80fc", op: 0.28, sides: 8, ring: true, sw: 4 },
            { t: 0.98, r: 64, col: "#ffd180", op: 0.30, sides: 8 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-vintage-amber-ring",
    name: { en: "Single-Coated Vintage Amber Ring Lens Flare", vi: "Vòng quầng sáng hổ phách ống kính cổ điển" },
    tags: {
      en: ["amber ring", "vintage lens", "warm", "flare", "retro"],
      vi: ["vòng sáng", "hổ phách", "ống kính cổ", "hoài niệm", "ấm áp"],
    },
    collections: ["vintage"],
    blend: "screen",
    seed: 311,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="var1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffaa33" stop-opacity="0.08"/>
            <stop offset="70%" stop-color="#ff8811" stop-opacity="0.12"/>
            <stop offset="86%" stop-color="#ffb84d" stop-opacity="0.62"/>
            <stop offset="94%" stop-color="#ff5500" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="vaspot" cx="76%" cy="22%" r="38%">
            <stop offset="0%" stop-color="#fff8dc" stop-opacity="0.96"/>
            <stop offset="28%" stop-color="#ff9e2c" stop-opacity="0.64"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="vab"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <circle cx="540" cy="680" r="460" fill="url(#var1)" filter="url(#vab)"/>
        <rect width="${w}" height="${h}" fill="url(#vaspot)"/>
        <g filter="url(#vab)">
          <circle cx="420" cy="860" r="78" fill="#ffb74d" fill-opacity="0.30"/>
          <circle cx="260" cy="1090" r="124" fill="#ff8a00" fill-opacity="0.22" stroke="#ffd180" stroke-width="4" stroke-opacity="0.42"/>
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-emerald-green-coating",
    name: { en: "Emerald Green Multi-Coating Lens Reflection", vi: "Phản xạ lớp tráng phủ xanh ngọc lục bảo" },
    tags: {
      en: ["emerald", "green coating", "lens reflection", "optical", "flare"],
      vi: ["xanh ngọc", "tráng phủ", "phản xạ", "thấu kính", "điện ảnh"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 312,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const sx = 210, sy = 240, tx = 920, ty = 1180;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="egc" cx="19%" cy="17%" r="38%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>
            <stop offset="22%" stop-color="#b9f6ca" stop-opacity="0.78"/>
            <stop offset="55%" stop-color="#00c853" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="egb"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#egc)"/>
        <g filter="url(#egb)">
          <line x1="-40" y1="80" x2="1160" y2="1040" stroke="#69f0ae" stroke-width="8" stroke-opacity="0.38"/>
          ${ghostChainSvg(sx, sy, tx, ty, [
            { t: 0.24, r: 54, col: "#69f0ae", op: 0.38, sides: 7 },
            { t: 0.44, r: 98, col: "#00e676", op: 0.30, sides: 7, ring: true, sw: 4 },
            { t: 0.65, r: 68, col: "#1de9b6", op: 0.34, sides: 7 },
            { t: 0.84, r: 128, col: "#a7ffeb", op: 0.25, sides: 7, ring: true, sw: 5 },
            { t: 1.02, r: 82, col: "#ffd740", op: 0.28, sides: 7 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-magenta-violet-dream",
    name: { en: "Twilight Magenta & Lavender Optical Flare", vi: "Quầng lóe tím hồng mộng mơ chiều tà" },
    tags: {
      en: ["magenta", "violet", "lavender", "twilight", "flare"],
      vi: ["tím hồng", "chiều tà", "mộng mơ", "quầng sáng", "lãng mạn"],
    },
    collections: ["cute", "wedding", "vintage"],
    blend: "screen",
    seed: 313,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const sx = 890, sy = 230, tx = 180, ty = 1190;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="mvd" cx="80%" cy="16%" r="52%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>
            <stop offset="20%" stop-color="#ffd1f7" stop-opacity="0.84"/>
            <stop offset="52%" stop-color="#d500f9" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="mvb"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#mvd)"/>
        <g filter="url(#mvb)">
          ${ghostChainSvg(sx, sy, tx, ty, [
            { t: 0.26, r: 58, col: "#ff80ab", op: 0.36, sides: 6 },
            { t: 0.48, r: 106, col: "#ea80fc", op: 0.30, sides: 6, ring: true, sw: 4 },
            { t: 0.70, r: 72, col: "#b388ff", op: 0.34, sides: 6 },
            { t: 0.92, r: 144, col: "#ff4081", op: 0.26, sides: 6, ring: true, sw: 5 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-top-edge-sun-wash",
    name: { en: "Top Edge Blazing Sun Wash & Vertical Ghosts", vi: "Ánh mặt trời tràn viền đỉnh kèm bóng thấu kính dọc" },
    tags: {
      en: ["top sun", "sun wash", "backlit", "vertical flare", "golden"],
      vi: ["ngược sáng", "tràn viền", "đỉnh ảnh", "nắng vàng", "thấu kính"],
    },
    collections: ["summer", "wedding", "vintage"],
    blend: "screen",
    seed: 314,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const cx = Math.round(w * 0.5);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="tsw" cx="50%" cy="0%" r="62%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="22%" stop-color="#ffe89e" stop-opacity="0.90"/>
            <stop offset="54%" stop-color="#ff8c24" stop-opacity="0.44"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="tsb"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#tsw)"/>
        <g filter="url(#tsb)">
          ${ghostChainSvg(cx, 20, cx, 1320, [
            { t: 0.30, r: 64, col: "#ffe082", op: 0.34, sides: 8 },
            { t: 0.50, r: 118, col: "#ff9e40", op: 0.28, sides: 8, ring: true, sw: 4 },
            { t: 0.70, r: 56, col: "#64ffda", op: 0.28, sides: 8 },
            { t: 0.88, r: 154, col: "#ffd54f", op: 0.24, sides: 8, ring: true, sw: 5 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-bottom-golden-haze",
    name: { en: "Bottom Edge Rising Golden Horizon Flare", vi: "Quầng sáng ngược nắng ấm tràn từ cạnh dưới" },
    tags: {
      en: ["bottom flare", "horizon", "golden haze", "warm", "backlit"],
      vi: ["cạnh dưới", "chân trời", "ngược nắng", "vàng ấm", "quầng sáng"],
    },
    collections: ["summer", "vintage"],
    blend: "screen",
    seed: 315,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="bgh" cx="52%" cy="98%" r="64%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="22%" stop-color="#ffdf85" stop-opacity="0.88"/>
            <stop offset="55%" stop-color="#ff6f1e" stop-opacity="0.46"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="bgb"><feGaussianBlur stdDeviation="9"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#bgh)"/>
        <g filter="url(#bgb)">
          <circle cx="550" cy="960" r="95" fill="#ffd166" fill-opacity="0.28" stroke="#ffe599" stroke-width="3" stroke-opacity="0.42"/>
          <circle cx="530" cy="680" r="145" fill="none" stroke="#ff9f43" stroke-width="5" stroke-opacity="0.34"/>
          <circle cx="515" cy="410" r="76" fill="#72efdd" fill-opacity="0.24"/>
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-diagonal-cross-star",
    name: { en: "Golden X-Cross Star Filter Diffraction Trio", vi: "Bộ ba tia sao chữ X ánh vàng kim lấp lánh" },
    tags: {
      en: ["star filter", "cross screen", "golden", "sparkle", "flare"],
      vi: ["kính lọc sao", "chữ X", "vàng kim", "lấp lánh", "tia sáng"],
    },
    collections: ["christmas", "wedding", "tet"],
    blend: "screen",
    seed: 316,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="xg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="25%" stop-color="#ffe58f" stop-opacity="0.78"/>
            <stop offset="65%" stop-color="#ff9922" stop-opacity="0.26"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="xb"><feGaussianBlur stdDeviation="3"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <circle cx="290" cy="340" r="210" fill="url(#xg)"/>
        <circle cx="820" cy="580" r="160" fill="url(#xg)"/>
        <circle cx="410" cy="1020" r="185" fill="url(#xg)"/>
        <g filter="url(#xb)">
          ${starNeedles(290, 340, 4, 380, 380, 6, 45, "#fff8e1", 0.9)}
          ${starNeedles(290, 340, 4, 170, 170, 4, 0, "#ffd54f", 0.75)}
          ${starNeedles(820, 580, 4, 290, 290, 5, 45, "#fff8e1", 0.88)}
          ${starNeedles(410, 1020, 4, 320, 320, 5, 45, "#fff8e1", 0.88)}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-double-sun-reflection",
    name: { en: "Twin Sun Filter Reflection & Intersecting Rings", vi: "Phản xạ kép mặt trời và hai vòng sáng giao nhau" },
    tags: {
      en: ["double sun", "twin reflection", "rings", "optical", "flare"],
      vi: ["phản xạ kép", "vòng giao nhau", "mặt trời", "thấu kính", "nắng ấm"],
    },
    collections: ["summer", "vintage"],
    blend: "screen",
    seed: 317,
    width: 1200,
    height: 1200,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="ds1" cx="26%" cy="28%" r="36%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="22%" stop-color="#ffe494" stop-opacity="0.84"/>
            <stop offset="58%" stop-color="#ff7e29" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="ds2" cx="44%" cy="46%" r="26%">
            <stop offset="0%" stop-color="#fff4c4" stop-opacity="0.88"/>
            <stop offset="35%" stop-color="#ff9933" stop-opacity="0.48"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="dsb"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#ds1)"/>
        <rect width="${w}" height="${h}" fill="url(#ds2)"/>
        <g filter="url(#dsb)">
          <circle cx="530" cy="550" r="280" fill="none" stroke="#ffbe55" stroke-width="5" stroke-opacity="0.48"/>
          <circle cx="760" cy="780" r="240" fill="none" stroke="#64dfdf" stroke-width="4" stroke-opacity="0.42"/>
          <circle cx="910" cy="920" r="85" fill="#ff9f43" fill-opacity="0.28"/>
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-soft-pastel-iridescent",
    name: { en: "Soft Pastel Iridescent Pearl Lens Veil", vi: "Quầng khúc xạ ngũ sắc pastel dịu nhẹ" },
    tags: {
      en: ["iridescent", "pastel", "pearl", "dreamy", "flare"],
      vi: ["ngũ sắc", "pastel", "dịu nhẹ", "mộng mơ", "khúc xạ"],
    },
    collections: ["cute", "wedding"],
    blend: "screen",
    seed: 318,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="ip1" cx="20%" cy="24%" r="58%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92"/>
            <stop offset="28%" stop-color="#ffd6e8" stop-opacity="0.68"/>
            <stop offset="56%" stop-color="#c8b6ff" stop-opacity="0.42"/>
            <stop offset="82%" stop-color="#9bf6ff" stop-opacity="0.26"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="ip2" cx="78%" cy="76%" r="52%">
            <stop offset="0%" stop-color="#fdffb6" stop-opacity="0.64"/>
            <stop offset="45%" stop-color="#ffc6ff" stop-opacity="0.38"/>
            <stop offset="78%" stop-color="#a0c4ff" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="ipb"><feGaussianBlur stdDeviation="10"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#ip1)"/>
        <rect width="${w}" height="${h}" fill="url(#ip2)"/>
        <g filter="url(#ipb)">
          <circle cx="560" cy="680" r="260" fill="none" stroke="#ffccf9" stroke-width="6" stroke-opacity="0.38"/>
          <circle cx="560" cy="680" r="272" fill="none" stroke="#a0e7e5" stroke-width="5" stroke-opacity="0.34"/>
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-golden-dust-halo",
    name: { en: "Sunlit Golden Halo Ring with Floating Micro Orbs", vi: "Vòng hào quang nắng vàng điểm hạt bụi sáng" },
    tags: {
      en: ["golden halo", "micro orbs", "sunlit", "dust flare", "warm"],
      vi: ["hào quang", "hạt sáng", "nắng vàng", "vòng sáng", "lung linh"],
    },
    collections: ["summer", "vintage", "wedding"],
    blend: "screen",
    seed: 319,
    width: 1200,
    height: 1200,
    render: async (outPath, w, h, seed) => {
      const rng = mulberry32(seed);
      let orbs = "";
      for (let i = 0; i < 28; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = 310 + (rng() - 0.5) * 180;
        const ox = Math.round(600 + Math.cos(angle) * dist);
        const oy = Math.round(600 + Math.sin(angle) * dist);
        const r = Math.round(10 + rng() * 36);
        const op = (0.18 + rng() * 0.42).toFixed(2);
        orbs += `<circle cx="${ox}" cy="${oy}" r="${r}" fill="#ffe599" fill-opacity="${op}" stroke="#fff3cc" stroke-width="1.5" stroke-opacity="${op}"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="gdh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="48%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="58%" stop-color="#ffaa33" stop-opacity="0.48"/>
            <stop offset="64%" stop-color="#fff0b3" stop-opacity="0.68"/>
            <stop offset="72%" stop-color="#ff6611" stop-opacity="0.34"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="gdb"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <circle cx="600" cy="600" r="540" fill="url(#gdh)" filter="url(#gdb)"/>
        <g filter="url(#gdb)">${orbs}</g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
  {
    id: "ov-flare-cinema-edge-veil",
    name: { en: "Curved Backlit Lens Edge Veil & Warm Ghosts", vi: "Màn sương lóe sáng viền ống kính ngược nắng" },
    tags: {
      en: ["edge veil", "lens glare", "backlit", "cinema", "warm"],
      vi: ["viền ống kính", "ngược nắng", "màn sáng", "điện ảnh", "ấm áp"],
    },
    collections: ["vintage", "summer"],
    blend: "screen",
    seed: 320,
    width: 1120,
    height: 1400,
    render: async (outPath, w, h) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <radialGradient id="cev" cx="-12%" cy="42%" r="72%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="24%" stop-color="#ffdf94" stop-opacity="0.82"/>
            <stop offset="48%" stop-color="#ff7828" stop-opacity="0.45"/>
            <stop offset="68%" stop-color="#58b8ff" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
          <filter id="cevb"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <rect width="${w}" height="${h}" fill="#000000"/>
        <rect width="${w}" height="${h}" fill="url(#cev)"/>
        <g filter="url(#cevb)">
          ${ghostChainSvg(20, 588, 1020, 820, [
            { t: 0.34, r: 64, col: "#ffd180", op: 0.32, sides: 6 },
            { t: 0.58, r: 116, col: "#ff9e40", op: 0.26, sides: 6, ring: true, sw: 4 },
            { t: 0.82, r: 78, col: "#80d8ff", op: 0.28, sides: 6 },
          ])}
        </g>
      </svg>`;
      await renderSvgToPng(svg, outPath, w, h);
    },
  },
];

async function buildPack(packId, generatedSpecs, packMeta = null) {
  const packDir = path.join(ASSETS, "overlay", packId);
  const srcDir = path.join(packDir, "src");
  mkdirSync(srcDir, { recursive: true });

  const manifestPath = path.join(packDir, "manifest.json");
  let manifest;
  if (existsSync(manifestPath)) {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } else {
    manifest = {
      id: packId,
      kind: "overlay",
      ...packMeta,
      items: [],
    };
  }

  // Ensure existing kept items have a source copy in src/ so process.mjs can run cleanly.
  const keptIds = new Set(["ov-amber-street-bokeh", "ov-crumpled-paper-creases", "ov-scrunched-kraft-folds", "ov-linen-watermark-grain"]);
  const keptItems = manifest.items.filter((it) => keptIds.has(it.id));

  for (const item of keptItems) {
    const existingWebp = path.join(PACKS, "overlay", packId, `${item.id}.webp`);
    const srcCopy = path.join(srcDir, `${item.id}.webp`);
    if (existsSync(existingWebp) && !existsSync(srcCopy)) {
      copyFileSync(existingWebp, srcCopy);
    }
  }

  const newItems = [];
  for (const spec of generatedSpecs) {
    const outPng = path.join(srcDir, `${spec.id}.png`);
    await spec.render(outPng, spec.width, spec.height, spec.seed);
    newItems.push({
      id: spec.id,
      name: spec.name,
      tags: spec.tags,
      collections: spec.collections,
      blend: spec.blend,
      source: makeSource(`${spec.name.en} (seed ${spec.seed})`),
      width: spec.width,
      height: spec.height,
    });
    console.log(`  Generated overlay src: ${packId}/${spec.id}.png`);
  }

  manifest.items = [...keptItems, ...newItems];
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

await buildPack("lens-flares", FLARE_ITEMS, {
  name: {
    en: "Optical Lens Flares & Glows",
    vi: "Lóe ống kính & Quầng sáng quang học",
  },
  collections: ["vintage", "summer", "wedding", "cute"],
  order: 8,
});
await buildPack("light-effects", LIGHT_ITEMS);
await buildPack("film-paper-grain", PAPER_ITEMS);
console.log("Done generating 49 procedural overlays (+ 4 kept = 53 total).");
