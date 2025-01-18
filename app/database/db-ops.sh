#!/bin/bash

# Function to display usage
show_usage() {
    echo "Usage: $0 [reset|backup|restore] [backup_file]"
    echo "Commands:"
    echo "  reset   - Drop and recreate the database with schema"
    echo "  backup  - Create a backup of the database"
    echo "  restore - Restore database from a backup file"
}

# Check if command is provided
if [ -z "$1" ]; then
    show_usage
    exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(cat "$PROJECT_ROOT/.env" | grep -v '#' | awk '/=/ {print $1}')
fi

BACKUP_DIR="$PROJECT_ROOT/backups"
mkdir -p "$BACKUP_DIR"

case "$1" in
    reset)
        echo "Resetting database..."
        docker compose -f compose.yml -f compose.db.yml run --rm db-utils sh -c \
            "psql -h \$PGHOST -U \$PGUSER -d postgres -c 'DROP DATABASE IF EXISTS \$PGDATABASE;' && \
             psql -h \$PGHOST -U \$PGUSER -d postgres -c 'CREATE DATABASE \$PGDATABASE;' && \
             psql -h \$PGHOST -U \$PGUSER -d \$PGDATABASE -f /scripts/schema.sql"
        ;;
    
    backup)
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"
        echo "Creating backup at $BACKUP_FILE..."
        docker compose -f compose.yml -f compose.db.yml run --rm db-utils \
            pg_dump -h "$PG_HOST" -U "$PG_USERNAME" -d "$PG_DATABASE" -F p > "$BACKUP_FILE"
        ;;
    
    restore)
        if [ -z "$2" ]; then
            echo "Error: Backup file not specified"
            show_usage
            exit 1
        fi
        
        if [ ! -f "$2" ]; then
            echo "Error: Backup file not found: $2"
            exit 1
        }
        
        echo "Restoring from backup: $2..."
        docker compose -f compose.yml -f compose.db.yml run --rm db-utils sh -c \
            "psql -h \$PGHOST -U \$PGUSER -d postgres -c 'DROP DATABASE IF EXISTS \$PGDATABASE;' && \
             psql -h \$PGHOST -U \$PGUSER -d postgres -c 'CREATE DATABASE \$PGDATABASE;' && \
             psql -h \$PGHOST -U \$PGUSER -d \$PGDATABASE < /scripts/$(basename "$2")"
        ;;
    
    *)
        echo "Invalid command: $1"
        show_usage
        exit 1
        ;;
esac 