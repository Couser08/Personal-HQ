// ─── Mock In-Memory Store & IndexedDB Persistence Engine ──────────────────────

import { generateSeedData } from './seedData';
import { getIDBItem, setIDBItem } from '../indexedDB';

const SNAPSHOT_KEY = '_mock_backend_snapshot';

class MockStore {
  private store: Map<string, any[]> = new Map();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initialise in memory immediately with seed data so synchronous accesses work
    this.seedInMemory();
  }

  private seedInMemory() {
    const seeds = generateSeedData();
    for (const [table, rows] of Object.entries(seeds)) {
      this.store.set(table, structuredClone(rows));
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const snapshot = await getIDBItem<Record<string, any[]>>(SNAPSHOT_KEY);
          if (snapshot && typeof snapshot === 'object') {
            for (const [table, rows] of Object.entries(snapshot)) {
              if (Array.isArray(rows)) {
                this.store.set(table, rows);
              }
            }
          } else {
            // First time boot: persist initial seeds
            await this.persist();
          }
        } catch (e) {
          console.warn('[MockStore] Failed to load snapshot from IndexedDB, using in-memory seed:', e);
        } finally {
          this.isInitialized = true;
        }
      })();
    }
    return this.initPromise;
  }

  public getRows(table: string): any[] {
    if (!this.store.has(table)) {
      this.store.set(table, []);
    }
    return this.store.get(table)!;
  }

  public async setRows(table: string, rows: any[]): Promise<void> {
    this.store.set(table, rows);
    await this.persist();
  }

  public async persist(): Promise<void> {
    try {
      const snapshot: Record<string, any[]> = {};
      for (const [table, rows] of this.store.entries()) {
        snapshot[table] = rows;
      }
      await setIDBItem(SNAPSHOT_KEY, snapshot);
    } catch (e) {
      console.warn('[MockStore] Failed to persist snapshot to IndexedDB:', e);
    }
  }

  public async reset(): Promise<void> {
    this.store.clear();
    this.seedInMemory();
    await this.persist();
  }

  public getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [table, rows] of this.store.entries()) {
      stats[table] = rows.length;
    }
    return stats;
  }

  public exportSnapshot(): string {
    const snapshot: Record<string, any[]> = {};
    for (const [table, rows] of this.store.entries()) {
      snapshot[table] = rows;
    }
    return JSON.stringify(snapshot, null, 2);
  }

  public async importSnapshot(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null) return false;
      this.store.clear();
      for (const [table, rows] of Object.entries(parsed)) {
        if (Array.isArray(rows)) {
          this.store.set(table, rows);
        }
      }
      await this.persist();
      return true;
    } catch (e) {
      console.error('[MockStore] Failed to import snapshot:', e);
      return false;
    }
  }
}

// Global Singleton Instance
export const mockStore = new MockStore();
// Kick off async init eagerly
mockStore.init().catch((err) => console.warn('[MockStore] Eager init error:', err));
