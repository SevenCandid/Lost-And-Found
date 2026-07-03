-- ============================================================
-- Lost & Found Network — Production Database Migration
-- Version: 1.0.0
-- Description: Multi-tenant schema with RLS, triggers, indexes
-- Run in Supabase SQL Editor
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: CLEAN SLATE (Idempotent teardown)
-- ============================================================

-- Drop triggers first
drop trigger if exists on_items_activity_log on public.items;
drop trigger if exists on_claims_activity_log on public.claims;
drop trigger if exists on_claim_notify_reporter on public.claims;
drop trigger if exists on_claim_resolution_notify on public.claims;
drop trigger if exists enforce_no_self_claim on public.claims;
drop trigger if exists set_updated_at_users on public.users;
drop trigger if exists set_updated_at_items on public.items;
drop trigger if exists set_updated_at_claims on public.claims;
drop trigger if exists set_updated_at_institutions on public.institutions;
drop trigger if exists on_user_verification_notify on public.users;
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_set_updated_at() cascade;
drop function if exists public.log_activity() cascade;
drop function if exists public.notify_reporter_on_claim() cascade;
drop function if exists public.notify_claimer_on_resolution() cascade;
drop function if exists public.notify_user_on_verification() cascade;
drop function if exists public.prevent_self_claim() cascade;
drop function if exists public.my_institution_id() cascade;
drop function if exists public.my_role() cascade;
drop function if exists public.is_verified() cascade;

-- Drop tables in dependency order
drop table if exists public.activity_logs cascade;
drop table if exists public.notifications cascade;
drop table if exists public.claims cascade;
drop table if exists public.items cascade;
drop table if exists public.users cascade;
drop table if exists public.institutions cascade;

-- Drop custom types
drop type if exists public.user_role cascade;
drop type if exists public.verification_status cascade;
drop type if exists public.item_type cascade;
drop type if exists public.item_status cascade;
drop type if exists public.claim_status cascade;
drop type if exists public.notification_type cascade;

-- ============================================================
-- SECTION 2: EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";       -- For full-text fuzzy search
create extension if not exists "btree_gin";     -- For composite GIN indexes

-- ============================================================
-- SECTION 3: CUSTOM ENUM TYPES
-- ============================================================

create type public.user_role as enum ('student', 'admin', 'superadmin');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.item_type as enum ('lost', 'found');
create type public.item_status as enum ('active', 'claimed', 'resolved', 'archived');
create type public.claim_status as enum ('pending', 'approved', 'rejected');
create type public.notification_type as enum (
  'claim_received',
  'claim_approved',
  'claim_rejected',
  'item_verified',
  'account_verified',
  'account_rejected',
  'system'
);

-- ============================================================
-- SECTION 4: TABLES
-- ============================================================

