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

/**
 * Supplementary Portuguese corrections that LanguageTool consistently misses.
 * Maps common misspellings to the correct word.
 * Only covers high-frequency patterns where LT's MORFOLOGIK dictionary fails.
 */
const PT_SUPPLEMENTS: Record<string, string[]> = {
  // Common tilde/diphthong errors
  "pãum": ["pão"],
  "paum": ["pão"],
  "pam": ["pão"],
  "pãe": ["pão"],
  "coraçum": ["coração"],
  "coracaum": ["coração"],
  "coracam": ["coração"],
  "irmãum": ["irmão"],
  "irmaum": ["irmão"],
  "irmam": ["irmão"],
  "pessuas": ["pessoas"],
  "pesoas": ["pessoas"],
  // Common nh/l confusion
  "senhor": [],  // valid, skip
  "tenho": [],   // valid, skip
  "manha": ["manhã"],
  "manha": ["manhã"],
  // Common s/z confusion in PT-BR
  "fazer": [],   // valid, skip
  "vez": [],     // valid, skip
  // Missing or wrong accents
  " voce": [" você"],
  "tambem": ["também"],
  "tanmar": ["também"],
  "so": ["só"],
  "ja": ["já"],
  "nao": ["não"],
  "não": [],    // valid
  "porem": ["porém"],
  "ninguem": ["ninguém"],
  "alguem": ["alguém"],
  "ate": ["até"],
  "voce": ["você"],
  "poque": ["porque"],
  "por que": [], // valid
  "tbm": ["também"],
  "vc": ["você"],
  "blz": ["beleza"],
  "q": ["que"],
  "kd": ["cadê"],
  "pq": ["porque"],
  "cmg": ["comigo"],
  "c": ["que"],
  "td": ["tudo"],
  "nmr": ["número"],
  "flw": [], // slang, don't correct
};

/**
 * For words not in the supplements map, try common PT patterns.
 * Returns extra suggestions or empty array.
 */
function getSupplementarySuggestions(word: string, existingSuggestions: string[]): string[] {
  const lower = word.toLowerCase();

  // Direct map lookup
  if (PT_SUPPLEMENTS[lower] && PT_SUPPLEMENTS[lower].length > 0) {
    // Only add if not already suggested by LT
    const extras = PT_SUPPLEMENTS[lower].filter(s => !existingSuggestions.includes(s));
    return extras;
  }

  const extras: string[] = [];

  // Pattern: word ending in "um" that should end in "ão"
  if (lower.endsWith("um") && lower.length >= 3) {
    const base = lower.slice(0, -2); // remove "um"
    // Check if base + ão is a common word
    const commonAcao = ["p", "coraç", "irm", "pã", "capit", "cidad", "condiç", "naç", "opç", "sensaç", "situaç", "organizaç", "informaç", "comunicaç", "educaç", "populaç", "formaç", "procuraç", "proteç", "preparaç", "avaliaç", "navegaç", "alimentaç"];
    for (const prefix of commonAcao) {
      if (base.endsWith(prefix)) {
        const candidate = base + "ão";
        if (!existingSuggestions.includes(candidate)) {
          extras.push(candidate);
        }
        break;
      }
    }
  }

  // Pattern: missing accent on "em" words (tambem → também, etc.)
  const emWords: Record<string, string> = {
    "tambem": "também", "ninguem": "ninguém", "alguem": "alguém",
    "alem": "além", "aquem": "alguém", "ninguem": "ninguém",
    "problema": "", "sistema": "", "termometro": "termômetro",
  };
  if (emWords[lower] && emWords[lower] && !existingSuggestions.includes(emWords[lower])) {
    extras.push(emWords[lower]);
  }

  return extras;
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

    // Build matches with suggestions from LT + supplements
    const matches: MatchData[] = allMatches
      .filter((m) => {
        const reps = (m.replacements || []) as Array<Record<string, string>>;
        return reps.length > 0;
      })
      .map((m) => {
        const reps = (m.replacements || []) as Array<Record<string, string>>;
        const ltSuggestions = reps.map((r) => r.value).slice(0, 6);
        const originalWord = trimmed.slice(m.offset as number, (m.offset as number) + (m.length as number));
        const extras = getSupplementarySuggestions(originalWord, ltSuggestions);
        // Put supplementary suggestions FIRST (they're usually more accurate for PT-BR)
        const suggestions = [...extras, ...ltSuggestions].slice(0, 6);
        return {
          offset: m.offset as number,
          length: m.length as number,
          original: originalWord,
          message: (m.message as string).slice(0, 100),
          suggestions,
        };
      });

    // Also check for supplementary-only matches (words LT missed entirely)
    const ltOffsets = new Set(matches.map(m => m.offset));
    const words = trimmed.split(/(\s+)/);
    let currentOffset = 0;
    for (const segment of words) {
      if (/^\s+$/.test(segment)) {
        currentOffset += segment.length;
        continue;
      }
      if (segment.length < 2) {
        currentOffset += segment.length;
        continue;
      }
      const lower = segment.toLowerCase();
      // Only check words that look like actual misspellings (not URLs, numbers, etc.)
      if (/^[a-záàâãéèêíïóôõöúçñ]+$/i.test(lower)) {
        const supplementary = getSupplementarySuggestions(segment, []);
        if (supplementary.length > 0 && !ltOffsets.has(currentOffset)) {
          // Check if this word was NOT already flagged by LT
          const ltWordAtOffset = matches.find(m => m.offset === currentOffset);
          if (!ltWordAtOffset) {
            matches.push({
              offset: currentOffset,
              length: segment.length,
              original: segment,
              message: "Possível erro ortográfico",
              suggestions: supplementary,
            });
          }
        }
      }
      currentOffset += segment.length;
    }

    cache.set(cacheKey, { matches, ts: Date.now() });

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [], error: "Failed to check text" });
  }
}
