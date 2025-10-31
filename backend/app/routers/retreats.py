"""Retreats router - TO BE IMPLEMENTED."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_retreats():
    """Get all retreats."""
    return {"retreats": [], "message": "To be implemented"}


@router.get("/{slug}")
async def get_retreat(slug: str):
    """Get single retreat."""
    return {"message": "To be implemented"}
