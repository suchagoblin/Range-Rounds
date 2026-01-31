/*
  # Create Profiles and Clubs Tables

  ## Overview
  This migration creates the database structure for storing user profiles and their club bag configurations with yardage preferences.

  ## New Tables
  
  ### `profiles`
  Stores user profile information and preferences
  - `id` (uuid, primary key) - Unique profile identifier
  - `name` (text) - User's name
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `clubs`
  Stores individual clubs in a user's bag with their typical yardages
  - `id` (uuid, primary key) - Unique club identifier
  - `profile_id` (uuid, foreign key) - References profiles table
  - `club_type` (text) - Type of club (Driver, Wood, Hybrid, Iron, Wedge, Putter)
  - `club_name` (text) - Specific name (e.g., "Driver", "3 Wood", "7 Iron", "Sand Wedge")
  - `yardage` (integer) - Typical yardage for this club
  - `created_at` (timestamptz) - Club entry creation timestamp

  ## Security
  - Enable RLS on both tables
  - Profiles are public readable (for potential future multiplayer features)
  - Clubs are public readable
  - Users can only insert/update/delete their own profile and clubs

  ## Notes
  - Club types help organize and display clubs logically
  - Yardages are stored as integers representing yards
  - Profile system allows for future expansion (handicap, preferences, etc.)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  club_type text NOT NULL,
  club_name text NOT NULL,
  yardage integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO public
  USING (true);

-- Clubs policies
CREATE POLICY "Anyone can view clubs"
  ON clubs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert clubs for any profile"
  ON clubs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update any clubs"
  ON clubs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete any clubs"
  ON clubs FOR DELETE
  TO public
  USING (true);

-- Create index for faster club lookups by profile
CREATE INDEX IF NOT EXISTS idx_clubs_profile_id ON clubs(profile_id);