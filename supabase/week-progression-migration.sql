-- Migration: Week-based progression with family consensus
-- Allows families to advance to the next week only when ALL members
-- have completed all activities AND voted to advance.

-- 1. Add explicit current_week to family_sprints
ALTER TABLE family_sprints
  ADD COLUMN current_week integer NOT NULL DEFAULT 1
  CHECK (current_week BETWEEN 1 AND 6);

-- 2. Create week_votes table to track advancement votes
CREATE TABLE week_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id uuid NOT NULL REFERENCES family_sprints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number integer NOT NULL CHECK (week_number BETWEEN 1 AND 6),
  created_at timestamptz DEFAULT now(),
  UNIQUE(sprint_id, user_id, week_number)
);

-- 3. RLS policies for week_votes
ALTER TABLE week_votes ENABLE ROW LEVEL SECURITY;

-- Family members can view votes for their family's sprints
CREATE POLICY "Family members can view week votes"
  ON week_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_sprints fs
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE fs.id = week_votes.sprint_id
        AND fm.user_id = auth.uid()
    )
  );

-- Users can insert their own votes
CREATE POLICY "Users can insert own week votes"
  ON week_votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM family_sprints fs
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE fs.id = week_votes.sprint_id
        AND fm.user_id = auth.uid()
    )
  );

-- Users can delete their own votes (un-vote)
CREATE POLICY "Users can delete own week votes"
  ON week_votes FOR DELETE
  USING (user_id = auth.uid());
