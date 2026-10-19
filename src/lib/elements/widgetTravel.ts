// Travel widgets (D-120): boarding pass, flight route (line, dotted map, globe, dark card),
// booking confirmed, passport cover, passport stamp, luggage tag — each in several looks.
import { type C, type F, type Pal, MONO, SANS, SERIF, airliner, baseW, card, dashed, fillRR, rr, text, textW, wrap, drawLines, linesH, type TextOpts } from "./widgetKit";

type Size = { w: number; h: number };
const P = 36;

// ---------------------------------------------------------------- places

/** A few airports, so a route lands in the right place on the map and the globe. */
const AIRPORTS: Record<string, [lat: number, lon: number]> = {
  SGN: [10.8, 106.7], HAN: [21.2, 105.8], DAD: [16.0, 108.2], DLI: [11.75, 108.4], PQC: [10.2, 104.0], CXR: [12.0, 109.2], HUI: [16.4, 107.7], VCA: [10.1, 105.7], HPH: [20.8, 106.7], VDO: [21.1, 107.4],
  BKK: [13.7, 100.7], SIN: [1.35, 104.0], KUL: [2.7, 101.7], MNL: [14.5, 121.0], HKG: [22.3, 113.9], TPE: [25.1, 121.2], ICN: [37.5, 126.4], SEL: [37.5, 127.0],
  NRT: [35.8, 140.4], HND: [35.5, 139.8], TYO: [35.7, 139.7], KIX: [34.4, 135.2], OSA: [34.7, 135.5], PEK: [40.1, 116.6], PVG: [31.1, 121.8], SHA: [31.2, 121.3],
  DXB: [25.3, 55.4], DOH: [25.3, 51.6], IST: [41.3, 28.8], CDG: [49.0, 2.5], PAR: [48.9, 2.35], LHR: [51.5, -0.45], LON: [51.5, -0.1], FRA: [50.0, 8.6], AMS: [52.3, 4.8],
  FCO: [41.8, 12.25], MAD: [40.5, -3.6], BCN: [41.3, 2.1], ZRH: [47.5, 8.55], JFK: [40.6, -73.8], NYC: [40.7, -74.0], LAX: [33.9, -118.4], SFO: [37.6, -122.4], SEA: [47.4, -122.3],
  YVR: [49.2, -123.2], SYD: [-33.9, 151.2], MEL: [-37.7, 144.8], AKL: [-37.0, 174.8], DPS: [-8.75, 115.2], CGK: [-6.1, 106.7], DEL: [28.6, 77.1], BOM: [19.1, 72.9],
  REP: [13.4, 103.8], PNH: [11.5, 104.8], VTE: [18.0, 102.6], RGN: [16.9, 96.1], MLE: [4.2, 73.5], CMB: [7.2, 79.9],
};

/** Where a code is; an unknown one gets a steady made-up place (from its letters). */
function place(code: string | undefined, other?: [number, number]): [number, number] {
  const k = (code ?? "").trim().toUpperCase();
  if (AIRPORTS[k]) return AIRPORTS[k];
  let h = 7;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) % 10007;
  const base = other ?? [20, 100];
  return [Math.max(-50, Math.min(70, base[0] + ((h % 30) - 15))), base[1] + 25 + ((h >> 4) % 40)];
}

/** Land, 6° × 5.3° cells from 80° N (60 × 26): enough for a dotted map. */
const LAND = [
  ".........########..#######................##############....",
  ".....######################.........#######################.",
  "..########################.....############################.",
  ".########################.....##############################",
  "...###################.......###############################",
  "......#################.....##############################..",
  ".......###############......##############################..",
  "........#############.......#############################...",
  ".........###########........############################....",
  "..........#########........############################.....",
  "...........######..........#########################........",
  ".............####..........##############..#########........",
  "..............####.........#############....###..####.......",
  "................###.........############..........####......",
  ".................######......#########...........#######....",
  ".................#######.......#######..........##########..",
  ".................########.......######...........#########..",
  "..................#######........#####.............####.....",
  "..................######.........####...........########....",
  "...................#####.........####...........########....",
  "...................####..........###............########....",
  "...................###...........................######.....",
  "...................###.................................###..",
  "...................##...................................##..",
  "...................##.......................................",
  "...................##.......................................",
];
function cell(row: number, col: number) {
  return LAND[Math.max(0, Math.min(LAND.length - 1, row))]?.[((col % 60) + 60) % 60] === "#" ? 1 : 0;
}
/** Land or sea, blended between the cells (with a little wobble) so coasts are not steps. */
function isLand(lat: number, lon: number) {
  const fy = (80 - lat) / 5.3 - 0.5;
  const fx = ((((lon + 180) % 360) + 360) % 360) / 6 - 0.5;
  const r = Math.floor(fy);
  const cl = Math.floor(fx);
  const ty = fy - r;
  const tx = fx - cl;
  const v = (cell(r, cl) * (1 - tx) + cell(r, cl + 1) * tx) * (1 - ty) + (cell(r + 1, cl) * (1 - tx) + cell(r + 1, cl + 1) * tx) * ty;
  return v + 0.12 * Math.sin(lat * 1.7 + lon * 0.9) * Math.cos(lon * 1.3) > 0.5;
}

// ---------------------------------------------------------------- shared bits

/** A plane seen from above, nose to +x: the passenger plane of the kit. */
const plane = airliner;

/** A dashed arc from a to b bulging by `lift`, with the plane at its middle. */
function route(c: C, a: { x: number; y: number }, b: { x: number; y: number }, lift: number, color: string, width: number, planeSize: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  // Control point off the middle, perpendicular, upwards.
  let nx = -(b.y - a.y) / len;
  let ny = (b.x - a.x) / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = mx + nx * lift;
  const cy = my + ny * lift;
  c.save();
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.setLineDash([width * 2.4, width * 2.4]);
  c.beginPath();
  c.moveTo(a.x, a.y);
  c.quadraticCurveTo(cx, cy, b.x, b.y);
  c.stroke();
  c.restore();
  // Plane at t = 0.5 along the curve, facing its tangent.
  const px = 0.25 * a.x + 0.5 * cx + 0.25 * b.x;
  const py = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  plane(c, px, py, planeSize, Math.atan2(ty, tx), color);
  for (const p of [a, b]) {
    c.beginPath();
    c.arc(p.x, p.y, width * 2.2, 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
    c.beginPath();
    c.arc(p.x, p.y, width * 4.2, 0, Math.PI * 2);
    c.strokeStyle = color;
    c.globalAlpha = 0.35;
    c.lineWidth = width;
    c.stroke();
    c.globalAlpha = 1;
  }
}

/** Deterministic little squares, like a QR code. */
function qr(c: C, x: number, y: number, size: number, seedText: string, color: string) {
  let s = 11;
  for (const ch of seedText) s = (s * 31 + ch.charCodeAt(0)) % 99991;
  const n = 21;
  const cell = size / n;
  c.fillStyle = color;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if ((i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9)) continue;
      s = (s * 73 + 41) % 99991;
      if (s % 2) c.fillRect(x + i * cell, y + j * cell, cell + 0.4, cell + 0.4);
    }
  // Finder squares as rings (no clearRect: it would punch through the canvas).
  for (const [fx, fy] of [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ]) {
    c.fillRect(x + fx * cell, y + fy * cell, cell * 7, cell);
    c.fillRect(x + fx * cell, y + (fy + 6) * cell, cell * 7, cell);
    c.fillRect(x + fx * cell, y + fy * cell, cell, cell * 7);
    c.fillRect(x + (fx + 6) * cell, y + fy * cell, cell, cell * 7);
    c.fillRect(x + (fx + 2) * cell, y + (fy + 2) * cell, cell * 3, cell * 3);
  }
}

