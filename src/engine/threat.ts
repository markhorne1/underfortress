import { PlayerState } from './types';
import { createSeededRng } from './rng';

export type Threat = {
  id: string;
  enemyGroupId: string;
  distance: number; // tiles until contact
  speed: number; // tiles per tick
  hitsRemaining?: number; // how many hits to stop this threat
  defeated?: boolean;
  direction?: string;
  targetAreaId?: string;
  losBroken?: boolean;
};

export type ThreatTickResult = {
  threat: Threat;
  reached: boolean;
  log: string[];
};

export function advanceThreat(threat: Threat): ThreatTickResult {
  const log: string[] = [];
  if (threat.defeated) {
    log.push('Threat already defeated');
    return { threat: { ...threat }, reached: false, log };
  }

  const move = threat.speed;
  threat.distance = threat.distance - move;
  log.push(`Threat ${threat.id} advances by ${move} -> distance ${threat.distance}`);
  const reached = threat.distance <= 0;
  if (reached) log.push(`Threat ${threat.id} has reached its target`);
  return { threat: { ...threat }, reached, log };
}

export function placeHazard(threat: Threat, hazardType: string): { threat: Threat; log: string[] } {
  const log: string[] = [];
  if (threat.defeated) {
    log.push('Threat already defeated, hazard wasted');
    return { threat, log };
  }
  switch (hazardType) {
    case 'spikes':
      threat.speed = Math.max(0, (threat.speed || 1) - 1);
      log.push(`Placed spikes: threat speed reduced to ${threat.speed}`);
      break;
    case 'caltraps':
      // caltraps deal a hit when next advance occurs (modeled elsewhere)
      threat.hitsRemaining = (threat.hitsRemaining || 1) - 1;
      log.push(`Placed caltraps: threat hitsRemaining now ${threat.hitsRemaining}`);
      if ((threat.hitsRemaining || 0) <= 0) {
        threat.defeated = true;
        log.push('Threat defeated by caltraps');
      }
      break;
    default:
      log.push(`Unknown hazard ${hazardType}`);
  }
  return { threat: { ...threat }, log };
}

export function shootThreat(threat: Threat, shots = 1, seed = 1) {
  const rng = createSeededRng(seed);
  const log: string[] = [];
  if (threat.defeated) {
    log.push('Threat already defeated');
    return { threat, log, killed: true };
  }
  let hits = 0;
  for (let i = 0; i < shots; i++) {
    const r = rng.roll2d6();
    // on 7+ it's a hit
    if (r >= 7) {
      hits++;
    }
    log.push(`Shot ${i + 1}: roll ${r} => ${r >= 7 ? 'hit' : 'miss'}`);
  }
  threat.hitsRemaining = (threat.hitsRemaining ?? 2) - hits;
  if ((threat.hitsRemaining ?? 0) <= 0) {
    threat.defeated = true;
    log.push(`Threat ${threat.id} defeated by ranged fire`);
  } else {
    log.push(`Threat ${threat.id} remaining hits ${threat.hitsRemaining}`);
  }
  return { threat: { ...threat }, log, killed: !!threat.defeated };
}

export function handleThreatTick(threat: Threat, state: PlayerState): { threat: Threat; state: PlayerState; reached: boolean; log: string[] } {
  const logs: string[] = [];
  const tRes = advanceThreat(threat);
  logs.push(...tRes.log);
  let newState = JSON.parse(JSON.stringify(state)) as PlayerState;
  if (tRes.reached && !threat.defeated) {
    // threat made contact — increment danger meter
    newState.flags = newState.flags || {};
    newState.flags.danger = (newState.flags.danger || 0) + 1;
    logs.push(`Danger increased -> ${newState.flags.danger}`);
  }
  return { threat: tRes.threat, state: newState, reached: tRes.reached, log: logs };
}
