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
      case 'addItem':
      case 'giveItem': {
        const qty = e.qty || 1;
        const itemId = e.key || e.itemId || e.id;
        const inv: InvItem[] = next.inventory || [];
        if (!itemId) { log.push('addItem missing id'); break; }
        const found = inv.find(i => i.itemId === itemId);
        if (found) found.qty += qty; else inv.push({ itemId, qty });
        next.inventory = inv;
        log.push(`+${qty} ${itemId}`);
        break;
      }
      case 'message': {
        // Display a message to the player (just add to log)
        const text = e.text || e.message || e.value || '';
        if (text) log.push(text);
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
      case 'forceCombat':
      case 'startCombat':
      case 'initiateCombat': {
        // This effect triggers immediate combat with specific enemy IDs
        // Supports both enemyIds array and enemyGroup format
        let enemyIds: string[] = [];
        
        if (e.enemyIds && Array.isArray(e.enemyIds)) {
          enemyIds = e.enemyIds;
        } else if (e.enemyGroup && Array.isArray(e.enemyGroup)) {
          // Expand enemyGroup format: [{ enemyId: "orc_jailer", count: 1 }]
          for (const member of e.enemyGroup) {
            const count = member.count || 1;
            for (let i = 0; i < count; i++) {
              enemyIds.push(member.enemyId);
            }
          }
        }
        
        if (enemyIds.length === 0) { 
          log.push('startCombat missing enemyIds or enemyGroup'); 
          break; 
        }
        
        // Set a flag that playerStore will detect and handle
        next.flags = next.flags || {};
        next.flags[`_pendingDirectCombat`] = JSON.stringify(enemyIds);
        log.push(`Combat will initiate with ${enemyIds.length} enemies`);
        break;
      }
      case 'advanceThreat': {
        // Advance a threat (reduce distance by its speed)
        const threatId = e.threatId || e.key;
        if (!threatId) { log.push('advanceThreat missing threatId'); break; }
        next.activeThreats = next.activeThreats || [];
        const idx = next.activeThreats.findIndex((t: any) => t.id === threatId);
        if (idx >= 0) {
          const threat = next.activeThreats[idx];
          const res = advanceThreatFn(threat, 1);
          next.activeThreats[idx] = res.threat;
          log.push(...res.log);
        } else {
          log.push(`advanceThreat: threat ${threatId} not found`);
        }
        break;
      }
      case 'breakLOS': {
        // Break line of sight (for escaping/hiding)
        const durationTurns = e.durationTurns || 1;
        next.flags = next.flags || {};
        next.flags['_losBlocked'] = true;
        next.flags['_losBlockedTurns'] = durationTurns;
        log.push(`Line of sight broken for ${durationTurns} turns`);
        break;
      }
      case 'takeDamage': {
        // Apply damage to player
        const amount = e.amount || e.value || e.damage || 0;
        next.health = Math.max((next.health || 100) - amount, 0);
        log.push(`Took ${amount} damage (health: ${next.health}/100)`);
        handleDeath(next, log);
        break;
      }
      case 'addGold': {
        // Add gold to player
        const amount = e.amount || e.value || 0;
        next.stats.gold = (next.stats.gold || 0) + amount;
        log.push(`+${amount} gold (total: ${next.stats.gold})`);
        break;
      }
      case 'addToCounter': {
        // Add to a counter flag
        const key = e.key || e.counter;
        const amount = e.amount || e.value || e.qty || 1;
        if (!key) { log.push('addToCounter missing key'); break; }
        next.flags = next.flags || {};
        next.flags[key] = (next.flags[key] || 0) + amount;
        log.push(`addToCounter ${key} += ${amount} (now: ${next.flags[key]})`);
        break;
      }
      case 'enemyReturnFireIfInRange': {
        // Enemy returns fire - apply damage if conditions met
        const damage = e.damage || e.amount || 0;
        const minDistance = e.minDistance || 0;
        // For now, just apply damage as the enemy shoots back
        if (damage > 0) {
          next.health = Math.max((next.health || 100) - damage, 0);
          log.push(`Enemy returns fire! Took ${damage} damage`);
          handleDeath(next, log);
        }
        break;
      }
      case 'castSpell': {
        // Cast a spell (consume mana, apply effects)
        const spellId = e.spellId || e.spell || e.key;
        const manaCost = e.manaCost || e.cost || 0;
        if (!spellId) { log.push('castSpell missing spellId'); break; }
        // Deduct mana if tracking it
        if (manaCost > 0 && next.stats.mana !== undefined) {
          next.stats.mana = Math.max((next.stats.mana || 0) - manaCost, 0);
        }
        log.push(`Cast spell: ${spellId}`);
        // Spell effects would be handled by looking up the spell definition
        break;
      }
      case 'threatMoraleDelta': {
        // Modify threat morale
        const threatId = e.threatId || e.key;
        const delta = e.delta || e.amount || 0;
        if (!threatId) { log.push('threatMoraleDelta missing threatId'); break; }
        next.activeThreats = next.activeThreats || [];
        const idx = next.activeThreats.findIndex((t: any) => t.id === threatId);
        if (idx >= 0) {
          const threat = next.activeThreats[idx];
          threat.morale = (threat.morale || 100) + delta;
          log.push(`Threat ${threatId} morale changed by ${delta} (now: ${threat.morale})`);
        }
        break;
      }
      case 'threatRetreat': {
        // Increase threat distance (they retreat)
        const threatId = e.threatId || e.key;
        const amount = e.amount || e.distance || 1;
        if (!threatId) { log.push('threatRetreat missing threatId'); break; }
        next.activeThreats = next.activeThreats || [];
        const idx = next.activeThreats.findIndex((t: any) => t.id === threatId);
        if (idx >= 0) {
          const threat = next.activeThreats[idx];
          threat.distance = (threat.distance || 0) + amount;
          log.push(`Threat ${threatId} retreats (distance: ${threat.distance})`);
        }
        break;
      }
      case 'move': {
        // Move player (change distance to threat or navigate)
        const direction = e.direction || 'back';
        const amount = e.amount || e.distance || 1;
        log.push(`Player moves ${direction} ${amount} spaces`);
        // Movement effects handled by navigation system
        break;
      }
      case 'openDialogue': {
        // Open a dialogue with an NPC
        const dialogueId = e.dialogueId || e.key;
        const npcId = e.npcId || e.npc;
        if (!dialogueId && !npcId) { log.push('openDialogue missing dialogueId or npcId'); break; }
        // Set a flag for the dialogue system to detect
        next.flags = next.flags || {};
        next.flags['_pendingDialogue'] = dialogueId || npcId;
        log.push(`Opening dialogue: ${dialogueId || npcId}`);
        break;
      }
      case 'skillCheck': {
        // Skill check effect - would be handled by skill system
        const skill = e.skill || e.key;
        const difficulty = e.difficulty || e.dc || 10;
        log.push(`Skill check: ${skill} (DC ${difficulty})`);
        // Actual skill check logic would be implemented in the skill system
        break;
      }
      case 'conditional': {
        // Conditional effect - evaluate condition and apply effects
        const condition = e.condition;
        const thenEffects = e.then || e.thenEffects || [];
        const elseEffects = e.else || e.elseEffects || [];
        // For now, just log - actual conditional logic needs requirements evaluation
        log.push(`Conditional effect (condition: ${JSON.stringify(condition)})`);
        break;
      }
      case 'craft': {
        // Crafting effect
        const recipeId = e.recipeId || e.recipe || e.key;
        if (!recipeId) { log.push('craft missing recipeId'); break; }
        log.push(`Crafting: ${recipeId}`);
        // Actual crafting would be handled by crafting system
        break;
      }
      case 'consumeAmmo': {
        // Consume ammunition
        const ammoType = e.ammoType || 'arrow';
        const amount = e.amount || e.qty || 1;
        const ammoItemMap: Record<string, string> = {
          'arrow': 'quiver_arrows',
          'bolt': 'crossbow_bolts',
          'bullet': 'sling_bullets'
        };
        const itemId = ammoItemMap[ammoType] || ammoType;
        const inv: InvItem[] = next.inventory || [];
        const found = inv.find(i => i.itemId === itemId);
        if (found) {
          found.qty -= amount;
          if (found.qty <= 0) next.inventory = inv.filter(i => i.itemId !== itemId);
          log.push(`Consumed ${amount} ${ammoType}`);
        } else {
          log.push(`No ${ammoType} to consume`);
        }
        break;
      }
      default:
        console.warn('Unknown effect type', e.type);
        log.push(`unknownEffect ${e.type}`);
    }
  }

  return { state: next, log };
}
