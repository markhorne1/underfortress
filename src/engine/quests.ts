import { getContentSnapshot } from './contentLoader';
import { evaluateRequirements, evaluateRequirements as evalReqs } from './requirements';
import { applyEffects } from './effects';

type AnyState = any;

function nowMs() { return Date.now(); }

export function canAcceptQuest(questId: string, state: AnyState): { ok: boolean; reason?: string } {
  const content = getContentSnapshot();
  const quest = content.quests?.get(questId);
  if (!quest) return { ok: false, reason: 'quest_not_found' };
  const qState = state.quests?.[questId];
  if (qState && qState.status === 'active') return { ok: false, reason: 'already_active' };
  if (qState && qState.status === 'completed' && !quest.repeatable) return { ok: false, reason: 'already_completed' };
  if (qState && qState.cooldownUntil && qState.cooldownUntil > nowMs()) return { ok: false, reason: 'on_cooldown' };
  // evaluate acceptRequirements
  if (quest.acceptRequirements && !evalReqs(quest.acceptRequirements, state)) return { ok: false, reason: 'requirements_not_met' };
  return { ok: true };
}

export function isQuestOnCooldown(questId: string, state: AnyState, now = nowMs()): boolean {
  const q = state.quests?.[questId];
  if (!q) return false;
  return !!(q.cooldownUntil && q.cooldownUntil > now);
}

export function acceptQuest(questId: string, state: AnyState, rng?: any) {
  const content = getContentSnapshot();
  const quest = content.quests?.get(questId);
  if (!quest) throw new Error('quest not found');
  const s = JSON.parse(JSON.stringify(state));
  s.quests = s.quests || {};
  s.questLog = s.questLog || [];
  s.quests[questId] = { status: 'active', stageId: quest.stages?.[0]?.id, acceptedAt: nowMs(), progress: {} };
  s.questLog.push({ ts: nowMs(), text: `Accepted quest ${quest.name}`, questId });
  // apply acceptEffects if any
  if (quest.acceptEffects) {
    const res = applyEffects(quest.acceptEffects, s);
    s = res.state;
  }
  return { state: s, log: [`accepted ${questId}`] };
}

export function getActiveQuests(state: AnyState) {
  const res: any[] = [];
  for (const [id, q] of Object.entries(state.quests || {})) {
    if ((q as any).status === 'active') res.push({ id, ...q });
  }
  return res;
}

export function advanceQuestStage(questId: string, state: AnyState) {
  const content = getContentSnapshot();
  const quest = content.quests?.get(questId);
  if (!quest) throw new Error('quest not found');
  const s = JSON.parse(JSON.stringify(state));
  const qState = s.quests?.[questId];
  if (!qState || qState.status !== 'active') return { state: s, log: ['not active'] };
  const currentStageId = qState.stageId;
  const stage = quest.stages.find((st:any)=>st.id===currentStageId);
  if (!stage) return { state: s, log: ['stage not found'] };
  // apply onCompleteEffects
  if (stage.onCompleteEffects) {
    const r = applyEffects(stage.onCompleteEffects, s);
    s = r.state;
  }
  // move to next
  if (stage.nextStageId) {
    qState.stageId = stage.nextStageId;
    // apply onEnterEffects for new stage
    const nextStage = quest.stages.find((st:any)=>st.id===stage.nextStageId);
    if (nextStage && nextStage.onEnterEffects) {
      const r2 = applyEffects(nextStage.onEnterEffects, s);
      s = r2.state;
    }
    s.questLog = s.questLog || [];
    s.questLog.push({ ts: nowMs(), text: `Quest ${quest.name} advanced to ${qState.stageId}`, questId });
    return { state: s, log: ['advanced'] };
  }
  // if no next, complete quest
  return completeQuest(questId, s);
}

export function completeQuest(questId: string, state: AnyState) {
  const content = getContentSnapshot();
  const quest = content.quests?.get(questId);
  if (!quest) throw new Error('quest not found');
  const s = JSON.parse(JSON.stringify(state));
  s.quests = s.quests || {};
  const qState = s.quests[questId] || {};
  qState.status = 'completed';
  qState.completedAt = nowMs();
  // apply rewards
  if (quest.rewards) {
    s.stats = s.stats || {};
    s.stats.xp = (s.stats.xp || 0) + (quest.rewards.xp || 0);
    s.stats.gold = (s.stats.gold || 0) + (quest.rewards.gold || 0);
    if (quest.rewards.items) {
      s.inventory = s.inventory || [];
      for (const it of quest.rewards.items) {
        const found = s.inventory.find((i:any)=>i.itemId===it.itemId);
        if (found) found.qty += (it.qty||1); else s.inventory.push({ itemId: it.itemId, qty: it.qty||1 });
      }
    }
  }
  // set cooldown if repeatable
  if (quest.repeatable && quest.cooldownHours) {
    qState.cooldownUntil = nowMs() + quest.cooldownHours * 3600 * 1000;
  }
  s.quests[questId] = qState;
  s.questLog = s.questLog || [];
  s.questLog.push({ ts: nowMs(), text: `Completed quest ${quest.name}`, questId });
  return { state: s, log: ['completed'] };
}

export function failQuest(questId: string, state: AnyState) {
  const s = JSON.parse(JSON.stringify(state));
  s.quests = s.quests || {};
  s.quests[questId] = { status: 'failed', completedAt: nowMs() };
  s.questLog = s.questLog || [];
  s.questLog.push({ ts: nowMs(), text: `Failed quest ${questId}`, questId });
  return { state: s, log: ['failed'] };
}

export function tickQuestTimers(state: AnyState, deltaTurns: number) {
  // MVP-light: no complex scheduling. Could decrement expiresAtTurns stored per quest in progress
  const s = JSON.parse(JSON.stringify(state));
  if (!s.quests) return s;
  for (const [qid, q] of Object.entries(s.quests)) {
    if (q.expiresAtTurns) {
      q.expiresAtTurns = Math.max(0, q.expiresAtTurns - deltaTurns);
      if (q.expiresAtTurns <= 0 && q.status === 'active') {
        q.status = 'failed';
        s.questLog = s.questLog || [];
        s.questLog.push({ ts: nowMs(), text: `Quest ${qid} expired`, questId: qid });
      }
    }
  }
  return s;
}
