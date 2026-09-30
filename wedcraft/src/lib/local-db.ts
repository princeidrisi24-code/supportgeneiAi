// WedCraft Local DB Store (Offline & Fallback Storage)
// Allows WedCraft to work seamlessly when Supabase is offline or unconfigured.

const STORAGE_PREFIX = 'wedcraft_tbl_';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

const memoryStore: Record<string, string> = {};

function storageGet(key: string): string | null {
  if (isBrowser()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  }
  return memoryStore[key] || null;
}

function storageSet(key: string, value: string): void {
  if (isBrowser()) {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStore[key] = value;
    }
  } else {
    memoryStore[key] = value;
  }
}

const MOCK_TASK_MARKERS = [
  "task-1-", "task-2-", "task-3-", "task-4-", "task-5-", "task-6-", "task-7-", "task-8-",
  "Finalize and book primary wedding venue",
  "Hire wedding photographer and cinematic videographer",
  "Draft guest list and collect contact details",
  "Schedule bridal lehenga and groom sherwani fittings",
  "Book DJ and entertainment for Sangeet night",
  "Conduct catering tasting and finalize multi-cuisine menu",
  "Launch WedCraft wedding website & generate digital RSVP link",
  "Review stage and floral mandap decor concepts",
];

const MOCK_BUDGET_MARKERS = [
  "Grand Heritage Palace Resort",
  "Royal Gourmet Catering Services",
  "Lumiere Wedding Stories",
  "Floral Fantasy Designers",
  "Heritage Couture Studio",
];

const MOCK_GUEST_MARKERS = [
  "Vikram & Ananya Sharma",
  "Rohan Kapoor",
  "Meera Patel",
  "Amit & Neha Verma",
];

const MOCK_VENDOR_MARKERS = [
  "Grand Heritage Palace Resort",
  "Lumiere Wedding Stories",
  "Royal Shutterbug Studio",
];

