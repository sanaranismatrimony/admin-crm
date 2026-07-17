-- Add ON DELETE CASCADE to matches foreign keys so deleting a profile
-- automatically removes its matches (and payments cascade through matches)

ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_bride_profile_id_fkey,
  DROP CONSTRAINT IF EXISTS matches_groom_profile_id_fkey;

ALTER TABLE matches
  ADD CONSTRAINT matches_bride_profile_id_fkey
    FOREIGN KEY (bride_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT matches_groom_profile_id_fkey
    FOREIGN KEY (groom_profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
