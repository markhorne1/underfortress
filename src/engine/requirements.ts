import { Requirement } from './schemas';
import { PlayerState } from './types';

export function evaluateRequirement(req: any, state: PlayerState): boolean {
  const t = req.type;
  switch (t) {
    case 'hasGold':
      return (state.stats?.gold || 0) >= (req.value ?? req.amount ?? req.qty ?? 0);
    case 'hasFlag':
      return !!(state.flags && state.flags[req.key]);
    case 'flagEquals':
      return !!(state.flags && state.flags[req.key] === req.value);
    case 'hasItem': {
      const qty = req.qty || req.qty === 0 ? req.qty : 1;
      let itemId = req.key || req.itemId || req.id;
      if (!itemId) return false;
      
      // Expand bow aliases - if checking for a bow, accept any bow type
      const bowTypes = ['training_bow', 'hunting_bow', 'short_bow', 'bow_wallwhisper', 'heirloom_wallwhisper_sunsteel'];
      const inv = state.inventory || [];
      
      if (bowTypes.includes(itemId)) {
        // Check for any bow type
        const found = inv.find(i => bowTypes.includes(i.itemId) && i.qty >= qty);
        return !!found;
      }
      
      const found = inv.find(i => i.itemId === itemId);
      return !!(found && found.qty >= qty);
    }
    case 'statAtLeast': {
      const val = (state.stats as any)[req.key];
      return typeof val === 'number' && val >= (req.value ?? 0);
    }
    case 'discoveredArea':
      return !!(state.discoveredMap && state.discoveredMap[req.key]);
    case 'questStage':
      return !!(state.quests && state.quests[req.key] >= (req.value ?? 0));
    case 'cooldownReady': {
      const jobId = req.jobId || req.key;
      if (!jobId) return false;
      const job = state.jobs && state.jobs[jobId];
      if (!job) return true;
      if (!job.cooldownUntil) return true;
      return job.cooldownUntil <= Date.now();
    }
    case 'hasCombatSkill': {
      const skillId = req.skill || req.key;
      if (!skillId) return false;
      return !!(state.combatSkills && state.combatSkills.includes(skillId));
    }
    case 'threatDefeated': {
      const threatId = req.threatId || req.key;
      if (!threatId) return false;
      return !!(state.flags && state.flags[`threat:${threatId}:defeated`]);
    }
    case 'hasAmmo': {
      // Check if player has ammo of the specified type
      const ammoType = req.ammoType || req.key;
      const minCount = req.minCount || req.qty || 1;
      if (!ammoType) return false;
      // Map ammo types to item IDs
      const ammoItemMap: Record<string, string[]> = {
        'arrow': ['quiver_arrows', 'arrows', 'arrow'],
        'bolt': ['crossbow_bolts', 'bolts', 'bolt'],
        'bullet': ['sling_bullets', 'bullets', 'bullet'],
        'throwing': ['throwing_knives', 'throwing_knife', 'javelins', 'javelin']
      };
      const possibleItems = ammoItemMap[ammoType] || [ammoType];
      const inv = state.inventory || [];
      const hasAmmo = possibleItems.some(itemId => {
        const found = inv.find(i => i.itemId === itemId);
        return found && found.qty >= minCount;
      });
      return hasAmmo;
    }
    case 'hasAnyItem': {
      // Check if player has ANY of the specified items
      let itemIds = req.itemIds || req.items || [];
      const inv = state.inventory || [];
      
      // Expand bow aliases - if checking for any bow type, include all bows
      const bowTypes = ['training_bow', 'hunting_bow', 'short_bow', 'bow_wallwhisper', 'heirloom_wallwhisper_sunsteel'];
      const hasBowCheck = itemIds.some((id: string) => bowTypes.includes(id));
      if (hasBowCheck) {
        // Expand to include all bow types
        const expandedIds = new Set(itemIds);
        bowTypes.forEach(bow => expandedIds.add(bow));
        itemIds = Array.from(expandedIds);
      }
      
      return itemIds.some((itemId: string) => {
        const found = inv.find(i => i.itemId === itemId);
        return found && found.qty >= 1;
      });
    }
    case 'knowsSpell': {
      // Check if player knows the specified spell
      const spellId = req.spellId || req.spell || req.key;
      if (!spellId) return false;
      return !!(state.spellsKnown && state.spellsKnown.includes(spellId));
    }
    case 'hasSpellPath': {
      const path = req.path || req.key;
      if (!path) return false;
      return !!(state.spellPathsUnlocked && state.spellPathsUnlocked.includes(path));
    }
    case 'counterAtLeast': {
      // Check if a counter flag is at least a certain value
      const key = req.key || req.counter;
      const value = req.value ?? 0;
      if (!key) return false;
      const current = (state.flags && state.flags[key]) || 0;
      return typeof current === 'number' && current >= value;
    }
    case 'notFlag': {
      // Shorthand for not having a flag set
      const key = req.key;
      if (!key) return false;
      return !(state.flags && state.flags[key]);
    }
    case 'or': {
      // Evaluates to true if ANY condition is met
      const conditions = req.conditions || [];
      return conditions.some((cond: any) => evaluateRequirement(cond, state));
    }
    case 'and': {
      // Evaluates to true if ALL conditions are met
      const conditions = req.conditions || [];
      return conditions.every((cond: any) => evaluateRequirement(cond, state));
    }
    case 'not': {
      // Evaluates to true if condition is NOT met
      const condition = req.condition;
      if (!condition) return false;
      return !evaluateRequirement(condition, state);
    }
    default:
      console.warn('Unknown requirement type', t);
      return false;
  }
}

export function evaluateRequirements(reqs: any[] | undefined, state: PlayerState): boolean {
  if (!reqs || reqs.length === 0) return true;
  return reqs.every(r => evaluateRequirement(r, state));
}
