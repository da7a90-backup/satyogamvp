-- Migration to add topic and filter_tags to teachings table
-- These fields allow filtering teachings by topic and custom tags

-- Add topic column for main topic filtering
ALTER TABLE teachings ADD COLUMN IF NOT EXISTS topic VARCHAR(100) DEFAULT NULL;

-- Add filter_tags column for additional filterable attributes
ALTER TABLE teachings ADD COLUMN IF NOT EXISTS filter_tags JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_teachings_topic ON teachings(topic) WHERE topic IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teachings_filter_tags ON teachings USING GIN(filter_tags) WHERE filter_tags IS NOT NULL;

-- Example: Update some teachings with topic (optional)
-- UPDATE teachings SET topic = 'Consciousness' WHERE title ILIKE '%consciousness%';
-- UPDATE teachings SET topic = 'Meditation' WHERE category = 'guided_meditation';
-- UPDATE teachings SET topic = 'Yoga' WHERE title ILIKE '%yoga%';
