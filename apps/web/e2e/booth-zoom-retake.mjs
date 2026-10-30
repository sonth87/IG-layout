// Decorating (owner, 2026-10-30): zoom on the print (ctrl / ⌘ + wheel = trackpad pinch), pan
// when zoomed, the corner button resets; a pan is never a tap. 3 photos, then the 4-photo
// strip: cell 4 is empty → tap it → asked first → one countdown, one shot, into that cell →
// back to decorating; same for retaking a photo already taken.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, OUT, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath(), args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.addInitScript(() => localStorage.setItem("ig-layout:booth", JSON.stringify({ frameId: "strip3", spares: false, sound: false })));
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const zoom = () => page.locator("[data-zoom]").getAttribute("data-zoom").then(Number);
const print = () => page.locator("canvas").first();
/** A point of cell `i` of a 600 × 1800 strip of 4 (cells 360 high from y 40, gap 20). */
async function cellPoint(i) {
  const b = await print().boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height * ((40 + i * 380 + 180) / 1800) };
}

await page.goto(new URL("booth?today=2026-06-15", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Layout" }).click();
await page.getByRole("radio", { name: /Strip of 4/ }).click();
await page.getByRole("tab", { name: "Theme" }).click();

console.log("1. Zoom");
const c = await cellPoint(1);
await page.mouse.move(c.x, c.y);
await page.keyboard.down("Control");
await page.mouse.wheel(0, -200);
await page.keyboard.up("Control");
await page.waitForTimeout(200);
check((await zoom()) > 1.5, `ctrl + wheel zooms in (${await zoom()})`);
await page.mouse.move(c.x, c.y);
await page.mouse.down();
await page.mouse.move(c.x + 60, c.y + 40, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(200);
check((await page.getByRole("alertdialog").count()) === 0, "a pan is not a tap");
await page.screenshot({ path: path.join(OUT, "booth-zoom.png") });
await page.getByRole("button", { name: "Reset zoom" }).click();
check((await zoom()) === 1 && (await page.getByRole("button", { name: "Reset zoom" }).count()) === 0, "reset → 100 %, button gone");

console.log("2. Fill the empty cell");
let p = await cellPoint(3);
await page.mouse.click(p.x, p.y);
await page.getByRole("alertdialog", { name: "Take photo 4?" }).waitFor({ timeout: 3000 });
check(true, "tap the empty cell → asked first");
await page.getByRole("button", { name: "Open the camera" }).click();
await page.getByText("Shot 1 of 1").waitFor({ timeout: 5000 });
check(true, "one shot");
await page.getByRole("heading", { name: "Decorate" }).waitFor({ timeout: 20000 });
check(true, "back to decorating");

console.log("3. Retake a taken photo");
p = await cellPoint(0);
await page.mouse.click(p.x, p.y);
await page.getByRole("alertdialog", { name: "Retake photo 1?" }).waitFor({ timeout: 3000 });
await page.getByRole("button", { name: "Cancel" }).click();
check((await page.getByRole("alertdialog").count()) === 0, "retake asks first, cancel stays");

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
