# Static Data Migration to PostgreSQL Backend
## Complete Migration Plan for Vercel Deployment

**Project:** SatyoGam MVP
**Purpose:** Migrate all static data and images from frontend to backend for Vercel deployment
**Date:** January 2025

---

## 📋 Executive Summary

### Current Situation
- **48,609 lines** of hardcoded static data in frontend
- **151 image/video files** in `/public` directory (~60MB)
- Large Next.js bundle preventing Vercel deployment
- Data spread across multiple files

### Migration Goals
- ✅ Move all static data to PostgreSQL database
- ✅ Move all images to Cloudflare Images + R2
- ✅ Reduce Next.js bundle size for Vercel
- ✅ Enable dynamic content management
- ✅ Improve performance with CDN delivery

### Pages to Migrate (11 total)
1. `/` - Homepage
2. `/about/satyoga` - About Sat Yoga
3. `/about/shunyamurti` - About Shunyamurti
4. `/about/ashram` - About Ashram
5. `/retreats/ashram` - Onsite Retreats
6. `/retreats/online` - Online Retreats (from data.ts)
7. `/courses` - Courses Page
8. `/faq` - FAQ Page
9. `/contact` - Contact Page
10. `/donate` - Donation Page
11. `/membership` - Membership Pricing

**Excluded:** All `/dashboard` pages (already using backend APIs)

---

## 🖼️ Image Migration Strategy

### Hybrid Approach: Cloudflare Images + R2

#### Cloudflare Images (for image files)
- **Use for:** .jpg, .png, .webp files (~140 files)
- **Benefits:**
  - Automatic WebP/AVIF conversion
  - Responsive image variants
  - Image optimization
  - Faster delivery for images
  - Built-in CDN

#### Cloudflare R2 (for videos & other assets)
- **Use for:** .mp4, .svg, .pdf files (~11 files)
- **Benefits:**
  - Supports any file type
  - Zero egress fees
  - Cheaper storage
  - CDN delivery via Cloudflare

### API Endpoints

#### Cloudflare Images Upload
```bash
curl -F file=@./<file_name> \
  -H "Authorization: Bearer <api_token>" \
  https://api.cloudflare.com/client/v4/accounts/6ff5acb9f54ba5e1132b12c7a7732ab8/images/v1
```

**Response:**
```json
{
  "result": {
    "id": "unique-image-id",
    "filename": "example.jpg",
    "uploaded": "2024-01-01T12:00:00.000Z",
    "variants": [
      "https://imagedelivery.net/<account-hash>/<image-id>/public",
      "https://imagedelivery.net/<account-hash>/<image-id>/thumbnail"
    ]
  }
}
```

#### Cloudflare R2 Upload
```bash
# Using AWS S3 SDK (R2 is S3-compatible)
aws s3 cp <file> s3://<bucket-name>/<key> \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com
```

### Database Schema for Media

```sql
CREATE TABLE media_assets (
    id SERIAL PRIMARY KEY,
    original_path VARCHAR(500) NOT NULL UNIQUE,  -- e.g., "/HOMEPAGELOOP.mp4"
    storage_type VARCHAR(20) NOT NULL,  -- 'cloudflare_images' or 'r2'
    storage_id VARCHAR(200),  -- Cloudflare Images ID or R2 key
    cdn_url TEXT NOT NULL,  -- Full delivery URL
    variants JSONB,  -- For Cloudflare Images variants
    file_type VARCHAR(50),
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    context VARCHAR(200),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_media_original_path ON media_assets(original_path);
CREATE INDEX idx_media_type ON media_assets(storage_type, is_active);
CREATE INDEX idx_media_context ON media_assets(context);
```

---

## 📊 Static Data Files to Migrate

### 1. Homepage Data (`src/lib/hpdata.ts`)
**Size:** 266 lines, ~2,000 words
**Sections:** 9 sections

| Section | Type | Fields |
|---------|------|--------|
| hero | Video Hero | videoUrl, logoUrl, logoAlt, subtitle |
| intro | Intro | backgroundImage, heading |
| whoWeAre | Content Section | eyebrow, heading, content[], buttonText, buttonLink, image, imageAlt, backgroundDecoration |
| shunyamurti | Content Section | eyebrow, quote, content[], buttonText, buttonLink, image, imageAlt, backgroundDecoration |
| learnOnline | Tab Section | eyebrow, heading, description[], tabs[5], backgroundDecorations{} |
| ashram | Content Section | eyebrow, heading, content[], buttonText, buttonLink, images{main, secondary[]} |
| platform | Content Section | eyebrow, heading, content, buttonText, buttonLink, image, imageAlt, backgroundDecoration |
| membership | CTA Section | eyebrow, heading, description, buttonText, buttonLink, backgroundImage |
| donation | CTA Section | eyebrow, heading, description, buttonText, buttonLink, backgroundDecoration |

**Total fields:** 70+ unique data points

### 2. About Pages Data (`src/lib/data.ts`)
**Size:** 47,843 lines (!!), ~30,000+ words
**CRITICAL:** This is the largest file!

