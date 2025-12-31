import { GamePage } from '../types/game';

// The adventure story for "Treasure of the Underfortress"
export const gamePages: GamePage[] = [
  {
    id: 1,
    title: "The Gates of the Underfortress",
    text: "You stand before the ancient gates of the Underfortress, a legendary dungeon said to hold untold treasures. The iron gates are rusted but still imposing. Strange symbols are carved into the stone archway above. A cold wind blows from within, carrying whispers of danger and riches alike.\n\nYour adventure begins here, brave hero. Will you enter the fortress through the main gate, or search for another entrance?",
    image: "gate",
    mapPosition: { x: 5, y: 5 },
    choices: [
      {
        text: "Push open the main gates and enter boldly",
        targetPageId: 2,
      },
      {
        text: "Search around the walls for a secret entrance",
        targetPageId: 3,
      },
      {
        text: "Study the symbols on the archway",
        targetPageId: 4,
      },
    ],
  },
  {
    id: 2,
    title: "The Entry Hall",
    text: "The heavy gates creak open. You enter a vast stone hall lit by flickering torches. The ceiling soars high above, lost in shadows. Three corridors lead deeper into the fortress: one to the north glows with an eerie green light, another to the east echoes with distant sounds, and stairs descend into darkness to the south.",
    image: "hall",
    mapPosition: { x: 5, y: 4 },
    setFlags: ["entered_main_gate"],
    choices: [
      {
        text: "Take the northern corridor with green light",
        targetPageId: 10,
      },
      {
        text: "Follow the echoing sounds to the east",
        targetPageId: 11,
      },
      {
        text: "Descend the stairs to the south",
        targetPageId: 12,
      },
    ],
  },
  {
    id: 3,
    title: "The Hidden Passage",
    text: "You search along the outer walls and discover a narrow crack hidden behind overgrown vines. Squeezing through, you find yourself in a small chamber. A skeleton lies against the wall, clutching a sword. On the floor is a leather pouch containing 5 gold pieces.",
    image: "passage",
    mapPosition: { x: 4, y: 5 },
    setFlags: ["found_secret_entrance"],
    modifyStats: { gold: 5 },
    items: ["rusty_sword"],
    choices: [
      {
        text: "Take the sword and gold, then proceed into the fortress",
        targetPageId: 2,
      },
      {
        text: "Leave the skeleton in peace and return to the main gate",
        targetPageId: 1,
      },
    ],
  },
  {
    id: 4,
    title: "Ancient Knowledge",
    text: "You study the mysterious symbols carefully. They appear to be a warning in an ancient language. Through concentration, you decipher: 'Beware the Green Mist. Light conquers shadow. The key lies with the keeper.' You gain insight that may prove valuable. (Add 1 to your LUCK)",
    image: "symbols",
    mapPosition: { x: 5, y: 5 },
    setFlags: ["read_symbols"],
    modifyStats: { luck: 1 },
    choices: [
      {
        text: "Enter through the main gates",
        targetPageId: 2,
      },
    ],
  },
  {
    id: 10,
    title: "The Chamber of Green Mist",
    text: "The green glow comes from a thick mist that fills this chamber. As you enter, you feel it burning your lungs. The mist is poisonous! You must decide quickly.",
    image: "mist",
    mapPosition: { x: 5, y: 3 },
    choices: [
      {
        text: "Hold your breath and run through (Test your LUCK)",
        targetPageId: 20,
        luckTest: true,
      },
      {
        text: "Retreat back to the hall",
        targetPageId: 2,
      },
      {
        text: "Use a torch to disperse the mist",
        targetPageId: 21,
        requiredFlags: ["read_symbols"],
      },
    ],
  },
  {
    id: 11,
    title: "The Goblin Guards",
    text: "You follow the echoing sounds and encounter two GOBLIN guards playing dice. They spot you and jump to their feet, drawing crude weapons!",
    image: "goblins",
    mapPosition: { x: 6, y: 4 },
    enemies: [
      {
        id: "goblin1",
        name: "Goblin Guard",
        skill: 5,
        stamina: 5,
        damage: 1,
        canFlee: true,
      },
    ],
    choices: [
      {
        text: "Fight the goblins!",
        targetPageId: 30,
        action: "combat",
      },
      {
        text: "Try to intimidate them (Test your SKILL)",
        targetPageId: 31,
        skillTest: 7,
      },
      {
        text: "Offer them gold to let you pass (costs 3 gold)",
        targetPageId: 32,
        requiredItem: "gold",
      },
    ],
  },
  {
    id: 12,
    title: "The Dark Descent",
    text: "You descend the stairs carefully. The air grows colder with each step. At the bottom, you find yourself in a damp cellar. Water drips from the ceiling. A faint light glows from a doorway ahead, and you hear the sound of something large moving in the darkness.",
    image: "cellar",
    mapPosition: { x: 5, y: 6 },
    choices: [
      {
        text: "Move toward the light quietly",
        targetPageId: 40,
      },
      {
        text: "Investigate the sound in the darkness",
        targetPageId: 41,
      },
      {
        text: "Return up the stairs",
        targetPageId: 2,
      },
    ],
  },
  {
    id: 20,
    title: "Through the Mist",
    text: "You hold your breath and dash through the green mist. Your eyes water and your chest burns, but you make it through! However, the poison has affected you. (Lose 2 STAMINA)\n\nBeyond the mist, you find a room with a golden pedestal holding an ornate key.",
    image: "key",
    mapPosition: { x: 5, y: 2 },
    modifyStats: { stamina: -2 },
    items: ["golden_key"],
    setFlags: ["has_golden_key"],
    choices: [
      {
        text: "Take the golden key",
        targetPageId: 50,
      },
    ],
  },
  {
    id: 21,
    title: "Light Conquers Shadow",
    text: "Remembering the ancient symbols' advice, you thrust your torch into the green mist. The flames burn bright and the mist recoils, dispersing into nothing! You pass through safely and find a golden key on a pedestal, along with a healing potion.",
    image: "disperse",
    mapPosition: { x: 5, y: 2 },
    items: ["golden_key", "healing_potion"],
    setFlags: ["has_golden_key", "used_ancient_knowledge"],
    choices: [
      {
        text: "Take the key and potion, then continue",
        targetPageId: 50,
      },
    ],
  },
  {
    id: 30,
    title: "Victory Over Goblins",
    text: "You defeat the goblin guards! Searching their belongings, you find 4 gold pieces and a small dagger. A passage leads further east.",
    image: "victory",
    mapPosition: { x: 6, y: 4 },
    modifyStats: { gold: 4 },
    items: ["goblin_dagger"],
    choices: [
      {
        text: "Continue east",
        targetPageId: 51,
      },
      {
        text: "Return to the hall",
        targetPageId: 2,
      },
    ],
  },
  {
    id: 31,
    title: "Intimidation Success",
    text: "You draw your weapon and shout a fearsome battle cry! The goblins, being cowardly creatures, drop their weapons and flee deeper into the fortress. You may continue safely. You also spot 2 gold pieces they dropped in their panic.",
    image: "flee",
    mapPosition: { x: 6, y: 4 },
    modifyStats: { gold: 2 },
    choices: [
      {
        text: "Continue east",
        targetPageId: 51,
      },
      {
        text: "Return to the hall",
        targetPageId: 2,
      },
    ],
  },
  {
    id: 32,
    title: "Gold for Passage",
    text: "You toss 3 gold pieces to the goblins. They snatch them up greedily and gesture for you to pass, though they watch you with suspicious eyes.",
    image: "bribe",
    mapPosition: { x: 6, y: 4 },
    modifyStats: { gold: -3 },
    choices: [
      {
        text: "Continue east",
        targetPageId: 51,
      },
    ],
  },
  {
    id: 40,
    title: "The Keeper's Chamber",
    text: "You move toward the light and enter a small chamber. An old man in tattered robes sits by a candle, reading an ancient tome. He looks up at you with wise, tired eyes.\n\n'Welcome, adventurer,' he says. 'I am the Keeper of the Underfortress. I can offer you aid, but first, do you possess the token of knowledge?'",
    image: "keeper",
    mapPosition: { x: 5, y: 7 },
    choices: [
      {
        text: "Tell him you read the ancient symbols",
        targetPageId: 60,
        requiredFlags: ["read_symbols"],
      },
      {
        text: "Ask him for help anyway",
        targetPageId: 61,
      },
      {
        text: "Attack the old man (he might have treasure)",
        targetPageId: 62,
      },
    ],
  },
  {
    id: 41,
    title: "The Cave Troll",
    text: "You venture into the darkness and suddenly a massive creature emerges! It's a CAVE TROLL - huge, ugly, and very angry that you've disturbed its lair. It roars and charges at you!",
    image: "troll",
    mapPosition: { x: 4, y: 6 },
    enemies: [
      {
        id: "cave_troll",
        name: "Cave Troll",
        skill: 8,
        stamina: 10,
        damage: 3,
        canFlee: true,
      },
    ],
    choices: [
      {
        text: "Fight the Cave Troll!",
        targetPageId: 70,
        action: "combat",
      },
      {
        text: "Try to flee back to the stairs",
        targetPageId: 12,
      },
    ],
  },
  {
    id: 50,
    title: "The Treasure Vault Door",
    text: "You proceed through the fortress and arrive at a massive iron door. In its center is a golden keyhole that matches your key perfectly. This must be the entrance to the treasure vault! Ancient runes on the door warn: 'Beyond lies fortune and doom in equal measure.'",
    image: "vault_door",
    mapPosition: { x: 5, y: 1 },
    choices: [
      {
        text: "Use the golden key to open the vault",
        targetPageId: 100,
        requiredFlags: ["has_golden_key"],
      },
      {
        text: "Turn back - perhaps you're not ready",
        targetPageId: 2,
      },
    ],
  },
  {
    id: 51,
    title: "The Armory",
    text: "The eastern passage leads to an old armory. Weapons and armor line the walls, though most are rusted. However, you find a well-maintained sword and a sturdy shield! (Add 1 to SKILL)",
    image: "armory",
    mapPosition: { x: 7, y: 4 },
    items: ["steel_sword", "shield"],
    modifyStats: { skill: 1 },
    setFlags: ["found_armory"],
    choices: [
      {
        text: "Take the equipment and continue exploring",
        targetPageId: 52,
      },
    ],
  },
  {
    id: 52,
    title: "The Crossroads",
    text: "You reach a junction where multiple passages meet. Signs of recent travel mark the dust on the floor. Which way will you go?",
    image: "crossroads",
    mapPosition: { x: 7, y: 3 },
    choices: [
      {
        text: "Head north toward strange sounds",
        targetPageId: 10,
      },
      {
        text: "Continue west back to the main hall",
        targetPageId: 2,
      },
      {
        text: "Explore south into uncharted territory",
        targetPageId: 53,
      },
    ],
  },
  {
    id: 53,
    title: "The Underground Lake",
    text: "The passage opens into a vast cavern containing an underground lake. The water is eerily still and glows with bioluminescent algae. A small boat is tied to the shore. Across the lake, you can see another passage.",
    image: "lake",
    mapPosition: { x: 7, y: 5 },
    choices: [
      {
        text: "Take the boat across the lake",
        targetPageId: 54,
      },
      {
        text: "Walk around the lake edge",
        targetPageId: 55,
      },
      {
        text: "Return to the crossroads",
        targetPageId: 52,
      },
    ],
  },
  {
    id: 54,
    title: "The Water Serpent",
    text: "As you row across the lake, the water suddenly erupts! A WATER SERPENT rises from the depths, its scales gleaming in the strange light. It strikes at your boat!",
    image: "serpent",
    mapPosition: { x: 7, y: 6 },
    enemies: [
      {
        id: "water_serpent",
        name: "Water Serpent",
        skill: 7,
        stamina: 8,
        damage: 2,
        isRanged: true,
      },
    ],
    choices: [
      {
        text: "Fight the serpent from the boat!",
        targetPageId: 56,
        action: "combat",
      },
      {
        text: "Row frantically back to shore",
        targetPageId: 53,
      },
    ],
  },
  {
    id: 55,
    title: "The Safe Path",
    text: "You carefully walk around the lake edge. It takes longer, but you avoid any danger from the water. You reach the far passage safely and find a small cache hidden in the rocks - 8 gold pieces and a rope!",
    image: "cache",
    mapPosition: { x: 8, y: 6 },
    modifyStats: { gold: 8 },
    items: ["rope"],
    choices: [
      {
        text: "Continue through the far passage",
        targetPageId: 57,
      },
    ],
  },
  {
    id: 56,
    title: "Serpent Defeated",
    text: "You defeat the water serpent! Its body sinks back into the depths. You row to the far shore safely. The creature had been guarding a small chest - inside you find a magical amulet and 10 gold pieces! (The amulet adds 2 to LUCK)",
    image: "amulet",
    mapPosition: { x: 8, y: 6 },
    items: ["luck_amulet"],
    modifyStats: { gold: 10, luck: 2 },
    setFlags: ["defeated_serpent"],
    choices: [
      {
        text: "Continue through the far passage",
        targetPageId: 57,
      },
    ],
  },
  {
    id: 57,
    title: "The Ancient Library",
    text: "The passage leads to a preserved library. Shelves of ancient books line the walls. In the center is a reading table with an open spellbook. You learn a powerful spell! You now know the LIGHTNING BOLT spell (costs 3 STAMINA to cast).",
    image: "library",
    mapPosition: { x: 8, y: 7 },
    items: ["lightning_spell"],
    setFlags: ["learned_lightning"],
    choices: [
      {
        text: "Continue exploring - you sense you're close to something important",
        targetPageId: 58,
      },
      {
        text: "Return to explore other areas",
        targetPageId: 52,
      },
    ],
  },
  {
    id: 58,
    title: "The Secret Passage to the Vault",
    text: "Behind a bookshelf, you discover a hidden passage! It leads upward through the fortress and opens behind the treasure vault. You can bypass the main entrance!",
    image: "secret",
    mapPosition: { x: 7, y: 1 },
    setFlags: ["found_vault_backdoor"],
    choices: [
      {
        text: "Enter the vault through the secret entrance",
        targetPageId: 100,
      },
    ],
  },
  {
    id: 60,
    title: "The Keeper's Blessing",
    text: "The old man smiles warmly. 'Ah, you have the wisdom to learn before you act. This pleases me greatly. I shall grant you my blessing.'\n\nHe touches your forehead and you feel renewed strength flow through you. (Restore STAMINA to maximum and gain +1 LUCK). He also gives you a silver key.\n\n'This key will aid you in the depths below. Go now, with my blessing.'",
    image: "blessing",
    mapPosition: { x: 5, y: 7 },
    items: ["silver_key"],
    modifyStats: { luck: 1 },
    setFlags: ["keeper_blessing", "has_silver_key"],
    choices: [
      {
        text: "Thank him and continue your quest",
        targetPageId: 63,
      },
    ],
  },
  {
    id: 61,
    title: "The Keeper's Test",
    text: "'Very well,' says the old man, 'I shall help you, but first you must prove your worth. Answer me this riddle: I have cities but no houses, forests but no trees, and water but no fish. What am I?'",
    image: "riddle",
    mapPosition: { x: 5, y: 7 },
    choices: [
      {
        text: "'A map!'",
        targetPageId: 60,
      },
      {
        text: "'A dream!'",
        targetPageId: 64,
      },
      {
        text: "Attack him instead of answering",
        targetPageId: 62,
      },
    ],
  },
  {
    id: 62,
    title: "The Keeper's Curse",
    text: "You raise your weapon against the old man. His eyes flash with anger and disappointment. 'Fool! I offered wisdom and you chose violence!'\n\nHe raises his hand and speaks words of power. You feel your strength draining away. (Lose 3 STAMINA and 2 SKILL)\n\nThe Keeper vanishes in a puff of smoke, leaving you weakened and alone.",
    image: "curse",
    mapPosition: { x: 5, y: 7 },
    modifyStats: { stamina: -3, skill: -2 },
    setFlags: ["keeper_cursed"],
    choices: [
      {
        text: "Continue your quest, cursed and weakened",
        targetPageId: 63,
      },
    ],
  },
  {
    id: 63,
    title: "The Lower Chambers",
    text: "You leave the Keeper's chamber and explore the lower levels of the fortress. The passages here are older and more dangerous. You must choose your path carefully.",
    image: "lower",
    mapPosition: { x: 5, y: 8 },
    choices: [
      {
        text: "Follow a passage marked with old warning signs",
        targetPageId: 65,
      },
      {
        text: "Take a narrow tunnel that slopes upward",
        targetPageId: 66,
      },
      {
        text: "Find stairs leading back up to the main level",
        targetPageId: 2,
      },
    ],
  },
  {
    id: 64,
    title: "Wrong Answer",
    text: "The Keeper shakes his head sadly. 'That is not the answer. I cannot help you.' He returns to his reading, ignoring you completely. You must continue on your own.",
    image: "rejected",
    mapPosition: { x: 5, y: 7 },
    choices: [
      {
        text: "Leave and continue exploring",
        targetPageId: 63,
      },
    ],
  },
  {
    id: 65,
    title: "The Trap Room",
    text: "You ignore the warnings and enter a chamber. Suddenly, pressure plates click under your feet! Arrows shoot from the walls! (Test your LUCK)",
    image: "trap",
    mapPosition: { x: 4, y: 8 },
    choices: [
      {
        text: "Try to dodge! (LUCK test)",
        targetPageId: 67,
        luckTest: true,
      },
      {
        text: "Dive forward through the arrows",
        targetPageId: 68,
      },
    ],
  },
  {
    id: 66,
    title: "The Spiral Staircase",
    text: "The narrow tunnel leads to a spiral staircase carved from stone. As you climb, you notice alcoves in the walls containing ancient treasures. You find a potion of healing and 5 gold pieces!",
    image: "spiral",
    mapPosition: { x: 6, y: 7 },
    items: ["healing_potion"],
    modifyStats: { gold: 5 },
    choices: [
      {
        text: "Continue up the stairs",
        targetPageId: 50,
      },
    ],
  },
  {
    id: 67,
    title: "Lucky Escape",
    text: "Your luck holds! You dodge and weave, and most of the arrows miss. One grazes your arm (lose 1 STAMINA), but you make it through alive. Beyond the trap, you find the mechanism and disable it, then discover a locked chest. If you have the silver key, you can open it.",
    image: "dodge",
    mapPosition: { x: 4, y: 9 },
    modifyStats: { stamina: -1 },
    choices: [
      {
        text: "Open the chest with the silver key",
        targetPageId: 69,
        requiredFlags: ["has_silver_key"],
      },
      {
        text: "Leave the chest and continue",
        targetPageId: 66,
      },
    ],
  },
  {
    id: 68,
    title: "Painful Progress",
    text: "You dive forward recklessly. Several arrows strike you, causing serious wounds. (Lose 4 STAMINA). You make it through, but you're badly hurt. You should find healing soon.",
    image: "wounded",
    mapPosition: { x: 4, y: 9 },
    modifyStats: { stamina: -4 },
    choices: [
      {
        text: "Press on despite your wounds",
        targetPageId: 66,
      },
    ],
  },
  {
    id: 69,
    title: "The Silver Chest",
    text: "The silver key fits perfectly! Inside the chest you find a magnificent treasure: a magical sword that glows with inner light (adds 2 to SKILL), a potion of great healing, and 15 gold pieces. The Keeper's gift has served you well!",
    image: "treasure",
    mapPosition: { x: 4, y: 9 },
    items: ["magic_sword", "greater_healing_potion"],
    modifyStats: { gold: 15, skill: 2 },
    setFlags: ["found_silver_treasure"],
    choices: [
      {
        text: "Continue to the upper levels",
        targetPageId: 66,
      },
    ],
  },
  {
    id: 70,
    title: "Troll Slain",
    text: "After a brutal fight, you defeat the Cave Troll! Its body crashes to the ground. Searching the cave, you find its hoard: 12 gold pieces, a bone club, and a strange glowing crystal. The crystal pulses with magic (adds 1 to all stats).",
    image: "troll_dead",
    mapPosition: { x: 4, y: 6 },
    items: ["bone_club", "power_crystal"],
    modifyStats: { gold: 12, skill: 1, stamina: 1, luck: 1 },
    setFlags: ["defeated_troll"],
    choices: [
      {
        text: "Continue exploring the deep caves",
        targetPageId: 40,
      },
    ],
  },
  {
    id: 100,
    title: "The Treasure Vault",
    text: "The massive door swings open, revealing a vast chamber filled with gold, jewels, and ancient artifacts! But guarding it all is the FORTRESS GUARDIAN - an ancient suit of animated armor, wielding a massive sword. It comes to life as you enter!\n\n'None shall plunder the treasury!' it booms. This is your final challenge!",
    image: "guardian",
    mapPosition: { x: 5, y: 0 },
    enemies: [
      {
        id: "fortress_guardian",
        name: "Fortress Guardian",
        skill: 10,
        stamina: 15,
        damage: 3,
      },
    ],
    choices: [
      {
        text: "Fight the Guardian for the treasure!",
        targetPageId: 101,
        action: "combat",
      },
      {
        text: "Cast Lightning Bolt spell",
        targetPageId: 102,
        requiredFlags: ["learned_lightning"],
      },
      {
        text: "Retreat while you still can",
        targetPageId: 50,
      },
    ],
  },
  {
    id: 101,
    title: "VICTORY!",
    text: "With a final mighty blow, you shatter the Fortress Guardian! Its armor falls to pieces, lifeless once more. The treasure vault is yours!\n\nYou gather as much wealth as you can carry - chests of gold, precious gems, magical artifacts. You have conquered the Underfortress and claimed its legendary treasure!\n\nYou emerge victorious, wealthy beyond your wildest dreams, ready for your next adventure.\n\nTHE END - YOU WIN!",
    image: "victory_final",
    mapPosition: { x: 5, y: 0 },
    modifyStats: { gold: 1000 },
    isVictory: true,
    choices: [],
  },
  {
    id: 102,
    title: "LIGHTNING VICTORY!",
    text: "You channel your magical energy and unleash a devastating LIGHTNING BOLT! (Lose 3 STAMINA from the casting). The spell strikes the Guardian dead center, causing massive damage.\n\nThe ancient armor explodes in a shower of sparks! The Guardian is destroyed! Your magical prowess has won the day!\n\nThe treasure vault is yours! You claim the legendary treasure of the Underfortress and emerge victorious!\n\nTHE END - YOU WIN!",
    image: "lightning_win",
    mapPosition: { x: 5, y: 0 },
    modifyStats: { stamina: -3, gold: 1000 },
    isVictory: true,
    choices: [],
  },
];

// Helper function to get a page by ID
export function getPageById(id: number): GamePage | undefined {
  return gamePages.find(page => page.id === id);
}

// Helper function to check if choice is available
export function isChoiceAvailable(
  choice: { requiredFlags?: string[]; forbiddenFlags?: string[]; requiredItem?: string },
  gameFlags: string[],
  inventory: Array<{ id: string }>
): boolean {
  // Check required flags
  if (choice.requiredFlags) {
    const hasAllFlags = choice.requiredFlags.every(flag => gameFlags.includes(flag));
    if (!hasAllFlags) return false;
  }

  // Check forbidden flags
  if (choice.forbiddenFlags) {
    const hasAnyForbidden = choice.forbiddenFlags.some(flag => gameFlags.includes(flag));
    if (hasAnyForbidden) return false;
  }

  // Check required item
  if (choice.requiredItem && choice.requiredItem === 'gold') {
    return true; // Gold is in character stats, not inventory
  }

  if (choice.requiredItem) {
    const hasItem = inventory.some(item => item.id === choice.requiredItem);
    if (!hasItem) return false;
  }

  return true;
}
