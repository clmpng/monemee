import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/components/LegalFooter.module.css';

/**
 * LegalFooter Component
 * Rechtlich erforderliche Links - von jeder Seite aus erreichbar
 * 
 * Varianten:
 * - 'minimal': Nur Links in einer Zeile (für App-Bereich)
 * - 'compact': Links mit Trennzeichen (für öffentliche Seiten)
 * - 'full': Mit Copyright und allen Infos (für Landing-ähnliche Seiten)
 * 
 * @param {string} variant - 'minimal' | 'compact' | 'full'
 * @param {string} className - Zusätzliche CSS-Klasse
 */
function LegalFooter({ variant = 'minimal', className = '' }) {
  const legalLinks = [
    { to: '/impressum', label: 'Impressum' },
    { to: '/datenschutz', label: 'Datenschutz' },
    { to: '/agb', label: 'AGB' },
    { to: '/widerruf', label: 'Widerruf' },
  ];

  // Minimal: Nur für eingeloggten Bereich
  if (variant === 'minimal') {
    return (
      <footer className={`${styles.legalFooter} ${styles.minimal} ${className}`}>
        <nav className={styles.links}>
          {legalLinks.map((link, index) => (
            <React.Fragment key={link.to}>
              <Link to={link.to} className={styles.link}>
                {link.label}
              </Link>
              {index < legalLinks.length - 1 && (
                <span className={styles.separator}>·</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </footer>
    );
  }

  // Compact: Für öffentliche Seiten (PublicStore, PublicProduct)
  if (variant === 'compact') {
    return (
      <footer className={`${styles.legalFooter} ${styles.compact} ${className}`}>
        <div className={styles.compactContent}>
          <span className={styles.poweredBy}>
            Powered by{' '}
            <Link to="/" className={styles.brandLink}>
              MoneMee
            </Link>
          </span>
          <nav className={styles.links}>
            {legalLinks.map((link, index) => (
              <React.Fragment key={link.to}>
                <Link to={link.to} className={styles.link}>
                  {link.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <span className={styles.separator}>·</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </footer>
    );
  }

  // Full: Für Landing-ähnliche Seiten mit Copyright
  return (
    <footer className={`${styles.legalFooter} ${styles.full} ${className}`}>
      <div className={styles.fullContent}>
        <nav className={styles.links}>
          {legalLinks.map((link) => (
            <Link key={link.to} to={link.to} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} MoneMee. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}

export default LegalFooter;