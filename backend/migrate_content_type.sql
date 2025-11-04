-- Migration: Update ContentType enum to use video, audio, text instead of video, audio, essay, meditation
-- Run this to update the database schema

-- First, convert enum column to varchar temporarily
ALTER TABLE teachings ALTER COLUMN content_type TYPE VARCHAR(50);

-- Drop the old enum type
DROP TYPE IF EXISTS contenttype CASCADE;

-- Create new enum type with video, audio, text
CREATE TYPE contenttype AS ENUM ('video', 'audio', 'text');

-- Update any existing 'essay' or 'meditation' values (if any exist from old data)
UPDATE teachings SET content_type = 'text' WHERE content_type = 'essay';
UPDATE teachings SET content_type = 'audio' WHERE content_type = 'meditation';

-- Convert back to enum type
ALTER TABLE teachings ALTER COLUMN content_type TYPE contenttype USING content_type::contenttype;

-- Verify the changes
SELECT DISTINCT content_type FROM teachings;
