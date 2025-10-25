"""Users router."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User

router = APIRouter()


@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile."""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "membership_tier": current_user.membership_tier.value,
    }


@router.put("/profile")
async def update_profile(
    name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile."""
    if name:
        current_user.name = name
        db.commit()

    return {"message": "Profile updated successfully"}
