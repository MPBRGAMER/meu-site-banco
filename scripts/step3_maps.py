#!/usr/bin/env python3
"""Step 3: Update getDateLocale and langMap"""

FILE = "/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Update getDateLocale
old_locale = '''    pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ru: "ru-RU",'''
new_locale = '''    pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ru: "ru-RU",
    it: "it-IT", "zh-cn": "zh-CN", "zh-tw": "zh-TW", ko: "ko-KR", ja: "ja-JP", id: "id-ID", tr: "tr-TR",'''

if old_locale in content:
    content = content.replace(old_locale, new_locale)
    print("OK - getDateLocale updated")
else:
    print("WARN - getDateLocale not found")

# 2) Update langMap in queueApiTranslation
old_map = '''    const langMap: Record<string, string> = { en: "en", es: "es", fr: "fr", de: "de", ru: "ru" };'''
new_map = '''    const langMap: Record<string, string> = {
      en: "en", es: "es", fr: "fr", de: "de", ru: "ru",
      it: "it", "zh-cn": "zh", "zh-tw": "zh-TW", ko: "ko", ja: "ja", id: "id", tr: "tr",
    };'''

if old_map in content:
    content = content.replace(old_map, new_map)
    print("OK - langMap updated")
else:
    print("WARN - langMap not found")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Done. File now {content.count(chr(10))+1} lines")
