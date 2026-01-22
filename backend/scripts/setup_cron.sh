#!/bin/bash

# Setup Cron Job for Trial Expiration Processing
# This script adds a daily cron job to process expiring membership trials

echo "Setting up Sat Yoga trial expiration cron job..."

# Read the CRON_SECRET_KEY from .env
CRON_SECRET=$(grep CRON_SECRET_KEY ../.env | cut -d '=' -f2)

if [ -z "$CRON_SECRET" ]; then
    echo "❌ Error: CRON_SECRET_KEY not found in .env file"
    exit 1
fi

# Determine API URL (default to localhost for dev)
API_URL=${API_URL:-"http://localhost:8000"}

echo "API URL: $API_URL"
echo "Cron Secret: ${CRON_SECRET:0:20}... (truncated)"

# Create the cron command
CRON_CMD="0 2 * * * curl -X POST -H 'X-Cron-Secret: $CRON_SECRET' $API_URL/api/cron/process-trials >> /var/log/satyoga-cron.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "satyoga-cron.log"; then
    echo "⚠️  Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "satyoga-cron.log" | crontab -
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo "✅ Cron job added successfully!"
echo ""
echo "Schedule: Daily at 2:00 AM UTC"
echo "Endpoint: $API_URL/api/cron/process-trials"
echo "Log file: /var/log/satyoga-cron.log"
echo ""
echo "To view current crontab:"
echo "  crontab -l"
echo ""
echo "To view cron logs:"
echo "  tail -f /var/log/satyoga-cron.log"
echo ""
echo "To remove the cron job:"
echo "  crontab -e  # then delete the line with 'satyoga-cron.log'"
