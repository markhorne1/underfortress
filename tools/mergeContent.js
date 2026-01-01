const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
if (!fs.existsSync(contentDir)) {
  console.error('content directory not found:', contentDir);
  process.exit(2);
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch (e) { return null; }
}

function walkDir(dir) {
  const results = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) results.push(...walkDir(p));
    else if (stat.isFile() && name.toLowerCase().endsWith('.json')) results.push(p);
  }
  return results;
}

const files = walkDir(contentDir).sort(); // deterministic order

// master output names to ignore when scanning
const masters = ['areas.json','items.json','enemies.json','npcs.json','quests.json','spells.json','recipes.json','jobs.json','enemyGroups.json','endings.json','leonardo_page_prompts.json','leonardo_portrait_prompts.json'];

const categories = ['areas','items','enemies','npcs','quests','spells','recipes','jobs','enemyGroups','endings'];
const aggregated = {};
for (const c of categories) aggregated[c]=[];
const promptObjects = { leonardo_page_prompts: {}, leonardo_portrait_prompts: {} };

for (const f of files) {
  const basename = path.basename(f);
  // skip master outputs to avoid re-reading them
  if (masters.includes(basename)) continue;
  const data = readJSON(f);
  if (!data) continue;

  // decide category by basename prefix
  const nameLower = basename.toLowerCase();
  let matched = null;
  for (const cat of categories) {
    if (nameLower.startsWith(cat)) { matched = cat; break; }
  }

  if (matched) {
    if (!Array.isArray(data)) {
      console.warn('Skipping', f, '— expected array for category', matched);
      continue;
    }

    // SPECIAL: quests files often contain job-like entries (cooldown/objective, no stages)
    if (matched === 'quests') {
      for (const q of data) {
        if (!q || typeof q !== 'object') continue;
        const isQuest = Array.isArray(q.stages) || q.type === 'quest';
        const isJobLike = !isQuest && (q.cooldownMinutes != null || q.objective || q.rewards);
        if (isJobLike) aggregated.jobs.push(q);
        else aggregated.quests.push(q);
      }
      continue;
    }

    aggregated[matched] = aggregated[matched].concat(data);
    continue;
  }

  // if file is a plain array, try to infer from its directory/name (e.g., content/areas/*.json)
  if (Array.isArray(data)) {
    // attempt to infer from parent dir name
    const parent = path.basename(path.dirname(f)).toLowerCase();
    if (categories.includes(parent)) {
      aggregated[parent] = aggregated[parent].concat(data);
      continue;
    }

    // attempt content-based inference from first element shape
    const first = data[0];
    if (first && typeof first === 'object') {
      // quests: staged quests must win over job heuristics
      if (first.stages || first.type === 'quest') {
        aggregated['quests'] = aggregated['quests'].concat(data);
        continue;
      }
      // jobs: contract-style entries (cooldowns/objective/rewards)
      if (first.cooldownMinutes != null || first.objective || first.rewards) {
        aggregated['jobs'] = aggregated['jobs'].concat(data);
        continue;
      }
      // items: have id/name/type or itemId
      if ((first.id || first.itemId) && (first.name || first.type)) {
        aggregated['items'] = aggregated['items'].concat(data);
        continue;
      }
      // enemies: hp/attack/defense
      if (first.hp !== undefined || first.attack !== undefined) {
        aggregated['enemies'] = aggregated['enemies'].concat(data);
        continue;
      }
      // areas: id + title or imagePrompt
      if (first.id && (first.title || first.imagePrompt || first.choices)) {
        aggregated['areas'] = aggregated['areas'].concat(data);
        continue;
      }
    }

    // otherwise log and skip
    console.warn('Uncategorized array file', f, '— skipping');
    continue;
  }

  // handle prompt objects
  if (nameLower.includes('leonardo_page_prompts') && typeof data === 'object') {
    Object.assign(promptObjects.leonardo_page_prompts, data);
    continue;
  }
  if (nameLower.includes('leonardo_portrait_prompts') && typeof data === 'object') {
    Object.assign(promptObjects.leonardo_portrait_prompts, data);
    continue;
  }

  // handle files that have top-level arrays inside object (e.g., { areas: [...] })
  if (typeof data === 'object') {
    for (const key of Object.keys(data)) {
      const lk = key.toLowerCase();
      if (categories.includes(lk) && Array.isArray(data[key])) {
        aggregated[lk] = aggregated[lk].concat(data[key]);
      }
      if ((lk === 'leonardo_page_prompts' || lk === 'leonardo_portrait_prompts') && typeof data[key] === 'object') {
        const targetKey = lk === 'leonardo_page_prompts' ? 'leonardo_page_prompts' : 'leonardo_portrait_prompts';
        Object.assign(promptObjects[targetKey], data[key]);
      }
    }
  }
}

// dedupe helper: last write wins — since files were sorted, later files overwrite earlier entries
function dedupeById(arr){
  const map = new Map();
  for (const it of arr||[]) {
    const id = it && it.id;
    if (!id) continue;
    map.set(id, it);
  }
  return Array.from(map.values());
}

function writeMaster(name, arr) {
  const out = path.join(contentDir, `${name}.json`);
  try {
    fs.writeFileSync(out, JSON.stringify(arr, null, 2), 'utf8');
    console.log('Wrote', out, arr.length);
  } catch (err) {
    console.error('Failed to write', out, err.message || err);
  }
}

for (const cat of categories) {
  const arr = dedupeById(aggregated[cat]);
  if (arr.length) writeMaster(cat, arr);
}

// write prompt objects if any
if (Object.keys(promptObjects.leonardo_page_prompts).length) {
  const out = path.join(contentDir, 'leonardo_page_prompts.json');
  fs.writeFileSync(out, JSON.stringify(promptObjects.leonardo_page_prompts, null, 2), 'utf8');
  console.log('Wrote', out);
}
if (Object.keys(promptObjects.leonardo_portrait_prompts).length) {
  const out = path.join(contentDir, 'leonardo_portrait_prompts.json');
  fs.writeFileSync(out, JSON.stringify(promptObjects.leonardo_portrait_prompts, null, 2), 'utf8');
  console.log('Wrote', out);
}

console.log('Merge complete.');
