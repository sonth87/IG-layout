// D-114 — card widgets: three new groups in the Widget sheet, a card added at its own
// aspect, its texts / card style / colour edited in one undo step, the height following
// the texts, and the card drawn in the export.
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
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => window.__igEditor.getState());
const widgets = async () => {
  await page.evaluate(() => window.__igEditor.getState().select(null));
  await page.getByRole("button", { name: "New layer" }).click();
  await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Widget", exact: true }).click();
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("Widget sheet groups");
await widgets();
for (const g of ["Text", "Clock", "Calendar", "Weather", "Travel", "Social", "Music", "Quotes", "Fitness", "Shopping", "To-do", "More"]) check(await page.getByRole("region", { name: g, exact: true }).isVisible(), `group ${g}`);
await page.screenshot({ path: path.join(OUT, "widgets-sheet.png") });
// Every card (for a look at the drawings).
for (const g of ["Calendar", "Weather", "Music", "Quotes"]) {
  const region = page.getByRole("region", { name: g, exact: true });
  check((await region.getByRole("button").count()) >= 6, `${g}: every look shown`);
  await region.scrollIntoViewIfNeeded();
  await region.screenshot({ path: path.join(OUT, `widgets-${g.toLowerCase()}.png`) });
}

console.log("Add a boarding pass");
await page.getByRole("button", { name: "Boarding pass", exact: true }).click();
await page.waitForTimeout(400);
let st = await S();
let w = st.doc.elements.at(-1);
check(w.type === "icon" && w.widget?.kind === "boardingPass" && st.selectedId === w.id, "an icon element with widget data, selected");
check(w.width > 500 && w.height > 200 && w.width / w.height > 1.2 && w.width / w.height < 2.2, `at its own aspect (${Math.round(w.width)} × ${Math.round(w.height)})`);
check(w.widget.fields.fromCode === "SGN", "sample texts (English locale)");

console.log("Its own toolbar (D-118): Content, Card style… each ✓ one undo step");
const pastBefore = st.past.length;
await page.getByRole("button", { name: "Content" }).click();
await page.getByRole("textbox", { name: "From (code)" }).fill("HAN");
await page.screenshot({ path: path.join(OUT, "widgets-edit.png") });
await page.getByRole("button", { name: "Apply" }).click();
await page.getByRole("button", { name: "Card style" }).click();
await page.getByRole("radio", { name: "Dark" }).click();
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
w = st.doc.elements.find((e) => e.id === w.id);
check(w.widget.fields.fromCode === "HAN" && w.widget.theme === "dark", "texts and card style saved");
check(st.past.length === pastBefore + 2, "one undo step each");

console.log("Height follows the texts");
await page.getByRole("button", { name: "New layer" }).waitFor().catch(() => {});
await widgets();
await page.getByRole("button", { name: "Mini checklist", exact: true }).click();
await page.waitForTimeout(300);
st = await S();
let list = st.doc.elements.at(-1);
const h0 = list.height;
await page.getByRole("button", { name: "Content" }).click();
await page.getByRole("textbox", { name: "Title" }).fill("A much longer title for today that will need a second line to fit");
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
list = st.doc.elements.find((e) => e.id === list.id);
check(list.height > h0 + 20, `taller (${Math.round(h0)} → ${Math.round(list.height)})`);

console.log("Undo removes the edit; the layer name is the widget's");
await page.evaluate(() => window.__igEditor.getState().undo());
st = await S();
check(Math.abs(st.doc.elements.find((e) => e.id === list.id).height - h0) < 1, "undo restores the height");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Layers" }).click();
check(await page.getByText("Mini checklist").first().waitFor({ timeout: 10000 }).then(() => true, () => false), "listed as Mini checklist in Layers");
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

const toPage = (x, y) =>
  page.evaluate(
    ([x, y]) => {
      const st = window.__igEditor.getState().canvas.layer.getStage();
      const r = st.container().getBoundingClientRect();
      return { x: r.left + st.x() + x * st.scaleX(), y: r.top + st.y() + y * st.scaleY() };
    },
    [x, y],
  );

console.log("One tap selects only; a double tap opens Content");
// Clear of the checklist (both were added in the middle of the slide).
await page.evaluate((id) => window.__igEditor.getState().updateElement(id, { x: 60, y: 40 }), w.id);
w = (await S()).doc.elements.find((e) => e.id === w.id);
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
let p = await toPage(w.x + w.width * 0.7, w.y + w.height * 0.7);
await page.mouse.click(p.x, p.y);
await page.waitForTimeout(500);
await page.mouse.click(p.x, p.y);
await page.waitForTimeout(500);
check((await S()).selectedId === w.id && !(await page.getByRole("region", { name: "Content" }).isVisible()), "two slow taps: selected, no sheet");
await page.mouse.dblclick(p.x, p.y);
await page.waitForTimeout(400);
check(await page.getByRole("region", { name: "Content" }).isVisible(), "double tap: Content sheet");

console.log("Tapping elsewhere closes the sheet for good (keeps its edits)");
await page.getByRole("textbox", { name: "Seat" }).fill("1A");
const empty = await toPage(w.x + w.width / 2, -150); // the margin above the canvas
await page.mouse.click(empty.x, empty.y);
await page.waitForTimeout(400);
st = await S();
check(st.selectedId === null && !(await page.getByRole("region", { name: "Content" }).isVisible()), "deselected, sheet closed");
check(st.doc.elements.find((e) => e.id === w.id).widget.fields.seat === "1A", "the edit was kept");
p = await toPage(w.x + w.width * 0.7, w.y + w.height * 0.7);
await page.mouse.click(p.x, p.y);
await page.waitForTimeout(400);
check((await S()).selectedId === w.id && !(await page.getByRole("region", { name: "Content" }).isVisible()), "selecting it again: no sheet pops up");

console.log("Dragging it while Content is open: the sheet goes on working");
await page.getByRole("button", { name: "Content" }).click();
await page.getByRole("textbox", { name: "Seat" }).fill("2B");
const x0 = (await S()).doc.elements.find((e) => e.id === w.id).x;
await page.waitForTimeout(400);
p = await toPage(w.x + w.width * 0.7, w.y + w.height * 0.7);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.mouse.move(p.x + 30, p.y + 10, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(300);
await page.getByRole("textbox", { name: "Seat" }).fill("3C");
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
const moved = st.doc.elements.find((e) => e.id === w.id);
check(moved.widget.fields.seat === "3C" && moved.x > x0 + 20, `moved and edited (${moved.widget.fields.seat}, x ${Math.round(x0)} → ${Math.round(moved.x)})`);

console.log("Poll: add / remove options (2–4), no question → no empty space");
await widgets();
await page.getByRole("button", { name: "Story poll", exact: true }).click();
await page.waitForTimeout(300);
let poll = (await S()).doc.elements.at(-1);
const ph0 = poll.height;
await page.getByRole("button", { name: "Options" }).click();
check((await page.getByRole("button", { name: /^Remove row/ }).first().isDisabled()), "two options: cannot remove");
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.getByRole("textbox", { name: "Option 3" }).fill("Stay home");
await page.getByRole("button", { name: "Split evenly" }).click();
await page.getByRole("button", { name: "Add", exact: true }).click();
check(await page.getByRole("button", { name: "Add", exact: true }).isDisabled(), "four options: no more");
await page.getByRole("button", { name: "Remove row 4" }).click();
await page.screenshot({ path: path.join(OUT, "widgets-poll-options.png") });
await page.getByRole("button", { name: "Apply" }).click();
poll = (await S()).doc.elements.find((e) => e.id === poll.id);
const opts = poll.widget.lists.options;
check(opts.length === 3 && opts[2].label === "Stay home" && opts.map((o) => o.percent).join() === "34%,33%,33%", `three options, split evenly (${opts.map((o) => o.percent).join(" ")})`);
check(poll.height > ph0 + 20, "taller with a third option");
await page.getByRole("button", { name: "Content" }).click();
await page.getByRole("textbox", { name: "Question" }).fill("");
await page.getByRole("button", { name: "Apply" }).click();
const ph1 = (await S()).doc.elements.find((e) => e.id === poll.id).height;
check(ph1 < poll.height - 10, `no question: shorter (${Math.round(poll.height)} → ${Math.round(ph1)})`);

console.log("Checklist rows, star slider, weather pick, calendar date");
await widgets();
await page.getByRole("button", { name: "Mini checklist", exact: true }).click();
await page.getByRole("button", { name: "Items" }).click();
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.getByRole("textbox", { name: "Item 4" }).fill("Call mum");
await page.getByRole("checkbox", { name: "Done 4" }).click();
await page.getByRole("button", { name: "Apply" }).click();
let it = (await S()).doc.elements.at(-1).widget.lists.items;
check(it.length === 4 && it[3].text === "Call mum" && it[3].done === "1", "a fourth item, done");
await widgets();
await page.getByRole("button", { name: "Star rating", exact: true }).click();
await page.getByRole("button", { name: "Stars" }).click();
await page.getByRole("slider").fill("3.5");
await page.getByRole("button", { name: "Apply" }).click();
let f = (await S()).doc.elements.at(-1).widget.fields;
check(f.rating === "3.5" && f.score === "3.5 / 5.0", `3.5 stars (${f.score})`);
await widgets();
await page.getByRole("button", { name: "Weather card", exact: true }).click();
await page.getByRole("button", { name: "Weather", exact: true }).click();
await page.getByRole("button", { name: "🌧️" }).click();
await page.getByRole("button", { name: "Apply" }).click();
check((await S()).doc.elements.at(-1).widget.fields.icon === "🌧️", "rain picked");
await widgets();
await page.getByRole("button", { name: "Calendar sheet", exact: true }).click();
await page.getByRole("button", { name: "Date", exact: true }).click();
await page.locator('input[type="date"]').fill("2026-12-25");
await page.getByRole("button", { name: "Apply" }).click();
f = (await S()).doc.elements.at(-1).widget.fields;
check(f.day === "25" && f.month === "DECEMBER" && f.weekday === "Friday", `25 December, Friday (${f.month} ${f.day} ${f.weekday})`);
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "widgets-canvas2.png") });
w = (await S()).doc.elements.find((e) => e.id === w.id);

