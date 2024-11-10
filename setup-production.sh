#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Function to generate random string
generate_random_string() {
    openssl rand -base64 32
}

# Function to read user input with default value
read_input() {
    local prompt="$1"
    local default="$2"
    local value

    read -p "$prompt [$default]: " value
    echo "${value:-$default}"
}

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root"
    exit 1
fi

# Load environment variables from .env
if [ ! -f .env ]; then
    print_error ".env file not found"
    exit 1
fi

# Update system
print_message "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_message "Installing required packages..."
# Add required minimum Node.js version check
if ! command -v node &> /dev/null || ! node -v | grep -q "v[0-9]\{2\}"; then
    print_error "Node.js 18 or higher is required"
    exit 1
fi

apt install -y curl wget git postgresql build-essential redis-server libcap2-bin

# Install Node.js 20.x
print_message "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Allow Node.js to bind to port 80
print_message "Setting capabilities for Node.js..."
setcap 'cap_net_bind_service=+ep' $(which node)

# Create application user
print_message "Creating application user..."
useradd -m -s /bin/bash ecommerce || print_warning "User already exists"

# Create application directory
print_message "Setting up application directory..."
mkdir -p /var/www/ecommerce
chown ecommerce:ecommerce /var/www/ecommerce

# Prompt for environment variables
print_message "Setting up environment variables..."

# Server Details
PORT=$(read_input "Enter port number" "80")
HOST=$(read_input "Enter host" "0.0.0.0")

# Database Details
PG_HOST=$(read_input "Enter PostgreSQL host" "localhost")
PG_PORT=$(read_input "Enter PostgreSQL port" "5432")
PG_DATABASE=$(read_input "Enter PostgreSQL database name" "ecommerce_db")
PG_USERNAME=$(read_input "Enter PostgreSQL username" "ecommerce_user")
PG_PASSWORD=$(read_input "Enter PostgreSQL password" "test")
PG_DEBUG=$(read_input "Enable PostgreSQL debug" "false")

# Redis Details
REDIS_HOST=$(read_input "Enter Redis host" "localhost")
REDIS_PORT=$(read_input "Enter Redis port" "6379")
REDIS_PASSWORD=$(read_input "Enter Redis password (leave empty if none)" "")

# Session Secret
SESSION_SECRET=$(generate_random_string)

# Google OAuth (optional)
print_message "Google OAuth setup (press Enter to skip)"
GOOGLE_CLIENT_ID=$(read_input "Enter Google Client ID" "")
GOOGLE_CLIENT_SECRET=$(read_input "Enter Google Client Secret" "")
GOOGLE_CALLBACK_URL=$(read_input "Enter Google Callback URL" "")

# Setup PostgreSQL
print_message "Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER $PG_USERNAME WITH PASSWORD '$PG_PASSWORD';" || print_warning "Database user already exists"
sudo -u postgres psql -c "CREATE DATABASE $PG_DATABASE OWNER $PG_USERNAME;" || print_warning "Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $PG_DATABASE TO $PG_USERNAME;"

# Create required directories
print_message "Creating required directories..."
mkdir -p /var/www/ecommerce/public/uploads/{products,profiles,categories}
mkdir -p /var/www/ecommerce/build/{client,server}
mkdir -p /var/www/ecommerce/sessions

# Set permissions
print_message "Setting correct permissions..."
chown -R ecommerce:ecommerce /var/www/ecommerce
chmod -R 755 /var/www/ecommerce

# Create environment file
print_message "Creating environment file..."
cat > /var/www/ecommerce/.env << EOL
# Server Details
PORT=$PORT
HOST=$HOST

# Database
PG_HOST=$PG_HOST
PG_PORT=$PG_PORT
PG_DATABASE=$PG_DATABASE
PG_USERNAME=$PG_USERNAME
PG_PASSWORD=$PG_PASSWORD
PG_DEBUG=$PG_DEBUG

# Redis
REDIS_HOST=$REDIS_HOST
REDIS_PORT=$REDIS_PORT
REDIS_PASSWORD=$REDIS_PASSWORD

# Session
SESSION_SECRET=$SESSION_SECRET

# Environment
NODE_ENV=production

# Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=$GOOGLE_CALLBACK_URL
EOL

# Setup systemd service
print_message "Creating systemd service..."
cat > /etc/systemd/system/ecommerce.service << EOL
[Unit]
Description=Ecommerce Node.js Application
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=ecommerce
WorkingDirectory=/var/www/ecommerce
Environment=NODE_ENV=production
ExecStartPre=/usr/bin/npm run build
ExecStart=/usr/bin/npm start
Restart=always

# Security settings
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ReadWritePaths=/var/www/ecommerce

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd
systemctl daemon-reload

print_message "Setup complete! Next steps:"
echo "1. Clone your repository to /var/www/ecommerce:"
echo "   sudo -u ecommerce git clone <your-repo-url> /var/www/ecommerce"
echo "2. Install dependencies:"
echo "   sudo -u ecommerce npm install --production"
echo "3. Create required directories:"
echo "   sudo -u ecommerce mkdir -p sessions"
echo "4. Start and enable the services:"
echo "   systemctl start redis-server postgresql ecommerce"
echo "   systemctl enable redis-server postgresql ecommerce"
echo ""
print_message "Additional security recommendations:"
echo "1. The SESSION_SECRET has been automatically generated"
echo "2. Database passwords have been set as specified"
echo "3. Consider setting up a firewall (ufw)"
echo "4. Regularly update system packages" 