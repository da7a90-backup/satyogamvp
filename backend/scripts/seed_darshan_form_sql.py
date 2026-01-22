#!/usr/bin/env python3
"""
Simplified seeding script using raw SQL to avoid ORM conflicts.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import SessionLocal
import uuid

def seed_darshan_form():
    """Seed Darshan retreat form using raw SQL."""
    db = SessionLocal()
    try:
        # Check if form exists
        result = db.execute(text("SELECT COUNT(*) FROM dynamic_form_templates WHERE slug = 'darshan-retreat-application'"))
        if result.scalar() > 0:
            print("⚠️  Darshan form already exists, skipping...")
            return
        
        # Create form template
        form_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO dynamic_form_templates (id, slug, title, subtitle, description, is_published)
            VALUES (:id, :slug, :title, :subtitle, :description, :is_published)
        """), {
            "id": form_id,
            "slug": "darshan-retreat-application",
            "title": "Darshan Retreat Application",
            "subtitle": "Private Darshan Retreat with Shunyamurti",
            "description": "Please read carefully before starting the process",
            "is_published": True
        })
        
        # Create section 1: Introduction
        section1_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO dynamic_form_sections (id, form_template_id, title, description, "order", tagline)
            VALUES (:id, :form_template_id, :title, :description, :order, :tagline)
        """), {
            "id": section1_id,
            "form_template_id": form_id,
            "title": "Please read carefully before starting the process",
            "description": "To protect the integrity of this spiritual refuge we want to ensure that all visitors arrive with an understanding of the real purpose and power of our retreats and feel aligned with what we offer.",
            "order": 0,
            "tagline": "PROGRAM APPLICATION"
        })
        
        # Create section 2: About You
        section2_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO dynamic_form_sections (id, form_template_id, title, "order", tagline)
            VALUES (:id, :form_template_id, :title, :order, :tagline)
        """), {
            "id": section2_id,
            "form_template_id": form_id,
            "title": "About you",
            "order": 1,
            "tagline": "PROGRAM APPLICATION"
        })
        
        # Add photo field
        db.execute(text("""
            INSERT INTO dynamic_form_fields (id, section_id, label, field_type, help_text, is_required, "order", width)
            VALUES (:id, :section_id, :label, :field_type, :help_text, :is_required, :order, :width)
        """), {
            "id": str(uuid.uuid4()),
            "section_id": section2_id,
            "label": "Your photo",
            "field_type": "photo",
            "help_text": "Click to upload or drag and drop SVG, PNG, JPG or GIF (max. 800x400px)",
            "is_required": True,
            "order": 0,
            "width": "full"
        })
        
        # Add first name and last name (grouped)
        group_id_1 = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO dynamic_form_fields (id, section_id, label, field_type, placeholder, is_required, "order", group_id, width)
            VALUES 
            (:id1, :section_id, 'First name', 'text', 'First name', true, 1, :group_id, 'half'),
            (:id2, :section_id, 'Last name', 'text', 'Last name', true, 2, :group_id, 'half')
        """), {
            "id1": str(uuid.uuid4()),
            "id2": str(uuid.uuid4()),
            "section_id": section2_id,
            "group_id": group_id_1
        })
        
        # Add email
        db.execute(text("""
            INSERT INTO dynamic_form_fields (id, section_id, label, field_type, placeholder, is_required, "order", width)
            VALUES (:id, :section_id, 'Email', 'email', 'you@company.com', true, 3, 'full')
        """), {
            "id": str(uuid.uuid4()),
            "section_id": section2_id
        })
        
        db.commit()
        print("✅ Darshan form seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_darshan_form()
