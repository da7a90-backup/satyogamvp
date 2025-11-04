from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..core.database import get_db

router = APIRouter()

# Pydantic models for responses
class FAQItem(BaseModel):
    id: int
    question: str
    answer: str
    order_index: int

    class Config:
        from_attributes = True


class FAQCategory(BaseModel):
    id: str
    label: str
    faqs: List[FAQItem]

    class Config:
        from_attributes = True


class FAQResponse(BaseModel):
    searchPlaceholder: str
    categories: List[FAQCategory]


@router.get("/faqs", response_model=FAQResponse)
async def get_faqs(
    page: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all active FAQ categories and questions.

    Args:
        page: Optional filter by page (e.g., 'faq', 'retreats', etc.)
        db: Database session

    Returns:
        FAQResponse with categories and their associated FAQs
    """
    try:
        # Get all active categories
        categories_query = text("""
            SELECT category_id, label, order_index
            FROM faq_categories
            WHERE is_active = TRUE
            ORDER BY order_index
        """)

        categories = db.execute(categories_query).fetchall()

        # Build response
        response_categories = []

        for cat in categories:
            category_id = cat.category_id

            # Get FAQs for this category
            if category_id == 'all':
                # For 'all' category, return empty array (will be handled on frontend)
                faq_items = []
            else:
                # Build FAQ query with optional page filter
                faq_query_str = """
                    SELECT id, question, answer, order_index
                    FROM faqs
                    WHERE category_id = :category_id
                    AND is_active = TRUE
                """

                if page:
                    faq_query_str += " AND (page = :page OR page IS NULL)"

                faq_query_str += " ORDER BY order_index"

                faq_query = text(faq_query_str)

                if page:
                    faqs = db.execute(faq_query, {"category_id": category_id, "page": page}).fetchall()
                else:
                    faqs = db.execute(faq_query, {"category_id": category_id}).fetchall()

                faq_items = [
                    FAQItem(
                        id=faq.id,
                        question=faq.question,
                        answer=faq.answer,
                        order_index=faq.order_index
                    )
                    for faq in faqs
                ]

            response_categories.append(
                FAQCategory(
                    id=category_id,
                    label=cat.label,
                    faqs=faq_items
                )
            )

        return FAQResponse(
            searchPlaceholder="Search for queries",
            categories=response_categories
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching FAQs: {str(e)}")


@router.get("/faqs/categories")
async def get_faq_categories(db: Session = Depends(get_db)):
    """Get all active FAQ categories."""
    try:
        query = text("""
            SELECT category_id, label, order_index
            FROM faq_categories
            WHERE is_active = TRUE
            ORDER BY order_index
        """)

        categories = db.execute(query).fetchall()

        return [
            {
                "id": cat.category_id,
                "label": cat.label,
                "order_index": cat.order_index
            }
            for cat in categories
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")


@router.get("/faqs/category/{category_id}")
async def get_faqs_by_category(
    category_id: str,
    db: Session = Depends(get_db)
):
    """Get all FAQs for a specific category."""
    try:
        # Check if category exists
        cat_query = text("""
            SELECT category_id, label
            FROM faq_categories
            WHERE category_id = :category_id AND is_active = TRUE
        """)

        category = db.execute(cat_query, {"category_id": category_id}).fetchone()

        if not category:
            raise HTTPException(status_code=404, detail=f"Category '{category_id}' not found")

        # Get FAQs
        if category_id == 'all':
            # Return all FAQs from all categories
            faq_query = text("""
                SELECT f.id, f.question, f.answer, f.order_index, f.category_id
                FROM faqs f
                INNER JOIN faq_categories fc ON f.category_id = fc.category_id
                WHERE f.is_active = TRUE AND fc.is_active = TRUE
                AND fc.category_id != 'all'
                ORDER BY fc.order_index, f.order_index
            """)
            faqs = db.execute(faq_query).fetchall()
        else:
            faq_query = text("""
                SELECT id, question, answer, order_index, category_id
                FROM faqs
                WHERE category_id = :category_id AND is_active = TRUE
                ORDER BY order_index
            """)
            faqs = db.execute(faq_query, {"category_id": category_id}).fetchall()

        return {
            "category": {
                "id": category.category_id,
                "label": category.label
            },
            "faqs": [
                {
                    "id": faq.id,
                    "question": faq.question,
                    "answer": faq.answer,
                    "order_index": faq.order_index
                }
                for faq in faqs
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching FAQs: {str(e)}")


@router.get("/faqs/gallery")
async def get_faq_gallery(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get FAQ page gallery images with CDN URLs"""
    from ..services.media_service import MediaService

    media_service = MediaService(db)

    return {
        "bannerImage": media_service.resolve_url("/FAQBanner.jpg"),
        "galleryImages": [
            {
                "url": media_service.resolve_url("/FAQ GALLERY 1.jpg"),
                "alt": "Guests arriving at ashram entrance"
            },
            {
                "url": media_service.resolve_url("/FAQ GALLERY 2.jpg"),
                "alt": "Ashram buildings under starlit sky"
            },
            {
                "url": media_service.resolve_url("/FAQ GALLERY 3.jpg"),
                "alt": "Person meditating by waterfall"
            },
            {
                "url": media_service.resolve_url("/FAQ GALLERY 4.jpg"),
                "alt": "Meditation cushions in dharma hall"
            },
            {
                "url": media_service.resolve_url("/FAQ GALLERY 5.jpg"),
                "alt": "Community members gathering in forest"
            },
            {
                "url": media_service.resolve_url("/FAQ GALLERY 6.jpg"),
                "alt": "Person viewing sunset from balcony"
            },
            {
                "url": media_service.resolve_url("/FAQ GALLERY 7.jpg"),
                "alt": "Mountain view at sunset"
            },
            {
                "url": media_service.resolve_url("/FAQ GALLERY 8.jpg"),
                "alt": "Mountain view at sunset"
            }
        ]
    }
