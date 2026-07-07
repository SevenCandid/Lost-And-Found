import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')));

const supabase = createClient(env.VITE_SUPABASE_URL.trim(), env.VITE_SUPABASE_ANON_KEY.trim());

async function check() {
  const { data: subs, error: subError } = await supabase.from('push_subscriptions').select('*');
  console.log('Subscriptions:', subs, subError);

  const { data: notifs, error: notifError } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Recent notifications:', notifs, notifError);
}

check();
