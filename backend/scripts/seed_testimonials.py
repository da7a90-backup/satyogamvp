#!/usr/bin/env python3
"""
Seed script for product testimonials
Migrates hardcoded testimonials to database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.product import Product, Testimonial
import uuid

def seed_testimonials():
    """Seed testimonials for products."""
    db: Session = SessionLocal()

    try:
        # Get a sample product to attach testimonials to
        # You can modify this to target specific products by slug
        product = db.query(Product).first()

        if not product:
            print("❌ No products found. Please seed products first.")
            return

        print(f"📦 Adding testimonials to product: {product.title}")

        # Sample testimonials data (from previously hardcoded data)
        testimonials_data = [
            {
                "quote": "This teaching transformed my understanding of consciousness. The depth and clarity are unmatched.",
                "author_name": "Sarah Mitchell",
                "author_location": "California, USA",
                "author_avatar_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                "order_index": 0
            },
            {
                "quote": "Life-changing content. I've been on a spiritual path for years, but this opened new doors of perception.",
                "author_name": "Michael Chen",
                "author_location": "Toronto, Canada",
                "author_avatar_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                "order_index": 1
            },
            {
                "quote": "The practices and teachings have brought profound peace to my daily life. Highly recommended.",
                "author_name": "Emma Rodriguez",
                "author_location": "Barcelona, Spain",
                "author_avatar_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                "order_index": 2
            },
            {
                "quote": "Shunyamurti's wisdom cuts through illusion with precision and compassion. A true gift.",
                "author_name": "David Thompson",
                "author_location": "London, UK",
                "author_avatar_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                "order_index": 3
            },
            {
                "quote": "These teachings are exactly what humanity needs right now. Clear, powerful, and transformative.",
                "author_name": "Priya Sharma",
                "author_location": "Mumbai, India",
                "author_avatar_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                "order_index": 4
            },
            {
                "quote": "After exploring many spiritual paths, I found the authentic wisdom I was seeking here.",
                "author_name": "James Wilson",
                "author_location": "Sydney, Australia",
                "author_avatar_url": "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public",
                "order_index": 5
            }
        ]

        # Check if testimonials already exist for this product
        existing_count = db.query(Testimonial).filter(
            Testimonial.product_id == product.id
        ).count()

        if existing_count > 0:
            print(f"⚠️  Product already has {existing_count} testimonials. Skipping...")
            return

        # Create testimonials
        created_count = 0
        for data in testimonials_data:
            testimonial = Testimonial(
                id=uuid.uuid4(),
                product_id=product.id,
                quote=data["quote"],
                author_name=data["author_name"],
                author_location=data["author_location"],
                author_avatar_url=data["author_avatar_url"],
                order_index=data["order_index"],
                is_active=True
            )
            db.add(testimonial)
            created_count += 1

        db.commit()
        print(f"✅ Created {created_count} testimonials for '{product.title}'")
        print(f"   Product ID: {product.id}")
        print(f"   Product Slug: {product.slug}")

    except Exception as e:
        print(f"❌ Error seeding testimonials: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_testimonials_for_product(product_slug: str, testimonials_list: list):
    """Seed testimonials for a specific product by slug."""
    db: Session = SessionLocal()

    try:
        # Get product by slug
        product = db.query(Product).filter(Product.slug == product_slug).first()

        if not product:
            print(f"❌ Product not found with slug: {product_slug}")
            return

        print(f"📦 Adding testimonials to product: {product.title}")

        # Check if testimonials already exist
        existing_count = db.query(Testimonial).filter(
            Testimonial.product_id == product.id
        ).count()

        if existing_count > 0:
            print(f"⚠️  Product already has {existing_count} testimonials. Skipping...")
            return

        # Create testimonials
        created_count = 0
        for idx, data in enumerate(testimonials_list):
            testimonial = Testimonial(
                id=uuid.uuid4(),
                product_id=product.id,
                quote=data.get("quote"),
                author_name=data.get("author_name"),
                author_location=data.get("author_location"),
                author_avatar_url=data.get("author_avatar_url"),
                order_index=data.get("order_index", idx),
                is_active=data.get("is_active", True)
            )
            db.add(testimonial)
            created_count += 1

        db.commit()
        print(f"✅ Created {created_count} testimonials for '{product.title}'")

    except Exception as e:
        print(f"❌ Error seeding testimonials: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding testimonials...")

    # Check for command line arguments
    if len(sys.argv) > 1:
        product_slug = sys.argv[1]
        print(f"   Target product: {product_slug}")
        # You can customize testimonials here or pass them as JSON
        seed_testimonials()
    else:
        # Seed first product with default testimonials
        seed_testimonials()

    print("✨ Seeding complete!")
