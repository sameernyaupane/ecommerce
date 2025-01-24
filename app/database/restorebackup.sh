#!/bin/bash

# Get the project root directory (one level up from the script location)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(cat "$PROJECT_ROOT/.env" | grep -v '#' | awk '/=/ {print $1}')
fi

# Database connection details
DB_NAME=${PG_DATABASE:-"ecommerce_db"}
DB_USER=${PG_USERNAME:-"ecommerce_user"}
DB_PASSWORD=${PG_PASSWORD:-"test"}
DB_HOST=${PG_HOST:-"localhost"}

# Export password for database commands
export PGPASSWORD=$DB_PASSWORD

# Connect to the new database and run the schema
echo "Applying backup..."
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f "$PROJECT_ROOT/app/database/drop.sql"
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f "$PROJECT_ROOT/backups/backup.sql"

echo "Database reset complete!" 