#### Data Structures in data.ts:
- `whatIsSatYogaData` - About Satyoga page (3 accordion items, ~1,000 words)
- `methodologyData` - Methodology section (4 accordion items, ~600 words)
- `curriculumVitaeData` - Shunyamurti CV (6 sections, ~2,000 words)
- `ashramEndTimeData` - Ashram page content (~800 words)
- `whyParticipateData` - Retreat participation (video + content)
- `onlineRetreatsData` - **LARGE!** Multiple online retreat objects with:
  - Hero data
  - Intro sections (title, content[])
  - Agenda items[]
  - Included features[]
  - Testimonials
  - Images[]
  - Video data
- `atmanologyData` - Additional sections
- Background elements and decorations

### 3. Component Hardcoded Data

#### Contact Page (`src/components/contact/Contact.tsx`)
```typescript
contactData: {
  tagline, heading, description,
  contactInfo: { email, phone, address },
  formFields: [6 fields with config],
  privacyPolicyText, privacyPolicyLink,
  submitButtonText, successMessage, errorMessage
}
```

#### FAQ Page (`src/components/faq/FAQ.tsx`)
```typescript
faqData: {
  searchPlaceholder: string,
  categories: [
    { id: 'all', label: 'View all', faqs: [] },
    { id: 'general', label: 'General questions', faqs: [10 items] },
    { id: 'kitchen', label: 'Kitchen', faqs: [] },
    { id: 'overnight', label: 'Overnight guests', faqs: [] },
    { id: 'transportation', label: 'Transportation', faqs: [] }
  ]
}

galleryData: {
  images: [6 gallery images with src, alt, size]
}
```

#### Membership Pricing (`src/components/membership/Pricing.tsx`)
```typescript
pricingPageData: {
  monthlyLabel, yearlyLabel, yearlySavingsText,
  tiers: {
    gyani: {
      name, monthlyPrice: 20, yearlyPrice: 15,
      yearlyS avings: "60$", description,
      trialBadge, features: [8 items]
    },
    pragyani: {
      name, monthlyPrice: 100, yearlyPrice: 83,
      yearlySavings: "200$", description,
      recommended: true, features: [16 items]
    },
    pragyaniPlus: {
      name, yearlyPrice: 142, yearlyOnly: true,
      yearlySavings: "1170$", description,
      highlightBox, features: [16 items]
    }
  }
}
```

#### Donation Page (`src/components/donate/DonatePage.tsx`)
```typescript
donationProjects: [
  {
    id: 'animal-husbandry',
    name: 'Animal Husbandry',
    title, description (~150 words),
    image: '/images/donate/animal-husbandry.jpg'
  },
  // ... 5 more projects (broadcasting, off-grid, scholarships, publishing, infrastructure)
]
```

#### Courses Page (`src/components/courses/CoursesPage.tsx`)
```typescript
heroData: { tagline, background, heading, subtext }
introData: { leftPane: { title }, rightPane: { type: 'paragraphs', content: [2 paragraphs] } }
testimonialCarouselData: { tagline, heading, testimonials: [4 testimonials] }
```

#### Retreat Components
- `RetreatsAvailable.tsx` - 3 retreat cards (Shakti, Darshan, Sevadhari)
- `WhichRetreatIsRightForMe.tsx` - 3 retreat descriptions

---

## 🗄️ Complete Database Schema

### 1. Page Sections (Homepage, About, etc.)

```sql
-- Main sections table
CREATE TABLE page_sections (
    id SERIAL PRIMARY KEY,
    page_slug VARCHAR(100) NOT NULL,
    section_slug VARCHAR(100) NOT NULL,
    section_type VARCHAR(50) NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(page_slug, section_slug)
);

-- Section content (flexible for all section types)
CREATE TABLE section_content (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES page_sections(id) ON DELETE CASCADE,

    -- Text content
    eyebrow VARCHAR(200),
    heading TEXT,
    subheading TEXT,
    tagline VARCHAR(200),
    content JSONB,  -- Array of paragraphs or structured text
    quote TEXT,
    description TEXT,

    -- Video/Hero fields
    video_url VARCHAR(500),
    video_thumbnail VARCHAR(500),
    video_type VARCHAR(50),  -- youtube, cloudflare
    logo_url VARCHAR(500),
    logo_alt VARCHAR(200),
    subtitle TEXT,

    -- Image fields
    image_url VARCHAR(500),
    image_alt VARCHAR(200),
    background_image VARCHAR(500),
    background_decoration VARCHAR(500),
    secondary_images JSONB,  -- Array of image URLs

    -- CTA fields
    button_text VARCHAR(100),
    button_link VARCHAR(500),

    -- Layout/styling
    gap VARCHAR(50),
    title_line_height VARCHAR(50),
    background_elements JSONB,  -- For decorative elements

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabs (for Learn Online section, etc.)
CREATE TABLE section_tabs (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES page_sections(id) ON DELETE CASCADE,
    tab_id VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    tagline VARCHAR(200),
    title TEXT,
    description TEXT,
    button_text VARCHAR(100),
    button_link VARCHAR(500),
    image_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Background decorations
CREATE TABLE section_decorations (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES page_sections(id) ON DELETE CASCADE,
    decoration_key VARCHAR(100) NOT NULL,  -- innerLab, halfFlower, imageTraced
    decoration_url VARCHAR(500) NOT NULL
);

-- Indexes
CREATE INDEX idx_page_sections_page ON page_sections(page_slug, is_active, order_index);
CREATE INDEX idx_section_content_section ON section_content(section_id);
CREATE INDEX idx_section_tabs_section ON section_tabs(section_id, order_index);
```

### 2. Accordion Content (About pages)

