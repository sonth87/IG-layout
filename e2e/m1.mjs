import { chromium } from "playwright-core";
import { skipTips, chromePath, FIXTURES as dir, OUT as out, URL_ARG } from "./lib.mjs";
import path from "node:path";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m1-${n}.png`) });
const log = (...a) => console.log("•", ...a);

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(url);
await page.getByText("No projects yet").waitFor();
log("empty projects screen OK");
await shot(page, "1-empty");

await page.getByRole("button", { name: "New project" }).click();
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "panorama.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("4:5 · 3 slides").waitFor();
await page.waitForTimeout(500);
const box = await page.locator("[data-stage-frame]").boundingBox();
await page.mouse.move(box.x + 150, box.y + 150);
await page.mouse.down();
await page.mouse.move(box.x + 200, box.y + 180, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(1200); // autosave debounce + thumbnail
log("editor + drag OK");

await page.reload();
await page.getByText("4:5 · 3 slides · ").waitFor();
log("after reload, project listed:", await page.locator("article h2").allTextContents());
await shot(page, "2-list");

await page.locator("article").first().getByRole("button").first().click();
await page.getByText("4:5 · 3 slides").waitFor();
log("reopened; undo enabled =", await page.getByLabel("Undo").isEnabled(), "(2 steps: add photo, drag)");
await page.getByLabel("Undo").click();
log("after undo, redo enabled =", await page.getByLabel("Redo").isEnabled());
await page.getByLabel("Redo").click();
await page.getByLabel("Back").click();
await page.getByRole("button", { name: "New project" }).waitFor();

await page.getByRole("button", { name: /Actions for/ }).click();
await page.getByRole("menuitem", { name: "Rename" }).click();
await page.getByLabel("Project name").fill("Da Lat trip");
await page.getByRole("button", { name: "Save" }).click();
await page.getByText("Da Lat trip").waitFor();
log("rename OK");

await page.getByLabel("Settings and language").click();
await page.getByRole("radio", { name: "Tiếng Việt" }).click();
await page.getByRole("radio", { name: "Tối" }).click();
log("html data-theme =", await page.evaluate(() => document.documentElement.dataset.theme), "lang =", await page.evaluate(() => document.documentElement.lang));
await shot(page, "3-settings-vi-dark");
await page.getByLabel("Quay lại").click();
await page.reload();
await page.getByRole("button", { name: "Tạo project" }).waitFor();
log("after reload still VI + theme", await page.evaluate(() => document.documentElement.dataset.theme));
await shot(page, "4-list-vi-dark");

await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload(); // let the SW control the page
await context.setOffline(true);
await page.reload();
await page.getByRole("button", { name: "Tạo project" }).waitFor({ timeout: 5000 });
log("offline reload OK; projects:", await page.locator("article h2").allTextContents());
await context.setOffline(false);

await page.getByRole("button", { name: /Tùy chọn cho/ }).click();
await page.getByRole("menuitem", { name: "Xóa" }).click();
await page.getByRole("alertdialog").getByRole("button", { name: "Xóa" }).click();
await page.getByText("Chưa có project nào").waitFor();
log("delete OK");

console.log("console errors:", errors);
await browser.close();
if (errors.length) process.exitCode = 1;
