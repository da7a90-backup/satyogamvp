#!/usr/bin/env python3
"""
Migrate video IDs from WordPress to database.
Updates cloudflare_ids and podbean_ids for teachings that are missing them.
"""
import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models.teaching import Teaching

def load_extracted_ids():
    """Load the extracted video IDs from JSON file"""
    json_path = Path(__file__).parent.parent.parent / 'teachings_with_all_video_ids.json'

    if not json_path.exists():
        print(f"❌ Error: File not found: {json_path}")
        sys.exit(1)

    with open(json_path) as f:
        return json.load(f)

def migrate_video_ids(db: Session, dry_run: bool = False):
    """
    Migrate video IDs from extracted data to database.

    Args:
        db: Database session
        dry_run: If True, only show what would be updated without committing
    """
    # Load extracted data
    extracted_data = load_extracted_ids()

    print("="*80)
    print("VIDEO ID MIGRATION")
    print("="*80)
    print(f"\nMode: {'DRY RUN (no changes will be made)' if dry_run else 'LIVE UPDATE'}")
    print(f"Loaded {len(extracted_data)} teachings from extraction file\n")

    stats = {
        'total': 0,
        'found_in_db': 0,
        'cloudflare_added': 0,
        'cloudflare_updated': 0,
        'cloudflare_skipped': 0,
        'podbean_added': 0,
        'podbean_updated': 0,
        'podbean_skipped': 0,
        'not_found': 0
    }

    # Create lookup dict by teaching ID
    extracted_by_id = {item['id']: item for item in extracted_data}

    print("Processing teachings...\n")

    for teaching_id, extracted in extracted_by_id.items():
        stats['total'] += 1

        # Get teaching from database
        teaching = db.query(Teaching).filter(Teaching.id == teaching_id).first()

        if not teaching:
            stats['not_found'] += 1
            print(f"⚠️  Teaching not found in DB: {extracted['slug']}")
            continue

        stats['found_in_db'] += 1

        # Track if we need to update this teaching
        needs_update = False
        updates = []

        # Check Cloudflare IDs
        current_cf_ids = teaching.cloudflare_ids or []
        extracted_cf_ids = extracted.get('cloudflare_ids', [])

        if extracted_cf_ids:
            if not current_cf_ids:
                # No IDs in DB, add the extracted ones
                teaching.cloudflare_ids = extracted_cf_ids
                stats['cloudflare_added'] += 1
                updates.append(f"Added {len(extracted_cf_ids)} Cloudflare ID(s)")
                needs_update = True
            elif set(extracted_cf_ids) != set(current_cf_ids):
                # Different IDs, update them
                teaching.cloudflare_ids = list(set(current_cf_ids + extracted_cf_ids))
                stats['cloudflare_updated'] += 1
                updates.append(f"Updated Cloudflare IDs (merged)")
                needs_update = True
            else:
                # Same IDs already exist
                stats['cloudflare_skipped'] += 1

        # Check Podbean IDs
        current_pb_ids = teaching.podbean_ids or []
        extracted_pb_ids = extracted.get('podbean_ids', [])

        if extracted_pb_ids:
            if not current_pb_ids:
                # No IDs in DB, add the extracted ones
                teaching.podbean_ids = extracted_pb_ids
                stats['podbean_added'] += 1
                updates.append(f"Added {len(extracted_pb_ids)} Podbean ID(s)")
                needs_update = True
            elif set(extracted_pb_ids) != set(current_pb_ids):
                # Different IDs, update them
                teaching.podbean_ids = list(set(current_pb_ids + extracted_pb_ids))
                stats['podbean_updated'] += 1
                updates.append(f"Updated Podbean IDs (merged)")
                needs_update = True
            else:
                # Same IDs already exist
                stats['podbean_skipped'] += 1

        # Show progress for teachings being updated
        if needs_update:
            title = teaching.title[:50] + "..." if len(teaching.title) > 50 else teaching.title
            print(f"✓ {title}")
            for update in updates:
                print(f"  → {update}")

    # Print statistics
    print("\n" + "="*80)
    print("MIGRATION STATISTICS")
    print("="*80)
    print(f"\nTotal teachings processed: {stats['total']}")
    print(f"Found in database: {stats['found_in_db']}")
    print(f"Not found in database: {stats['not_found']}")

    print(f"\n📹 Cloudflare IDs:")
    print(f"  Added: {stats['cloudflare_added']}")
    print(f"  Updated (merged): {stats['cloudflare_updated']}")
    print(f"  Skipped (already exists): {stats['cloudflare_skipped']}")
    print(f"  Total changes: {stats['cloudflare_added'] + stats['cloudflare_updated']}")

    print(f"\n🎙️  Podbean IDs:")
    print(f"  Added: {stats['podbean_added']}")
    print(f"  Updated (merged): {stats['podbean_updated']}")
    print(f"  Skipped (already exists): {stats['podbean_skipped']}")
    print(f"  Total changes: {stats['podbean_added'] + stats['podbean_updated']}")

    total_changes = (stats['cloudflare_added'] + stats['cloudflare_updated'] +
                     stats['podbean_added'] + stats['podbean_updated'])

    print(f"\n📊 Total teachings modified: {total_changes}")

    if dry_run:
        print("\n⚠️  DRY RUN MODE - No changes were committed to the database")
        db.rollback()
    else:
        print("\n💾 Committing changes to database...")
        db.commit()
        print("✅ Migration complete!")

    print("="*80)

    return stats

def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Migrate video IDs to database')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be updated without making changes')
    parser.add_argument('--live', action='store_true',
                       help='Actually update the database')

    args = parser.parse_args()

    if not args.dry_run and not args.live:
        print("❌ Error: You must specify either --dry-run or --live")
        print("\nUsage:")
        print("  python migrate_video_ids.py --dry-run  # Preview changes")
        print("  python migrate_video_ids.py --live     # Apply changes")
        sys.exit(1)

    db = SessionLocal()
    try:
        migrate_video_ids(db, dry_run=args.dry_run)
    finally:
        db.close()

if __name__ == "__main__":
    main()
