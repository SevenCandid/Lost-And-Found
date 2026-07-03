-- ============================================================
-- Mega Features Migration: Matches, Chat, Notifications
-- ============================================================

drop table if exists public.messages cascade;
drop table if exists public.chat_rooms cascade;
drop table if exists public.matches cascade;
drop table if exists public.notifications cascade;

-- 1. NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null, -- 'match_found', 'claim_update', 'new_message', etc.
  title text not null,
  message text not null,
  link text, -- optional path to navigate to
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- 2. CHAT ROOMS & MESSAGES
create table public.chat_rooms (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user1_id uuid references public.users(id) on delete cascade not null,
  user2_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (item_id, user1_id, user2_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_rooms enable row level security;
create policy "Users can view their chat rooms"
  on public.chat_rooms for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Users can create chat rooms"
  on public.chat_rooms for insert
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

alter table public.messages enable row level security;
create policy "Users can view messages in their rooms"
  on public.messages for select
  using (exists (
    select 1 from public.chat_rooms 
    where id = room_id and (user1_id = auth.uid() or user2_id = auth.uid())
  ));
create policy "Users can insert messages to their rooms"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.chat_rooms 
      where id = room_id and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

-- 3. MATCHES TABLE
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  lost_item_id uuid references public.items(id) on delete cascade not null,
  found_item_id uuid references public.items(id) on delete cascade not null,
  score integer not null default 0,
  status text not null default 'pending', -- 'pending', 'accepted', 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (lost_item_id, found_item_id)
);

alter table public.matches enable row level security;
create policy "Users can view matches related to their items"
  on public.matches for select
  using (
    exists (select 1 from public.items where id = lost_item_id and reporter_id = auth.uid()) or
    exists (select 1 from public.items where id = found_item_id and reporter_id = auth.uid())
  );
create policy "Users can update their matches"
  on public.matches for update
  using (
    exists (select 1 from public.items where id = lost_item_id and reporter_id = auth.uid()) or
    exists (select 1 from public.items where id = found_item_id and reporter_id = auth.uid())
  );

-- Enable realtime for messages and notifications
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

-- 4. MATCHING FUNCTION (Triggered on insert to items)
create or replace function public.find_item_matches()
returns trigger as $$
declare
  match_record record;
  lost_id uuid;
  found_id uuid;
begin
  -- Only look for active items
  if NEW.status != 'active' then
    return NEW;
  end if;

  -- Look for opposite type items in the same institution, category, within 30 days
  for match_record in 
    select id, reporter_id, title 
    from public.items 
    where items.institution_id = NEW.institution_id
      and items.status = 'active'
      and items.type != NEW.type
      and items.category = NEW.category
      and items.date_occurred >= (NEW.date_occurred - interval '30 days')
      and items.date_occurred <= (NEW.date_occurred + interval '30 days')
      and items.id != NEW.id
  loop
    -- Determine which is lost and which is found
    if NEW.type = 'lost' then
      lost_id := NEW.id;
      found_id := match_record.id;
    else
      lost_id := match_record.id;
      found_id := NEW.id;
    end if;

    -- Insert the match
    insert into public.matches (lost_item_id, found_item_id, score)
    values (lost_id, found_id, 100)
    on conflict do nothing;

    -- Create notifications for both users
    -- For the new item reporter
    insert into public.notifications (user_id, type, title, message, link)
    values (NEW.reporter_id, 'match_found', 'Potential Match Found!', 'We found a potential match for your item: ' || NEW.title, '/item/' || NEW.id);

    -- For the existing item reporter
    insert into public.notifications (user_id, type, title, message, link)
    values (match_record.reporter_id, 'match_found', 'Potential Match Found!', 'A new item might match your report: ' || match_record.title, '/item/' || match_record.id);
  end loop;

  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to run matching algorithm when a new item is inserted
drop trigger if exists on_item_inserted_match on public.items;
create trigger on_item_inserted_match
  after insert on public.items
  for each row execute function public.find_item_matches();
