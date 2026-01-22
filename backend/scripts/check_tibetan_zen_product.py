#!/usr/bin/env python3
"""
Check the product data for Shunyamurti Reads: Tibetan Zen
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.product import Product
import json

def check_product():
    db: Session = SessionLocal()
    try:
        # Search for the product
        products = db.query(Product).filter(
            Product.title.ilike('%Tibetan%Zen%')
        ).all()

        if not products:
            print("❌ No products found matching 'Tibetan Zen'")
            # Let's see all products with "Shunyamurti Reads" category
            print("\n📚 Searching for all 'Shunyamurti Reads' products...")
            products = db.query(Product).all()
            for p in products:
                if p.categories and any('shunyamurti read' in cat.lower() for cat in p.categories):
                    print(f"\n  - {p.title} (slug: {p.slug})")
            return

        print(f"✅ Found {len(products)} product(s)")

        for product in products:
            print(f"\n{'='*80}")
            print(f"Product: {product.title}")
            print(f"{'='*80}")
            print(f"ID: {product.id}")
            print(f"Slug: {product.slug}")
            print(f"Type: {product.type}")
            print(f"Price: ${product.price}")
            print(f"Categories: {product.categories}")
            print(f"\ndigital_content_url: {product.digital_content_url}")
            print(f"thumbnail_url: {product.thumbnail_url}")
            print(f"featured_image: {product.featured_image}")

            if product.portal_media:
                print(f"\nportal_media type: {type(product.portal_media)}")
                print(f"portal_media:")
                print(json.dumps(product.portal_media, indent=2, default=str))
            else:
                print(f"\n❌ portal_media is NULL or empty")

            # Check UserProductAccess
            from app.models.product import UserProductAccess
            accesses = db.query(UserProductAccess).filter(
                UserProductAccess.product_id == product.id
            ).all()

            print(f"\n👥 User Access Records: {len(accesses)}")
            for access in accesses:
                from app.models.user import User
                user = db.query(User).filter(User.id == access.user_id).first()
                print(f"  - User: {user.email if user else 'Unknown'} (granted: {access.granted_at})")

    finally:
        db.close()

if __name__ == "__main__":
    check_product()
