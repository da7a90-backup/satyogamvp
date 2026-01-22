#!/usr/bin/env python3
"""
Migration script to create dynamic form tables and seed Darshan retreat form.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal, engine, Base
# Import directly from form module to avoid naming conflicts with old form system
from app.models.form import (
    DynamicFormTemplate,
    FormSection as DynamicFormSection,
    FormField as DynamicFormField,
    DynamicFormSubmission,
    FormAnswer,
    FieldType,
)
import uuid


def create_tables():
    """Create only dynamic form tables."""
    print("Creating dynamic form tables...")
    # Only create the specific tables we need, not all Base tables
    tables = [
        DynamicFormTemplate.__table__,
        DynamicFormSection.__table__,
        DynamicFormField.__table__,
        DynamicFormSubmission.__table__,
        FormAnswer.__table__,
    ]
    Base.metadata.create_all(bind=engine, tables=tables)
    print("✅ Dynamic form tables created successfully")


def seed_darshan_form(db: Session):
    """
    Seed the Darshan Retreat application form based on the screenshot provided.
    """
    print("\n🌱 Seeding Darshan Retreat application form...")

    # Check if form already exists using raw SQL to avoid ORM conflicts
    result = db.execute(text("SELECT COUNT(*) FROM dynamic_form_templates WHERE slug = 'darshan-retreat-application'"))
    count = result.scalar()
    if count and count > 0:
        print("⚠️  Darshan form already exists, skipping...")
        return

    # Create form template
    form = DynamicFormTemplate(
        id=str(uuid.uuid4()),
        slug="darshan-retreat-application",
        title="Darshan Retreat Application",
        subtitle="Private Darshan Retreat with Shunyamurti",
        description="Please read carefully before starting the process",
        is_published=True,
    )
    db.add(form)
    db.flush()
    print(f"✅ Created form template: {form.title}")

    # ========================================================================
    # SECTION 1: Introduction / Disclaimer
    # ========================================================================
    intro_section = DynamicFormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="Please read carefully before starting the process",
        description="To protect the integrity of this spiritual refuge we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer. In this application, you will have the opportunity to introduce yourself, tell us about your spiritual background, and about your motivation for participating—as well as any reservations that may come up in this kind of process.",
        order=0,
        tagline="PROGRAM APPLICATION",
        image_url=None,  # Will be set by admin
    )
    db.add(intro_section)
    db.flush()

    # ========================================================================
    # SECTION 2: About You
    # ========================================================================
    about_section = DynamicFormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="About you",
        description=None,
        order=1,
        tagline="PROGRAM APPLICATION",
        image_url=None,
    )
    db.add(about_section)
    db.flush()

    # Photo upload
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Your photo",
        field_type=FieldType.PHOTO,
        placeholder=None,
        help_text="Click to upload or drag and drop SVG, PNG, JPG or GIF (max. 800x400px)",
        is_required=True,
        order=0,
        width="full",
    ))

    # First name and Last name (same row)
    group_id_1 = str(uuid.uuid4())
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="First name",
        field_type=FieldType.TEXT,
        placeholder="First name",
        is_required=True,
        order=1,
        group_id=group_id_1,
        width="half",
    ))
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Last name",
        field_type=FieldType.TEXT,
        placeholder="Last name",
        is_required=True,
        order=2,
        group_id=group_id_1,
        width="half",
    ))

    # Email
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Email",
        field_type=FieldType.EMAIL,
        placeholder="you@company.com",
        is_required=True,
        order=3,
        width="full",
    ))

    # Phone number
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Phone number",
        field_type=FieldType.PHONE,
        placeholder="+1 (555) 000-0000",
        is_required=False,
        order=4,
        width="full",
    ))

    # Date of birth
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Date of birth",
        field_type=FieldType.DATE,
        placeholder="dd/mm/yy",
        is_required=False,
        order=5,
        width="full",
    ))

    # Nationality
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Nationality",
        field_type=FieldType.SELECT,
        placeholder="Select an option...",
        is_required=False,
        order=6,
        options=["Australian", "American", "British", "Canadian", "French", "German", "Italian", "Spanish", "Other"],
        width="full",
    ))

    # Gender
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Gender",
        field_type=FieldType.SELECT,
        placeholder="Select an option...",
        is_required=False,
        order=7,
        options=["Male", "Female", "Non-binary", "Prefer not to say"],
        width="full",
    ))

    # Marital status
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Marital status",
        field_type=FieldType.SELECT,
        placeholder="Select an option...",
        is_required=False,
        order=8,
        options=["Single", "Married", "Divorced", "Widowed", "In a relationship"],
        width="full",
    ))

    # Occupation
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Occupation",
        field_type=FieldType.TEXT,
        placeholder="Freelancer",
        is_required=False,
        order=9,
        width="full",
    ))

    # Program date
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=about_section.id,
        label="Program date",
        field_type=FieldType.SELECT,
        placeholder="Select an option...",
        is_required=False,
        order=10,
        options=["Dec. 17th - Jan. 13th, 2025"],
        width="full",
    ))

    # ========================================================================
    # SECTION 3: Residence
    # ========================================================================
    residence_section = DynamicFormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="Residence",
        description=None,
        order=2,
        tagline="PROGRAM APPLICATION",
        image_url=None,
    )
    db.add(residence_section)
    db.flush()

    # Street address
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=residence_section.id,
        label="Street address",
        field_type=FieldType.TEXT,
        placeholder="Park Avenue, 123",
        is_required=False,
        order=0,
        width="full",
    ))

    # Country and City (same row)
    group_id_2 = str(uuid.uuid4())
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=residence_section.id,
        label="Country",
        field_type=FieldType.SELECT,
        placeholder="Select...",
        is_required=False,
        order=1,
        group_id=group_id_2,
        width="half",
        options=["Australia", "United States", "United Kingdom", "Canada", "France", "Germany", "Italy", "Spain", "Other"],
    ))
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=residence_section.id,
        label="City",
        field_type=FieldType.SELECT,
        placeholder="Select...",
        is_required=False,
        order=2,
        group_id=group_id_2,
        width="half",
        options=["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    ))

    # State/Province and ZIP/Postal code (same row)
    group_id_3 = str(uuid.uuid4())
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=residence_section.id,
        label="State / Province",
        field_type=FieldType.TEXT,
        placeholder="New york",
        is_required=False,
        order=3,
        group_id=group_id_3,
        width="half",
    ))
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=residence_section.id,
        label="ZIP / Postal code",
        field_type=FieldType.TEXT,
        placeholder="2024",
        is_required=False,
        order=4,
        group_id=group_id_3,
        width="half",
    ))

    # ========================================================================
    # SECTION 4: Emergency Contact
    # ========================================================================
    emergency_section = DynamicFormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="Emergency contact",
        description=None,
        order=3,
        tagline="PROGRAM APPLICATION",
        image_url=None,
    )
    db.add(emergency_section)
    db.flush()

    # Emergency contact: First name and Last name (same row)
    group_id_4 = str(uuid.uuid4())
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="First name",
        field_type=FieldType.TEXT,
        placeholder="First name",
        is_required=False,
        order=0,
        group_id=group_id_4,
        width="half",
    ))
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="Last name",
        field_type=FieldType.TEXT,
        placeholder="Last name",
        is_required=False,
        order=1,
        group_id=group_id_4,
        width="half",
    ))

    # Relationship
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="Relationship",
        field_type=FieldType.TEXT,
        placeholder="Mother",
        is_required=False,
        order=2,
        width="full",
    ))

    # Email
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="Email",
        field_type=FieldType.EMAIL,
        placeholder="you@company.com",
        is_required=False,
        order=3,
        width="full",
    ))

    # Phone number
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="Phone number",
        field_type=FieldType.PHONE,
        placeholder="+1 (555) 000-0000",
        is_required=False,
        order=4,
        width="full",
    ))

    # Street address
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="Street address",
        field_type=FieldType.TEXT,
        placeholder="Park Avenue, 123",
        is_required=False,
        order=5,
        width="full",
    ))

    # Country and City (same row)
    group_id_5 = str(uuid.uuid4())
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="Country",
        field_type=FieldType.SELECT,
        placeholder="Select...",
        is_required=False,
        order=6,
        group_id=group_id_5,
        width="half",
        options=["Australia", "United States", "United Kingdom", "Canada", "France", "Germany", "Italy", "Spain", "Other"],
    ))
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="City",
        field_type=FieldType.SELECT,
        placeholder="Select...",
        is_required=False,
        order=7,
        group_id=group_id_5,
        width="half",
        options=["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    ))

    # State/Province and ZIP/Postal code (same row)
    group_id_6 = str(uuid.uuid4())
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="State / Province",
        field_type=FieldType.TEXT,
        placeholder="New york",
        is_required=False,
        order=8,
        group_id=group_id_6,
        width="half",
    ))
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=emergency_section.id,
        label="ZIP / Postal code",
        field_type=FieldType.TEXT,
        placeholder="2024",
        is_required=False,
        order=9,
        group_id=group_id_6,
        width="half",
    ))

    # ========================================================================
    # SECTION 5: More
    # ========================================================================
    more_section = DynamicFormSection(
        id=str(uuid.uuid4()),
        form_template_id=form.id,
        title="More",
        description=None,
        order=4,
        tagline="PROGRAM APPLICATION",
        image_url=None,
    )
    db.add(more_section)
    db.flush()

    # Textarea
    db.add(DynamicFormField(
        id=str(uuid.uuid4()),
        section_id=more_section.id,
        label="Do you want to add something else?",
        field_type=FieldType.TEXTAREA,
        placeholder="Insert your answer...",
        is_required=True,
        order=0,
        width="full",
    ))

    db.commit()
    print(f"✅ Seeded Darshan Retreat form with {db.query(DynamicFormSection).filter(DynamicFormSection.form_template_id == form.id).count()} sections")


def main():
    """Main migration function."""
    print("="*60)
    print("DYNAMIC FORMS MIGRATION")
    print("="*60)

    # Create tables
    create_tables()

    # Seed data
    db = SessionLocal()
    try:
        seed_darshan_form(db)
        print("\n" + "="*60)
        print("✅ Migration completed successfully!")
        print("="*60)
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
