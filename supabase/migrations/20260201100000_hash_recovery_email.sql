-- Convert recovery email to hashed storage for privacy
-- We store only a SHA256 hash of the email, not the actual email
-- This means we can verify emails but can't expose them in a breach

-- Drop existing constraints and column
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS valid_recovery_email;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_recovery_email;
DROP INDEX IF EXISTS idx_profiles_recovery_email;
ALTER TABLE profiles DROP COLUMN IF EXISTS recovery_email;

-- Add the hashed email column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_email_hash TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_recovery_email_hash
ON profiles(recovery_email_hash)
WHERE recovery_email_hash IS NOT NULL;

-- Ensure hashed emails are unique (prevents duplicate registrations)
ALTER TABLE profiles ADD CONSTRAINT unique_recovery_email_hash UNIQUE (recovery_email_hash);

-- Function to hash an email (normalizes to lowercase first)
CREATE OR REPLACE FUNCTION hash_email(email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF email IS NULL OR email = '' THEN
    RETURN NULL;
  END IF;
  -- Normalize to lowercase and hash with SHA256
  RETURN encode(sha256(lower(trim(email))::bytea), 'hex');
END;
$$;

-- Function to find username by email hash
-- User provides plaintext email, we hash it and look up
CREATE OR REPLACE FUNCTION find_username_by_email(input_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_hash TEXT;
  found_username TEXT;
BEGIN
  IF input_email IS NULL OR input_email = '' THEN
    RETURN NULL;
  END IF;

  -- Hash the input email
  email_hash := hash_email(input_email);

  -- Look up the username
  SELECT username INTO found_username
  FROM profiles
  WHERE recovery_email_hash = email_hash;

  RETURN found_username;
END;
$$;

-- Function to check if a user has a recovery email set
CREATE OR REPLACE FUNCTION has_recovery_email(p_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_email BOOLEAN;
BEGIN
  SELECT recovery_email_hash IS NOT NULL INTO has_email
  FROM profiles
  WHERE id = p_profile_id;

  RETURN COALESCE(has_email, false);
END;
$$;
