import { chromium } from "playwright-core";
import path from "node:path";
import { more, skipTips, chromePath, FIXTURES as dir, OUT as out, URL_ARG, newProject } from "./lib.mjs";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m6-${n}.png`) });
let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, past: s.past.length };
  });
};
/** Exported previews: name, size and average colour. */
async function exported() {
  return page.evaluate(() =>
    Promise.all(
      [...document.querySelectorAll("figure")].map(
        (fig) =>
          new Promise((res) => {
            const img = fig.querySelector("img");
            const go = () => {
              const c = document.createElement("canvas");
              c.width = 32;
              c.height = 32;
              const ctx = c.getContext("2d");
              ctx.drawImage(img, 0, 0, 32, 32);
              const d = ctx.getImageData(0, 0, 32, 32).data;
              let r = 0;
              for (let i = 0; i < d.length; i += 4) r += d[i];
              res({ name: fig.querySelector("figcaption").textContent, w: img.naturalWidth, h: img.naturalHeight, r: r / (d.length / 4) });
            };
            if (img.complete && img.naturalWidth) go();
            else img.onload = go;
          }),
      ),
    ),
  );
}

await page.goto(url);

console.log("1. Story project");
await newProject(page);
await page.getByRole("radio", { name: /Story/ }).click();
await page.getByLabel("Fewer frames").click();
await shot(page, "1-new-story");
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "portrait.jpg"), path.join(dir, "p3.jpg")]);
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("Story · 2 frames").waitFor();
let st = await S();
check(st.doc.type === "story" && st.doc.ratio === "9:16" && st.doc.slideCount === 2, "story 9:16, 2 frames");
check(st.doc.elements.length === 2 && st.doc.elements[1].x === 1080, "one photo per frame");
await page.getByRole("button", { name: "Done" }).click();
await shot(page, "2-story-editor");
await more(page, "Frames");
check(await page.getByRole("checkbox", { name: "Show areas covered by Instagram" }).isChecked(), "safe zone shown by default");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("2 images · JPEG · 1080 × 1920").waitFor();
let files = await exported();
check(files.length === 2 && /^story-.*_01\.jpg$/.test(files[0].name) && files.every((f) => f.w === 1080 && f.h === 1920), "story_01/02 at 1080 × 1920");
await page.getByLabel("Back to editor").click();
await page.getByLabel("Back").click();

console.log("2. Grid project 3 × 2 with gap compensation");
await newProject(page);
await page.getByRole("radio", { name: /Grid/ }).click();
await page.getByLabel("Fewer rows").click();
check(await page.getByText("6 posts on your profile").isVisible(), "6 posts");
await shot(page, "3-new-grid");
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "panorama.jpg"));
await page.getByText("Choose a layout").waitFor();
const groups = await page.locator("nav button").allTextContents();
check(!groups.includes("Seamless") && !groups.includes("Grid"), `only grid-suitable groups (${groups.join(", ")})`);
await page.getByRole("button", { name: /^Panorama/ }).first().click();
await page.getByRole("button", { name: "Use this layout" }).click();
await page.getByText("Grid · 3 × 2").waitFor();
st = await S();
check(st.doc.type === "grid" && st.doc.slideCount === 6 && st.doc.grid.gapCompensation, "grid 3 × 2, gap on");
const bg = st.doc.elements[0];
check(bg.width === 3 * 1080 + 2 * 12 && bg.height === 2 * 1440 + 12, `picture spans the grid incl. gaps (${bg.width} × ${bg.height})`);
await page.waitForTimeout(400);
await shot(page, "4-grid-editor");

console.log("3. Export order: _01 = bottom-right tile");
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("6 images · JPEG · 1080 × 1440").waitFor();
files = await exported();
check(files.every((f, i) => new RegExp(`^grid-.*_0${i + 1}\\.jpg$`).test(f.name)), `files …_01 … _06 named after the project (${files[0].name})`);
check(files.every((f) => f.w === 1080 && f.h === 1440), `1080 × 1440 each (${files.map((f) => f.w + "×" + f.h).join(" ")})`);
// The panorama gets redder to the right: _01 (bottom-right) is reddest, _03 (bottom-left) least.
check(files[0].r > files[1].r && files[1].r > files[2].r, `bottom row right→left (r: ${files.slice(0, 3).map((f) => Math.round(f.r)).join(" > ")})`);
check(Math.abs(files[0].r - files[3].r) < 25, "_04 is the top-right tile (same column as _01)");
await shot(page, "5-grid-export");
await page.getByLabel("Back to editor").click();

console.log("4. Rows and gap");
await more(page, "Grid");
await page.getByRole("button", { name: "More rows" }).click();
st = await S();
check(st.doc.slideCount === 9 && st.doc.grid.rows === 3, "3 rows → 9 posts");
await page.getByRole("checkbox", { name: /Compensate profile gaps/ }).uncheck();
st = await S();
check(!st.doc.grid.gapCompensation, "gap compensation off");
await page.getByLabel("Undo").isEnabled();
await page.getByRole("button", { name: "Done" }).click();

console.log("5. Projects list");
await page.waitForTimeout(1200);
await page.getByLabel("Back").click();
const visible = (re) => page.getByText(re).waitFor({ timeout: 5000 }).then(() => true, () => false);
check(await visible(/3 × 3 · 9 posts/), "grid project meta");
check(await visible(/9:16 · 2 frames/), "story project meta");
await shot(page, "6-projects");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
