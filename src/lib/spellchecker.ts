import { QUICK_FIXES, GRAMMAR_RULES } from "./spellcheck-dicts";

/**
 * Regex que casa palavras em qualquer idioma.
 * Usa \p{L} (Unicode Letter) — cobre Latin, Cyrillic, Arabic, Devanagari, CJK, Hangul, etc.
 */
const WORD_RE = /[\p{L}']+/gu;

/**
 * Deteta o idioma dominante de um texto.
 */
export function detectLang(text: string): string {
  const len = text.length;
  if (!len) return "pt";

  let counts: Record<string, number> = {
    ja: 0, zh: 0, ko: 0, ar: 0, hi: 0, ru: 0,
    en: 0, pt: 0, es: 0, fr: 0, de: 0, it: 0, tr: 0,
  };

  for (const ch of text) {
    const c = ch.codePointAt(0) || 0;
    if (c >= 0x3040 && c <= 0x30FF) { counts.ja++; continue; }
    if (c >= 0x4E00 && c <= 0x9FFF) { counts.zh++; continue; }
    if (c >= 0xAC00 && c <= 0xD7AF) { counts.ko++; continue; }
    if (c >= 0x0600 && c <= 0x06FF) { counts.ar++; continue; }
    if (c >= 0x0900 && c <= 0x097F) { counts.hi++; continue; }
    if (c >= 0x0400 && c <= 0x04FF) { counts.ru++; continue; }
    if ((c >= 0x0041 && c <= 0x024F) || (c >= 0x1E00 && c <= 0x1EFF)) {
      counts.en++; counts.pt++; counts.es++; counts.fr++;
      counts.de++; counts.it++; counts.tr++;
    }
  }

  if (counts.ja > 0) return "ja";
  if (counts.ko > 0) return "ko";
  if (counts.ar > 0 && counts.ar > counts.ru) return "ar";
  if (counts.hi > 0 && counts.hi > counts.ru) return "hi";
  if (counts.ru > 0 && counts.ru > counts.en * 0.1) return "ru";
  if (counts.zh > 0) return "zh";
  return "pt";
}

export function resolveLang(code: string): string {
  const map: Record<string, string> = {
    pt: "Português", en: "English", es: "Español",
    fr: "Français", de: "Deutsch", it: "Italiano",
    tr: "Türkçe", ru: "Русский",
    ja: "日本語", zh: "中文", ko: "한국어",
    ar: "العربية", hi: "हिन्दी",
  };
  return map[code] || code;
}

export function getLangOptions(): { value: string; label: string }[] {
  return [
    { value: "pt", label: "Português" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "tr", label: "Türkçe" },
    { value: "ru", label: "Русский" },
    { value: "ja", label: "日本語" },
    { value: "zh", label: "中文" },
    { value: "ko", label: "한국어" },
    { value: "ar", label: "العربية" },
    { value: "hi", label: "हिन्दी" },
  ];
}

/**
 * Retorna estatísticas do dicionário (para debug no browser).
 */
export function getDictStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const [lang, fixes] of Object.entries(QUICK_FIXES)) {
    stats[lang] = Object.keys(fixes).length;
  }
  return stats;
}

/**
 * Correção completa com múltiplos passes:
 * 1. Quick fixes (dicionário O(1))
 * 2. Regras gramaticais (vírgulas, crase, maiúsculas, pontuação)
 */
export function correctText(text: string, lang?: string): string {
  const language = lang || detectLang(text);
  let result = text;

  // 1. Quick Fixes — substituição de palavras
  const fixes = QUICK_FIXES[language];
  if (fixes && Object.keys(fixes).length > 0) {
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

  // 2. Regras Gramaticais
  const rules = GRAMMAR_RULES[language];
  if (rules?.length) {
    for (const [regex, replacement] of rules) {
      result = result.replace(regex, replacement);
    }
  }

  // 3. Pós-processamento universal (aplica a todos os idiomas)
  result = universalPostProcess(result);

  return result;
}

/**
 * Versão para preview — aplica correção completa ao texto inteiro.
 * Não trunca mais: o preview deve mostrar todas as correções visíveis.
 */
export function correctTextPreview(text: string, lang?: string): string {
  return correctText(text, lang);
}

/**
 * Retorna um diff entre original e corrigido para highlight no UI.
 * Retorna null se não há diferença.
 */
export interface DiffSegment {
  text: string;
  changed: boolean;
}

export function getCorrectionDiff(original: string, corrected: string): DiffSegment[] | null {
  if (original === corrected) return null;

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < original.length || j < corrected.length) {
    if (i < original.length && j < corrected.length && original[i] === corrected[j]) {
      // Encontrar trecho igual
      let end = 0;
      while (
        i + end < original.length &&
        j + end < corrected.length &&
        original[i + end] === corrected[j + end]
      ) {
        end++;
      }
      if (end > 0) {
        segments.push({ text: original.slice(i, i + end), changed: false });
        i += end;
        j += end;
      }
    } else {
      // Encontrar trecho diferente
      let origEnd = i;
      let corrEnd = j;
      // Avançar até encontrar o próximo caractere igual
      while (origEnd < original.length && corrEnd < corrected.length && original[origEnd] !== corrected[corrEnd]) {
        // Tentar encontrar ponto de reencontro
        const origNext = corrected.slice(corrEnd).indexOf(original[origEnd]);
        if (origNext >= 0) {
          corrEnd += origNext;
        } else {
          origEnd++;
          corrEnd++;
        }
      }
      if (origEnd === i && corrEnd === j) {
        // Fallback: avançar 1 caractere em cada
        if (i < original.length) origEnd = i + 1;
        if (j < corrected.length) corrEnd = j + 1;
      }
      if (corrEnd > j) {
        segments.push({ text: corrected.slice(j, corrEnd), changed: true });
        i = origEnd;
        j = corrEnd;
      } else {
        // Caractere removido no original
        if (i < original.length) {
          segments.push({ text: original[i], changed: true });
          i++;
        }
      }
    }
  }

  return segments.length > 0 ? segments : null;
}

/**
 * Pós-processamento universal aplicado a todos os idiomas.
 */
function universalPostProcess(text: string): string {
  let result = text;

  // Espaços duplos → espaço simples
  result = result.replace(/  +/g, " ");

  // Espaço antes de pontuação → remover
  result = result.replace(/\s+([.,!?;:])/g, "$1");

  // Sem espaço depois de vírgula/ponto-e-vírgula → adicionar
  result = result.replace(/([,;])([\S])/g, "$1 $2");

  // Espaço depois de ponto final se seguido de letra (nova frase)
  result = result.replace(/\.([A-Za-zÀ-ÿ])/g, ". $1");

  // Primeira letra maiúscula após ponto final, !, ?
  result = result.replace(/([.!?]\s+)([a-zà-ÿ])/g, (_, punct, letter) => punct + letter.toUpperCase());

  // Primeira letra maiúscula no início do texto
  if (result.length > 0) {
    result = result[0].toUpperCase() + result.slice(1);
  }

  // Remover espaço no início
  result = result.trimStart();

  // Remover espaços múltiplos antes de pontuação final
  result = result.replace(/\s+([.!?]+)$/g, "$1");

  // Vírgula antes de "e"/"ou" quando há 3+ itens na frase (heurística simples)
  // Ex: "x y e z" com padrão de lista → não mexer (pode ser ambíguo)
  // Mas adiciona vírgula depois de "Sim" "Não" etc. no início
  result = result.replace(/^(Sim|Não|Bem|Ora|Então|Agora|Pois|Claro|Certo|Exato)(\s+[A-Z])/gm, "$1,$2");

  return result;
}
