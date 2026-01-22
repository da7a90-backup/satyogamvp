"""List files in R2 bucket to verify uploads."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.core.config import settings

account_id = settings.CLOUDFLARE_ACCOUNT_ID
r2_access_key = settings.CLOUDFLARE_R2_ACCESS_KEY_ID
r2_secret_key = settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY
bucket = settings.CLOUDFLARE_R2_BUCKET

endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

s3_client = boto3.client(
    's3',
    endpoint_url=endpoint_url,
    aws_access_key_id=r2_access_key,
    aws_secret_access_key=r2_secret_key,
    config=Config(signature_version='s3v4'),
    region_name='auto'
)

print(f"Listing files in R2 bucket: {bucket}")
print(f"Endpoint: {endpoint_url}\n")

try:
    # List files with store-audio prefix
    print("Files in store-audio/:")
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix='store-audio/', MaxKeys=50)

    if 'Contents' in response:
        for obj in response['Contents']:
            print(f"  - {obj['Key']} ({obj['Size']} bytes)")
        print(f"\nTotal: {len(response['Contents'])} files")
    else:
        print("  No files found")

    # Try also videos/ prefix (if files were uploaded there)
    print("\n\nFiles in videos/store-audio/:")
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix='videos/store-audio/', MaxKeys=50)

    if 'Contents' in response:
        for obj in response['Contents']:
            print(f"  - {obj['Key']} ({obj['Size']} bytes)")
        print(f"\nTotal: {len(response['Contents'])} files")
    else:
        print("  No files found")

except ClientError as e:
    print(f"Error: {e}")