-- ─────────────────────────────────────────
-- 4.1 INSTITUTIONS (Root tenant table)
-- ─────────────────────────────────────────
create table public.institutions (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  short_name      text not null,                        -- e.g. "UENR"
  domain          text unique,                          -- e.g. "uenr.edu.gh"
  logo_url        text,
  address         text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.institutions is
  'Root tenant table. Each university/college is an institution.';

-- ─────────────────────────────────────────
-- 4.2 USERS (Student & Staff Profiles)
-- ─────────────────────────────────────────
create table public.users (
  id                  uuid primary key references auth.users(id) on delete cascade,
  institution_id      uuid not null references public.institutions(id) on delete restrict,
  email               text not null,
  full_name           text not null,
  index_number        text not null,
  department          text not null,
  level               text not null,
  phone               text,
  avatar_url          text,
  id_photo_url        text,                             -- Student ID photo for verification
  role                public.user_role not null default 'student',
  verification_status public.verification_status not null default 'pending',
  rejection_reason    text,                             -- Set when status = 'rejected'
  is_active           boolean not null default true,
  last_seen_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Enforce unique index numbers per institution
  unique (institution_id, index_number)
);

comment on table public.users is
  'Student and staff profiles. Linked 1-to-1 with auth.users.';
comment on column public.users.id_photo_url is
  'URL to private Supabase Storage object used for identity verification.';

-- ─────────────────────────────────────────
-- 4.3 ITEMS (Lost & Found Reports)
-- ─────────────────────────────────────────
create table public.items (
  id              uuid primary key default uuid_generate_v4(),
  institution_id  uuid not null references public.institutions(id) on delete restrict,
  reporter_id     uuid not null references public.users(id) on delete restrict,
  type            public.item_type not null,
  title           text not null,
  description     text,
  category        text not null,
  location        text not null,
  date_occurred   timestamptz not null default now(),   -- When item was lost/found
  image_url       text,
  status          public.item_status not null default 'active',
  is_verified     boolean not null default false,       -- Admin-verified report
  views           integer not null default 0,
  meta            jsonb default '{}',                   -- Extensible metadata
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Enforced constraints
  constraint title_min_length check (char_length(title) >= 3),
  constraint description_max_length check (char_length(description) <= 2000)
);

comment on table public.items is
  'All lost and found item reports, scoped to an institution.';
comment on column public.items.meta is
  'Flexible JSONB column for storing category-specific attributes (e.g. color, brand, serial number).';

-- ─────────────────────────────────────────
-- 4.4 CLAIMS
-- ─────────────────────────────────────────
create table public.claims (
  id                  uuid primary key default uuid_generate_v4(),
  item_id             uuid not null references public.items(id) on delete cascade,
  claimer_id          uuid not null references public.users(id) on delete restrict,
  proof_description   text not null,
  status              public.claim_status not null default 'pending',
  admin_note          text,                             -- Admin can leave a note on resolution
  resolved_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Prevent duplicate claims from same user for same item
  unique (item_id, claimer_id),

  -- proof must be meaningful
  -- NOTE: self-claim prevention is enforced via trigger (PostgreSQL
  -- does not allow subqueries inside CHECK constraints)
  constraint proof_min_length check (char_length(proof_description) >= 10)
);

comment on table public.claims is
  'Ownership claims submitted by users on found items.';

-- ─────────────────────────────────────────
-- 4.5 NOTIFICATIONS
-- ─────────────────────────────────────────
create table public.notifications (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  type                public.notification_type not null,
  title               text not null,
  message             text not null,
  is_read             boolean not null default false,
  related_entity_id   uuid,                             -- Generic FK: item_id or claim_id
  related_entity_type text,                             -- 'item' | 'claim'
  created_at          timestamptz not null default now()
);

comment on table public.notifications is
  'In-app push notification records. Trigger-generated.';

-- ─────────────────────────────────────────
-- 4.6 ACTIVITY LOGS (Immutable audit trail)
-- ─────────────────────────────────────────
create table public.activity_logs (
  id              bigserial primary key,               -- bigserial for efficiency at scale
  institution_id  uuid references public.institutions(id) on delete set null,
  user_id         uuid references public.users(id) on delete set null,
  action_type     text not null,                        -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', etc.
  entity_table    text not null,                        -- Table name the action occurred on
  entity_id       uuid,                                 -- Row ID of affected entity
  old_data        jsonb,                                -- Previous row state (for UPDATE/DELETE)
  new_data        jsonb,                                -- New row state (for INSERT/UPDATE)
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz not null default now()
);

comment on table public.activity_logs is
  'Immutable audit log. Auto-populated by triggers. Never update or delete rows.';

-- ============================================================
-- SECTION 5: PERFORMANCE INDEXES
-- ============================================================

-- Institutions
create index idx_institutions_active on public.institutions (is_active) where is_active = true;

-- Users
create index idx_users_institution on public.users (institution_id);
create index idx_users_email on public.users (email);
create index idx_users_index_number on public.users (institution_id, index_number);
create index idx_users_verification on public.users (verification_status) where verification_status = 'pending';
create index idx_users_role on public.users (role);

-- Items — core query indexes
create index idx_items_institution on public.items (institution_id);
create index idx_items_reporter on public.items (reporter_id);
create index idx_items_status on public.items (institution_id, status);
create index idx_items_type on public.items (institution_id, type);
create index idx_items_category on public.items (institution_id, category);
create index idx_items_created_at on public.items (created_at desc);
-- Partial index: only active items (most common query)
create index idx_items_active on public.items (institution_id, created_at desc) where status = 'active';
-- Full-text search across title, description and location
create index idx_items_fts on public.items using gin (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
);
-- JSONB index for meta column queries
create index idx_items_meta on public.items using gin (meta);

-- Claims
create index idx_claims_item on public.claims (item_id);
create index idx_claims_claimer on public.claims (claimer_id);
create index idx_claims_status on public.claims (status) where status = 'pending';

-- Notifications
create index idx_notifications_user on public.notifications (user_id, created_at desc);
create index idx_notifications_unread on public.notifications (user_id) where is_read = false;

-- Activity Logs
create index idx_activity_institution on public.activity_logs (institution_id, created_at desc);
create index idx_activity_user on public.activity_logs (user_id, created_at desc);
create index idx_activity_entity on public.activity_logs (entity_table, entity_id);
-- Partial JSONB index for new_data queries
create index idx_activity_new_data on public.activity_logs using gin (new_data) where new_data is not null;

-- ============================================================
-- SECTION 6: FUNCTIONS & TRIGGERS
-- ============================================================

-- ─────────────────────────────────────────
-- 6.1 Auto-update `updated_at` timestamp
-- ─────────────────────────────────────────
create or replace function public.handle_set_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_institutions
  before update on public.institutions
  for each row execute procedure public.handle_set_updated_at();

create trigger set_updated_at_users
  before update on public.users
  for each row execute procedure public.handle_set_updated_at();

create trigger set_updated_at_items
  before update on public.items
  for each row execute procedure public.handle_set_updated_at();

create trigger set_updated_at_claims
  before update on public.claims
  for each row execute procedure public.handle_set_updated_at();

-- ─────────────────────────────────────────
-- 6.2 Prevent self-claims via BEFORE INSERT trigger
-- (PostgreSQL CHECK constraints cannot use subqueries)
-- ─────────────────────────────────────────
create or replace function public.prevent_self_claim()
returns trigger language plpgsql security definer as $$
declare
  v_reporter_id uuid;
begin
  select reporter_id into v_reporter_id
  from public.items
  where id = new.item_id;

  if v_reporter_id = new.claimer_id then
    raise exception 'You cannot claim an item you reported yourself.'
      using errcode = 'check_violation', constraint = 'no_self_claim';
  end if;

  return new;
end;
$$;

create trigger enforce_no_self_claim
  before insert on public.claims
  for each row execute procedure public.prevent_self_claim();

-- ─────────────────────────────────────────
-- 6.3 Auto-create user profile on auth signup
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, institution_id, email, full_name, index_number, department, level)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'institution_id')::uuid,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'index_number',
    new.raw_user_meta_data ->> 'department',
    new.raw_user_meta_data ->> 'level'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 6.4 Activity Log Trigger (Items & Claims)
