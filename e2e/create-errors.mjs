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
console.log("An old tab holds the storage at an older version (blocked upgrade)");
{
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await skipTips(context);
  const old = await context.newPage();
  // A page of the same site that doesn't run the app, holding version 1 open like an old tab.
  await old.goto(new URL("/404-not-a-page", URL_ARG).href);
  await old.evaluate(
    () =>
      new Promise((resolve) => {
        const del = indexedDB.deleteDatabase("ig-layout");
        del.onsuccess = del.onerror = () => {
          const r = indexedDB.open("ig-layout", 1);
          r.onupgradeneeded = () => r.result.createObjectStore("projects", { keyPath: "id" });
          r.onsuccess = () => {
            window.__keep = r.result; // no versionchange handler: it never lets go
            resolve();
          };
        };
      }),
  );
  const page = await context.newPage();
  let message = "";
  let shown = 0;
  page.on("dialog", (d) => {
    message = d.message();
    shown++;
    void d.accept();
  });
  await page.goto(URL_ARG);
  await page.getByRole("button", { name: "Travel journal" }).first().click();
  await page.getByRole("button", { name: "Use template" }).click();
  // Impatient taps while it waits: no extra attempts, the button says it is opening.
  const busy = page.getByRole("button", { name: "Opening…" });
  check(await busy.isDisabled(), "the button says “Opening…” and waits");
  for (let i = 0; i < 4; i++) await busy.click({ force: true }).catch(() => {});
  await page.waitForTimeout(14000);
  check(/old tab/.test(message) && /blocked/.test(message), `blocked by an old tab: said so (${message.split("\n").pop()})`);
  check(shown === 1, `one message, not one per tap (${shown})`);
  await context.close();
}

console.log("Settings → Check storage");
{
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await skipTips(context);
  const page = await context.newPage();
  await page.goto(URL_ARG);
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Check storage" }).click();
  const report = page.getByRole("region", { name: "Storage check" });
  await report.waitFor({ timeout: 15000 });
  const text = await report.innerText();
  console.log(text.split("\n").map((l) => "     " + l).join("\n"));
  check(/✓ open/.test(text) && /✓ write \+ delete/.test(text) && /✓ read projects/.test(text), "every step reported");
  await context.close();
}

console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`);
if (failures) process.exitCode = 1;
await browser.close();
