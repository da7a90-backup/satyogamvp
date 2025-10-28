# Sat Yoga Backend API

FastAPI backend for the Sat Yoga platform with Tilopay payment integration, Mixpanel analytics, and SendGrid email marketing.

## 🏗️ Architecture

This backend uses a **hybrid architecture**:
- **Strapi**: Content management for marketing site (hero sections, about pages, etc.)
- **FastAPI**: Business logic and dynamic data (users, courses, teachings, payments)
- **PostgreSQL/SQLite**: Database for application data
- **Tilopay**: Payment gateway integration
- **Mixpanel**: User interaction analytics
- **Google Analytics 4**: User profiles and conversion tracking
- **SendGrid**: Email delivery and marketing automation

## 📦 Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Settings and environment variables
│   │   ├── database.py        # Database configuration
│   │   ├── security.py        # JWT and password hashing
│   │   └── deps.py            # FastAPI dependencies
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py
│   │   ├── teaching.py
│   │   ├── course.py
│   │   ├── retreat.py
│   │   ├── payment.py
│   │   ├── email.py
│   │   └── ...
│   ├── schemas/               # Pydantic schemas
│   │   └── user.py
│   ├── routers/               # API endpoints
│   │   ├── auth.py            # ✅ Complete
│   │   ├── teachings.py       # ✅ Complete with membership logic
│   │   ├── payments.py        # ✅ Complete with Tilopay
│   │   ├── courses.py         # ⚠️ Stub - to be implemented
│   │   ├── retreats.py        # ⚠️ Stub - to be implemented
│   │   └── ...
│   ├── services/              # External integrations
│   │   ├── tilopay.py         # ✅ Tilopay payment gateway
│   │   ├── mixpanel_service.py # ✅ Mixpanel analytics
│   │   ├── sendgrid_service.py # ✅ SendGrid emails
│   │   └── ga4_service.py     # ✅ Google Analytics 4
│   └── main.py                # FastAPI application
├── alembic/                   # Database migrations
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Database (use SQLite for development)
DATABASE_URL=sqlite:///./satyoga.db

# Auth
JWT_SECRET=your-secret-key-here

# Tilopay
TILOPAY_API_KEY=your-tilopay-api-key
TILOPAY_MERCHANT_KEY=your-tilopay-merchant-key
TILOPAY_WEBHOOK_SECRET=your-webhook-secret

# Mixpanel
MIXPANEL_TOKEN=your-mixpanel-token

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Google Analytics 4
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your-ga4-secret
```

### 3. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## 🔑 API Endpoints

### ✅ Implemented Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

#### Teachings (with membership logic)
- `GET /api/teachings` - Get teachings (filtered by membership)
- `GET /api/teachings/{slug}` - Get single teaching
- `POST /api/teachings/{id}/favorite` - Toggle favorite
- `GET /api/teachings/favorites/list` - Get user favorites

#### Payments (Tilopay integration)
- `POST /api/payments/create` - Create payment
- `POST /api/payments/webhook` - Tilopay webhook
- `GET /api/payments/{id}/status` - Get payment status

#### Email
- `POST /api/email/newsletter/subscribe` - Newsletter signup
- `POST /api/email/newsletter/unsubscribe` - Unsubscribe

#### Forms
- `POST /api/forms/contact` - Contact form submission

### ⚠️ To Be Implemented

The following routers have stubs but need full implementation:

#### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/{slug}` - Get course details
- `POST /api/courses/{id}/enroll` - Enroll in course
- `GET /api/courses/{id}/progress` - Get progress
- `PUT /api/courses/{id}/progress` - Update progress

#### Retreats
- `GET /api/retreats` - List retreats
- `GET /api/retreats/{slug}` - Get retreat details
- `POST /api/retreats/{id}/register` - Register for retreat
- `GET /api/retreats/{id}/portal` - Access retreat portal (membership-aware)

#### Products/Store
- `GET /api/products` - List products
- `GET /api/products/{slug}` - Get product details
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - User's orders

#### Events/Calendar
- `GET /api/events` - List events
- `GET /api/calendar/my-events` - User's calendar

#### Admin
- Full admin CRUD operations for all entities

## 💳 Tilopay Integration

The Tilopay service is fully implemented in `app/services/tilopay.py`.

### Payment Flow

1. **Create Payment**:
```python
POST /api/payments/create
{
  "amount": 100.00,
  "payment_type": "course",
  "reference_id": "course-uuid",
  "description": "Course Enrollment"
}
```

2. **Response includes payment URL**:
```json
{
  "payment_id": "uuid",
  "payment_url": "https://tilopay.com/checkout/...",
  "transaction_id": "TXN123"
}
```

3. **Redirect user to `payment_url`**

4. **Tilopay sends webhook to `/api/payments/webhook`**

