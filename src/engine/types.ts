export type InvItem = { itemId: string; qty: number };

export type PlayerStats = {
  skill: number;
  stamina: number;
  luck: number;
  gold: number;
  xp: number;
  level: number;
};

export type PlayerState = {
  currentAreaId: string;
  discoveredMap: Record<string, true>;
  inventory: InvItem[];
  equipment: Record<string, string | null>;
  spellsKnown: string[];
  stats: PlayerStats;
  flags?: Record<string, any>;
  quests?: Record<string, any>;
};
