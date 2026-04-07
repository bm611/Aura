import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  _client = createClient(url, anonKey)
  return _client
}

export function getSupabase(): SupabaseClient {
  if (!_client) throw new Error('Supabase not initialized — call initSupabase() first')
  return _client
}
