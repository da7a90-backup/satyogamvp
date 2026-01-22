"""
Migration script to add forum enhancements:
- Add title and category columns to retreat_forum_posts
- Create retreat_forum_post_likes table
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.core.database import SessionLocal, engine

def run_migration():
    """Add forum enhancement columns and tables"""
    db = SessionLocal()

    try:
        print("🔄 Starting forum enhancements migration...")

        # Add title column to retreat_forum_posts
        print("\n1. Adding 'title' column to retreat_forum_posts...")
        db.execute(text("""
            ALTER TABLE retreat_forum_posts
            ADD COLUMN IF NOT EXISTS title VARCHAR(500);
        """))
        db.commit()
        print("✅ Title column added")

        # Add category column with enum type
        print("\n2. Creating forum_category enum type...")
        db.execute(text("""
            DO $$ BEGIN
                CREATE TYPE forum_category AS ENUM (
                    'general', 'questions', 'insights',
                    'experiences', 'meditation', 'teachings'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        db.commit()
        print("✅ Forum category enum created")

        print("\n3. Adding 'category' column to retreat_forum_posts...")
        db.execute(text("""
            ALTER TABLE retreat_forum_posts
            ADD COLUMN IF NOT EXISTS category forum_category;
        """))
        db.commit()
        print("✅ Category column added")

        # Create index on category
        print("\n4. Creating index on category column...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_forum_posts_category
            ON retreat_forum_posts(category);
        """))
        db.commit()
        print("✅ Category index created")

        # Create retreat_forum_post_likes table
        print("\n5. Creating retreat_forum_post_likes table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS retreat_forum_post_likes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id UUID NOT NULL REFERENCES retreat_forum_posts(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_post_user_like UNIQUE (post_id, user_id)
            );
        """))
        db.commit()
        print("✅ Likes table created")

        # Create indexes on likes table
        print("\n6. Creating indexes on likes table...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_forum_likes_post
            ON retreat_forum_post_likes(post_id);
        """))
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_forum_likes_user
            ON retreat_forum_post_likes(user_id);
        """))
        db.commit()
        print("✅ Likes indexes created")

        print("\n✅ Migration completed successfully!")
        print("\nSummary:")
        print("  - Added 'title' column to forum posts")
        print("  - Added 'category' enum column to forum posts")
        print("  - Created 'retreat_forum_post_likes' table")
        print("  - Added necessary indexes")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
