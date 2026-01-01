import { evaluateRequirements } from '../requirements';
import { applyEffects } from '../effects';

const sampleState = {
  currentAreaId: 'start',
  discoveredMap: { start: true },
  inventory: [{ itemId: 'arrow', qty: 5 }],
  equipment: {},
  spellsKnown: [],
  stats: { skill: 6, stamina: 20, luck: 6, gold: 0, xp: 0, level: 1 },
  flags: { testFlag: true },
  quests: { job1: 1 }
};

test('evaluate basic requirements', () => {
  expect(evaluateRequirements([{ type: 'hasFlag', key: 'testFlag' }], sampleState as any)).toBe(true);
  expect(evaluateRequirements([{ type: 'flagEquals', key: 'testFlag', value: true }], sampleState as any)).toBe(true);
  expect(evaluateRequirements([{ type: 'hasItem', key: 'arrow', qty: 3 }], sampleState as any)).toBe(true);
  expect(evaluateRequirements([{ type: 'statAtLeast', key: 'skill', value: 5 }], sampleState as any)).toBe(true);
  expect(evaluateRequirements([{ type: 'discoveredArea', key: 'start' }], sampleState as any)).toBe(true);
  expect(evaluateRequirements([{ type: 'questStage', key: 'job1', value: 1 }], sampleState as any)).toBe(true);
});

test('applyEffects basic', () => {
  const result = applyEffects([{ type: 'addItem', key: 'potion', qty: 2 }, { type: 'grantGold', value: 10 }, { type: 'setFlag', key: 'openedChest', value: true }], sampleState as any);
  expect(result.state.inventory.find((i:any)=>i.itemId==='potion').qty).toBe(2);
  expect(result.state.stats.gold).toBe(10);
  expect(result.state.flags.openedChest).toBe(true);
});
