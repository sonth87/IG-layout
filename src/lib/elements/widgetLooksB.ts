// More looks, and the new one-job widgets (D-122): social, fitness, shopping, to-do, more.
import {
  type C,
  type F,
  type Pal,
  type TextOpts,
  MONO,
  SERIF,
  HAND,
  bare,
  card,
  dashed,
  drawLines,
  fillRR,
  lifted,
  linesH,
  onPhoto,
  pct,
  rr,
  seeded,
  star,
  tape,
  text,
  textW,
  wrap,
} from "./widgetKit";

type Size = { w: number; h: number };
type Rows = Record<string, Record<string, string>[]>;
const P = 36;
const onColor = (pal: Pal) => (pal.theme === "color" ? pal.fg : pal.color);
const onColorText = (pal: Pal) => (pal.theme === "color" ? pal.bg : pal.onAc);

// ================================================================ social

export function pollLook(c: C, f: F, pal: Pal, L: Rows, v: string): Size {
  const opts = L.options ?? [];
  if (v === "minimal") {
    const ink = bare(pal);
    const w = 600;
    const q: TextOpts = { size: 38, weight: 800, color: ink, lh: 1.25 };
    const qL = f.question?.trim() ? wrap(c, f.question, q, w, 3) : [];
    const h = (qL.length ? linesH(qL.length, q) + 20 : 0) + opts.length * 74;
    onPhoto(c, pal, () => {
      let y = drawLines(c, qL, 0, 0, q) + (qL.length ? 20 : 0);
      for (const o of opts) {
        text(c, o.label, 0, y, { size: 26, weight: 600, color: ink, lh: 1.3 }, w - 100);
        text(c, o.percent, w, y, { size: 26, weight: 800, color: ink, align: "right", lh: 1.3 });
        c.globalAlpha = 0.35;
        fillRR(c, 0, y + 42, w, 10, 5, ink);
        c.globalAlpha = 1;
        fillRR(c, 0, y + 42, Math.max(10, w * pct(o.percent)), 10, 5, ink);
        y += 74;
      }
    });
    return { w, h };
  }
  // Big buttons, one per option.
  const w = 560;
  const q: TextOpts = { size: 34, weight: 800, color: pal.fg, align: "center", lh: 1.25 };
  const qL = f.question?.trim() ? wrap(c, f.question, q, w - P * 2, 3) : [];
  const row = 84;
  const h = P + (qL.length ? linesH(qL.length, q) + 24 : 0) + opts.length * (row + 14) - 14 + P;
  card(c, w, h, pal, 40);
  let y = P + (qL.length ? drawLines(c, qL, w / 2, P, q) + 24 : 0);
  const hues = [onColor(pal), "#ff9f0a", "#34c759", "#af52de"];
  opts.forEach((o, i) => {
    const col = pal.theme === "color" ? pal.fg : hues[i % hues.length];
    fillRR(c, P, y, w - P * 2, row, 24, col);
    const tc = pal.theme === "color" ? pal.bg : "#ffffff";
    text(c, o.label, w / 2, y + 12, { size: 28, weight: 800, color: tc, align: "center", lh: 1.25 }, w - P * 2 - 40);
    if (o.percent) text(c, o.percent, w / 2, y + 48, { size: 18, weight: 700, color: tc, align: "center", lh: 1.2 });
    y += row + 14;
  });
  return { w, h };
}

/** A speech bubble with a tail, the question big, the answer under. */
export function questionLook(c: C, f: F, pal: Pal): Size {
  const w = 560;
  const p: TextOpts = { size: 22, weight: 700, color: pal.sub, align: "center", lh: 1.3 };
  const q: TextOpts = { size: 34, weight: 800, color: pal.fg, align: "center", lh: 1.28 };
  const a: TextOpts = { size: 26, weight: 500, color: onColor(pal), align: "center", lh: 1.32 };
  const qL = wrap(c, f.question, q, w - P * 2, 3);
  const aL = f.answer ? wrap(c, f.answer, a, w - P * 2, 3) : [];
  const body = P + 30 + 10 + linesH(qL.length, q) + (aL.length ? 18 + linesH(aL.length, a) : 0) + P;
  const h = body + 44;
  lifted(c, () => {
    c.beginPath();
    c.roundRect(0, 0, w, body, 44);
    c.moveTo(90, body - 2);
    c.lineTo(70, body + 40);
    c.lineTo(150, body - 2);
    c.fillStyle = pal.bg;
    c.fill();
  });
  text(c, f.prompt, w / 2, P, p, w - P * 2);
  let y = P + 40;
  y += drawLines(c, qL, w / 2, y, q);
  if (aL.length) drawLines(c, aL, w / 2, y + 18, a);
  return { w, h };
}

