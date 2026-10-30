// Booth layouts (D-161): Decorate → Layout: straight / staggered / scattered / free, cell
// shapes, 🎲 shuffle changes a random layout (and only then), free: drag / turn a cell, the
// print follows, realign, the choice survives a reload, the saved file is drawn the same.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, OUT, URL_ARG, openRoll } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const print = () => page.locator("canvas").first();
const pixels = () => print().evaluate((c) => c.toDataURL("image/jpeg", 0.5).length + ":" + c.toDataURL("image/jpeg", 0.5).slice(-80));

await page.goto(new URL("booth?today=2026-06-15", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Layout" }).click();

console.log("1. Arrangements");
const looks = {};
for (const a of ["Straight", "Staggered", "Scattered"]) {
  await page.getByRole("radiogroup", { name: "Arrangement" }).getByRole("radio", { name: a }).click();
  await page.waitForTimeout(500);
  looks[a] = await pixels();
  await page.screenshot({ path: path.join(OUT, `booth-layout-${a.toLowerCase()}.png`) });
}
check(new Set(Object.values(looks)).size === 3, "straight, staggered and scattered draw differently");

console.log("2. Shuffle");
const before = await pixels();
await page.getByRole("button", { name: /Shuffle/ }).click();
await page.waitForTimeout(400);
check((await pixels()) !== before, "🎲 shuffle → another scatter");
const kept = await pixels();
await page.getByRole("tab", { name: "Theme" }).click();
await page.getByRole("tab", { name: "Layout" }).click();
await page.waitForTimeout(300);
check((await pixels()) === kept, "a shuffle is kept (no change without asking)");

console.log("3. Shapes");
const shapes = new Set();
for (const s of ["Rounded", "Polaroid", "Arch", "Circle", "Heart", "Torn paper"]) {
  await page.getByRole("radiogroup", { name: "Cell shape" }).getByRole("radio", { name: s }).click();
  await page.waitForTimeout(300);
  shapes.add(await pixels());
  if (s === "Polaroid" || s === "Heart") await page.screenshot({ path: path.join(OUT, `booth-shape-${s.toLowerCase()}.png`) });
}
check(shapes.size === 6, "6 shapes draw differently");

console.log("4. Free");
await page.getByRole("radiogroup", { name: "Arrangement" }).getByRole("radio", { name: "Free" }).click();
await page.locator("[data-layout-editor]").waitFor();
const cell = page.locator("[data-cell='1']");
const b = await cell.boundingBox();
const p0 = await pixels();
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
await page.mouse.down();
await page.mouse.move(b.x + b.width / 2 + 30, b.y + b.height / 2 + 12, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(300);
const b2 = await cell.boundingBox();
check(Math.abs(b2.x - b.x - 30) < 6, `dragged a cell (${Math.round(b2.x - b.x)} px)`);
check((await pixels()) !== p0, "the print follows");
const knob = await cell.locator("[data-turn]").boundingBox();
await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2);
await page.mouse.down();
await page.mouse.move(knob.x + 60, knob.y + 20, { steps: 6 });
await page.mouse.up();
const turned = await cell.evaluate((el) => el.style.transform);
check(/rotate\((?!0deg)/.test(turned), `turned (${turned})`);
await page.screenshot({ path: path.join(OUT, "booth-layout-free.png") });

console.log("5. Kept after a reload");
const freeLook = await pixels();
await page.getByRole("button", { name: "Done" }).click();
await page.waitForTimeout(900);
await page.reload();
await openRoll(page);
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Layout" }).click();
await page.waitForTimeout(500);
check((await page.getByRole("radio", { name: "Free" }).getAttribute("aria-checked")) === "true", "free layout kept");
check((await pixels()) === freeLook, "same cells after reload");
await page.getByRole("button", { name: /Realign/ }).click();
await page.waitForTimeout(300);
check((await cell.evaluate((el) => el.style.transform)) === "rotate(0deg)", "realign → straight cells");

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
