#!/bin/bash

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(cat "$PROJECT_ROOT/.env" | grep -v '#' | awk '/=/ {print $1}')
fi

# Get the commands directory
COMMANDS_DIR="$(dirname "${BASH_SOURCE[0]}")/commands"

# Run all .js files in the commands directory
for command in "$COMMANDS_DIR"/*.js; do
  if [ -f "$command" ]; then
    echo "Running analysis: $(basename "$command")"
    echo "----------------------------------------"
    node "$command"
    echo -e "\n"
  fi
done 