#!/usr/bin/env python3
"""
Fix the existing spellcheck-dicts.ts:
1. Remove self-mapping entries (key === value)
2. Fix wrong entries (porque->porquê, bege->begê)
3. Add GRAMMAR_RULES with real comma/conjunction rules
4. Rename VOCATIVE_RULES -> GRAMMAR_RULES
"""
import re

INPUT = "/home/z/my-project/src/lib/spellcheck-dicts.ts"
OUTPUT = "/home/z/my-project/src/lib/spellcheck-dicts.ts"

with open(INPUT, "r") as f:
    content = f.read()

# --- FIX 1: Remove wrong entries ---
wrong_entries = [
    ('"porque": "porquê"', '"porque" is a valid word, do not map it'),
    ('"bege": "begê"', '"bege" is the correct spelling'),
]

for entry, reason in wrong_entries:
    if entry in content:
        # Remove the line containing this entry
        content = re.sub(r'^\s*' + re.escape(entry) + ',?\s*\n', '', content, flags=re.MULTILINE)
        print(f"Removed wrong entry: {reason}")

# --- FIX 2: Remove self-mapping entries ---
lines = content.split('\n')
fixed_lines = []
removed_self = 0
for line in lines:
    # Match "key": "value" patterns
    m = re.match(r'^\s*"([^"]+)": "([^"]+)"', line)
    if m:
        key = m.group(1)
        val = m.group(2)
        if key.lower() == val.lower():
            removed_self += 1
            continue
    fixed_lines.append(line)

content = '\n'.join(fixed_lines)
print(f"Removed {removed_self} self-mapping entries")

# --- FIX 3: Rename VOCATIVE_RULES to GRAMMAR_RULES and add real rules ---
old_vocative = '''export const VOCATIVE_RULES: Record<string, VocativeRule[]> = {
  pt: [
  [/(^|\s)([A-Za-zà-ÿ][a-zà-ÿ]+)(\s+(?:cara|mano|brother|pessoa|gente|amor|querido|querida|amigo|amiga|filho|filha|mãe|pai|chefe|senhor|senhora|doutor|doutora|professor|professora|moço|moça))([^,.!?]|$)/g, "$1$2,$3$4"],
],
  en: [],
  es: [],
  fr: [],
  de: [],
  it: [],
  tr: [],
  ru: [],
  ja: [],
  zh: [],
  ko: [],
  ar: [],
  hi: [],
};'''

new_grammar = '''export const GRAMMAR_RULES: Record<string, GrammarRule[]> = {
  pt: [
    // Vírgula antes de conjunções adversativas (mas, porém, contudo...)
    [/([A-Za-zà-ÿ])(\s+)(mas|porém|contudo|todavia|entretanto)\b/gi, "$1,$2$3"],
    // Vírgula antes de conclusivas (portanto, logo, pois)
    [/([A-Za-zà-ÿ])(\s+)(portanto|logo|consequentemente)\b/gi, "$1,$2$3"],
    // Vírgula em vocativos
    [/(^|\s)([A-Za-zà-ÿ][a-zà-ÿ]+)(\s+(?:cara|mano|brother|pessoa|gente|amor|querido|querida|amigo|amiga|filho|filha|mãe|pai|chefe|senhor|senhora|doutor|doutora|professor|professora|moço|moça|garoto|garota|rapaz))([^,.!?]|$)/g, "$1$2,$3$4"],
    // Vírgula antes de explicativas (porque no meio de frase)
    [/([A-Za-zà-ÿ])(\s+)(porque|pois)\b(?=\s+[a-zà-ÿ])/gi, "$1,$2$3"],
    // Espaço depois de vírgula
    [/,(\S)/g, ", $1"],
    // Espaço depois de ponto e vírgula
    [/;(\S)/g, "; $1"],
  ],
  en: [
    // Comma before conjunctions (but, however, nevertheless)
    [/([A-Za-z])(\s+)(but|however|nevertheless|nonetheless|meanwhile|therefore|furthermore|moreover|consequently)\b(?=\s+[a-z])/gi, "$1,$2$3"],
    // Space after comma
    [/,(\S)/g, ", $1"],
  ],
  es: [
    // Coma antes de conjunciones
    [/([A-Za-záéíóúñü])(\s+)(pero|sin embargo|no obstante|con todo|por lo tanto|por consiguiente)\b/gi, "$1,$2$3"],
    [/,(\S)/g, ", $1"],
  ],
  fr: [
    [/([A-Za-zàâäéèêëïîôùûüÿç])(\s+)(mais|cependant|cependant|néanmoins|toutefois|pourtant|donc|par conséquent)\b/gi, "$1,$2$3"],
    [/,(\S)/g, ", $1"],
  ],
  de: [
    [/,(\S)/g, ", $1"],
  ],
  it: [
    [/([A-Za-zàèéìíîòóùú])(\s+)(ma|però|tuttavia|contudo|dunque|quindi|pertanto)\b/gi, "$1,$2$3"],
    [/,(\S)/g, ", $1"],
  ],
  tr: [],
  ru: [],
  ja: [],
  zh: [],
  ko: [],
  ar: [],
  hi: [],
};'''

content = content.replace(old_vocative, new_grammar)

# Also update the type export
content = content.replace(
    'export type VocativeRule = [RegExp, string];',
    'export type GrammarRule = [RegExp, string];'
)

# Update comment
content = re.sub(
    r'/\*\*\n \* Dicionário estático.*?\*/',
    '/**\n * Dicionário estático de correção ortográfica para 13 idiomas.\n * Lookup O(1) — zero rede, zero bloqueio.\n * Inclui regras gramaticais (vírgulas, pontuação).\n */',
    content,
    flags=re.DOTALL
)

with open(OUTPUT, "w") as f:
    f.write(content)

# Count entries per language
lang_counts = {}
current_lang = None
for line in content.split('\n'):
    m = re.match(r'^  (\w+): \{$', line)
    if m:
        current_lang = m.group(1)
        lang_counts[current_lang] = 0
    elif current_lang and re.match(r'^\s+"', line):
        lang_counts[current_lang] = lang_counts.get(current_lang, 0) + 1
    elif re.match(r'^\};', line):
        current_lang = None

print(f"\nFinal entry counts: {lang_counts}")
print(f"Total: {sum(lang_counts.values())}")
print("Done!")
