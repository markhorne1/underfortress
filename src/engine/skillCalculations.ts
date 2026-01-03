import { PlayerState } from './types';
import { getContentSnapshot } from './contentLoader';

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
  
  // Import content loader to get item definitions
  const content = getContentSnapshot();
  if (!content || !content.items) return total;
  const items = content.items || [];
  
  // Create a map of itemId -> item for quick lookup
  const itemMap = new Map();
  for (const item of items) {
    if (item && item.id) {
      itemMap.set(item.id, item);
    }
  }
  
  // Sum AR from all equipped items
  for (const [slot, itemId] of Object.entries(equipment)) {
    if (itemId) {
      const item = itemMap.get(itemId);
      if (item && typeof item.armourRating === 'number') {
        total += item.armourRating;
      }
    }
  }
  
  return total;
}

/**
 * Calculate total damage rating from equipped weapons
 */
export function getTotalDamageRating(state: PlayerState): number {
  let total = 0;
  const equipment = state.equipment || {};
  
  // Import content loader to get item definitions
  const content = getContentSnapshot();
  if (!content || !content.items) {
    // Fallback to unarmed damage (power / 2)
    return Math.floor(state.stats.power / 2);
  }
  const items = content.items || [];
  
  // Create a map of itemId -> item for quick lookup
  const itemMap = new Map();
  for (const item of items) {
    if (item && item.id) {
      itemMap.set(item.id, item);
    }
  }
  
  // Sum DR from equipped weapons (mainhand, offhand)
  const mainhand = equipment.mainhand;
  const offhand = equipment.offhand;
  
  if (mainhand) {
    const weapon = itemMap.get(mainhand);
    if (weapon && typeof weapon.damageRating === 'number') {
      total += weapon.damageRating;
    }
  }
  
  if (offhand) {
    const weapon = itemMap.get(offhand);
    if (weapon && typeof weapon.damageRating === 'number') {
      // Offhand weapons typically deal reduced damage
      total += Math.floor(weapon.damageRating * 0.5);
    }
  }
  
  // If no weapons equipped, use unarmed damage (Power-based)
  if (total === 0) {
    total = Math.max(1, Math.floor(state.stats.power / 2));
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
