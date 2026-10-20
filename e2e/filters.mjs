// Filter v2 (D-131, D-132): the filter lab renders every recipe filter, a black-and-white
// filter is fully grey even at low intensity, and a colour recipe changes the photo.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(new URL("labs/filters.html", URL_ARG).href);
await page.waitForTimeout(1500);

/** Max |r-g|, |g-b| over a canvas tile, and how far it is from the original tile. */
const stats = (i) =>
  page.evaluate((i) => {
    const tiles = [...document.querySelectorAll("main canvas")];
    const read = (c) => c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const a = read(tiles[i]);
    const o = read(tiles[0]);
    let chroma = 0;
    let diff = 0;
    for (let p = 0; p < a.length; p += 16) {
      chroma = Math.max(chroma, Math.abs(a[p] - a[p + 1]), Math.abs(a[p + 1] - a[p + 2]));
      diff += Math.abs(a[p] - o[p]) + Math.abs(a[p + 1] - o[p + 1]) + Math.abs(a[p + 2] - o[p + 2]);
    }
    return { chroma, diff: diff / (a.length / 16) / 3, count: tiles.length };
  }, i);

console.log("Filter lab");
await page.waitForFunction(() => document.querySelectorAll("main canvas").length > 2);
await page.getByRole("button", { name: "Film", exact: true }).click();
await page.waitForTimeout(3000);
const film = await stats(1);
check(film.count >= 12, `Film group shows its filters (${film.count - 1})`);
check(film.diff > 3, `a film recipe changes the photo (mean Δ ${film.diff.toFixed(1)})`);

await page.getByRole("button", { name: "Đen trắng", exact: true }).click();
await page.locator('input[type="range"]').fill("30");
await page.waitForTimeout(3000);
const bw = await stats(1);
check(bw.chroma <= 3, `black-and-white at 30 % stays grey (max channel gap ${bw.chroma})`);

console.log("Cameras & Film FX in the editor");
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const ed = await context.newPage();
ed.on("pageerror", (e) => errors.push(String(e)));
ed.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await ed.goto(URL_ARG);
await newProject(ed);
for (let i = 0; i < 3; i++) await ed.getByLabel("Fewer slides").click();
await ed.locator('input[type="file"]').setInputFiles([path.join(FIXTURES, "p3.jpg")]);
await ed.getByRole("button", { name: "Skip" }).click();
await ed.waitForTimeout(800);
const state = () => ed.evaluate(() => { const s = window.__igEditor.getState(); const d = s.draft ?? s.doc; return { el: d.elements.find((e) => e.type === "image"), past: s.past.length, slides: d.slideCount }; });
const st0 = await state();
const box = await ed.locator("[data-stage-frame]").boundingBox();
const k = box.width / (1080 * st0.slides);
await ed.mouse.click(box.x + (st0.el.x + st0.el.width / 2) * k, box.y + (st0.el.y + st0.el.height / 2) * k);
await ed.getByRole("button", { name: "Adjust" }).click({ timeout: 5000 });
await ed.getByRole("tab", { name: "Cameras" }).click();
await ed.getByRole("button", { name: "Instant", exact: true }).click();
let st1 = await state();
check(st1.el.filmFx?.camera === "instantcam" && st1.el.filmFx.frame?.id === "instant" && st1.el.filter?.id === "linen", "camera sets its filter + layers");
const seed1 = st1.el.filmFx.frame.seed;
await ed.getByRole("button", { name: "Instant", exact: true }).click();
st1 = await state();
check(st1.el.filmFx.frame.seed !== seed1, "tapping the camera again re-rolls the random parts");
// The instant frame paints the bottom of the photo cream.
const bottom = await ed.evaluate(({ x, y }) => {
  const s = window.__igEditor.getState();
  const layer = s.canvas.layer;
  const c = layer.getCanvas()._canvas;
  const ratio = layer.getCanvas().getPixelRatio();
  const o = layer.getStage().position();
  const vs = s.canvas.viewScale;
  return Array.from(c.getContext("2d").getImageData(Math.round((o.x + x * vs) * ratio), Math.round((o.y + y * vs) * ratio), 1, 1).data.slice(0, 3));
}, { x: st1.el.x + st1.el.width / 2, y: st1.el.y + st1.el.height - 20 });
check(bottom.every((v) => v > 225), `instant frame drawn on the canvas (${bottom})`);
await ed.screenshot({ path: path.join(OUT, "filters-cameras.png") });
await ed.getByRole("tab", { name: "Film FX" }).click();
await ed.waitForTimeout(400);
await ed.screenshot({ path: path.join(OUT, "filters-fx.png") });
await ed.getByRole("tab", { name: "Date" }).click();
await ed.getByRole("checkbox", { name: "Date stamp" }).check();
st1 = await state();
check(/^'\d\d \d\d \d\d$/.test(st1.el.filmFx.date ?? "") && !st1.el.filmFx.camera, `date stamp on (${st1.el.filmFx.date}), no longer exactly the camera`);
await ed.getByRole("button", { name: "Apply", exact: true }).click();
const st2 = await state();
check(st2.past === st0.past + 1 && st2.el.filmFx?.frame?.id === "instant", "✓ keeps the look in one history step");
await ed.screenshot({ path: path.join(OUT, "filters-camera.png") });

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures ? 1 : 0);
