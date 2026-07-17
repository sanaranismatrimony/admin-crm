-- Match Pipeline Redesign Migration
-- Run this in Supabase SQL Editor AFTER 20260715000001_extend_matches.sql

-- =============================================
-- 1. Add missing interest columns to matches
-- =============================================
ALTER TABLE matches ADD COLUMN IF NOT EXISTS bride_interest TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS groom_interest TEXT;

-- =============================================
-- 2. Add new pipeline stage columns to matches
-- =============================================
ALTER TABLE matches ADD COLUMN IF NOT EXISTS contact_shared_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS family_communication_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS first_meeting_date TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS first_meeting_notes TEXT DEFAULT '';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS second_meeting_date TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS second_meeting_notes TEXT DEFAULT '';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS final_meeting_date TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS final_meeting_notes TEXT DEFAULT '';

-- On-hold flag (can be set at any stage)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_on_hold BOOLEAN DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS on_hold_at TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS on_hold_reason TEXT DEFAULT '';

-- Rejected tracking (separate from cancelled)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS rejected_by TEXT; -- 'bride' or 'groom'
ALTER TABLE matches ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Wedding completion details
ALTER TABLE matches ADD COLUMN IF NOT EXISTS wedding_date TIMESTAMPTZ;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS wedding_photos JSONB DEFAULT '[]';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS success_story TEXT DEFAULT '';

-- =============================================
-- 3. Share link controls (per-link visibility)
-- =============================================
ALTER TABLE profile_shares ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches(id) ON DELETE SET NULL;
ALTER TABLE profile_shares ADD COLUMN IF NOT EXISTS can_view_contact BOOLEAN DEFAULT false;
ALTER TABLE profile_shares ADD COLUMN IF NOT EXISTS can_view_location BOOLEAN DEFAULT true;
ALTER TABLE profile_shares ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN DEFAULT false;
ALTER TABLE profile_shares ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- Index for finding shares by match
CREATE INDEX IF NOT EXISTS idx_shares_match ON profile_shares(match_id);

-- =============================================
-- 4. Payment tracking improvements
-- =============================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_for TEXT DEFAULT ''; -- 'bride' or 'groom'

-- =============================================
-- 5. Make status column nullable / remove constraint
--    (We stop using status in code, stage is the source of truth)
-- =============================================
-- Drop the CHECK constraint on status so old rows don't cause issues
-- Note: constraint name may vary, try both common patterns
DO $$
BEGIN
  ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Set a safe default for status going forward
ALTER TABLE matches ALTER COLUMN status SET DEFAULT 'potential';
