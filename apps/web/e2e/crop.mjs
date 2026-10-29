// Crop on the canvas (D-111, editor-v2/09 §6): no separate screen; the window resizes but
// never moves; dragging anywhere moves the picture; picture handles zoom it; the picture
// always covers the window; ✕ drops everything, ✓ is one step; cells keep their window.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = async () => {
  await page.waitForTimeout(120);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.draft ?? s.doc, saved: s.doc, past: s.past.length, cropping: s.cropping, assets: Object.fromEntries(Object.values(s.assets).map((a) => [a.id, { w: a.width, h: a.height }])) };
  });
};
/** Canvas px → page px. */
const toPage = (x, y) =>
  page.evaluate(
    ([x, y]) => {
      const st = window.__igEditor.getState().canvas.layer.getStage();
      const r = st.container().getBoundingClientRect();
      return { x: r.left + st.x() + x * st.scaleX(), y: r.top + st.y() + y * st.scaleY(), scale: st.scaleX() };
    },
    [x, y],
  );
const drag = async (a, b) => {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
};
const el = (st, id) => st.doc.elements.find((e) => e.id === id);
/** Is the window (in picture px, θ = 0) inside the picture? */
const inside = (e, a) => e.crop.x >= -0.5 && e.crop.y >= -0.5 && e.crop.x + e.crop.width <= a.w + 0.5 && e.crop.y + e.crop.height <= a.h + 0.5;

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(["p3.jpg", "portrait.jpg"].map((f) => path.join(dir, f)));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
let st = await S();
const free = st.doc.elements.find((e) => e.type === "image" && !e.parentId && !e.slot);
check(!!free, "a free photo to crop");
await page.evaluate((id) => window.__igEditor.getState().select(id), free.id);
await page.waitForTimeout(200);
const scale0 = (await toPage(0, 0)).scale;

const toolNames = await page.getByRole("region", { name: "Tools" }).getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") || e.innerText.trim()));
check(!toolNames.includes("Animate"), "Animate hidden for now (owner, 2026-10-18)");

console.log("Opens on the canvas");
await page.getByRole("button", { name: "Crop", exact: true }).click();
await page.waitForTimeout(500);
st = await S();
check((await page.getByRole("dialog", { name: "Crop" }).count()) === 0 && (await page.getByRole("region", { name: "Crop" }).isVisible()), "no separate screen, a Crop bar under the canvas");
check(st.cropping === free.id, "the canvas is in crop mode");
const scale1 = (await toPage(0, 0)).scale;
check(scale1 > scale0 * 1.2, `zoomed to the photo (${scale0.toFixed(3)} → ${scale1.toFixed(3)})`);
await page.screenshot({ path: path.join(OUT, "crop-open.png") });

const asset = st.assets[free.assetId];
let e0 = el(st, free.id);

