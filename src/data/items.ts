import { Item, Spell } from '../types/game';

export const items: Record<string, Item> = {
  rusty_sword: {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    description: 'An old sword found in the hidden passage. Still serviceable.',
    type: 'weapon',
    damage: 1,
  },
  steel_sword: {
    id: 'steel_sword',
    name: 'Steel Sword',
    description: 'A well-crafted steel sword from the armory.',
    type: 'weapon',
    damage: 2,
  },
  magic_sword: {
    id: 'magic_sword',
    name: 'Magic Sword',
    description: 'A glowing magical blade that enhances your combat prowess.',
    type: 'weapon',
    damage: 3,
    effect: '+2 SKILL',
  },
  shield: {
    id: 'shield',
    name: 'Sturdy Shield',
    description: 'A reliable shield for defense.',
    type: 'armor',
    defense: 1,
  },
  goblin_dagger: {
    id: 'goblin_dagger',
    name: 'Goblin Dagger',
    description: 'A crude but sharp dagger taken from goblins.',
    type: 'weapon',
    damage: 1,
  },
  bone_club: {
    id: 'bone_club',
    name: 'Bone Club',
    description: 'A massive club made from troll bones.',
    type: 'weapon',
    damage: 2,
  },
  golden_key: {
    id: 'golden_key',
    name: 'Golden Key',
    description: 'An ornate golden key that opens the treasure vault.',
    type: 'key',
  },
  silver_key: {
    id: 'silver_key',
    name: 'Silver Key',
    description: 'A silver key given by the Keeper.',
    type: 'key',
  },
  healing_potion: {
    id: 'healing_potion',
    name: 'Healing Potion',
    description: 'Restores 4 STAMINA when consumed.',
    type: 'potion',
    effect: '+4 STAMINA',
  },
  greater_healing_potion: {
    id: 'greater_healing_potion',
    name: 'Greater Healing Potion',
    description: 'Restores 8 STAMINA when consumed.',
    type: 'potion',
    effect: '+8 STAMINA',
  },
  luck_amulet: {
    id: 'luck_amulet',
    name: 'Amulet of Fortune',
    description: 'A magical amulet that enhances your luck.',
    type: 'treasure',
    effect: '+2 LUCK',
  },
  power_crystal: {
    id: 'power_crystal',
    name: 'Power Crystal',
    description: 'A glowing crystal that enhances all your abilities.',
    type: 'treasure',
    effect: '+1 to all stats',
  },
  rope: {
    id: 'rope',
    name: 'Strong Rope',
    description: 'A length of sturdy rope. Useful for climbing.',
    type: 'misc',
  },
  lightning_spell: {
    id: 'lightning_spell',
    name: 'Lightning Spell Scroll',
    description: 'A scroll containing the Lightning Bolt spell.',
    type: 'misc',
    effect: 'Teaches Lightning Bolt spell',
  },
};

export const spells: Record<string, Spell> = {
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    description: 'Unleashes a devastating bolt of lightning at your enemy.',
    cost: 3,
    effect: 'Deals 5 damage, ignores armor',
  },
};

export function getItemById(itemId: string): Item | undefined {
  return items[itemId];
}

export function getSpellById(spellId: string): Spell | undefined {
  return spells[spellId];
}
