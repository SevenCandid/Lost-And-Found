-- Create a server-side trigger to notify the other chat participant whenever a new message is sent
-- This is more reliable than doing it in the frontend code

create or replace function public.notify_on_new_message()
returns trigger as $$
declare
  v_room public.chat_rooms%rowtype;
  v_sender_name text;
  v_recipient_id uuid;
begin
  -- Get the chat room details
  select * into v_room from public.chat_rooms where id = NEW.room_id;
  
  -- Determine recipient (the other user in the room)
  if v_room.user1_id = NEW.sender_id then
    v_recipient_id := v_room.user2_id;
  else
    v_recipient_id := v_room.user1_id;
  end if;

  -- Get sender name
  select full_name into v_sender_name from public.users where id = NEW.sender_id;

  -- Delete any existing unread notification for this room+recipient to avoid stacking
  -- (we'll re-insert with the latest count logic handled by the query)
  
  -- Insert a fresh notification
  insert into public.notifications (user_id, type, title, message, related_entity_id, related_entity_type, is_read)
  values (
    v_recipient_id,
    'new_message',
    'New Message',
    'New message from ' || coalesce(v_sender_name, 'Someone'),
    NEW.room_id,
    'chat_room',
    false
  );

  return NEW;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_new_message_notify on public.messages;

-- Create the trigger
create trigger on_new_message_notify
  after insert on public.messages
  for each row execute procedure public.notify_on_new_message();
