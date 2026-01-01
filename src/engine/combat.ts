import { createSeededRng } from './rng';
import { PlayerState } from './types';

export type Combatant = {
  id: string;
  name: string;
  skill: number;
  stamina: number;
};

export type CombatResult = {
  player: Combatant;
  enemy: Combatant;
  log: string[];
  winner: 'player' | 'enemy' | 'draw';
};

export function resolveRound(attackerSkill: number, defenderSkill: number, rng: ReturnType<typeof createSeededRng>) {
  const atkRoll = rng.roll2d6();
  const defRoll = rng.roll2d6();
  const atkStrength = attackerSkill + atkRoll;
  const defStrength = defenderSkill + defRoll;
  return { atkRoll, defRoll, atkStrength, defStrength };
}

export function runCombat(player: Combatant, enemy: Combatant, seed = 12345): CombatResult {
  const rng = createSeededRng(seed);
  const log: string[] = [];
  const p = { ...player };
  const e = { ...enemy };

  log.push(`Combat start: ${p.name} (S:${p.stamina},K:${p.skill}) vs ${e.name} (S:${e.stamina},K:${e.skill})`);

  // loop until one dies or max rounds
  let rounds = 0;
  while (p.stamina > 0 && e.stamina > 0 && rounds < 100) {
    rounds++;
    const r1 = resolveRound(p.skill, e.skill, rng);
    log.push(`Round ${rounds}: player roll ${r1.atkRoll} (AS ${r1.atkStrength}) vs enemy roll ${r1.defRoll} (AS ${r1.defStrength})`);
    if (r1.atkStrength > r1.defStrength) {
      e.stamina = Math.max(0, e.stamina - 2);
      log.push(`Enemy ${e.name} takes 2 damage -> ${e.stamina}`);
    } else if (r1.atkStrength < r1.defStrength) {
      p.stamina = Math.max(0, p.stamina - 2);
      log.push(`Player ${p.name} takes 2 damage -> ${p.stamina}`);
    } else {
      log.push('Tie: no damage');
    }
  }

  let winner: CombatResult['winner'] = 'draw';
  if (p.stamina > 0 && e.stamina <= 0) winner = 'player';
  else if (e.stamina > 0 && p.stamina <= 0) winner = 'enemy';

  log.push(`Combat end: winner=${winner}`);

  return { player: p, enemy: e, log, winner };
}

export function luckTest(state: PlayerState, seed = 1): { success: boolean; newState: PlayerState; roll: number } {
  const rng = createSeededRng(seed);
  const roll = rng.roll2d6();
  const luck = state.stats.luck || 0;
  const success = roll <= luck;
  const newState = JSON.parse(JSON.stringify(state));
  if (success) newState.stats.luck = Math.max(0, (newState.stats.luck || 0) - 1);
  return { success, newState, roll };
}
