// Tag lab (/labs/tag, D-151): the hanging switch tag sways on its own, a short tug doesn't
// switch, pulling down past the line does (the other app follows the pull), a tap does too.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, OUT, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: false });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(new URL("labs/tag", URL_ARG).href);
const tag = page.getByRole("button", { name: "Chuyển sang Photobooth" });
await tag.waitFor();
const box = async (l) => {
  const b = await l.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

// Sways: the tag moves by itself.
const a = await box(tag);
await page.waitForTimeout(700);
const b = await box(tag);
console.log("sway Δx", (b.x - a.x).toFixed(1));
await page.screenshot({ path: path.join(OUT, "tag-rest.png") });

// Short tug: back to IG Layout, no switch.
let p = await box(tag);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.mouse.move(p.x - 10, p.y + 30, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(800);
const stillLayout = await page.getByRole("button", { name: "Chuyển sang Photobooth" }).isVisible();
console.log("short tug keeps IG Layout:", stillLayout);

// Long pull: the other app peeks in while pulling, switches on release.
p = await box(tag);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.mouse.move(p.x - 20, p.y + 150, { steps: 12 });
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(OUT, "tag-pull.png") });
await page.mouse.up();
await page.getByRole("button", { name: "Chuyển sang IG Layout" }).waitFor({ timeout: 3000 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "tag-booth.png") });
console.log("pull → booth");

// Tap: back.
// (By position: the tag never stands still, so Playwright's click would wait for it forever.)
p = await box(page.getByRole("button", { name: "Chuyển sang IG Layout" }));
await page.mouse.click(p.x, p.y);
await tag.waitFor({ timeout: 3000 });
console.log("tap → IG Layout");

// Tilt (phone): gravity follows the phone (accelerometer) — tipping it left swings the tag left.
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await phone.goto(new URL("labs/tag", URL_ARG).href);
const ptag = phone.getByRole("button", { name: "Chuyển sang Photobooth" });
await ptag.waitFor();
await phone.waitForTimeout(1500);
const flat = await box(ptag);
// Gravity pulling down-left (Android sign: the reading is the opposite of gravity).
for (let i = 0; i < 30; i++) await phone.evaluate(() => dispatchEvent(new DeviceMotionEvent("devicemotion", { accelerationIncludingGravity: { x: 6.9, y: 6.9, z: 0 } })));
await phone.waitForTimeout(1500);
const tilted = await box(ptag);
console.log("tilt left: Δx", (tilted.x - flat.x).toFixed(1));
await phone.screenshot({ path: path.join(OUT, "tag-tilt.png") });
const tiltOk = tilted.x - flat.x < -15;

await browser.close();
if (!tiltOk || errors.length || !stillLayout || Math.abs(b.x - a.x) < 0.5) {
  console.error("FAIL", errors);
  process.exit(1);
}
console.log("OK tag");
