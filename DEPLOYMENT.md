# Vercel Deployment Guide - SatyoGam Platform

## Overview

This guide walks you through deploying the SatyoGam full-stack application to Vercel, including:
- Next.js frontend
- FastAPI backend (serverless)
- Vercel Postgres database
- Staging and Production environments

**Local Docker environment remains intact for development.**

---

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended): `npm i -g vercel`
3. **PostgreSQL Tools**: `pg_dump` and `psql` installed locally
4. **Docker Running**: For local database export
5. **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket

---

## Quick Start Checklist

- [ ] Export local database (schema + data)
- [ ] Create Vercel Postgres databases (staging + production)
- [ ] Import data to Vercel Postgres
- [ ] Create staging branch
- [ ] Deploy backend to Vercel (staging)
- [ ] Deploy frontend to Vercel (staging)
- [ ] Configure environment variables
- [ ] Test staging thoroughly
- [ ] Merge to main for production deployment
- [ ] Update third-party webhooks

---

## Phase 1: Database Migration

### 1.1 Export Local Database

Run the provided export script:

```bash
./export_database.sh
```

This creates:
- `database_export/schema.sql` - Database schema
- `database_export/data.sql` - Database data
- `database_export/complete_export.sql` - Combined file
- `database_export/table_counts.txt` - Row counts for verification

### 1.2 Create Vercel Postgres Databases

**Via Vercel Dashboard:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database" → "Postgres"
3. Create two databases:
   - `satyoga-staging` (for staging environment)
   - `satyoga-production` (for production)
4. Note connection strings for both

**Via Vercel CLI:**
```bash
# Create staging database
vercel postgres create satyoga-staging

# Create production database
vercel postgres create satyoga-production
```

### 1.3 Import Data to Vercel Postgres

**Connect to Vercel Postgres:**
```bash
# Get connection string from Vercel dashboard
# Format: postgres://user:password@host:5432/verceldb?sslmode=require

# Import to staging
psql "postgres://user:password@host:5432/verceldb?sslmode=require" < database_export/complete_export.sql

# Import to production (after staging is verified)
psql "postgres://production-user:password@host:5432/verceldb?sslmode=require" < database_export/complete_export.sql
```

**Verify Import:**
```bash
# Connect to database
psql "your-connection-string"

# Check table counts
SELECT schemaname || '.' || tablename AS table_name, n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

# Compare with database_export/table_counts.txt
```

---

## Phase 2: Git Branch Setup

### 2.1 Create Staging Branch

```bash
# Create and push staging branch
git checkout -b staging
git push origin staging
```

### 2.2 Branch Strategy

- `main` branch → Production environment
- `staging` branch → Staging environment
- Feature branches → Local development, then merge to staging

---

## Phase 3: Deploy Backend (FastAPI)

### 3.1 Create Vercel Project for Backend

**Via Vercel Dashboard:**
1. Click "Add New" → "Project"
2. Import your Git repository
3. Configure:
   - **Project Name**: `satyoga-backend` (or your choice)
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (auto-detected)
   - **Install Command**: `pip install -r requirements.txt`

**Via CLI:**
```bash
cd backend
vercel
# Follow prompts, select correct project settings
```

### 3.2 Configure Backend Environment Variables

Go to Project Settings → Environment Variables

**For Staging** (link to `staging` branch):

Copy from `backend/.env.staging.example`:
```
DATABASE_URL=postgres://[vercel-postgres-staging-url]
JWT_SECRET=[generate-new]
TILOPAY_API_KEY=[test-key]
TILOPAY_MERCHANT_KEY=[test-key]
TILOPAY_WEBHOOK_SECRET=[test-secret]
SENDGRID_API_KEY=[your-key]
MIXPANEL_TOKEN=[your-token]
CLOUDFLARE_ACCOUNT_ID=[your-id]
CLOUDFLARE_API_TOKEN=[your-token]
FRONTEND_URL=https://satyoga-staging.vercel.app
CORS_ORIGINS=https://satyoga-staging.vercel.app
ALLOWED_ORIGINS=https://satyoga-staging.vercel.app
ENVIRONMENT=staging
DEBUG=True
```

