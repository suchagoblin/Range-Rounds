-- Add recovery_email column to profiles for username recovery
-- This is OPTIONAL and users can choose whether to provide it

-- Add the recovery_email column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;

-- Create an index for faster lookups during username recovery
CREATE INDEX IF NOT EXISTS idx_profiles_recovery_email
ON profiles(recovery_email)
WHERE recovery_email IS NOT NULL;

-- Add a check constraint to ensure emails look valid (basic format)
ALTER TABLE profiles ADD CONSTRAINT valid_recovery_email
CHECK (recovery_email IS NULL OR recovery_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure recovery emails are unique (no two users with the same email)
ALTER TABLE profiles ADD CONSTRAINT unique_recovery_email UNIQUE (recovery_email);

-- Note: recovery_email is nullable, allowing users to opt out of email recovery
-- The email is stored in plaintext as it's needed for lookups
-- Users should be informed of this in the UI
