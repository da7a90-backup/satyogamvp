"""
Vercel serverless function entry point for FastAPI.

This file is required for Vercel to properly route requests to the FastAPI application.
"""

from app.main import app

# Vercel's Python runtime can handle ASGI apps directly
# Export the FastAPI app instance
app = app
