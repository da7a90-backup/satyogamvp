"""Email Automation Worker - Processes Mixpanel events and triggers automated emails."""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import asyncio

from ..core.database import SessionLocal
from ..models.analytics import AnalyticsEvent
from ..models.email import EmailAutomation, EmailTemplate, EmailSent, TriggerType, NewsletterSubscriber
from ..models.user import User
from ..services.sendgrid_service import sendgrid_service


class AutomationWorker:
    """Worker that processes analytics events and triggers automated emails."""

    def __init__(self):
        self.processed_events: set = set()  # Track processed event IDs

    async def process_automations(self, db: Session) -> Dict[str, int]:
        """
        Main worker function - processes all active automations.

        Returns:
            Dict with stats: {emails_triggered: int, events_processed: int}
        """
        stats = {"emails_triggered": 0, "events_processed": 0}

        # Get all active Mixpanel event automations
        automations = (
            db.query(EmailAutomation)
            .filter(
                EmailAutomation.is_active == True,
                EmailAutomation.trigger_type == TriggerType.MIXPANEL_EVENT,
            )
            .all()
        )

        if not automations:
            return stats

        # Process each automation
        for automation in automations:
            triggered = await self._process_automation(db, automation)
            stats["emails_triggered"] += triggered

        return stats

    async def _process_automation(self, db: Session, automation: EmailAutomation) -> int:
        """
        Process a single automation - find matching events and trigger emails.

        Returns:
            Number of emails triggered
        """
        emails_triggered = 0

        # Get trigger configuration
        trigger_event_name = automation.trigger_config.get("event_name")
        trigger_properties = automation.trigger_config.get("properties", {})

        if not trigger_event_name:
            return 0

        # Find recent events that match this trigger (last hour)
        cutoff_time = datetime.utcnow() - timedelta(hours=1)

        # Get matching events
        query = db.query(AnalyticsEvent).filter(
            AnalyticsEvent.event_name == trigger_event_name,
            AnalyticsEvent.created_at >= cutoff_time,
        )

        # Apply property filters if specified
        if trigger_properties:
            for key, value in trigger_properties.items():
                query = query.filter(
                    AnalyticsEvent.event_properties[key].astext == str(value)
                )

        events = query.all()

        for event in events:
            # Skip if already processed this event for this automation
            event_key = f"{automation.id}:{event.id}"
            if event_key in self.processed_events:
                continue

            # Skip if user doesn't exist (anonymous event)
            if not event.user_id:
                self.processed_events.add(event_key)
                continue

            # Check if email was already sent to this user for this automation
            existing_email = (
                db.query(EmailSent)
                .filter(
                    EmailSent.automation_id == automation.id,
                    EmailSent.template_id == automation.template_id,
                )
                .join(NewsletterSubscriber)
                .filter(NewsletterSubscriber.user_id == event.user_id)
                .first()
            )

            if existing_email:
                # Don't send duplicate automated emails to same user
                self.processed_events.add(event_key)
                continue

            # Get user
            user = db.query(User).filter(User.id == event.user_id).first()
            if not user:
                self.processed_events.add(event_key)
                continue

            # Get template
            template = (
                db.query(EmailTemplate)
                .filter(EmailTemplate.id == automation.template_id)
                .first()
            )

            if not template:
                self.processed_events.add(event_key)
                continue

            # Apply delay if specified
            if automation.delay_minutes > 0:
                # In production, use a task queue like Celery/RQ
                # For now, we'll apply the delay here
                await asyncio.sleep(automation.delay_minutes * 60)

            # Prepare template variables from user data and event properties
            variables = {
                "name": user.name or "Friend",
                "email": user.email,
                "membership_tier": user.membership_tier.value if user.membership_tier else "FREE",
                **event.event_properties,  # Include event properties
            }

            # Send email
            success = await sendgrid_service.send_email(
                to_email=user.email,
                subject=template.subject,
                html_content=template.html_content,
                to_name=user.name,
                variables=variables,
            )

            if success:
                # Get or create newsletter subscriber for tracking
                subscriber = (
                    db.query(NewsletterSubscriber)
                    .filter(NewsletterSubscriber.email == user.email)
                    .first()
                )

                if not subscriber:
                    from ..models.email import SubscriberStatus
                    subscriber = NewsletterSubscriber(
                        email=user.email,
                        name=user.name,
                        user_id=user.id,
                        status=SubscriberStatus.ACTIVE,
                    )
                    db.add(subscriber)
                    db.flush()

                # Record sent email
                email_sent = EmailSent(
                    automation_id=automation.id,
                    subscriber_id=subscriber.id,
                    template_id=template.id,
                    status="sent",
                )
                db.add(email_sent)
                db.commit()

                emails_triggered += 1

            # Mark as processed
            self.processed_events.add(event_key)

        return emails_triggered

    async def run_forever(self, interval_seconds: int = 60):
        """
        Run the worker in a continuous loop.

        Args:
            interval_seconds: How often to check for new events (default: 60 seconds)
        """
        print(f"🚀 Email Automation Worker started (checking every {interval_seconds}s)")

        while True:
            try:
                db = SessionLocal()
                stats = await self.process_automations(db)

                if stats["emails_triggered"] > 0:
                    print(
                        f"✉️  Triggered {stats['emails_triggered']} automated emails"
                    )

                db.close()

            except Exception as e:
                print(f"❌ Error in automation worker: {e}")

            await asyncio.sleep(interval_seconds)


# Singleton instance
automation_worker = AutomationWorker()


# CLI function to run the worker
async def run_automation_worker():
    """Run the automation worker (use this in a separate process)."""
    await automation_worker.run_forever(interval_seconds=60)


if __name__ == "__main__":
    # Run the worker
    asyncio.run(run_automation_worker())
