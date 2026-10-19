// iPhone Safari's own pinch (pinch in = show every tab) must not take a pinch made in the
// editor (owner, 2026-10-19): Safari's gesture events and any two-finger move are
// cancelled in the editor; one-finger gestures and the home screen are untouched.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await skipTips(context);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: i + 1 })) });
// Records whether the last touchmove reached the window already cancelled.
await page.addInitScript(() => {
  window.__moves = [];
  window.addEventListener("touchmove", (e) => window.__moves.push({ n: e.touches.length, prevented: e.defaultPrevented }), { passive: true });
});
// gesturestart is cancelled everywhere already (page zoom off, D-67); the pinch going on
// (gesturechange) is what the editor adds.
const gesture = () =>
  page.evaluate(() => {
    const e = new Event("gesturechange", { cancelable: true, bubbles: true });
    document.body.dispatchEvent(e);
    return e.defaultPrevented;
  });

await page.goto(URL_ARG);
console.log("Home screen: nothing cancelled");
check(!(await gesture()), "gesturechange not cancelled outside the editor");

await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
await page.evaluate(() => window.__igEditor.getState().select(null));

console.log("Editor");
check(await gesture(), "Safari's gesturechange is cancelled");
// Two fingers on the bottom toolbar (outside the canvas).
const bar = await page.getByRole("region", { name: "Tools" }).boundingBox();
const y = bar.y + bar.height / 2;
await page.evaluate(() => (window.__moves = []));
await touch("touchStart", [{ x: 120, y }, { x: 200, y }]);
for (let i = 1; i <= 4; i++) await touch("touchMove", [{ x: 120 + i * 8, y }, { x: 200 - i * 8, y }]);
await touch("touchEnd", []);
let moves = await page.evaluate(() => window.__moves);
check(moves.length > 0 && moves.filter((m) => m.n >= 2).every((m) => m.prevented), "two fingers on the toolbar: the browser doesn't get the pinch");
// One finger: untouched (the page / sheets can scroll).
await page.evaluate(() => (window.__moves = []));
await touch("touchStart", [{ x: 150, y }]);
for (let i = 1; i <= 4; i++) await touch("touchMove", [{ x: 150 + i * 10, y }]);
await touch("touchEnd", []);
moves = await page.evaluate(() => window.__moves);
check(moves.length > 0 && moves.every((m) => !m.prevented), "one finger on the toolbar: not cancelled");

console.log("Back home: listeners gone");
await page.getByRole("button", { name: "Back", exact: true }).click();
await page.waitForTimeout(500);
check(!(await gesture()), "gesturechange not cancelled after leaving the editor");

console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`);
if (failures) process.exitCode = 1;
await browser.close();
