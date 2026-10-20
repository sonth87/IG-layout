// Filter v2 (D-131, D-132): the filter lab renders every recipe filter, a black-and-white
// filter is fully grey even at low intensity, and a colour recipe changes the photo.
import { chromium } from "playwright-core";
import { chromePath, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(new URL("labs/filters.html", URL_ARG).href);
await page.waitForTimeout(1500);

/** Max |r-g|, |g-b| over a canvas tile, and how far it is from the original tile. */
const stats = (i) =>
  page.evaluate((i) => {
    const tiles = [...document.querySelectorAll("main canvas")];
    const read = (c) => c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const a = read(tiles[i]);
    const o = read(tiles[0]);
    let chroma = 0;
    let diff = 0;
    for (let p = 0; p < a.length; p += 16) {
      chroma = Math.max(chroma, Math.abs(a[p] - a[p + 1]), Math.abs(a[p + 1] - a[p + 2]));
      diff += Math.abs(a[p] - o[p]) + Math.abs(a[p + 1] - o[p + 1]) + Math.abs(a[p + 2] - o[p + 2]);
    }
    return { chroma, diff: diff / (a.length / 16) / 3, count: tiles.length };
  }, i);

console.log("Filter lab");
await page.getByRole("button", { name: "Film", exact: true }).click();
await page.waitForTimeout(3000);
const film = await stats(1);
check(film.count >= 12, `Film group shows its filters (${film.count - 1})`);
check(film.diff > 3, `a film recipe changes the photo (mean Δ ${film.diff.toFixed(1)})`);

await page.getByRole("button", { name: "Đen trắng", exact: true }).click();
await page.locator('input[type="range"]').fill("30");
await page.waitForTimeout(3000);
const bw = await stats(1);
check(bw.chroma <= 3, `black-and-white at 30 % stays grey (max channel gap ${bw.chroma})`);

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures ? 1 : 0);
