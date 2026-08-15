/**
 * Resilient Local Storage & IndexedDB Hybrid Persistence
 * Handles quota limits, heavy base64 data, and storage optimization automatically.
 */

const DB_NAME = 'personal_hq_idb';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

let idbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!idbPromise) {
    idbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return idbPromise;
}

export async function setIDBItem(key: string, value: any): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB Storage] Failed to write ${key}:`, err);
  }
}

export async function getIDBItem<T = any>(key: string): Promise<T | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB Storage] Failed to read ${key}:`, err);
    return null;
  }
}

/**
 * Deep storage pruning when localStorage reaches 5MB quota
 */
function pruneHeavyStorageItems() {
  try {
    // 1. Prune bug reports screenshotData from localStorage
    const rawBugReports = localStorage.getItem('phq_bug_reports');
    if (rawBugReports) {
      try {
        const reports = JSON.parse(rawBugReports);
        const sanitized = reports.map((r: any) => ({
          ...r,
          screenshotData: r.screenshotData && r.screenshotData.length > 300 ? undefined : r.screenshotData,
        }));
        localStorage.setItem('phq_bug_reports', JSON.stringify(sanitized));
      } catch {
        localStorage.removeItem('phq_bug_reports');
      }
    }

    // 2. Prune drawing whiteboard elements from phq_notes
    const rawNotes = localStorage.getItem('phq_notes');
    if (rawNotes) {
      try {
        const notes = JSON.parse(rawNotes);
        const pruned = notes.map((n: any) => {
          if (n.content && n.content.includes('"elements"')) {
            return { ...n, content: '{"elements":[],"appState":{}}' };
          }
          return n;
        });
        localStorage.setItem('phq_notes', JSON.stringify(pruned));
      } catch {
        // ignore
      }
    }

    // 3. Prune heavy media poster data URIs from phq_media_logs
    const rawMedia = localStorage.getItem('phq_media_logs');
    if (rawMedia) {
      try {
        const media = JSON.parse(rawMedia);
        const prunedMedia = media.map((m: any) => {
          if (m.poster && m.poster.startsWith('data:image')) {
            return { ...m, poster: '' };
          }
          return m;
        });
        localStorage.setItem('phq_media_logs', JSON.stringify(prunedMedia));
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('[Storage Persist] Pruning error:', err);
  }
}

/**
 * Safe local storage setter with automatic QuotaExceeded fallback to IndexedDB
 */
export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.number === -2147024882) {
      // 1. Attempt deep prune
      pruneHeavyStorageItems();

      // 2. Retry localStorage write
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        // 3. Fallback to IndexedDB for large datasets
        void setIDBItem(key, value);
      }
    } else {
      // Other error: fallback to IndexedDB
      void setIDBItem(key, value);
    }
  }
}

/**
 * Safe local storage getter with IndexedDB hydration fallback
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
