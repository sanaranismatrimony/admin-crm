-- Extend matches table with pipeline stage fields
-- Run this in Supabase SQL Editor

ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'shared';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS initiated_by TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS shared_to_bride_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS shared_to_groom_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_fixed_date TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
