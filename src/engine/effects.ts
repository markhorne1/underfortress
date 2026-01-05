import { PlayerState, InvItem } from './types';
import { Threat, advanceThreat as advanceThreatFn, placeHazard as placeHazardFn, shootThreat as shootThreatFn } from './threat';

export type EffectResult = { state: PlayerState; log: string[] };

function cloneState(s: PlayerState): PlayerState {
  return JSON.parse(JSON.stringify(s));
}

/**
 * Check if player has died and handle respawn at last checkpoint
 */
function handleDeath(state: PlayerState, log: string[]): void {
  if (state.health <= 0) {
    // Respawn at last checkpoint
    const checkpointId = state.lastCheckpointId || 'i_underfortress_entry';
    state.currentAreaId = checkpointId;
    state.health = 100;
    log.push(`💀 You died! Respawning at ${checkpointId} with full health.`);
  }
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
      case 'addStatPoints':
        next.stats.statPoints = (next.stats.statPoints || 0) + (e.value || e.amount || 1);
        log.push(`addStatPoints +${e.value || e.amount || 1} (total: ${next.stats.statPoints})`);
        break;
      case 'addXP': // Legacy alias for addStatPoints
      case 'grantXP': // Legacy alias for addStatPoints
        // Convert old XP system to stat points (1 XP = 0.1 stat points, rounded)
        const xpValue = e.value || e.amount || 0;
        const statPointsToAdd = Math.max(1, Math.floor(xpValue / 10));
        next.stats.statPoints = (next.stats.statPoints || 0) + statPointsToAdd;
        log.push(`grantXP ${xpValue} (converted to +${statPointsToAdd} stat points)`);
        break;
      case 'heal':
        next.health = Math.min((next.health || 100) + (e.value || e.amount || 0), 100);
        log.push(`heal +${e.value || e.amount || 0} health (now: ${next.health}/100)`);
        break;
      case 'damage':
        next.health = Math.max((next.health || 100) - (e.value || e.amount || 0), 0);
        log.push(`damage -${e.value || e.amount || 0} health (now: ${next.health}/100)`);
        handleDeath(next, log); // Check for death and respawn
        break;
      case 'setCheckpoint':
        next.lastCheckpointId = e.areaId || e.value || next.currentAreaId;
        log.push(`checkpoint set at ${next.lastCheckpointId}`);
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
      case 'unlockPath': {
        const path = e.path || e.key;
        if (!path) { log.push('unlockPath missing path'); break; }
        if (!['fire', 'water', 'earth', 'air'].includes(path)) {
          log.push(`unlockPath invalid path ${path}`);
          break;
        }
        next.spellPathsUnlocked = next.spellPathsUnlocked || [];
        if (!next.spellPathsUnlocked.includes(path)) {
          next.spellPathsUnlocked.push(path);
          log.push(`unlockPath ${path} - Spell path unlocked!`);
        } else {
          log.push(`unlockPath ${path} - Already unlocked`);
        }
        break;
      }
      case 'learnSpell': {
        const spellId = e.spellId || e.key;
        if (!spellId) { log.push('learnSpell missing spellId'); break; }
        next.spellsKnown = next.spellsKnown || [];
        if (!next.spellsKnown.includes(spellId)) {
          next.spellsKnown.push(spellId);
          log.push(`learnSpell ${spellId} - New spell learned!`);
        } else {
          log.push(`learnSpell ${spellId} - Already known`);
        }
        break;
      }
      case 'equipItem': {
        const itemId = e.itemId || e.key;
        const slot = e.slot;
        if (!itemId) { log.push('equipItem missing itemId'); break; }
        if (!slot) { log.push('equipItem missing slot'); break; }
        next.equipment = next.equipment || {};
        next.equipment[slot] = itemId;
        log.push(`equipItem ${itemId} equipped to ${slot}`);
        break;
      }
      case 'forceCombatFromThreat': {
        // This effect triggers combat based on a threat's enemy group
        // The actual combat initialization must happen in playerStore after navigation
        // We just set a flag here that playerStore will check
        const threatId = e.threatId;
        if (!threatId) { log.push('forceCombatFromThreat missing threatId'); break; }
        
        // Set a flag that playerStore will detect and handle
        next.flags = next.flags || {};
        next.flags[`_pendingCombat:${threatId}`] = true;
        log.push(`forceCombatFromThreat ${threatId} - Combat will initiate`);
        break;
      }
      default:
        console.warn('Unknown effect type', e.type);
        log.push(`unknownEffect ${e.type}`);
    }
  }

  return { state: next, log };
}
