-- Migration: Add overview_sections field to retreats table
-- Purpose: Allow admins to add multiple retreat summary sections with images in the Overview tab
-- Date: 2025-01-15

ALTER TABLE retreats
  ADD COLUMN IF NOT EXISTS overview_sections JSONB;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_retreats_overview_sections ON retreats USING GIN (overview_sections);

-- Note: JSONB format expected: [{"image_url": "https://...", "content": "..."}]
