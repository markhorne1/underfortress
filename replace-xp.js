const fs = require('fs');
const path = require('path');

// Get the absolute path
const filePath = path.join(__dirname, 'content', 'areas.json');
console.log('Reading:', filePath);

// Read areas.json
let content = fs.readFileSync(filePath, 'utf8');

const originalCount = (content.match(/"type":\s*"addXP"/g) || []).length;
console.log(`Found ${originalCount} addXP instances`);

// Replace all addXP with addStatPoints
content = content.replace(/"type":\s*"addXP"/g, '"type": "addStatPoints"');

const newCount = (content.match(/"type":\s*"addStatPoints"/g) || []).length;

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✓ Replaced ${originalCount} addXP → addStatPoints`);
console.log(`✓ Total addStatPoints in file: ${newCount}`);
