-- Migration: Add application_form_slug and product_component_data to retreats table
-- Created: 2026-01-09
-- Purpose: Link retreats to their application forms and store product component data

-- Add application_form_slug column
ALTER TABLE retreats ADD COLUMN IF NOT EXISTS application_form_slug VARCHAR(255);

-- Add product_component_data column (JSON)
ALTER TABLE retreats ADD COLUMN IF NOT EXISTS product_component_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN retreats.application_form_slug IS 'Slug of the form template to use for retreat applications';
COMMENT ON COLUMN retreats.product_component_data IS 'JSON data for ProductComponent (booking widget): prices, dates, images, etc.';
