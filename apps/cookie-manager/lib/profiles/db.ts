import type { Profile } from './types';

const DB_NAME = 'bokal';
const STORE = 'profiles';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => { db.close(); dbPromise = null; };
      resolve(db);
    };
    req.onerror = () => { dbPromise = null; reject(req.error); };
  });
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function putProfile(p: Profile): Promise<IDBValidKey> {
  return run('readwrite', (s) => s.put(p));
}
export function getAllProfiles(): Promise<Profile[]> {
  return run('readonly', (s) => s.getAll());
}
export function deleteProfileDb(id: string): Promise<undefined> {
  return run('readwrite', (s) => s.delete(id));
}

/**
 * Add a profile unless the store already holds `limit` (omit for no limit). The count and the write
 * share ONE read-write transaction, and IndexedDB never runs two read-write transactions on the same
 * store at once — so the side panel and the DevTools panel saving together cannot both slip under
 * the free limit. Resolves true if the profile was written.
 */
export function insertProfile(p: Profile, limit?: number): Promise<boolean> {
  return open().then(
    (db) =>
      new Promise<boolean>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        let written = false;
        const write = (): void => { store.put(p); written = true; };
        if (limit === undefined) write();
        else {
          const count = store.count();
          count.onsuccess = () => { if (count.result < limit) write(); };
        }
        tx.oncomplete = () => resolve(written);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}
