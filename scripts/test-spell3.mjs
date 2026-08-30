/**
 * Teste completo do spellchecker v2
 * Execute: npx tsx scripts/test-spell3.mjs
 */
import { correctText, correctTextPreview, getCorrectionDiff, getDictStats, detectLang } from '../src/lib/spellchecker.ts';

let passed = 0;
let failed = 0;

function test(desc, input, expected, lang) {
  const result = correctText(input, lang);
  const ok = result === expected;
  if (ok) {
    passed++;
    console.log(`  PASS: ${desc}`);
    console.log(`        "${input}" → "${result}"`);
  } else {
    failed++;
    console.log(`  FAIL: ${desc}`);
    console.log(`        input:    "${input}"`);
    console.log(`        expected: "${expected}"`);
    console.log(`        got:      "${result}"`);
  }
}

// Dict stats
const stats = getDictStats();
console.log('=== Dict Stats ===');
console.log(JSON.stringify(stats, null, 2));
console.log(`Total: ${Object.values(stats).reduce((a,b)=>a+b,0)} entries\n`);

// === PORTUGUES ===
console.log('=== PORTUGUES ===');

test('abreviacao vc', 'vc eh legal', 'você é legal', 'pt');
test('abreviacao pq', 'pq nao?', 'porque não?', 'pt');
test('abreviacao tbm', 'tbm quero', 'também quero', 'pt');
test('acento voce', 'voce vem?', 'você vem?', 'pt');
test('acento nao', 'nao sei', 'não sei', 'pt');
test('acento eh', 'eh isso', 'é isso', 'pt');
test('acento tambem', 'tambem pode', 'também pode', 'pt');
test('acento ja', 'ja foi', 'já foi', 'pt');
test('acento so', 'so eu', 'só eu', 'pt');
test('acento ate', 'ate agora', 'até agora', 'pt');
test('vocativo', 'oi cara blz', 'oi, cara beleza', 'pt');
test('vocativo 2', 'eai mano', 'eai, mano', 'pt');
test('virgula mas', 'queria ir mas nao deu', 'queria ir, mas não deu', 'pt');
test('virgula porem', 'tentei porem falhei', 'tentei, porém falhei', 'pt');
test('virgula portanto', 'choveu portanto fiquei', 'choveu, portanto fiquei', 'pt');
test('virgula logo', 'estudou logo passou', 'estudou, logo passou', 'pt');
test('espaco virgula', 'ola,mundo', 'ola, mundo', 'pt');
test('maiuscula pos ponto', 'oi. tudo bem?', 'oi. Tudo bem?', 'pt');
test('combinado', 'voce eh legal mas cara eu nao sei pq nao fui', 'você é legal, mas, cara eu não sei porque não fui', 'pt');

// === ENGLISH ===
console.log('\n=== ENGLISH ===');
test('contraction dont', 'dont do that', "don't do that", 'en');
test('contraction cant', 'cant go', "can't go", 'en');
test('abbreviation btw', 'btw I think so', 'by the way I think so', 'en');
test('misspelling recieve', 'I recieve the letter', 'I receive the letter', 'en');
test('comma but', 'I tried but it failed', 'I tried, but it failed', 'en');
test('comma however', 'it was hard however I managed', 'it was hard, however I managed', 'en');

// === ESPANOL ===
console.log('\n=== ESPANOL ===');
test('abreviacion tq', 'tq amigo', 'te quiero amigo', 'es');
test('abreviacion xq', 'xq no viene', 'por qué no viene', 'es');
test('abreviacion tb', 'tb quiero', 'también quiero', 'es');
test('coma pero', 'quiero ir pero no puedo', 'quiero ir, pero no puedo', 'es');

// === FRANCES ===
console.log('\n=== FRANCAIS ===');
test('abreviation mdr', 'c trop mdr', 'c trop mort de rire', 'fr');
test('abreviation svp', 'aidez moi svp', 'aidez moi s\'il vous plaît', 'fr');
test('ca -> ca', 'ca va bien', 'ça va bien', 'fr');

// === Diff ===
console.log('\n=== DIFF ===');
const diff = getCorrectionDiff('voce eh legal mas cara', 'você é legal, mas, cara');
if (diff) {
  console.log('Diff segments:');
  for (const s of diff) {
    console.log(`  [${s.changed ? 'CHANGED' : 'same'}] "${s.text}"`);
  }
  passed++;
} else {
  console.log('FAIL: diff returned null');
  failed++;
}

// === DETECT LANG ===
console.log('\n=== DETECT LANG ===');
console.log(`"hello world" → ${detectLang('hello world')}`);
console.log(`"こんにちは" → ${detectLang('こんにちは')}`);
console.log(`"안녕하세요" → ${detectLang('안녕하세요')}`);
console.log(`"olá mundo" → ${detectLang('olá mundo')}`);

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
