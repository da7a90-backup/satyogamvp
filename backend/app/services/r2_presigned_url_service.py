"""
Service for generating presigned URLs for R2 content.

Presigned URLs provide temporary authenticated access to private R2 objects without making the bucket public.
This is the secure way to serve protected content like purchased audio files.
"""

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from typing import Optional
from app.core.config import settings


class R2PresignedURLService:
    """Service for generating presigned URLs for R2 objects."""

    @staticmethod
    def generate_presigned_url(
        object_key: str,
        bucket_name: Optional[str] = None,
        expiration: int = 3600  # 1 hour default
    ) -> str:
        """
        Generate a presigned URL for an R2 object.

        Args:
            object_key: The S3 key of the object (e.g., "store-audio/filename.mp3")
            bucket_name: R2 bucket name (defaults to settings.CLOUDFLARE_R2_BUCKET)
            expiration: URL expiration time in seconds (default: 3600 = 1 hour)

        Returns:
            Presigned URL string that provides temporary access to the object

        Raises:
            Exception: If R2 credentials are not configured or URL generation fails
        """
        account_id = settings.CLOUDFLARE_ACCOUNT_ID
        r2_access_key = settings.CLOUDFLARE_R2_ACCESS_KEY_ID
        r2_secret_key = settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY
        bucket = bucket_name or settings.CLOUDFLARE_R2_BUCKET

        if not account_id or not r2_access_key or not r2_secret_key or not bucket:
            raise Exception(
                "Cloudflare R2 credentials not configured. Set CLOUDFLARE_R2_ACCESS_KEY_ID, "
                "CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET in settings."
            )

        # R2 endpoint URL
        endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

        try:
            # Create S3 client for R2
            s3_client = boto3.client(
                's3',
                endpoint_url=endpoint_url,
                aws_access_key_id=r2_access_key,
                aws_secret_access_key=r2_secret_key,
                config=Config(signature_version='s3v4'),
                region_name='auto'
            )

            # Generate presigned URL
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket,
                    'Key': object_key
                },
                ExpiresIn=expiration
            )

            return presigned_url

        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")

    @staticmethod
    def extract_r2_key_from_url(url: str) -> Optional[str]:
        """
        Extract the R2 object key from a full R2 URL.

        Args:
            url: Full R2 URL (e.g., "https://...r2.cloudflarestorage.com/videos/store-audio/file.mp3")

        Returns:
            Object key (e.g., "store-audio/file.mp3") or None if extraction fails
        """
        if not url:
            return None

        # Handle different R2 URL formats
        # Format 1: https://{account_id}.r2.cloudflarestorage.com/{bucket}/{key}
        # Format 2: https://pub-{account_id}.r2.dev/{key}
        # Format 3: Custom domain

        parts = url.split('/')

        # Find the index after the domain
        r2_public_url = getattr(settings, 'CLOUDFLARE_R2_PUBLIC_URL', None)
        for i, part in enumerate(parts):
            if 'r2.cloudflarestorage.com' in part or 'r2.dev' in part or (r2_public_url and r2_public_url in url):
                # The key starts after the domain and bucket name
                if 'r2.cloudflarestorage.com' in part:
                    # Skip bucket name (next part) and get everything after
                    if i + 2 < len(parts):
                        return '/'.join(parts[i + 2:])
                else:
                    # For r2.dev or custom domain, key starts immediately after domain
                    if i + 1 < len(parts):
                        return '/'.join(parts[i + 1:])

        return None
