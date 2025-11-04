-- ============================================================================
-- STATIC CONTENT MIGRATION
-- Purpose: Move all static data from frontend to PostgreSQL database
-- Tables: 18 tables for homepage, about pages, retreats, FAQs, etc.
-- ============================================================================

-- 1. MEDIA ASSETS TABLE
-- Stores all Cloudflare Images & R2 URLs
CREATE TABLE IF NOT EXISTS media_assets (
    id SERIAL PRIMARY KEY,
    original_path VARCHAR(500) NOT NULL UNIQUE,
    storage_type VARCHAR(20) NOT NULL CHECK (storage_type IN ('cloudflare_images', 'r2')),
    storage_id VARCHAR(200),
    cdn_url TEXT NOT NULL,
    variants JSONB,
    file_type VARCHAR(50),
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    context VARCHAR(200),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_media_original_path ON media_assets(original_path);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_assets(storage_type, is_active);
CREATE INDEX IF NOT EXISTS idx_media_context ON media_assets(context);

-- ============================================================================
-- 2. PAGE SECTIONS (Homepage, About Pages, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_sections (
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

CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_slug, is_active, order_index);

-- Section content (flexible for all section types)
CREATE TABLE IF NOT EXISTS section_content (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES page_sections(id) ON DELETE CASCADE,

    -- Text content
    eyebrow VARCHAR(200),
    heading TEXT,
    subheading TEXT,
    tagline VARCHAR(200),
    content JSONB,
    quote TEXT,
    description TEXT,

    -- Video/Hero fields
    video_url VARCHAR(500),
    video_thumbnail VARCHAR(500),
    video_type VARCHAR(50),
    logo_url VARCHAR(500),
    logo_alt VARCHAR(200),
    subtitle TEXT,

    -- Image fields
    image_url VARCHAR(500),
    image_alt VARCHAR(200),
    background_image VARCHAR(500),
    background_decoration VARCHAR(500),
    secondary_images JSONB,

    -- CTA fields
    button_text VARCHAR(100),
    button_link VARCHAR(500),

    -- Layout/styling
    gap VARCHAR(50),
    title_line_height VARCHAR(50),
    background_elements JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_section_content_section ON section_content(section_id);

-- Tabs (for Learn Online section, etc.)
CREATE TABLE IF NOT EXISTS section_tabs (
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

CREATE INDEX IF NOT EXISTS idx_section_tabs_section ON section_tabs(section_id, order_index);

-- Background decorations
CREATE TABLE IF NOT EXISTS section_decorations (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES page_sections(id) ON DELETE CASCADE,
    decoration_key VARCHAR(100) NOT NULL,
    decoration_url VARCHAR(500) NOT NULL
);

-- ============================================================================
-- 3. ACCORDION CONTENT (About pages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS accordion_sections (
    id SERIAL PRIMARY KEY,
    page_slug VARCHAR(100) NOT NULL,
    section_slug VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    tagline VARCHAR(200),
    type VARCHAR(50),
    gap VARCHAR(50),
    title_line_height VARCHAR(50),
    background_elements JSONB,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accordion_page ON accordion_sections(page_slug, section_slug, order_index);

CREATE TABLE IF NOT EXISTS accordion_items (
    id SERIAL PRIMARY KEY,
    accordion_section_id INTEGER REFERENCES accordion_sections(id) ON DELETE CASCADE,
    item_id INTEGER,
    title TEXT,
    heading TEXT,
    content TEXT NOT NULL,
    paragraphs JSONB,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accordion_items_section ON accordion_items(accordion_section_id, order_index);

-- ============================================================================
-- 4. ONLINE RETREATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS online_retreats (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    subtitle TEXT,

    -- Scheduling
    fixed_date VARCHAR(200),
    location VARCHAR(100),
    duration VARCHAR(50),
    price DECIMAL(10,2),

    -- Content sections
    booking_tagline TEXT,
    intro1_title TEXT,
    intro1_content JSONB,
    intro2_title TEXT,
    intro2_content JSONB,
    agenda_title TEXT,
    agenda_items JSONB,
    included_title TEXT,
    included_items JSONB,

    -- Media
    hero_background VARCHAR(500),
    images JSONB,
    video_url VARCHAR(500),
    video_thumbnail VARCHAR(500),
    video_type VARCHAR(50),

    -- Testimonials
    testimonial_data JSONB,

    -- Meta
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_online_retreats_active ON online_retreats(is_active, fixed_date);
CREATE INDEX IF NOT EXISTS idx_online_retreats_slug ON online_retreats(slug);

-- ============================================================================
-- 5. RETREAT INFO (Onsite retreats)
-- ============================================================================

CREATE TABLE IF NOT EXISTS retreat_info (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    duration VARCHAR(100),
    type VARCHAR(100),
    category VARCHAR(200),
    description TEXT,
    short_description TEXT,
    icon_url VARCHAR(500),
    image_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retreat_info_active ON retreat_info(is_active, order_index);

-- ============================================================================
-- 6. FAQs
-- ============================================================================

CREATE TABLE IF NOT EXISTS faq_categories (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL,
    page VARCHAR(100),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES faq_categories(category_id)
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category_id, is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_faqs_page ON faqs(page, is_active);

-- ============================================================================
-- 7. GALLERIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS galleries (
    id SERIAL PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100),
    name VARCHAR(200),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_galleries_page ON galleries(page, is_active);

CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    gallery_id INTEGER REFERENCES galleries(id) ON DELETE CASCADE,
    src VARCHAR(500) NOT NULL,
    alt TEXT NOT NULL,
    size VARCHAR(50),
    order_index INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery ON gallery_images(gallery_id, order_index);

-- ============================================================================
-- 8. CONTACT INFO & FORM FIELDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_info (
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

CREATE TABLE IF NOT EXISTS form_fields (
    id SERIAL PRIMARY KEY,
    form_type VARCHAR(100) NOT NULL,
    field_id VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT false,
    options JSONB,
    rows INTEGER,
    grid_column VARCHAR(10),
    validation_rules JSONB,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_form_fields_type ON form_fields(form_type, is_active, order_index);

-- ============================================================================
-- 9. MEMBERSHIP PRICING
-- ============================================================================

CREATE TABLE IF NOT EXISTS membership_pricing (
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

CREATE INDEX IF NOT EXISTS idx_membership_pricing_active ON membership_pricing(is_active, order_index);

CREATE TABLE IF NOT EXISTS membership_features (
    id SERIAL PRIMARY KEY,
    tier_slug VARCHAR(100) NOT NULL,
    feature_type VARCHAR(50),
    title TEXT,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (tier_slug) REFERENCES membership_pricing(tier_slug)
);

CREATE INDEX IF NOT EXISTS idx_membership_features_tier ON membership_features(tier_slug, order_index);

CREATE TABLE IF NOT EXISTS membership_discount_items (
    id SERIAL PRIMARY KEY,
    feature_id INTEGER REFERENCES membership_features(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    order_index INTEGER NOT NULL
);

-- ============================================================================
-- 10. DONATION PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS donation_projects (
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

CREATE INDEX IF NOT EXISTS idx_donation_projects_active ON donation_projects(is_active, order_index);

-- ============================================================================
-- 11. COURSES PAGE DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_page_sections (
    id SERIAL PRIMARY KEY,
    section_type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_course_sections_active ON course_page_sections(is_active, order_index);

-- ============================================================================
-- MIGRATION COMPLETE
-- Total: 18 tables created
-- ============================================================================
