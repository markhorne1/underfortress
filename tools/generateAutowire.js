const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const questsPath = path.join(contentDir, 'quests.json');
if (!fs.existsSync(questsPath)) {
  console.error('quests.json not found in content/');
  process.exit(2);
}
const quests = JSON.parse(fs.readFileSync(questsPath,'utf8'));

const area = {
  id: 'c_autowire_hub',
  title: 'Campaign Wiring Hub',
  text: 'Developer hub: start/complete quests for wiring and testing.',
  imagePrompt: 'A small wooden table with maps, tokens, and a ledger of quest hooks.',
  choices: []
};

for (const q of quests) {
  area.choices.push({ id: `start_${q.id}`, text: `Start ${q.id}`, effects: [{ type: 'startQuest', questId: q.id }] });
  area.choices.push({ id: `complete_${q.id}`, text: `Complete ${q.id}`, effects: [{ type: 'completeQuest', questId: q.id }] });
}

const outPath = path.join(contentDir, 'areas_autowire.json');
fs.writeFileSync(outPath, JSON.stringify([area], null, 2), 'utf8');
console.log('Wrote', outPath, 'with', area.choices.length, 'choices');
