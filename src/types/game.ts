// Core game types for Fighting Fantasy style adventure

export interface Character {
  skill: number;
  stamina: number;
  maxStamina: number;
  luck: number;
  maxLuck: number;
  gold: number;
  provisions: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'key' | 'treasure' | 'misc';
  damage?: number;
  defense?: number;
  effect?: string;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  cost: number; // stamina cost
  effect: string;
}

export interface Enemy {
  id: string;
  name: string;
  skill: number;
  stamina: number;
  damage: number;
  canFlee?: boolean;
  isRanged?: boolean;
}

export interface Choice {
  text: string;
  targetPageId: number;
  requiredFlags?: string[];
  forbiddenFlags?: string[];
  requiredItem?: string;
  skillTest?: number;
  luckTest?: boolean;
  action?: 'combat' | 'test' | 'item' | 'spell';
}

export interface GamePage {
  id: number;
  title: string;
  text: string;
  image?: string;
  choices: Choice[];
  enemies?: Enemy[];
  items?: string[];
  setFlags?: string[];
  removeFlags?: string[];
  modifyStats?: {
    stamina?: number;
    skill?: number;
    luck?: number;
    gold?: number;
    provisions?: number;
  };
  mapPosition?: { x: number; y: number };
  isVictory?: boolean;
  isDefeat?: boolean;
}

export interface GameState {
  character: Character;
  inventory: Item[];
  spells: Spell[];
  currentPageId: number;
  flags: string[];
  visitedPages: number[];
  visitedMapCells: Array<{ x: number; y: number }>;
  inCombat: boolean;
  currentEnemy?: Enemy;
  combatRound: number;
}

export interface MapCell {
  x: number;
  y: number;
  discovered: boolean;
  pageId?: number;
}
