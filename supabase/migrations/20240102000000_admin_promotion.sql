-- ============================================================
-- Admin Promotion Function
-- Run this in the Supabase SQL Editor
--
-- IMPORTANT: Change 'UENR-ADMIN-2025' to match exactly what
-- you set in your .env VITE_ADMIN_SECRET variable.
-- ============================================================

-- Stores the admin secret inside the database (server-side)
-- Even if someone extracts the frontend env key, this function
-- double-validates it on the Postgres side before promoting.

create or replace function public.promote_to_admin(secret_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Server-side secret validation — change this to match your .env
  if secret_key <> 'UENR-ADMIN-2025' then
    raise exception 'Invalid admin secret key' using errcode = '42501';
  end if;

  -- Only promote the currently authenticated user
  update public.users
  set
    role = 'admin',
    verification_status = 'verified'
  where id = auth.uid();

  if not found then
    raise exception 'User profile not found' using errcode = 'P0001';
  end if;
end;
$$;

-- Grant execute to authenticated users (the secret is the gate)
revoke all on function public.promote_to_admin(text) from public;
grant execute on function public.promote_to_admin(text) to authenticated;
