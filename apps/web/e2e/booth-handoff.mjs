// Booth step 3: save the print as a Post 4:5 (1080 × 1350) and a Story (1080 × 1920); open
// it in IG Layout as a Carousel (the print + 4 shots = 5 slides), a Story, and a Surprise
// (a layout picked for the 4 shots) — each lands in the editor and is saved as a project.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromePath, FIXTURES, OUT, skipOnboarding, URL_ARG, openRoll } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
await skipOnboarding(context);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const pngSize = (file) => {
  const png = readFileSync(file);
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
};
const projects = () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const r = indexedDB.open("ig-layout");
        r.onsuccess = () => {
          const q = r.result.transaction("projects").objectStore("projects").getAll();
          q.onsuccess = () => resolve(q.result.map((p) => ({ name: p.name, type: p.type, ratio: p.ratio, slides: p.slideCount })));
        };
      }),
  );
async function toPrint() {
  await page.goto(new URL("booth?today=2026-06-15", URL_ARG).href);
  await openRoll(page);
  await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
}

await page.goto(new URL("booth?today=2026-06-15", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });

console.log("1. Save print as PNG");
const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Save photo/ }).click()]);
const file = path.join(OUT, "booth-print.png");
await dl.saveAs(file);
const [w, h] = pngSize(file);
check(dl.suggestedFilename().endsWith(".png") && w === 600 && h === 1800, `Print PNG: ${dl.suggestedFilename()} ${w}×${h}`);

console.log("2. Open in IG Layout");
for (const [kind, expect] of [
  ["Carousel", (p) => p.type === "post" && p.ratio === "4:5" && p.slides === 5],
  ["Story 9:16", (p) => p.type === "story" && p.slides === 1],
  ["Surprise me", (p) => p.type === "post" && p.slides >= 1],
]) {
  await page.getByRole("button", { name: /Open in IG Layout/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: new RegExp(kind) }).click();
  await page.waitForURL((u) => !u.pathname.includes("booth"), { timeout: 15000 });
  await page.locator("canvas").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, `booth-handoff-${kind.split(" ")[0].toLowerCase()}.png`) });
  check(!(await page.getByRole("button", { name: "Switch to Photobooth" }).isVisible().catch(() => false)), `${kind}: straight into the editor, not the home screen`);
  const list = await projects();
  const p = list.find((x) => x.name.startsWith("Photobooth") && expect(x));
  check(!!p, `${kind} → editor, saved project ${p ? `${p.type} ${p.ratio} ×${p.slides}` : JSON.stringify(list)}`);
  await toPrint();
}

console.log("3. The print as a photo, the theme's paper as the background (or not)");
const shape = () => page.evaluate(() => {
  const d = window.__igEditor?.getState().doc;
  return d ? { bg: d.background.kind, images: d.elements.filter((e) => e.type === "image").length } : null;
});
await page.getByRole("button", { name: /Open in IG Layout/ }).click();
await page.getByRole("dialog").getByRole("button", { name: /Post 4:5/ }).click();
await page.waitForURL((u) => !u.pathname.includes("booth"), { timeout: 15000 });
await page.waitForFunction(() => window.__igEditor?.getState().doc, null, { timeout: 15000 });
let sh = await shape();
check(sh?.bg === "texture" && sh.images >= 1, `with the background: paper as the slide's background, the print a photo (${JSON.stringify(sh)})`);
await toPrint();
await page.getByRole("button", { name: /Open in IG Layout/ }).click();
await page.getByText("With the theme's background").click();
await page.getByRole("dialog").getByRole("button", { name: /Post 4:5/ }).click();
await page.waitForURL((u) => !u.pathname.includes("booth"), { timeout: 15000 });
await page.waitForFunction(() => window.__igEditor?.getState().doc, null, { timeout: 15000 });
sh = await shape();
check(sh?.bg === "color" && sh.images >= 1, `without: plain background (${JSON.stringify(sh)})`);

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
