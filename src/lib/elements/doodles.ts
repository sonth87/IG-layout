// Hand-drawn doodles (M20): arrows, underlines, circles, stars, hearts, sparkles… drawn as
// wobbly pen strokes by code, so they are tiny, sharp at any size and take any colour
// (`{c}`, like the other stickers). Each is fixed by its seed: same doodle every time.

import type { Sticker } from "./stickers";

type P = [number, number];

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A hand's wobble: each point moved a little, smoothly. */
function wobble(r: () => number, pts: P[], amp: number): P[] {
  let dx = 0;
  let dy = 0;
  return pts.map(([x, y]) => {
    dx = dx * 0.6 + (r() - 0.5) * amp;
    dy = dy * 0.6 + (r() - 0.5) * amp;
    return [x + dx, y + dy];
  });
}

/** Smooth path through points (Catmull-Rom → cubic Béziers). */
function smooth(pts: P[], closed = false) {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + "Z" : d;
}

const stroke = (d: string, w = 6) => `<path d="${d}" fill="none" stroke="{c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const fill = (d: string) => `<path d="${d}" fill="{c}"/>`;

/** Points along a curve f(t), t in 0..1. */
const along = (n: number, f: (t: number) => P): P[] => Array.from({ length: n + 1 }, (_, i) => f(i / n));

/** An arrow head at the end of a path, its two strokes a little uneven. */
function head(r: () => number, tip: P, from: P, size: number) {
  const a = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const s1 = size * (0.85 + r() * 0.3);
  const s2 = size * (0.85 + r() * 0.3);
  const w1 = 0.5 + r() * 0.15;
  const w2 = 0.5 + r() * 0.15;
  const p1: P = [tip[0] - Math.cos(a - w1) * s1, tip[1] - Math.sin(a - w1) * s1];
  const p2: P = [tip[0] - Math.cos(a + w2) * s2, tip[1] - Math.sin(a + w2) * s2];
  return `M${p1[0].toFixed(1)},${p1[1].toFixed(1)}L${tip[0].toFixed(1)},${tip[1].toFixed(1)}L${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
}

type Make = (r: () => number) => { w: number; h: number; body: string };

const arrow =
  (path: (t: number) => P, w = 240, h = 120, two = false): Make =>
  (r) => {
    const pts = wobble(r, along(28, path), 2.2);
    const end = pts[pts.length - 1];
    const prev = pts[pts.length - 4];
    let body = stroke(smooth(pts)) + stroke(head(r, end, prev, 26));
    if (two) body += stroke(head(r, pts[0], pts[3], 26));
    return { w, h, body };
  };