function barcode(c: C, x: number, y: number, w: number, h: number, seedText: string, color: string) {
  let s = 7;
  for (const ch of seedText) s = (s * 31 + ch.charCodeAt(0)) % 9973;
  c.fillStyle = color;
  let xx = x;
  while (xx < x + w) {
    s = (s * 73 + 41) % 9973;
    const bw = 2 + (s % 3) * 2;
    if (xx + bw > x + w) break;
    c.fillRect(xx, y, bw, h);
    xx += bw + 2 + ((s >> 3) % 3) * 2;
  }
}

/** Card-less looks sit on the photo: white text by default. */
const bare = (pal: Pal) => (pal.theme === "light" ? "#ffffff" : pal.theme === "dark" ? "#111111" : pal.color);

// ---------------------------------------------------------------- boarding pass

export function boardingPassLook(c: C, f: F, pal: Pal, v: string, cardLook: () => Size): Size {
  if (v === "stub") return passStub(c, f, pal);
  if (v === "mobile") return passMobile(c, f, pal);
  if (v === "minimal") return passMinimal(c, f, pal);
  return cardLook();
}

/** Paper ticket with a tear-off stub on the right. */
function passStub(c: C, f: F, pal: Pal): Size {
  const w = baseW(760);
  const h = 300;
  const stub = 210;
  const paper = pal.theme === "dark" ? "#22242a" : pal.theme === "color" ? pal.bg : "#fbf7ef";
  const ink = pal.theme === "dark" ? "#f2f2f2" : pal.theme === "color" ? pal.fg : "#1c2433";
  const sub = pal.theme === "dark" ? "#9aa0aa" : pal.theme === "color" ? pal.sub : "#7d8594";
  const ac = pal.theme === "color" ? pal.fg : pal.color;
  card(c, w, h, pal, 20, paper);
  // Coloured band on the left, notches at the tear line.
  c.save();
  rr(c, 0, 0, w, h, 20);
  c.clip();
  c.fillStyle = ac;
  c.fillRect(0, 0, 26, h);
  c.restore();
  dashed(c, w - stub, 22, w - stub, sub, 2, [8, 7]);
  c.save();
  c.strokeStyle = sub;
  c.setLineDash([8, 7]);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(w - stub, 18);
  c.lineTo(w - stub, h - 18);
  c.stroke();
  c.restore();
  const x0 = 56;
  text(c, "BOARDING PASS", x0, 26, { size: 20, weight: 800, color: ac, lh: 1.2 });
  text(c, f.flight, w - stub - 30, 26, { size: 20, weight: 700, color: sub, family: MONO, align: "right", lh: 1.2 });
  const code: TextOpts = { size: 70, weight: 800, color: ink, family: MONO, lh: 1.1 };
  text(c, f.fromCode, x0, 70, code, 200);
  text(c, f.toCode, w - stub - 30, 70, { ...code, align: "right" }, 200);
  plane(c, x0 + (w - stub - 30 - x0) / 2, 110, 46, 0, ac);
  text(c, f.fromCity, x0, 150, { size: 20, weight: 500, color: sub, lh: 1.2 }, 220);
  text(c, f.toCity, w - stub - 30, 150, { size: 20, weight: 500, color: sub, align: "right", lh: 1.2 }, 220);
  const cols: [string, string][] = [
    ["DATE", f.date],
    ["SEAT", f.seat],
    ["GATE", "—"],
  ];
  cols.forEach(([k, val], i) => {
    const x = x0 + i * 150;
    text(c, k, x, 200, { size: 16, weight: 700, color: sub, lh: 1.2 });
    text(c, val, x, 224, { size: 26, weight: 800, color: ink, family: MONO, lh: 1.2 }, 140);
  });
  // Stub: codes small, seat big, barcode turned.
  const sx = w - stub + 26;
  text(c, `${f.fromCode ?? ""} → ${f.toCode ?? ""}`, sx, 30, { size: 22, weight: 800, color: ink, family: MONO, lh: 1.2 }, stub - 46);
  text(c, "SEAT", sx, 80, { size: 16, weight: 700, color: sub, lh: 1.2 });
  text(c, f.seat, sx, 100, { size: 50, weight: 800, color: ac, family: MONO, lh: 1.1 }, stub - 46);
  barcode(c, sx, 200, stub - 52, 60, `${f.flight}${f.seat}`, ink);
  return { w, h };
}

/** A phone wallet pass: coloured header, codes, details, a QR code. */
function passMobile(c: C, f: F, pal: Pal): Size {
  const w = baseW(460);
  const h = 700;
  const head = pal.theme === "color" ? pal.bg : pal.color;
  const body = pal.theme === "dark" ? "#1c1c1e" : "#ffffff";
  const ink = pal.theme === "dark" ? "#ffffff" : "#111111";
  const sub = pal.theme === "dark" ? "#98989d" : "#8e8e93";
  const onHead = pal.theme === "color" ? pal.fg : pal.onAc;
  card(c, w, h, pal, 34, body);
  c.save();
  rr(c, 0, 0, w, h, 34);
  c.clip();
  c.fillStyle = head;
  c.fillRect(0, 0, w, 330);
  c.restore();
  text(c, "BOARDING PASS", 34, 30, { size: 20, weight: 800, color: onHead, lh: 1.2 });
  text(c, f.flight, w - 34, 30, { size: 22, weight: 700, color: onHead, family: MONO, align: "right", lh: 1.2 });
  const code: TextOpts = { size: 82, weight: 800, color: onHead, family: MONO, lh: 1.1 };
  text(c, f.fromCode, 34, 90, code, 170);
  text(c, f.toCode, w - 34, 90, { ...code, align: "right" }, 170);
  plane(c, w / 2, 136, 46, 0, onHead);
  text(c, f.fromCity, 34, 186, { size: 20, weight: 500, color: onHead, lh: 1.2 }, 180);
  text(c, f.toCity, w - 34, 186, { size: 20, weight: 500, color: onHead, align: "right", lh: 1.2 }, 180);
  [
    ["DATE", f.date],
    ["SEAT", f.seat],
  ].forEach(([k, val], i) => {
    const x = i ? w - 34 : 34;
    const al = i ? ("right" as const) : ("left" as const);
    text(c, k ?? "", x, 244, { size: 16, weight: 700, color: onHead, align: al, lh: 1.2 });
    text(c, val ?? "", x, 266, { size: 32, weight: 800, color: onHead, family: MONO, align: al, lh: 1.2 }, 190);
  });
  // Notches at the tear line.
  for (const x of [0, w]) {
    c.beginPath();
    c.arc(x, 330, 16, 0, Math.PI * 2);
    c.fillStyle = "rgba(0,0,0,0.12)";
    c.fill();
  }
  dashed(c, 30, 330, w - 30, "rgba(0,0,0,0.15)", 2, [8, 8]);
  qr(c, w / 2 - 120, 380, 240, `${f.flight}${f.date}${f.seat}`, ink);
  text(c, `${f.fromCode ?? ""} · ${f.date ?? ""}`, w / 2, 640, { size: 18, weight: 600, color: sub, align: "center", lh: 1.2 });
  return { w, h };
}

