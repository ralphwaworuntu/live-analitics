#!/bin/bash
# ============================================
# SENTINEL — Automated Database Backup Script
# Biro Operasi Polda NTT
# ============================================
# Cron schedule (tambahkan ke crontab -e):
#   0 2 * * * /opt/sentinel/scripts/backup.sh >> /var/log/sentinel-backup.log 2>&1
# ============================================

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/sentinel/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sentinel_db_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "============================================"
echo "[${TIMESTAMP}] Starting SENTINEL Database Backup..."
echo "============================================"

# Dump PostgreSQL via Docker
docker exec sentinel-db-1 pg_dump \
    -U sentinel \
    -d sentinel_db \
    --format=custom \
    --compress=9 \
    --verbose \
    | gzip > "${BACKUP_FILE}"

# Verify backup
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup berhasil: ${BACKUP_FILE} (${FILESIZE})"
else
    echo "❌ Backup GAGAL! File kosong atau tidak ada."
    exit 1
fi

# Cleanup old backups (retention policy)
echo "🧹 Membersihkan backup lama (>${RETENTION_DAYS} hari)..."
find "${BACKUP_DIR}" -name "sentinel_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Count remaining backups
REMAINING=$(ls -1 "${BACKUP_DIR}"/sentinel_db_*.sql.gz 2>/dev/null | wc -l)
echo "📦 Total backup tersimpan: ${REMAINING}"
echo "============================================"
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Backup selesai."
echo "============================================"
