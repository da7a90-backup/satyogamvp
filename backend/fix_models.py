#!/usr/bin/env python3
"""
Fix all models to use cross-database compatible types.
Replaces PostgreSQL-specific types with universal equivalents.
"""
import os
import re

files_to_fix = [
    "app/models/analytics.py",
    "app/models/blog.py",
    "app/models/course.py",
    "app/models/email.py",
    "app/models/event.py",
    "app/models/forms.py",
    "app/models/membership.py",
    "app/models/payment.py",
    "app/models/product.py",
    "app/models/retreat.py",
    "app/models/teaching.py",
    "app/models/user.py",
]

replacements = [
    # Import replacement
    (
        r"from sqlalchemy\.dialects\.postgresql import UUID, JSONB",
        "from sqlalchemy import String\nfrom ..core.db_types import UUID_TYPE, JSON_TYPE"
    ),
    (
        r"from sqlalchemy\.dialects\.postgresql import UUID",
        "from sqlalchemy import String\nfrom ..core.db_types import UUID_TYPE"
    ),
    (
        r"from sqlalchemy\.dialects\.postgresql import JSONB",
        "from ..core.db_types import JSON_TYPE"
    ),
    # Type replacements in Column definitions
    (r"Column\(UUID\(as_uuid=True\)", "Column(UUID_TYPE"),
    (r"Column\(JSONB", "Column(JSON_TYPE"),
    (r"ForeignKey\(\"(\w+)\.id\"", r'ForeignKey("\1.id"'),  # Keep as is
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - not found")
        continue
    
    print(f"Fixing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath}")
    else:
        print(f"  - No changes needed for {filepath}")

print("\n✅ All models fixed!")
