// record-demo2.cjs — dashboard-centric demo, 4 targeted clips (demo account)
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = __dirname;

async function smoothScroll(page, dy, steps = 10, pause = 90) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy / steps);
    await sleep(pause);
  }
}

async function login(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.goto("https://admin.majiku.web.id/login", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Email Admin" }).fill("admin@majiku.test");
  await page.getByRole("textbox", { name: "Password" }).fill("Password123!");
  await page.getByRole("button", { name: "Masuk ke Dashboard Daycare" }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await sleep(2500);
  const state = await ctx.storageState({ path: path.join(BASE, "footage", "state.json") });
  await ctx.close();
  return state;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const state = await login(browser);
  console.log("login OK");

  const segments = [
    {
      name: "s1-kpi",
      run: async (page) => {
        await sleep(5000); // KPI row hold
      },
    },
    {
      name: "s2-feed",
      run: async (page) => {
        await smoothScroll(page, 620, 14, 100);
        await sleep(3000);
        await smoothScroll(page, 260, 8, 110);
        await sleep(3000);
        await smoothScroll(page, -880, 12, 80);
        await sleep(1200);
      },
    },
    {
      name: "s3-approve",
      run: async (page) => {
        await smoothScroll(page, 320, 10, 100);
        await sleep(1500);
        const btn = page.getByRole("button", { name: "Setujui" }).first();
        await btn.click();
        await sleep(2500); // modal appears
        await page.getByRole("button", { name: "Setujui Izin" }).click();
        await sleep(4500); // success feedback
      },
    },
    {
      name: "s4-top",
      run: async (page) => {
        await sleep(2000);
        await smoothScroll(page, -320, 10, 90);
        await sleep(5000); // hold for CTA overlay
      },
    },
  ];

  for (const seg of segments) {
    const dir = path.join(BASE, "footage2", seg.name);
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir, size: { width: 1920, height: 1080 } },
      storageState: state,
    });
    const page = await ctx.newPage();
    await page.goto("https://admin.majiku.web.id/dashboard", { waitUntil: "networkidle" });
    await sleep(1500);
    try {
      await seg.run(page);
    } catch (e) {
      console.error(`seg ${seg.name} error:`, e.message);
      await sleep(2000);
    }
    const video = page.video();
    await ctx.close();
    if (video) console.log(`seg ${seg.name} → ${await video.path()}`);
  }
  await browser.close();
  console.log("DONE");
})();
