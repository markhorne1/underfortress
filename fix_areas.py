#!/usr/bin/env python3
import re

# Read the file
with open('/workspaces/underfortress/content/areas.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Count initial
initial = len(re.findall(r'"type": "addXP"', content))
print(f'Found {initial} instances of "type": "addXP"')

# Replace
content = content.replace('"type": "addXP"', '"type": "addStatPoints"')

# Count after
remaining = len(re.findall(r'"type": "addXP"', content))
print(f'After replacement: {remaining} instances remain')
print(f'Replaced: {initial - remaining} instances')

# Write back
with open('/workspaces/underfortress/content/areas.json', 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ File updated successfully!')
