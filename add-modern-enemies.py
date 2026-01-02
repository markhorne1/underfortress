import json

# Read existing enemies
with open('content/enemies.json', 'r', encoding='utf-8') as f:
    enemies = json.load(f)

# Define new enemies with modern stat system
new_enemies = [
    {
        "id": "goblin_warrior",
        "name": "Goblin Warrior",
        "kind": "humanoid",
        "stats": {
            "power": 3,
            "mind": 2,
            "agility": 4,
            "vision": 3
        },
        "maxHealth": 20,
        "equipment": {
            "mainhand": "rusty_sword"
        },
        "goldDrop": {"min": 2, "max": 8},
        "statPointsDrop": 1,
        "loot": [
            {"itemId": "rusty_sword", "min": 0, "max": 1, "chance": 0.3}
        ],
        "tags": ["goblin", "melee"]
    },
    {
        "id": "orc_raider",
        "name": "Orc Raider",
        "kind": "humanoid",
        "stats": {
            "power": 5,
            "mind": 2,
            "agility": 3,
            "vision": 3
        },
        "maxHealth": 40,
        "equipment": {
            "mainhand": "sword_gatebiter",
            "chest": "warden_cloak_ironleaf"
        },
        "goldDrop": {"min": 10, "max": 25},
        "statPointsDrop": 2,
        "loot": [
            {"itemId": "sword_gatebiter", "min": 0, "max": 1, "chance": 0.2},
            {"itemId": "warden_cloak_ironleaf", "min": 0, "max": 1, "chance": 0.15}
        ],
        "tags": ["orc", "melee", "raider"]
    },
    {
        "id": "cultist_mage",
        "name": "Cultist Mage",
        "kind": "humanoid",
        "stats": {
            "power": 2,
            "mind": 6,
            "agility": 3,
            "vision": 4
        },
        "maxHealth": 25,
        "equipment": {},
        "spells": ["ignite"],
        "goldDrop": {"min": 5, "max": 15},
        "statPointsDrop": 2,
        "loot": [],
        "tags": ["cultist", "mage", "spellcaster"]
    },
    {
        "id": "goblin_archer",
        "name": "Goblin Archer",
        "kind": "humanoid",
        "stats": {
            "power": 2,
            "mind": 2,
            "agility": 5,
            "vision": 4
        },
        "maxHealth": 15,
        "equipment": {
            "mainhand": "hunting_bow"
        },
        "goldDrop": {"min": 3, "max": 10},
        "statPointsDrop": 1,
        "loot": [
            {"itemId": "hunting_bow", "min": 0, "max": 1, "chance": 0.25}
        ],
        "tags": ["goblin", "ranged", "archer"]
    },
    {
        "id": "elite_guard",
        "name": "Elite Guard",
        "kind": "humanoid",
        "stats": {
            "power": 7,
            "mind": 4,
            "agility": 5,
            "vision": 5
        },
        "maxHealth": 60,
        "equipment": {
            "mainhand": "heirloom_gatebiter_sunsteel",
            "chest": "warden_cloak_ironleaf",
            "boots": "boots_quietstep"
        },
        "goldDrop": {"min": 20, "max": 50},
        "statPointsDrop": 3,
        "loot": [
            {"itemId": "heirloom_gatebiter_sunsteel", "min": 0, "max": 1, "chance": 0.1}
        ],
        "tags": ["guard", "elite", "melee"]
    }
]

# Add new enemies to the list
for new_enemy in new_enemies:
    # Check if already exists
    exists = any(e.get('id') == new_enemy['id'] for e in enemies)
    if not exists:
        enemies.append(new_enemy)
        print(f"✓ Added {new_enemy['name']}: Power {new_enemy['stats']['power']}, HP {new_enemy['maxHealth']}")
    else:
        print(f"⊙ Skipped {new_enemy['name']} (already exists)")

# Write back
with open('content/enemies.json', 'w', encoding='utf-8') as f:
    json.dump(enemies, f, indent=2, ensure_ascii=False)

print(f"\n✓ enemies.json updated with {len(new_enemies)} modern enemies")
