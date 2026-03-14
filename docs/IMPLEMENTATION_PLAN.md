# Under-Fortress: Combat & Magic System Implementation Plan

## Completed Phases ✅

### Phase 1-6: Core Systems
- ✅ Core Stats (Power, Mind, Agility, Vision)
- ✅ Health & Checkpoint System
- ✅ Stat Allocation UI with animations
- ✅ Skill Calculations (d100 percentage-based)
- ✅ Armour Rating & Paper Doll UI
- ✅ Death & Respawn System

## In-Progress Phases 🔄

### Phase 15: XP → Stat Points Migration
**Status**: 8/187 conversions done, script ready
**Blocker**: Terminal access issues
**Next**: Run `python3 replace-xp.py` to bulk convert remaining 179 instances

## New Phases from design4.txt 🆕

### Phase 7: Damage Rating System
**Goal**: Add weapon damage to complement armour rating

**Tasks**:
1. Add `damageRating` property to weapon items
2. Create weapon slots: `mainhand`, `offhand` in equipment
3. Update `getTotalDamageRating()` helper in skillCalculations.ts
4. Add weapon types: `weapon_melee`, `weapon_ranged`, `weapon_magic`
5. Create starter weapons in items.json with DR values

**Example Items**:
- Rusty Sword: DR 5, type: weapon_melee
- Hunting Bow: DR 4, type: weapon_ranged
- Wooden Staff: DR 3, type: weapon_magic

---

### Phase 8: Enemy System
**Goal**: Define enemy entities with full character sheets

**Tasks**:
1. Create `Enemy` type in types.ts with stats/skills/equipment/spells
2. Review existing content/enemies.json structure
3. Add enemy definitions for quest encounters:
   - Goblin Warrior (Power 3, Melee Attack 30%, DR 4)
   - Orc Raider (Power 5, Melee Attack 50%, DR 8)
   - Cultist Mage (Mind 6, Cast Spell 60%, spells: Ignite)
4. Add `enemiesPresent` array to Area type for combat encounters
5. Add `EnemyInstance` type for tracking enemy health/status in combat

---

### Phase 9: Turn-Based Combat Engine
**Goal**: Core combat loop with attack/defense/damage resolution

**Tasks**:
1. Create `src/engine/combat.ts` with:
   - `initiateCombat(area, state)` - Start combat, load enemies
   - `playerAttack(enemyId, state)` - Roll attack vs defense
   - `applyDamage(target, damage)` - Reduce health, check death
   - `enemyTurn(enemies, state)` - Each enemy attacks player
   - `endCombat(victory, state)` - Distribute loot or handle defeat
2. Add `combatState` to PlayerState:
   ```ts
   combatState?: {
     active: boolean;
     enemies: EnemyInstance[];
     selectedEnemyId?: string;
     playerTurn: boolean;
     combatLog: string[];
   }
   ```
3. Combat flow:
   - Player selects enemy → highlights icon
   - Player clicks "Attack [Enemy]" → d100 Melee Attack roll
   - Enemy rolls d100 Melee Defense
   - If Attack > Defense: Enemy takes weapon DR damage
   - Enemy health updated, death check
   - All living enemies attack player (same mechanics)
   - Repeat until all enemies dead or player dies

---

### Phase 10: Combat UI
**Goal**: Visual combat interface with enemy icons and actions

**Tasks**:
1. Enemy icon display in area description section:
   - Grid layout for multiple enemies
   - Red border on selected enemy
   - Health bar below each enemy icon
   - Click to select/deselect
2. Combat action buttons:
   - "Attack [EnemyName]" (visible when enemy selected)
   - "Cast Spell" (dropdown with learned spells)
   - "Use Item" (consumables)
   - "Flee" (attempt to escape to adjacent area)
3. Combat log panel:
   - Scrollable message feed
   - Color-coded: player actions (blue), enemy actions (red), damage (orange)
4. Turn indicator:
   - "Your Turn" / "Enemy Turn" banner
   - Disable actions during enemy turn

---

### Phase 11: Spell Path System
**Goal**: Four elemental magic paths with unlock progression

**Tasks**:
1. Add to PlayerState:
   ```ts
   spellPathsUnlocked: string[]; // ['fire', 'water', 'earth', 'air']
   spellsLearned: string[]; // spell IDs
   ```
2. Create `unlockSpellPath` effect (costs 1 SP)
3. Create Spells modal tab with 4 rune buttons:
   - Fire: 🔥 (orange)
   - Water: 💧 (blue)
   - Earth: 🪨 (brown)
   - Air: 💨 (cyan)
4. Visual states:
   - Locked: Greyed out, shows "1 SP to unlock"
   - Unlocked: Colored rune, click to view spell tree
   - Pulsing: When SP available and path locked

---

### Phase 12: Spell Library Design
**Goal**: 12-16 balanced spells across 4 elements

