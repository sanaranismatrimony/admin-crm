-- Atomic profile ID counter using PostgreSQL UPDATE ... RETURNING
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION next_profile_id(prefix_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_val INTEGER;
BEGIN
  INSERT INTO profile_id_counters (prefix, last_number)
  VALUES (prefix_param, 1)
  ON CONFLICT (prefix)
  DO UPDATE SET last_number = profile_id_counters.last_number + 1
  RETURNING last_number INTO next_val;

  RETURN next_val;
END;
$$;
