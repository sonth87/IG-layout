// Shared helpers for the end-to-end checks (see e2e/README.md).
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const FIXTURES = path.join(here, "fixtures");
export const OUT = path.join(here, ".out");
mkdirSync(OUT, { recursive: true });

/** Chromium binary: $CHROME_PATH, else the newest Playwright headless shell in the cache. */
export function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), os.platform() === "darwin" ? "Library/Caches/ms-playwright" : ".cache/ms-playwright");
  const dirs = existsSync(cache) ? readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse() : [];
  for (const d of dirs) {
    for (const sub of readdirSync(path.join(cache, d))) {
      const bin = path.join(cache, d, sub, "chrome-headless-shell");
      if (existsSync(bin)) return bin;
    }
  }
  throw new Error("No Chromium found. Set CHROME_PATH or run `npx playwright install chromium-headless-shell`.");
}

export const URL_ARG = process.argv[2] ?? "http://localhost:4321/";

/** Marks the onboarding (first launch, M10) as seen. */
export async function skipOnboarding(context) {
  await context.addInitScript(() => {
    try {
      localStorage.setItem("ig-layout:onboarded", "1");
    } catch {
      // ignore
    }
  });
}

/** Marks the onboarding and the first-run editor tips as seen (they would cover part of the canvas). */
export async function skipTips(context) {
  await skipOnboarding(context);
  await context.addInitScript(() => {
    try {
      localStorage.setItem("ig-layout:tips-seen", "1");
    } catch {
      // ignore
    }
  });
}

/** Opens the editor's "More" sheet and taps an action in it. */
export async function more(page, label) {
  // With a selection: its ⋯ (floating menu); otherwise the project menu at the top (M18).
  const own = page.getByRole("button", { name: "More", exact: true });
  if (await own.count()) {
    await own.click();
    await page.getByRole("region", { name: "More" }).getByRole("button", { name: label, exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Project menu" }).click();
    await page.getByRole("menu", { name: "Project menu" }).getByRole("menuitem", { name: label, exact: true }).click();
  }
}

/** Picks `files` with "Photos" in the open "Fill frame" sheet (M16). */
export async function pickInFillFrame(page, files) {
  const sheet = page.getByRole("region", { name: "Fill frame" });
  await sheet.waitFor();
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), sheet.getByRole("button", { name: "Photos", exact: true }).click()]);
  await chooser.setFiles(files);
}

/** Home "+" → "From photos": the step-by-step new project (type, slides, photos, layout). */
export async function newProject(page) {
  await page.getByRole("button", { name: "New project" }).click();
  await page.getByRole("button", { name: "From photos" }).click();
}

/**
 * Opens a home template's details through Search: the home builds each group as it comes
 * near and shows 10 cards a group (2026-10-28), so a template may not be on screen yet.
 */
export async function openTemplate(page, name) {
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("searchbox", { name: "Search" }).fill(name);
  await page.getByRole("dialog", { name: "Search" }).getByRole("button", { name, exact: true }).first().click();
}