export function chatLook(c: C, f: F, pal: Pal, L: Rows, v: string): Size {
  const w = 600;
  const msg: TextOpts = { size: 27, weight: 500, color: pal.fg, lh: 1.3 };
  const max = w * 0.7;
  const msgs = (L.messages ?? []).filter((m) => m.text?.trim()).map((m) => ({ out: m.side === "out", lines: wrap(c, m.text, msg, max - 48, 5) }));
  const bubble = (n: number) => linesH(n, msg) + 32;
  const green = v === "green";
  const top = f.senderName?.trim() ? 56 : 0;
  const h = P + top + msgs.reduce((a, m) => a + bubble(m.lines.length) + 12, 0) - (msgs.length ? 12 : 0) + P;
  const bg = green ? (pal.theme === "dark" ? "#0b141a" : "#efe7dc") : pal.bg;
  card(c, w, h, pal, 36, bg);
  if (green) {
    // Doodle wallpaper: faint small shapes.
    const r = seeded(f.senderName ?? "chat");
    c.save();
    rr(c, 0, 0, w, h, 36);
    c.clip();
    c.strokeStyle = pal.theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    c.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      c.beginPath();
      c.arc(r() * w, r() * h, 6 + r() * 10, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  }
  if (top) text(c, f.senderName, w / 2, P - 6, { size: 22, weight: 700, color: pal.sub, align: "center", lh: 1.3 }, w - P * 2);
  let y = P + top;
  const widest = (lines: string[]) => Math.max(...lines.map((l) => textW(c, l, msg)));
  for (const m of msgs) {
    const bw = widest(m.lines) + 48;
    const bh = bubble(m.lines.length);
    const x = m.out ? w - P - bw : P;
    let fill: string | CanvasGradient;
    let ink: string;
    if (m.out) {
      if (green) {
        fill = pal.theme === "dark" ? "#005c4b" : "#d9fdd3";
        ink = pal.theme === "dark" ? "#e9edef" : "#111b21";
      } else {
        const g = c.createLinearGradient(x, y, x + bw, y + bh);
        g.addColorStop(0, "#a334fa");
        g.addColorStop(1, "#0695ff");
        fill = g;
        ink = "#ffffff";
      }
    } else {
      fill = green ? (pal.theme === "dark" ? "#202c33" : "#ffffff") : pal.soft;
      ink = green && pal.theme === "dark" ? "#e9edef" : pal.fg;
    }
    if (green) {
      // Square-ish bubble with a little tail.
      c.beginPath();
      c.roundRect(x, y, bw, bh, 14);
      if (m.out) {
        c.moveTo(x + bw - 4, y);
        c.lineTo(x + bw + 14, y);
        c.lineTo(x + bw - 4, y + 18);
      } else {
        c.moveTo(x + 4, y);
        c.lineTo(x - 14, y);
        c.lineTo(x + 4, y + 18);
      }
      c.fillStyle = fill;
      c.fill();
    } else fillRR(c, x, y, bw, bh, bh / 2 > 40 ? 30 : bh / 2, fill);
    drawLines(c, m.lines, x + 24, y + 16, { ...msg, color: ink });
    y += bh + 12;
  }
  return { w, h };
}

export function notificationLook(c: C, f: F, pal: Pal, v: string): Size {
  const w = 660;
  const p = 30;
  const title: TextOpts = { size: 28, weight: 700, color: pal.fg, lh: 1.28 };
  const body: TextOpts = { size: 26, weight: 400, color: pal.fg, lh: 1.3 };
  if (v === "lock") {
    // Darker frosted glass, white text, as on a lock screen.
    const tL = f.title ? wrap(c, f.title, title, w - p * 2 - 70, 2) : [];
    const bL = f.body ? wrap(c, f.body, body, w - p * 2 - 70, 3) : [];
    const h = p + linesH(tL.length, title) + linesH(bL.length, body) + p + 4;
    lifted(c, () => fillRR(c, 0, 0, w, Math.max(h, 110), 44, "rgba(40,40,45,0.55)"), 30, 10, 0.2);
    c.strokeStyle = "rgba(255,255,255,0.18)";
    c.lineWidth = 2;
    rr(c, 1, 1, w - 2, Math.max(h, 110) - 2, 43);
    c.stroke();
    fillRR(c, p, p + 2, 50, 50, 12, onColor(pal));
    text(c, Array.from(f.appName ?? "•")[0], p + 25, p + 10, { size: 26, weight: 800, color: onColorText(pal), align: "center", lh: 1.3 });
    const x = p + 70;
    text(c, f.timeAgo, w - p, p, { size: 20, weight: 500, color: "rgba(255,255,255,0.7)", align: "right", lh: 1.3 });
    let y = p - 2;
    y += drawLines(c, tL, x, y, { ...title, color: "#ffffff" });
    drawLines(c, bL, x, y, { ...body, color: "rgba(255,255,255,0.92)" });
    return { w, h: Math.max(h, 110) };
  }
  // Flat card: small coloured app line, then the title and the text.
  const tL = f.title ? wrap(c, f.title, title, w - p * 2, 2) : [];
  const bL = f.body ? wrap(c, f.body, { ...body, color: pal.sub }, w - p * 2, 3) : [];
  const h = p + 30 + 12 + linesH(tL.length, title) + linesH(bL.length, body) + p;
  card(c, w, h, pal, 28);
  c.beginPath();
  c.arc(p + 12, p + 15, 12, 0, Math.PI * 2);
  c.fillStyle = onColor(pal);
  c.fill();
  text(c, [f.appName, f.timeAgo].filter(Boolean).join(" • "), p + 34, p, { size: 20, weight: 600, color: onColor(pal), lh: 1.5 }, w - p * 2 - 40);
  let y = p + 42;
  y += drawLines(c, tL, p, y, title);
  drawLines(c, bL, p, y, { ...body, color: pal.sub });
  return { w, h };
}

export function hashtagLook(c: C, f: F, pal: Pal, L: Rows, v: string): Size {
  const tags = (L.tags ?? []).map((t) => t.text).filter((s) => s?.trim());
  const o: TextOpts = { size: 34, weight: 800, color: "#111", lh: 1.3 };
  const r = seeded(tags.join("|"));
  const sizes = tags.map((t) => textW(c, t, o) + 36);
  const w = Math.min(680, Math.max(240, ...sizes) + 40);
  // One tag per line, a little turned, like stickers or highlighted words.
  const rowH = 74;
  const h = tags.length * rowH + 30;
  tags.forEach((t, i) => {
    const tw = Math.min(w - 40, sizes[i]);
    const x = 20 + r() * (w - 40 - tw);
    const y = 15 + i * rowH;
    c.save();
    c.translate(x + tw / 2, y + rowH / 2);
    c.rotate((r() - 0.5) * 0.12);
    if (v === "sticker") {
      lifted(c, () => fillRR(c, -tw / 2 - 8, -34, tw + 16, 68, 18, "#ffffff"), 10, 4, 0.25);
      fillRR(c, -tw / 2, -26, tw, 52, 12, i % 2 ? "#ffe066" : onColor(pal));
      text(c, t, 0, -23, { ...o, color: i % 2 ? "#111" : onColorText(pal), align: "center" }, tw - 20);
    } else {
      fillRR(c, -tw / 2, -28, tw, 56, 4, pal.theme === "dark" ? "#111111" : pal.theme === "color" ? pal.color : "#ffffff");
      text(c, t, 0, -24, { ...o, color: pal.theme === "light" ? "#111" : "#ffffff", align: "center" }, tw - 20);
    }
    c.restore();
  });
  return { w, h };
}

export function mentionLook(c: C, f: F, pal: Pal): Size {
  const ink = bare(pal);
  const hd: TextOpts = { size: 46, weight: 800, color: ink, lh: 1.25 };
  const w = Math.max(textW(c, f.handle, hd), textW(c, f.role, { size: 28, color: "", family: HAND })) + 20;
  const h = 130;
  onPhoto(c, pal, () => {
    text(c, f.handle, 0, 0, hd);
    c.strokeStyle = ink;
    c.lineWidth = 5;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(4, 66);
    c.quadraticCurveTo(w / 2, 58, w - 10, 68);
    c.stroke();
    text(c, f.role, 6, 80, { size: 28, weight: 400, color: ink, family: HAND, lh: 1.3 }, w);
  });
  return { w, h };
}

export function searchLook(c: C, f: F, pal: Pal): Size {
  const w = 700;
  const h = 200;
  const chrome = pal.theme === "dark" ? "#2c2c2e" : pal.theme === "color" ? pal.color : "#e9e9ee";
  card(c, w, h, pal, 24, chrome);
  for (const [i, col] of ["#ff5f57", "#febc2e", "#28c840"].entries()) {
    c.beginPath();
    c.arc(34 + i * 30, 34, 10, 0, Math.PI * 2);
    c.fillStyle = col;
    c.fill();
  }
  // A tab.
  fillRR(c, 140, 14, 220, 44, 12, pal.theme === "dark" ? "#1c1c1e" : "#ffffff");
  text(c, f.hint, 160, 22, { size: 18, weight: 600, color: pal.theme === "dark" ? "#ddd" : "#333", lh: 1.6 }, 180);
  fillRR(c, 24, 84, w - 48, 86, 43, pal.theme === "dark" ? "#1c1c1e" : "#ffffff");
  c.strokeStyle = "#8e8e93";
  c.lineWidth = 4;
  c.lineCap = "round";
  c.beginPath();
  c.arc(72, 123, 13, 0, Math.PI * 2);
  c.moveTo(82, 133);
  c.lineTo(92, 143);
  c.stroke();
  text(c, f.query, 112, 108, { size: 28, weight: 500, color: pal.theme === "dark" ? "#fff" : "#111", lh: 1.3 }, w - 160);
  // Blinking cursor.
  const qx = 112 + Math.min(w - 170, textW(c, f.query, { size: 28, weight: 500, color: "" })) + 6;
  c.fillStyle = "#0a84ff";
  c.fillRect(qx, 108, 3, 34);
  return { w, h };
}

export function starsLook(c: C, f: F, pal: Pal, v: string, r: number): Size {
  if (v === "stars") {
    const ink = bare(pal);
    const w = 5 * 96;
    const h = 150;
    onPhoto(c, pal, () => {
      for (let i = 0; i < 5; i++) {
        const cx = 48 + i * 96;
        star(c, cx, 48, 42);
        c.globalAlpha = 0.35;
        c.fillStyle = ink;
        c.fill();
        c.globalAlpha = 1;
        const part = Math.max(0, Math.min(1, r - i));
        if (part > 0) {
          c.save();
          c.beginPath();
          c.rect(cx - 44, 0, 88 * part, 96);
          c.clip();
          star(c, cx, 48, 42);
          c.fillStyle = pal.theme === "light" ? "#ffd60a" : ink;
          c.fill();
          c.restore();
        }
      }
      text(c, f.title, w / 2, 104, { size: 28, weight: 700, color: ink, align: "center", lh: 1.3 }, w);
    });
    return { w, h };
  }
  // Big score with small stars under it.
  const w = 440;
  const h = 360;
  card(c, w, h, pal, 40);
  text(c, r.toFixed(1), w / 2, 30, { size: 130, weight: 900, color: pal.fg, align: "center", lh: 1.1 });
  for (let i = 0; i < 5; i++) {
    const cx = w / 2 - 120 + i * 60;
    star(c, cx, 210, 24);
    c.fillStyle = pal.line;
    c.fill();
    const part = Math.max(0, Math.min(1, r - i));
    if (part > 0) {
      c.save();
      c.beginPath();
      c.rect(cx - 26, 184, 52 * part, 52);
      c.clip();
      star(c, cx, 210, 24);
      c.fillStyle = pal.ac;
      c.fill();
      c.restore();
    }
  }
  text(c, f.title, w / 2, 256, { size: 28, weight: 800, color: pal.fg, align: "center", lh: 1.3 }, w - 60);
  text(c, f.comment, w / 2, 298, { size: 20, weight: 500, color: pal.sub, align: "center", lh: 1.3 }, w - 60);
  return { w, h };
}

/** Likes / comments / followers, as a pop-up bubble or a pill. */
export function likeCount(c: C, f: F, pal: Pal, v: string): Size {
  const items: [string, string][] = [
    ["heart", f.likes],
    ["comment", f.comments],
    ["person", f.follows],
  ].filter(([, n]) => n?.trim()) as [string, string][];
  const o: TextOpts = { size: 40, weight: 800, color: "#ffffff", lh: 1.2 };
  const icon = (kind: string, x: number, y: number, s: number, col: string) => {
    c.save();
    c.translate(x, y);
    c.fillStyle = col;
    c.beginPath();
    if (kind === "heart") {
      c.moveTo(0, s * 0.35);
      c.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.45, -s * 0.85, 0, -s * 0.35);
      c.bezierCurveTo(s * 0.45, -s * 0.85, s * 0.9, -s * 0.2, 0, s * 0.35);
    } else if (kind === "comment") {
      c.arc(0, -s * 0.05, s * 0.48, 0, Math.PI * 2);
      c.moveTo(-s * 0.4, s * 0.15);
      c.lineTo(-s * 0.5, s * 0.5);
      c.lineTo(-s * 0.1, s * 0.38);
    } else {
      c.arc(0, -s * 0.25, s * 0.25, 0, Math.PI * 2);
      c.moveTo(-s * 0.45, s * 0.45);
      c.arc(0, s * 0.45, s * 0.45, Math.PI, 0);
    }
    c.fill();
    c.restore();
  };
  const widths = items.map(([, n]) => 52 + textW(c, n, o));
  const inner = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * 28;
  if (v === "pill") {
    const w = inner + 60;
    const h = 100;
    card(c, w, h, pal, 50);
    let x = 30;
    items.forEach(([k, n], i) => {
      icon(k, x + 20, h / 2, 40, k === "heart" ? "#ff3040" : pal.fg);
      text(c, n, x + 50, h / 2 - 24, { ...o, color: pal.fg });
      x += widths[i] + 28;
    });
    return { w, h };
  }
  const w = inner + 64;
  const h = 130;
  const red = pal.theme === "color" ? pal.color : "#ff3040";
  lifted(c, () => {
    c.beginPath();
    c.roundRect(0, 0, w, 100, 30);
    c.moveTo(w / 2 - 20, 98);
    c.lineTo(w / 2, 126);
    c.lineTo(w / 2 + 20, 98);
    c.fillStyle = red;
    c.fill();
  }, 16, 6, 0.25);
  let x = 32;
  items.forEach(([k, n], i) => {
    icon(k, x + 20, 50, 40, "#ffffff");
    text(c, n, x + 50, 26, o);
    x += widths[i] + 28;
  });
  return { w, h };
}

