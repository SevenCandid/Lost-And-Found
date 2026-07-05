import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnnzhsieareotqpdprtx.supabase.co'
const supabaseKey = 'sb_publishable_NdZ5bf0m1dl6joQvdqh57A_vrOjSe7g'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .eq('type', 'new_message')
    .eq('is_read', false)
  
  console.log('Unread Message Notifications:', notifications)
  if (notifError) console.error('Error:', notifError)

  const { data: rooms, error: roomError } = await supabase
    .from('chat_rooms')
    .select('id, user1_id, user2_id')
    .limit(5)
  
  console.log('Rooms:', rooms)
  if (roomError) console.error('Error:', roomError)
}

test()
