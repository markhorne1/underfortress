export type InvItem = { itemId: string; qty: number };

export type SpellPath = 'fire' | 'water' | 'earth' | 'air';

export type SpellTarget = 'single' | 'multi' | 'all_enemies' | 'self' | 'area';

export type Spell = {
  id: string;
  name: string;
  path: SpellPath;
  tier: number;           // 1-4, higher tiers require previous tier learned
  cost: number;           // Stat points to learn
  targeting: SpellTarget;
  description: string;
  effects: {
    damage?: { min: number; max: number };
    ignoresAR?: boolean;
    statusEffect?: {
      type: string;      // frozen, burning, stunned, etc.
      duration: number;  // Turns
      value?: number;    // Damage per turn for DoTs
    };
    buff?: {
      stat: string;      // meleeDefense, ar, dodge, etc.
      value: number;
      duration: number;
    };
    special?: string;    // haste, teleport, flee, etc.
  };
  requiresSR?: boolean;   // Does enemy get Spell Resistance roll?
  srEffect?: string;      // What happens on successful SR: 'negate', 'halve', 'reduce_duration'
};

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
  position: 'front' | 'back';  // Combat positioning
  deathTimestamp?: number;  // Track when enemy died for UI delay
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
  intimidationAttempts?: Record<string, number>; // Track intimidation attempts per enemy instanceId
  pivotDefenseBonus?: { active: boolean; targetId: string }; // Track pivot defense bonus for current turn
};

export type PlayerState = {
  currentAreaId: string;
  discoveredMap: Record<string, true>;
  inventory: InvItem[];
  equipment: Record<string, string | null>;
  spellsKnown: string[];
  spellPathsUnlocked: SpellPath[];  // Unlocked magic paths
  combatSkills: string[];  // Learned combat skills (clash, feint, slash)
  stats: PlayerStats;
  health: number;  // Current health (max 100)
  stamina: number;  // Current stamina for skills/spells
  maxStamina: number;  // Maximum stamina (Power×5 + Mind×5 + Agility×5)
  lastCheckpointId: string;  // Area ID of last checkpoint for respawn
  combat?: CombatState;  // Active combat state
  flags?: Record<string, any>;
  quests: Record<string, any>;
  questLog: any[];
  activeBuffs?: Array<{
    stat: string;      // The stat being buffed (ar, attackDamage, meleeAttack, etc.)
    value: number;     // Buff amount
    duration: number;  // Turns remaining
  }>;
};
