"""
Cloudflare Service - Generate URLs for Cloudflare Stream and Images, and upload files
"""
from typing import Optional, Dict, Any, BinaryIO
import httpx
import io
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

    @staticmethod
    async def upload_video_to_stream(
        file_content: bytes,
        filename: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Upload video file to Cloudflare Stream

        Args:
            file_content: Video file bytes
            filename: Original filename
            metadata: Optional metadata for the video

        Returns:
            Dict with stream_uid, status, and other info

        Raises:
            Exception if upload fails or credentials missing
        """
        account_id = settings.CLOUDFLARE_ACCOUNT_ID
        api_token = settings.CLOUDFLARE_API_TOKEN

        if not account_id or not api_token:
            raise Exception("Cloudflare Stream credentials not configured")

        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/stream"

        headers = {
            "Authorization": f"Bearer {api_token}"
        }

        # Create multipart form data
        files = {
            "file": (filename, io.BytesIO(file_content), "video/mp4")
        }

        # Add metadata if provided
        data = {}
        if metadata:
            if "title" in metadata:
                data["meta"] = {"name": metadata["title"]}
            if "requireSignedURLs" in metadata:
                data["requireSignedURLs"] = metadata["requireSignedURLs"]

        async with httpx.AsyncClient(timeout=300.0) as client:  # 5 min timeout for large uploads
            response = await client.post(url, headers=headers, files=files, data=data)

            if response.status_code not in [200, 201]:
                error_msg = f"Cloudflare Stream upload failed: {response.status_code} - {response.text}"
                raise Exception(error_msg)

            result = response.json()

            if not result.get("success"):
                errors = result.get("errors", [])
                error_msg = errors[0].get("message", "Unknown error") if errors else "Upload failed"
                raise Exception(f"Cloudflare Stream upload error: {error_msg}")

            video_data = result.get("result", {})

            return {
                "stream_uid": video_data.get("uid"),
                "status": video_data.get("status"),
                "duration": video_data.get("duration"),
                "thumbnail_url": f"https://stream.cloudflare.com/{video_data.get('uid')}/thumbnails/thumbnail.jpg",
                "embed_url": f"https://stream.cloudflare.com/{video_data.get('uid')}/iframe",
                "playback_url": f"https://stream.cloudflare.com/{video_data.get('uid')}/manifest/video.m3u8"
            }

    @staticmethod
    async def upload_image(
        file_content: bytes,
        filename: str,
        alt_text: Optional[str] = None,
        require_signed_urls: bool = False
    ) -> Dict[str, Any]:
        """
        Upload image to Cloudflare Images

        Args:
            file_content: Image file bytes
            filename: Original filename
            alt_text: Optional alt text for the image
            require_signed_urls: Whether to require signed URLs

        Returns:
            Dict with image_id, variants, and URLs

        Raises:
            Exception if upload fails or credentials missing
        """
        account_id = settings.CLOUDFLARE_ACCOUNT_ID
        api_token = settings.CLOUDFLARE_IMAGES_TOKEN or settings.CLOUDFLARE_API_TOKEN
        account_hash = settings.CLOUDFLARE_ACCOUNT_HASH

        if not account_id or not api_token:
            raise Exception("Cloudflare Images credentials not configured")

        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1"

        headers = {
            "Authorization": f"Bearer {api_token}"
        }

        # Create multipart form data
        files = {
            "file": (filename, io.BytesIO(file_content), "image/*")
        }

        data = {
            "requireSignedURLs": str(require_signed_urls).lower()
        }

        if alt_text:
            data["metadata"] = alt_text

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, files=files, data=data)

            if response.status_code not in [200, 201]:
                error_msg = f"Cloudflare Images upload failed: {response.status_code} - {response.text}"
                raise Exception(error_msg)

            result = response.json()

            if not result.get("success"):
                errors = result.get("errors", [])
                error_msg = errors[0].get("message", "Unknown error") if errors else "Upload failed"
                raise Exception(f"Cloudflare Images upload error: {error_msg}")

            image_data = result.get("result", {})
            image_id = image_data.get("id")

            # Get delivery URLs
            variants = image_data.get("variants", [])
            public_url = next((v for v in variants if "public" in v), variants[0] if variants else "")

            # Construct standard URL if account_hash is available
            if account_hash and image_id:
                public_url = f"https://imagedelivery.net/{account_hash}/{image_id}/public"

            return {
                "image_id": image_id,
                "filename": image_data.get("filename"),
                "url": public_url,
                "variants": variants,
                "uploaded": image_data.get("uploaded")
            }

    @staticmethod
    async def upload_video_to_r2(
        file_content: bytes,
        filename: str,
        bucket_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload video file to Cloudflare R2

        Args:
            file_content: Video file bytes
            filename: Original filename (will be used as object key)
            bucket_name: R2 bucket name (optional, uses default from settings)

        Returns:
            Dict with r2_url, filename, and size

        Raises:
            Exception if upload fails or credentials missing
        """
        account_id = settings.CLOUDFLARE_ACCOUNT_ID
        r2_access_key = getattr(settings, 'CLOUDFLARE_R2_ACCESS_KEY_ID', None)
        r2_secret_key = getattr(settings, 'CLOUDFLARE_R2_SECRET_ACCESS_KEY', None)
        bucket = bucket_name or getattr(settings, 'CLOUDFLARE_R2_BUCKET', None)
        r2_public_url = getattr(settings, 'CLOUDFLARE_R2_PUBLIC_URL', None)

        if not account_id or not r2_access_key or not r2_secret_key or not bucket:
            raise Exception("Cloudflare R2 credentials not configured. Set CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET in settings.")

        # Use boto3 for S3-compatible R2 API
        try:
            import boto3
            from botocore.exceptions import ClientError
        except ImportError:
            raise Exception("boto3 is required for R2 uploads. Install with: pip install boto3")

        # R2 endpoint format: https://<account_id>.r2.cloudflarestorage.com
        endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

        # Create S3 client for R2
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=r2_access_key,
            aws_secret_access_key=r2_secret_key,
            region_name='auto'  # R2 uses 'auto' for region
        )

        try:
            # Upload to R2
            s3_client.put_object(
                Bucket=bucket,
                Key=filename,
                Body=file_content,
                ContentType='video/mp4'
            )

            # Construct public URL
            if r2_public_url:
                # Use custom domain if configured
                public_url = f"{r2_public_url}/{filename}"
            else:
                # Use default R2 public URL format
                public_url = f"https://pub-{account_id}.r2.dev/{filename}"

            return {
                "r2_url": public_url,
                "filename": filename,
                "size": len(file_content),
                "bucket": bucket
            }

        except ClientError as e:
            error_msg = f"R2 upload failed: {str(e)}"
            raise Exception(error_msg)

    @staticmethod
    def upload_audio_to_r2(
        file_content: bytes,
        filename: str,
        bucket_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload audio file (MP3) to Cloudflare R2 (synchronous version)

        Args:
            file_content: Audio file bytes
            filename: Original filename (will be used as object key)
            bucket_name: R2 bucket name (optional, uses default from settings)

        Returns:
            Dict with r2_url, filename, and size

        Raises:
            Exception if upload fails or credentials missing
        """
        account_id = settings.CLOUDFLARE_ACCOUNT_ID
        r2_access_key = getattr(settings, 'CLOUDFLARE_R2_ACCESS_KEY_ID', None)
        r2_secret_key = getattr(settings, 'CLOUDFLARE_R2_SECRET_ACCESS_KEY', None)
        bucket = bucket_name or getattr(settings, 'CLOUDFLARE_R2_BUCKET', None)
        r2_public_url = getattr(settings, 'CLOUDFLARE_R2_PUBLIC_URL', None)

        if not account_id or not r2_access_key or not r2_secret_key or not bucket:
            raise Exception("Cloudflare R2 credentials not configured. Set CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET in settings.")

        # Use boto3 for S3-compatible R2 API
        try:
            import boto3
            from botocore.exceptions import ClientError
        except ImportError:
            raise Exception("boto3 is required for R2 uploads. Install with: pip install boto3")

        # R2 endpoint format: https://<account_id>.r2.cloudflarestorage.com
        endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

        # Create S3 client for R2
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=r2_access_key,
            aws_secret_access_key=r2_secret_key,
            region_name='auto'  # R2 uses 'auto' for region
        )

        try:
            # Upload to R2
            s3_client.put_object(
                Bucket=bucket,
                Key=f"retreat-audio/{filename}",  # Organize in subfolder
                Body=file_content,
                ContentType='audio/mpeg'
            )

            # Construct public URL
            if r2_public_url:
                # Use custom domain if configured
                public_url = f"{r2_public_url}/retreat-audio/{filename}"
            else:
                # Use default R2 public URL format
                public_url = f"https://pub-{account_id}.r2.dev/retreat-audio/{filename}"

            return {
                "r2_url": public_url,
                "filename": filename,
                "size": len(file_content),
                "bucket": bucket
            }

        except ClientError as e:
            error_msg = f"R2 upload failed: {str(e)}"
            raise Exception(error_msg)


# Singleton instance
cloudflare_service = CloudflareService()
