# Prisma Postgres Setup Guide

## Overview

Vercel now uses **Prisma Postgres** (via Marketplace) instead of native Vercel Postgres. This guide explains how to use it with FastAPI + SQLAlchemy.

## Connection Strings Explained

When you create a Prisma Postgres database, you get **two** connection strings:

### 1. POSTGRES_URL (Direct Connection)
```
postgres://user:password@db.prisma.io:5432/postgres?sslmode=require
```
**Use this for**: SQLAlchemy, FastAPI, migrations, pg_dump, psql
- Standard PostgreSQL connection
- Direct access to database
- Required for non-Prisma ORM applications

### 2. PRISMA_DATABASE_URL (Accelerate)
```
prisma+postgres://accelerate.prisma-data.net/?api_key=...
```
**Use this for**: Prisma ORM only (we don't use this)
- Prisma Accelerate connection pooling
- Query-level caching
- Only works with Prisma Client

## For This Project (FastAPI + SQLAlchemy)

✅ **Use**: `POSTGRES_URL`
❌ **Don't use**: `PRISMA_DATABASE_URL`

## Environment Variables Setup

### Backend (FastAPI)
```bash
# In Vercel project environment variables
DATABASE_URL=postgres://your-user:your-password@db.prisma.io:5432/postgres?sslmode=require
```

Copy the `POSTGRES_URL` value from your Vercel integration settings.

### Where to Find Connection Strings

1. Go to Vercel Dashboard
2. Click **Storage** → **Prisma Postgres** integration
3. Select your database
4. Copy the **POSTGRES_URL** value
5. Add to Vercel project environment variables as `DATABASE_URL`

## Database Already Imported! ✅

Your staging database has been imported with:
- ✅ 693 teachings
- ✅ 159 media assets
- ✅ 134 form questions
- ✅ 85 products
- ✅ 63 total tables

Connection details:
- Host: `db.prisma.io`
- Port: `5432`
- Database: `postgres`
- SSL: Required (`sslmode=require`)

## Testing Connection

```bash
# Test connection
PGPASSWORD='your-password' psql -h db.prisma.io -U your-user -d postgres -c "SELECT version();"

# Check tables
PGPASSWORD='your-password' psql -h db.prisma.io -U your-user -d postgres -c "\dt"

# Check row counts
PGPASSWORD='your-password' psql -h db.prisma.io -U your-user -d postgres -c "SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY n_live_tup DESC LIMIT 10;"
```

## SQLAlchemy Configuration

Your FastAPI app is already configured correctly. The `DATABASE_URL` environment variable is automatically used by SQLAlchemy:

```python
# backend/app/core/config.py
DATABASE_URL: str = "sqlite:///./satyoga.db"  # Default for local
# In production, this gets overridden by environment variable
```

No code changes needed - SQLAlchemy works with standard PostgreSQL URLs!

## Connection Pooling

Prisma Postgres includes built-in connection pooling. Your SQLAlchemy config already uses pooling:

```python
# backend/app/core/database.py
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before use
    pool_size=5,         # Number of connections to maintain
    max_overflow=10,     # Max additional connections when busy
)
```

## Troubleshooting

### "role does not exist" errors during import
- **Normal!** These are ownership warnings
- Tables and data are still created successfully
- Just means the "satyoga" user from local doesn't exist on Prisma Postgres

### SSL Connection Issues
- Always include `?sslmode=require` in connection string
- Prisma Postgres requires SSL connections

### Connection Timeout
- Prisma Postgres has generous connection limits
- Check your plan limits in Prisma Data Platform
- Use connection pooling (already configured)

## Prisma Data Platform Access

You can also manage your database via Prisma Data Platform:
1. Go to [prisma.io](https://www.prisma.io)
2. Sign in with same account used for Vercel integration
3. Access database dashboard, monitoring, and backups

## Next Steps

Your database is ready! Now you can:
1. Deploy backend to Vercel (use `POSTGRES_URL` as `DATABASE_URL`)
2. Deploy frontend to Vercel
3. Test staging environment
4. Create production database and repeat

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment guide.
