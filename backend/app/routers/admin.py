"""Admin router - TO BE IMPLEMENTED."""

from fastapi import APIRouter, Depends

from ..core.deps import get_current_admin
from ..models.user import User

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(admin: User = Depends(get_current_admin)):
    """Admin dashboard."""
    return {"message": "Admin dashboard - to be implemented"}
