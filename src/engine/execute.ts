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
