import { chromium } from "playwright-core";
import { more, skipTips, chromePath, FIXTURES as dir, OUT as out, URL_ARG } from "./lib.mjs";
import { execSync } from "node:child_process";
import path from "node:path";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m2-${n}.png`) });
let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, acceptDownloads: true });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

async function state() {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, past: { length: s.past.length } };
  });
}
const stageBox = () => page.locator("canvas").first().boundingBox();
// Canvas (export px) → page coordinates.
async function toPage(x, y) {
  const box = await stageBox();
  const st = await state();
  const scale = box.width / (1080 * st.doc.slideCount);
  return { x: box.x + x * scale, y: box.y + y * scale, scale };
}
async function tapElement(el) {
  const p = await toPage(el.x + el.width / 2, el.y + el.height / 2);
  await page.mouse.click(p.x, p.y);
}

await page.goto(url);
await page.getByRole("button", { name: "New project" }).click();
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "panorama.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("4:5 · 3 slides").waitFor();

console.log("1. Panorama placement");
let st = await state();
let pano = st.doc.elements[0];
check(pano.x === 0 && pano.y === 0 && pano.width === 3240 && pano.height === 1350, `frame = whole canvas (${pano.width}×${pano.height})`);
check(Math.abs(pano.crop.width / pano.crop.height - 3240 / 1350) < 0.01, "crop aspect matches frame");

console.log("2. Add a floating photo");
await page.getByRole("button", { name: "Done" }).click();
await page.locator('input[type="file"]').first().setInputFiles(path.join(dir, "portrait.jpg"));
for (let i = 0; i < 20 && (st = await state()).doc.elements.length < 2; i++);
check(st.doc.elements.length === 2, "2 elements");
let photo = st.doc.elements[1];
check(photo.width < 1080 && photo.x > 0, `floating on slide 1 (${Math.round(photo.x)}, ${Math.round(photo.width)}w)`);

console.log("3. Mask: cancel keeps old value, apply records one step");
const pastBefore = st.past.length;
await more(page, "Mask");
await page.getByRole("radio", { name: "Heart" }).click();
await page.getByLabel("Cancel").click();
st = await state();
check(st.doc.elements[1].mask === "none" && st.past.length === pastBefore, "✕ discards draft, no history");
await more(page, "Mask");
await page.getByRole("radio", { name: "Circle" }).click();
await page.getByLabel("Apply").click();
st = await state();
check(st.doc.elements[1].mask === "circle" && st.past.length === pastBefore + 1, `✓ applies + exactly 1 history step (mask=${st.doc.elements[1].mask}, past ${pastBefore}→${st.past.length})`);

console.log("4. Style: border + shadow + opacity");
await page.getByRole("button", { name: "Style" }).click();
await page.getByRole("slider").nth(0).fill("30");
await page.getByRole("checkbox").check();
await page.getByRole("slider").nth(1).fill("80");
await page.getByLabel("Apply").click();
st = await state();
photo = st.doc.elements[1];
check(photo.border?.width === 30 && photo.shadow && Math.abs(photo.opacity - 0.8) < 0.001, `border 30, shadow, opacity 0.8`);
await shot(page, "1-mask-style");

console.log("5. Crop 1:1 + straighten");
await page.getByRole("button", { name: "Crop" }).click();
await page.getByRole("button", { name: "1:1" }).click();
await page.getByRole("slider").fill("10");
await shot(page, "2-crop");
await page.getByLabel("Apply").click();
st = await state();
photo = st.doc.elements[1];
check(Math.abs(photo.crop.width - photo.crop.height) < 1 && Math.abs(photo.width - photo.height) < 1, `crop 1:1 → frame 1:1 (${JSON.stringify(photo.crop)} ${photo.width}x${photo.height})`);
check(photo.straighten === 10, "straighten 10°");

console.log("6. Snapping: drag near slide-1 center");
const cxTarget = 540;
const from = await toPage(photo.x + photo.width / 2, photo.y + photo.height / 2);
const to = await toPage(cxTarget + 5, photo.y + photo.height / 2 + 30); // 5 export px off-center
await page.mouse.move(from.x, from.y);
await page.mouse.down();
await page.mouse.move(to.x, to.y, { steps: 10 });
await page.mouse.up();
st = await state();
photo = st.doc.elements[1];
check(Math.abs(photo.x + photo.width / 2 - cxTarget) < 0.5, `center snapped to slide center (${(photo.x + photo.width / 2).toFixed(1)})`);

console.log("7. Pinch with two fingers (CDP touch)");
const cdp = await context.newCDPSession(page);
const c = await toPage(photo.x + photo.width / 2, photo.y + photo.height / 2);
const touch = (type, d) =>
  cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x: c.x - d, y: c.y, id: 1 }, { x: c.x + d, y: c.y, id: 2 }],
  });
await touch("touchStart", 30);
for (let d = 32; d <= 60; d += 4) await touch("touchMove", d);
await touch("touchEnd", 0);
const widthBefore = photo.width;
st = await state();
photo = st.doc.elements[1];
check(photo.width > widthBefore * 1.6, `pinch scaled ${widthBefore.toFixed(0)} → ${photo.width.toFixed(0)}`);

console.log("8. Duplicate");
await tapElement(photo);
await page.getByRole("button", { name: "Duplicate" }).click();
st = await state();
check(st.doc.elements.length === 3, "3 elements after duplicate");
await page.getByRole("button", { name: "Delete" }).click();
await page.waitForTimeout(200);

console.log("9. Background gradient");
await page.getByRole("button", { name: "Done" }).click().catch(() => {});
await more(page, "Background");
await page.getByRole("tab", { name: "Gradient" }).click();
await page.locator('button[aria-label*="→"]').first().click();
await page.getByLabel("Apply").click();
st = await state();
check(st.doc.background.kind === "gradient", `background = gradient (${JSON.stringify(st.doc.background)})`);

console.log("10. Slides: add, move, delete");
await more(page, "Slides");
await page.getByRole("button", { name: "Add after" }).click();
st = await state();
check(st.doc.slideCount === 4, "4 slides");
const before = st.doc.elements.map((e) => e.x);
await page.getByRole("button", { name: "Move right" }).click();
st = await state();
check(st.doc.elements[1].x - before[1] === 1080, "photo on slide 1 moved to slide 2 (+1080)");
await page.getByRole("button", { name: "Delete" }).click();
st = await state();
check(st.doc.slideCount === 3, "back to 3 slides");
await page.getByRole("button", { name: "Done" }).click();

console.log("11. Undo all the way back is possible");
const steps = st.past.length;
check(steps >= 10, `history steps recorded: ${steps}`);

console.log("11b. Everything was saved (reload)");
const memDoc = JSON.stringify(st.doc);
await page.waitForTimeout(1500);
await page.reload();
await page.locator("article").first().getByRole("button").first().click();
await page.getByText("4:5 · 3 slides").waitFor();
await page.waitForTimeout(300);
st = await state();
check(JSON.stringify(st.doc) === memDoc, "reloaded doc identical to the in-memory doc before reload");

console.log("12. Export still slices correctly");
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("3 images · JPEG · 1080 × 1350").waitFor();
const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download ZIP" }).click()]);
await dl.saveAs(path.join(out, "m2.zip"));
execSync(`rm -rf "${out}/m2unz" && mkdir "${out}/m2unz" && unzip -q "${out}/m2.zip" -d "${out}/m2unz"`);
const sizes = execSync(`cd "${out}/m2unz" && for f in *; do sips -g pixelWidth -g pixelHeight "$f" | awk '/pixel/{printf "%s ",$2}'; echo; done`).toString().trim().split("\n");
check(sizes.length === 3 && sizes.every((s) => s.trim() === "1080 1350"), `3 × 1080×1350 (${sizes.join(" | ")})`);
await page.getByLabel("Back to editor").click();
await shot(page, "3-editor");

console.log("13. Legacy (M1) project migrates on open");
await page.evaluate(
  () =>
    new Promise((res) => {
      const r = indexedDB.open("ig-layout");
      r.onsuccess = () => {
        const db = r.result;
        const tx = db.transaction(["projects", "states"], "readwrite");
        const now = Date.now();
        tx.objectStore("projects").put({ id: "legacy1", name: "Legacy", type: "post", ratio: "1:1", slideCount: 2, createdAt: now, updatedAt: now + 99999, size: 0 });
        tx.objectStore("states").put({
          id: "legacy1",
          doc: { type: "post", ratio: "1:1", slideCount: 2, background: "#ffffff", elements: [] },
          past: [],
          future: [],
        });
        tx.oncomplete = res;
      };
    }),
);
await page.getByLabel("Back").click();
await page.getByText("Legacy").click();
await page.getByText("1:1 · 2 slides").waitFor();
check(true, "legacy project opened");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
