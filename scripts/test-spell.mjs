import { QUICK_FIXES } from '../src/lib/spellcheck-dicts.ts';

const WORD_RE = /[A-Za-z\u00C0-\u017F\u1E00-\u1EFF]+/g;

function correctText(text) {
  const fixes = QUICK_FIXES.pt;
  if (!fixes) return text;
  return text.replace(WORD_RE, (word) => {
    const lower = word.toLowerCase();
    return fixes[lower] || word;
  });
}

const tests = [
  "voce eh legal",
  "nao sei pq",
  "tbm blz flw",
  "ola mundo",
  "VOCE",
  "Voce",
  "tudo bem",
  "q eh isso",
  "nada de errado",
];

for (const t of tests) {
  const r = correctText(t);
  console.log(JSON.stringify(t) + " => " + JSON.stringify(r) + (t === r ? " (no change)" : " (CORRECTED)"));
}

console.log("\nDict keys count pt:", Object.keys(QUICK_FIXES.pt).length);
console.log("Has voce key:", "voce" in QUICK_FIXES.pt);
console.log("Has eh key:", "eh" in QUICK_FIXES.pt);
console.log("Has q key:", "q" in QUICK_FIXES.pt);
console.log("Has n key:", "n" in QUICK_FIXES.pt);
