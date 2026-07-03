-- ============================================================
-- Migration: Found Item Custody & Return Workflow
-- Extends items table with custody tracking columns
-- ============================================================

-- 1. Add custody columns to items table
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS holder_type text
    CHECK (holder_type IN ('finder', 'security', 'student_affairs', 'other')),
  ADD COLUMN IF NOT EXISTS holder_location text,
  ADD COLUMN IF NOT EXISTS holder_notes text,
  ADD COLUMN IF NOT EXISTS trust_agreement boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS meeting_location text,
  ADD COLUMN IF NOT EXISTS meeting_time timestamp with time zone,
  ADD COLUMN IF NOT EXISTS returned_at timestamp with time zone;

-- 2. Drop old status constraint and recreate with new values
-- (items table uses text, not an enum, so we manage via check constraint)
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_status_check;

ALTER TABLE public.items
  ADD CONSTRAINT items_status_check
    CHECK (status IN (
      'active',
      'claimed',
      'resolved',
      'archived',
      'awaiting_pickup',
      'ready_for_collection',
      'returned',
      'closed'
    ));

-- 3. Allow reporters to update custody fields on their own items
CREATE POLICY IF NOT EXISTS "Reporters can update custody fields on their items"
  ON public.items FOR UPDATE
  USING (auth.uid() = reporter_id)
  WITH CHECK (auth.uid() = reporter_id);

-- 4. Index for quick custody queries
CREATE INDEX IF NOT EXISTS items_holder_type_idx ON public.items (holder_type);
