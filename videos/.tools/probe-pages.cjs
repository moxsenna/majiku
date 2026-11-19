// probe-pages.cjs — verify which admin pages are rich for the demo
const { chromium } = require("playwright-core");
const path = require("path");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = __dirname;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    storageState: path.join(BASE, "footage", "state.json"),
  });
  const page = await ctx.newPage();

  // 1) students
  await page.goto("https://admin.majiku.web.id/students", { waitUntil: "networkidle" });
  await sleep(2500);
  await page.screenshot({ path: path.join(BASE, "probe-students.png") });

  // 2) daily-reports with date 05/10/2026
  await page.goto("https://admin.majiku.web.id/daily-reports", { waitUntil: "networkidle" });
  await sleep(2000);
  const dateInput = page.locator('input[type="date"]').first();
  if (await dateInput.count()) {
    await dateInput.fill("2026-10-05");
    await sleep(2500);
  }
  await page.screenshot({ path: path.join(BASE, "probe-reports-oct5.png") });

  // 3) messages
  await page.goto("https://admin.majiku.web.id/messages", { waitUntil: "networkidle" });
  await sleep(2500);
  await page.screenshot({ path: path.join(BASE, "probe-messages.png") });

  // 4) gallery
  await page.goto("https://admin.majiku.web.id/gallery", { waitUntil: "networkidle" });
  await sleep(2500);
  await page.screenshot({ path: path.join(BASE, "probe-gallery.png") });

  await browser.close();
  console.log("probes done");
})();
