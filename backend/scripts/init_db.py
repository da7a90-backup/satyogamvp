# -*- coding: utf-8 -*-
"""
Database initialization script.
Creates all tables and optionally seeds with initial data.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import Base, engine
from app.models import *  # Import all models


def init_database():
    """Initialize database by creating all tables."""
    print("Initializing database...")
    print(f"Database URL: {engine.url}")

    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        print("\nCreated tables:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")

        return True
    except Exception as e:
        print(f"Error creating database: {e}")
        return False


def drop_all_tables():
    """Drop all tables (use with caution!)."""
    print("WARNING: This will drop all tables!")
    confirm = input("Type 'yes' to confirm: ")
    if confirm.lower() == 'yes':
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("All tables dropped successfully!")
    else:
        print("Cancelled.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Database initialization script")
    parser.add_argument(
        "--drop",
        action="store_true",
        help="Drop all tables before creating (use with caution!)"
    )

    args = parser.parse_args()

    if args.drop:
        drop_all_tables()

    init_database()
