-- ============================================================
-- Migration: Fix users UPDATE RLS policy (409 Conflict)
-- ============================================================
-- PROBLEM:
--   The self-update policy has a WITH CHECK that blocks changing role or
--   verification_status. In PostgreSQL permissive RLS, ALL matching policies'
--   WITH CHECK clauses are evaluated per UPDATE. So when an admin patches
--   verification_status on another user, the self-update WITH CHECK fires and
--   returns 409 because the new status doesn't equal the old one.
--
-- FIX:
--   1. Recreate the self-update policy with an admin bypass in its WITH CHECK.
--   2. Add an explicit WITH CHECK to the admin policy.
-- ============================================================

-- 1. Fix self-update policy
drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (
    public.my_role() in ('admin', 'superadmin')
    or (
      role = (select role from public.users where id = auth.uid()) and
      verification_status = (select verification_status from public.users where id = auth.uid())
    )
  );

-- 2. Admin update policy with explicit WITH CHECK
drop policy if exists "Admins can update users in their institution" on public.users;
create policy "Admins can update users in their institution"
  on public.users for update
  using (
    institution_id = public.my_institution_id() and
    public.my_role() in ('admin', 'superadmin')
  )
  with check (
    institution_id = public.my_institution_id()
  );
