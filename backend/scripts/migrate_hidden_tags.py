"""
Migration script for hidden_tags table
Creates the table and seeds initial data with example tags
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import engine
from sqlalchemy import text


def run_migration():
    """Run the hidden_tags table migration"""
    print("Running hidden_tags migration...")

    # Read migration SQL file
    migration_file = Path(__file__).parent.parent / "migrations" / "010_create_hidden_tags.sql"

    with open(migration_file, 'r') as f:
        migration_sql = f.read()

    # Execute migration
    with engine.connect() as conn:
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]

        for statement in statements:
            if statement:
                print(f"Executing: {statement[:100]}...")
                conn.execute(text(statement))

        conn.commit()

    print("✅ Migration completed successfully!")


def seed_initial_data():
    """Seed some example hidden tags for testing"""
    print("\nSeeding initial hidden tags data...")

    # Note: In a real scenario, you would:
    # 1. Query existing teachings/blog/products/retreats
    # 2. Create appropriate tags for them
    # For now, this is a placeholder that admins will populate via the admin UI

    print("✅ Seeding completed (admin UI will be used to populate tags)")


if __name__ == "__main__":
    try:
        run_migration()
        seed_initial_data()
        print("\n✅ All done! Hidden tags system is ready.")
        print("\nNext steps:")
        print("1. Use the admin UI at /dashboard/admin to manage hidden tags")
        print("2. API endpoints are available at /api/hidden-tags")
        print("3. Marketing pages can fetch tagged content via GET /api/hidden-tags/page/{page_tag}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
