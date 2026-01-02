import json

with open('content/items.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Define weapon damage ratings based on type and tier
weapon_updates = {
    'hunting_bow': {'slot': 'mainhand', 'damageRating': 4, 'weaponType': 'ranged'},
    'sword_gatebiter': {'slot': 'mainhand', 'damageRating': 8, 'weaponType': 'melee'},
    'bow_wallwhisper': {'slot': 'mainhand', 'damageRating': 7, 'weaponType': 'ranged'},
    'heirloom_gatebiter_sunsteel': {'slot': 'mainhand', 'damageRating': 12, 'weaponType': 'melee'},
    'heirloom_wallwhisper_sunsteel': {'slot': 'mainhand', 'damageRating': 10, 'weaponType': 'ranged'},
}

# Update weapons
for item in items:
    if item['id'] in weapon_updates:
        updates = weapon_updates[item['id']]
        item['slot'] = updates['slot']
        item['damageRating'] = updates['damageRating']
        if 'weaponType' in updates:
            item['weaponType'] = updates['weaponType']
        print(f"✓ Updated {item['name']}: DR={item['damageRating']}, slot={item['slot']}")

# Add a basic starter weapon if needed
starter_exists = any(item['id'] == 'rusty_sword' for item in items)
if not starter_exists:
    starter_weapon = {
        "id": "rusty_sword",
        "name": "Rusty Sword",
        "type": "weapon_sword",
        "slot": "mainhand",
        "damageRating": 3,
        "weaponType": "melee",
        "stackable": False,
        "value": 5,
        "description": "A worn blade with surface rust. Better than your fists, barely."
    }
    items.insert(0, starter_weapon)
    print(f"✓ Added starter weapon: Rusty Sword (DR 3)")

with open('content/items.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

print(f"✓ items.json updated with {len(weapon_updates)} weapon DRs")
