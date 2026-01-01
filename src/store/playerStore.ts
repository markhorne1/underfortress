import create from 'zustand';
import type { KVStorage } from '../storage/kvStorage';
import { asyncStorageKV } from '../storage/asyncStorageKV';
import { loadContent, getAreaById, getAllAreas } from '../engine/contentLoader';
import { Threat, advanceThreat, shootThreat as shootThreatEngine, placeHazard as placeHazardEngine, handleThreatTick } from '../engine/threat';

import { applyEffects } from '../engine/effects';
import { getContentSnapshot } from '../engine/contentLoader';
import { performEnterEffects } from '../engine/execute';

type InvItem = { itemId: string; qty: number };

export type PlayerState = {
  currentAreaId: string;
  discoveredMap: Record<string, true>;
  inventory: InvItem[];
  equipment: Record<string, string | null>;
  activeThreat?: Threat | undefined;
  quests: Record<string, any>;
  questLog: any[];
  spellsKnown: string[];
  stats: { skill: number; stamina: number; luck: number; gold: number; xp: number; level: number };
  flags?: Record<string, any>;
};

export type PlayerActions = {
  hasSave: boolean;
  loadState: () => Promise<void>;
  newGame: () => Promise<void>;
  moveTo: (areaId?: string) => Promise<void>;
  startThreat: (tConfig: any) => Promise<void>;
  shootActiveThreat: (shots?: number, seed?: number) => Promise<any>;
  placeHazardActive: (hazardType: string) => Promise<any>;
  retreatFromThreat: () => Promise<any>;
};

export type PlayerStore = PlayerState & PlayerActions;

const STORAGE_KEY = 'underfortress_save_v1';

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
    stats: { skill: 6, stamina: 20, luck: 6, gold: 0, xp: 0, level: 1 },
    flags: {},
    hasSave: false,
    loadState: async () => {
      try {
        await loadContent();
        const raw = await storage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          set({ ...(data as any), hasSave: true });
        } else {
          set({ hasSave: false });
        }
      } catch (e) {
        console.warn('loadState failed', e);
      }
    },
    newGame: async () => {
      const startId = 'start';
      const startArea = getAreaById(startId) ? startId : undefined;
      const discovered: Record<string, true> = {};
      if (startArea) discovered[startArea] = true;
      set({ currentAreaId: startArea ?? 'start', discoveredMap: discovered, inventory: [], equipment: {}, spellsKnown: [], stats: { skill: 6, stamina: 20, luck: 6, gold: 0, xp: 0, level: 1 }, hasSave: true } as any);
      // persist
      await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
    },
    moveTo: async (areaId?: string) => {
      if (!areaId) return;
      const allAreas = getAllAreas();
      const dest = getAreaById(areaId);
      if (!dest) return;

      const currentId = get().currentAreaId;
      const currentArea = getAreaById(currentId as string);
      // validate exit exists from current area to destination
      const exits = (currentArea && currentArea.exits) || {};
      const allowed = Object.values(exits).includes(areaId);
      if (!allowed) {
        console.warn(`moveTo blocked: ${areaId} is not an exit of ${currentId}`);
        return;
      }

      // set current area and discovered first
      const discovered = { ...get().discoveredMap, [areaId]: true };
      set({ currentAreaId: areaId, discoveredMap: discovered } as any);

      // Run area enter effects, allowing for chained teleports but preventing infinite loops
      let loop = 0;
      let nextAreaId = areaId;
      while (loop < 5) {
        const areaObj = getAreaById(nextAreaId);
        if (!areaObj) break;
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
      await get().moveTo(dest);
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
export const usePlayerStore = createPlayerStore(asyncStorageKV);

export function listDiscoveredAreas(): string[] {
  const state = (usePlayerStore as any).getState();
  return Object.keys(state.discoveredMap ?? {});
}
