import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT_DIR = process.env.SCREENSHOT_DIR || path.resolve('screenshots');
const AUTO_START_SERVER = process.env.AUTO_START_SERVER !== '0';

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function safeClick(page, selector) {
  const el = page.locator(selector).first();
  if (await el.count()) {
    await el.click({ timeout: 5000 });
    return true;
  }
  return false;
}

function startViteServer() {
  const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: false,
  });

  child.stdout.on('data', (buf) => {
    process.stdout.write(`[vite] ${buf}`);
  });

  child.stderr.on('data', (buf) => {
    process.stderr.write(`[vite] ${buf}`);
  });

  return child;
}

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status >= 200 && res.status < 500) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  await ensureDir(OUT_DIR);

  let devServer = null;
  if (AUTO_START_SERVER) {
    console.log('Starting local Vite server...');
    devServer = startViteServer();
    devServer.on('exit', (code) => {
      if (code !== 0) {
        console.error(`[vite] exited early with code ${code}`);
      }
    });
  }

  try {
    console.log(`Waiting for app server at ${BASE_URL} ...`);
    await waitForServer(BASE_URL, 120000);
  } catch (err) {
    throw new Error(
      `App server was not reachable at ${BASE_URL}. ` +
        `If needed, run 'npx playwright install chromium' once, then retry. ` +
        `Original error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  let browser = null;
  try {
    console.log('Launching Chromium...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 120000 });

    // 1) Title screen
    await page.screenshot({ path: path.join(OUT_DIR, '01-title.png'), fullPage: true });

    // 2) Main menu
    await safeClick(page, 'button[aria-label="Enter the Underfortress"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, '02-main-menu.png'), fullPage: true });

    // 3) In-game screen
    await safeClick(page, 'button:has-text("New Game")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '03-gameplay.png'), fullPage: true });

    // 4) Optional next page scene if arrow exists
    await safeClick(page, 'button[aria-label="Next page"]');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT_DIR, '04-gameplay-next.png'), fullPage: true });

    console.log(`Saved screenshots to ${OUT_DIR}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (devServer) {
      devServer.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
