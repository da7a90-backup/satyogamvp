"""
Testimonials API Router
Handles testimonial CRUD operations for products
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID

from app.core.deps import get_current_user, get_db, require_admin
from app.models.user import User
from app.models.product import Testimonial, Product
from app.schemas.testimonial import (
    TestimonialResponse,
    TestimonialCreate,
    TestimonialUpdate,
    TestimonialReorder
)

router = APIRouter()


@router.get("/", response_model=List[TestimonialResponse])
async def get_testimonials(
    product_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    List testimonials with optional filtering.

    Query parameters:
    - product_id: Filter by product ID
    - is_active: Filter by active status
    - skip: Number of testimonials to skip (pagination)
    - limit: Number of testimonials to return (max 1000)
    """
    query = db.query(Testimonial)

    # Apply filters
    if product_id:
        query = query.filter(Testimonial.product_id == product_id)

    if is_active is not None:
        query = query.filter(Testimonial.is_active == is_active)

    # Order by order_index and created_at
    query = query.order_by(Testimonial.order_index.asc(), Testimonial.created_at.desc())

    # Pagination
    testimonials = query.offset(skip).limit(limit).all()

    return testimonials


@router.get("/{testimonial_id}", response_model=TestimonialResponse)
async def get_testimonial(
    testimonial_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific testimonial by ID.
    """
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()

    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    return testimonial


@router.post("/", response_model=TestimonialResponse)
async def create_testimonial(
    testimonial_data: TestimonialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new testimonial (admin only).
    """
    # Verify product exists
    product = db.query(Product).filter(Product.id == testimonial_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Create testimonial
    testimonial = Testimonial(**testimonial_data.model_dump())
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)

    return testimonial


@router.put("/{testimonial_id}", response_model=TestimonialResponse)
async def update_testimonial(
    testimonial_id: UUID,
    testimonial_data: TestimonialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update a testimonial (admin only).
    """
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()

    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    # If product_id is being changed, verify new product exists
    if testimonial_data.product_id and testimonial_data.product_id != testimonial.product_id:
        product = db.query(Product).filter(Product.id == testimonial_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

    # Update fields
    update_data = testimonial_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(testimonial, field, value)

    db.commit()
    db.refresh(testimonial)

    return testimonial


@router.delete("/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a testimonial (admin only).
    """
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()

    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    db.delete(testimonial)
    db.commit()

    return {"message": "Testimonial deleted successfully"}


@router.put("/reorder")
async def reorder_testimonials(
    reorder_data: List[TestimonialReorder],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Reorder multiple testimonials at once (admin only).

    Accepts a list of {testimonial_id, new_order_index} objects.
    """
    for item in reorder_data:
        testimonial = db.query(Testimonial).filter(Testimonial.id == item.testimonial_id).first()
        if testimonial:
            testimonial.order_index = item.new_order_index

    db.commit()

    return {"message": f"Reordered {len(reorder_data)} testimonials successfully"}
