-- Migration: Add email verification fields to users table
-- Description: Adds email_verified, email_verification_token, and email_verification_token_expires columns for email verification flow
-- Date: 2026-01-09

-- Add email verification columns to users table
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255) NULL,
ADD COLUMN email_verification_token_expires TIMESTAMP NULL;

-- Add index for token lookups (for performance)
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_email_verified ON users(email_verified);

-- Update all existing users to have verified emails (grandfathering in existing users)
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN users.email_verified IS 'Indicates whether the user has verified their email address';
COMMENT ON COLUMN users.email_verification_token IS 'Token used for email verification, valid for 7 days';
COMMENT ON COLUMN users.email_verification_token_expires IS 'Expiration timestamp for the verification token';
