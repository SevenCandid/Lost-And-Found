-- ============================================================
-- Migration: Fix Mega Features Foreign Keys (profiles -> users)
-- ============================================================
-- PROBLEM:
--   The mega_features migration mistakenly referenced public.profiles 
--   instead of public.users for several tables. Since public.profiles 
--   doesn't exist or isn't used, this caused 23503 Foreign Key Violations 
--   (409 Conflict) when inserting notifications or chat messages.
--
-- FIX:
--   Drop the bad foreign key constraints and recreate them pointing to public.users.
-- ============================================================

-- 1. Fix notifications table
alter table public.notifications
  drop constraint if exists notifications_user_id_fkey;

alter table public.notifications
  add constraint notifications_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

-- 2. Fix chat_rooms table
alter table public.chat_rooms
  drop constraint if exists chat_rooms_user1_id_fkey,
  drop constraint if exists chat_rooms_user2_id_fkey;

alter table public.chat_rooms
  add constraint chat_rooms_user1_id_fkey
  foreign key (user1_id) references public.users(id) on delete cascade,
  add constraint chat_rooms_user2_id_fkey
  foreign key (user2_id) references public.users(id) on delete cascade;

-- 3. Fix messages table
alter table public.messages
  drop constraint if exists messages_sender_id_fkey;

alter table public.messages
  add constraint messages_sender_id_fkey
  foreign key (sender_id) references public.users(id) on delete cascade;
