-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/cardhdzkojfbdnjvvgyp/sql)
-- to create a test table and seed it with sample data.

CREATE TABLE IF NOT EXISTS test_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE test_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read" ON test_items
  FOR SELECT USING (true);

-- Allow anonymous insert access
CREATE POLICY "Allow public insert" ON test_items
  FOR INSERT WITH CHECK (true);

-- Seed sample data
INSERT INTO test_items (name, description) VALUES
  ('Widget A', 'A small reusable widget'),
  ('Widget B', 'A medium-sized widget'),
  ('Gadget X', 'An experimental gadget'),
  ('Gadget Y', 'A production-ready gadget'),
  ('Doohickey', 'Nobody knows what this does');
