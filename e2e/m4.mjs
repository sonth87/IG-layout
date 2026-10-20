import { chromium } from "playwright-core";
import path from "node:path";
import { skipTips, chromePath, FIXTURES as dir, OUT as out, URL_ARG, newProject } from "./lib.mjs";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m4-${n}.png`) });
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
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, past: s.past.length, draft: !!s.draft };
  });
};
/** RGB of the content layer at a canvas point (export px), averaged over a small area. */
async function pixel(x, y) {
  await page.waitForTimeout(120);
  return page.evaluate(
    ({ x, y }) => {
      const s = window.__igEditor.getState();
      const layer = s.canvas.layer;
      // The stage covers the visible area only, shifted by scrolling.
      const c = layer.getCanvas()._canvas;
      const ratio = layer.getCanvas().getPixelRatio();
      const o = layer.getStage().position();
      const vs = s.canvas.viewScale;
      const d = c.getContext("2d").getImageData(Math.round((o.x + x * vs) * ratio) - 2, Math.round((o.y + y * vs) * ratio) - 2, 5, 5).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4;
      return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    },
    { x, y },
  );
}
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const gray = ([r, g, b]) => Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) <= 6;

await page.goto(url);
await newProject(page);
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "p3.jpg"), path.join(dir, "portrait.jpg")]);
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("4:5 · 2 slides").waitFor();
await page.waitForTimeout(600);
let st = await S();
const [p0, p1] = st.doc.elements;
// Sample a green stripe of p3.jpg (stripes every 120 px, green between).
const spot = { x: p0.x + 270, y: p0.y + p0.height / 2 };
const base = await pixel(spot.x, spot.y);
check(base[1] > base[0] && base[1] > base[2], `baseline pixel is green (${base})`);

console.log("1. Adjust: preview without history, ✕ restores, ✓ = 1 step");
await page.mouse.click(...(await toScreen(p0.x + p0.width / 2, p0.y + p0.height / 2)));
async function toScreen(x, y) {
  const box = await page.locator("[data-stage-frame]").boundingBox();
  const k = box.width / (1080 * (await S()).doc.slideCount);
  return [box.x + x * k, box.y + y * k];
}
const past0 = (await S()).past;
await page.getByRole("button", { name: "Adjust" }).click();
await page.getByRole("slider").fill("60");
const bright = await pixel(spot.x, spot.y);
st = await S();
check(lum(bright) > lum(base) + 15 && st.past === past0, `exposure +60 previews brighter (${Math.round(lum(base))} → ${Math.round(lum(bright))}), no history yet`);
await page.getByLabel("Cancel").click();
const restored = await pixel(spot.x, spot.y);
check(Math.abs(lum(restored) - lum(base)) < 3, "✕ restores the original look");
await page.getByRole("button", { name: "Adjust" }).click();
await page.getByRole("slider").fill("60");
await page.getByRole("tab", { name: "Vignette" }).click();
await page.getByRole("slider").fill("100");
await page.getByRole("button", { name: "Apply", exact: true }).click();
st = await S();
check(st.past === past0 + 1 && st.doc.elements[0].adjust.exposure === 60 && st.doc.elements[0].adjust.vignette === 100, "✓ records exposure + vignette as one step");
const corner = await pixel(p0.x + 12, p0.y + 12);
check(lum(corner) < lum(await pixel(spot.x, spot.y)), `vignette darkens the corner (${Math.round(lum(corner))})`);

console.log("2. Hold to compare");
await page.getByRole("button", { name: "Adjust" }).click();
const btn = page.getByRole("button", { name: "Hold to compare" });
const bb = await btn.boundingBox();
await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
await page.mouse.down();
const held = await pixel(spot.x, spot.y);
await page.mouse.up();
const released = await pixel(spot.x, spot.y);
check(Math.abs(lum(held) - lum(base)) < 4 && lum(released) > lum(held) + 15, `pressed = original (${Math.round(lum(held))}), released = edited (${Math.round(lum(released))})`);
await page.getByLabel("Cancel").click();

console.log("3. Filter + apply to all (with confirmation)");
await page.getByRole("button", { name: "Filters" }).click();
await page.getByRole("tab", { name: "B&W" }).click();
await page.getByRole("button", { name: "Classic" }).click();
await page.getByRole("slider").fill("100");
check(gray(await pixel(spot.x, spot.y)), "Classic at 100% previews grayscale");
await shot(page, "1-filters");
await page.getByRole("checkbox").check();
await page.getByRole("button", { name: "Apply", exact: true }).click();
await page.getByRole("alertdialog").waitFor();
check(await page.getByText("Apply “Classic” to all 2 photos?").isVisible(), "confirmation dialog shown");
await shot(page, "2-confirm");
const pastBefore = (await S()).past;
await page.getByRole("button", { name: "Apply to all" }).click();
st = await S();
check(st.doc.elements.every((e) => e.filter?.id === "classic"), "both photos have Classic");
check(st.past === pastBefore + 1, "apply to all = 1 history step");
check(st.doc.elements[0].adjust.exposure === 60 && st.doc.elements[1].adjust.exposure === 0, "manual adjustments untouched (filter only)");
check(gray(await pixel(p1.x + p1.width / 2, p1.y + 40)), "second photo is grayscale too");

console.log("4. Export carries the colour changes");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("2 images · JPEG · 1080 × 1350").waitFor();
const exported = await page.evaluate(
  ({ x, y }) =>
    new Promise((res) => {
      const img = document.querySelector("figure img");
      const go = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        res({ w: c.width, rgb: Array.from(ctx.getImageData(x, y, 1, 1).data.slice(0, 3)) });
      };
      if (img.complete) go();
      else img.onload = go;
    }),
  { x: Math.round(spot.x), y: Math.round(spot.y) },
);
check(exported.w === 1080 && gray(exported.rgb), `exported slide is grayscale (${exported.rgb})`);
check((await S()).doc && !(await page.evaluate(() => window.__igEditor.getState().exporting)), "export mode switched back off");
await page.getByLabel("Back to editor").click();

console.log("5. Saved and reopened");
await page.waitForTimeout(1200);
await page.reload();
await page.getByRole("tab", { name: "Projects" }).click();
await page.locator("article").first().getByRole("button").first().click();
await page.getByText("4:5 · 2 slides").waitFor();
st = await S();
check(st.doc.elements[0].filter?.id === "classic" && st.doc.elements[0].adjust.vignette === 100, "filter + adjustments persisted");
await page.waitForTimeout(400);
check(gray(await pixel(spot.x, spot.y)), "reopened project renders the filter");
await shot(page, "3-reopened");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
