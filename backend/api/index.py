"""
Vercel serverless function entry point for FastAPI.

This file is required for Vercel to properly route requests to the FastAPI application.
Mangum wraps the FastAPI ASGI app for AWS Lambda/Vercel serverless environment.
"""

from mangum import Mangum
from app.main import app

# Wrap FastAPI app with Mangum for serverless
handler = Mangum(app, lifespan="off")

# Vercel expects either 'handler' or 'app'
__all__ = ["handler", "app"]
