import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'dawai-storage' });

// ─── Keys ────────────────────────────────────────────────────────────────────
export const StorageKeys = {
  ACCESS_TOKEN  : 'accessToken',
  REFRESH_TOKEN : 'refreshToken',
  CUSTOMER      : 'customer',
  FAVORITES     : 'favorites',
  ADDRESSES     : 'addresses',
} as const;

// ─── API ─────────────────────────────────────────────────────────────────────
export const StorageService = {
  getString(key: string): string | undefined {
    return storage.getString(key);
  },

  setString(key: string, value: string): void {
    storage.set(key, value);
  },

  getObject<T>(key: string): T | null {
    const raw = storage.getString(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },

  setObject<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  },

  delete(key: string): void {
    storage.delete(key);
  },

  clearAuth(): void {
    storage.delete(StorageKeys.ACCESS_TOKEN);
    storage.delete(StorageKeys.REFRESH_TOKEN);
    storage.delete(StorageKeys.CUSTOMER);
  },
};
