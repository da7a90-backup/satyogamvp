"""
Database migration script to add new course component structure fields.
Run this after updating the models to add the new columns.

Usage: python scripts/migrate_course_schema.py
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from sqlalchemy import text


def run_migration():
    """Run the database migration to add new columns"""
    db = SessionLocal()

    try:
        print("Starting course schema migration...")

        # Add columns to courses table
        print("\n📝 Adding columns to courses table...")

        try:
            db.execute(text("""
                ALTER TABLE courses
                ADD COLUMN structure_template VARCHAR(50)
            """))
            print("  ✅ Added structure_template column")
        except Exception as e:
            print(f"  ⏭️  structure_template column already exists or error: {e}")

        try:
            db.execute(text("""
                ALTER TABLE courses
                ADD COLUMN selling_page_data JSON
            """))
            print("  ✅ Added selling_page_data column")
        except Exception as e:
            print(f"  ⏭️  selling_page_data column already exists or error: {e}")

        # Add columns to course_components table
        print("\n📝 Adding columns to course_components table...")

        try:
            db.execute(text("""
                ALTER TABLE course_components
                ADD COLUMN component_category VARCHAR(50)
            """))
            print("  ✅ Added component_category column")
        except Exception as e:
            print(f"  ⏭️  component_category column already exists or error: {e}")

        try:
            db.execute(text("""
                ALTER TABLE course_components
                ADD COLUMN description TEXT
            """))
            print("  ✅ Added description column")
        except Exception as e:
            print(f"  ⏭️  description column already exists or error: {e}")

        try:
            db.execute(text("""
                ALTER TABLE course_components
                ADD COLUMN transcription TEXT
            """))
            print("  ✅ Added transcription column")
        except Exception as e:
            print(f"  ⏭️  transcription column already exists or error: {e}")

        try:
            db.execute(text("""
                ALTER TABLE course_components
                ADD COLUMN essay_content TEXT
            """))
            print("  ✅ Added essay_content column")
        except Exception as e:
            print(f"  ⏭️  essay_content column already exists or error: {e}")

        try:
            db.execute(text("""
                ALTER TABLE course_components
                ADD COLUMN audio_url VARCHAR(500)
            """))
            print("  ✅ Added audio_url column")
        except Exception as e:
            print(f"  ⏭️  audio_url column already exists or error: {e}")

        try:
            db.execute(text("""
                ALTER TABLE course_components
                ADD COLUMN has_tabs BOOLEAN DEFAULT FALSE
            """))
            print("  ✅ Added has_tabs column")
        except Exception as e:
            print(f"  ⏭️  has_tabs column already exists or error: {e}")

        try:
            # For PostgreSQL, use UUID type; for SQLite, use TEXT
            db.execute(text("""
                ALTER TABLE course_components
                ADD COLUMN parent_component_id CHAR(36)
            """))
            print("  ✅ Added parent_component_id column")
        except Exception as e:
            print(f"  ⏭️  parent_component_id column already exists or error: {e}")

        # Make type column nullable (was required before)
        try:
            db.execute(text("""
                ALTER TABLE course_components
                ALTER COLUMN type DROP NOT NULL
            """))
            print("  ✅ Made type column nullable")
        except Exception as e:
            print(f"  ⏭️  type column already nullable or error: {e}")

        # Add component_id to course_comments table
        print("\n📝 Adding columns to course_comments table...")

        try:
            db.execute(text("""
                ALTER TABLE course_comments
                ADD COLUMN component_id CHAR(36)
            """))
            print("  ✅ Added component_id column")
        except Exception as e:
            print(f"  ⏭️  component_id column already exists or error: {e}")

        # Commit all changes
        db.commit()

        print("\n✅ Migration completed successfully!")
        print("\n📌 Next steps:")
        print("1. Restart your FastAPI server to reload the models")
        print("2. Update your seeding scripts to use the new structure")
        print("3. Test the new endpoints with the updated models")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Course Schema Migration")
    print("=" * 60)
    print("\nThis will add new columns to support component-based courses.")
    print("Existing data will not be affected.\n")

    response = input("Do you want to continue? (yes/no): ")

    if response.lower() in ['yes', 'y']:
        run_migration()
    else:
        print("Migration cancelled.")
