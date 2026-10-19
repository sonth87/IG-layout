// Colour picker (owner, 2026-10-20): one swatch opens a panel (Solid / Gradient, Custom,
// Saved, Default); a gradient on a shape; the eyedropper with its magnifier picks from the
// canvas while sheets step aside; a widget's card colour and accent set directly.
import { chromium } from "playwright-core";
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
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => window.__igEditor.getState());
const panel = page.getByRole("dialog", { name: "Colour" });

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("A shape with a gradient");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Shapes", exact: true }).click();
await page.getByRole("button", { name: "Heart", exact: true }).click();
await page.waitForTimeout(300);
let st = await S();
const heart = st.doc.elements.at(-1);
await page.getByRole("button", { name: "Color", exact: true }).click();
const sheet = page.getByRole("region", { name: "Color" });
check((await sheet.getByRole("button", { name: "Color" }).count()) === 1, "one colour row in the sheet");
await page.screenshot({ path: path.join(OUT, "colors-row.png") });
await sheet.getByRole("button", { name: "Color" }).click();
check(await panel.isVisible(), "the colour panel opens");
await panel.getByRole("tab", { name: "Gradient" }).click();
check(await panel.getByRole("button", { name: "Custom gradient" }).isVisible(), "Gradient tab: Custom gradient");
check(await panel.getByRole("region", { name: "Defaults" }).isVisible(), "Defaults (Saved shows once something is saved)");
const g = "linear-gradient(135deg, #f6d365, #fda085)";
await panel.getByRole("button", { name: g }).click();
await page.screenshot({ path: path.join(OUT, "colors-gradient.png") });
await panel.getByRole("button", { name: "Custom gradient" }).click();
check(await panel.getByRole("region", { name: "Stops" }).isVisible() && (await panel.getByRole("region", { name: "Angle" }).isVisible()), "gradient screen: Stops, Angle");
await panel.getByRole("button", { name: "Conic" }).click();
await page.screenshot({ path: path.join(OUT, "colors-gradient-edit.png") });
await panel.getByRole("button", { name: "Linear" }).click();
await panel.getByRole("button", { name: "Back" }).click();
await panel.getByRole("button", { name: "Close" }).click();
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
check(/^linear-gradient\(135deg, #f6d365 0%, #fda085 100%\)$/.test(st.doc.elements.find((e) => e.id === heart.id).fill), `the heart is filled with the gradient (${st.doc.elements.find((e) => e.id === heart.id).fill})`);

console.log("Eyedropper");
await page.getByRole("button", { name: "Color", exact: true }).click();
await sheet.getByRole("button", { name: "Color" }).click();
await panel.getByRole("tab", { name: "Solid" }).click();
await panel.getByRole("button", { name: "Custom colour" }).click();
await panel.getByRole("button", { name: "Pick a colour from the canvas" }).click();
await page.waitForTimeout(200);
const overlay = page.getByRole("application", { name: "Pick a colour from the canvas" });
check(await overlay.isVisible(), "the magnifier layer is on");
check(!(await panel.isVisible()) && !(await sheet.isVisible()), "panel and sheet step aside");
// A point on the photo (left part of the canvas).
const pt = await page.evaluate(() => {
  const st = window.__igEditor.getState().canvas.layer.getStage();
  const r = st.container().getBoundingClientRect();
  return { x: r.left + st.x() + 30 * st.scaleX(), y: r.top + st.y() + 600 * st.scaleY() };
});
await page.mouse.move(pt.x, pt.y);
await page.mouse.down();
await page.mouse.move(pt.x + 4, pt.y + 2, { steps: 3 });
await page.screenshot({ path: path.join(OUT, "colors-eyedropper.png") });
check(await page.locator("canvas[aria-hidden=true].rounded-full").isVisible(), "the magnifier shows");
await page.mouse.up();
await page.waitForTimeout(300);
check(await panel.isVisible(), "panel back after picking");
const picked = await page.evaluate(() => {
  const s = window.__igEditor.getState();
  return (s.draft ?? s.doc).elements.at(-1).fill;
});
check(/^#[0-9a-f]{6}$/.test(picked) && !picked.includes("gradient"), `picked a colour from the canvas (${picked})`);
await page.screenshot({ path: path.join(OUT, "colors-custom.png") });
await panel.getByRole("button", { name: "Back" }).click();
await panel.getByRole("button", { name: "Close" }).click();
await page.getByRole("button", { name: "Apply" }).click();

console.log("A widget's card colour and accent");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "New layer" }).click();
await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Widget", exact: true }).click();
await page.getByRole("button", { name: "Story poll", exact: true }).click();
await page.waitForTimeout(300);
const poll = (await S()).doc.elements.at(-1);
check((await page.getByRole("button", { name: "Card style" }).count()) === 0, "no Card style step any more");
await page.getByRole("button", { name: "Color", exact: true }).click();
await page.getByRole("button", { name: "Card colour" }).click();
await panel.getByRole("tab", { name: "Gradient" }).click();
await panel.getByRole("button", { name: "linear-gradient(135deg, #a18cd1, #fbc2eb)" }).click();
await panel.getByRole("button", { name: "Close" }).click();
await page.getByRole("button", { name: "Accent" }).click();
await panel.getByRole("button", { name: "#d81b60" }).click();
await panel.getByRole("button", { name: "Close" }).click();
// A dark card: the texts turn white by themselves; then the text colour picked by hand.
await page.getByRole("button", { name: "Card colour" }).click();
await panel.getByRole("tab", { name: "Solid" }).click();
await panel.getByRole("button", { name: "#0d47a1" }).click();
await panel.getByRole("button", { name: "Close" }).click();
let draftW = await page.evaluate((id) => { const s = window.__igEditor.getState(); return (s.draft ?? s.doc).elements.find((e) => e.id === id).widget; }, poll.id);
check(draftW.ink === "#ffffff" && draftW.inkAuto, "dark card: texts turn white on their own");
await page.getByRole("button", { name: "Text colour" }).click();
await panel.getByRole("button", { name: "#fdd835" }).click();
await panel.getByRole("button", { name: "Close" }).click();
await page.getByRole("button", { name: "Card colour" }).click();
await panel.getByRole("tab", { name: "Gradient" }).click();
await panel.getByRole("button", { name: "linear-gradient(135deg, #a18cd1, #fbc2eb)" }).click();
await panel.getByRole("button", { name: "Close" }).click();
draftW = await page.evaluate((id) => { const s = window.__igEditor.getState(); return (s.draft ?? s.doc).elements.find((e) => e.id === id).widget; }, poll.id);
check(draftW.ink === "#fdd835" && !draftW.inkAuto, "a picked text colour stays when the card changes");
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
const p2 = st.doc.elements.find((e) => e.id === poll.id);
check(p2.widget.bg === "linear-gradient(135deg, #a18cd1, #fbc2eb)" && p2.color === "#d81b60", "card gradient and accent saved");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "colors-widget.png") });

check(errors.length === 0, `no page errors${errors.length ? `: ${errors[0]}` : ""}`);
await browser.close();
if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
