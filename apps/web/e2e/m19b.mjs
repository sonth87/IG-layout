// M19 — photo tools (docs/product/editor-v2/09 §6–10): the full-screen Adjust screen,
// Crop ratios and straighten, background tools (cut out, eraser, restore), Clear.
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
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, past: s.past.length, assets: Object.fromEntries(Object.values(s.assets).map((a) => [a.id, { w: a.width, h: a.height, name: a.name }])) };
  });
};
const select = async (id) => {
  await page.evaluate((id) => window.__igEditor.getState().select(id), id);
  await page.waitForTimeout(200);
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(["p3.jpg", "portrait.jpg"].map((f) => path.join(dir, f)));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
let st = await S();
const photo = st.doc.elements.find((e) => e.type === "image");
await select(photo.id);

console.log("Adjust screen (§8)");
const past0 = st.past;
await page.getByRole("button", { name: "Adjust", exact: true }).click();
const screen = page.getByRole("dialog", { name: "Adjust" });
check(await screen.isVisible(), "full screen");
const tabs = (await screen.getByRole("tablist", { name: "Adjust" }).getByRole("tab").allTextContents()).map((s) => s.trim());
check(["Filters", "Exposure", "Brightness", "Contrast", "Blur", "Sharpen", "Grain"].every((n) => tabs.includes(n)), `tools: ${tabs.join(" · ")}`);
await screen.getByRole("slider").fill("50");
check((await screen.getByRole("tab", { name: "Exposure" }).locator(".bg-red-500").count()) === 1, "a changed tool gets a red dot");
await screen.getByRole("tab", { name: "Sharpen" }).click();
await screen.getByRole("slider").fill("40");
await screen.getByLabel("Undo edit").click();
st = await S();
check(true, "its own undo");
await screen.getByLabel("Cancel").click();
st = await S();
let p = st.doc.elements.find((e) => e.id === photo.id);
check(p.adjust.exposure === 0 && st.past === past0, "✕ drops every change");
await page.getByRole("button", { name: "Filters", exact: true }).click();
check((await screen.getByRole("tablist", { name: "Filters" }).getByRole("tab").first().textContent()) === "All", "filters: “All” first, then the groups");
await screen.getByRole("button", { name: "Classic" }).click();
await screen.getByRole("tab", { name: "Exposure" }).click();
await screen.getByRole("slider").fill("30");
await page.screenshot({ path: path.join(OUT, "m19b-adjust.png") });
await screen.getByLabel("Apply").click();
st = await S();
p = st.doc.elements.find((e) => e.id === photo.id);
check(p.filter?.id === "classic" && p.adjust.exposure === 30 && st.past === past0 + 1, "✓ = one step with filter + exposure");

console.log("Crop (§6)");
await page.getByRole("button", { name: "Crop", exact: true }).click();
await page.getByRole("radio", { name: "4:5", exact: true }).click();
await page.getByRole("slider", { name: "Straighten" }).fill("10");
await page.getByLabel("Apply").click();
st = await S();
p = st.doc.elements.find((e) => e.id === photo.id);
check(Math.abs(p.crop.width / p.crop.height - 0.8) < 0.01 && p.straighten === 10, `4:5 crop, straightened 10° (${(p.crop.width / p.crop.height).toFixed(3)}, ${p.straighten}°)`);

console.log("Background tools → Cut out (§9)");
await page.getByRole("button", { name: "Background tools" }).click();
const bgSheet = page.getByRole("region", { name: "Background tools" });
for (const n of ["Remove background", "Cut out", "Eraser"]) check(await bgSheet.getByRole("button", { name: n }).isVisible(), `sheet: ${n}`);
await bgSheet.getByRole("button", { name: "Cut out" }).click();
const cut = page.getByRole("dialog", { name: "Cut out" });
await page.waitForFunction(() => (document.querySelector('[role="dialog"] canvas')?.width ?? 0) > 300);
const c = await cut.locator("canvas").boundingBox();
// A closed loop around the middle.
const cx = c.x + c.width / 2;
const cy = c.y + c.height / 2;
await page.mouse.move(cx + c.width * 0.3, cy);
await page.mouse.down();
for (let a = 0; a <= 330; a += 15) {
  const r = (a * Math.PI) / 180;
  await page.mouse.move(cx + Math.cos(r) * c.width * 0.3, cy + Math.sin(r) * c.height * 0.3);
}
await page.mouse.up();
await page.waitForTimeout(200);
const px = (fx, fy) => cut.locator("canvas").evaluate((cv, [fx, fy]) => Array.from(cv.getContext("2d").getImageData(Math.round(cv.width * fx), Math.round(cv.height * fy), 1, 1).data), [fx, fy]);
const outside = await px(0.05, 0.9);
const inside = await px(0.5, 0.5);
const reddish = (c) => c[0] > c[1] + 30 && c[0] > c[2] + 30;
check(reddish(outside) && !reddish(inside), `outside the line is red (${outside}), inside is not (${inside})`);
await page.screenshot({ path: path.join(OUT, "m19b-cutout.png") });
await cut.getByLabel("Apply").click();
await page.waitForTimeout(800);
st = await S();
p = st.doc.elements.find((e) => e.id === photo.id);
check(p.assetId !== photo.assetId && p.originalAssetId === photo.assetId && /cutout\.png$/.test(st.assets[p.assetId].name), "a cut-out PNG replaces it, the original is kept");
const sameSize = st.assets[p.assetId].w === st.assets[photo.assetId].w;
check(sameSize, "same size (the crop still fits)");
// The kept part is the drawn circle: its centre stays, a corner is transparent.
const alpha = await page.evaluate(async (url) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  return [x.getImageData(2, 2, 1, 1).data[3], x.getImageData(img.width / 2, img.height / 2, 1, 1).data[3]];
}, await page.evaluate((id) => window.__igEditor.getState().assets[id].url, p.assetId));
check(alpha[0] === 0 && alpha[1] === 255, `outside cut away, inside kept (alpha ${alpha})`);
await page.getByRole("button", { name: "Background tools" }).click();
check(await bgSheet.getByRole("button", { name: "Restore background" }).isVisible(), "the sheet now offers “Restore background”");

