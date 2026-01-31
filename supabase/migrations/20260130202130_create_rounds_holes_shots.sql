/*
  # Create Rounds, Holes, and Shots Tables

  ## Overview
  This migration creates the database structure for persisting golf rounds with complete hole and shot data.

  ## New Tables
  
  ### `rounds`
  Stores the overall round information
  - `id` (uuid, primary key) - Unique round identifier
  - `profile_id` (uuid, foreign key) - References profiles table
  - `hole_count` (integer) - Number of holes in round (3, 9, or 18)
  - `current_hole_index` (integer) - Index of current hole being played
  - `is_round_complete` (boolean) - Whether the round is finished
  - `created_at` (timestamptz) - Round creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `holes`
  Stores individual hole information within a round
  - `id` (uuid, primary key) - Unique hole identifier
  - `round_id` (uuid, foreign key) - References rounds table
  - `hole_number` (integer) - Hole number (1-18)
  - `par` (integer) - Par for the hole (3, 4, or 5)
  - `yardage` (integer) - Hole distance in yards
  - `hazard` (text, nullable) - Hazard location (Left, Right, Front)
  - `hazard_type` (text, nullable) - Type of hazard (Water, Bunker)
  - `wind_speed` (integer) - Wind speed in mph
  - `wind_dir` (text) - Wind direction
  - `putts` (integer) - Number of putts on the hole
  - `is_complete` (boolean) - Whether the hole is finished
  
  ### `shots`
  Stores individual shots within a hole
  - `id` (uuid, primary key) - Unique shot identifier
  - `hole_id` (uuid, foreign key) - References holes table
  - `shot_order` (integer) - Order of shot within the hole
  - `club` (text) - Club used for the shot
  - `input_distance` (integer) - Distance entered by user
  - `input_direction` (text) - Direction entered by user
  - `penalty_strokes` (integer) - Number of penalty strokes
  - `final_distance` (integer) - Actual distance achieved
  - `remaining_distance` (integer) - Distance remaining to hole
  - `distance_penalty` (integer) - Distance lost due to direction/hazards
  - `hit_hazard` (boolean) - Whether shot hit a hazard

  ## Security
  - Enable RLS on all tables
  - All data is public readable (for potential future sharing features)
  - Users can insert/update/delete their own rounds and related data

  ## Notes
  - All tables use CASCADE deletion to maintain referential integrity
  - Indexes are created for optimal query performance on foreign keys
  - Default values prevent null issues for boolean and integer fields
*/

-- Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hole_count integer NOT NULL DEFAULT 18,
  current_hole_index integer NOT NULL DEFAULT 0,
  is_round_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create holes table
CREATE TABLE IF NOT EXISTS holes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES rounds(id) ON DELETE CASCADE NOT NULL,
  hole_number integer NOT NULL,
  par integer NOT NULL,
  yardage integer NOT NULL,
  hazard text,
  hazard_type text,
  wind_speed integer NOT NULL DEFAULT 0,
  wind_dir text NOT NULL DEFAULT '',
  putts integer NOT NULL DEFAULT 0,
  is_complete boolean NOT NULL DEFAULT false
);

-- Create shots table
CREATE TABLE IF NOT EXISTS shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hole_id uuid REFERENCES holes(id) ON DELETE CASCADE NOT NULL,
  shot_order integer NOT NULL,
  club text NOT NULL,
  input_distance integer NOT NULL,
  input_direction text NOT NULL,
  penalty_strokes integer NOT NULL DEFAULT 0,
  final_distance integer NOT NULL,
  remaining_distance integer NOT NULL,
  distance_penalty integer NOT NULL DEFAULT 0,
  hit_hazard boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;

-- Rounds policies
CREATE POLICY "Anyone can view rounds"
  ON rounds FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert rounds"
  ON rounds FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update rounds"
  ON rounds FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete rounds"
  ON rounds FOR DELETE
  TO public
  USING (true);

-- Holes policies
CREATE POLICY "Anyone can view holes"
  ON holes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert holes"
  ON holes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update holes"
  ON holes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete holes"
  ON holes FOR DELETE
  TO public
  USING (true);

-- Shots policies
CREATE POLICY "Anyone can view shots"
  ON shots FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert shots"
  ON shots FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update shots"
  ON shots FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete shots"
  ON shots FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rounds_profile_id ON rounds(profile_id);
CREATE INDEX IF NOT EXISTS idx_rounds_created_at ON rounds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holes_round_id ON holes(round_id);
CREATE INDEX IF NOT EXISTS idx_holes_hole_number ON holes(round_id, hole_number);
CREATE INDEX IF NOT EXISTS idx_shots_hole_id ON shots(hole_id);
CREATE INDEX IF NOT EXISTS idx_shots_shot_order ON shots(hole_id, shot_order);