import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import { AppLayout } from '../components/layout';

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

// Public Pages
import { PublicStore, PublicProduct } from '../pages/public';

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
          PUBLIC ROUTES (no auth required)
          ================================ */}
      
      {/* Public Product Page */}
      <Route path="/p/:productId" element={<PublicProduct />} />
      
      {/* Public Store Page */}
      <Route path="/store/:username" element={<PublicStore />} />
      
      {/* Legacy: also support @username format */}
      <Route path="/@:username" element={<PublicStore />} />

      {/* ================================
          AUTH ROUTES
          ================================ */}
      
      {/* Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated 
            ? <Navigate to="/" replace /> 
            : <Login />
        } 
      />
      
      {/* Register */}
      <Route 
        path="/register" 
        element={
          isAuthenticated 
            ? <Navigate to="/" replace /> 
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
          PROTECTED ROUTES
          ================================ */}
      
      <Route 
        element={
          <ProtectedRoute>
            <AppLayout user={user} />
          </ProtectedRoute>
        }
      >
        {/* Store / Home */}
        <Route path="/" element={<MyStore />} />
        
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
      </Route>

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
        minHeight: '100vh',
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
          animation: 'spin 0.8s linear infinite'
        }} 
      />
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}

/**
 * 404 Not Found Page
 */
function NotFound() {
  return (
    <div 
      style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        background: 'var(--color-bg-primary)'
      }}
    >
      <div 
        style={{ 
          width: '100px',
          height: '100px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px'
        }}
      >
        <Icon name="searchX" size={48} style={{ color: 'var(--color-text-tertiary)' }} />
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>
        404
      </h1>
      <p style={{ 
        color: 'var(--color-text-secondary)', 
        marginBottom: '32px',
        maxWidth: '300px'
      }}>
        Die angeforderte Seite existiert leider nicht.
      </p>
      <a 
        href="/"
        style={{
          padding: '12px 24px',
          background: 'var(--color-primary)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        Zur Startseite
      </a>
    </div>
  );
}

export default AppRoutes;
