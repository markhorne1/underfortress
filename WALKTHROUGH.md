# Gameplay Walkthrough Guide

## Starting the Game

1. **Launch the App**
   ```bash
   npm start
   ```
   Then scan the QR code with Expo Go app, or press 'a' for Android, 'i' for iOS, or 'w' for web.

2. **Initial Setup**
   - Your character stats are automatically generated
   - SKILL: 9-14 (combat ability)
   - STAMINA: 14-26 (health points)
   - LUCK: 7-13 (fortune in tests)
   - Gold: 10 pieces
   - Provisions: 10 meals

## Controls & Interface

### Top Menu Buttons
- **📊 Stats**: View your character sheet with all stats
- **🎒 Backpack**: Check your inventory and spells
- **🗺️ Map**: View the dungeon map (fog-of-war)
- **🍖 Food**: Eat provisions (+4 STAMINA, costs 1 provision)

### During Gameplay
- **Read the Story**: Each page presents a situation
- **Make Choices**: Tap action buttons to make decisions
- **Locked Choices** (🔒): Requirements not met (need items, flags, or stats)
- **Available Choices** (▶): Can be selected

## Combat

When you encounter enemies:

1. **Combat Screen Appears**
   - Shows your stats vs enemy stats
   - Combat log displays round-by-round results

2. **Combat Actions**
   - **⚔️ ATTACK**: Melee combat (SKILL + 2d6 vs enemy)
   - **🏹 RANGED**: Ranged attack (only vs ranged enemies, 70% hit)
   - **🏃 FLEE**: Attempt to escape (50% success, some enemies block escape)

