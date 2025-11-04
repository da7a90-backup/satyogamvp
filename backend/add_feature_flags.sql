-- Migration to add feature flags to teachings table
-- These flags allow marking teachings as featured, of the month, or pinned

-- Add featured column (for teachings)
ALTER TABLE teachings ADD COLUMN IF NOT EXISTS featured VARCHAR(50) DEFAULT NULL;

-- Add of_the_month column (for guided meditations)
ALTER TABLE teachings ADD COLUMN IF NOT EXISTS of_the_month VARCHAR(50) DEFAULT NULL;

-- Add pinned column (for essays)
ALTER TABLE teachings ADD COLUMN IF NOT EXISTS pinned VARCHAR(50) DEFAULT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teachings_featured ON teachings(featured) WHERE featured IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teachings_of_the_month ON teachings(of_the_month) WHERE of_the_month IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teachings_pinned ON teachings(pinned) WHERE pinned IS NOT NULL;

-- Optional: Set a default featured teaching (most recent one)
-- UPDATE teachings
-- SET featured = 'teaching'
-- WHERE id = (
--     SELECT id FROM teachings
--     WHERE category = 'video_teaching'
--     ORDER BY published_date DESC
--     LIMIT 1
-- );
