"""
Script to run the email automation worker.

Usage:
    python scripts/run_automation_worker.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.automation_worker import run_automation_worker

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Email Automation Worker")
    print("=" * 60)
    print("\nThis worker will:")
    print("  • Monitor analytics events every 60 seconds")
    print("  • Match events to active automation triggers")
    print("  • Send automated emails with delays")
    print("  • Track sent emails to prevent duplicates")
    print("\nPress Ctrl+C to stop")
    print("=" * 60)
    print()

    try:
        asyncio.run(run_automation_worker())
    except KeyboardInterrupt:
        print("\n\n👋 Automation worker stopped")
