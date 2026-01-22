#!/usr/bin/env python3
"""
Add retreatId to product_component_data for all onsite retreats
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.retreat import Retreat
from sqlalchemy.orm.attributes import flag_modified

def add_retreat_ids():
    db = SessionLocal()

    try:
        # Get all onsite retreats
        retreats = db.query(Retreat).filter(
            Retreat.type.in_(['onsite_darshan', 'onsite_shakti', 'onsite_sevadhari'])
        ).all()

        print(f"Adding retreatId to {len(retreats)} onsite retreats...")
        print('=' * 60)

        for retreat in retreats:
            if retreat.product_component_data:
                pcd = retreat.product_component_data

                # Add retreatId
                pcd['retreatId'] = str(retreat.id)

                retreat.product_component_data = pcd
                flag_modified(retreat, 'product_component_data')

                print(f"✓ {retreat.title} ({retreat.slug})")
                print(f"  Added retreatId: {retreat.id}")

        db.commit()
        print('\n' + '=' * 60)
        print(f"✅ Successfully updated {len(retreats)} retreats")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_retreat_ids()