/** A question with an emoji on a slider track. */
export function emojiSlider(c: C, f: F, pal: Pal, v: string): Size {
  const level = pct(f.level) || 0.7;
  if (v === "minimal") {
    const ink = bare(pal);
    const w = 620;
    const h = 170;
    onPhoto(c, pal, () => {
      text(c, f.question, 0, 0, { size: 34, weight: 800, color: ink, lh: 1.3 }, w);
      c.globalAlpha = 0.4;
      fillRR(c, 0, 108, w, 12, 6, ink);
      c.globalAlpha = 1;
      fillRR(c, 0, 108, w * level, 12, 6, ink);
    });
    text(c, f.emoji, w * level, 64, { size: 70, color: "#000", align: "center", lh: 1.2 });
    return { w, h };
  }
  const w = 560;
  const q: TextOpts = { size: 34, weight: 800, color: pal.fg, align: "center", lh: 1.28 };
  const qL = wrap(c, f.question, q, w - P * 2, 3);
  const h = P + linesH(qL.length, q) + 40 + 70 + P;
  card(c, w, h, pal, 40);
  drawLines(c, qL, w / 2, P, q);
  const y = P + linesH(qL.length, q) + 60;
  const tw = w - P * 2 - 20;
  fillRR(c, P + 10, y, tw, 16, 8, pal.soft);
  const g = c.createLinearGradient(P + 10, 0, P + 10 + tw, 0);
  g.addColorStop(0, "#ff9f0a");
  g.addColorStop(1, pal.theme === "color" ? "#ffffff" : "#ff2d55");
  fillRR(c, P + 10, y, Math.max(16, tw * level), 16, 8, g);
  text(c, f.emoji, P + 10 + tw * level, y - 38, { size: 72, color: "#000", align: "center", lh: 1.2 });
  return { w, h };
}

