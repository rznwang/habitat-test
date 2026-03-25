-- ============================================================
-- SEED: Sprint Themes + Activities (3 themes × 18 activities)
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Theme 1: Getting to Know You ────────────────────────────
INSERT INTO sprint_themes (id, name, description, icon, is_active, sort_order)
VALUES ('11111111-1111-1111-1111-111111111101', 'Getting to Know You',
  'Rediscover each other through fun questions, challenges, and surprises.',
  '🫂', true, 1);

INSERT INTO activities (id, theme_id, week_number, sort_order, type, prompt, is_anonymous, allow_comments) VALUES
-- Week 1
('a1010101-0101-0101-0101-010101010101', '11111111-1111-1111-1111-111111111101', 1, 1, 'question',  'What is a small thing that always makes your day better?', false, true),
('a1010101-0101-0101-0101-010101010102', '11111111-1111-1111-1111-111111111101', 1, 2, 'photo',     'Share a photo of your current view right now!', false, true),
('a1010101-0101-0101-0101-010101010103', '11111111-1111-1111-1111-111111111101', 1, 3, 'poll',      'What''s better: morning or night? Cast your vote!', false, true),
-- Week 2
('a1010101-0101-0101-0101-010101010201', '11111111-1111-1111-1111-111111111101', 2, 1, 'dare',      'Call or text a family member you haven''t spoken to in a while. Share how it went!', false, true),
('a1010101-0101-0101-0101-010101010202', '11111111-1111-1111-1111-111111111101', 2, 2, 'story',     'Start a family story: "Once upon a time, our family..." — each person adds a sentence.', false, true),
('a1010101-0101-0101-0101-010101010203', '11111111-1111-1111-1111-111111111101', 2, 3, 'question',  'What''s a meal that reminds you of home?', false, true),
-- Week 3
('a1010101-0101-0101-0101-010101010301', '11111111-1111-1111-1111-111111111101', 3, 1, 'confession','Share something you''ve never told the family (keep it light!)', true, true),
('a1010101-0101-0101-0101-010101010302', '11111111-1111-1111-1111-111111111101', 3, 2, 'draw',      'Draw your favorite family memory from scratch. Others guess what it is!', false, true),
('a1010101-0101-0101-0101-010101010303', '11111111-1111-1111-1111-111111111101', 3, 3, 'photo',     'Share a childhood photo of yourself — no context!', false, true),
-- Week 4
('a1010101-0101-0101-0101-010101010401', '11111111-1111-1111-1111-111111111101', 4, 1, 'question',  'If we had a family motto, what would it be?', false, true),
('a1010101-0101-0101-0101-010101010402', '11111111-1111-1111-1111-111111111101', 4, 2, 'poll',      'Family movie night pick: comedy, action, or animated?', false, true),
('a1010101-0101-0101-0101-010101010403', '11111111-1111-1111-1111-111111111101', 4, 3, 'dare',      'Cook something you''ve never tried before and share the result!', false, true),
-- Week 5
('a1010101-0101-0101-0101-010101010501', '11111111-1111-1111-1111-111111111101', 5, 1, 'voice',     'Record a 30-second voice message saying what you appreciate about this family.', false, true),
('a1010101-0101-0101-0101-010101010502', '11111111-1111-1111-1111-111111111101', 5, 2, 'confession','What family rule did you secretly break as a kid?', true, true),
('a1010101-0101-0101-0101-010101010503', '11111111-1111-1111-1111-111111111101', 5, 3, 'question',  'What''s one thing you want us to do together this year?', false, true),
-- Week 6
('a1010101-0101-0101-0101-010101010601', '11111111-1111-1111-1111-111111111101', 6, 1, 'story',     'Write a short "thank you" letter to the family.', false, true),
('a1010101-0101-0101-0101-010101010602', '11111111-1111-1111-1111-111111111101', 6, 2, 'photo',     'Take a selfie right now and share it — no retakes!', false, true),
('a1010101-0101-0101-0101-010101010603', '11111111-1111-1111-1111-111111111101', 6, 3, 'draw',      'Draw what "family" means to you.', false, true);


-- ── Theme 2: Throwback Sprint ───────────────────────────────
INSERT INTO sprint_themes (id, name, description, icon, is_active, sort_order)
VALUES ('11111111-1111-1111-1111-111111111102', 'Throwback Sprint',
  'Dive into nostalgia — relive the best (and funniest) family moments.',
  '📸', true, 2);

