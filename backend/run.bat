@echo off
REM Sat Yoga Backend Run Script for Windows

echo 🚀 Starting Sat Yoga Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo ✅ Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt --quiet

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found!
    echo 📝 Copying .env.example to .env...
    copy .env.example .env
    echo ⚠️  Please edit .env with your API keys before running again!
    exit /b 1
)

REM Run the server
echo 🎉 Starting FastAPI server on http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
