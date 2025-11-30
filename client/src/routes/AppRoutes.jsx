import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import { AppLayout } from '../components/layout';

// Pages
import { MyStore } from '../pages/store';
import { EarningsDashboard } from '../pages/earnings';
import { PromotionHub } from '../pages/promotion';
import Messages from '../pages/Messages';

/**
 * App Routes Configuration
 */
function AppRoutes() {
  // Mock user (später aus AuthContext)
  const user = {
    id: 1,
    name: 'Max Mustermann',
    username: '@maxmuster',
    avatar: null
  };

  return (
    <Routes>
      {/* Main App Layout with Bottom Nav */}
      <Route element={<AppLayout user={user} />}>
        {/* Store / Home */}
        <Route path="/" element={<MyStore />} />
        
        {/* Earnings / Statistics */}
        <Route path="/earnings" element={<EarningsDashboard />} />
        
        {/* Promotion */}
        <Route path="/promotion" element={<PromotionHub />} />
        
        {/* Messages */}
        <Route path="/messages" element={<Messages />} />
        
        {/* Product Pages (später) */}
        {/* <Route path="/products" element={<ProductsList />} /> */}
        {/* <Route path="/products/new" element={<AddProduct />} /> */}
        {/* <Route path="/products/:id" element={<ProductDetail />} /> */}
        {/* <Route path="/products/:id/edit" element={<EditProduct />} /> */}
        
        {/* Settings (später) */}
        {/* <Route path="/settings" element={<Settings />} /> */}
      </Route>

      {/* Auth Routes (ohne Bottom Nav - später) */}
      {/* <Route path="/login" element={<Login />} /> */}
      {/* <Route path="/register" element={<Register />} /> */}
      {/* <Route path="/onboarding" element={<Onboarding />} /> */}

      {/* Public Store (ohne Nav - später) */}
      {/* <Route path="/:username" element={<PublicStore />} /> */}
      {/* <Route path="/p/:productId" element={<PublicProduct />} /> */}

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Simple 404 Page
function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Seite nicht gefunden</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Die angeforderte Seite existiert nicht.
      </p>
    </div>
  );
}

export default AppRoutes;