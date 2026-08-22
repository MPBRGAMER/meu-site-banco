with open('/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx', 'r') as f:
    content = f.read()

# Find the EN object boundaries
# Pattern: const EN: Record<string, string> = { ... };
start_marker = 'const EN: Record<string, string> = {'
start_idx = content.index(start_marker)
start_idx += len(start_marker)

# Find the matching closing brace
brace_count = 1
end_idx = start_idx
while brace_count > 0:
    if content[end_idx] == '{':
        brace_count += 1
    elif content[end_idx] == '}':
        brace_count -= 1
    end_idx += 1

# Extract EN object content (without the surrounding braces)
# We need to find the key-value pairs
en_content = content[start_idx:end_idx-1]  # -1 to exclude the closing }

# Parse keys and their positions
# We need to handle the content as lines but track positions
lines = en_content.split('\n')
seen_keys = {}
lines_to_keep = []
duplicates_removed = 0

for line in lines:
    stripped = line.strip()
    if not stripped or stripped.startswith('//') or stripped.startswith('/*'):
        lines_to_keep.append(line)
        continue
    
    # Extract key from line like: "key": "value", or "key": "value"
    import re
    m = re.match(r'^\s*"([^"]*)":', line)
    if m:
        key = m.group(1)
        if key in seen_keys:
            duplicates_removed += 1
            # Replace the old entry with empty lines (to preserve line numbers)
            lines_to_keep.append('')
        else:
            seen_keys[key] = True
            lines_to_keep.append(line)
    else:
        lines_to_keep.append(line)

print(f'Removed {duplicates_removed} duplicate keys')

# Rebuild the content
new_en_content = '\n'.join(lines_to_keep)
new_content = content[:start_idx] + new_en_content + content[end_idx-1:]

with open('/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx', 'w') as f:
    f.write(new_content)

print('Done')