export function getLocalTable<T = any>(table: string): T[] {
  try {
    const raw = storageGet(STORAGE_PREFIX + table);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let needsSave = false;
        let cleaned = parsed;

        if (table === 'tasks') {
          cleaned = parsed.filter((t: any) => {
            if (!t) return false;
            if (typeof t.id === 'string' && t.id.startsWith('task-')) return false;
            if (MOCK_TASK_MARKERS.some(m => t.text?.includes(m) || t.id?.includes(m))) return false;
            return true;
          });
          if (cleaned.length !== parsed.length) needsSave = true;
        } else if (table === 'budget_items') {
          cleaned = parsed.filter((b: any) => {
            if (!b) return false;
            if (typeof b.id === 'string' && b.id.startsWith('b-')) return false;
            if (MOCK_BUDGET_MARKERS.some(m => b.vendor_name?.includes(m) || b.id?.includes(m))) return false;
            return true;
          });
          if (cleaned.length !== parsed.length) needsSave = true;
        } else if (table === 'guests') {
          cleaned = parsed.filter((g: any) => {
            if (!g) return false;
            if (typeof g.id === 'string' && g.id.startsWith('g-')) return false;
            if (MOCK_GUEST_MARKERS.some(m => g.name?.includes(m) || g.id?.includes(m))) return false;
            return true;
          });
          if (cleaned.length !== parsed.length) needsSave = true;
        } else if (table === 'vendors') {
          cleaned = parsed.filter((v: any) => {
            if (!v) return false;
            if (typeof v.id === 'string' && v.id.startsWith('v-')) return false;
            if (MOCK_VENDOR_MARKERS.some(m => v.name?.includes(m) || v.id?.includes(m))) return false;
            return true;
          });
          if (cleaned.length !== parsed.length) needsSave = true;
        } else if (table === 'weddings') {
          cleaned = parsed.map((w: any) => {
            if (!w) return w;
            const copy = { ...w };
            if (copy.venue === 'Grand Heritage Venue' || copy.venue === 'Grand Heritage Palace Resort') {
              copy.venue = '';
              needsSave = true;
            }
            if (copy.city === 'Jaipur') {
              copy.city = '';
              needsSave = true;
            }
            if (copy.total_budget === 2000000 || copy.total_budget === 2500000) {
              copy.total_budget = 0;
              needsSave = true;
            }
            return copy;
          });
        }

        if (needsSave) {
          storageSet(STORAGE_PREFIX + table, JSON.stringify(cleaned));
        }

        return cleaned;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function setLocalTable<T = any>(table: string, rows: T[]): void {
  try {
    storageSet(STORAGE_PREFIX + table, JSON.stringify(rows));
  } catch {
    // ignore
  }
}

export function localSelect<T = any>(
  table: string,
  eqFilters: [string, any][] = [],
  order?: { column: string; ascending: boolean },
  limit?: number,
  single?: boolean,
  _weddingId?: string
): { data: any; error: any } {
  let rows = getLocalTable<T>(table);

  // Apply eq filters
  for (const [key, val] of eqFilters) {
    rows = rows.filter((r: any) => {
      if (typeof val === 'boolean') {
        return Boolean(r[key]) === val;
      }
      return String(r[key]) === String(val);
    });
  }

  // Apply order
  if (order) {
    rows.sort((a: any, b: any) => {
      const va = a[order.column];
      const vb = b[order.column];
      if (va === vb) return 0;
      if (order.ascending) return va > vb ? 1 : -1;
      return va < vb ? 1 : -1;
    });
  }

  if (single) {
    return { data: rows.length > 0 ? rows[0] : null, error: rows.length > 0 ? null : { code: 'PGRST116', message: 'No rows' } };
  }

  if (limit && limit > 0) {
    rows = rows.slice(0, limit);
  }

  return { data: rows, error: null };
}

export function localInsert<T = any>(
  table: string,
  itemOrItems: any
): { data: any; error: any } {
  const current = getLocalTable<T>(table);
  const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

  const prepared = items.map((it) => ({
    id: it.id || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: it.created_at || new Date().toISOString(),
    ...it,
  }));

  const updated = [...current, ...prepared];
  setLocalTable(table, updated);

  return { data: Array.isArray(itemOrItems) ? prepared : prepared[0], error: null };
}

export function localUpdate<T = any>(
  table: string,
  updates: any,
  eqFilters: [string, any][] = []
): { data: any; error: any } {
  const current = getLocalTable<T>(table);
  let updatedRows: any[] = [];

  const updated = current.map((row: any) => {
    const matches = eqFilters.every(([key, val]) => String(row[key]) === String(val));
    if (matches) {
      const newRow = { ...row, ...updates };
      updatedRows.push(newRow);
      return newRow;
    }
    return row;
  });

  setLocalTable(table, updated);
  return { data: updatedRows.length === 1 ? updatedRows[0] : updatedRows, error: null };
}

export function localDelete<T = any>(
  table: string,
  eqFilters: [string, any][] = []
): { data: any; error: any } {
  const current = getLocalTable<T>(table);
  const filtered = current.filter((row: any) => {
    return !eqFilters.every(([key, val]) => String(row[key]) === String(val));
  });

  setLocalTable(table, filtered);
  return { data: null, error: null };
}

export function localUpsert<T = any>(
  table: string,
  itemOrItems: any,
  conflictCol: string = 'id'
): { data: any; error: any } {
  const current = getLocalTable<T>(table);
  const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

  let next = [...current];
  const result: any[] = [];

  for (const it of items) {
    const keyVal = it[conflictCol];
    const idx = next.findIndex((r: any) => String(r[conflictCol]) === String(keyVal));
    if (idx >= 0) {
      next[idx] = { ...next[idx], ...it };
      result.push(next[idx]);
    } else {
      const row = {
        id: it.id || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        created_at: it.created_at || new Date().toISOString(),
        ...it,
      };
      next.push(row);
      result.push(row);
    }
  }

  setLocalTable(table, next);
  return { data: Array.isArray(itemOrItems) ? result : result[0], error: null };
}