console.log("Clock (D-119): 19 looks, Style switches the look, Time sets the hands");
await widgets();
const clocks = page.getByRole("region", { name: "Clock", exact: true }).getByRole("button");
check((await clocks.count()) === 19, `19 clock looks (${await clocks.count()})`);
check((await page.getByRole("region", { name: "Text", exact: true }).getByRole("button", { name: "Flip clock" }).count()) === 0, "the old flip clock is not in Text any more");
await page.getByRole("button", { name: "Clock · LED", exact: true }).click();
await page.waitForTimeout(300);
let clock = (await S()).doc.elements.at(-1);
check(clock.widget.kind === "clock" && clock.widget.variant === "led" && clock.widget.theme === "dark", "an LED clock");
const ledAspect = clock.width / clock.height;
await page.getByRole("button", { name: "Style", exact: true }).click();
await page.getByRole("button", { name: "Melting", exact: true }).click();
await page.getByRole("button", { name: "Apply" }).click();
clock = (await S()).doc.elements.find((e) => e.id === clock.id);
check(clock.widget.variant === "melting" && Math.abs(clock.width / clock.height - ledAspect) > 0.5, "now melting, at its own shape");
await page.getByRole("button", { name: "Time", exact: true }).click();
await page.locator('input[type="time"]').fill("07:30");
await page.getByRole("button", { name: "Apply" }).click();
clock = (await S()).doc.elements.find((e) => e.id === clock.id);
check(clock.widget.fields.time === "07:30", "time 07:30");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "widgets-clock.png") });

