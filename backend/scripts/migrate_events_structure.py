"""
Migration script to add structured event support.
Adds location_type, event_structure, zoom_link, and other fields to events table.
Creates event_sessions table for day-by-day and week-by-week content.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine, SessionLocal

def run_migration():
    """Add new columns to events table and create event_sessions table."""
    db = SessionLocal()

    try:
        print("Starting events structure migration...")

        # Add new columns to events table
        migrations = [
            # Location type
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS location_type VARCHAR(20) DEFAULT 'online'",

            # Event structure
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS event_structure VARCHAR(20) DEFAULT 'simple_recurring'",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS duration_minutes INTEGER",

            # Online event settings
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS zoom_link VARCHAR(500)",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS meeting_id VARCHAR(100)",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS meeting_password VARCHAR(100)",

            # Registration
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_required BOOLEAN DEFAULT FALSE",

            # Update recurrence_rule to VARCHAR
            "ALTER TABLE events ALTER COLUMN recurrence_rule TYPE VARCHAR(500)",
        ]

        for migration in migrations:
            try:
                db.execute(text(migration))
                print(f"✓ Executed: {migration[:80]}...")
            except Exception as e:
                print(f"⚠ Skipped (may already exist): {migration[:80]}... - {str(e)[:50]}")

        # Create event_sessions table
        create_sessions_table = """
        CREATE TABLE IF NOT EXISTS event_sessions (
            id UUID PRIMARY KEY,
            event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            session_number INTEGER NOT NULL,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            session_date TIMESTAMP,
            start_time VARCHAR(10),
            duration_minutes INTEGER,
            content TEXT,
            video_url VARCHAR(500),
            audio_url VARCHAR(500),
            materials_url VARCHAR(500),
            zoom_link VARCHAR(500),
            is_published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """

        try:
            db.execute(text(create_sessions_table))
            print("✓ Created event_sessions table")
        except Exception as e:
            print(f"⚠ event_sessions table may already exist: {str(e)[:50]}")

        # Create index on event_sessions
        try:
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id ON event_sessions(event_id)"))
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_event_sessions_session_number ON event_sessions(event_id, session_number)"))
            print("✓ Created indexes on event_sessions")
        except Exception as e:
            print(f"⚠ Indexes may already exist: {str(e)[:50]}")

        db.commit()
        print("\n✅ Migration completed successfully!")
        print("\nNew features added:")
        print("  - Location type (online/onsite)")
        print("  - Event structure (simple_recurring, day_by_day, week_by_week)")
        print("  - Zoom link support")
        print("  - Event sessions table for structured content")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
