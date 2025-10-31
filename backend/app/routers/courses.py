"""Courses router - TO BE IMPLEMENTED."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_courses():
    """Get all courses."""
    return {"courses": [], "message": "To be implemented"}


@router.get("/{slug}")
async def get_course(slug: str):
    """Get single course."""
    return {"message": "To be implemented"}
