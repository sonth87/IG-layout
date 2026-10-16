// M12 — remove background (ormbg, on-device). Downloads the ~44 MB model on the first
// run (cached by the browser profile afterwards only within this run). Slow: 1–3 min.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, more, OUT as out, skipTips, URL_ARG } from "./lib.mjs";

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
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const requests = [];
page.on("request", (r) => requests.push(r.url()));
context.on("request", (r) => requests.push(r.url())); // includes worker requests

await page.goto(URL_ARG);
await page.getByRole("button", { name: "New project" }).click();
for (let i = 0; i < 4; i++) await page.getByLabel("Fewer slides").click();
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "portrait.jpg")]);
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(1000);
const before = await page.evaluate(() => {
  const s = window.__igEditor.getState();
  const el = s.doc.elements[0];
  return { id: el.id, assetId: el.assetId, crop: el.crop, past: s.past.length };
});
await page.evaluate((id) => window.__igEditor.getState().select(id), before.id);
await page.waitForTimeout(300);

console.log("S11 remove background");
await more(page, "Remove background");
check(await page.getByText(/about 60 MB/).isVisible(), "first time: explains the one-off download");
await page.getByRole("button", { name: "Download & remove" }).click();
const t0 = Date.now();
await page.getByRole("alertdialog", { name: "Remove background" }).waitFor({ state: "detached", timeout: 300000 });
const secs = Math.round((Date.now() - t0) / 1000);
const after = await page.evaluate(() => {
  const s = window.__igEditor.getState();
  const el = s.doc.elements[0];
  const a = s.assets[el.assetId];
  return { assetId: el.assetId, crop: el.crop, past: s.past.length, type: a?.blob.type, w: a?.width, h: a?.height };
});
check(after.assetId !== before.assetId && after.type === "image/png", `photo replaced by a PNG cut-out in ${secs}s (${after.w}×${after.h})`);
check(after.past === before.past + 1, "one undo step");
// Transparency: corners of a portrait with a plain background should be see-through.
const alpha = await page.evaluate(async () => {
  const s = window.__igEditor.getState();
  const a = s.assets[s.doc.elements[0].assetId];
  const bmp = await createImageBitmap(a.blob);
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(bmp, 0, 0);
  const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
  let clear = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 16) clear++;
  return clear / (d.length / 4);
});
check(alpha > 0.05 && alpha < 0.95, `part of the picture is now transparent (${Math.round(alpha * 100)}%)`);
await page.screenshot({ path: path.join(out, "m12-cutout.png") });
const ort = requests.filter((u) => u.includes("/ort/"));
check(ort.length > 0 && !requests.some((u) => u.includes("cdn.jsdelivr")), `runtime from our origin (${ort.map((u) => u.split("/").pop()).join(", ")})`);
check(requests.some((u) => u.includes("huggingface") && u.includes("ormbg")), "model fetched from Hugging Face");
check(!requests.some((u) => /upload|api\./.test(u) && !u.includes("huggingface")), "the photo is not uploaded anywhere");

console.log("Undo returns the original");
await page.getByRole("button", { name: "Undo" }).click();
const undone = await page.evaluate(() => window.__igEditor.getState().doc.elements[0].assetId);
check(undone === before.assetId, "undo restores the original photo");

console.log("Second time: no download prompt");
await page.getByRole("button", { name: "Redo" }).click();
await page.evaluate((id) => window.__igEditor.getState().select(id), before.id);
await more(page, "Remove background");
await page.waitForTimeout(300);
check(!(await page.getByText(/about 60 MB/).isVisible()), "no download prompt once the model is on the device");
await page.getByRole("alertdialog", { name: "Remove background" }).waitFor({ state: "detached", timeout: 300000 });

console.log(`console errors: ${JSON.stringify(errors)}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures || errors.length ? 1 : 0);
