"""Create test ebook product with EPUB, MOBI, and PDF formats."""

import sys
sys.path.append('.')
from app.core.database import SessionLocal
from app.models.product import Product, ProductType
from app.models.user import User
from app.models.product import UserProductAccess
import uuid
from datetime import datetime

db = SessionLocal()

# Create a test ebook product with EPUB and MOBI formats
test_product = Product(
    id=uuid.uuid4(),
    slug='test-ebook-formats',
    title='Test Ebook - Multiple Formats (EPUB, MOBI, PDF)',
    short_description='Test product for EPUB and MOBI rendering',
    description='This test product contains sample EPUB, MOBI, and PDF files to test the ebook viewer functionality.',
    type=ProductType.EBOOK,
    price=0.00,
    regular_price=0.00,
    digital_content_url='https://www.gutenberg.org/ebooks/84.epub.images',  # Alice in Wonderland EPUB from Project Gutenberg
    downloads=[
        {
            'id': str(uuid.uuid4()),
            'name': 'Alice in Wonderland (EPUB)',
            'url': 'https://www.gutenberg.org/ebooks/84.epub.images'
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Alice in Wonderland (MOBI - Kindle)',
            'url': 'https://www.gutenberg.org/ebooks/84.kf8.images'  # Kindle format
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Alice in Wonderland (PDF)',
            'url': 'https://www.gutenberg.org/cache/epub/84/pg84.pdf'
        }
    ],
    categories=['Test', 'Ebooks'],
    is_available=True,
    in_stock=True,
    published=True,
    featured=False
)

db.add(test_product)
db.commit()

print(f'✓ Created test product: {test_product.title}')
print(f'  Slug: {test_product.slug}')
print(f'  ID: {test_product.id}')
print(f'  Files:')
for download in test_product.downloads:
    print(f'    - {download["name"]}')

# Now grant access to admin user for testing
admin = db.query(User).filter(User.email == 'admin@test.com').first()
if admin:
    access = UserProductAccess(
        id=uuid.uuid4(),
        user_id=admin.id,
        product_id=test_product.id,
        granted_at=datetime.utcnow()
    )
    db.add(access)
    db.commit()
    print(f'\n✓ Granted access to admin@test.com')
else:
    print('\n⚠ Admin user not found')

db.close()
