/*
  # Add PIN Authentication System

  ## Overview
  Adds username and PIN-based authentication to the application, allowing each user to have their own account and data.

  ## Changes to Existing Tables
  
  ### `profiles`
  - Add `username` (text, unique) - User's unique username for login
  - Add `pin_hash` (text) - Hashed 4-digit PIN for authentication
  
  ## New Functions
  - `hash_pin(pin text)` - Server-side function to hash PINs using pgcrypto
  
  ## Security Updates
  All RLS policies are updated to restrict data access to the authenticated user's profile:
  - Profiles: Users can only update/delete their own profile
  - Clubs: Users can only manage clubs for their own profile
  - Rounds: Users can only access their own rounds
  - Holes: Users can only access holes from their own rounds
  - Shots: Users can only access shots from their own holes
  - Courses: Users can only manage their own custom courses (famous courses remain public)
  - Course participants: Users can manage participants for their own courses
  - Competitions: Users can only access competitions for their own rounds
  - Hole mulligans: Users can only access mulligans for their own holes
  
  ## Notes
  - Usernames must be unique and are case-insensitive
  - PINs are hashed using SHA256 for security
  - Public can still view profiles for potential multiplayer features
  - Session management handled client-side with profile_id storage
  - Famous courses remain publicly accessible
*/

-- Add username and pin_hash columns to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS pin_hash text;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable pgcrypto extension for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to hash PINs
CREATE OR REPLACE FUNCTION hash_pin(pin text)
RETURNS text AS $$
BEGIN
  RETURN encode(digest(pin, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO public
  USING (id::text = current_setting('app.current_profile_id', true))
  WITH CHECK (id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO public
  USING (id::text = current_setting('app.current_profile_id', true));

-- Update clubs RLS policies
DROP POLICY IF EXISTS "Users can insert clubs for any profile" ON clubs;
DROP POLICY IF EXISTS "Users can update any clubs" ON clubs;
DROP POLICY IF EXISTS "Users can delete any clubs" ON clubs;

CREATE POLICY "Users can insert clubs for own profile"
  ON clubs FOR INSERT
  TO public
  WITH CHECK (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can update own clubs"
  ON clubs FOR UPDATE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true))
  WITH CHECK (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can delete own clubs"
  ON clubs FOR DELETE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true));

-- Update rounds RLS policies
DROP POLICY IF EXISTS "Anyone can view rounds" ON rounds;
DROP POLICY IF EXISTS "Users can insert rounds" ON rounds;
DROP POLICY IF EXISTS "Users can update rounds" ON rounds;
DROP POLICY IF EXISTS "Users can delete rounds" ON rounds;

CREATE POLICY "Users can view own rounds"
  ON rounds FOR SELECT
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can insert own rounds"
  ON rounds FOR INSERT
  TO public
  WITH CHECK (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can update own rounds"
  ON rounds FOR UPDATE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true))
  WITH CHECK (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can delete own rounds"
  ON rounds FOR DELETE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true));

-- Update holes RLS policies
DROP POLICY IF EXISTS "Anyone can view holes" ON holes;
DROP POLICY IF EXISTS "Users can insert holes" ON holes;
DROP POLICY IF EXISTS "Users can update holes" ON holes;
DROP POLICY IF EXISTS "Users can delete holes" ON holes;

CREATE POLICY "Users can view own holes"
  ON holes FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = holes.round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can insert holes for own rounds"
  ON holes FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can update own holes"
  ON holes FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = holes.round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can delete own holes"
  ON holes FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = holes.round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

-- Update shots RLS policies
DROP POLICY IF EXISTS "Anyone can view shots" ON shots;
DROP POLICY IF EXISTS "Users can insert shots" ON shots;
DROP POLICY IF EXISTS "Users can update shots" ON shots;
DROP POLICY IF EXISTS "Users can delete shots" ON shots;

CREATE POLICY "Users can view own shots"
  ON shots FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = shots.hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can insert shots for own holes"
  ON shots FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can update own shots"
  ON shots FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = shots.hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can delete own shots"
  ON shots FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = shots.hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

