"""Test R2 presigned URL generation."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.r2_presigned_url_service import R2PresignedURLService

# Test with the Dissolve the Ego-mind MP3 file
r2_url = "https://6ff5acb9f54ba5e1132b12c7a7732ab8.r2.cloudflarestorage.com/videos/store-audio/Dissolve-the-Ego-mind-GM.mp3"

print(f"Original R2 URL:\n{r2_url}\n")

# Extract the object key
object_key = R2PresignedURLService.extract_r2_key_from_url(r2_url)
print(f"Extracted object key: {object_key}\n")

# Generate presigned URL
try:
    presigned_url = R2PresignedURLService.generate_presigned_url(
        object_key=object_key,
        expiration=3600  # 1 hour
    )

    print(f"Generated Presigned URL:\n{presigned_url}\n")
    print("✓ Presigned URL generated successfully!")
    print("\nThis URL will provide authenticated access to the file for 1 hour.")
    print("Test it with:")
    print(f'curl -I "{presigned_url}"')

except Exception as e:
    print(f"✗ Failed to generate presigned URL: {str(e)}")
    import traceback
    traceback.print_exc()
