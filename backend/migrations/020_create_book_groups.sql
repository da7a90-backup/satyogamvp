-- Migration 020: Create Book Groups Tables
-- This migration creates all tables needed for the book groups feature
-- Run this migration: psql -U <username> -d <database> -f 020_create_book_groups.sql

-- ===== 1. Add BOOK_GROUP_PORTAL_ACCESS to product type enum =====
-- Note: PostgreSQL requires special handling for enum alterations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'producttype' AND e.enumlabel = 'BOOK_GROUP_PORTAL_ACCESS'
    ) THEN
        ALTER TYPE producttype ADD VALUE 'BOOK_GROUP_PORTAL_ACCESS';
    END IF;
END $$;


-- ===== 2. Create book_groups table =====
CREATE TABLE IF NOT EXISTS book_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    short_description TEXT,

    -- Media
    hero_image VARCHAR(500),
    book_cover_image VARCHAR(500),
    thumbnail VARCHAR(500),
    hero_image_gravity VARCHAR(50) DEFAULT 'auto',
    thumbnail_gravity VARCHAR(50) DEFAULT 'auto',

    -- Status and visibility
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    meeting_day_of_week VARCHAR(20),
    meeting_time VARCHAR(10),
    duration_minutes INTEGER DEFAULT 90,

    -- Access control
    requires_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    store_product_id UUID REFERENCES products(id) ON DELETE SET NULL,

    -- Content tabs
    has_transcription BOOLEAN NOT NULL DEFAULT FALSE,
    has_audio BOOLEAN NOT NULL DEFAULT FALSE,
    has_downloads BOOLEAN NOT NULL DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Indexes
    CONSTRAINT book_groups_slug_key UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_book_groups_slug ON book_groups(slug);
CREATE INDEX IF NOT EXISTS idx_book_groups_status ON book_groups(status);
CREATE INDEX IF NOT EXISTS idx_book_groups_is_featured ON book_groups(is_featured);
CREATE INDEX IF NOT EXISTS idx_book_groups_is_published ON book_groups(is_published);


-- ===== 3. Create book_group_sessions table =====
CREATE TABLE IF NOT EXISTS book_group_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_group_id UUID NOT NULL REFERENCES book_groups(id) ON DELETE CASCADE,

    -- Session identification
    week_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Scheduling (for live sessions)
    session_date TIMESTAMP WITH TIME ZONE,

    -- Zoom (for live/upcoming sessions)
    zoom_link VARCHAR(500),
    zoom_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    zoom_meeting_id VARCHAR(100),
    zoom_password VARCHAR(100),

    -- Media (for completed sessions)
    video_url VARCHAR(500),
    audio_url VARCHAR(500),
    transcript_url VARCHAR(500),
    duration_minutes INTEGER,

    -- Downloads (JSON array)
    downloads JSONB,

    -- Metadata
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_group_sessions_book_group_id ON book_group_sessions(book_group_id);
CREATE INDEX IF NOT EXISTS idx_book_group_sessions_week_number ON book_group_sessions(week_number);
CREATE INDEX IF NOT EXISTS idx_book_group_sessions_session_date ON book_group_sessions(session_date);


-- ===== 4. Create book_group_accesses table =====
CREATE TABLE IF NOT EXISTS book_group_accesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_group_id UUID NOT NULL REFERENCES book_groups(id) ON DELETE CASCADE,

    -- Access type
    access_type VARCHAR(50) NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Metadata
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Unique constraint: one access record per user per book group
    CONSTRAINT uq_user_book_group UNIQUE (user_id, book_group_id)
);

CREATE INDEX IF NOT EXISTS idx_book_group_accesses_user_id ON book_group_accesses(user_id);
CREATE INDEX IF NOT EXISTS idx_book_group_accesses_book_group_id ON book_group_accesses(book_group_id);
CREATE INDEX IF NOT EXISTS idx_book_group_accesses_order_id ON book_group_accesses(order_id);


-- ===== 5. Add book_group_id to user_calendars table =====
-- This allows users to add book groups to their personal calendar
ALTER TABLE user_calendars
ADD COLUMN IF NOT EXISTS book_group_id UUID REFERENCES book_groups(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_calendars_book_group_id ON user_calendars(book_group_id);


-- ===== 6. Create triggers for updated_at timestamps =====
-- Trigger for book_groups
CREATE OR REPLACE FUNCTION update_book_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_book_groups_updated_at ON book_groups;
CREATE TRIGGER trigger_update_book_groups_updated_at
BEFORE UPDATE ON book_groups
FOR EACH ROW
EXECUTE FUNCTION update_book_groups_updated_at();

-- Trigger for book_group_sessions
CREATE OR REPLACE FUNCTION update_book_group_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_book_group_sessions_updated_at ON book_group_sessions;
CREATE TRIGGER trigger_update_book_group_sessions_updated_at
BEFORE UPDATE ON book_group_sessions
FOR EACH ROW
EXECUTE FUNCTION update_book_group_sessions_updated_at();


-- ===== 7. Grant permissions (if using specific database roles) =====
-- Uncomment and adjust these if you have specific database roles
-- GRANT ALL PRIVILEGES ON book_groups TO your_app_role;
-- GRANT ALL PRIVILEGES ON book_group_sessions TO your_app_role;
-- GRANT ALL PRIVILEGES ON book_group_accesses TO your_app_role;


-- ===== Migration Complete =====
-- Verify the migration with these queries:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'book_group%';
-- SELECT * FROM pg_enum WHERE enumtypid = 'producttype'::regtype;
