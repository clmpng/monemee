# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monemee is a mobile-first web platform (PWA) that allows users to earn money in two ways:
1. **As Creators**: Create and sell digital products (e-books, templates, guides, courses)
2. **As Promoters**: Affiliate marketing with commission tracking

The platform combines a shop builder with an affiliate system, gamification (5-level system with decreasing fees), and Stripe Connect for payments.

## Tech Stack

**Frontend**: React 18, CSS Modules, React Router v6, Context API, Firebase Auth, Lucide React
**Backend**: Node.js, Express.js, PostgreSQL (Raw SQL, no ORM), Firebase Admin SDK, Stripe API

## Development Commands

### Client (React)
```bash
cd client
npm install           # Install dependencies
npm start             # Start dev server at http://localhost:3000
npm run build         # Build for production
```

### Server (Express)
```bash
cd server
npm install           # Install dependencies
npm run dev           # Start with nodemon (hot reload)
npm start             # Start production server
```

### Database
```bash
# Initialize database
psql -U postgres -d monemee -f database/schema.sql

# Run migrations (if any exist)
psql -U postgres -d monemee -f database/migrations/<migration-file>.sql
```

## Architecture Overview

### Monorepo Structure
```
monemee/
├── client/          # React frontend (proxy to localhost:5000)
├── server/          # Express backend
└── database/        # PostgreSQL schemas and migrations
```

### Frontend Architecture

**Entry Point**: `client/src/index.js` → `App.jsx` → `AppRoutes.jsx`

**Provider Hierarchy**:
1. `BrowserRouter` - Routing
2. `AuthProvider` - Firebase authentication + user state
3. `ProductProvider` - Product management

**Key Directories**:
- `components/common/` - Reusable UI components (Button, Card, Input, Badge, Icon, Modal)
- `components/layout/` - Layout components (Header, Sidebar, BottomNav)
- `components/products/` - Product-specific components
- `components/earnings/` - Charts, modals for earnings
- `components/billing/` - Invoice components
- `pages/` - One file per route, orchestrates components
- `context/` - Global state (Auth, Products)
- `services/` - API calls (abstracted fetch/axios)
- `hooks/` - Custom React hooks
- `styles/base/` - CSS variables, reset, layout utilities
- `styles/components/` - Component-specific CSS modules
- `styles/pages/` - Page-specific CSS modules

### Backend Architecture

**Entry Point**: `server/src/index.js`

**Request Flow**: Routes → Middleware → Controllers → Services → Models

**Key Directories**:
- `config/` - External service configuration (Firebase, Stripe, database, level system)
- `middleware/` - Request processing (auth.js, error.js)
- `models/` - Direct database interaction (Raw SQL)
- `controllers/` - HTTP request/response handling
- `services/` - Complex business logic
- `routes/` - URL to controller mapping

**Important Middleware Order**:
1. Helmet (security headers)
2. CORS
3. Morgan (logging)
4. **Stripe webhooks** (express.raw) - MUST be before express.json()
5. express.json() - for all other routes
6. Routes
7. Error handler

### Authentication Flow

1. Frontend: Firebase Auth (email/password or Google OAuth)
2. Frontend sends Firebase ID token to backend via `Authorization: Bearer <token>`
3. Backend middleware (`server/src/middleware/auth.js`):
   - Verifies Firebase token
   - Finds user in PostgreSQL by `firebase_uid`
   - If user doesn't exist, auto-creates with generated username
   - Adds `req.userId`, `req.user`, `req.firebaseUid` to request
4. Protected routes use `authenticate` middleware
5. Public routes can use `optionalAuth` middleware

### Database

- **No ORM**: All database interactions use raw SQL queries via `pg` library
- **Connection**: Configured in `server/src/config/database.js`
- **Key Tables**: users, products, transactions, affiliate_links
- See `database/schema.sql` for full schema

### Level System

- **Config**: `server/src/config/levels.config.js` is the single source of truth
- 5 levels (Starter → Elite) with decreasing platform fees (29% → 9%)
- Level up based on `total_earnings` in users table
- Key functions: `getLevelByEarnings()`, `getPlatformFee()`, `calculateLevelProgress()`

### Stripe Integration

- **Stripe Connect**: Sellers get their own Stripe account for direct payouts
- **Platform Fee**: Deducted based on user level before seller payout
- **Webhooks**: Handle payment success/failure at `/api/v1/stripe/webhooks`
  - **Critical**: Webhook routes use `express.raw()` and must be registered BEFORE `express.json()`
- **Controllers**:
  - `stripe.controller.js` - Connect onboarding, webhooks
  - `payments.controller.js` - Checkout sessions
  - `sellerBilling.controller.js` - Seller invoicing

### API Routes

All routes prefixed with `/api/v1`:

- `/users` - User profile, onboarding, settings
- `/products` - CRUD for digital products
- `/earnings` - Sales statistics, earnings dashboard
- `/promotion` - Affiliate links, tracking
- `/payments` - Checkout sessions
- `/payouts` - Seller withdrawal requests
- `/stripe` - Connect onboarding, webhooks, account management
- `/invoices` - Invoice generation and viewing
- `/messages` - User messaging system

## Design System & Component Architecture

### CSS Variables (Design Tokens)

All design tokens are defined in `client/src/styles/base/variables.css`:

