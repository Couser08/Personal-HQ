const DB_NAME = 'phq_indexeddb';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

export function getIDBItem<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        resolve(null);
        return;
      }
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getReq = store.get(key);
      getReq.onsuccess = () => {
        resolve((getReq.result as T) ?? null);
      };
      getReq.onerror = () => {
        resolve(null);
      };
    };
    request.onerror = () => {
      resolve(null);
    };
  });
}

export function setIDBItem<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putReq = store.put(value, key);
      putReq.onsuccess = () => {
        resolve();
      };
      putReq.onerror = () => {
        reject(putReq.error);
      };
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function removeIDBItem(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        resolve();
        return;
      }
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const delReq = store.delete(key);
      delReq.onsuccess = () => {
        resolve();
      };
      delReq.onerror = () => {
        reject(delReq.error);
      };
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}