**For Production** (link to `main` branch):

Copy from `backend/.env.production.example` with production values.

### 3.3 Deploy Backend

```bash
# Deploy to staging
git checkout staging
git push origin staging
# Vercel auto-deploys

# Note the backend URL: https://satyoga-backend-staging.vercel.app
```

---

## Phase 4: Deploy Frontend (Next.js)

### 4.1 Create Vercel Project for Frontend

**Via Dashboard:**
1. Click "Add New" → "Project"
2. Import your Git repository (same repo as backend)
3. Configure:
   - **Project Name**: `satyoga-frontend` (or your choice)
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (project root)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

### 4.2 Configure Frontend Environment Variables

**For Staging**:

Copy from `.env.staging.example`:
```
NEXTAUTH_URL=https://satyoga-staging.vercel.app
NEXTAUTH_SECRET=[generate-new]
NEXT_PUBLIC_FASTAPI_URL=https://satyoga-backend-staging.vercel.app
NEXT_PUBLIC_API_URL=https://satyoga-backend-staging.vercel.app
GOOGLE_CLIENT_ID=[your-id]
GOOGLE_CLIENT_SECRET=[your-secret]
NEXT_PUBLIC_GA4_ID=[staging-ga4-id]
NEXT_PUBLIC_MIXPANEL_TOKEN=[staging-token]
```

**For Production**:

Copy from `.env.production.example` with production URLs.

### 4.3 Deploy Frontend

```bash
# Deploy to staging
git checkout staging
git push origin staging
# Vercel auto-deploys

# Note the frontend URL: https://satyoga-staging.vercel.app
```

---

## Phase 5: Testing Staging Environment

### 5.1 Test Checklist

Access `https://satyoga-staging.vercel.app` and test:

- [ ] **Homepage loads** (no errors in console)
- [ ] **Authentication**:
  - [ ] Sign up new user
  - [ ] Login with email/password
  - [ ] Logout
- [ ] **Blog**:
  - [ ] List blog posts
  - [ ] View blog post detail
  - [ ] Admin: Create/edit blog post
- [ ] **Teachings**:
  - [ ] Browse teachings
  - [ ] View teaching detail (video player)
  - [ ] Check access control by tier
- [ ] **Courses**:
  - [ ] View course list
  - [ ] Course enrollment
  - [ ] Watch class video
- [ ] **Payments**:
  - [ ] Add product to cart
  - [ ] Tilopay checkout (test mode)
  - [ ] Webhook processing
- [ ] **Forms**:
  - [ ] Contact form submission
  - [ ] Application form submission
- [ ] **Admin Dashboard**:
  - [ ] Blog management
  - [ ] Course management
  - [ ] User management

### 5.2 Common Issues

**CORS Errors:**
- Verify `CORS_ORIGINS` includes frontend URL
- Check backend logs in Vercel Functions dashboard

**Database Connection Issues:**
- Verify `DATABASE_URL` format: `postgres://...?sslmode=require`
- Check Vercel Postgres connection limits

**Cold Start Delays:**
- First request after inactivity takes 2-5 seconds (normal for serverless)

**Authentication Failures:**
- Verify `NEXTAUTH_URL` matches frontend domain
- Check `NEXTAUTH_SECRET` is set

---

## Phase 6: Production Deployment

### 6.1 Deploy to Production

After staging passes all tests:

```bash
# Merge staging to main
git checkout main
git merge staging
git push origin main

# Vercel auto-deploys production from main branch
```

### 6.2 Verify Production

1. Visit production URLs
2. Run through test checklist (Phase 5.1)
3. Monitor logs for 24-48 hours

---

## Phase 7: Post-Deployment Configuration

### 7.1 Update Third-Party Services

**Tilopay Webhooks:**
- Add webhook URLs in Tilopay dashboard:
  - Staging: `https://satyoga-backend-staging.vercel.app/api/payments/webhook`
  - Production: `https://satyoga-backend.vercel.app/api/payments/webhook`