**Colors**:
- Primary: `--color-primary` (#1E3A8A blue)
- Status: `--color-success`, `--color-warning`, `--color-danger`
- Background: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`
- Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-text-muted`
- Borders: `--color-border`, `--color-border-light`

**Spacing**: `--spacing-xs` (4px) to `--spacing-2xl` (48px)
**Border Radius**: `--radius-sm` (6px) to `--radius-xl` (16px)
**Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-card`
**Transitions**: `--transition-fast` (150ms), `--transition-normal` (200ms), `--transition-slow` (300ms)

**Layout Constants**:
- `--header-height: 56px`
- `--bottom-nav-height: 64px`
- `--sidebar-width: 240px`
- `--max-width-mobile: 480px`
- `--max-width-desktop: 1200px`

### Reusable Components

Use existing components from `client/src/components/common/` whenever possible:

1. **Button** (`Button.jsx`):
   - Variants: primary, secondary, ghost, danger, success
   - Sizes: small, medium, large
   - Props: fullWidth, loading, disabled, icon, iconOnly

2. **Card** (`Card.jsx`):
   - Base Card with padding options
   - `Card.Header` - Title, subtitle, action
   - `Card.Body` - Main content
   - `Card.Footer` - Footer actions
   - `Card.Stats` - Stats display card

3. **Input** (`Input.jsx`):
   - Base Input with label, error, helper text
   - `Input.Textarea` - Multi-line input
   - `Input.Select` - Dropdown select
   - Props: leftIcon, rightIcon, required, disabled

4. **Icon** (`Icon.jsx`):
   - Lucide React icons
   - Consistent sizing and styling

5. **Badge** (`Badge.jsx`):
   - Status indicators
   - Variants and colors

6. **Modal** (`Modal.jsx`):
   - Overlay dialogs
   - Consistent styling

**Note**: New components can be created when required by specific features, but check for existing solutions first to maintain consistency.

### Layout Utilities

Use CSS classes from `client/src/styles/base/layout.css`:

- `.page` - Standard page container with responsive max-width
- `.page-header`, `.page-title`, `.page-subtitle` - Page headers
- `.section`, `.section-header`, `.section-title` - Section organization
- `.grid`, `.grid-2`, `.grid-3` - Grid layouts
- `.flex`, `.flex-center`, `.flex-between`, `.flex-col` - Flex layouts
- `.gap-sm`, `.gap-md`, `.gap-lg` - Gap utilities
- `.empty-state` - Empty state displays

## Mobile-First Development

**Critical Requirements**:
- **Always design for mobile viewports first** (390px baseline)
- Use `100dvh` instead of `100vh` for proper mobile height handling
- Minimum tap target size: 44px for touch-friendly UI
- Responsive breakpoints:
  - Mobile: default (< 768px)
  - Tablet: `@media (min-width: 768px)`
  - Desktop: `@media (min-width: 1024px)`

## Code Style & Standards

### Component Development

1. **Check existing components**: Review `client/src/components/` before creating new components
2. **Use design tokens**: Prefer CSS variables over hardcoded values
3. **CSS Modules**: All component styles use CSS Modules with scoped class names
4. **Modular architecture**: Break complex features into smaller, focused components
5. **Consistent structure**:
   ```jsx
   import React from 'react';
   import styles from '../../styles/components/Component.module.css';

   function Component({ prop1, prop2, ...props }) {
     return (
       <div className={styles.container}>
         {/* Component content */}
       </div>
     );
   }

   export default Component;
   ```

### Styling Guidelines

1. **Modern, consistent design**: Match existing visual patterns and design direction
2. **Use design system**: Leverage CSS variables from `client/src/styles/base/variables.css`
3. **Reuse base styles**: Apply layout utilities from `client/src/styles/base/layout.css`
4. **Consistent spacing**: Use `var(--spacing-*)` variables
5. **Consistent colors**: Use `var(--color-*)` variables
6. **Consistent shadows**: Use `var(--shadow-*)` variables
7. **Consistent transitions**: Use `var(--transition-*)` variables

### Language

- **UI Text**: German
- **Code**: JavaScript ES6+ (Frontend), CommonJS (Backend)
- **Comments**: German preferred, English acceptable
- **No TypeScript**: Project uses vanilla JavaScript

## Configuration

### Environment Variables

**Client** (`.env` in `client/`):
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
# ... other Firebase config
```

**Server** (`.env` in `server/` or root):
```
PORT=5000
CLIENT_URL=http://localhost:3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monemee
DB_USER=postgres
DB_PASSWORD=

# Firebase Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Stripe
STRIPE_SECRET_KEY_TEST=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MODE=test
```

## Common Development Workflows

### Adding a New Feature

1. **Check existing components**: Review `client/src/components/` for reusable components
2. **Plan mobile-first**: Design for 390px viewport first
3. **Use design system**: Apply existing CSS variables and layout utilities
4. **Create page component**: Add to `client/src/pages/<section>/`
5. **Create page styles**: Add CSS module in `client/src/styles/pages/`
6. **Add route**: Register in `client/src/routes/AppRoutes.jsx`
7. **Backend API** (if needed):
   - Create route in `server/src/routes/<feature>.routes.js`
   - Create controller in `server/src/controllers/<feature>.controller.js`
   - Add model method in `server/src/models/<Feature>.model.js`
   - Register route in `server/src/routes/index.js`
8. **API service**: Add to `client/src/services/<feature>.service.js`

### Adding a New Component

1. **Check for existing**: Verify similar component doesn't exist
2. **Create component**: `client/src/components/<section>/Component.jsx`
3. **Create styles**: `client/src/styles/components/Component.module.css`
4. **Use design tokens**: Only use CSS variables from `variables.css`
5. **Make it reusable**: Use props for variants, sizes, states
6. **Export**: Add to appropriate `index.js` if needed

### Database Changes

1. **Create migration**: `database/migrations/<timestamp>_description.sql`
2. **Update schema**: Reflect changes in `database/schema.sql`
3. **Update model**: Modify `server/src/models/<Model>.model.js`
4. **Run migration**: `psql -U postgres -d monemee -f database/migrations/<file>.sql`
