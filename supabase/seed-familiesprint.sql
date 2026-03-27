-- ============================================================
-- SEED: Familiesprint Theme – 6-week Dutch family sprint
-- Run in Supabase SQL Editor after sprint-redesign-migration.sql
-- ============================================================

-- ── Theme 4: Familiesprint ──────────────────────────────────
INSERT INTO sprint_themes (id, name, description, icon, is_active, sort_order)
VALUES ('11111111-1111-1111-1111-111111111104', 'Familiesprint',
  'Zes weken lang dichter bij elkaar komen als familie. Deel herinneringen, stem samen, maak vlogs en plan een onvergetelijk familiefeest.',
  '🎉', true, 4)
ON CONFLICT (id) DO NOTHING;

-- ── Add challenge_intro column if not exists ────────────────
ALTER TABLE activities ADD COLUMN IF NOT EXISTS challenge_intro text;

-- ── Theme weeks: per-week narrative metadata ────────────────
INSERT INTO theme_weeks (id, theme_id, week_number, title, subtitle, icon, moment_label) VALUES

('b4040404-0404-0404-0404-040404040001', '11111111-1111-1111-1111-111111111104', 1,
  'Onze mooiste familievakantieherinnering',
  'We starten de sprint met een terugblik. Deel een vakantiefoto en het verhaal erachter — samen herbeleven we de mooiste momenten.',
  '🏖️', 'Bekijk elkaars herinneringen'),

('b4040404-0404-0404-0404-040404040002', '11111111-1111-1111-1111-111111111104', 2,
  'Kies onze volgende familie-uitstap',
  'Welke uitstap zou jij graag eens met de familie doen? Stel voor, pitch jouw idee, en stem samen op de winnaar.',
  '🗺️', 'Onthul de winnende uitstap'),

('b4040404-0404-0404-0404-040404040003', '11111111-1111-1111-1111-111111111104', 3,
  'Mijn mooiste jeugdherinnering',
  'Iedereen heeft een herinnering uit de kindertijd die is blijven hangen. Deel die van jou — grappig, ontroerend of gewoon typisch.',
  '👶', 'Lees elkaars jeugdverhalen'),

('b4040404-0404-0404-0404-040404040004', '11111111-1111-1111-1111-111111111104', 4,
  'Welk budgetmenu koken we voor de familie?',
  'Bedenk een gezellig, haalbaar en lekker menu dat niet te duur is. De winnaar mag het écht klaarmaken!',
  '👨‍🍳', 'Kroon de Chef van de Familie'),

('b4040404-0404-0404-0404-040404040005', '11111111-1111-1111-1111-111111111104', 5,
  'Neem ons mee in jouw dag',
  'Hoe ziet jouw dag eruit? Maak een korte vlog of fotoreeks en laat zien wat jouw dagelijks leven bijzonder maakt.',
  '🎬', 'Bekijk elkaars dagvlogs'),

('b4040404-0404-0404-0404-040404040006', '11111111-1111-1111-1111-111111111104', 6,
  'Samen ons familiefeest organiseren',
  'We sluiten af met iets leuks: plan samen een creatief familiefeest. Kies thema, locatie, eten en verrassingen.',
  '🎉', 'Bekijk het feestplan')

ON CONFLICT (theme_id, week_number) DO NOTHING;

-- ── Activities: 1–2 focused activities per week ─────────────
-- Old 3-per-week activities are replaced. Delete old ones first.
DELETE FROM activities WHERE theme_id = '11111111-1111-1111-1111-111111111104';

INSERT INTO activities (id, theme_id, week_number, sort_order, type, prompt, is_anonymous, allow_comments, challenge_intro, layout, moment_type, moment_description) VALUES

-- ═══════════════════════════════════════════════════════════
-- Week 1: Familieherinnering — photo + story
-- Moment: gallery reveal of everyone's vacation memories
-- ═══════════════════════════════════════════════════════════
('a4040404-0404-0404-0404-040404040101', '11111111-1111-1111-1111-111111111104', 1, 1, 'photo',
  'Deel een mooie familievakantiefoto en vertel het verhaal erachter. Wat is jou het meest bijgebleven?',
  false, true,
  'We starten onze familiesprint met een mooie herinnering. Plaats een familievakantiefoto en deel jouw leukste moment van deze reis.',
  'immersive-photo', 'reveal', 'Ontdek elkaars mooiste vakantiemomenten in een gezamenlijk fotoalbum'),