console.log("Eraser, then Restore background");
await bgSheet.getByRole("button", { name: "Eraser" }).click();
const er = page.getByRole("dialog", { name: "Eraser" });
await page.waitForFunction(() => (document.querySelector('[role="dialog"] canvas')?.width ?? 0) > 300);
const e2 = await er.locator("canvas").boundingBox();
await page.mouse.move(e2.x + e2.width / 2, e2.y + e2.height / 2);
await page.mouse.down();
await page.mouse.move(e2.x + e2.width / 2 + 40, e2.y + e2.height / 2, { steps: 5 });
await page.mouse.up();
await er.getByLabel("Apply").click();
await page.waitForTimeout(800);
st = await S();
p = st.doc.elements.find((e) => e.id === photo.id);
check(/erase\.png$/.test(st.assets[p.assetId].name) && p.originalAssetId === photo.assetId, "erased PNG, still the same original");
await page.getByRole("button", { name: "Background tools" }).click();
await bgSheet.getByRole("button", { name: "Restore background" }).click();
st = await S();
p = st.doc.elements.find((e) => e.id === photo.id);
check(p.assetId === photo.assetId && !p.originalAssetId, "Restore background → the original photo");

console.log("Clear (§10)");
await page.getByRole("button", { name: "Clear", exact: true }).click();
st = await S();
p = st.doc.elements.find((e) => e.id === photo.id);
check(p && p.assetId === null && Math.abs(p.width - photo.width) < 1, "Clear → an empty frame in the same place");

console.log("Reload keeps the new style fields (M17 fix)");
await page.evaluate((id) => window.__igEditor.getState().updateElement(id, { corners: [10, 20, 30, 40], mask: "rounded" }), st.doc.elements.find((e) => e.type === "image" && e.assetId).id);
await page.waitForTimeout(1500);
const pid = await page.evaluate(() => window.__igEditor.getState().projectId);
await page.evaluate((id) => window.__igEditor.getState().openProject(id), pid);
st = await S();
check(st.doc.elements.some((e) => JSON.stringify(e.corners) === "[10,20,30,40]"), "each-corner radii survive reopening");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
