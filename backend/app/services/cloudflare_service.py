"""
Cloudflare Service - Generate URLs for Cloudflare Stream and Images
"""
from typing import Optional
from ..core.config import settings


class CloudflareService:
    """Service for generating Cloudflare Stream and Images URLs"""

    @staticmethod
    def get_stream_video_url(stream_uid: str, format: str = "mp4") -> str:
        """
        Generate Cloudflare Stream video URL

        Args:
            stream_uid: Cloudflare Stream UID
            format: Video format (mp4, dash, hls)

        Returns:
            Full video URL
        """
        if not stream_uid:
            return ""

        # Cloudflare Stream URL format:
        # https://customer-<code>.cloudflarestream.com/<stream_uid>/manifest/video.<format>
        cloudflare_account_id = getattr(settings, 'CLOUDFLARE_ACCOUNT_ID', '')

        if not cloudflare_account_id:
            # Fallback to direct stream URL (will work if properly configured)
            return f"https://stream.cloudflare.com/{stream_uid}/video.{format}"

        return f"https://customer-{cloudflare_account_id}.cloudflarestream.com/{stream_uid}/manifest/video.{format}"

    @staticmethod
    def get_stream_thumbnail_url(stream_uid: str, time: Optional[str] = None) -> str:
        """
        Generate Cloudflare Stream thumbnail URL

        Args:
            stream_uid: Cloudflare Stream UID
            time: Timestamp for thumbnail (e.g., "10s", "30s", "1m")

        Returns:
            Thumbnail URL
        """
        if not stream_uid:
            return ""

        base_url = f"https://stream.cloudflare.com/{stream_uid}/thumbnails/thumbnail.jpg"

        if time:
            return f"{base_url}?time={time}"

        return base_url

    @staticmethod
    def get_stream_embed_url(stream_uid: str) -> str:
        """
        Generate Cloudflare Stream embed iframe URL

        Args:
            stream_uid: Cloudflare Stream UID

        Returns:
            Embed URL for iframe
        """
        if not stream_uid:
            return ""

        return f"https://stream.cloudflare.com/{stream_uid}/iframe"

    @staticmethod
    def get_image_url(
        image_id: str,
        variant: str = "public",
        width: Optional[int] = None,
        height: Optional[int] = None,
        fit: str = "scale-down"
    ) -> str:
        """
        Generate Cloudflare Images URL with transformations

        Args:
            image_id: Cloudflare Images ID
            variant: Image variant name (default: "public")
            width: Desired width in pixels
            height: Desired height in pixels
            fit: Fit mode (scale-down, contain, cover, crop, pad)

        Returns:
            Full image URL with transformations
        """
        if not image_id:
            return ""

        cloudflare_account_hash = getattr(settings, 'CLOUDFLARE_ACCOUNT_HASH', '')

        if not cloudflare_account_hash:
            # Fallback - return image ID only
            return image_id

        # Base URL format: https://imagedelivery.net/<account_hash>/<image_id>/<variant>
        base_url = f"https://imagedelivery.net/{cloudflare_account_hash}/{image_id}/{variant}"

        # Add transformations if specified
        if width or height:
            params = []
            if width:
                params.append(f"width={width}")
            if height:
                params.append(f"height={height}")
            params.append(f"fit={fit}")

            return f"{base_url}?{'&'.join(params)}"

        return base_url

    @staticmethod
    def get_responsive_image_srcset(image_id: str, variant: str = "public") -> str:
        """
        Generate responsive image srcset for different screen sizes

        Args:
            image_id: Cloudflare Images ID
            variant: Image variant name

        Returns:
            Complete srcset string for <img> tag
        """
        if not image_id:
            return ""

        sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
        srcset_parts = []

        for width in sizes:
            url = CloudflareService.get_image_url(image_id, variant, width=width)
            srcset_parts.append(f"{url} {width}w")

        return ", ".join(srcset_parts)


# Singleton instance
cloudflare_service = CloudflareService()
