import { chromium } from 'playwright';
import { mkdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT_DIR = process.env.SCREENSHOT_DIR || path.resolve('screenshots', 'areas');
const AREAS_PATH = path.resolve('content', 'areas.json');

function sanitizeFileName(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function buildSaveState(areaId) {
  return {
    currentAreaId: areaId,
    discoveredMap: { [areaId]: true },
    inventory: [
      { itemId: 'training_sword', qty: 1 },
      { itemId: 'training_shield', qty: 1 },
    ],
    equipment: {
      mainhand: 'training_sword',
      offhand: 'training_shield',
    },
    activeThreat: undefined,
    quests: {},
    questLog: [],
    spellsKnown: [],
    spellPathsUnlocked: [],
    combatSkills: [],
    stats: {
      gold: 0,
      power: 5,
      mind: 5,
      agility: 5,
      vision: 5,
      statPoints: 0,
    },
    health: 100,
    stamina: 100,
    maxStamina: 100,
    lastCheckpointId: areaId,
    flags: {},
    hasSave: true,
  };
}

async function clickIfExists(page, selector) {
  const node = page.locator(selector).first();
  if (await node.count()) {
    await node.click({ timeout: 5000 });
    return true;
  }
  return false;
}

async function screenshotArea(page, area, index, total) {
  const areaId = area.id;
  const areaTitle = area.title || area.id;
  const prefix = String(index + 1).padStart(4, '0');
  const fileBase = `${prefix}-${sanitizeFileName(areaId)}-${sanitizeFileName(areaTitle)}`;
  const filePath = path.join(OUT_DIR, `${fileBase}.png`);

  try {
    await access(filePath);
    console.log(`[skip ${index + 1}/${total}] ${areaId} (already exists)`);
    return { ok: true, skipped: true };
  } catch {
    // continue
  }

  console.log(`[shot ${index + 1}/${total}] ${areaId}`);

  const save = JSON.stringify(buildSaveState(areaId));
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluate((raw) => {
    window.localStorage.setItem('underfortress_save_v1', raw);
  }, save);

  await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
  await clickIfExists(page, 'button[aria-label="Enter the Underfortress"]');
  await page.waitForTimeout(400);
  await clickIfExists(page, 'button:has-text("Load Game")');
  await page.waitForTimeout(1400);

  await page.screenshot({ path: filePath, fullPage: true });
  return { ok: true, skipped: false };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const areaRaw = await readFile(AREAS_PATH, 'utf8');
  const areaData = JSON.parse(areaRaw);
  const areas = Array.isArray(areaData) ? areaData.filter((a) => a && a.id) : [];
  if (!areas.length) {
    throw new Error('No areas found in content/areas.json');
  }

  console.log(`Found ${areas.length} areas`);
  console.log('Starting local Vite server...');
  const devServer = startViteServer();

  let browser = null;
  try {
    await waitForServer(BASE_URL, 120000);
    console.log('Launching Chromium...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

    let done = 0;
    let skipped = 0;
    const failed = [];

    for (let i = 0; i < areas.length; i += 1) {
      try {
        const res = await screenshotArea(page, areas[i], i, areas.length);
        done += 1;
        if (res.skipped) skipped += 1;
      } catch (err) {
        failed.push({ id: areas[i].id, error: String(err) });
        console.error(`[fail ${i + 1}/${areas.length}] ${areas[i].id}: ${String(err)}`);
      }
    }

    console.log(`Finished: ${done}/${areas.length} processed, ${skipped} skipped, ${failed.length} failed`);
    if (failed.length) {
      console.log('Failed areas:');
      for (const f of failed) {
        console.log(`- ${f.id}: ${f.error}`);
      }
    }
  } finally {
    if (browser) await browser.close();
    devServer.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
