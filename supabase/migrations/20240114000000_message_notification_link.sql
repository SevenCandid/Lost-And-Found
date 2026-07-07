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

  -- Delete ALL existing unread notifications for this room+recipient first
  delete from public.notifications 
  where user_id = v_recipient_id 
    and type = 'new_message'
    and related_entity_id = NEW.room_id
    and is_read = false;

  -- Insert a fresh single notification WITH the chat link
  insert into public.notifications (user_id, type, title, message, link, related_entity_id, related_entity_type, is_read)
  values (
    v_recipient_id,
    'new_message',
    'New Message',
    'New message from ' || coalesce(v_sender_name, 'Someone'),
    '/messages/' || NEW.room_id,
    NEW.room_id,
    'chat_room',
    false
  );

  return NEW;
end;
$$ language plpgsql security definer;
