#!/bin/bash

# Oracle Cloud VPS Setup Script for HMIF Platform
# Run this script on fresh Oracle Cloud VM (Ubuntu 22.04 LTS)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  HMIF Platform - Oracle Cloud Setup  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use: sudo bash setup-oracle.sh)${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install essential packages
echo -e "${YELLOW}[2/10] Installing essential packages...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    net-tools \
    unzip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    cron \
    logrotate

# Install Docker
echo -e "${YELLOW}[3/10] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
else
    echo -e "${GREEN}Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}[4/10] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
    echo -e "${GREEN}Docker Compose already installed${NC}"
fi

# Install Nginx
echo -e "${YELLOW}[5/10] Installing Nginx...${NC}"
apt-get install -y nginx
systemctl enable nginx
systemctl stop nginx  # We'll use nginx in Docker instead

# Install Certbot (for SSL later)
echo -e "${YELLOW}[6/10] Installing Certbot...${NC}"
apt-get install -y certbot python3-certbot-nginx

# Install OCI CLI (for Object Storage backup)
echo -e "${YELLOW}[7/10] Installing OCI CLI...${NC}"
if ! command -v oci &> /dev/null; then
    bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)" < /dev/stdin --accept-all-defaults
    export PATH="$HOME/bin:$PATH"
else
    echo -e "${GREEN}OCI CLI already installed${NC}"
fi

# Create application directory
echo -e "${YELLOW}[8/10] Setting up application directory...${NC}"
APP_DIR="/opt/hmif-platform"
mkdir -p $APP_DIR
cd $APP_DIR

# Create necessary directories
mkdir -p uploads logs/nginx logs/backend logs/chatbot

# Set permissions
chmod -R 755 uploads logs

# Configure firewall
echo -e "${YELLOW}[9/10] Configuring firewall...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5000/tcp
ufw allow 8000/tcp

echo -e "${YELLOW}[10/10] Setup complete!${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete! Next Steps:          ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "1. Clone your repository:"
echo "   cd $APP_DIR"
echo "   git clone https://github.com/yourusername/hmif-platform.git ."
echo ""
echo "2. Copy environment file:"
echo "   cp .env .env.oracle"
echo "   # Edit .env.oracle with your credentials"
echo ""
echo "3. Deploy application:"
echo "   docker-compose -f docker-compose.oracle.yml up -d"
echo ""
echo "4. Setup anti-idle:"
echo "   bash scripts/setup-cron.sh"
echo ""
echo "5. Configure OCI CLI for backups (optional):"
echo "   oci setup config"
echo ""
echo -e "${GREEN}Your application will be available at:${NC}"
echo "  - Frontend: http://$(curl -s ifconfig.me)"
echo "  - Backend API: http://$(curl -s ifconfig.me):5000"
echo "  - Chatbot API: http://$(curl -s ifconfig.me):8000"
echo ""
