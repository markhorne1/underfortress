import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KVStorage } from './kvStorage';

export const asyncStorageKV: KVStorage = {
  getItem: (k: string) => AsyncStorage.getItem(k),
  setItem: (k: string, v: string) => AsyncStorage.setItem(k, v),
  removeItem: (k: string) => AsyncStorage.removeItem(k)
};
