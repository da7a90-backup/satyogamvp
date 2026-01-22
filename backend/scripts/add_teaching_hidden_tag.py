"""
Migration script to add hidden_tag field to teachings table.
This field allows teachings to be tagged for specific marketing pages.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine, SessionLocal

def run_migration():
    """Add hidden_tag column to teachings table."""
    db = SessionLocal()

    try:
        print("Starting teachings hidden_tag migration...")

        # Add hidden_tag column
        migration = "ALTER TABLE teachings ADD COLUMN IF NOT EXISTS hidden_tag VARCHAR(255)"

        try:
            db.execute(text(migration))
            print("✓ Added hidden_tag column to teachings table")
        except Exception as e:
            print(f"⚠ hidden_tag column may already exist: {str(e)[:50]}")

        # Create index on hidden_tag for faster queries
        try:
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_teachings_hidden_tag ON teachings(hidden_tag)"))
            print("✓ Created index on hidden_tag column")
        except Exception as e:
            print(f"⚠ Index may already exist: {str(e)[:50]}")

        db.commit()
        print("\n✅ Migration completed successfully!")
        print("\nYou can now use hidden_tag to display teachings on marketing pages:")
        print("  - 'homepage' - Display on homepage")
        print("  - 'about/shunyamurti' - Display on about page")
        print("  - Or any custom page identifier")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
