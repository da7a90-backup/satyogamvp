# Backend Setup Instructions

## Prerequisites
- Docker installed
- Python 3.12 installed
- pip installed

## Step-by-Step Setup

### 1. Fix Python Dependencies

**IMPORTANT**: You installed the wrong `jose` package. Fix it:

```bash
cd backend

# Uninstall the wrong package
pip uninstall jose -y

# Install the correct package
pip install python-jose[cryptography]==3.3.0

# Install all other dependencies
pip install -r requirements.txt
```

### 2. Start PostgreSQL via Docker

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps | grep satyoga_postgres

# Check logs if needed
docker logs satyoga_postgres
```

### 3. Initialize Database

```bash
# Create all tables
python scripts/init_db.py
```

### 4. Seed Database with Test Data

```bash
# Seed users, teachings, courses, etc.
python scripts/seed_data.py
```

### 5. Start Backend Server

```bash
# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

Server will be available at: http://localhost:8000

API docs at: http://localhost:8000/docs

---

## Test Credentials

After seeding, use these credentials to test:

### **Free User**
- Email: `free@test.com`
- Password: `password123`
- Can view: FREE teachings only

### **Gyani Member**
- Email: `gyani@test.com`
- Password: `password123`
- Can view: FREE + GYANI teachings

### **Pragyani Member**
- Email: `pragyani@test.com`
- Password: `password123`
- Can view: FREE + GYANI + PRAGYANI teachings

### **Pragyani Plus Member**
- Email: `pragyani_plus@test.com`
- Password: `password123`
- Can view: ALL teachings (including PRAGYANI_PLUS)

### **Admin User**
- Email: `admin@test.com`
- Password: `admin123`
- Full admin access + all teachings
- Can create/edit teachings via admin dashboard

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'jose'"
```bash
pip uninstall jose -y
pip install python-jose[cryptography]==3.3.0
```

### "ModuleNotFoundError: No module named 'pydantic_settings'"
```bash
pip install pydantic-settings==2.1.0
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart if needed
docker-compose restart

# Check .env file has correct DATABASE_URL
cat .env | grep DATABASE_URL
```

### Port 5432 Already in Use
```bash
# Stop existing PostgreSQL
brew services stop postgresql  # if installed via Homebrew

# Or change port in docker-compose.yml to "5433:5432"
# Then update .env DATABASE_URL port to 5433
```

---

## Quick Reset

To reset everything:

```bash
# Stop and remove containers
docker-compose down -v

# Drop and recreate database
python scripts/init_db.py --drop

# Reseed
python scripts/seed_data.py
```

---

## Database Management

### View Data

```bash
# Connect to PostgreSQL
docker exec -it satyoga_postgres psql -U satyoga -d satyoga_db

# List tables
\dt

# View users
SELECT email, membership_tier, is_admin FROM users;

# View teachings
SELECT slug, title, access_level FROM teachings;

# Exit
\q
```

### Backup Database

```bash
docker exec satyoga_postgres pg_dump -U satyoga satyoga_db > backup.sql
```

### Restore Database

```bash
docker exec -i satyoga_postgres psql -U satyoga satyoga_db < backup.sql
```
