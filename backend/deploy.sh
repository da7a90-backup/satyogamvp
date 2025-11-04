#!/bin/bash

# Deploy backend to Vercel
# This script automates the vercel deployment with pre-configured answers

cd /Users/guertethiaf/Downloads/dontdelete/satyogamvp/backend

# Use vercel deploy with GitHub integration
# The project is already connected to GitHub, so we just need to trigger a deployment
# via git push (which we already did)

echo "Backend is configured to deploy via GitHub integration."
echo "Push to staging branch triggers preview deployment."
echo "Push to main branch triggers production deployment."
echo ""
echo "To manually deploy, use the Vercel dashboard:"
echo "1. Go to https://vercel.com/da7a90backups-projects"
echo "2. Select or create 'satyoga-backend' project"
echo "3. Import from GitHub: da7a90-backup/satyogamvp"
echo "4. Set Root Directory: backend"
echo "5. Add environment variables"
echo "6. Deploy"
echo ""
echo "Environment variables needed:"
echo "DATABASE_URL=postgres://16ed4821cca6ca070ebc9aa63ab9480d65890a3350ac87fbf0a443095984bd51:sk_u8qsYkGPpexi-zzIprO-K@db.prisma.io:5432/postgres?sslmode=require"
echo "JWT_SECRET=8UjV7ijehyLTBZmrC2gIq+D2WcM1XtZXkmP9AboS9vo="
echo "ENVIRONMENT=production"
echo "DEBUG=False"
echo "FRONTEND_URL=https://satyogamvp.vercel.app"
echo "CORS_ORIGINS=https://satyogamvp.vercel.app,http://localhost:3000"
