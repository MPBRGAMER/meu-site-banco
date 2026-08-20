import re

with open('/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx', 'r') as f:
    lines = f.readlines()

# Remove lines that have the pattern of a broken dictionary entry
# where the value ends with a comma INSIDE the string
filtered = []
for line in lines:
    stripped = line.strip()
    # Detect pattern: "key": "value",  where value ends with ," INSIDE the quotes
    # This creates: "key": "value",",  which is invalid
    # Regex: starts with ", has : somewhere, and ends with ,",
    if re.match(r'^\s*"[^"]+":\s*"[^"]*",",(\s*)$', line):
        # This is a broken duplicate entry - remove it
        print(f'  Removing broken line: {stripped[:70]}')
        continue
    filtered.append(line)

content = ''.join(filtered)

# Fix indentation on Remover line
content = content.replace('   "Remover?":', '  "Remover?":')

with open('/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx', 'w') as f:
    f.write(content)

print(f'Done. Removed {len(lines) - len(filtered)} broken lines.')
