import { PlayerState } from './types';

/**
 * Calculate skill values from core stats using the design formulas
 */

export function getSearch(state: PlayerState): number {
  return state.stats.vision * 10;
}

export function getInvestigate(state: PlayerState): number {
  return state.stats.mind * 10;
}

export function getMeleeAttack(state: PlayerState): number {
  return state.stats.power * 10;
}

export function getRangedAttack(state: PlayerState): number {
  return state.stats.agility * 10;
}

export function getCastSpell(state: PlayerState): number {
  return state.stats.mind * 10;
}

export function getLockpick(state: PlayerState): number {
  return state.stats.vision * 5 + state.stats.agility * 5;
}

export function getPickpocket(state: PlayerState): number {
  return state.stats.mind * 5 + state.stats.agility * 5;
}

export function getPerception(state: PlayerState): number {
  return state.stats.vision * 10;
}

export function getMeleeDefense(state: PlayerState): number {
  const armourRating = getTotalArmourRating(state);
  return armourRating + state.stats.power * 5 + state.stats.agility * 5;
}

export function getRangedDefense(state: PlayerState): number {
  return state.stats.vision * 5 + state.stats.agility * 5;
}

export function getDodge(state: PlayerState): number {
  return state.stats.agility * 10;
}

export function getSpellResistance(state: PlayerState): number {
  return state.stats.mind * 10;
}

export function getStealth(state: PlayerState): number {
  return state.stats.mind * 5 + state.stats.agility * 5;
}

export function getPersuasion(state: PlayerState): number {
  return state.stats.mind * 10;
}

export function getIntimidation(state: PlayerState): number {
  return state.stats.power * 10;
}

/**
 * Calculate total armour rating from equipped items
 */
export function getTotalArmourRating(state: PlayerState): number {
  let total = 0;
  const equipment = state.equipment || {};
  const inventory = state.inventory || [];
  
  // For now, we'll add AR calculation when we have armour items with ratings
  // This is a placeholder that will be expanded when we add armourRating to items
  for (const [slot, itemId] of Object.entries(equipment)) {
    if (itemId) {
      // TODO: Look up item in content and get its armourRating
      // For now, assume 2 AR per equipped item as placeholder
      total += 2;
    }
  }
  
  return total;
}

/**
 * Get all active skills as a map
 */
export function getActiveSkills(state: PlayerState): Record<string, number> {
  return {
    search: getSearch(state),
    investigate: getInvestigate(state),
    meleeAttack: getMeleeAttack(state),
    rangedAttack: getRangedAttack(state),
    castSpell: getCastSpell(state),
    lockpick: getLockpick(state),
    pickpocket: getPickpocket(state)
  };
}

/**
 * Get all passive skills as a map
 */
export function getPassiveSkills(state: PlayerState): Record<string, number> {
  return {
    perception: getPerception(state),
    meleeDefense: getMeleeDefense(state),
    rangedDefense: getRangedDefense(state),
    dodge: getDodge(state),
    spellResistance: getSpellResistance(state),
    stealth: getStealth(state),
    persuasion: getPersuasion(state),
    intimidation: getIntimidation(state)
  };
}
