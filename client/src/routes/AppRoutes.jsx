import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import { AppLayout } from '../components/layout';

// Common
import { Icon } from '../components/common';

// Pages
import { MyStore, AddProduct, EditProduct } from '../pages/store';
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
      {/* Main App Layout with Navigation */}
      <Route element={<AppLayout user={user} />}>
        {/* Store / Home */}
        <Route path="/" element={<MyStore />} />
        
        {/* Add Product */}
        <Route path="/products/new" element={<AddProduct />} />

        {/* Edit Product */}
        <Route path="/products/:id/edit" element={<EditProduct />} />
        
        {/* Earnings / Statistics */}
        <Route path="/earnings" element={<EarningsDashboard />} />
        
        {/* Promotion */}
        <Route path="/promotion" element={<PromotionHub />} />
        
        {/* Messages */}
        <Route path="/messages" element={<Messages />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Simple 404 Page
function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>
        <Icon name="searchX" size={64} />
      </div>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Seite nicht gefunden</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Die angeforderte Seite existiert nicht.
      </p>
    </div>
  );
}

export default AppRoutes;