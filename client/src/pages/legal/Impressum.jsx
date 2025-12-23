import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import styles from '../../styles/pages/Legal.module.css';

/**
 * Impressum Page
 * Pflichtangaben nach § 5 TMG
 * 
 */
function Impressum() {
  const navigate = useNavigate();

  return (
    <div className={styles.legalPage}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Zurück"
        >
          <Icon name="chevronLeft" size="md" />
        </button>
        <h1 className={styles.headerTitle}>Impressum</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>Impressum</h1>
        <p className={styles.lastUpdated}>Angaben gemäß § 5 TMG</p>

        {/* Anbieter */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Anbieter</h2>
          
          {/* ⚠️ TODO: Mit echten Daten ersetzen! */}
          <div className={styles.contactBox}>
            <p>
              <strong>[Firmenname / Vor- und Nachname]</strong><br />
              [Straße und Hausnummer]<br />
              [PLZ] [Ort]<br />
              Deutschland
            </p>
          </div>
        </section>

        {/* Kontakt */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Kontakt</h2>
          <p className={styles.text}>
            <strong>E-Mail:</strong> <a href="mailto:kontakt@monemee.app" className={styles.link}>kontakt@monemee.app</a><br />
            <strong>Telefon:</strong> [Telefonnummer]
          </p>
        </section>

        {/* Vertretungsberechtigte Person (bei juristischen Personen) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vertretungsberechtigte Person</h2>
          <p className={styles.text}>
            [Name des Geschäftsführers / Vertretungsberechtigten]
          </p>
        </section>

        {/* Registereintrag (falls vorhanden) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Registereintrag</h2>
          <p className={styles.text}>
            Eintragung im Handelsregister.<br />
            <strong>Registergericht:</strong> [Amtsgericht XY]<br />
            <strong>Registernummer:</strong> [HRB XXXXX]
          </p>
        </section>

        {/* Umsatzsteuer-ID */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Umsatzsteuer-ID</h2>
          <p className={styles.text}>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
            <strong>[DE XXXXXXXXX]</strong>
          </p>
        </section>

        {/* Verantwortlich für den Inhalt */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className={styles.text}>
            [Name]<br />
            [Adresse wie oben]
          </p>
        </section>

        {/* EU-Streitschlichtung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>EU-Streitschlichtung</h2>
          <p className={styles.text}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          </p>
          <p className={styles.text}>
            <a 
              href="https://ec.europa.eu/consumers/odr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className={styles.text}>
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
        </section>

        {/* Verbraucherstreitbeilegung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
          <p className={styles.text}>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        {/* Haftungsausschluss */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Haftung für Inhalte</h2>
          <p className={styles.text}>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
            Tätigkeit hinweisen.
          </p>
          <p className={styles.text}>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den 
            allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch 
            erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei 
            Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
        </section>

        {/* Haftung für Links */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Haftung für Links</h2>
          <p className={styles.text}>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
            Seiten verantwortlich.
          </p>
          <p className={styles.text}>
            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße 
            überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. 
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete 
            Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von 
            Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </section>

        {/* Urheberrecht */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Urheberrecht</h2>
          <p className={styles.text}>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
          <p className={styles.text}>
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch 
            gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden 
            die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche 
            gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, 
            bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen 
            werden wir derartige Inhalte umgehend entfernen.
          </p>
        </section>

        {/* Footer Navigation */}
        <nav className={styles.footerNav}>
          <Link to="/datenschutz" className={styles.footerLink}>Datenschutz</Link>
          <Link to="/agb" className={styles.footerLink}>AGB</Link>
          <Link to="/widerruf" className={styles.footerLink}>Widerrufsbelehrung</Link>
        </nav>
      </main>
    </div>
  );
}

export default Impressum;