```sql
CREATE TABLE accordion_sections (
    id SERIAL PRIMARY KEY,
    page_slug VARCHAR(100) NOT NULL,
    section_slug VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    tagline VARCHAR(200),
    type VARCHAR(50),  -- 'accordion', 'bulletaccordion', 'sections', 'paragraphs'
    gap VARCHAR(50),
    title_line_height VARCHAR(50),
    background_elements JSONB,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE accordion_items (
    id SERIAL PRIMARY KEY,
    accordion_section_id INTEGER REFERENCES accordion_sections(id) ON DELETE CASCADE,
    item_id INTEGER,
    title TEXT,
    heading TEXT,
    content TEXT NOT NULL,
    paragraphs JSONB,  -- For multi-paragraph content
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accordion_page ON accordion_sections(page_slug, section_slug, order_index);
CREATE INDEX idx_accordion_items_section ON accordion_items(accordion_section_id, order_index);
```

### 3. Online Retreats (from data.ts)

```sql
CREATE TABLE online_retreats (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    subtitle TEXT,

    -- Scheduling
    fixed_date VARCHAR(200),  -- "7-Day Retreat • December 27, 2024 - January 2, 2025"
    location VARCHAR(100),  -- "Online Retreat"
    duration VARCHAR(50),  -- Calculated or stored
    price DECIMAL(10,2),

    -- Content sections
    booking_tagline TEXT,
    intro1_title TEXT,
    intro1_content JSONB,  -- Array of paragraphs
    intro2_title TEXT,
    intro2_content JSONB,
    agenda_title TEXT,
    agenda_items JSONB,  -- Array of agenda items
    included_title TEXT,
    included_items JSONB,  -- Array of included features

    -- Media
    hero_background VARCHAR(500),
    images JSONB,  -- Array of {src, alt, size}
    video_url VARCHAR(500),
    video_thumbnail VARCHAR(500),
    video_type VARCHAR(50),

    -- Testimonials (can also be separate table)
    testimonial_data JSONB,

    -- Meta
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_online_retreats_active ON online_retreats(is_active, fixed_date);
CREATE INDEX idx_online_retreats_slug ON online_retreats(slug);
```

### 4. Retreat Info (Onsite retreats)

```sql
CREATE TABLE retreat_info (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    duration VARCHAR(100),
    type VARCHAR(100),  -- "Onsite Retreat"
    category VARCHAR(200),
    description TEXT,  -- Long description
    short_description TEXT,
    icon_url VARCHAR(500),
    image_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_retreat_info_active ON retreat_info(is_active, order_index);
```

### 5. FAQs

```sql
CREATE TABLE faq_categories (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL,
    page VARCHAR(100),  -- Which page it appears on
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES faq_categories(category_id)
);

CREATE INDEX idx_faqs_category ON faqs(category_id, is_active, order_index);
CREATE INDEX idx_faqs_page ON faqs(page, is_active);
```

### 6. Galleries

```sql
CREATE TABLE galleries (
    id SERIAL PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100),
    name VARCHAR(200),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE gallery_images (
    id SERIAL PRIMARY KEY,
    gallery_id INTEGER REFERENCES galleries(id) ON DELETE CASCADE,
    src VARCHAR(500) NOT NULL,
    alt TEXT NOT NULL,
    size VARCHAR(50),  -- small, medium, large
    order_index INTEGER NOT NULL
);

CREATE INDEX idx_galleries_page ON galleries(page, is_active);
CREATE INDEX idx_gallery_images_gallery ON gallery_images(gallery_id, order_index);
```

### 7. Contact Info & Form Fields

```sql
CREATE TABLE contact_info (
    id SERIAL PRIMARY KEY,
    tagline TEXT,
    heading TEXT,
    description TEXT,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    privacy_policy_text TEXT,
    privacy_policy_link VARCHAR(500),
    submit_button_text VARCHAR(100),
    success_message TEXT,
    error_message TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE form_fields (
    id SERIAL PRIMARY KEY,
    form_type VARCHAR(100) NOT NULL,  -- 'contact', 'application'
    field_id VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL,  -- text, email, select, textarea, checkbox
    placeholder TEXT,
    required BOOLEAN DEFAULT false,
    options JSONB,  -- For select fields
    rows INTEGER,  -- For textarea
    grid_column VARCHAR(10),  -- CSS grid column
    validation_rules JSONB,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_form_fields_type ON form_fields(form_type, is_active, order_index);
```

### 8. Membership Pricing

```sql
CREATE TABLE membership_pricing (
    id SERIAL PRIMARY KEY,
    tier_name VARCHAR(100) NOT NULL UNIQUE,
    tier_slug VARCHAR(100) NOT NULL UNIQUE,
    monthly_price DECIMAL(10,2),
    yearly_price DECIMAL(10,2) NOT NULL,
    yearly_savings VARCHAR(50),
    description TEXT,
    trial_badge VARCHAR(200),
    recommended BOOLEAN DEFAULT false,
    yearly_only BOOLEAN DEFAULT false,
    highlight_box TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE membership_features (
    id SERIAL PRIMARY KEY,
    tier_slug VARCHAR(100) NOT NULL,
    feature_type VARCHAR(50),  -- 'standard', 'discount_group'
    title TEXT,  -- For discount groups
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (tier_slug) REFERENCES membership_pricing(tier_slug)
);

CREATE TABLE membership_discount_items (
    id SERIAL PRIMARY KEY,
    feature_id INTEGER REFERENCES membership_features(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE INDEX idx_membership_pricing_active ON membership_pricing(is_active, order_index);
CREATE INDEX idx_membership_features_tier ON membership_features(tier_slug, order_index);
```

