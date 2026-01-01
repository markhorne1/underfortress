import type { KVStorage } from './kvStorage';

export function createMemoryKV(seed: Record<string, string> = {}): KVStorage {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    async getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    async setItem(key: string, value: string) {
      map.set(key, value);
    },
    async removeItem(key: string) {
      map.delete(key);
    }
  };
}
