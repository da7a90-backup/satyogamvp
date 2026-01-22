# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SatyoGam is a spiritual learning platform with teachings, courses, retreats, and e-commerce. Built with Next.js 15 (App Router) frontend and FastAPI backend, integrated with Strapi CMS for content management.

**Key Architecture**: Dual-stack application with separate frontend (Next.js) and backend (FastAPI) services, both sharing data through REST APIs. Authentication flows through NextAuth with Strapi integration.

## Development Commands

### Frontend (Next.js)
```bash
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Backend (FastAPI)
```bash
cd backend
python -m venv venv      # Create virtual environment (first time)
source venv/bin/activate # Activate venv (macOS/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000  # Start dev server
```

### Testing
```bash
# E2E Tests (Playwright)
npm run test:e2e         # Run all tests
npm run test:e2e:ui      # Open Playwright UI
npm run test:e2e:headed  # Run tests with browser visible
npm run test:e2e:report  # View test report

# Backend Tests (Pytest)
cd backend
pytest                   # Run all backend tests
pytest tests/test_auth.py  # Run specific test file
pytest -v                # Verbose output
pytest --cov=app         # With coverage report
```

### Database
```bash
cd backend
python scripts/init_db.py  # Initialize database with tables
```

## High-Level Architecture

### Frontend Structure (Next.js App Router)

**App Directory Pattern**: Uses Next.js 15 App Router with server components by default. Pages requiring client interactivity must use `'use client'` directive.

**Key Routing Patterns**:
- `/src/app/` - App Router pages
- `/src/app/dashboard/user/` - User dashboard pages
- `/src/app/dashboard/admin/` - Admin dashboard pages
- `/src/components/` - Reusable React components

**Critical Next.js 15 Pattern**: All `params` and `searchParams` props are now **async** and must be awaited:
```typescript
// Correct (Next.js 15)
export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
}

