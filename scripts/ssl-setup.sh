#!/bin/bash
# =============================================================================
# MONEMEE - SSL Certificate Setup Script (Let's Encrypt)
# =============================================================================
# Dieses Script richtet SSL-Zertifikate via Let's Encrypt/Certbot ein
# Usage: ./scripts/ssl-setup.sh <domain> [email]
# =============================================================================

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Argumente
DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Error: Domain required${NC}"
    echo "Usage: $0 <domain> [email]"
    echo "Example: $0 monemee.app admin@monemee.app"
    exit 1
fi

if [ -z "$EMAIL" ]; then
    EMAIL="admin@$DOMAIN"
    echo -e "${YELLOW}Using default email: $EMAIL${NC}"
fi

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
echo -e "${GREEN}=== SSL Setup for $DOMAIN ===${NC}"

# 1. Ersetze Domain in Nginx Config
echo -e "${YELLOW}Step 1: Updating Nginx configuration...${NC}"

# Backup original config
cp "$PROJECT_DIR/docker/nginx/conf.d/monemee.conf" "$PROJECT_DIR/docker/nginx/conf.d/monemee.conf.bak"

# Ersetze Placeholder
sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" "$PROJECT_DIR/docker/nginx/conf.d/monemee.conf"

echo "  Domain in Nginx config updated"

# 2. Starte mit Init-Config (ohne SSL)
echo -e "${YELLOW}Step 2: Starting with initial HTTP config...${NC}"

# Verwende temporaer die Init-Config
cp "$PROJECT_DIR/docker/nginx/conf.d/monemee.init.conf.template" "$PROJECT_DIR/docker/nginx/conf.d/default.conf"
sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" "$PROJECT_DIR/docker/nginx/conf.d/default.conf"

# Starte Nginx
docker compose up -d nginx

# Warte kurz
sleep 5

# 3. Hole SSL-Zertifikat
echo -e "${YELLOW}Step 3: Obtaining SSL certificate...${NC}"

docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# 4. Wechsle zu SSL-Config
echo -e "${YELLOW}Step 4: Switching to SSL configuration...${NC}"

# Entferne temporaere Config
rm "$PROJECT_DIR/docker/nginx/conf.d/default.conf"

# Starte Nginx mit SSL-Config neu
docker compose restart nginx

# 5. Verifiziere
echo -e "${YELLOW}Step 5: Verifying SSL setup...${NC}"
sleep 5

if curl -sf "https://$DOMAIN/health" > /dev/null 2>&1; then
    echo -e "${GREEN}SSL setup successful!${NC}"
    echo ""
    echo "Your site is now available at:"
    echo "  - https://$DOMAIN"
    echo "  - https://www.$DOMAIN"
    echo ""
    echo "Certificate renewal is automatic (Certbot runs every 12h)"
else
    echo -e "${RED}SSL verification failed${NC}"
    echo "Check the logs: docker compose logs nginx certbot"
    exit 1
fi

# 6. HSTS aktivieren (optional)
echo ""
echo -e "${YELLOW}Optional: Enable HSTS${NC}"
echo "Once you've verified everything works, uncomment the HSTS header in:"
echo "  $PROJECT_DIR/docker/nginx/conf.d/monemee.conf"
