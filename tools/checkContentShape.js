import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');
function readJSON(fname){ try { return JSON.parse(fs.readFileSync(path.join(contentDir,fname),'utf8')); } catch(e){ return null; } }

const areas = readJSON('areas.json')||[];
const quests = readJSON('quests.json')||[];
const items = readJSON('items.json')||[];
const enemyGroups = readJSON('enemyGroups.json');

const issues = [];

function push(issue){ if(issues.length<200) issues.push(issue); }

// meta
const meta = readJSON('meta.json');
if(!meta || typeof meta.startAreaId!=='string' || !meta.startAreaId) push({type:'meta.startAreaId.missing', value: meta});

// areas
for(const a of areas){
  if(!a || typeof a !== 'object'){ push({type:'area.invalid', area: a}); continue; }
  if(typeof a.id !== 'string' || !a.id) push({type:'area.missing.id', area: a});
  if(typeof a.title !== 'string' || !a.title) push({type:'area.missing.title', areaId: a.id});
  if(typeof a.imagePrompt !== 'string' || !a.imagePrompt) push({type:'area.missing.imagePrompt', areaId: a.id});
  if(a.choices){
    for(const c of a.choices){ if(!c || typeof c.id!=='string' || !c.id) push({type:'choice.missing.id', areaId: a.id, choice: c}); }
  }
}

// quests
for(const q of quests){ if(!q || typeof q.id!=='string' || !q.id) push({type:'quest.missing.id', quest:q}); if(!Array.isArray(q.stages) || q.stages.length===0) push({type:'quest.no.stages', questId: q.id}); }

// enemyGroups shape (if present must be array of objects with id and enemies array)
if(enemyGroups !== null){
  if(!Array.isArray(enemyGroups)) push({type:'enemyGroups.notArray', value: enemyGroups});
  else for(const eg of enemyGroups){ if(!eg || typeof eg.id!=='string' || !Array.isArray(eg.enemies)) push({type:'enemyGroup.invalid', id: eg && eg.id}); }
}

if(issues.length===0){ console.log('No shape issues detected (basic checks passed).'); process.exit(0); }
console.log('Detected content shape issues (showing up to 200):');
for(const it of issues) console.log(JSON.stringify(it));
process.exit(2);
