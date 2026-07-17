-- Migration: Add family_code to profiles
-- Run this on existing databases (new ones use 00_schema.sql which already includes it)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS family_code TEXT;

-- Optional: unique index so two users don't accidentally share the same code
-- (commented out by default — enable if needed)
-- CREATE UNIQUE INDEX IF NOT EXISTS profiles_family_code_unique ON profiles (family_code) WHERE family_code IS NOT NULL;

COMMENT ON COLUMN profiles.family_code IS 'Shared code for family group access (read-only for family_member role)';
