import { QUICK_FIXES, VOCATIVE_RULES } from '../src/lib/spellcheck-dicts.ts';

const WORD_RE = /[\p{L}']+/gu;

function detectLang(text) {
  for (const ch of text) {
    const c = ch.codePointAt(0) || 0;
    if (c >= 0x3040 && c <= 0x30FF) return 'ja';
    if (c >= 0x4E00 && c <= 0x9FFF) return 'zh';
    if (c >= 0xAC00 && c <= 0xD7AF) return 'ko';
    if (c >= 0x0600 && c <= 0x06FF) return 'ar';
    if (c >= 0x0900 && c <= 0x097F) return 'hi';
    if (c >= 0x0400 && c <= 0x04FF) return 'ru';
  }
  return 'pt';
}

function correctText(text) {
  const language = detectLang(text);
  const fixes = QUICK_FIXES[language];
  const vocatives = VOCATIVE_RULES[language];
  if (!fixes && !vocatives?.length) return text;
  let result = text;
  if (fixes) {
    result = result.replace(WORD_RE, (word) => {
      const lower = word.toLowerCase();
      const fix = fixes[lower];
      if (!fix) return word;
      if (word[0] !== word[0].toLowerCase() && fix[0]) {
        return fix[0].toUpperCase() + fix.slice(1);
      }
      return fix;
    });
  }
  if (vocatives?.length) {
    for (const [regex, replacement] of vocatives) {
      result = result.replace(regex, replacement);
    }
  }
  return result;
}

const tests = [
  'voce eh legal',
  'nao sei pq',
  'tbm blz flw',
  'q eh isso',
  'oi cara blz',
  'e ai mano tudo bem',
  'VOCE EH LEGAL',
  'Voce eh legal',
  'a gente precisa conversar',
  'nada de errado aqui',
];

console.log('=== TESTE SPELLCHECKER (regex \\p{L}) ===');
for (const t of tests) {
  const r = correctText(t);
  const icon = t === r ? '  ' : '✅';
  console.log(icon, JSON.stringify(t), '=>', JSON.stringify(r));
}

console.log('\n=== VOCATIVE RULES ===');
const vocTests = [
  'oi cara blz',
  'e ai mano',
  'Oi cara blz',
  'E ai mano tudo bem',
  'ola amigo como vai',
];
for (const t of vocTests) {
  const r = correctText(t);
  console.log(JSON.stringify(t), '=>', JSON.stringify(r));
}

console.log('\nDict pt keys:', Object.keys(QUICK_FIXES.pt).length);
console.log('Has voce:', 'voce' in QUICK_FIXES.pt, '->', QUICK_FIXES.pt['voce']);
console.log('Has eh:', 'eh' in QUICK_FIXES.pt, '->', QUICK_FIXES.pt['eh']);
console.log('Has pq:', 'pq' in QUICK_FIXES.pt, '->', QUICK_FIXES.pt['pq']);
