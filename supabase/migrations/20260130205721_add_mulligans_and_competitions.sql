/*
  # Add Mulligan Tracking and Competition Features

  ## Overview
  This migration adds support for mulligan tracking and friendly competition games like skins and nassau.

  ## Changes Made

  ### Tables Modified
  
  #### `rounds`
  - Added `mulligans_allowed` (integer) - Number of mulligans allowed for this round (default 2)
  - Added `mulligans_used` (integer) - Number of mulligans used so far (default 0)
  - Added `total_score` (integer) - Final score for completed rounds (for quick best round queries)
  - Added `course_id` (uuid, nullable) - Reference to course if using a saved course
  
  ### New Tables
  
  #### `competitions`
  Stores friendly competition game data
  - `id` (uuid, primary key) - Unique competition identifier
  - `round_id` (uuid, foreign key) - References rounds table
  - `game_type` (text) - Type of game (skins, nassau, etc.)
  - `bet_amount` (decimal) - Amount per point/hole
  - `results` (jsonb) - Game results and payouts
  - `created_at` (timestamptz) - Competition creation timestamp

  #### `hole_mulligans`
  Tracks which holes had mulligans used
  - `id` (uuid, primary key) - Unique mulligan record identifier
  - `hole_id` (uuid, foreign key) - References holes table
  - `shot_order` (integer) - Which shot was mulligan'd
  - `created_at` (timestamptz) - When mulligan was taken

  ## Security
  - Enable RLS on new tables
  - Public access for viewing (for shared rounds)
  - Anyone can insert/update/delete (will be restricted when auth is added)

  ## Notes
  - Mulligan tracking allows players to retake shots casually
  - Competition results stored as JSONB for flexible game types
  - Total score cached on round for quick "best rounds" queries
*/

-- Add mulligan and score tracking to rounds
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rounds' AND column_name = 'mulligans_allowed'
  ) THEN
    ALTER TABLE rounds ADD COLUMN mulligans_allowed integer NOT NULL DEFAULT 2;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rounds' AND column_name = 'mulligans_used'
  ) THEN
    ALTER TABLE rounds ADD COLUMN mulligans_used integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rounds' AND column_name = 'total_score'
  ) THEN
    ALTER TABLE rounds ADD COLUMN total_score integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rounds' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE rounds ADD COLUMN course_id uuid REFERENCES courses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES rounds(id) ON DELETE CASCADE NOT NULL,
  game_type text NOT NULL,
  bet_amount decimal(10,2) NOT NULL DEFAULT 0,
  results jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create hole_mulligans table
CREATE TABLE IF NOT EXISTS hole_mulligans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hole_id uuid REFERENCES holes(id) ON DELETE CASCADE NOT NULL,
  shot_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_mulligans ENABLE ROW LEVEL SECURITY;

-- Competitions policies
CREATE POLICY "Anyone can view competitions"
  ON competitions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert competitions"
  ON competitions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update competitions"
  ON competitions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete competitions"
  ON competitions FOR DELETE
  TO public
  USING (true);

-- Hole mulligans policies
CREATE POLICY "Anyone can view mulligans"
  ON hole_mulligans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert mulligans"
  ON hole_mulligans FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can delete mulligans"
  ON hole_mulligans FOR DELETE
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_competitions_round_id ON competitions(round_id);
CREATE INDEX IF NOT EXISTS idx_hole_mulligans_hole_id ON hole_mulligans(hole_id);
CREATE INDEX IF NOT EXISTS idx_rounds_total_score ON rounds(profile_id, total_score) WHERE total_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rounds_course_id ON rounds(course_id);
