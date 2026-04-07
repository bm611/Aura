/**
 * @folio/shared — platform-agnostic code shared between web, desktop, and mobile.
 */

export * from './types'
export * from './utils/tree'
export * from './utils/noteMeta'
export { initSupabase, getSupabase } from './lib/supabase'
export * from './lib/notesDb'
export * from './utils/aiChat'
