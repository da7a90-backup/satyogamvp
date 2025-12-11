# SatyoGam Platform Completion Plan

## Executive Summary

Based on comprehensive codebase analysis:
- **Static Content**: Already 100% in FastAPI backend - NO Strapi migration needed
- **User Dashboard**: 60% complete (teachings done, courses need migration from Strapi)
- **Admin Dashboard**: 11% complete (only blog & courses functional, 16 major sections missing)
- **Critical Path**: Migrate courses → Fix user dashboard → Build admin management UIs

---

## 1. STATIC CONTENT DECISION: **KEEP IN BACKEND - NO STRAPI**

**Recommendation: Do NOT migrate to Strapi. Keep current PostgreSQL + Admin UI approach.**

**Rationale:**
- All static content already in FastAPI backend with full CRUD endpoints
- 11 content types fully implemented (pages, FAQs, membership, donations, contact, blog, online retreats)
- Cloudflare CDN integration working
- Only missing: Admin UIs to manage the content (which we need anyway)

**Action Items:**
1. Build admin UI for static content management (homepage, about, FAQs, etc.) - **2-3 days**
2. Skip Strapi entirely - no migration needed

---

## 2. COURSES MIGRATION PLAN (Strapi → Backend)

**Current State:**
- Backend: 80% ready (models ✓, core routes ✓, missing: admin CRUD, comments)
- Frontend: 100% Strapi-dependent

**Migration Steps (Priority 1 - 3-4 days):**

### Phase A: Backend Completion (1 day)
1. Add admin endpoints to `courses.py`:
   - `POST /api/courses/` - Create course
   - `PUT /api/courses/{id}` - Update course
   - `DELETE /api/courses/{id}` - Delete course
   - `POST /api/courses/{id}/classes` - Add class
   - `PUT /api/courses/{id}/classes/{class_id}` - Update class
   - Admin-only decorators with `get_current_admin` dependency

2. Add comments endpoint:
   - `GET /api/courses/{id}/comments`
   - `POST /api/courses/{id}/comments`

### Phase B: Frontend API Layer (1 day)
3. Update `src/lib/courseApi.ts` to call FastAPI instead of Strapi:
   - Replace all Strapi URLs with `${FASTAPI_URL}/api/courses`
   - Transform response schemas to match existing frontend interfaces
   - Update auth headers from Strapi JWT to FastAPI JWT

### Phase C: Component Updates (1-2 days)
4. Update user components:
   - `CoursesClient.tsx` - Use new API
   - `CourseDetailPage.tsx` - Use new API
   - `ClassVideoComponent.tsx` - Update video URL handling

5. Update admin components:
   - `CourseForm.tsx` - Use new create/update endpoints
   - `CourseIndex.tsx` - Use new list endpoint

6. Test enrollment, progress tracking, and video playback

**Result:** Complete Strapi removal for courses - **saves hosting costs**

---

## 3. USER DASHBOARD COMPLETION PLAN (2-3 days)

**Already Complete:**
- ✓ Teachings library with favorites/history
- ✓ Teaching detail viewer with access control
- ✓ Purchases/retreat portal viewer

**Needs Completion:**

### A. Main Dashboard (1 day)
**File:** `src/components/dashboard/UserDashboard.tsx`

**Current:** 100% mock data

**Action:**
1. Create new endpoint: `GET /api/users/dashboard` returning:
   - Quote of the week
   - Live/upcoming events (from events table)
   - Featured teaching
   - Continue watching (from teaching history)
   - Recent publications (from blog)
   - User's calendar events

2. Update `UserDashboard.tsx` to fetch real data
3. Remove all hardcoded mockData

### B. Settings Pages (1 day)
1. **Profile Settings** - Connect to `PUT /api/users/profile`
2. **Billing Settings** - Create endpoint `GET /api/users/billing-info` (current membership, payment history)
3. **Notifications** - Create endpoint for preferences

