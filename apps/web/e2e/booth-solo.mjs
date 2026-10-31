// Booth solo (/booth, D-152…D-157, D-162): lobby (one column on a phone) → frame (camera
// window = cell shape, countdown 3 / 5 / 8 s, spares on: strip of 4 → 7 shots) → 7 shots on
// their own (3 s countdown on a corner card, the shot shown big for the 2 s rest, numbered
// slots) → pick 4 → the print slides out → save a 600 × 1800 JPEG → tap a photo, retake it →
// flip → the roll is in "Recent rolls" after a reload → Polaroid: no spares, 1 shot → delete. Chromium's fake camera stands in for the real one.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromePath, OUT, URL_ARG, openRoll } from "./lib.mjs";

const browser = await chromium.launch({
  executablePath: chromePath(),
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, permissions: ["camera"] });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};

await page.goto(new URL("booth?today=2026-06-15", URL_ARG).href);
// 0. Lobby on a phone: the ways in are one column (D-164).
const room = await page.getByRole("button", { name: "Start a group room" }).boundingBox();
const join = await page.getByRole("textbox", { name: /Join/ }).boundingBox();
check(room && join && join.y > room.y + room.height - 2, `group room / join are stacked (room bottom ${room && Math.round(room.y + room.height)}, code y ${join && Math.round(join.y)})`);
await page.screenshot({ path: path.join(OUT, "booth-lobby-phone.png") });
await page.getByRole("button", { name: "Shoot solo" }).click();

// 1. Frame screen: camera on, 8 frames, window shaped like the first cell.
console.log("1. Frame");
await page.getByRole("radiogroup", { name: "Frame" }).getByRole("radio").first().waitFor();
check((await page.getByRole("radiogroup", { name: "Frame" }).getByRole("radio").count()) === 10, "10 frames");
await page.getByRole("radio", { name: /Strip of 4/ }).click();
await page.waitForFunction(() => document.querySelector("video")?.videoWidth > 0, null, { timeout: 10000 });
check(await page.getByText("Try the camera again").isHidden(), "camera opened (fake device)");
const start = await page.getByRole("button", { name: "Start shooting" }).boundingBox();
check(start && start.y + start.height <= 844, `"Start shooting" is on screen without scrolling (bottom ${start && Math.round(start.y + start.height)})`);
check((await page.locator("video.absolute").evaluate((v) => v.style.transform)) === "scaleX(-1)", "front camera shown mirrored");
await page.screenshot({ path: path.join(OUT, "booth-setup.png") });

