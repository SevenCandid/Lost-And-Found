-- ============================================================
-- Admin Dashboard Policies
-- Run this in the Supabase SQL Editor
-- Grants additional permissions needed for the full Admin Dashboard
-- ============================================================

-- 1. Items: Allow admins to view ALL items (including resolved/claimed)
drop policy if exists "Admins can view all items in their institution" on public.items;
create policy "Admins can view all items in their institution"
  on public.items for select
  using (
    institution_id = public.my_institution_id() and
    public.my_role() in ('admin', 'superadmin')
  );

-- 2. Items: Allow admins to delete inappropriate items
drop policy if exists "Admins can delete any item in their institution" on public.items;
create policy "Admins can delete any item in their institution"
  on public.items for delete
  using (
    institution_id = public.my_institution_id() and
    public.my_role() in ('admin', 'superadmin')
  );

-- 3. Users: Admins can already view profiles in their institution, and update them.
-- But let's make sure they can delete them if needed
drop policy if exists "Admins can delete users in their institution" on public.users;
create policy "Admins can delete users in their institution"
  on public.users for delete
  using (
    institution_id = public.my_institution_id() and
    public.my_role() in ('admin', 'superadmin')
  );
