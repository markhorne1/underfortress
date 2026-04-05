export const PLAYER_MAX_HEALTH = 20;
export const ORC_MAX_HEALTH = 30;
export const GOBLIN_MAX_HEALTH = 15;

function hasTag(enemy: any, tag: string): boolean {
  return Array.isArray(enemy?.tags) && enemy.tags.some((value: unknown) => String(value).toLowerCase() === tag);
}

function startsWithWord(value: unknown, prefix: string): boolean {
  return String(value || '').toLowerCase().startsWith(prefix);
}

function getEnemyBaseHealth(enemy: any): number {
  if (typeof enemy?.maxHealth === 'number') return enemy.maxHealth;
  if (typeof enemy?.hp === 'number') return enemy.hp;
  if (typeof enemy?.stamina === 'number') return enemy.stamina * 10;
  return 10;
}

function isOrc(enemy: any): boolean {
  return hasTag(enemy, 'orc') || startsWithWord(enemy?.id, 'orc_') || startsWithWord(enemy?.name, 'orc ');
}

function isGoblin(enemy: any): boolean {
  return hasTag(enemy, 'goblin') || startsWithWord(enemy?.id, 'goblin_') || startsWithWord(enemy?.name, 'goblin ');
}

export function getBalancedEnemyMaxHealth(enemy: any): number {
  if (isOrc(enemy)) return ORC_MAX_HEALTH;
  if (isGoblin(enemy)) return GOBLIN_MAX_HEALTH;
  return Math.max(1, Math.floor(getEnemyBaseHealth(enemy) / 2));
}