3. **Combat Resolution**
   - Each round: both roll 2d6 + SKILL
   - Higher total wins the round
   - Winner deals 2 damage (or enemy's specific damage)
   - Fight until one reaches 0 STAMINA

4. **After Combat**
   - Victory: Proceed to victory page (rewards, continue journey)
   - Defeat: Game over (start new game)

## Key Game Concepts

### Stats
- **SKILL**: Combat prowess, used in skill tests
- **STAMINA**: Health, reaching 0 = death
- **LUCK**: Used in luck tests, decreases by 1 per test
- **Gold**: Currency for bribes and purchases
- **Provisions**: Restore 4 STAMINA each

### Tests
- **Skill Test**: Roll 2d6 ≤ your SKILL to succeed
- **Luck Test**: Roll 2d6 ≤ your LUCK to succeed (luck decreases)

### Items
- **Weapons**: Increase combat effectiveness
- **Armor**: Provide protection
- **Potions**: Restore STAMINA when used
- **Keys**: Unlock special paths
- **Treasures**: Valuable items with special effects

### Flags
- Story events set flags (invisible markers)
- Flags unlock special choices later
- Example: Reading ancient symbols gives knowledge flag

### Map
- 11x11 grid showing explored areas
- Dark squares: Unexplored
- Light squares: Visited
- Gold square with @: Your current position

## Walkthrough: Path to Victory

### Option 1: Main Path (Direct)

1. **Page 1**: Push open main gates → **Page 2**
2. **Page 2**: Take northern corridor → **Page 10**
3. **Page 10**: Hold breath and run (luck test) → **Page 20**
4. Take the Golden Key
5. Navigate to **Page 50**: Vault door
6. Use Golden Key → **Page 100**: Fight Guardian
7. Win combat → **Page 101**: VICTORY!

### Option 2: Knowledge Path (Easier)

1. **Page 1**: Study the symbols → **Page 4**
2. Gain knowledge flag and +1 LUCK
3. **Page 1**: Enter main gates → **Page 2**
4. **Page 2**: Take northern corridor → **Page 10**
5. **Page 10**: Use torch to disperse mist (requires knowledge flag) → **Page 21**
6. Get Golden Key AND healing potion (bonus!)
7. Navigate to **Page 50** → **Page 100** → **Page 101**: VICTORY!

### Option 3: Secret Entrance Path

1. **Page 1**: Search for secret entrance → **Page 3**
2. Get rusty sword and 5 gold (bonus start)
3. **Page 3**: Enter fortress → **Page 2**
4. Continue with paths above

### Option 4: Secret Vault Path (Advanced)

1. **Page 1**: Enter gates → **Page 2**
2. **Page 2**: Follow eastern corridor → **Page 11**
3. **Page 11**: Fight or bribe goblins → **Page 30/31/32**
4. Continue east → **Page 51**: Get equipment (+1 SKILL)
5. **Page 51** → **Page 52** → **Page 53**: Underground Lake
6. Take boat → Fight Water Serpent → **Page 56**
7. Get magic amulet (+2 LUCK) and 10 gold
8. **Page 56** → **Page 57**: Learn Lightning Bolt spell
9. **Page 57** → **Page 58**: Find secret passage to vault!
10. **Page 58** → **Page 100**: Face Guardian
11. Use Lightning Bolt spell → **Page 102**: VICTORY!

### Option 5: Maximum Preparation Path

Explore multiple paths to gather equipment before final battle:

1. Read symbols (Page 4) for knowledge
2. Find secret entrance (Page 3) for sword
3. Fight goblins (Page 11→30) for gold
4. Visit armory (Page 51) for equipment
5. Descend to cellar (Page 12→40) to meet Keeper
6. Answer riddle correctly (Page 61→60) for blessing
7. Get silver key and restoration
8. Find silver chest (Page 69) for magic sword
9. Proceed to vault well-equipped

## Tips & Strategies

### Combat Tips
- Higher SKILL = better combat odds
- Some fights are optional (flee or negotiate)
- Use ranged combat to avoid damage
- Heal before major battles

### Resource Management
- Save provisions for emergencies
- Use healing potions wisely
- Don't waste luck tests unnecessarily
- Manage STAMINA carefully

### Exploration Strategy
- Read the ancient symbols for advantages
- Look for secret paths and hidden items
- Some paths are easier but give fewer rewards
- Multiple routes lead to victory

### Important Decisions
1. **Read symbols** at start = easier green mist passage
2. **Secret entrance** = bonus equipment early
3. **Help Keeper** = powerful blessing
4. **Explore thoroughly** = better equipment for final fight

## Common Challenges

### The Green Mist (Page 10)
- **Hard way**: Hold breath (luck test, lose 2 STAMINA)
- **Easy way**: Read symbols first, then use torch (no damage, bonus potion)

### The Goblins (Page 11)
- **Fight**: Standard combat
- **Intimidate**: Skill test, avoids combat
- **Bribe**: Costs 3 gold, avoids combat

### The Keeper (Page 40)
- **Best**: Have read symbols → blessing + silver key
- **Good**: Answer riddle correctly (answer: "A map")
- **Bad**: Attack him → cursed (-3 STAMINA, -2 SKILL)

### The Cave Troll (Page 41)
- Tough fight: SKILL 8, STAMINA 10, damage 3
- Victory gives power crystal (+1 all stats)
- Can flee back to stairs

### The Guardian (Page 100)
- Final boss: SKILL 10, STAMINA 15, damage 3
- **Normal victory**: Page 101 (+1000 gold)
- **Lightning spell victory**: Page 102 (costs 3 STAMINA)

## Achievements (Unofficial)

Try these challenges:
- ✨ **Speed Runner**: Win with minimum pages visited
- 🗡️ **Warrior**: Win through direct combat path
- 🧙 **Mage**: Win using Lightning Bolt spell
- 🗺️ **Explorer**: Visit all 40+ pages
- 💰 **Wealthy**: Collect maximum gold
- 🛡️ **Prepared**: Collect all equipment before final fight
- 📖 **Scholar**: Find all knowledge and secrets
- ⚡ **Lucky**: Pass all luck tests in one playthrough

## Death and Game Over

If your STAMINA reaches 0:
- Combat defeat
- Failed escape attempts
- Harsh story consequences

**Solution**: Start a New Game
- Stats are re-rolled
- Fresh start with new strategy
- Try different paths

## Saving Progress

- Game auto-saves after every action
- Close and reopen app to resume
- Only one save slot (start new game to reset)

## Victory Conditions

Two ways to win:
1. **Combat Victory** (Page 101): Defeat Guardian in combat
2. **Magical Victory** (Page 102): Use Lightning Bolt spell on Guardian

Both are valid wins - your choice of playstyle!

---

**Good luck, adventurer!** May your skill be high, your stamina plentiful, and your luck never fail! ⚔️🛡️✨
