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

async function buildPack(packId, generatedSpecs) {
  const packDir = path.join(ASSETS, "overlay", packId);
  const srcDir = path.join(packDir, "src");
  mkdirSync(srcDir, { recursive: true });

  const manifestPath = path.join(packDir, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

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

await buildPack("light-effects", LIGHT_ITEMS);
await buildPack("film-paper-grain", PAPER_ITEMS);
console.log("Done generating 29 procedural overlays (+ 4 kept = 33 total).");
