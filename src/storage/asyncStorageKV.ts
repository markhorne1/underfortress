import type { KVStorage } from './kvStorage';

// Make this module bundler-safe: avoid static import of '@react-native-async-storage/async-storage'
// so web builds don't fail. Use localStorage in browser, otherwise attempt dynamic require.
let AsyncStorageImpl: any = null;
if (typeof window === 'undefined') {
  try {
    // use eval('require') to avoid static resolution by bundlers
    // @ts-ignore
    AsyncStorageImpl = eval('require')('@react-native-async-storage/async-storage');
  } catch (e) {
    AsyncStorageImpl = null;
  }
}

export const asyncStorageKV: KVStorage = {
  getItem: (k: string) => {
    if (typeof window !== 'undefined') return Promise.resolve(window.localStorage.getItem(k));
    if (AsyncStorageImpl && AsyncStorageImpl.getItem) return AsyncStorageImpl.getItem(k);
    return Promise.resolve(null);
  },
  setItem: (k: string, v: string) => {
    if (typeof window !== 'undefined') { try { window.localStorage.setItem(k, v); } catch (e) {} return Promise.resolve(); }
    if (AsyncStorageImpl && AsyncStorageImpl.setItem) return AsyncStorageImpl.setItem(k, v);
    return Promise.resolve();
  },
  removeItem: (k: string) => {
    if (typeof window !== 'undefined') { try { window.localStorage.removeItem(k); } catch (e) {} return Promise.resolve(); }
    if (AsyncStorageImpl && AsyncStorageImpl.removeItem) return AsyncStorageImpl.removeItem(k);
    return Promise.resolve();
  }
};
