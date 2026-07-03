-- ============================================================
-- Migration: Restore legacy columns to notifications table
-- ============================================================
-- PROBLEM:
--   The mega_features migration dropped and recreated the notifications 
--   table but omitted 'related_entity_id' and 'related_entity_type'.
--   Legacy triggers (on_claim_notify_reporter, on_claim_resolution_notify) 
--   still attempt to insert into these columns, causing 500/409 errors
--   during claim submission.
--
-- FIX:
--   Add the missing columns back to the notifications table so the
--   legacy triggers can succeed.
-- ============================================================

alter table public.notifications
  add column if not exists related_entity_id uuid,
  add column if not exists related_entity_type text;
