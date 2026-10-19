// Creating a project never fails silently (owner, 2026-10-19): when the browser storage
// fails or hangs, a message says why.
import { chromium } from "playwright-core";
import { chromePath, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const browser = await chromium.launch({ executablePath: chromePath() });

async function attempt(mode) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await skipTips(context);
  const page = await context.newPage();
  await page.goto(URL_ARG);
  await page.waitForTimeout(800);
  // Break the storage from now on: every write fails ("quota") or never answers ("hang").
  await page.evaluate((mode) => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...a) {
      if (mode === "quota") throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      if (mode === "hang") return { onsuccess: null, onerror: null, addEventListener() {} };
      return put.apply(this, a);
    };
  }, mode);
  let message = "";
  page.on("dialog", (d) => {
    message = d.message();
    void d.accept();
  });
  await page.getByRole("button", { name: "Use template" }).count();
  await page.getByRole("button", { name: "Travel journal" }).first().click();
  await page.getByRole("button", { name: "Use template" }).click();
  await page.waitForTimeout(mode === "hang" ? 12000 : 1500);
  await context.close();
  return message;
}

console.log("Storage full");
let m = await attempt("quota");
check(/Couldn’t create the project/.test(m) && /storage is full/.test(m), `a message says why (${m.split("\n").pop()})`);
console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`);
if (failures) process.exitCode = 1;
await browser.close();
