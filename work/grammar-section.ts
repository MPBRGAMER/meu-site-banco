export const GRAMMAR_RULES: Record<string, GrammarRule[]> = {
  pt: [
    // Vírgula antes de conjunções adversativas (mas, porém, contudo...)
    [/([A-Za-z\u00C0-\u024F])(\s+)(mas|por\u00E9m|contudo|todavia|entretanto)\b/gi, "$1,$2$3"],
    // Vírgula antes de conclusivas (portanto, logo)
    [/([A-Za-z\u00C0-\u024F])(\s+)(portanto|logo|consequentemente)\b/gi, "$1,$2$3"],
    // Vírgula em vocativos (oi cara blz → oi, cara blz)
    [/(^|\s)([A-Za-z\u00C0-\u024F][a-z\u00C0-\u024F]+)(\s+(?:cara|mano|brother|pessoa|gente|amor|querido|querida|amigo|amiga|filho|filha|m\u00E3e|pai|chefe|senhor|senhora|doutor|doutora|professor|professora|mo\u00E7o|mo\u00E7a|garoto|garota|rapaz))([^,.!?]|$)/g, "$1$2,$3$4"],
    // Espaço depois de vírgula
    [/,(?=[A-Za-z\u00C0-\u024F0-9])/g, ", "],
    // Espaço depois de ponto-e-vírgula
    [/;(?=[A-Za-z\u00C0-\u024F0-9])/g, "; "],
  ],
  en: [
    // Comma before conjunctions
    [/([A-Za-z])(\s+)(?:but|however|nevertheless|therefore|furthermore|moreover|consequently|meanwhile)\b(?=\s+[a-z])/gi, "$1,$2$3"],
    [/,(?=[A-Za-z0-9])/g, ", "],
  ],
  es: [
    [/([A-Za-z\u00E1\u00E9\u00ED\u00F3\u00FA\u00F1\u00FC])(\s+)(?:pero|sin embargo|no obstante|por lo tanto|por consiguiente)\b/gi, "$1,$2$3"],
    [/,(?=[A-Za-z0-9])/g, ", "],
  ],
  fr: [
    [/([A-Za-z\u00E0\u00E2\u00E4\u00E9\u00E8\u00EA\u00EB\u00EF\u00EE\u00F4\u00F9\u00FB\u00FC\u00FF\u00E7])(\s+)(?:mais|cependant|n\u00E9anmoins|toutefois|pourtant|donc|par cons\u00E9quent)\b/gi, "$1,$2$3"],
    [/,(?=[A-Za-z0-9])/g, ", "],
  ],
  de: [/,(?=[A-Za-z0-9])/g, ", "],
  it: [
    [/([A-Za-z\u00E0\u00E8\u00E9\u00EC\u00ED\u00EE\u00F2\u00F3\u00F9\u00FA])(\s+)(?:ma|per\u00F2|tuttavia|dunque|quindi|pertanto)\b/gi, "$1,$2$3"],
    [/,(?=[A-Za-z0-9])/g, ", "],
  ],
  tr: [],
  ru: [],
  ja: [],
  zh: [],
  ko: [],
  ar: [],
  hi: [],
};