console.log("Zoom buttons while cropping stay on the photo");
const centreOnScreen = async () => {
  const e = el(await S(), free.id);
  const c = await toPage(e.x + e.width / 2, e.y + e.height / 2);
  return c.x > 0 && c.x < 390 && c.y > 100 && c.y < 700;
};
await page.getByRole("button", { name: "Zoom in" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Zoom in" }).click();
await page.waitForTimeout(400);
check((await toPage(0, 0)).scale > scale1 * 1.5 && (await centreOnScreen()), "zoom in: the photo stays in the middle");
await page.getByRole("button", { name: "Fit", exact: true }).click();
await page.waitForTimeout(400);
check(Math.abs((await toPage(0, 0)).scale - scale1) < 0.005 && (await centreOnScreen()), "% : back to the photo, not to every slide");

console.log("Drag anywhere = move the picture, the window stays");
// Start outside the window (left of it, in the dark area).
// Start outside the window, away from its handles (under it, a quarter across).
let a = await toPage(e0.x + e0.width * 0.25, e0.y + e0.height);
a = { x: a.x, y: a.y + 40 };
await drag(a, { x: a.x - 40, y: a.y });
st = await S();
let e1 = el(st, free.id);
check(Math.abs(e1.x - e0.x) < 0.01 && Math.abs(e1.y - e0.y) < 0.01 && Math.abs(e1.width - e0.width) < 0.01, `window did not move (${JSON.stringify([e0.x, e0.y, e0.width, e1.x, e1.y, e1.width])})`);
check(Math.abs(e1.crop.x - e0.crop.x) > 1 || e1.crop.x === 0 || e1.crop.x + e1.crop.width >= asset.w - 1, `picture moved (crop x ${e0.crop.x.toFixed(0)} → ${e1.crop.x.toFixed(0)})`);
check(inside(e1, asset), "picture still covers the window");
// Far away: stops at the edge.
a = await toPage(e1.x + e1.width / 2, e1.y + e1.height / 2);
await drag(a, { x: a.x + 900, y: a.y + 900 });
st = await S();
e1 = el(st, free.id);
check(inside(e1, asset), "dragged far: stops at the picture's edge");

console.log("Window handle: resize, opposite side fixed");
e0 = e1;
a = await toPage(e0.x + e0.width, e0.y + e0.height / 2);
await drag(a, { x: a.x - 60, y: a.y });
st = await S();
e1 = el(st, free.id);
check(e1.width < e0.width - 20 && Math.abs(e1.x - e0.x) < 0.5 && Math.abs(e1.height - e0.height) < 0.5, `right edge in: ${e0.width.toFixed(0)} → ${e1.width.toFixed(0)}, left edge fixed`);
check(Math.abs(e1.crop.x - e0.crop.x) < 1, "the picture did not move on screen");
await page.screenshot({ path: path.join(OUT, "crop-window.png") });

console.log("Picture handle: zoom");
e0 = e1;
const v0 = e0.width / e0.crop.width;
// A picture corner handle that is on screen, dragged away from the picture's middle.
const corners = await page.evaluate((id) => {
  const s = window.__igEditor.getState();
  const e = (s.draft ?? s.doc).elements.find((x) => x.id === id);
  const a = s.assets[e.assetId];
  const k = e.width / e.crop.width;
  const x0 = e.x - e.crop.x * k;
  const y0 = e.y - e.crop.y * k;
  return [[x0, y0], [x0 + a.width * k, y0], [x0 + a.width * k, y0 + a.height * k], [x0, y0 + a.height * k]];
}, free.id);
const mid = await toPage((corners[0][0] + corners[2][0]) / 2, (corners[0][1] + corners[2][1]) / 2);
let picked = null;
for (const [x, y] of corners) {
  const p = await toPage(x, y);
  if (p.x > 15 && p.x < 375 && p.y > 120 && p.y < 560) picked = p;
}
check(!!picked, "a picture corner on screen");
a = picked;
console.log("   corners", JSON.stringify(corners), JSON.stringify(a), JSON.stringify(mid));
const len = Math.hypot(a.x - mid.x, a.y - mid.y);
await drag(a, { x: a.x + ((a.x - mid.x) / len) * 50, y: a.y + ((a.y - mid.y) / len) * 50 });
st = await S();
e1 = el(st, free.id);
check(e1.width / e1.crop.width > v0 * 1.05, `zoomed in (${v0.toFixed(3)} → ${(e1.width / e1.crop.width).toFixed(3)})`);
check(inside(e1, asset), "still covered");

console.log("Reset: back to the window Crop opened with");
const opened = free; // the window when Crop was opened (it was resized above)
await page.getByRole("radio", { name: "Original" }).click();
await page.getByRole("radio", { name: "1:1" }).click();
await page.waitForTimeout(200);
check(Math.abs(el(await S(), free.id).width - el(await S(), free.id).height) < 1, "1:1 applied");
await page.getByRole("button", { name: "Reset", exact: true }).click();
await page.waitForTimeout(200);
e1 = el(await S(), free.id);
check(Math.abs(e1.width - opened.width) < 0.5 && Math.abs(e1.height - opened.height) < 0.5 && Math.abs(e1.x - opened.x) < 0.5, `window as when Crop opened (${e1.width.toFixed(0)}×${e1.height.toFixed(0)})`);
check((await page.getByRole("radio", { name: "Free" }).getAttribute("aria-checked")) === "true" && e1.straighten === 0, "ratio back to Free, picture reset");

console.log("✕ drops it all, ✓ is one step");
await page.getByRole("region", { name: "Crop" }).getByLabel("Cancel").click();
st = await S();
check(st.cropping === null && el(st, free.id).width === free.width && el(st, free.id).crop.x === free.crop.x, "✕: as before");
const back = (await toPage(0, 0)).scale;
check(Math.abs(back - scale0) < 0.01, "the view zooms back");
const past0 = st.past;
await page.getByRole("button", { name: "Crop", exact: true }).click();
await page.waitForTimeout(400);
e0 = el(await S(), free.id);
a = await toPage(e0.x + e0.width / 2, e0.y + e0.height / 2);
await drag(a, { x: a.x + 30, y: a.y });
await page.getByRole("slider", { name: "Straighten" }).fill("8");
await page.getByRole("region", { name: "Crop" }).getByLabel("Apply").click();
st = await S();
check(st.past === past0 + 1 && el(st, free.id).straighten === 8, "✓: one step");

console.log("3D tilt (part 2)");
await page.evaluate((id) => window.__igEditor.getState().select(id), free.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Crop", exact: true }).click();
await page.waitForTimeout(400);
e0 = el(await S(), free.id);
await page.getByRole("slider", { name: "Vertical" }).fill("18");
await page.getByRole("slider", { name: "Horizontal" }).fill("-12");
await page.waitForTimeout(300);
e1 = el(await S(), free.id);
check(e1.tiltX === 18 && e1.tiltY === -12, "tilt saved");
check(e1.crop.width < e0.crop.width, `zoomed up to stay covered (${e0.crop.width.toFixed(0)} → ${e1.crop.width.toFixed(0)})`);
await page.screenshot({ path: path.join(OUT, "crop-tilt.png") });
// Drag far: it stops at the edge (checked below: no gap at the window corners).
a = await toPage(e1.x + e1.width / 2, e1.y + e1.height / 2);
await drag(a, { x: a.x + 600, y: a.y + 600 });

await page.getByRole("region", { name: "Crop" }).getByLabel("Apply").click();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "crop-tilt-applied.png") });
// The drawn photo has no gap: sample the window corners on the content layer.
const gaps = await page.evaluate((id) => {
  const s = window.__igEditor.getState();
  const e = s.doc.elements.find((x) => x.id === id);
  const layer = s.canvas.layer;
  const canvas = layer.getCanvas()._canvas;
  const st = layer.getStage();
  const ratio = canvas.width / st.width();
  const bg = [];
  for (const [fx, fy] of [[0.03, 0.03], [0.97, 0.03], [0.97, 0.97], [0.03, 0.97]]) {
    const x = (st.x() + (e.x + e.width * fx) * st.scaleX()) * ratio;
    const y = (st.y() + (e.y + e.height * fy) * st.scaleY()) * ratio;
    const d = canvas.getContext("2d").getImageData(Math.round(x), Math.round(y), 1, 1).data;
    bg.push(d[3]);
  }
  return bg;
}, free.id);
check(gaps.every((a) => a > 200), `no gap at the window corners after tilting (alpha ${gaps.join(", ")})`);

console.log("A cell keeps its window");
const cell = st.doc.elements.find((e) => e.type === "image" && e.parentId && e.assetId);
if (cell) {
  await page.evaluate((id) => window.__igEditor.getState().select(id), cell.id);
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Crop", exact: true }).click();
  await page.waitForTimeout(400);
  check((await page.getByRole("radiogroup", { name: "Window ratio" }).count()) === 0, "no window ratios");
  e0 = el(await S(), cell.id);
  a = await toPage(e0.x + e0.width, e0.y + e0.height / 2);
  await drag(a, { x: a.x - 40, y: a.y });
  e1 = el(await S(), cell.id);
  check(e1.width === e0.width && e1.height === e0.height, "its edge moves the picture, not the window");
  await page.getByRole("region", { name: "Crop" }).getByLabel("Cancel").click();
} else console.log("  (no cell photo in this project)");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
