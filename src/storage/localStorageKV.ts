import type { KVStorage } from './kvStorage';

export const localStorageKV: KVStorage = {
  getItem: async (k: string) => {
    try { return Promise.resolve(window.localStorage.getItem(k) ?? null); } catch (e) { return Promise.resolve(null); }
  },
  setItem: async (k: string, v: string) => {
    try { window.localStorage.setItem(k, v); return Promise.resolve(); } catch (e) { return Promise.resolve(); }
  },
  removeItem: async (k: string) => {
    try { window.localStorage.removeItem(k); return Promise.resolve(); } catch (e) { return Promise.resolve(); }
  }
};
