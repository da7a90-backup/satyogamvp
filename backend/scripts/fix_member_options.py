#!/usr/bin/env python3
"""
Fix memberOptions in product_component_data for all retreats
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.retreat import Retreat
from sqlalchemy.orm.attributes import flag_modified
import json

def fix_member_options():
    db = SessionLocal()

    try:
        # Get all onsite retreats
        retreats = db.query(Retreat).filter(
            Retreat.type.in_(['onsite_darshan', 'onsite_shakti', 'onsite_sevadhari'])
        ).all()

        print(f"Found {len(retreats)} onsite retreats")

        for retreat in retreats:
            if retreat.product_component_data:
                pcd = retreat.product_component_data

                # Update memberOptions to have proper Yes/No options
                pcd['memberOptions'] = [
                    "I am not a member",
                    "I am a member"
                ]

                # Also ensure memberLabel is set
                if 'memberLabel' not in pcd or not pcd['memberLabel']:
                    pcd['memberLabel'] = "Are you a Sat Yoga member?"

                retreat.product_component_data = pcd

                # CRITICAL: Mark the JSON field as modified so SQLAlchemy knows to update it
                flag_modified(retreat, 'product_component_data')

                print(f"✓ Updated {retreat.title}")
                print(f"  memberOptions: {pcd['memberOptions']}")
                print(f"  memberLabel: {pcd['memberLabel']}")

        db.commit()
        print(f"\n✓ Successfully updated {len(retreats)} retreats")

        # Verify the changes were saved
        print("\n=== Verifying changes in database ===")
        for retreat in retreats:
            db.refresh(retreat)
            if retreat.product_component_data:
                print(f"{retreat.title}: {retreat.product_component_data.get('memberOptions')}")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_member_options()
