-- Migration: Add hero image and map image to contact_info table
-- Date: 2025-11-04

-- Add hero_image column
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS hero_image VARCHAR(500);

-- Add map_image column
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS map_image VARCHAR(500);

-- Add form_fields column to store form configuration
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN contact_info.hero_image IS 'URL to the hero/banner image for the contact page';
COMMENT ON COLUMN contact_info.map_image IS 'URL to the map image showing location';
COMMENT ON COLUMN contact_info.form_fields IS 'JSON configuration for form fields';
