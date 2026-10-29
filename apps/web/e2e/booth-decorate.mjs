// Booth decorating (step 2): upload 4 photos → the print → Decorate: every theme draws, a
// filter (Noir → grey photos), the caption (own title, no date), another frame after the
// shots (Grid 2×2) → Done → save a 1200 × 1800 JPEG → the choices survive a reload.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromePath, FIXTURES, OUT, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const preview = () => page.locator("canvas").first();
/** Average saturation of the preview's first cell area (0 = grey). */
const saturation = () =>
  preview().evaluate((c) => {
    const d = c.getContext("2d").getImageData(c.width * 0.25, c.height * 0.08, c.width * 0.5, c.height * 0.1).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
    return s / (d.length / 4);
  });
const corner = () => preview().evaluate((c) => [...c.getContext("2d").getImageData(3, 3, 1, 1).data].slice(0, 3));

await page.goto(new URL("booth", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });

console.log("1. Themes");
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Theme" }).click();
const themes = page.getByRole("radiogroup", { name: "Theme" }).getByRole("radio");
check((await themes.count()) >= 18, `${await themes.count()} themes`);
const corners = [];
for (let i = 0; i < 6; i++) {
  await themes.nth(i).click();
  await page.waitForTimeout(500);
  corners.push((await corner()).join(","));
  await page.screenshot({ path: path.join(OUT, `booth-theme-${i}.png`) });
}
check(new Set(corners).size >= 5, `themes change the paper (${new Set(corners).size} distinct corners)`);
await page.locator("[data-theme-id='candy']").click();
await page.waitForTimeout(400);
check((await page.locator("[data-theme-id='candy']").getAttribute("aria-checked")) === "true", "Candy picked");

console.log("2. Filter");
await page.getByRole("tab", { name: "Filter" }).click();
const before = await saturation();
await page.getByRole("radio", { name: "Noir" }).click();
await page.waitForTimeout(500);
const after = await saturation();
check(after < before * 0.25, `Noir greys the photos (saturation ${before.toFixed(0)} → ${after.toFixed(0)})`);

console.log("3. Text");
await page.getByRole("tab", { name: "Text" }).click();
await page.getByRole("textbox").fill("Sinh nhật Mai");
await page.getByText("Date and time").click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "booth-decorate-text.png") });
check((await page.getByRole("textbox").inputValue()) === "Sinh nhật Mai", "own title");

console.log("4. Frame after the shots");
await page.getByRole("tab", { name: "Layout" }).click();
await page.getByRole("radio", { name: /Grid 2×2/ }).click();
await page.waitForTimeout(300);
const ratio = await preview().evaluate((c) => c.width / c.height);
check(Math.abs(ratio - 1200 / 1800) < 0.01, `print is now 4×6 (${ratio.toFixed(3)})`);
await page.getByRole("button", { name: "Done" }).click();

console.log("5. Save");
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Save photo/ }).click()]);
const file = path.join(OUT, "booth-decorated.jpg");
await download.saveAs(file);
const jpg = readFileSync(file);
let w = 0,
  h = 0;
for (let i = 2; i < jpg.length - 9; i++) {
  if (jpg[i] === 0xff && (jpg[i + 1] === 0xc0 || jpg[i + 1] === 0xc2)) {
    h = jpg.readUInt16BE(i + 5);
    w = jpg.readUInt16BE(i + 7);
    break;
  }
}
check(w === 1200 && h === 1800, `saved ${w}×${h}`);

console.log("6. Reload");
await page.waitForTimeout(800);
await page.reload();
await page.getByRole("button", { name: /Open roll from/ }).first().click();
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Theme" }).click();
check((await page.getByRole("radio", { name: "Candy" }).getAttribute("aria-checked")) === "true", "theme kept");
await page.getByRole("tab", { name: "Filter" }).click();
check((await page.getByRole("radio", { name: "Noir" }).getAttribute("aria-checked")) === "true", "filter kept");
await page.getByRole("tab", { name: "Text" }).click();
check((await page.getByRole("textbox").inputValue()) === "Sinh nhật Mai", "title kept");

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