### 9. Donation Projects

```sql
CREATE TABLE donation_projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL UNIQUE,
    project_name VARCHAR(200) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_donation_projects_active ON donation_projects(is_active, order_index);
```

### 10. Courses Page Data

```sql
CREATE TABLE course_page_sections (
    id SERIAL PRIMARY KEY,
    section_type VARCHAR(100) NOT NULL,  -- 'hero', 'intro', 'testimonial'
    data JSONB NOT NULL,  -- Flexible JSON for section-specific data
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_course_sections_active ON course_page_sections(is_active, order_index);
```

---

## 🛠️ Implementation Plan

### Phase 1: Image Upload (4-5 hours)

#### Step 1.1: Setup Cloudflare Credentials

**Environment Variables:**
```bash
# backend/.env
CLOUDFLARE_ACCOUNT_ID=6ff5acb9f54ba5e1132b12c7a7732ab8
CLOUDFLARE_IMAGES_TOKEN=your_images_api_token
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=satyoga-assets
R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
```

#### Step 1.2: Create Image Upload Script

**File:** `backend/scripts/upload_images_to_cloudflare.py`

```python
#!/usr/bin/env python3
"""
Upload images to Cloudflare Images and videos/other files to R2
Record all URLs in database
"""

import os
import requests
import boto3
from pathlib import Path
import mimetypes
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import MediaAsset

# Cloudflare configuration
CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CF_IMAGES_TOKEN = os.getenv("CLOUDFLARE_IMAGES_TOKEN")
CF_IMAGES_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/images/v1"

# R2 configuration
R2_ENDPOINT = os.getenv("R2_ENDPOINT_URL")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET_NAME")

# S3 client for R2
s3_client = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY
)

def upload_to_cloudflare_images(file_path: str, original_path: str) -> dict:
    """Upload image to Cloudflare Images"""

    headers = {"Authorization": f"Bearer {CF_IMAGES_TOKEN}"}

    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(CF_IMAGES_URL, headers=headers, files=files)

    if response.status_code != 200:
        raise Exception(f"Upload failed: {response.text}")

    result = response.json()['result']

    return {
        'storage_type': 'cloudflare_images',
        'storage_id': result['id'],
        'cdn_url': result['variants'][0],  # Use public variant
        'variants': result.get('variants', [])
    }

def upload_to_r2(file_path: str, original_path: str) -> dict:
    """Upload file to Cloudflare R2"""

    # Use relative path as S3 key
    key = original_path.lstrip('/')

    # Upload to R2
    mime_type, _ = mimetypes.guess_type(file_path)
    with open(file_path, 'rb') as f:
        s3_client.upload_fileobj(
            f,
            R2_BUCKET,
            key,
            ExtraArgs={'ContentType': mime_type} if mime_type else {}
        )

    # Construct CDN URL (assuming R2 bucket has public access via custom domain)
    cdn_url = f"https://assets.satyoga.com/{key}"

    return {
        'storage_type': 'r2',
        'storage_id': key,
        'cdn_url': cdn_url,
        'variants': None
    }

def get_context_from_path(path: str) -> str:
    """Determine context from file path"""
    path_lower = path.lower()

    if "homepageloop" in path_lower:
        return "homepage-hero-video"
    elif "donate" in path_lower:
        return "donation-images"
    elif "faq" in path_lower:
        return "faq-gallery"
    elif "ssi" in path_lower or "shakti" in path_lower:
        return "shakti-retreat"
    elif "darshan" in path_lower:
        return "darshan-retreat"
    elif "sevadhari" in path_lower or "sd " in path_lower:
        return "sevadhari-retreat"
    elif "courses" in path_lower:
        return "courses-page"
    elif "about" in path_lower:
        return "about-pages"
    elif "contact" in path_lower:
        return "contact-page"
    else:
        return "general"

def migrate_public_directory(public_dir: str, db: Session):
    """Migrate all files from /public to Cloudflare"""

    public_path = Path(public_dir)

    # File extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    r2_extensions = {'.mp4', '.webm', '.svg', '.pdf', '.gif'}

    uploaded_images = 0
    uploaded_r2 = 0
    skipped = 0
    errors = 0

    print("="*60)
    print("CLOUDFLARE MEDIA MIGRATION")
    print("="*60)

    for file_path in public_path.rglob('*'):
        if not file_path.is_file():
            continue

        ext = file_path.suffix.lower()
        if ext not in image_extensions and ext not in r2_extensions:
            continue

        # Get original path
        relative_path = file_path.relative_to(public_path)
        original_path = f"/{relative_path.as_posix()}"

        # Check if already uploaded
        existing = db.query(MediaAsset).filter(
            MediaAsset.original_path == original_path
        ).first()

        if existing:
            print(f"⏭️  Skipping (exists): {original_path}")
            skipped += 1
            continue

        try:
            # Determine upload destination
            if ext in image_extensions:
                print(f"⬆️  [CF Images] {original_path}")
                upload_result = upload_to_cloudflare_images(str(file_path), original_path)
                uploaded_images += 1
            else:
                print(f"⬆️  [R2] {original_path}")
                upload_result = upload_to_r2(str(file_path), original_path)
                uploaded_r2 += 1

            # Get file stats
            file_stat = file_path.stat()
            context = get_context_from_path(original_path)

            # Create database record
            media_asset = MediaAsset(
                original_path=original_path,
                storage_type=upload_result['storage_type'],
                storage_id=upload_result['storage_id'],
                cdn_url=upload_result['cdn_url'],
                variants=upload_result.get('variants'),
                file_type=mimetypes.guess_type(str(file_path))[0],
                file_size=file_stat.st_size,
                context=context,
                is_active=True
            )
            db.add(media_asset)

            # Commit every 10 uploads
            if (uploaded_images + uploaded_r2) % 10 == 0:
                db.commit()
                print(f"✓ Committed batch")

        except Exception as e:
            print(f"❌ Error uploading {original_path}: {str(e)}")
            errors += 1
            continue

    db.commit()

    print("\n" + "="*60)
    print("MIGRATION COMPLETE")
    print("="*60)
    print(f"✓ Cloudflare Images: {uploaded_images}")
    print(f"✓ R2 Files: {uploaded_r2}")
    print(f"⏭ Skipped: {skipped}")
    print(f"❌ Errors: {errors}")
    print(f"📊 Total: {uploaded_images + uploaded_r2 + skipped}")
    print("="*60)

def main():
    public_dir = "../public"  # Adjust path as needed
    db = SessionLocal()

    try:
        migrate_public_directory(public_dir, db)
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
```

