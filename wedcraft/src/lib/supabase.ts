import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import * as localDb from './local-db';

export function getSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('wedcraft_custom_supabase_url');
    const customKey = localStorage.getItem('wedcraft_custom_supabase_key');
    if (customUrl && customKey) {
      return { url: customUrl.trim(), key: customKey.trim(), isCustom: true };
    }
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    isCustom: false,
  };
}

const creds = getSupabaseCredentials();
export const rawSupabase = createClient<Database>(creds.url, creds.key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function isLiveSupabaseConfigured(): boolean {
  const current = getSupabaseCredentials();
  if (!current.url || !current.key) return false;
  if (
    current.url.includes('placeholder') ||
    current.url.includes('tyzzgdrwotbexpnxknhm') ||
    current.key.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isLiveSupabaseConfigured()) {
    return { ok: false, message: 'Current Supabase URL is placeholder or unreachable.' };
  }
  const current = getSupabaseCredentials();
  try {
    const res = await fetch(`${current.url}/auth/v1/health`, {
      headers: { apikey: current.key },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return { ok: true, message: 'Connected to Supabase successfully!' };
    }
    return { ok: false, message: `Supabase status: ${res.status} ${res.statusText}` };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : 'Cannot reach Supabase host' };
  }
}

function createSmartQueryBuilder(table: string) {
  let realBuilder: any = rawSupabase.from(table as any);
  let opType: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  let hasExplicitMutation = false;
  let payload: any = null;
  const eqFilters: [string, any][] = [];
  let orderConfig: { column: string; ascending: boolean } | undefined;
  let limitCount: number | undefined;
  let isSingle = false;
  let conflictCol = 'id';

  const builder: any = {
    select(columns?: string) {
      if (!hasExplicitMutation) {
        opType = 'select';
      }
      try {
        realBuilder = realBuilder.select(columns);
      } catch {
        // ignore
      }
      return builder;
    },
    insert(values: any) {
      opType = 'insert';
      hasExplicitMutation = true;
      payload = values;
      try {
        realBuilder = realBuilder.insert(values);
      } catch {
        // ignore
      }
      return builder;
    },
    update(values: any) {
      opType = 'update';
      hasExplicitMutation = true;
      payload = values;
      try {
        realBuilder = realBuilder.update(values);
      } catch {
        // ignore
      }
      return builder;
    },
    delete() {
      opType = 'delete';
      hasExplicitMutation = true;
      try {
        realBuilder = realBuilder.delete();
      } catch {
        // ignore
      }
      return builder;
    },
    upsert(values: any, options?: { onConflict?: string }) {
      opType = 'upsert';
      hasExplicitMutation = true;
      payload = values;
      if (options?.onConflict) conflictCol = options.onConflict;
      try {
        realBuilder = realBuilder.upsert(values, options);
      } catch {
        // ignore
      }
      return builder;
    },
    eq(column: string, value: any) {
      eqFilters.push([column, value]);
      try {
        realBuilder = realBuilder.eq(column, value);
      } catch {
        // ignore
      }
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      orderConfig = { column, ascending: options?.ascending !== false };
      try {
        realBuilder = realBuilder.order(column, options);
      } catch {
        // ignore
      }
      return builder;
    },
    limit(count: number) {
      limitCount = count;
      try {
        realBuilder = realBuilder.limit(count);
      } catch {
        // ignore
      }
      return builder;
    },
    single() {
      isSingle = true;
      try {
        realBuilder = realBuilder.single();
      } catch {
        // ignore
      }
      return builder;
    },
    then(onFulfilled?: any, onRejected?: any) {
      return (async () => {
        const isOffline = !isLiveSupabaseConfigured();

        // Attempt real Supabase query first if live Supabase is configured
        if (!isOffline) {
          try {
            const res = await Promise.race([
              realBuilder,
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
            ]);

            const errStr = (res?.error?.message || '').toLowerCase();
            const isNetworkError =
              errStr.includes('fetch') ||
              errStr.includes('network') ||
              errStr.includes('load failed') ||
              errStr.includes('failed to load') ||
              errStr.includes('failed to fetch') ||
              res?.error?.status === 0;

            if (!isNetworkError && res && (res.data !== null || !res.error)) {
              return res;
            }
          } catch {
            // Network failure or DNS NXDOMAIN
          }
        }

        // Extract weddingId if available in eq filters
        const weddingFilter = eqFilters.find(([k]) => k === 'wedding_id');
        const weddingId = weddingFilter ? weddingFilter[1] : undefined;

        // Fallback to local persistent storage
        if (opType === 'select') {
          return localDb.localSelect(table, eqFilters, orderConfig, limitCount, isSingle, weddingId);
        } else if (opType === 'insert') {
          const res = localDb.localInsert(table, payload);
          if (isSingle) {
            return {
              data: Array.isArray(res.data) ? res.data[0] || null : res.data,
              error: null,
            };
          }
          return res;
        } else if (opType === 'update') {
          const res = localDb.localUpdate(table, payload, eqFilters);
          if (isSingle) {
            return {
              data: Array.isArray(res.data) ? res.data[0] || null : res.data,
              error: null,
            };
          }
          return res;
        } else if (opType === 'delete') {
          return localDb.localDelete(table, eqFilters);
        } else if (opType === 'upsert') {
          const res = localDb.localUpsert(table, payload, conflictCol);
          if (isSingle) {
            return {
              data: Array.isArray(res.data) ? res.data[0] || null : res.data,
              error: null,
            };
          }
          return res;
        }
        return { data: null, error: null };
      })().then(onFulfilled, onRejected);
    },
  };

  return builder;
}

export const supabase: any = {
  auth: rawSupabase.auth,
  from: (table: string) => createSmartQueryBuilder(table),
  raw: rawSupabase,
};
