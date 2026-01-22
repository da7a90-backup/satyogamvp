"""
Cart API Router
Handles shopping cart operations: add, update, remove items
"""
from typing import List
from decimal import Decimal
from pydantic import UUID4
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.product import Product, Cart, CartItem
from app.schemas.product import (
    CartResponse,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse
)

router = APIRouter()


def get_or_create_cart(user_id: str, db: Session) -> Cart:
    """Get user's cart or create one if it doesn't exist."""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's cart with all items.
    """
    cart = get_or_create_cart(current_user.id, db)

    # Calculate totals
    total = sum(item.product.price * item.quantity for item in cart.items)
    item_count = sum(item.quantity for item in cart.items)

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": cart.items,
        "total": total,
        "item_count": item_count,
        "created_at": cart.created_at,
        "updated_at": cart.updated_at
    }


@router.post("/items", response_model=CartItemResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a product to the cart or update quantity if it already exists.
    """
    # Get or create cart
    cart = get_or_create_cart(current_user.id, db)

    # Verify product exists
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id
    ).first()

    if existing_item:
        # Update quantity
        existing_item.quantity += item_data.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        return cart_item


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: UUID4,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the quantity of a cart item.
    """
    # Get user's cart
    cart = get_or_create_cart(current_user.id, db)

    # Find the cart item
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Update quantity
    if item_data.quantity <= 0:
        # Remove item if quantity is 0 or negative
        db.delete(cart_item)
        db.commit()
        raise HTTPException(status_code=200, detail="Item removed from cart")
    else:
        cart_item.quantity = item_data.quantity
        db.commit()
        db.refresh(cart_item)
        return cart_item


@router.delete("/items/{item_id}")
async def remove_from_cart(
    item_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove an item from the cart.
    """
    # Get user's cart
    cart = get_or_create_cart(current_user.id, db)

    # Find the cart item
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()

    return {"message": "Item removed from cart"}


@router.delete("/")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all items from the cart.
    """
    cart = get_or_create_cart(current_user.id, db)

    # Delete all items
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()

    return {"message": "Cart cleared"}


@router.get("/count")
async def get_cart_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the total number of items in the cart (for badge display).
    """
    cart = get_or_create_cart(current_user.id, db)

    total_items = sum(item.quantity for item in cart.items)

    return {"count": total_items}
