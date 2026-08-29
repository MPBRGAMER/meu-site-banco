import fs from 'fs';

let content = fs.readFileSync('src/lib/spellcheck-dicts.ts', 'utf8');

// 1. Find and remove bad single-letter mappings from pt dict
const badKeys = ['a', 'e', 'i', 'o', 'u', 's', 'n', 'd', 'c', 'm', 'p', 'v', 'l', 't', 'q', 'r', 'f', 'g', 'h', 'b', 'j', 'k', 'w', 'x', 'y', 'z'];

let removed = 0;
for (const key of badKeys) {
  // Match "key": "value" as a complete line entry (not inside another word)
  const regex = new RegExp('^  "' + key + '"\\s*:\\s*"[^"]+",?$', 'gm');
  const matches = content.match(regex);
  if (matches) {
    console.log(`Removing: ${matches[0].trim()}`);
    content = content.replace(regex, '');
    removed++;
  }
}
console.log(`Removed ${removed} bad single-letter keys`);

// 2. Fix vocative rule - the last group was too restrictive (blocked spaces)
const oldVoc = /\(\[\^,.!?\\s\]\|\$\)/g;
const newVoc = '([^,.!?]|$)';
const vocBefore = content.match(/\[\^,.!?/g)?.length || 0;
content = content.replace(oldVoc, newVoc);
const vocAfter = content.match(/\[\^,.!?/g)?.length || 0;
console.log(`Vocative rule: ${vocBefore} -> ${vocAfter} occurrences`);

fs.writeFileSync('src/lib/spellcheck-dicts.ts', content);
console.log('Done!');
