"""
Test the purchases API to see what data is returned.
"""
import requests
import json

# Login
print("Logging in...")
login_response = requests.post('http://localhost:8000/api/auth/login', json={
    'email': 'free@test.com',
    'password': 'Password123'
})

if login_response.status_code != 200:
    print(f"Login failed: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json()['access_token']
print(f"✓ Login successful, token obtained")

# Get purchases
print("\nFetching purchases...")
purchases_response = requests.get(
    'http://localhost:8000/api/users/me/purchases',
    headers={'Authorization': f'Bearer {token}'}
)

if purchases_response.status_code != 200:
    print(f"Purchases request failed: {purchases_response.status_code}")
    print(purchases_response.text)
    exit(1)

purchases = purchases_response.json()
print(f"✓ Got {len(purchases)} purchases")

# Print detailed info about each purchase
for i, purchase in enumerate(purchases, 1):
    print(f"\n{'='*80}")
    print(f"Purchase {i}: {purchase['product']['title']}")
    print(f"{'='*80}")
    print(f"Product Slug: {purchase['product']['slug']}")
    print(f"Product Type: {purchase['product']['type']}")
    print(f"Retreat ID: {purchase['product'].get('retreat_id', 'NOT SET')}")
    print(f"Retreat Slug: {purchase['product'].get('retreat_slug', 'NOT SET')}")
    print(f"Has portal_media: {bool(purchase['product'].get('portal_media'))}")

    if purchase['product'].get('portal_media'):
        portal_media = purchase['product']['portal_media']
        print(f"\nPortal Media:")
        print(f"  - MP3 files: {len(portal_media.get('mp3', []))}")
        print(f"  - MP4 files: {len(portal_media.get('mp4', []))}")
        print(f"  - YouTube: {len(portal_media.get('youtube', []))}")
        print(f"  - Cloudflare: {len(portal_media.get('cloudflare', []))}")

    print(f"\nIs Expired: {purchase['is_expired']}")
    print(f"Amount Paid: ${purchase.get('amount_paid', 0)}")

print("\n" + "="*80)
