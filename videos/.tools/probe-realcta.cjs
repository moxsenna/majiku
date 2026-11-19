// probe-realcta.cjs — probe pages with the real-data admin account
const { chromium } = require("playwright-core");
const path = require("path");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = __dirname;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  await page.goto("https://admin.majiku.web.id/login", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Email Admin" }).fill("admin.test@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).fill("Password123!");
  await page.getByRole("button", { name: "Masuk ke Dashboard Daycare" }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await sleep(2500);
  const state = await ctx.storageState({ path: path.join(BASE, "footage", "state-real.json") });

  const shots = [
    ["students", "/students"],
    ["attendance", "/attendance"],
    ["reports", "/daily-reports"],
    ["billing", "/billing"],
  ];
  for (const [name, url] of shots) {
    await page.goto(`https://admin.majiku.web.id${url}`, { waitUntil: "networkidle" });
    await sleep(2500);
    await page.screenshot({ path: path.join(BASE, `probe-real-${name}.png`) });
    console.log("probed", name);
  }
  await browser.close();
  console.log("done");
})();
