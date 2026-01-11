# ⚡ QUICKSTART - Mission Control

Los geht's in **5 Minuten**!

## 🚀 Schnellstart

### 1. Backend starten

```bash
cd mission-control/backend
npm install
cp .env.example .env
npm run dev
```

✅ Backend läuft auf: http://localhost:5001

### 2. Frontend starten

```bash
cd mission-control/frontend
npm install
npm run dev
```

✅ Frontend läuft auf: http://localhost:5173

### 3. Login

Öffne: http://localhost:5173

```
Username: admin
Password: admin123
```

**Fertig! 🎉**

---

## 📋 Was funktioniert bereits?

✅ **Backend API-Server** - Alle Routes funktionieren
✅ **Dashboard** - Real-Time-Daten von Monemee DB
✅ **WebSocket** - Live-Updates
✅ **Test-Runner** - Tests über UI steuerbar
✅ **Login/Auth** - JWT-basiert
✅ **User-Liste** - Filterable & Searchable

---

## 🧪 Tests ausführen

### Option 1: Über Mission Control UI

1. Gehe zu http://localhost:5173/tests
2. Wähle Test-Type (All / Unit / Integration)
3. Klicke "Run Tests"
4. Sieh Ergebnisse in Echtzeit

### Option 2: Terminal

```bash
cd mission-control/tests
npm install
npm test
```

---

## 🔧 Konfiguration

### Backend (.env)

```env
# Server
PORT=5001

# Database (verbindet zu Monemee DB)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monemee
DB_USER=postgres
DB_PASSWORD=

# Admin Auth
ADMIN_JWT_SECRET=change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<generiert via /api/auth/hash-password>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# WebSocket
WS_PORT=5002
```

### Neues Admin-Passwort setzen

```bash
# 1. Generiere Hash
curl -X POST http://localhost:5001/api/auth/hash-password \
  -H "Content-Type: application/json" \
  -d '{"password":"dein_passwort"}'

# 2. Kopiere hash in .env
ADMIN_PASSWORD_HASH=<der_hash>
```

---

## 📚 Weitere Schritte

- **Vollständige Dokumentation**: Siehe [README.md](README.md)
- **Module erweitern**: Siehe [README.md - Features & Module](README.md#-features--module)
- **Eigene Tests**: Siehe [README.md - Test-Runner](README.md#-test-runner-nutzung)

---

## ⚠️ Troubleshooting

**Backend startet nicht?**
→ PostgreSQL läuft? `sudo systemctl start postgresql`
→ `.env` konfiguriert?

**Frontend kann nicht verbinden?**
→ Backend läuft? Teste: http://localhost:5001/health

**Keine Daten im Dashboard?**
→ Monemee DB hat Daten? Überprüfe `DB_NAME` in `.env`

---

**Viel Erfolg! 🚀**
