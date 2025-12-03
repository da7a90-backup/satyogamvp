# Sat Yoga Platform - System Architecture

## Overview
Hybrid backend architecture with clear separation between content management and application logic.

## Architecture Components

### 1. Frontend Layer
- **Technology**: Next.js 15 (App Router)
- **Responsibilities**:
  - Server-side rendering
  - Client-side interactions
  - API consumption
  - Analytics tracking (Mixpanel, GA4)

### 2. Content Management (Strapi)
- **Purpose**: Marketing site content
- **Managed Content**:
  - Hero sections
  - About pages
  - Intro text
  - Static page content
  - Blog posts (content only)

### 3. Application Backend (FastAPI)
- **Purpose**: Business logic & dynamic data
- **Base URL**: `http://localhost:8000`
- **Managed Data**:
  - Users & Authentication
  - Memberships & Subscriptions
  - Teachings (metadata & access control)
  - Courses & Progress
  - Retreats & Registrations
  - Events & Calendar
  - Payments & Orders
  - Products & Store
  - Comments & Interactions
  - Email Marketing & Automation
  - Analytics & Tracking

## Database Schema

### Core Entities

#### User Management
```python
User
├── id (UUID)
├── email (unique)
├── name
├── password_hash
├── membership_tier (enum: FREE, PRAGYANI, PRAGYANI_PLUS)
├── membership_start_date
├── membership_end_date
├── is_active
├── is_admin
├── created_at
└── updated_at

UserProfile
├── user_id (FK)
├── phone
├── address
├── bio
├── avatar_url
└── preferences (JSON)
```

#### Membership System
```python
MembershipTier (enum)
├── FREE
├── PRAGYANI
└── PRAGYANI_PLUS

Subscription
├── id
├── user_id (FK)
├── tier
├── status (active, cancelled, expired)
├── start_date
├── end_date
├── payment_id (FK)
├── auto_renew
└── created_at
```

#### Teachings
```python
Teaching
├── id
├── slug (unique)
├── title
├── description
├── content_type (video, audio, essay, meditation)
├── access_level (free, preview, pragyani, pragyani_plus)
├── preview_duration (seconds, for videos)
├── video_url
├── audio_url
├── text_content (markdown)
├── thumbnail_url
├── duration
├── published_date
├── category
├── tags (JSON)
├── view_count
└── created_at

TeachingAccess (tracking)
├── id
├── user_id (FK)
├── teaching_id (FK)
├── accessed_at
└── duration_watched
```

#### Courses
```python
Course
├── id
├── slug (unique)
├── title
├── description
├── price
├── instructor_id (FK)
├── thumbnail_url
├── is_published
├── difficulty_level
└── created_at

CourseClass
├── id
├── course_id (FK)
├── title
├── description
├── order_index
├── video_url
├── duration
├── materials (JSON)
└── created_at

CourseComponent
├── id
├── class_id (FK)
├── type (video, audio, text, assignment, quiz)
├── title
├── content
├── order_index
└── created_at

CourseEnrollment
├── id
├── user_id (FK)
├── course_id (FK)
├── enrolled_at
├── completed_at
├── payment_id (FK)
└── status

CourseProgress
├── id
├── enrollment_id (FK)
├── class_id (FK)
├── component_id (FK)
├── completed
├── progress_percentage
├── last_accessed
└── time_spent

CourseComment
├── id
├── user_id (FK)
├── course_id (FK)
├── class_id (FK)
├── content
├── created_at
└── updated_at

Instructor
├── id
├── name
├── bio
├── photo_url
└── created_at
```

#### Retreats
```python
Retreat
├── id
├── slug (unique)
├── title
├── description
├── type (online, onsite_darshan, onsite_shakti, onsite_sevadhari)
├── start_date
├── end_date
├── price_lifetime
├── price_limited (12-day access)
├── location
├── max_participants
├── is_published
└── created_at

RetreatPortal
├── id
├── retreat_id (FK)
├── title
├── description
├── content (JSON - videos, materials, etc.)
└── created_at

RetreatRegistration
├── id
├── user_id (FK)
├── retreat_id (FK)
├── access_type (lifetime, limited_12day)
├── payment_id (FK)
├── registered_at
├── access_expires_at
└── status
```

