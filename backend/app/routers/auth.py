"""Authentication router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from ..core.deps import get_current_user
from ..models.user import User, UserProfile, MembershipTierEnum
from ..models.analytics import UserAnalytics
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token
from ..services import mixpanel_service, ga4_service, sendgrid_service

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        membership_tier=MembershipTierEnum.FREE,
    )
    db.add(user)
    db.flush()

    # Create user profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)

    # Create user analytics
    analytics = UserAnalytics(user_id=user.id)
    db.add(analytics)

    db.commit()
    db.refresh(user)

    # Track signup event
    await mixpanel_service.track_signup(
        str(user.id),
        user.email,
        user.membership_tier.value,
    )
    await ga4_service.track_signup(str(user.id))

    # Send welcome email
    await sendgrid_service.send_welcome_email(
        user.email,
        user.name,
        user.membership_tier.value,
    )

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user."""
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Track login event
    await mixpanel_service.track_login(str(user.id), user.email)
    await ga4_service.track_login(str(user.id))

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token."""
    from ..core.security import decode_token

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Generate new tokens
    new_access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )
