"""
Cron Job Endpoints

Protected endpoints for scheduled tasks (trial processing, subscription renewals, etc.)
Should be called by external cron service or internal scheduler.
"""

import logging
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.config import settings
from ..services.subscription_manager import subscription_manager

router = APIRouter()
logger = logging.getLogger(__name__)

# Secret key for cron job authentication (set in environment)
CRON_SECRET_KEY = settings.CRON_SECRET_KEY if hasattr(settings, 'CRON_SECRET_KEY') else "default-cron-secret-change-me"


def verify_cron_secret(x_cron_secret: str = Header(None)):
    """
    Verify cron job authentication using secret header.

    Usage: Add header `X-Cron-Secret: your-secret-key` to requests
    """
    if not x_cron_secret or x_cron_secret != CRON_SECRET_KEY:
        logger.warning(f"Unauthorized cron job attempt with key: {x_cron_secret}")
        raise HTTPException(
            status_code=401,
            detail="Unauthorized - invalid cron secret key"
        )
    return True


@router.get("/health")
async def cron_health_check():
    """Health check endpoint for cron service (no auth required)."""
    return {
        "status": "healthy",
        "service": "cron-jobs",
        "endpoints": {
            "process-trials": "/api/cron/process-trials",
            "health": "/api/cron/health",
        }
    }


@router.post("/process-trials")
async def process_expiring_trials(
    authenticated: bool = Depends(verify_cron_secret)
):
    """
    Process all subscriptions with expiring trials.

    This endpoint should be called daily by a cron job.
    It will:
    1. Find all subscriptions with trial_end_date <= today
    2. Attempt to charge the user for their subscription
    3. If successful, activate subscription
    4. If failed, downgrade user to FREE tier and send notification

    Authentication: Requires X-Cron-Secret header with valid secret key

    Example cron setup (daily at 2am UTC):
    ```bash
    0 2 * * * curl -X POST \\
      -H "X-Cron-Secret: your-secret-key" \\
      https://api.satyoga.com/api/cron/process-trials
    ```

    Or use a service like GitHub Actions, Vercel Cron, or Render Cron Jobs.
    """
    logger.info("Starting trial expiration processing (triggered by cron)")

    try:
        results = await subscription_manager.process_all_expiring_trials()

        logger.info(f"Trial processing completed: {results}")

        return {
            "success": True,
            "message": "Trial processing completed",
            "results": results,
            "processed": results.get("processed", 0),
            "succeeded": results.get("succeeded", 0),
            "failed": results.get("failed", 0),
            "requires_manual_action": results.get("requires_manual_action", 0),
            "errors": results.get("errors", []),
        }

    except Exception as e:
        logger.error(f"Error in cron trial processing: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing trials: {str(e)}"
        )


@router.post("/test-trial-processing")
async def test_trial_processing(
    authenticated: bool = Depends(verify_cron_secret)
):
    """
    Test endpoint for trial processing (same as process-trials but with detailed logging).

    Use this for testing the trial expiration flow without waiting for actual trials to expire.
    """
    logger.info("TEST: Trial expiration processing triggered")

    try:
        results = await subscription_manager.process_all_expiring_trials()

        return {
            "success": True,
            "message": "TEST: Trial processing completed",
            "results": results,
            "note": "This is a test endpoint - same functionality as /process-trials"
        }

    except Exception as e:
        logger.error(f"TEST: Error in trial processing: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error in test trial processing: {str(e)}"
        )


# TODO: Add more cron endpoints as needed
# - /process-subscription-renewals - Check for expiring monthly/annual subscriptions
# - /send-trial-reminder-emails - Send emails 3 days before trial ends
# - /cleanup-expired-tokens - Remove expired email verification tokens
# - /process-abandoned-carts - Send reminder emails for abandoned carts