#### Step 1.3: Run Upload Script

```bash
cd backend

# Install dependencies
pip install boto3 requests

# Set environment variables
export CLOUDFLARE_ACCOUNT_ID=6ff5acb9f54ba5e1132b12c7a7732ab8
export CLOUDFLARE_IMAGES_TOKEN=your_token
export CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
export CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret

# Run migration
python scripts/upload_images_to_cloudflare.py
```

**Expected Output:**
```
============================================================
CLOUDFLARE MEDIA MIGRATION
============================================================
⬆️  [CF Images] /HOMEPAGELOOP.mp4
⬆️  [CF Images] /aboutbanner.jpg
⬆️  [CF Images] /contactusbanner.jpg
...
✓ Committed batch
...
============================================================
MIGRATION COMPLETE
============================================================
✓ Cloudflare Images: 140
✓ R2 Files: 11
⏭ Skipped: 0
❌ Errors: 0
📊 Total: 151
============================================================
```

---

### Phase 2: Database Setup (4-5 hours)

#### Step 2.1: Create Migration File

**File:** `backend/migrations/004_add_static_content_tables.sql`

```sql
-- Run all CREATE TABLE statements from schema above
-- This file should contain ALL 11 table schemas

-- Media Assets
CREATE TABLE media_assets (...);

-- Page Sections
CREATE TABLE page_sections (...);
CREATE TABLE section_content (...);
CREATE TABLE section_tabs (...);
CREATE TABLE section_decorations (...);

-- Accordion Content
CREATE TABLE accordion_sections (...);
CREATE TABLE accordion_items (...);

-- Online Retreats
CREATE TABLE online_retreats (...);

-- Retreat Info
CREATE TABLE retreat_info (...);

-- FAQs
CREATE TABLE faq_categories (...);
CREATE TABLE faqs (...);

-- Galleries
CREATE TABLE galleries (...);
CREATE TABLE gallery_images (...);

-- Contact
CREATE TABLE contact_info (...);
CREATE TABLE form_fields (...);

-- Membership
CREATE TABLE membership_pricing (...);
CREATE TABLE membership_features (...);
CREATE TABLE membership_discount_items (...);

-- Donations
CREATE TABLE donation_projects (...);

-- Courses
CREATE TABLE course_page_sections (...);

-- Create all indexes
CREATE INDEX ...;
```

#### Step 2.2: Run Migration

```bash
# Connect to PostgreSQL
PGPASSWORD='your_password' psql -h localhost -U satyoga -d satyoga_db -f migrations/004_add_static_content_tables.sql
```

#### Step 2.3: Create SQLAlchemy Models

**File:** `backend/app/models/static_content.py`

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True)
    original_path = Column(String(500), unique=True, nullable=False)
    storage_type = Column(String(20), nullable=False)
    storage_id = Column(String(200))
    cdn_url = Column(Text, nullable=False)
    variants = Column(JSONB)
    file_type = Column(String(50))
    file_size = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    alt_text = Column(Text)
    context = Column(String(200))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class PageSection(Base):
    __tablename__ = "page_sections"

    id = Column(Integer, primary_key=True)
    page_slug = Column(String(100), nullable=False)
    section_slug = Column(String(100), nullable=False)
    section_type = Column(String(50), nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    content = relationship("SectionContent", back_populates="section", uselist=False, cascade="all, delete-orphan")
    tabs = relationship("SectionTab", back_populates="section", order_by="SectionTab.order_index", cascade="all, delete-orphan")
    decorations = relationship("SectionDecoration", back_populates="section", cascade="all, delete-orphan")

class SectionContent(Base):
    __tablename__ = "section_content"

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("page_sections.id", ondelete="CASCADE"))

    # Text content
    eyebrow = Column(String(200))
    heading = Column(Text)
    subheading = Column(Text)
    tagline = Column(String(200))
    content = Column(JSONB)
    quote = Column(Text)
    description = Column(Text)

    # Video/Hero
    video_url = Column(String(500))
    video_thumbnail = Column(String(500))
    video_type = Column(String(50))
    logo_url = Column(String(500))
    logo_alt = Column(String(200))
    subtitle = Column(Text)

    # Images
    image_url = Column(String(500))
    image_alt = Column(String(200))
    background_image = Column(String(500))
    background_decoration = Column(String(500))
    secondary_images = Column(JSONB)

    # CTA
    button_text = Column(String(100))
    button_link = Column(String(500))

    # Layout
    gap = Column(String(50))
    title_line_height = Column(String(50))
    background_elements = Column(JSONB)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    section = relationship("PageSection", back_populates="content")

