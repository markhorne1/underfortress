import { create } from 'zustand';
import type { KVStorage } from '../storage/kvStorage';
import { asyncStorageKV } from '../storage/asyncStorageKV';
import { localStorageKV } from '../storage/localStorageKV';
import { loadContent, getAreaById, getAllAreas, getStartAreaId } from '../engine/contentLoader';
import { Threat, advanceThreat, shootThreat as shootThreatEngine, placeHazard as placeHazardEngine, handleThreatTick } from '../engine/threat';
import { PlayerState as EnginePlayerState } from '../engine/types';

import { applyEffects } from '../engine/effects';
import { getContentSnapshot } from '../engine/contentLoader';
import { performEnterEffects, executeChoice } from '../engine/execute';
import { PLAYER_MAX_HEALTH } from '../engine/balance';
import { getMaxStamina } from '../engine/skillCalculations';

export type PlayerState = EnginePlayerState & {
  activeThreat?: Threat | undefined;
  quests: Record<string, any>;
  questLog: any[];
};

export type PlayerActions = {
  hasSave: boolean;
  loadState: () => Promise<void>;
  newGame: () => Promise<void>;
  consumeInventoryItem: (itemId: string) => Promise<{ success: boolean; log: string[] }>;
  moveTo: (areaId?: string, skipExitCheck?: boolean) => Promise<void>;
  handleChoice: (choice: any) => Promise<{ log: string[] } | void>;
  handleAction: (actionType: string, action: any) => Promise<{ success: boolean; log: string[] }>;
  allocateStats: (changes: { power: number; mind: number; agility: number; vision: number }) => Promise<void>;
  startThreat: (tConfig: any) => Promise<void>;
  shootActiveThreat: (shots?: number, seed?: number) => Promise<any>;
  placeHazardActive: (hazardType: string) => Promise<any>;
  retreatFromThreat: () => Promise<any>;
};

export type PlayerStore = PlayerState & PlayerActions;

const STORAGE_KEY = 'underfortress_save_v1';
const DEFAULT_NEW_GAME_START_AREA = 's_woods_camp';

