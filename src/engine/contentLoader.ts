import { RuntimeContentSchema } from './schemas';

let _content: any = {};

const isNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node);

async function fetchJsonWeb(fname: string) {
  try {
    const res = await fetch(`/content/${fname}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) { return null; }
}

export async function loadContent() {
  // Two modes: Node (fs/path) for tooling/environments that allow it, and Web (fetch) for browsers.
  if (!isNode) {
    // Browser / web: fetch canonical master files from /content (runtime-only)
    const data: any = {
      areas: (await fetchJsonWeb('areas.json')) || [],
      items: (await fetchJsonWeb('items.json')) || [],
      jobs: (await fetchJsonWeb('jobs.json')) || [],
      enemies: (await fetchJsonWeb('enemies.json')) || [],
      npcs: (await fetchJsonWeb('npcs.json')) || [],
      spells: (await fetchJsonWeb('spells.json')) || [],
      recipes: (await fetchJsonWeb('recipes.json')) || []
    };
    const meta = await fetchJsonWeb('meta.json');
    if (!meta || typeof meta.startAreaId !== 'string' || !meta.startAreaId) {
      throw new Error(`Invalid startAreaId in content/meta.json: ${meta?.startAreaId}`);
    }
    data.meta = meta;

    // Normalize legacy shapes before validation:
    // - spells.cost may be number OR { mana: n } — keep as-is but ensure object values are numbers
    // - recipes.inputs may be array [{itemId,qty}] and recipes.outputs may be array — normalize to inputs map and output string
    if (Array.isArray(data.spells)) {
      data.spells = data.spells.map((s: any) => {
        const sp = { ...s };
        if (sp.cost && typeof sp.cost === 'object' && !Array.isArray(sp.cost)) {
          // ensure all values are numbers
          const map: Record<string, number> = {};
          for (const k of Object.keys(sp.cost)) {
            const v = sp.cost[k];
            map[k] = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
          }
          sp.cost = map;
        }
        return sp;
      });
    }

    if (Array.isArray(data.recipes)) {
      data.recipes = data.recipes.map((r: any) => {
        const rec = { ...r };
        // normalize inputs array -> object map { itemId: qty }
        if (Array.isArray(rec.inputs)) {
          const map: Record<string, number> = {};
          for (const it of rec.inputs) {
            if (!it || !it.itemId) continue;
            map[it.itemId] = (typeof it.qty === 'number') ? it.qty : parseInt(String(it.qty)) || 0;
          }
          rec.inputs = map;
        }
        // normalize outputs array -> output (first itemId)
        if (!rec.output && Array.isArray(rec.outputs) && rec.outputs.length) {
          const first = rec.outputs[0];
          if (first && first.itemId) rec.output = first.itemId;
        }
        return rec;
      });
    }

    // Validate only runtime masters
    const parsed = RuntimeContentSchema.safeParse(data);
    if (!parsed.success) {
      try {
        console.error('Runtime content validation failed:', JSON.stringify(parsed.error.format(), null, 2));
      } catch (e) {
        console.error('Runtime content validation failed (could not stringify):', parsed.error.format());
      }
      throw new Error('Runtime content validation failed. See console for details.');
    }

    const dedupeList = (arr: any[] | undefined, idKey = 'id') => {
      const map = new Map<string, any>();
      if (!arr) return map;
      for (const it of arr) {
        const id = it[idKey] || it.itemId || it.id;
        if (!id) continue;
        map.set(id, it);
      }
      return map;
    };

    _content.areas = dedupeList(parsed.data.areas || [], 'id');
    _content.items = dedupeList(parsed.data.items || [], 'id');
    _content.enemies = dedupeList(parsed.data.enemies || [], 'id');
    _content.spells = dedupeList(parsed.data.spells || [], 'id');
    _content.recipes = dedupeList(parsed.data.recipes || [], 'id');
    _content.jobs = dedupeList(parsed.data.jobs || [], 'id');
    _content.npcs = dedupeList(parsed.data.npcs || [], 'id');

    // attach meta for runtime access
    _content.meta = parsed.data.meta || { startAreaId: '' };

    return _content;
  }

  // Node path: use fs/path for tooling and scripts. Wrap requires in eval so webpack
  // doesn't try to resolve them for web builds (which lack node's fs/path).
  // @ts-ignore
  const fs = eval('require')('fs');
  // @ts-ignore
  const path = eval('require')('path');

  function tryReadJson(p: string) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    } catch (err) { return null; }
  }

  function readContentDir() {
    const dir = path.join(process.cwd(), 'content');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).map((f: string) => path.join(dir, f));
  }

  const contentDir = path.join(process.cwd(), 'content');
  const read = (fname: string) => {
    const p = path.join(contentDir, fname);
    if (!fs.existsSync(p)) return null;
    return tryReadJson(p);
  };

  // base master files (runtime-only)
  const data: any = {
    areas: read('areas.json') || [],
    items: read('items.json') || [],
    enemies: read('enemies.json') || [],
    spells: read('spells.json') || [],
    recipes: read('recipes.json') || []
  };

  const metaRead = read('meta.json');
  if (!metaRead || typeof metaRead.startAreaId !== 'string' || !metaRead.startAreaId) {
    throw new Error(`Invalid startAreaId in content/meta.json: ${metaRead?.startAreaId}`);
  }
  data.meta = metaRead;

  // load NPCs if present
  const npcs = read('npcs.json'); if (npcs) data.npcs = npcs;

  // merge jobs: read any jobs*.json files and build single list, later files override earlier ones
  const jobsDirFiles = readContentDir();
  const jobFiles = jobsDirFiles.filter((p: string) => /jobs.*\.json$/.test(p)).sort();
  let jobsList: any[] = [];
  for (const jf of jobFiles) {
    const arr = tryReadJson(jf);
    if (Array.isArray(arr)) {
      jobsList = jobsList.concat(arr);
    }
  }
  if (jobsList.length) data.jobs = jobsList;
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

  // Normalize legacy shapes before validation (same as browser):
  if (Array.isArray(data.spells)) {
    data.spells = data.spells.map((s: any) => {
      const sp = { ...s };
      if (sp.cost && typeof sp.cost === 'object' && !Array.isArray(sp.cost)) {
        const map: Record<string, number> = {};
        for (const k of Object.keys(sp.cost)) {
          const v = sp.cost[k];
          map[k] = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
        }
        sp.cost = map;
      }
      return sp;
    });
  }

  if (Array.isArray(data.recipes)) {
    data.recipes = data.recipes.map((r: any) => {
      const rec = { ...r };
      if (Array.isArray(rec.inputs)) {
        const map: Record<string, number> = {};
        for (const it of rec.inputs) {
          if (!it || !it.itemId) continue;
          map[it.itemId] = (typeof it.qty === 'number') ? it.qty : parseInt(String(it.qty)) || 0;
        }
        rec.inputs = map;
      }
      if (!rec.output && Array.isArray(rec.outputs) && rec.outputs.length) {
        const first = rec.outputs[0];
        if (first && first.itemId) rec.output = first.itemId;
      }
      return rec;
    });
  }

  // Validate only runtime masters
  const parsed = RuntimeContentSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Runtime content validation failed:', parsed.error.format());
    throw new Error('Runtime content validation failed. See console for details.');
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

  _content.meta = parsed.data.meta || { startAreaId: '' };

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

export function getStartAreaId(): string {
  return _content?.meta?.startAreaId || '';
}
