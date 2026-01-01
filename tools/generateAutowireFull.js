const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const questsPath = path.join(contentDir, 'quests.json');
if (!fs.existsSync(questsPath)) {
  console.error('quests.json not found in content/ — run mergeContent first');
  process.exit(2);
}
const quests = JSON.parse(fs.readFileSync(questsPath,'utf8'));

const area = {
  id: 'c_autowire_full',
  title: 'Autowire: Quest Start/Complete Hub',
  text: 'Autowire hub: start and complete any quest for testing.',
  imagePrompt: 'A cluttered table with quest sheets and ribbons for testing hooks.',
  choices: []
};

for (const q of quests) {
  area.choices.push({ id: `start_${q.id}`, text: `Start ${q.id}`, effects: [ { type: 'startQuest', key: q.id, questId: q.id } ] });
  area.choices.push({ id: `complete_${q.id}`, text: `Complete ${q.id}`, effects: [ { type: 'completeQuest', key: q.id, questId: q.id } ] });
}

const outPath = path.join(contentDir, 'areas_autowire_full.json');
fs.writeFileSync(outPath, JSON.stringify([area], null, 2), 'utf8');
console.log('Wrote', outPath, 'with', area.choices.length, 'choices');