// 1b. Two views: the whole frame big (camera playing in cell 1), me in the corner; tap the
// corner to swap, drag it to another corner.
console.log("1b. Two views");
check((await page.locator("video").count()) === 2, "frame view plays the camera in its cell + the corner polaroid");
const pip = () => page.getByRole("button", { name: /Show me big|Show the whole frame/ });
check((await pip().getAttribute("aria-label")) === "Show me big", "frame view is the main one while choosing");
await pip().click();
await page.waitForTimeout(400);
check((await pip().getAttribute("aria-label")) === "Show the whole frame", "tap the corner → swapped");
await page.screenshot({ path: path.join(OUT, "booth-setup-me.png") });
let pb = await pip().boundingBox();
await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
await page.mouse.down();
await page.mouse.move(60, 160, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(400);
pb = await pip().boundingBox();
check(pb.x < 40 && pb.y < 200 && (await pip().getAttribute("aria-label")) === "Show the whole frame", `dragged → top-left corner, no swap (${Math.round(pb.x)}, ${Math.round(pb.y)})`);
await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
await page.mouse.down();
await page.mouse.move(370, 520, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(400);

// 1c. Countdown 3 s; spares on by default: strip of 4 → 7 shots (D-162).
await page.getByRole("tab", { name: "Countdown" }).click();
check(await page.getByText("7 shots, then pick the best 4").isVisible(), "spares on by default: 7 shots for 4 cells");
await page.getByRole("radio", { name: "3 s", exact: true }).click();
check((await page.getByRole("radio", { name: "3 s", exact: true }).getAttribute("aria-checked")) === "true", "3 s countdown picked");
check(await page.getByText(/7 shots · 3 s countdown/).isVisible(), "summary under the button");

// 2. Shoot 7: countdown on a corner card, the shot shown big, numbered slots.
console.log("2. Shoot");
const t0 = Date.now();
await page.getByRole("button", { name: "Start shooting" }).click();
await page.getByText("Shot 1 of 7").waitFor();
check((await page.locator("span[aria-hidden].border-dashed").count()) === 7, "7 numbered slots");
await page.locator("[data-countdown]").waitFor();
const num = await page.locator("[data-countdown]").textContent();
check(Number(num) >= 1 && Number(num) <= 3, `countdown runs (${num})`);
const card = await page.locator("[data-countdown]").boundingBox();
check(card && card.x > 390 / 2 && card.y < 260, `countdown in the top-right corner (${card && Math.round(card.x)}, ${card && Math.round(card.y)})`);
await page.screenshot({ path: path.join(OUT, "booth-countdown.png") });
check((await pip().getAttribute("aria-label")) === "Show me big" ? false : true, "shooting: me big, the frame in the corner");
await page.locator("img[data-shot='0']").waitFor({ timeout: 6000 });
const first = (Date.now() - t0) / 1000;
check(first > 2.5 && first < 5.5, `first shot after ~3 s (${first.toFixed(1)} s)`);
await page.getByText("Next shot coming up…").waitFor({ timeout: 1500 });
await page.screenshot({ path: path.join(OUT, "booth-review.png") });
check(true, "the shot just taken is shown big");
// Tap it → take it again: back to 1 shot taken... the slot 1 is empty again.
await page.getByRole("button", { name: "Retake that one" }).first().click();
await page.waitForTimeout(200);
check((await page.locator("img[data-shot='0']").count()) === 0, "tap the shown shot → it's taken again");
await page.getByText(/^Pick 4 shots/).waitFor({ timeout: 60000 });
const total = (Date.now() - t0) / 1000;
check(total > 30 && total < 50, `7 shots (+1 retake) ≈ 8 × 3 + 7 × 2 s (${total.toFixed(1)} s)`);
check((await page.locator("button[aria-pressed] img").count()) === 7, "7 shots to pick from");
for (const i of [6, 4, 2]) await page.locator("button[aria-pressed]").nth(i).click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "booth-pick.png") });
await page.locator("button[aria-pressed]").nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "booth-pick-full.png") });
await page.getByRole("button", { name: /Next · 4\/4/ }).click();
await page.getByText("Printing…").waitFor({ timeout: 5000 });

// 3. Print, save.
console.log("3. Result");
await page.getByText("Tap a photo to retake it.").waitFor({ timeout: 5000 });
await page.screenshot({ path: path.join(OUT, "booth-result.png") });
const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Save photo/ }).click()]);
const file = path.join(OUT, "booth-strip.png");
await download.saveAs(file);
const png = readFileSync(file);
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
check(download.suggestedFilename().startsWith("booth_") && download.suggestedFilename().endsWith(".png") && w === 600 && h === 1800, `saved ${download.suggestedFilename()} ${w}×${h}`);

// 4. Tap the 2nd photo → retake just that one → back to the print.
console.log("4. Retake one shot");
const canvas = page.locator("canvas").first();
const box = await canvas.boundingBox();
// strip4: cell 2 spans y 420…780 of 1800.
await page.mouse.click(box.x + box.width / 2, box.y + box.height * (600 / 1800));
await page.getByRole("button", { name: /Retake shot 2/ }).click();
await page.getByText("Shot 1 of 1").waitFor();
await page.getByText("Tap a photo to retake it.").waitFor({ timeout: 20000 });
check(true, "retook shot 2 only (1 shot), back to the print");

