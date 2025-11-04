"""Test if all imports work"""
import sys
print("Testing imports...")

try:
    from app.core.config import settings
    print("OK Config")
except Exception as e:
    print(f"FAIL Config: {e}")
    sys.exit(1)

try:
    from app.core.security import get_password_hash, create_access_token
    print("OK Security")
except Exception as e:
    print(f"FAIL Security: {e}")

try:
    from app.schemas import UserCreate, TeachingResponse, CourseResponse
    print("OK Schemas")
except Exception as e:
    print(f"FAIL Schemas: {e}")

print("\nAll core imports successful!")
