import { readFileSync, writeFileSync } from 'fs';

// Load new PT dict
const newPt = JSON.parse(readFileSync('/home/z/my-project/scripts/pt-dict-new.json', 'utf8'));

// Load existing spellcheck-dicts.ts
let content = readFileSync('/home/z/my-project/src/lib/spellcheck-dicts.ts', 'utf8');

// Find pt: { ... } section
const ptStart = content.indexOf('pt: {');
const ptEnd = content.indexOf('},', ptStart + 5);

if (ptStart === -1 || ptEnd === -1) {
  console.log('ERROR: Could not find pt dict section');
  process.exit(1);
}

console.log(`Found pt section at ${ptStart}-${ptEnd}`);

// Build new pt section
let ptBlock = 'pt: {\n';
for (const [k, v] of Object.entries(newPt)) {
  ptBlock += `  "${k}": "${v}",\n`;
}
ptBlock += '},\n';

// Replace
content = content.substring(0, ptStart) + ptBlock + content.substring(ptEnd + 2);

writeFileSync('/home/z/my-project/src/lib/spellcheck-dicts.ts', content);
console.log(`PT dict updated: ${Object.keys(newPt).length} entries`);
