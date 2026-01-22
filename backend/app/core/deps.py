"""FastAPI dependencies for authentication and authorization."""

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from .database import get_db
from .security import decode_token
from ..models.user import User, MembershipTierEnum
from ..models.forum import ForumUserBan

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token."""
    import logging
    logger = logging.getLogger(__name__)

    token = credentials.credentials
    logger.info(f"[AUTH] Attempting to authenticate with token: {token[:20]}...")

    # Decode token
    payload = decode_token(token)
    if not payload:
        logger.error(f"[AUTH] Failed to decode token: {token[:30]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"[AUTH] Token decoded successfully. Payload: {payload}")

    # Get user ID from payload
    user_id = payload.get("sub")
    if not user_id:
        logger.error(f"[AUTH] No 'sub' field in token payload: {payload}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    logger.info(f"[AUTH] Extracted user_id from token: {user_id}")

    # Fetch user from database
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f"[AUTH] User not found in database: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_active:
        logger.warning(f"[AUTH] User account is inactive: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    logger.info(f"[AUTH] ✓ Successfully authenticated user: {user.email}")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current admin user."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# Alias for backward compatibility
require_admin = get_current_admin


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Get user if authenticated, otherwise None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)

    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    return user


# Alias for backward compatibility
get_optional_current_user = get_optional_user


async def get_forum_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Get user with forum access (blocks FREE tier users and banned users)."""
    # Check if user has FREE membership (not allowed)
    if current_user.membership_tier == MembershipTierEnum.FREE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forum access requires GYANI membership or higher. Please upgrade your membership to access the forum.",
        )

    # Check if user is banned from forum
    from datetime import datetime
    active_ban = db.query(ForumUserBan).filter(
        ForumUserBan.user_id == current_user.id,
        (ForumUserBan.is_permanent == True) | (ForumUserBan.expires_at > datetime.utcnow())
    ).first()

    if active_ban:
        if active_ban.is_permanent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You have been permanently banned from the forum. Reason: {active_ban.reason}",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You are temporarily banned from the forum until {active_ban.expires_at}. Reason: {active_ban.reason}",
            )

    return current_user