### C. Membership Access Polish (0.5 days)
1. Fix membership payment flow in `payments.py` webhook handler
2. Add membership upgrade logic to `grant_access_after_payment()`
3. Test access control for different tier teachings

**Result:** Fully functional user dashboard with zero mock data

---

## 4. ADMIN DASHBOARD COMPLETION PLAN (10-12 days)

**Strategy: Build high-value admin pages first, prioritize CRUD over analytics**

### Priority 1: Content Management (3-4 days)

**A. Teachings Management** (1.5 days)
- Page: `/dashboard/admin/library/teachings`
- Features: List, create, edit, delete teachings; set access levels; upload media
- Backend: Already exists, just needs UI

**B. Static Content Management** (1.5 days)
- Pages: `/dashboard/admin/content/homepage`, `/about`, `/faqs`, `/membership`
- Features: Edit page sections, manage FAQs, update membership tiers
- Backend: Already exists via `static_pages.py` router

**C. Retreat Management** (1 day)
- Page: `/dashboard/admin/retreats`
- Features: Create/edit retreats, manage registrations, portal content
- Backend: Need to add admin CRUD endpoints

### Priority 2: E-Commerce Management (2-3 days)

**D. Products/Store** (1.5 days)
- Page: `/dashboard/admin/products`
- Features: CRUD for products, categories, inventory
- Backend: Add POST/PUT/DELETE endpoints to `products.py`

**E. Orders & Transactions** (1.5 days)
- Pages: `/dashboard/admin/sales/orders`, `/transactions`
- Features: View orders, payment history, refund management
- Backend: Expand `payments.py` with admin query endpoints

### Priority 3: User & Access Management (2 days)

**F. User Management** (1 day)
- Page: `/dashboard/admin/users`
- Features: List users, view profiles, edit membership tiers
- Backend: Create `GET /api/admin/users`, `PUT /api/admin/users/{id}/membership`

**G. Forms & Applications** (1 day)
- Pages: `/dashboard/admin/forms/retreat-applications`, `/contact`
- Features: View submissions, update status, respond
- Backend: Add `GET /api/forms/applications`, `GET /api/forms/contact-submissions`

### Priority 4: Email Marketing (2-3 days)

**H. Email Campaigns** (2 days)
- Page: `/dashboard/admin/email/campaigns`
- Features: Create campaigns, select segments, schedule, track performance
- Backend: Build full email campaign router with:
  - `POST /api/email/campaigns` - Create
  - `GET /api/email/campaigns` - List with stats
  - `POST /api/email/campaigns/{id}/send` - Execute
  - Mixpanel segment filtering
  - SendGrid bulk send integration

**I. Email Automation** (1 day)
- Page: `/dashboard/admin/email/automations`
- Features: Create event-triggered sequences (e.g., "new member welcome")
- Backend: Build automation trigger evaluation engine

### Priority 5: Analytics Dashboard (2 days)

**J. Analytics Overview** (1 day)
- Page: `/dashboard/admin/analytics`
- Features: Revenue charts, user growth, engagement metrics
- Backend: Create `GET /api/admin/analytics/dashboard` aggregating:
  - Total revenue by period
  - User signups by period
  - Teaching views, course enrollments
  - Top content

**K. Event Management** (1 day)
- Page: `/dashboard/admin/events/calendar`
- Features: Create/edit events, manage event types, registrations
- Backend: Add admin CRUD to `events.py`

---

## 5. MIXPANEL EMAIL AUTOMATION PLAN (Integrated Above)

**Architecture:**

```
User Action → Mixpanel Event → Backend Webhook → Check Automations → Trigger Email Sequence
```

**Implementation (included in Priority 4):**

1. **Mixpanel Webhook Endpoint** (0.5 days)
   - `POST /api/webhooks/mixpanel` - Receive events
   - Match events to active automations
   - Queue email sends

2. **Automation Engine** (1 day)
   - Database: Use existing `EmailAutomation` model
   - Trigger types: Event-based, Time-based, Segment-based
   - Action types: Send email, Add tag, Update property
   - Delay support (send X days after trigger)