/** One line on the photo: SGN ✈ DAD, details under it. */
function passMinimal(c: C, f: F, pal: Pal): Size {
  const ink = bare(pal);
  const code: TextOpts = { size: 92, weight: 800, color: ink, lh: 1.1 };
  const a = textW(c, f.fromCode, code);
  const b = textW(c, f.toCode, code);
  const w = Math.max(a + b + 190, 520);
  const h = 170;
  c.save();
  if (pal.theme === "light") {
    c.shadowColor = "rgba(0,0,0,0.35)";
    c.shadowBlur = 14;
  }
  text(c, f.fromCode, 0, 0, code);
  text(c, f.toCode, w, 0, { ...code, align: "right" });
  dashed(c, a + 22, 52, w - b - 22, ink, 4, [10, 10]);
  plane(c, (a + w - b) / 2, 52, 50, 0, ink);
  text(c, [f.date, f.flight, f.seat && `SEAT ${f.seat}`].filter(Boolean).join("   ·   "), w / 2, 120, { size: 24, weight: 600, color: ink, align: "center", lh: 1.4 });
  c.restore();
  return { w, h };
}

// ---------------------------------------------------------------- flight route

export function flightRoute(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "map") return routeMap(c, f, pal);
  if (v === "globe") return routeGlobe(c, f, pal);
  if (v === "dark") return routeDark(c, f, pal);
  if (v === "doodle") return routeDoodle(c, f, pal);
  if (v === "sticker") return routeSticker(c, f, pal);
  return routeLine(c, f, pal);
}

function routeLine(c: C, f: F, pal: Pal): Size {
  const w = baseW(700);
  const h = 300;
  const ink = bare(pal);
  c.save();
  if (pal.theme === "light") {
    c.shadowColor = "rgba(0,0,0,0.35)";
    c.shadowBlur = 12;
  }
  route(c, { x: 80, y: 200 }, { x: w - 80, y: 200 }, 150, ink, 5, 46);
  text(c, f.fromCode, 80, 222, { size: 40, weight: 800, color: ink, align: "center", lh: 1.2 });
  text(c, f.toCode, w - 80, 222, { size: 40, weight: 800, color: ink, align: "center", lh: 1.2 });
  text(c, f.fromCity, 80, 266, { size: 20, weight: 500, color: ink, align: "center", lh: 1.2 }, 220);
  text(c, f.toCity, w - 80, 266, { size: 20, weight: 500, color: ink, align: "center", lh: 1.2 }, 220);
  if (f.note) text(c, f.note, w / 2, 0, { size: 24, weight: 700, color: ink, align: "center", lh: 1.3 }, w - 40);
  c.restore();
  return { w, h };
}

/** Dotted map around the two places, the route arcing between them. */
function routeMap(c: C, f: F, pal: Pal): Size {
  const w = baseW(680);
  const h = 460;
  const a = place(f.fromCode);
  const b = place(f.toCode, a);
  // A window around both, at least 70° × 40°.
  const midLat = (a[0] + b[0]) / 2;
  const midLon = (a[1] + b[1]) / 2;
  const spanLon = Math.max(70, Math.abs(a[1] - b[1]) * 1.6);
  const spanLat = Math.max(spanLon * (h / w), Math.abs(a[0] - b[0]) * 1.6);
  const toXY = (p: [number, number]) => ({ x: w / 2 + ((p[1] - midLon) / spanLon) * w, y: h / 2 - ((p[0] - midLat) / spanLat) * h });
  card(c, w, h, pal, 32);
  c.save();
  rr(c, 0, 0, w, h, 32);
  c.clip();
  const step = 12;
  for (let y = step / 2; y < h; y += step)
    for (let x = step / 2; x < w; x += step) {
      const lon = midLon + ((x - w / 2) / w) * spanLon;
      const lat = midLat - ((y - h / 2) / h) * spanLat;
      if (!isLand(lat, lon)) continue;
      c.beginPath();
      c.arc(x, y, 3.2, 0, Math.PI * 2);
      c.fillStyle = pal.theme === "light" ? "#b9c1cd" : pal.theme === "dark" ? "#4a4e57" : pal.soft;
      c.fill();
    }
  c.restore();
  const A = toXY(a);
  const B = toXY(b);
  route(c, A, B, Math.max(40, Math.hypot(B.x - A.x, B.y - A.y) * 0.35), pal.ac, 4, 40);
  const label = (p: { x: number; y: number }, code?: string, city?: string) => {
    const wd = Math.max(textW(c, code ?? "", { size: 24, weight: 800, color: "" }), textW(c, city ?? "", { size: 16, weight: 500, color: "" })) + 28;
    const lx = Math.max(10, Math.min(w - wd - 10, p.x - wd / 2));
    const ly = p.y + 26 + 64 > h ? p.y - 26 - 64 : p.y + 26;
    fillRR(c, lx, ly, wd, 64, 14, pal.theme === "dark" ? "#2c2c2e" : pal.theme === "color" ? "rgba(0,0,0,0.2)" : "#ffffff");
    text(c, code ?? "", lx + wd / 2, ly + 6, { size: 24, weight: 800, color: pal.fg, align: "center", lh: 1.2 });
    text(c, city ?? "", lx + wd / 2, ly + 36, { size: 16, weight: 500, color: pal.sub, align: "center", lh: 1.2 }, wd - 10);
  };
  label(A, f.fromCode, f.fromCity);
  label(B, f.toCode, f.toCity);
  return { w, h };
}

