#!/usr/bin/env python3
"""
Seed store page data
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent

db = SessionLocal()

try:
    print("🌱 Seeding store page...")

    # Check if store page already exists
    existing = db.query(PageSection).filter(
        PageSection.page_slug == "store"
    ).first()

    if existing:
        print("⚠️  Store page already exists. Deleting existing sections...")
        db.query(PageSection).filter(
            PageSection.page_slug == "store"
        ).delete()
        db.commit()

    # STORE HEADER SECTION
    header_section = PageSection(
        page_slug="store",
        section_slug="header",
        section_type="header",
        order_index=1,
        is_active=True
    )
    db.add(header_section)
    db.flush()

    header_content = SectionContent(
        section_id=header_section.id,
        eyebrow="STORE",
        heading="The Dharma Bandhara",
        description="The Sat Yoga Online Store is a treasure trove of life-altering knowledge, in the form of unrepeatable retreats, paradigm-shifting books, beautiful guided meditations, as well as the popular Reading the Sages audio collections."
    )
    db.add(header_content)

    db.commit()
    print("✅ Store page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding store page: {e}")
    raise

finally:
    db.close()
