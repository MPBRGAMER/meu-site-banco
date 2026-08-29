import fs from 'fs';

let c = fs.readFileSync('src/lib/spellcheck-dicts.ts', 'utf8');

// The vocative rule's last group blocks spaces - need to remove \s from negation
// Direct string replacement
const oldStr = '([^,.!?\\s]|$)';
const newStr = '([^,.!?]|$)';

if (c.includes('\\s]|$)')) {
  c = c.replace(oldStr, newStr);
  fs.writeFileSync('src/lib/spellcheck-dicts.ts', c);
  console.log('Fixed vocative rule - removed \\s from negation');
} else {
  console.log('Pattern not found, checking raw content...');
  // Debug: show what's actually there
  const idx = c.indexOf('cara|mano');
  if (idx !== -1) {
    console.log('Around vocative rule:', JSON.stringify(c.substring(idx - 20, idx + 80)));
  }
}