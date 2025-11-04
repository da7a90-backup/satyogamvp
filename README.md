# SatyoGam - Spiritual Learning Platform

A full-stack spiritual learning platform featuring teachings, courses, retreats, blog, and e-commerce capabilities. Built with Next.js 15 and FastAPI.

## 🌐 Environments

- **Local Development**: http://localhost:3000 (Docker + local services)
- **Staging**: https://satyoga-staging.vercel.app (when deployed)
- **Production**: https://satyoga.vercel.app (when deployed)

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Shadcn/ui
- **Auth**: NextAuth.js
- **State**: React Hooks
- **Video**: Custom player with Cloudflare Stream

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Docker locally, Prisma Postgres in production)
- **ORM**: SQLAlchemy
- **Auth**: JWT tokens
- **Payments**: Tilopay (embedded checkout)
- **Email**: SendGrid
- **Analytics**: Mixpanel, Google Analytics 4

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Docker and Docker Compose
- PostgreSQL command-line tools (optional, for database exports)

### Local Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd satyogamvp
```

2. **Start Docker services**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Strapi CMS (port 1337) - optional

3. **Setup Backend**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your local settings

# Initialize database (first time only)
python scripts/init_db.py

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs: http://localhost:8000/docs

4. **Setup Frontend**
```bash
# From project root
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your local settings

# Start development server
npm run dev
```

Frontend runs at: http://localhost:3000

## 📦 Project Structure

```
satyogamvp/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── core/        # Config, database, security
│   │   ├── models/      # SQLAlchemy models
│   │   ├── routers/     # API endpoints
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── api/             # Vercel serverless entry point
│   ├── scripts/         # Database scripts
│   └── tests/           # Backend tests
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities & API clients
│   └── types/           # TypeScript types
├── public/              # Static assets
├── e2e/                 # Playwright tests
├── docker-compose.yml   # Local Docker services
└── DEPLOYMENT.md        # Deployment guide
```

## 🧪 Testing

### Frontend Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

### Backend Tests (Pytest)
```bash
cd backend
pytest
pytest -v           # Verbose output
pytest --cov=app    # With coverage
```

## 🗄️ Database

### Local Development
PostgreSQL runs in Docker with these credentials:
- Host: localhost
- Port: 5432
- Database: satyoga_dev
- User: satyoga_user
- Password: satyoga_dev_password

### Database Migrations
Currently using `init_db.py` script. Alembic migrations coming soon.

### Export Database
```bash
./export_database.sh
```

## 🚢 Deployment

The application deploys to Vercel with separate staging and production environments.

### Quick Deployment Steps

1. **Export local database**
```bash
./export_database.sh
```

2. **Create Vercel Postgres databases**
- Staging: `satyoga-staging`
- Production: `satyoga-production`

3. **Import data to Vercel Postgres**
```bash
psql "your-vercel-connection-string" < database_export/complete_export.sql
```

4. **Create staging branch**
```bash
git checkout -b staging
git push origin staging
```

5. **Deploy to Vercel**
- Backend: Deploy `/backend` directory
- Frontend: Deploy root directory
- Configure environment variables (see `.env.staging.example` and `.env.production.example`)

6. **Test staging** → **Merge to main** for production

📖 **Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔐 Environment Variables

### Frontend Variables
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GA4_ID=your-ga4-id
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

### Backend Variables
```bash
DATABASE_URL=postgresql://satyoga_user:satyoga_dev_password@localhost:5432/satyoga_dev
JWT_SECRET=your-jwt-secret
TILOPAY_API_KEY=your-tilopay-key
TILOPAY_MERCHANT_KEY=your-merchant-key
SENDGRID_API_KEY=your-sendgrid-key
MIXPANEL_TOKEN=your-mixpanel-token
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-id
CLOUDFLARE_API_TOKEN=your-cloudflare-token
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

See `.env.example` files for complete lists.

## 🎯 Features

### Core Features
- 🔐 User authentication & authorization (JWT + NextAuth)
- 📚 Teaching library with video content (4 membership tiers)
- 🎓 Multi-class courses with progress tracking
- 🏕️ Online retreats with portal sessions
- ✍️ Blog with markdown support
- 🛒 E-commerce store with Tilopay payments
- 📧 Email campaigns (SendGrid)
- 📊 Analytics tracking (Mixpanel, GA4)

### Membership Tiers
- **FREE**: Basic access
- **GYANI**: Mid-tier teachings ($15/month)
- **PRAGYANI**: Advanced teachings ($47/month)
- **PRAGYANI_PLUS**: Full access

### Admin Dashboard
- Blog post management
- Course creation & editing
- Instructor management
- User management (coming soon)
- Analytics dashboard (coming soon)

## 📝 Development Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload       # Start dev server
python scripts/init_db.py           # Initialize database
pytest                              # Run tests

# Docker
docker-compose up -d                # Start all services
docker-compose down                 # Stop all services
docker-compose logs -f              # View logs
```

## 🐛 Troubleshooting

### Frontend won't start
- Check Node version (18+)
- Delete `node_modules` and `.next`, then `npm install`
- Verify environment variables in `.env.local`

### Backend won't start
- Check Python version (3.9+)
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`
- Check PostgreSQL is running: `docker ps`

### Database connection errors
- Ensure Docker is running
- Check PostgreSQL container: `docker ps | grep postgres`
- Verify credentials in `.env`

### CORS errors
- Verify `FRONTEND_URL` and `CORS_ORIGINS` in backend `.env`
- Check backend is running on correct port (8000)

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete Vercel deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant context & project structure
- **Backend API Docs**: http://localhost:8000/docs (when running)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request to `staging` branch
6. After testing on staging, merge to `main`

## 📄 License

[Your License Here]

## 🔗 Links

- **Production**: https://satyoga.vercel.app (when deployed)
- **Staging**: https://satyoga-staging.vercel.app (when deployed)
- **API Docs**: https://satyoga-backend.vercel.app/docs (when deployed)

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Contact: [your-email@example.com]

---

Built with ❤️ using Next.js 15, FastAPI, and Vercel
