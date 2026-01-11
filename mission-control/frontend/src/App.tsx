import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Financial from './pages/Financial';
import Analytics from './pages/Analytics';
import Security from './pages/Security';
import Performance from './pages/Performance';
import Rules from './pages/Rules';
import Leaderboards from './pages/Leaderboards';
import Tests from './pages/Tests';
import SecurityCenter from './pages/SecurityCenter';
import DeveloperTools from './pages/DeveloperTools';
import BusinessIntelligence from './pages/BusinessIntelligence';
import ContentReports from './pages/ContentReports';
import { authAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token');
    if (token) {
      authAPI.verify()
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem('admin_token');
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout onLogout={() => setIsAuthenticated(false)}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/financial" element={<Financial />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/security" element={<Security />} />
        <Route path="/security-center" element={<SecurityCenter />} />
        <Route path="/devtools" element={<DeveloperTools />} />
        <Route path="/bi" element={<BusinessIntelligence />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/reports" element={<ContentReports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
