// Bottom sheets and selection (owner 2026-10-20): tapping outside closes an element's sheet
// for good (it used to come back on the next tap of the element); one photo added to an
// empty project is not locked.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const S = () =>
  page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, draft: !!s.draft, selected: s.selectedId };
  });

await page.goto(URL_ARG);
await newProject(page);
for (let i = 0; i < 3; i++) await page.getByLabel("Fewer slides").click();
await page.locator('input[type="file"]').setInputFiles([path.join(FIXTURES, "p3.jpg")]);
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("One photo in an empty project");
let st = await S();
const photo = st.doc.elements.find((e) => e.type === "image");
check(!photo.locked, "the panorama photo is not locked");

const box = await page.locator("[data-stage-frame]").boundingBox();
const k = box.width / (1080 * st.doc.slideCount);
const center = [box.x + (photo.x + photo.width / 2) * k, box.y + (photo.y + photo.height / 2) * k];
await page.touchscreen.tap(...center);
await page.waitForTimeout(200);
check((await S()).selected === photo.id, "tap selects it");

console.log("Tap outside closes the sheet; it does not come back");
await page.getByRole("button", { name: "Style", exact: true }).click();
await page.waitForTimeout(300);
const sheetOpen = () => page.evaluate(() => [...document.querySelectorAll("section")].some((s) => /Style/.test(s.getAttribute("aria-label") ?? "")));
check(await sheetOpen(), "Style sheet open");
// Empty canvas area just under the photo (the canvas moved up when the sheet opened).
const now = await page.locator("[data-stage-frame]").boundingBox();
await page.touchscreen.tap(now.x + now.width * 0.9, now.y + now.height + 70);
await page.waitForTimeout(300);
st = await S();
check(st.selected === null && !st.draft && !(await sheetOpen()), "tap outside: deselected, sheet closed, draft kept");
const again = await page.locator("[data-stage-frame]").boundingBox();
await page.touchscreen.tap(again.x + again.width / 2, again.y + again.height / 2);
await page.waitForTimeout(400);
st = await S();
check(st.selected === photo.id && !(await sheetOpen()), "tap the photo again: selected, the Style sheet stays closed");
await page.screenshot({ path: path.join(OUT, "sheets-reselect.png") });

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures ? 1 : 0);
