import { canAcceptQuest, acceptQuest, advanceQuestStage, completeQuest, isQuestOnCooldown } from '../quests';
import { loadContent } from '../contentLoader';

describe('quest flows', () => {
  beforeAll(async ()=>{ await loadContent(); });
  test('accept -> advance -> complete applies rewards', () => {
    const initState:any = { stats: { xp:0, gold:0 }, inventory: [], quests: {}, questLog: [], discoveredMap: { start: true }, currentAreaId: 'start' };
    const can = canAcceptQuest('quest_deliver_scrolls', initState);
    expect(can.ok).toBe(true);
    const a = acceptQuest('quest_deliver_scrolls', initState);
    let s = a.state;
    // advance from s1 -> s2
    const adv = advanceQuestStage('quest_deliver_scrolls', s);
    s = adv.state;
    // advancing again should complete (s2 has no nextStageId)
    const adv2 = advanceQuestStage('quest_deliver_scrolls', s);
    s = adv2.state;
    // quest completed and rewards applied
    expect(s.quests['quest_deliver_scrolls'].status).toBe('completed');
    expect(s.stats.xp).toBeGreaterThanOrEqual(10);
    expect(s.inventory.find((i:any)=>i.itemId==='scribe_seal')).toBeTruthy();
  });

  test('repeatable job cooldown blocks reaccept', () => {
    const initState:any = { stats: { xp:0, gold:0 }, inventory: [], quests: {}, questLog: [], discoveredMap: { armoury:true }, currentAreaId: 'armoury' };
    const a = acceptQuest('job_armoury_sew', initState);
    let s = a.state;
    // complete immediately
    const c = completeQuest('job_armoury_sew', s);
    s = c.state;
    // should be on cooldown
    expect(isQuestOnCooldown('job_armoury_sew', s)).toBe(true);
  });
});
