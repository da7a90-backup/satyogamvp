-- Migration: Add dynamic form template system
-- Description: Creates tables for configurable forms (applications, questionnaires, etc.)
-- Date: 2025-11-04

-- Form templates table
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('application', 'questionnaire', 'scholarship', 'feedback', 'custom')),

    -- Display content
    title VARCHAR(500) NOT NULL,
    description TEXT,
    introduction TEXT,

    -- Configuration
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_multi_page BOOLEAN NOT NULL DEFAULT FALSE,
    requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
    allow_anonymous BOOLEAN NOT NULL DEFAULT TRUE,

    -- Submission settings
    success_message TEXT,
    success_redirect VARCHAR(500),
    send_confirmation_email BOOLEAN NOT NULL DEFAULT FALSE,
    notification_emails JSONB,

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Indexes
    CONSTRAINT pk_form_templates PRIMARY KEY (id)
);

CREATE INDEX idx_form_templates_slug ON form_templates(slug);
CREATE INDEX idx_form_templates_category ON form_templates(category);
CREATE INDEX idx_form_templates_is_active ON form_templates(is_active);


-- Form questions table
CREATE TABLE IF NOT EXISTS form_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,

    -- Question content
    question_text TEXT NOT NULL,
    description TEXT,
    placeholder VARCHAR(255),

    -- Question type and validation
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN (
        'text', 'textarea', 'email', 'tel', 'date', 'number',
        'radio', 'checkbox', 'dropdown', 'file', 'heading', 'paragraph'
    )),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,

    -- Layout
    page_number INTEGER NOT NULL DEFAULT 1 CHECK (page_number >= 1),
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    section_heading VARCHAR(500),

    -- Options (for radio, checkbox, dropdown)
    options JSONB,
    allow_other BOOLEAN NOT NULL DEFAULT FALSE,

    -- Validation rules
    validation_rules JSONB,

    -- Conditional logic
    conditional_logic JSONB,

    -- File upload settings
    allowed_file_types JSONB,
    max_file_size INTEGER,

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Indexes
    CONSTRAINT pk_form_questions PRIMARY KEY (id)
);

CREATE INDEX idx_form_questions_form_template_id ON form_questions(form_template_id);
CREATE INDEX idx_form_questions_page_order ON form_questions(form_template_id, page_number, order_index);


-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Submission data
    answers JSONB NOT NULL,
    files JSONB,

    -- Submitter info (for anonymous submissions)
    submitter_email VARCHAR(255),
    submitter_name VARCHAR(255),

    -- Review/status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_notes TEXT,

    -- Metadata
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),

    -- Indexes
    CONSTRAINT pk_form_submissions PRIMARY KEY (id)
);

CREATE INDEX idx_form_submissions_form_template_id ON form_submissions(form_template_id);
CREATE INDEX idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);


-- Add updated_at trigger for form_templates
CREATE OR REPLACE FUNCTION update_form_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_form_templates_updated_at
    BEFORE UPDATE ON form_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_form_templates_updated_at();


-- Add updated_at trigger for form_questions
CREATE OR REPLACE FUNCTION update_form_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_form_questions_updated_at
    BEFORE UPDATE ON form_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_form_questions_updated_at();
