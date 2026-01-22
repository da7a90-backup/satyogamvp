"""
Add retreat portal fields to retreats table
"""
import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine

def add_columns():
    """Add new portal-related columns to retreats table"""

    with engine.begin() as conn:
        print("Adding portal fields to retreats table...")
        conn.execute(text("""
            ALTER TABLE retreats
            ADD COLUMN IF NOT EXISTS invitation_video_url VARCHAR(500),
            ADD COLUMN IF NOT EXISTS announcement TEXT,
            ADD COLUMN IF NOT EXISTS about_content TEXT,
            ADD COLUMN IF NOT EXISTS about_image_url VARCHAR(500),
            ADD COLUMN IF NOT EXISTS preparation_instructions JSONB,
            ADD COLUMN IF NOT EXISTS faq_data JSONB,
            ADD COLUMN IF NOT EXISTS live_schedule JSONB,
            ADD COLUMN IF NOT EXISTS duration_days INTEGER,
            ADD COLUMN IF NOT EXISTS has_audio BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS has_video BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS forum_enabled BOOLEAN DEFAULT TRUE
        """))

        print("✅ All retreat portal columns added successfully!")

if __name__ == "__main__":
    add_columns()
