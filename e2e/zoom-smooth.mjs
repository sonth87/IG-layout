// Pinch-zoom smoothness: a point of the canvas, sampled every frame while two fingers
// spread around it, must move steadily outwards — never back and forth.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await skipTips(context);
const page = await context.newPage();
await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(["p3.jpg", "p4.jpg"].map((f) => path.join(dir, f)));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(1000);
await page.evaluate(() => window.__igEditor.getState().select(null));
const cdp = await context.newCDPSession(page);
const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts.map((p) => ({ x: p.x, y: p.y, id: p.id })) });

const box = await page.evaluate(() => {
  const st = window.__igEditor.getState().canvas.layer.getStage();
  const r = st.container().getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, left: r.left, top: r.top };
});
const { cx, cy } = box;
// The canvas point under the fingers at the start.
const P = await page.evaluate(([x, y]) => {
  const st = window.__igEditor.getState().canvas.layer.getStage();
  const r = st.container().getBoundingClientRect();
  return { x: (x - r.left - st.x()) / st.scaleX(), y: (y - r.top - st.y()) / st.scaleY() };
}, [cx, cy]);
// Every frame: where P is drawn, and how far the DOM's canvas frame is from the stage's.
await page.evaluate((P) => {
  window.__samples = [];
  const st = window.__igEditor.getState().canvas.layer.getStage();
  const dom = document.querySelector("[data-stage-frame]");
  const loop = () => {
    const r = st.container().getBoundingClientRect();
    const d = dom.getBoundingClientRect();
    window.__samples.push({ x: r.left + st.x() + P.x * st.scaleX(), y: r.top + st.y() + P.y * st.scaleY(), s: st.scaleX(), off: Math.hypot(d.left - (r.left + st.x()), d.top - (r.top + st.y())) });
    if (window.__samples.length < 600) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}, P);
await touch("touchStart", [{ x: cx - 20, y: cy, id: 1 }, { x: cx + 20, y: cy, id: 2 }]);
// Like a real finger: events come faster than frames, unevenly.
for (let i = 1; i <= 60; i++) {
  await touch("touchMove", [{ x: cx - 20 - i * 2, y: cy, id: 1 }, { x: cx + 20 + i * 2, y: cy, id: 2 }]);
  if (i % 7 === 0) await page.waitForTimeout(5);
}
await touch("touchEnd", []);
await page.waitForTimeout(400);
const s = await page.evaluate(() => window.__samples);
const uniq = s.filter((p, i, a) => i === 0 || p.s !== a[i - 1].s);
console.log("   ", uniq.filter((_, i) => i % 6 === 0 || i === uniq.length - 1).map((p) => `${p.s.toFixed(2)}:${(p.x - cx).toFixed(0)},${(p.y - cy).toFixed(0)}`).join("  "));
const drift = Math.max(...s.map((p) => Math.hypot(p.x - cx, p.y - cy)));
const off = Math.max(...s.map((p) => p.off));
console.log(`  scale ${s[0].s.toFixed(3)} → ${s.at(-1).s.toFixed(3)}`);
check(s.at(-1).s > s[0].s * 1.5, "zoomed in");
// Smooth: the point never turns back on either axis (it may drift away while the canvas is centred).
let turns = 0;
for (const k of ["x", "y"]) {
  const v = uniq.map((p) => p[k]);
  let dir = 0;
  for (let i = 1; i < v.length; i++) {
    const d = v[i] - v[i - 1];
    if (Math.abs(d) < 0.5) continue;
    const sgn = Math.sign(d);
    if (dir && sgn !== dir) turns++;
    dir = sgn;
  }
}
check(turns === 0, `no back-and-forth (${turns} turns; drift ${drift.toFixed(0)} px)`);
check(off < 1, `canvas and page controls move together every frame (max gap ${off.toFixed(1)} px)`);
console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`);
if (failures) process.exitCode = 1;
await browser.close();
