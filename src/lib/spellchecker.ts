import { QUICK_FIXES, VOCATIVE_RULES, type VocativeRule } from "./spellcheck-dicts";

/**
 * Regex que casa palavras em qualquer idioma.
 * Usa \p{L} (Unicode Letter) — cobre Latin, Cyrillic, Arabic, Devanagari, CJK, Hangul, etc.
 * Suportado em todos os browsers modernos.
 */
const WORD_RE = /[\p{L}']+/gu;

/**
 * Deteta o idioma dominante de um texto.
 * Usa heurística de range Unicode — O(n), zero rede.
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
    // Latin scripts — conta para todos os idiomas latinos
    if ((c >= 0x0041 && c <= 0x024F) || (c >= 0x1E00 && c <= 0x1EFF)) {
      counts.en++; counts.pt++; counts.es++; counts.fr++;
      counts.de++; counts.it++; counts.tr++;
    }
  }

  // CJK: japonês também usa hiragana/katakana, chinês é só CJK
  if (counts.ja > 0) return "ja";
  if (counts.ko > 0) return "ko";
  if (counts.ar > 0 && counts.ar > counts.ru) return "ar";
  if (counts.hi > 0 && counts.hi > counts.ru) return "hi";
  if (counts.ru > 0 && counts.ru > counts.en * 0.1) return "ru";
  if (counts.zh > 0) return "zh";

  // Latin — default PT (idioma principal do site)
  return "pt";
}

/**
 * Resolve o código de idioma para exibição.
 */
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

/**
 * Retorna lista de idiomas disponíveis.
 */
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
 * Corrige um texto aplicando QUICK_FIXES e VOCATIVE_RULES.
 * Lookup O(1) por palavra — zero rede, zero bloqueio.
 */
export function correctText(text: string, lang?: string): string {
  const language = lang || detectLang(text);
  const fixes = QUICK_FIXES[language];
  const vocatives = VOCATIVE_RULES[language];

  if (!fixes && !vocatives?.length) return text;

  let result = text;

  // 1. Aplica QUICK_FIXES (substituição de palavras)
  if (fixes) {
    result = result.replace(WORD_RE, (word) => {
      const lower = word.toLowerCase();
      const fix = fixes[lower];
      if (!fix) return word;
      // Preserva maiúscula: se a palavra original começa com maiúscula,
      // aplica a mesma capitalização na correção.
      if (word[0] !== word[0].toLowerCase() && fix[0]) {
        return fix[0].toUpperCase() + fix.slice(1);
      }
      return fix;
    });
  }

  // 2. Aplica VOCATIVE_RULES (vírgulas de vocativo)
  if (vocatives?.length) {
    for (const [regex, replacement] of vocatives) {
      result = result.replace(regex, replacement);
    }
  }

  return result;
}

/**
 * Versão lightweight para preview (só primeiras N palavras).
 */
export function correctTextPreview(text: string, lang?: string, maxWords = 30): string {
  const words = text.split(/(\s+)/);
  let count = 0;
  let preview = "";
  for (const w of words) {
    preview += w;
    if (/\S/.test(w)) count++;
    if (count >= maxWords) break;
  }
  return correctText(preview, lang);
}
