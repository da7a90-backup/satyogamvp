-- Add trial support fields to subscriptions table
-- Migration: 022_add_subscription_trial_fields.sql

-- Add TRIAL status to subscription_status enum (uppercase to match existing values)
ALTER TYPE subscriptionstatus ADD VALUE IF NOT EXISTS 'TRIAL';

-- Add trial_end_date column for tracking when trial ends
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP;

-- Add frequency column to track monthly vs annual
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS frequency VARCHAR(20);

-- Add Tilopay subscription ID for managing recurring payments
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS tilopay_subscription_id VARCHAR(255);

-- Create index on trial_end_date for efficient cron job queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end_date
ON subscriptions(trial_end_date)
WHERE trial_end_date IS NOT NULL AND status = 'TRIAL';

-- Create index on status for quick filtering
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
ON subscriptions(status);
