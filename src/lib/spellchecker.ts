/**
 * Corretor ortográfico usando LanguageTool API.
 * A correção é feita no cliente via /api/spellcheck.
 * Este arquivo mantém apenas: detectLang, resolveLang, getLangOptions.
 */

/**
 * Deteta o idioma dominante de um texto.
 */
export function detectLang(text: string): string {
  if (!text.length) return "pt";

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
    { value: "auto", label: "Auto" },
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
