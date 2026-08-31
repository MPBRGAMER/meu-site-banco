/**
 * Corretor ortográfico usando LanguageTool API.
 * A correção é feita no cliente via /api/spellcheck.
 * Este arquivo mantém: detectLang, resolveLang, getLangOptions, getSiteSpellLang.
 */

/**
 * Mapeia códigos internos do site (dayr-language) para códigos LT.
 * Todos os 13 idiomas do site estão cobertos.
 */
const SITE_TO_LT: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es",
  fr: "fr",
  de: "de",
  ru: "ru",
  it: "it",
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW",
  ko: "ko",
  ja: "ja",
  id: "id",
  tr: "tr",
};

/**
 * Retorna o código LT correspondente ao idioma atual do site.
 * Lê localStorage("dayr-language") no cliente.
 * Se estiver no SSR ou o idioma não for mapeado, retorna null.
 */
export function getSiteSpellLang(): string | null {
  if (typeof window === "undefined") return null;
  const siteLang = localStorage.getItem("dayr-language") || "pt";
  return SITE_TO_LT[siteLang] || null;
}

/**
 * Deteta o idioma dominante de um texto (fallback quando não há preferência de site).
 */
export function detectLang(text: string): string {
  if (!text.length) return "pt-BR";

  let counts: Record<string, number> = {
    ja: 0, zh: 0, ko: 0, ar: 0, hi: 0, ru: 0,
    en: 0, pt: 0, es: 0, fr: 0, de: 0, it: 0, tr: 0, id: 0,
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
      counts.de++; counts.it++; counts.tr++; counts.id++;
    }
  }

  if (counts.ja > 0) return "ja";
  if (counts.ko > 0) return "ko";
  if (counts.ar > 0 && counts.ar > counts.ru) return "ar";
  if (counts.hi > 0 && counts.hi > counts.ru) return "hi";
  if (counts.ru > 0 && counts.ru > counts.en * 0.1) return "ru";
  if (counts.zh > 0) return "zh-CN";
  return "pt-BR";
}

/**
 * Resolve um código de idioma para o nome nativo de exibição.
 */
export function resolveLang(code: string): string {
  const map: Record<string, string> = {
    "pt-BR": "Português (BR)", "pt-PT": "Português (PT)", pt: "Português",
    "en-US": "English (US)", "en-GB": "English (GB)", en: "English",
    es: "Español", fr: "Français", de: "Deutsch", it: "Italiano",
    tr: "Türkçe", ru: "Русский",
    ja: "日本語", "zh-CN": "简体中文", "zh-TW": "繁體中文", ko: "한국어",
    ar: "العربية", hi: "हिन्दी", id: "Indonesia",
  };
  return map[code] || code;
}

/**
 * Retorna todas as opções de idioma para o seletor de correção.
 * Inclui Auto + todos os 13 idiomas do site + ar + hi.
 */
export function getLangOptions(): { value: string; label: string }[] {
  return [
    { value: "auto", label: "Auto" },
    { value: "pt-BR", label: "Português (BR)" },
    { value: "en-US", label: "English (US)" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "ru", label: "Русский" },
    { value: "it", label: "Italiano" },
    { value: "zh-CN", label: "简体中文" },
    { value: "zh-TW", label: "繁體中文" },
    { value: "ko", label: "한국어" },
    { value: "ja", label: "日本語" },
    { value: "id", label: "Indonesia" },
    { value: "tr", label: "Türkçe" },
    { value: "ar", label: "العربية" },
    { value: "hi", label: "हिन्दी" },
  ];
}