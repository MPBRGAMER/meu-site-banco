#!/usr/bin/env python3
"""Fix grammar rules - remove invisible chars and write correct regexes"""

with open("/home/z/my-project/src/lib/spellcheck-dicts.ts", "r") as f:
    content = f.read()

# Find and replace the entire GRAMMAR_RULES section
import re

# Find start and end of GRAMMAR_RULES
start = content.find('export const GRAMMAR_RULES')
if start == -1:
    print("ERROR: GRAMMAR_RULES not found")
    exit(1)

# Find the matching closing }; (count braces)
i = start
brace_count = 0
end = len(content)
while i < len(content):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end = i + 1
            break
    i += 1

print(f"GRAMMAR_RULES: bytes {start} to {end} ({end-start} bytes)")

# New clean grammar rules
good_grammar = r'''export const GRAMMAR_RULES: Record<string, GrammarRule[]> = {
  pt: [
    // Virgula antes de conjuncoes adversativas
    [/([A-Za-z\xc3\xa0-\xc3\xbf])(\s+)(mas|por\xc3\xa9m|contudo|todavia|entretanto)\b/gi, "$1,$2$3"],
    // Virgula antes de conclusivas
    [/([A-Za-z\xc3\xa0-\xc3\xbf])(\s+)(portanto|logo|consequentemente)\b/gi, "$1,$2$3"],
    // Virgula em vocativos
    [/(^|\s)([A-Za-z\xc3\xa0-\xc3\xbf][a-z\xc3\xa0-\xc3\xbf]+)(\s+(?:cara|mano|brother|pessoa|gente|amor|querido|querida|amigo|amiga|filho|filha|m\xc3\xa3e|pai|chefe|senhor|senhora|doutor|doutora|professor|professora|mo\xc3\xa7o|mo\xc3\xa7a|garoto|garota|rapaz))([^,.!?]|$)/g, "$1$2,$3$4"],
    // Espaco depois de virgula
    [/,(?=[A-Za-z\xc3\xa0-\xc3\xbf0-9])/g, ", "],
    // Espaco depois de ponto-e-virgula
    [/;(?=[A-Za-z\xc3\xa0-\xc3\xbf0-9])/g, "; "],
  ],
  en: [
    [/([A-Za-z])(\s+)(?:but|however|nevertheless|therefore|furthermore|moreover|consequently|meanwhile)\b(?=\s+[a-z])/gi, "$1,$2$3"],
    [/,(?=[A-Za-z0-9])/g, ", "],
  ],
  es: [
    [/([A-Za-z\xc3\xa1\xc3\xa9\xc3\xad\xc3\xb3\xc3\xba\xc3\xb1\xc3\xbc])(\s+)(?:pero|sin embargo|no obstante|por lo tanto|por consiguiente)\b/gi, "$1,$2$3"],
    [/,(?=[A-Za-z\xc3\xa1\xc3\xa9\xc3\xad\xc3\xb3\xc3\xba\xc3\xb1\xc3\xbc0-9])/g, ", "],
  ],
  fr: [
    [/([A-Za-z\xc3\xa0\xc3\xa2\xc3\xa4\xc3\xa9\xc3\xa8\xc3\xaa\xc3\xab\xc3\xaf\xc3\xae\xc3\xb4\xc3\xb9\xc3\xbb\xc3\xbc\xc3\xbf\xc3\xa7])(\s+)(?:mais|cependant|n\xc3\xa9anmoins|toutefois|pourtant|donc|par cons\xc3\xa9quent)\b/gi, "$1,$2$3"],
    [/,(?=[A-Za-z\xc3\xa0-\xc3\xff0-9])/g, ", "],
  ],
  de: [/,(?=[A-Za-z0-9])/g, ", "],
  it: [
    [/([A-Za-z\xc3\xa0\xc3\xa8\xc3\xa9\xc3\xac\xc3\xad\xc3\xae\xc3\xb2\xc3\xb3\xc3\xb9\xc3\xba])(\s+)(?:ma|per\xc3\xb2|tuttavia|dunque|quindi|pertanto)\b/gi, "$1,$2$3"],
    [/,(?=[A-Za-z0-9])/g, ", "],
  ],
  tr: [],
  ru: [],
  ja: [],
  zh: [],
  ko: [],
  ar: [],
  hi: [],
};'''

content = content[:start] + good_grammar + content[end:]

# Also clean up blank lines in the pt section
content = re.sub(r'\n{3,}', '\n\n', content)

with open("/home/z/my-project/src/lib/spellcheck-dicts.ts", "w") as f:
    f.write(content)

print("Grammar rules rewritten cleanly!")
