# Combat & Magic System Reference

## Stats System

### Core Stats (1-10 range)
- **Power**: Physical strength, melee combat, intimidation
- **Mind**: Intelligence, magic, spell resistance, social interactions  
- **Agility**: Speed, ranged combat, dodging, lockpicking
- **Vision**: Perception, awareness, searching, investigation

### Stat Points
- Players earn stat points from quests and combat
- Can be spent to: increase stats, unlock spell paths, learn spells
- Starting stats: All at 1, with 4 stat points to allocate

## Skills (d100 Percentage System)

### Active Skills
- **Melee Attack**: Power × 10 (base)
- **Ranged Attack**: Agility × 10 (base)
- **Cast Spell**: Mind × 10 (base)
- **Search**: Vision × 10
- **Lockpick**: Vision × 5 + Agility × 5
- **Investigate**: Mind × 5 + Vision × 5
- **Persuasion**: Mind × 7 + Power × 3
- **Intimidation**: Power × 7 + Mind × 3
- **Stealth**: Agility × 10

### Passive Skills
- **Melee Defense**: AR + Power × 5 + Agility × 5
- **Spell Resistance**: Mind × 10 + 20
- **Initiative**: Agility × 10

## Equipment System

### Slots
- **mainhand**: Weapons (DR), shields (AR)
- **offhand**: Shields (AR), dual-wield weapons (DR)
- **head**: Helmets (AR)
- **chest**: Armor (AR)
- **gloves**: Gauntlets (AR)
- **legs**: Leg armor (AR)
- **boots**: Boots (AR)

### Ratings
- **Armour Rating (AR)**: Sum of all equipped armor pieces
- **Damage Rating (DR)**: Weapon damage (mainhand + offhand), defaults to Power/2 if unarmed

## Combat System

### Turn-Based Combat
1. Combat initiated with enemyIds array
2. Player turn: Attack or Cast Spell
3. Enemy turn: Each living enemy attacks
4. Repeat until all enemies dead or player dies

### Attack Resolution
- Roll d100 for attack
- Compare to enemy's defense roll
- If attack > defense: Deal DR damage
- Damage reduced by target's AR (unless spell ignores AR)

### Combat Effects
```json
{
  "type": "initiateCombat",
  "enemyIds": ["goblin_warrior", "goblin_archer"]
}
```

## Spell System

### Four Elemental Paths
- **🔥 Fire**: Offensive magic (direct damage)
- **💧 Water**: Control & crowd control (freeze, defense buffs)
- **🪨 Earth**: Defense & utility (AR buffs, debuffs, stuns)
- **💨 Air**: Speed & utility (ignore AR, haste, mobility)

### Spell Learning Progression
1. Unlock path: 1 SP per path
2. Learn spells: 1-5 SP per spell
3. Tier progression: Must learn Tier N spell before Tier N+1 unlocks

### Spell Targeting
- **single**: One enemy, must be selected
- **multi**: 2-3 enemies automatically
- **all_enemies**: Every living enemy
- **self**: Player only (buffs)
- **area**: All enemies in area

### Spell Effects
```json
{
  "damage": { "min": 5, "max": 10 },
  "ignoresAR": true,
  "statusEffect": {
    "type": "frozen|burning|stunned|poisoned",
    "duration": 2,
    "value": 5
  },
  "buff": {
    "stat": "ar|meleeDefense|dodge",
    "value": 10,
    "duration": 3
  },
  "special": "double_action|can_flee|chain_damage"
}
```

### Spell Resistance
- Roll d100 vs SR (Mind × 10 + 20)
- **SR Effects**: 
  - `negate`: Spell has no effect if SR succeeds
  - `halve`: Damage halved if SR succeeds
  - `reduce_duration`: Duration reduced by 1 if SR succeeds

## Content Effects Reference

### Core Effects
```json
{ "type": "addStatPoints", "value": 2 }
{ "type": "heal", "value": 50 }
{ "type": "damage", "value": 20 }
{ "type": "grantGold", "value": 100 }
{ "type": "addItem", "itemId": "longsword", "qty": 1 }
{ "type": "removeItem", "itemId": "quest_item", "qty": 1 }
```

### Equipment Effects
```json
{ "type": "equipItem", "itemId": "plate_armor", "slot": "chest" }
```

### Magic Effects
```json
{ "type": "unlockPath", "path": "fire" }
{ "type": "learnSpell", "spellId": "fireball" }
```

### Combat Effects
```json
{ "type": "initiateCombat", "enemyIds": ["orc_raider", "cultist_mage"] }
```

### Legacy Support
```json
{ "type": "addXP", "value": 100 }  // Auto-converts to stat points
{ "type": "grantXP", "value": 50 }  // Auto-converts to stat points
```

## Enemy Definition Format

```json
{
  "id": "goblin_warrior",
  "name": "Goblin Warrior",
  "kind": "humanoid",
  "stats": {
    "power": 3,
    "mind": 1,
    "agility": 3,
    "vision": 2
  },
  "maxHealth": 20,
  "equipment": {
    "mainhand": "rusty_sword",
    "chest": "leather_armor"
  },
  "spells": [],
  "loot": {
    "gold": { "min": 8, "max": 15 },
    "statPoints": { "probability": 0.4, "amount": 1 },
    "items": [
      { "itemId": "rusty_sword", "probability": 0.3 }
    ]
  },
  "tags": ["goblin", "melee"]
}
```

## Item Definition Format

### Weapons
```json
{
  "id": "longsword",
  "name": "Longsword",
  "type": "weapon",
  "slot": "mainhand",
  "damageRating": 10,
  "value": 80,
  "description": "A well-balanced blade."
}
```

### Armor
```json
{
  "id": "plate_armor",
  "name": "Plate Armor",
  "type": "armor",
  "slot": "chest",
  "armourRating": 10,
  "value": 300,
  "description": "Heavy steel plates."
}
```

## Testing Commands

### Test Combat
Click "Test Combat (DEBUG)" button in game to fight 2 test goblins.

### Initial Setup
1. New game starts with 4 stat points
2. Allocate to Power/Mind/Agility/Vision
3. Use remaining points for spell paths or spells
4. Test combat with attacks and spells
