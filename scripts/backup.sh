#!/bin/bash
# =============================================================================
# MONEMEE - Database Backup Script
# =============================================================================
# Erstellt automatische Backups der PostgreSQL-Datenbank
# Usage: ./scripts/backup.sh [--restore <backup-file>]
# =============================================================================

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Konfiguration
PROJECT_DIR="${PROJECT_DIR:-/opt/monemee}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
DB_CONTAINER="monemee-db"
DB_NAME="${DB_NAME:-monemee}"
DB_USER="${DB_USER:-monemee}"
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/monemee_${TIMESTAMP}.sql.gz"

# Parse Arguments
RESTORE_FILE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --restore|-r)
            RESTORE_FILE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--restore <backup-file>]"
            echo ""
            echo "Options:"
            echo "  --restore, -r  Restore from backup file"
            echo ""
            echo "Examples:"
            echo "  $0                          # Create backup"
            echo "  $0 --restore backup.sql.gz  # Restore from backup"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Restore Mode
if [ -n "$RESTORE_FILE" ]; then
    echo -e "${YELLOW}=== Restoring Database ===${NC}"

    if [ ! -f "$RESTORE_FILE" ]; then
        echo -e "${RED}Backup file not found: $RESTORE_FILE${NC}"
        exit 1
    fi

    echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi

    echo -e "${YELLOW}Restoring from: $RESTORE_FILE${NC}"

    # Entpacke und restore
    if [[ "$RESTORE_FILE" == *.gz ]]; then
        gunzip -c "$RESTORE_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
    else
        docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"
    fi

    echo -e "${GREEN}Database restored successfully!${NC}"
    exit 0
fi

# Backup Mode
echo -e "${GREEN}=== Creating Database Backup ===${NC}"

# Erstelle Backup-Verzeichnis falls nicht vorhanden
mkdir -p "$BACKUP_DIR"

# Erstelle Backup
echo -e "${YELLOW}Creating backup: $BACKUP_FILE${NC}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$BACKUP_FILE"

# Verifiziere Backup
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}Backup created successfully: $BACKUP_FILE ($SIZE)${NC}"
else
    echo -e "${RED}Backup failed!${NC}"
    exit 1
fi

# Loesche alte Backups
echo -e "${YELLOW}Cleaning up backups older than $RETENTION_DAYS days...${NC}"
find "$BACKUP_DIR" -name "monemee_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Liste verbleibende Backups
echo ""
echo "Available backups:"
ls -lh "$BACKUP_DIR"/monemee_*.sql.gz 2>/dev/null | tail -10

echo ""
echo -e "${GREEN}=== Backup completed ===${NC}"