// ================================================================ fitness

export function stepsLook(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "big") {
    const ink = bare(pal);
    const w = Math.max(480, textW(c, f.steps, { size: 120, weight: 900, color: "" }) + 20);
    const h = 260;
    onPhoto(c, pal, () => {
      text(c, "👟", 0, 0, { size: 50, color: ink, lh: 1.2 });
      text(c, f.steps, 0, 60, { size: 110, weight: 900, color: ink, lh: 1.1 }, w);
      text(c, [f.distance, f.caption].filter(Boolean).join("  ·  "), 4, 196, { size: 28, weight: 600, color: ink, lh: 1.3 }, w);
    });
    return { w, h };
  }
  // A bar towards a goal.
  const w = 560;
  const h = 250;
  card(c, w, h, pal, 36);
  text(c, f.steps, P, P, { size: 52, weight: 900, color: pal.fg, lh: 1.15 }, w - P * 2);
  text(c, f.distance, w - P, P + 16, { size: 26, weight: 700, color: pal.sub, align: "right", lh: 1.3 });
  fillRR(c, P, P + 86, w - P * 2, 24, 12, pal.soft);
  fillRR(c, P, P + 86, (w - P * 2) * 0.78, 24, 12, pal.ac);
  text(c, f.caption, P, P + 128, { size: 24, weight: 500, color: pal.sub, lh: 1.3 }, w - P * 2);
  return { w, h };
}

/** A route-like squiggle, the same for the same title. */
function squiggle(c: C, x: number, y: number, w: number, h: number, seed: string, color: string) {
  const r = seeded(seed || "run");
  c.save();
  c.strokeStyle = color;
  c.lineWidth = 6;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  let px = x;
  let py = y + h * (0.3 + r() * 0.4);
  c.moveTo(px, py);
  for (let i = 0; i < 8; i++) {
    const nx = x + ((i + 1) / 8) * w;
    const ny = y + h * (0.1 + r() * 0.8);
    c.quadraticCurveTo(px + (nx - px) / 2 + (r() - 0.5) * 40, py + (r() - 0.5) * h * 0.6, nx, ny);
    px = nx;
    py = ny;
  }
  c.stroke();
  c.restore();
  c.beginPath();
  c.arc(x, y + h / 2, 8, 0, Math.PI * 2);
  c.fillStyle = "#34c759";
  c.fill();
  c.beginPath();
  c.arc(px, py, 8, 0, Math.PI * 2);
  c.fillStyle = "#ff3b30";
  c.fill();
}

export function runSummary(c: C, f: F, pal: Pal, v: string): Size {
  const stats: [string, string][] = [
    [f.distanceLabel || "km", f.distance],
    [f.paceLabel || "pace", f.pace],
    [f.timeLabel || "time", f.time],
  ];
  if (v === "big") {
    const ink = bare(pal);
    const w = 600;
    const h = 330;
    onPhoto(c, pal, () => {
      text(c, (f.title ?? "").toUpperCase(), 0, 0, { size: 26, weight: 800, color: ink, lh: 1.3 }, w);
      text(c, f.distance, 0, 40, { size: 150, weight: 900, color: ink, lh: 1.05 }, w);
      stats.slice(1).forEach(([k, val], i) => {
        text(c, k.toUpperCase(), i * 260, 222, { size: 20, weight: 700, color: ink, lh: 1.3 });
        text(c, val, i * 260, 252, { size: 40, weight: 800, color: ink, lh: 1.2 }, 250);
      });
    });
    return { w, h };
  }
  if (v === "minimal") {
    const ink = bare(pal);
    const w = 660;
    const h = 110;
    onPhoto(c, pal, () => {
      stats.forEach(([k, val], i) => {
        const x = i * 230;
        text(c, val, x, 0, { size: 46, weight: 800, color: ink, lh: 1.2 }, 220);
        text(c, k.toUpperCase(), x, 62, { size: 20, weight: 700, color: ink, lh: 1.3 }, 220);
      });
    });
    return { w, h };
  }
  const w = 620;
  const h = 470;
  card(c, w, h, pal, 40, pal.theme === "light" ? "#111214" : pal.bg);
  const ink = pal.theme === "light" ? "#ffffff" : pal.fg;
  const sub = pal.theme === "light" ? "#9a9aa0" : pal.sub;
  text(c, f.title, P, P, { size: 30, weight: 800, color: ink, lh: 1.3 }, w - P * 2);
  fillRR(c, P, P + 56, w - P * 2, 200, 24, pal.theme === "light" ? "#1f2125" : pal.soft);
  squiggle(c, P + 40, P + 76, w - P * 2 - 80, 160, f.title ?? "", pal.theme === "color" ? pal.fg : pal.color);
  stats.forEach(([k, val], i) => {
    const x = P + i * ((w - P * 2) / 3);
    text(c, val, x, P + 290, { size: 42, weight: 800, color: ink, lh: 1.2 }, (w - P * 2) / 3 - 10);
    text(c, k.toUpperCase(), x, P + 348, { size: 18, weight: 700, color: sub, lh: 1.3 }, (w - P * 2) / 3 - 10);
  });
  return { w, h };
}