export function createPlayerStore(storage: KVStorage) {
  return create<PlayerStore>((set, get) => ({
    currentAreaId: 'start',
    discoveredMap: {},
    inventory: [],
    equipment: {},
    activeThreat: undefined,
    quests: {},
    questLog: [],
    spellsKnown: [],
    spellPathsUnlocked: [],
    combatSkills: [],
    stats: { 
      gold: 0,
      power: 1, mind: 1, agility: 1, vision: 1,
      statPoints: 4
    },
    health: PLAYER_MAX_HEALTH,
    stamina: 15,  // Starting stamina: (1+1+1)×5 = 15
    maxStamina: 15,
    lastCheckpointId: 'start',
    flags: {},
    hasSave: false,
    loadState: async () => {
      try {
        await loadContent();
        const raw = await storage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (typeof data.health === 'number') {
            data.health = Math.max(0, Math.min(PLAYER_MAX_HEALTH, data.health));
          } else {
            data.health = PLAYER_MAX_HEALTH;
          }
          // validate loaded area exists
          const loadedArea = (data as any).currentAreaId;
          if (!loadedArea || !getAreaById(loadedArea)) {
            console.warn('Saved state references missing area, ignoring save:', loadedArea);
            set({ hasSave: false });
            return;
          }
          set({ ...(data as any), hasSave: true });
        } else {
          set({ hasSave: false });
        }
      } catch (e) {
        console.warn('loadState failed', e);
      }
    },
    newGame: async () => {
      await loadContent();
      const configuredStartId = getStartAreaId();
      const firstArea = getAllAreas()[0] as any;
      const fallbackStartId = [DEFAULT_NEW_GAME_START_AREA, 'i_underfortress_entry']
        .find((areaId) => !!getAreaById(areaId)) || firstArea?.id;
      const startId = getAreaById(DEFAULT_NEW_GAME_START_AREA)
        ? DEFAULT_NEW_GAME_START_AREA
        : configuredStartId && getAreaById(configuredStartId)
        ? configuredStartId
        : fallbackStartId;
      if (!startId || !getAreaById(startId)) {
        throw new Error(`Invalid startAreaId in content and default Camp start area missing: ${configuredStartId}`);
      }
      if (startId !== configuredStartId) {
        console.warn(`Configured start area missing or overridden for New Game (${configuredStartId}); using ${startId}.`);
      }
      const discovered: Record<string, true> = {};
      discovered[startId] = true;
      set({ 
        currentAreaId: startId, 
        discoveredMap: discovered, 
        inventory: [
          { itemId: 'training_sword', qty: 1 },
          { itemId: 'training_shield', qty: 1 }
        ], 
        equipment: { 
          mainhand: 'training_sword',
          offhand: 'training_shield'
        }, 
        spellsKnown: [],
        spellPathsUnlocked: [],
        combatSkills: [],
        stats: { 
          gold: 0,
          power: 1, mind: 1, agility: 1, vision: 1,
          statPoints: 5
        },
        health: PLAYER_MAX_HEALTH,
        stamina: 100,
        maxStamina: 100,
        flags: {},
        quests: {},
        questLog: [],
        combat: null,
        activeThreats: [],
        jobs: {},
        lastCheckpointId: startId,
        hasSave: true 
      } as any);
      // persist
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
    },
    consumeInventoryItem: async (itemId: string) => {
      const state = get() as any;
      const inv = [...(state.inventory || [])];
      const idx = inv.findIndex((i: any) => i.itemId === itemId && i.qty > 0);
      if (idx < 0) {
        return { success: false, log: [`No ${itemId} in inventory.`] };
      }

      const logs: string[] = [];
      const flags = { ...(state.flags || {}) };
      const activeBuffs = [...(state.activeBuffs || [])];
      let health = state.health ?? PLAYER_MAX_HEALTH;
      let stamina = state.stamina ?? 0;
      let maxStamina = state.maxStamina ?? 0;

      switch (itemId) {
        case 'mushroom_red':
          health = Math.min(PLAYER_MAX_HEALTH, health + 10);
          logs.push('You eat the red mushroom and recover 10 health.');
          break;
        case 'mushroom_green':
          health = Math.min(PLAYER_MAX_HEALTH, health + 5);
          logs.push('You eat the green mushroom and recover 5 health.');
          break;
        case 'mushroom_purple':
          stamina = maxStamina;
          logs.push('The purple mushroom restores your stamina to full.');
          break;
        case 'mushroom_golden':
          flags._nextCombatAttackDamageBonus = (flags._nextCombatAttackDamageBonus || 0) + 2;
          logs.push('Golden mushroom consumed: +2 damage queued for your next combat.');
          break;
        case 'mushroom_purplish':
          flags._nextBattleStaminaMultiplier = Math.max(2, flags._nextBattleStaminaMultiplier || 1);
          logs.push('Purplish mushroom consumed: next battle max stamina will be doubled.');
          break;
        case 'tavern_pie':
          health = Math.min(PLAYER_MAX_HEALTH, health + 5);
          logs.push('You eat a hot tavern pie and recover 5 health.');
          break;
        case 'street_broth':
          health = Math.min(PLAYER_MAX_HEALTH, health + 4);
          logs.push('You drink the hot broth and recover 4 health.');
          break;
        case 'street_skewer':
          health = Math.min(PLAYER_MAX_HEALTH, health + 7);
          logs.push('You eat the meat skewer and recover 7 health.');
          break;
        case 'street_rations':
          health = Math.min(PLAYER_MAX_HEALTH, health + 10);
          logs.push('You eat the bread, cheese, and fruit and recover 10 health.');
          break;
        default:
          return { success: false, log: [`${itemId} is not currently usable from inventory.`] };
      }

      inv[idx].qty -= 1;
      const nextInventory = inv[idx].qty <= 0 ? inv.filter((i: any) => i.qty > 0) : inv;

      set({
        inventory: nextInventory,
        flags,
        activeBuffs,
        health,
        stamina,
        maxStamina
      } as any);

      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
      return { success: true, log: logs };
    },
    moveTo: async (areaId?: string, skipExitCheck: boolean = false) => {
      if (!areaId) return;
      const allAreas = getAllAreas();
      const dest = getAreaById(areaId);
      if (!dest) return;

      // Validate exit exists from current area to destination (unless skipExitCheck is true)
      if (!skipExitCheck) {
        const currentId = get().currentAreaId;
        const currentArea = getAreaById(currentId as string);
        const exits = (currentArea && currentArea.exits) || {};
        const allowed = Object.values(exits).includes(areaId);
        if (!allowed) {
          console.warn(`moveTo blocked: ${areaId} is not an exit of ${currentId}`);
          return;
        }
      }

      // set current area and discovered first
      const discovered = { ...get().discoveredMap, [areaId]: true };
      set({ currentAreaId: areaId, discoveredMap: discovered } as any);

      // Check for pending combat from threat BEFORE processing area effects
      // This flag is set by forceCombatFromThreat effect from a previous choice
      const currentState = get() as any;
      const flags = currentState.flags || {};
      
      // Check for direct combat first (forceCombat effect)
      if (flags['_pendingDirectCombat']) {
        const enemyIds = JSON.parse(flags['_pendingDirectCombat']);
        delete flags['_pendingDirectCombat'];
        set({ flags } as any);
        
        const { initiateCombat } = await import('../engine/combatNew');
        const combatResult = initiateCombat(enemyIds, currentState);
        // For direct combat, we can optionally store a marker
        if (combatResult.combat) {
          combatResult.combat.threatId = 'direct_combat';
        }
        set({
          combat: combatResult.combat,
          activeBuffs: (combatResult as any).activeBuffs,
          flags: (combatResult as any).flags,
          stamina: (combatResult as any).stamina,
          maxStamina: (combatResult as any).maxStamina
        } as any);
        await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
        return; // Stop further processing
      }
      
      // Check for threat-based combat
      for (const flagKey of Object.keys(flags)) {
        if (flagKey.startsWith('_pendingCombat:')) {
          const threatId = flagKey.replace('_pendingCombat:', '');
          
          // Check if this area's combat has already been defeated
          const combatDefeatedFlag = `area:${currentState.currentAreaId}:combat_defeated`;
          if (flags[combatDefeatedFlag]) {
            // Clear the pending flag and continue
            delete flags[flagKey];
            set({ flags } as any);
            continue;
          }
          
          // Clear the pending flag
          delete flags[flagKey];
          set({ flags } as any);
          
          // Load enemy group data and initiate combat
          const { initiateCombat } = await import('../engine/combatNew');
          const { getContentSnapshot } = await import('../engine/contentLoader');
          
          // Find the threat in activeThreats array
          const threat = (currentState.activeThreats || []).find((t: any) => t.id === threatId || t.threatId === threatId);
          
          if (threat && threat.enemyGroupId) {
            const content = getContentSnapshot();
            const enemies = content.enemies;
            
            // Enemy groups are stored in enemies collection
            const enemyGroup = enemies instanceof Map ? enemies.get(threat.enemyGroupId) : null;
            
            if (enemyGroup && enemyGroup.kind === 'group' && enemyGroup.members) {
              // Expand group members into individual enemy IDs
              const enemyIds: string[] = [];
              for (const member of enemyGroup.members) {
                const count = member.count || 1;
                for (let i = 0; i < count; i++) {
                  enemyIds.push(member.enemyId);
                }
              }
              
              // Initiate combat with these enemies
              const combatResult = initiateCombat(enemyIds, currentState);
              // Store the threat ID and origin area ID in combat state
              if (combatResult.combat) {
                combatResult.combat.threatId = threatId;
                combatResult.combat.originAreaId = currentState.currentAreaId;
              }
              set({
                combat: combatResult.combat,
                activeBuffs: (combatResult as any).activeBuffs,
                flags: (combatResult as any).flags,
                stamina: (combatResult as any).stamina,
                maxStamina: (combatResult as any).maxStamina
              } as any);
              await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
              return; // Stop further processing
            }
          } else {
            console.warn('⚠️ Threat not found or has no enemyGroupId:', threatId);
          }
        }
      }

      // Run area enter effects, allowing for chained teleports but preventing infinite loops
      let loop = 0;
      let nextAreaId = areaId;
      while (loop < 5) {
        const areaObj = getAreaById(nextAreaId);
        if (!areaObj) break;
        
        // Auto-set checkpoint if area is marked as a checkpoint
        if ((areaObj as any).isCheckpoint) {
          const currentState = get() as any;
          currentState.lastCheckpointId = nextAreaId;
          set({ lastCheckpointId: nextAreaId } as any);
        }
        
        // Handle onEnter combat initialization BEFORE other effects
        const onEnter = (areaObj as any).onEnter;
        if (onEnter && Array.isArray(onEnter)) {
          for (const action of onEnter) {
            if (action.type === 'initiateCombat' && action.enemyIds && Array.isArray(action.enemyIds)) {
              // Check if this area's combat has already been defeated
              const currentState = get() as any;
              const combatDefeatedFlag = `area:${nextAreaId}:combat_defeated`;
              
              if (currentState.flags && currentState.flags[combatDefeatedFlag]) {
                continue; // Skip this combat, continue with other onEnter actions
              }
              
              // Import initiateCombat dynamically to avoid circular deps
              const { initiateCombat } = await import('../engine/combatNew');
              const combatResult = initiateCombat(action.enemyIds, currentState);
              // Store the origin area ID for respawn prevention
              if (combatResult.combat) {
                combatResult.combat.originAreaId = nextAreaId;
              }
              set({
                combat: combatResult.combat,
                activeBuffs: (combatResult as any).activeBuffs,
                flags: (combatResult as any).flags,
                stamina: (combatResult as any).stamina,
                maxStamina: (combatResult as any).maxStamina
              } as any);
              // Combat initiated, stop further processing and save
              await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
              return;
            }
          }
        }
        
        const currentState = (get() as any) as any;
        const res = performEnterEffects(areaObj, currentState);
        // apply keys from res.state back to store (only common fields changed by effects)
        const newState: any = {};
        if (res.state.currentAreaId) newState.currentAreaId = res.state.currentAreaId;
        if (res.state.discoveredMap) newState.discoveredMap = res.state.discoveredMap;
        if (res.state.inventory) newState.inventory = res.state.inventory;
        if ((res.state as any).flags) newState.flags = (res.state as any).flags;
        if ((res.state as any).quests) newState.quests = (res.state as any).quests;
        if ((res.state as any).questLog) newState.questLog = (res.state as any).questLog;
        if (res.state.stats) newState.stats = res.state.stats;
        if (res.state.health !== undefined) newState.health = res.state.health;
        if (res.state.lastCheckpointId) newState.lastCheckpointId = res.state.lastCheckpointId;
        
        set(newState);

        // run any active quest stage onEnterEffects
        const content = getContentSnapshot();
        const questsMap = content.quests as Map<string, any> | undefined;
        if (questsMap) {
          for (const qid of Object.keys((res.state as any).quests || {})) {
            const stageIndex = (res.state as any).quests[qid];
            if (stageIndex === 'completed' || stageIndex == null) continue;
            const questDef = questsMap.get(qid);
            if (!questDef) continue;
            const stage = questDef.stages && questDef.stages[stageIndex];
            if (stage && stage.onEnterEffects && stage.onEnterEffects.length > 0) {
              const afterStage = applyEffects(stage.onEnterEffects, (get() as any));
              const stageStatePatch: any = {};
              if (afterStage.state.flags) stageStatePatch.flags = afterStage.state.flags;
              if (afterStage.state.inventory) stageStatePatch.inventory = afterStage.state.inventory;
              if (afterStage.state.quests) stageStatePatch.quests = afterStage.state.quests;
              if (afterStage.state.stats) stageStatePatch.stats = afterStage.state.stats;
              set(stageStatePatch);
            }
          }
        }

        // if effects teleported us to a new area, continue processing that area's enter effects
        const resultingAreaId = (res.state as any).currentAreaId || nextAreaId;
        if (resultingAreaId && resultingAreaId !== nextAreaId) {
          nextAreaId = resultingAreaId;
          loop += 1;
          continue;
        }
        break;
      }

      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
    },
    handleChoice: async (choice: any) => {
      const currentState = get();
      const currentAreaId = currentState.currentAreaId;
      
      // Check if this is an action (search, etc) that needs special handling
      if (choice.rawAction && choice.actionType) {
        await get().handleAction(choice.actionType, choice.rawAction);
        return;
      }
      
      // Simple navigation via goToAreaId
      if (choice.goToAreaId && !choice.effects && !choice.requirements) {
        await get().moveTo(choice.goToAreaId, true);
        return;
      }
      
      // Full choice execution with effects
      const result = executeChoice(choice, currentState);
      
      // Apply state mutations from effects
      const updates: any = {};
      if (result.state.inventory) updates.inventory = result.state.inventory;
      if (result.state.stats) updates.stats = result.state.stats;
      if ((result.state as any).flags) updates.flags = (result.state as any).flags;
      if ((result.state as any).quests) updates.quests = (result.state as any).quests;
      if ((result.state as any).questLog) updates.questLog = (result.state as any).questLog;
      if ((result.state as any).activeThreats) updates.activeThreats = (result.state as any).activeThreats;
      if (result.state.spellsKnown) updates.spellsKnown = result.state.spellsKnown;
      if (result.state.equipment) updates.equipment = result.state.equipment;
      if (result.state.health !== undefined) updates.health = result.state.health;
      if (result.state.lastCheckpointId) updates.lastCheckpointId = result.state.lastCheckpointId;
      if (result.state.currentAreaId) updates.currentAreaId = result.state.currentAreaId;
      
      set(updates);
      
      // Navigate if choice resolves to a new area
      // Skip exit check because choices can teleport anywhere
      if (result.goToAreaId) {
        await get().moveTo(result.goToAreaId, true);
      }
      
      // Autosave
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
      
      return { log: result.log };
    },
    handleAction: async (actionType: string, action: any) => {
      const currentState = get();
      const currentAreaId = currentState.currentAreaId;
      
      let result: { state: PlayerState; log: string[]; success: boolean };
      
      // Route to appropriate action handler
      if (actionType === 'search') {
        const { performSearch } = await import('../engine/execute');
        result = await performSearch(currentAreaId, action, currentState);
      } else if (actionType === 'investigate') {
        const { performInvestigate } = await import('../engine/execute');
        result = await performInvestigate(currentAreaId, action, currentState);
      } else {
        // Unknown action type
        return { success: false, log: [`Unknown action type: ${actionType}`] };
      }
      
      // Apply state mutations
      const updates: any = {};
      if (result.state.inventory) updates.inventory = result.state.inventory;
      if (result.state.stats) updates.stats = result.state.stats;
      if ((result.state as any).flags) updates.flags = (result.state as any).flags;
      if ((result.state as any).quests) updates.quests = (result.state as any).quests;
      if ((result.state as any).questLog) updates.questLog = (result.state as any).questLog;
      if (result.state.spellsKnown) updates.spellsKnown = result.state.spellsKnown;
      if (result.state.equipment) updates.equipment = result.state.equipment;
      if (result.state.health !== undefined) updates.health = result.state.health;
      if (result.state.lastCheckpointId) updates.lastCheckpointId = result.state.lastCheckpointId;
      if (result.state.currentAreaId) updates.currentAreaId = result.state.currentAreaId;
      
      set(updates);
      
      // Autosave
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
      
      return { success: result.success, log: result.log };
    },
    allocateStats: async (changes: { power: number; mind: number; agility: number; vision: number }) => {
      const currentState = get();
      const currentStats = currentState.stats;
      
      // Calculate total points being spent
      const pointsSpent = changes.power + changes.mind + changes.agility + changes.vision;
      
      // Validate we have enough points
      if (pointsSpent > currentStats.statPoints) {
        console.error('Not enough stat points:', { pointsSpent, available: currentStats.statPoints });
        return;
      }
      
      // Calculate new stat values
      const newPower = currentStats.power + changes.power;
      const newMind = currentStats.mind + changes.mind;
      const newAgility = currentStats.agility + changes.agility;
      const newVision = currentStats.vision + changes.vision;
      
      // Validate stat limits (1-10)
      if (newPower < 1 || newPower > 10 || newMind < 1 || newMind > 10 || 
          newAgility < 1 || newAgility > 10 || newVision < 1 || newVision > 10) {
        console.error('Stats must be between 1 and 10');
        return;
      }
      
      // Apply changes
      const newStats = {
        ...currentStats,
        power: newPower,
        mind: newMind,
        agility: newAgility,
        vision: newVision,
        statPoints: currentStats.statPoints - pointsSpent
      };
      
      set({ stats: newStats } as any);
      
      // Autosave
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
      console.log('✓ Stats allocated:', { changes, newStats });
    },
    resetStats: async () => {
      // Check if player has Godstone
      const state = get();
      const inv = state.inventory || [];
      const godstone = inv.find(i => i.itemId === 'godstone');
      if (!godstone || godstone.qty <= 0) {
        console.error('Godstone required to reset stats');
        return { success: false, message: 'You need a Godstone to reset your stats!' };
      }
      
      // Consume the Godstone
      godstone.qty -= 1;
      if (godstone.qty <= 0) {
        state.inventory = inv.filter(i => i.itemId !== 'godstone');
      }
      
      // Calculate total points spent (current stats - base 1 for each + base 4 stat points)
      const currentStats = state.stats;
      const pointsSpent = (currentStats.power - 1) + (currentStats.mind - 1) + 
                          (currentStats.agility - 1) + (currentStats.vision - 1);
      
      // Reset all stats to 1 and refund all points
      const resetStats = {
        ...currentStats,
        power: 1,
        mind: 1,
        agility: 1,
        vision: 1,
        statPoints: currentStats.statPoints + pointsSpent
      };
      
      // Recalculate stamina for new stats (1+1+1)*5 = 15
      const newMaxStamina = getMaxStamina({ stats: resetStats } as any);
      
      set({ 
        stats: resetStats, 
        inventory: state.inventory,
        stamina: newMaxStamina,
        maxStamina: newMaxStamina
      } as any);
      
      // Autosave
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
      console.log('✓ Stats reset with Godstone. Refunded:', pointsSpent, 'points');
      return { success: true, message: `Stats reset! Refunded ${pointsSpent} stat points.` };
    },
    startThreat: async (tConfig: any) => {
      if (!tConfig) return;
      const id = `threat_${Date.now()}`;
      const threat: Threat = { id, enemyGroupId: tConfig.enemyGroupId || 'goblins', distance: tConfig.distance || 3, speed: tConfig.speed || 1, hitsRemaining: tConfig.hitsRemaining ?? 2, targetAreaId: get().currentAreaId };
      set({ activeThreat: threat } as any);
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
    },
    shootActiveThreat: async (shots = 1, seed = Date.now()) => {
      const state = get();
      const t = state.activeThreat as Threat | undefined;
      if (!t) return { log: ['no threat'] };
      // check arrows
      const inv = state.inventory || [];
      const arrow = inv.find(i => i.itemId === 'arrow');
      if (!arrow || arrow.qty <= 0) return { log: ['no arrows'] };
      // consume one arrow per shot
      const toConsume = Math.min(shots, arrow.qty);
      arrow.qty -= toConsume;
      if (arrow.qty <= 0) state.inventory = inv.filter(i => i.itemId !== 'arrow');
      const res = shootThreatEngine(t, toConsume, seed);
      set({ activeThreat: res.threat, inventory: state.inventory } as any);
      // advance threat tick after shooting
      const tick = handleThreatTick(res.threat, (get() as any));
      set({ activeThreat: tick.threat } as any);
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
      return { log: res.log.concat(tick.log), killed: res.killed };
    },
    placeHazardActive: async (hazardType: string) => {
      const state = get();
      const t = state.activeThreat as Threat | undefined;
      if (!t) return { log: ['no threat'] };
      const res = placeHazardEngine(t, hazardType);
      // apply any inventory costs (e.g., spikes)
      if (hazardType === 'spikes') {
        // consume one spikes item if present
        const inv = state.inventory || [];
        const spike = inv.find(i => i.itemId === 'spikes');
        if (spike) {
          spike.qty -= 1;
          if (spike.qty <= 0) state.inventory = inv.filter(i => i.itemId !== 'spikes');
        }
        set({ inventory: state.inventory } as any);
      }
      set({ activeThreat: res.threat } as any);
      const tick = handleThreatTick(res.threat, (get() as any));
      set({ activeThreat: tick.threat } as any);
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
      return { log: res.log.concat(tick.log) };
    },
    retreatFromThreat: async () => {
      const state = get();
      const area = getAreaById(state.currentAreaId);
      if (!area || !area.exits) return { log: ['no exits to retreat to'] };
      const exits = Object.values(area.exits);
      const dest = exits[0];
      if (!dest) return { log: ['no exit found'] };
      // move player
      await get().moveTo(dest as string);
      const t = get().activeThreat as Threat | undefined;
      if (t) {
        // advancing threat after retreat
        const tick = handleThreatTick(t, (get() as any));
        set({ activeThreat: tick.threat } as any);
        await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
        return { log: tick.log };
      }
      return { log: ['retreated'] };
    }
  }));
}

// default app store using AsyncStorage adapter
// choose web localStorage when running in browser
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const usePlayerStore = createPlayerStore(isBrowser ? localStorageKV : asyncStorageKV);

export function listDiscoveredAreas(): string[] {
  const state = (usePlayerStore as any).getState();
  return Object.keys(state.discoveredMap ?? {});
}
