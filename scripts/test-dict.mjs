// Quick test: load generated TS dict using vm module
import { readFileSync } from "fs";
import vm from "vm";

const src = readFileSync("./src/lib/spellcheck-dicts.ts", "utf-8");

// Strip TS types properly
let js = src
  .replace(/^export type.*$/gm, "")
  .replace(/export const/g, "var")
  .replace(/: Record<string, Record<string, string>>/g, "")
  .replace(/: Record<string, VocativeRule\[\]>/g, "")
  .replace(/VocativeRule/g, "");

vm.runInThisContext(js);

// Test Portuguese
const ptFixes = QUICK_FIXES["pt"];
console.log("PT total entries:", Object.keys(ptFixes).length);
console.log('"voce" ->', ptFixes["voce"]);
console.log('"vc" ->', ptFixes["vc"]);
console.log('"nao" ->', ptFixes["nao"]);
console.log('"eh" ->', ptFixes["eh"]);
console.log('"pq" ->', ptFixes["pq"]);
console.log('"tb" ->', ptFixes["tb"]);
console.log('"hj" ->', ptFixes["hj"]);
console.log('"mt" ->', ptFixes["mt"]);
console.log('"agua" ->', ptFixes["agua"]);
console.log('"regiao" ->', ptFixes["regiao"]);

// Simulate the WORD_RE regex from spellchecker.ts
const WORD_RE = /[A-Za-z\u00C0-\u017F\u1E00-\u1EFF\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF'\u2019]+/g;

function correctText(text, lang) {
  const fixes = QUICK_FIXES[lang];
  if (!fixes) return text;
  return text.replace(WORD_RE, (word) => {
    const lower = word.toLowerCase();
    return fixes[lower] || word;
  });
}

// Test actual correction
const testCases = [
  "voce sabe pq hj ta mt bom",
  "nao eh assim",
  "teh quick brown fox",
  "definately wrong",
];

console.log("\n--- Correction tests ---");
for (const t of testCases) {
  const corrected = correctText(t, "pt");
  console.log(`IN:  "${t}"`);
  console.log(`OUT: "${corrected}"`);
  console.log(`CHANGED: ${corrected !== t}`);
  console.log();
}
