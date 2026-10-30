// Booth stickers (2026-10-30): Decorate → Sticker: groups of props / occasions; tap one → on
// the print, picked; its words (a sign: "BOSS" → own words), colour, drag / resize / turn,
// to the back, remove; kept after a reload and in the saved file Also: empty cells beyond the shots are plain (no grey figure), the
// 3 + title frame, and "Shoot now".
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, OUT, skipOnboarding, URL_ARG, openRoll } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath(), args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await skipOnboarding(context);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const look = async () => {
  await page.waitForTimeout(400);
  return page.locator("canvas").first().evaluate((c) => c.toDataURL("image/jpeg", 0.6));
};

await page.goto(new URL("booth", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Sticker" }).click();

console.log("1. Add a sign, write on it");
const before = await look();
await page.getByRole("tab", { name: "Bubbles & signs" }).click();
await page.getByRole("button", { name: "Sign on a stick" }).click();
const withSign = await look();
check(withSign !== before, "the sign is on the print");
await page.getByRole("textbox", { name: "Words" }).fill("Bé Na 3 tuổi");
check((await look()) !== withSign, "own words on it");
await page.getByRole("button", { name: "#3aa0ff" }).click();

console.log("2. Glasses: drag, resize, turn");
await page.getByRole("tab", { name: "Photo props" }).click();
await page.getByRole("button", { name: "Party shades" }).click();
const st = page.locator("[data-sticker='partyShades']");
const b = await st.boundingBox();
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
await page.mouse.down();
await page.mouse.move(b.x + b.width / 2 + 20, b.y + b.height / 2 + 40, { steps: 6 });
await page.mouse.up();
const b2 = await st.boundingBox();
check(Math.abs(b2.y - b.y - 40) < 6, `moved (${Math.round(b2.y - b.y)} px)`);
const sc = await st.locator("[data-scale]").boundingBox();
await page.mouse.move(sc.x + sc.width / 2, sc.y + sc.height / 2);
await page.mouse.down();
await page.mouse.move(sc.x + 40, sc.y + 20, { steps: 6 });
await page.mouse.up();
check((await st.boundingBox()).width > b2.width + 20, "resized from the corner");
await page.getByRole("button", { name: /To back/ }).click();
await page.screenshot({ path: path.join(OUT, "booth-sticker.png") });
const final = await look();

console.log("3. Kept");
await page.getByRole("button", { name: "Done" }).click();
await page.waitForTimeout(900);
await page.reload();
await openRoll(page);
await page.getByRole("button", { name: /Decorate/ }).click();
await page.getByRole("tab", { name: "Sticker" }).click();
await page.waitForTimeout(600);
check((await look()) === final, "same stickers after a reload");
check((await page.locator("[data-sticker]").count()) === 2, "2 stickers");

console.log("4. Empty cell, 3 + title, shoot now");
await page.getByRole("tab", { name: "Layout" }).click();
await page.getByRole("radio", { name: /6 minis/ }).click();
const ghost = await page.locator("canvas").first().evaluate((c) => {
  // Cell 6 of grid6 (x 610…1150, y 1000…1430 of 1200 × 1800): a plain panel, one colour.
  const g = c.getContext("2d");
  const k = c.width / 1200;
  const d = g.getImageData(700 * k, 1100 * k, 360 * k, 260 * k).data;
  let lo = 255, hi = 0;
  for (let i = 0; i < d.length; i += 4) {
    const v = (d[i] + d[i + 1] + d[i + 2]) / 3;
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return hi - lo;
});
check(ghost < 60, `an extra cell is a plain panel, no grey figure (spread ${Math.round(ghost)})`);
check((await page.getByRole("radio", { name: /3 \+ title/ }).count()) === 1 && (await page.getByRole("radio", { name: /Strip \+ title/ }).count()) === 1, "frames with a title cell");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: /New roll/ }).click();
await page.getByRole("button", { name: /Start shooting/ }).click();
await page.getByText("Shot 1 of 4").waitFor();
await page.locator("[data-countdown]").waitFor();
const t0 = Date.now();
const now = await page.getByRole("button", { name: /Shoot now/ }).boundingBox();
check(now && now.x + now.width <= 390, "the button is on screen");
await page.getByRole("button", { name: /Shoot now/ }).click({ timeout: 5000 });
await page.locator("img[data-shot='0']").waitFor({ timeout: 3000 });
check(Date.now() - t0 < 2500, `"Shoot now" takes it at once (${Date.now() - t0} ms)`);

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
