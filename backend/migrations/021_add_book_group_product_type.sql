-- Migration: Add BOOK_GROUP_PORTAL_ACCESS to ProductType enum
-- This allows products to be linked to book group portals in the store

-- Add the new enum value to the producttype enum
ALTER TYPE producttype ADD VALUE IF NOT EXISTS 'BOOK_GROUP_PORTAL_ACCESS';

-- Note: PostgreSQL doesn't allow removing enum values easily, so this is additive only
-- The new value will allow products to be created with type='BOOK_GROUP_PORTAL_ACCESS'
-- which can then be linked to book_groups via the store_product_id foreign key
