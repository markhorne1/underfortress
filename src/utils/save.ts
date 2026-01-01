import { asyncStorageKV } from '../storage/asyncStorageKV';

export async function saveKey(key: string, data: any) {
  await asyncStorageKV.setItem(key, JSON.stringify(data));
}

export async function loadKey(key: string) {
  const raw = await asyncStorageKV.getItem(key);
  return raw ? JSON.parse(raw) : null;
}