-- ─────────────────────────────────────────
create or replace function public.log_activity()
returns trigger language plpgsql security definer as $$
declare
  v_institution_id uuid;
  v_user_id uuid;
  v_entity_id uuid;
begin
  if TG_OP = 'DELETE' then
    v_entity_id = old.id;
    if TG_TABLE_NAME = 'items' then
      v_institution_id = old.institution_id;
      v_user_id = old.reporter_id;
    elsif TG_TABLE_NAME = 'claims' then
      v_user_id = old.claimer_id;
      select institution_id into v_institution_id from public.items where id = old.item_id;
    end if;
  else
    v_entity_id = new.id;
    if TG_TABLE_NAME = 'items' then
      v_institution_id = new.institution_id;
      v_user_id = new.reporter_id;
    elsif TG_TABLE_NAME = 'claims' then
      v_user_id = new.claimer_id;
      select institution_id into v_institution_id from public.items where id = new.item_id;
    end if;
  end if;

  insert into public.activity_logs (institution_id, user_id, action_type, entity_table, entity_id, old_data, new_data)
  values (
    v_institution_id,
    v_user_id,
    TG_OP,
    TG_TABLE_NAME,
    v_entity_id,
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return null;
end;
$$;

create trigger on_items_activity_log
  after insert or update or delete on public.items
  for each row execute procedure public.log_activity();

create trigger on_claims_activity_log
  after insert or update or delete on public.claims
  for each row execute procedure public.log_activity();

-- ─────────────────────────────────────────
-- 6.5 Auto-notify reporter when a claim is submitted
-- ─────────────────────────────────────────
create or replace function public.notify_reporter_on_claim()
returns trigger language plpgsql security definer as $$
declare
  v_reporter_id uuid;
  v_item_title text;
  v_claimer_name text;
begin
  select reporter_id, title into v_reporter_id, v_item_title
  from public.items where id = new.item_id;

  select full_name into v_claimer_name
  from public.users where id = new.claimer_id;

  insert into public.notifications (user_id, type, title, message, related_entity_id, related_entity_type)
  values (
    v_reporter_id,
    'claim_received',
    'New Claim on Your Item',
    v_claimer_name || ' has submitted a claim for "' || v_item_title || '".',
    new.id,
    'claim'
  );
  return null;
end;
$$;

create trigger on_claim_notify_reporter
  after insert on public.claims
  for each row execute procedure public.notify_reporter_on_claim();

-- ─────────────────────────────────────────
-- 6.6 Auto-notify claimer when claim is resolved
-- ─────────────────────────────────────────
create or replace function public.notify_claimer_on_resolution()
returns trigger language plpgsql security definer as $$
declare
  v_item_title text;
begin
  -- Only fire when status changes from 'pending' to 'approved' or 'rejected'
  if old.status = 'pending' and new.status in ('approved', 'rejected') then
    select title into v_item_title from public.items where id = new.item_id;

    insert into public.notifications (user_id, type, title, message, related_entity_id, related_entity_type)
    values (
      new.claimer_id,
      case when new.status = 'approved' then 'claim_approved'::public.notification_type
           else 'claim_rejected'::public.notification_type end,
      case when new.status = 'approved' then 'Claim Approved!' else 'Claim Rejected' end,
      case when new.status = 'approved'
           then 'Your claim for "' || v_item_title || '" has been approved. Please contact the finder.'
           else 'Your claim for "' || v_item_title || '" was rejected. ' || coalesce(new.admin_note, '') end,
      new.id,
      'claim'
    );
  end if;
  return null;
end;
$$;

create trigger on_claim_resolution_notify
  after update on public.claims
  for each row execute procedure public.notify_claimer_on_resolution();

-- ─────────────────────────────────────────
-- 6.7 Auto-notify user when account is verified or rejected
-- ─────────────────────────────────────────
create or replace function public.notify_user_on_verification()
returns trigger language plpgsql security definer as $$
begin
  if old.verification_status = 'pending' and new.verification_status in ('verified', 'rejected') then
    insert into public.notifications (user_id, type, title, message)
    values (
      new.id,
      case when new.verification_status = 'verified'
           then 'account_verified'::public.notification_type
           else 'account_rejected'::public.notification_type end,
      case when new.verification_status = 'verified' then 'Identity Verified!' else 'Verification Failed' end,
      case when new.verification_status = 'verified'
           then 'Your student identity has been verified. You can now report and claim items!'
           else 'Your verification was rejected. Reason: ' || coalesce(new.rejection_reason, 'Please re-submit a clearer ID photo.') end
    );
  end if;
  return null;
end;
$$;

create trigger on_user_verification_notify
  after update on public.users
  for each row execute procedure public.notify_user_on_verification();

-- ============================================================
-- SECTION 7: ROW LEVEL SECURITY
-- ============================================================

alter table public.institutions enable row level security;
alter table public.users enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- Helper: current user's institution
create or replace function public.my_institution_id()
returns uuid language sql stable security definer as $$
  select institution_id from public.users where id = auth.uid()
$$;

-- Helper: current user's role
create or replace function public.my_role()
returns public.user_role language sql stable security definer as $$
  select role from public.users where id = auth.uid()
$$;

-- Helper: is current user verified?
create or replace function public.is_verified()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and verification_status = 'verified'
  )
