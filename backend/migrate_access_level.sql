-- Migration: Update AccessLevel enum to use lowercase values to match Python model

-- Convert column to varchar temporarily
ALTER TABLE teachings ALTER COLUMN access_level TYPE VARCHAR(50);

-- Drop old enum
DROP TYPE IF EXISTS accesslevel CASCADE;

-- Create new enum with lowercase values
CREATE TYPE accesslevel AS ENUM ('free', 'preview', 'gyani', 'pragyani', 'pragyani_plus');

-- Update existing values to lowercase
UPDATE teachings SET access_level = LOWER(access_level);

-- Convert back to enum
ALTER TABLE teachings ALTER COLUMN access_level TYPE accesslevel USING access_level::accesslevel;

-- Verify
SELECT DISTINCT access_level FROM teachings;
