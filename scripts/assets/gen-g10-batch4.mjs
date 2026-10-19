import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.cwd();

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function syncExistingSrc(kind, packId) {
  const dir = path.join(ROOT, 'assets', kind, packId);
  const srcDir = path.join(dir, 'src');
  ensureDir(srcDir);
  const pubDir = path.join(ROOT, 'public', 'packs', kind, packId);
  const manifestPath = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const oldDate = new Date(1000000000000);
  for (const item of manifest.items) {
    const pubWebp = path.join(pubDir, `${item.id}.webp`);
    if (fs.existsSync(pubWebp)) {
      for (const ext of ['.png', '.jpg', '.jpeg', '.svg', '.webp']) {
        const p = path.join(srcDir, `${item.id}${ext}`);
        if (fs.existsSync(p) && ext !== '.webp') fs.unlinkSync(p);
      }
      const destWebp = path.join(srcDir, `${item.id}.webp`);
      fs.copyFileSync(pubWebp, destWebp);
      fs.utimesSync(destWebp, oldDate, oldDate);
    }
  }
}

// 14 new Optical Lens Flares (screen blend on pure black #000000)
const LENS_FLARES = [
  { id: 'ov-flare-anamorphic-gold-cyan-streak', en: 'Anamorphic Gold Core & Cyan Horizontal Streak', vi: 'Tia lóe ngang Anamorphic tâm vàng cánh xanh băng', c1: '#FFF6D6', c2: '#FFB703', c3: '#00B4D8', angle: 0, ghosts: 5, ring: true, seed: 401 },
  { id: 'ov-flare-sunset-amber-pentagon-chain', en: 'Sunset Amber Pentagon Aperture Ghost Chain', vi: 'Chuỗi bóng ma ngũ giác nắng hoàng hôn hổ phách', c1: '#FFF8E7', c2: '#FB8500', c3: '#E63946', angle: 32, ghosts: 8, ring: false, seed: 402 },
  { id: 'ov-flare-sapphire-blue-cinema-flash', en: 'Cinema Sapphire Blue Horizontal Flash Flare', vi: 'Vệt lóe điện ảnh xanh sapphire sắc nét', c1: '#E0FBFC', c2: '#0096C7', c3: '#7209B7', angle: -5, ghosts: 6, ring: true, seed: 403 },
  { id: 'ov-flare-rose-quartz-prism-halo', en: 'Rose Quartz Iridescent Prism Halo Ring', vi: 'Vòng hào quang lăng kính hồng thạch anh', c1: '#FFF0F5', c2: '#FF6B8B', c3: '#FFD166', angle: 45, ghosts: 4, ring: true, seed: 404 },
  { id: 'ov-flare-golden-hour-eight-star', en: 'Golden Hour 8-Point Starburst Sun Flare', vi: 'Ngôi sao nắng 8 cánh giờ vàng rực rỡ', c1: '#FFFFFF', c2: '#FFB703', c3: '#FB5607', angle: 18, ghosts: 5, ring: false, seed: 405 },
  { id: 'ov-flare-vintage-cooke-warm-veil', en: 'Vintage Cooke Warm Amber Edge Glare Veil', vi: 'Màn sương sáng vàng ấm góc ống kính cổ Cooke', c1: '#FFF3B0', c2: '#E09F3E', c3: '#9E2A2B', angle: -28, ghosts: 7, ring: true, seed: 406 },
  { id: 'ov-flare-cyber-magenta-teal-streak', en: 'Neon Magenta & Teal Anamorphic Dual Flare', vi: 'Tia lóe kép tím hồng & xanh ngọc neon', c1: '#FFE5EC', c2: '#F72585', c3: '#4CC9F0', angle: 8, ghosts: 6, ring: false, seed: 407 },
  { id: 'ov-flare-prism-spectral-arc-top', en: 'Upper Spectral Rainbow Refraction Arc', vi: 'Cung khúc xạ cầu vồng quang phổ phía trên', c1: '#FFFFFF', c2: '#FFBE0B', c3: '#3A86FF', angle: 60, ghosts: 5, ring: true, seed: 408 },
  { id: 'ov-flare-soft-champagne-wedding-glow', en: 'Soft Champagne Gold Bridal Bokeh Flare', vi: 'Quầng sáng vàng champagne dịu nhẹ lễ cưới', c1: '#FFFDF7', c2: '#F4D58D', c3: '#F28482', angle: -35, ghosts: 7, ring: true, seed: 409 },
  { id: 'ov-flare-emerald-forest-sun-pierce', en: 'Emerald Canopy Sun Pierce Optical Flare', vi: 'Tia nắng xuyên tán lá ánh lục bảo quang học', c1: '#F1FAEE', c2: '#52B788', c3: '#FFD166', angle: 40, ghosts: 6, ring: false, seed: 410 },
  { id: 'ov-flare-twin-solar-orb-reflection', en: 'Twin Solar Orb Internal Lens Reflection', vi: 'Phản xạ đôi quả cầu mặt trời trong thấu kính', c1: '#FFF8E7', c2: '#FF9F1C', c3: '#E71D36', angle: -22, ghosts: 8, ring: true, seed: 411 },
  { id: 'ov-flare-diagonal-diamond-needle-rays', en: 'Diagonal Diamond Needle Star Rays', vi: 'Chùm tia sao kim cương chéo sắc sảo', c1: '#FFFFFF', c2: '#8ECAE6', c3: '#FFB703', angle: 45, ghosts: 5, ring: false, seed: 412 },
  { id: 'ov-flare-peach-sunset-horizon-wash', en: 'Warm Peach Sunset Horizon Light Wash', vi: 'Ánh sáng hồng đào trải dọc chân trời hoàng hôn', c1: '#FFF0F3', c2: '#FF758F', c3: '#FFB703', angle: 12, ghosts: 6, ring: true, seed: 413 },
  { id: 'ov-flare-violet-indigo-twilight-orb', en: 'Twilight Violet & Indigo Optical Ghost Orbs', vi: 'Chuỗi cầu sáng tím hoàng hôn huyền ảo', c1: '#F8EDEB', c2: '#9B5DE5', c3: '#00BBF9', angle: -40, ghosts: 7, ring: true, seed: 414 }
];

