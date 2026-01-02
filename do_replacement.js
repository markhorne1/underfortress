const fs = require('fs');

// Read the file
const filePath = '/workspaces/underfortress/content/areas.json';
let content = fs.readFileSync(filePath, 'utf8');

// Count initial instances
const initialCount = (content.match(/"type": "addXP"/g) || []).length;
console.log(`Found ${initialCount} instances of "type": "addXP"`);

// Perform the replacement
content = content.replace(/"type": "addXP"/g, '"type": "addStatPoints"');

// Count remaining instances
const remainingCount = (content.match(/"type": "addXP"/g) || []).length;
console.log(`After replacement: ${remainingCount} instances remain`);
console.log(`Replaced: ${initialCount - remainingCount} instances`);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully!');
