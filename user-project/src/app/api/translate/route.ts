import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, string>();
const MAX_CACHE = 5000;

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLang } = await req.json();
    if (!texts || !Array.isArray(texts) || !targetLang) {
      return NextResponse.json({ translations: {} }, { status: 400 });
    }

    const langMap: Record<string, string> = {
      en: "en", es: "es", fr: "fr", de: "de", ru: "ru",
    };
    const target = langMap[targetLang] || "en";
    const translations: Record<string, string> = {};
    const toFetch: string[] = [];

    for (const text of texts) {
      const key = `${target}:${text}`;
      if (cache.has(key)) {
        translations[text] = cache.get(key)!;
      } else {
        toFetch.push(text);
      }
    }

    if (toFetch.length > 0) {
      try {
        const pairs = toFetch
          .map((t) => `pt|${encodeURIComponent(t)}|${target}`)
          .join("&pair=");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${pairs}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        const data = await res.json();
        const responseData = data.responseData || [];
        for (const item of responseData) {
          const translated = item.translatedText;
          if (translated && translated !== item.query) {
            translations[item.query] = translated;
            const cacheKey = `${target}:${item.query}`;
            cache.set(cacheKey, translated);
            if (cache.size > MAX_CACHE) {
              const firstKey = cache.keys().next().value;
              if (firstKey) cache.delete(firstKey);
            }
          }
        }
      } catch {
        // API failed, just return what we have from cache
      }
    }

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ translations: {} }, { status: 500 });
  }
}
