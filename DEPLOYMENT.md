# Monemee Deployment Guide

Diese Anleitung beschreibt das Deployment von Monemee auf einem eigenen Linux-Server mit Docker und automatischem CI/CD via GitHub Actions.

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                         Linux Server                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Docker Network                          │  │
│  │                                                            │  │
│  │   ┌─────────┐    ┌──────────────┐    ┌───────────────┐   │  │
│  │   │  Nginx  │───►│  Monemee App │───►│  PostgreSQL   │   │  │
│  │   │ :80/:443│    │    :5000     │    │    :5432      │   │  │
│  │   └─────────┘    └──────────────┘    └───────────────┘   │  │
│  │        │                                                   │  │
│  │   ┌─────────┐                                              │  │
│  │   │ Certbot │  (SSL-Zertifikate)                          │  │
│  │   └─────────┘                                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   GitHub Actions   │
                    │  (CI/CD Pipeline)  │
                    └───────────────────┘
```

## Server-Anforderungen

- **OS**: Ubuntu 22.04 LTS oder Debian 12 (empfohlen)
- **RAM**: Mindestens 2 GB (4 GB empfohlen)
- **CPU**: 2 vCores (4 empfohlen)
- **Storage**: 20 GB SSD
- **Ports**: 80 (HTTP), 443 (HTTPS), 22 (SSH)

## 1. Server vorbereiten

### 1.1 Docker installieren

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Docker installieren (offizielles Script)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker ohne sudo nutzen
sudo usermod -aG docker $USER

# Docker Compose (ist bei modernem Docker dabei)
docker compose version
```

### 1.2 Projekt klonen

```bash
# Projekt-Verzeichnis erstellen
sudo mkdir -p /opt/monemee
sudo chown $USER:$USER /opt/monemee

# Repository klonen
cd /opt/monemee
git clone https://github.com/YOUR_USERNAME/monemee.git .

# Skripte ausführbar machen
chmod +x scripts/*.sh
```

### 1.3 Environment-Datei erstellen

```bash
# .env Datei erstellen
cp server/.env.example .env

# Bearbeite die Datei mit deinen Werten
nano .env
```

**Wichtige Umgebungsvariablen:**

```env
# =============================================================================
# MONEMEE - Production Environment
# =============================================================================

# Server
NODE_ENV=production
PORT=5000
CLIENT_URL=https://deine-domain.com

# Database
DB_USER=monemee
DB_PASSWORD=SICHERES_PASSWORT_HIER
DB_NAME=monemee

# Firebase Admin SDK
FIREBASE_PROJECT_ID=dein-projekt-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@dein-projekt.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com

# Firebase Client (für Build)
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=dein-projekt-id
REACT_APP_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx

# Stripe (Live-Keys für Produktion)
STRIPE_MODE=live
STRIPE_SECRET_KEY_LIVE=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_xxx
STRIPE_PAYMENT_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx

# Email (wähle eine Option)
RESEND_API_KEY=re_xxx
# ODER
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
EMAIL_FROM=noreply@deine-domain.com
```

## 2. Erstes Deployment

### 2.1 Domain konfigurieren

Ersetze `YOUR_DOMAIN.com` in der Nginx-Konfiguration:

```bash
# Domain in Nginx-Config setzen
sed -i 's/YOUR_DOMAIN.com/deine-domain.com/g' docker/nginx/conf.d/monemee.conf
```

### 2.2 Initiales Deployment (ohne SSL)

```bash
# Starte zuerst ohne SSL
cd /opt/monemee

# Temporäre HTTP-only Config verwenden
cp docker/nginx/conf.d/monemee.init.conf.template docker/nginx/conf.d/default.conf
sed -i 's/YOUR_DOMAIN.com/deine-domain.com/g' docker/nginx/conf.d/default.conf

# Build und Start
docker compose build
docker compose up -d db
sleep 10  # Warte auf Datenbank
docker compose up -d
```

### 2.3 SSL-Zertifikat einrichten

```bash
# SSL-Setup ausführen
./scripts/ssl-setup.sh deine-domain.com admin@deine-domain.com
```

### 2.4 Stripe Webhooks konfigurieren

