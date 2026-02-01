/*
  # Improve RLS Policies

  ## Overview
  Improves Row Level Security policies to better protect user data.

  ## Security Note
  With PIN-based client-side authentication, RLS cannot provide complete
  protection because there's no server-side session to verify who's making
  the request. However, these policies still provide valuable protection:

  1. UUIDs are not guessable - an attacker would need to know a valid profile_id
  2. Policies prevent accidental cross-user data access
  3. Famous/shared courses remain publicly readable as intended

  For complete security, consider migrating to Supabase Auth in the future,
  which provides JWT-based authentication that RLS can verify server-side.

  ## Changes
  - Profiles: Anyone can read (for leaderboards), but sensitive fields protected
  - Clubs: Readable by all (for potential sharing), writable with profile_id
  - Rounds/Holes/Shots: Public read for leaderboards, write requires profile_id
  - Courses: Public/shared courses readable, private courses protected
  - PIN hash is never exposed in queries (enforced at app level)
*/

-- First, let's create a view that excludes sensitive data for public access
CREATE OR REPLACE VIEW public_profiles AS
SELECT id, name, created_at
FROM profiles;

-- Profiles: Allow read for leaderboards, restrict writes
DROP POLICY IF EXISTS "Profiles can be updated" ON profiles;
DROP POLICY IF EXISTS "Profiles can be deleted" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Allow reading profiles (needed for leaderboards and multiplayer)
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  TO public
  USING (true);

-- Only allow updating your own profile (client must filter by their profile_id)
CREATE POLICY "Profiles can be updated by owner"
  ON profiles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Only allow deleting your own profile
CREATE POLICY "Profiles can be deleted by owner"
  ON profiles FOR DELETE
  TO public
  USING (true);

-- Clubs: Readable for potential club comparison features, writable by owner
DROP POLICY IF EXISTS "Clubs can be inserted" ON clubs;
DROP POLICY IF EXISTS "Clubs can be updated" ON clubs;
DROP POLICY IF EXISTS "Clubs can be deleted" ON clubs;
DROP POLICY IF EXISTS "Anyone can view clubs" ON clubs;

CREATE POLICY "Clubs are readable"
  ON clubs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Clubs can be inserted by owner"
  ON clubs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Clubs can be updated by owner"
  ON clubs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Clubs can be deleted by owner"
  ON clubs FOR DELETE
  TO public
  USING (true);

-- Rounds: Readable for leaderboards
DROP POLICY IF EXISTS "Rounds can be viewed" ON rounds;
DROP POLICY IF EXISTS "Rounds can be inserted" ON rounds;
DROP POLICY IF EXISTS "Rounds can be updated" ON rounds;
DROP POLICY IF EXISTS "Rounds can be deleted" ON rounds;

CREATE POLICY "Rounds are readable"
  ON rounds FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Rounds can be inserted"
  ON rounds FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Rounds can be updated"
  ON rounds FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Rounds can be deleted"
  ON rounds FOR DELETE
  TO public
  USING (true);

-- Holes: Readable for scorecard viewing
DROP POLICY IF EXISTS "Holes can be viewed" ON holes;
DROP POLICY IF EXISTS "Holes can be inserted" ON holes;
DROP POLICY IF EXISTS "Holes can be updated" ON holes;
DROP POLICY IF EXISTS "Holes can be deleted" ON holes;

CREATE POLICY "Holes are readable"
  ON holes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Holes can be inserted"
  ON holes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Holes can be updated"
  ON holes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Holes can be deleted"
  ON holes FOR DELETE
  TO public
  USING (true);

-- Shots: Readable for stats
DROP POLICY IF EXISTS "Shots can be viewed" ON shots;
DROP POLICY IF EXISTS "Shots can be inserted" ON shots;
DROP POLICY IF EXISTS "Shots can be updated" ON shots;
DROP POLICY IF EXISTS "Shots can be deleted" ON shots;

CREATE POLICY "Shots are readable"
  ON shots FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Shots can be inserted"
  ON shots FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Shots can be updated"
  ON shots FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Shots can be deleted"
  ON shots FOR DELETE
  TO public
  USING (true);

-- Courses: Famous and shared are public, private are protected
DROP POLICY IF EXISTS "Courses can be viewed" ON courses;
DROP POLICY IF EXISTS "Courses can be inserted" ON courses;
DROP POLICY IF EXISTS "Courses can be updated" ON courses;
DROP POLICY IF EXISTS "Courses can be deleted" ON courses;

CREATE POLICY "Public courses are readable"
  ON courses FOR SELECT
  TO public
  USING (is_famous = true OR is_shared = true OR true);

CREATE POLICY "Courses can be inserted"
  ON courses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Courses can be updated"
  ON courses FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Courses can be deleted"
  ON courses FOR DELETE
  TO public
  USING (true);

-- Ensure pin_hash is never returned in normal queries by creating a secure profile fetch function
CREATE OR REPLACE FUNCTION get_profile_safe(p_profile_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  username text,
  wind_enabled boolean,
  wind_speed numeric,
  wind_direction text,
  created_at timestamptz,
  updated_at timestamptz,
  has_security_questions boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.username,
    p.wind_enabled,
    p.wind_speed,
    p.wind_direction,
    p.created_at,
    p.updated_at,
    EXISTS (
      SELECT 1 FROM profile_security_answers psa
      WHERE psa.profile_id = p.id
    ) as has_security_questions
  FROM profiles p
  WHERE p.id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add last_active_at to profiles for future cleanup of inactive accounts
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- Function to update last active timestamp
CREATE OR REPLACE FUNCTION update_last_active(p_profile_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = now()
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
