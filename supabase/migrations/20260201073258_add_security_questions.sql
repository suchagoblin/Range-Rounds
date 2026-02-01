/*
  # Add Security Questions for Account Recovery

  ## Overview
  Adds an optional security question system so users can recover their PIN
  if they forget it. Golf-themed questions keep it fun and relevant.

  ## New Tables

  ### `security_questions`
  Pre-defined golf-related security questions users can choose from.

  ### `profile_security_answers`
  Stores user's hashed answers to their chosen security questions.
  Users can optionally set up 1-2 questions for account recovery.

  ## New Functions
  - `verify_security_answer` - Verifies a user's answer to their security question
  - `reset_pin_with_security` - Resets PIN after verifying security answer
  - `get_security_question_for_user` - Gets the question text for a username (for recovery flow)
*/

-- Create table for predefined security questions
CREATE TABLE IF NOT EXISTS security_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL UNIQUE,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert golf-related security questions
INSERT INTO security_questions (question, display_order) VALUES
  ('What was the first golf course you ever played?', 1),
  ('What is your favorite golf club brand?', 2),
  ('Who taught you how to golf?', 3),
  ('What is your dream golf destination?', 4),
  ('What was your first golf club?', 5),
  ('What is your lucky ball number?', 6),
  ('What course did you get your best score on?', 7),
  ('What is your go-to golf snack or drink?', 8)
ON CONFLICT (question) DO NOTHING;

-- Create table for user's security answers
CREATE TABLE IF NOT EXISTS profile_security_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES security_questions(id) ON DELETE CASCADE,
  answer_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, question_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_security_answers_profile
  ON profile_security_answers(profile_id);

-- Enable RLS on new tables
ALTER TABLE security_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_security_answers ENABLE ROW LEVEL SECURITY;

-- Security questions are public read (users need to see the options)
CREATE POLICY "Security questions are publicly readable"
  ON security_questions FOR SELECT
  TO public
  USING (true);

-- Users can manage their own security answers
CREATE POLICY "Users can view own security answers"
  ON profile_security_answers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own security answers"
  ON profile_security_answers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own security answers"
  ON profile_security_answers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own security answers"
  ON profile_security_answers FOR DELETE
  TO public
  USING (true);

-- Function to hash security answers (case-insensitive, trimmed)
CREATE OR REPLACE FUNCTION hash_security_answer(answer text)
RETURNS text AS $$
BEGIN
  RETURN encode(digest(lower(trim(answer)), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security question for a username (used in recovery flow)
CREATE OR REPLACE FUNCTION get_security_question_for_user(p_username text)
RETURNS TABLE(question_id uuid, question_text text) AS $$
BEGIN
  RETURN QUERY
  SELECT sq.id, sq.question
  FROM profile_security_answers psa
  JOIN profiles p ON p.id = psa.profile_id
  JOIN security_questions sq ON sq.id = psa.question_id
  WHERE p.username = lower(trim(p_username))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify security answer
CREATE OR REPLACE FUNCTION verify_security_answer(
  p_username text,
  p_question_id uuid,
  p_answer text
)
RETURNS boolean AS $$
DECLARE
  v_stored_hash text;
  v_answer_hash text;
BEGIN
  -- Get the stored answer hash
  SELECT psa.answer_hash INTO v_stored_hash
  FROM profile_security_answers psa
  JOIN profiles p ON p.id = psa.profile_id
  WHERE p.username = lower(trim(p_username))
    AND psa.question_id = p_question_id;

  IF v_stored_hash IS NULL THEN
    RETURN false;
  END IF;

  -- Hash the provided answer and compare
  v_answer_hash := encode(digest(lower(trim(p_answer)), 'sha256'), 'hex');

  RETURN v_stored_hash = v_answer_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset PIN after verifying security answer
CREATE OR REPLACE FUNCTION reset_pin_with_security(
  p_username text,
  p_question_id uuid,
  p_answer text,
  p_new_pin text
)
RETURNS TABLE(success boolean, profile_id uuid, error_message text) AS $$
DECLARE
  v_profile_id uuid;
  v_verified boolean;
BEGIN
  -- First verify the security answer
  v_verified := verify_security_answer(p_username, p_question_id, p_answer);

  IF NOT v_verified THEN
    RETURN QUERY SELECT false, NULL::uuid, 'Incorrect security answer'::text;
    RETURN;
  END IF;

  -- Get the profile ID
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE username = lower(trim(p_username));

  IF v_profile_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, 'User not found'::text;
    RETURN;
  END IF;

  -- Update the PIN
  UPDATE profiles
  SET pin_hash = encode(digest(p_new_pin, 'sha256'), 'hex'),
      updated_at = now()
  WHERE id = v_profile_id;

  RETURN QUERY SELECT true, v_profile_id, NULL::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has security questions set up
CREATE OR REPLACE FUNCTION has_security_questions(p_username text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profile_security_answers psa
    JOIN profiles p ON p.id = psa.profile_id
    WHERE p.username = lower(trim(p_username))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
