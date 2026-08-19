import { NextRequest, NextResponse } from "next/server";

const LANG_MAP: Record<string, string> = { en: "en", es: "es", fr: "fr", de: "de", ru: "ru" };
const cache = new Map<string, string>();
const MAX_CACHE = 5000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { texts, targetLang } = body as { texts: string[]; targetLang: string };
    if (!texts?.length || !targetLang || targetLang === "pt") return NextResponse.json({ translations: texts || [] });
    const ltLang = LANG_MAP[targetLang];
    if (!ltLang) return NextResponse.json({ translations: texts });

    const results: string[] = [];
    const toTranslate: { idx: number; text: string }[] = [];
    for (let i = 0; i < texts.length; i++) {
      const t = texts[i];
      if (!t || t.trim().length === 0) { results.push(t); }
      else if (cache.has(`pt:${ltLang}:${t}`)) { results.push(cache.get(`pt:${ltLang}:${t}`)!); }
      else { results.push(t); toTranslate.push({ idx: i, text: t }); }
    }
    if (toTranslate.length === 0) return NextResponse.json({ translations: results });

    try {
      const uniqueTexts = [...new Set(toTranslate.map(t => t.text))];
      const responses = await Promise.allSettled(
        uniqueTexts.map(async (text) => {
          if (text.length > 500) return text;
          const resp = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${ltLang}`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (!resp.ok) return text;
          const data = await resp.json();
          return data?.responseData?.translatedText || text;
        })
      );
      const translationMap = new Map<string, string>();
      uniqueTexts.forEach((text, i) => {
        const result = responses[i];
        if (result.status === "fulfilled") {
          translationMap.set(text, result.value);
          cache.set(`pt:${ltLang}:${text}`, result.value);
          if (cache.size > MAX_CACHE) { const first = cache.keys().next().value; if (first) cache.delete(first); }
        }
      });
      for (const { idx, text } of toTranslate) results[idx] = translationMap.get(text) || text;
    } catch { /* API failed */ }
    return NextResponse.json({ translations: results });
  } catch { return NextResponse.json({ error: "Translation failed" }, { status: 500 }); }
}
