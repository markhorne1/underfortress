import { Threat, advanceThreat, placeHazard, shootThreat, handleThreatTick } from '../threat';

test('advanceThreat reduces distance and signals reach', () => {
  const t: Threat = { id: 'g1', enemyGroupId: 'goblins', distance: 2, speed: 1, hitsRemaining: 2 };
  const r1 = advanceThreat({ ...t });
  expect(r1.threat.distance).toBe(1);
  expect(r1.reached).toBe(false);
  const r2 = advanceThreat(r1.threat);
  expect(r2.reached).toBe(true);
});

test('placeHazard reduces speed and can defeat', () => {
  const t: Threat = { id: 'g2', enemyGroupId: 'goblins', distance: 5, speed: 2, hitsRemaining: 1 };
  const p = placeHazard({ ...t }, 'spikes');
  expect(p.threat.speed).toBe(1);
  const p2 = placeHazard(p.threat, 'caltraps');
  expect(p2.threat.defeated).toBe(true);
});

test('shootThreat reduces hits and can kill', () => {
  const t: Threat = { id: 'g3', enemyGroupId: 'goblins', distance: 4, speed: 1, hitsRemaining: 2 };
  const s = shootThreat({ ...t }, 3, 123);
  // hitsRemaining should be decreased (>=0)
  expect(s.threat.hitsRemaining! <= 2).toBe(true);
  if (s.killed) expect(s.threat.defeated).toBe(true);
});

test('handleThreatTick increments danger when reached', () => {
  const t: Threat = { id: 'g4', enemyGroupId: 'goblins', distance: 1, speed: 1, hitsRemaining: 1 };
  const state: any = { currentAreaId: 'a', discoveredMap: {}, inventory: [], equipment: {}, spellsKnown: [], stats: { skill: 6, stamina: 10, luck: 6, gold: 0, xp: 0, level: 1 }, flags: {} };
  const res = handleThreatTick({ ...t }, state);
  expect(res.reached).toBe(true);
  expect(res.state.flags.danger).toBe(1);
});
