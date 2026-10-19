// Owner feedback after D-102: small handles, side handles hidden on short edges,
// Lucide rotate icon, one scroll direction per strip / panel.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const anchors = () =>
  page.evaluate(() => {
    const tr = window.__igEditor.getState().canvas.layer.getStage().findOne("Transformer");
    const out = {};
    for (const a of tr.children) if (a.hasName("_anchor")) out[a.name().split(" ")[0]] = { v: a.isVisible(), w: a.width(), h: a.height(), ox: a.offsetX() - a.width() / 2, oy: a.offsetY() - a.height() / 2 };
    return out;
  });

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("Handles");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Shapes", exact: true }).click();
await page.getByRole("button", { name: "Star", exact: true }).click();
const size = async (w) => {
  await page.evaluate((w) => {
    const s = window.__igEditor.getState();
    const el = s.doc.elements.at(-1);
    s.updateElement(el.id, { x: 100, y: 100, width: w, height: w });
    s.select(el.id);
  }, w);
  await page.waitForTimeout(300);
  return anchors();
};
let a = await size(1080);
check(a["top-left"].v && a["top-left"].w <= 14, `small corner handles (${a["top-left"].w} px)`);
check(a["middle-left"].v && a["top-center"].v, "a big element keeps its side handles");
await page.screenshot({ path: path.join(OUT, "m20a-handles.png") });

// A small element: side handles move just outside the short edges, clear of the corners (owner, 2026-10-20).
a = await size(500);
check(a["middle-left"].v && a["middle-right"].v, "short edges: left / right handles still there");
check(a["middle-left"].ox > 0 && a["middle-right"].ox < 0, "moved outside the box");
check(!a["top-center"].v && !a["bottom-center"].v, "top / bottom ones hidden (the turn handle is below)");
check(a["top-left"].v && a["bottom-right"].v, "corners kept");
await page.screenshot({ path: path.join(OUT, "m20a-small.png"), clip: { x: 0, y: 60, width: 390, height: 360 } });

console.log("Scroll directions");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.waitForTimeout(300);
if (await page.getByRole("button", { name: "Done typing" }).count()) await page.getByRole("button", { name: "Done typing" }).click();
await page.waitForTimeout(300);
const tools = await page.getByRole("region", { name: "Tools" }).evaluate((r) => {
  const strip = [...r.querySelectorAll("*")].find((e) => getComputedStyle(e).overflowX === "auto");
  return strip ? { y: getComputedStyle(strip).overflowY, ty: strip.scrollHeight - strip.clientHeight } : null;
});
check(tools && tools.y === "hidden", `text toolbar scrolls sideways only (${JSON.stringify(tools)})`);
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Project menu" }).click();
await page.getByRole("menu", { name: "Project menu" }).getByRole("menuitem", { name: "Background", exact: true }).click();
const bg = page.getByRole("region", { name: "Background" });
await bg.waitFor();
const bad = await bg.evaluate((r) =>
  [r, ...r.querySelectorAll("*")]
    .filter((e) => {
      const c = getComputedStyle(e);
      const sx = (c.overflowX === "auto" || c.overflowX === "scroll") && e.scrollWidth > e.clientWidth + 1;
      const sy = (c.overflowY === "auto" || c.overflowY === "scroll") && e.scrollHeight > e.clientHeight + 1;
      return sx && sy;
    })
    .map((e) => e.className),
);
const xpanel = await bg.evaluate((r) => [...r.querySelectorAll("*")].filter((e) => getComputedStyle(e).overflowY === "auto").map((e) => getComputedStyle(e).overflowX));
check(bad.length === 0 && xpanel.every((x) => x === "hidden"), `background sheet: panels scroll up/down only (${JSON.stringify({ bad, xpanel })})`);

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