function renderFlareSvg(f) {
  const cx = 320 + (f.seed % 5) * 130;
  const cy = 260 + (f.seed % 4) * 140;
  let ghostsSvg = '';
  for (let i = 1; i <= f.ghosts; i++) {
    const t = i / (f.ghosts + 1);
    const gx = cx + (600 - cx) * t * 1.65;
    const gy = cy + (600 - cy) * t * 1.65;
    const r = 35 + ((i * 37) % 95);
    const col = i % 2 === 0 ? f.c2 : f.c3;
    const op = (0.14 + (i % 3) * 0.08).toFixed(2);
    ghostsSvg += `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${r}" fill="${col}" opacity="${op}" filter="url(#blurSoft)"/>`;
    ghostsSvg += `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${(r * 0.72).toFixed(1)}" fill="none" stroke="${f.c1}" stroke-width="3" opacity="${(op * 0.8).toFixed(2)}" filter="url(#blurSoft)"/>`;
  }
  const ringSvg = f.ring
    ? `<circle cx="${cx}" cy="${cy}" r="280" fill="none" stroke="${f.c2}" stroke-width="18" opacity="0.24" filter="url(#blurHeavy)"/>
       <circle cx="${cx}" cy="${cy}" r="305" fill="none" stroke="${f.c3}" stroke-width="10" opacity="0.22" filter="url(#blurSoft)"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
    <defs>
      <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${f.c1}" stop-opacity="1"/>
        <stop offset="22%" stop-color="${f.c2}" stop-opacity="0.82"/>
        <stop offset="58%" stop-color="${f.c3}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <filter id="blurSoft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="12"/>
      </filter>
      <filter id="blurHeavy" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="28"/>
      </filter>
    </defs>
    <rect width="1200" height="1200" fill="#000000"/>
    <circle cx="${cx}" cy="${cy}" r="480" fill="url(#coreGrad)"/>
    ${ringSvg}
    <g transform="rotate(${f.angle} ${cx} ${cy})">
      <ellipse cx="${cx}" cy="${cy}" rx="560" ry="26" fill="${f.c2}" opacity="0.55" filter="url(#blurHeavy)"/>
      <ellipse cx="${cx}" cy="${cy}" rx="590" ry="9" fill="${f.c1}" opacity="0.85" filter="url(#blurSoft)"/>
      <ellipse cx="${cx}" cy="${cy}" rx="18" ry="420" fill="${f.c3}" opacity="0.38" filter="url(#blurSoft)"/>
    </g>
    ${ghostsSvg}
    <circle cx="${cx}" cy="${cy}" r="95" fill="${f.c1}" opacity="0.92" filter="url(#blurSoft)"/>
  </svg>`;
}

// 13 new Light Leaks, Bokeh & Dust (screen blend on #000000)
const LIGHT_EFFECTS = [
  { id: 'ov-light-leak-amber-edge-burn', en: 'Vintage 35mm Amber Right Edge Film Burn', vi: 'Vệt cháy phim vàng hổ phách cạnh phải', type: 'leak', c1: '#FFB703', c2: '#FB5607', c3: '#E63946', seed: 501 },
  { id: 'ov-light-leak-coral-magenta-wave', en: 'Coral & Magenta Analog Light Leak Wave', vi: 'Dải lọt sáng hồng san hô & tím đỏ máy phim', type: 'leak', c1: '#FF8FA3', c2: '#FF006E', c3: '#8338EC', seed: 502 },
  { id: 'ov-light-leak-golden-top-border', en: 'Golden Sun Light Leak Along Top Frame', vi: 'Vệt lọt sáng nắng vàng dọc viền trên', type: 'leak', c1: '#FFF3B0', c2: '#FF9F1C', c3: '#E71D36', seed: 503 },
  { id: 'ov-light-leak-cyan-emerald-vintage', en: 'Expired Film Cyan & Emerald Light Leak', vi: 'Ánh lọt sáng xanh ngọc phim hết hạn cổ điển', type: 'leak', c1: '#E0FBFC', c2: '#00BBF9', c3: '#00F5D4', seed: 504 },
  { id: 'ov-bokeh-rose-champagne-cascade', en: 'Rose Gold & Champagne Bokeh Cascade', vi: 'Thác đốm sáng bokeh vàng hồng lấp lánh', type: 'bokeh', c1: '#FFE5EC', c2: '#FF8FA3', c3: '#FFD166', seed: 505 },
  { id: 'ov-bokeh-twilight-blue-violet', en: 'Dreamy Twilight Blue & Violet Bokeh Orbs', vi: 'Đốm sáng bokeh xanh tím chiều chạng vạng', type: 'bokeh', c1: '#E0FBFC', c2: '#4EA8DE', c3: '#9B5DE5', seed: 506 },
  { id: 'ov-bokeh-emerald-summer-foliage', en: 'Sunlit Summer Foliage Green & Gold Bokeh', vi: 'Đốm nắng bokeh xanh lá & vàng nắng qua vòm cây', type: 'bokeh', c1: '#FFF3B0', c2: '#FFD166', c3: '#52B788', seed: 507 },
  { id: 'ov-bokeh-heart-shaped-warm-glow', en: 'Warm Golden Heart-Shaped Bokeh Lights', vi: 'Đốm sáng bokeh hình trái tim vàng ấm áp', type: 'heart-bokeh', c1: '#FFF8E7', c2: '#FFB703', c3: '#FF6B8B', seed: 508 },
  { id: 'ov-sunbeams-diagonal-cathedral', en: 'Diagonal Golden Cathedral Sunbeam Rays', vi: 'Chùm tia nắng xiên vàng ấm qua khung cửa', type: 'rays', c1: '#FFF8E7', c2: '#FFB703', c3: '#FB8500', seed: 509 },
  { id: 'ov-sparkles-diamond-stardust-field', en: 'Glittering Diamond Stardust Sparkle Field', vi: 'Bụi sao kim cương lấp lánh rải đều', type: 'stardust', c1: '#FFFFFF', c2: '#FFE66D', c3: '#8ECAE6', seed: 510 },
  { id: 'ov-film-dust-vintage-projector', en: 'Authentic 16mm Projector Dust & Hair Specks', vi: 'Bụi mảnh & sợi tơ máy chiếu phim 16mm cổ', type: 'dust', c1: '#FFFDF7', c2: '#E5E5E5', c3: '#CCCCCC', seed: 511 },
  { id: 'ov-film-scratches-double-sprocket', en: 'Aged Cinema Reel Vertical Scratches & Dust', vi: 'Vết xước dọc cuộn phim nhựa cổ & hạt bụi sáng', type: 'scratches', c1: '#FFFFFF', c2: '#F4E2B8', c3: '#CCCCCC', seed: 512 },
  { id: 'ov-prism-double-rainbow-corner', en: 'Crystal Prism Double Rainbow Corner Refraction', vi: 'Khúc xạ cầu vồng đôi qua lăng kính pha lê góc ảnh', type: 'leak', c1: '#FFBE0B', c2: '#FF006E', c3: '#3A86FF', seed: 513 }
];

