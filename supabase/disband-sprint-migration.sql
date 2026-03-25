-- Migration: Disband sprint with family consensus
-- Allows families to disband (abandon) an active sprint only when
-- ALL members have voted to disband.

-- 1. Create disband_votes table to track disband votes
CREATE TABLE disband_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id uuid NOT NULL REFERENCES family_sprints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sprint_id, user_id)
);

-- 2. RLS policies for disband_votes
ALTER TABLE disband_votes ENABLE ROW LEVEL SECURITY;

-- Family members can view disband votes for their family's sprints
CREATE POLICY "Family members can view disband votes"
  ON disband_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_sprints fs
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE fs.id = disband_votes.sprint_id
        AND fm.user_id = auth.uid()
    )
  );

-- Users can insert their own disband votes
CREATE POLICY "Users can insert own disband votes"
  ON disband_votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM family_sprints fs
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE fs.id = disband_votes.sprint_id
        AND fm.user_id = auth.uid()
    )
  );

-- Users can delete their own disband votes (un-vote)
CREATE POLICY "Users can delete own disband votes"
  ON disband_votes FOR DELETE
  USING (user_id = auth.uid());
