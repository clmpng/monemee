# 📚 Monemee - Vollständige Dokumentation

> **Version:** 1.0  
> **Stand:** 01.01.2026  
> **Typ:** Technische Dokumentation

---

## Inhaltsverzeichnis

1. [Einleitung & Übersicht](#1-einleitung--übersicht)
2. [Projektstruktur](#2-projektstruktur)
3. [Frontend-Dokumentation](#3-frontend-dokumentation)
4. [Backend-Dokumentation](#4-backend-dokumentation)
5. [API-Dokumentation](#5-api-dokumentation)
6. [Datenbank-Dokumentation](#6-datenbank-dokumentation)
7. [Flows & Logiken](#7-flows--logiken)
8. [Konfiguration & Setup](#8-konfiguration--setup)

---

# 1. Einleitung & Übersicht

## 1.1 Was ist Monemee?

**Monemee** ist eine mobile-first Web-Plattform (PWA), die es Nutzern ermöglicht, auf zwei Arten Geld zu verdienen:

1. **Als Creator:** Digitale Produkte erstellen und verkaufen (E-Books, Templates, Guides, Kurse)
2. **Als Promoter:** Affiliate-Marketing betreiben und Provisionen verdienen

Die Plattform kombiniert einen einfachen Shop-Builder mit einem Affiliate-System und Gamification-Elementen.

## 1.2 Kernfeatures

| Feature | Beschreibung |
|---------|-------------|
| **Creator Store** | Eigener Shop mit digitalen Produkten, modularem Content-System |
| **Promoter System** | Affiliate-Links generieren, Klicks tracken, Provisionen verdienen |
| **Gamification** | 5-stufiges Level-System mit sinkenden Gebühren |
| **Stripe Connect** | Direkte Auszahlungen für Verkäufer, separate Affiliate-Auszahlungen |
| **Mobile-First** | Optimiert für Smartphones, responsive Desktop-Version |

## 1.3 Tech Stack

### Frontend
| Technologie | Verwendung |
|------------|------------|
| React 18 | UI-Framework |
| JavaScript (ES6+) | Programmiersprache |
| CSS Modules | Styling (scoped CSS) |
| React Router v6 | Client-side Routing |
| Context API | State Management |
| Firebase Auth | Authentifizierung |
| Lucide React | Icon-Bibliothek |

### Backend
| Technologie | Verwendung |
|------------|------------|
| Node.js 18+ | Runtime |
| Express.js | Web-Framework |
| PostgreSQL 14+ | Datenbank |
| Raw SQL | Datenbankabfragen (kein ORM) |
| Firebase Admin SDK | Token-Verifizierung |
| Stripe API | Zahlungsabwicklung |

## 1.4 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  Pages → Components → Context → Services → API                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Express)                          │
├─────────────────────────────────────────────────────────────────┤
│  Routes → Middleware → Controllers → Services → Models          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │ Firebase │   │  Stripe  │
        │    DB    │   │   Auth   │   │ Payments │
        └──────────┘   └──────────┘   └──────────┘
```

---

# 2. Projektstruktur

## 2.1 Verzeichnisübersicht

```
monemee/
├── client/                     # React Frontend
│   ├── public/                 # Statische Dateien
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/         # Wiederverwendbare UI-Komponenten
│       │   ├── common/         # Basis-Komponenten (Button, Card, etc.)
│       │   ├── layout/         # Layout-Komponenten (Header, Sidebar)
│       │   ├── products/       # Produkt-spezifische Komponenten
│       │   └── earnings/       # Einnahmen-Komponenten
│       ├── pages/              # Seitenkomponenten
│       │   ├── auth/           # Login, Register, Onboarding
│       │   ├── store/          # MyStore, AddProduct, EditProduct
│       │   ├── public/         # Öffentliche Seiten
│       │   ├── earnings/       # Earnings Dashboard
│       │   ├── promotion/      # Promotion Hub
│       │   ├── settings/       # Einstellungen
│       │   └── legal/          # Impressum, Datenschutz, etc.
│       ├── context/            # React Context (State Management)
│       ├── hooks/              # Custom React Hooks
│       ├── services/           # API-Service-Layer
│       ├── config/             # Konfigurationsdateien
│       ├── styles/             # CSS Modules
│       │   ├── base/           # Variablen, Reset, Layout
│       │   ├── components/     # Komponenten-Styles
│       │   └── pages/          # Seiten-Styles
│       ├── routes/             # Routing-Konfiguration
│       ├── App.jsx             # Haupt-App-Komponente
│       └── index.js            # Entry Point
│
├── server/                     # Express Backend
│   └── src/
│       ├── config/             # Konfiguration (DB, Firebase, Stripe)
│       ├── middleware/         # Express Middleware
│       ├── models/             # Datenbank-Models (Raw SQL)
│       ├── controllers/        # Request Handler
│       ├── services/           # Business Logic
│       ├── routes/             # API Routes
│       └── index.js            # Server Entry Point
│
├── database/                   # Datenbank-Dateien
│   ├── schema.sql              # Hauptschema
│   └── migrations/             # Migrations-Dateien
│
└── .env.example                # Environment-Variablen Template
```

## 2.2 Ordner-Erklärungen

### Client

| Ordner | Zweck |
|--------|-------|
| `components/common/` | Basis-UI-Komponenten die überall wiederverwendet werden |
| `components/layout/` | Strukturelle Komponenten (Header, Navigation, etc.) |
| `components/products/` | Alles rund um Produkterstellung und -anzeige |
| `components/earnings/` | Charts, Modals, Listen für Einnahmen |
| `pages/` | Eine Datei pro Route, orchestriert Komponenten |
| `context/` | Globaler State (Auth, Products) |
| `services/` | API-Calls, abstrahiert fetch/axios |
| `hooks/` | Wiederverwendbare Logik |
| `styles/base/` | CSS-Variablen, Reset, globale Styles |

### Server

| Ordner | Zweck |
|--------|-------|
| `config/` | Externe Service-Konfiguration |
| `middleware/` | Request-Verarbeitung vor Controller |
| `models/` | Direkte Datenbank-Interaktion |
| `controllers/` | HTTP Request/Response Handling |
| `services/` | Komplexe Business-Logik |
| `routes/` | URL → Controller Mapping |

---

# 3. Frontend-Dokumentation

## 3.1 Entry Points

### `index.js`
```javascript
// React Entry Point
// Rendert die App in das DOM-Element #root
```

**Aufgabe:** Initialisiert React und rendert `<App />` in das Root-Element.

### `App.jsx`

```javascript
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <AppRoutes />
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

**Aufgabe:** 
- Wraps die gesamte App in die nötigen Provider
- Stellt Routing bereit via `BrowserRouter`
- Importiert globale Styles

**Provider-Hierarchie:**
1. `BrowserRouter` - Routing
2. `AuthProvider` - Authentifizierung
3. `ProductProvider` - Produktverwaltung

### `routes/AppRoutes.jsx`

**Aufgabe:** Definiert alle Routen der Anwendung.

**Routing-Struktur:**

| Route | Komponente | Auth | Beschreibung |
|-------|-----------|------|--------------|
| `/` | `LandingPage` | Nein | Startseite für Nicht-Eingeloggte |
| `/login` | `Login` | Nein | Anmeldung |
| `/register` | `Register` | Nein | Registrierung |
| `/onboarding` | `Onboarding` | Ja | Ersteinrichtung |
| `/dashboard` | `MyStore` | Ja | Hauptseite (Store) |
| `/products/new` | `AddProduct` | Ja | Produkt erstellen |
| `/products/:id/edit` | `EditProduct` | Ja | Produkt bearbeiten |
| `/earnings` | `EarningsDashboard` | Ja | Einnahmen-Übersicht |
| `/promotion` | `PromotionHub` | Ja | Affiliate-Bereich |
| `/messages` | `Messages` | Ja | Nachrichten |
| `/settings` | `Settings` | Ja | Einstellungen |
| `/@:username` | `PublicStore` | Nein | Öffentlicher Shop |
| `/p/:productId` | `PublicProduct` | Nein | Produktseite |
| `/checkout/success` | `CheckoutSuccess` | Ja | Nach Kauf |
| `/impressum` | `Impressum` | Nein | Legal |
| `/datenschutz` | `Datenschutz` | Nein | Legal |
| `/agb` | `AGB` | Nein | Legal |
| `/widerruf` | `Widerruf` | Nein | Legal |

**Protected Route Pattern:**
```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

---

## 3.2 Context (State Management)

### `AuthContext.jsx`

**Zweck:** Verwaltet den gesamten Authentifizierungs-State und stellt Auth-Methoden bereit.

**State:**
```javascript
{
  user: {
    id: number,
    firebaseUid: string,
    email: string,
    name: string,
    username: string,
    avatar: string,
    role: 'creator' | 'promoter' | 'both',
    level: number,
    totalEarnings: number,
    isNewUser: boolean
  },
  loading: boolean,
  error: string | null,
  isAuthenticated: boolean
}
```

**Bereitgestellte Methoden:**

| Methode | Parameter | Beschreibung |
|---------|-----------|--------------|
| `login(email, password)` | Email, Passwort | Firebase Email-Login |
| `register(email, password, name)` | Email, Passwort, Name | Neuen Account erstellen |
| `loginWithGoogle()` | - | Google OAuth Login |
| `logout()` | - | Abmelden |
| `updateProfile(data)` | Profildaten | Profil aktualisieren |
| `refreshUser()` | - | User-Daten neu laden |

**Auth-Flow:**
1. Firebase `onAuthStateChanged` Listener
2. Bei Login → Firebase Auth → Backend `/users/me`
3. Backend erstellt User falls nicht vorhanden
4. Profile-Daten werden in Context gespeichert

### `ProductContext.jsx`

**Zweck:** Verwaltet Produkte des eingeloggten Users.

**State:**
```javascript
{
  products: Product[],
  loading: boolean,
  error: string | null
}
```

**Bereitgestellte Methoden:**

| Methode | Parameter | Beschreibung |
|---------|-----------|--------------|
| `fetchProducts()` | - | Alle Produkte laden |
| `getProductFresh(id)` | Produkt-ID | Einzelnes Produkt frisch laden |
| `addProduct(data)` | Produktdaten | Neues Produkt erstellen |
| `updateProduct(id, data)` | ID, Daten | Produkt aktualisieren |
| `deleteProduct(id)` | ID | Produkt löschen |

---

## 3.3 Komponenten

### 3.3.1 Common Components

#### `Button.jsx`

**Zweck:** Einheitlicher Button für die gesamte App.

**Props:**

| Prop | Typ | Default | Beschreibung |
|------|-----|---------|--------------|
| `variant` | `'primary'` \| `'secondary'` \| `'ghost'` \| `'danger'` \| `'success'` | `'primary'` | Visueller Stil |
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Größe |
| `fullWidth` | `boolean` | `false` | Volle Breite |
| `loading` | `boolean` | `false` | Ladezustand |
| `disabled` | `boolean` | `false` | Deaktiviert |
| `icon` | `ReactNode` | - | Icon links |
| `iconOnly` | `boolean` | `false` | Nur Icon zeigen |
| `onClick` | `function` | - | Click Handler |
| `type` | `'button'` \| `'submit'` | `'button'` | Button-Typ |

**Beispiel:**
```jsx
<Button 
  variant="primary" 
  size="large" 
  icon={<Icon name="plus" />}
  onClick={handleCreate}
>
  Produkt erstellen
</Button>
```

#### `Card.jsx`

**Zweck:** Container-Komponente für Inhaltsblöcke.

**Props:**

| Prop | Typ | Default | Beschreibung |
|------|-----|---------|--------------|
| `padding` | `'none'` \| `'small'` \| `'medium'` \| `'large'` | `'medium'` | Innenabstand |
| `elevated` | `boolean` | `false` | Erhöhter Schatten |
| `highlight` | `boolean` | `false` | Primary Border |
| `clickable` | `boolean` | `false` | Hover-Effekt |
| `onClick` | `function` | - | Click Handler |

#### `Icon.jsx`

**Zweck:** Zentralisierte Icon-Komponente basierend auf Lucide React.

**Props:**

| Prop | Typ | Default | Beschreibung |
|------|-----|---------|--------------|
| `name` | `string` | - | Icon-Name (siehe Liste) |
| `size` | `'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` \| `number` | `'md'` | Größe |
| `strokeWidth` | `number` | `1.5` | Liniendicke |
| `className` | `string` | - | CSS-Klasse |

**Verfügbare Icons:**

| Kategorie | Icons |
|-----------|-------|
| Navigation | `store`, `chart`, `megaphone`, `message`, `settings`, `bell`, `search`, `menu`, `close`, `chevronRight`, `chevronLeft`, `chevronUp`, `chevronDown` |
| Finanzen | `wallet`, `trendingUp`, `trendingDown`, `receipt`, `creditCard`, `dollar`, `dollarCircle`, `piggyBank`, `arrowUp`, `arrowDown` |
| Level | `sprout`, `star`, `rocket`, `gem`, `crown`, `award`, `trophy`, `zap`, `sparkles` |
| Aktionen | `plus`, `edit`, `trash`, `copy`, `share`, `download`, `upload`, `link`, `externalLink`, `logout`, `login`, `send` |
| Status | `check`, `checkCircle`, `alertCircle`, `alertTriangle`, `info`, `helpCircle`, `eye`, `eyeOff` |
| Content | `fileText`, `file`, `package`, `video`, `music`, `image`, `folderOpen`, `inbox` |
| User | `users`, `user`, `userPlus`, `heart`, `thumbsUp` |
| Sicherheit | `shield`, `shieldCheck`, `lock`, `unlock` |
| Sonstiges | `calendar`, `clock`, `tag`, `filter`, `refresh`, `loader`, `mail`, `camera` |

**Größen-Mapping:**
```javascript
{
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32
}
```

#### `Badge.jsx`

**Zweck:** Status-Labels und Level-Badges.

**Props:**

| Prop | Typ | Default | Beschreibung |
|------|-----|---------|--------------|
| `variant` | `'default'` \| `'primary'` \| `'success'` \| `'warning'` \| `'danger'` | `'default'` | Farbschema |
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Größe |
| `solid` | `boolean` | `false` | Gefüllter Hintergrund |
| `dot` | `boolean` | `false` | Punkt-Indikator |

**Sub-Komponente `Badge.Level`:**
```jsx
<Badge.Level level={3} name="Rising Star" />
```

#### `Input.jsx`

**Zweck:** Formular-Eingabefeld.

**Props:**

| Prop | Typ | Default | Beschreibung |
|------|-----|---------|--------------|
| `label` | `string` | - | Label-Text |
| `type` | `string` | `'text'` | Input-Typ |
| `placeholder` | `string` | - | Placeholder |
| `value` | `string` | - | Wert |
| `onChange` | `function` | - | Change Handler |
| `error` | `string` | - | Fehlermeldung |
| `helperText` | `string` | - | Hilfetext |
| `required` | `boolean` | `false` | Pflichtfeld |
| `disabled` | `boolean` | `false` | Deaktiviert |
| `leftIcon` | `ReactNode` | - | Icon links |
| `rightIcon` | `ReactNode` | - | Icon rechts |

**Sub-Komponente `Input.Textarea`:**
```jsx
<Input.Textarea 
  label="Beschreibung"
  rows={4}
  value={description}
  onChange={handleChange}
/>
```

#### `Modal.jsx`

**Zweck:** Modal/Dialog mit Bottom-Sheet auf Mobile.

**Props:**

| Prop | Typ | Default | Beschreibung |
|------|-----|---------|--------------|
| `isOpen` | `boolean` | - | Sichtbarkeit |
| `onClose` | `function` | - | Schließen-Handler |
| `title` | `string` | - | Titel |
| `size` | `'small'` \| `'default'` \| `'large'` \| `'fullscreen'` | `'default'` | Größe |
| `showHandle` | `boolean` | `true` | Drag-Handle (Mobile) |
| `closeOnOverlayClick` | `boolean` | `true` | Außen-Klick schließt |
| `footer` | `ReactNode` | - | Footer-Bereich |

**Verhalten:**
- Auf Mobile: Bottom Sheet mit Swipe-Handle
- Auf Desktop: Zentriertes Modal
- Escape-Taste schließt Modal
- Body-Scroll wird blockiert

### 3.3.2 Layout Components

#### `AppLayout.jsx`

**Zweck:** Haupt-Layout für authentifizierte Bereiche.

**Struktur:**
```jsx
<div className="app">
  <Sidebar user={user} />      {/* Desktop */}
  <Header user={user} />       {/* Mobile */}
  <main className="main-content">
    <Outlet />                 {/* Seiten-Content */}
  </main>
  <BottomNav />                {/* Mobile */}
</div>
```

**Responsives Verhalten:**
- **Mobile (< 768px):** Header oben + BottomNav unten
- **Desktop (≥ 768px):** Sidebar links

#### `Header.jsx`

**Zweck:** Mobile Header mit Logo, Notifications, User-Menü.

**Features:**
- Logo-Link zum Dashboard
- Notification-Bell mit Badge
- User-Avatar mit Dropdown-Menü
- Nur auf Mobile sichtbar

#### `Sidebar.jsx`

**Zweck:** Desktop-Navigation.

**Navigation Items:**
```javascript
[
  { icon: 'store', label: 'Mein Store', path: '/dashboard' },
  { icon: 'chart', label: 'Einnahmen', path: '/earnings' },
  { icon: 'megaphone', label: 'Promotion', path: '/promotion' },
  { icon: 'message', label: 'Nachrichten', path: '/messages' },
  { icon: 'settings', label: 'Einstellungen', path: '/settings' }
]
```

#### `BottomNav.jsx`

**Zweck:** Mobile Bottom-Navigation.

**Features:**
- 5 Hauptnavigationspunkte
- Aktiver State
- Notification Badge bei Messages
- Nur auf Mobile sichtbar

### 3.3.3 Product Components

#### `ProductForm.jsx`

**Zweck:** Formular für Produkt-Erstellung und -Bearbeitung.

**Bereiche:**
1. **Thumbnail:** Bild-Upload
2. **Grunddaten:** Titel, Beschreibung
3. **Module:** Content-Module (Dateien, Links, etc.)
4. **Preis:** Preis und Provisions-Einstellung
5. **Status:** Aktiv/Entwurf

**State:**
```javascript
{
  title: string,
  description: string,
  price: number,
  isFree: boolean,
  affiliate_commission: number,
  status: 'draft' | 'active',
  thumbnailFile: File | null,
  modules: Module[]
}
```

#### `ModuleSheet.jsx`

**Zweck:** Bottom Sheet zum Hinzufügen/Bearbeiten von Modulen.

**Modul-Typen:**

| Typ | Icon | Beschreibung |
|-----|------|--------------|
| `file` | `file` | Datei-Download (PDF, ZIP, etc.) |
| `url` | `link` | Externer Link |
| `email` | `mail` | Newsletter-Anmeldung |
| `text` | `fileText` | Text-Inhalt |
| `videocall` | `video` | Video-Call buchen |

**Flow:**
1. Typ auswählen
2. Typ-spezifisches Formular ausfüllen
3. Speichern → Modul wird zur Liste hinzugefügt

#### `ModuleCard.jsx`

**Zweck:** Anzeige eines einzelnen Moduls im Formular.

**Features:**
- Icon nach Typ
- Titel und Beschreibung
- Reorder-Buttons (hoch/runter)
- Bearbeiten/Löschen

#### `ProductTypeSelector.jsx`

**Zweck:** Schritt 1 im Produkt-Wizard - Produkttyp wählen.

**Typen:**
- Digital Download
- Online-Kurs
- Coaching
- Subscription

#### `ProductTemplates.jsx`

**Zweck:** Schritt 2 im Produkt-Wizard - Template wählen.

**Templates:**
- Vorgefertigte Produkt-Strukturen
- Mit vordefinierten Modulen
- Beschleunigt Erstellung

### 3.3.4 Earnings Components

#### `EarningsChart.jsx`

**Zweck:** Diagramm für Einnahmen über Zeit.

**Props:**
- `data`: Array von `{ date, amount }`
- `period`: Zeitraum

#### `LevelInfoModal.jsx`

**Zweck:** Modal mit Level-System Erklärung.

**Zeigt:**
- Alle 5 Level
- Mindest-Umsatz pro Level
- Gebühren-Prozentsatz
- Aktuelles Level hervorgehoben

#### `PayoutModal.jsx`

**Zweck:** Modal für Auszahlungsanforderung.

**Features:**
- Betrag eingeben
- Gebühren-Berechnung anzeigen
- Validierung (Mindestbetrag)
- Absenden

#### `PayoutHistory.jsx`

**Zweck:** Liste vergangener Auszahlungen.

**Anzeige pro Eintrag:**
- Betrag
- Status (pending, completed, failed)
- Datum
- Referenznummer
- Stornieren-Button (bei pending)

---

## 3.4 Pages (Seiten)

### 3.4.1 Auth Pages

#### `Login.jsx`

**Route:** `/login`

**Features:**
- Email/Passwort Login
- Google Login
- Link zu Registrierung
- Redirect nach Login

#### `Register.jsx`

**Route:** `/register`

**Features:**
- Name, Email, Passwort
- Google Registrierung
- AGB Checkbox
- Redirect zum Onboarding

#### `Onboarding.jsx`

**Route:** `/onboarding`

**Schritte:**
1. Rolle wählen (Creator/Promoter/Beides)
2. Username festlegen
3. Optional: Profilbild
4. Fertig → Dashboard

### 3.4.2 Store Pages

#### `MyStore.jsx` (Dashboard)

**Route:** `/dashboard`

**Bereiche:**
1. **Profil-Header:** Avatar, Name, Stats
2. **Quick Actions:** Neues Produkt, Share Store
3. **Produkt-Liste:** Alle eigenen Produkte
4. **Empty State:** Wenn keine Produkte

#### `AddProduct.jsx`

**Route:** `/products/new`

**3-Schritt Wizard:**
1. Produkttyp wählen
2. Template wählen (oder leer)
3. Formular ausfüllen

**Submit-Prozess:**
1. Thumbnail hochladen (Firebase Storage)
2. Modul-Dateien hochladen
3. Produkt erstellen (API)
4. Redirect zur Produktseite

#### `EditProduct.jsx`

**Route:** `/products/:id/edit`

**Features:**
- Lädt Produkt mit Modulen
- Formular vorausgefüllt
- Module bearbeiten/löschen/hinzufügen
- Status ändern

### 3.4.3 Public Pages

#### `LandingPage.jsx`

**Route:** `/` (nur für nicht-authentifizierte User)

**Bereiche:**
1. Hero mit CTA
2. Features-Grid
3. Level-System Erklärung
4. Testimonials
5. How it Works
6. Final CTA

#### `PublicStore.jsx`

**Route:** `/@:username`

**Anzeigt:**
- Creator-Profil
- Alle aktiven Produkte
- Kontakt-Formular

#### `PublicProduct.jsx`

**Route:** `/p/:productId?ref=CODE`

**Bereiche:**
1. Hero-Bild
2. Produktinfo (Titel, Preis, Creator)
3. Beschreibung
4. Modul-Vorschau (was ist enthalten)
5. Kauf-Button
6. Affiliate-Link generieren

**Affiliate-Tracking:**
- `ref` Parameter wird gespeichert
- Click wird getrackt
- Code wird bei Kauf verwendet

#### `CheckoutSuccess.jsx`

**Route:** `/checkout/success?session_id=...`

**Ablauf:**
1. Session-ID aus URL
2. Backend-Verifizierung
3. Erfolgs-Anzeige
4. Download-Links (wenn verfügbar)

### 3.4.4 Earnings Page

#### `EarningsDashboard.jsx`

**Route:** `/earnings`

**Bereiche:**

1. **KPI-Cards:**
   - Gesamteinnahmen
   - Diesen Monat
   - Affiliate-Provisionen
   - Ausstehend

2. **Zeitraum-Auswahl:** 7T, 30T, 90T, 1J

3. **Chart:** Einnahmen-Verlauf

4. **Tabs:**
   - Produkte: Top-Produkte nach Umsatz
   - Provisionen: Affiliate-Verkäufe

5. **Auszahlung:** Modal zum Anfordern

### 3.4.5 Promotion Page

#### `PromotionHub.jsx`

**Route:** `/promotion`

**Bereiche:**
1. **Stats:** Klicks, Conversions, Rate
2. **Meine Links:** Generierte Affiliate-Links
3. **Produkte entdecken:** Neue Produkte bewerben
4. **Netzwerk:** Meine Promoter

### 3.4.6 Settings Page

#### `Settings.jsx`

**Route:** `/settings`

**Tabs:**

| Tab | Inhalt |
|-----|--------|
| Profil | Name, Username, Bio, Avatar |
| Store | Store-Einstellungen |
| Stripe | Stripe Connect Onboarding |
| Account | Email, Passwort, Account löschen |

**Stripe Tab:**
- Status-Anzeige
- Onboarding starten/fortsetzen
- Dashboard-Link

### 3.4.7 Messages Page

#### `Messages.jsx`

**Route:** `/messages`

**Features:**
- Inbox mit ungelesenen Nachrichten
- Nachricht lesen/beantworten
- Als gelesen markieren
- Archivieren/Löschen

### 3.4.8 Legal Pages

| Seite | Route | Inhalt |
|-------|-------|--------|
| `Impressum.jsx` | `/impressum` | Impressum |
| `Datenschutz.jsx` | `/datenschutz` | Datenschutzerklärung |
| `AGB.jsx` | `/agb` | Allgemeine Geschäftsbedingungen |
| `Widerruf.jsx` | `/widerruf` | Widerrufsbelehrung |

---

## 3.5 Services (API Layer)

### `api.js`

**Zweck:** Basis-Konfiguration für HTTP-Requests.

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Firebase Token hinzufügen
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Einheitliches Format
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Error Handling
  }
);
```

### `usersService.js`

```javascript
{
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  updateRole: (role) => api.put('/users/me/role', { role }),
  checkUsername: (username) => api.get(`/users/check-username/${username}`),
  getPublicStore: (username) => api.get(`/users/${username}/store`)
}
```

### `productsService.js`

```javascript
{
  getMyProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  getPublicProduct: (id) => api.get(`/products/${id}/public`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadFile: (file, type) => { /* Firebase Storage Upload */ }
}
```

### `earningsService.js`

```javascript
{
  getDashboard: () => api.get('/earnings/dashboard'),
  getStatistics: (period) => api.get(`/earnings/statistics?period=${period}`),
  getProductEarnings: () => api.get('/earnings/products'),
  getAffiliateEarnings: () => api.get('/earnings/affiliates'),
  getLevelInfo: () => api.get('/earnings/level')
}
```

### `payoutsService.js`

```javascript
{
  getAffiliateBalance: () => api.get('/payouts/affiliate-balance'),
  requestPayout: (amount) => api.post('/payouts/request', { amount }),
  getHistory: () => api.get('/payouts/history'),
  cancelPayout: (id) => api.post(`/payouts/${id}/cancel`),
  getConfig: () => api.get('/payouts/config')
}
```

### `paymentsService.js`

```javascript
{
  createCheckout: (productId, affiliateCode) => 
    api.post('/payments/create-checkout', { productId, affiliateCode }),
  verifySession: (sessionId) => 
    api.get(`/payments/verify-session/${sessionId}`),
  getTransactions: () => api.get('/payments/transactions'),
  getPurchases: () => api.get('/payments/purchases'),
  simulatePurchase: (productId, affiliateCode) => 
    api.post('/payments/simulate-purchase', { productId, affiliateCode })
}
```

### `promotionService.js`

```javascript
{
  generateLink: (productId) => 
    api.post('/promotion/generate-link', { productId }),
  getMyPromotions: () => api.get('/promotion/my-promotions'),
  getMyNetwork: () => api.get('/promotion/my-network'),
  trackClick: (code) => api.post('/promotion/track-click', { code })
}
```

### `messagesService.js`

```javascript
{
  getInbox: () => api.get('/messages'),
  getMessage: (id) => api.get(`/messages/${id}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  sendMessage: (data) => api.post('/messages/send', data),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  markAllAsRead: () => api.put('/messages/read-all'),
  archiveMessage: (id) => api.put(`/messages/${id}/archive`),
  deleteMessage: (id) => api.delete(`/messages/${id}`)
}
```

### `stripeService.js`

```javascript
{
  getConnectStatus: () => api.get('/stripe/connect/status'),
  startOnboarding: () => api.post('/stripe/connect/start'),
  getOnboardingLink: () => api.get('/stripe/connect/onboarding-link'),
  getDashboardLink: () => api.get('/stripe/connect/dashboard-link')
}
```

---

## 3.6 Hooks

### `useEarnings.js`

```javascript
function useEarnings() {
  // Lädt Dashboard-Daten
  return { dashboard, loading, error };
}

function useLevel() {
  // Lädt Level-Info
  return { level, loading, error };
}
```

---

## 3.7 Styles / Design System

### 3.7.1 CSS-Variablen

**Farben:**
```css
:root {
  /* Primary (Indigo/Blau) */
  --color-primary: #1E3A8A;
  --color-primary-light: #3B82F6;
  --color-primary-dark: #1E40AF;
  
  /* Status */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* Background */
  --color-bg-primary: #F8FAFC;
  --color-bg-secondary: #FFFFFF;
  --color-bg-tertiary: #F1F5F9;
  
  /* Text */
  --color-text-primary: #0F172A;
  --color-text-secondary: #334155;
  --color-text-tertiary: #64748B;
  
  /* Border */
  --color-border: #E2E8F0;
}
```

**Spacing:**
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

**Border Radius:**
```css
:root {
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

**Typography:**
```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 2rem;     /* 32px */
}
```

**Layout:**
```css
:root {
  --header-height: 56px;
  --bottom-nav-height: 64px;
  --sidebar-width: 240px;
  --max-width-mobile: 480px;
  --max-width-desktop: 1200px;
  --content-padding: 16px;
  --content-padding-desktop: 32px;
}
```

### 3.7.2 Layout-Klassen

```css
.page {
  max-width: var(--max-width-mobile);
  margin: 0 auto;
  padding: var(--content-padding);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}
```

### 3.7.3 Mobile-First Breakpoint

```css
/* Basis: Mobile */

/* Ab Tablet/Desktop */
@media (min-width: 768px) {
  /* Desktop Styles */
}
```

---

# 4. Backend-Dokumentation

## 4.1 Server-Setup

### `index.js`

```javascript
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// WICHTIG: Stripe Webhooks brauchen Raw Body
// Muss VOR express.json() kommen!
app.use('/api/v1/stripe/webhooks', express.raw({ type: 'application/json' }));

// JSON Parser für alle anderen Routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', routes);

// Error Handler
app.use(errorHandler);

// Start
app.listen(PORT);
```

**Wichtige Reihenfolge:**
1. `helmet()` - Security Headers
2. `cors()` - Cross-Origin
3. `morgan()` - Logging
4. `express.raw()` - NUR für Stripe Webhooks
5. `express.json()` - Für alle anderen Routes
6. Routes
7. Error Handler

---

## 4.2 Konfiguration

### `config/database.js`

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
```

### `config/firebase.js`

```javascript
const admin = require('firebase-admin');

// Service Account JSON parsen
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

### `config/levels.config.js`

```javascript
const LEVELS = [
  { level: 1, name: 'Starter', minEarnings: 0, fee: 12 },
  { level: 2, name: 'Rising Star', minEarnings: 500, fee: 10 },
  { level: 3, name: 'Pro Creator', minEarnings: 2000, fee: 8 },
  { level: 4, name: 'Expert', minEarnings: 5000, fee: 6 },
  { level: 5, name: 'Legend', minEarnings: 10000, fee: 5 }
];

function getLevelByEarnings(totalEarnings) { ... }
function getPlatformFee(level) { ... }
function getNextLevel(currentLevel) { ... }
```

### `config/payout.config.js`

```javascript
const PAYOUT_CONFIG = {
  minFreePayoutAmount: 50,   // Ab 50€ keine Gebühr
  smallPayoutFee: 1,         // 1€ Gebühr unter 50€
  absoluteMinPayout: 5,      // Mindestens 5€
  processingDays: 3,         // Bearbeitungszeit
  clearingDays: 7            // Wartezeit für Affiliates
};

function calculatePayoutFee(amount) { ... }
function calculateNetPayout(amount) { ... }
function canRequestPayout(balance, amount) { ... }
```

---

## 4.3 Middleware

### `middleware/auth.js`

```javascript
const admin = require('../config/firebase');
const UserModel = require('../models/User.model');

/**
 * Authentifizierungs-Middleware
 * Verifiziert Firebase Token und lädt User aus DB
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Kein Token vorhanden' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Firebase Token verifizieren
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // User in DB finden oder erstellen
    let user = await UserModel.findByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      // Neuen User erstellen
      user = await UserModel.create({
        firebase_uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || 'User',
        username: generateUsername(decodedToken.email)
      });
    }
    
    // User-ID an Request hängen
    req.userId = user.id;
    req.firebaseUser = decodedToken;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Ungültiger Token'
    });
  }
}

/**
 * Optionale Authentifizierung
 * Setzt userId wenn Token vorhanden, aber blockiert nicht
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await UserModel.findByFirebaseUid(decodedToken.uid);
      
      if (user) {
        req.userId = user.id;
        req.firebaseUser = decodedToken;
      }
    }
    
    next();
  } catch (error) {
    // Bei Fehler einfach weitermachen ohne User
    next();
  }
}
```

### `middleware/error.js`

```javascript
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Bekannte Fehlertypen
  if (err.code === '23505') { // Postgres Unique Violation
    return res.status(409).json({
      success: false,
      message: 'Eintrag existiert bereits'
    });
  }
  
  // Generischer Fehler
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Interner Serverfehler'
  });
}
```

---

## 4.4 Models (Datenbank-Layer)

### `User.model.js`

**Tabelle:** `users`

**Methoden:**

| Methode | SQL | Beschreibung |
|---------|-----|--------------|
| `findById(id)` | `SELECT * FROM users WHERE id = $1` | User per ID |
| `findByFirebaseUid(uid)` | `SELECT * FROM users WHERE firebase_uid = $1` | User per Firebase UID |
| `findByEmail(email)` | `SELECT * FROM users WHERE email = $1` | User per Email |
| `findByUsername(username)` | `SELECT * FROM users WHERE username = $1` | User per Username |
| `create(data)` | `INSERT INTO users ...` | Neuen User erstellen |
| `update(id, data)` | `UPDATE users SET ...` | User aktualisieren |
| `addEarnings(id, amount)` | `UPDATE users SET total_earnings = total_earnings + $1` | Einnahmen hinzufügen |
| `addAffiliateCommission(id, amount)` | `UPDATE users SET affiliate_pending_balance = affiliate_pending_balance + $1` | Provision hinzufügen |
| `updateAffiliateBalance(id, amount)` | `UPDATE users SET affiliate_balance = affiliate_balance + $1` | Balance ändern |
| `releaseAffiliateClearing(id, amount)` | Von pending zu available verschieben | Nach 7 Tagen |
| `isUsernameAvailable(username)` | `SELECT id FROM users WHERE username = $1` | Username prüfen |

### `Product.model.js`

**Tabelle:** `products`

**Methoden:**

| Methode | Beschreibung |
|---------|--------------|
| `findByUserId(userId)` | Alle Produkte eines Users |
| `findById(id)` | Produkt mit Creator-Daten |
| `create(data)` | Neues Produkt |
| `update(id, data)` | Produkt aktualisieren |
| `delete(id)` | Produkt löschen |
| `incrementViews(id)` | View-Counter +1 |
| `incrementSales(id)` | Sales-Counter +1 |

### `ProductModule.model.js`

**Tabelle:** `product_modules`

**Methoden:**

| Methode | Beschreibung |
|---------|--------------|
| `findByProductId(productId)` | Alle Module eines Produkts (sortiert) |
| `findById(id)` | Einzelnes Modul |
| `create(data)` | Neues Modul |
| `createMany(productId, modules)` | Mehrere Module erstellen |
| `update(id, data)` | Modul aktualisieren |
| `delete(id)` | Modul löschen |
| `deleteByProductId(productId)` | Alle Module eines Produkts löschen |
| `reorder(productId, moduleIds)` | Module neu sortieren |

### `Transaction.model.js`

**Tabelle:** `transactions`

**Methoden:**

| Methode | Beschreibung |
|---------|--------------|
| `findById(id)` | Transaktion mit Details |
| `findByStripePaymentId(id)` | Per Stripe Payment ID |
| `findByStripeSessionId(id)` | Per Stripe Session ID |
| `findBySellerId(sellerId)` | Verkäufe eines Sellers |
| `findByBuyerId(buyerId)` | Käufe eines Buyers |
| `findByPromoterId(promoterId)` | Affiliate-Verkäufe |
| `create(data)` | Neue Transaktion |
| `getStats(userId)` | Statistiken |
| `getTopProductsByRevenue(userId)` | Top-Produkte |
| `getChartData(userId, period)` | Chart-Daten |

### `Affiliate.model.js`

**Tabelle:** `affiliate_links`

**Methoden:**

| Methode | Beschreibung |
|---------|--------------|
| `generateCode()` | 8-stelligen Code generieren |
| `findByCode(code)` | Link per Code |
| `findByPromoterId(promoterId)` | Links eines Promoters |
| `findByProductId(productId)` | Links zu einem Produkt |
| `create(data)` | Link erstellen (oder existierenden zurückgeben) |
| `incrementClicks(code)` | Klicks +1 |

### `Payout.model.js`

**Tabelle:** `payouts`

**Methoden:**

| Methode | Beschreibung |
|---------|--------------|
| `findById(id)` | Payout per ID |
| `findByReference(ref)` | Per Referenznummer |
| `findByUserId(userId)` | Payouts eines Users |
| `create(data)` | Neuen Payout erstellen |
| `updateStatus(id, status)` | Status ändern |
| `getStats(userId)` | Payout-Statistiken |

### `Message.model.js`

**Tabelle:** `messages`

**Methoden:**

| Methode | Beschreibung |
|---------|--------------|
| `findById(id)` | Nachricht per ID |
| `findByRecipientId(recipientId)` | Inbox |
| `getUnreadCount(recipientId)` | Anzahl ungelesener |
| `create(data)` | Neue Nachricht |
| `markAsRead(id, userId)` | Als gelesen markieren |
| `markAllAsRead(userId)` | Alle als gelesen |
| `archive(id, userId)` | Archivieren |
| `delete(id, userId)` | Löschen |

---

## 4.5 Controllers

### `users.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /users/me` | `getMe` | Aktuelles Profil |
| `PUT /users/me` | `updateMe` | Profil aktualisieren |
| `PUT /users/me/role` | `updateRole` | Rolle ändern |
| `GET /users/check-username/:username` | `checkUsername` | Username-Verfügbarkeit |
| `GET /users/:username/store` | `getPublicStore` | Öffentlicher Store |

### `products.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /products` | `getMyProducts` | Eigene Produkte |
| `GET /products/:id` | `getProduct` | Einzelnes Produkt |
| `GET /products/:id/public` | `getPublicProduct` | Öffentliches Produkt |
| `POST /products` | `createProduct` | Produkt erstellen |
| `PUT /products/:id` | `updateProduct` | Produkt aktualisieren |
| `DELETE /products/:id` | `deleteProduct` | Produkt löschen |
| `PUT /products/:id/modules/:moduleId` | `updateModule` | Modul aktualisieren |
| `DELETE /products/:id/modules/:moduleId` | `deleteModule` | Modul löschen |
| `PUT /products/:id/modules/reorder` | `reorderModules` | Module sortieren |

### `payments.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `POST /payments/create-checkout` | `createCheckout` | Stripe Checkout Session |
| `GET /payments/verify-session/:sessionId` | `verifySession` | Session verifizieren |
| `GET /payments/transactions` | `getTransactions` | Verkäufe (als Seller) |
| `GET /payments/purchases` | `getPurchases` | Käufe (als Buyer) |
| `POST /payments/simulate-purchase` | `simulatePurchase` | Test-Kauf (nur Dev) |

**createCheckout Logik:**
1. Produkt laden
2. Seller und Stripe-Status prüfen
3. Buyer laden
4. Affiliate-Code validieren
5. Stripe Checkout Session erstellen
6. Checkout URL zurückgeben

### `earnings.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /earnings/dashboard` | `getDashboard` | Dashboard-Daten |
| `GET /earnings/statistics` | `getStatistics` | Chart-Daten |
| `GET /earnings/products` | `getProductEarnings` | Top-Produkte |
| `GET /earnings/affiliates` | `getAffiliateEarnings` | Affiliate-Verkäufe |
| `GET /earnings/level` | `getLevelInfo` | Level-Info |
| `GET /earnings/levels` | `getAllLevelsInfo` | Alle Level (public) |

### `payouts.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /payouts/config` | `getConfig` | Platform-Konfiguration |
| `GET /payouts/affiliate-balance` | `getAffiliateBalance` | Affiliate-Balance |
| `GET /payouts/history` | `getHistory` | Payout-Historie |
| `POST /payouts/request` | `requestPayout` | Auszahlung anfordern |
| `POST /payouts/:id/cancel` | `cancelPayout` | Auszahlung stornieren |

**requestPayout Logik:**
1. Stripe-Status prüfen
2. Balance prüfen
3. Gebühr berechnen
4. Payout in DB erstellen
5. Balance abziehen
6. Stripe Transfer initiieren

### `promotion.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `POST /promotion/generate-link` | `generateLink` | Affiliate-Link erstellen |
| `GET /promotion/my-promotions` | `getMyPromotions` | Meine Promotions |
| `GET /promotion/my-network` | `getMyNetwork` | Mein Netzwerk |
| `POST /promotion/track-click` | `trackClick` | Klick tracken |
| `POST /promotion/invite` | `invite` | Promoter einladen |

### `messages.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /messages` | `getInbox` | Inbox laden |
| `GET /messages/unread-count` | `getUnreadCount` | Ungelesene zählen |
| `GET /messages/:id` | `getMessage` | Nachricht laden |
| `POST /messages/send` | `sendMessage` | Nachricht senden |
| `PUT /messages/:id/read` | `markAsRead` | Als gelesen |
| `PUT /messages/read-all` | `markAllAsRead` | Alle als gelesen |
| `PUT /messages/:id/archive` | `archiveMessage` | Archivieren |
| `DELETE /messages/:id` | `deleteMessage` | Löschen |

### `stripe.controller.js`

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `GET /stripe/connect/status` | `getConnectStatus` | Connect-Status |
| `POST /stripe/connect/start` | `startOnboarding` | Onboarding starten |
| `GET /stripe/connect/onboarding-link` | `getOnboardingLink` | Neuer Onboarding-Link |
| `GET /stripe/connect/dashboard-link` | `getDashboardLink` | Dashboard-Link |
| `POST /stripe/webhooks/connect` | `handleConnectWebhook` | Account-Events |
| `POST /stripe/webhooks/payments` | `handlePaymentsWebhook` | Payment-Events |

---

## 4.6 Services

### `stripe.service.js`

**Funktionen:**

| Funktion | Beschreibung |
|----------|--------------|
| `isStripeConfigured()` | Prüft ob Stripe-Key gesetzt |
| `createConnectAccount(user)` | Express-Account erstellen |
| `createOnboardingLink(accountId)` | Onboarding-URL generieren |
| `createDashboardLink(accountId)` | Dashboard-URL generieren |
| `getAccountStatus(accountId)` | Account-Status abrufen |
| `createPayout(params)` | Transfer zum Connect Account |
| `getConnectAccountBalance(accountId)` | Balance abrufen |
| `createCheckoutSession(params)` | Checkout Session erstellen |
| `constructWebhookEvent(body, sig)` | Webhook verifizieren |
| `handleAccountUpdated(account)` | Account-Update verarbeiten |
| `handleCheckoutCompleted(session)` | Checkout verarbeiten |
| `handleTransferCreated(transfer)` | Transfer verarbeiten |
| `handlePayoutPaid(payout)` | Auszahlung bestätigen |

### `affiliate.service.js`

**Funktionen:**

| Funktion | Beschreibung |
|----------|--------------|
| `generateLink(productId, promoterId)` | Affiliate-Link erstellen |
| `trackClick(code)` | Klick zählen |
| `validateForPurchase(code, productId)` | Code für Kauf validieren |
| `calculateCommission(amount, percent)` | Provision berechnen |
| `getPromoterStats(promoterId)` | Promoter-Statistiken |

---

## 4.7 Routes

### Route-Übersicht

```javascript
// routes/index.js
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/earnings', earningsRoutes);
router.use('/payouts', payoutsRoutes);
router.use('/promotion', promotionRoutes);
router.use('/messages', messagesRoutes);
router.use('/stripe', stripeRoutes);
router.use('/upload', uploadRoutes);
```

---

# 5. API-Dokumentation

## 5.1 Allgemeines

**Base URL:** `https://api.monemee.app/api/v1`

**Authentifizierung:**
```
Authorization: Bearer <firebase_id_token>
```

**Response-Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error-Format:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## 5.2 Users API

### GET /users/me
Aktuelles Benutzerprofil abrufen.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "bio": "Creator & Promoter",
    "avatar": "https://...",
    "role": "both",
    "level": 2,
    "totalEarnings": 1250.00,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-06-01T15:30:00Z"
  }
}
```

### PUT /users/me
Profil aktualisieren.

**Auth:** Required

**Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "bio": "Digital Creator",
  "avatar_url": "https://..."
}
```

### GET /users/check-username/:username
Username-Verfügbarkeit prüfen.

**Auth:** Optional

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "suggestions": ["johndoe1", "john_doe"]
  }
}
```

### GET /users/:username/store
Öffentlicher Store.

**Auth:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "name": "John Doe",
      "bio": "Creator",
      "avatar": "https://..."
    },
    "products": [
      {
        "id": 1,
        "title": "E-Book",
        "price": 29.99,
        "thumbnail_url": "https://...",
        "sales": 50
      }
    ]
  }
}
```

---

## 5.3 Products API

### GET /products
Eigene Produkte abrufen.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Ultimate Guide",
      "description": "...",
      "price": 29.99,
      "thumbnail_url": "https://...",
      "status": "active",
      "views": 150,
      "sales": 25,
      "affiliate_commission": 20,
      "modules": [
        {
          "id": 1,
          "type": "file",
          "title": "PDF Guide",
          "file_name": "guide.pdf",
          "file_size": 2048000
        }
      ]
    }
  ]
}
```

### GET /products/:id
Einzelnes Produkt.

**Auth:** Required (Owner)

### GET /products/:id/public
Öffentliches Produkt.

**Auth:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Ultimate Guide",
    "description": "...",
    "price": 29.99,
    "thumbnail_url": "https://...",
    "affiliate_commission": 20,
    "creator_username": "johndoe",
    "creator_name": "John Doe",
    "creator_avatar": "https://...",
    "modules": [
      {
        "type": "file",
        "title": "PDF Guide"
      }
    ]
  }
}
```

### POST /products
Neues Produkt erstellen.

**Auth:** Required

**Body:**
```json
{
  "title": "My Product",
  "description": "Description",
  "price": 49.99,
  "thumbnail_url": "https://...",
  "status": "draft",
  "affiliate_commission": 20,
  "modules": [
    {
      "type": "file",
      "title": "Main File",
      "file_url": "https://...",
      "file_name": "product.pdf",
      "file_size": 1024000
    }
  ]
}
```

### PUT /products/:id
Produkt aktualisieren.

**Auth:** Required (Owner)

### DELETE /products/:id
Produkt löschen.

**Auth:** Required (Owner)

---

## 5.4 Payments API

### POST /payments/create-checkout
Stripe Checkout Session erstellen.

**Auth:** Required

**Body:**
```json
{
  "productId": 1,
  "affiliateCode": "ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "checkoutUrl": "https://checkout.stripe.com/..."
  }
}
```

### GET /payments/verify-session/:sessionId
Checkout-Session verifizieren.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentStatus": "paid",
    "productId": 1,
    "productTitle": "My Product",
    "amount": 49.99,
    "transactionId": 123
  }
}
```

### GET /payments/transactions
Verkäufe als Seller.

**Auth:** Required

### GET /payments/purchases
Käufe als Buyer.

**Auth:** Required

---

## 5.5 Earnings API

### GET /earnings/dashboard
Dashboard-Übersicht.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 5000.00,
    "thisMonth": 1200.00,
    "affiliateEarnings": 800.00,
    "pendingBalance": 150.00,
    "level": {
      "current": 3,
      "name": "Pro Creator",
      "fee": 8
    }
  }
}
```

### GET /earnings/statistics?period=30d
Detaillierte Statistiken.

**Auth:** Required

**Query:**
- `period`: `7d`, `30d`, `90d`, `365d`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "summary": {
      "totalRevenue": 2500.00,
      "totalSales": 45,
      "avgOrderValue": 55.56,
      "comparisonPercent": 15.5
    },
    "chartData": [
      { "date": "2024-01-01", "revenue": 150.00, "sales": 3 },
      { "date": "2024-01-02", "revenue": 200.00, "sales": 4 }
    ],
    "topProducts": [
      {
        "id": 1,
        "title": "E-Book",
        "sales": 20,
        "revenue": 599.80,
        "percentage": 24
      }
    ]
  }
}
```

### GET /earnings/level
Level-Information.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 2,
    "name": "Rising Star",
    "fee": 10,
    "color": "#f59e0b",
    "progress": 750,
    "nextLevel": 2000,
    "nextLevelName": "Pro Creator",
    "nextLevelFee": 8
  }
}
```

---

## 5.6 Payouts API

### GET /payouts/config
Platform-Konfiguration (public).

**Auth:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "levels": [
      { "level": 1, "name": "Starter", "minEarnings": 0, "platformFee": 12 },
      { "level": 2, "name": "Rising Star", "minEarnings": 500, "platformFee": 10 }
    ],
    "payout": {
      "minFreePayoutAmount": 50,
      "smallPayoutFee": 1,
      "absoluteMinPayout": 5,
      "processingDays": 3,
      "clearingDays": 7
    }
  }
}
```

### GET /payouts/affiliate-balance
Affiliate-Balance.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "availableBalance": 250.00,
    "pendingBalance": 50.00,
    "totalEarnings": 1500.00,
    "totalPaidOut": 1200.00,
    "pendingPayouts": 0,
    "stripeConnected": true,
    "stripePayoutsEnabled": true,
    "canRequestPayout": true,
    "config": {
      "minFreePayoutAmount": 50,
      "smallPayoutFee": 1
    }
  }
}
```

### POST /payouts/request
Auszahlung anfordern.

**Auth:** Required

**Body:**
```json
{
  "amount": 100.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "referenceNumber": "PAY-2024-00015",
    "amount": 100.00,
    "fee": 0.00,
    "netAmount": 100.00,
    "status": "pending",
    "estimatedArrival": "2024-02-15T00:00:00Z"
  }
}
```

### GET /payouts/history
Payout-Historie.

**Auth:** Required

### POST /payouts/:id/cancel
Payout stornieren.

**Auth:** Required

---

## 5.7 Promotion API

### POST /promotion/generate-link
Affiliate-Link generieren.

**Auth:** Required

**Body:**
```json
{
  "productId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "link": "https://monemee.app/p/1?ref=ABC12345",
    "code": "ABC12345",
    "commission": 20
  }
}
```

### GET /promotion/my-promotions
Meine Promotions.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ABC12345",
      "productId": 1,
      "productTitle": "E-Book",
      "productPrice": 29.99,
      "commission": 20,
      "clicks": 150,
      "conversions": 12,
      "earnings": 71.98
    }
  ]
}
```

### POST /promotion/track-click
Klick tracken.

**Auth:** None

**Body:**
```json
{
  "code": "ABC12345"
}
```

---

## 5.8 Messages API

### GET /messages
Inbox.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sender_name": "Max Mustermann",
      "sender_email": "max@example.com",
      "subject": "Frage zum Produkt",
      "message": "Hallo...",
      "is_read": false,
      "created_at": "2024-02-01T10:00:00Z"
    }
  ]
}
```

### POST /messages/send
Nachricht senden.

**Auth:** Optional

**Body:**
```json
{
  "recipientId": 1,
  "senderName": "Max Mustermann",
  "senderEmail": "max@example.com",
  "subject": "Frage",
  "message": "Hallo, ich habe eine Frage...",
  "productId": 5
}
```

---

## 5.9 Stripe API

### GET /stripe/connect/status
Stripe Connect Status.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "hasStripeAccount": true,
    "accountStatus": "enabled",
    "chargesEnabled": true,
    "payoutsEnabled": true,
    "onboardingComplete": true
  }
}
```

### POST /stripe/connect/start
Onboarding starten.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "onboardingUrl": "https://connect.stripe.com/setup/..."
  }
}
```

### POST /stripe/webhooks/connect
Webhook für Account-Events (Stripe ruft auf).

### POST /stripe/webhooks/payments
Webhook für Payment-Events (Stripe ruft auf).

---

# 6. Datenbank-Dokumentation

## 6.1 Schema-Übersicht

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │────<│   products   │────<│   modules    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│   payouts    │     │ transactions │
└──────────────┘     └──────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│   messages   │     │   affiliate  │
└──────────────┘     │    _links    │
                     └──────────────┘
```

## 6.2 Tabellen-Definitionen

### users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'creator' 
        CHECK (role IN ('creator', 'promoter', 'both')),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    affiliate_balance DECIMAL(10, 2) DEFAULT 0,
    affiliate_pending_balance DECIMAL(10, 2) DEFAULT 0,
    affiliate_earnings_total DECIMAL(10, 2) DEFAULT 0,
    stripe_account_id VARCHAR(255),
    stripe_account_status VARCHAR(20),
    stripe_charges_enabled BOOLEAN DEFAULT false,
    stripe_payouts_enabled BOOLEAN DEFAULT false,
    stripe_onboarding_complete BOOLEAN DEFAULT false,
    stripe_account_updated_at TIMESTAMP,
    stripe_account_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_users_firebase_uid` - Firebase Auth Lookup
- `idx_users_username` - Store URL Lookup
- `idx_users_email` - Email Lookup

### products

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
    thumbnail_url TEXT,
    file_url TEXT,
    type VARCHAR(50) DEFAULT 'download' 
        CHECK (type IN ('download', 'subscription', 'coaching', 'course')),
    status VARCHAR(20) DEFAULT 'draft' 
        CHECK (status IN ('draft', 'active', 'archived')),
    views INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    affiliate_commission INTEGER DEFAULT 20 
        CHECK (affiliate_commission >= 0 AND affiliate_commission <= 50),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_products_user_id` - User's Products
- `idx_products_status` - Active Products
- `idx_products_sales` - Bestseller Sorting

### product_modules

```sql
CREATE TABLE product_modules (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL 
        CHECK (type IN ('file', 'url', 'email', 'videocall', 'text')),
    title VARCHAR(200),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    url TEXT,
    url_label VARCHAR(100),
    newsletter_id VARCHAR(100),
    duration INTEGER,
    booking_url TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_product_modules_product` - Modules by Product
- `idx_product_modules_sort` - Sorted Modules

### transactions

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    promoter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    seller_amount DECIMAL(10, 2) NOT NULL,
    promoter_commission DECIMAL(10, 2) DEFAULT 0,
    stripe_payment_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    affiliate_available_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_transactions_seller_id`
- `idx_transactions_promoter_id`
- `idx_transactions_product_id`
- `idx_transactions_created_at`
- `idx_transactions_status`
- `idx_transactions_stripe_session_id`

### affiliate_links

```sql
CREATE TABLE affiliate_links (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    promoter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, promoter_id)
);
```

**Indexes:**
- `idx_affiliate_links_code` - Code Lookup
- `idx_affiliate_links_promoter_id`
- `idx_affiliate_links_product_id`

### payouts

```sql
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reference_number VARCHAR(50) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    fee DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) NOT NULL,
    iban_last4 VARCHAR(4),
    account_holder VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    source_type VARCHAR(20) DEFAULT 'affiliate',
    payout_type VARCHAR(20) DEFAULT 'standard',
    stripe_transfer_id VARCHAR(255),
    stripe_destination VARCHAR(255),
    stripe_balance_transaction VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

### messages

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);
```

### stripe_webhook_events

```sql
CREATE TABLE stripe_webhook_events (
    id SERIAL PRIMARY KEY,
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'received'
        CHECK (status IN ('received', 'processing', 'processed', 'failed')),
    payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

## 6.3 Migrations

| # | Datei | Beschreibung |
|---|-------|--------------|
| 001 | `schema.sql` | Basis-Schema (users, products, transactions, affiliate_links) |
| 002 | `product_modules.sql` | Module-System für Produkte |
| 003 | `messages.sql` | Nachrichtensystem |
| 004 | `user_balance.sql` | Balance-Felder für Users |
| 005 | `payouts.sql` | Payout-Tabelle |
| 006 | `achievements.sql` | Gamification (Achievements) |
| 007 | `stripe_connect.sql` | Stripe Connect Felder |
| 008 | `stripe_session_id.sql` | Session-ID für Idempotenz |
| 009 | `separate_affiliate_balance.sql` | Trennung Produkt/Affiliate Balance |

---

# 7. Flows & Logiken

## 7.1 Authentifizierung

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │      │  Firebase   │      │   Backend   │
└─────────────┘      └─────────────┘      └─────────────┘
      │                     │                     │
      │  1. Login/Register  │                     │
      │────────────────────>│                     │
      │                     │                     │
      │  2. ID Token        │                     │
      │<────────────────────│                     │
      │                     │                     │
      │  3. API Request + Token                   │
      │──────────────────────────────────────────>│
      │                     │                     │
      │                     │  4. Verify Token    │
      │                     │<────────────────────│
      │                     │                     │
      │                     │  5. Token Valid     │
      │                     │────────────────────>│
      │                     │                     │
      │                     │     6. Find/Create  │
      │                     │        User in DB   │
      │                     │                     │
      │  7. Response + User Data                  │
      │<──────────────────────────────────────────│
```

## 7.2 Produktkauf (Checkout Flow)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Buyer     │      │   Backend   │      │   Stripe    │      │   Seller    │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
      │                     │                     │                     │
      │  1. Buy Product     │                     │                     │
      │────────────────────>│                     │                     │
      │                     │                     │                     │
      │                     │  2. Create Session  │                     │
      │                     │────────────────────>│                     │
      │                     │                     │                     │
      │  3. Redirect to Checkout                  │                     │
      │<────────────────────────────────────────>│                     │
      │                     │                     │                     │
      │  4. Payment         │                     │                     │
      │─────────────────────────────────────────>│                     │
      │                     │                     │                     │
      │                     │  5. Webhook: Success│                     │
      │                     │<────────────────────│                     │
      │                     │                     │                     │
      │                     │  6. Create Transaction                    │
      │                     │  7. Update Balances                       │
      │                     │                     │                     │
      │                     │  8. Transfer to Seller                    │
      │                     │────────────────────>│────────────────────>│
      │                     │                     │                     │
      │  9. Success Page    │                     │                     │
      │<────────────────────│                     │                     │
```

**Gebühren-Berechnung:**
```javascript
// Beispiel: 49.99€ Produkt, Level 2 Seller, 20% Affiliate

const price = 49.99;
const platformFeePercent = 10;  // Level 2
const affiliatePercent = 20;

const platformFee = price * 0.10;        // 5.00€
const affiliateCommission = price * 0.20; // 10.00€
const sellerAmount = price - platformFee; // 44.99€

// Affiliate wird aus platformFee bezahlt (nicht zusätzlich vom Preis)
// Platform behält: platformFee - affiliateCommission = -5.00€ (geht an Affiliate)
```

## 7.3 Affiliate-System

### Link-Generierung:
1. Promoter wählt Produkt
2. Backend erstellt `affiliate_links` Eintrag
3. Einzigartiger 8-stelliger Code
4. URL: `https://monemee.app/p/{productId}?ref={code}`

### Click-Tracking:
1. Besucher klickt Affiliate-Link
2. Frontend sendet `POST /promotion/track-click`
3. Backend: `clicks += 1`
4. Code wird im LocalStorage gespeichert

### Provision bei Kauf:
1. Checkout mit `affiliateCode`
2. Validierung: Code + Produkt + Aktiv
3. Provision berechnen
4. Bei Erfolg: `affiliate_pending_balance += commission`
5. `affiliate_available_at = NOW() + 7 days`

### 7-Tage Clearing:
1. Cronjob prüft täglich
2. `affiliate_available_at <= NOW()`
3. Move: `pending_balance → available_balance`
4. Promoter kann auszahlen

## 7.4 Auszahlungen

### Produkt-Einnahmen (Automatisch):
```
Käufer → Stripe → Seller's Stripe Account
                     ↑
               (minus Platform Fee)
```
- Keine manuelle Auszahlung nötig
- Stripe überweist automatisch
- Platform Fee bleibt bei Monemee

### Affiliate-Provisionen (Manuell):
```
                    ┌─────────────────┐
                    │  7 Tage Clearing │
                    └────────┬────────┘
                             ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Pending    │───>│  Available   │───>│   Payout     │
│   Balance    │    │   Balance    │    │  Requested   │
└──────────────┘    └──────────────┘    └──────────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │Stripe Transfer│
                    │ to Promoter   │
                    └──────────────┘
```

### Gebühren:
```javascript
if (amount >= 50) {
  fee = 0;           // Kostenlos
} else if (amount >= 5) {
  fee = 1;           // 1€ Gebühr
} else {
  // Nicht möglich
}
```

## 7.5 Level-System

| Level | Name | Min. Umsatz | Platform Fee |
|-------|------|-------------|--------------|
| 1 | Starter | 0€ | 12% |
| 2 | Rising Star | 500€ | 10% |
| 3 | Pro Creator | 2.000€ | 8% |
| 4 | Expert | 5.000€ | 6% |
| 5 | Legend | 10.000€ | 5% |

**Level-Berechnung:**
```javascript
function calculateLevel(totalEarnings) {
  if (totalEarnings >= 10000) return 5;
  if (totalEarnings >= 5000) return 4;
  if (totalEarnings >= 2000) return 3;
  if (totalEarnings >= 500) return 2;
  return 1;
}
```

---

# 8. Konfiguration & Setup

## 8.1 Environment Variables

### Client (.env)
```env
# API
REACT_APP_API_URL=http://localhost:5000/api/v1

# Firebase
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=myapp.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=myapp
REACT_APP_FIREBASE_STORAGE_BUCKET=myapp.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Server (.env)
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/monemee

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Stripe
STRIPE_MODE=test
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_...
STRIPE_WEBHOOK_SECRET_PAYMENTS=whsec_...
```

## 8.2 Firebase Setup

1. **Projekt erstellen:** Firebase Console → New Project
2. **Auth aktivieren:** Authentication → Email/Password + Google
3. **Storage aktivieren:** Storage → Start
4. **Service Account:** Project Settings → Service Accounts → Generate Key
5. **Web App registrieren:** Project Settings → Add App → Web

## 8.3 Stripe Setup

### Test-Modus:
1. Stripe Dashboard → Developers → API Keys
2. Test Secret Key kopieren
3. In `.env` als `STRIPE_SECRET_KEY_TEST`

### Webhooks (Local mit Stripe CLI):
```bash
stripe login
stripe listen --forward-to localhost:5000/api/v1/stripe/webhooks/payments
stripe listen --forward-to localhost:5000/api/v1/stripe/webhooks/connect
```

### Webhooks (Production):
1. Stripe Dashboard → Developers → Webhooks
2. Add Endpoint: `https://api.monemee.app/api/v1/stripe/webhooks/payments`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
3. Add Endpoint: `https://api.monemee.app/api/v1/stripe/webhooks/connect`
   - Events: `account.updated`

## 8.4 PostgreSQL Setup

```bash
# Datenbank erstellen
createdb monemee

# Schema anwenden
psql -d monemee -f database/schema.sql

# Migrations anwenden
psql -d monemee -f database/migrations/002_product_modules.sql
psql -d monemee -f database/migrations/003_messages.sql
# ... weitere Migrations
```

## 8.5 Installation & Start

```bash
# 1. Repository klonen
git clone https://github.com/username/monemee.git
cd monemee

# 2. Client Setup
cd client
npm install
cp .env.example .env
# .env ausfüllen

# 3. Server Setup
cd ../server
npm install
cp .env.example .env
# .env ausfüllen

# 4. Datenbank Setup
psql -U postgres -f database/schema.sql

# 5. Development Server starten
# Terminal 1:
cd client && npm start

# Terminal 2:
cd server && npm run dev
```

## 8.6 Deployment

### Frontend (Vercel/Netlify):
```bash
cd client
npm run build
# Deploy build/ Ordner
```

### Backend (Railway/Render/Heroku):
```bash
cd server
# Environment Variables setzen
# Start Command: npm start
```

### Datenbank (Supabase/Neon/Railway):
- PostgreSQL Service erstellen
- `DATABASE_URL` in Backend setzen
- Schema migrieren

---

# Anhang

## A. HTTP Status Codes

| Code | Bedeutung |
|------|-----------|
| 200 | Erfolg |
| 201 | Erstellt |
| 400 | Bad Request |
| 401 | Nicht authentifiziert |
| 403 | Keine Berechtigung |
| 404 | Nicht gefunden |
| 409 | Konflikt (z.B. Username existiert) |
| 500 | Server Error |

## B. Error Codes

| Code | Bedeutung |
|------|-----------|
| `NO_STRIPE_ACCOUNT` | Stripe nicht eingerichtet |
| `ONBOARDING_INCOMPLETE` | Onboarding nicht fertig |
| `PAYOUTS_NOT_ENABLED` | Auszahlungen deaktiviert |
| `INSUFFICIENT_BALANCE` | Nicht genug Guthaben |
| `SELLER_NO_STRIPE` | Verkäufer ohne Stripe |
| `SELLER_CHARGES_DISABLED` | Verkäufer kann nicht empfangen |

## C. Glossar

| Begriff | Erklärung |
|---------|-----------|
| Creator | User der Produkte verkauft |
| Promoter | User der Affiliate-Links teilt |
| Affiliate | Provisions-System |
| Clearing | 7-Tage Wartezeit für Provisionen |
| Connect | Stripe Connect Express Account |
| Module | Inhaltselement eines Produkts |

---

**Ende der Dokumentation**

*Erstellt: 31. Dezember 2025*  
*Monemee v1.0*
