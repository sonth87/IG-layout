// Booth lobby scenes (D-164): six scenes (cinema, Christmas, Tết, Halloween, cyberpunk, glitch);
// a swipe left / right moves to the next / previous one (a short drag springs back, and is no
// tap); the squares in the corner jump to any; the scene is remembered after a reload; picking
// one starts new rolls in its print theme; ← → on a computer. Screenshots of every scene on a
// phone and a computer.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, OUT, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath() });
const errors = [];
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const IDS = ["cinema", "noel", "tet", "halloween", "cyber", "glitch"];

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const lobby = () => page.locator("[data-lobby]").getAttribute("data-lobby");
/** A finger drag across the screen (touch events via CDP). */
async function swipe(dx, steps = 8) {
  const cdp = await page.context().newCDPSession(page);
  const y = 730;
  const x0 = dx < 0 ? 330 : 60;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + (dx * i) / steps, y }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(600);
}

await page.goto(new URL("booth", URL_ARG).href);
await page.locator("[data-lobby]").waitFor();

console.log("1. Scenes, squares");
check((await lobby()) === "cinema", "starts on the cinema");
const squares = page.getByRole("radiogroup", { name: "Lobby scene" }).getByRole("radio");
check((await squares.count()) === 6, "6 squares in the corner");
check((await page.getByRole("button", { name: "Shoot solo" }).count()) === 1, "only the shown scene's ticket can be reached");
for (const id of IDS) {
  await squares.nth(IDS.indexOf(id)).click();
  await page.waitForTimeout(900);
  check((await lobby()) === id && (await squares.nth(IDS.indexOf(id)).getAttribute("aria-checked")) === "true", `square → ${id}`);
  await page.screenshot({ path: path.join(OUT, `lobby-${id}.png`) });
}

console.log("2. Swipe");
await squares.nth(1).click();
await page.waitForTimeout(500);
await swipe(-220);
check((await lobby()) === "tet", `swipe left → next (${await lobby()})`);
await swipe(220);
check((await lobby()) === "noel", `swipe right → previous (${await lobby()})`);
await swipe(220);
await swipe(220);
check((await lobby()) === "glitch", `round the end → glitch (${await lobby()})`);
await swipe(-80, 4);
check((await lobby()) === "glitch", "a drag under 25% springs back");
const shift = await page.locator("[data-lobby]").evaluate((el) => el.style.getPropertyValue("--drag"));
check(shift === "0px", `…all the way (${shift})`);

console.log("3. Remembered, print theme");
await squares.nth(3).click();
await page.waitForTimeout(500);
await page.reload();
await page.locator("[data-lobby]").waitFor();
check((await lobby()) === "halloween", "Halloween again after a reload");
const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem("ig-layout:booth") ?? "{}"));
check(prefs.theme === "halloween", `new rolls start in the Halloween print theme (${prefs.theme})`);
await page.getByRole("button", { name: "Shoot solo" }).click();
await page.getByRole("heading", { name: "Pick your frame" }).waitFor();
check((await page.locator("canvas[data-mood='fireflies']").count()) === 1, "frame screen in the Halloween mood");
await ctx.close();

console.log("4. Computer");
const desk = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const dp = await desk.newPage();
dp.on("pageerror", (e) => errors.push(String(e)));
await dp.goto(new URL("booth", URL_ARG).href);
await dp.locator("[data-lobby]").waitFor();
const before = await dp.locator("[data-lobby]").getAttribute("data-lobby");
await dp.keyboard.press("ArrowRight");
await dp.waitForTimeout(700);
const after = await dp.locator("[data-lobby]").getAttribute("data-lobby");
check(IDS.indexOf(after) === (IDS.indexOf(before) + 1) % 6, `→ goes to the next (${before} → ${after})`);
await dp.keyboard.press("ArrowLeft");
await dp.waitForTimeout(700);
check((await dp.locator("[data-lobby]").getAttribute("data-lobby")) === before, "← goes back");
for (const id of IDS) {
  await dp.getByRole("radio", { name: new RegExp(`^${{ cinema: "Cinema", noel: "Christmas", tet: "Tết", halloween: "Halloween", cyber: "Cyberpunk", glitch: "Glitch" }[id]}$`) }).click();
  await dp.waitForTimeout(900);
  await dp.screenshot({ path: path.join(OUT, `lobby-desk-${id}.png`) });
}
await desk.close();

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