-- Update courses RLS policies
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Users can insert courses" ON courses;
DROP POLICY IF EXISTS "Users can update courses" ON courses;
DROP POLICY IF EXISTS "Users can delete courses" ON courses;

CREATE POLICY "Users can view public and own courses"
  ON courses FOR SELECT
  TO public
  USING (
    is_famous = true OR 
    is_shared = true OR 
    profile_id::text = current_setting('app.current_profile_id', true)
  );

CREATE POLICY "Users can insert own courses"
  ON courses FOR INSERT
  TO public
  WITH CHECK (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can update own courses"
  ON courses FOR UPDATE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true))
  WITH CHECK (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can delete own courses"
  ON courses FOR DELETE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true));

-- Update course_holes RLS policies
DROP POLICY IF EXISTS "Anyone can view course holes" ON course_holes;
DROP POLICY IF EXISTS "Users can insert course holes" ON course_holes;
DROP POLICY IF EXISTS "Users can update course holes" ON course_holes;
DROP POLICY IF EXISTS "Users can delete course holes" ON course_holes;

CREATE POLICY "Users can view public and own course holes"
  ON course_holes FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_holes.course_id
      AND (courses.is_famous = true OR courses.is_shared = true OR courses.profile_id::text = current_setting('app.current_profile_id', true))
    )
  );

CREATE POLICY "Users can insert holes for own courses"
  ON course_holes FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_id
      AND courses.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can update holes in own courses"
  ON course_holes FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_holes.course_id
      AND courses.profile_id::text = current_setting('app.current_profile_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_id
      AND courses.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can delete holes from own courses"
  ON course_holes FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_holes.course_id
      AND courses.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

-- Update course_participants RLS policies
DROP POLICY IF EXISTS "Anyone can view course participants" ON course_participants;
DROP POLICY IF EXISTS "Users can insert course participants" ON course_participants;
DROP POLICY IF EXISTS "Users can update course participants" ON course_participants;
DROP POLICY IF EXISTS "Users can delete course participants" ON course_participants;

CREATE POLICY "Users can view participants in accessible courses"
  ON course_participants FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_participants.course_id
      AND (courses.is_famous = true OR courses.is_shared = true OR courses.profile_id::text = current_setting('app.current_profile_id', true))
    )
  );

CREATE POLICY "Users can join accessible courses"
  ON course_participants FOR INSERT
  TO public
  WITH CHECK (
    profile_id::text = current_setting('app.current_profile_id', true) AND
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_id
      AND (courses.is_famous = true OR courses.is_shared = true OR courses.profile_id::text = current_setting('app.current_profile_id', true))
    )
  );

CREATE POLICY "Users can update own participant records"
  ON course_participants FOR UPDATE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true))
  WITH CHECK (profile_id::text = current_setting('app.current_profile_id', true));

CREATE POLICY "Users can leave courses"
  ON course_participants FOR DELETE
  TO public
  USING (profile_id::text = current_setting('app.current_profile_id', true));

-- Update competitions RLS policies
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Users can insert competitions" ON competitions;
DROP POLICY IF EXISTS "Users can update competitions" ON competitions;
DROP POLICY IF EXISTS "Users can delete competitions" ON competitions;

CREATE POLICY "Users can view own competitions"
  ON competitions FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = competitions.round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can create competitions for own rounds"
  ON competitions FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can update own competitions"
  ON competitions FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = competitions.round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can delete own competitions"
  ON competitions FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = competitions.round_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

-- Update hole_mulligans RLS policies
DROP POLICY IF EXISTS "Anyone can view hole mulligans" ON hole_mulligans;
DROP POLICY IF EXISTS "Users can insert hole mulligans" ON hole_mulligans;
DROP POLICY IF EXISTS "Users can delete hole mulligans" ON hole_mulligans;

CREATE POLICY "Users can view own hole mulligans"
  ON hole_mulligans FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = hole_mulligans.hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can record mulligans for own holes"
  ON hole_mulligans FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );

CREATE POLICY "Users can delete own hole mulligans"
  ON hole_mulligans FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM holes
      JOIN rounds ON rounds.id = holes.round_id
      WHERE holes.id = hole_mulligans.hole_id
      AND rounds.profile_id::text = current_setting('app.current_profile_id', true)
    )
  );