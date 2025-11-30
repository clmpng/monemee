import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../components/common';

/**
 * Register Page
 * TODO: Implement Firebase Authentication
 */
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement Firebase registration
    console.log('Register:', name, email, password);
    
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="page" style={{ paddingTop: '60px', maxWidth: '400px', margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>
          Konto erstellen
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Starte in wenigen Minuten
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Name"
          type="text"
          placeholder="Dein Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
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
          placeholder="Mind. 8 Zeichen"
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
          Registrieren
        </Button>
      </form>

      {/* Terms */}
      <p style={{ 
        fontSize: '12px', 
        color: 'var(--color-text-tertiary)', 
        textAlign: 'center',
        marginTop: '16px'
      }}>
        Mit der Registrierung akzeptierst du unsere{' '}
        <a href="/terms" style={{ color: 'var(--color-primary)' }}>AGB</a> und{' '}
        <a href="/privacy" style={{ color: 'var(--color-primary)' }}>Datenschutzerklärung</a>.
      </p>

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
        🔵 Mit Google registrieren
      </Button>

      {/* Login Link */}
      <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-secondary)' }}>
        Schon ein Konto?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '500' }}>
          Anmelden
        </Link>
      </p>
    </div>
  );
}

export default Register;