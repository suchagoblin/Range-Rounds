/*
  # Add Wind Settings to Profiles

  1. Changes
    - Add `wind_enabled` boolean column to profiles table (default: false)
    - Add `wind_speed` integer column to profiles table (default: 10)
    - Add `wind_direction` text column to profiles table (default: 'Headwind')
  
  2. Purpose
    - Allow users to toggle wind effects on/off
    - Let users manually set their real-life wind conditions
    - Store wind preferences for consistent gameplay
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wind_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wind_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wind_speed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wind_speed integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wind_direction'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wind_direction text DEFAULT 'Headwind';
  END IF;
END $$;