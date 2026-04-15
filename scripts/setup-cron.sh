#!/bin/bash

# Setup Anti-Idle Cron Jobs for Oracle Cloud

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setting up Anti-Idle Cron Jobs     ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use: sudo bash setup-cron.sh)${NC}"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEEPALIVE_SCRIPT="$SCRIPT_DIR/keepalive.sh"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-uploads.sh"

# Make scripts executable
chmod +x "$KEEPALIVE_SCRIPT"
chmod +x "$BACKUP_SCRIPT"

# Create cron jobs
echo -e "${YELLOW}Setting up cron jobs...${NC}"

# Remove old cron jobs if exist
(crontab -l 2>/dev/null | grep -v "keepalive.sh" | grep -v "backup-uploads.sh") | crontab - 2>/dev/null || true

# Add new cron jobs
(
    echo "# HMIF Platform - Anti-Idle Cron Jobs"
    echo "# Run keepalive every 10 minutes"
    echo "*/10 * * * * $KEEPALIVE_SCRIPT > /dev/null 2>&1"
    echo ""
    echo "# Backup uploads daily at 2 AM"
    echo "0 2 * * * $BACKUP_SCRIPT > /dev/null 2>&1"
    echo ""
    echo "# Log rotation weekly"
    echo "0 3 * * 0 /usr/sbin/logrotate -f /etc/logrotate.d/hmif-platform 2>/dev/null || true"
) | crontab -

echo -e "${GREEN}✓ Cron jobs installed${NC}"

# Create logrotate config
echo -e "${YELLOW}Setting up log rotation...${NC}"
cat > /etc/logrotate.d/hmif-platform << EOF
/var/log/hmif-keepalive.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}

/opt/hmif-platform/logs/**/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

echo -e "${GREEN}✓ Log rotation configured${NC}"

# Create systemd service for keepalive (alternative to cron)
echo -e "${YELLOW}Creating systemd service...${NC}"
cat > /etc/systemd/system/hmif-keepalive.service << EOF
[Unit]
Description=HMIF Platform Keepalive Service
After=network.target

[Service]
Type=simple
ExecStart=$KEEPALIVE_SCRIPT
Restart=always
RestartSec=300
User=root

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload
systemctl enable hmif-keepalive.service
systemctl start hmif-keepalive.service

echo -e "${GREEN}✓ Systemd service created and started${NC}"

# Verify installation
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete!              ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Cron Jobs:"
echo "  - Keepalive: Every 10 minutes"
echo "  - Backup uploads: Daily at 2 AM"
echo "  - Log rotation: Weekly"
echo ""
echo "Active Jobs:"
crontab -l | grep -v "^#" | grep -v "^$"
echo ""
echo "Services:"
systemctl status hmif-keepalive.service --no-pager -l || echo "Service starting..."
echo ""
echo "To check logs:"
echo "  tail -f /var/log/hmif-keepalive.log"
echo ""
echo "To manually run keepalive:"
echo "  sudo bash $KEEPALIVE_SCRIPT"
echo ""
