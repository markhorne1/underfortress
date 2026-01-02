import { PlayerState, InvItem } from './types';
import { Threat, advanceThreat as advanceThreatFn, placeHazard as placeHazardFn, shootThreat as shootThreatFn } from './threat';

export type EffectResult = { state: PlayerState; log: string[] };

function cloneState(s: PlayerState): PlayerState {
  return JSON.parse(JSON.stringify(s));
}

export function applyEffects(effects: any[] | undefined, state: PlayerState): EffectResult {
  const log: string[] = [];
  if (!effects || effects.length === 0) return { state: cloneState(state), log };
  const next = cloneState(state);
  next.flags = next.flags || {};
  next.quests = next.quests || {};

  for (const e of effects) {
    switch (e.type) {
      case 'flag': // alias for setFlag (legacy content support)
      case 'setFlag':
        next.flags[e.key] = e.value ?? true;
        log.push(`setFlag ${e.key}=${JSON.stringify(next.flags[e.key])}`);
        break;
      case 'unsetFlag':
        delete next.flags[e.key];
        log.push(`unsetFlag ${e.key}`);
        break;
      case 'incFlag':
        next.flags[e.key] = (next.flags[e.key] || 0) + (e.qty || 1);
        log.push(`incFlag ${e.key} -> ${next.flags[e.key]}`);
        break;
      case 'addItem': {
        const qty = e.qty || 1;
        const itemId = e.key || e.itemId || e.id;
        const inv: InvItem[] = next.inventory || [];
        if (!itemId) { log.push('addItem missing id'); break; }
        const found = inv.find(i => i.itemId === itemId);
        if (found) found.qty += qty; else inv.push({ itemId, qty });
        next.inventory = inv;
        log.push(`addItem ${itemId} x${qty}`);
        break;
      }
      case 'removeItem': {
        const qty = e.qty || 1;
        const itemId = e.key || e.itemId || e.id;
        const inv: InvItem[] = next.inventory || [];
        if (!itemId) { log.push('removeItem missing id'); break; }
        const found = inv.find(i => i.itemId === itemId);
        if (found) {
          found.qty -= qty;
          if (found.qty <= 0) next.inventory = inv.filter(i => i.itemId !== itemId);
        }
        log.push(`removeItem ${itemId} x${qty}`);
        break;
      }
      case 'grantGold':
        next.stats.gold = (next.stats.gold || 0) + (e.value || 0);
        log.push(`grantGold ${e.value}`);
        break;
      case 'grantXP':
        next.stats.xp = (next.stats.xp || 0) + (e.value || 0);
        log.push(`grantXP ${e.value}`);
        break;
      case 'heal':
        next.stats.stamina = Math.min((next.stats.stamina || 0) + (e.value || 0), 9999);
        log.push(`heal ${e.value}`);
        break;
      case 'damage':
        next.stats.stamina = Math.max((next.stats.stamina || 0) - (e.value || 0), 0);
        log.push(`damage ${e.value}`);
        break;
      case 'teleportToAreaId': {
        const aid = e.key || e.areaId || e.toAreaId;
        if (aid) {
          next.currentAreaId = aid;
          next.discoveredMap = { ...(next.discoveredMap || {}), [aid]: true };
          log.push(`teleportToAreaId ${aid}`);
        } else log.push('teleportToAreaId missing area id');
        break;
      }
      case 'incFlagIfQuestActive': {
        const questId = (e as any).questId;
        if (questId && next.quests && next.quests[questId] !== undefined && next.quests[questId] !== 'completed') {
          next.flags[e.key] = (next.flags[e.key] || 0) + (e.qty || 1);
          log.push(`incFlagIfQuestActive ${e.key} -> ${next.flags[e.key]}`);
        }
        break;
      }
      case 'startQuest': {
        const q = e.key || e.questId;
        if (!q) { log.push('startQuest missing id'); break; }
        next.quests[q] = { status: 'active', stage: 0 } as any;
        log.push(`startQuest ${q}`);
        break;
      }
      case 'advanceQuest': {
        const q = e.key || e.questId;
        if (!q) { log.push('advanceQuest missing id'); break; }
        next.quests[q] = (next.quests[q] || 0) + (e.qty || 1);
        log.push(`advanceQuest ${q} -> ${next.quests[q]}`);
        break;
      }
      case 'completeQuest': {
        const q = e.key || e.questId;
        if (!q) { log.push('completeQuest missing id'); break; }
        next.quests[q] = 'completed';
        log.push(`completeQuest ${q}`);
        break;
      }
      case 'startJob': {
        const jobId = e.jobId || e.key;
        if (!jobId) { log.push('startJob missing id'); break; }
        next.jobs = next.jobs || {};
        next.jobs[jobId] = { status: 'active', startedAt: Date.now() };
        log.push(`startJob ${jobId}`);
        break;
      }
      case 'completeJob': {
        const jobId = e.jobId || e.key;
        if (!jobId) { log.push('completeJob missing id'); break; }
        next.jobs = next.jobs || {};
        next.jobs[jobId] = { status: 'completed', completedAt: Date.now() };
        if (e.cooldownHours) next.jobs[jobId].cooldownUntil = Date.now() + e.cooldownHours * 3600 * 1000;
        log.push(`completeJob ${jobId}`);
        break;
      }
      case 'setCooldown': {
        const jobId = e.jobId || e.key;
        next.jobs = next.jobs || {};
        if (jobId && e.minutes) {
          next.jobs[jobId] = next.jobs[jobId] || {};
          next.jobs[jobId].cooldownUntil = Date.now() + e.minutes * 60 * 1000;
          log.push(`setCooldown ${jobId} -> ${e.minutes}m`);
        }
        break;
      }
      case 'startThreat': {
        const t: Threat = e.threat || { id: e.threatId || e.key || `threat_${Date.now()}`, enemyGroupId: e.enemyGroupId || e.group, distance: e.distance || 3, speed: e.speed || 1 };
        next.activeThreats = next.activeThreats || [];
        next.activeThreats.push(t);
        log.push(`startThreat ${t.id}`);
        break;
      }
      case 'shootThreat': {
        const tid = e.threatId || e.key;
        if (!tid) { log.push('shootThreat missing id'); break; }
        next.activeThreats = next.activeThreats || [];
        const idx = next.activeThreats.findIndex((tt:any)=>tt.id===tid);
        if (idx>=0) {
          const res = shootThreatFn(next.activeThreats[idx], e.shots || e.ammoToConsume || 1, e.seed || 1);
          next.activeThreats[idx] = res.threat;
          log.push(...res.log);
        } else log.push(`shootThreat not found ${tid}`);
        break;
      }
      case 'placeHazard': {
        const tid = e.threatId || e.key;
        const hazard = e.hazard || e.hazardType;
        if (!tid) { log.push('placeHazard missing id'); break; }
        next.activeThreats = next.activeThreats || [];
        const idx = next.activeThreats.findIndex((tt:any)=>tt.id===tid);
        if (idx>=0) {
          const p = placeHazardFn(next.activeThreats[idx], hazard.kind || hazard);
          next.activeThreats[idx] = p.threat;
          log.push(...p.log);
        } else log.push(`placeHazard not found ${tid}`);
        break;
      }
      default:
        console.warn('Unknown effect type', e.type);
        log.push(`unknownEffect ${e.type}`);
    }
  }

  return { state: next, log };
}
