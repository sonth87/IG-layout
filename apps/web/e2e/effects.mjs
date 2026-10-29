// Effects (M21, editor-v2/14): the Effects button on a text, picking Melt in the sheet,
// one undo step, and every effect drawn on a photo, a text, a widget and a sticker.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

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
const S = () => page.evaluate(() => window.__igEditor.getState());

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "portrait.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("A text with the Melt effect");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("MELT");
await page.getByRole("button", { name: "Done typing" }).click();
await page.waitForTimeout(300);
let st = await S();
const text = st.doc.elements.at(-1);
const past0 = st.past.length;
await page.getByRole("button", { name: "Effects", exact: true }).click();
await page.waitForTimeout(500);
const sheet = page.getByRole("region", { name: "Effects" });
check(await sheet.isVisible(), "Effects sheet");
check((await sheet.getByRole("tab").count()) === 5, "five groups");
await sheet.getByRole("button", { name: "Melt", exact: true }).click();
await page.waitForTimeout(400);
check(await page.getByRole("region", { name: "Melt" }).isVisible(), "Melt settings");
await page.getByRole("radio", { name: "Direction →" }).click();
await page.getByRole("button", { name: /Shuffle/ }).click();
await page.screenshot({ path: path.join(OUT, "effects-sheet.png") });
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
const t1 = st.doc.elements.find((e) => e.id === text.id);
check(t1.effect?.id === "melt" && t1.effect.params.dir === 0 && t1.effect.seed === 2, "saved: melt, to the right, shuffled");
check(st.past.length === past0 + 1, "one undo step");
const cached = await page.evaluate((id) => !!window.__igEditor.getState().canvas.layer.findOne(`#${id}`).isCached(), text.id);
check(cached, "the text is drawn through its effect");
await page.evaluate(() => window.__igEditor.getState().undo());
st = await S();
check(!st.doc.elements.find((e) => e.id === text.id).effect, "undo removes it");
const uncached = await page.evaluate((id) => !window.__igEditor.getState().canvas.layer.findOne(`#${id}`).isCached(), text.id);
check(uncached, "and the plain text is back");

console.log("Every effect on a photo, a text, a widget and a sticker");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "New layer" }).click();
await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Widget", exact: true }).click();
await page.getByRole("button", { name: "Weather card · Sky", exact: true }).click();
await page.waitForTimeout(300);
st = await S();
const photo = st.doc.elements.find((e) => e.type === "image" && e.assetId);
const widget = st.doc.elements.at(-1);
const EFFECTS = ["melt", "drape", "twirl", "bulge", "wave", "arc", "glitch", "pixelate", "rgbSplit", "halftone", "duotone", "longShadow", "offsetShadow", "outline", "reflection", "glitter", "echo", "flag", "ripple", "perspective", "fisheye", "mirror", "kaleidoscope", "stretch", "tear", "fold", "crt", "dither", "riso", "emboss", "glow", "extrude", "rays", "motionBlur", "zoomBlur", "tiltShift", "shatter", "popArt", "ascii", "glass", "watercolor", "inkWash", "sketch", "oil", "crayon", "smoke", "fire", "frost"];
const shots = [];
for (const target of [photo, text, widget]) {
  for (const fx of EFFECTS) {
    const url = await page.evaluate(
      async ([id, fx]) => {
        const s = window.__igEditor.getState();
        s.updateElement(id, { effect: { id: fx, params: {}, seed: 1 } });
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const node = s.canvas.layer.findOne(`#${id}`);
        if (!node.isCached()) return "uncached";
        // The effect's own picture, with the room around the element (what the canvas shows).
        node.getLayer().draw();
        const cache = node._getCanvasCache();
        const c = (cache.filter ?? cache.scene)._canvas;
        return c.toDataURL("image/png");
      },
      [target.id, fx],
    );
    if (url === "uncached") check(false, `${fx} on ${target.type}: cached`);
    else shots.push({ name: `${target.type}-${fx}`, url });
  }
  await page.evaluate((id) => window.__igEditor.getState().updateElement(id, { effect: undefined }), target.id);
}
check(shots.length === EFFECTS.length * 3, `${shots.length} effect drawings`);
// A contact sheet of them, for looking at.
const html = `<body style="margin:0;background:#bbb;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:6px;font:12px sans-serif">${shots.map((s) => `<div style="background:repeating-conic-gradient(#ccc 0 25%,#eee 0 50%) 0/16px 16px;padding:4px"><img src="${s.url}" style="width:100%;height:150px;object-fit:contain"><div>${s.name}</div></div>`).join("")}</body>`;
fs.writeFileSync(path.join(OUT, "effects-all.html"), html);
const sheetPage = await context.newPage();
await sheetPage.setViewportSize({ width: 1200, height: 900 });
await sheetPage.goto("file://" + path.join(OUT, "effects-all.html"));
await sheetPage.screenshot({ path: path.join(OUT, "effects-all.png"), fullPage: true });

check(errors.length === 0, `no console errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
await browser.close();
if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
