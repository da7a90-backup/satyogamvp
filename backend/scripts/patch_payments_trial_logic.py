"""
Script to patch payments.py with trial subscription logic.

This script updates the grant_access_after_payment function to properly handle
trial subscriptions with the new TRIAL status and trial_end_date field.
"""

import sys
from pathlib import Path

# Get the payments.py file path
payments_file = Path(__file__).parent.parent / "app" / "routers" / "payments.py"

print(f"Patching file: {payments_file}")

# Read the file
with open(payments_file, 'r') as f:
    content = f.read()

# Define the old code block to replace
old_code = """            # Calculate subscription dates
            from datetime import datetime, timedelta
            start_date = datetime.utcnow()

            # For trial, subscription starts after trial period
            if trial_days > 0:
                # Trial period: membership starts now but first charge is after trial
                end_date = start_date + timedelta(days=trial_days)
                logger.info(f"[GRANT_ACCESS] Trial period: {trial_days} days, first charge on {end_date}")
            elif frequency == "monthly":
                end_date = start_date + timedelta(days=30)
            else:  # annual
                end_date = start_date + timedelta(days=365)

            # Update user membership
            user.membership_tier = membership_tier_enum
            user.membership_start_date = start_date
            user.membership_end_date = end_date

            # Create or update subscription record
            subscription = (
                db.query(Subscription)
                .filter(Subscription.user_id == user_uuid)
                .order_by(Subscription.created_at.desc())
                .first()
            )

            if subscription and subscription.status == SubscriptionStatus.ACTIVE:
                # Update existing subscription
                logger.info(f"[GRANT_ACCESS] Updating existing subscription: {subscription.id}")
                subscription.tier = tier
                subscription.status = SubscriptionStatus.ACTIVE
                subscription.start_date = start_date
                subscription.end_date = end_date
                subscription.payment_id = payment.id
                subscription.auto_renew = (frequency == "monthly")  # Only monthly auto-renews
            else:
                # Create new subscription
                logger.info(f"[GRANT_ACCESS] Creating new subscription")
                subscription = Subscription(
                    user_id=user_uuid,
                    tier=tier,
                    status=SubscriptionStatus.ACTIVE,
                    start_date=start_date,
                    end_date=end_date,
                    payment_id=payment.id,
                    auto_renew=(frequency == "monthly"),
                )
                db.add(subscription)"""

# Define the new code block
new_code = """            # Calculate subscription dates
            from datetime import datetime, timedelta
            start_date = datetime.utcnow()

            # Determine subscription status and dates based on trial
            if trial_days > 0:
                # Trial subscription: user gets access immediately, but first charge is after trial
                subscription_status = SubscriptionStatus.TRIAL
                trial_end_date = start_date + timedelta(days=trial_days)
                # Set end_date to None for trial - will be set after first charge
                end_date = None
                logger.info(f"[GRANT_ACCESS] Trial period: {trial_days} days, trial ends on {trial_end_date}")
            else:
                # Regular subscription: charged immediately
                subscription_status = SubscriptionStatus.ACTIVE
                trial_end_date = None
                if frequency == "monthly":
                    end_date = start_date + timedelta(days=30)
                else:  # annual
                    end_date = start_date + timedelta(days=365)

            # Update user membership - grant access immediately (even during trial)
            user.membership_tier = membership_tier_enum
            user.membership_start_date = start_date
            user.membership_end_date = end_date if end_date else trial_end_date  # Use trial_end_date if no end_date

            # Create or update subscription record
            subscription = (
                db.query(Subscription)
                .filter(Subscription.user_id == user_uuid)
                .order_by(Subscription.created_at.desc())
                .first()
            )

            if subscription and subscription.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]:
                # Update existing subscription
                logger.info(f"[GRANT_ACCESS] Updating existing subscription: {subscription.id}")
                subscription.tier = tier
                subscription.frequency = frequency
                subscription.status = subscription_status
                subscription.start_date = start_date
                subscription.end_date = end_date
                subscription.trial_end_date = trial_end_date
                subscription.payment_id = payment.id
                subscription.auto_renew = (frequency == "monthly")  # Only monthly auto-renews
            else:
                # Create new subscription
                logger.info(f"[GRANT_ACCESS] Creating new subscription with status={subscription_status}")
                subscription = Subscription(
                    user_id=user_uuid,
                    tier=tier,
                    frequency=frequency,
                    status=subscription_status,
                    start_date=start_date,
                    end_date=end_date,
                    trial_end_date=trial_end_date,
                    payment_id=payment.id,
                    auto_renew=(frequency == "monthly"),
                )
                db.add(subscription)"""

# Check if old code exists
if old_code not in content:
    print("ERROR: Could not find the old code block in payments.py")
    print("The file may have already been patched or has a different structure.")
    sys.exit(1)

# Replace the code
new_content = content.replace(old_code, new_code)

# Write back to file
with open(payments_file, 'w') as f:
    f.write(new_content)

print("✓ Successfully patched payments.py with trial subscription logic!")
print("\nChanges made:")
print("  - Added subscription_status variable (TRIAL or ACTIVE)")
print("  - Added trial_end_date field to subscriptions")
print("  - Added frequency field to subscriptions")
print("  - Updated user.membership_end_date to use trial_end_date for trials")
print("  - Modified subscription creation/update logic to handle TRIAL status")
print("\nNext steps:")
print("  1. Run database migration: backend/migrations/022_add_subscription_trial_fields.sql")
print("  2. Test the membership payment flow")
print("  3. Test the cron job: POST /api/cron/process-trials")
