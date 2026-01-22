#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import SessionLocal
import uuid

db = SessionLocal()
try:
    # Check if form exists
    result = db.execute(text("SELECT COUNT(*) FROM dynamic_form_templates WHERE slug = 'darshan-retreat-application'"))
    if result.scalar() > 0:
        print("⚠️  Form already exists")
        exit(0)
    
    # Create form
    form_id = str(uuid.uuid4())
    db.execute(text("INSERT INTO dynamic_form_templates (id, slug, title, is_published) VALUES (:id, :slug, :title, true)"), 
        {"id": form_id, "slug": "darshan-retreat-application", "title": "Darshan Retreat Application"})
    
    # Create section
    section_id = str(uuid.uuid4())
    db.execute(text('INSERT INTO dynamic_form_sections (id, form_template_id, title, "order") VALUES (:id, :fid, :title, 0)'),
        {"id": section_id, "fid": form_id, "title": "About you"})
    
    # Add fields (using uppercase enum values)
    db.execute(text('INSERT INTO dynamic_form_fields (id, section_id, label, field_type, is_required, "order") VALUES (:id, :sid, :label, :type, :req, :ord)'),
        [{"id": str(uuid.uuid4()), "sid": section_id, "label": "Your photo", "type": "PHOTO", "req": True, "ord": 0},
         {"id": str(uuid.uuid4()), "sid": section_id, "label": "First name", "type": "TEXT", "req": True, "ord": 1},
         {"id": str(uuid.uuid4()), "sid": section_id, "label": "Email", "type": "EMAIL", "req": True, "ord": 2}])
    
    db.commit()
    print("✅ Darshan form seeded!")
except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    raise
finally:
    db.close()
