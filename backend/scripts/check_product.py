"""Check product data in database."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.product import Product
import json

db = SessionLocal()

try:
    product = db.query(Product).filter(Product.title.ilike('%garuda%')).first()

    if product:
        print(f"Product: {product.title}")
        print(f"Slug: {product.slug}")
        print(f"Type: {product.type}")
        print(f"Digital Content URL: {product.digital_content_url}")
        print(f"\nPortal Media:")
        print(json.dumps(product.portal_media, indent=2))
    else:
        print("Product not found")
finally:
    db.close()