#### Events & Calendar
```python
Event
├── id
├── title
├── description
├── type (satsang, book_group, live_event, retreat)
├── start_datetime
├── end_datetime
├── location (physical/online)
├── is_recurring
├── recurrence_rule (JSON)
├── max_participants
└── created_at

UserCalendar
├── id
├── user_id (FK)
├── event_id (FK)
├── retreat_id (FK, nullable)
├── added_at
└── reminded_at
```

#### Store & Products
```python
Product
├── id
├── slug (unique)
├── title
├── description
├── type (audio, video, audio_video, audio_video_text, retreat_portal_access)
├── price
├── digital_content_url
├── thumbnail_url
├── retreat_id (FK, nullable - for portal access)
├── is_available
└── created_at

Order
├── id
├── user_id (FK)
├── total_amount
├── status (pending, completed, cancelled, refunded)
├── payment_id (FK)
├── created_at
└── updated_at

OrderItem
├── id
├── order_id (FK)
├── product_id (FK)
├── quantity
├── price_at_purchase
└── created_at

UserProductAccess
├── id
├── user_id (FK)
├── product_id (FK)
├── order_id (FK)
├── granted_at
└── expires_at (nullable)
```

#### Payments (Tilopay)
```python
Payment
├── id
├── user_id (FK)
├── amount
├── currency
├── payment_method
├── tilopay_transaction_id
├── tilopay_order_id
├── status (pending, completed, failed, refunded)
├── payment_type (donation, membership, course, retreat, product)
├── reference_id (course_id, retreat_id, etc.)
├── created_at
└── updated_at
```

#### Blog
```python
Blog
├── id
├── slug (unique)
├── title
├── content (markdown)
├── excerpt
├── author_id (FK to User)
├── category
├── tags (JSON)
├── featured_image
├── is_published
├── published_at
└── created_at
```

#### Forms & Applications
```python
Application
├── id
├── user_id (FK, nullable)
├── type (retreat_onsite, scholarship, contact)
├── form_data (JSON)
├── status (pending, reviewed, approved, rejected)
├── submitted_at
└── reviewed_at

ContactSubmission
├── id
├── name
├── email
├── topic
├── message
├── submitted_at
└── responded_at
```

#### Email Marketing
```python
NewsletterSubscriber
├── id
├── email (unique)
├── name
├── user_id (FK, nullable)
├── subscribed_at
├── unsubscribed_at
├── status (active, unsubscribed, bounced)
└── tags (JSON)

EmailTemplate
├── id
├── name
├── subject
├── beefree_template_id
├── beefree_json (JSON)
├── html_content
├── variables (JSON - list of template variables)
└── created_at

EmailCampaign
├── id
├── name
├── template_id (FK)
├── subject
├── from_name
├── from_email
├── segment_filter (JSON)
├── status (draft, scheduled, sent)
├── scheduled_at
├── sent_at
└── created_at

EmailAutomation
├── id
├── name
├── trigger_type (mixpanel_event, user_action, time_based)
├── trigger_config (JSON)
├── template_id (FK)
├── delay_minutes
├── is_active
└── created_at

EmailSent
├── id
├── campaign_id (FK, nullable)
├── automation_id (FK, nullable)
├── subscriber_id (FK)
├── template_id (FK)
├── sent_at
├── opened_at
├── clicked_at
└── status
```

#### Analytics
```python
AnalyticsEvent
├── id
├── user_id (FK, nullable)
├── event_name
├── event_properties (JSON)
├── mixpanel_event_id
├── created_at
└── ip_address

UserAnalytics
├── id
├── user_id (FK)
├── total_donations
├── total_spent
├── courses_enrolled
├── courses_completed
├── retreats_attended
├── last_active_at
└── updated_at
```