/** Move / exercise / stand rings. */
export function activityRings(c: C, f: F, pal: Pal, v: string): Size {
  const rings: [string, string, string][] = [
    [f.moveLabel || "Move", f.move, "#fa114f"],
    [f.exerciseLabel || "Exercise", f.exercise, "#92e82a"],
    [f.standLabel || "Stand", f.stand, "#1eeaef"],
  ];
  const drawRings = (cx: number, cy: number, R: number) => {
    rings.forEach(([, val, col], i) => {
      const r = R - i * 44;
      c.lineWidth = 36;
      c.lineCap = "round";
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.strokeStyle = col + "33";
      c.stroke();
      const p = Math.max(0.02, Math.min(1, pct(val)));
      c.beginPath();
      c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
      c.strokeStyle = col;
      c.stroke();
    });
  };
  if (v === "rings") {
    const S = 340;
    drawRings(S / 2, S / 2, 150);
    return { w: S, h: S };
  }
  const w = 640;
  const h = 380;
  card(c, w, h, pal, 40, pal.theme === "light" ? "#000000" : pal.bg);
  drawRings(190, h / 2, 150);
  const ink = pal.theme === "light" ? "#ffffff" : pal.fg;
  rings.forEach(([k, val, col], i) => {
    text(c, k, 390, 70 + i * 90, { size: 24, weight: 700, color: ink, lh: 1.3 }, 220);
    text(c, val, 390, 100 + i * 90, { size: 36, weight: 800, color: col, lh: 1.2 }, 220);
  });
  return { w, h };
}

/** Glasses of water drunk out of a goal. */
export function water(c: C, f: F, pal: Pal, v: string): Size {
  const n = Math.max(0, Math.min(12, parseInt(f.count ?? "", 10) || 0));
  const goal = Math.max(1, Math.min(12, parseInt(f.goal ?? "", 10) || 8));
  const blue = pal.theme === "color" ? pal.fg : "#2fa6ff";
  if (v === "drop") {
    const w = 380;
    const h = 500;
    card(c, w, h, pal, 40);
    const cx = w / 2;
    const drop = () => {
      c.beginPath();
      c.moveTo(cx, 50);
      c.bezierCurveTo(cx + 40, 120, cx + 120, 190, cx + 120, 270);
      c.arc(cx, 270, 120, 0, Math.PI);
      c.bezierCurveTo(cx - 120, 190, cx - 40, 120, cx, 50);
      c.closePath();
    };
    drop();
    c.fillStyle = pal.soft;
    c.fill();
    c.save();
    drop();
    c.clip();
    const level = 390 - (390 - 50) * Math.min(1, n / goal);
    c.fillStyle = blue;
    c.fillRect(0, level, w, h);
    c.restore();
    text(c, `${n}/${goal}`, cx, 220, { size: 64, weight: 900, color: n / goal > 0.5 ? "#ffffff" : pal.fg, align: "center", lh: 1.1 });
    text(c, f.caption, cx, 420, { size: 26, weight: 700, color: pal.fg, align: "center", lh: 1.3 }, w - 40);
    return { w, h };
  }
  const per = Math.min(goal, 8);
  const cw = 64;
  const w = P * 2 + per * cw + (per - 1) * 12;
  const h = 250;
  card(c, w, h, pal, 36);
  text(c, f.caption, P, P - 4, { size: 26, weight: 800, color: pal.fg, lh: 1.3 }, w - P * 2 - 90);
  text(c, `${n}/${goal}`, w - P, P - 4, { size: 26, weight: 800, color: blue, align: "right", lh: 1.3 });
  for (let i = 0; i < per; i++) {
    const x = P + i * (cw + 12);
    const y = 100;
    const glass = () => {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + cw, y);
      c.lineTo(x + cw - 8, y + 100);
      c.lineTo(x + 8, y + 100);
      c.closePath();
    };
    if (i < n) {
      c.save();
      glass();
      c.clip();
      c.fillStyle = blue;
      c.fillRect(x, y + 22, cw, 80);
      c.restore();
    }
    glass();
    c.strokeStyle = i < n ? blue : pal.line;
    c.lineWidth = 4;
    c.stroke();
  }
  return { w, h };
}

/** Hours slept, bedtime and wake time. */
export function sleep(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "bar") {
    const w = 600;
    const h = 250;
    card(c, w, h, pal, 36);
    text(c, f.caption, P, P - 4, { size: 24, weight: 700, color: pal.sub, lh: 1.3 }, w - P * 2);
    text(c, f.hours, P, P + 30, { size: 56, weight: 900, color: pal.fg, lh: 1.15 }, w - P * 2);
    const y = P + 116;
    const g = c.createLinearGradient(P, 0, w - P, 0);
    g.addColorStop(0, "#5e5ce6");
    g.addColorStop(1, "#bf5af2");
    fillRR(c, P, y, w - P * 2, 22, 11, pal.theme === "color" ? pal.fg : g);
    text(c, `🌙 ${f.bedtime ?? ""}`, P, y + 34, { size: 22, weight: 600, color: pal.sub, lh: 1.3 });
    text(c, `${f.wake ?? ""} ☀️`, w - P, y + 34, { size: 22, weight: 600, color: pal.sub, align: "right", lh: 1.3 });
    return { w, h };
  }
  const w = 520;
  const h = 360;
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, pal.theme === "color" ? pal.color : "#14163a");
  g.addColorStop(1, pal.theme === "color" ? "#111" : "#2b2f6b");
  lifted(c, () => fillRR(c, 0, 0, w, h, 40, "#14163a"), 24, 10, 0.3);
  fillRR(c, 0, 0, w, h, 40, g);
  const r = seeded(f.hours ?? "z");
  c.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 26; i++) c.fillRect(r() * w, r() * h * 0.6, 2.5, 2.5);
  // Crescent moon.
  c.beginPath();
  c.arc(w - 100, 90, 46, 0, Math.PI * 2);
  c.fillStyle = "#ffe8a3";
  c.fill();
  c.beginPath();
  c.arc(w - 80, 74, 42, 0, Math.PI * 2);
  c.fillStyle = pal.theme === "color" ? pal.color : "#171a42";
  c.fill();
  text(c, f.caption, P, P, { size: 24, weight: 700, color: "rgba(255,255,255,0.75)", lh: 1.3 }, w - 200);
  text(c, f.hours, P, 120, { size: 76, weight: 900, color: "#ffffff", lh: 1.1 }, w - P * 2);
  text(c, `${f.bedtime ?? ""}  →  ${f.wake ?? ""}`, P, h - P - 36, { size: 28, weight: 600, color: "rgba(255,255,255,0.85)", lh: 1.3 }, w - P * 2);
  return { w, h };
}

// ================================================================ shopping

