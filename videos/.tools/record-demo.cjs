// record-demo.cjs — record MAJIKU admin demo flows as per-segment WebM clips (URL navigation).
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "footage");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const LOGIN_URL = "https://admin.majiku.web.id/login";
const CREDS = { email: "admin@majiku.test", password: "Password123!" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function smoothScroll(page, dy, steps = 10, pause = 90) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy / steps);
    await sleep(pause);
  }
}

async function newRecordingContext(browser, storageState, dir) {
  return browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir, size: { width: 1920, height: 1080 } },
    storageState,
  });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--disable-infobars", "--disable-notifications"],
  });

  // 1) Login once, persist session
  const loginCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const lp = await loginCtx.newPage();
  await lp.goto(LOGIN_URL, { waitUntil: "networkidle" });
  await lp.getByRole("textbox", { name: "Email Admin" }).fill(CREDS.email);
  await lp.getByRole("textbox", { name: "Password" }).fill(CREDS.password);
  await lp.getByRole("button", { name: "Masuk ke Dashboard Daycare" }).click();
  await lp.waitForURL("**/dashboard", { timeout: 30000 });
  await sleep(2500);
  const storageState = await loginCtx.storageState({ path: path.join(BASE, "state.json") });
  await loginCtx.close();
  console.log("login OK, state saved");

  const scrollRun = async (page) => {
    await sleep(3500);
    await smoothScroll(page, 500, 8, 110);
    await sleep(1200);
    await smoothScroll(page, -500, 8, 90);
    await sleep(1000);
  };

  const segments = [
    { name: "s1-dashboard", url: "/dashboard", run: async (page) => {
        await sleep(3500);
        await smoothScroll(page, 700, 12, 110);
        await sleep(1200);
        await smoothScroll(page, -700, 12, 90);
        await sleep(1500);
      } },
    { name: "s2-attendance", url: "/attendance", run: scrollRun },
    { name: "s3-billing", url: "/billing", run: scrollRun },
    { name: "s4-daily-reports", url: "/daily-reports", run: scrollRun },
  ];

  for (const seg of segments) {
    const dir = path.join(BASE, seg.name);
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await newRecordingContext(browser, storageState, dir);
    const page = await ctx.newPage();
    await page.goto(`https://admin.majiku.web.id${seg.url}`, { waitUntil: "networkidle" });
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
