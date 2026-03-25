-- Migration: Family Picture Book
-- A shared photo album where any family member can upload photos with captions.

-- 1. Create family_photos table
CREATE TABLE family_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url varchar NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_family_photos_family ON family_photos(family_id, created_at DESC);

-- 2. RLS policies
ALTER TABLE family_photos ENABLE ROW LEVEL SECURITY;

-- Family members can view photos in their family
CREATE POLICY "Family members can view photos"
  ON family_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_photos.family_id
        AND fm.user_id = auth.uid()
    )
  );

-- Family members can insert photos into their family
CREATE POLICY "Family members can insert photos"
  ON family_photos FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_photos.family_id
        AND fm.user_id = auth.uid()
    )
  );

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON family_photos FOR DELETE
  USING (user_id = auth.uid());

-- 3. Storage bucket for family photos (reuses same pattern as responses bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-photos', 'family-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Upload: family members can upload to their own folder
CREATE POLICY "Users can upload family photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'family-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: anyone can read (public bucket)
CREATE POLICY "Family photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'family-photos');