# ... Continue for all other models
# SectionTab, SectionDecoration, AccordionSection, AccordionItem,
# OnlineRetreat, RetreatInfo, FAQCategory, FAQ, Gallery, GalleryImage,
# ContactInfo, FormField, MembershipPricing, MembershipFeature,
# MembershipDiscountItem, DonationProject, CoursePageSection
```

**Update:** `backend/app/models/__init__.py`

```python
from .static_content import (
    MediaAsset, PageSection, SectionContent, SectionTab, SectionDecoration,
    AccordionSection, AccordionItem, OnlineRetreat, RetreatInfo,
    FAQCategory, FAQ, Gallery, GalleryImage, ContactInfo, FormField,
    MembershipPricing, MembershipFeature, MembershipDiscountItem,
    DonationProject, CoursePageSection
)

__all__ = [
    # ... existing exports
    "MediaAsset", "PageSection", "SectionContent", "SectionTab",
    # ... add all new models
]
```

---

### Phase 3: Data Migration Script (10-12 hours)

**CRITICAL:** data.ts is 47,843 lines!

#### Step 3.1: Move Data Files

```bash
mkdir -p backend/data_sources
cp src/lib/hpdata.ts backend/data_sources/
cp src/lib/data.ts backend/data_sources/
```

#### Step 3.2: Create Master Seed Script

**File:** `backend/scripts/seed_all_static_content.py`

This script must handle:
1. Homepage (9 sections from hpdata.ts)
2. About Satyoga (accordion sections from data.ts)
3. About Shunyamurti (CV + testimonials from data.ts)
4. About Ashram (sections from data.ts)
5. Online Retreats (**LARGE** - from data.ts)
6. Onsite Retreats (3 cards from components)
7. FAQs (10 questions from components)
8. Galleries (images from components)
9. Contact (info + form fields from components)
10. Membership (3 tiers from components)
11. Donations (6 projects from components)
12. Courses (page data from components)

**See implementation in next section (Phase 4)**

---

### Phase 4: Backend API Endpoints (5-6 hours)

#### Create Media Service

**File:** `backend/app/services/media_service.py`

```python
from sqlalchemy.orm import Session
from app.models.static_content import MediaAsset
from typing import Dict, List

class MediaService:
    """Service for resolving media URLs"""

    def __init__(self, db: Session):
        self.db = db
        self._cache: Dict[str, str] = {}

    def resolve_url(self, original_path: str) -> str:
        """Convert /public path to CDN URL"""

        if not original_path:
            return ""

        # Check cache
        if original_path in self._cache:
            return self._cache[original_path]

        # Query database
        asset = self.db.query(MediaAsset).filter(
            MediaAsset.original_path == original_path,
            MediaAsset.is_active == True
        ).first()

        if asset:
            cdn_url = asset.cdn_url
            self._cache[original_path] = cdn_url
            return cdn_url

        # Fallback (for development)
        print(f"⚠️  No CDN URL for {original_path}")
        return original_path

    def resolve_object(self, data: dict) -> dict:
        """Recursively replace image paths with CDN URLs"""

        if isinstance(data, dict):
            result = {}
            for key, value in data.items():
                if isinstance(value, str) and value.startswith('/') and any(ext in value for ext in ['.jpg', '.png', '.mp4', '.svg', '.webp']):
                    result[key] = self.resolve_url(value)
                elif isinstance(value, (dict, list)):
                    result[key] = self.resolve_object(value)
                else:
                    result[key] = value
            return result
        elif isinstance(data, list):
            return [self.resolve_object(item) for item in data]
        else:
            return data
```

#### Create Pages Router

**File:** `backend/app/routers/pages.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.static_content import PageSection, SectionContent
from app.services.media_service import MediaService
from typing import Dict, Any

router = APIRouter()