export function receiptLook(c: C, f: F, pal: Pal, L: Rows, v: string): Size {
  const lines = (L.lines ?? []).map((l) => l.text).filter((s) => s?.trim());
  if (v === "handwritten") {
    const w = 520;
    const ln: TextOpts = { size: 32, weight: 400, color: "#24324f", family: HAND, lh: 1.5 };
    const h = 90 + lines.length * 48 + 110;
    lifted(c, () => {
      c.fillStyle = "#fffdf6";
      c.fillRect(0, 0, w, h);
    });
    c.strokeStyle = "rgba(80,130,200,0.25)";
    c.lineWidth = 2;
    for (let y = 80; y < h - 20; y += 48) {
      c.beginPath();
      c.moveTo(0, y + 40);
      c.lineTo(w, y + 40);
      c.stroke();
    }
    c.strokeStyle = "rgba(220,80,80,0.35)";
    c.beginPath();
    c.moveTo(60, 0);
    c.lineTo(60, h);
    c.stroke();
    text(c, f.storeName, 80, 28, { ...ln, size: 36, weight: 700 }, w - 100);
    lines.forEach((t, i) => text(c, t, 80, 80 + i * 48, ln, w - 100));
    text(c, f.total, 80, 80 + lines.length * 48 + 10, { ...ln, color: "#c0392b", size: 34 }, w - 100);
    tape(c, w / 2, 0, 140, -0.03);
    return { w, h };
  }
  // Restaurant bill: name, dotted lines, total in a box.
  const w = 520;
  const ln: TextOpts = { size: 24, weight: 500, color: "#2b2118", family: SERIF, lh: 1.4 };
  const wrapped = lines.map((t) => wrap(c, t, ln, w - 100, 2));
  const h = 210 + wrapped.reduce((a, l) => a + linesH(l.length, ln) + 10, 0) + 130;
  card(c, w, h, pal, 8, "#fbf6ea");
  c.beginPath();
  c.arc(w / 2, 70, 34, 0, Math.PI * 2);
  c.strokeStyle = "#2b2118";
  c.lineWidth = 3;
  c.stroke();
  text(c, Array.from(f.storeName ?? "•")[0], w / 2, 50, { size: 34, weight: 700, color: "#2b2118", family: SERIF, align: "center", lh: 1.2 });
  text(c, f.storeName, w / 2, 118, { size: 28, weight: 700, color: "#2b2118", family: SERIF, align: "center", lh: 1.3 }, w - 60);
  dashed(c, 50, 172, w - 50, "rgba(43,33,24,0.4)", 2, [3, 6]);
  let y = 190;
  for (const l of wrapped) y += drawLines(c, l, 50, y, ln) + 10;
  dashed(c, 50, y + 6, w - 50, "rgba(43,33,24,0.4)", 2, [3, 6]);
  c.strokeStyle = "#2b2118";
  c.lineWidth = 2;
  rr(c, 50, y + 30, w - 100, 64, 6);
  c.stroke();
  text(c, f.total, w / 2, y + 46, { size: 26, weight: 800, color: "#2b2118", family: SERIF, align: "center", lh: 1.3 }, w - 120);
  return { w, h };
}

export function priceLook(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "burst") {
    const S = 420;
    const cx = S / 2;
    lifted(c, () => {
      c.beginPath();
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const r = i % 2 ? 170 : 200;
        c.lineTo(cx + Math.cos(a) * r, cx + Math.sin(a) * r);
      }
      c.closePath();
      c.fillStyle = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#111" : "#ff3b30";
      c.fill();
    }, 14, 6, 0.25);
    c.beginPath();
    c.arc(cx, cx, 150, 0, Math.PI * 2);
    c.strokeStyle = "rgba(255,255,255,0.6)";
    c.lineWidth = 3;
    c.setLineDash([6, 6]);
    c.stroke();
    c.setLineDash([]);
    text(c, f.badge, cx, 108, { size: 30, weight: 900, color: "#ffe066", align: "center", lh: 1.2 }, 260);
    text(c, f.salePrice, cx, 150, { size: 64, weight: 900, color: "#ffffff", align: "center", lh: 1.15 }, 290);
    text(c, f.originalPrice, cx, 238, { size: 26, weight: 600, color: "rgba(255,255,255,0.8)", align: "center", strike: true, lh: 1.3 }, 260);
    return { w: S, h: S };
  }
  const ink = bare(pal);
  const w = Math.max(420, textW(c, f.salePrice, { size: 100, weight: 900, color: "" }) + 20);
  const h = 250;
  onPhoto(c, pal, () => {
    text(c, f.itemName, 0, 0, { size: 30, weight: 700, color: ink, lh: 1.3 }, w);
    text(c, f.originalPrice, 0, 50, { size: 34, weight: 600, color: ink, strike: true, lh: 1.3 }, w);
    text(c, f.salePrice, 0, 98, { size: 100, weight: 900, color: pal.theme === "light" ? "#ffe066" : ink, lh: 1.1 }, w);
  });
  return { w, h };
}

/** Coupon: a notched ticket or a card, the value big, the code to copy. */
export function coupon(c: C, f: F, pal: Pal, v: string): Size {
  const w = 640;
  const h = 260;
  const fill = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#1c1c1e" : "#ffffff";
  const ink = pal.theme === "color" ? pal.fg : pal.theme === "dark" ? "#ffffff" : "#111111";
  const ac = pal.theme === "color" ? pal.fg : pal.color;
  const stub = 220;
  lifted(c, () => {
    c.beginPath();
    if (v === "ticket") {
      c.moveTo(0, 0);
      c.lineTo(w - stub - 18, 0);
      c.arc(w - stub, 0, 18, Math.PI, 0, true);
      c.lineTo(w, 0);
      c.lineTo(w, h);
      c.lineTo(w - stub + 18, h);
      c.arc(w - stub, h, 18, 0, Math.PI, true);
      c.lineTo(0, h);
      // Scalloped left edge.
      for (let y = h; y > 0; y -= 26) c.arc(0, y - 13, 13, Math.PI / 2, -Math.PI / 2, true);
      c.closePath();
    } else c.roundRect(0, 0, w, h, 30);
    c.fillStyle = fill;
    c.fill();
  });
  if (v !== "ticket") {
    c.save();
    rr(c, 0, 0, w, h, 30);
    c.clip();
    c.fillStyle = ac;
    c.fillRect(w - stub, 0, stub, h);
    c.restore();
  } else dashed(c, w - stub, 24, w - stub, ink, 2, [8, 8]);
  text(c, f.title, 50, 40, { size: 28, weight: 700, color: ink, lh: 1.3 }, w - stub - 80);
  fillRR(c, 50, 160, Math.min(w - stub - 90, textW(c, f.code, { size: 26, weight: 800, color: "", family: MONO }) + 40), 56, 12, pal.theme === "light" ? "#f2f2f7" : "rgba(255,255,255,0.15)");
  text(c, f.code, 70, 170, { size: 26, weight: 800, color: ink, family: MONO, lh: 1.4 }, w - stub - 110);
  text(c, f.expiry, 50, 100, { size: 22, weight: 500, color: pal.theme === "light" ? "#8e8e93" : ink, lh: 1.3 }, w - stub - 80);
  const vc = v === "ticket" ? ac : pal.theme === "color" ? pal.bg : pal.onAc;
  // As big as fits the stub.
  let size = 70;
  while (size > 30 && textW(c, f.value, { size, weight: 900, color: "" }) > stub - 40) size -= 4;
  text(c, f.value, w - stub / 2, h / 2 - size * 0.62, { size, weight: 900, color: vc, align: "center", lh: 1.2 }, stub - 30);
  return { w, h };
}

