import Storage from 'expo-sqlite/kv-store';

/** Small key/value settings. Secrets go to expo-secure-store, records to Drizzle tables. */
export const storage = {
  getString: (key: StorageKey) => Storage.getItemSync(key),
  setString: (key: StorageKey, value: string) => Storage.setItemSync(key, value),
  remove: (key: StorageKey) => Storage.removeItemSync(key),
};

export type StorageKey = 'session.email' | 'sync.lastPulledAt';