-- ═══════════════════════════════════════════════════════════
-- Week 2: Familie-uitstap — proposal + vote (merged)
-- Moment: winning trip announced
-- ═══════════════════════════════════════════════════════════
('a4040404-0404-0404-0404-040404040201', '11111111-1111-1111-1111-111111111104', 2, 1, 'story',
  'Pitch jouw droomuitstap voor de familie! Geef een titel, beschrijving en eventueel een foto of link. Daarna stemmen we samen.',
  false, true,
  'Welke uitstap zou jij graag eens met de familie doen? Stel een leuke activiteit voor waar jong en oud van kan genieten. Zodra alle ideeën binnen zijn, stemmen we op de favoriet.',
  'proposal', 'vote_result', 'Ontdek welke uitstap de meeste stemmen heeft gekregen'),

-- ═══════════════════════════════════════════════════════════
-- Week 3: Jeugdherinnering — story + optional photo
-- Moment: reading everyone's childhood stories together
-- ═══════════════════════════════════════════════════════════
('a4040404-0404-0404-0404-040404040301', '11111111-1111-1111-1111-111111111104', 3, 1, 'story',
  'Deel jouw mooiste jeugdherinnering met de familie. Dat mag iets grappigs, ontroerends of typisch zijn.',
  false, true,
  'Iedereen heeft wel een herinnering uit de kindertijd die is blijven hangen. Deel die van jou met de familie.',
  'immersive-text', 'reveal', 'Lees samen alle jeugdverhalen en ontdek wat jullie verbindt'),

('a4040404-0404-0404-0404-040404040302', '11111111-1111-1111-1111-111111111104', 3, 2, 'photo',
  'Heb je een oude foto van vroeger? Deel die hier bij je verhaal!',
  false, true, NULL,
  'immersive-photo', NULL, NULL),

-- ═══════════════════════════════════════════════════════════
-- Week 4: Budgetmenu — proposal + vote (merged)
-- Moment: winner crowned as Chef van de Familie
-- ═══════════════════════════════════════════════════════════
('a4040404-0404-0404-0404-040404040401', '11111111-1111-1111-1111-111111111104', 4, 1, 'story',
  'Pitch jouw budgetvriendelijke familiemenu! Geef de naam, beschrijving, waarom het low-budget is en voor hoeveel personen. Daarna stemmen we samen.',
  false, true,
  'Wat zou jij koken voor de familie met een beperkt budget? De winnaar mag het écht klaarmaken!',
  'proposal', 'vote_result', 'Ontdek wie de nieuwe Chef van de Familie wordt 👨‍🍳'),

-- ═══════════════════════════════════════════════════════════
-- Week 5: Dagvlog — video/photo
-- Moment: slideshow of everyone's day
-- ═══════════════════════════════════════════════════════════
('a4040404-0404-0404-0404-040404040501', '11111111-1111-1111-1111-111111111104', 5, 1, 'voice',
  'Neem ons mee in jouw dag! Upload een korte vlog of fotoreeks van je dagelijks leven.',
  false, true,
  'Hoe ziet jouw dag eruit? Laat zien wat jouw dagelijks leven bijzonder maakt — het hoeft niet perfect te zijn, gewoon echt.',
  'immersive-video', 'slideshow', 'Bekijk samen elkaars dagvlogs als een mini-documentaire'),

-- ═══════════════════════════════════════════════════════════
-- Week 6: Familiefeest organiseren — survey
-- Moment: aggregated party plan revealed
-- ═══════════════════════════════════════════════════════════
('a4040404-0404-0404-0404-040404040601', '11111111-1111-1111-1111-111111111104', 6, 1, 'poll',
  'Vul de feestvragenlijst in: kies samen het thema, de sfeer, locatie, eten en activiteiten voor jullie familiefeest.',
  false, true,
  'We sluiten de sprint af met iets leuks: plan samen een creatief familiefeest! Vul de vragenlijst in en help mee om er een onvergetelijk moment van te maken.',
  'survey', 'survey_summary', 'Bekijk het definitieve feestplan op basis van jullie keuzes')

ON CONFLICT (id) DO NOTHING;

-- ── Badge: Chef van de Familie ──────────────────────────────
INSERT INTO badges (id, key, label, description, icon) VALUES
('b0000000-0000-0000-0000-000000000009', 'chef_family', 'Chef van de Familie', 'Jouw menu werd verkozen als het lekkerste familierecept!', '👨‍🍳')
ON CONFLICT (key) DO NOTHING;