/** A globe turned to the route, dotted land, the arc over it. */
function routeGlobe(c: C, f: F, pal: Pal): Size {
  const R = 230;
  const w = R * 2 + 80;
  const h = R * 2 + 120;
  const cx = w / 2;
  const cy = R + 30;
  const a = place(f.fromCode);
  const b = place(f.toCode, a);
  const lat0 = ((a[0] + b[0]) / 2) * (Math.PI / 180);
  const lon0 = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const proj = (lat: number, lon: number) => {
    const la = (lat * Math.PI) / 180;
    const lo = (lon * Math.PI) / 180 - lon0;
    const x = Math.cos(la) * Math.sin(lo);
    const y = Math.cos(lat0) * Math.sin(la) - Math.sin(lat0) * Math.cos(la) * Math.cos(lo);
    const z = Math.sin(lat0) * Math.sin(la) + Math.cos(lat0) * Math.cos(la) * Math.cos(lo);
    return { x: cx + x * R, y: cy - y * R, front: z > 0 };
  };
  const sea = pal.theme === "dark" ? "#14213d" : pal.theme === "color" ? pal.color : "#1f6fb2";
  const land = pal.theme === "dark" ? "#3d5a80" : pal.theme === "color" ? "rgba(255,255,255,0.55)" : "#8fd19e";
  c.save();
  c.shadowColor = "rgba(0,0,0,0.3)";
  c.shadowBlur = 30;
  c.shadowOffsetY = 12;
  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.fillStyle = sea;
  c.fill();
  c.restore();
  // Lines of latitude / longitude, then land as dots.
  c.save();
  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.clip();
  c.strokeStyle = "rgba(255,255,255,0.12)";
  c.lineWidth = 1.5;
  for (let lo = -180; lo < 180; lo += 30) {
    c.beginPath();
    let started = false;
    for (let la = -90; la <= 90; la += 5) {
      const p = proj(la, lo);
      if (!p.front) {
        started = false;
        continue;
      }
      if (started) c.lineTo(p.x, p.y);
      else c.moveTo(p.x, p.y);
      started = true;
    }
    c.stroke();
  }
  for (let la = -60; la <= 60; la += 30) {
    c.beginPath();
    let started = false;
    for (let lo = -180; lo <= 180; lo += 5) {
      const p = proj(la, lo);
      if (!p.front) {
        started = false;
        continue;
      }
      if (started) c.lineTo(p.x, p.y);
      else c.moveTo(p.x, p.y);
      started = true;
    }
    c.stroke();
  }
  for (let la = -56; la <= 80; la += 2.6)
    for (let lo = -180; lo < 180; lo += 2.6) {
      if (!isLand(la, lo)) continue;
      const p = proj(la, lo);
      if (!p.front) continue;
      c.beginPath();
      c.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      c.fillStyle = land;
      c.fill();
    }
  // Shading: lit from the top left.
  const g = c.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.1, cx, cy, R);
  g.addColorStop(0, "rgba(255,255,255,0.28)");
  g.addColorStop(0.6, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  c.fillStyle = g;
  c.fillRect(cx - R, cy - R, R * 2, R * 2);
  c.restore();
  const A = proj(a[0], a[1]);
  const B = proj(b[0], b[1]);
  const lift = Math.max(70, Math.hypot(B.x - A.x, B.y - A.y) * 0.5);
  route(c, A, B, lift, "#ffffff", 4, 40);
  const ink = pal.theme === "light" ? "#ffffff" : pal.fg;
  c.save();
  if (pal.theme === "light") {
    c.shadowColor = "rgba(0,0,0,0.4)";
    c.shadowBlur = 10;
  }
  text(c, `${f.fromCode ?? ""}  ✈  ${f.toCode ?? ""}`, cx, h - 70, { size: 40, weight: 800, color: ink, align: "center", lh: 1.2 }, w - 20);
  text(c, [f.fromCity, f.toCity].filter(Boolean).join(" — "), cx, h - 24, { size: 20, weight: 500, color: ink, align: "center", lh: 1.2 }, w - 20);
  c.restore();
  return { w, h };
}

/** Dark card: big codes, a glowing arc between them. */
function routeDark(c: C, f: F, pal: Pal): Size {
  const w = baseW(680);
  const h = 360;
  const bg = c.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, pal.theme === "light" ? "#0f1c3f" : pal.theme === "dark" ? "#0b0b0d" : pal.color);
  bg.addColorStop(1, pal.theme === "light" ? "#2a1a4a" : pal.theme === "dark" ? "#1c1c22" : "#111111");
  card(c, w, h, pal, 36, "#000");
  fillRR(c, 0, 0, w, h, 36, bg);
  // A few stars.
  c.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 40; i++) {
    const x = (i * 197) % w;
    const y = (i * 83) % (h - 120);
    c.fillRect(x, y, i % 5 ? 1.5 : 2.5, i % 5 ? 1.5 : 2.5);
  }
  const glow = pal.theme === "color" ? "#ffffff" : "#7cc6ff";
  c.save();
  c.shadowColor = glow;
  c.shadowBlur = 14;
  route(c, { x: 110, y: 200 }, { x: w - 110, y: 200 }, 130, glow, 4, 42);
  c.restore();
  text(c, f.fromCode, 110, 222, { size: 50, weight: 800, color: "#ffffff", align: "center", lh: 1.2 });
  text(c, f.toCode, w - 110, 222, { size: 50, weight: 800, color: "#ffffff", align: "center", lh: 1.2 });
  text(c, f.fromCity, 110, 286, { size: 20, weight: 500, color: "rgba(255,255,255,0.7)", align: "center", lh: 1.2 }, 220);
  text(c, f.toCity, w - 110, 286, { size: 20, weight: 500, color: "rgba(255,255,255,0.7)", align: "center", lh: 1.2 }, 220);
  if (f.note) text(c, f.note, w / 2, 28, { size: 22, weight: 700, color: "rgba(255,255,255,0.85)", align: "center", lh: 1.3 }, w - 60);
  return { w, h };
}

// ---------------------------------------------------------------- booking confirmed

export function booking(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "toast") return bookingToast(c, f, pal);
  if (v === "stamp") return bookingStamp(c, f, pal);
  return bookingCard(c, f, pal);
}

function check(c: C, x: number, y: number, r: number, bg: string, fg: string) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = bg;
  c.fill();
  c.strokeStyle = fg;
  c.lineWidth = r * 0.2;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(x - r * 0.42, y + r * 0.02);
  c.lineTo(x - r * 0.1, y + r * 0.34);
  c.lineTo(x + r * 0.45, y - r * 0.3);
  c.stroke();
}

function bookingCard(c: C, f: F, pal: Pal): Size {
  const w = baseW(560);
  const title: TextOpts = { size: 34, weight: 800, color: pal.fg, align: "center", lh: 1.25 };
  const tL = wrap(c, f.title, title, w - P * 2, 2);
  const h = P + 110 + 20 + linesH(tL.length, title) + 14 + 40 + 22 + 30 + 22 + 52 + P;
  card(c, w, h, pal, 36);
  const green = pal.theme === "color" ? pal.fg : "#34c759";
  check(c, w / 2, P + 55, 55, green, pal.theme === "color" ? pal.bg : "#ffffff");
  let y = P + 110 + 20;
  y += drawLines(c, tL, w / 2, y, title) + 14;
  text(c, f.route, w / 2, y, { size: 32, weight: 800, color: pal.ac, family: MONO, align: "center", lh: 1.25 }, w - P * 2);
  y += 40 + 22;
  text(c, f.date, w / 2, y, { size: 24, weight: 500, color: pal.sub, align: "center", lh: 1.25 }, w - P * 2);
  y += 30 + 22;
  const codeW = Math.min(w - P * 2, textW(c, f.code, { size: 24, weight: 700, color: "", family: MONO }) + 50);
  fillRR(c, (w - codeW) / 2, y, codeW, 52, 26, pal.soft);
  text(c, f.code, w / 2, y + 10, { size: 24, weight: 700, color: pal.fg, family: MONO, align: "center", lh: 32 / 24 }, codeW - 20);
  return { w, h };
}

function bookingToast(c: C, f: F, pal: Pal): Size {
  const t1 = { size: 26, weight: 800, color: pal.fg, lh: 1.25 };
  const t2 = { size: 21, weight: 500, color: pal.sub, lh: 1.25 };
  const line2 = [f.route, f.date].filter(Boolean).join(" · ");
  const inner = Math.max(textW(c, f.title, t1), textW(c, line2, t2));
  const w = Math.min(700, 24 + 64 + 18 + inner + 34);
  const h = 104;
  card(c, w, h, pal, 52);
  check(c, 24 + 32, h / 2, 32, pal.theme === "color" ? pal.fg : "#34c759", pal.theme === "color" ? pal.bg : "#ffffff");
  text(c, f.title, 24 + 64 + 18, 20, t1, w - 120);
  text(c, line2, 24 + 64 + 18, 56, t2, w - 120);
  return { w, h };
}

