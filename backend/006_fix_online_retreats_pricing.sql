-- ============================================================================
-- FIX ONLINE RETREATS TABLE - Add proper pricing structure
-- ============================================================================

-- Add missing columns for complete pricing structure
ALTER TABLE online_retreats
  ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS price_options JSONB,
  ADD COLUMN IF NOT EXISTS member_discount_percentage INTEGER,
  ADD COLUMN IF NOT EXISTS scholarship_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS scholarship_deadline VARCHAR(200),
  ADD COLUMN IF NOT EXISTS application_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS schedule_tagline VARCHAR(200),
  ADD COLUMN IF NOT EXISTS schedule_title VARCHAR(500),
  ADD COLUMN IF NOT EXISTS schedule_items JSONB,
  ADD COLUMN IF NOT EXISTS intro3_title TEXT,
  ADD COLUMN IF NOT EXISTS intro3_content JSONB,
  ADD COLUMN IF NOT EXISTS testimonial_tagline VARCHAR(200),
  ADD COLUMN IF NOT EXISTS testimonial_heading VARCHAR(500);

-- Drop old single price column since we now have base_price and price_options
ALTER TABLE online_retreats DROP COLUMN IF EXISTS price;

-- Update indexes
CREATE INDEX IF NOT EXISTS idx_online_retreats_active_date ON online_retreats(is_active, fixed_date);

COMMENT ON COLUMN online_retreats.base_price IS 'Base price (usually the limited access price)';
COMMENT ON COLUMN online_retreats.price_options IS 'Array of pricing options with type, label, price, description';
COMMENT ON COLUMN online_retreats.member_discount_percentage IS 'Discount percentage for members (e.g., 10 for 10%)';
COMMENT ON COLUMN online_retreats.scholarship_available IS 'Whether scholarships are available for this retreat';