## API Endpoints Structure

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users/{id}/analytics`

### Memberships
- `GET /api/memberships/tiers`
- `POST /api/memberships/subscribe`
- `PUT /api/memberships/cancel`
- `GET /api/memberships/current`

### Teachings
- `GET /api/teachings` (filtered by user access level)
- `GET /api/teachings/{slug}`
- `POST /api/teachings/{id}/access` (track viewing)
- `GET /api/teachings/favorites`
- `POST /api/teachings/{id}/favorite`

### Courses
- `GET /api/courses`
- `GET /api/courses/{slug}`
- `POST /api/courses/{id}/enroll`
- `GET /api/courses/{id}/progress`
- `PUT /api/courses/{id}/progress`
- `GET /api/courses/{id}/classes`
- `GET /api/courses/{id}/classes/{class_id}`
- `POST /api/courses/{id}/comments`

### Retreats
- `GET /api/retreats`
- `GET /api/retreats/{slug}`
- `POST /api/retreats/{id}/register`
- `GET /api/retreats/{id}/portal` (access controlled)
- `GET /api/retreats/my-registrations`

### Store
- `GET /api/products`
- `GET /api/products/{slug}`
- `POST /api/orders`
- `GET /api/orders/{id}`
- `GET /api/orders/my-orders`
- `GET /api/products/my-library`

### Calendar
- `GET /api/events`
- `GET /api/events/{id}`
- `GET /api/calendar/my-events`
- `POST /api/calendar/add-event`

### Payments (Tilopay)
- `POST /api/payments/create`
- `POST /api/payments/callback` (webhook)
- `GET /api/payments/{id}/status`

### Email Marketing
- `POST /api/newsletter/subscribe`
- `POST /api/newsletter/unsubscribe`
- `GET /api/admin/email/templates`
- `POST /api/admin/email/campaigns`
- `POST /api/admin/email/automations`

### Admin
- `GET /api/admin/courses`
- `POST /api/admin/courses`
- `PUT /api/admin/courses/{id}`
- `DELETE /api/admin/courses/{id}`
- `GET /api/admin/teachings`
- `POST /api/admin/teachings`
- `GET /api/admin/analytics`
- `GET /api/admin/users`

### Forms
- `POST /api/forms/contact`
- `POST /api/forms/application`

## Integration Points

### Tilopay Payment Gateway
- **Documentation**: https://docs.tilopay.com/
- **API Key Management**: Environment variables
- **Payment Flow**:
  1. Frontend creates payment intent
  2. Backend generates Tilopay order
  3. User redirects to Tilopay checkout
  4. Tilopay webhook confirms payment
  5. Backend updates order status
  6. Grant access to purchased item

### Mixpanel Analytics
- **Client-side**: Track user interactions
- **Server-side**: Track backend events
- **Key Events**:
  - Page views
  - Teaching views
  - Course enrollments
  - Payment completions
  - Feature usage
  - Signup/Login

### Google Analytics 4
- **Purpose**: User profiles, conversions
- **Tracked Metrics**:
  - User demographics
  - Donation tracking
  - Subscription conversions
  - E-commerce events

### SendGrid Email
- **API**: Transactional + Marketing emails
- **Features**:
  - Welcome emails
  - Newsletter
  - Automated campaigns
  - Event-triggered emails

### Beefree.io Templates
- **Integration**: Import/export JSON
- **Workflow**:
  1. Design in Beefree.io
  2. Export JSON + HTML
  3. Store in EmailTemplate
  4. Render with user variables

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/satyoga

# Auth
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Tilopay
TILOPAY_API_KEY=your-api-key
TILOPAY_MERCHANT_KEY=your-merchant-key
TILOPAY_WEBHOOK_SECRET=your-webhook-secret
TILOPAY_BASE_URL=https://api.tilopay.com/v1

# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_KEY=your-strapi-key

# Analytics
MIXPANEL_TOKEN=your-mixpanel-token
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your-ga4-secret

# Email
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@satyoga.org
FROM_NAME=Sat Yoga Institute

# Beefree
BEEFREE_CLIENT_ID=your-client-id
BEEFREE_CLIENT_SECRET=your-client-secret

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## Deployment Strategy

### Development
- Frontend: `localhost:3000`
- FastAPI: `localhost:8000`
- Strapi: `localhost:1337`
- PostgreSQL: `localhost:5432`

### Production
- Frontend: Vercel
- FastAPI: Railway/Render/DigitalOcean
- Strapi: Railway/Render
- PostgreSQL: Managed service (Supabase/Neon)

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (user, admin)
3. **Payment Security**: Webhook signature verification
4. **Data Protection**: Encrypted sensitive data
5. **Rate Limiting**: Prevent abuse
6. **CORS**: Configured for Next.js domain
7. **SQL Injection**: Parameterized queries via SQLAlchemy
8. **XSS Protection**: Content sanitization

## Next Steps

1. Initialize FastAPI project structure
2. Set up PostgreSQL database
3. Create SQLAlchemy models
4. Implement authentication
5. Build core API endpoints
6. Integrate payment gateway
7. Set up analytics tracking
8. Implement email marketing system
9. Update Next.js to consume APIs
10. Deploy and test