// ================================================================ to-do

export function checklistLook(c: C, f: F, pal: Pal, L: Rows, v: string): Size {
  const items = (L.items ?? []).filter((it) => it.text?.trim());
  const font = v === "lined" ? SERIF : HAND;
  const ink = v === "hand" ? bare(pal) : "#2b2b33";
  const item: TextOpts = { size: v === "lined" ? 28 : 32, weight: 400, color: ink, family: font, lh: 1.3 };
  const rowH = 58;
  const w = 520;
  const h = 100 + items.length * rowH + 40;
  if (v === "note") {
    c.save();
    c.translate(w / 2, h / 2);
    c.rotate(0.02);
    c.translate(-w / 2, -h / 2);
    lifted(c, () => {
      c.fillStyle = "#ffe877";
      c.fillRect(0, 0, w, h);
    }, 16, 10, 0.25);
    tape(c, w / 2, 4, 150, -0.03);
  } else if (v === "lined") {
    lifted(c, () => {
      c.fillStyle = "#fffdf6";
      c.fillRect(0, 0, w, h);
    });
    c.strokeStyle = "rgba(80,130,200,0.28)";
    c.lineWidth = 2;
    for (let y = 100 + rowH - 8; y < h; y += rowH) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    c.strokeStyle = "rgba(220,80,80,0.35)";
    c.beginPath();
    c.moveTo(56, 0);
    c.lineTo(56, h);
    c.stroke();
  }
  const draw = () => {
    text(c, f.title, 70, 34, { ...item, size: 38, weight: 700 }, w - 100);
    items.forEach((it, i) => {
      const y = 100 + i * rowH;
      const done = it.done === "1";
      c.strokeStyle = ink;
      c.lineWidth = 3;
      rr(c, 70, y + 8, 30, 30, 6);
      c.stroke();
      if (done) {
        c.strokeStyle = v === "hand" ? ink : "#e5484d";
        c.lineWidth = 5;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(72, y + 22);
        c.lineTo(84, y + 36);
        c.lineTo(106, y + 2);
        c.stroke();
      }
      text(c, it.text, 118, y, { ...item, strike: done, color: done && v !== "hand" ? "rgba(43,43,51,0.55)" : ink }, w - 140);
    });
  };
  if (v === "hand") onPhoto(c, pal, draw);
  else draw();
  if (v === "note") c.restore();
  return { w, h };
}

export function progressLook(c: C, f: F, pal: Pal, v: string): Size {
  const p = pct(f.percentage);
  if (v === "ring") {
    const w = 420;
    const h = 460;
    card(c, w, h, pal, 40);
    c.lineWidth = 30;
    c.lineCap = "round";
    c.beginPath();
    c.arc(w / 2, 190, 130, 0, Math.PI * 2);
    c.strokeStyle = pal.soft;
    c.stroke();
    c.beginPath();
    c.arc(w / 2, 190, 130, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.01, p));
    c.strokeStyle = pal.ac;
    c.stroke();
    text(c, f.percentage, w / 2, 150, { size: 70, weight: 900, color: pal.fg, align: "center", lh: 1.15 }, 220);
    text(c, f.label, w / 2, 350, { size: 28, weight: 800, color: pal.fg, align: "center", lh: 1.3 }, w - 60);
    text(c, f.status, w / 2, 392, { size: 22, weight: 500, color: pal.sub, align: "center", lh: 1.3 }, w - 60);
    return { w, h };
  }
  // Battery.
  const w = 560;
  const h = 300;
  card(c, w, h, pal, 36);
  text(c, f.label, P, P - 4, { size: 28, weight: 800, color: pal.fg, lh: 1.3 }, w - P * 2);
  const bx = P;
  const by = 100;
  const bw = w - P * 2 - 30;
  const bh = 110;
  c.strokeStyle = pal.fg;
  c.lineWidth = 8;
  rr(c, bx, by, bw, bh, 24);
  c.stroke();
  fillRR(c, bx + bw + 6, by + 34, 16, 42, 6, pal.fg);
  const col = p < 0.2 ? "#ff3b30" : p < 0.5 ? "#ffcc00" : pal.theme === "color" ? pal.fg : "#34c759";
  fillRR(c, bx + 12, by + 12, Math.max(14, (bw - 24) * p), bh - 24, 14, col);
  text(c, f.percentage, bx + bw / 2, by + 26, { size: 50, weight: 900, color: p > 0.55 ? "#ffffff" : pal.fg, align: "center", lh: 1.2 });
  text(c, f.status, P, by + bh + 22, { size: 24, weight: 500, color: pal.sub, lh: 1.3 }, w - P * 2);
  return { w, h };
}

/** Five faces from sad to happy; the level picks one. */
export function moodFaces(c: C, f: F, pal: Pal): Size {
  const faces = ["😢", "😕", "😐", "🙂", "😄"];
  const pick = Math.min(4, Math.floor(pct(f.level) * 5 - 1e-6));
  const w = 600;
  const h = 260;
  card(c, w, h, pal, 40);
  text(c, f.label, w / 2, P - 6, { size: 26, weight: 800, color: pal.fg, align: "center", lh: 1.3 }, w - P * 2);
  faces.forEach((fc, i) => {
    const x = P + 20 + i * ((w - P * 2 - 40) / 4);
    const on = i === Math.max(0, pick);
    if (on) {
      c.beginPath();
      c.arc(x, 130, 50, 0, Math.PI * 2);
      c.fillStyle = pal.theme === "color" ? pal.soft : pal.color + "33";
      c.fill();
    }
    c.save();
    c.globalAlpha = on ? 1 : 0.35;
    text(c, fc, x, on ? 92 : 102, { size: on ? 70 : 48, color: "#000", align: "center", lh: 1.15 });
    c.restore();
  });
  text(c, f.moodText, w / 2, 196, { size: 24, weight: 600, color: pal.sub, align: "center", lh: 1.3 }, w - P * 2);
  return { w, h };
}

