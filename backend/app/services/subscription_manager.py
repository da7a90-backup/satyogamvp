"""
Subscription Manager Service

Handles trial expiration processing, subscription renewals, and automated charging.
Designed to be called by cron jobs or scheduled tasks.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..core.database import SessionLocal
from ..models.user import User, MembershipTierEnum
from ..models.membership import Subscription, SubscriptionStatus
from ..models.payment import Payment, PaymentStatus, PaymentType
from .tilopay import tilopay_service

logger = logging.getLogger(__name__)


class SubscriptionManagerService:
    """Service for managing subscription trials, renewals, and automated billing."""

    def __init__(self):
        self.tilopay = tilopay_service

    def get_expiring_trials(self, db: Session) -> List[Subscription]:
        """
        Get all subscriptions with trials expiring today or earlier.

        Returns:
            List of Subscription objects with status=TRIAL and trial_end_date <= today
        """
        today = datetime.utcnow().date()

        expiring_trials = (
            db.query(Subscription)
            .filter(
                and_(
                    Subscription.status == SubscriptionStatus.TRIAL,
                    Subscription.trial_end_date <= today,
                    Subscription.auto_renew == True,  # Only process auto-renewing subscriptions
                )
            )
            .all()
        )

        logger.info(f"Found {len(expiring_trials)} trials expiring on or before {today}")
        return expiring_trials

    async def charge_trial_subscription(
        self,
        subscription: Subscription,
        db: Session
    ) -> Dict[str, Any]:
        """
        Charge the user for their trial subscription after trial period ends.

        For Gyani: $15/month
        For Pragyani: $47/month
        For Pragyani+: $97/month

        Args:
            subscription: The Subscription object with trial ending
            db: Database session

        Returns:
            Dict with success status and details
        """
        user = db.query(User).filter(User.id == subscription.user_id).first()

        if not user:
            logger.error(f"User not found for subscription {subscription.id}")
            return {"success": False, "error": "User not found"}

        # Get pricing based on tier
        pricing = {
            "gyani": 15.00,
            "pragyani": 47.00,
            "pragyani_plus": 97.00,
        }

        amount = pricing.get(subscription.tier)
        if not amount:
            logger.error(f"Invalid tier {subscription.tier} for subscription {subscription.id}")
            return {"success": False, "error": f"Invalid tier: {subscription.tier}"}

        logger.info(f"Charging ${amount} for {subscription.tier} subscription {subscription.id} (user {user.id})")

        try:
            # Create a payment record for the first charge after trial
            payment = Payment(
                user_id=user.id,
                amount=amount,
                currency="USD",
                status=PaymentStatus.PENDING,
                payment_type=PaymentType.MEMBERSHIP,
                reference_id=f"{subscription.tier}:{subscription.frequency}",
                payment_metadata={
                    "tier": subscription.tier,
                    "frequency": subscription.frequency,
                    "is_subscription": True,
                    "is_trial_charge": True,  # Mark this as the first charge after trial
                    "subscription_id": str(subscription.id),
                },
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)

            # Check if we have a stored Tilopay subscription ID
            if subscription.tilopay_subscription_id:
                # Use Tilopay's recurring billing API to charge the card on file
                # NOTE: This requires Tilopay API documentation for charging stored cards
                # For now, we'll mark this as a TODO and handle it when we have the API details
                logger.warning(f"Tilopay subscription ID exists ({subscription.tilopay_subscription_id}) but charging stored cards not yet implemented")

                # TODO: Implement Tilopay recurring charge
                # charge_response = await self.tilopay.charge_subscription(
                #     subscription_id=subscription.tilopay_subscription_id,
                #     amount=amount,
                #     order_id=str(payment.id)
                # )

                # For now, mark payment as failed and notify user
                payment.status = PaymentStatus.FAILED
                payment.failure_reason = "Automatic charging not yet implemented - manual payment required"
                db.commit()

                return {
                    "success": False,
                    "error": "Automatic charging not implemented",
                    "payment_id": str(payment.id),
                    "subscription_id": str(subscription.id),
                    "requires_manual_action": True,
                }
            else:
                # No stored payment method - user needs to manually pay
                logger.warning(f"No Tilopay subscription ID for subscription {subscription.id} - requires manual payment")

                payment.status = PaymentStatus.FAILED
                payment.failure_reason = "No payment method on file - manual payment required"
                db.commit()

                return {
                    "success": False,
                    "error": "No payment method on file",
                    "payment_id": str(payment.id),
                    "subscription_id": str(subscription.id),
                    "requires_manual_action": True,
                }

        except Exception as e:
            logger.error(f"Error charging trial subscription {subscription.id}: {e}", exc_info=True)
            db.rollback()
            return {
                "success": False,
                "error": str(e),
                "subscription_id": str(subscription.id),
            }

    async def handle_failed_trial_charge(
        self,
        subscription: Subscription,
        payment: Payment,
        db: Session
    ) -> Dict[str, Any]:
        """
        Handle failed trial charge - downgrade user and send notification.

        Args:
            subscription: The Subscription object
            payment: The failed Payment object
            db: Database session

        Returns:
            Dict with success status
        """
        user = db.query(User).filter(User.id == subscription.user_id).first()

        if not user:
            logger.error(f"User not found for subscription {subscription.id}")
            return {"success": False, "error": "User not found"}

        try:
            # Update subscription status to EXPIRED
            subscription.status = SubscriptionStatus.EXPIRED
            subscription.end_date = datetime.utcnow()

            # Downgrade user to FREE tier
            user.membership_tier = MembershipTierEnum.FREE
            user.membership_end_date = datetime.utcnow()

            db.commit()

            logger.info(f"Downgraded user {user.id} to FREE tier after failed trial charge")

            # Send notification email (will be implemented separately)
            # TODO: Implement trial_charge_failed email template
            # await sendgrid_service.send_trial_charge_failed_email(
            #     user_email=user.email,
            #     user_name=user.name,
            #     tier=subscription.tier,
            #     amount=payment.amount,
            #     payment_link=f"{FRONTEND_URL}/dashboard/user/settings/billing"
            # )

            return {
                "success": True,
                "user_id": str(user.id),
                "downgraded_to": "FREE",
                "subscription_id": str(subscription.id),
            }

        except Exception as e:
            logger.error(f"Error handling failed trial charge: {e}", exc_info=True)
            db.rollback()
            return {"success": False, "error": str(e)}

    async def update_subscription_after_charge(
        self,
        subscription: Subscription,
        payment: Payment,
        db: Session
    ) -> Dict[str, Any]:
        """
        Update subscription status after successful charge.

        Args:
            subscription: The Subscription object
            payment: The successful Payment object
            db: Database session

        Returns:
            Dict with success status
        """
        try:
            # Update subscription to ACTIVE
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.trial_end_date = None  # Clear trial end date

            # Set new end date based on frequency
            if subscription.frequency == "monthly":
                subscription.end_date = datetime.utcnow() + timedelta(days=30)
            else:  # annual
                subscription.end_date = datetime.utcnow() + timedelta(days=365)

            # Update user membership end date
            user = db.query(User).filter(User.id == subscription.user_id).first()
            if user:
                user.membership_end_date = subscription.end_date

            db.commit()

            logger.info(f"Subscription {subscription.id} activated - next renewal: {subscription.end_date}")

            return {
                "success": True,
                "subscription_id": str(subscription.id),
                "status": "ACTIVE",
                "end_date": subscription.end_date.isoformat(),
            }

        except Exception as e:
            logger.error(f"Error updating subscription: {e}", exc_info=True)
            db.rollback()
            return {"success": False, "error": str(e)}

    async def process_all_expiring_trials(self) -> Dict[str, Any]:
        """
        Main function to process all expiring trials.
        Called by cron job daily.

        Returns:
            Summary of processed trials
        """
        db = SessionLocal()
        results = {
            "processed": 0,
            "succeeded": 0,
            "failed": 0,
            "requires_manual_action": 0,
            "errors": [],
        }

        try:
            expiring_trials = self.get_expiring_trials(db)
            results["processed"] = len(expiring_trials)

            for subscription in expiring_trials:
                logger.info(f"Processing trial subscription {subscription.id} for user {subscription.user_id}")

                charge_result = await self.charge_trial_subscription(subscription, db)

                if charge_result.get("success"):
                    results["succeeded"] += 1
                    logger.info(f"✓ Successfully charged subscription {subscription.id}")
                elif charge_result.get("requires_manual_action"):
                    results["requires_manual_action"] += 1
                    logger.warning(f"⚠️ Subscription {subscription.id} requires manual payment")

                    # Send notification to user about required payment
                    # TODO: Implement email notification
                else:
                    results["failed"] += 1
                    results["errors"].append({
                        "subscription_id": str(subscription.id),
                        "error": charge_result.get("error"),
                    })
                    logger.error(f"✗ Failed to charge subscription {subscription.id}: {charge_result.get('error')}")

                    # Handle failed charge (downgrade user)
                    if "payment_id" in charge_result:
                        payment = db.query(Payment).filter(Payment.id == charge_result["payment_id"]).first()
                        if payment:
                            await self.handle_failed_trial_charge(subscription, payment, db)

            logger.info(f"Trial processing complete: {results}")
            return results

        except Exception as e:
            logger.error(f"Error processing expiring trials: {e}", exc_info=True)
            results["errors"].append({"general_error": str(e)})
            return results
        finally:
            db.close()


# Singleton instance
subscription_manager = SubscriptionManagerService()
