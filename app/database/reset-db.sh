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

echo "Dropping and recreating database..."

# Export password for database commands
export PGPASSWORD=$DB_PASSWORD

# First, terminate all connections to the database
psql -U $DB_USER -h localhost -d postgres <<EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
AND pid <> pg_backend_pid();
EOF

# Drop and recreate database
psql -U $DB_USER -h localhost -d postgres <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

echo "Database recreated."

# Connect to the new database and run the schema
echo "Applying schema..."
psql -U $DB_USER -h localhost -d $DB_NAME -f "$PROJECT_ROOT/app/database/schema.sql"

echo "Database reset complete!" 