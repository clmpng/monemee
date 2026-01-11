import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import { AppLayout, BuyerLayout } from '../components/layout';

// Common
import { Icon } from '../components/common';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Onboarding from '../pages/auth/Onboarding';

// Protected Pages
import { MyStore, AddProduct, EditProduct } from '../pages/store';
import { EarningsDashboard } from '../pages/earnings';
import { PromotionHub } from '../pages/promotion';
import Messages from '../pages/Messages';
import Settings from '../pages/settings/Settings';
import InvoiceView from '../pages/billing/InvoiceView';

// Public Pages
import { PublicStore, PublicProduct } from '../pages/public';
import LandingPage from '../pages/public/LandingPage';
import CheckoutSuccess from '../pages/public/CheckoutSuccess';

// Legal Pages
import { Impressum, Datenschutz, AGB, Widerruf, ContentPolicy } from '../pages/legal';

// Report Pages
import ReportContent from '../pages/public/ReportContent';

// Dashboard Pages
import Purchases from '../pages/dashboard/Purchases';

/**
 * Protected Route Wrapper
 * Redirects to login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * App Routes Configuration
 */
function AppRoutes() {
  const { user, loading, isAuthenticated } = useAuth();

  // Global Loading State
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* ================================
          LANDING PAGE (for non-authenticated users)
          ================================ */}
      
      <Route 
        path="/" 
        element={
          isAuthenticated 
            ? <Navigate to="/dashboard" replace /> 
            : <LandingPage />
        } 
      />

      {/* ================================
          PUBLIC ROUTES (no auth required)
          ================================ */}
      
      {/* Public Product Page */}
      <Route path="/p/:productId" element={<PublicProduct />} />
      
      {/* Public Store Page */}
      <Route path="/store/:username" element={<PublicStore />} />
      
      {/* Legacy: also support @username format */}
      <Route path="/@:username" element={<PublicStore />} />

      {/* ================================
          CHECKOUT ROUTES
          ================================ */}

      {/* Checkout Success - Nach erfolgreicher Stripe-Zahlung */}
      {/* Öffentlich für Gast-Checkout - Validierung über session_id */}
      <Route path="/checkout/success" element={<CheckoutSuccess />} />

      {/* ================================
          LEGAL PAGES (§ 5 TMG, DSGVO)
          ================================ */}
      
      {/* Impressum - Pflicht nach § 5 TMG */}
      <Route path="/impressum" element={<Impressum />} />
      
      {/* Datenschutzerklärung - Pflicht nach DSGVO */}
      <Route path="/datenschutz" element={<Datenschutz />} />
      
      {/* AGB */}
      <Route path="/agb" element={<AGB />} />
      
      {/* Widerrufsbelehrung */}
      <Route path="/widerruf" element={<Widerruf />} />

      {/* Inhaltsrichtlinien (DSA-konform) */}
      <Route path="/inhaltsrichtlinien" element={<ContentPolicy />} />
      <Route path="/content-policy" element={<Navigate to="/inhaltsrichtlinien" replace />} />

      {/* Meldeformular (DSA Art. 16) */}
      <Route path="/melden" element={<ReportContent />} />
      <Route path="/report" element={<Navigate to="/melden" replace />} />

      {/* Legacy routes for consistent linking */}
      <Route path="/privacy" element={<Navigate to="/datenschutz" replace />} />
      <Route path="/terms" element={<Navigate to="/agb" replace />} />

      {/* ================================
          AUTH ROUTES
          ================================ */}
      
      {/* Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated 
            ? <Navigate to="/dashboard" replace /> 
            : <Login />
        } 
      />
      
      {/* Register */}
      <Route 
        path="/register" 
        element={
          isAuthenticated 
            ? <Navigate to="/dashboard" replace /> 
            : <Register />
        } 
      />
      
      {/* Onboarding (optional) */}
      <Route 
        path="/onboarding" 
        element={
          isAuthenticated 
            ? <Onboarding /> 
            : <Navigate to="/login" replace />
        } 
      />

      {/* ================================
          PROTECTED ROUTES - BUYER ONLY
          Minimales Layout für User ohne eigene Produkte
          ================================ */}

      {user?.isBuyerOnly && (
        <Route
          element={
            <ProtectedRoute>
              <BuyerLayout />
            </ProtectedRoute>
          }
        >
          {/* Käufer sehen nur ihre Käufe */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/purchases" replace />} />
          <Route path="/dashboard/purchases" element={<Purchases />} />

          {/* Produkt erstellen (Upgrade zu Creator) */}
          <Route path="/products/new" element={<AddProduct />} />
        </Route>
      )}

      {/* ================================
          PROTECTED ROUTES - FULL APP
          Volles Layout für Creator/Seller
          ================================ */}

      {!user?.isBuyerOnly && (
        <Route
          element={
            <ProtectedRoute>
              <AppLayout user={user} />
            </ProtectedRoute>
          }
        >
          {/* Dashboard / Home (authenticated) */}
          <Route path="/dashboard" element={<MyStore />} />

          {/* Product Management */}
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />

          {/* Earnings / Statistics */}
          <Route path="/earnings" element={<EarningsDashboard />} />

          {/* Promotion */}
          <Route path="/promotion" element={<PromotionHub />} />

          {/* Messages / Notifications */}
          <Route path="/messages" element={<Messages />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Invoices*/}
          <Route path="/invoice/:token" element={<InvoiceView />} />

          {/* Purchases / My bought products */}
          <Route path="/dashboard/purchases" element={<Purchases />} />
        </Route>
      )}

      {/* ================================
          FALLBACK ROUTES
          ================================ */}
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <div 
      style={{ 
        minHeight: '100dvh',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '20px',
        background: 'var(--color-bg-primary)'
      }}
    >
      <div 
        style={{ 
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #818cf8 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
        }}
      >
        <Icon name="dollarCircle" size={32} style={{ color: 'white' }} />
      </div>
      <div 
        style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
    </div>
  );
}

/**
 * 404 Not Found Component
 */
function NotFound() {
  return (
    <div 
      style={{
        minHeight: '100dvh',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '24px',
        padding: '24px',
        textAlign: 'center',
        background: 'var(--color-bg-primary)'
      }}
    >
      <div 
        style={{ 
          width: '80px',
          height: '80px',
          background: 'var(--color-bg-secondary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)'
        }}
      >
        <Icon name="searchX" size={40} />
      </div>
      <div>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: 'var(--color-text-primary)',
          marginBottom: '8px'
        }}>
          Seite nicht gefunden
        </h1>
        <p style={{ 
          color: 'var(--color-text-secondary)',
          marginBottom: '24px'
        }}>
          Die gesuchte Seite existiert nicht.
        </p>
        <a 
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          <Icon name="home" size={18} />
          Zur Startseite
        </a>
      </div>
    </div>
  );
}

export default AppRoutes;
