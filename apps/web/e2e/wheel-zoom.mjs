// Mouse wheel zoom (owner, 2026-10-19): the wheel zooms the canvas around the pointer —
// the canvas point under it stays under it; it stops at the smallest zoom; Shift + wheel
// does not zoom; Ctrl + wheel (trackpad pinch) zooms too.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(["p3.jpg", "p4.jpg"].map((f) => path.join(dir, f)));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(1000);
await page.evaluate(() => window.__igEditor.getState().select(null));

const scale = () => page.evaluate(() => window.__igEditor.getState().canvas.layer.getStage().scaleX());
/** The canvas point under a page point. */
const under = (x, y) =>
  page.evaluate(
    ([x, y]) => {
      const st = window.__igEditor.getState().canvas.layer.getStage();
      const r = st.container().getBoundingClientRect();
      return { x: (x - r.left - st.x()) / st.scaleX(), y: (y - r.top - st.y()) / st.scaleY() };
    },
    [x, y],
  );
const box = await page.evaluate(() => {
  const st = window.__igEditor.getState().canvas.layer.getStage();
  const r = st.container().getBoundingClientRect();
  return { x: r.left + st.x() + 300 * st.scaleX(), y: r.top + st.y() + 400 * st.scaleY() };
});

console.log("Wheel up: zooms in around the pointer");
const s0 = await scale();
await page.mouse.move(box.x, box.y);
for (let i = 0; i < 4; i++) {
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(300);
let s1 = await scale();
check(s1 > s0 * 1.4, `zoomed in (${s0.toFixed(3)} → ${s1.toFixed(3)})`);
// While the canvas fits the screen it stays centred; once larger, the point under the pointer stays.
for (let i = 0; i < 4; i++) {
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(300);
const q0 = await under(box.x, box.y);
for (let i = 0; i < 3; i++) {
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(300);
s1 = await scale();
const q1 = await under(box.x, box.y);
check(Math.hypot(q1.x - q0.x, q1.y - q0.y) * s1 < 3, `the point under the pointer stays (${(Math.hypot(q1.x - q0.x, q1.y - q0.y) * s1).toFixed(1)} px, zoom ${s1.toFixed(3)})`);
await page.screenshot({ path: path.join(OUT, "wheel-zoom.png") });

console.log("Shift + wheel does not zoom");
await page.keyboard.down("Shift");
await page.mouse.wheel(0, 100);
await page.keyboard.up("Shift");
await page.waitForTimeout(300);
check(Math.abs((await scale()) - s1) < 1e-6, "same zoom");

console.log("Ctrl + wheel (trackpad pinch) zooms out");
await page.keyboard.down("Control");
for (let i = 0; i < 3; i++) {
  await page.mouse.wheel(0, 20);
  await page.waitForTimeout(60);
}
await page.keyboard.up("Control");
await page.waitForTimeout(300);
const s2 = await scale();
check(s2 < s1 * 0.9, `zoomed out (${s1.toFixed(3)} → ${s2.toFixed(3)})`);

console.log("Wheel down stops at the smallest zoom");
for (let i = 0; i < 30; i++) {
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(400);
const s3 = await scale();
await page.mouse.wheel(0, 100);
await page.waitForTimeout(300);
check(s3 <= s0 * 1.0001 && Math.abs((await scale()) - s3) < 1e-6, `stops (${s3.toFixed(3)}, fit ${s0.toFixed(3)})`);

check(errors.length === 0, `no page errors${errors.length ? `: ${errors[0]}` : ""}`);
await browser.close();
if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
