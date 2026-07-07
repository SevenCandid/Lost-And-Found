-- Add is_read column to messages
alter table public.messages add column is_read boolean default false not null;

-- Add UPDATE policy for messages
-- Only users who are participants in the room can update messages (e.g. mark as read)
create policy "Users can update messages in their rooms"
  on public.messages for update
  using (exists (
    select 1 from public.chat_rooms 
    where id = room_id and (user1_id = auth.uid() or user2_id = auth.uid())
  ));
