const fs = require('fs');
const f = 'src/components/banco/TranslationPopup.tsx';
let c = fs.readFileSync(f, 'utf8');

// Find the engine section boundaries
const engineStart = c.indexOf('/* =====');
// Find the second occurrence (TRANSLATION ENGINE)
let idx = 0;
let engineSectionStart = -1;
while (idx < c.length) {
  const pos = c.indexOf('TRANSLATION ENGINE', idx);
  if (pos === -1) break;
  engineSectionStart = pos;
  idx = pos + 1;
}
// Go back to find the comment start
const commentStart = c.lastIndexOf('/* =====', engineSectionStart);

// Find the end: the line before EXPORTED HELPERS
const exportedHelp = c.indexOf('EXPORTED HELPERS');
const helpersComment = c.lastIndexOf('/* =====', exportedHelp);

console.log('Engine section:', commentStart, 'to', helpersComment);

const newEngine = `/* ============================================================
   TRANSLATION ENGINE
   ============================================================ */
const originalText = new WeakMap<Text, string>();
let observer: MutationObserver | null = null;
let currentLang = "pt";
let apiDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const apiCache = new Map<string, string>();
let isTranslating = false;

/** Strip diacritics: \"Aço\" → \"Aco\", \"Preço\" → \"Preco\" */
function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
}

function hasNoTranslateAncestor(node: Node): boolean {
  let el: Node | null = node.parentElement;
  while (el) {
    if (el instanceof HTMLElement && (el.hasAttribute("data-no-translate") || el.getAttribute("translate") === "no")) return true;
    el = el.parentElement;
  }
  return false;
}

/** Look up translation: lang dict → EN dict → accent-stripped → API cache */
function lookup(text: string, langCode: string, dictionary: Record<string, string> | undefined): string | undefined {
  const norm = stripAccents(text);
  if (langCode === "en") {
    return EN[text] || EN[norm] || apiCache.get(text) || apiCache.get(norm);
  }
  return dictionary?.[text] || EN[text] || dictionary?.[norm] || EN[norm] || apiCache.get(text) || apiCache.get(norm);
}

function translatePage(langCode: string) {
  if (isTranslating) return;
  isTranslating = true;
  try {
    currentLang = langCode;
    const dictionary = dictionaries[langCode];
    document.documentElement.lang = langCode === "pt" ? "pt-BR" : langCode;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if ("SCRIPT STYLE TEXTAREA INPUT".includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (hasNoTranslateAncestor(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);

    const untranslated: string[] = [];

    for (const textNode of nodes) {
      // Double-check no-translate (DOM may have changed since TreeWalker)
      if (hasNoTranslateAncestor(textNode)) continue;

      if (!originalText.has(textNode)) originalText.set(textNode, textNode.nodeValue || "");
      const source = originalText.get(textNode) || "";
      const trimmed = source.trim();
      if (!trimmed) continue;

      if (langCode === "pt") {
        if (textNode.nodeValue !== source) textNode.nodeValue = source;
        continue;
      }

      const translated = lookup(trimmed, langCode, dictionary);
      if (translated) {
        const nextValue = source === trimmed ? translated : source.replace(trimmed, translated);
        if (textNode.nodeValue !== nextValue) textNode.nodeValue = nextValue;
      } else if (trimmed.length > 2 && !/^\\d+[\\,\\d]*$/.test(trimmed) && !/^[#\\-+°×→←↑↓]*$/.test(trimmed)) {
        untranslated.push(trimmed);
      }
    }

    // Also translate placeholders and titles
    if (langCode !== "pt") {
      document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
        const htmlEl = el as HTMLInputElement;
        const ph = htmlEl.placeholder;
        if (!ph) return;
        const tr = lookup(ph, langCode, dictionary);
        if (tr) htmlEl.placeholder = tr;
      });
      document.querySelectorAll("[title]").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const t = htmlEl.getAttribute("title");
        if (!t) return;
        const tr = lookup(t, langCode, dictionary);
        if (tr) htmlEl.setAttribute("title", tr);
      });
    }

    // Debounced API fallback
    if (untranslated.length > 0 && langCode !== "pt") {
      queueApiTranslation(untranslated, langCode);
    }
  } finally {
    isTranslating = false;
  }
}

function queueApiTranslation(texts: string[], langCode: string) {
  if (apiDebounceTimer) clearTimeout(apiDebounceTimer);
  apiDebounceTimer = setTimeout(async () => {
    const unique = [...new Set(texts)].slice(0, 30);
    const toFetch = unique.filter((t) => !apiCache.has(t) && !apiCache.has(stripAccents(t)));
    if (toFetch.length === 0) return;
    try {
      const langMap: Record<string, string> = { en: "en", es: "es", fr: "fr", de: "de", ru: "ru" };
      const targetLang = langMap[langCode] || "en";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: toFetch, targetLang }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const translations: Record<string, string> = data.translations || {};
      for (const [key, val] of Object.entries(translations)) {
        if (val && val !== key) {
          apiCache.set(key, val);
          const norm = stripAccents(key);
          if (norm !== key) apiCache.set(norm, val);
        }
      }
      // Re-translate with new cache entries
      if (Object.keys(translations).length > 0) {
        translatePage(langCode);
      }
    } catch {
      // Silently fail - dictionary covers most strings
    }
  }, 400);
}

function setLanguage(code: string) {
  currentLang = code;
  localStorage.setItem("dayr-language", code);
  // Reset all text nodes to original before translating
  if (code === "pt") {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const orig = originalText.get(textNode);
      if (orig !== undefined && textNode.nodeValue !== orig) textNode.nodeValue = orig;
    }
    document.documentElement.lang = "pt-BR";
    if (observer) { observer.disconnect(); observer = null; }
    apiCache.clear();
    // Reset placeholders
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
      const htmlEl = el as HTMLInputElement;
      const key = htmlEl.getAttribute("data-original-placeholder");
      if (key) htmlEl.placeholder = key;
    });
    return;
  }

  translatePage(code);

  if (!observer) {
    let observerDebounce: ReturnType<typeof setTimeout> | null = null;
    observer = new MutationObserver(() => {
      if (observerDebounce) clearTimeout(observerDebounce);
      observerDebounce = setTimeout(() => translatePage(currentLang), 150);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
}
`;

c = c.substring(0, commentStart) + newEngine + c.substring(helpersComment);

fs.writeFileSync(f, c);
console.log('Done! Engine replaced.');
