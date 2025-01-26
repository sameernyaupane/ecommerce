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

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/backups"

# Create timestamped backup filename
BACKUP_FILE="$PROJECT_ROOT/backups/backup_$(date +%Y%m%d_%H%M%S).sql"

# Dump the database
echo "Creating backup..."
pg_dump -U $DB_USER -h $DB_HOST -d $DB_NAME --clean --if-exists -f "$BACKUP_FILE"

echo "Backup created at: $BACKUP_FILE" 