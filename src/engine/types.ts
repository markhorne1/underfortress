export type InvItem = { itemId: string; qty: number };

export type PlayerStats = {
  // Legacy stats (kept for compatibility)
  skill: number;  // Deprecated, use core stats instead
  stamina: number;  // Deprecated, replaced by health
  luck: number;
  gold: number;
  xp: number;  // Deprecated, replaced by statPoints
  level: number;
  
  // Core Stats (1-10 range)
  power: number;      // Physical strength, melee combat
  mind: number;       // Intelligence, magic, social
  agility: number;    // Speed, ranged combat, dodging
  vision: number;     // Perception, awareness, searching
  
  // Stat Point System
  statPoints: number; // Available points to spend
};

export type PlayerState = {
  currentAreaId: string;
  discoveredMap: Record<string, true>;
  inventory: InvItem[];
  equipment: Record<string, string | null>;
  spellsKnown: string[];
  stats: PlayerStats;
  health: number;  // Current health (max 100)
  lastCheckpointId: string;  // Area ID of last checkpoint for respawn
  flags?: Record<string, any>;
  quests: Record<string, any>;
  questLog: any[];
};
