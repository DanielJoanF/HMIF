#!/bin/bash

# VPS Deployment Script for HMIF Platform
# Tested on Ubuntu 20.04/22.04 LTS

set -e

echo "=========================================="
echo "HMIF Platform VPS Deployment Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Variables
APP_DIR="/var/www/hmif-platform"
DOMAIN="${1:-example.com}"  # Pass domain as argument

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
apt-get install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 20.x
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -g pm2

# Install Python & pip
echo -e "${YELLOW}Installing Python...${NC}"
apt-get install -y python3 python3-pip python3-venv

# Setup application directory
echo -e "${YELLOW}Setting up application directory...${NC}"
mkdir -p $APP_DIR

# Clone repository (or copy files)
# If files are already there, skip this
if [ ! -d "$APP_DIR/.git" ]; then
    echo -e "${RED}Please copy your project files to $APP_DIR first${NC}"
    exit 1
fi

cd $APP_DIR

# Install frontend dependencies and build
echo -e "${YELLOW}Building frontend...${NC}"
npm install
npm run build

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd server
npm install --production
cd ..

# Setup Python virtual environment for chatbot
echo -e "${YELLOW}Setting up Python virtual environment...${NC}"
cd chatbot-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Create PM2 ecosystem file
echo -e "${YELLOW}Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'hmif-backend',
      cwd: './server',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'hmif-chatbot',
      cwd: './chatbot-api',
      script: 'venv/bin/uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        PYTHONUNBUFFERED: '1'
      }
    }
  ]
};
EOF

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/hmif-platform << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend static files
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
    }

    # Chatbot API
    location /chatbot/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/hmif-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Start applications with PM2
echo -e "${YELLOW}Starting applications...${NC}"
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save
pm2 startup systemd

# Setup SSL with Let's Encrypt (optional)
if [ "$DOMAIN" != "example.com" ]; then
    echo -e "${YELLOW}Setting up SSL certificate...${NC}"
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Your application should be accessible at:"
echo "  - Website: http://$DOMAIN (or https://$DOMAIN if SSL enabled)"
echo "  - API: http://$DOMAIN/api"
echo "  - Chatbot: http://$DOMAIN/chatbot"
echo ""
echo "Environment Setup:"
echo "  1. Edit $APP_DIR/.env with your MongoDB URI and other secrets"
echo "  2. Restart PM2: pm2 restart all"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all services"
echo "  pm2 stop all        - Stop all services"
echo ""
