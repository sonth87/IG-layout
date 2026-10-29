// The switch by tag is one motion (owner, 2026-10-30: "pull… then the page blinks"): pull the
// tag on IG Layout's home → the booth's dark sheet peeks in, covers, the booth opens under it
// and the sheet slides away. Sampled every few ms at the screen's centre: once dark, it never
// goes light again (no blank / IG frame between), and the same back from the booth.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, OUT, skipOnboarding, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await skipOnboarding(ctx);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const centre = { x: 60, y: 600 };
/** Brightness at a point, from a 1 px screenshot (0…255). */
async function light() {
  const png = await page.screenshot({ clip: { ...centre, width: 1, height: 1 } });
  return page.evaluate(async (b64) => {
    const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const c = new OffscreenCanvas(1, 1).getContext("2d");
    c.drawImage(img, 0, 0);
    const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
    return (r + g + b) / 3;
  }, png.toString("base64"));
}
async function pull(name) {
  const tag = page.getByRole("button", { name });
  await tag.waitFor();
  await page.waitForTimeout(1200);
  const b = await tag.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 - 10, b.y + b.height / 2 + 150, { steps: 10 });
  await page.mouse.up();
  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 1600) samples.push(Math.round(await light()));
  return samples;
}

await page.goto(URL_ARG);
console.log("1. IG Layout → booth");
let s = await pull("Switch to Photobooth");
await page.waitForURL(/booth/, { timeout: 3000 });
let firstDark = s.findIndex((v) => v < 60);
check(firstDark >= 0 && s.slice(firstDark).every((v) => v < 90), `light → dark, never light again (${s.join(" ")})`);
await page.screenshot({ path: path.join(OUT, "tag-switch-booth.png") });

console.log("2. booth → IG Layout");
s = await pull("Switch to IG Layout");
await page.waitForURL((u) => !u.pathname.includes("booth"), { timeout: 3000 });
const firstLight = s.findIndex((v) => v > 180);
check(firstLight >= 0 && s.slice(firstLight).every((v) => v > 150), `dark → light, never dark again (${s.join(" ")})`);

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