5. **Backend grants access automatically**

### Webhook Verification

The webhook handler automatically:
- Verifies signature
- Updates payment status
- Grants access to purchased items
- Tracks analytics
- Sends confirmation email

## 📊 Analytics Integration

### Mixpanel

Track events automatically:
```python
await mixpanel_service.track_event(
    "Event Name",
    str(user_id),
    {"property": "value"}
)
```

Predefined trackers:
- `track_signup(user_id, email, tier)`
- `track_login(user_id, email)`
- `track_payment(user_id, amount, currency, type, item_id)`
- `track_course_enrollment(user_id, course_id, title)`
- `track_teaching_view(user_id, teaching_id, title, type)`

### Google Analytics 4

```python
await ga4_service.track_event(
    str(user_id),
    "event_name",
    {"param": "value"}
)
```

## 📧 Email Marketing

### SendGrid

Send emails:
```python
await sendgrid_service.send_email(
    to_email="user@example.com",
    subject="Welcome",
    html_content="<h1>Hello</h1>",
    variables={"name": "John"}
)
```

### Beefree Templates

1. Design email in Beefree.io
2. Export JSON and HTML
3. Store in `EmailTemplate` model
4. Use `sendgrid_service` to send with variable replacement

### Email Automation

Create automation triggered by Mixpanel events:

```python
EmailAutomation(
    name="Welcome Email",
    trigger_type=TriggerType.MIXPANEL_EVENT,
    trigger_config={"event": "user_signup"},
    template_id=template.id,
    delay_minutes=0,
    is_active=True
)
```

## 🔐 Membership Access Control

The teachings router implements **membership-aware access**:

### Access Levels

1. **FREE**: Everyone can access
2. **PREVIEW**: Free users get preview (configurable duration), paid members get full access
3. **PRAGYANI**: Requires Pragyani or Pragyani+ membership
4. **PRAGYANI_PLUS**: Requires Pragyani+ membership only

### Implementation

See `app/routers/teachings.py` for the `user_can_access_teaching()` function.

Apply the same pattern to:
- Retreat portals (lifetime vs 12-day access)
- Course content
- Exclusive products

## 🗄️ Database Models

All models are defined in `app/models/`:

- **User & Profile**: User accounts and profiles
- **Membership & Subscription**: Membership tiers and subscriptions
- **Teaching**: Teachings with access levels
- **Course, CourseClass, CourseComponent**: Complete LMS system
- **Retreat, RetreatPortal, RetreatRegistration**: Retreat management
- **Event, UserCalendar**: Calendar system
- **Product, Order, OrderItem**: E-commerce
- **Payment**: Payment tracking
- **Email**: Newsletter, templates, campaigns, automation
- **Analytics**: Event tracking and user analytics

## 📝 Next Steps

### Immediate Tasks

1. **Complete stub routers**:
   - Courses (enrollment, progress)
   - Retreats (registration, portal access)
   - Products/Store (orders, library access)
   - Events/Calendar (my calendar)

2. **Implement welcome tour**:
   - Create onboarding endpoints
   - Track tour progress
   - Show tour on first login

3. **Admin dashboard**:
   - CRUD operations for all entities
   - Analytics dashboard
   - User management
   - Content management

4. **Data migration**:
   - Migrate static data from `lib/data.ts`
   - Seed database with initial content
   - Create migration scripts

5. **Frontend integration**:
   - Update Next.js to call FastAPI endpoints
   - Replace static data with API calls
   - Implement authentication flow
   - Add Mixpanel tracking to frontend

### Testing

1. **Test Tilopay integration**:
   - Use test API keys
   - Test payment flow end-to-end
   - Verify webhook handling

2. **Test membership access**:
   - Create users with different tiers
   - Verify access control
   - Test preview functionality

3. **Test email automation**:
   - Configure SendGrid
   - Test welcome emails
   - Test automation triggers

## 🔧 Development Tools

### Database Migrations

When you modify models, create migrations:

```bash
# Install alembic
pip install alembic

# Initialize (already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Description"

# Run migrations
alembic upgrade head
```

### API Testing

Use the interactive docs:
- http://localhost:8000/docs

Or use curl:
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 🚢 Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option 2: Render

1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Option 3: DigitalOcean App Platform

1. Create new app
2. Select backend directory
3. Configure environment variables
4. Deploy

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Tilopay API Docs](https://docs.tilopay.com/)
- [Mixpanel API Docs](https://developer.mixpanel.com/)
- [SendGrid API Docs](https://docs.sendgrid.com/)

## 🤝 Contributing

When implementing new features:

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create router in `app/routers/`
4. Add router to `app/main.py`
5. Test with Swagger UI
6. Update this README

## 📄 License

Proprietary - Sat Yoga Institute
