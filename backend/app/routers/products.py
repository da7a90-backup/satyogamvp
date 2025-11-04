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
from app.models.product import Product, ProductType
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    category: Optional[str] = None,
    product_type: Optional[ProductType] = None,
    featured: Optional[bool] = None,
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

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.short_description.ilike(search_term)
            )
        )

    # Apply sorting
    if sort_by == "name":
        order_col = Product.name
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

    return products


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


@router.get("/featured", response_model=List[ProductResponse])
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

    return products


@router.get("/retreat-packages", response_model=List[ProductResponse])
async def get_retreat_packages(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all retreat audio/video packages specifically.
    """
    products = db.query(Product).filter(
        Product.product_type == ProductType.RETREAT_PACKAGE
    ).order_by(
        Product.created_at.desc()
    ).offset(skip).limit(limit).all()

    return products


@router.get("/{slug}", response_model=ProductResponse)
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

    return product


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
            Product.product_type == product_type
        ).scalar()
        type_counts[product_type.value] = count

    return {
        "total_products": total_products,
        "featured_count": featured_count,
        "by_type": type_counts
    }
