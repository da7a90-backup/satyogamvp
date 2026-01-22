#!/usr/bin/env python3
"""
Update retreat dates, prices, and add contribution tooltips
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.retreat import Retreat
from sqlalchemy.orm.attributes import flag_modified

def update_retreats():
    db = SessionLocal()

    try:
        # Shakti dates and data
        shakti = db.query(Retreat).filter(Retreat.slug == 'shakti').first()
        if shakti:
            pcd = shakti.product_component_data or {}
            pcd['dateOptions'] = [
                "February 3 – March 2, 2026",
                "March 31 – April 27, 2026",
                "June 30 – July 27, 2026",
                "November 3 – 30, 2026",
                "December 15, 2026 – January 11, 2027"
            ]
            pcd['contributionTooltip'] = "The program contribution covers all meals, accommodations, teachings, and the intensive spiritual guidance provided during your stay. This allows us to maintain the ashram and continue offering transformative experiences to seekers worldwide."
            shakti.product_component_data = pcd
            flag_modified(shakti, 'product_component_data')
            print(f"✓ Updated Shakti Saturation Immersion")
            print(f"  Dates: {len(pcd['dateOptions'])} options")
            print(f"  Tooltip added")

        # Darshan dates and data
        darshan = db.query(Retreat).filter(Retreat.slug == 'darshan').first()
        if darshan:
            pcd = darshan.product_component_data or {}
            pcd['dateOptions'] = [
                "March 10 – 16, 2026",
                "June 9 – 15, 2026",
                "August 11 – 17, 2026",
                "December 15 – 21, 2026"
            ]
            pcd['basePrice'] = 1750
            pcd['contributionTooltip'] = "The program contribution of $1,750 (including all local taxes and charges) covers your private retreat experience, accommodations, meals, and personal guidance sessions with Shunyamurti."
            darshan.product_component_data = pcd
            darshan.price_onsite = 1750
            flag_modified(darshan, 'product_component_data')
            print(f"✓ Updated Private Darshan Retreat")
            print(f"  Dates: {len(pcd['dateOptions'])} options")
            print(f"  Price: $1,750")
            print(f"  Tooltip added")

        # Sevadhari dates and data
        sevadhari = db.query(Retreat).filter(Retreat.slug == 'sevadhari').first()
        if sevadhari:
            pcd = sevadhari.product_component_data or {}
            pcd['dateOptions'] = [
                "February 3, 2026",
                "March 31, 2026",
                "June 30, 2026",
                "November 3, 2026",
                "December 15, 2026"
            ]
            pcd['basePrice'] = 2100
            pcd['contributionTooltip'] = "The program contribution of $2,100 supports your 3-6 month immersive experience at the ashram, including accommodations, meals, teachings, and the infrastructure that enables our spiritual community to thrive."
            sevadhari.product_component_data = pcd
            sevadhari.price_onsite = 2100
            flag_modified(sevadhari, 'product_component_data')
            print(f"✓ Updated Sevadhari Program")
            print(f"  Dates: {len(pcd['dateOptions'])} options")
            print(f"  Price: $2,100")
            print(f"  Tooltip added")

        db.commit()
        print(f"\n✅ Successfully updated all retreat dates, prices, and tooltips")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_retreats()
