"""
Media Service - Resolves original image paths to Cloudflare CDN URLs
"""
from sqlalchemy.orm import Session
from app.models.static_content import MediaAsset
from typing import Dict, Any, Optional, List


class MediaService:
    """Service for resolving media URLs from database"""

    def __init__(self, db: Session):
        self.db = db
        self._cache: Dict[str, str] = {}

    def resolve_url(self, original_path: Optional[str]) -> str:
        """Convert /public path to CDN URL (case-insensitive)"""

        if not original_path:
            return ""

        # Check cache first
        if original_path in self._cache:
            return self._cache[original_path]

        # Query database (case-insensitive)
        from sqlalchemy import func
        asset = self.db.query(MediaAsset).filter(
            func.lower(MediaAsset.original_path) == original_path.lower(),
            MediaAsset.is_active == True
        ).first()

        if asset:
            cdn_url = asset.cdn_url

            # If CDN URL is a relative path (starts with /media/), prepend backend URL
            if cdn_url.startswith('/media/'):
                from app.core.config import settings
                # Use FRONTEND_URL as base since media is served from same backend
                cdn_url = f"{settings.FRONTEND_URL.replace('3000', '8000')}{cdn_url}"

            self._cache[original_path] = cdn_url
            return cdn_url

        # Fallback to original path for development
        print(f"⚠️  No CDN URL found for: {original_path}")
        return original_path

    def resolve_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively replace image paths with CDN URLs in a dictionary"""

        if not isinstance(data, dict):
            return data

        result = {}
        for key, value in data.items():
            # Check if value is an image path string
            if isinstance(value, str) and self._is_image_path(value):
                result[key] = self.resolve_url(value)
            # Recursively process nested dicts
            elif isinstance(value, dict):
                result[key] = self.resolve_dict(value)
            # Recursively process lists
            elif isinstance(value, list):
                result[key] = self.resolve_list(value)
            else:
                result[key] = value

        return result

    def resolve_list(self, data: List[Any]) -> List[Any]:
        """Recursively replace image paths with CDN URLs in a list"""

        result = []
        for item in data:
            if isinstance(item, str) and self._is_image_path(item):
                result.append(self.resolve_url(item))
            elif isinstance(item, dict):
                result.append(self.resolve_dict(item))
            elif isinstance(item, list):
                result.append(self.resolve_list(item))
            else:
                result.append(item)

        return result

    @staticmethod
    def _is_image_path(value: str) -> bool:
        """Check if string looks like an image/video path"""
        if not value or not value.startswith('/'):
            return False

        # Check for common media extensions
        media_extensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
            '.mp4', '.webm', '.mov', '.pdf'
        ]

        return any(value.lower().endswith(ext) for ext in media_extensions)

    def preload_cache(self, paths: List[str]):
        """Preload multiple paths into cache for performance"""

        if not paths:
            return

        assets = self.db.query(MediaAsset).filter(
            MediaAsset.original_path.in_(paths),
            MediaAsset.is_active == True
        ).all()

        for asset in assets:
            self._cache[asset.original_path] = asset.cdn_url
