-- Fix RLS Policies: Restrict admin access to verified admin emails only
-- Run this in Supabase SQL Editor
-- Replaces the previous USING (true) WITH CHECK (true) for authenticated role

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Admin full access on profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full access on siblings" ON siblings;
DROP POLICY IF EXISTS "Admin full access on shares" ON profile_shares;
DROP POLICY IF EXISTS "Admin full access on views" ON profile_views;
DROP POLICY IF EXISTS "Admin full access on matches" ON matches;
DROP POLICY IF EXISTS "Admin full access on payments" ON payments;
DROP POLICY IF EXISTS "Admin full access on families" ON families;
DROP POLICY IF EXISTS "Admin full access on counters" ON profile_id_counters;
DROP POLICY IF EXISTS "Admin full access on settings" ON admin_settings;

-- Re-create with email verification against admin_settings table
CREATE POLICY "Admin full access on profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on siblings"
  ON siblings FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on shares"
  ON profile_shares FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on views"
  ON profile_views FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on matches"
  ON matches FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on payments"
  ON payments FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on families"
  ON families FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on counters"
  ON profile_id_counters FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));

CREATE POLICY "Admin full access on settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1))
  WITH CHECK (auth.email() = (SELECT admin_email FROM admin_settings LIMIT 1));
