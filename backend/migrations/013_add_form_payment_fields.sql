-- Migration 013: Add payment fields to form_submissions table
-- This migration extends form_submissions to support application payments

-- Add payment-related columns
ALTER TABLE form_submissions ADD COLUMN retreat_id UUID;
ALTER TABLE form_submissions ADD COLUMN payment_amount NUMERIC(10, 2);
ALTER TABLE form_submissions ADD COLUMN payment_id UUID;
ALTER TABLE form_submissions ADD COLUMN order_id UUID;
ALTER TABLE form_submissions ADD COLUMN payment_link_sent_at TIMESTAMP;

-- Add foreign key constraints
ALTER TABLE form_submissions
    ADD CONSTRAINT fk_form_sub_retreat
    FOREIGN KEY (retreat_id) REFERENCES retreats(id) ON DELETE SET NULL;

ALTER TABLE form_submissions
    ADD CONSTRAINT fk_form_sub_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

ALTER TABLE form_submissions
    ADD CONSTRAINT fk_form_sub_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_form_sub_retreat ON form_submissions(retreat_id);
CREATE INDEX idx_form_sub_payment ON form_submissions(payment_id);
CREATE INDEX idx_form_sub_order ON form_submissions(order_id);
CREATE INDEX idx_form_sub_status ON form_submissions(status);

-- Update existing pending submissions to use new status values
-- No need to alter status column as it's a VARCHAR/String in SQLAlchemy
-- The application code will handle the new status values:
-- "pending", "reviewed", "approved", "payment_sent", "paid", "rejected"

-- Note: For SQLite, the status column is already flexible (String type)
-- For PostgreSQL, if using ENUM type, would need:
-- ALTER TYPE submission_status_enum ADD VALUE 'approved';
-- ALTER TYPE submission_status_enum ADD VALUE 'payment_sent';
-- ALTER TYPE submission_status_enum ADD VALUE 'paid';
-- ALTER TYPE submission_status_enum ADD VALUE 'rejected';
