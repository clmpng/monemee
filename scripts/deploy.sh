#!/bin/bash
# =============================================================================
# MONEMEE - Deployment Script
# =============================================================================
# Dieses Script wird auf dem Server ausgefuehrt um die App zu deployen
# Usage: ./scripts/deploy.sh [--build] [--migrate]
# =============================================================================

set -e

# Farben fuer Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Konfiguration
PROJECT_DIR="${PROJECT_DIR:-/opt/monemee}"
COMPOSE_FILE="docker-compose.yml"

# Flags
BUILD=false
MIGRATE=false

# Parse Arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build|-b)
            BUILD=true
            shift
            ;;
        --migrate|-m)
            MIGRATE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--build] [--migrate]"
            echo "  --build, -b     Build Docker images locally"
            echo "  --migrate, -m   Run database migrations"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}=== Monemee Deployment ===${NC}"
echo "Project Dir: $PROJECT_DIR"
echo "Build: $BUILD"
echo "Migrate: $MIGRATE"
echo ""

# Wechsle ins Projektverzeichnis
cd "$PROJECT_DIR"

# Git Pull (falls Git verwendet wird)
if [ -d ".git" ]; then
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    git fetch origin main
    git reset --hard origin/main
fi

# Build oder Pull
if [ "$BUILD" = true ]; then
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker compose -f "$COMPOSE_FILE" build --no-cache app
else
    echo -e "${YELLOW}Pulling Docker images...${NC}"
    docker compose -f "$COMPOSE_FILE" pull app
fi

# Migrations ausfuehren (vor dem Neustart)
if [ "$MIGRATE" = true ]; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    for migration in database/migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo "  - $(basename $migration)"
            docker compose -f "$COMPOSE_FILE" exec -T db psql -U monemee -d monemee -f "/docker-entrypoint-initdb.d/migrations/$(basename $migration)" 2>/dev/null || true
        fi
    done
fi

# Starte App Container neu
echo -e "${YELLOW}Restarting app container...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --no-deps app

# Warte auf Health Check
echo -e "${YELLOW}Waiting for health check...${NC}"
sleep 10

# Verifiziere Deployment
if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}Health check passed!${NC}"
else
    echo -e "${RED}Health check failed!${NC}"
    echo "Checking logs..."
    docker compose -f "$COMPOSE_FILE" logs --tail=50 app
    exit 1
fi

# Bereinige alte Images
echo -e "${YELLOW}Cleaning up old images...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}=== Deployment completed successfully! ===${NC}"
echo "App is running at: $(docker compose -f "$COMPOSE_FILE" ps --format '{{.Status}}' app)"
