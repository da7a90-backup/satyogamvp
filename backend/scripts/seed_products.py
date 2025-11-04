"""
Seed script to import products from products_categorized.json with portal media.
"""

import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Product, ProductType
from app.core.database import Base

# Create tables
Base.metadata.create_all(bind=engine)


def load_json_file(filepath: str):
    """Load JSON file from parent directory"""
    # Files are in parent directory
    parent_dir = Path(__file__).parent.parent.parent
    full_path = parent_dir / filepath
    print(f"Loading {full_path}...")
    with open(full_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def determine_product_type(categories: list, woo_type: list) -> str:
    """Determine ProductType enum from categories and woo_type"""
    if not categories:
        return "PHYSICAL"

    # Check categories
    has_audio = any('Audio' in cat for cat in categories)
    has_video = any('Video' in cat for cat in categories)
    has_retreat = any('Retreat' in cat for cat in categories)
    has_ebook = any('E-Book' in cat or 'ebook' in cat.lower() for cat in categories)
    has_guided = any('Guided' in cat for cat in categories)

    if has_retreat and (has_audio or has_video):
        return "RETREAT_PORTAL_ACCESS"
    elif has_audio and has_video:
        return "AUDIO_VIDEO"
    elif has_video:
        return "VIDEO"
    elif has_audio:
        return "AUDIO"
    elif has_ebook:
        return "EBOOK"
    elif has_guided:
        return "GUIDED_MEDITATION"
    else:
        return "PHYSICAL"


def is_retreat_package(categories: list) -> bool:
    """Check if product is a retreat package"""
    if not categories:
        return False
    return any('Retreat' in cat and 'Package' in cat for cat in categories)


def get_portal_media(product_slug: str, portal_media_list: list, slug_mappings: list):
    """Find portal media for a product by matching slugs"""
    # First try direct match by product_slug
    for portal in portal_media_list:
        if portal.get('product_slug') == product_slug:
            return portal
    
    # Try using slug mapping
    for mapping in slug_mappings:
        if mapping.get('product_slug') == product_slug or mapping.get('store_slug') == product_slug:
            target_slug = mapping.get('product_slug')
            for portal in portal_media_list:
                if portal.get('product_slug') == target_slug:
                    return portal
    
    return None


def seed_products(db: Session):
    """Main seeding function"""
    print("Starting product seeding...")
    
    # Load data files
    print("Loading data files...")
    products_data = load_json_file('products_categorized.json')
    portal_media_data = load_json_file('portal_media_final.json')
    slug_mappings = load_json_file('slug_mapping.json')
    
    products_list = products_data.get('all', [])
    print(f"Found {len(products_list)} products to import")
    print(f"Found {len(portal_media_data)} portal media items")
    print(f"Found {len(slug_mappings)} slug mappings")
    
    # Process each product
    created_count = 0
    skipped_count = 0
    
    for idx, prod in enumerate(products_list, 1):
        try:
            slug = prod.get('slug')
            if not slug:
                print(f"  [{idx}] Skipping product without slug")
                skipped_count += 1
                continue
            
            # Check if product already exists
            existing = db.query(Product).filter(Product.slug == slug).first()
            if existing:
                print(f"  [{idx}] Skipping existing product: {slug}")
                skipped_count += 1
                continue
            
            # Get categories
            categories = prod.get('categories', [])
            woo_type = prod.get('type', [])
            
            # Determine product type
            product_type = determine_product_type(categories, woo_type)

            # Check if retreat package and get portal media
            portal_media = None
            has_portal = is_retreat_package(categories)
            if has_portal:
                portal_media = get_portal_media(slug, portal_media_data, slug_mappings)
                if portal_media:
                    print(f"  [{idx}] ✓ Found portal media for: {slug}")
                else:
                    print(f"  [{idx}] ⚠ Retreat package but no portal media found for: {slug}")
            
            # Parse price
            price = float(prod.get('regular_price', 0))
            sale_price_str = prod.get('sale_price')
            sale_price = float(sale_price_str) if sale_price_str else None
            
            # Create product
            product = Product(
                slug=slug,
                title=prod.get('name', ''),
                short_description=prod.get('short_description'),
                description=prod.get('description'),
                type=product_type,  # Use the string value directly
                
                # Pricing
                price=price,
                regular_price=price,
                sale_price=sale_price,
                
                # Media
                featured_image=prod.get('featured_image'),
                images=prod.get('images', []),
                
                # WooCommerce metadata
                sku=prod.get('sku'),
                woo_type=woo_type,
                downloads=prod.get('downloads', []),
                
                # Categories and Tags
                categories=categories,
                tags=prod.get('tags', []),
                
                # Portal Media (if retreat package)
                portal_media=portal_media.get('media') if portal_media else None,
                has_video_category=portal_media.get('has_video_category', False) if portal_media else False,
                has_audio_category=portal_media.get('has_audio_category', False) if portal_media else False,
                product_slug=portal_media.get('product_slug') if portal_media else None,
                store_slug=portal_media.get('store_slug') if portal_media else None,
                portal_url=portal_media.get('portal_url') if portal_media else None,
                
                # Inventory
                is_available=prod.get('published', True),
                in_stock=prod.get('in_stock', True),
                stock_quantity=prod.get('stock_quantity'),
                published=prod.get('published', True),
                featured=prod.get('featured', False),
                
                # Additional metadata
                weight=prod.get('weight'),
                allow_reviews=prod.get('allow_reviews', False),
                external_url=prod.get('external_url')
            )
            
            db.add(product)
            created_count += 1
            
            if created_count % 10 == 0:
                print(f"  Progress: {created_count} products created...")
                
        except Exception as e:
            print(f"  [{idx}] Error processing product {prod.get('slug', 'unknown')}: {e}")
            import traceback
            traceback.print_exc()
            skipped_count += 1
            continue
    
    # Commit all
    try:
        db.commit()
        print(f"\n✓ Successfully created {created_count} products")
        print(f"✗ Skipped {skipped_count} products")
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error committing to database: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()
    
    print("\n✓ Product seeding completed!")
