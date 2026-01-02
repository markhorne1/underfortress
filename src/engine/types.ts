export type InvItem = { itemId: string; qty: number };

export type PlayerStats = {
  skill: number;
  stamina: number;
  luck: number;
  gold: number;
  xp: number;
  level: number;
  
  // Active Skills (used with buttons/actions)
  search: number;        // Finding hidden items/clues
  investigate: number;   // Examining objects for quest clues
  meleeAttack: number;   // Close combat proficiency
  rangedAttack: number;  // Distant combat proficiency
  castSpell: number;     // Magic casting ability
  lockpick: number;      // Opening locks
  pickpocket: number;    // Stealth theft
  
  // Passive Skills (affect calculations)
  perception: number;    // Awareness, used in Search DCs
  meleeDefense: number;  // Reduces melee damage taken
  rangedDefense: number; // Reduces ranged damage taken
  dodge: number;         // Chance to avoid attacks
  spellResistance: number; // Reduces magic damage
  stealth: number;       // Avoiding detection
  persuasion: number;    // Social interactions
  intimidation: number;  // Forcing outcomes
};

export type PlayerState = {
  currentAreaId: string;
  discoveredMap: Record<string, true>;
  inventory: InvItem[];
  equipment: Record<string, string | null>;
  spellsKnown: string[];
  stats: PlayerStats;
  flags?: Record<string, any>;
  quests: Record<string, any>;
  questLog: any[];
};
