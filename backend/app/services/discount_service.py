"""
Discount Service

Centralized service for calculating member discounts across all purchase types.
Handles tier-based discounts for retreats, courses, products, and applications.
"""

from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session

from ..models.user import User, MembershipTierEnum
from ..models.retreat import Retreat
from ..models.course import Course
from ..models.product import Product


class DiscountService:
    """Service for calculating membership discounts."""

    @staticmethod
    def calculate_discounted_price(
        original_price: Decimal,
        discount_percentage: int
    ) -> Decimal:
        """
        Calculate the discounted price given an original price and discount percentage.

        Args:
            original_price: The original price before discount
            discount_percentage: The discount percentage (e.g., 10 for 10%)

        Returns:
            The discounted price as a Decimal
        """
        if discount_percentage <= 0:
            return original_price

        discount_multiplier = Decimal(1) - (Decimal(discount_percentage) / Decimal(100))
        return original_price * discount_multiplier

    @staticmethod
    def get_retreat_discount(
        user: User,
        retreat: Retreat,
        db: Session
    ) -> dict:
        """
        Get discount information for a retreat purchase.

        Args:
            user: The user making the purchase
            retreat: The retreat being purchased
            db: Database session

        Returns:
            Dict with 'discount_percentage', 'original_price', 'discounted_price'
        """
        # Check if user has a paid membership tier
        if user.membership_tier == MembershipTierEnum.FREE:
            return {
                "discount_percentage": 0,
                "original_price": retreat.price,
                "discounted_price": retreat.price,
                "eligible": False
            }

        # Get discount percentage from retreat or use default
        discount_pct = retreat.member_discount_percentage if retreat.member_discount_percentage else 0

        if discount_pct <= 0:
            return {
                "discount_percentage": 0,
                "original_price": retreat.price,
                "discounted_price": retreat.price,
                "eligible": True,
                "note": "No discount configured for this retreat"
            }

        discounted_price = DiscountService.calculate_discounted_price(
            retreat.price,
            discount_pct
        )

        return {
            "discount_percentage": discount_pct,
            "original_price": retreat.price,
            "discounted_price": discounted_price,
            "eligible": True,
            "savings": retreat.price - discounted_price
        }

    @staticmethod
    def get_course_discount(
        user: User,
        course: Course,
        db: Session
    ) -> dict:
        """
        Get discount information for a course purchase.

        Args:
            user: The user making the purchase
            course: The course being purchased
            db: Database session

        Returns:
            Dict with 'discount_percentage', 'original_price', 'discounted_price'
        """
        # Check if user has a paid membership tier
        if user.membership_tier == MembershipTierEnum.FREE:
            return {
                "discount_percentage": 0,
                "original_price": course.price,
                "discounted_price": course.price,
                "eligible": False
            }

        # Default course discount by tier
        tier_discounts = {
            MembershipTierEnum.GYANI: 10,  # 10% off
            MembershipTierEnum.PRAGYANI: 15,  # 15% off
            MembershipTierEnum.PRAGYANI_PLUS: 20,  # 20% off
        }

        discount_pct = tier_discounts.get(user.membership_tier, 0)

        if discount_pct <= 0:
            return {
                "discount_percentage": 0,
                "original_price": course.price,
                "discounted_price": course.price,
                "eligible": True,
                "note": "No discount for this tier"
            }

        discounted_price = DiscountService.calculate_discounted_price(
            course.price,
            discount_pct
        )

        return {
            "discount_percentage": discount_pct,
            "original_price": course.price,
            "discounted_price": discounted_price,
            "eligible": True,
            "savings": course.price - discounted_price
        }

    @staticmethod
    def get_product_discount(
        user: User,
        product: Product,
        db: Session
    ) -> dict:
        """
        Get discount information for a product purchase.

        Args:
            user: The user making the purchase
            product: The product being purchased
            db: Database session

        Returns:
            Dict with 'discount_percentage', 'original_price', 'discounted_price'
        """
        # Check if user has a paid membership tier
        if user.membership_tier == MembershipTierEnum.FREE:
            return {
                "discount_percentage": 0,
                "original_price": product.price,
                "discounted_price": product.price,
                "eligible": False
            }

        # Default product discount by tier (store products)
        tier_discounts = {
            MembershipTierEnum.GYANI: 10,  # 10% off
            MembershipTierEnum.PRAGYANI: 15,  # 15% off
            MembershipTierEnum.PRAGYANI_PLUS: 20,  # 20% off
        }

        discount_pct = tier_discounts.get(user.membership_tier, 0)

        if discount_pct <= 0:
            return {
                "discount_percentage": 0,
                "original_price": product.price,
                "discounted_price": product.price,
                "eligible": True,
                "note": "No discount for this tier"
            }

        discounted_price = DiscountService.calculate_discounted_price(
            product.price,
            discount_pct
        )

        return {
            "discount_percentage": discount_pct,
            "original_price": product.price,
            "discounted_price": discounted_price,
            "eligible": True,
            "savings": product.price - discounted_price
        }

    @staticmethod
    def get_application_discount(
        user: User,
        retreat: Retreat,
        base_price: Decimal,
        db: Session
    ) -> dict:
        """
        Get discount information for a retreat application payment.

        Args:
            user: The user submitting the application
            retreat: The retreat being applied to
            base_price: The base application price
            db: Database session

        Returns:
            Dict with 'discount_percentage', 'original_price', 'discounted_price'
        """
        # Check if user has a paid membership tier
        if user.membership_tier == MembershipTierEnum.FREE:
            return {
                "discount_percentage": 0,
                "original_price": base_price,
                "discounted_price": base_price,
                "eligible": False
            }

        # Get discount percentage from retreat or use default 10%
        discount_pct = retreat.member_discount_percentage if retreat.member_discount_percentage else 10

        discounted_price = DiscountService.calculate_discounted_price(
            base_price,
            discount_pct
        )

        return {
            "discount_percentage": discount_pct,
            "original_price": base_price,
            "discounted_price": discounted_price,
            "eligible": True,
            "savings": base_price - discounted_price
        }
