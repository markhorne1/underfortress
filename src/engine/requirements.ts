import { Requirement } from './schemas';
import { PlayerState } from './types';

export function evaluateRequirement(req: any, state: PlayerState): boolean {
  const t = req.type;
  switch (t) {
    case 'hasFlag':
      return !!(state.flags && state.flags[req.key]);
    case 'flagEquals':
      return !!(state.flags && state.flags[req.key] === req.value);
    case 'hasItem': {
      const qty = req.qty || req.qty === 0 ? req.qty : 1;
      const itemId = req.key || req.itemId || req.id;
      if (!itemId) return false;
      const found = (state.inventory || []).find(i => i.itemId === itemId);
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
    default:
      console.warn('Unknown requirement type', t);
      return false;
  }
}

export function evaluateRequirements(reqs: any[] | undefined, state: PlayerState): boolean {
  if (!reqs || reqs.length === 0) return true;
  return reqs.every(r => evaluateRequirement(r, state));
}
