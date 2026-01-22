"""
Book Group Service
Handles business logic for book groups including access control.
"""

from sqlalchemy.orm import Session
from typing import Optional, Tuple
from datetime import datetime

from ..models.book_group import BookGroup, BookGroupAccess, BookGroupAccessType, BookGroupStatus
from ..models.user import User, MembershipTierEnum
from ..models.product import Product, ProductType
from ..models.event import UserCalendar


class BookGroupService:
    """Service for managing book group business logic."""

    @staticmethod
    def check_user_access(db: Session, user: User, book_group: BookGroup) -> Tuple[bool, Optional[BookGroupAccessType], Optional[str]]:
        """
        Check if a user has access to a book group.

        Returns:
            Tuple of (has_access, access_type, reason)
            - has_access: bool
            - access_type: BookGroupAccessType or None
            - reason: string description of why they have/don't have access
        """
        # Check if book group requires purchase
        if not book_group.requires_purchase:
            # Free for Gyani+ members
            if user.membership_tier in [
                MembershipTierEnum.GYANI,
                MembershipTierEnum.PRAGYANI,
                MembershipTierEnum.PRAGYANI_PLUS
            ]:
                return (True, BookGroupAccessType.MEMBERSHIP, "gyani_plus_member")

        # Check for explicit access record (purchased or manually granted)
        access = db.query(BookGroupAccess).filter(
            BookGroupAccess.user_id == user.id,
            BookGroupAccess.book_group_id == book_group.id
        ).first()

        if access:
            # Check if access has expired
            if access.expires_at and access.expires_at < datetime.utcnow():
                return (False, None, "access_expired")

            return (True, access.access_type, "purchased" if access.access_type == BookGroupAccessType.PURCHASE else "granted")

        # No access
        if book_group.requires_purchase:
            return (False, None, "requires_purchase")
        else:
            return (False, None, "requires_gyani_membership")

    @staticmethod
    def grant_access(
        db: Session,
        user_id: str,
        book_group_id: str,
        access_type: BookGroupAccessType,
        order_id: Optional[str] = None,
        expires_at: Optional[datetime] = None
    ) -> BookGroupAccess:
        """
        Grant a user access to a book group.

        Args:
            db: Database session
            user_id: User ID
            book_group_id: Book group ID
            access_type: How the access was granted (MEMBERSHIP or PURCHASE)
            order_id: Optional order ID (for purchases)
            expires_at: Optional expiration date

        Returns:
            BookGroupAccess record
        """
        # Check if access already exists
        existing_access = db.query(BookGroupAccess).filter(
            BookGroupAccess.user_id == user_id,
            BookGroupAccess.book_group_id == book_group_id
        ).first()

        if existing_access:
            # Update existing access
            existing_access.access_type = access_type
            existing_access.order_id = order_id
            existing_access.expires_at = expires_at
            existing_access.granted_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_access)
            return existing_access

        # Create new access record
        access = BookGroupAccess(
            user_id=user_id,
            book_group_id=book_group_id,
            access_type=access_type,
            order_id=order_id,
            expires_at=expires_at
        )
        db.add(access)
        db.commit()
        db.refresh(access)
        return access

    @staticmethod
    def grant_access_on_purchase(db: Session, user_id: str, order_id: str, product_id: str) -> Optional[BookGroupAccess]:
        """
        Grant book group access when a user purchases a book group product.
        Called from payment webhook.

        Args:
            db: Database session
            user_id: User ID who made the purchase
            order_id: Order ID
            product_id: Product ID that was purchased

        Returns:
            BookGroupAccess if product is a book group, None otherwise
        """
        # Check if product is a book group portal access
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product or product.type != ProductType.BOOK_GROUP_PORTAL_ACCESS:
            return None

        # Find the book group linked to this product
        book_group = db.query(BookGroup).filter(
            BookGroup.store_product_id == product_id
        ).first()

        if not book_group:
            return None

        # Grant access
        return BookGroupService.grant_access(
            db=db,
            user_id=user_id,
            book_group_id=str(book_group.id),
            access_type=BookGroupAccessType.PURCHASE,
            order_id=order_id
        )

    @staticmethod
    def auto_grant_on_upgrade(db: Session, user: User):
        """
        Automatically grant access to all non-purchase-required book groups
        when a user upgrades to Gyani+ or higher.

        Args:
            db: Database session
            user: User who was upgraded
        """
        # Only grant if user is Gyani or higher
        if user.membership_tier not in [
            MembershipTierEnum.GYANI,
            MembershipTierEnum.PRAGYANI,
            MembershipTierEnum.PRAGYANI_PLUS
        ]:
            return

        # Find all book groups that don't require purchase
        free_book_groups = db.query(BookGroup).filter(
            BookGroup.requires_purchase == False,
            BookGroup.is_published == True
        ).all()

        for book_group in free_book_groups:
            # Check if user already has access
            existing_access = db.query(BookGroupAccess).filter(
                BookGroupAccess.user_id == user.id,
                BookGroupAccess.book_group_id == book_group.id
            ).first()

            if not existing_access:
                # Grant membership access
                BookGroupService.grant_access(
                    db=db,
                    user_id=str(user.id),
                    book_group_id=str(book_group.id),
                    access_type=BookGroupAccessType.MEMBERSHIP
                )

        db.commit()

    @staticmethod
    def add_calendar_reminder(
        db: Session,
        user_id: str,
        book_group_id: str,
        custom_title: Optional[str] = None
    ) -> UserCalendar:
        """
        Add a book group to the user's calendar.

        Args:
            db: Database session
            user_id: User ID
            book_group_id: Book group ID
            custom_title: Optional custom title for the calendar entry

        Returns:
            UserCalendar record
        """
        # Check if already in calendar
        existing = db.query(UserCalendar).filter(
            UserCalendar.user_id == user_id,
            UserCalendar.book_group_id == book_group_id
        ).first()

        if existing:
            return existing

        # Add to calendar
        calendar_entry = UserCalendar(
            user_id=user_id,
            book_group_id=book_group_id,
            custom_title=custom_title
        )
        db.add(calendar_entry)
        db.commit()
        db.refresh(calendar_entry)
        return calendar_entry

    @staticmethod
    def convert_to_product(
        db: Session,
        book_group: BookGroup,
        product_title: Optional[str],
        product_description: Optional[str],
        price: float,
        regular_price: Optional[float] = None,
        member_discount: float = 10.0,
        categories: Optional[list] = None,
        tags: Optional[list] = None
    ) -> Product:
        """
        Convert a completed book group into a store product.

        Args:
            db: Database session
            book_group: BookGroup to convert
            product_title: Product title (uses book group title if None)
            product_description: Product description (uses book group description if None)
            price: Product price
            regular_price: Regular price (for sales)
            member_discount: Percentage discount for members
            categories: Product categories
            tags: Product tags

        Returns:
            Created Product
        """
        # Check if already has a product
        if book_group.store_product_id:
            existing_product = db.query(Product).filter(Product.id == book_group.store_product_id).first()
            if existing_product:
                return existing_product

        # Create product
        product = Product(
            slug=f"{book_group.slug}-access",
            title=product_title or book_group.title,
            short_description=book_group.short_description,
            description=product_description or book_group.description,
            type=ProductType.BOOK_GROUP_PORTAL_ACCESS,
            price=price,
            regular_price=regular_price,
            member_discount=member_discount,
            thumbnail_url=book_group.thumbnail,
            featured_image=book_group.hero_image,
            categories=categories or ["Book Groups"],
            tags=tags or [],
            is_available=True,
            in_stock=True,
            published=True
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        # Link book group to product
        book_group.store_product_id = product.id
        db.commit()

        return product

    @staticmethod
    def mark_completed(
        db: Session,
        book_group: BookGroup,
        replace_zoom_with_videos: bool = True
    ):
        """
        Mark a book group as completed.
        Optionally clear zoom links (since they should be replaced with videos).

        Args:
            db: Database session
            book_group: BookGroup to mark as completed
            replace_zoom_with_videos: If True, clears zoom links from sessions
        """
        book_group.status = BookGroupStatus.COMPLETED
        book_group.is_featured = False  # No longer featured

        if replace_zoom_with_videos:
            # Clear zoom links from all sessions
            for session in book_group.sessions:
                session.zoom_link = None
                session.zoom_enabled = False
                session.zoom_meeting_id = None
                session.zoom_password = None

        db.commit()
