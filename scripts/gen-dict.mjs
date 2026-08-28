import fs from 'fs';

// ═══════════════════════════════════════════════════════════
// GERADOR DE DICIONÁRIO MASSIVO — 13 idiomas
// Gera spellcheck-dicts.ts com milhares de entradas
// ═══════════════════════════════════════════════════════════

let out = '';
out += '/**\n';
out += ' * Dicionário estático de correção ortográfica para 13 idiomas.\n';
out += ' * Lookup O(1) — zero rede, zero bloqueio.\n';
out += ' * Cada entrada mapeia palavra errada → palavra correta.\n';
out += ' * Gerado com cobertura massiva de erros comuns de digitação,\n';
out += ' * acentuação, confusões homofônicas e gírias da internet.\n';
out += ' */\n\n';
out += 'export type VocativeRule = [RegExp, string];\n\n';

function dictBlock(name, entries) {
  let s = `// ${'═'.repeat(60)}\n`;
  s += `// ${name}\n`;
  s += `// ${'═'.repeat(60)}\n`;
  s += `const ${name}: Record<string, string> = {\n`;
  // group entries by comment category
  let lines = [];
  for (const [wrong, right, comment] of entries) {
    if (comment) lines.push(`  // ${comment}`);
    lines.push(`  "${wrong}": "${right}",`);
  }
  s += lines.join('\n') + '\n};\n\n';
  return s;
}

// Helper: generate all unaccented → accented variants for a list
function accented(correct, wrongs) {
  return wrongs.map(w => [w, correct, null]);
}

// ═══════════════════════════════════════════════════════════
// PORTUGUÊS
// ═══════════════════════════════════════════════════════════
const ptEntries = [
  // ── Pronomes e formas reduzi