import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './src/types/supabase'

const supabaseUrl = 'https://cnnzhsieareotqpdprtx.supabase.co'
const supabaseAnonKey = 'key'

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) as SupabaseClient<Database>

async function test() {
  await supabase.from('users').update({ verification_status: 'verified' }).eq('id', '123');
}
