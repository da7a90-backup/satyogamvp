#!/bin/bash

# Database Export Script for Vercel Deployment
# This script exports the PostgreSQL database schema and data for migration to Vercel Postgres

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Database Export for Vercel Deployment ===${NC}\n"

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps | grep -q satyoga_postgres; then
    echo -e "${RED}Error: PostgreSQL container 'satyoga_postgres' is not running.${NC}"
    echo -e "${YELLOW}Please start it with: docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}Found running PostgreSQL container: satyoga_postgres${NC}"

# Database credentials from running Docker container
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="satyoga"
DB_PASSWORD="satyoga_dev_password"
DB_NAME="satyoga_db"

# Export directory
EXPORT_DIR="$(dirname "$0")/database_export"
mkdir -p "$EXPORT_DIR"

echo -e "${GREEN}Exporting database schema...${NC}"
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema-only \
    -f "$EXPORT_DIR/schema.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema exported to: $EXPORT_DIR/schema.sql${NC}"
else
    echo -e "${RED}✗ Schema export failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}Exporting database data...${NC}"
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --data-only \
    --no-owner \
    --no-privileges \
    -f "$EXPORT_DIR/data.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Data exported to: $EXPORT_DIR/data.sql${NC}"
else
    echo -e "${RED}✗ Data export failed${NC}"
    exit 1
fi

# Export table row counts for verification
echo -e "\n${GREEN}Generating verification report...${NC}"
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "
        SELECT
            schemaname || '.' || tablename AS table_name,
            n_live_tup AS row_count
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
    " > "$EXPORT_DIR/table_counts.txt"

echo -e "${GREEN}✓ Table counts saved to: $EXPORT_DIR/table_counts.txt${NC}"

# Create combined export for easier import
echo -e "\n${GREEN}Creating combined export file...${NC}"
cat "$EXPORT_DIR/schema.sql" "$EXPORT_DIR/data.sql" > "$EXPORT_DIR/complete_export.sql"
echo -e "${GREEN}✓ Complete export saved to: $EXPORT_DIR/complete_export.sql${NC}"

# Display summary
echo -e "\n${GREEN}=== Export Complete ===${NC}"
echo -e "Files created in ${YELLOW}$EXPORT_DIR/${NC}:"
echo -e "  - schema.sql (database schema only)"
echo -e "  - data.sql (database data only)"
echo -e "  - complete_export.sql (schema + data combined)"
echo -e "  - table_counts.txt (row counts for verification)"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Create Vercel Postgres databases (staging & production)"
echo -e "2. Connect to Vercel Postgres using psql or Vercel dashboard"
echo -e "3. Import using: psql -h <vercel-host> -U <user> -d <db> < $EXPORT_DIR/complete_export.sql"
echo -e "4. Verify row counts match table_counts.txt"
