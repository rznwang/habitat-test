-- ============================================================
-- MIGRATION: Sprint Redesign – Phase 1 (idempotent / re-runnable)
-- 1. Add layout + moment columns to activities
-- 2. Clean up old 3-per-week activities
-- 3. Create theme_weeks table for per-week metadata
-- ============================================================

-- ── 1. Activities table changes ─────────────────────────────

-- Layout determines which immersive UI component renders the activity
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS layout varchar
    CHECK (layout IN ('immersive-text', 'immersive-photo', 'immersive-video', 'proposal', 'survey'));

-- Moment type determines what happens when the week is completed
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS moment_type varchar
    CHECK (moment_type IN ('reveal', 'vote_result', 'survey_summary', 'slideshow'));

-- Moment description explains the payoff to users (shown on the "unlock" CTA)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS moment_description text;

-- ── 2. Clean up old 3-per-week data before tightening constraint ──

-- Delete orphaned responses pointing to activities we're about to remove
DELETE FROM responses
WHERE activity_id IN (
  SELECT id FROM activities WHERE sort_order > 2
);

-- Remove activities with sort_order > 2 (the filler activities we no longer want)
DELETE FROM activities WHERE sort_order > 2;

-- Now safe to tighten the constraint
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_sort_order_check;
ALTER TABLE activities ADD CONSTRAINT activities_sort_order_check CHECK (sort_order >= 1 AND sort_order <= 2);

-- ── 3. Theme weeks table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS theme_weeks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id uuid NOT NULL REFERENCES sprint_themes(id) ON DELETE CASCADE,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 6),
  title varchar NOT NULL,
  subtitle text,
  icon varchar,
  moment_label varchar,
  UNIQUE (theme_id, week_number)
);

-- Enable RLS (match existing table patterns)
ALTER TABLE theme_weeks ENABLE ROW LEVEL SECURITY;

-- Drop + recreate policy to be idempotent
DROP POLICY IF EXISTS "Anyone can read theme weeks" ON theme_weeks;
CREATE POLICY "Anyone can read theme weeks"
  ON theme_weeks FOR SELECT
  TO authenticated
  USING (true);

-- ── 4. Backfill layout on existing activities ───────────────

-- Map existing activity types to layout values
UPDATE activities SET layout = CASE
  WHEN type IN ('question', 'story', 'confession', 'dare') THEN 'immersive-text'
  WHEN type IN ('photo', 'draw') THEN 'immersive-photo'
  WHEN type = 'voice' THEN 'immersive-video'
  WHEN type = 'poll' THEN 'survey'
  ELSE 'immersive-text'
END
WHERE layout IS NULL;
