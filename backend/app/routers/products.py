"""
Products API Router
Handles product listing, filtering, categories, and CRUD operations
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.product import Product, ProductType, ProductBookmark, UserProductAccess, Testimonial
from app.models.retreat import Retreat, RetreatPortal
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate
from app.services.media_service import MediaService

router = APIRouter()


@router.get("/")
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    category: Optional[str] = None,
    product_type: Optional[ProductType] = None,
    featured: Optional[bool] = None,
    published: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(name|price|created_at|featured)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """
    List products with filtering and pagination.

    Query parameters:
    - skip: Number of products to skip (pagination)
    - limit: Number of products to return (max 100)
    - category: Filter by category name
    - product_type: Filter by product type (RETREAT_PACKAGE, BOOK, EBOOK, etc.)
    - featured: Filter featured products only
    - published: Filter by published status
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - search: Search in name and description
    - sort_by: Sort field (name, price, created_at, featured)
    - sort_order: Sort order (asc, desc)
    """
    query = db.query(Product)

    # Apply filters
    if category:
        query = query.filter(Product.categories.contains(category))

    if product_type:
        query = query.filter(Product.type == product_type)

    if featured is not None:
        query = query.filter(Product.featured == featured)

    if published is not None:
        query = query.filter(Product.published == published)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.title.ilike(search_term),
                Product.description.ilike(search_term),
                Product.short_description.ilike(search_term)
            )
        )

    # Apply sorting
    if sort_by == "name":
        order_col = Product.title
    elif sort_by == "price":
        order_col = Product.price
    elif sort_by == "featured":
        order_col = Product.featured
    else:
        order_col = Product.created_at

    if sort_order == "desc":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())

    # Pagination
    products = query.offset(skip).limit(limit).all()

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Build response with resolved media paths
    result = []
    for product in products:
        product_data = {
            "id": str(product.id),
            "slug": product.slug,
            "name": product.title,
            "title": product.title,  # Alias for compatibility
            "description": product.description,
            "short_description": product.short_description,
            "price": float(product.price) if product.price else None,
            "featured_image": product.featured_image,
            "type": product.type.value if hasattr(product.type, 'value') else product.type,
            "product_type": product.type.value if hasattr(product.type, 'value') else product.type,  # Alias
            "categories": product.categories,
            "featured": product.featured,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "portal_media": product.portal_media,  # Include portal media for retreat packages
        }

        # Resolve all media paths to CDN URLs
        product_data = media_service.resolve_dict(product_data)
        result.append(product_data)

    return result


@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """
    Get all unique product categories with product counts.
    """
    # Get all products and extract categories
    products = db.query(Product).all()

    category_counts = {}
    for product in products:
        if product.categories:
            for category in product.categories:
                category_counts[category] = category_counts.get(category, 0) + 1

    # Sort by count descending
    categories = [
        {"name": cat, "count": count}
        for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    return categories


@router.get("/featured")
async def get_featured_products(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get featured products (for homepage or special displays).
    """
    products = db.query(Product).filter(
        Product.featured == True
    ).order_by(
        Product.created_at.desc()
    ).limit(limit).all()

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Build response with resolved media paths
    result = []
    for product in products:
        product_data = {
            "id": str(product.id),
            "slug": product.slug,
            "name": product.title,
            "title": product.title,
            "description": product.description,
            "short_description": product.short_description,
            "price": float(product.price) if product.price else None,
            "featured_image": product.featured_image,
            "type": product.type.value if hasattr(product.type, 'value') else product.type,
            "product_type": product.type.value if hasattr(product.type, 'value') else product.type,
            "categories": product.categories,
            "featured": product.featured,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "portal_media": product.portal_media,  # Include portal media for retreat packages
        }

        # Resolve all media paths to CDN URLs
        product_data = media_service.resolve_dict(product_data)
        result.append(product_data)

    return result