/** A habit across the week: one circle per day, filled when done. */
export function habit(c: C, f: F, pal: Pal, L: Rows, v: string): Size {
  const days = (L.days ?? []).slice(0, 7);
  if (v === "dots") {
    const ink = bare(pal);
    const w = 620;
    const h = 170;
    onPhoto(c, pal, () => {
      text(c, f.title, 0, 0, { size: 34, weight: 800, color: ink, lh: 1.3 }, w);
      days.forEach((d, i) => {
        const x = 40 + i * 90;
        c.beginPath();
        c.arc(x, 100, 30, 0, Math.PI * 2);
        if (d.done === "1") {
          c.fillStyle = ink;
          c.fill();
        } else {
          c.strokeStyle = ink;
          c.lineWidth = 4;
          c.stroke();
        }
        text(c, d.text, x, 136, { size: 18, weight: 700, color: ink, align: "center", lh: 1.3 });
      });
    });
    return { w, h };
  }
  const w = 640;
  const h = 260;
  card(c, w, h, pal, 36);
  const done = days.filter((d) => d.done === "1").length;
  text(c, f.title, P, P - 4, { size: 30, weight: 800, color: pal.fg, lh: 1.3 }, w - 160);
  text(c, `${done}/${days.length}`, w - P, P - 4, { size: 30, weight: 800, color: pal.ac, align: "right", lh: 1.3 });
  const cw = (w - P * 2) / 7;
  days.forEach((d, i) => {
    const x = P + cw * i + cw / 2;
    const on = d.done === "1";
    fillRR(c, x - 32, 100, 64, 80, 20, on ? onColor(pal) : pal.soft);
    if (on) {
      c.strokeStyle = onColorText(pal);
      c.lineWidth = 6;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.beginPath();
      c.moveTo(x - 13, 141);
      c.lineTo(x - 3, 152);
      c.lineTo(x + 15, 128);
      c.stroke();
    }
    text(c, d.text, x, 196, { size: 20, weight: 700, color: pal.sub, align: "center", lh: 1.3 });
  });
  return { w, h };
}

// ================================================================ more

export function recipeLook(c: C, f: F, pal: Pal, L: Rows, v: string): Size {
  const items = (L.ingredients ?? []).map((i) => i.text?.trim()).filter(Boolean);
  if (v === "minimal") {
    const ink = bare(pal);
    const w = 560;
    const h = 120 + items.length * 44 + 20;
    onPhoto(c, pal, () => {
      text(c, f.dishName, 0, 0, { size: 44, weight: 800, color: ink, family: SERIF, lh: 1.2 }, w);
      text(c, [f.prepTime, f.servings].filter(Boolean).join("  ·  "), 0, 62, { size: 24, weight: 600, color: ink, lh: 1.3 }, w);
      items.forEach((t, i) => text(c, `—  ${t}`, 0, 118 + i * 44, { size: 26, weight: 500, color: ink, lh: 1.3 }, w));
    });
    return { w, h };
  }
  // Ruled index card.
  const w = 600;
  const it: TextOpts = { size: 30, weight: 400, color: "#24324f", family: HAND, lh: 1.3 };
  const h = 150 + items.length * 50 + (f.tip ? 70 : 20);
  lifted(c, () => {
    c.fillStyle = "#fffdf6";
    c.fillRect(0, 0, w, h);
  });
  c.fillStyle = "rgba(220,80,80,0.5)";
  c.fillRect(0, 96, w, 3);
  c.strokeStyle = "rgba(80,130,200,0.25)";
  c.lineWidth = 2;
  for (let y = 150; y < h; y += 50) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
  }
  text(c, f.dishName, 30, 30, { size: 40, weight: 700, color: "#24324f", family: HAND, lh: 1.2 }, w - 60);
  text(c, [f.prepTime, f.servings].filter(Boolean).join("  ·  "), w - 30, 110, { size: 22, color: "#5b6a8a", family: HAND, align: "right", lh: 1.4 }, w - 60);
  items.forEach((t, i) => text(c, `• ${t}`, 40, 110 + (i + 1) * 50 - 44 + 10, it, w - 80));
  if (f.tip) text(c, `💡 ${f.tip}`, 40, 150 + items.length * 50 + 10, { ...it, size: 24, color: "#7a5a2a" }, w - 80);
  return { w, h };
}

export function exifLook(c: C, f: F, pal: Pal, v: string): Size {
  const ink = bare(pal);
  if (v === "hud") {
    // Viewfinder corners and the settings along the bottom.
    const w = 680;
    const h = 460;
    onPhoto(c, pal, () => {
      c.strokeStyle = ink;
      c.lineWidth = 6;
      const L = 60;
      for (const [x, y, sx, sy] of [
        [10, 10, 1, 1],
        [w - 10, 10, -1, 1],
        [10, h - 90, 1, -1],
        [w - 10, h - 90, -1, -1],
      ]) {
        c.beginPath();
        c.moveTo(x, y + sy * L);
        c.lineTo(x, y);
        c.lineTo(x + sx * L, y);
        c.stroke();
      }
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(w / 2 - 30, (h - 80) / 2);
      c.lineTo(w / 2 + 30, (h - 80) / 2);
      c.moveTo(w / 2, (h - 80) / 2 - 30);
      c.lineTo(w / 2, (h - 80) / 2 + 30);
      c.stroke();
      c.beginPath();
      c.arc(w - 50, 50, 10, 0, Math.PI * 2);
      c.fillStyle = "#ff3b30";
      c.fill();
      text(c, "REC", w - 70, 34, { size: 24, weight: 800, color: ink, align: "right", family: MONO, lh: 1.3 });
      text(c, `${f.camera ?? ""}  ·  ${f.lens ?? ""}`, 10, h - 70, { size: 24, weight: 700, color: ink, family: MONO, lh: 1.3 }, w - 20);
      text(c, `${f.settings ?? ""}  ·  ${f.filmStock ?? ""}`, 10, h - 34, { size: 22, weight: 600, color: ink, family: MONO, lh: 1.3 }, w - 20);
    });
    return { w, h };
  }
  // One small line, like the strip a camera app prints.
  const s = [f.camera, f.lens, f.settings].filter(Boolean).join("   ");
  const o: TextOpts = { size: 26, weight: 600, color: ink, family: MONO, lh: 1.3 };
  const w = textW(c, s, o) + 20;
  const h = 80;
  onPhoto(c, pal, () => {
    text(c, s, 10, 4, o);
    text(c, f.filmStock, 10, 42, { ...o, size: 20, weight: 500 }, w);
  });
  return { w, h };
}