@router.get("/{page_slug}", response_model=Dict[str, Any])
async def get_page_content(
    page_slug: str,
    db: Session = Depends(get_db)
):
    """Get all sections for a page with CDN URLs"""

    # Get sections
    sections = db.query(PageSection).filter(
        PageSection.page_slug == page_slug,
        PageSection.is_active == True
    ).order_by(PageSection.order_index).all()

    if not sections:
        raise HTTPException(status_code=404, detail=f"Page '{page_slug}' not found")

    # Build response
    result = {}
    media_service = MediaService(db)

    for section in sections:
        section_data = {}

        if section.content:
            content = section.content

            # Map all fields
            if content.eyebrow:
                section_data["eyebrow"] = content.eyebrow
            if content.heading:
                section_data["heading"] = content.heading
            if content.content:
                section_data["content"] = content.content
            if content.quote:
                section_data["quote"] = content.quote

            # Video hero
            if content.video_url:
                section_data["videoUrl"] = media_service.resolve_url(content.video_url)
            if content.logo_url:
                section_data["logoUrl"] = media_service.resolve_url(content.logo_url)
            if content.subtitle:
                section_data["subtitle"] = content.subtitle

            # Images
            if content.image_url:
                section_data["image"] = media_service.resolve_url(content.image_url)
            if content.background_image:
                section_data["backgroundImage"] = media_service.resolve_url(content.background_image)

            # CTAs
            if content.button_text:
                section_data["buttonText"] = content.button_text
            if content.button_link:
                section_data["buttonLink"] = content.button_link

        # Add tabs
        if section.tabs:
            section_data["tabs"] = [
                {
                    "id": tab.tab_id,
                    "label": tab.label,
                    "tagline": tab.tagline,
                    "title": tab.title,
                    "description": tab.description,
                    "buttonText": tab.button_text,
                    "buttonLink": tab.button_link,
                    "image": media_service.resolve_url(tab.image_url) if tab.image_url else None
                }
                for tab in section.tabs
            ]

        # Add decorations
        if section.decorations:
            section_data["backgroundDecorations"] = {
                dec.decoration_key: media_service.resolve_url(dec.decoration_url)
                for dec in section.decorations
            }

        # Convert slug to camelCase for frontend
        key_map = {
            "who-we-are": "whoWeAre",
            "learn-online": "learnOnline"
        }
        result_key = key_map.get(section.section_slug, section.section_slug)
        result[result_key] = section_data

    return result
```

#### Create Additional Routers

**Files to create:**
- `backend/app/routers/online_retreats.py` - Online retreats API
- `backend/app/routers/faqs.py` - FAQ API
- `backend/app/routers/contact_info.py` - Contact info API
- `backend/app/routers/membership_pricing.py` - Membership API
- `backend/app/routers/donations.py` - Donations API
- `backend/app/routers/courses.py` - Courses page API

**Register in main.py:**

```python
from app.routers import (
    pages, online_retreats, faqs, contact_info,
    membership_pricing, donations, courses
)

