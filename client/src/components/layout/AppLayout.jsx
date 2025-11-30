import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

/**
 * Main App Layout
 * - Mobile: Header + Bottom Navigation
 * - Desktop: Sidebar Navigation
 */
function AppLayout({ user }) {
  return (
    <div className="app">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />
      
      {/* Mobile Header */}
      <Header user={user} />
      
      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default AppLayout;