3. **Segment Builder** (0.5 days)
   - Filter users by: membership tier, engagement level, teaching views, course enrollments
   - Save segments for campaign targeting

**Example Automations:**
- User completes retreat application → Send confirmation email
- User upgrades to PRAGYANI → Send welcome email with exclusive content
- User inactive 30 days → Send re-engagement email

---

## 6. ADDITIONAL FEATURES STATUS & PLAN

### A. Online Retreat Portal ✓ **COMPLETE**
- Backend: Fully functional with access control
- Frontend: PortalViewer.tsx working
- **Action:** None needed

### B. Ask Shunyamurti ✗ **NOT STARTED**
- **Scope:** Q&A submission and admin moderation system
- **Effort:** 2 days (backend model + routes + admin UI + user form)
- **Priority:** Medium (defer to Phase 2)

### C. Book Groups ✗ **PARTIAL**
- **Current:** Event type exists, store category exists
- **Missing:** Dedicated book group model, discussion system
- **Effort:** 3 days (model + routes + admin + user pages)
- **Priority:** Low (defer to Phase 2)

---

## 7. CRITICAL BUG FIXES (0.5 days)

**Must fix before dashboard work:**
1. Membership payment flow - Add MEMBERSHIP case to `grant_access_after_payment()` ✓
2. Teaching access preview duration - Enforce server-side ✓

---

## 8. TIMELINE SUMMARY

### Phase 1: Foundation (Week 1 - 5 days)
- Day 1: Courses backend completion
- Day 2: Courses frontend migration
- Day 3: User dashboard real data integration
- Day 4-5: Bug fixes + testing

**Milestone:** User dashboard 100% complete, courses migrated from Strapi

### Phase 2: Admin Content Management (Week 2 - 5 days)
- Day 1-2: Teachings management UI
- Day 3: Static content management UI
- Day 4-5: Retreat management UI

**Milestone:** Core content management complete

### Phase 3: E-Commerce & Users (Week 3 - 4 days)
- Day 1-2: Products & orders management
- Day 3-4: User management & forms viewer

**Milestone:** E-commerce admin functional

### Phase 4: Marketing & Analytics (Week 4 - 4 days)
- Day 1-3: Email campaigns & automation
- Day 4: Analytics dashboard & event management

**Milestone:** Full marketing automation operational

**Total Time: 18-20 business days (4 weeks)**

---

## 9. RECOMMENDED EXECUTION ORDER

**Sprint 1 (Highest ROI):**
1. Migrate courses from Strapi (unlock independent operation)
2. Complete user dashboard (improve user experience)
3. Fix membership payment flow (unlock revenue)

**Sprint 2 (Content Control):**
4. Build teachings admin UI (manage library)
5. Build static content admin UI (update marketing pages)
6. Build retreat admin UI (manage events)

**Sprint 3 (Revenue Operations):**
7. Build products/orders admin (manage store)
8. Build user management (support operations)
9. Build forms viewer (process applications)

**Sprint 4 (Growth Engine):**
10. Build email campaigns (marketing)
11. Build email automation (retention)
12. Build analytics dashboard (insights)

---

## 10. STRAPI SUNSET PLAN

**After courses migration:**
1. Export any remaining Strapi data (if any)
2. Shut down Strapi instance
3. Remove `NEXT_PUBLIC_STRAPI_URL` from environment
4. Remove `src/lib/api.ts` (legacy Strapi integration)
5. Remove Strapi dependencies from package.json

**Cost Savings:** Eliminate Strapi hosting costs (~$15-50/month)

---

## Key Decisions Summary

✅ **Keep static content in PostgreSQL** - No Strapi migration
✅ **Migrate courses to backend** - Critical path item
✅ **Build admin UIs** - Faster than Strapi integration
✅ **Mixpanel + SendGrid** - Email automation stack
✅ **Defer Ask Shunyamurti & Book Groups** - Phase 2 features

**This plan delivers a fully operational platform in 4 weeks with zero Strapi dependency.**
