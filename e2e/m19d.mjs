// M19 — project menu, background, preview, export (docs/product/editor-v2/12 §2–5).
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, acceptDownloads: true });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.draft ?? s.doc, saved: s.doc, past: s.past.length };
  });
};
const menu = async (item) => {
  await page.evaluate(() => window.__igEditor.getState().select(null));
  await page.getByRole("button", { name: "Project menu" }).click();
  await page.getByRole("menu", { name: "Project menu" }).getByRole("menuitem", { name: item, exact: true }).click();
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(["p3.jpg", "p4.jpg"].map((f) => path.join(dir, f)));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("Project menu (§2): a popover");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Project menu" }).click();
const pm = page.getByRole("menu", { name: "Project menu" });
for (const n of ["Background", "Ratio", "Snap", "Preview"]) check(await pm.getByRole("menuitem", { name: n, exact: true }).isVisible(), `menu: ${n}`);
const box = await pm.boundingBox();
check(box.y < 120 && box.x + box.width > 300, "a popover under the ⋯ button (top right), not a sheet");
await pm.getByRole("menuitem", { name: "Snap" }).click();
check((await pm.getByRole("menuitemradio", { name: "On" }).getAttribute("aria-checked")) === "true", "Snap › opens in place: On ✓");
await pm.getByRole("menuitemradio", { name: "Off" }).click();
check((await page.evaluate(() => JSON.parse(localStorage.getItem("ig-layout:settings")).snap)) === false, "Off (remembered on this device)");
await pm.getByRole("menuitemradio", { name: "On" }).click();
await page.mouse.click(20, 400);

console.log("Ratio (§2)");
let st = await S();
const photo = st.doc.elements.find((e) => e.type === "image");
const cy0 = (photo.y + photo.height / 2) / 1350;
await menu("Ratio");
await page.getByRole("region", { name: "Slide ratio" }).getByRole("button", { name: "1:1", exact: true }).click();
st = await S();
const p2 = st.saved.elements.find((e) => e.id === photo.id);
check(st.saved.ratio === "1:1" && Math.abs((p2.y + p2.height / 2) / 1080 - cy0) < 0.01, "1:1; the photo keeps its place on its slide");
await page.getByLabel("Undo").click();

console.log("Preview (§4)");
await menu("Preview");
const pv = page.getByRole("dialog", { name: "Preview" });
await pv.locator("img").first().waitFor();
check((await pv.locator("img").count()) >= 2, "every slide in the preview");
await page.screenshot({ path: path.join(OUT, "m19d-preview.png") });
await pv.getByRole("button", { name: "Close" }).click();

console.log("Background: custom gradient, texture (§3)");
await menu("Background");
const bgSheet = page.getByRole("region", { name: "Background" });
await bgSheet.getByRole("tab", { name: "Gradient" }).click();
await bgSheet.getByRole("button", { name: "Custom gradient" }).click();
const bar = bgSheet.getByRole("slider", { name: "Custom gradient" });
const bb = await bar.boundingBox();
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
st = await S();
check(st.doc.background.stops?.length === 3, "tap on the bar adds a stop");
await bgSheet.getByRole("slider", { name: "Angle" }).fill("45");
await bgSheet.getByRole("radio", { name: "Radial" }).click();
st = await S();
check(st.doc.background.angle === 45 && st.doc.background.radial, "angle and radial change at once");
await bgSheet.getByRole("tab", { name: "Texture" }).click();
await bgSheet.getByRole("button", { name: "Kraft" }).click();
await page.getByLabel("Apply").click();
st = await S();
check(st.saved.background.kind === "texture" && st.saved.background.texture === "kraft", "kraft paper background");
// The photos cover the slides here: look at the background node itself.
const tiled = await page.evaluate(() => {
  const bg = window.__igEditor.getState().canvas.layer.findOne((n) => typeof n.fillPatternImage === "function" && n.fillPatternImage());
  const img = bg?.fillPatternImage();
  if (!img) return null;
  const px = img.getContext("2d").getImageData(10, 10, 1, 1).data;
  return Array.from(px);
});
check(!!tiled && tiled[0] > tiled[2] + 20, `the canvas draws a kraft tile (${tiled})`);

console.log("Export 2× (§5)");
await page.getByRole("button", { name: "Export" }).click();
await page.getByText(/images · JPEG/).waitFor({ timeout: 30000 });
await page.getByRole("radio", { name: /2× · 2160/ }).click();
await page.getByText(/2160 × 2700/).waitFor({ timeout: 30000 });
const w = await page.locator("[role=dialog] img").first().evaluate((img) => (img.complete ? img.naturalWidth : new Promise((r) => (img.onload = () => r(img.naturalWidth)))));
check(w === 2160, `2× → images 2160 px wide (${w})`);

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
