// node scripts/gen-dict.mjs > src/lib/spellcheck-dicts.ts
import fs from 'fs';

const L = [];
const p = (s) => L.push(s);

p('/**');
p(' * Dicionário estático de correção ortográfica para 13 idiomas.');
p(' * Lookup O(1) — zero rede, zero bloqueio.');
p(' * Cada entrada mapeia palavra errada → palavra correta.');
 */');
p('');
p('export type VocativeRule = [RegExp, string];');
p('');

function unacc(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function addLang(name, entries) {
  p(`// ${'═'.repeat(60)}`);
  p(`// ${name}`);
  p(`// ${'═'.repeat(60)}`);
  p(`const ${name}: Record<string, string> = {`);
  for (const [wrong, right] of entries) {
    p(`  "${wrong}": "${right}",`);
  }
  p('};');
  p('');
}

// Helper to generate unaccented→accented mappings
function autoAccented(words) {
  const entries = [];
  const seen = new Set();
  for (const correct of words) {
    const wrong = unacc(correct);
    if (wrong !== correct && !seen.has(wrong)) {
      seen.add(wrong);
      entries.push([wrong, correct]);
    }
  }
  return entries;
}

// Helper for common internet slang → correct form
function slang(map) {
  return Object.entries(map);
}

// ═══════════════════════════════════════════════════════════
// 1. PORTUGUÊS (pt)
// ═══════════════════════════════════════════════════════════
const pt = [
  // ── Internet slang → correto ──
  ...slang({
    'vc':'você','vcs':'vocês','cê':'você','vhc':'você','vocêz':'você',
    'tbm':'também','tmb':'também','tb':'também','tp':'também',
    'pq':'porque','porke':'porque','porqe':'porque','porq':'porque','porqu':'porque','pk':'porque',
    'mt':'muito','mta':'muita','mtos':'muitos','mtas':'muitas','mutio':'muito','muio':'muito',
    'blz':'beleza','bhz':'beleza','vlw':'valeu','obg':'obrigado','obgd':'obrigado',
    'td':'tudo','tduo':'tudo','kd':'cadê','kde':'cadê',
    'q':'que','qro':'quero','qto':'quanto','qnts':'quantos','qdo':'quando',
    'pra':'para','pro':'para','pras':'para as','pros':'para os',
    'ta':'tá','tah':'tá','tavo':' 'tava','tamo':'tamos','tao':'tão',
    'numca':'nunca','nunka':'nunca','nunk':'nunca',
    'cmg':'comigo','cvc':'com você','aki':'aqui','ahí':'aí','lah':'lá',
    'axo':'acho','achow':'acho','nsei':'não sei','ne':'né',
    'msm':'mesmo','mmsm':'mesmo','snd':'sendo',
    'tjz':'talvez','tlz':'talvez','tlvz':'talvez',
    'dmr':'demorar','ctz':'certeza','ctza':'certeza',
    'bj':'beijo','bjs':'beijos','bjo':'beijo','bjsx':'beijos',
    'abç':'abraço','abçs':'abraços',
    'flw':'falou','t+':'tchau',
    'fascil':'fácil','facil':'fácil','dificil':'difícil',
    'possivel':'possível','impossivel':'impossível',
    'necessario':'necessário','necessaria':'necessária',
    'util':'útil','inutil':'inútil',
    'porem':'porém','ninguem':'ninguém','ninguen':'ninguém',
    'alguem':'alguém','alguen':'alguém','alem':'além','alemm':'além',
    'ate':'até','ateh':'até','jah':'já','soh':'só',
    'manha':'manhã','amanha':'amanhã','tres':'três','mes':'mês',
    'ceu':'céu','ceus':'céus','heroi':'herói','herois':'heróis',
    'duvida':'dúvida','saude':'saúde','doenca':'doença',
    'nois':'nós','pais':'país','vo':'vô','noe':'nó',
    'hj':'hoje','hoj':'hoje','ontem':'ontem','amanhã':'amanhã',
    'conosco':'conosco','convosco':'convosco',
    'k':'que','kk':'kk','kkk':'kkk',
    'ok':'ok','np':'não problema','npx':'não',
  }),

  // ── Confusões comuns ──
  ['a','a'],['mas','mas'],['mais','mais'],['bem','bem'],
  ['mim':'minha'], // NOT real, skip these
  // Actually let me just list the real ones:
  ['obrigado':'obrigado'], // identity, skip
];

// Hmm this is getting messy with mixed syntax. Let me rewrite this cleanly.
// The issue is I was mixing object syntax with array syntax.
// Let me use ONLY flat [wrong, right] arrays.

// REWRITE pt entries as flat arrays only:
const ptEntries = [
  // Internet slang
  ['vc','você'],['vcs','vocês'],['cê','você'],['vhc':'você'],
];
