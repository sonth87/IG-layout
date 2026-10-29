// Booth decorations (D-161 step 2): Decorate → Decor: every piece draws; whole print vs
// each photo (synced) draws differently; over / behind; 🎲 redraws one piece; taking it off
// gives the print back as it was; kept after a reload and in the saved file.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, OUT, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const look = async () => {
  await page.waitForTimeout(350);
  return page.locator("canvas").first().evaluate((c) => c.toDataURL("image/jpeg", 0.6));
};
const kinds = page.getByRole("group", { name: "Decor" });

await page.goto(new URL("booth", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Decor" }).click();
const plain = await look();

console.log("1. Every piece draws");
const seen = new Set();
for (const k of ["Vine", "Garland", "Ribbon", "Lights", "Neon", "Fireworks", "Sparklers", "Stars", "Moon", "Confetti"]) {
  await kinds.getByRole("button", { name: k }).click();
  const v = await look();
  if (v !== plain) seen.add(k);
  await kinds.getByRole("button", { name: k }).click();
}
check(seen.size === 10, `10 pieces change the print (${[...seen].join(", ")})`);
check((await look()) === plain, "taking them off gives the print back");

console.log("2. Scope, layer, shuffle");
await kinds.getByRole("button", { name: "Vine" }).click();
const whole = await look();
await page.locator("[data-decor='vine']").getByRole("radio", { name: "Each photo" }).click();
const each = await look();
check(whole !== each, "whole print vs each photo draw differently");
await page.locator("[data-decor='vine']").getByRole("radio", { name: "Behind" }).click();
check((await look()) !== each, "behind the photos draws differently");
await page.locator("[data-decor='vine']").getByRole("radio", { name: "Over" }).click();
await page.locator("[data-decor='vine']").getByRole("button", { name: "Shuffle" }).click();
check((await look()) !== each, "🎲 redraws the vine");
await kinds.getByRole("button", { name: "Stars" }).click();
const final = await look();
await page.screenshot({ path: path.join(OUT, "booth-decor.png") });

console.log("3. Kept");
await page.getByRole("button", { name: "Done" }).click();
await page.waitForTimeout(900);
await page.reload();
await page.getByRole("button", { name: /Open roll from/ }).first().click();
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Decor" }).click();
check((await look()) === final, "same decorations after a reload");
check((await kinds.getByRole("button", { name: "Vine" }).getAttribute("aria-pressed")) === "true" && (await page.locator("[data-decor]").count()) === 2, "vine + stars listed");

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