@router.get("/retreat-packages")
async def get_retreat_packages(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all retreat audio/video packages specifically.
    """
    products = db.query(Product).filter(
        Product.type == ProductType.RETREAT_PORTAL_ACCESS
    ).order_by(
        Product.created_at.desc()
    ).offset(skip).limit(limit).all()

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Build response with resolved media paths
    result = []
    for product in products:
        product_data = {
            "id": str(product.id),
            "slug": product.slug,
            "name": product.title,
            "title": product.title,
            "description": product.description,
            "short_description": product.short_description,
            "price": float(product.price) if product.price else None,
            "featured_image": product.featured_image,
            "type": product.type.value if hasattr(product.type, 'value') else product.type,
            "product_type": product.type.value if hasattr(product.type, 'value') else product.type,
            "categories": product.categories,
            "featured": product.featured,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "portal_media": product.portal_media,  # Include portal media for retreat packages
        }

        # Resolve all media paths to CDN URLs
        product_data = media_service.resolve_dict(product_data)
        result.append(product_data)

    return result


@router.get("/{slug}")
async def get_product(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get a single product by slug.
    """
    product = db.query(Product).filter(Product.slug == slug).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Get active testimonials for this product, ordered by order_index
    testimonials = db.query(Testimonial).filter(
        Testimonial.product_id == product.id,
        Testimonial.is_active == True
    ).order_by(Testimonial.order_index.asc(), Testimonial.created_at.desc()).all()

    # Build response with resolved media paths
    product_data = {
        "id": str(product.id),
        "slug": product.slug,
        "name": product.title,
        "title": product.title,
        "description": product.description,
        "short_description": product.short_description,
        "price": float(product.price) if product.price else None,
        "featured_image": product.featured_image,
        "type": product.type.value if hasattr(product.type, 'value') else product.type,
        "product_type": product.type.value if hasattr(product.type, 'value') else product.type,
        "categories": product.categories,
        "featured": product.featured,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "portal_media": product.portal_media,  # Include portal media for retreat packages
        "testimonials": [
            {
                "id": str(t.id),
                "quote": t.quote,
                "author_name": t.author_name,
                "author_location": t.author_location,
                "author_avatar_url": t.author_avatar_url,
                "order_index": t.order_index
            }
            for t in testimonials
        ]
    }

    # Resolve all media paths to CDN URLs
    product_data = media_service.resolve_dict(product_data)

    return product_data


@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new product (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check if slug already exists
    existing = db.query(Product).filter(Product.slug == product_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")

    # Create product
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a product (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update fields
    for field, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a product (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}


@router.get("/stats/overview")
async def get_product_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get product statistics (admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    total_products = db.query(func.count(Product.id)).scalar()
    featured_count = db.query(func.count(Product.id)).filter(Product.featured == True).scalar()

    # Count by type
    type_counts = {}
    for product_type in ProductType:
        count = db.query(func.count(Product.id)).filter(
            Product.type == product_type
        ).scalar()
        type_counts[product_type.value] = count

    return {
        "total_products": total_products,
        "featured_count": featured_count,
        "by_type": type_counts
    }


@router.post("/{product_id}/bookmark")
async def toggle_bookmark(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add or remove product from bookmarks/saved for later."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already bookmarked
    bookmark = (
        db.query(ProductBookmark)
        .filter(
            ProductBookmark.user_id == current_user.id,
            ProductBookmark.product_id == product_id,
        )
        .first()
    )

    if bookmark:
        # Remove from bookmarks
        db.delete(bookmark)
        db.commit()
        return {"message": "Removed from bookmarks", "is_bookmarked": False}
    else:
        # Add to bookmarks
        bookmark = ProductBookmark(
            user_id=current_user.id,
            product_id=product_id,
        )
        db.add(bookmark)
        db.commit()
        return {"message": "Added to bookmarks", "is_bookmarked": True}


@router.get("/bookmarks/list")
async def get_bookmarks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's bookmarked/saved for later products."""
    bookmarks = (
        db.query(Product)
        .join(ProductBookmark, Product.id == ProductBookmark.product_id)
        .filter(ProductBookmark.user_id == current_user.id)
        .order_by(ProductBookmark.created_at.desc())
        .all()
    )

    return {"bookmarks": bookmarks}


@router.get("/{slug}/portal-access")
async def get_portal_access(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get product portal access data including retreat portal if linked.

    This endpoint:
    1. Validates user has purchased/has access to the product
    2. Returns product data including portal_media
    3. If product.retreat_id exists, includes retreat and retreat_portal data
    4. Enables smart portal viewer to show either simple carousel or day-by-day structure
    """
    # Get product by slug
    product = db.query(Product).filter(Product.slug == slug).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Verify user has access to this product
    access = (
        db.query(UserProductAccess)
        .filter(
            UserProductAccess.user_id == current_user.id,
            UserProductAccess.product_id == product.id
        )
        .first()
    )

    if not access:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this product. Please purchase it first."
        )

    # Check if access has expired
    from datetime import datetime
    if access.expires_at and access.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=403,
            detail="Your access to this product has expired"
        )

    # Build base product response
    product_data = {
        "id": str(product.id),
        "slug": product.slug,
        "title": product.title,
        "description": product.description,
        "short_description": product.short_description,
        "type": product.type.value if hasattr(product.type, 'value') else product.type,
        "price": float(product.price) if product.price else None,
        "thumbnail_url": product.thumbnail_url,
        "featured_image": product.featured_image,
        "categories": product.categories,
        "digital_content_url": product.digital_content_url,  # Direct URL for single-file products (audio, ebook, etc)
        "portal_media": product.portal_media,  # {youtube: [], mp3: [], mp4: [], etc}
        "retreat_id": str(product.retreat_id) if product.retreat_id else None,
        "has_retreat_portal": False,
        "retreat_data": None
    }

    # If product is linked to a retreat, fetch retreat portal structure
    if product.retreat_id:
        retreat = db.query(Retreat).filter(Retreat.id == product.retreat_id).first()
        if retreat:
            # Get retreat portal(s) for this retreat
            portals = db.query(RetreatPortal).filter(
                RetreatPortal.retreat_id == retreat.id
            ).order_by(RetreatPortal.order_index).all()

            product_data["has_retreat_portal"] = len(portals) > 0
            product_data["retreat_data"] = {
                "id": str(retreat.id),
                "slug": retreat.slug,
                "title": retreat.title,
                "description": retreat.description,
                "type": retreat.type.value if hasattr(retreat.type, 'value') else retreat.type,
                "start_date": retreat.start_date.isoformat() if retreat.start_date else None,
                "end_date": retreat.end_date.isoformat() if retreat.end_date else None,
                "portals": [
                    {
                        "id": str(portal.id),
                        "title": portal.title,
                        "description": portal.description,
                        "content": portal.content,  # Day-by-day structure
                        "order_index": portal.order_index
                    }
                    for portal in portals
                ]
            }

    return product_data
