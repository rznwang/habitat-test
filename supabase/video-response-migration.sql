-- ============================================================
-- MIGRATION: Video response type + storage policy
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Extend responses type CHECK constraint ──────────────────
-- Drop old constraint and add new one with 'video' type
ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_type_check;
ALTER TABLE responses ADD CONSTRAINT responses_type_check
  CHECK (type IN ('text', 'image', 'audio', 'drawing', 'video'));

-- ── Update responses storage bucket for video uploads ───────
-- The bucket already exists (5MB for images). Update to 50MB for video support.
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50 MB
WHERE id = 'responses';

-- If above doesn't work (bucket not found), create it:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit)
-- VALUES ('responses', 'responses', true, 52428800)
-- ON CONFLICT (id) DO UPDATE SET file_size_limit = 52428800;
