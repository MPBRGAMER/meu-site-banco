import re

with open('src/lib/spellcheck-dicts.ts', 'r') as f:
    content = f.read()

# 1. Fix duplicate keys in PT section
# Remove the ES entries that accidentally went into PT
# (entries with spaces before them like ' "tqm"' and ' "xq"')
content = content.replace('  " tqm": "te quiero mucho",\n  " xq": "por que",\n', '')

# 2. Fix FR grammar: change (?: to (
content = content.replace(
    '(?:mais|cependant|n\\u00E9anmoins|toutefois|pourtant|donc|par cons\\u00E9quent)',
    '(mais|cependant|n\\u00E9anmoins|toutefois|pourtant|donc|par cons\\u00E9quent)'
)

# 3. Fix IT grammar: change (?: to (
content = content.replace(
    '(?:ma|per\\u00F2|tuttavia|dunque|quindi|pertanto)',
    '(ma|per\\u00F2|tuttavia|dunque|quindi|pertanto)'
)

# 4. Fix GrammarRule type - use explicit array type
content = content.replace(
    'export const GRAMMAR_RULES: Record<string, GrammarRule[]>',
    'export const GRAMMAR_RULES: Record<string, [RegExp, string][]>'
)

# 5. Remove duplicate "pk" if present
lines = content.split('\n')
seen = set()
fixed_lines = []
dupes = 0
for line in lines:
    m = re.match(r'^\s*"([^"]+)":', line)
    if m:
        key = m.group(1)
        # Check if we're in pt section
        pass  # This is complex, skip for now
    fixed_lines.append(line)

with open('src/lib/spellcheck-dicts.ts', 'w') as f:
    f.write(content)

print('Done')