console.log("Travel (D-120): boarding pass looks, route on a globe, passport stamp");
await widgets();
const travel = page.getByRole("region", { name: "Travel", exact: true }).getByRole("button");
check((await travel.count()) === 28, `28 travel looks (${await travel.count()})`);
await page.getByRole("button", { name: "Flight route · Globe", exact: true }).click();
await page.waitForTimeout(300);
let trip = (await S()).doc.elements.at(-1);
check(trip.widget.kind === "flightRoute" && trip.widget.variant === "globe", "a route on a globe");
await page.getByRole("button", { name: "Content" }).click();
await page.getByRole("textbox", { name: "To (code)" }).fill("CDG");
await page.getByRole("button", { name: "Apply" }).click();
check((await S()).doc.elements.find((e) => e.id === trip.id).widget.fields.toCode === "CDG", "now to Paris");
await widgets();
await page.getByRole("button", { name: "Boarding pass · Phone pass", exact: true }).click();
await page.waitForTimeout(300);
trip = (await S()).doc.elements.at(-1);
check(trip.widget.kind === "boardingPass" && trip.widget.variant === "mobile" && trip.height > trip.width, "a tall phone pass");
await page.getByRole("button", { name: "Style", exact: true }).click();
await page.getByRole("button", { name: "Paper with stub", exact: true }).click();
await page.getByRole("button", { name: "Apply" }).click();
trip = (await S()).doc.elements.find((e) => e.id === trip.id);
check(trip.widget.variant === "stub" && trip.width > trip.height * 2, "switched to the paper ticket");
await widgets();
await page.getByRole("button", { name: "Passport stamp · Hexagon", exact: true }).click();
await page.waitForTimeout(300);
check((await S()).doc.elements.at(-1).widget.variant === "hex", "a hexagon stamp");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "widgets-travel.png") });

