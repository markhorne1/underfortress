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

// Roll d20 + modifier
function rollD20(modifier: number = 0): { roll: number; total: number } {
  const roll = Math.floor(Math.random() * 20) + 1;
  return { roll, total: roll + modifier };
}

// Get Perception bonus from player state (can be expanded later)
function getPerceptionBonus(state: PlayerState): number {
  // Base perception is 0, can be modified by items/skills
  let bonus = 0;
  
  // Check for Amulet of Clear Sight (+2 to Perception)
  const hasAmulet = state.inventory.some(item => item.itemId === 'amulet_clearsight');
  if (hasAmulet) bonus += 2;
  
  // Check for Observer/Observation flags (can be set by other effects)
  if ((state.flags as any)?.observer_trained) bonus += 1;
  if ((state.flags as any)?.observation_expert) bonus += 2;
  
  return bonus;
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
  
  // Get DC (default 12)
  const dc = action.dc || 12;
  
  // Roll d20 + Perception bonus
  const perceptionBonus = getPerceptionBonus(state);
  const { roll, total } = rollD20(perceptionBonus);
  const success = total >= dc;
  
  console.log('🔍 Search roll:', { roll, perceptionBonus, total, dc, success });
  
  // Build log
  const log: string[] = [];
  log.push(`Search: d20(${roll}) + Perception(${perceptionBonus}) = ${total} vs DC ${dc}`);
  
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
