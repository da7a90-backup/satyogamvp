"""
Vercel serverless function entry point for FastAPI.

This file is required for Vercel to properly route requests to the FastAPI application.
"""

from app.main import app

# Vercel will use this app instance
__all__ = ["app"]