// Incorrect (Next.js 14 pattern - causes errors)
export default function Page({ params }: PageProps) {
  const { id } = params;  // Error!
}
```

**API Integration**:
- Strapi CMS for static content (blog, homepage) via `/src/lib/api.ts`
- FastAPI backend for dynamic features via `/src/lib/backend-api.ts`
- Teaching-specific API in `/src/lib/teachings-api.ts`

### Backend Structure (FastAPI)

**Layered Architecture**:
```
backend/app/
├── core/           # Config, database, security, dependencies
├── models/         # SQLAlchemy ORM models
├── schemas/        # Pydantic request/response schemas
├── routers/        # API endpoint routes (controllers)
└── services/       # Business logic & 3rd-party integrations
```

**Key Patterns**:
- All routes follow `/api/{resource}` pattern
- Authentication uses JWT tokens via dependency injection
- Database sessions managed through `get_db()` dependency
- SQLAlchemy models in `models/`, Pydantic schemas in `schemas/`

**Router Registration**: All routers registered in `backend/app/main.py`:
```python
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(teachings.router, prefix="/api/teachings", tags=["Teachings"])
# etc...
```

### Authentication Flow

1. **NextAuth** handles frontend sessions (30-day JWT tokens)
2. Strapi backend validates credentials on login
3. User data synced between NextAuth and Strapi
4. FastAPI uses separate JWT tokens for API calls
5. Frontend stores auth token in localStorage for FastAPI requests

**Role-Based Access**:
- `FREE` - Basic access
- `GYANI` - Mid-tier teachings ($15/month)
- `PRAGYANI` - Advanced teachings ($47/month)
- `PRAGYANI_PLUS` - Full access
- Admin role for dashboard access

### Database Architecture

**Primary Database**: SQLite (development), PostgreSQL (production)

**Key Models**:
- `User` - User accounts with membership tiers
- `Teaching` - Video teachings with access levels
- `Course` - Multi-class courses with enrollment
- `Retreat` - Online/onsite retreats with portal access
- `Event` - Calendar events (currently placeholder)
- `Application` - Retreat application forms
- `Payment` - Tilopay payment tracking
- `EmailCampaign` - SendGrid email campaigns

**Relationships**:
- User → Courses (many-to-many through enrollments)
- User → Retreats (many-to-many through registrations)
- Course → Classes (one-to-many)
- Retreat → PortalSessions (one-to-many)

### Integration Services

**Configured in `backend/app/core/config.py`**:
- **Tilopay**: Payment processing (embedded checkout)
- **SendGrid**: Email campaigns and transactional emails
- **Mixpanel**: Backend analytics tracking
- **Google Analytics 4**: Event tracking
- **Strapi CMS**: Content management (blog, static pages)

## Critical Issues & Patterns

### Known Next.js 15 Compatibility Issues

**CRITICAL - Must Fix First**:
1. `/src/app/login/page.tsx` - `searchParams` not awaited (#3)
2. `/src/app/dashboard/user/courses/[slug]/class/[id]/page.tsx` - `params` not awaited (#4)
3. `/src/app/dashboard/user/courses/[slug]/overview/page.tsx` - `params` not awaited (#5)

These issues **block Playwright tests** and cause dev server errors.

### Component Patterns

**Server vs Client Components**:
- Default to **server components** unless interactivity needed
- Use `'use client'` only for: forms, state management, event handlers, browser APIs
- 11 pages currently under review for unnecessary `'use client'` usage (#6)

**Shadcn/ui Components**:
- Pre-built UI components in `/src/components/ui/`
- Uses Radix UI primitives + Tailwind
- Components: Button, Card, Form, Input, Select, Toast, etc.

### API Data Fetching Patterns

**Strapi CMS (Static Content)**:
```typescript
import { blogApi } from '@/lib/api';
const posts = await blogApi.getPosts();
const post = await blogApi.getPost(id);
```

**FastAPI Backend (Dynamic Features)**:
```typescript
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
const response = await fetch(`${FASTAPI_URL}/api/teachings`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Form Handling

**Application Forms** (`/src/components/forms/application-form.tsx`):
- Multi-step wizard with React Hook Form + Zod validation
- 42+ fields across 8 steps
- Submission endpoint: `POST /api/forms/application` (backend incomplete - #13)

**Contact Forms**:
- Direct submission to FastAPI `/api/forms/contact`
- SendGrid integration for email notifications

## Development Workflows

### Adding a New Feature

1. **Backend First** (if data needed):
   - Create model in `backend/app/models/`
   - Create Pydantic schema in `backend/app/schemas/`
   - Create router in `backend/app/routers/`
   - Register router in `backend/app/main.py`

2. **Frontend**:
   - Create page in appropriate `/src/app/` directory
   - Create components in `/src/components/`
   - Add API calls using fetch or Strapi helpers

3. **Testing**:
   - Add Playwright test in `/e2e/`
   - Add backend test in `backend/tests/`

### Dashboard Pages

**User Dashboard** (`/dashboard/user/`):
- Main dashboard: `/src/app/dashboard/user/page.tsx` - **Uses mock data** (#9)
- Settings pages: profile, billing, notifications, payment methods
- Courses: enrollment, class viewer, progress tracking
- **Missing**: Teachings portal (#11)

**Admin Dashboard** (`/dashboard/admin/`):
- Blog management (complete)
- Course management (complete)
- Instructor management (complete)
- **Missing**: 15+ admin pages for teachings, retreats, events, forms, analytics, users, email (#15-21)

### Environment Variables

**Frontend** (`.env`):
```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your_token
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
```

**Backend** (`backend/.env`):
```bash
DATABASE_URL=sqlite:///./satyoga.db
JWT_SECRET=your_secret
STRAPI_URL=http://localhost:1337
TILOPAY_API_KEY=your_key
SENDGRID_API_KEY=your_key
MIXPANEL_TOKEN=your_token
```

## Common Gotchas

1. **Async Params**: Always `await params` and `await searchParams` in Next.js 15 pages
2. **Server vs Client**: Don't use browser APIs in server components
3. **Image Domains**: Add external image domains to `next.config.ts` for Next/Image
4. **CORS**: Ensure FastAPI CORS origins include frontend URL
5. **Database**: Run `init_db.py` after model changes
6. **Strapi Fallback**: Homepage falls back to hardcoded data if Strapi unavailable
7. **Webkit Tests**: Known bus error - use chromium/firefox instead

## Project Status & Priorities

**Current Phase**: Critical Fixes + Core Features (~60% complete)

**Priority Order**:
1. Fix Next.js 15 compatibility issues (#3-6)
2. Connect dashboard to real APIs (#9, #12)
3. Implement missing backends (events, forms)
4. Build admin management UIs
5. Complete testing coverage

**See PROJECT_STATUS.md** for detailed roadmap, issue tracker, and feature status.

## File References

- **PROJECT_STATUS.md** - Comprehensive project status, roadmap, 31 GitHub issues
- **STRAPI_MIGRATION_ANALYSIS.md** - Content migration plan (9,300+ words)
- **package.json** - Frontend dependencies and scripts
- **backend/requirements.txt** - Python dependencies
- **playwright.config.ts** - E2E test configuration
- **tsconfig.json** - TypeScript configuration with path aliases (@/*)

## Additional Context

**Membership Tiers**: The platform has 4 membership tiers (FREE, GYANI, PRAGYANI, PRAGYANI_PLUS) that control access to teachings and features.

**Payment Flow**: Tilopay embedded checkout → webhook → update user subscription → grant access.

**Content Strategy**: Moving from hardcoded content to Strapi CMS. Blog is migrated, homepage/about pages pending.

**Testing Strategy**: Playwright for E2E (30+ tests passing), Pytest for backend (partial coverage). Target: 100+ E2E tests, 80%+ backend coverage.
- the database is a postgresql database running through docker
- remove the playwright background thing we don't need that anymore and don't mention it ever again
- never use the redirect payment url always use the embedded way. There is a way to do it with jquery or vanilla javascript but we just have to adapt it to work for react/nextjs
- never use fallback hardcoded data
- always retry connexion to vps when it say refused
- make port 3000 the single port you test with locally if the port is busy kill the process on that port and start a new one on it
- if you can use tailwind instead of inline style that would be much much better please abide by this rule
- you should never hardcode or use mock data in this project every again.
- we use postgers running in a docker locally and another one in the remote server for the production version