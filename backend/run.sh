#!/bin/bash

# Sat Yoga Backend Run Script

echo "🚀 Starting Sat Yoga Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your API keys before running again!"
    exit 1
fi

# Run the server
echo "🎉 Starting FastAPI server on http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