$$;

-- ─────────────────────────────────────────
-- INSTITUTIONS Policies
-- ─────────────────────────────────────────
create policy "Institutions are publicly viewable"
  on public.institutions for select
  using (is_active = true);

-- ─────────────────────────────────────────
-- USERS Policies
-- ─────────────────────────────────────────
create policy "Users can view profiles in same institution"
  on public.users for select
  using (institution_id = public.my_institution_id() or auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (
    role = (select role from public.users where id = auth.uid()) and
    verification_status = (select verification_status from public.users where id = auth.uid())
  );

create policy "Admins can update users in their institution"
  on public.users for update
  using (
    institution_id = public.my_institution_id() and
    public.my_role() in ('admin', 'superadmin')
  );

-- ─────────────────────────────────────────
-- ITEMS Policies
-- ─────────────────────────────────────────
create policy "Active items are publicly viewable"
  on public.items for select
  using (status = 'active' or reporter_id = auth.uid());

create policy "Verified users can create items"
  on public.items for insert
  with check (
    auth.uid() = reporter_id and
    public.is_verified()
  );

create policy "Reporters can update their own active items"
  on public.items for update
  using (auth.uid() = reporter_id and status = 'active');

create policy "Admins can update any item in their institution"
  on public.items for update
  using (
    institution_id = public.my_institution_id() and
    public.my_role() in ('admin', 'superadmin')
  );

-- ─────────────────────────────────────────
-- CLAIMS Policies
-- ─────────────────────────────────────────
create policy "Users can view their own claims or claims on their items"
  on public.claims for select
  using (
    claimer_id = auth.uid() or
    exists (select 1 from public.items where id = item_id and reporter_id = auth.uid())
  );

create policy "Admins can view all claims in their institution"
  on public.claims for select
  using (
    public.my_role() in ('admin', 'superadmin') and
    exists (
      select 1 from public.items i
      join public.users u on u.id = auth.uid()
      where i.id = item_id and i.institution_id = u.institution_id
    )
  );

create policy "Verified users can submit claims"
  on public.claims for insert
  with check (
    auth.uid() = claimer_id and
    public.is_verified()
  );

create policy "Reporters and admins can resolve claims"
  on public.claims for update
  using (
    exists (select 1 from public.items where id = item_id and reporter_id = auth.uid()) or
    public.my_role() in ('admin', 'superadmin')
  );

-- ─────────────────────────────────────────
-- NOTIFICATIONS Policies
-- ─────────────────────────────────────────
create policy "Users can view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can mark their notifications as read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────
-- ACTIVITY LOGS Policies
-- ─────────────────────────────────────────
create policy "Admins can view activity logs for their institution"
  on public.activity_logs for select
  using (
    institution_id = public.my_institution_id() and
    public.my_role() in ('admin', 'superadmin')
  );

-- ============================================================
-- SECTION 8: STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student_ids',
  'student_ids',
  false,                                                -- Private: only accessible via signed URLs
  5242880,                                              -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item_images',
  'item_images',
  true,                                                 -- Public: CDN-served
  10485760,                                             -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
) on conflict (id) do nothing;