1. Gehe zu [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Erstelle zwei Endpoints:
   - **Payment Events**: `https://deine-domain.com/api/v1/stripe/webhooks/payment`
     - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - **Connect Events**: `https://deine-domain.com/api/v1/stripe/webhooks/connect`
     - Events: `account.updated`, `account.application.deauthorized`
3. Kopiere die Webhook-Secrets in deine `.env` Datei

## 3. CI/CD einrichten (GitHub Actions)

### 3.1 GitHub Secrets konfigurieren

Gehe zu Repository → Settings → Secrets and variables → Actions

**Server-Zugangsdaten:**
- `SERVER_HOST`: IP-Adresse oder Domain deines Servers
- `SERVER_USER`: SSH-Benutzername (z.B. `deploy`)
- `SERVER_SSH_KEY`: Privater SSH-Key (generiere einen neuen!)
- `SERVER_SSH_PORT`: SSH-Port (Standard: 22)
- `SERVER_PROJECT_PATH`: `/opt/monemee`

**Firebase Client (für Build):**
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

### 3.2 SSH-Key erstellen

```bash
# Auf deinem lokalen Rechner
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/monemee_deploy

# Public Key auf Server kopieren
ssh-copy-id -i ~/.ssh/monemee_deploy.pub user@dein-server

# Private Key als GitHub Secret speichern
cat ~/.ssh/monemee_deploy
```

### 3.3 Deploy-User erstellen (empfohlen)

```bash
# Auf dem Server
sudo adduser deploy --disabled-password
sudo usermod -aG docker deploy

# SSH-Key für deploy User
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh

# Projektverzeichnis-Rechte
sudo chown -R deploy:deploy /opt/monemee
```

## 4. Täglicher Betrieb

### 4.1 Logs anzeigen

```bash
# Alle Logs
docker compose logs -f

# Nur App-Logs
docker compose logs -f app

# Nur Nginx-Logs
docker compose logs -f nginx
```

### 4.2 Manuelles Deployment

```bash
# Via Script
./scripts/deploy.sh

# Mit Build (wenn Dockerfile geändert)
./scripts/deploy.sh --build

# Mit Migrations
./scripts/deploy.sh --migrate
```

### 4.3 Datenbank-Backup

```bash
# Backup erstellen
./scripts/backup.sh

# Automatisches tägliches Backup (Cron)
# Füge zu crontab hinzu: crontab -e
0 3 * * * /opt/monemee/scripts/backup.sh >> /var/log/monemee-backup.log 2>&1

# Backup wiederherstellen
./scripts/backup.sh --restore backups/monemee_20250111_030000.sql.gz
```

### 4.4 Container neustarten

```bash
# Alle Services neustarten
docker compose restart

# Nur App neustarten
docker compose restart app

# Komplett stoppen und starten
docker compose down
docker compose up -d
```

### 4.5 Updates einspielen

```bash
# Automatisch via GitHub Actions (empfohlen)
# Push auf main-Branch löst automatisch Deployment aus

# Manuell
cd /opt/monemee
git pull origin main
./scripts/deploy.sh
```

## 5. Monitoring & Health Checks

### 5.1 Health Endpoint

Die App bietet einen Health-Endpoint unter `/health`:

```bash
curl https://deine-domain.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-11T12:00:00.000Z",
  "stripe": {
    "mode": "live",
    "connected": true
  }
}
```

### 5.2 Externes Monitoring (empfohlen)

- **UptimeRobot** (kostenlos): https://uptimerobot.com
- **Better Uptime**: https://betteruptime.com
- **Healthchecks.io**: https://healthchecks.io

Konfiguriere einen HTTP-Check auf `https://deine-domain.com/health`

## 6. Sicherheit

### 6.1 Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 6.2 Fail2ban (optional)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 6.3 Automatische Updates (optional)

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## 7. Troubleshooting

### App startet nicht

```bash
# Logs prüfen
docker compose logs app

# Container-Status
docker compose ps

# In Container schauen
docker compose exec app sh
```

### Datenbank-Verbindungsprobleme

```bash
# Datenbank-Logs
docker compose logs db

# Direkter Datenbank-Zugriff
docker compose exec db psql -U monemee -d monemee
```

### SSL-Probleme

```bash
# Certbot-Logs
docker compose logs certbot

# Zertifikat manuell erneuern
docker compose run --rm certbot renew

# Nginx neu laden
docker compose exec nginx nginx -s reload
```

### Out of Memory

```bash
# Speicherverbrauch prüfen
docker stats

# Swap hinzufügen (falls nötig)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 8. Skalierung (optional)

Für höhere Last kann die Architektur erweitert werden:

1. **Load Balancer**: Nginx als separater Load Balancer vor mehreren App-Instanzen
2. **Redis**: Für Session-Management und Caching
3. **PostgreSQL Replica**: Read-Replicas für Lesezugriffe
4. **CDN**: Cloudflare oder AWS CloudFront für Static Assets

Diese Erweiterungen können später bei Bedarf hinzugefügt werden.

---

## Quick Reference

| Aktion | Befehl |
|--------|--------|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Logs | `docker compose logs -f` |
| Deploy | `./scripts/deploy.sh` |
| Backup | `./scripts/backup.sh` |
| SSL-Setup | `./scripts/ssl-setup.sh domain.com` |
| DB-Shell | `docker compose exec db psql -U monemee -d monemee` |
| Health | `curl localhost:5000/health` |
