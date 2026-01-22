-- Add fields for retreat application workflow
-- Supports zoom scheduling, payment links, and enhanced status tracking

ALTER TABLE form_submissions
ADD COLUMN IF NOT EXISTS zoom_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS zoom_scheduled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);

-- Add index on retreat_id for filtering
CREATE INDEX IF NOT EXISTS idx_form_submissions_retreat_id ON form_submissions(retreat_id);

-- Update status field to support new values
-- Status values: "pending", "zoom_scheduled", "approved", "payment_sent", "paid", "rejected"
COMMENT ON COLUMN form_submissions.status IS 'Application status: pending, zoom_scheduled, approved, payment_sent, paid, rejected';
COMMENT ON COLUMN form_submissions.zoom_link IS 'Zoom meeting URL for pre-approval interview';
COMMENT ON COLUMN form_submissions.zoom_scheduled_at IS 'When zoom call was scheduled';
COMMENT ON COLUMN form_submissions.payment_link IS 'Tilopay payment URL sent to approved applicant';
