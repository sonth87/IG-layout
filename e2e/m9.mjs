// M9 — fixes after the owner's trial (docs/discussions/2026-10-15-tham-khao-grids.md):
// F-01 layers only cover the screen, F-02 rotation dead zone + snapping, F-03 canvas
// doesn't move, F-04 no duplicate layouts, D-67 no page zoom / text selection.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, more, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const cdp = await context.newCDPSession(page);
const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, selected: s.selectedId };
  });
};
const frame = () => page.locator("[data-stage-frame]").boundingBox();

await page.goto(URL_ARG);

console.log("D-67 app feel: no page zoom, no text selection");
const meta = await page.evaluate(() => document.querySelector('meta[name="viewport"]').content);
check(/maximum-scale=1/.test(meta) && /user-scalable=no/.test(meta), `viewport blocks page zoom (${meta})`);
check((await page.evaluate(() => getComputedStyle(document.body).userSelect)) === "none", "body text is not selectable");

console.log("F-04 layout picker lists each layout once");
await page.getByRole("button", { name: "New project" }).click();
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "panorama.jpg")]);
await page.getByText("Choose a layout").waitFor();
const all = await page.evaluate(() =>
  [...document.querySelectorAll('[role="dialog"] .grid > button')].map((b) => b.querySelector("span").textContent),
);
check(all.length > 0 && new Set(all).size === all.length, `no duplicates among ${all.length} layouts`);
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("F-01 layers only cover the screen");
const px = await page.evaluate(() =>
  Math.max(...[...document.querySelectorAll(".konvajs-content canvas")].map((c) => c.width * c.height)),
);
check(px <= 390 * 844 * 4, `largest layer ${(px / 1e6).toFixed(2)} MP (≤ screen at 2×)`);

console.log("F-03 the canvas doesn't move or resize");
const f0 = await frame();
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
const f1 = await frame();
const photo = (await S()).doc.elements[0];
await page.evaluate((id) => window.__igEditor.getState().select(id), photo.id);
await page.waitForTimeout(300);
const f2 = await frame();
await page.getByRole("button", { name: "Adjust" }).click();
await page.waitForTimeout(400);
const f3 = await frame();
await page.getByLabel("Cancel").click();
await page.waitForTimeout(300);
const same = (a, b) => Math.abs(a.y - b.y) < 1 && Math.abs(a.height - b.height) < 1;
check(same(f0, f1) && same(f1, f2) && same(f2, f3), `same place and size: none / selected / tool open (${[f0, f1, f2, f3].map((f) => `${Math.round(f.y)}+${Math.round(f.height)}`).join(", ")})`);

console.log("F-02 rotation: pinch doesn't tilt, snaps to 0°, Rotate to 0°");
// Unlock the panorama so it can be rotated.
await page.evaluate((id) => window.__igEditor.getState().toggleLock(id), photo.id);
await page.evaluate((id) => window.__igEditor.getState().select(id), photo.id);
await page.waitForTimeout(200);
const fb = await frame();
const c = { x: 195, y: fb.y + fb.height / 2 }; // middle of the screen, on the panorama
/** Two fingers around c: start at angle a0, end at a1 (degrees), spreading apart. */
async function twist(a0, a1, spread = 1) {
  const pt = (a, r) => ({ x: c.x + Math.cos((a * Math.PI) / 180) * r, y: c.y + Math.sin((a * Math.PI) / 180) * r });
  await touch("touchStart", [pt(a0 + 180, 50), pt(a0, 50)]);
  for (let i = 1; i <= 12; i++) {
    const a = a0 + ((a1 - a0) * i) / 12;
    const r = 50 * (1 + ((spread - 1) * i) / 12);
    await touch("touchMove", [pt(a + 180, r), pt(a, r)]);
  }
  await touch("touchEnd", []);
  await page.waitForTimeout(300);
}
await twist(0, 6, 1.3);
let el = (await S()).doc.elements.find((e) => e.id === photo.id);
check(el.rotation === 0 && el.width > photo.width * 1.1, `pinch with a slight twist resizes but stays at 0° (${el.rotation.toFixed(1)}°)`);
await twist(0, 30);
el = (await S()).doc.elements.find((e) => e.id === photo.id);
check(el.rotation > 12, `a clear twist rotates (${el.rotation.toFixed(1)}°)`);
await twist(0, -(el.rotation + 8 + 3)); // past the dead zone, ending ~3° short of 0
el = (await S()).doc.elements.find((e) => e.id === photo.id);
check(el.rotation === 0, `turning back near 0° snaps to exactly 0° (${el.rotation}°)`);
await twist(0, 40);
el = (await S()).doc.elements.find((e) => e.id === photo.id);
check(el.rotation !== 0, `rotated again (${el.rotation.toFixed(1)}°)`);
await more(page, "Rotate to 0°");
el = (await S()).doc.elements.find((e) => e.id === photo.id);
check(el.rotation === 0, "More → Rotate to 0°");

console.log("Touch: dragging the selected item doesn't scroll the page or the canvas");
check((await page.evaluate(() => getComputedStyle(document.body).overscrollBehaviorY)) === "none", "no pull-to-refresh");
await page.evaluate(() => (document.querySelector(".bg-canvas").scrollLeft = 0));
await page.evaluate((id) => window.__igEditor.getState().select(id), photo.id);
await page.waitForTimeout(300);
const fd = await frame();
const p0 = { x: 200, y: fd.y + fd.height / 2 };
const before = (await S()).doc.elements.find((e) => e.id === photo.id).x;
await touch("touchStart", [p0]);
for (let i = 1; i <= 12; i++) await touch("touchMove", [{ x: p0.x - i * 8, y: p0.y }]);
await touch("touchEnd", []);
await page.waitForTimeout(400);
const after = (await S()).doc.elements.find((e) => e.id === photo.id).x;
const scrolled = await page.evaluate(() => document.querySelector(".bg-canvas").scrollLeft);
check(after < before - 100 && scrolled === 0, `the item moved (${Math.round(before)} → ${Math.round(after)}), the canvas did not scroll (${scrolled})`);
// Unselected: the same swipe scrolls instead.
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(200);
await touch("touchStart", [p0]);
for (let i = 1; i <= 12; i++) await touch("touchMove", [{ x: p0.x - i * 8, y: p0.y }]);
await touch("touchEnd", []);
await page.waitForTimeout(500);
check((await page.evaluate(() => document.querySelector(".bg-canvas").scrollLeft)) > 30, "nothing selected: the swipe scrolls");

console.log(`console errors: ${JSON.stringify(errors)}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures || errors.length ? 1 : 0);