function bookingStamp(c: C, f: F, pal: Pal): Size {
  const w = baseW(560);
  const h = 300;
  const ink = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#ffffff" : "#1e8e3e";
  c.save();
  c.translate(w / 2, h / 2);
  c.rotate(-0.12);
  c.strokeStyle = ink;
  c.lineWidth = 10;
  rr(c, -230, -110, 460, 220, 24);
  c.stroke();
  c.lineWidth = 3;
  rr(c, -214, -94, 428, 188, 16);
  c.stroke();
  text(c, "CONFIRMED", 0, -84, { size: 62, weight: 900, color: ink, align: "center", lh: 1.1 }, 400);
  text(c, f.route, 0, 0, { size: 30, weight: 800, color: ink, family: MONO, align: "center", lh: 1.2 }, 400);
  text(c, f.code, 0, 44, { size: 22, weight: 700, color: ink, family: MONO, align: "center", lh: 1.2 }, 400);
  c.restore();
  return { w, h };
}

// ---------------------------------------------------------------- passport

/** A globe emblem in gold lines. */
function emblem(c: C, x: number, y: number, r: number, color: string) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = 3;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.stroke();
  for (const k of [0.35, 0.7]) {
    c.beginPath();
    c.ellipse(x, y, r * k, r, 0, 0, Math.PI * 2);
    c.stroke();
  }
  for (const dy of [-0.5, 0, 0.5]) {
    const half = Math.sqrt(1 - dy * dy) * r;
    c.beginPath();
    c.moveTo(x - half, y + dy * r);
    c.lineTo(x + half, y + dy * r);
    c.stroke();
  }
  // Laurel-ish arcs.
  for (const side of [-1, 1]) {
    c.beginPath();
    c.arc(x, y, r * 1.28, Math.PI / 2 + side * 0.3, Math.PI / 2 + side * 1.7, side < 0);
    c.stroke();
    for (let i = 1; i <= 5; i++) {
      const a = Math.PI / 2 + side * (0.3 + i * 0.27);
      const px = x + Math.cos(a) * r * 1.28;
      const py = y + Math.sin(a) * r * 1.28;
      c.beginPath();
      c.ellipse(px, py, 9, 4, a + Math.PI / 2 + side * 0.6, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
    }
  }
  c.restore();
}

export function passport(c: C, f: F, pal: Pal, v: string): Size {
  const w = baseW(420);
  const h = 590;
  const cover = pal.color;
  const gold = v === "embossed" ? "rgba(0,0,0,0.28)" : "#d9b45a";
  c.save();
  c.shadowColor = "rgba(0,0,0,0.35)";
  c.shadowBlur = 26;
  c.shadowOffsetY = 12;
  fillRR(c, 0, 0, w, h, 18, cover);
  c.restore();
  c.save();
  rr(c, 0, 0, w, h, 18);
  c.clip();
  // Leather-ish texture: fine dots, a spine shade on the left.
  c.fillStyle = "rgba(255,255,255,0.035)";
  for (let i = 0; i < 900; i++) c.fillRect((i * 37) % w, (i * 53) % h, 2, 2);
  const spine = c.createLinearGradient(0, 0, 40, 0);
  spine.addColorStop(0, "rgba(0,0,0,0.35)");
  spine.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = spine;
  c.fillRect(0, 0, 40, h);
  if (v === "worn") {
    // Rubbed corners and edges, scratches.
    const edge = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.65);
    edge.addColorStop(0, "rgba(255,255,255,0)");
    edge.addColorStop(1, "rgba(255,235,200,0.35)");
    c.fillStyle = edge;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(255,240,220,0.18)";
    c.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      c.beginPath();
      const x = (i * 131) % w;
      const y = (i * 211) % h;
      c.moveTo(x, y);
      c.lineTo(x + 30 + (i % 4) * 12, y + 6 - (i % 3) * 5);
      c.stroke();
    }
  }
  c.restore();
  const deboss = (fn: (color: string, dy: number) => void) => {
    if (v === "embossed") {
      fn("rgba(255,255,255,0.22)", 2);
      fn("rgba(0,0,0,0.5)", 0);
    } else fn(v === "worn" ? "rgba(217,180,90,0.75)" : gold, 0);
  };
  deboss((col, dy) => text(c, (f.country ?? "").toUpperCase(), w / 2, 60 + dy, { size: 26, weight: 700, color: col, family: SERIF, align: "center", lh: 1.3 }, w - 60));
  deboss((col, dy) => emblem(c, w / 2, 270 + dy, 78, col));
  deboss((col, dy) => text(c, (f.title ?? "").toUpperCase(), w / 2, 420 + dy, { size: 44, weight: 700, color: col, family: SERIF, align: "center", lh: 1.2 }, w - 50));
  // e-passport mark.
  deboss((col, dy) => {
    c.save();
    c.strokeStyle = col;
    c.lineWidth = 3;
    rr(c, w / 2 - 26, 500 + dy, 52, 34, 4);
    c.stroke();
    c.beginPath();
    c.arc(w / 2, 517 + dy, 8, 0, Math.PI * 2);
    c.moveTo(w / 2 - 26, 517 + dy);
    c.lineTo(w / 2 - 8, 517 + dy);
    c.moveTo(w / 2 + 8, 517 + dy);
    c.lineTo(w / 2 + 26, 517 + dy);
    c.stroke();
    c.restore();
  });
  return { w, h };
}

// ---------------------------------------------------------------- passport stamp

const inked = new Map<string, HTMLCanvasElement>();

