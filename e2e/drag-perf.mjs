// Gesture smoothness probe (M9, F-01): drag + pinch a photo on a simulated mid-range
// phone (390 × 844 @3x, CPU throttled 4×) and report frame times.
// Not part of `pnpm e2e` (numbers, not pass/fail). Usage: node e2e/drag-perf.mjs <url>
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, skipTips, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
await skipTips(context);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });

await page.goto(URL_ARG);
await page.getByRole("button", { name: "New project" }).click();
await page.locator('input[type="file"]').setInputFiles(["panorama.jpg", "portrait.jpg", "p3.jpg", "p4.jpg"].map((f) => path.join(dir, f)));
await page.getByRole("button", { name: /Panorama \+ 3 floating/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
await page.waitForTimeout(1500);

const target = await page.evaluate(() => {
  const s = window.__igEditor.getState();
  const el = s.doc.elements[1];
  const box = document.querySelector("[data-stage-frame]").getBoundingClientRect();
  const k = box.width / (s.doc.slideCount * 1080);
  return { x: box.left + (el.x + el.width / 2) * k, y: box.top + (el.y + el.height / 2) * k };
});
await touch("touchStart", [target]);
await touch("touchEnd", []);
await page.waitForTimeout(400);

await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

/** Records frame intervals and Konva scene-draw time while `gesture` runs. */
async function measure(name, gesture) {
  await page.evaluate(() => {
    const w = window;
    w.__perf = { frames: [], draw: 0, draws: 0, renders: 0 };
    let last = performance.now();
    const loop = (t) => {
      w.__perf.frames.push(t - last);
      last = t;
      if (w.__perf) w.__perf.raf = requestAnimationFrame(loop);
    };
    w.__perf.raf = requestAnimationFrame(loop);
    if (!w.__perfPatched) {
      w.__perfPatched = true;
      const proto = Object.getPrototypeOf(w.__igEditor.getState().canvas.layer);
      const orig = proto.drawScene;
      proto.drawScene = function (...a) {
        const s = performance.now();
        const r = orig.apply(this, a);
        if (w.__perf) {
          w.__perf.draw += performance.now() - s;
          w.__perf.draws++;
        }
        return r;
      };
    }
  });
  await gesture();
  const r = await page.evaluate(() => {
    const p = window.__perf;
    cancelAnimationFrame(p.raf);
    window.__perf = null;
    const f = p.frames.slice(2).sort((a, b) => a - b);
    const pct = (q) => f[Math.min(f.length - 1, Math.floor(f.length * q))];
    return { frames: f.length, p50: pct(0.5), p95: pct(0.95), drawMs: p.draw, draws: p.draws };
  });
  console.log(
    `${name}: ${r.frames} frames, frame p50 ${r.p50.toFixed(1)} ms, p95 ${r.p95.toFixed(1)} ms; ` +
      `scene draws ${r.draws}, ${(r.drawMs / Math.max(1, r.draws)).toFixed(1)} ms each`,
  );
}

await measure("drag ", async () => {
  await touch("touchStart", [target]);
  for (let i = 1; i <= 40; i++) {
    await touch("touchMove", [{ x: target.x - i * 2, y: target.y + i }]);
    await page.waitForTimeout(16);
  }
  await touch("touchEnd", []);
});
await page.waitForTimeout(500);

await measure("pinch", async () => {
  const a = { x: target.x - 40, y: target.y }, b = { x: target.x + 40, y: target.y };
  await touch("touchStart", [a, b]);
  for (let i = 1; i <= 40; i++) {
    await touch("touchMove", [{ x: a.x - i, y: a.y + i * 0.3 }, { x: b.x + i, y: b.y - i * 0.3 }]);
    await page.waitForTimeout(16);
  }
  await touch("touchEnd", []);
});

await browser.close();
