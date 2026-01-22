-- Migration: Create hidden_tags table
-- Description: Create the hidden_tags table for managing which content appears on which marketing pages
-- Date: 2026-01-02

-- Create hidden_tags table
CREATE TABLE IF NOT EXISTS hidden_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('teaching', 'blog', 'product', 'retreat', 'event')),
    page_tag VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hidden_tags_page_tag ON hidden_tags(page_tag);
CREATE INDEX IF NOT EXISTS idx_hidden_tags_entity_id ON hidden_tags(entity_id);
CREATE INDEX IF NOT EXISTS idx_hidden_tags_entity_type ON hidden_tags(entity_type);
CREATE INDEX IF NOT EXISTS idx_hidden_tags_page_entity ON hidden_tags(page_tag, entity_type);

-- Create unique constraint to prevent duplicate tags
CREATE UNIQUE INDEX IF NOT EXISTS idx_hidden_tags_unique
ON hidden_tags(entity_id, entity_type, page_tag);

-- Add comment
COMMENT ON TABLE hidden_tags IS 'Maps content entities (teachings, blog posts, products, etc.) to marketing pages for featured display';
COMMENT ON COLUMN hidden_tags.entity_id IS 'ID of the teaching, blog post, product, retreat, or event';
COMMENT ON COLUMN hidden_tags.entity_type IS 'Type of entity: teaching, blog, product, retreat, event';
COMMENT ON COLUMN hidden_tags.page_tag IS 'Page tag (e.g., homepage/teachings, about/satyoga/blog, about/shunyamurti/books)';
COMMENT ON COLUMN hidden_tags.order_index IS 'Display order within the page section (lower = earlier)';