-- Drop existing storage policies to avoid conflicts on re-run
drop policy if exists "Anyone can view item images" on storage.objects;
drop policy if exists "Verified users can upload item images" on storage.objects;
drop policy if exists "Users can upload their own student ID" on storage.objects;
drop policy if exists "Admins can view student IDs in their institution" on storage.objects;
drop policy if exists "Users can view their own student ID" on storage.objects;

-- item_images: Public readable
create policy "Anyone can view item images"
  on storage.objects for select
  using (bucket_id = 'item_images');

-- item_images: Only verified users can upload
create policy "Verified users can upload item images"
  on storage.objects for insert
  with check (
    bucket_id = 'item_images' and
    auth.role() = 'authenticated' and
    public.is_verified()
  );

-- student_ids: Users upload under their own UID folder
create policy "Users can upload their own student ID"
  on storage.objects for insert
  with check (
    bucket_id = 'student_ids' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- student_ids: Users can view their own ID
create policy "Users can view their own student ID"
  on storage.objects for select
  using (
    bucket_id = 'student_ids' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- student_ids: Admins can view all IDs in their institution
create policy "Admins can view student IDs in their institution"
  on storage.objects for select
  using (
    bucket_id = 'student_ids' and
    public.my_role() in ('admin', 'superadmin')
  );

-- ============================================================
-- SECTION 9: SEED DATA
-- ============================================================

-- Insert UENR as the default institution
insert into public.institutions (id, name, short_name, domain, address)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'University of Energy and Natural Resources',
  'UENR',
  'uenr.edu.gh',
  'Sunyani, Bono Region, Ghana'
) on conflict (id) do nothing;

-- ============================================================
-- SECTION 10: GRANT PERMISSIONS
-- ============================================================

grant usage on schema public to anon, authenticated;

-- Anonymous: public read-only
grant select on public.institutions to anon;
grant select on public.items to anon;

-- Authenticated users
grant select, insert, update on public.users to authenticated;
grant select, insert, update on public.items to authenticated;
grant select, insert, update on public.claims to authenticated;
grant select, update on public.notifications to authenticated;
grant select on public.activity_logs to authenticated;
grant select on public.institutions to authenticated;

-- Sequence for bigserial PK
grant usage on sequence public.activity_logs_id_seq to authenticated;

COMMIT;

-- ============================================================
-- SECTION 11: POST-MIGRATION VERIFICATION QUERIES
-- Uncomment and run these after migration to confirm setup
-- ============================================================

-- select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;
-- select routine_name from information_schema.routines where routine_schema = 'public' and routine_type = 'FUNCTION';
-- select trigger_name, event_object_table from information_schema.triggers where trigger_schema = 'public';
-- select indexname, tablename from pg_indexes where schemaname = 'public' order by tablename;
-- select * from public.institutions;
