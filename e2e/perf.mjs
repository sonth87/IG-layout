// Performance probe (M7): import 20 large photos, then time canvas redraws.
// Not part of `pnpm e2e` (numbers, not pass/fail). Usage: node e2e/perf.mjs <url>
import { chromium } from "playwright-core";
import { chromePath, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 })).newPage();
await page.goto(URL_ARG);

// 20 photos of 4000 × 3000 generated in the browser (JPEG).
const files = await page.evaluate(async () => {
  const out = [];
  for (let i = 0; i < 20; i++) {
    const c = document.createElement("canvas");
    c.width = 4000;
    c.height = 3000;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 4000, 3000);
    g.addColorStop(0, `hsl(${i * 18}, 60%, 55%)`);
    g.addColorStop(1, `hsl(${i * 18 + 120}, 60%, 35%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4000, 3000);
    for (let k = 0; k < 400; k++) {
      ctx.fillStyle = `hsla(${(k * 37) % 360}, 70%, 60%, 0.5)`;
      ctx.fillRect((k * 97) % 4000, (k * 61) % 3000, 120, 120);
    }
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = "";
    for (let j = 0; j < buf.length; j += 0x8000) bin += String.fromCharCode(...buf.subarray(j, j + 0x8000));
    out.push(btoa(bin));
  }
  return out;
});
await page.getByRole("button", { name: "New project" }).click();
for (let i = 0; i < 4; i++) await page.getByLabel("More slides").click(); // 9 slides
const t0 = Date.now();
await page.locator('input[type="file"]').setInputFiles(
  files.map((b64, i) => ({ name: `big${i}.jpg`, mimeType: "image/jpeg", buffer: Buffer.from(b64, "base64") })),
);
await page.getByText("Choose a layout").waitFor({ timeout: 120000 });
const importMs = Date.now() - t0;
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText(/· 9 slides/).waitFor();
await page.waitForTimeout(1500);

const draw = await page.evaluate(() => {
  const layer = window.__igEditor.getState().canvas.layer;
  const times = [];
  for (let i = 0; i < 15; i++) {
    const s = performance.now();
    layer.draw();
    times.push(performance.now() - s);
  }
  times.sort((a, b) => a - b);
  return { median: times[7], max: times[14] };
});
const mem = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
const canvasMP = await page.evaluate(() =>
  [...document.querySelectorAll(".konvajs-content canvas")].reduce((s, c) => s + c.width * c.height, 0) / 1e6,
);
console.log(JSON.stringify({ importMs, drawMedianMs: +draw.median.toFixed(1), drawMaxMs: +draw.max.toFixed(1), heapMB: Math.round(mem / 1e6), canvasMP: +canvasMP.toFixed(1) }));
await browser.close();
