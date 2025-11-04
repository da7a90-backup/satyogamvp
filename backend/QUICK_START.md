# Quick Start Guide

## One-Command Setup

```bash
cd backend
./setup.sh
```

This automatically:
- ✅ Starts PostgreSQL via Docker
- ✅ Installs correct Python dependencies
- ✅ Creates database tables
- ✅ Seeds test users & teachings

## Start Server

```bash
uvicorn app.main:app --reload --port 8000
```

- Server: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Test Credentials

| Email | Password | Tier | Can View |
|-------|----------|------|----------|
| **free@test.com** | password123 | FREE | 5 FREE teachings |
| **gyani@test.com** | password123 | GYANI | 10 teachings (FREE + GYANI) |
| **pragyani@test.com** | password123 | PRAGYANI | 15 teachings (all except PLUS) |
| **admin@test.com** | admin123 | ADMIN | All 18 teachings + admin access |

## Test Data

After setup:
- 5 users (one per tier)
- 18 teachings across all access levels
- Categories: Introduction, Meditation, Philosophy, Advanced, Secret

## Common Issues

### "ModuleNotFoundError: No module named 'jose'"
```bash
pip uninstall jose -y
pip install python-jose[cryptography]==3.3.0
```

### Backend won't start
```bash
# Check PostgreSQL
docker ps | grep postgres

# Restart if needed
docker-compose restart
```

### Port 5432 in use
```bash
# Stop local PostgreSQL
brew services stop postgresql
```

## Manual Setup

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed steps.
