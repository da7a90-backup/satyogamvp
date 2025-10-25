"""Products router - TO BE IMPLEMENTED."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_products():
    """Get all products."""
    return {"products": [], "message": "To be implemented"}