**Google OAuth:**
- Add redirect URIs in Google Cloud Console:
  - `https://satyoga-staging.vercel.app/api/auth/callback/google`
  - `https://satyoga.vercel.app/api/auth/callback/google`

**SendGrid:**
- Verify sender domain/email for production

### 7.2 Custom Domains (Optional)

1. Add custom domain in Vercel project settings
2. Update DNS records (Vercel provides instructions)
3. Update environment variables to use custom domain
4. Update third-party service callbacks

---

## Local Development (Unchanged)

Local development continues to use Docker:

```bash
# Start Docker services
docker-compose up -d

# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Start frontend
npm run dev

# Access at http://localhost:3000
```

**Local Environment Variables:**
- Use `.env.local` for frontend (with localhost URLs)
- Use `backend/.env` for backend (with local database)

---

## Database Management

### Environments:

- **Local**: Docker PostgreSQL (`localhost:5432`)
- **Staging**: Vercel Postgres (staging instance)
- **Production**: Vercel Postgres (production instance)

### Syncing Production Data to Local:

```bash
# Export from Vercel Postgres
pg_dump "postgres://prod-connection-string" > prod_backup.sql

# Import to local
PGPASSWORD='satyoga_dev_password' psql -h localhost -U satyoga_user -d satyoga_dev < prod_backup.sql
```

---

## Monitoring & Maintenance

### Vercel Dashboard:

- **Functions**: View backend API logs, errors, invocations
- **Analytics**: Traffic, performance, Core Web Vitals
- **Logs**: Real-time logs for debugging
- **Usage**: Monitor function execution time, bandwidth

### Database Monitoring:

- Vercel Postgres dashboard shows:
  - Connection count
  - Query performance
  - Storage usage

### Recommended Monitoring Tools:

- **Sentry**: Error tracking ([sentry.io](https://sentry.io))
- **LogRocket**: Session replay
- **Datadog**: APM (for Pro plans)

---

## Rollback Procedure

### Quick Rollback:

1. Go to Vercel project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (no code changes needed)

### Database Rollback:

1. Restore from Vercel Postgres backup
2. Or re-import from local export

---

## Troubleshooting

### Backend Not Responding:

- Check Vercel Functions logs for errors
- Verify environment variables are set
- Check database connection string
- Test backend URL directly: `https://your-backend.vercel.app/health`

### Frontend Build Failures:

- Check build logs in Vercel dashboard
- Verify `package.json` scripts
- Check for TypeScript errors
- Ensure environment variables are set

### Database Connection Errors:

- Verify `sslmode=require` in connection string
- Check connection pool limits (max 10 on Hobby plan)
- Use connection pooling in FastAPI config

---

## Vercel Plan Considerations

### Hobby (Free) Plan:

- ✅ Good for staging/testing
- ⚠️ Limitations:
  - 100GB bandwidth/month
  - 100 hours serverless function execution/month
  - 10s function timeout
  - 256MB function memory

### Pro Plan ($20/month):

- ✅ Recommended for production
- Features:
  - 1TB bandwidth/month
  - 1000 hours function execution/month
  - 60s function timeout
  - 1024MB function memory
  - Team collaboration
  - Custom domains (unlimited)

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secrets**: Use different secrets for staging vs production
3. **Database**: Enable SSL mode for Postgres connections
4. **API Keys**: Rotate keys regularly
5. **CORS**: Only allow specific frontend origins
6. **Rate Limiting**: Consider adding rate limiting middleware

---

## Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **FastAPI on Vercel**: [vercel.com/docs/frameworks/fastapi](https://vercel.com/docs/frameworks/fastapi)
- **Vercel Postgres**: [vercel.com/docs/storage/vercel-postgres](https://vercel.com/docs/storage/vercel-postgres)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

## Changelog

### 2024-01-XX - Initial Deployment
- Configured Vercel deployment for FastAPI backend
- Configured Vercel deployment for Next.js frontend
- Migrated PostgreSQL database to Vercel Postgres
- Set up staging and production environments
- Maintained local Docker development environment
