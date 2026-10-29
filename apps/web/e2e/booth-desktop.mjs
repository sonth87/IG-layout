// Booth on a computer (1280 × 800, webcam): two columns (camera left, choices right; print
// left, actions right), one camera → no "switch camera", Enter starts, Space pauses, Esc
// asks before leaving, the corner view is bigger.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({ executablePath: chromePath(), args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};

await page.goto(new URL("booth", URL_ARG).href);
await page.getByRole("button", { name: /Shoot solo/ }).click();
await page.waitForFunction(() => document.querySelector("video")?.videoWidth > 0, null, { timeout: 10000 });
await page.waitForTimeout(600);

console.log("1. Frame screen");
const cam = await page.locator("video").first().boundingBox();
const frames = await page.getByRole("radiogroup", { name: "Frame" }).boundingBox();
check(frames.x > cam.x + cam.width - 10 && frames.y < 200, `choices in a side panel (camera x ${Math.round(cam.x)}, panel x ${Math.round(frames.x)})`);
check((await page.getByRole("button", { name: "Switch camera" }).count()) === 0, "one camera → no switch button");
const pip = await page.getByRole("button", { name: /Show me big|Show the whole frame/ }).boundingBox();
check(pip.width > 180, `bigger corner view (${Math.round(pip.width)} px)`);

console.log("2. Keys");
await page.keyboard.press("Enter");
await page.getByText("Shot 1 of 4").waitFor({ timeout: 3000 });
check(true, "Enter starts shooting");
await page.waitForTimeout(1500);
await page.keyboard.press(" ");
await page.waitForTimeout(300);
check((await page.getByRole("button", { name: "Resume" }).count()) === 1, "Space pauses");
await page.keyboard.press(" ");
await page.keyboard.press("Escape");
check((await page.getByRole("alertdialog").count()) === 0, "Esc with no shots yet → back");
await page.getByRole("button", { name: /Start shooting/ }).waitFor({ timeout: 3000 });

console.log("3. Result");
await page.goto(new URL("booth", URL_ARG).href);
await page.locator("input[type=file]").setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(FIXTURES, f)));
await page.getByText("Fresh off the press!").waitFor({ timeout: 8000 });
const print = await page.locator("canvas").first().boundingBox();
const save = await page.getByRole("button", { name: /Save photo/ }).boundingBox();
check(save.x > print.x + print.width && print.height > 500, `print left (${Math.round(print.height)} px tall), actions right`);

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
