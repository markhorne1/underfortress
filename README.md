# ⚔️ Under Fortress ⚔️
**Treasure of the Underfortress — An Illustrated Gamebook Adventure**

A mobile game inspired by Steve Jackson/Ian Livingstone's Fighting Fantasy gamebooks and classic text adventures like Zork. This content-driven, page-by-page adventure features:

## 🎮 Features

- **Fighting Fantasy Combat System**: Classic skill-based combat with dice rolls
- **Character Stats**: SKILL, STAMINA, LUCK, Gold, and Provisions
- **Fog-of-War Grid Map**: Explore an 11x11 dungeon with hidden areas revealed as you progress
- **Branching Narrative**: Flag-driven story with multiple paths and choices
- **Combat Options**: 
  - Melee combat with attack strength calculations
  - Ranged combat for tactical positioning
  - Chase and retreat mechanics
  - Flee options when enemies allow it
- **Inventory System**: Collect weapons, armor, potions, keys, and treasures
- **Spell System**: Learn and cast magical spells
- **Skills Tests**: Test your SKILL and LUCK at critical moments
- **Save/Load**: Auto-save your progress using AsyncStorage
- **Rich Content**: 40+ story pages with multiple endings

## 🏰 Story

You are a brave adventurer seeking the legendary treasure of the Underfortress, an ancient dungeon filled with dangers and riches. Will you triumph and claim the treasure, or will you perish in the depths?

## 🎯 Game Mechanics

### Character Stats
- **SKILL**: Your combat prowess (9-14 starting range)
- **STAMINA**: Your health points (14-26 starting range)
- **LUCK**: Fortune favors the bold (7-13 starting range)
- **Gold**: Currency for bribes and purchases
- **Provisions**: Restore 4 STAMINA when consumed

### Combat
- Each combat round, both you and your enemy roll 2d6 + SKILL
- Highest total wins the round and deals damage
- Standard damage is 2 STAMINA per hit
- Some enemies have special damage values
- Flee from combat when possible (50% success rate)

### Exploration
- Make choices to navigate through the story
- Some choices require specific items, flags, or stat tests
- The map reveals your path through the fortress
- Find secret passages and hidden treasures

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, included as dependency)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web browser
```

### Controls
- **📊 Stats Button**: View your character sheet
- **🎒 Backpack Button**: View inventory and spells
- **🗺️ Map Button**: View the fog-of-war dungeon map
- **🍖 Food Button**: Eat provisions to restore health
- **Choice Buttons**: Make decisions to progress the story

## 🗺️ Game Structure

```
src/
├── components/          # React components
│   ├── CharacterSheet.tsx    # Character stats display
│   ├── CombatScreen.tsx      # Combat interface
│   ├── Inventory.tsx         # Inventory management
│   └── MapComponent.tsx      # Fog-of-war map
├── context/            # State management
│   └── GameContext.tsx       # Global game state
├── data/              # Game content
│   ├── gamePages.ts          # Story pages and narrative
│   └── items.ts              # Items and spells
├── screens/           # Main screens
│   └── GameScreen.tsx        # Main game interface
├── types/             # TypeScript types
│   └── game.ts               # Type definitions
└── utils/             # Utility functions
    └── combat.ts             # Combat and dice mechanics
```

## 🎲 Adding Content

### Creating New Story Pages

Edit `src/data/gamePages.ts` to add new pages:

```typescript
{
  id: 999,
  title: "Your Page Title",
  text: "Your story text here...",
  image: "scene_name",
  mapPosition: { x: 5, y: 5 },
  choices: [
    {
      text: "Choice description",
      targetPageId: 1000,
      requiredFlags: ["optional_flag"],
      skillTest: 8,  // Optional skill test
    }
  ],
  setFlags: ["new_flag"],
  modifyStats: { stamina: -2, gold: 10 },
}
```

### Adding Items

Edit `src/data/items.ts`:

```typescript
new_item: {
  id: 'new_item',
  name: 'Item Name',
  description: 'Item description',
  type: 'weapon',  // or 'armor', 'potion', 'key', 'treasure', 'misc'
  damage: 3,       // for weapons
  effect: 'Special effect description',
}
```

## 🎨 Customization

### Adding Real Images
Replace the placeholder images in the `assets/` folder:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen
- `adaptive-icon.png` - Android adaptive icon
- Add page illustration images and reference them in gamePages

### Styling
All styles are in StyleSheet objects within each component. Modify colors, fonts, and layouts to match your vision.

## 📱 Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for web
expo build:web
```

## 🐛 Known Limitations

- Images are currently placeholders (emoji-based)
- No sound effects or music yet
- Limited to single-player experience
- No achievements or statistics tracking

## 🔮 Future Enhancements

- [ ] Add real illustrations for each scene
- [ ] Sound effects and background music
- [ ] Multiple character classes
- [ ] More spells and magical items
- [ ] Achievements system
- [ ] Multiple save slots
- [ ] Death/failure statistics
- [ ] Expanded story content

## 📄 License

ISC License

## 🙏 Acknowledgments

Inspired by:
- Steve Jackson and Ian Livingstone's Fighting Fantasy series
- Zork and other classic text adventures
- Classic tabletop RPGs

---

**Start your adventure now!** Will you claim the treasure or perish in the depths of the Underfortress?
