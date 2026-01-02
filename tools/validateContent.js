import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '..', 'content');
function loadJSON(fname){ return JSON.parse(fs.readFileSync(path.join(contentDir, fname),'utf8')); }
const areas = loadJSON('areas.json');
const quests = loadJSON('quests.json');
const jobs = fs.existsSync(path.join(contentDir,'jobs.json'))?loadJSON('jobs.json'):[];
const items = fs.existsSync(path.join(contentDir,'items.json'))?loadJSON('items.json'):[];
const npcs = fs.existsSync(path.join(contentDir,'npcs.json'))?loadJSON('npcs.json'):[];
const enemies = fs.existsSync(path.join(contentDir,'enemies.json'))?loadJSON('enemies.json'):[];
const recipes = fs.existsSync(path.join(contentDir,'recipes.json'))?loadJSON('recipes.json'):[];
const spells = fs.existsSync(path.join(contentDir,'spells.json'))?loadJSON('spells.json'):[];
const endings = fs.existsSync(path.join(contentDir,'endings.json'))?loadJSON('endings.json'):[];

const areasById = {};
for(const a of areas) areasById[a.id]=a;
const itemsById = {};
for(const it of items) itemsById[it.itemId||it.id]=it;
const questsById = {};
for(const q of quests) questsById[q.id]=q;
const jobsById = {};
for(const j of jobs) jobsById[j.id]=j;
const npcsById = {};
for(const n of npcs) npcsById[n.id]=n;
const enemiesById = {};
for(const e of enemies) enemiesById[e.id]=e;
const recipesById = {};
for(const r of recipes) recipesById[r.id]=r;
const spellsById = {};
for(const s of spells) spellsById[s.id]=s;

let missing = [];
function checkAreaRefs(area){
  // exits
  if(area.exits){ for(const dir in area.exits){ const dest = area.exits[dir]; if(!areasById[dest]) missing.push({ type:'areaExit', area: area.id, ref: dest }); }}
  // choices
  if(area.choices){ for(const c of area.choices){ if(c.goToAreaId && !areasById[c.goToAreaId]) missing.push({ type:'choiceGoTo', area: area.id, choice: c.id, ref: c.goToAreaId });
    // requirements
    if(c.requirements) for(const r of c.requirements){ if(r.itemId && !itemsById[r.itemId]) missing.push({ type:'reqItem', area: area.id, choice: c.id, ref: r.itemId }); if(r.jobId && !jobsById[r.jobId]) missing.push({ type:'reqJob', area: area.id, choice: c.id, ref: r.jobId }); if(r.key && r.type==='hasFlag' && typeof r.key==='string' && !r.key){} }
    // effects
    if(c.effects) for(const e of c.effects){ if(e.itemId && !itemsById[e.itemId]) missing.push({ type:'effectItem', area: area.id, choice: c.id, ref: e.itemId }); if(e.key && e.type==='addItem' && !itemsById[e.key]) missing.push({ type:'effectItemKey', area: area.id, choice: c.id, ref: e.key }); if(e.questId && !questsById[e.questId]) missing.push({ type:'effectQuest', area: area.id, choice: c.id, ref: e.questId }); if(e.jobId && !jobsById[e.jobId]) missing.push({ type:'effectJob', area: area.id, choice: c.id, ref: e.jobId }); if(e.hazard && e.hazard.kind && !['spikes','caltraps'].includes(e.hazard.kind)){} }
  }}
  // effectsOnEnter
  if(area.effectsOnEnter) for(const e of area.effectsOnEnter){ if(e.itemId && !itemsById[e.itemId]) missing.push({ type:'enterEffectItem', area: area.id, ref: e.itemId }); if(e.questId && !questsById[e.questId]) missing.push({ type:'enterEffectQuest', area: area.id, ref: e.questId }); }
}

for(const a of areas) checkAreaRefs(a);

// Verify each quest has a start and a completion reference in areas
for(const q of quests){ let hasStart=false, hasComplete=false;
  for(const a of areas){ if(a.choices) for(const c of a.choices){ if(c.effects) for(const e of c.effects){ if((e.type==='startQuest' && (e.key===q.id || e.questId===q.id)) || (e.type==='startJob' && (e.jobId===q.id || e.key===q.id))) hasStart=true; if((e.type==='completeQuest' && (e.key===q.id||e.questId===q.id)) || (e.type==='completeJob' && (e.jobId===q.id||e.key===q.id))) hasComplete=true; } } if(a.effectsOnEnter) for(const e of a.effectsOnEnter){ if((e.type==='completeQuest' && (e.key===q.id||e.questId===q.id)) || (e.type==='completeJob' && (e.jobId===q.id||e.key===q.id))) hasComplete=true; }}
  if(!hasStart) missing.push({ type:'questNoStart', quest:q.id });
  if(!hasComplete) missing.push({ type:'questNoComplete', quest:q.id });
}

if(missing.length===0){ console.log('Content audit passed: no missing references found.'); process.exit(0); }
console.log('Content audit found missing references:');
for(const m of missing) console.log(JSON.stringify(m));
process.exit(2);
