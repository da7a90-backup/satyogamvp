"""
Add application_form_slug column to retreats table
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine

def add_column():
    """Add application_form_slug column to retreats table."""
    with engine.begin() as conn:  # Use begin() for auto-commit
        try:
            # Add the column with IF NOT EXISTS logic
            conn.execute(text("""
                ALTER TABLE retreats
                ADD COLUMN IF NOT EXISTS application_form_slug VARCHAR(255) NULL
            """))
            print("✓ Successfully ensured application_form_slug column exists in retreats table")

        except Exception as e:
            print(f"✗ Error adding column: {e}")
            raise

if __name__ == "__main__":
    print("Adding application_form_slug column to retreats table...")
    add_column()
    print("Done!")
