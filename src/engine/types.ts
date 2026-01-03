export type InvItem = { itemId: string; qty: number };

export type SpellPath = 'fire' | 'water' | 'earth' | 'air';

export type PlayerStats = {
  gold: number;       // Currency for purchases
  
  // Core Stats (1-10 range)
  power: number;      // Physical strength, melee combat
  mind: number;       // Intelligence, magic, social
  agility: number;    // Speed, ranged combat, dodging
  vision: number;     // Perception, awareness, searching
  
  // Stat Point System
  statPoints: number; // Available points to spend
};

export type EnemyStats = {
  power: number;
  mind: number;
  agility: number;
  vision: number;
};

export type Enemy = {
  id: string;
  name: string;
  kind: string;  // humanoid, beast, undead, etc.
  stats: EnemyStats;
  maxHealth: number;
  equipment?: Record<string, string | null>;  // Equipped items (weapons, armor)
  spells?: string[];  // Known spell IDs
  loot?: Array<{
    itemId: string;
    min: number;
    max: number;
    chance?: number;  // 0-1 probability, defaults to 1
  }>;
  goldDrop?: { min: number; max: number };
  statPointsDrop?: number;  // Stat points awarded on defeat
  tags?: string[];
  meta?: Record<string, any>;  // Custom properties for special behaviors
};

export type EnemyInstance = {
  instanceId: string;  // Unique ID for this combat instance
  enemyId: string;     // Reference to Enemy definition
  name: string;        // Display name
  health: number;      // Current health
  maxHealth: number;
  stats: EnemyStats;
  equipment: Record<string, string | null>;
  spells: string[];
  statusEffects?: Array<{
    type: string;      // frozen, burning, stunned, etc.
    duration: number;  // Turns remaining
    value?: number;    // Effect strength/damage
  }>;
};

export type CombatState = {
  active: boolean;
  enemies: EnemyInstance[];
  selectedEnemyId?: string;
  playerTurn: boolean;
  turnNumber: number;
  combatLog: string[];
};

export type PlayerState = {
  currentAreaId: string;
  discoveredMap: Record<string, true>;
  inventory: InvItem[];
  equipment: Record<string, string | null>;
  spellsKnown: string[];
  spellPathsUnlocked: SpellPath[];  // Unlocked magic paths
  stats: PlayerStats;
  health: number;  // Current health (max 100)
  lastCheckpointId: string;  // Area ID of last checkpoint for respawn
  combat?: CombatState;  // Active combat state
  flags?: Record<string, any>;
  quests: Record<string, any>;
  questLog: any[];
};
