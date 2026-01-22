"""Add missing columns to retreats table."""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/satyoga")

# Create engine
engine = create_engine(DATABASE_URL)

# SQL commands to add missing columns
sql_commands = [
    # Check and add columns that might be missing
    """
    DO $$
    BEGIN
        -- Add hero_background if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='hero_background') THEN
            ALTER TABLE retreats ADD COLUMN hero_background VARCHAR(500);
        END IF;

        -- Add booking_tagline if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='booking_tagline') THEN
            ALTER TABLE retreats ADD COLUMN booking_tagline TEXT;
        END IF;

        -- Add intro fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='intro1_title') THEN
            ALTER TABLE retreats ADD COLUMN intro1_title TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='intro1_content') THEN
            ALTER TABLE retreats ADD COLUMN intro1_content JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='intro2_title') THEN
            ALTER TABLE retreats ADD COLUMN intro2_title TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='intro2_content') THEN
            ALTER TABLE retreats ADD COLUMN intro2_content JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='intro3_title') THEN
            ALTER TABLE retreats ADD COLUMN intro3_title TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='intro3_content') THEN
            ALTER TABLE retreats ADD COLUMN intro3_content JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='intro3_media') THEN
            ALTER TABLE retreats ADD COLUMN intro3_media VARCHAR(500);
        END IF;

        -- Add agenda fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='agenda_title') THEN
            ALTER TABLE retreats ADD COLUMN agenda_title TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='agenda_items') THEN
            ALTER TABLE retreats ADD COLUMN agenda_items JSONB;
        END IF;

        -- Add included fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='included_title') THEN
            ALTER TABLE retreats ADD COLUMN included_title TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='included_items') THEN
            ALTER TABLE retreats ADD COLUMN included_items JSONB;
        END IF;

        -- Add schedule fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='schedule_tagline') THEN
            ALTER TABLE retreats ADD COLUMN schedule_tagline VARCHAR(200);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='schedule_title') THEN
            ALTER TABLE retreats ADD COLUMN schedule_title VARCHAR(500);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='schedule_items') THEN
            ALTER TABLE retreats ADD COLUMN schedule_items JSONB;
        END IF;

        -- Add media fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='images') THEN
            ALTER TABLE retreats ADD COLUMN images JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='video_url') THEN
            ALTER TABLE retreats ADD COLUMN video_url VARCHAR(500);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='video_thumbnail') THEN
            ALTER TABLE retreats ADD COLUMN video_thumbnail VARCHAR(500);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='video_type') THEN
            ALTER TABLE retreats ADD COLUMN video_type VARCHAR(50);
        END IF;

        -- Add testimonial fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='testimonial_tagline') THEN
            ALTER TABLE retreats ADD COLUMN testimonial_tagline VARCHAR(200);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='testimonial_heading') THEN
            ALTER TABLE retreats ADD COLUMN testimonial_heading VARCHAR(500);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='testimonial_data') THEN
            ALTER TABLE retreats ADD COLUMN testimonial_data JSONB;
        END IF;

        -- Add portal page fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='invitation_video_url') THEN
            ALTER TABLE retreats ADD COLUMN invitation_video_url VARCHAR(500);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='announcement') THEN
            ALTER TABLE retreats ADD COLUMN announcement TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='about_content') THEN
            ALTER TABLE retreats ADD COLUMN about_content TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='about_image_url') THEN
            ALTER TABLE retreats ADD COLUMN about_image_url VARCHAR(500);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='preparation_instructions') THEN
            ALTER TABLE retreats ADD COLUMN preparation_instructions JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='faq_data') THEN
            ALTER TABLE retreats ADD COLUMN faq_data JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='live_schedule') THEN
            ALTER TABLE retreats ADD COLUMN live_schedule JSONB;
        END IF;

        -- Add card display fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='duration_days') THEN
            ALTER TABLE retreats ADD COLUMN duration_days INTEGER;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='has_audio') THEN
            ALTER TABLE retreats ADD COLUMN has_audio BOOLEAN DEFAULT TRUE NOT NULL;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='has_video') THEN
            ALTER TABLE retreats ADD COLUMN has_video BOOLEAN DEFAULT TRUE NOT NULL;
        END IF;

        -- Add forum field if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='forum_enabled') THEN
            ALTER TABLE retreats ADD COLUMN forum_enabled BOOLEAN DEFAULT FALSE NOT NULL;
        END IF;

        -- Add price_options if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='price_options') THEN
            ALTER TABLE retreats ADD COLUMN price_options JSONB;
        END IF;

        -- Add member_discount_percentage if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='member_discount_percentage') THEN
            ALTER TABLE retreats ADD COLUMN member_discount_percentage INTEGER;
        END IF;

        -- Add scholarship fields if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='scholarship_available') THEN
            ALTER TABLE retreats ADD COLUMN scholarship_available BOOLEAN DEFAULT FALSE NOT NULL;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='scholarship_deadline') THEN
            ALTER TABLE retreats ADD COLUMN scholarship_deadline VARCHAR(200);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='application_url') THEN
            ALTER TABLE retreats ADD COLUMN application_url VARCHAR(500);
        END IF;

        -- Add subtitle if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='retreats' AND column_name='subtitle') THEN
            ALTER TABLE retreats ADD COLUMN subtitle TEXT;
        END IF;
    END
    $$;
    """
]

def main():
    print("Starting database migration...")

    with engine.connect() as conn:
        for sql in sql_commands:
            print(f"Executing migration...")
            conn.execute(text(sql))
            conn.commit()

    print("✅ Migration completed successfully!")

if __name__ == "__main__":
    main()
