"""Events router - TO BE IMPLEMENTED."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_events():
    """Get all events."""
    return {"events": [], "message": "To be implemented"}
