import fs from 'fs';
import path from 'path';
import { ContentSchema } from './schemas';

let _content: any = {};

function tryReadJson(p: string) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (err) { return null; }
}

function readContentDir() {
  const dir = path.join(process.cwd(), 'content');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map(f => path.join(dir, f));
}

export async function loadContent() {
  const contentDir = path.join(process.cwd(), 'content');
  const read = (fname: string) => {
    const p = path.join(contentDir, fname);
    if (!fs.existsSync(p)) return null;
    return tryReadJson(p);
  };

  // base master files (prefer these names)
  const data: any = {
    areas: read('areas.json') || [],
    items: read('items.json') || [],
    enemies: read('enemies.json') || [],
    enemyGroups: read('enemyGroups.json') || [],
    spells: read('spells.json') || [],
    recipes: read('recipes.json') || [],
    quests: read('quests.json') || [],
    endings: read('endings.json') || read('endings_matrix.json') || []
  };

  // load NPCs if present
  const npcs = read('npcs.json');
  if (npcs) data.npcs = npcs;

  // merge jobs: read any jobs*.json files and build single list, later files override earlier ones
  const jobsDirFiles = readContentDir();
  const jobFiles = jobsDirFiles.filter(p => /jobs.*\.json$/.test(p)).sort();
  let jobsList: any[] = [];
  for (const jf of jobFiles) {
    const arr = tryReadJson(jf);
    if (Array.isArray(arr)) {
      jobsList = jobsList.concat(arr);
    }
  }
  // if a top-level jobs.json exists it will already be included; if not, this still provides merged set
  if (jobsList.length) data.jobs = jobsList;
  // persist merged jobs.json so downstream tooling/UI can rely on a unified file
  try {
    const outPath = path.join(contentDir, 'jobs.json');
    const dedupeMap = new Map();
    for (const j of jobsList) {
      if (!j || !j.id) continue;
      dedupeMap.set(j.id, j);
    }
    if (dedupeMap.size) {
      const arr = Array.from(dedupeMap.values());
      fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8');
    }
  } catch (err) {
    // ignore write failures in read-only environments
  }

  // leonardo prompts
  const lp = read('leonardo_page_prompts.json');
  if (lp) data.leonardo_page_prompts = lp;
  const lpp = read('leonardo_portrait_prompts.json');
  if (lpp) data.leonardo_portrait_prompts = lpp;

  // Validate content shape (schemas were adjusted to be permissive)
  const parsed = ContentSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Content validation failed:', parsed.error.format());
    throw new Error('Content validation failed. See console for details.');
  }

  // normalize maps keyed by id, for arrays we may dedupe keeping the later entry
  const dedupeList = (arr: any[] | undefined, idKey = 'id') => {
    const map = new Map<string, any>();
    if (!arr) return map;
    for (const it of arr) {
      const id = it[idKey] || it.itemId || it.id;
      if (!id) continue;
      // overwrite previous entries with later ones so the last occurrence wins
      map.set(id, it);
    }
    return map;
  };

  _content.areas = dedupeList(parsed.data.areas || [], 'id');
  _content.items = dedupeList(parsed.data.items || [], 'id');
  _content.enemies = dedupeList(parsed.data.enemies || [], 'id');
  _content.enemyGroups = dedupeList(parsed.data.enemyGroups || [], 'id');
  _content.spells = dedupeList(parsed.data.spells || [], 'id');
  _content.recipes = dedupeList(parsed.data.recipes || [], 'id');
  _content.quests = dedupeList(parsed.data.quests || [], 'id');
  _content.endings = dedupeList(parsed.data.endings || [], 'id');
  _content.jobs = dedupeList(parsed.data.jobs || [], 'id');
  _content.npcs = dedupeList(parsed.data.npcs || [], 'id');

  _content.leonardo_page_prompts = parsed.data.leonardo_page_prompts || {};
  _content.leonardo_portrait_prompts = parsed.data.leonardo_portrait_prompts || {};

  return _content;
}

export function getAreaById(id?: string) {
  if (!id) return Array.from(_content.areas?.values() || [])[0];
  return _content.areas?.get(id);
}

export function getAllAreas() { return Array.from(_content.areas?.values() || []); }

export function getJobById(id: string) { return _content.jobs?.get(id); }

export function getAllJobs() { return Array.from(_content.jobs?.values() || []); }

export function getContentSnapshot() { return _content; }