/** Ink stamp, drawn on its own and then speckled like real ink, slightly turned. */
export function passportStamp(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "postage" || v === "triangle" || v === "pin" || v === "ticket") return lineStamp(c, f, pal, v);
  const w = baseW(460);
  const h = v === "rect" || v === "plane" ? 300 : 420;
  const ink = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#1f3f9a" : pal.color;
  const m = c.getTransform();
  const k = Math.min(4, Math.max(1, Math.hypot(m.a, m.b)));
  const key = JSON.stringify([f, v, ink, Math.round(k * 4)]);
  let img = inked.get(key);
  if (!img) {
    img = document.createElement("canvas");
    img.width = Math.ceil(w * k);
    img.height = Math.ceil(h * k);
    const o = img.getContext("2d")!;
    o.scale(k, k);
    o.translate(w / 2, h / 2);
    o.rotate(v === "rect" ? -0.07 : 0.1);
    o.strokeStyle = ink;
    o.fillStyle = ink;
    const place = (f.place ?? "").toUpperCase();
    const label = (f.label ?? "").toUpperCase();
    if (v === "rect" || v === "plane") {
      o.lineWidth = 9;
      rr(o, -200, -110, 400, 220, 10);
      o.stroke();
      o.lineWidth = 3;
      rr(o, -184, -94, 368, 188, 6);
      o.stroke();
      text(o, label, 0, -86, { size: 26, weight: 800, color: ink, align: "center", lh: 1.2 }, 340);
      if (v === "plane") plane(o, -120, 8, 70, -0.5, ink);
      text(o, place, v === "plane" ? 40 : 0, -42, { size: 50, weight: 900, color: ink, align: "center", lh: 1.2 }, v === "plane" ? 240 : 340);
      text(o, f.date, v === "plane" ? 40 : 0, 26, { size: 30, weight: 700, color: ink, family: MONO, align: "center", lh: 1.2 }, 300);
    } else {
      const R = 175;
      o.lineWidth = 9;
      o.beginPath();
      if (v === "oval") o.ellipse(0, 0, R * 1.15, R * 0.85, 0, 0, Math.PI * 2);
      else if (v === "hex")
        for (let i = 0; i <= 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
          o.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        }
      else o.arc(0, 0, R, 0, Math.PI * 2);
      o.stroke();
      o.lineWidth = 3;
      o.beginPath();
      if (v === "oval") o.ellipse(0, 0, R * 1.15 - 18, R * 0.85 - 18, 0, 0, Math.PI * 2);
      else if (v === "hex")
        for (let i = 0; i <= 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
          o.lineTo(Math.cos(a) * (R - 18), Math.sin(a) * (R - 18));
        }
      else o.arc(0, 0, R - 18, 0, Math.PI * 2);
      o.stroke();
      // Label around the top of the round one.
      if (v === "round") {
        o.font = `800 28px ${SANS}`;
        o.textAlign = "center";
        o.textBaseline = "middle";
        const chars = [...label];
        const span = Math.min(Math.PI * 0.9, chars.length * 0.13);
        chars.forEach((ch, i) => {
          const a = -Math.PI / 2 - span / 2 + (span * (i + 0.5)) / chars.length;
          o.save();
          o.rotate(a + Math.PI / 2);
          o.fillText(ch, 0, -(R - 46));
          o.restore();
        });
      } else text(o, label, 0, -100, { size: 24, weight: 800, color: ink, align: "center", lh: 1.2 }, 260);
      text(o, place, 0, -30, { size: 46, weight: 900, color: ink, align: "center", lh: 1.2 }, 270);
      o.fillRect(-110, 32, 220, 4);
      text(o, f.date, 0, 46, { size: 28, weight: 700, color: ink, family: MONO, align: "center", lh: 1.2 }, 260);
      plane(o, 0, 120, 40, -Math.PI / 2, ink);
    }
    // Ink: wear it off in specks and a few streaks (on this stamp only).
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = "destination-out";
    let s = 13;
    for (const ch of place) s = (s * 31 + ch.charCodeAt(0)) % 99991;
    for (let i = 0; i < 1400; i++) {
      s = (s * 73 + 41) % 99991;
      const x = (s % 1000) / 1000;
      s = (s * 73 + 41) % 99991;
      const y = (s % 1000) / 1000;
      o.globalAlpha = 0.3 + (i % 5) * 0.14;
      o.beginPath();
      o.arc(x * img.width, y * img.height, (0.8 + (i % 4) * 0.8) * k, 0, Math.PI * 2);
      o.fill();
    }
    o.globalAlpha = 0.35;
    o.fillRect(0, img.height * 0.62, img.width, 3 * k);
    o.globalAlpha = 1;
    if (inked.size > 30) inked.clear();
    inked.set(key, img);
  }
  c.save();
  c.globalAlpha = 0.9;
  c.drawImage(img, 0, 0, w, h);
  c.restore();
  return { w, h };
}

// ---------------------------------------------------------------- luggage tag

export function luggageTag(c: C, f: F, pal: Pal, v: string): Size {
  if (v === "leather") return tagLeather(c, f, pal);
  if (v === "kraft") return tagKraft(c, f, pal);
  return tagAirport(c, f, pal);
}

/** The long airport bag tag: big code, flight, barcode. */
function tagAirport(c: C, f: F, pal: Pal): Size {
  const w = baseW(300);
  const h = 760;
  const paper = pal.theme === "dark" ? "#22242a" : "#ffffff";
  const ink = pal.theme === "dark" ? "#f2f2f2" : "#111111";
  const band = pal.theme === "color" ? pal.color : pal.color;
  card(c, w, h, pal, 14, paper);
  c.save();
  rr(c, 0, 0, w, h, 14);
  c.clip();
  c.fillStyle = band;
  c.fillRect(0, 0, w, 110);
  c.fillRect(0, h - 70, w, 70);
  c.restore();
  c.beginPath();
  c.arc(w / 2, 50, 18, 0, Math.PI * 2);
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.fill();
  text(c, f.toCode, w / 2, 130, { size: 110, weight: 900, color: ink, family: MONO, align: "center", lh: 1.1 }, w - 20);
  text(c, f.toCity, w / 2, 262, { size: 24, weight: 600, color: ink, align: "center", lh: 1.2 }, w - 30);
  dashed(c, 24, 314, w - 24, "rgba(0,0,0,0.2)", 2, [8, 8]);
  text(c, "FLIGHT", 30, 336, { size: 16, weight: 700, color: "#8e8e93", lh: 1.2 });
  text(c, f.flight, 30, 358, { size: 32, weight: 800, color: ink, family: MONO, lh: 1.2 }, w - 60);
  text(c, "NAME", 30, 412, { size: 16, weight: 700, color: "#8e8e93", lh: 1.2 });
  text(c, f.name, 30, 434, { size: 26, weight: 700, color: ink, lh: 1.2 }, w - 60);
  c.save();
  c.translate(w / 2 - 70, 650);
  c.rotate(-Math.PI / 2);
  barcode(c, 0, 0, 150, 140, `${f.flight}${f.name}`, ink);
  c.restore();
  return { w, h };
}

/** Leather tag with a window card. */
function tagLeather(c: C, f: F, pal: Pal): Size {
  const w = baseW(420);
  const h = 640;
  const leather = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#2a1d14" : "#8b4a22";
  c.save();
  c.shadowColor = "rgba(0,0,0,0.35)";
  c.shadowBlur = 24;
  c.shadowOffsetY = 10;
  c.beginPath();
  c.moveTo(70, 0);
  c.lineTo(w - 70, 0);
  c.lineTo(w, 90);
  c.lineTo(w, h - 30);
  c.quadraticCurveTo(w, h, w - 30, h);
  c.lineTo(30, h);
  c.quadraticCurveTo(0, h, 0, h - 30);
  c.lineTo(0, 90);
  c.closePath();
  c.fillStyle = leather;
  c.fill();
  c.restore();
  // Stitching.
  c.save();
  c.strokeStyle = "rgba(255,230,190,0.6)";
  c.lineWidth = 3;
  c.setLineDash([12, 9]);
  c.beginPath();
  c.moveTo(78, 16);
  c.lineTo(w - 78, 16);
  c.lineTo(w - 16, 96);
  c.lineTo(w - 16, h - 16);
  c.lineTo(16, h - 16);
  c.lineTo(16, 96);
  c.closePath();
  c.stroke();
  c.restore();
  // Hole with a metal ring.
  c.beginPath();
  c.arc(w / 2, 70, 22, 0, Math.PI * 2);
  c.strokeStyle = "#c9b27a";
  c.lineWidth = 8;
  c.stroke();
  c.beginPath();
  c.arc(w / 2, 70, 15, 0, Math.PI * 2);
  c.fillStyle = "rgba(0,0,0,0.45)";
  c.fill();
  // Window card.
  fillRR(c, 50, 150, w - 100, 400, 16, "#f6f1e6");
  c.strokeStyle = "rgba(0,0,0,0.2)";
  c.lineWidth = 3;
  rr(c, 50, 150, w - 100, 400, 16);
  c.stroke();
  const ink = "#2b2118";
  text(c, f.toCode, w / 2, 178, { size: 96, weight: 800, color: ink, family: SERIF, align: "center", lh: 1.1 }, w - 140);
  text(c, f.toCity, w / 2, 296, { size: 24, weight: 600, color: ink, family: SERIF, align: "center", lh: 1.2 }, w - 140);
  for (let i = 0; i < 3; i++) {
    c.fillStyle = "rgba(0,0,0,0.15)";
    c.fillRect(80, 380 + i * 52, w - 160, 2);
  }
  text(c, f.name, w / 2, 338, { size: 28, weight: 400, color: ink, family: '"Bradley Hand", "Segoe Print", cursive', align: "center", lh: 1.4 }, w - 140);
  text(c, f.flight, w / 2, 398, { size: 24, weight: 700, color: ink, family: MONO, align: "center", lh: 1.4 }, w - 140);
  return { w, h };
}

