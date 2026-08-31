import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

const LT_API = "https://api.languagetool.org/v2/check";

// Simple in-memory cache to avoid hammering LT on repeated texts
const cache = new Map<string, { corrected: string; ts: number }>();
const CACHE_TTL = 30_000; // 30s

function cleanCache() {
  const now = Date.now();
  for (const [key, val] of cache) {
    if (now - val.ts > CACHE_TTL) cache.delete(key);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ corrected: "", matches: [] });
    }

    const trimmed = text.trim();
    const cacheKey = `${language || "auto"}:${trimmed}`;

    // Check cache
    cleanCache();
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ corrected: cached.corrected, fromCache: true });
    }

    // Call LanguageTool API
    const formData = new URLSearchParams();
    formData.append("text", trimmed);
    formData.append("language", language || "auto");
    formData.append("enabledOnly", "false");

    const res = await fetch(LT_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!res.ok) {
      return NextResponse.json({ corrected: trimmed, matches: [], error: "LT API error" });
    }

    const data = await res.json();
    const matches: Array<{
      offset: number; length: number; message: string;
      rule: { id: string; description: string };
      suggestions: string[];
    }> = (data.matches || []).map((m: Record<string, unknown>) => ({
      offset: m.offset as number,
      length: m.length as number,
      message: (m.message as string).slice(0, 120),
      rule: { id: (m.rule as Record<string, string>).id, description: (m.rule as Record<string, string>).description },
      suggestions: ((m.replacements || []) as Array<Record<string, string>>).map((r) => r.value).slice(0, 3),
    }));

    // Apply corrections: sort by offset descending to replace from end
    let corrected = trimmed;
    const sorted = [...(data.matches || [])].sort(
      (a: Record<string, number>, b: Record<string, number>) => b.offset - a.offset
    );
    for (const m of sorted) {
      const replacements = (m.replacements || []) as Array<Record<string, string>>;
      if (replacements.length > 0) {
        corrected =
          corrected.slice(0, m.offset as number) +
          replacements[0].value +
          corrected.slice((m.offset as number) + (m.length as number));
      }
    }

    // Cache result
    cache.set(cacheKey, { corrected, ts: Date.now() });

    return NextResponse.json({ corrected, matches });
  } catch {
    return NextResponse.json({ corrected: text || "", matches: [], error: "Failed to check text" });
  }
}
