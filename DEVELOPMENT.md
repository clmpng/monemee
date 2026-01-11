# Monemee Development Guide

Dieser Guide beschreibt den Entwicklungs-Workflow für Monemee.

## Branching-Strategie

```
Feature Branch ──► develop ──► master
                      │           │
                   Staging    Production
```

| Branch | Umgebung | URL | Beschreibung |
|--------|----------|-----|--------------|
| `master` | Production | monemee.app | Live-System für Nutzer |
| `develop` | Staging | staging.monemee.app | Test-Umgebung |
| `feature/*` | Lokal | localhost:3000 | Feature-Entwicklung |
| `fix/*` | Lokal | localhost:3000 | Bugfixes |

## Workflow

### 1. Feature entwickeln

```bash
# Neuen Feature-Branch erstellen
git checkout develop
git pull origin develop
git checkout -b feature/mein-neues-feature

# Entwickeln...
# Commits machen...

# Push und Pull Request erstellen
git push -u origin feature/mein-neues-feature
```

### 2. Pull Request → develop

1. Erstelle PR von `feature/xxx` → `develop`
2. CI Tests laufen automatisch
3. Code Review (optional)
4. Merge in `develop`
5. **Automatisches Deployment auf Staging**

### 3. Staging testen

- URL: `https://staging.monemee.app`
- Mission Control: `https://admin-staging.monemee.app`
- Stripe ist im **Test-Modus**
- Separate Datenbank (keine echten Nutzerdaten)

### 4. Release zu Production

```bash
# Wenn Staging OK ist
git checkout master
git merge develop
git push origin master

# Automatisches Deployment auf Production
```

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+
- Docker & Docker Compose
- Git

### Setup

```bash
# Repository klonen
git clone https://github.com/clmpng/monemee.git
cd monemee

# Auf develop wechseln
git checkout develop

# Datenbank starten (Docker)
docker compose -f docker-compose.dev.yml up -d

# Server starten
cd server
cp .env.example .env  # Dann .env bearbeiten
npm install
npm run dev

# In neuem Terminal: Client starten
cd client
npm install
npm start
```

### Lokale URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api/v1 |
| Adminer (DB UI) | http://localhost:8080 |

### Tests lokal ausführen

```bash
# Client Tests
cd client
npm test              # Watch-Mode
npm run test:coverage # Mit Coverage

# Server Tests
cd server
npm test              # Alle Tests
npm run test:unit     # Nur Unit Tests
npm run test:coverage # Mit Coverage
```

## Umgebungen im Detail

### Production (`master`)

```yaml
URL: https://monemee.app
Mission Control: https://admin.monemee.app
Stripe: LIVE-Modus
Datenbank: Produktionsdaten
Deployment: Automatisch nach Merge in master
```

### Staging (`develop`)

```yaml
URL: https://staging.monemee.app
Mission Control: https://admin-staging.monemee.app
Stripe: TEST-Modus (Testkarten funktionieren)
Datenbank: Separate Staging-DB
Deployment: Automatisch nach Merge in develop
```

### Lokal (Feature-Branches)

```yaml
URL: http://localhost:3000
API: http://localhost:5000
Stripe: TEST-Modus
Datenbank: Lokale PostgreSQL (Docker)
```

## Stripe Testkarten

Im Staging und lokaler Entwicklung:

| Karte | Nummer |
|-------|--------|
| Erfolg | 4242 4242 4242 4242 |
| Abgelehnt | 4000 0000 0000 0002 |
| 3D Secure | 4000 0025 0000 3155 |

CVC: beliebige 3 Ziffern, Datum: beliebiges zukünftiges Datum

## Datenbank

### Lokale DB zurücksetzen

```bash
# Container stoppen und Volume löschen
docker compose -f docker-compose.dev.yml down -v

# Neu starten (Schema wird automatisch geladen)
docker compose -f docker-compose.dev.yml up -d
```

### Migrations erstellen

```bash
# Neue Migration erstellen
touch database/migrations/$(date +%Y%m%d)_beschreibung.sql

# Migration schreiben...

# Lokal testen
docker compose -f docker-compose.dev.yml exec db \
  psql -U postgres -d monemee -f /path/to/migration.sql
```

## Häufige Befehle

```bash
# Logs anzeigen (lokal)
docker compose -f docker-compose.dev.yml logs -f

# In DB-Container
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d monemee

# Alle Container stoppen
docker compose -f docker-compose.dev.yml down

# Node Modules neu installieren
rm -rf node_modules package-lock.json && npm install
```

## Troubleshooting

### Port bereits belegt

```bash
# Prozess auf Port finden
lsof -i :3000
lsof -i :5000

# Oder Docker Container
docker ps
docker stop <container-id>
```

### Datenbank-Verbindung fehlgeschlagen

```bash
# Prüfen ob Container läuft
docker compose -f docker-compose.dev.yml ps

# Container Logs
docker compose -f docker-compose.dev.yml logs db
```

### Node Modules Probleme

```bash
# Cache leeren und neu installieren
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Code Style

- **Commits**: Conventional Commits auf Deutsch
  - `feat: Neue Feature-Beschreibung`
  - `fix: Bugfix-Beschreibung`
  - `docs: Dokumentation aktualisiert`
  - `refactor: Code-Verbesserung`

- **Branches**:
  - `feature/kurze-beschreibung`
  - `fix/bug-beschreibung`
  - `hotfix/kritischer-fix` (direkt auf master, nur Notfälle!)

## CI/CD Pipeline

```
Push ──► CI (Tests) ──► CD (Deploy)
              │              │
         ~5 Minuten     ~3 Minuten
```

### CI Jobs

1. **Lint** - Build Check
2. **Test Client** - React Tests
3. **Test Server** - Backend Tests
4. **Test Mission Control** - MC Tests
5. **Build** - Produktions-Build
6. **Security** - npm audit

### CD Jobs

- `develop` → Staging-Deployment
- `master` → Production-Deployment

## Notfall: Hotfix

Wenn ein kritischer Bug in Production ist:

```bash
# Hotfix-Branch von master
git checkout master
git checkout -b hotfix/kritischer-bug

# Fix machen und committen
git commit -m "fix: Kritischer Bug behoben"

# Direkt auf master mergen
git checkout master
git merge hotfix/kritischer-bug
git push origin master

# Auch in develop mergen!
git checkout develop
git merge master
git push origin develop

# Branch löschen
git branch -d hotfix/kritischer-bug
```