INSERT INTO activities (id, theme_id, week_number, sort_order, type, prompt, is_anonymous, allow_comments) VALUES
-- Week 1
('a2020202-0202-0202-0202-020202020101', '11111111-1111-1111-1111-111111111102', 1, 1, 'photo',     'Share the oldest family photo you can find on your phone.', false, true),
('a2020202-0202-0202-0202-020202020102', '11111111-1111-1111-1111-111111111102', 1, 2, 'question',  'What''s your earliest family memory?', false, true),
('a2020202-0202-0202-0202-020202020103', '11111111-1111-1111-1111-111111111102', 1, 3, 'poll',      'Best decade for our family: 90s, 2000s, 2010s, or 2020s?', false, true),
-- Week 2
('a2020202-0202-0202-0202-020202020201', '11111111-1111-1111-1111-111111111102', 2, 1, 'story',     'Retell the funniest family vacation story you remember.', false, true),
('a2020202-0202-0202-0202-020202020202', '11111111-1111-1111-1111-111111111102', 2, 2, 'confession','What''s something embarrassing from your childhood you can finally admit?', true, true),
('a2020202-0202-0202-0202-020202020203', '11111111-1111-1111-1111-111111111102', 2, 3, 'photo',     'Recreate a pose from an old family photo and share both!', false, true),
-- Week 3
('a2020202-0202-0202-0202-020202020301', '11111111-1111-1111-1111-111111111102', 3, 1, 'question',  'What family tradition do you wish we still did?', false, true),
('a2020202-0202-0202-0202-020202020302', '11111111-1111-1111-1111-111111111102', 3, 2, 'draw',      'Draw the house or apartment you grew up in from memory.', false, true),
('a2020202-0202-0202-0202-020202020303', '11111111-1111-1111-1111-111111111102', 3, 3, 'dare',      'Find and wear something from your childhood. Post proof!', false, true),
-- Week 4
('a2020202-0202-0202-0202-020202020401', '11111111-1111-1111-1111-111111111102', 4, 1, 'voice',     'Tell a family story in 60 seconds — record a voice note.', false, true),
('a2020202-0202-0202-0202-020202020402', '11111111-1111-1111-1111-111111111102', 4, 2, 'question',  'What song instantly takes you back to a family moment?', false, true),
('a2020202-0202-0202-0202-020202020403', '11111111-1111-1111-1111-111111111102', 4, 3, 'poll',      'Best family holiday meal of all time?', false, true),
-- Week 5
('a2020202-0202-0202-0202-020202020501', '11111111-1111-1111-1111-111111111102', 5, 1, 'photo',     'Show us something you still own from your childhood.', false, true),
('a2020202-0202-0202-0202-020202020502', '11111111-1111-1111-1111-111111111102', 5, 2, 'story',     'Describe your most memorable birthday in detail.', false, true),
('a2020202-0202-0202-0202-020202020503', '11111111-1111-1111-1111-111111111102', 5, 3, 'confession','What''s a gift you received that you secretly didn''t like?', true, true),
-- Week 6
('a2020202-0202-0202-0202-020202020601', '11111111-1111-1111-1111-111111111102', 6, 1, 'question',  'What do you think is the biggest way our family has changed?', false, true),
('a2020202-0202-0202-0202-020202020602', '11111111-1111-1111-1111-111111111102', 6, 2, 'draw',      'Draw your favorite family pet (real or imagined).', false, true),
('a2020202-0202-0202-0202-020202020603', '11111111-1111-1111-1111-111111111102', 6, 3, 'dare',      'Call the oldest family member and ask them their favorite memory of you.', false, true);


-- ── Theme 3: Dream & Plan ───────────────────────────────────
INSERT INTO sprint_themes (id, name, description, icon, is_active, sort_order)
VALUES ('11111111-1111-1111-1111-111111111103', 'Dream & Plan',
  'Look ahead together — dream big, set family goals, and plan adventures.',
  '✨', true, 3);

