import { initSupabase } from '@folio/shared'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = initSupabase(url, key)
