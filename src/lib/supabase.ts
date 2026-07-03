import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use `any` for the client generic to bypass strict schema inference bugs in the current version of supabase-js.
// We still use `Database` type for manual Row type extraction in components.
export const supabase = createClient<any, 'public', any>(supabaseUrl, supabaseAnonKey)
