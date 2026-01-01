#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const docPath = process.argv[2];
if (!docPath) {
  console.error('Usage: node tools/seed-from-design-doc.mjs <design.txt>');
  process.exit(1);
}

const text = fs.readFileSync(docPath, 'utf-8');

// Very conservative: produce stubs for headings that look like "# Area: id - Title"
const areaStubs = [];
const lines = text.split(/\r?\n/);
for (const line of lines) {
  const m = line.match(/^#\s*Area:\s*([a-z0-9_\-]+)\s*-\s*(.+)/i);
  if (m) {
    const id = m[1].trim();
    const title = m[2].trim();
    areaStubs.push({ id, title, x:0, y:0, imagePrompt: 'PLACEHOLDER: add prompt', description: 'TODO: write description' });
  }
}

const out = { areas: areaStubs };
fs.writeFileSync(path.join(process.cwd(), 'content/areas_draft.json'), JSON.stringify(out, null, 2));
console.log('Wrote content/areas_draft.json with', areaStubs.length, 'stubs');
