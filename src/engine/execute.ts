import { evaluateRequirements, evaluateRequirement } from './requirements';
import { applyEffects, EffectResult } from './effects';
import { PlayerState } from './types';

export type CanExecuteResult = { ok: true } | { ok: false; reason: string };

export function canExecute(reqs: any[] | undefined, state: PlayerState): CanExecuteResult {
  if (!reqs || reqs.length === 0) return { ok: true };
  for (const r of reqs) {
    const ok = evaluateRequirement(r, state);
    if (!ok) return { ok: false, reason: `requirement ${r.type} failed` };
  }
  return { ok: true };
}

export function executeEffects(effects: any[] | undefined, state: PlayerState): EffectResult {
  // effects.applyEffects returns cloned state and log
  return applyEffects(effects, state);
}

export function executeChoice(choice: any, state: PlayerState): { state: PlayerState; log: string[]; goToAreaId?: string } {
  const can = canExecute(choice.requirements, state);
  if (!can.ok) return { state, log: [can.reason], goToAreaId: undefined };

  const choiceLog: string[] = [];
  if (choice.text) choiceLog.push(`choice: ${choice.text}`);
  if (choice.label) choiceLog.push(`choice: ${choice.label}`);

  const res = executeEffects(choice.effects, state);
  const combined = choiceLog.concat(res.log);

  return { state: res.state, log: combined, goToAreaId: choice.goToAreaId };
}

// Roll d100 for percentage-based checks
function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1; // 1-100
}

// Get Perception skill percentage from player state
function getPerceptionSkill(state: PlayerState): number {
  const { getPerception } = require('./skillCalculations');
  return getPerception(state);
}

// Get Investigation skill percentage from player state
function getInvestigationSkill(state: PlayerState): number {
  const { getInvestigate } = require('./skillCalculations');
  return getInvestigate(state);
}

export function performSearch(areaId: string, action: any, state: PlayerState): { state: PlayerState; log: string[]; success: boolean } {
  const newState = JSON.parse(JSON.stringify(state));
  const searchFlag = `area:${areaId}:searched`;
  
  // Check if already searched (can't farm)
  if ((newState.flags as any)?.[searchFlag]) {
    return { 
      state: newState, 
      log: ['You have already searched this area thoroughly.'], 
      success: false 
    };
  }
  
  // Get Search skill percentage (Vision × 10)
  const searchSkill = getPerceptionSkill(newState);
  
  // Add bonuses from items/flags
  let bonusPercent = 0;
  const hasAmulet = newState.inventory.some(item => item.itemId === 'amulet_clearsight');
  if (hasAmulet) bonusPercent += 10;
  if ((newState.flags as any)?.observer_trained) bonusPercent += 5;
  if ((newState.flags as any)?.observation_expert) bonusPercent += 10;
  
  const totalSkill = Math.min(100, searchSkill + bonusPercent);
  const roll = rollD100();
  const success = roll <= totalSkill;
  
  const log: string[] = [
    `Search Check: d100(${roll}) vs ${totalSkill}% → ${success ? 'SUCCESS' : 'FAILURE'}`
  ];
  
  // Apply effects and get result text
  if (success) {
    if (action.successText) log.push(action.successText);
    if (action.successEffects) {
      const res = executeEffects(action.successEffects, newState);
      Object.assign(newState, res.state);
      log.push(...res.log);
    }
  } else {
    if (action.failureText) log.push(action.failureText);
    if (action.failureEffects) {
      const res = executeEffects(action.failureEffects, newState);
      Object.assign(newState, res.state);
      log.push(...res.log);
    }
  }
  
  // Mark as searched
  if (!newState.flags) newState.flags = {};
  (newState.flags as any)[searchFlag] = true;
  
  return { state: newState, log, success };
}

// Get Investigation bonus from player state
function getInvestigationBonus(state: PlayerState): number {
  // Bonuses from items/flags
  let bonus = 0;
  
  // Check for Magnifying Glass or similar items
  const hasMagnifier = state.inventory.some(item => item.itemId === 'magnifying_glass');
  if (hasMagnifier) bonus += 10;
  
  // Check for Detective/Investigation flags
  if ((state.flags as any)?.detective_training) bonus += 5;
  if ((state.flags as any)?.investigation_expert) bonus += 10;
  
  return bonus;
}

export function performInvestigate(areaId: string, action: any, state: PlayerState): { state: PlayerState; log: string[]; success: boolean } {
  const newState = JSON.parse(JSON.stringify(state));
  const investigateFlag = `area:${areaId}:investigated:${action.targetId || 'default'}`;
  
  // Check if already investigated this target
  if ((newState.flags as any)?.[investigateFlag]) {
    return { 
      state: newState, 
      log: ['You have already investigated this thoroughly.'], 
      success: false 
    };
  }
  
  // Get Investigate skill percentage (Mind × 10)
  const investigateSkill = getInvestigationSkill(newState);
  const bonusPercent = getInvestigationBonus(newState);
  const totalSkill = Math.min(100, investigateSkill + bonusPercent);
  const roll = rollD100();
  const success = roll <= totalSkill;
  
  const log: string[] = [
    `Investigation Check: d100(${roll}) vs ${totalSkill}% → ${success ? 'SUCCESS' : 'FAILURE'}`
  ];
  
  if (success) {
    if (action.successText) log.push(action.successText);
    if (action.successEffects) {
      const res = executeEffects(action.successEffects, newState);
      Object.assign(newState, res.state);
      log.push(...res.log);
    }
  } else {
    if (action.failureText) log.push(action.failureText);
    if (action.failureEffects) {
      const res = executeEffects(action.failureEffects, newState);
      Object.assign(newState, res.state);
      log.push(...res.log);
    }
  }
  
  // Mark as investigated
  if (!newState.flags) newState.flags = {};
  (newState.flags as any)[investigateFlag] = true;
  
  return { state: newState, log, success };
}

// Helper: perform enter effects in a pure way: ensure area id is set & discovered, then apply effects
export function performEnterEffects(area: any, state: PlayerState): EffectResult {
  const seedState: PlayerState = JSON.parse(JSON.stringify(state));
  seedState.currentAreaId = area.id;
  seedState.discoveredMap = { ...(seedState.discoveredMap || {}), [area.id]: true } as any;
  // now apply the area's on-enter effects
  const res = executeEffects(area.effectsOnEnter || area.enterEffects || [], seedState);
  return res;
}

export default { canExecute, executeEffects, executeChoice, performEnterEffects };
