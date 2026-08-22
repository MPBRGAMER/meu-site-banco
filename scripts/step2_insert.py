#!/usr/bin/env python3
"""Step 2: Combine dict parts and insert into TranslationPopup.tsx"""

FILE = "/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx"
PARTS_DIR = "/home/z/my-project/scripts"

# Combine all dict parts
parts = ["dicts_part1.txt", "dicts_part2.txt", "dicts_part3.txt", "dicts_part4.txt", "dicts_part5.txt", "dicts_part6.txt"]
dicts_content = "\n".join(open(f"{PARTS_DIR}/{p}", "r", encoding="utf-8").read() for p in parts)

print(f"Combined {len(parts)} dict parts, {len(dicts_content)} chars total")

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

old = 'const dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU };'
new = dicts_content + '\nconst dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU, it: IT, "zh-cn": ZH_CN, "zh-tw": ZH_TW, ko: KO, ja: JA, id: ID, tr: TR };'

if old not in content:
    print("ERROR - const dictionaries line not found!")
    # Debug
    for i, line in enumerate(content.split('\n')):
        if 'const dictionaries' in line:
            print(f"  Found at line {i+1}: {line.strip()}")
    exit(1)

content = content.replace(old, new)
with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"OK - 8 dictionaries inserted. File now {content.count(chr(10))+1} lines")