console.log("New one-job widgets (D-122): habit week, coupon");
await widgets();
await page.getByRole("button", { name: "Habit tracker", exact: true }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Days" }).click();
check(await page.getByRole("button", { name: "Add", exact: true }).isDisabled(), "a week: no eighth day");
check(await page.getByRole("button", { name: "Remove row 1" }).isDisabled(), "nor fewer than seven");
await page.getByRole("checkbox", { name: "Done 5" }).click();
await page.getByRole("button", { name: "Apply" }).click();
const days = (await S()).doc.elements.at(-1).widget.lists.days;
check(days.length === 7 && days[4].done === "1", "Friday ticked");
await widgets();
await page.getByRole("button", { name: "Coupon · Card", exact: true }).click();
await page.waitForTimeout(300);
const cp = (await S()).doc.elements.at(-1);
check(cp.widget.kind === "coupon" && cp.widget.variant === "card" && cp.widget.fields.value === "-30%", "a coupon card");
await page.evaluate(() => window.__igEditor.getState().select(null));

console.log("Hanging over the canvas edge: still seen and grabbable");
st = await S();
const wh = st.doc.elements.find((e) => e.id === w.id).height;
// Half of it above the top edge (the margin above the canvas is on screen).
await page.evaluate(([id, y]) => window.__igEditor.getState().updateElement(id, { x: 100, y }), [w.id, -wh / 2]);
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "widgets-outside.png") });
check(await page.evaluate(() => !window.__igEditor.getState().canvas.layer.clipWidth()), "content layer not clipped to the canvas");
p = await toPage(100 + w.width / 2, -wh / 4);
await page.mouse.click(p.x, p.y);
await page.waitForTimeout(300);
check((await S()).selectedId === w.id, "tapping the part outside selects it");
await page.evaluate(() => window.__igEditor.getState().select(null));

console.log("Drawn on the canvas");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "widgets-canvas.png") });
check(errors.length === 0, `no console errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
await browser.close();
if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
