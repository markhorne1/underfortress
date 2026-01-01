import { executeChoice, performEnterEffects, canExecute } from '../execute';
import { PlayerState } from '../types';

describe('execute module', () => {
  const baseState: any = {
    currentAreaId: 'a',
    discoveredMap: { a: true },
    inventory: [],
    stats: { skill: 6, stamina: 10, luck: 6, gold: 0, xp: 0, level: 1 },
    flags: {},
    quests: {},
    questLog: []
  } as PlayerState;

  test('canExecute returns reason for unmet requirement', () => {
    const reqs = [{ type: 'hasItem', key: 'mail' }];
    const res = canExecute(reqs, baseState as any);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBeDefined();
  });

  test('executeChoice applies effects and returns goToAreaId', () => {
    const choice = { id: 'c1', label: 'Open Door', effects: [{ type: 'addItem', key: 'rusty_key', qty: 1 }], goToAreaId: 'b' };
    const res = executeChoice(choice, baseState as any);
    expect(res.log).toEqual(expect.arrayContaining(['addItem rusty_key x1']));
    expect(res.goToAreaId).toBe('b');
    expect(res.state.inventory.find((i:any)=>i.itemId==='rusty_key')).toBeTruthy();
  });

  test('performEnterEffects sets currentAreaId then applies area effects', () => {
    const area = { id: 'b', effectsOnEnter: [{ type: 'setFlag', key: 'seen_b' }, { type: 'addItem', key: 'map_frag', qty: 1 }] };
    const res = performEnterEffects(area, baseState as any);
    // currentAreaId should be the area id
    expect(res.state.currentAreaId).toBe('b');
    // discoveredMap should include b
    expect(res.state.discoveredMap['b']).toBeTruthy();
    // flag set and item added
    expect((res.state as any).flags['seen_b']).toBeTruthy();
    expect(res.state.inventory.find((i:any)=>i.itemId==='map_frag')).toBeTruthy();
  });
});