function renderLightEffectSvg(le) {
  let body = '';
  if (le.type === 'leak') {
    const x1 = (le.seed % 2 === 0) ? 100 : 1080;
    const y1 = 220 + (le.seed % 3) * 280;
    body = `
      <ellipse cx="${x1}" cy="${y1}" rx="460" ry="780" fill="${le.c3}" opacity="0.65" filter="url(#b60)"/>
      <ellipse cx="${x1}" cy="${y1 - 120}" rx="340" ry="560" fill="${le.c2}" opacity="0.8" filter="url(#b60)"/>
      <ellipse cx="${x1}" cy="${y1 + 80}" rx="220" ry="380" fill="${le.c1}" opacity="0.9" filter="url(#b40)"/>
      <ellipse cx="${1200 - x1}" cy="${1200 - y1}" rx="380" ry="480" fill="${le.c2}" opacity="0.45" filter="url(#b60)"/>`;
  } else if (le.type === 'bokeh') {
    for (let i = 0; i < 34; i++) {
      const x = ((i * 173 + le.seed * 31) % 1120) + 40;
      const y = ((i * 257 + le.seed * 47) % 1120) + 40;
      const r = 28 + ((i * 29) % 85);
      const col = i % 3 === 0 ? le.c1 : (i % 3 === 1 ? le.c2 : le.c3);
      const op = (0.16 + (i % 5) * 0.09).toFixed(2);
      body += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity="${op}" filter="url(#b12)"/>`;
      body += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${le.c1}" stroke-width="3" opacity="${(op * 0.9).toFixed(2)}" filter="url(#b12)"/>`;
    }
  } else if (le.type === 'heart-bokeh') {
    for (let i = 0; i < 24; i++) {
      const x = ((i * 197 + le.seed * 23) % 1060) + 70;
      const y = ((i * 283 + le.seed * 53) % 1060) + 70;
      const s = 0.55 + (i % 4) * 0.25;
      const col = i % 2 === 0 ? le.c2 : le.c3;
      body += `<path d="M ${x} ${y + 35 * s} C ${x - 55 * s} ${y - 5 * s} ${x - 35 * s} ${y - 60 * s} ${x} ${y - 25 * s} C ${x + 35 * s} ${y - 60 * s} ${x + 55 * s} ${y - 5 * s} ${x} ${y + 35 * s} Z" fill="${col}" opacity="0.45" filter="url(#b12)"/>`;
    }
  } else if (le.type === 'rays') {
    for (let i = 0; i < 9; i++) {
      const xEnd = 150 + i * 135;
      body += `<polygon points="0,0 ${120 + i * 35},0 ${xEnd + 180},1200 ${xEnd},1200" fill="${i % 2 === 0 ? le.c1 : le.c2}" opacity="${(0.14 + (i % 3) * 0.07).toFixed(2)}" filter="url(#b40)"/>`;
    }
  } else if (le.type === 'stardust') {
    for (let i = 0; i < 65; i++) {
      const x = ((i * 149 + le.seed * 19) % 1140) + 30;
      const y = ((i * 223 + le.seed * 41) % 1140) + 30;
      const r = 4 + (i % 5) * 4;
      body += `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 === 0 ? le.c1 : le.c2}" opacity="0.85" filter="url(#b4)"/>`;
      if (i % 4 === 0) {
        body += `<path d="M ${x - 28} ${y} L ${x + 28} ${y} M ${x} ${y - 28} L ${x} ${y + 28}" stroke="${le.c1}" stroke-width="3" opacity="0.9"/>`;
      }
    }
  } else if (le.type === 'dust') {
    for (let i = 0; i < 120; i++) {
      const x = ((i * 131 + le.seed * 29) % 1160) + 20;
      const y = ((i * 199 + le.seed * 37) % 1160) + 20;
      const r = 1.5 + (i % 4) * 1.5;
      body += `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFDF7" opacity="${(0.35 + (i % 5) * 0.12).toFixed(2)}"/>`;
      if (i % 9 === 0) {
        body += `<path d="M ${x} ${y} Q ${x + 18} ${y - 12} ${x + 32} ${y + 8}" fill="none" stroke="#FFFDF7" stroke-width="2" opacity="0.55"/>`;
      }
    }
  } else {
    for (let i = 0; i < 14; i++) {
      const x = 90 + ((i * 83 + le.seed * 17) % 1020);
      body += `<line x1="${x}" y1="0" x2="${x + (i % 3) * 8 - 8}" y2="1200" stroke="#FFF8E7" stroke-width="${1.5 + (i % 2)}" opacity="${(0.28 + (i % 4) * 0.14).toFixed(2)}"/>`;
    }
    for (let i = 0; i < 60; i++) {
      const x = ((i * 163) % 1160) + 20;
      const y = ((i * 241) % 1160) + 20;
      body += `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#FFF8E7" opacity="0.5"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
    <defs>
      <filter id="b4"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="b12"><feGaussianBlur stdDeviation="12"/></filter>
      <filter id="b40"><feGaussianBlur stdDeviation="38"/></filter>
      <filter id="b60"><feGaussianBlur stdDeviation="65"/></filter>
    </defs>
    <rect width="1200" height="1200" fill="#000000"/>
    ${body}
  </svg>`;
}

// 11 new Paper Creases, Stains & Film Grain (multiply blend on #FFFFFF)
const FILM_PAPER_GRAIN = [
  { id: 'ov-folded-letter-three-panel', en: 'Tri-Folded Vintage Letter Horizontal Creases', vi: 'Nếp gấp thư làm ba ngang trang giấy cổ', type: 'folds-3', seed: 601 },
  { id: 'ov-folded-poster-sixteen-grid', en: '16-Panel Folded Map & Poster Crease Grid', vi: 'Lưới 16 ô nếp gấp bản đồ & áp phích cũ', type: 'folds-16', seed: 602 },
  { id: 'ov-corner-dog-ear-creases', en: 'Worn Book Page Dog-Ear Corner Folds', vi: 'Nếp gấp quăn bốn góc trang sách cũ', type: 'corner-folds', seed: 603 },
  { id: 'ov-espresso-splash-stain-ring', en: 'Dark Espresso Cup Ring & Droplet Spatter', vi: 'Vết đáy cốc cà phê Espresso & giọt bắn tự nhiên', type: 'coffee-splash', seed: 604 },
  { id: 'ov-matcha-tea-watercolor-stain', en: 'Aged Herbal Tea Ring & Edge Watermark', vi: 'Vết cốc trà thảo mộc & loang nước cạnh giấy', type: 'tea-ring', seed: 605 },
  { id: 'ov-fountain-ink-splatter-blots', en: 'Vintage Fountain Pen Sepia Ink Blots & Drops', vi: 'Vết mực bút máy nâu đen vẩy nhẹ trên giấy', type: 'ink-blots', seed: 606 },
  { id: 'ov-aged-book-foxing-vignette', en: 'Antique Book Page Foxing & Darkened Vignette', vi: 'Viền ố vàng đốm mốc trang sách cổ trăm năm', type: 'vignette-foxing', seed: 607 },
  { id: 'ov-water-damaged-tide-marks', en: 'Dried Water Tide Lines & Damp Paper Stain', vi: 'Vệt loang nước khô tự nhiên trên giấy cũ', type: 'water-tide', seed: 608 },
  { id: 'ov-coarse-newsprint-ink-rub', en: 'Coarse Vintage Newsprint Ink Rub & Specks', vi: 'Bề mặt báo cũ lem mực in & hạt bụi giấy', type: 'newsprint-rub', seed: 609 },
  { id: 'ov-charcoal-sketch-smudge-dust', en: 'Artist Charcoal Sketchbook Smudge & Eraser Crumb', vi: 'Vệt chì than nhoè nhẹ trên sổ ký hoạ', type: 'charcoal-smudge', seed: 610 },
  { id: 'ov-postage-cancellation-ink-transfer', en: 'Faint Wet Ink Offset & Postal smudge Marks', vi: 'Vệt in hằn mực dấu bưu điện mờ trên giấy', type: 'ink-offset', seed: 611 }
];

function renderPaperGrainOverlaySvg(g) {
  let body = '';
  if (g.type === 'folds-3') {
    body = `
      <line x1="0" y1="400" x2="1200" y2="400" stroke="#4A3F35" stroke-width="26" opacity="0.65" filter="url(#dispCrease)"/>
      <line x1="0" y1="408" x2="1200" y2="408" stroke="#9E8C7A" stroke-width="12" opacity="0.5" filter="url(#dispCrease)"/>
      <line x1="0" y1="800" x2="1200" y2="800" stroke="#4A3F35" stroke-width="26" opacity="0.65" filter="url(#dispCrease)"/>
      <line x1="0" y1="808" x2="1200" y2="808" stroke="#9E8C7A" stroke-width="12" opacity="0.5" filter="url(#dispCrease)"/>`;
  } else if (g.type === 'folds-16') {
    for (const pos of [300, 600, 900]) {
      body += `<line x1="${pos}" y1="0" x2="${pos}" y2="1200" stroke="#4A3F35" stroke-width="22" opacity="0.65" filter="url(#dispCrease)"/>`;
      body += `<line x1="0" y1="${pos}" x2="1200" y2="${pos}" stroke="#4A3F35" stroke-width="22" opacity="0.65" filter="url(#dispCrease)"/>`;
    }
  } else if (g.type === 'corner-folds') {
    body = `
      <line x1="0" y1="280" x2="280" y2="0" stroke="#5A4B3E" stroke-width="22" opacity="0.68" filter="url(#dispCrease)"/>
      <line x1="920" y1="0" x2="1200" y2="280" stroke="#5A4B3E" stroke-width="22" opacity="0.68" filter="url(#dispCrease)"/>
      <line x1="0" y1="920" x2="280" y2="1200" stroke="#5A4B3E" stroke-width="22" opacity="0.68" filter="url(#dispCrease)"/>
      <line x1="920" y1="1200" x2="1200" y2="920" stroke="#5A4B3E" stroke-width="22" opacity="0.68" filter="url(#dispCrease)"/>`;
  } else if (g.type === 'coffee-splash') {
    body = `
      <circle cx="640" cy="580" r="290" fill="none" stroke="#7F4F24" stroke-width="28" opacity="0.55" filter="url(#dispCrease)"/>
      <circle cx="655" cy="590" r="275" fill="none" stroke="#936639" stroke-width="12" opacity="0.4" filter="url(#dispCrease)"/>
      <circle cx="310" cy="340" r="28" fill="#7F4F24" opacity="0.45" filter="url(#dispCrease)"/>
      <circle cx="360" cy="390" r="14" fill="#7F4F24" opacity="0.5"/>
      <circle cx="920" cy="820" r="22" fill="#7F4F24" opacity="0.45" filter="url(#dispCrease)"/>`;
  } else if (g.type === 'tea-ring') {
    body = `
      <circle cx="460" cy="480" r="250" fill="#B68D40" opacity="0.18" filter="url(#dispCrease)"/>
      <circle cx="460" cy="480" r="250" fill="none" stroke="#8C6239" stroke-width="20" opacity="0.45" filter="url(#dispCrease)"/>
      <circle cx="760" cy="720" r="190" fill="none" stroke="#8C6239" stroke-width="16" opacity="0.4" filter="url(#dispCrease)"/>`;
  } else if (g.type === 'ink-blots') {
    for (let i = 0; i < 18; i++) {
      const x = 180 + ((i * 179 + g.seed * 23) % 840);
      const y = 180 + ((i * 233 + g.seed * 31) % 840);
      const r = 12 + (i % 5) * 14;
      body += `<circle cx="${x}" cy="${y}" r="${r}" fill="#3D312A" opacity="${(0.35 + (i % 4) * 0.12).toFixed(2)}" filter="url(#dispCrease)"/>`;
    }
  } else if (g.type === 'vignette-foxing') {
    body = `<rect x="30" y="30" width="1140" height="1140" rx="40" fill="none" stroke="#8C6239" stroke-width="85" opacity="0.42" filter="url(#dispCrease)"/>`;
    for (let i = 0; i < 45; i++) {
      const x = ((i * 157 + 90) % 1100) + 50;
      const y = ((i * 229 + 70) % 1100) + 50;
      body += `<circle cx="${x}" cy="${y}" r="${8 + (i % 4) * 7}" fill="#9E6B3B" opacity="0.28" filter="url(#dispCrease)"/>`;
    }
  } else if (g.type === 'water-tide') {
    body = `
      <ellipse cx="600" cy="600" rx="460" ry="380" fill="none" stroke="#8A7968" stroke-width="24" opacity="0.48" filter="url(#dispCrease)"/>
      <ellipse cx="620" cy="580" rx="340" ry="260" fill="#B5A492" opacity="0.18" filter="url(#dispCrease)"/>`;
  } else if (g.type === 'newsprint-rub') {
    for (let i = 0; i < 36; i++) {
      const y = 60 + i * 30;
      body += `<line x1="80" y1="${y}" x2="1120" y2="${y}" stroke="#59534D" stroke-width="${2 + (i % 3)}" stroke-dasharray="${18 + (i % 15)} ${14 + (i % 9)}" opacity="0.32" filter="url(#dispCrease)"/>`;
    }
  } else if (g.type === 'charcoal-smudge') {
    body = `
      <path d="M 180 950 Q 450 520 980 220" fill="none" stroke="#4A4540" stroke-width="110" stroke-linecap="round" opacity="0.28" filter="url(#dispCrease)"/>
      <path d="M 240 310 Q 620 680 960 890" fill="none" stroke="#5A534C" stroke-width="85" stroke-linecap="round" opacity="0.24" filter="url(#dispCrease)"/>`;
  } else {
    body = `
      <g opacity="0.38" filter="url(#dispCrease)">
        <circle cx="380" cy="460" r="195" fill="none" stroke="#3D352E" stroke-width="14"/>
        <circle cx="380" cy="460" r="130" fill="none" stroke="#3D352E" stroke-width="8"/>
        <path d="M 550 380 Q 660 340 770 380 T 990 380 M 550 460 Q 660 420 770 460 T 990 460 M 550 540 Q 660 500 770 540 T 990 540" fill="none" stroke="#3D352E" stroke-width="14"/>
      </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
    <defs>
      <filter id="paperBase">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="${g.seed}" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.92   0 0 0 0 0.89   0 0 0 0 0.84   0 0 0 0.32 0"/>
      </filter>
      <filter id="dispCrease" filterUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1200">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="4" seed="${g.seed + 10}" result="dn"/>
        <feDisplacementMap in="SourceGraphic" in2="dn" scale="28" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
    <rect width="1200" height="1200" fill="#FFFFFF"/>
    <rect width="1200" height="1200" filter="url(#paperBase)"/>
    ${body}
  </svg>`;
}

// 23 new Paper Textures (7 -> 30)
const PAPER_TEXTURES = [
  { id: 'paper-ivory-cotton-rag', en: 'Warm Ivory 100% Cotton Rag Paper', vi: 'Giấy cotton màu ngà ấm mịn', bg: '#FBF7EE', grain: '#E6DEC8', type: 'fine', seed: 701 },
  { id: 'paper-cold-press-watercolor', en: 'Cold-Press Rough Watercolor Paper', vi: 'Giấy vẽ màu nước vân sần Cold-Press', bg: '#FAF8F5', grain: '#DED9CE', type: 'rough', seed: 702 },
  { id: 'paper-vietnamese-do-handmade', en: 'Handmade Vietnamese Dó Bark Fiber Paper', vi: 'Giấy dó thủ công truyền thống lộ sợi vỏ cây', bg: '#F4ECDC', grain: '#C8B696', type: 'fibers', seed: 703 },
  { id: 'paper-vintage-newsprint-grey', en: 'Aged Greyish-Cream Vintage Newsprint Paper', vi: 'Giấy báo cũ ngả màu xám kem hoài cổ', bg: '#E5DFD3', grain: '#BFB6A4', type: 'fine', seed: 704 },
  { id: 'paper-antique-stained-parchment', en: 'Antique Tea-Stained Parchment Manuscript Paper', vi: 'Giấy da cổ nhuộm trà ố vàng theo năm tháng', bg: '#EAD7B7', grain: '#C4A474', type: 'stained', seed: 705 },
  { id: 'paper-recycled-flecked-kraft', en: 'Recycled Brown Kraft Paper with Organic Flecks', vi: 'Giấy tái chế Kraft nâu lấm tấm hạt mộc', bg: '#C8A97E', grain: '#8C6B43', type: 'flecked', seed: 706 },
  { id: 'paper-heavy-crumpled-parchment', en: 'Heavily Crumpled & Flattened Cream Paper', vi: 'Giấy kem vò nhăn rồi trải phẳng tự nhiên', bg: '#F3EDE0', grain: '#CEC3AE', type: 'crumpled', seed: 707 },
  { id: 'paper-corrugated-kraft-flute', en: 'Vertical Ribbed Corrugated Cardboard Flute', vi: 'Bìa carton sóng dọc màu nâu mộc', bg: '#BA9466', grain: '#87643B', type: 'corrugated', seed: 708 },
  { id: 'paper-architect-blueprint-grid', en: '5mm Square Graph Grid Notebook Paper', vi: 'Giấy kẻ ô vuông 5mm sổ tay kỹ thuật', bg: '#FCFBF7', grain: '#B8C8D8', type: 'grid', seed: 709 },
  { id: 'paper-bullet-journal-dotted', en: 'Subtle Dot-Grid Bullet Journal Paper', vi: 'Giấy chấm bi Dot-Grid sổ tay Bullet Journal', bg: '#FDFBF7', grain: '#9E988E', type: 'dotted', seed: 710 },
  { id: 'paper-french-seyes-ruled', en: 'Classic Vintage Blue & Red Ruled School Paper', vi: 'Giấy kẻ ngang vở học sinh cổ điển', bg: '#FBF8F1', grain: '#8DA9C4', type: 'ruled', seed: 711 },
  { id: 'paper-japanese-washi-mulberry', en: 'Japanese Mulberry Washi Paper with Long Fibers', vi: 'Giấy Washi dâu tằm Nhật Bản sợi dài óng ả', bg: '#F7F2E7', grain: '#D5C7AD', type: 'fibers', seed: 712 },
  { id: 'paper-laid-verge-ribbed', en: 'Classic Laid Paper with Fine Chain Lines', vi: 'Giấy mỹ thuật vân sọc ngang mảnh cổ điển', bg: '#F6F1E6', grain: '#DCD3C0', type: 'laid', seed: 713 },
  { id: 'paper-linen-woven-canvas', en: 'Cross-Woven Linen Embossed Art Paper', vi: 'Giấy mỹ thuật dập vân vải lanh đan chéo', bg: '#F5EFE4', grain: '#D4C9B4', type: 'linen', seed: 714 },
  { id: 'paper-pastel-blush-rose-card', en: 'Soft Pastel Blush Pink Textured Cardstock', vi: 'Giấy bìa mỹ thuật hồng phấn pastel vân mịn', bg: '#FCE8EC', grain: '#E8C5CC', type: 'fine', seed: 715 },
  { id: 'paper-pastel-sage-botanical', en: 'Muted Sage Green Botanical Pressed Paper', vi: 'Giấy thủ công xanh lá xô thơm dịu mắt', bg: '#E6EFE6', grain: '#C2D1C2', type: 'fibers', seed: 716 },
  { id: 'paper-pastel-powder-blue', en: 'Serene Powder Blue Textured Cotton Paper', vi: 'Giấy cotton xanh lam phấn nhẹ nhàng', bg: '#E8F1F8', grain: '#C4D6E5', type: 'fine', seed: 717 },
  { id: 'paper-charcoal-black-sketch', en: 'Deep Charcoal Black Pastel & Chalk Paper', vi: 'Giấy mỹ thuật đen than chì sang trọng', bg: '#262523', grain: '#3D3B38', type: 'rough', seed: 718 },
  { id: 'paper-sun-bleached-manila-tag', en: 'Warm Manila Folder & Shipping Tag Cardstock', vi: 'Bìa hồ sơ Manila vàng ấm cổ điển', bg: '#EFE0B9', grain: '#D1BC8A', type: 'fine', seed: 719 },
  { id: 'paper-coffee-dyed-journal', en: 'Hand-Dyed Coffee & Vanilla Vintage Journal Sheet', vi: 'Giấy nhật ký nhuộm cà phê thủ công loang ấm', bg: '#DFC7A7', grain: '#B39169', type: 'stained', seed: 720 },
  { id: 'paper-pressed-wildflower-petal', en: 'Handmade Paper with Pressed Dried Flower Petals', vi: 'Giấy thủ công ép cánh hoa khô tự nhiên', bg: '#F6EFE2', grain: '#D6A29C', type: 'petals', seed: 721 },
  { id: 'paper-music-manuscript-staves', en: 'Vintage Sheet Music Five-Line Staff Paper', vi: 'Giấy kẻ khuôn nhạc 5 dòng cổ điển', bg: '#F4EBD9', grain: '#7A6E5D', type: 'music', seed: 722 },
  { id: 'paper-ledger-accounting-columns', en: 'Antique Accounting Ledger Ruled Column Paper', vi: 'Giấy sổ cái kế toán kẻ cột đỏ xanh cổ điển', bg: '#F5EEDC', grain: '#8CA89E', type: 'ledger', seed: 723 }
];

function renderPaperTextureSvg(p) {
  let patternOverlay = '';
  if (p.type === 'grid') {
    for (let x = 40; x < 1024; x += 40) patternOverlay += `<line x1="${x}" y1="0" x2="${x}" y2="1024" stroke="${p.grain}" stroke-width="1.5" opacity="0.65"/>`;
    for (let y = 40; y < 1024; y += 40) patternOverlay += `<line x1="0" y1="${y}" x2="1024" y2="${y}" stroke="${p.grain}" stroke-width="1.5" opacity="0.65"/>`;
  } else if (p.type === 'dotted') {
    for (let y = 40; y < 1024; y += 40) {
      for (let x = 40; x < 1024; x += 40) {
        patternOverlay += `<circle cx="${x}" cy="${y}" r="2.4" fill="${p.grain}" opacity="0.75"/>`;
      }
    }
  } else if (p.type === 'ruled') {
    for (let y = 64; y < 1024; y += 48) {
      patternOverlay += `<line x1="0" y1="${y}" x2="1024" y2="${y}" stroke="#7FA1C3" stroke-width="2" opacity="0.65"/>`;
    }
    patternOverlay += `<line x1="120" y1="0" x2="120" y2="1024" stroke="#E07A5F" stroke-width="2.5" opacity="0.7"/>`;
  } else if (p.type === 'music') {
    for (let block = 90; block < 960; block += 170) {
      for (let s = 0; s < 5; s++) {
        const y = block + s * 16;
        patternOverlay += `<line x1="60" y1="${y}" x2="964" y2="${y}" stroke="${p.grain}" stroke-width="2" opacity="0.7"/>`;
      }
    }
  } else if (p.type === 'ledger') {
    for (let y = 56; y < 1024; y += 40) {
      patternOverlay += `<line x1="0" y1="${y}" x2="1024" y2="${y}" stroke="#84A59D" stroke-width="1.6" opacity="0.6"/>`;
    }
    for (const x of [140, 680, 840, 850]) {
      patternOverlay += `<line x1="${x}" y1="0" x2="${x}" y2="1024" stroke="#E07A5F" stroke-width="2" opacity="0.65"/>`;
    }
  } else if (p.type === 'corrugated') {
    for (let x = 0; x < 1024; x += 24) {
      patternOverlay += `<rect x="${x}" y="0" width="12" height="1024" fill="${p.grain}" opacity="0.28"/>`;
    }
  } else if (p.type === 'laid') {
    for (let y = 0; y < 1024; y += 8) {
      patternOverlay += `<line x1="0" y1="${y}" x2="1024" y2="${y}" stroke="${p.grain}" stroke-width="2" opacity="0.45"/>`;
    }
    for (let x = 64; x < 1024; x += 96) {
      patternOverlay += `<line x1="${x}" y1="0" x2="${x}" y2="1024" stroke="${p.grain}" stroke-width="1.5" opacity="0.35"/>`;
    }
  } else if (p.type === 'linen') {
    for (let i = 0; i < 1024; i += 10) {
      patternOverlay += `<line x1="0" y1="${i}" x2="1024" y2="${i}" stroke="${p.grain}" stroke-width="1.5" opacity="0.35"/>`;
      patternOverlay += `<line x1="${i}" y1="0" x2="${i}" y2="1024" stroke="${p.grain}" stroke-width="1.5" opacity="0.35"/>`;
    }
  } else if (p.type === 'fibers' || p.type === 'petals' || p.type === 'flecked') {
    for (let i = 0; i < 95; i++) {
      const x = ((i * 173 + p.seed * 19) % 980) + 20;
      const y = ((i * 241 + p.seed * 31) % 980) + 20;
      const dx = ((i * 37) % 45) - 22;
      const dy = ((i * 53) % 45) - 22;
      if (p.type === 'petals' && i % 4 === 0) {
        patternOverlay += `<ellipse cx="${x}" cy="${y}" rx="9" ry="4" transform="rotate(${i * 25} ${x} ${y})" fill="${i % 8 === 0 ? '#D97F76' : '#E0B45C'}" opacity="0.55"/>`;
      } else {
        patternOverlay += `<path d="M ${x} ${y} Q ${x + dx * 0.6} ${y - dy * 0.4} ${x + dx} ${y + dy}" fill="none" stroke="${p.grain}" stroke-width="${p.type === 'flecked' ? 3 : 1.8}" opacity="0.55" stroke-linecap="round"/>`;
      }
    }
  } else if (p.type === 'stained' || p.type === 'crumpled') {
    for (let i = 0; i < 12; i++) {
      const x = ((i * 211 + p.seed * 29) % 900) + 60;
      const y = ((i * 263 + p.seed * 43) % 900) + 60;
      patternOverlay += `<circle cx="${x}" cy="${y}" r="${90 + (i % 4) * 55}" fill="${p.grain}" opacity="0.18" filter="url(#softBlur)"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <filter id="paperGrain">
        <feTurbulence type="fractalNoise" baseFrequency="${p.type === 'rough' ? '0.06' : '0.09'}" numOctaves="4" seed="${p.seed}" result="noise"/>
        <feDiffuseLighting in="noise" lighting-color="${p.bg}" surfaceScale="${p.type === 'rough' || p.type === 'crumpled' ? '2.4' : '1.4'}" result="lit">
          <feDistantLight azimuth="45" elevation="58"/>
        </feDiffuseLighting>
      </filter>
      <filter id="softBlur"><feGaussianBlur stdDeviation="28"/></filter>
    </defs>
    <rect width="1024" height="1024" fill="${p.bg}"/>
    <rect width="1024" height="1024" filter="url(#paperGrain)" opacity="0.55"/>
    ${patternOverlay}
  </svg>`;
}

// 40 curated best sticker items across packs to tag with "featured"
const FEATURED_STICKER_TARGETS = [
  ['tet', 'tet-zodiac-galloping-horse'],
  ['tet', 'tet-apricot-blossom-branch'],
  ['tet', 'tet-banh-chung-square'],
  ['tet', 'tet-lion-dance-head'],
  ['vietnam-heritage', 'vn-dong-ho-ga-dan'],
  ['vietnam-heritage', 'vn-one-pillar-pagoda'],
  ['vietnam-heritage', 'vn-khue-van-cac-pavilion'],
  ['vietnam-heritage', 'vn-hoi-an-bridge-pagoda'],
  ['japanese-ukiyoe', 'ukiyoe-great-wave'],
  ['japanese-ukiyoe', 'ukiyoe-hiroshige-plum-blossom'],
  ['japanese-ukiyoe', 'ukiyoe-hiroshige-golden-pheasant'],
  ['japanese-ukiyoe', 'ukiyoe-bird-and-camellia'],
  ['autumn', 'aut-red-maple-leaf'],
  ['autumn', 'aut-pumpkin-spice-latte'],
  ['autumn', 'aut-golden-ginkgo-leaf'],
  ['autumn', 'aut-autumn-leaf-wreath'],
  ['christmas', 'xmas-gingerbread-house'],
  ['christmas', 'xmas-snow-globe-cottage'],
  ['christmas', 'xmas-nutcracker-soldier'],
  ['christmas', 'xmas-reindeer-red-nose'],
  ['celebrations', 'cel-happy-birthday-banner'],
  ['celebrations', 'cel-three-tier-wedding-cake'],
  ['celebrations', 'cel-wedding-arch-roses'],
  ['celebrations', 'cel-graduation-owl-cap'],
  ['birds-animals', 'bird-gould-spatuletail'],
  ['birds-animals', 'bird-indian-peacock-plume'],
  ['birds-animals', 'bird-toco-toucan-tropical'],
  ['birds-animals', 'bird-red-crowned-crane'],
  ['butterflies-insects', 'morpho-achilles'],
  ['butterflies-insects', 'ani-monarch-butterfly-orange'],
  ['butterflies-insects', 'ani-corgi-dog-smiling'],
  ['butterflies-insects', 'ani-giant-panda-bamboo'],
  ['hand-doodles', 'doodle-reading'],
  ['hand-doodles', 'illus-cozy-cat-window'],
  ['hand-doodles', 'illus-polaroid-instant-camera'],
  ['vintage-maps-compass', 'compass-rose-1595'],
  ['vintage-maps-compass', 'travel-retro-rangefinder-camera'],
  ['vintage-maps-compass', 'travel-vintage-hot-air-balloon'],
  ['ink-stamps', 'stamp-circle-hanoi-vietnam'],
  ['ink-stamps', 'stamp-perf-vietnam-50d']
];

async function run() {
  // 1. overlay/lens-flares (20 -> 34)
  {
    const dir = path.join(ROOT, 'assets', 'overlay', 'lens-flares');
    syncExistingSrc('overlay', 'lens-flares');
    const manifestPath = path.join(dir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.items = manifest.items.slice(0, 20);
    for (const f of LENS_FLARES) {
      const svg = renderFlareSvg(f);
      await sharp(Buffer.from(svg)).png().toFile(path.join(dir, 'src', `${f.id}.png`));
      manifest.items.push({
        id: f.id,
        name: { en: f.en, vi: f.vi },
        tags: {
          en: ['lens flare', 'optical', 'glow', 'cinema', 'light'],
          vi: ['lóe ống kính', 'quang học', 'quầng sáng', 'điện ảnh', 'ánh sáng']
        },
        collections: ['vintage', 'summer', 'wedding'],
        blend: 'screen',
        source: {
          provider: 'IG Layout',
          url: 'https://ig-layout.local/assets/lens-flares',
          author: 'IG Layout Procedural Generator',
          title: f.en,
          license: 'CC0-1.0',
          retrieved: '2026-10-19'
        }
      });
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`lens-flares: ${manifest.items.length} items`);
  }

  // 2. overlay/light-effects (16 -> 29)
  {
    const dir = path.join(ROOT, 'assets', 'overlay', 'light-effects');
    syncExistingSrc('overlay', 'light-effects');
    const manifestPath = path.join(dir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.items = manifest.items.slice(0, 16);
    for (const le of LIGHT_EFFECTS) {
      const svg = renderLightEffectSvg(le);
      await sharp(Buffer.from(svg)).png().toFile(path.join(dir, 'src', `${le.id}.png`));
      manifest.items.push({
        id: le.id,
        name: { en: le.en, vi: le.vi },
        tags: {
          en: ['light leak', 'bokeh', 'dust', 'film', 'glow'],
          vi: ['lọt sáng', 'bokeh', 'bụi phim', 'ánh sáng', 'máy phim']
        },
        collections: ['vintage', 'summer', 'cute'],
        blend: 'screen',
        source: {
          provider: 'IG Layout',
          url: 'https://ig-layout.local/assets/light-effects',
          author: 'IG Layout Procedural Generator',
          title: le.en,
          license: 'CC0-1.0',
          retrieved: '2026-10-19'
        }
      });
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`light-effects: ${manifest.items.length} items`);
  }

  // 3. overlay/film-paper-grain (16 -> 27)
  {
    const dir = path.join(ROOT, 'assets', 'overlay', 'film-paper-grain');
    syncExistingSrc('overlay', 'film-paper-grain');
    const manifestPath = path.join(dir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.items = manifest.items.slice(0, 16);
    for (const g of FILM_PAPER_GRAIN) {
      const svg = renderPaperGrainOverlaySvg(g);
      await sharp(Buffer.from(svg)).png().toFile(path.join(dir, 'src', `${g.id}.png`));
      manifest.items.push({
        id: g.id,
        name: { en: g.en, vi: g.vi },
        tags: {
          en: ['paper', 'crease', 'stain', 'grain', 'vintage'],
          vi: ['nếp gấp', 'vết ố', 'giấy cũ', 'vết cà phê', 'cổ điển']
        },
        collections: ['vintage', 'journal'],
        blend: 'multiply',
        source: {
          provider: 'IG Layout',
          url: 'https://ig-layout.local/assets/film-paper-grain',
          author: 'IG Layout Procedural Generator',
          title: g.en,
          license: 'CC0-1.0',
          retrieved: '2026-10-19'
        }
      });
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`film-paper-grain: ${manifest.items.length} items`);
  }

  // 4. texture/paper (7 -> 30)
  {
    const dir = path.join(ROOT, 'assets', 'texture', 'paper');
    syncExistingSrc('texture', 'paper');
    const manifestPath = path.join(dir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.items = manifest.items.slice(0, 7);
    for (const p of PAPER_TEXTURES) {
      const svg = renderPaperTextureSvg(p);
      await sharp(Buffer.from(svg)).png().toFile(path.join(dir, 'src', `${p.id}.png`));
      manifest.items.push({
        id: p.id,
        name: { en: p.en, vi: p.vi },
        tags: {
          en: ['paper', 'texture', 'stationery', 'background', 'journal'],
          vi: ['giấy', 'nền giấy', 'sổ tay', 'thủ công', 'cổ điển']
        },
        collections: ['journal', 'vintage', 'minimal'],
        tile: true,
        source: {
          provider: 'IG Layout',
          url: 'https://ig-layout.local/assets/paper',
          author: 'IG Layout Procedural Generator',
          title: p.en,
          license: 'CC0-1.0',
          retrieved: '2026-10-19'
        }
      });
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`texture/paper: ${manifest.items.length} items`);
  }

  // 5. Tag "featured" on 40 best sticker items
  let featuredCount = 0;
  for (const [packId, itemId] of FEATURED_STICKER_TARGETS) {
    const mPath = path.join(ROOT, 'assets', 'sticker', packId, 'manifest.json');
    const m = JSON.parse(fs.readFileSync(mPath, 'utf8'));
    const item = m.items.find(it => it.id === itemId);
    if (item) {
      if (!item.collections.includes('featured')) {
        item.collections.unshift('featured');
      }
      featuredCount++;
      fs.writeFileSync(mPath, JSON.stringify(m, null, 2) + '\n');
    } else {
      console.warn(`Missing featured target: ${packId}/${itemId}`);
    }
  }
  console.log(`Tagged featured on ${featuredCount} sticker items`);
}

run().catch(e => { console.error(e); process.exit(1); });
