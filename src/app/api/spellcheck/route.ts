import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

const LT_API = "https://api.languagetool.org/v2/check";

// Simple in-memory cache
const cache = new Map<string, { matches: MatchData[]; ts: number }>();
const CACHE_TTL = 30_000;

function cleanCache() {
  const now = Date.now();
  for (const [key, val] of cache) {
    if (now - val.ts > CACHE_TTL) cache.delete(key);
  }
}

export interface MatchData {
  offset: number;
  length: number;
  original: string;
  message: string;
  suggestions: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ matches: [] });
    }

    const trimmed = text.trim();
    const cacheKey = `${language || "auto"}:${trimmed}`;

    cleanCache();
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ matches: cached.matches, fromCache: true });
    }

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
      return NextResponse.json({ matches: [], error: "LT API error" });
    }

    const data = await res.json();
    const allMatches = (data.matches || []) as Array<Record<string, unknown>>;

    // Filter to only errors that have suggestions
    const matches: MatchData[] = allMatches
      .filter((m) => {
        const reps = (m.replacements || []) as Array<Record<string, string>>;
        return reps.length > 0;
      })
      .map((m) => {
        const reps = (m.replacements || []) as Array<Record<string, string>>;
        return {
          offset: m.offset as number,
          length: m.length as number,
          original: trimmed.slice(m.offset as number, (m.offset as number) + (m.length as number)),
          message: (m.message as string).slice(0, 100),
          suggestions: reps.map((r) => r.value).slice(0, 6),
        };
      });

    cache.set(cacheKey, { matches, ts: Date.now() });

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [], error: "Failed to check text" });
  }
}
