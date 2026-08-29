import fs from 'fs';

let c = fs.readFileSync('src/lib/spellcheck-dicts.ts', 'utf8');

// Find the pt section and add entries after 'pvp': 'PvP',
const target = '"pvp": "PvP",';
const idx = c.indexOf(target);
if (idx !== -1 && !c.includes('"q": "que"')) {
  const insert = '\n  "q": "que",\n  "n": "não",';
  c = c.substring(0, idx + target.length) + insert + c.substring(idx + target.length);
  fs.writeFileSync('src/lib/spellcheck-dicts.ts', c);
  console.log('Restored q->que and n->nao');
} else {
  console.log('Already present or not found. Has q:', c.includes('"q": "que"'));
}