INSERT INTO activities (id, theme_id, week_number, sort_order, type, prompt, is_anonymous, allow_comments) VALUES
-- Week 1
('a3030303-0303-0303-0303-030303030101', '11111111-1111-1111-1111-111111111103', 1, 1, 'question',  'If money were no object, where would we go on a family trip?', false, true),
('a3030303-0303-0303-0303-030303030102', '11111111-1111-1111-1111-111111111103', 1, 2, 'poll',      'Next family activity: camping, beach trip, road trip, or staycation?', false, true),
('a3030303-0303-0303-0303-030303030103', '11111111-1111-1111-1111-111111111103', 1, 3, 'draw',      'Draw your dream family home — where would it be and what would it look like?', false, true),
-- Week 2
('a3030303-0303-0303-0303-030303030201', '11111111-1111-1111-1111-111111111103', 2, 1, 'story',     'Write a short story about our family 10 years from now.', false, true),
('a3030303-0303-0303-0303-030303030202', '11111111-1111-1111-1111-111111111103', 2, 2, 'question',  'What''s one new skill you''d love to learn with a family member?', false, true),
('a3030303-0303-0303-0303-030303030203', '11111111-1111-1111-1111-111111111103', 2, 3, 'photo',     'Share a screenshot of something on your bucket list.', false, true),
-- Week 3
('a3030303-0303-0303-0303-030303030301', '11111111-1111-1111-1111-111111111103', 3, 1, 'dare',      'Research one activity you could do together this month and propose it!', false, true),
('a3030303-0303-0303-0303-030303030302', '11111111-1111-1111-1111-111111111103', 3, 2, 'confession','What''s a secret dream you''ve never shared with the family?', true, true),
('a3030303-0303-0303-0303-030303030303', '11111111-1111-1111-1111-111111111103', 3, 3, 'poll',      'If we started a family project, what should it be: garden, cookbook, YouTube channel, or charity?', false, true),
-- Week 4
('a3030303-0303-0303-0303-030303030401', '11111111-1111-1111-1111-111111111103', 4, 1, 'question',  'What''s one family tradition you want to start?', false, true),
('a3030303-0303-0303-0303-030303030402', '11111111-1111-1111-1111-111111111103', 4, 2, 'voice',     'Record yourself describing your perfect family day.', false, true),
('a3030303-0303-0303-0303-030303030403', '11111111-1111-1111-1111-111111111103', 4, 3, 'draw',      'Design a family crest or logo that represents us.', false, true),
-- Week 5
('a3030303-0303-0303-0303-030303030501', '11111111-1111-1111-1111-111111111103', 5, 1, 'photo',     'Show your workspace or favorite corner at home — this is where the magic happens!', false, true),
('a3030303-0303-0303-0303-030303030502', '11111111-1111-1111-1111-111111111103', 5, 2, 'story',     'Write a family bucket list — at least 5 items everyone should agree on.', false, true),
('a3030303-0303-0303-0303-030303030503', '11111111-1111-1111-1111-111111111103', 5, 3, 'question',  'What does "home" mean to you in one sentence?', false, true),
-- Week 6
('a3030303-0303-0303-0303-030303030601', '11111111-1111-1111-1111-111111111103', 6, 1, 'dare',      'Plan a surprise for another family member this week. Share what you did!', false, true),
('a3030303-0303-0303-0303-030303030602', '11111111-1111-1111-1111-111111111103', 6, 2, 'confession','What''s the one thing you wish you could change about how we spend time together?', true, true),
('a3030303-0303-0303-0303-030303030603', '11111111-1111-1111-1111-111111111103', 6, 3, 'story',     'Write a short letter to the family about what this sprint meant to you.', false, true);


-- ── Seed Badges ─────────────────────────────────────────────
INSERT INTO badges (id, key, label, description, icon) VALUES
('b0000000-0000-0000-0000-000000000001', 'first_sprint',    'First Sprint',       'Completed your very first sprint!',                 '🚀'),
('b0000000-0000-0000-0000-000000000002', 'full_house',      'Full House Week',    'Every family member participated in the same week.', '🏠'),
('b0000000-0000-0000-0000-000000000003', 'streak_3',        '3-Week Streak',      'Participated 3 weeks in a row.',                     '🔥'),
('b0000000-0000-0000-0000-000000000004', 'streak_6',        '6-Week Streak',      'Participated every week of a full sprint!',           '⚡'),
('b0000000-0000-0000-0000-000000000005', 'first_reaction',  'First Reaction',     'Gave your first emoji reaction.',                    '❤️'),
('b0000000-0000-0000-0000-000000000006', 'storyteller',     'Storyteller',        'Submitted 10 text responses.',                       '📝'),
('b0000000-0000-0000-0000-000000000007', 'shutterbug',      'Shutterbug',         'Submitted 5 photo responses.',                       '📷'),
('b0000000-0000-0000-0000-000000000008', 'confessor',       'The Confessor',      'Submitted 3 anonymous confessions.',                 '🤫')
ON CONFLICT (key) DO NOTHING;
