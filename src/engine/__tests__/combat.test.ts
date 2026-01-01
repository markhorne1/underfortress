import { runCombat } from '../combat';

test('combat deterministic with seed', () => {
  const player = { id: 'p', name: 'Hero', skill: 8, stamina: 12 };
  const enemy = { id: 'e', name: 'Goblin', skill: 6, stamina: 6 };
  const r1 = runCombat(player, enemy, 42);
  const r2 = runCombat(player, enemy, 42);
  expect(r1.winner).toBe(r2.winner);
  expect(r1.player.stamina).toBe(r2.player.stamina);
  expect(r1.enemy.stamina).toBe(r2.enemy.stamina);
});

test('combat player wins likely with higher skill', () => {
  const player = { id: 'p', name: 'Hero', skill: 10, stamina: 12 };
  const enemy = { id: 'e', name: 'Orc', skill: 6, stamina: 6 };
  const res = runCombat(player, enemy, 7);
  expect(res.winner).toBe('player');
});
