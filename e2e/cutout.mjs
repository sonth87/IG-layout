// Cut-out letters (D-141): style, shuffle, cut by word, wave / curve, tap a letter, template.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, openTemplate, OUT as out, skipTips, URL_ARG } from "./lib.mjs";

const url = URL_ARG;
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
  await page.waitForTimeout(200);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.draft ?? s.doc, saved: s.doc, past: s.past.length, selected: s.selectedId };
  });
};
const text = (st) => st.doc.elements.filter((e) => e.type === "text").at(-1);
async function toScreen(x, y) {
  const box = await page.locator("[data-stage-frame]").boundingBox();
  const k = box.width / (1080 * (await S()).doc.slideCount);
  return [box.x + x * k, box.y + y * k];
}

await page.goto(url);
await newProject(page);
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p4.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("4:5 · 2 slides").waitFor();
await page.getByRole("button", { name: "Done" }).click();

console.log("1. Text → Cut-out sheet → style");
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Happy birthday");
await page.getByRole("button", { name: "Done typing" }).click();
let st = await S();
const plainHeight = text(st).height;
const past0 = st.past;
await page.getByRole("button", { name: "Cut-out", exact: true }).click();
const sheet = page.getByRole("region", { name: "Cut-out letters" });
await sheet.waitFor();
check((await sheet.getByRole("radio").count()) >= 21, `style list (${(await sheet.getByRole("radio").count()) - 1} styles)`);
await sheet.getByRole("radio", { name: "Glossy magazine" }).click();
st = await S();
check(text(st).cutout?.style === "magazine" && st.past === past0, "style shows at once (draft, no history yet)");

console.log("2. Shuffle, cut by word, wave, curve");
const seed0 = text(st).cutout.seed;
await sheet.getByRole("button", { name: "Shuffle" }).click();
st = await S();
check(text(st).cutout.seed !== seed0, "Shuffle changes the seed");
await sheet.getByRole("radio", { name: "Word", exact: true }).click();
st = await S();
check(text(st).cutout.by === "word", "cut by word");
const sliders = sheet.getByRole("slider");
await sliders.nth(1).fill("90");
await sliders.nth(2).fill("70");
st = await S();
await page.screenshot({ path: path.join(out, "cutout-sheet.png") });
check(Math.abs(text(st).cutout.wave - 0.9) < 0.01 && Math.abs(text(st).cutout.curve - 0.7) < 0.01, "wave and curve set");
await sheet.getByRole("radio", { name: "Letter", exact: true }).click();
await page.getByRole("button", { name: "Apply", exact: true }).click();
await page.waitForTimeout(500);
st = await S();
const t1 = text(st);
check(st.past === past0 + 1 && t1.cutout?.style === "magazine", "✓ = one history step");
check(Math.abs(t1.height - plainHeight) > 1, `height follows the scraps (${Math.round(plainHeight)} → ${Math.round(t1.height)})`);

console.log("3. Tap a letter: only that letter changes");
const piece = await page.evaluate((id) => {
  const l = window.__igCutout.get(id);
  return l?.pieces[2] && { cx: l.pieces[2].cx, cy: l.pieces[2].cy, index: l.pieces[2].index };
}, t1.id);
check(!!piece, "letters laid out");
if (piece) {
  // Element is not turned: piece centre + element corner.
  await page.mouse.click(...(await toScreen(t1.x + piece.cx, t1.y + piece.cy)));
  st = await S();
  const t2 = text(st);
  check(t2.cutout.rolls?.[piece.index] === 1 && Object.keys(t2.cutout.rolls).length === 1, "that letter reshuffled (rolls)");
  const typing = await page.evaluate(() => window.__igEditor.getState().editingTextId);
  check(!typing, "tapping a letter does not start typing");
}
await page.screenshot({ path: path.join(out, "cutout-canvas.png") });

console.log("3b. Resizing sizes the scraps with the box");
{
  const before = text(await S());
  const pos = await page.evaluate(() => {
    const st = window.__igEditor.getState().canvas.layer.getStage();
    const a = st.findOne("Transformer").findOne(".middle-right");
    const r = a.getClientRect();
    const box = st.container().getBoundingClientRect();
    return { x: box.left + r.x + r.width / 2, y: box.top + r.y + r.height / 2 };
  });
  await page.mouse.move(pos.x, pos.y);
  await page.mouse.down();
  await page.mouse.move(pos.x + 30, pos.y, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const after = text(await S());
  check(after.fontSize > before.fontSize * 1.05 && after.width > before.width, `side handle: bigger letters (${Math.round(before.fontSize)} → ${Math.round(after.fontSize)})`);
}

console.log("4. Plain text again");
await page.getByRole("button", { name: "Cut-out", exact: true }).click();
await sheet.getByRole("radio", { name: "Plain text" }).click();
await page.getByRole("button", { name: "Apply", exact: true }).click();
st = await S();
check(!text(st).cutout, "back to plain text");

console.log("5. Template with cut-out letters");
await page.goto(url);
await page.getByRole("tab", { name: "Home" }).click();
await openTemplate(page, "Cut-out birthday");
await page.getByRole("button", { name: "Use template" }).click();
await page.waitForFunction(() => window.__igEditor?.getState().doc);
st = await S();
check(st.doc.elements.some((e) => e.type === "text" && e.cutout?.style === "magazine"), "template places one cut-out text element");

console.log(`console errors: ${JSON.stringify(errors)}`);
check(errors.length === 0, "no console errors");
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures ? 1 : 0);
