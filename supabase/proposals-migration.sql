-- ============================================================
-- MIGRATION: Proposals + Proposal Votes
-- For sprint weeks with proposal/voting flow (Week 2 & 4)
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Proposals table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id uuid NOT NULL REFERENCES family_sprints(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  title varchar NOT NULL,
  description text,
  photo_url varchar,
  link_url varchar,
  budget_note text,
  servings integer,
  created_at timestamptz DEFAULT now()
);

-- One proposal per user per activity
ALTER TABLE proposals ADD CONSTRAINT proposals_user_activity_unique
  UNIQUE (user_id, activity_id, sprint_id);

-- ── Proposal Votes table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposal_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (proposal_id, user_id)
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;

-- Proposals: family members can view proposals for their family's sprints
CREATE POLICY "Family members can view proposals"
  ON proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_sprints fs
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE fs.id = proposals.sprint_id
        AND fm.user_id = auth.uid()
    )
  );

-- Proposals: authenticated users can insert their own proposals
CREATE POLICY "Users can insert own proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM family_sprints fs
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE fs.id = sprint_id
        AND fm.user_id = auth.uid()
    )
  );

-- Proposals: users can delete their own proposals
CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);

-- Proposal Votes: family members can view votes
CREATE POLICY "Family members can view proposal votes"
  ON proposal_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN family_sprints fs ON fs.id = p.sprint_id
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE p.id = proposal_votes.proposal_id
        AND fm.user_id = auth.uid()
    )
  );

-- Proposal Votes: authenticated users can insert own votes
CREATE POLICY "Users can insert own proposal votes"
  ON proposal_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM proposals p
      JOIN family_sprints fs ON fs.id = p.sprint_id
      JOIN family_members fm ON fm.family_id = fs.family_id
      WHERE p.id = proposal_id
        AND fm.user_id = auth.uid()
    )
  );

-- Proposal Votes: users can delete own votes
CREATE POLICY "Users can delete own proposal votes"
  ON proposal_votes FOR DELETE
  USING (auth.uid() = user_id);
