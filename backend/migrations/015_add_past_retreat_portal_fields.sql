-- Migration: Add Past Retreat Portal Media Fields
-- Date: 2026-01-15
-- Description: Add fields to support past retreat portal media management and store publishing

-- Add columns to retreats table
ALTER TABLE retreats
  ADD COLUMN IF NOT EXISTS past_retreat_portal_media JSONB,
  ADD COLUMN IF NOT EXISTS is_published_to_store BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS store_product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_retreats_store_product ON retreats(store_product_id);
CREATE INDEX IF NOT EXISTS idx_retreats_published_to_store ON retreats(is_published_to_store);
CREATE INDEX IF NOT EXISTS idx_retreats_end_date ON retreats(end_date);

-- Add comment for documentation
COMMENT ON COLUMN retreats.past_retreat_portal_media IS 'Admin-edited media items for past retreats: [{title, subtitle, description, video_url, audio_url, order}]';
COMMENT ON COLUMN retreats.is_published_to_store IS 'Flag indicating if this retreat has been published to the Dharma Bandhara store';
COMMENT ON COLUMN retreats.store_product_id IS 'Reference to the product in the store if published';
