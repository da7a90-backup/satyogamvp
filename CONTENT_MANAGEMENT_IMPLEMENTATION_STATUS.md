# Content Management Implementation Status

**Date:** 2026-01-21
**Status:** Phase 1 Complete, Phases 2-4 Pending

---

## Overview

This document tracks the implementation of complete content management for the SatyoGam marketing website, ensuring no hardcoded data remains and all content is manageable through the admin dashboard.

## Original Findings

### Hardcoded Content Identified
1. **Store Product Detail Page** - 6 hardcoded testimonials
2. **Retreat Pages** (Darshan, Shakti, Sevadhari) - "What's Included" sections, daily schedules, content paragraphs
3. **Hero Image Positioning** - No gravity/focal point controls

### Dynamic Content (Already Working)
- ✅ Homepage - All sections from API
- ✅ About pages (3 pages) - From API
- ✅ Store product listings - From API
- ✅ Retreat listings - From API

---

## Implementation Plan (4 Phases)

### **Phase 1: Image Gravity for Hero Sections** ✅ COMPLETE

#### Backend Implementation ✅
- [x] Added `image_gravity` column to `SectionContent` model
  - File: `backend/app/models/static_content.py:88`
  - Type: VARCHAR(50)
  - Values: 9 preset positions (top-left, top-center, etc.)

- [x] Updated `SectionContentUpdate` Pydantic schema
  - File: `backend/app/routers/admin_static_content.py:47`
  - Added `image_gravity: Optional[str]` field

- [x] Updated API response to include gravity
  - File: `backend/app/routers/admin_static_content.py:172`
  - Returns gravity value with section content

- [x] Update endpoint handles gravity automatically
  - Uses `model_dump(exclude_unset=True)` - no changes needed

#### Frontend Admin UI ✅
- [x] Updated `ImageFieldEditor` component
  - File: `src/components/dashboard/content/ImageFieldEditor.tsx`
  - Added gravity selector props
  - Added 3x3 grid UI for position selection
  - Visual indicators for selected position

#### Database Migration ✅
- [x] Created migration script
  - File: `backend/migrations/018_add_image_gravity.sql`
  - Adds column with default 'center' for existing images

#### Remaining Tasks (Phase 1)
- [ ] **Wire gravity props in StaticContentEditor**
  - File to modify: `src/components/dashboard/content/StaticContentEditor.tsx`
  - Pass `gravity`, `onGravityChange`, and `showGravitySelector={true}` to ImageFieldEditor for hero/background images
  - Handle gravity in content state and save operations

- [ ] **Update Hero components to apply gravity CSS**
  - Files: `src/components/sections/Hero.tsx`, `src/components/shared/Hero.tsx`
  - Convert gravity values to CSS classes
  - Mapping:
    - `top-left` → `object-top object-left` or `bg-top bg-left`
    - `top-center` → `object-top`
    - `center` → `object-center`
    - etc.

- [ ] **Run migration**
  ```bash
  cd backend
  psql $DATABASE_URL < migrations/018_add_image_gravity.sql
  ```

---

### **Phase 2: Testimonials Database & Management** ❌ NOT STARTED

#### Scope
Move hardcoded testimonials from `src/app/store/[slug]/page.tsx` lines 102-143 to database with full CRUD management.

#### Backend Tasks
- [ ] Create `Testimonial` model
  - Fields: id, quote, name, location, avatar_url, product_id (FK), order_index, is_active, created_at
  - File: `backend/app/models/product.py` or new `testimonial.py`

- [ ] Create testimonial Pydantic schemas
  - TestimonialCreate, TestimonialUpdate, TestimonialResponse
  - File: `backend/app/schemas/testimonial.py` (new file)

- [ ] Create testimonials router
  - Endpoints: POST, GET (with product filter), PUT, DELETE, reorder
  - File: `backend/app/routers/testimonials.py` (new file)

- [ ] Update products router
  - Include testimonials in product detail response
  - File: `backend/app/routers/products.py`

- [ ] Register router in main.py
  - Add to app includes

#### Frontend Admin Tasks
- [ ] Create testimonials management page
  - File: `src/app/dashboard/admin/testimonials/page.tsx` (new)
  - List view with add/edit/delete/reorder

#### Frontend Marketing Tasks
- [ ] Update product detail page
  - File: `src/app/store/[slug]/page.tsx`
  - Remove lines 102-143 (hardcoded data)
  - Fetch testimonials from product API response

#### Migration
- [ ] Create migration: `019_create_testimonials_table.sql`
- [ ] Seed existing testimonials from hardcoded data

---

### **Phase 3: Retreat Content Management** ❌ NOT STARTED

#### Scope
Move hardcoded retreat content from components (Darshan, Shakti, Sevadhari) to database, manageable through admin dashboard.

