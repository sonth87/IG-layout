// Booth themes (D-161 step 3): themes in groups; picking one applies the whole look — its
// arrangement + cell shape, its decorations, its filter — and the booth's mood (backdrop,
// drifting bits); the theme picked before shooting is the one a new roll starts in.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, OUT, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath(), args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};

await page.goto(new URL("booth?today=2026-06-15", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Theme" }).click();

console.log("1. Groups");
check((await page.locator("[data-theme-id]").count()) >= 18, `${await page.locator("[data-theme-id]").count()} themes`);
check((await page.getByText("Forest", { exact: true }).count()) === 1 && (await page.getByText("Seasons", { exact: true }).count()) === 1, "in groups");

console.log("2. A theme is the whole look");
await page.locator("[data-theme-id='forest']").click();
await page.getByRole("tab", { name: "Layout" }).click();
check((await page.getByRole("radio", { name: "Scattered" }).getAttribute("aria-checked")) === "true", "Woodland → scattered");
check((await page.getByRole("radio", { name: "Rounded" }).getAttribute("aria-checked")) === "true", "… rounded cells");
await page.getByRole("tab", { name: "Decor" }).click();
check((await page.locator("[data-decor='vine']").count()) === 1 && (await page.locator("[data-decor='garland']").count()) === 1, "… vine + garland");
await page.getByRole("tab", { name: "Filter" }).click();
check((await page.getByRole("radio", { name: "Verde 400" }).getAttribute("aria-checked")) === "true", "… Verde 400 filter");
check((await page.locator("[data-mood='leaves']").count()) === 1, "… leaves drifting in the booth");
await page.screenshot({ path: path.join(OUT, "booth-theme-forest.png") });
await page.getByRole("tab", { name: "Theme" }).click();
await page.locator("[data-theme-id='xmas']").click();
check((await page.locator("[data-mood='snow']").count()) === 1, "Christmas → snow");

console.log("3. Theme before shooting");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: /New roll/ }).click();
await page.getByRole("radiogroup", { name: "Theme" }).locator("[data-theme-id='fireworks']").click();
check((await page.locator("[data-mood='sparks']").count()) === 1, "picking Fireworks sets the shooting screen's mood");
await page.screenshot({ path: path.join(OUT, "booth-theme-setup.png") });

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
