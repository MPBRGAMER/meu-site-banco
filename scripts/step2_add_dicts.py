#!/usr/bin/env python3
"""Step 2: Add 8 new language dictionaries before const dictionaries line"""

FILE = "/home/z/my-project/user-project/user-project/src/components/banco/TranslationPopup.tsx"

# Read the new dictionaries from file
DICTS_FILE = "/home/z/my-project/scripts/dicts_content.txt"

with open(DICTS_FILE, "r", encoding="utf-8") as f:
    dicts_content = f.read()

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

old = 'const dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU };'
new = dicts_content + '\nconst dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU, it: IT, "zh-cn": ZH_CN, "zh-tw": ZH_TW, ko: KO, ja: JA, id: ID, tr: TR };'

if old not in content:
    print("ERROR - const dictionaries line not found!")
    exit(1)

content = content.replace(old, new)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"OK - 8 dictionaries added. File now {content.count(chr(10))+1} lines")