**Fire Path** (Offense):
- Ignite (1 SP): Single target, 5-10 damage, SR negates
- Firespray (2 SP): 2-3 targets, 4-8 damage each, SR negates
- Fireball (3 SP): All enemies in area, 8-12 damage, SR halves
- Immolate (5 SP): Single target, 20 damage + 5/turn for 3 turns

**Water Path** (Control):
- Freeze (1 SP): Single enemy can't act next turn, SR negates
- Frost Cone (2 SP): 2-3 enemies frozen 1 turn, SR negates
- Ice Wall (3 SP): +20 Melee Defense for 3 turns
- Blizzard (4 SP): All enemies frozen 2 turns, SR reduces to 1

**Earth Path** (Defense/Utility):
- Stone Skin (1 SP): +10 AR for 3 turns
- Earth Spike (2 SP): 6-10 damage + enemy loses 1 turn
- Tremor (3 SP): All enemies -20 Melee Defense for 2 turns
- Teleport (5 SP): Move to any discovered area on map

**Air Path** (Speed/Utility):
- Lightning Bolt (1 SP): 7-12 damage, ignores AR
- Haste (2 SP): Take 2 actions this turn
- Chain Lightning (4 SP): All enemies take d100 damage
- Wind Walk (3 SP): +30 Dodge for 3 turns, can escape combat

---

### Phase 13: Spell Learning UI
**Goal**: Spell tree progression within each path

**Tasks**:
1. When path unlocked, show spell tree modal:
   - Horizontal chain: Tier 1 → Tier 2 → Tier 3 → Tier 4
   - Each spell shows: Name, cost (SP), description, requirements
   - "Learn Spell" button (greyed out if insufficient SP or prereqs)
2. Visual progression:
   - Locked spells: Dimmed, shows cost
   - Learned spells: Highlighted, checkmark icon
   - Current tier: Only tier 1 available at start, unlock next tier after learning any spell from previous
3. Add to spells modal main view:
   - List of all learned spells
   - Quick reference: damage, targets, effects

---

### Phase 14: Spell Casting in Combat
**Goal**: Use spells during combat with targeting

**Tasks**:
1. Add "Cast Spell ▼" dropdown button in combat UI
2. When spell selected:
   - If single-target: Highlight valid targets (enemies)
   - If self-buff: Auto-cast on player
   - If AoE: Show "Cast on All Enemies" confirmation
3. Spell resolution:
   - Roll d100 vs enemy Spell Resistance if offensive
   - Apply damage/effects per spell definition
   - Update combat log
   - Consume spell (if consumable) or mark cooldown
4. Add visual effects indicators:
   - Frozen enemies: Blue border
   - Burning enemies: Red glow
   - Buffed player: Green aura on stats

---

### Phase 16: Audit Combat Encounters
**Goal**: Balance all quest enemies with proper gear

**Tasks**:
1. Identify all combat encounters in areas.json
2. For each encounter, define:
   - Enemy count and types
   - Stats (Power 1-10, Mind 1-10, etc.)
   - Equipment (weapon with DR, armor with AR)
   - Spells (for caster enemies)
   - Loot drops (gold, items, stat points)
3. Balance difficulty curve:
   - Early: Goblins (AR 2, DR 4, 20 HP)
   - Mid: Orcs (AR 5, DR 8, 40 HP)
   - Late: Elite Guards (AR 12, DR 15, 80 HP)
4. Add tactical variety:
   - Mix melee + ranged enemies
   - Add caster support enemies
   - Create multi-wave encounters

---

## Implementation Priority

**Immediate** (Next 3 phases):
1. Phase 7: Damage Rating System (foundation for combat)
2. Phase 8: Enemy System (defines what we're fighting)
3. Phase 9: Combat Engine (makes combat work)

**High Priority** (Enable gameplay):
4. Phase 10: Combat UI (make it playable)
5. Phase 11: Spell Path System (magic foundation)
6. Phase 12: Spell Library (content)

**Polish** (Enhance experience):
7. Phase 13: Spell Learning UI
8. Phase 14: Spell Casting in Combat
9. Phase 16: Content Audit

**Ongoing** (Unblocked when terminal works):
10. Phase 15: XP Migration (run script)

---

## Technical Dependencies

- Combat requires: DR system → Enemy system → Combat engine → Combat UI
- Spells require: Path system → Spell library → Learning UI → Combat integration
- All requires: Stat Points working (Phase 15 completion)

## Estimated Complexity

- **Simple**: Phase 7 (DR system - mirrors AR)
- **Medium**: Phase 8 (Enemy types), Phase 11 (Path system)
- **Complex**: Phase 9 (Combat engine), Phase 10 (Combat UI)
- **Very Complex**: Phase 14 (Spell casting with targeting), Phase 16 (Content audit)