/** Kraft paper tag on a string. */
function tagKraft(c: C, f: F, pal: Pal): Size {
  const w = baseW(440);
  const h = 300;
  const paper = pal.theme === "color" ? pal.color : pal.theme === "dark" ? "#5b4a36" : "#c9a273";
  const ink = pal.theme === "dark" ? "#f3e9d8" : "#2b2118";
  // String.
  c.strokeStyle = "#efe6d2";
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(0, 40);
  c.bezierCurveTo(30, 90, 50, 150, 78, 150);
  c.stroke();
  c.save();
  c.shadowColor = "rgba(0,0,0,0.3)";
  c.shadowBlur = 18;
  c.shadowOffsetY = 8;
  c.beginPath();
  c.moveTo(130, 20);
  c.lineTo(w - 10, 20);
  c.lineTo(w - 10, h - 20);
  c.lineTo(130, h - 20);
  c.lineTo(50, h / 2);
  c.closePath();
  c.fillStyle = paper;
  c.fill();
  c.restore();
  // Reinforcing ring and hole.
  c.beginPath();
  c.arc(100, h / 2, 20, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.fill();
  c.beginPath();
  c.arc(100, h / 2, 9, 0, Math.PI * 2);
  c.fillStyle = "rgba(0,0,0,0.4)";
  c.fill();
  text(c, f.toCode, 270, 40, { size: 80, weight: 800, color: ink, family: SERIF, align: "center", lh: 1.1 }, 260);
  text(c, f.toCity, 270, 134, { size: 24, weight: 600, color: ink, family: SERIF, align: "center", lh: 1.2 }, 260);
  text(c, f.name, 270, 186, { size: 30, weight: 400, color: ink, family: '"Bradley Hand", "Segoe Print", cursive', align: "center", lh: 1.4 }, 260);
  return { w, h };
}

// ---------------------------------------------------------------- line-art stamps (owner's references, 2026-10-19)

/** Thin outlined stamps in one ink: postage stamp, triangle, map pin, ticket. */
function lineStamp(c: C, f: F, pal: Pal, v: string): Size {
  const ink = pal.theme === "dark" ? "#1f3f9a" : pal.color;
  const place = (f.place ?? "").toUpperCase();
  const label = (f.label ?? "").toUpperCase();
  c.save();
  c.strokeStyle = ink;
  c.fillStyle = ink;
  c.lineJoin = "round";
  if (v === "postage") {
    const w = baseW(340);
    const h = 420;
    // Perforated edge: a row of half circles bitten out of the outline.
    const r = 9;
    const step = 26;
    c.lineWidth = 4;
    c.beginPath();
    const edge = (x0: number, y0: number, x1: number, y1: number) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.round(len / step);
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      for (let i = 0; i < n; i++) {
        const sx = x0 + ux * (i * step + step / 2);
        const sy = y0 + uy * (i * step + step / 2);
        const a = Math.atan2(uy, ux);
        c.lineTo(sx - ux * r, sy - uy * r);
        c.arc(sx, sy, r, a + Math.PI, a, true);
      }
      c.lineTo(x1, y1);
    };
    c.moveTo(10, 10);
    edge(10, 10, w - 10, 10);
    edge(w - 10, 10, w - 10, h - 10);
    edge(w - 10, h - 10, 10, h - 10);
    edge(10, h - 10, 10, 10);
    c.closePath();
    c.stroke();
    c.setLineDash([6, 6]);
    c.lineWidth = 2;
    rr(c, 40, 40, w - 80, h - 80, 4);
    c.stroke();
    c.setLineDash([]);
    plane(c, w / 2, 160, 120, -0.6, ink);
    text(c, place, w / 2, 260, { size: 40, weight: 800, color: ink, align: "center", lh: 1.2 }, w - 100);
    text(c, f.date, w / 2, 312, { size: 22, weight: 600, color: ink, family: MONO, align: "center", lh: 1.2 }, w - 100);
    c.restore();
    return { w, h };
  }
  if (v === "triangle") {
    const w = baseW(460);
    const h = 400;
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(w / 2, 20);
    c.lineTo(w - 20, h - 20);
    c.lineTo(20, h - 20);
    c.closePath();
    c.stroke();
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(w / 2, 58);
    c.lineTo(w - 58, h - 42);
    c.lineTo(58, h - 42);
    c.closePath();
    c.stroke();
    plane(c, w / 2, 160, 70, -Math.PI / 2, ink);
    text(c, place, w / 2, 222, { size: 40, weight: 900, color: ink, align: "center", lh: 1.2 }, 260);
    text(c, f.date, w / 2, 280, { size: 22, weight: 700, color: ink, family: MONO, align: "center", lh: 1.2 }, 300);
    text(c, label, w / 2, 316, { size: 18, weight: 800, color: ink, align: "center", lh: 1.2 }, 340);
    c.restore();
    return { w, h };
  }
  if (v === "pin") {
    const w = baseW(360);
    const h = 470;
    const R = 150;
    const pin = (r: number) => {
      c.beginPath();
      c.arc(w / 2, R + 20, r, Math.PI * 0.82, Math.PI * 0.18);
      c.lineTo(w / 2, h - 20 - (R - r) * 1.3);
      c.closePath();
    };
    c.lineWidth = 8;
    pin(R);
    c.stroke();
    c.lineWidth = 3;
    pin(R - 18);
    c.stroke();
    text(c, label, w / 2, R - 64, { size: 22, weight: 800, color: ink, align: "center", lh: 1.2 }, 220);
    text(c, place, w / 2, R - 26, { size: 40, weight: 900, color: ink, align: "center", lh: 1.2 }, 230);
    text(c, f.date, w / 2, R + 30, { size: 22, weight: 700, color: ink, family: MONO, align: "center", lh: 1.2 }, 220);
    plane(c, w / 2, R + 110, 44, -Math.PI / 2, ink);
    c.restore();
    return { w, h };
  }
  // Ticket: notched ends, a stub, the place in big letters.
  const w = baseW(620);
  const h = 260;
  const notch = (inset: number) => {
    c.beginPath();
    c.moveTo(inset, inset);
    c.lineTo(w - inset, inset);
    c.lineTo(w - inset, h / 2 - 26);
    c.arc(w - inset, h / 2, 26, -Math.PI / 2, Math.PI / 2, true);
    c.lineTo(w - inset, h - inset);
    c.lineTo(inset, h - inset);
    c.lineTo(inset, h / 2 + 26);
    c.arc(inset, h / 2, 26, Math.PI / 2, -Math.PI / 2, true);
    c.closePath();
  };
  c.lineWidth = 6;
  notch(10);
  c.stroke();
  c.lineWidth = 2;
  c.setLineDash([8, 7]);
  c.beginPath();
  c.moveTo(w - 170, 24);
  c.lineTo(w - 170, h - 24);
  c.stroke();
  c.setLineDash([]);
  text(c, place, 60, 50, { size: 64, weight: 800, color: ink, lh: 1.15 }, w - 260);
  text(c, label, 62, 140, { size: 22, weight: 800, color: ink, lh: 1.2 }, w - 260);
  c.fillRect(62, 182, w - 280, 3);
  text(c, f.date, 62, 196, { size: 20, weight: 700, color: ink, family: MONO, lh: 1.2 }, w - 260);
  plane(c, w - 85, h / 2, 64, -0.35, ink);
  c.restore();
  return { w, h };
}

