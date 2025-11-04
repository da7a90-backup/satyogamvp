#!/bin/bash

# Deploy SatyoGam backend to VPS (104.248.239.206)
# This script:
# 1. Sets up Docker PostgreSQL on VPS
# 2. Copies database from local Docker to VPS
# 3. Deploys FastAPI backend

set -e

VPS_HOST="root@104.248.239.206"
BACKEND_PORT=8000
DB_USER="satyoga"
DB_PASSWORD="satyoga_dev_password"
DB_NAME="satyoga_db"
DB_PORT=5432

echo "🚀 Deploying SatyoGam to VPS..."

# Step 1: Setup Docker on VPS
echo ""
echo "📦 Step 1: Setting up Docker PostgreSQL on VPS..."
ssh $VPS_HOST << 'ENDSSH'
# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Stop and remove existing container if exists
docker stop satyoga_postgres 2>/dev/null || true
docker rm satyoga_postgres 2>/dev/null || true

# Start PostgreSQL container
echo "Starting PostgreSQL container..."
docker run -d \
  --name satyoga_postgres \
  -e POSTGRES_USER=satyoga \
  -e POSTGRES_PASSWORD=satyoga_dev_password \
  -e POSTGRES_DB=satyoga_db \
  -p 5432:5432 \
  -v satyoga_pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "✓ PostgreSQL container running"
ENDSSH

# Step 2: Export local database and copy to VPS
echo ""
echo "📂 Step 2: Exporting local database..."
PGPASSWORD='satyoga_dev_password' pg_dump -h localhost -U satyoga -d satyoga_db > /tmp/satyoga_db_backup.sql
echo "✓ Database exported to /tmp/satyoga_db_backup.sql"

echo ""
echo "📤 Step 3: Copying database to VPS..."
scp /tmp/satyoga_db_backup.sql $VPS_HOST:/tmp/
echo "✓ Database copied to VPS"

echo ""
echo "📥 Step 4: Importing database on VPS..."
ssh $VPS_HOST << 'ENDSSH'
docker exec -i satyoga_postgres psql -U satyoga -d satyoga_db < /tmp/satyoga_db_backup.sql
echo "✓ Database imported successfully"

# Verify import
echo "Verifying database..."
docker exec satyoga_postgres psql -U satyoga -d satyoga_db -c "SELECT COUNT(*) as teaching_count FROM teachings;"
ENDSSH

# Step 5: Deploy backend code
echo ""
echo "🐍 Step 5: Deploying backend code to VPS..."
ssh $VPS_HOST << 'ENDSSH'
# Create app directory
mkdir -p /opt/satyogamvp
cd /opt/satyogamvp

# Clone or pull latest code
if [ -d "satyogamvp/.git" ]; then
    cd satyogamvp
    git pull origin staging
else
    git clone -b staging https://github.com/da7a90-backup/satyogamvp.git
    cd satyogamvp
fi

cd backend

# Install Python and venv if needed
apt-get update -qq
apt-get install -y python3 python3-pip python3-venv

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://satyoga:satyoga_dev_password@localhost:5432/satyoga_db
JWT_SECRET=8UjV7ijehyLTBZmrC2gIq+D2WcM1XtZXkmP9AboS9vo=
ENVIRONMENT=production
DEBUG=False
FRONTEND_URL=https://satyogamvp.vercel.app
CORS_ORIGINS=https://satyogamvp.vercel.app,http://localhost:3000
EOF

echo "✓ Backend code deployed"
ENDSSH

# Step 6: Setup systemd service
echo ""
echo "⚙️  Step 6: Setting up systemd service..."
ssh $VPS_HOST << 'ENDSSH'
cat > /etc/systemd/system/satyogam-backend.service << 'EOF'
[Unit]
Description=SatyoGam FastAPI Backend
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/satyogamvp/satyogamvp/backend
Environment="PATH=/opt/satyogamvp/satyogamvp/backend/venv/bin"
ExecStart=/opt/satyogamvp/satyogamvp/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
systemctl daemon-reload
systemctl enable satyogam-backend
systemctl restart satyogam-backend

echo "✓ Backend service started"
sleep 3
systemctl status satyogam-backend --no-pager
ENDSSH

# Step 7: Test backend
echo ""
echo "🧪 Step 7: Testing backend..."
sleep 5
curl -s http://104.248.239.206:8000/ | head -20 || echo "⚠️  Backend not responding yet, check logs"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Backend URL: http://104.248.239.206:8000"
echo ""
echo "Useful commands:"
echo "  ssh $VPS_HOST 'systemctl status satyogam-backend'"
echo "  ssh $VPS_HOST 'journalctl -u satyogam-backend -f'"
echo "  ssh $VPS_HOST 'docker logs satyoga_postgres'"
echo ""
echo "Next: Update Vercel frontend env vars:"
echo "  NEXT_PUBLIC_FASTAPI_URL=http://104.248.239.206:8000"