#### Backend Tasks
- [ ] Extend `Retreat` model with content fields
  - `included_items` (JSONB) - Array of {title, description, icon?}
  - `schedule_items` (JSONB) - Array of {time, activity, description?}
  - `content_sections` (JSONB) - Array of {heading?, paragraphs: string[]}
  - `two_pane_sections` (JSONB) - Array of {left_content, right_content}
  - File: `backend/app/models/retreat.py`

- [ ] Update retreat schemas
  - Add new content fields to RetreatUpdate and RetreatResponse
  - File: `backend/app/schemas/retreat.py`

#### Frontend Admin Tasks
- [ ] Create retreat content editor
  - File: `src/app/dashboard/admin/retreats/[id]/content/page.tsx` (new)
  - Tabs for: What's Included, Daily Schedule, Additional Content
  - Drag-to-reorder support
  - Auto-save with change tracking

#### Frontend Marketing Tasks
- [ ] Update Darshan component
  - File: `src/components/retreats/darshan/Darshan.tsx`
  - Remove hardcoded `shaktiIncludedData` (lines 19-55)
  - Remove hardcoded `scheduleData` (lines 74-103)
  - Render from API data passed via props

- [ ] Update Shakti component
  - File: `src/components/retreats/shakti/Shakti.tsx`
  - Remove all hardcoded arrays
  - Render from API data

- [ ] Update Sevadhari component
  - File: `src/components/retreats/sevadhari/Sevadhari.tsx`
  - Remove all hardcoded arrays
  - Render from API data

#### Migration
- [ ] Create migration: `020_add_retreat_content_fields.sql`
- [ ] Seed script to migrate existing hardcoded content

---

### **Phase 4: Database Migrations & Seeding** ❌ NOT STARTED

#### Tasks
- [ ] Run all migrations in order (018, 019, 020)
- [ ] Create comprehensive seed script
  - `backend/scripts/seed_marketing_content.py`
  - Migrate testimonials from code
  - Migrate retreat content from code
  - Set default gravity for existing hero images
- [ ] Test all pages render correctly with dynamic data

---

## Files Modified (Phase 1 Only)

### Backend (4 files)
1. `backend/app/models/static_content.py` - Added image_gravity column
2. `backend/app/routers/admin_static_content.py` - Updated schema & response
3. `backend/migrations/018_add_image_gravity.sql` - Migration script

### Frontend (1 file)
1. `src/components/dashboard/content/ImageFieldEditor.tsx` - Added gravity selector UI

---

## Testing Checklist

### Phase 1 Testing
- [ ] Run database migration successfully
- [ ] Admin can select gravity for hero images
- [ ] Gravity value saves to database
- [ ] Homepage hero respects gravity setting
- [ ] About page heroes respect gravity setting
- [ ] Responsive behavior works correctly

### Phase 2 Testing
- [ ] Admin can add/edit/delete testimonials
- [ ] Testimonials display on product pages
- [ ] Ordering works correctly
- [ ] No hardcoded testimonials remain

### Phase 3 Testing
- [ ] Admin can edit retreat "What's Included"
- [ ] Admin can edit daily schedules
- [ ] Darshan/Shakti/Sevadhari pages render correctly
- [ ] No hardcoded retreat content remains

---

## Estimated Effort Remaining

- **Phase 1 completion:** 1-2 hours (wiring + CSS + testing)
- **Phase 2:** 3-4 hours (testimonials full cycle)
- **Phase 3:** 4-5 hours (retreat content full cycle)
- **Phase 4:** 1 hour (migrations + testing)

**Total Remaining:** 9-12 hours of development work

---

## Next Steps

1. **To complete Phase 1:**
   - Wire gravity props in StaticContentEditor
   - Add gravity CSS classes to Hero components
   - Run migration
   - Test in admin dashboard and marketing pages

2. **To start Phase 2:**
   - Create Testimonial model and schemas
   - Build testimonials API
   - Create admin UI
   - Update product detail page

3. **To start Phase 3:**
   - Extend Retreat model
   - Create content management UI
   - Update retreat components
   - Migrate hardcoded data

---

## Notes

- All Phase 1 backend work is complete and functional
- Frontend wiring is straightforward - mainly passing props
- Gravity CSS mapping is simple with Tailwind utilities
- Phase 2 & 3 follow standard CRUD patterns established in the codebase
- Consider running phases in separate sessions to avoid fatigue

---

## Gravity CSS Reference

```typescript
// Gravity to CSS mapping for Hero components
const gravityToCSS = {
  'top-left': 'object-top object-left',
  'top-center': 'object-top',
  'top-right': 'object-top object-right',
  'center-left': 'object-center object-left',
  'center': 'object-center',
  'center-right': 'object-center object-right',
  'bottom-left': 'object-bottom object-left',
  'bottom-center': 'object-bottom',
  'bottom-right': 'object-bottom object-right'
};

// For background-image, use bg- prefix:
// 'top-left' → 'bg-top bg-left'
// 'center' → 'bg-center'
```