// ---------------------------------------------------------------- doodle route and sticker globe

/** A hand-drawn dashed path with a loop and a heart, a pin at the start, a paper plane at the end. */
function routeDoodle(c: C, f: F, pal: Pal): Size {
  const w = baseW(720);
  const h = 380;
  const ink = bare(pal);
  const HAND = '"Bradley Hand", "Marker Felt", "Segoe Print", "Comic Sans MS", cursive';
  c.save();
  if (pal.theme === "light") {
    c.shadowColor = "rgba(0,0,0,0.35)";
    c.shadowBlur = 8;
  }
  c.strokeStyle = ink;
  c.lineWidth = 4;
  c.lineCap = "round";
  c.setLineDash([12, 11]);
  c.beginPath();
  c.moveTo(70, 300);
  c.bezierCurveTo(120, 210, 190, 300, 250, 230);
  // A heart.
  c.bezierCurveTo(300, 170, 250, 110, 300, 100);
  c.bezierCurveTo(330, 95, 345, 130, 350, 150);
  c.bezierCurveTo(355, 130, 372, 95, 400, 100);
  c.bezierCurveTo(450, 110, 400, 180, 350, 230);
  // A loop, then away.
  c.bezierCurveTo(330, 260, 420, 300, 470, 250);
  c.bezierCurveTo(520, 200, 470, 160, 450, 190);
  c.bezierCurveTo(430, 230, 560, 160, 630, 90);
  c.stroke();
  c.setLineDash([]);
  // Start pin.
  c.fillStyle = ink;
  c.beginPath();
  c.arc(70, 262, 22, Math.PI * 0.8, Math.PI * 0.2);
  c.lineTo(70, 312);
  c.closePath();
  c.fill();
  c.beginPath();
  c.arc(70, 262, 8, 0, Math.PI * 2);
  c.fillStyle = pal.theme === "light" ? "rgba(0,0,0,0.35)" : "#ffffff";
  c.fill();
  // Paper plane.
  c.save();
  c.translate(660, 70);
  c.rotate(-0.5);
  c.fillStyle = ink;
  c.beginPath();
  c.moveTo(40, 0);
  c.lineTo(-34, -22);
  c.lineTo(-14, 2);
  c.lineTo(-34, 24);
  c.closePath();
  c.fill();
  c.strokeStyle = pal.theme === "light" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(40, 0);
  c.lineTo(-14, 2);
  c.stroke();
  c.restore();
  text(c, f.fromCity || f.fromCode, 100, 312, { size: 30, color: ink, family: HAND, lh: 1.3 }, 360);
  text(c, f.toCity || f.toCode, 690, 116, { size: 34, color: ink, family: HAND, align: "right", lh: 1.3 }, 260);
  if (f.note) text(c, f.note, w / 2, 316, { size: 30, color: ink, family: HAND, align: "center", lh: 1.3 }, 360);
  c.restore();
  return { w, h };
}

/** A flat cartoon globe with a white sticker edge, red pins at both places. */
function routeSticker(c: C, f: F, pal: Pal): Size {
  const R = 220;
  const w = R * 2 + 120;
  const h = R * 2 + 150;
  const cx = w / 2;
  const cy = R + 50;
  const a = place(f.fromCode);
  const b = place(f.toCode, a);
  const lat0 = ((a[0] + b[0]) / 2) * (Math.PI / 180);
  const lon0 = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const proj = (lat: number, lon: number) => {
    const la = (lat * Math.PI) / 180;
    const lo = (lon * Math.PI) / 180 - lon0;
    const x = Math.cos(la) * Math.sin(lo);
    const y = Math.cos(lat0) * Math.sin(la) - Math.sin(lat0) * Math.cos(la) * Math.cos(lo);
    const z = Math.sin(lat0) * Math.sin(la) + Math.cos(lat0) * Math.cos(la) * Math.cos(lo);
    return { x: cx + x * R, y: cy - y * R, front: z > 0 };
  };
  // White sticker edge with a shadow, then the sea.
  c.save();
  c.shadowColor = "rgba(0,0,0,0.25)";
  c.shadowBlur = 16;
  c.shadowOffsetY = 6;
  c.beginPath();
  c.arc(cx, cy, R + 16, 0, Math.PI * 2);
  c.fillStyle = "#ffffff";
  c.fill();
  c.restore();
  c.save();
  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.fillStyle = pal.theme === "dark" ? "#2b4f6e" : "#8fd0d3";
  c.fill();
  c.clip();
  // Land as small filled squares: reads as flat shapes.
  c.fillStyle = pal.theme === "dark" ? "#5e8f6a" : "#3f9b74";
  for (let la = -58; la <= 80; la += 1.6)
    for (let lo = -180; lo < 180; lo += 1.6) {
      if (!isLand(la, lo)) continue;
      const p = proj(la, lo);
      if (p.front) c.fillRect(p.x - 3.6, p.y - 3.6, 7.2, 7.2);
    }
  c.restore();
  const A = proj(a[0], a[1]);
  const B = proj(b[0], b[1]);
  // Dashed route, then the pins.
  c.save();
  c.strokeStyle = "#ffffff";
  c.lineWidth = 4;
  c.setLineDash([10, 9]);
  c.beginPath();
  const mx = (A.x + B.x) / 2;
  const my = Math.min(A.y, B.y) - Math.max(60, Math.abs(A.x - B.x) * 0.4);
  c.moveTo(A.x, A.y);
  c.quadraticCurveTo(mx, my, B.x, B.y);
  c.stroke();
  c.restore();
  const pinAt = (p: { x: number; y: number }) => {
    c.save();
    c.shadowColor = "rgba(0,0,0,0.3)";
    c.shadowBlur = 6;
    c.shadowOffsetY = 3;
    c.beginPath();
    c.arc(p.x, p.y - 46, 26, Math.PI * 0.8, Math.PI * 0.2);
    c.lineTo(p.x, p.y);
    c.closePath();
    c.fillStyle = "#ffffff";
    c.fill();
    c.restore();
    c.beginPath();
    c.arc(p.x, p.y - 46, 20, Math.PI * 0.8, Math.PI * 0.2);
    c.lineTo(p.x, p.y - 6);
    c.closePath();
    c.fillStyle = pal.theme === "color" ? pal.color : "#ef4e3b";
    c.fill();
    c.beginPath();
    c.arc(p.x, p.y - 46, 8, 0, Math.PI * 2);
    c.fillStyle = "#ffffff";
    c.fill();
  };
  pinAt(A);
  pinAt(B);
  // Name tag under the globe.
  const label = `${f.fromCode ?? ""}  ✈  ${f.toCode ?? ""}`;
  const lw = textW(c, label, { size: 34, weight: 800, color: "" }) + 60;
  c.save();
  c.shadowColor = "rgba(0,0,0,0.2)";
  c.shadowBlur = 10;
  fillRR(c, cx - lw / 2, h - 80, lw, 64, 32, "#ffffff");
  c.restore();
  text(c, label, cx, h - 72, { size: 34, weight: 800, color: "#1c2433", align: "center", lh: 48 / 34 }, lw - 30);
  return { w, h };
}
