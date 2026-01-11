# Mission Control - Admin Dashboard für Monemee

Mission Control ist eine **vollständig eigenständige, enterprise-grade Admin-Dashboard-Plattform** für den Monemee Marketplace. Das System läuft unabhängig von der Hauptanwendung und bietet umfassende Monitoring-, Management- und Analysefunktionen für Plattform-Administratoren.

## Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Features](#features)
- [Architektur](#architektur)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Seiten & Funktionen](#seiten--funktionen)
- [API-Dokumentation](#api-dokumentation)
- [WebSocket-System](#websocket-system)
- [Rules Engine](#rules-engine)
- [Sicherheit](#sicherheit)
- [Entwicklung](#entwicklung)
- [Deployment](#deployment)

---

## Übersicht

### Was ist Mission Control?

Mission Control ist das Admin-Backend für Monemee mit folgenden Kernfunktionen:

- **Echtzeit-Monitoring**: Live-Dashboard mit System-KPIs und Activity-Feed
- **User Intelligence**: 360°-Sicht auf alle Nutzer mit Statistiken und Historie
- **Finanz-Kontrolle**: Umsatz, Transaktionen, Auszahlungen im Blick
- **Automatisierung**: No-Code Rule Builder für Event-basierte Aktionen
- **Developer Tools**: API-Inspector, DB-Profiler, Webhook-Debugging
- **Business Intelligence**: Revenue Attribution, CLV, Churn Prediction

### Technische Eckdaten

| Komponente | Technologie | Port |
|------------|-------------|------|
| Frontend | React 18 + TypeScript + Vite | 5173 |
| Backend | Express.js + Node.js | 5001 |
| WebSocket | ws Library | 5002 |
| Datenbank | PostgreSQL (shared mit Monemee) | 5432 |

### Architektur-Prinzipien

1. **Vollständige Trennung**: Eigenständiges System, liest aber aus derselben PostgreSQL-Datenbank wie Monemee
2. **Read-Heavy Design**: Optimiert für Monitoring und Analytics, nicht für Transaktionsverarbeitung
3. **Real-Time Capable**: WebSocket-Infrastruktur für Live-Updates ohne Polling
4. **Admin-Grade Security**: Audit Trails, Rate Limiting, IP Blocking

---

## Features

### Dashboard & Monitoring

| Feature | Beschreibung |
|---------|--------------|
| **Live KPIs** | Nutzer, Umsatz, Sales, Uptime in Echtzeit |
| **System Alerts** | Kritische Warnungen (Failed Webhooks, DB Pool) |
| **Activity Feed** | Live-Stream aller Plattform-Aktivitäten |
| **Health Checks** | System-Status auf einen Blick |

### User Management

| Feature | Beschreibung |
|---------|--------------|
| **User Liste** | Paginiert mit Suche, Filter (Level, Rolle, Status) |
| **User Detail** | Produkte, Sales, Affiliate-Stats, Earnings-Trend |
| **Session Control** | Aktive Sessions anzeigen und beenden |
| **2FA Enforcement** | Zwei-Faktor-Authentifizierung erzwingen |

### Finanz-Übersicht

| Feature | Beschreibung |
|---------|--------------|
| **Revenue Overview** | Umsatz-Metriken nach Zeitraum |
| **Transaktionen** | Liste mit Status-Filter |
| **Payouts** | Auszahlungs-Management (pending/completed) |
| **Invoices** | Rechnungsübersicht |

### Analytics & BI

| Feature | Beschreibung |
|---------|--------------|
| **Product Performance** | Top-Produkte, Conversion Rates |
| **Sales Funnel** | Conversion-Analyse |
| **Revenue Attribution** | Umsatz nach Quelle (Affiliate vs. Direkt) |
| **Customer Segments** | Kundensegmentierung |
| **Customer Lifetime Value** | CLV-Analyse |
| **Cohort Analysis** | Kohortenbasierte Auswertung |
| **Churn Prediction** | Abwanderungs-Vorhersage |

### Leaderboards

| Feature | Beschreibung |
|---------|--------------|
| **Top Sellers** | Umsatz-Ranking |
| **Top Affiliates** | Promoter-Ranking |
| **Top Products** | Bestseller |
| **Fastest Growing** | Wachstums-Trends |
| **Most Active** | Aktivitäts-Ranking |

### Automation (Rules Engine)

| Feature | Beschreibung |
|---------|--------------|
| **Visual Rule Builder** | Drag & Drop Regel-Erstellung |
| **Event Triggers** | user.created, transaction.created, etc. |
| **Conditions** | AND/OR Logik mit 13+ Operatoren |
| **Actions** | Email, Notification, Update, Block IP, etc. |
| **Execution History** | Audit-Trail aller Regelausführungen |

### Security Center

| Feature | Beschreibung |
|---------|--------------|
| **IP Management** | IPs blockieren/freigeben |
| **Session Monitor** | Aktive Sessions überwachen |
| **Failed Logins** | Fehlgeschlagene Logins tracken |
| **Suspicious Activity** | Verdächtige Aktivitäten erkennen |
| **Rate Limits** | Konfiguration der Request-Limits |

### Developer Tools

| Feature | Beschreibung |
|---------|--------------|
| **API Inspector** | Request-Logs mit Filtering |
| **DB Profiler** | Query-Logs, EXPLAIN, Slow Queries |
| **Webhook Debugger** | Webhook-Logs, Retry-Funktion |
| **Feature Flags** | Feature Toggles verwalten |

### Test Management

| Feature | Beschreibung |
|---------|--------------|
| **Test Runner** | Unit/Integration Tests via UI starten |
| **Live Progress** | Echtzeit-Fortschritt via WebSocket |
| **History** | Test-Historie und Ergebnisse |
| **Coverage** | Code-Coverage Reports |

### Content Reports (DSA Art. 16)

| Feature | Beschreibung |
|---------|--------------|
| **Report Queue** | Eingehende Meldungen bearbeiten |
| **Status Management** | pending → reviewed → resolved |
| **Auto-Review** | Automatische Vorprüfung |
| **Compliance** | EU Digital Services Act konform |

---

## Architektur

### Verzeichnisstruktur

```
mission-control/
├── backend/                          # Express.js API Server
│   ├── src/
│   │   ├── index.js                 # Entry Point mit Route-Registrierung
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL Connection Pool
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT Authentifizierung
│   │   │   ├── error.js             # Globaler Error Handler
│   │   │   └── database.js          # DB Middleware
│   │   ├── services/
│   │   │   ├── websocket.service.js # Real-Time Event Broadcasting
│   │   │   └── rules.engine.js      # Automation Rules Evaluator
│   │   ├── routes/                  # 14 Route-Module
│   │   └── utils/                   # Hilfsfunktionen
│   ├── package.json
│   └── .env.example
│
├── frontend/                         # React 18 + TypeScript Dashboard
│   ├── src/
│   │   ├── App.tsx                  # Main Routing
│   │   ├── main.tsx                 # Vite Entry Point
│   │   ├── pages/                   # 14+ Seiten-Komponenten
│   │   ├── components/
│   │   │   ├── common/              # Wiederverwendbare UI-Komponenten
│   │   │   ├── layout/              # Layout & Navigation
│   │   │   ├── rules/               # Rule Builder Komponenten
│   │   │   ├── users/               # User Management Modals
│   │   │   └── reports/             # Content Reports Komponenten
│   │   ├── services/
│   │   │   └── api.ts               # Axios API Client
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts      # WebSocket Connection Hook
│   │   ├── context/
│   │   │   └── WebSocketContext.tsx # Real-Time Data Context
│   │   ├── styles/                  # CSS Modules
│   │   └── types/                   # TypeScript Definitionen
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── tests/                            # Jest Test Suite
│   ├── src/tests/
│   │   ├── unit/                    # Unit Tests
│   │   └── integration/             # Integration Tests
│   ├── jest.config.js
│   └── package.json
│
├── database/                         # Zusätzliche DB-Schemas
│   ├── security-schema.sql          # Sessions, Failed Logins
│   ├── rules-schema.sql             # Automation Rules
│   └── devtools-schema.sql          # API Logs, Feature Flags
│
├── README.md                         # Diese Datei
├── CLAUDE.md                         # Entwickler-Anweisungen für KI
└── .gitignore
```

### Datenfluss

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   PostgreSQL    │
│   (React)       │◀────│   (Express)     │◀────│   (Monemee DB)  │
│   Port 5173     │     │   Port 5001     │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────────────────────────────┐
│         WebSocket Server                │
│         Port 5002                       │
│   (Real-Time Events & Notifications)   │
└─────────────────────────────────────────┘
```

### Frontend-Architektur

**Zwei API-Instanzen:**
1. `api` - Mission Control Backend (Port 5001)
2. `monemeeAPI` - Hauptanwendung (Port 5000) für Content Reports

**State Management:**
- Server State: TanStack Query (React Query)
- Local State: useState
- Real-Time: WebSocket Context

**Styling:**
- CSS Modules mit Scoped Classes
- CSS Variables für Design Tokens
- Tailwind CSS Utilities

### Backend-Architektur

**Request Flow:**
```
Request → CORS → Morgan → Auth Middleware → Route Handler → Response
                                ↓
                         Database Query
                                ↓
                         WebSocket Broadcast (optional)
```

**Authentifizierung:**
- Single Admin Account (Environment Variables)
- bcrypt Password Hashing
- JWT Tokens (24h Gültigkeit)
- Role-based Access Control

---

## Installation

### Voraussetzungen

- Node.js 18+
- PostgreSQL 14+
- Monemee Datenbank (bereits vorhanden)

### Schnellstart

```bash
# 1. Backend starten
cd mission-control/backend
npm install
cp .env.example .env
# .env anpassen (siehe Konfiguration)
npm run dev

# 2. Frontend starten (neues Terminal)
cd mission-control/frontend
npm install
cp .env.example .env
npm run dev

# 3. Tests (optional)
cd mission-control/tests
npm install
npm test
```

### Datenbank-Setup

Die zusätzlichen Tabellen für Mission Control erstellen:

```bash
# Security-Schema (Sessions, Failed Logins, etc.)
psql -U postgres -d monemee -f database/security-schema.sql

# Rules-Schema (Automation Rules)
psql -U postgres -d monemee -f database/rules-schema.sql

# DevTools-Schema (API Logs, Feature Flags)
psql -U postgres -d monemee -f database/devtools-schema.sql
```

### Admin-Passwort generieren

```bash
# Temporär: Hash über API generieren (nur im Development)
curl -X POST http://localhost:5001/api/auth/hash-password \
  -H "Content-Type: application/json" \
  -d '{"password": "dein-sicheres-passwort"}'

# Antwort: { "hash": "$2b$10$..." }
# Diesen Hash in ADMIN_PASSWORD_HASH eintragen
```

---

## Konfiguration

### Backend (.env)

```env
# Server
PORT=5001
NODE_ENV=development

# PostgreSQL (dieselbe DB wie Monemee)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monemee
DB_USER=postgres
DB_PASSWORD=dein-passwort

# Admin-Authentifizierung
ADMIN_JWT_SECRET=ein-sehr-langer-geheimer-schluessel-mind-32-zeichen
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...  # bcrypt Hash

# Frontend URL für CORS
FRONTEND_URL=http://localhost:5173

# WebSocket
WS_PORT=5002

# Rate Limiting
RATE_LIMIT_WINDOW=15        # Minuten
RATE_LIMIT_MAX_REQUESTS=100 # Max Requests pro Fenster
```

### Frontend (.env)

```env
# Leer lassen für Dev-Proxy (Vite)
VITE_API_URL=

# Monemee API für Content Reports
VITE_MONEMEE_API_URL=http://localhost:5000/api/v1
```

### Wichtige Konfigurationsdateien

| Datei | Beschreibung |
|-------|--------------|
| `backend/src/config/database.js` | PostgreSQL Connection Pool |
| `frontend/vite.config.ts` | Vite mit API Proxy |
| `frontend/tsconfig.json` | TypeScript Konfiguration |
| `tests/jest.config.js` | Jest Test-Konfiguration |

---

## Seiten & Funktionen

### 1. Dashboard (`/`)

**Command Center** - Die zentrale Übersicht

**Komponenten:**
- **KPI Cards**: Echtzeit-Anzeige von Nutzerzahl, Tagesumsatz, Sales, Uptime
- **System Alerts**: Kritische Warnungen mit Severity-Level
- **Live Activity Feed**: Stream aller Plattform-Aktivitäten
- **Content Reports Badge**: Anzahl offener Meldungen

**API Endpoints:**
- `GET /api/dashboard/overview` - KPIs laden
- `GET /api/dashboard/alerts` - Alerts laden
- `GET /api/dashboard/live-feed` - Activity Stream

**Real-Time:**
- WebSocket Events: `sale`, `user_registered`, `alert`

---

### 2. Users (`/users`)

**User Management** - Alle Nutzer verwalten

**Funktionen:**
- Paginierte User-Liste mit Infinite Scroll
- Suche nach Name, Email, Username
- Filter: Level (Starter-Elite), Rolle, Status (aktiv/inaktiv)
- Sortierung nach verschiedenen Kriterien

**User Detail Modal:**
- Basis-Informationen (Name, Email, Level, erstellt am)
- Produkte des Users
- Sales-Statistiken (Gesamtumsatz, Verkäufe, Durchschnitt)
- Affiliate-Statistiken (Links, Clicks, Conversions)
- Earnings-Trend (Chart der letzten Monate)

**API Endpoints:**
- `GET /api/users/list` - Paginierte Liste
- `GET /api/users/:id` - User Detail
- `GET /api/users/stats/summary` - Übersichts-Statistiken

---

### 3. Financial (`/financial`)

**Finanz-Dashboard** - Umsatz und Transaktionen

**Tabs:**
1. **Overview**: Revenue-Metriken nach Zeitraum
2. **Transactions**: Alle Transaktionen mit Filter
3. **Payouts**: Auszahlungs-Anfragen bearbeiten

**API Endpoints:**
- `GET /api/financial/overview` - Umsatz-Übersicht
- `GET /api/financial/transactions` - Transaktionsliste
- `GET /api/financial/payouts` - Auszahlungen

---

### 4. Analytics (`/analytics`)

**Analytics-Dashboard** - Tiefere Einblicke

**Visualisierungen:**
- **Product Performance**: Top-Produkte nach Umsatz/Verkäufen
- **Sales Funnel**: Conversion-Trichter (Visits → Cart → Checkout → Purchase)
- **Conversion Rates**: Zeitliche Entwicklung

**API Endpoints:**
- `GET /api/analytics/products` - Produkt-Performance
- `GET /api/analytics/funnel` - Funnel-Daten

---

### 5. Leaderboards (`/leaderboards`)

**Ranglisten** - Die Besten auf einen Blick

**Rankings:**
- **Top Sellers**: Nach Gesamtumsatz
- **Top Affiliates**: Nach Provision
- **Top Products**: Nach Verkaufszahlen
- **Fastest Growing**: Höchstes Wachstum
- **Most Active**: Meiste Aktivität

**API Endpoints:**
- `GET /api/leaderboards/overview` - Statistiken
- `GET /api/leaderboards/top-sellers` - Seller-Ranking
- `GET /api/leaderboards/top-affiliates` - Affiliate-Ranking
- `GET /api/leaderboards/top-products` - Produkt-Ranking

---

### 6. Rules (`/rules`)

**Automation Rules** - Event-basierte Automatisierung

**Rule Builder:**
- Visueller Editor für Bedingungen und Aktionen
- Trigger auswählen (z.B. `user.created`)
- Bedingungen definieren (AND/OR Logik)
- Aktionen festlegen (Email, Notification, etc.)

**Features:**
- Rule aktivieren/deaktivieren
- Execution History mit Ergebnissen
- Template-Unterstützung

**API Endpoints:**
- `GET /api/rules` - Alle Rules
- `POST /api/rules` - Rule erstellen
- `PUT /api/rules/:id` - Rule aktualisieren
- `DELETE /api/rules/:id` - Rule löschen
- `PATCH /api/rules/:id/toggle` - Aktivieren/Deaktivieren

---

### 7. Security (`/security`)

**Security Overview** - Sicherheitsübersicht

**Metriken:**
- Failed Login Attempts
- Blocked IPs
- Active Sessions
- Security Events

**API Endpoints:**
- `GET /api/security/overview` - Übersicht
- `GET /api/security/audit-log` - Audit Trail

---

### 8. Security Center (`/security-center`)

**Advanced Security** - Erweiterte Sicherheitsfunktionen

**Tabs:**
1. **IP Management**: IPs blockieren/freigeben
2. **Sessions**: Aktive Sessions, Kill-Funktion
3. **Failed Logins**: Fehlgeschlagene Login-Versuche
4. **2FA**: Zwei-Faktor-Authentifizierung erzwingen
5. **Suspicious Activity**: Verdächtige Aktivitäten
6. **Rate Limits**: Request-Limits konfigurieren

**API Endpoints:**
- `POST /api/security-center/ip/block` - IP blockieren
- `DELETE /api/security-center/ip/:ip` - IP freigeben
- `GET /api/security-center/sessions` - Sessions
- `DELETE /api/security-center/sessions/:id` - Session beenden

---

### 9. Tests (`/tests`)

**Test Management** - Tests über UI ausführen

**Features:**
- Test-Typ auswählen (Unit, Integration, All)
- Tests starten mit Echtzeit-Output
- Test-Historie einsehen
- Coverage-Reports generieren

**Real-Time:**
- WebSocket streamt Test-Output live

**API Endpoints:**
- `POST /api/tests/run` - Tests ausführen
- `GET /api/tests/history` - Historie
- `GET /api/tests/status` - Aktueller Status
- `POST /api/tests/coverage` - Coverage generieren

---

### 10. Performance (`/performance`)

**Performance Monitoring** - System-Gesundheit

**Metriken:**
- **API Performance**: Response Times, Error Rates
- **Database Health**: Connection Pool, Slow Queries
- **System Resources**: Memory, CPU (wenn verfügbar)

**API Endpoints:**
- `GET /api/performance/database` - DB-Metriken
- `GET /api/performance/api` - API-Metriken

---

### 11. Developer Tools (`/devtools`)

**DevTools** - Entwickler-Werkzeuge

**Tabs:**
1. **API Inspector**: Request-Logs mit Filter
2. **DB Profiler**: Query-Logs, EXPLAIN-Analyse
3. **Webhook Debugger**: Webhook-Logs, Retry
4. **Feature Flags**: Feature Toggles verwalten

**API Endpoints:**
- `GET /api/devtools/api/requests` - API Requests
- `GET /api/devtools/db/queries` - Query Logs
- `GET /api/devtools/webhooks` - Webhook Logs
- `POST /api/devtools/webhooks/:id/retry` - Webhook retry
- `GET /api/devtools/flags` - Feature Flags
- `POST /api/devtools/flags` - Flag erstellen
- `PATCH /api/devtools/flags/:id` - Flag aktualisieren

---

### 12. Business Intelligence (`/bi`)

**BI Dashboard** - Erweiterte Analysen

**Analysen:**
- **Revenue Attribution**: Umsatz nach Quelle
- **Customer Segments**: Kundensegmentierung
- **Customer Lifetime Value**: CLV-Berechnung
- **Cohort Analysis**: Kohortenbasierte Analyse
- **Cross-Sell Analysis**: Upselling-Potential
- **Churn Prediction**: Abwanderungs-Risiko

**API Endpoints:**
- `GET /api/bi/revenue-attribution`
- `GET /api/bi/customer-segments`
- `GET /api/bi/customer-lifetime-value`
- `GET /api/bi/cohort-analysis`
- `GET /api/bi/product-cross-sell`
- `GET /api/bi/churn-prediction`

---

### 13. Content Reports (`/reports`)

**Content Moderation** - DSA Art. 16 Compliance

**Features:**
- Queue eingehender Meldungen
- Status-Workflow: pending → reviewed → resolved
- Kategorie-basierte Sortierung
- Entscheidungsgründe dokumentieren

**Integration:**
- Nutzt Monemee API (`/api/v1/reports`)
- Separate Authentifizierung

---

### 14. Login (`/login`)

**Admin Login** - Authentifizierung

**Flow:**
1. Username/Passwort eingeben
2. Backend validiert gegen bcrypt Hash
3. JWT Token wird ausgestellt (24h)
4. Token in localStorage gespeichert
5. Redirect zum Dashboard

---

## API-Dokumentation

### Authentifizierung

Alle geschützten Routen benötigen einen JWT-Token:

```
Authorization: Bearer <token>
```

### Base URL

```
Development: http://localhost:5001/api
Production:  https://admin.monemee.de/api
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Vollständige Route-Übersicht

| Methode | Route | Beschreibung | Auth |
|---------|-------|--------------|------|
| **Auth** |
| POST | `/auth/login` | Admin Login | Nein |
| POST | `/auth/verify` | Token verifizieren | Nein |
| POST | `/auth/hash-password` | Passwort hashen (Dev) | Nein |
| **Dashboard** |
| GET | `/dashboard/overview` | KPIs | Ja |
| GET | `/dashboard/alerts` | System Alerts | Ja |
| GET | `/dashboard/live-feed` | Activity Stream | Ja |
| POST | `/dashboard/broadcast` | Broadcast senden | Ja |
| **Users** |
| GET | `/users/list` | User-Liste (paginiert) | Ja |
| GET | `/users/:id` | User Detail | Ja |
| GET | `/users/stats/summary` | User-Statistiken | Ja |
| **Financial** |
| GET | `/financial/overview` | Umsatz-Übersicht | Ja |
| GET | `/financial/transactions` | Transaktionen | Ja |
| GET | `/financial/payouts` | Auszahlungen | Ja |
| **Analytics** |
| GET | `/analytics/products` | Produkt-Performance | Ja |
| GET | `/analytics/funnel` | Sales Funnel | Ja |
| **Leaderboards** |
| GET | `/leaderboards/overview` | Statistiken | Ja |
| GET | `/leaderboards/top-sellers` | Top Sellers | Ja |
| GET | `/leaderboards/top-affiliates` | Top Affiliates | Ja |
| GET | `/leaderboards/top-products` | Top Products | Ja |
| GET | `/leaderboards/fastest-growing` | Fastest Growing | Ja |
| GET | `/leaderboards/most-active` | Most Active | Ja |
| **Rules** |
| GET | `/rules` | Alle Rules | Ja |
| POST | `/rules` | Rule erstellen | Ja |
| GET | `/rules/:id` | Rule Detail | Ja |
| PUT | `/rules/:id` | Rule aktualisieren | Ja |
| DELETE | `/rules/:id` | Rule löschen | Ja |
| PATCH | `/rules/:id/toggle` | Rule toggle | Ja |
| GET | `/rules/stats` | Rule-Statistiken | Ja |
| GET | `/rules/execution/history` | Execution History | Ja |
| **Security** |
| GET | `/security/overview` | Sicherheits-Übersicht | Ja |
| GET | `/security/audit-log` | Audit Trail | Ja |
| **Security Center** |
| GET | `/security-center/blocked-ips` | Blockierte IPs | Ja |
| POST | `/security-center/ip/block` | IP blockieren | Ja |
| DELETE | `/security-center/ip/:ip` | IP freigeben | Ja |
| GET | `/security-center/sessions` | Aktive Sessions | Ja |
| DELETE | `/security-center/sessions/:id` | Session beenden | Ja |
| GET | `/security-center/failed-logins` | Failed Logins | Ja |
| POST | `/security-center/2fa/enforce` | 2FA erzwingen | Ja |
| GET | `/security-center/suspicious` | Verdächtige Aktivität | Ja |
| **Performance** |
| GET | `/performance/database` | DB-Metriken | Ja |
| GET | `/performance/api` | API-Metriken | Ja |
| **Tests** |
| POST | `/tests/run` | Tests ausführen | Ja |
| GET | `/tests/history` | Test-Historie | Ja |
| GET | `/tests/status` | Test-Status | Ja |
| POST | `/tests/coverage` | Coverage generieren | Ja |
| **DevTools** |
| GET | `/devtools/api/requests` | API-Requests | Ja |
| GET | `/devtools/api/stats` | API-Statistiken | Ja |
| GET | `/devtools/db/queries` | Query-Logs | Ja |
| GET | `/devtools/db/explain` | EXPLAIN-Analyse | Ja |
| GET | `/devtools/webhooks` | Webhook-Logs | Ja |
| POST | `/devtools/webhooks/:id/retry` | Webhook retry | Ja |
| GET | `/devtools/flags` | Feature Flags | Ja |
| POST | `/devtools/flags` | Flag erstellen | Ja |
| PATCH | `/devtools/flags/:id` | Flag aktualisieren | Ja |
| **Business Intelligence** |
| GET | `/bi/revenue-attribution` | Revenue Attribution | Ja |
| GET | `/bi/customer-segments` | Customer Segments | Ja |
| GET | `/bi/customer-lifetime-value` | CLV | Ja |
| GET | `/bi/cohort-analysis` | Cohort Analysis | Ja |
| GET | `/bi/product-cross-sell` | Cross-Sell | Ja |
| GET | `/bi/churn-prediction` | Churn Prediction | Ja |

---

## WebSocket-System

### Verbindung

```javascript
const ws = new WebSocket('ws://localhost:5002');

ws.onopen = () => {
  // Subscribe to channels
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['all', 'transactions', 'users']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data.payload);
};
```

### Architektur

- **HTTP Server**: Port 5001 (REST API)
- **WebSocket Server**: Port 5002 (Real-Time Events)
- **Heartbeat**: Ping alle 30 Sekunden
- **Event Buffer**: Letzte 50 Events gecached

### Channels

| Channel | Events |
|---------|--------|
| `all` | Alle Events |
| `users` | User-bezogene Events |
| `transactions` | Transaktions-Events |
| `products` | Produkt-Events |
| `payments` | Payment-Events |
| `security` | Security-Events |
| `performance` | Performance-Alerts |
| `tests` | Test-Ergebnisse |
| `alerts` | System-Alerts |
| `system` | System-Events |

### Event-Typen

```javascript
// Beispiel-Events
{ type: 'sale', payload: { userId, productId, amount } }
{ type: 'user_registered', payload: { userId, email } }
{ type: 'alert', payload: { severity, message } }
{ type: 'test_progress', payload: { output, status } }
{ type: 'rule_executed', payload: { ruleId, result } }
```

### Frontend Hook

```typescript
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { lastMessage, sendMessage, connected } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'sale') {
      // Handle sale event
    }
  }, [lastMessage]);

  return <div>Status: {connected ? 'Connected' : 'Disconnected'}</div>;
}
```

---

## Rules Engine

### Konzept

Die Rules Engine ermöglicht automatisierte Aktionen basierend auf Plattform-Events.

### Rule-Struktur

```json
{
  "id": "uuid",
  "name": "Welcome Email",
  "description": "Send welcome email to new users",
  "trigger": "user.created",
  "conditions": {
    "logic": "AND",
    "rules": [
      {
        "field": "user.email",
        "operator": "not_empty",
        "value": null
      }
    ]
  },
  "actions": [
    {
      "type": "send_email",
      "params": {
        "template": "welcome",
        "to": "{{user.email}}"
      }
    }
  ],
  "enabled": true
}
```

### Verfügbare Trigger

| Trigger | Beschreibung | Payload |
|---------|--------------|---------|
| `user.created` | Neuer User registriert | User-Objekt |
| `user.updated` | User aktualisiert | User-Objekt |
| `transaction.created` | Neue Transaktion | Transaction-Objekt |
| `transaction.completed` | Transaktion abgeschlossen | Transaction-Objekt |
| `product.published` | Produkt veröffentlicht | Product-Objekt |
| `payment.failed` | Zahlung fehlgeschlagen | Payment-Objekt |
| `security.alert` | Sicherheitswarnung | Alert-Objekt |
| `performance.alert` | Performance-Warnung | Alert-Objekt |

### Operatoren

| Operator | Beschreibung | Beispiel |
|----------|--------------|----------|
| `equals` | Exakte Übereinstimmung | `status equals "active"` |
| `not_equals` | Nicht gleich | `role not_equals "admin"` |
| `greater_than` | Größer als | `amount greater_than 100` |
| `less_than` | Kleiner als | `age less_than 18` |
| `greater_or_equal` | Größer oder gleich | `level >= 3` |
| `less_or_equal` | Kleiner oder gleich | `retries <= 3` |
| `contains` | Enthält (String) | `email contains "@gmail"` |
| `not_contains` | Enthält nicht | `name not_contains "test"` |
| `starts_with` | Beginnt mit | `url starts_with "https"` |
| `ends_with` | Endet mit | `file ends_with ".pdf"` |
| `regex` | Regular Expression | `phone regex "^\+49"` |
| `is_empty` | Ist leer | `notes is_empty` |
| `not_empty` | Ist nicht leer | `email not_empty` |

### Aktionen

| Action | Beschreibung | Parameter |
|--------|--------------|-----------|
| `send_email` | E-Mail senden | `template`, `to`, `subject` |
| `send_notification` | Push-Notification | `userId`, `title`, `body` |
| `update_user` | User aktualisieren | `userId`, `updates` |
| `increment_counter` | Counter erhöhen | `key`, `amount` |
| `create_audit_log` | Audit-Log erstellen | `action`, `details` |
| `block_ip` | IP blockieren | `ip`, `reason`, `duration` |
| `webhook` | Webhook aufrufen | `url`, `method`, `body` |

### Beispiel-Rules

**1. Fraud Detection**
```json
{
  "name": "Block Suspicious IP",
  "trigger": "security.alert",
  "conditions": {
    "logic": "AND",
    "rules": [
      { "field": "type", "operator": "equals", "value": "failed_login" },
      { "field": "count", "operator": "greater_than", "value": 5 }
    ]
  },
  "actions": [
    { "type": "block_ip", "params": { "duration": 3600 } }
  ]
}
```

**2. High-Value Customer Alert**
```json
{
  "name": "VIP Customer Alert",
  "trigger": "transaction.completed",
  "conditions": {
    "logic": "AND",
    "rules": [
      { "field": "amount", "operator": "greater_than", "value": 500 }
    ]
  },
  "actions": [
    { "type": "send_notification", "params": { "template": "vip_sale" } }
  ]
}
```

---

## Sicherheit

### Authentifizierung

- **Single Admin Account**: Username/Passwort in Environment Variables
- **bcrypt Hashing**: Passwort mit 10 Salt Rounds gehasht
- **JWT Tokens**: 24h Gültigkeit, HS256 Signatur
- **Timing-Safe Comparison**: Schutz gegen Timing-Attacks

### Middleware

```javascript
// Alle geschützten Routen nutzen:
router.use(authenticateAdmin);

// Optionale Rollen-Prüfung:
router.use(requireRole('superadmin'));
```

### Rate Limiting

- **Default**: 100 Requests / 15 Minuten
- **Konfigurierbar** via Environment Variables
- **IP-basiert**: Rate Limit pro IP-Adresse

### Security Headers (Helmet)

- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

### CORS

- **Origin**: Nur `FRONTEND_URL` erlaubt
- **Credentials**: Aktiviert
- **Methods**: GET, POST, PUT, PATCH, DELETE

### Best Practices

1. **Production-Deployment**:
   - `ADMIN_JWT_SECRET` mit min. 64 Zeichen
   - `hash-password` Route deaktivieren
   - HTTPS erzwingen
   - IP-Whitelist für Admin-Zugriff

2. **Passwort-Generierung**:
   ```bash
   # Sicheres Passwort generieren
   openssl rand -base64 32

   # Hash generieren (nur lokal!)
   node -e "require('bcrypt').hash('PASSWORT', 10).then(console.log)"
   ```

3. **Token-Rotation**:
   - JWT Secret regelmäßig rotieren
   - Alte Tokens werden automatisch ungültig

---

## Entwicklung

### Lokale Entwicklung

```bash
# Backend mit Hot-Reload
cd backend && npm run dev

# Frontend mit HMR
cd frontend && npm run dev

# Tests im Watch-Mode
cd tests && npm run test:watch
```

### Code-Struktur

**Backend Route-Pattern:**
```javascript
// routes/example.routes.js
const router = require('express').Router();
const { pool } = require('../config/database');

router.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

**Frontend Page-Pattern:**
```typescript
// pages/ExamplePage.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function ExamplePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => api.get('/items').then(r => r.data)
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="page">
      {data.map(item => <ItemCard key={item.id} {...item} />)}
    </div>
  );
}
```

### Neue Seite hinzufügen

1. **Route in App.tsx**:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```

2. **Seite erstellen**:
   ```
   frontend/src/pages/NewPage.tsx
   ```

3. **Navigation erweitern**:
   ```tsx
   // components/layout/Sidebar.tsx
   { path: '/new-page', label: 'New Page', icon: Icon }
   ```

4. **Backend-Route** (falls nötig):
   ```
   backend/src/routes/new.routes.js
   ```

5. **Route registrieren**:
   ```javascript
   // backend/src/index.js
   app.use('/api/new', require('./routes/new.routes'));
   ```

### Tests schreiben

```javascript
// tests/src/tests/unit/example.test.js
describe('Example', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
});

// tests/src/tests/integration/api.test.js
const request = require('supertest');

describe('API', () => {
  it('GET /api/dashboard/overview', async () => {
    const res = await request(API_URL)
      .get('/api/dashboard/overview')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

---

## Deployment

### Production Checklist

- [ ] `NODE_ENV=production` setzen
- [ ] Sicheres `ADMIN_JWT_SECRET` (64+ Zeichen)
- [ ] Sicheren `ADMIN_PASSWORD_HASH` generieren
- [ ] `/api/auth/hash-password` Route entfernen/deaktivieren
- [ ] CORS auf Production-Domain beschränken
- [ ] HTTPS aktivieren
- [ ] Rate Limits anpassen
- [ ] IP-Whitelist erwägen
- [ ] Logging konfigurieren
- [ ] Monitoring einrichten

### Docker (Beispiel)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["node", "src/index.js"]

# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name admin.monemee.de;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/mission-control;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Proxy
    location /ws {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

### PM2 Process Manager

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'mission-control-api',
      script: 'src/index.js',
      cwd: './backend',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    }
  ]
};
```

---

## Troubleshooting

### Backend startet nicht

**Problem:** `Error: connect ECONNREFUSED`
**Lösung:** PostgreSQL läuft nicht:
```bash
sudo systemctl start postgresql
```

**Problem:** `Port 5001 already in use`
**Lösung:** Port in `.env` ändern oder Prozess beenden:
```bash
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill
```

### Frontend kann nicht mit Backend verbinden

**Problem:** `Network Error`
**Lösung:** Backend prüfen: `curl http://localhost:5001/api/health`

**Problem:** CORS-Error
**Lösung:** `FRONTEND_URL` in Backend `.env` prüfen

### WebSocket verbindet nicht

**Problem:** `WebSocket connection failed`
**Lösung:** Backend prüfen, `WS_PORT=5002` setzen

### Tests starten nicht

**Problem:** `npm test` gibt Fehler
**Lösung:**
```bash
cd mission-control/tests
rm -rf node_modules package-lock.json
npm install
```

---

## Support & Wartung

### Logs

```bash
# Backend-Logs
tail -f backend/logs/combined.log

# Mit PM2
pm2 logs mission-control-api
```

### Health Check

```bash
# API Health
curl http://localhost:5001/api/health

# WebSocket Ping
wscat -c ws://localhost:5002 -x '{"type":"ping"}'
```

### Backup

```bash
# Mission Control Tabellen sichern
pg_dump -U postgres -d monemee \
  -t user_sessions \
  -t failed_login_attempts \
  -t automation_rules \
  -t rule_executions \
  -t blocked_ips \
  -t api_request_logs \
  -t feature_flags \
  > mission-control-backup.sql
```

---

## Lizenz

Proprietär - Alle Rechte vorbehalten.

---

## Changelog

### v1.0.0 (Initial Release)
- Dashboard mit Live-KPIs
- User Management
- Financial Dashboard
- Analytics & Leaderboards
- Rules Engine
- Security Center
- Developer Tools
- Business Intelligence
- Content Reports (DSA Art. 16)
- WebSocket Real-Time System
- Test Management UI
