-- Migration: Add dashboard tour status field to users table
-- Description: Adds has_seen_dashboard_tour boolean column to track if user has completed the dashboard tour
-- Date: 2025-01-26

-- Add has_seen_dashboard_tour column to users table
ALTER TABLE users
ADD COLUMN has_seen_dashboard_tour BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for performance (optional, but useful for queries)
CREATE INDEX idx_users_dashboard_tour ON users(has_seen_dashboard_tour);

-- Update existing users to have tour not seen (default)
-- This is already handled by the DEFAULT FALSE, but explicitly documenting
COMMENT ON COLUMN users.has_seen_dashboard_tour IS 'Indicates whether the user has completed the dashboard onboarding tour';
