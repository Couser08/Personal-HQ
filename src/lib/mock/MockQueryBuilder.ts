// ─── PostgREST-Compatible Chainable Mock Query Builder ─────────────────────────

import { mockStore } from './mockStore';
import { simulateLatency, maybeSimulateError } from './mockConfig';

type FilterFn = (row: any) => boolean;

interface OrderConfig {
  col: string;
  ascending: boolean;
  nullsFirst?: boolean;
}

export class MockQueryBuilder<T = any> {
  private table: string;
  private filters: FilterFn[] = [];
  private _select: string = '*';
  private _order: OrderConfig | null = null;
  private _range: [number, number] | null = null;
  private _single = false;
  private _maybeSingle = false;

  // Mutation intent
  private mutationType: 'SELECT' | 'INSERT' | 'UPDATE' | 'UPSERT' | 'DELETE' = 'SELECT';
  private mutationPayload: any = null;
  private upsertOptions?: { onConflict?: string; ignoreDuplicates?: boolean };

  constructor(table: string) {
    this.table = table;
  }

  // ─── Query Operations ───────────────────────────────────────────────────────

  public select(cols = '*'): this {
    this._select = cols;
    return this;
  }

  public eq(col: string, val: any): this {
    this.filters.push((r) => {
      if (r[col] === undefined && val === null) return true;
      return r[col] === val;
    });
    return this;
  }

  public neq(col: string, val: any): this {
    this.filters.push((r) => r[col] !== val);
    return this;
  }

  public gt(col: string, val: any): this {
    this.filters.push((r) => r[col] > val);
    return this;
  }

  public gte(col: string, val: any): this {
    this.filters.push((r) => r[col] >= val);
    return this;
  }

  public lt(col: string, val: any): this {
    this.filters.push((r) => r[col] < val);
    return this;
  }

  public lte(col: string, val: any): this {
    this.filters.push((r) => r[col] <= val);
    return this;
  }

  public in(col: string, vals: any[]): this {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }

  public is(col: string, val: any): this {
    this.filters.push((r) => r[col] === val);
    return this;
  }

  public contains(col: string, val: any): this {
    this.filters.push((r) => {
      const fieldVal = r[col];
      if (Array.isArray(fieldVal)) {
        if (Array.isArray(val)) {
          return val.every((v) => fieldVal.includes(v));
        }
        return fieldVal.includes(val);
      }
      if (typeof fieldVal === 'string' && typeof val === 'string') {
        return fieldVal.includes(val);
      }
      if (typeof fieldVal === 'object' && fieldVal !== null && typeof val === 'object' && val !== null) {
        return Object.entries(val).every(([k, v]) => fieldVal[k] === v);
      }
      return false;
    });
    return this;
  }

  public like(col: string, pattern: string): this {
    const regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$');
    this.filters.push((r) => regex.test(String(r[col] ?? '')));
    return this;
  }

  public ilike(col: string, pattern: string): this {
    const regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    this.filters.push((r) => regex.test(String(r[col] ?? '')));
    return this;
  }

  public or(expression: string): this {
    // Simple parser for standard PostgREST format: "col1.eq.val1,col2.eq.val2"
    const clauses = expression.split(',').map((c) => c.trim());
    this.filters.push((r) => {
      return clauses.some((clause) => {
        const parts = clause.split('.');
        if (parts.length >= 3) {
          const [col, op, ...valParts] = parts;
          const val = valParts.join('.');
          const rowVal = String(r[col] ?? '');
          if (op === 'eq') return rowVal === val;
          if (op === 'neq') return rowVal !== val;
          if (op === 'ilike') return rowVal.toLowerCase().includes(val.replace(/%/g, '').toLowerCase());
          if (op === 'like') return rowVal.includes(val.replace(/%/g, ''));
        }
        return false;
      });
    });
    return this;
  }

  public filter(col: string, op: string, val: any): this {
    if (op === 'eq') return this.eq(col, val);
    if (op === 'neq') return this.neq(col, val);
    if (op === 'gt') return this.gt(col, val);
    if (op === 'gte') return this.gte(col, val);
    if (op === 'lt') return this.lt(col, val);
    if (op === 'lte') return this.lte(col, val);
    if (op === 'in') return this.in(col, val);
    if (op === 'is') return this.is(col, val);
    if (op === 'like') return this.like(col, val);
    if (op === 'ilike') return this.ilike(col, val);
    return this;
  }

  public order(col: string, { ascending = true, nullsFirst = false }: { ascending?: boolean; nullsFirst?: boolean } = {}): this {
    this._order = { col, ascending, nullsFirst };
    return this;
  }

  public range(from: number, to: number): this {
    this._range = [from, to];
    return this;
  }

  public limit(n: number): this {
    this._range = [0, n - 1];
    return this;
  }

  public single(): this {
    this._single = true;
    return this;
  }

  public maybeSingle(): this {
    this._maybeSingle = true;
    return this;
  }

  // ─── Write Operations ───────────────────────────────────────────────────────

  public insert(rowOrRows: any | any[]): this {
    this.mutationType = 'INSERT';
    this.mutationPayload = rowOrRows;
    return this;
  }

