/**
 * Supabase client helper (env-safe).
 * Replace placeholders in .env.local as per apps/scraping-hub/.env.example.
 */

import { createClient } from "@supabase/supabase-js";
// Temporary until deps installed
declare const process: any;

let _supabase: any = null;

export function getSupabaseClient() {
  if (_supabase) return _supabase;

  const url = process?.env?.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // return a no-op mock client to keep UI functional before env is set and deps installed
    _supabase = {
      from() {
        return {
          select() { return this; },
          order() { return this; },
          limit() { return this; },
          insert: async () => ({ data: null, error: null }),
          update: async () => ({ data: null, error: null }),
          delete: async () => ({ data: null, error: null }),
          then: function(resolve: any) { resolve({ data: [], error: null }); }
        };
      },
      auth: {
        getUser: async () => ({ data: null, error: null })
      }
    };
    return _supabase;
  }

  _supabase = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return _supabase;
}