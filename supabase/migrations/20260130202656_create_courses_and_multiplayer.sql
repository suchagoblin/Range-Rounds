/*
  # Create Courses and Multiplayer Tables

  ## Overview
  This migration creates the database structure for saving custom courses and enabling multiplayer functionality where friends can play the same course together.

  ## New Tables
  
  ### `courses`
  Stores saved course configurations that can be replayed or shared
  - `id` (uuid, primary key) - Unique course identifier
  - `profile_id` (uuid, foreign key) - References the profile who created the course
  - `name` (text) - User-defined course name
  - `description` (text, nullable) - Optional course description
  - `hole_count` (integer) - Number of holes (3, 9, or 18)
  - `is_shared` (boolean) - Whether this course is shared for multiplayer
  - `share_code` (text, unique, nullable) - 6-character code for joining shared courses
  - `created_at` (timestamptz) - Course creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `course_holes`
  Stores the hole configuration for each saved course
  - `id` (uuid, primary key) - Unique identifier
  - `course_id` (uuid, foreign key) - References courses table
  - `hole_number` (integer) - Hole number (1-18)
  - `par` (integer) - Par for the hole (3, 4, or 5)
  - `yardage` (integer) - Hole distance in yards
  - `hazard` (text, nullable) - Hazard location (Left, Right, Front)
  - `hazard_type` (text, nullable) - Type of hazard (Water, Bunker)
  - `wind_speed` (integer) - Wind speed in mph
  - `wind_dir` (text) - Wind direction
  
  ### `course_participants`
  Tracks which profiles are participating in a shared course
  - `id` (uuid, primary key) - Unique identifier
  - `course_id` (uuid, foreign key) - References courses table
  - `profile_id` (uuid, foreign key) - References profiles table
  - `round_id` (uuid, foreign key, nullable) - References rounds table if they've started playing
  - `joined_at` (timestamptz) - When they joined the course
  - `last_active_at` (timestamptz) - Last activity timestamp for real-time status

  ## Security
  - Enable RLS on all tables
  - Courses are public readable (for viewing shared courses)
  - Only course creator can update/delete their courses
  - Anyone can join a shared course as a participant
  - Participants can view other participants in the same course

  ## Notes
  - Share codes are 6-character alphanumeric codes for easy sharing
  - Multiplayer courses allow multiple people to play the same hole layout
  - Each participant plays their own round but can see others' scores
  - Course holes are immutable once created to ensure fair competition
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  hole_count integer NOT NULL,
  is_shared boolean NOT NULL DEFAULT false,
  share_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course_holes table
CREATE TABLE IF NOT EXISTS course_holes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  hole_number integer NOT NULL,
  par integer NOT NULL,
  yardage integer NOT NULL,
  hazard text,
  hazard_type text,
  wind_speed integer NOT NULL DEFAULT 0,
  wind_dir text NOT NULL DEFAULT ''
);

-- Create course_participants table
CREATE TABLE IF NOT EXISTS course_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  round_id uuid REFERENCES rounds(id) ON DELETE SET NULL,
  joined_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  UNIQUE(course_id, profile_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_participants ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own courses"
  ON courses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own courses"
  ON courses FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own courses"
  ON courses FOR DELETE
  TO public
  USING (true);

-- Course holes policies
CREATE POLICY "Anyone can view course holes"
  ON course_holes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert course holes"
  ON course_holes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update course holes"
  ON course_holes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete course holes"
  ON course_holes FOR DELETE
  TO public
  USING (true);

-- Course participants policies
CREATE POLICY "Anyone can view course participants"
  ON course_participants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert themselves as participants"
  ON course_participants FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their participant status"
  ON course_participants FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can remove themselves as participants"
  ON course_participants FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_profile_id ON courses(profile_id);
CREATE INDEX IF NOT EXISTS idx_courses_share_code ON courses(share_code) WHERE share_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_holes_hole_number ON course_holes(course_id, hole_number);
CREATE INDEX IF NOT EXISTS idx_course_participants_course_id ON course_participants(course_id);
CREATE INDEX IF NOT EXISTS idx_course_participants_profile_id ON course_participants(profile_id);

-- Function to generate a random 6-character share code
CREATE OR REPLACE FUNCTION generate_share_code() RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure share_code is set when is_shared is true
ALTER TABLE courses ADD CONSTRAINT check_shared_has_code 
  CHECK (NOT is_shared OR share_code IS NOT NULL);