const LIST: [string, string, string, Make][] = [
  ["arrowStraight", "Arrow", "Mũi tên", arrow((t) => [20 + t * 200, 70 - Math.sin(t * Math.PI) * 14])],
  ["arrowCurve", "Curved arrow", "Mũi tên cong", arrow((t) => [20 + t * 190, 100 - Math.sin(t * Math.PI) * 70], 240, 130)],
  ["arrowLoop", "Loop arrow", "Mũi tên vòng", arrow((t) => {
    const a = t * Math.PI * 2.4;
    return [20 + t * 200 + Math.sin(a) * 26 * Math.sin(t * Math.PI), 75 - Math.sin(t * Math.PI) * 20 - (1 - Math.cos(a)) * 18 * Math.sin(t * Math.PI)];
  }, 250, 140)],
  ["arrowZigzag", "Zigzag arrow", "Mũi tên zigzag", arrow((t) => [20 + t * 200, 70 + (Math.abs(((t * 4) % 1) - 0.5) - 0.25) * 70 * (1 - t * 0.4)])],
  ["arrowDown", "Down arrow", "Mũi tên xuống", arrow((t) => [70 + Math.sin(t * Math.PI) * 18, 20 + t * 190], 140, 230)],
  ["arrowBack", "U-turn arrow", "Mũi tên quay lại", arrow((t) => {
    const a = Math.PI * 1.15 * t;
    return [120 + Math.cos(a + Math.PI) * -90, 110 - Math.sin(a) * 80];
  }, 240, 140)],
  ["arrowDouble", "Double arrow", "Mũi tên hai đầu", arrow((t) => [24 + t * 196, 70 + Math.sin(t * Math.PI * 2) * 8], 240, 120, true)],
  ["arrowSpiral", "Spiral arrow", "Mũi tên xoắn", arrow((t) => {
    const a = t * Math.PI * 3;
    const rad = 10 + t * 55;
    return [110 + Math.cos(a) * rad + t * 60, 100 + Math.sin(a) * rad * 0.8];
  }, 260, 200)],
  ["underline", "Underline", "Gạch chân", (r) => ({ w: 260, h: 50, body: stroke(smooth(wobble(r, along(20, (t) => [12 + t * 236, 26 + Math.sin(t * 3) * 4]), 1.5)), 7) })],
  ["underlineDouble", "Double underline", "Gạch chân đôi", (r) => ({ w: 260, h: 60, body: stroke(smooth(wobble(r, along(20, (t) => [12 + t * 236, 20 + t * 4]), 1.5)), 6) + stroke(smooth(wobble(r, along(20, (t) => [20 + t * 220, 42 - t * 3]), 1.5)), 6) })],
  ["underlineWave", "Wavy underline", "Gạch chân lượn", (r) => ({ w: 260, h: 60, body: stroke(smooth(wobble(r, along(40, (t) => [12 + t * 236, 30 + Math.sin(t * Math.PI * 7) * 10]), 1.2)), 6) })],
  ["underlineSwoosh", "Swoosh", "Nét vút", (r) => ({ w: 260, h: 70, body: stroke(smooth(wobble(r, along(24, (t) => [12 + t * 236, 50 - Math.sin(t * Math.PI * 0.9) * 30 + t * 6]), 1.4)), 8) })],
  ["scribble", "Scribble line", "Nét nguệch ngoạc", (r) => ({ w: 260, h: 70, body: stroke(smooth(wobble(r, along(60, (t) => [14 + t * 232 + Math.sin(t * 60) * 14, 35 + Math.cos(t * 60) * 18]), 2)), 5) })],
  ["circle", "Hand-drawn circle", "Khoanh tròn", (r) => {
    const start = r() * Math.PI * 2;
    return { w: 260, h: 180, body: stroke(smooth(wobble(r, along(40, (t) => {
      const a = start + t * Math.PI * 2.15;
      const k = 1 + t * 0.06;
      return [130 + Math.cos(a) * 112 * k, 90 + Math.sin(a) * 72 * k];
    }), 2.5)), 6) };
  }],
  ["circleDouble", "Double circle", "Khoanh hai vòng", (r) => {
    const start = r() * Math.PI * 2;
    return { w: 260, h: 180, body: stroke(smooth(wobble(r, along(70, (t) => {
      const a = start + t * Math.PI * 4.1;
      const k = 0.92 + t * 0.12;
      return [130 + Math.cos(a) * 110 * k, 90 + Math.sin(a) * 70 * k];
    }), 2.5)), 5) };
  }],
  ["box", "Hand-drawn box", "Khung vẽ tay", (r) => {
    const c: P[] = [[16, 22], [244, 14], [250, 166], [12, 170], [18, 18]];
    const pts = c.flatMap((p, i) => (i === 0 ? [p] : along(8, (t) => [c[i - 1][0] + (p[0] - c[i - 1][0]) * t, c[i - 1][1] + (p[1] - c[i - 1][1]) * t]).slice(1)));
    return { w: 264, h: 186, body: stroke(smooth(wobble(r, pts, 1.6)), 6) };
  }],
  ["star", "Doodle star", "Sao vẽ tay", (r) => {
    const pts: P[] = Array.from({ length: 11 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI * 4) / 5;
      return [100 + Math.cos(a) * 82, 104 + Math.sin(a) * 82];
    });
    return { w: 200, h: 200, body: stroke(wobble(r, pts, 3).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(""), 6) };
  }],
  ["starFilled", "Filled star", "Sao tô", (r) => {
    const pts: P[] = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 ? 36 : 84;
      return [100 + Math.cos(a) * rad, 106 + Math.sin(a) * rad];
    });
    return { w: 200, h: 200, body: fill(smooth(wobble(r, pts, 3), true)) };
  }],
  ["sparkle", "Sparkle", "Lấp lánh", (r) => {
    const sp = (cx: number, cy: number, s: number) => {
      const pts: P[] = [[cx, cy - s], [cx + s * 0.18, cy - s * 0.18], [cx + s, cy], [cx + s * 0.18, cy + s * 0.18], [cx, cy + s], [cx - s * 0.18, cy + s * 0.18], [cx - s, cy], [cx - s * 0.18, cy - s * 0.18]];
      return fill(smooth(wobble(r, pts, 1.5), true));
    };
    return { w: 200, h: 200, body: sp(88, 104, 70) + sp(160, 44, 26) + sp(162, 160, 16) };
  }],
  ["sparkleLines", "Shine lines", "Tia sáng", (r) => {
    const lines = [-60, -25, 10].map((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const len = [70, 84, 62][i];
      const pts = wobble(r, along(6, (t) => [30 + Math.cos(a) * (20 + t * len), 150 + Math.sin(a) * (20 + t * len)]), 1.2);
      return stroke(smooth(pts), 7);
    });
    return { w: 180, h: 180, body: lines.join("") };
  }],
  ["heart", "Doodle heart", "Tim vẽ tay", (r) => {
    const pts = along(40, (t) => {
      const a = t * Math.PI * 2;
      return [100 + 16 * Math.sin(a) ** 3 * 5.2, 92 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 5.2];
    });
    return { w: 200, h: 190, body: stroke(smooth(wobble(r, pts, 2.2), true), 6) };
  }],
  ["heartFilled", "Filled heart", "Tim tô", (r) => {
    const pts = along(36, (t) => {
      const a = t * Math.PI * 2;
      return [100 + 16 * Math.sin(a) ** 3 * 5, 92 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 5];
    });
    return { w: 200, h: 190, body: fill(smooth(wobble(r, pts, 2), true)) };
  }],
  ["hearts", "Little hearts", "Tim nhỏ", (r) => {
    const h = (cx: number, cy: number, k: number) =>
      fill(smooth(wobble(r, along(28, (t) => {
        const a = t * Math.PI * 2;
        return [cx + 16 * Math.sin(a) ** 3 * k, cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * k];
      }), 1), true));
    return { w: 220, h: 160, body: h(60, 90, 2.6) + h(140, 60, 1.8) + h(170, 120, 1.3) };
  }],
  ["smile", "Smiley", "Mặt cười", (r) => {
    const face = stroke(smooth(wobble(r, along(36, (t) => [100 + Math.cos(t * Math.PI * 2.08) * 80, 100 + Math.sin(t * Math.PI * 2.08) * 80]), 2), false), 6);
    const mouth = stroke(smooth(wobble(r, along(10, (t) => [62 + t * 76, 118 + Math.sin(t * Math.PI) * 26]), 1.2)), 6);
    return { w: 200, h: 200, body: face + mouth + fill(`M72,78a8,10 0 1,0 16,0a8,10 0 1,0 -16,0Z`) + fill(`M112,78a8,10 0 1,0 16,0a8,10 0 1,0 -16,0Z`) };
  }],
  ["crown", "Crown", "Vương miện", (r) => {
    const pts: P[] = [[20, 140], [28, 50], [70, 100], [100, 34], [130, 100], [172, 50], [180, 140], [20, 140]];
    return { w: 200, h: 170, body: stroke(wobble(r, pts, 2.5).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(""), 6) };
  }],
  ["sun", "Doodle sun", "Mặt trời vẽ tay", (r) => {
    let body = stroke(smooth(wobble(r, along(30, (t) => [100 + Math.cos(t * Math.PI * 2.05) * 42, 100 + Math.sin(t * Math.PI * 2.05) * 42]), 1.5)), 6);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + r() * 0.15;
      const r1 = 58 + r() * 4;
      const r2 = 80 + r() * 12;
      body += stroke(`M${(100 + Math.cos(a) * r1).toFixed(1)},${(100 + Math.sin(a) * r1).toFixed(1)}L${(100 + Math.cos(a) * r2).toFixed(1)},${(100 + Math.sin(a) * r2).toFixed(1)}`, 6);
    }
    return { w: 200, h: 200, body };
  }],
  ["cloud", "Doodle cloud", "Mây vẽ tay", (r) => {
    const bumps: [number, number, number][] = [[60, 110, 34], [100, 82, 42], [148, 96, 34], [170, 126, 24], [30, 130, 22]];
    const pts = along(60, (t) => {
      const a = t * Math.PI * 2;
      const base: P = [100 + Math.cos(a) * 80, 118 + Math.sin(a) * 36];
      const lift = bumps.reduce((m, [bx, by, br]) => Math.max(m, br - Math.hypot(base[0] - bx, base[1] - by) * 0.4), 0);
      return [base[0], base[1] - (Math.sin(a) < 0 ? lift : 0)];
    });
    return { w: 200, h: 170, body: stroke(smooth(wobble(r, pts, 1.6), true), 6) };
  }],
  ["flower", "Doodle flower", "Hoa vẽ tay", (r) => {
    let body = "";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const cx = 100 + Math.cos(a) * 40;
      const cy = 90 + Math.sin(a) * 40;
      body += stroke(smooth(wobble(r, along(16, (t) => [cx + Math.cos(t * Math.PI * 2) * 24, cy + Math.sin(t * Math.PI * 2) * 24]), 1.2), true), 5);
    }
    body += fill(`M88,90a12,12 0 1,0 24,0a12,12 0 1,0 -24,0Z`);
    body += stroke(smooth(wobble(r, along(8, (t) => [100 + Math.sin(t * 2) * 8, 136 + t * 60]), 1)), 5);
    return { w: 200, h: 210, body };
  }],
  ["lightning", "Lightning", "Tia chớp", (r) => {
    const pts: P[] = [[112, 10], [56, 108], [100, 108], [76, 196], [146, 82], [102, 82], [128, 10]];
    return { w: 200, h: 210, body: fill(smooth(wobble(r, pts, 1.5), true).replace(/C[^C]*$/, "") + "Z") };
  }],
  ["exclaim", "Exclamation marks", "Dấu chấm than", (r) => {
    const mark = (x: number, h: number) => stroke(smooth(wobble(r, along(6, (t) => [x + t * 6, 20 + t * h]), 1.2)), 9) + fill(`M${x + 1},${h + 52}a6,6 0 1,0 12,0a6,6 0 1,0 -12,0Z`);
    return { w: 140, h: 180, body: mark(40, 90) + mark(90, 80) };
  }],
  ["check", "Check mark", "Dấu tích", (r) => ({ w: 200, h: 170, body: stroke(smooth(wobble(r, [[24, 90], [50, 112], [76, 140], [120, 84], [176, 22]], 2)), 10) })],
  ["cross", "Cross mark", "Dấu nhân", (r) => ({ w: 180, h: 180, body: stroke(smooth(wobble(r, along(6, (t) => [26 + t * 128, 26 + t * 128]), 2)), 10) + stroke(smooth(wobble(r, along(6, (t) => [154 - t * 128, 30 + t * 124]), 2)), 10) })],
  ["quotes", "Quote marks", "Dấu ngoặc kép", (r) => {
    const q = (x: number) => fill(smooth(wobble(r, [[x + 30, 30], [x + 4, 70], [x + 8, 104], [x + 34, 108], [x + 46, 84], [x + 30, 66], [x + 20, 66], [x + 38, 36]], 1.2), true));
    return { w: 140, h: 130, body: q(14) + q(74) };
  }],
  ["swirl", "Swirl", "Nét xoáy", (r) => ({ w: 200, h: 200, body: stroke(smooth(wobble(r, along(60, (t) => {
    const a = t * Math.PI * 5;
    const rad = 6 + t * 78;
    return [100 + Math.cos(a) * rad, 100 + Math.sin(a) * rad];
  }), 1.3)), 6) })],
  ["bubble", "Speech bubble", "Bong bóng thoại", (r) => {
    const pts = along(40, (t) => [130 + Math.cos(t * Math.PI * 2) * 108, 80 + Math.sin(t * Math.PI * 2) * 62]);
    const tail = stroke(smooth(wobble(r, [[70, 134], [44, 176], [104, 140]], 1.2)), 6);
    return { w: 260, h: 190, body: stroke(smooth(wobble(r, pts, 1.8), true), 6) + tail };
  }],
  ["music", "Music notes", "Nốt nhạc", (r) => {
    const stem = (x: number, y: number) => stroke(smooth(wobble(r, along(5, (t) => [x, y - t * 100]), 0.8)), 7);
    const dot = (x: number, y: number) => fill(`M${x - 22},${y}a22,16 -20 1,0 44,0a22,16 -20 1,0 -44,0Z`);
    return { w: 200, h: 190, body: stem(78, 150) + stem(166, 130) + stroke(smooth(wobble(r, [[78, 50], [120, 36], [166, 30]], 1)), 12) + dot(58, 150) + dot(146, 130) };
  }],
  ["dots", "Dots", "Chấm chấm", (r) => {
    let body = "";
    for (let i = 0; i < 7; i++) body += fill(`M${(20 + r() * 160).toFixed(1)},${(20 + r() * 120).toFixed(1)}a${(5 + r() * 6).toFixed(1)},${(5 + r() * 6).toFixed(1)} 0 1,0 0.1,0Z`);
    return { w: 200, h: 160, body };
  }],
  ["burst", "Burst", "Nổ tung", (r) => {
    const pts: P[] = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const rad = i % 2 ? 56 : 92;
      return [110 + Math.cos(a) * rad, 100 + Math.sin(a) * rad * 0.8];
    });
    return { w: 220, h: 200, body: stroke(wobble(r, [...pts, pts[0]], 3).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(""), 6) };
  }],
];

/** Doodle stickers, by key ("doodle-<name>"). */
export const DOODLES: Record<string, Sticker> = Object.fromEntries(
  LIST.map(([key, en, vi, make], i) => {
    const { w, h, body } = make(rng(1000 + i * 7));
    return [`doodle-${key}`, { name: { en, vi }, w, h, color: "#1d1c1a", body }];
  }),
);

export const DOODLE_KEYS = Object.keys(DOODLES);
