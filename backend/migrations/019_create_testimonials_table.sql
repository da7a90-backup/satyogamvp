-- Migration: Create testimonials table
-- Date: 2026-01-21
-- Description: Add support for product testimonials/reviews

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quote TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_location VARCHAR(255),
    author_avatar_url VARCHAR(500),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testimonials_product_id ON testimonials(product_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_order_index ON testimonials(order_index);

-- Add comment explaining the table
COMMENT ON TABLE testimonials IS 'Product testimonials and customer reviews';
COMMENT ON COLUMN testimonials.order_index IS 'Used for manual sorting of testimonials display order';
COMMENT ON COLUMN testimonials.is_active IS 'Toggle to show/hide testimonials without deleting them';
