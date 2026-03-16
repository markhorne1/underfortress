import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT_DIR = process.env.SCREENSHOT_DIR || path.resolve('screenshots', 'topnav');

const TOP_NAV = [
  { key: 'inventory', label: 'Inventory' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'skills', label: 'Skills' },
  { key: 'spells', label: 'Spells' },
  { key: 'quests', label: 'Quests' },
  { key: 'map', label: 'Map' },
];

function startViteServer() {
  const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: false,
  });

  child.stdout.on('data', (buf) => process.stdout.write(`[vite] ${buf}`));
  child.stderr.on('data', (buf) => process.stderr.write(`[vite] ${buf}`));
  return child;
}

async function isServerReachable(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function clickIfExists(page, selector) {
  const node = page.locator(selector).first();
  if (await node.count()) {
    await node.click({ timeout: 8000 });
    return true;
  }
  return false;
}

async function ensureInGame(page) {
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 120000 });

  await clickIfExists(page, 'button[aria-label="Enter the Underfortress"]');
  await page.waitForTimeout(400);

  // Prefer New Game (always deterministic), fallback to Load Game.
  const started = await clickIfExists(page, 'button:has-text("New Game")');
  if (!started) {
    const loaded = await clickIfExists(page, 'button:has-text("Load Game")');
    if (!loaded) {
      throw new Error('Could not find New Game or Load Game button.');
    }
  }

  await page.waitForTimeout(1800);

  const navExists = await page.locator('.nav-buttons-container button').count();
  if (!navExists) {
    // One more attempt in case we were still on menu after a failed load.
    const retryStarted = await clickIfExists(page, 'button:has-text("New Game")');
    if (retryStarted) {
      await page.waitForTimeout(1800);
    }
  }

  const finalNavExists = await page.locator('.nav-buttons-container button').count();
  if (!finalNavExists) {
    throw new Error('Entered app but top navigation was not found (still not in game state).');
  }
}

async function openNavModal(page, key) {
  const navButton = page.locator('.nav-buttons-container button', { hasText: key }).first();
  if (!(await navButton.count())) {
    throw new Error(`Top-nav button not found for ${key}`);
  }
  await navButton.click({ timeout: 8000 });
  await page.waitForTimeout(800);
}

async function closeModal(page) {
  // Desktop labels used in this app (and a generic fallback)
  const closedDesktop =
    (await clickIfExists(page, 'button:has-text("Return To Game")')) ||
    (await clickIfExists(page, 'button:has-text("Return to Game")')) ||
    (await clickIfExists(page, 'button:has-text("Return")'));
  if (closedDesktop) {
    await page.waitForTimeout(400);
    return;
  }

  // Mobile fallback
  const closedMobile =
    (await clickIfExists(page, 'button:has-text("×")')) ||
    (await clickIfExists(page, 'button:has-text("✕")'));
  if (closedMobile) {
    await page.waitForTimeout(400);
    return;
  }

  // Last-resort: hit Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let devServer = null;
  const reachable = await isServerReachable(BASE_URL);
  if (reachable) {
    console.log('Using existing app server...');
  } else {
    console.log('Starting local Vite server...');
    devServer = startViteServer();
  }

  let browser = null;
  try {
    await waitForServer(BASE_URL, 120000);

    console.log('Launching Chromium...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

    await ensureInGame(page);

    for (let i = 0; i < TOP_NAV.length; i += 1) {
      const tab = TOP_NAV[i];
      console.log(`[shot ${i + 1}/${TOP_NAV.length}] ${tab.label}`);
      await openNavModal(page, tab.key);
      await page.screenshot({
        path: path.join(OUT_DIR, `${String(i + 1).padStart(2, '0')}-${tab.key}.png`),
        fullPage: true,
      });
      await closeModal(page);
    }

    console.log(`Saved top-nav screenshots to ${OUT_DIR}`);
  } finally {
    if (browser) await browser.close();
    if (devServer) devServer.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
