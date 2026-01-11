import { useState } from 'react';
import { authAPI } from '../services/api';
import styles from '../styles/pages/Login.module.css';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await authAPI.login({ username, password });
      localStorage.setItem('admin_token', response.token);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            🚀 Mission Control
          </h1>
          <p className={styles.subtitle}>Monemee Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={`btn btn-primary btn-full ${styles.submitButton}`}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.buttonContent}>
                <span className="spinner spinner-sm"></span>
                Login...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>Default Credentials:</p>
          <p className={styles.credentials}>admin / admin123</p>
          <p className={styles.warning}>⚠️ Ändere diese vor Production!</p>
        </div>
      </div>
    </div>
  );
}
