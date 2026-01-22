#!/usr/bin/env python3
"""
Migration script to create audit_logs table.
Run this script to create the necessary database tables for audit logging.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import engine, Base
from app.models import AuditLog, ActionType

def run_migration():
    """Create audit_logs table."""
    print("Starting audit logs migration...")

    try:
        # Create only the audit_logs table
        AuditLog.__table__.create(engine, checkfirst=True)
        print("✓ Successfully created audit_logs table")

        # Verify the table was created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if 'audit_logs' in tables:
            print("✓ Audit logs table verified in database")

            # Show table columns
            columns = inspector.get_columns('audit_logs')
            print("\nTable columns:")
            for column in columns:
                print(f"  - {column['name']}: {column['type']}")
        else:
            print("✗ Warning: Could not verify audit_logs table")

    except Exception as e:
        print(f"✗ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print("\nMigration completed successfully!")
    print("\nAvailable action types for audit logging:")
    for action in ActionType:
        print(f"  - {action.value}")

if __name__ == "__main__":
    run_migration()
