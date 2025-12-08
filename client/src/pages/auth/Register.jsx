import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/common';
import styles from '../../styles/pages/Auth.module.css';

/**
 * Register Page
 * Handles email/password and Google registration
 */
function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, error, clearError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Validate form
  const validateForm = () => {
    if (!name.trim()) {
      setLocalError('Bitte gib deinen Namen ein');
      return false;
    }
    
    if (name.trim().length < 2) {
      setLocalError('Name muss mindestens 2 Zeichen haben');
      return false;
    }
    
    if (!email.trim()) {
      setLocalError('Bitte gib deine E-Mail ein');
      return false;
    }
    
    if (password.length < 6) {
      setLocalError('Passwort muss mindestens 6 Zeichen haben');
      return false;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwörter stimmen nicht überein');
      return false;
    }
    
    return true;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLocalError(null);
    clearError();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await register(email, password, name.trim());
      
      if (result.success) {
        // Redirect to home - user is now logged in
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google registration
  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setLocalError(null);
    clearError();
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = loading || googleLoading;
  const displayError = localError || error;

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { label: 'Schwach', color: 'var(--color-danger)', width: '33%' };
    if (strength <= 3) return { label: 'Mittel', color: 'var(--color-warning)', width: '66%' };
    return { label: 'Stark', color: 'var(--color-success)', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        {/* Logo & Header */}
        <div className={styles.authHeader}>
          <div className={styles.logoWrapper}>
            <Icon name="dollarCircle" size={48} className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Konto erstellen</h1>
          <p className={styles.subtitle}>Starte in wenigen Minuten</p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className={styles.errorMessage}>
            <Icon name="alertCircle" size={18} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <div className={styles.inputWrapper}>
              <input
                id="name"
                type="text"
                placeholder="Dein Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>E-Mail</label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Passwort</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mind. 6 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.inputAction}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && passwordStrength && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div 
                    className={styles.strengthFill}
                    style={{ 
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <span 
                  className={styles.strengthLabel}
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Passwort bestätigen</label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Passwort wiederholen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              {confirmPassword && password === confirmPassword && (
                <span className={styles.inputSuccess}>
                  <Icon name="check" size={18} />
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isLoading || !name || !email || !password || !confirmPassword}
          >
            {loading ? (
              <span className={styles.buttonLoading}>
                <Icon name="loader" size={20} className={styles.spinner} />
                Registrieren...
              </span>
            ) : (
              'Registrieren'
            )}
          </button>
        </form>

        {/* Terms */}
        <p className={styles.terms}>
          Mit der Registrierung akzeptierst du unsere{' '}
          <Link to="/terms" className={styles.termsLink}>AGB</Link> und{' '}
          <Link to="/privacy" className={styles.termsLink}>Datenschutzerklärung</Link>.
        </p>

        {/* Divider */}
        <div className={styles.divider}>
          <span>oder</span>
        </div>

        {/* Google Registration */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          className={styles.googleButton}
          disabled={isLoading}
        >
          {googleLoading ? (
            <span className={styles.buttonLoading}>
              <Icon name="loader" size={20} className={styles.spinner} />
              Registrieren...
            </span>
          ) : (
            <>
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Mit Google registrieren
            </>
          )}
        </button>

        {/* Login Link */}
        <p className={styles.switchAuth}>
          Schon ein Konto?{' '}
          <Link to="/login" className={styles.link}>
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
