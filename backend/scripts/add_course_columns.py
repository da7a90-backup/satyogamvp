"""
Add new columns to course tables for Cloudflare integration
"""
import sys
import os

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine

def add_columns():
    """Add new columns to course-related tables"""

    with engine.begin() as conn:
        print("Adding cloudflare_image_id to courses table...")
        conn.execute(text("""
            ALTER TABLE courses
            ADD COLUMN IF NOT EXISTS cloudflare_image_id VARCHAR(255)
        """))

        print("Adding cloudflare_stream_uid and duration to course_components table...")
        conn.execute(text("""
            ALTER TABLE course_components
            ADD COLUMN IF NOT EXISTS cloudflare_stream_uid VARCHAR(255),
            ADD COLUMN IF NOT EXISTS duration INTEGER
        """))

        print("Adding video_timestamp to course_progress table...")
        conn.execute(text("""
            ALTER TABLE course_progress
            ADD COLUMN IF NOT EXISTS video_timestamp INTEGER DEFAULT 0
        """))

        print("✅ All columns added successfully!")

if __name__ == "__main__":
    add_columns()
