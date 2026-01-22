"""Authentication router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from ..core.deps import get_current_user
from ..models.user import User, UserProfile, MembershipTierEnum
from ..models.analytics import UserAnalytics
from ..models.email import NewsletterSubscriber, SubscriberStatus
from ..models.course import Course, CourseEnrollment, EnrollmentStatus
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token
from ..services import mixpanel_service, ga4_service, sendgrid_service

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and send email verification."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Generate verification token (valid for 7 days)
    verification_token = str(uuid.uuid4())
    token_expiration = datetime.utcnow() + timedelta(days=7)

    # Create user (inactive until email verified)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        membership_tier=MembershipTierEnum.FREE,
        is_active=False,
        email_verified=False,
        email_verification_token=verification_token,
        email_verification_token_expires=token_expiration,
    )
    db.add(user)
    db.flush()

    # Create user profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)

    # Create user analytics
    analytics = UserAnalytics(user_id=user.id)
    db.add(analytics)

    # Auto-enroll in Fundamentals of Meditation course
    fundamentals_course = db.query(Course).filter(
        Course.slug == "fundamentals-of-meditation"
    ).first()

    if fundamentals_course:
        enrollment = CourseEnrollment(
            user_id=user.id,
            course_id=fundamentals_course.id,
            status=EnrollmentStatus.ACTIVE,
            enrolled_at=datetime.utcnow()
        )
        db.add(enrollment)

    # Subscribe to newsletter if requested
    if user_data.accept_newsletter:
        # Check if subscriber already exists
        existing_subscriber = db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == user.email
        ).first()

        if existing_subscriber:
            # Update existing subscriber with new user_id
            existing_subscriber.user_id = user.id
            existing_subscriber.name = user.name
            existing_subscriber.status = SubscriberStatus.ACTIVE
        else:
            # Create new newsletter subscriber
            newsletter_subscriber = NewsletterSubscriber(
                email=user.email,
                name=user.name,
                user_id=user.id,
                status=SubscriberStatus.ACTIVE,
            )
            db.add(newsletter_subscriber)

    db.commit()
    db.refresh(user)

    # Track signup event
    await mixpanel_service.track_signup(
        str(user.id),
        user.email,
        user.membership_tier.value,
    )
    await ga4_service.track_signup(str(user.id))

    # Send verification email (not welcome email yet)
    await sendgrid_service.send_verification_email(
        user.email,
        user.name,
        verification_token,
    )

    # Send newsletter welcome if subscribed
    if user_data.accept_newsletter:
        await sendgrid_service.send_newsletter_welcome(user.email, user.name)

    return {
        "message": "Registration successful! Please check your email to verify your account.",
        "email": user.email,
    }


@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email address with token."""
    # Find user by verification token
    user = db.query(User).filter(User.email_verification_token == token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token",
        )

    # Check if token has expired
    if user.email_verification_token_expires and user.email_verification_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new one.",
        )

    # Check if already verified
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified",
        )

    # Verify user
    user.email_verified = True
    user.is_active = True
    user.email_verification_token = None
    user.email_verification_token_expires = None
    db.commit()

    # Send welcome email now that user is verified
    await sendgrid_service.send_welcome_email(
        user.email,
        user.name,
        user.membership_tier.value,
    )

    return {
        "message": "Email verified successfully! You can now login.",
        "email": user.email,
    }


@router.post("/resend-verification")
async def resend_verification(email: str, db: Session = Depends(get_db)):
    """Resend verification email."""
    # Find user by email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check if already verified
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified",
        )

    # Generate new verification token
    verification_token = str(uuid.uuid4())
    token_expiration = datetime.utcnow() + timedelta(days=7)

    user.email_verification_token = verification_token
    user.email_verification_token_expires = token_expiration
    db.commit()

    # Send verification email
    await sendgrid_service.send_verification_email(
        user.email,
        user.name,
        verification_token,
    )

    return {
        "message": "Verification email sent! Please check your inbox.",
        "email": user.email,
    }


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

    # Check if email is verified
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link.",
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
