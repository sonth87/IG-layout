import { chromium } from "playwright-core";
import path from "node:path";
import { skipTips, chromePath, FIXTURES, URL_ARG } from "./lib.mjs";
const url = URL_ARG;
const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url);
await page.getByText("No projects yet").waitFor();
await page.evaluate(() => navigator.serviceWorker.ready);
// The editor is loaded in the background (idle) after the home screen: give it time.
await page.waitForTimeout(4000);
const cached = await page.evaluate(async () => {
  const c = await caches.open("ig-layout-v1");
  return (await c.keys()).map((r) => new URL(r.url).pathname);
});
console.log("cached entries:", cached.length, cached.filter((p) => p.includes("_next")).length, "from /_next");
await context.setOffline(true);
await page.reload();
await page.getByText("No projects yet").waitFor({ timeout: 5000 });
await page.getByRole("button", { name: "New project" }).click();
await page.getByText("Choose photos").waitFor({ timeout: 5000 });
// The editor (loaded lazily, M11) must open offline too, without ever having been opened.
await page.locator('input[type="file"]').setInputFiles([path.join(FIXTURES, "p3.jpg")]);
await page.getByRole("button", { name: "Skip" }).click();
await page.locator("[data-stage-frame]").waitFor({ timeout: 8000 });
await page.waitForTimeout(500);
const drawn = await page.evaluate(() => !!window.__igEditor.getState().canvas);
if (!drawn) errors.push("editor canvas missing offline");
console.log("first-visit offline: projects + new screen + editor OK; errors:", errors);
await browser.close();
if (errors.length) process.exitCode = 1;