app.include_router(pages.router, prefix="/api/pages", tags=["Pages"])
app.include_router(online_retreats.router, prefix="/api/online-retreats", tags=["Online Retreats"])
app.include_router(faqs.router, prefix="/api/faqs", tags=["FAQs"])
app.include_router(contact_info.router, prefix="/api/contact", tags=["Contact"])
app.include_router(membership_pricing.router, prefix="/api/membership/pricing", tags=["Membership"])
app.include_router(donations.router, prefix="/api/donations", tags=["Donations"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
```

---

### Phase 5: Frontend Integration (6-7 hours)

#### Step 5.1: Create API Client

**File:** `src/lib/backend-content-api.ts`

```typescript
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export const contentApi = {
  // Pages
  getPageContent: async (pageSlug: string) => {
    const res = await fetch(`${FASTAPI_URL}/api/pages/${pageSlug}`, {
      next: { revalidate: 3600 } // Cache 1 hour
    });
    if (!res.ok) throw new Error(`Failed to fetch ${pageSlug}`);
    return res.json();
  },

  // Online Retreats
  getOnlineRetreats: async () => {
    const res = await fetch(`${FASTAPI_URL}/api/online-retreats`, {
      next: { revalidate: 1800 }
    });
    if (!res.ok) throw new Error('Failed to fetch online retreats');
    return res.json();
  },

  getOnlineRetreat: async (slug: string) => {
    const res = await fetch(`${FASTAPI_URL}/api/online-retreats/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch retreat');
    return res.json();
  },

  // FAQs
  getFAQs: async (category?: string) => {
    const url = category
      ? `${FASTAPI_URL}/api/faqs?category=${category}`
      : `${FASTAPI_URL}/api/faqs`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch FAQs');
    return res.json();
  },

  getFAQCategories: async () => {
    const res = await fetch(`${FASTAPI_URL}/api/faqs/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch FAQ categories');
    return res.json();
  },

  // Contact
  getContactInfo: async () => {
    const res = await fetch(`${FASTAPI_URL}/api/contact/info`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch contact info');
    return res.json();
  },

  getContactFormFields: async () => {
    const res = await fetch(`${FASTAPI_URL}/api/contact/form-fields`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch form fields');
    return res.json();
  },

  // Membership
  getMembershipPricing: async () => {
    const res = await fetch(`${FASTAPI_URL}/api/membership/pricing`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch membership pricing');
    return res.json();
  },

  // Donations
  getDonationProjects: async () => {
    const res = await fetch(`${FASTAPI_URL}/api/donations/projects`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch donation projects');
    return res.json();
  },

  // Courses
  getCoursesPageData: async () => {
    const res = await fetch(`${FASTAPI_URL}/api/courses/page-data`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch courses data');
    return res.json();
  },

  // Galleries
  getGallery: async (page: string, section?: string) => {
    const url = section
      ? `${FASTAPI_URL}/api/galleries?page=${page}&section=${section}`
      : `${FASTAPI_URL}/api/galleries?page=${page}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch gallery');
    return res.json();
  }
};
```

#### Step 5.2: Update Pages

**Homepage:**
```typescript
// src/app/page.tsx
import { contentApi } from '@/lib/backend-content-api';
import Homepage from '@/components/homepage/Homepage';

export default async function Page() {
  const data = await contentApi.getPageContent('homepage');
  return <Homepage data={data} />;
}
```

**About Satyoga:**
```typescript
// src/app/about/satyoga/page.tsx
import { contentApi } from '@/lib/backend-content-api';
import AboutPage from '@/components/aboutPage/AboutPage';

export default async function Page() {
  const data = await contentApi.getPageContent('about-satyoga');
  return <AboutPage data={data} />;
}
```

**Online Retreats:**
```typescript
// src/app/retreats/online/page.tsx
import { contentApi } from '@/lib/backend-content-api';
import OnlinePage from '@/components/retreats/online/Online';

export default async function Page() {
  const [retreats, products] = await Promise.all([
    contentApi.getOnlineRetreats(),
    fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/products?limit=3`).then(r => r.json())
  ]);

  return <OnlinePage retreats={retreats} products={products} />;
}
```

**Update all 11 pages similarly**

---

### Phase 6: Delete Frontend Data Files (1 hour)

```bash
# After thorough testing
rm src/lib/hpdata.ts
rm src/lib/data.ts  # 47,843 lines removed!

# Verify no imports remain
grep -r "from '@/lib/hpdata'" src/
grep -r "from '@/lib/data'" src/

# Should return empty
```

---

### Phase 7: Testing & Verification (5-6 hours)

#### Data Integrity Check

**File:** `backend/scripts/verify_migration.py`

```python
def verify_all_migrations():
    db = SessionLocal()

    # Media
    media_count = db.query(MediaAsset).count()
    assert media_count >= 151, f"Expected 151+ images, got {media_count}"
    print(f"✓ {media_count} media assets migrated")

    # Homepage
    hp_sections = db.query(PageSection).filter(PageSection.page_slug == "homepage").count()
    assert hp_sections == 9, f"Expected 9 homepage sections, got {hp_sections}"
    print(f"✓ {hp_sections} homepage sections")

    # Online retreats
    retreats = db.query(OnlineRetreat).count()
    print(f"✓ {retreats} online retreats")

    # FAQs
    faqs = db.query(FAQ).count()
    print(f"✓ {faqs} FAQ items")

    # Membership tiers
    tiers = db.query(MembershipPricing).count()
    assert tiers == 3, f"Expected 3 tiers, got {tiers}"
    print(f"✓ {tiers} membership tiers")

    # Donation projects
    projects = db.query(DonationProject).count()
    assert projects == 6, f"Expected 6 projects, got {projects}"
    print(f"✓ {projects} donation projects")

    print("\n✓✓✓ ALL DATA VERIFIED ✓✓✓")

verify_all_migrations()
```

#### Visual Testing
- Compare all 11 pages before/after
- Verify all images load from CDN
- Check Cloudflare Images dashboard for variants
- Test responsive images

---

## 📊 Migration Summary

### Static Data
| Source | Lines | Destination |
|--------|-------|-------------|
| hpdata.ts | 266 | PostgreSQL (9 sections) |
| data.ts | 47,843 | PostgreSQL (multiple tables) |
| Components | ~500 | PostgreSQL (various tables) |
| **TOTAL** | **48,609** | **~450+ database records** |

### Images
| Type | Count | Source | Destination |
|------|-------|--------|-------------|
| Images (.jpg/.png) | ~140 | /public | Cloudflare Images |
| Videos (.mp4) | ~3 | /public | Cloudflare R2 |
| SVG/Other | ~8 | /public | Cloudflare R2 |
| **TOTAL** | **151** | **60MB** | **CDN** |

---

## ⏱️ Timeline

| Phase | Hours |
|-------|-------|
| 1. Image Upload | 4-5 |
| 2. Database Setup | 4-5 |
| 3. Data Migration Script | 10-12 |
| 4. Backend APIs | 5-6 |
| 5. Frontend Integration | 6-7 |
| 6. Delete Files | 1 |
| 7. Testing | 5-6 |
| **TOTAL** | **35-42 hours** |

---

## ✅ Success Checklist

### Data Migration
- [ ] 151 images uploaded to Cloudflare
- [ ] All image URLs recorded in database
- [ ] Homepage (9 sections) migrated
- [ ] About pages migrated
- [ ] Online retreats migrated
- [ ] FAQ data migrated
- [ ] Contact data migrated
- [ ] Membership pricing migrated
- [ ] Donation projects migrated
- [ ] Courses page data migrated

### Cleanup
- [ ] `src/lib/hpdata.ts` deleted
- [ ] `src/lib/data.ts` (47k lines) deleted
- [ ] No hardcoded data in frontend
- [ ] `/public` cleaned (keep only favicon/icons)

### Deployment
- [ ] Vercel build succeeds
- [ ] Bundle size reduced significantly
- [ ] All pages render correctly
- [ ] Images load from Cloudflare CDN
- [ ] Performance targets met (<3s page load)

---

## 🚀 Environment Variables

### Backend
```bash
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=6ff5acb9f54ba5e1132b12c7a7732ab8
CLOUDFLARE_IMAGES_TOKEN=your_token
CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=satyoga-assets
R2_ENDPOINT_URL=https://<id>.r2.cloudflarestorage.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/satyoga_db
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_FASTAPI_URL=https://api.satyoga.com
```

---

**End of Migration Document**