// 5. Flip, then the roll survives a reload.
console.log("5. Flip, recent rolls");
await page.getByRole("button", { name: /Flip photos/ }).click();
check((await page.getByRole("button", { name: /Flip photos/ }).getAttribute("aria-pressed")) === "true", "flip on");
await page.waitForTimeout(600);
await page.reload();
await page.getByText("Recent rolls").waitFor({ timeout: 5000 });
check((await page.getByRole("button", { name: /Open roll from/ }).count()) === 1, "1 roll in Recent rolls after reload");
// The lobby doesn't scroll; recent prints peek up from the bottom, each rises under the mouse.
check((await page.locator("[data-roll='down']").count()) === 1, "the print starts lowered (only its top shows)");
const scrollers = await page.evaluate(() =>
  [document.scrollingElement, ...document.querySelectorAll("*")]
    .filter((el) => el && !el.closest("[data-roll]") && el.scrollHeight > el.clientHeight + 1 && (el === document.scrollingElement || /auto|scroll/.test(getComputedStyle(el).overflowY)))
    .map((el) => el.tagName + "." + String(el.className).slice(0, 40)),
);
check(scrollers.length === 0, `nothing in the lobby scrolls up and down ${scrollers.join(" | ")}`);
const pr = await page.locator("[data-roll]").boundingBox();
await page.mouse.move(pr.x + pr.width / 2, Math.min(pr.y + 20, 830));
await page.locator("[data-roll='up']").waitFor({ timeout: 2000 });
await page.mouse.move(pr.x + pr.width / 2, 120);
await page.locator("[data-roll='down']").waitFor({ timeout: 2000 });
check(true, "mouse over the print → it rises, away → it goes back down");
await openRoll(page);
await page.getByRole("button", { name: /Flip photos/ }).waitFor();
check((await page.getByRole("button", { name: /Flip photos/ }).getAttribute("aria-pressed")) === "true", "reopened roll keeps flip");

// 6. Spares: ticking keeps the frame in view; Polaroid (1 cell) just shoots once.
console.log("6. Spare shots");
await page.getByRole("button", { name: "New roll" }).click();
await page.getByRole("radio", { name: /Strip of 3/ }).click();
await page.getByText("6 shots, then pick the best 3").click();
await page.getByText("6 shots, then pick the best 3").click();
// Ticking it must not scroll the booth's frame away (owner, 2026-10-30: the top bar vanished).
const top = await page.getByRole("heading", { name: "Pick your frame" }).boundingBox();
check(top && top.y >= 0, `ticking "spare shots" keeps the top bar in view (y ${top && Math.round(top.y)})`);
await page.getByRole("radio", { name: /Polaroid/ }).click();
check((await page.getByText(/then pick the best/).count()) === 0, "Polaroid: no spare option");
await page.getByRole("button", { name: "Start shooting" }).click();
await page.getByText("Shot 1 of 1").waitFor();
await page.getByText("Tap a photo to retake it.").waitFor({ timeout: 15000 });
check(true, "1 shot → print");

// 7. Delete the roll → lobby has 1 roll.
console.log("7. Delete");
await page.getByRole("button", { name: "Delete roll" }).click();
await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
await page.getByRole("button", { name: "Shoot solo" }).waitFor();
await page.waitForTimeout(300);
check((await page.getByRole("button", { name: /Open roll from/ }).count()) === 1, "deleted, 1 roll left");
await page.screenshot({ path: path.join(OUT, "booth-home.png") });

// 8. Camera blocked: says why, test picture not mirrored, retry.
console.log("8. Camera blocked");
// Its own browser: the main one says yes to every camera request.
const plain = await chromium.launch({ executablePath: chromePath() });
const blocked = await plain.newContext({ viewport: { width: 390, height: 844 } });
const bp = await blocked.newPage();
await bp.goto(new URL("booth?today=2026-06-15", URL_ARG).href);
await bp.getByRole("button", { name: "Shoot solo" }).click();
await bp.getByRole("status").waitFor({ timeout: 10000 });
const why = await bp.getByRole("status").innerText();
check(/blocking the camera|No camera found/.test(why), `reason shown: ${why.split("\n")[0]}`);
await bp.waitForFunction(() => document.querySelector("video")?.videoWidth > 0);
check((await bp.locator("video.absolute").evaluate((v) => v.style.transform)) === "", "test picture not mirrored");
await bp.getByRole("button", { name: /Try the camera again/ }).click();
await bp.getByRole("status").waitFor({ timeout: 10000 });
check(true, "retry asks again");
await plain.close();

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
