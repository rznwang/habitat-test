-- Responses storage bucket migration
-- Run this in the Supabase SQL Editor to create the responses storage bucket.

-- 1. Create responses storage bucket (public, 5MB file size limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('responses', 'responses', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload response photos in their own folder
CREATE POLICY "Users can upload response photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'responses'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Allow public read access to response photos
CREATE POLICY "Public response photo read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'responses');
