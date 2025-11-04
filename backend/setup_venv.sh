#!/bin/bash

# Backend Setup Script with Virtual Environment (RECOMMENDED)
# This avoids dependency conflicts with globally installed packages

set -e  # Exit on error

echo "============================================"
echo "🚀 SatyoGam Backend Setup (Virtual Env)"
echo "============================================"

# Change to backend directory if not already there
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $(pwd)"

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

# Step 1: Create virtual environment
echo ""
echo "🐍 Step 1: Creating virtual environment..."
if [ -d "venv" ]; then
    echo "⚠️  Virtual environment already exists, skipping..."
else
    $PYTHON_CMD -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "🔄 Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"

# Step 2: Check Docker
echo ""
echo "📦 Step 2: Checking Docker..."
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

# Step 3: Start PostgreSQL
echo ""
echo "🐘 Step 3: Starting PostgreSQL..."
$DOCKER_COMPOSE up -d
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Test connection
until docker exec satyoga_postgres pg_isready -U satyoga > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is running"

# Step 4: Install Python dependencies
echo ""
echo "📦 Step 4: Installing Python dependencies..."

# Upgrade pip
pip install --upgrade pip

# Uninstall wrong jose package if installed
pip uninstall jose -y 2>/dev/null || true

# Install dependencies
pip install python-jose[cryptography]==3.3.0
pip install -r requirements.txt

echo "✅ Python dependencies installed"

# Step 5: Initialize database
echo ""
echo "💾 Step 5: Initializing database..."
python scripts/init_db.py

echo "✅ Database tables created"

# Step 6: Seed database
echo ""
echo "🌱 Step 6: Seeding database with test data..."
python scripts/seed_data.py

echo ""
echo "============================================"
echo "✅ SETUP COMPLETE!"
echo "============================================"
echo ""
echo "⚠️  IMPORTANT: Activate virtual environment before starting server:"
echo ""
echo "   cd backend"
echo "   source venv/bin/activate"
echo ""
echo "🚀 Then start the backend server:"
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
