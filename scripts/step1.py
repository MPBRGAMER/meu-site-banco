#!/usr/bin/env python3
"""Step 1: Update LANGUAGES array"""

FILE = "/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Lines 6-13 (0-indexed: 5-12) are the LANGUAGES array
# Replace them
new_lines = lines[:5]  # Keep first 5 lines

new_langs = [
    'const LANGUAGES = [\n',
    '  { code: "pt", label: "Portugu\u00eas", flag: "\U0001f1e7\U0001f1f7" },\n',
    '  { code: "en", label: "English", flag: "\U0001f1fa\U0001f1f8" },\n',
    '  { code: "es", label: "Espa\u00f1ol", flag: "\U0001f1ea\U0001f1f8" },\n',
    '  { code: "fr", label: "Fran\u00e7ais", flag: "\U0001f1eb\U0001f1f7" },\n',
    '  { code: "de", label: "Deutsch", flag: "\U0001f1e9\U0001f1ea" },\n',
    '  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", flag: "\U0001f1f7\U0001f1fa" },\n',
    '  { code: "it", label: "Italiano", flag: "\U0001f1ee\U0001f1f9" },\n',
    '  { code: "zh-cn", label: "\u7b80\u4f53\u4e2d\u6587", flag: "\U0001f1e8\U0001f1f3" },\n',
    '  { code: "zh-tw", label: "\u7e41\u9ad4\u4e2d\u6587", flag: "\U0001f1f8\U0001f1ed" },\n',
    '  { code: "ko", label: "\ud55c\uad6d\uc5b4", flag: "\U0001f1f0\U0001f1f7" },\n',
    '  { code: "ja", label: "\u65e5\u672c\u8a9e", flag: "\U0001f1ef\U0001f1f5" },\n',
    '  { code: "id", label: "Indonesia", flag: "\U0001f1ee\U0001f1e9" },\n',
    '  { code: "tr", label: "T\u00fcrk\u00e7e", flag: "\U0001f1f9\U0001f1f7" },\n',
    '];\n',
]

new_lines.extend(new_langs)
new_lines.extend(lines[13:])  # Rest of file after old LANGUAGES

with open(FILE, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"OK - LANGUAGES updated. File now {len(new_lines)} lines")
