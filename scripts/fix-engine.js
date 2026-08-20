const fs = require('fs');
const f = 'src/components/banco/TranslationPopup.tsx';
let c = fs.readFileSync(f, 'utf8');

// Line 1171 to 1325 (0-indexed: we find by content)
const startMarker = '/* ============================================================\n   TRANSLATION ENGINE';
const endMarker = '/* ============================================================\n   EXPORTED HELPERS';
const si = c.indexOf(startMarker);
const ei = c.indexOf(endMarker);
console.log('Start:', si, 'End:', ei);
if (si === -1 || ei === -1) { console.log('NOT FOUND'); process.exit(1); }

const newEngine = `/* ============================================================
   TRANSLATION ENGINE
   ============================================================ */
const originalText = new WeakMap<Text, string>();
let observer: MutationObserver | null = null;
let currentLang = "pt";
let apiDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const apiCache = new Map<string, string>();
let isTranslating = false;

/** Strip diacritics */
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
    let n: Node | null;
    while ((n = walker.nextNode())) nodes.push(n as Text);

    const untranslated: string[] = [];

    for (const textNode of nodes) {
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
      if (Object.keys(translations).length > 0) {
        translatePage(langCode);
      }
    } catch {
      // Silently fail
    }
  }, 400);
}

function setLanguage(code: string) {
  currentLang = code;
  localStorage.setItem("dayr-language", code);
  if (code === "pt") {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const textNode = n as Text;
      const orig = originalText.get(textNode);
      if (orig !== undefined && textNode.nodeValue !== orig) textNode.nodeValue = orig;
    }
    document.documentElement.lang = "pt-BR";
    if (observer) { observer.disconnect(); observer = null; }
    apiCache.clear();
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

c = c.substring(0, si) + newEngine + c.substring(ei);
fs.writeFileSync(f, c);
console.log('Engine replaced successfully!');