-- Migration: Add image_gravity column to section_content table
-- Date: 2026-01-21
-- Description: Add support for image positioning (gravity) in hero sections

-- Add image_gravity column to section_content
ALTER TABLE section_content
ADD COLUMN IF NOT EXISTS image_gravity VARCHAR(50);

-- Add comment explaining the column
COMMENT ON COLUMN section_content.image_gravity IS 'Image positioning for hero/background images. Values: top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right';

-- Optional: Set default value for existing hero sections (center is most common)
UPDATE section_content
SET image_gravity = 'center'
WHERE image_gravity IS NULL
  AND (background_image IS NOT NULL OR image_url IS NOT NULL);
