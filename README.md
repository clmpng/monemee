# EarnFlow 💸

Eine mobile-first Web-Plattform (PWA), die es Nutzern ermöglicht, als **Creator** (digitale Produkte verkaufen) oder **Promoter** (Affiliate-Marketing) Geld zu verdienen.

## 🚀 Features

- **Creator Store**: Verkaufe digitale Produkte mit eigenem Shop
- **Promoter System**: Verdiene Provisionen durch Affiliate-Links
- **Gamification**: Level-System, Challenges, Achievements
- **Mobile-First**: Optimiert für Smartphones

## 🛠 Tech Stack

### Frontend
- React 18 (JavaScript)
- CSS Modules
- React Router
- Context API
- Firebase Authentication

### Backend
- Node.js + Express
- PostgreSQL (Raw SQL)
- Firebase Admin SDK
- Stripe Payments

## 📁 Projektstruktur

```
earnflow/
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # UI Components
│       ├── pages/          # Seiten
│       ├── context/        # State Management
│       ├── hooks/          # Custom Hooks
│       ├── services/       # API Services
│       └── styles/         # CSS Modules
│
├── server/                 # Express Backend
│   └── src/
│       ├── models/         # SQL Queries
│       ├── controllers/    # Request Handlers
│       ├── services/       # Business Logic
│       ├── routes/         # API Routes
│       ├── middleware/     # Auth, Error Handling
│       └── config/         # DB, Firebase, Stripe
│
└── database/               # SQL Schema
```

## 🏃‍♂️ Getting Started

### Voraussetzungen
- Node.js 18+
- PostgreSQL 14+
- Firebase Projekt
- Stripe Account

### Installation

```bash
# Repository klonen
git clone <repo-url>
cd earnflow

# Client installieren
cd client
npm install

# Server installieren
cd ../server
npm install

# Environment Variablen setzen
cp .env.example .env
# .env Datei ausfüllen

# Datenbank erstellen
psql -U postgres -f database/schema.sql

# Entwicklungsserver starten
# Terminal 1: Client
cd client && npm start

# Terminal 2: Server
cd server && npm run dev
```

## 📝 Environment Variables

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
```

### Server (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/earnflow
FIREBASE_PROJECT_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## 🎨 Design System

- **Primary**: Indigo (#6366f1)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)
- **Border Radius**: 8-12px
- **Mobile Breakpoint**: 768px

## 📄 License

MIT