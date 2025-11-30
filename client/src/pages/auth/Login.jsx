import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../components/common';

/**
 * Login Page
 * TODO: Implement Firebase Authentication
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement Firebase login
    console.log('Login:', email, password);
    
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="page" style={{ paddingTop: '60px', maxWidth: '400px', margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>
          Willkommen zurück
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Melde dich an, um fortzufahren
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="E-Mail"
          type="email"
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          label="Passwort"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          style={{ marginTop: '8px' }}
        >
          Anmelden
        </Button>
      </form>

      {/* Divider */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        margin: '24px 0',
        color: 'var(--color-text-tertiary)'
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span style={{ fontSize: '14px' }}>oder</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>

      {/* Google Login */}
      <Button variant="secondary" fullWidth>
        🔵 Mit Google anmelden
      </Button>

      {/* Register Link */}
      <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-secondary)' }}>
        Noch kein Konto?{' '}
        <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '500' }}>
          Registrieren
        </Link>
      </p>
    </div>
  );
}

export default Login;