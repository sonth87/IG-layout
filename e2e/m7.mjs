import { chromium } from "playwright-core";
import path from "node:path";
import { skipTips, chromePath, FIXTURES as dir, OUT as out, URL_ARG } from "./lib.mjs";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m7-${n}.png`) });
let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, selected: s.selectedId };
  });
};
async function newProject(type, files, setup = async () => {}) {
  await page.getByRole("button", { name: "New project" }).click();
  if (type !== "Post") await page.getByRole("radio", { name: new RegExp(type) }).click();
  await setup();
  await page.locator('input[type="file"]').setInputFiles(files.map((f) => path.join(dir, f)));
  await page.getByRole("button", { name: "Skip" }).click();
  await page.locator("canvas").first().waitFor();
  await page.waitForTimeout(400);
}

await page.goto(url);

console.log("1. Post: canvas memory cap, keyboard shortcuts");
await newProject("Post", ["p3.jpg", "p4.jpg"], async () => {
  for (let i = 0; i < 15; i++) await page.getByLabel("More slides").click(); // 20 slides
});
const canvasMP = await page.evaluate(() => [...document.querySelectorAll(".konvajs-content canvas")].reduce((s, c) => s + c.width * c.height, 0) / 1e6);
check(canvasMP <= 3, `20 slides at 3× density: layers only cover the screen (${canvasMP.toFixed(1)} MP for 3 layers)`);
let st = await S();
const id = st.selected;
const x0 = st.doc.elements.find((e) => e.id === id).x;
await page.keyboard.press("ArrowRight");
await page.keyboard.press("Shift+ArrowRight");
st = await S();
check(st.doc.elements.find((e) => e.id === id).x === x0 + 55, "arrows nudge 5 / Shift 50");
await page.keyboard.press("Control+z");
await page.keyboard.press("Control+z");
st = await S();
check(st.doc.elements.find((e) => e.id === id).x === x0, "Ctrl+Z undoes both nudges");
await page.keyboard.press("Delete");
st = await S();
check(!st.doc.elements.some((e) => e.id === id), "Delete removes the selection");
await page.keyboard.press("Control+Shift+z");
await page.keyboard.press("Control+z");
st = await S();
check(st.doc.elements.some((e) => e.id === id), "redo + undo restore it");
await page.getByLabel("Back").click();

console.log("2. Post export: carousel + profile preview");
await newProject("Post", ["p3.jpg", "p4.jpg"], async () => {
  for (let i = 0; i < 3; i++) await page.getByLabel("Fewer slides").click(); // 2 slides
});
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("2 images · JPEG").waitFor();
check(await page.getByRole("tab", { name: "Carousel" }).isVisible(), "carousel tab");
check((await page.getByRole("dialog").getByText("1 / 2").count()) === 1, "carousel counter 1 / 2");
await shot(page, "1-carousel");
await page.getByRole("tab", { name: "Profile" }).click();
check((await page.getByRole("img", { name: /^Post \d/ }).count()) === 1, "profile shows the cover (first image) as one post");
await shot(page, "2-profile");
await page.getByLabel("Back to editor").click();
await page.getByLabel("Back").click();

console.log("3. Story export preview");
await newProject("Story", ["portrait.jpg", "p3.jpg"], () => page.getByLabel("Fewer frames").click());
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("2 images · JPEG · 1080 × 1920").waitFor();
const storyImg = page.locator("div.aspect-\\[9\\/16\\] > img");
const first = await storyImg.getAttribute("src");
await page.getByRole("button", { name: "Next frame" }).click();
check((await storyImg.getAttribute("src")) !== first, "tapping right shows the next story frame");
await shot(page, "3-story");
await page.getByLabel("Back to editor").click();
await page.getByLabel("Back").click();

console.log("4. Grid export: profile assembles the picture");
await page.getByRole("button", { name: "New project" }).click();
await page.getByRole("radio", { name: /Grid/ }).click();
await page.getByLabel("Fewer rows").click();
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "panorama.jpg"));
await page.getByRole("button", { name: /^Panorama/ }).first().click();
await page.getByRole("button", { name: "Use this layout" }).click();
await page.getByText("Grid · 3 × 2").waitFor();
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("6 images · JPEG · 1080 × 1440").waitFor();
const order = await page.evaluate(() => {
  const avg = (img) => {
    const c = document.createElement("canvas");
    c.width = c.height = 8;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, 8, 8);
    const d = ctx.getImageData(0, 0, 8, 8).data;
    let r = 0;
    for (let i = 0; i < d.length; i += 4) r += d[i];
    return r / 64;
  };
  return [...document.querySelectorAll('img[alt^="Post "]')].map(avg);
});
check(order.length === 6, "6 tiles on the profile preview");
// Panorama gets redder to the right: each profile row must go left → right.
check(order[0] < order[1] && order[1] < order[2] && order[3] < order[4] && order[4] < order[5], "profile rows read left → right (picture assembled)");
await shot(page, "4-grid-profile");
await page.getByLabel("Back to editor").click();
await page.getByLabel("Back").click();

console.log("5. Help screen (EN + VI)");
await page.getByLabel("How to use").click();
check(await page.getByText("Posting a grid").isVisible(), "help sections");
await shot(page, "5-help");
await page.getByLabel("Back").click();
await page.getByLabel("Settings and language").click();
await page.getByRole("radio", { name: "Tiếng Việt" }).click();
await page.getByLabel("Quay lại").click();
await page.getByLabel("Hướng dẫn").click();
check(await page.getByText("Đăng lưới").isVisible(), "help in Vietnamese");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
