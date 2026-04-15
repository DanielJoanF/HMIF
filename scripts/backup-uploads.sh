#!/bin/bash

# Backup Uploads Folder to Oracle Object Storage
# This prevents data loss if VM is deleted due to idle

set -e

# Configuration
BACKUP_DIR="/opt/hmif-platform/uploads"
LOG_FILE="/var/log/hmif-backup.log"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# OCI Object Storage Configuration
# These should be set in environment or OCI config
BUCKET_NAME="${OCI_BUCKET_NAME:-hmif-uploads-backup}"
NAMESPACE="${OCI_NAMESPACE:-}"
BACKUP_RETENTION_DAYS=7

# Function to log messages
log_message() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

log_message "=== Backup Started ==="

# Check if uploads directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_message "✗ Error: Uploads directory not found at $BACKUP_DIR"
    exit 1
fi

# Check if there are files to backup
FILE_COUNT=$(find "$BACKUP_DIR" -type f 2>/dev/null | wc -l)
if [ "$FILE_COUNT" -eq 0 ]; then
    log_message "ℹ No files to backup (uploads folder is empty)"
    log_message "=== Backup Complete (nothing to backup) ==="
    exit 0
fi

log_message "Found $FILE_COUNT files to backup"

# Create backup archive
BACKUP_FILE="uploads_backup_${TIMESTAMP}.tar.gz"
BACKUP_PATH="/tmp/${BACKUP_FILE}"

log_message "Creating backup archive..."
if tar -czf "$BACKUP_PATH" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")" 2>/dev/null; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log_message "✓ Backup archive created: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log_message "✗ Error: Failed to create backup archive"
    exit 1
fi

# Upload to Oracle Object Storage (if OCI CLI is configured)
if command -v oci &> /dev/null && [ -n "$NAMESPACE" ]; then
    log_message "Uploading to Oracle Object Storage..."
    
    if oci os object put \
        --bucket-name "$BUCKET_NAME" \
        --namespace-name "$NAMESPACE" \
        --file "$BACKUP_PATH" \
        --name "$BACKUP_FILE" \
        --force 2>/dev/null; then
        log_message "✓ Uploaded to Object Storage: $BACKUP_FILE"
    else
        log_message "✗ Warning: Failed to upload to Object Storage"
        log_message "  Backup saved locally at: $BACKUP_PATH"
    fi
    
    # Clean up old backups in Object Storage (keep last 7 days)
    log_message "Cleaning up old backups..."
    oci os object list \
        --bucket-name "$BUCKET_NAME" \
        --namespace-name "$NAMESPACE" \
        --query "data[?starts_with(name, 'uploads_backup_')].name" \
        2>/dev/null | jq -r '.[]' 2>/dev/null | while read -r old_backup; do
        # Extract date from filename (format: uploads_backup_YYYYMMDD_HHMMSS.tar.gz)
        backup_date=$(echo "$old_backup" | grep -oP '\d{8}' || echo "")
        if [ -n "$backup_date" ]; then
            backup_timestamp=$(date -d "$backup_date" +%s 2>/dev/null || echo "0")
            current_timestamp=$(date +%s)
            age_days=$(( (current_timestamp - backup_timestamp) / 86400 ))
            
            if [ "$age_days" -gt "$BACKUP_RETENTION_DAYS" ]; then
                if oci os object delete \
                    --bucket-name "$BUCKET_NAME" \
                    --namespace-name "$NAMESPACE" \
                    --name "$old_backup" \
                    --force 2>/dev/null; then
                    log_message "  Deleted old backup: $old_backup"
                fi
            fi
        fi
    done
else
    log_message "ℹ OCI CLI not configured. Keeping local backup only."
    
    # Move to persistent backup location
    LOCAL_BACKUP_DIR="/opt/backups"
    mkdir -p "$LOCAL_BACKUP_DIR"
    mv "$BACKUP_PATH" "$LOCAL_BACKUP_DIR/"
    log_message "✓ Local backup saved to: $LOCAL_BACKUP_DIR/$BACKUP_FILE"
    
    # Clean up old local backups (keep last 7)
    ls -t "$LOCAL_BACKUP_DIR"/uploads_backup_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
    log_message "✓ Cleaned up old local backups (kept last 7)"
fi

# Clean up temp file
rm -f "$BACKUP_PATH"

# Rotate log if too large
if [ $(wc -l < "$LOG_FILE" 2>/dev/null || echo "0") -gt 1000 ]; then
    tail -n 500 "$LOG_FILE" > "$LOG_FILE.tmp"
    mv "$LOG_FILE.tmp" "$LOG_FILE"
    log_message "Log rotated (kept last 500 lines)"
fi

log_message "=== Backup Complete ==="

exit 0
