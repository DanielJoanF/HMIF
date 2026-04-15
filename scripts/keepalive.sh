#!/bin/bash

# Anti-Idle Script for Oracle Cloud
# This script keeps the VM active by performing health checks

LOG_FILE="/var/log/hmif-keepalive.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$TIMESTAMP] $1" >> "$LOG_FILE"
}

# Create log file if not exists
if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE"
fi

# Get IP address (try different methods)
IP_ADDRESS=$(hostname -I | awk '{print $1}')
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
fi

log_message "=== Keepalive Check Started ==="

# Check Frontend (Nginx)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    log_message "✓ Frontend: HTTP $FRONTEND_STATUS"
else
    log_message "✗ Frontend: HTTP $FRONTEND_STATUS (may be starting up)"
fi

# Check Backend API
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    log_message "✓ Backend: HTTP $BACKEND_STATUS"
else
    log_message "✗ Backend: HTTP $BACKEND_STATUS (may be starting up)"
fi

# Check Chatbot API
CHATBOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
if [ "$CHATBOT_STATUS" = "200" ]; then
    log_message "✓ Chatbot: HTTP $CHATBOT_STATUS"
else
    log_message "✗ Chatbot: HTTP $CHATBOT_STATUS (may be starting up)"
fi

# Generate some CPU activity (light calculation to prevent idle)
# This keeps CPU utilization above 20% threshold
echo "scale=1000; 4*a(1)" | bc -l > /dev/null 2>&1 || echo "1" | awk '{for(i=0;i<10000;i++)sqrt(i)}'

# Log system resources
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 || echo "0")
MEM_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}' || echo "0")
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1 || echo "0")

log_message "System Stats - CPU: ${CPU_USAGE}%, Mem: ${MEM_USAGE}%, Disk: ${DISK_USAGE}%"
log_message "=== Keepalive Check Complete ==="

# Rotate log if too large (keep last 1000 lines)
if [ $(wc -l < "$LOG_FILE") -gt 1000 ]; then
    tail -n 500 "$LOG_FILE" > "$LOG_FILE.tmp"
    mv "$LOG_FILE.tmp" "$LOG_FILE"
    log_message "Log rotated (kept last 500 lines)"
fi

exit 0
