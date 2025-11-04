#!/bin/bash

# Backend Setup Script
# This script sets up PostgreSQL, Python dependencies, and seeds the database

set -e  # Exit on error

echo "============================================"
echo "🚀 SatyoGam Backend Setup"
echo "============================================"

# Change to backend directory if not already there
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $(pwd)"

# Step 1: Check Docker
echo ""
echo "📦 Step 1: Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi
echo "✅ Docker is installed"

# Detect Docker Compose command (V1 vs V2)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Docker Compose not found"
    exit 1
fi
echo "✅ Using: $DOCKER_COMPOSE"

# Step 2: Start PostgreSQL
echo ""
echo "🐘 Step 2: Starting PostgreSQL..."
$DOCKER_COMPOSE up -d
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Test connection
until docker exec satyoga_postgres pg_isready -U satyoga > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is running"

# Step 3: Fix Python dependencies
echo ""
echo "🐍 Step 3: Installing Python dependencies..."

# Remove wrong jose package if installed
pip uninstall jose -y 2>/dev/null || true

# Install dependencies
pip install python-jose[cryptography]==3.3.0
pip install -r requirements.txt

echo "✅ Python dependencies installed"

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found"
    exit 1
fi
echo "✅ Using: $PYTHON_CMD"

# Step 4: Initialize database
echo ""
echo "💾 Step 4: Initializing database..."
$PYTHON_CMD scripts/init_db.py

echo "✅ Database tables created"

# Step 5: Seed database
echo ""
echo "🌱 Step 5: Seeding database with test data..."
$PYTHON_CMD scripts/seed_data.py

echo ""
echo "============================================"
echo "✅ SETUP COMPLETE!"
echo "============================================"
echo ""
echo "🚀 Start the backend server:"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "📚 API Documentation:"
echo "   http://localhost:8000/docs"
echo ""
echo "🔑 Test Credentials:"
echo "   FREE:         free@test.com / password123"
echo "   GYANI:        gyani@test.com / password123"
echo "   PRAGYANI:     pragyani@test.com / password123"
echo "   PRAGYANI_PLUS: pragyani_plus@test.com / password123"
echo "   ADMIN:        admin@test.com / admin123"
echo ""
echo "============================================"
