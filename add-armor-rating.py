import json

with open('content/items.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Find and update the warden cloak
for item in items:
    if item['id'] == 'warden_cloak_ironleaf':
        item['slot'] = 'chest'
        item['armourRating'] = 2
        print(f"✓ Updated {item['name']}: AR={item['armourRating']}, slot={item['slot']}")

with open('content/items.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

print("✓ items.json updated")