  public update(patch: any): this {
    this.mutationType = 'UPDATE';
    this.mutationPayload = patch;
    return this;
  }

  public upsert(rowOrRows: any | any[], options?: { onConflict?: string; ignoreDuplicates?: boolean }): this {
    this.mutationType = 'UPSERT';
    this.mutationPayload = rowOrRows;
    this.upsertOptions = options;
    return this;
  }

  public delete(): this {
    this.mutationType = 'DELETE';
    return this;
  }

  // ─── Execution Engine ──────────────────────────────────────────────────────

  public async _execute(): Promise<{ data: any; error: any; count?: number | null }> {
    // 1. Ensure IndexedDB storage is initialized
    await mockStore.init();

    // 2. Simulated Network Latency
    await simulateLatency();

    // 3. Simulated Network Error Injection
    const simulatedError = maybeSimulateError();
    if (simulatedError) {
      return simulatedError;
    }

    const currentRows = structuredClone(mockStore.getRows(this.table));
    const nowIso = new Date().toISOString();

    // ─── Mutation Handling ──────────────────────────────────────────────────
    if (this.mutationType === 'INSERT') {
      const items = Array.isArray(this.mutationPayload)
        ? this.mutationPayload
        : [this.mutationPayload];

      const inserted: any[] = [];
      for (const item of items) {
        const record = {
          ...item,
          id: item.id ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
          created_at: item.created_at ?? nowIso,
          updated_at: nowIso,
        };
        currentRows.push(record);
        inserted.push(record);
      }

      await mockStore.setRows(this.table, currentRows);
      const data = Array.isArray(this.mutationPayload) ? inserted : inserted[0];
      return { data, error: null };
    }

    if (this.mutationType === 'UPDATE') {
      const updated: any[] = [];
      const newRows = currentRows.map((r) => {
        if (this.filters.every((f) => f(r))) {
          const updatedRecord = {
            ...r,
            ...this.mutationPayload,
            updated_at: this.mutationPayload.updated_at ?? nowIso,
          };
          updated.push(updatedRecord);
          return updatedRecord;
        }
        return r;
      });

      await mockStore.setRows(this.table, newRows);
      return { data: updated, error: null };
    }

    if (this.mutationType === 'UPSERT') {
      const items = Array.isArray(this.mutationPayload)
        ? this.mutationPayload
        : [this.mutationPayload];

      const conflictKey = this.upsertOptions?.onConflict || 'id';
      const upserted: any[] = [];

      for (const item of items) {
        const keyVal = item[conflictKey] ?? item.id;
        const existingIdx = currentRows.findIndex((r) => (r[conflictKey] ?? r.id) === keyVal);

        if (existingIdx >= 0) {
          if (!this.upsertOptions?.ignoreDuplicates) {
            currentRows[existingIdx] = {
              ...currentRows[existingIdx],
              ...item,
              updated_at: nowIso,
            };
            upserted.push(currentRows[existingIdx]);
          }
        } else {
          const newRecord = {
            ...item,
            id: item.id ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
            created_at: item.created_at ?? nowIso,
            updated_at: nowIso,
          };
          currentRows.push(newRecord);
          upserted.push(newRecord);
        }
      }

      await mockStore.setRows(this.table, currentRows);
      const data = Array.isArray(this.mutationPayload) ? upserted : upserted[0];
      return { data, error: null };
    }

    if (this.mutationType === 'DELETE') {
      const remainingRows: any[] = [];
      const deletedRows: any[] = [];

      for (const r of currentRows) {
        if (this.filters.every((f) => f(r))) {
          deletedRows.push(r);
        } else {
          remainingRows.push(r);
        }
      }

      await mockStore.setRows(this.table, remainingRows);
      return { data: deletedRows, error: null };
    }

    // ─── Query (SELECT) Handling ────────────────────────────────────────────
    let rows = currentRows.filter((r) => this.filters.every((f) => f(r)));

    // Order
    if (this._order) {
      const { col, ascending } = this._order;
      rows.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return ascending ? 1 : -1;
        if (valB === null || valB === undefined) return ascending ? -1 : 1;
        return ascending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }

    // Range / Limit
    if (this._range) {
      const [from, to] = this._range;
      rows = rows.slice(from, to + 1);
    }

    // Projection
    if (this._select && this._select !== '*' && !this._select.includes('count')) {
      const cols = this._select.split(',').map((s) => s.trim());
      rows = rows.map((r) => {
        const projected: Record<string, any> = {};
        for (const col of cols) {
          projected[col] = r[col];
        }
        return projected;
      });
    }

    if (this._single) {
      if (rows.length === 0) {
        return {
          data: null,
          error: {
            message: 'JSON object requested, multiple (or no) rows returned',
            code: 'PGRST116',
            details: 'The result contains 0 rows',
          },
        };
      }
      return { data: rows[0], error: null };
    }

    if (this._maybeSingle) {
      return { data: rows[0] ?? null, error: null };
    }

    return { data: rows, error: null, count: rows.length };
  }

  // ─── Thenable Protocol (Awaits seamlessly) ──────────────────────────────────
  public then<TResult1 = { data: T; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._execute().then(onfulfilled, onrejected);
  }
}
