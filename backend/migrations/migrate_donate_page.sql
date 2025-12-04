-- ============================================================================
-- DONATE PAGE CONTENT MIGRATION
-- ============================================================================
-- This script migrates all static content from DonatePage.tsx to database
-- Sections: Hero, Giving from Heart, General Fund, Quote

BEGIN;

-- ============================================================================
-- 1. PAGE SECTIONS
-- ============================================================================

-- Hero Section
INSERT INTO page_sections (page_slug, section_slug, section_type, order_index, is_active, created_at, updated_at)
VALUES ('donate', 'hero', 'hero', 1, true, NOW(), NOW())
RETURNING id;

-- Giving from the Heart Section (Two Pane with Bullet Accordion)
INSERT INTO page_sections (page_slug, section_slug, section_type, order_index, is_active, created_at, updated_at)
VALUES ('donate', 'giving-from-heart', 'two_pane_bulletaccordion', 2, true, NOW(), NOW())
RETURNING id;

-- General Fund Section
INSERT INTO page_sections (page_slug, section_slug, section_type, order_index, is_active, created_at, updated_at)
VALUES ('donate', 'general-fund', 'custom_donation_form', 3, true, NOW(), NOW())
RETURNING id;

-- Quote Section
INSERT INTO page_sections (page_slug, section_slug, section_type, order_index, is_active, created_at, updated_at)
VALUES ('donate', 'quote', 'quote', 4, true, NOW(), NOW())
RETURNING id;

-- ============================================================================
-- 2. SECTION CONTENT
-- ============================================================================

-- Hero Section Content
INSERT INTO section_content (section_id, tagline, heading, description, background_image, created_at, updated_at)
SELECT
    id,
    'SUPPORT THE SAT YOGA MISSION',
    'Help Bring a New World into Being',
    'If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.',
    '/images/donate/hero-bg.jpg',
    NOW(),
    NOW()
FROM page_sections
WHERE page_slug = 'donate' AND section_slug = 'hero';

-- Giving from the Heart Section Content (Left Pane)
INSERT INTO section_content (
    section_id,
    eyebrow,
    heading,
    gap,
    created_at,
    updated_at
)
SELECT
    id,
    'A SPIRITUAL TRIBE',
    'Giving from the Heart: Supporting a Spiritual Community & Serving a New World',
    '32px',
    NOW(),
    NOW()
FROM page_sections
WHERE page_slug = 'donate' AND section_slug = 'giving-from-heart';

-- General Fund Section Content
INSERT INTO section_content (
    section_id,
    eyebrow,
    heading,
    description,
    content,
    created_at,
    updated_at
)
SELECT
    id,
    'Custom',
    'Donate to the general fund',
    'Your contribution to the General Fund supports the lifeblood of the Ashram—helping us meet immediate needs, sustain daily operations, and remain responsive and resilient in these times of rapid change. This fund ensures that the whole organism of our community can continue to thrive, serve, and radiate peace to the world.

We thank you for your generosity, and we know that it will bring you many blessings.',
    '{"presetAmounts": [25, 77, 108, 250, 500, 1000], "suggestedText": "Suggested donations:", "orText": "Or", "supportingText": "Or become a sustaining supporter. Set up a monthly donation of any amount and help us build lasting strength and stability.", "donationTypes": ["one-time", "monthly", "yearly"]}'::jsonb,
    NOW(),
    NOW()
FROM page_sections
WHERE page_slug = 'donate' AND section_slug = 'general-fund';

-- Quote Section Content
INSERT INTO section_content (section_id, quote, created_at, updated_at)
SELECT
    id,
    'The joy of sharing and serving, living on simplicity, brings abundance. Help us demonstrate solutions that can be emulated globally to co-create our harmony with Nature.',
    NOW(),
    NOW()
FROM page_sections
WHERE page_slug = 'donate' AND section_slug = 'quote';

-- ============================================================================
-- 3. ACCORDION SECTION (for Bullet Points in Giving from Heart)
-- ============================================================================

INSERT INTO accordion_sections (
    page_slug,
    section_slug,
    title,
    description,
    tagline,
    type,
    gap,
    title_line_height,
    background_elements,
    order_index,
    created_at
)
VALUES (
    'donate',
    'giving-from-heart',
    NULL,
    NULL,
    NULL,
    'bulletaccordion',
    '32px',
    NULL,
    NULL,
    1,
    NOW()
)
RETURNING id;

-- ============================================================================
-- 4. ACCORDION ITEMS (Bullet Points)
-- ============================================================================

-- Bullet Point 1: A Spiritual Tribe
INSERT INTO accordion_items (
    accordion_section_id,
    item_id,
    title,
    heading,
    content,
    paragraphs,
    order_index,
    created_at
)
SELECT
    id,
    0,
    'A Spiritual Tribe',
    NULL,
    'Since the origin of culture, living in a spiritual community has been an honored way of life—one that fosters healing, wisdom, and the remembrance of divine purpose. Now, as our beloved planet descends into ever-deeper chaos and conflict, souls across the Earth are awakening to the urgent need to gather in sanctuaries of peace, to forge new ways of being rooted in Truth, and to co-create communities of harmony and sacred sustainability.

The Sat Yoga Ashram stands as such a refuge—a model of spiritual living both onsite and online. It serves as a beacon for seekers who come to heal, to learn, to awaken, and to offer their lives in service of the Supreme Good. From this mountaintop sanctuary, and through our growing global network, we are building a planetary tribe of awakened beings committed to radiating Light and Love into a world in crisis.',
    NULL,
    0,
    NOW()
FROM accordion_sections
WHERE page_slug = 'donate' AND section_slug = 'giving-from-heart';

-- Bullet Point 2: Giving from the Heart
INSERT INTO accordion_items (
    accordion_section_id,
    item_id,
    title,
    heading,
    content,
    paragraphs,
    order_index,
    created_at
)
SELECT
    id,
    1,
    'Giving from the Heart',
    NULL,
    'The word "donation" comes from the Sanskrit Dana—giving from the Heart. Since time immemorial, wisdom schools have relied upon such heartfelt generosity to sustain and transmit their teachings. In these times of civilizational collapse, your Dana is more vital than ever. It enables us to nourish this sacred ground, extend our global reach, and continue offering transformational teachings, healing, and inspiration to all who seek the Way.',
    NULL,
    1,
    NOW()
FROM accordion_sections
WHERE page_slug = 'donate' AND section_slug = 'giving-from-heart';

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all sections were created
SELECT ps.id, ps.page_slug, ps.section_slug, ps.section_type, ps.order_index
FROM page_sections ps
WHERE ps.page_slug = 'donate'
ORDER BY ps.order_index;

-- Check content was created
SELECT sc.id, ps.section_slug, sc.eyebrow, LEFT(sc.heading, 50) as heading_preview
FROM section_content sc
JOIN page_sections ps ON sc.section_id = ps.id
WHERE ps.page_slug = 'donate';

-- Check accordion items were created
SELECT ai.id, ai.item_id, ai.title, LEFT(ai.content, 80) as content_preview
FROM accordion_items ai
JOIN accordion_sections asec ON ai.accordion_section_id = asec.id
WHERE asec.page_slug = 'donate'
ORDER BY ai.order_index;
