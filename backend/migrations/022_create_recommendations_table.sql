-- Migration: Create recommendations table
-- Date: 2026-01-22
-- Description: Add Shunyamurti Recommends feature (books and documentaries) for GYANI+ members

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    recommendation_type VARCHAR(50) NOT NULL,

    -- Book-specific fields
    author VARCHAR(255),
    amazon_url VARCHAR(500),
    cover_image_url VARCHAR(500),

    -- Documentary-specific fields
    youtube_id VARCHAR(100),
    duration INTEGER,
    thumbnail_url VARCHAR(500),

    -- Common fields
    category VARCHAR(100),
    access_level VARCHAR(50) NOT NULL DEFAULT 'gyani',
    display_order INTEGER NOT NULL DEFAULT 0,
    published_date TIMESTAMP WITHOUT TIME ZONE,

    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recommendations_slug ON recommendations(slug);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category);
CREATE INDEX IF NOT EXISTS idx_recommendations_access_level ON recommendations(access_level);
CREATE INDEX IF NOT EXISTS idx_recommendations_display_order ON recommendations(display_order);
CREATE INDEX IF NOT EXISTS idx_recommendations_published_date ON recommendations(published_date);

-- Add comments explaining the table
COMMENT ON TABLE recommendations IS 'Shunyamurti Recommends - Books and Documentaries (GYANI+ access)';
COMMENT ON COLUMN recommendations.recommendation_type IS 'Type of recommendation: "book" or "documentary"';
COMMENT ON COLUMN recommendations.author IS 'Book author name (for books only)';
COMMENT ON COLUMN recommendations.amazon_url IS 'Amazon affiliate link (for books only)';
COMMENT ON COLUMN recommendations.cover_image_url IS 'Book cover image URL from Cloudflare Images (for books only)';
COMMENT ON COLUMN recommendations.youtube_id IS 'YouTube video ID (for documentaries only)';
COMMENT ON COLUMN recommendations.duration IS 'Documentary duration in seconds (for documentaries only)';
COMMENT ON COLUMN recommendations.thumbnail_url IS 'YouTube thumbnail URL (for documentaries only)';
COMMENT ON COLUMN recommendations.category IS 'Category tag (e.g., "Spirituality", "Philosophy", "Psychology")';
COMMENT ON COLUMN recommendations.access_level IS 'Minimum membership tier required (default: "gyani" for GYANI+)';
COMMENT ON COLUMN recommendations.display_order IS 'Manual ordering for display (lower numbers appear first)';
COMMENT ON COLUMN recommendations.published_date IS 'When this recommendation was published';
