import { create } from 'zustand';

type SettingsState = {
  trackedQuestId?: string | null;
  setTracked: (id: string | null) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  trackedQuestId: null,
  setTracked: (id) => set({ trackedQuestId: id })
}));
