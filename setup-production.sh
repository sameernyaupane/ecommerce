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

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root"
    exit 1
fi

# Update system
print_message "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_message "Installing required packages..."
apt install -y curl wget git postgresql nginx certbot python3-certbot-nginx build-essential redis-server

# Install Node.js 20.x
print_message "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Create application user
print_message "Creating application user..."
useradd -m -s /bin/bash ecommerce || print_warning "User already exists"

# Create application directory
print_message "Setting up application directory..."
mkdir -p /var/www/ecommerce
chown ecommerce:ecommerce /var/www/ecommerce

# Setup PostgreSQL
print_message "Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE USER ecommerce_user WITH PASSWORD 'test';" || print_warning "Database user already exists"
sudo -u postgres psql -c "CREATE DATABASE ecommerce_db OWNER ecommerce_user;" || print_warning "Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;"

# Create required directories
print_message "Creating required directories..."
mkdir -p /var/www/ecommerce/public/uploads/{products,profiles}
mkdir -p /var/www/ecommerce/build/{client,server}
mkdir -p /var/www/ecommerce/sessions

# Set permissions
print_message "Setting correct permissions..."
chown -R ecommerce:ecommerce /var/www/ecommerce
chmod -R 755 /var/www/ecommerce

# Create environment file
print_message "Creating environment file..."
cat > /var/www/ecommerce/.env << EOL
NODE_ENV=production
PORT=3000
HOST=localhost

# Database
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=ecommerce_db
PG_USERNAME=ecommerce_user
PG_PASSWORD=test
PG_DEBUG=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Session
SESSION_SECRET=your-secret-key-here
EOL

# Setup Nginx configuration
print_message "Setting up Nginx configuration..."
cat > /etc/nginx/sites-available/ecommerce << EOL
server {
    listen 80;
    server_name ecommerce.com.np;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /assets {
        alias /var/www/ecommerce/build/client/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /var/www/ecommerce/public/uploads;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

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
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd
systemctl daemon-reload

print_message "Setup complete! Next steps:"
echo "1. Clone your repository to /var/www/ecommerce"
echo "2. Run 'npm install' in the application directory"
echo "3. Run 'npm run build' to build the application"
echo "4. Start the services:"
echo "   systemctl start redis-server"
echo "   systemctl start postgresql"
echo "   systemctl start ecommerce"
echo "5. Enable the services:"
echo "   systemctl enable redis-server"
echo "   systemctl enable postgresql"
echo "   systemctl enable ecommerce"
echo "6. Setup SSL with: certbot --nginx -d ecommerce.com.np"
echo "7. Restart Nginx: systemctl restart nginx" 