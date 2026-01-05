# Combat System Architecture

## Overview
The combat system uses a template-based approach where enemy configurations are defined in areas and loaded dynamically when combat is initiated.

## Combat Templates
Combat can be initiated in two ways:

### 1. Area onEnter Actions
When a player enters an area with `onEnter` containing `initiateCombat`:

```json
{
  "id": "u_tight_crawl",
  "title": "Tight Crawl",
  "onEnter": [
    {
      "type": "initiateCombat",
      "enemyIds": ["cave_rat", "cave_rat"]
    }
  ]
}
```

### 2. Debug/Test Templates
Manual combat initiation for testing via Settings page:

```typescript
const newState = initiateCombat(['test_goblin', 'test_goblin'], playerState);
usePlayerStore.setState({ combat: newState.combat });
```

## Combat Flow

1. **Area Entry** → `playerStore.moveTo()` checks for `area.onEnter`
2. **Combat Check** → If `initiateCombat` action found, call `initiateCombat(enemyIds, state)`
3. **Combat State** → Store `combat` object in player state, display combat UI
4. **Combat Turns** → Player attacks/casts spells, enemies retaliate
5. **Resolution** → Victory/defeat screen, apply rewards, clear `combat` state
6. **Continue** → Return to area navigation

## Enemy Definitions

Enemies are defined in `content/enemies.json` with:

- **id**: Unique identifier (e.g., "cave_rat", "blind_cave_snake")
- **name**: Display name
- **health**, **maxHealth**: Hit points
- **agility**: Initiative and dodge chance modifier
- **stats**: Combat attributes (power, mind, agility, vision)
- **loot**: Gold ranges, items, stat point rewards
- **tags**: Categorization (beast, boss, undead, etc.)

Example:
```json
{
  "id": "cave_rat",
  "name": "Cave Rat",
  "health": 8,
  "maxHealth": 8,
  "agility": 3,
  "stats": { "power": 1, "mind": 1, "agility": 3, "vision": 2 },
  "loot": {
    "gold": { "min": 0, "max": 5 },
    "items": []
  },
  "tags": ["beast", "common"]
}
```

## Test Combat Templates

Available in Settings (⚙️) page:

- **Test Goblins (4x)**: Standard enemy group testing
- **Cave Rats (2x)**: Low-level beast encounter
- **Blind Cave Snake (Boss)**: Single powerful enemy with high rewards

## Implementation Files

### Core Combat Engine
- **`src/engine/combatNew.ts`**: Combat mechanics
  - `initiateCombat()`: Initialize combat state from enemy IDs
  - `playerAttack()`: Handle player attack actions
  - `enemyTurn()`: Process enemy AI and attacks
  - `castSpell()`: Spell casting system
  - `intimidateEnemy()`: Special actions

### State Management
- **`src/store/playerStore.ts`**: Player state and actions
  - `moveTo()`: Handles area transitions and onEnter combat
  - Combat state stored in `combat` property
  - Autosaves after combat resolution

### Area Processing
- **`src/engine/execute.ts`**: Effect execution
  - `performEnterEffects()`: Processes area entry effects
  - Flags `onEnter` actions for combat initialization

### UI Rendering
- **`src/App.tsx`**: Combat interface
  - Combat window with enemy display
  - Action buttons (Attack, Slash, Pivot, Cast, Intimidate)
  - Victory/defeat screens
  - Settings page with test templates

### Content Data
- **`content/areas.json`**: Area definitions with onEnter combat
- **`content/enemies.json`**: Enemy definitions with stats and loot

## Example: Tight Crawl Combat

### Area Definition
```json
{
  "id": "u_tight_crawl",
  "title": "Tight Crawl",
  "description": "The walls press close. Stone scrapes your shoulders...",
  "onEnter": [
    {
      "type": "initiateCombat",
      "enemyIds": ["cave_rat", "cave_rat"]
    }
  ],
  "exits": {
    "s": "u_crawlspace_entrance",
    "n": "u_forgotten_cavern"
  }
}
```

### Execution Flow

1. **Player navigates**: `moveTo("u_tight_crawl")` is called
2. **Area entry**: System detects `onEnter` with `initiateCombat`
3. **Load enemies**: Reads enemy definitions for 2x cave_rat
4. **Initialize combat**: Creates combat state with front/reserve positioning
5. **Display UI**: Shows combat window with enemies, health bars, actions
6. **Player turn**: Player selects target and action
7. **Enemy turn**: Surviving enemies attack player
8. **Resolution**: 
   - **Victory**: Show loot screen, apply rewards, return to area
   - **Defeat**: Show defeat screen, respawn at checkpoint
9. **Continue**: Player can now use exits (north/south)

## Adding New Combat Encounters

### Step 1: Define Enemy (if new)
Add to `content/enemies.json`:

```json
{
  "id": "giant_spider",
  "name": "Giant Spider",
  "health": 25,
  "maxHealth": 25,
  "agility": 4,
  "stats": { "power": 3, "mind": 1, "agility": 4, "vision": 5 },
  "loot": {
    "gold": { "min": 10, "max": 20 },
    "items": [
      { "itemId": "spider_venom", "chance": 0.5, "qty": 1 }
    ],
    "statPoints": { "chance": 0.3, "amount": 1 }
  },
  "tags": ["beast", "venomous"]
}
```

### Step 2: Add Combat to Area
In `content/areas.json`:

```json
{
  "id": "spider_nest",
  "title": "Spider's Nest",
  "description": "Webs cover every surface...",
  "onEnter": [
    {
      "type": "initiateCombat",
      "enemyIds": ["giant_spider", "giant_spider"]
    }
  ]
}
```

### Step 3: Test
Add template to Settings page in `src/App.tsx`:

```typescript
<button 
  onClick={() => {
    const currentState = usePlayerStore.getState();
    const newState = initiateCombat(['giant_spider', 'giant_spider'], currentState);
    usePlayerStore.setState({ combat: newState.combat });
    setModalPage(null);
  }}
>
  🕷️ Giant Spiders (2x)
</button>
```

## Combat Mechanics Summary

- **Positioning**: Front line (up to 4) and reserve (unlimited)
- **Turn Order**: Player always goes first, then all surviving enemies
- **Actions**: Attack, Slash (multi-target), Pivot (reposition), Cast Spell, Intimidate
- **Victory**: All enemies defeated or imprisoned
- **Defeat**: Player health reaches 0, respawn at last checkpoint
- **Rewards**: Gold, items, and stat points awarded on victory
