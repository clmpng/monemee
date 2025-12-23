import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import styles from '../../styles/pages/Legal.module.css';

/**
 * Datenschutzerklärung
 * DSGVO-konforme Datenschutzerklärung
 * 
 * ⚠️ WICHTIG: Kontaktdaten und spezifische Dienste 
 * MÜSSEN vor dem Live-Gang angepasst werden!
 */
function Datenschutz() {
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
        <h1 className={styles.headerTitle}>Datenschutz</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>Datenschutzerklärung</h1>
        <p className={styles.lastUpdated}>Stand: Dezember 2024</p>

        {/* Einleitung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Datenschutz auf einen Blick</h2>
          
          <h3 className={styles.subsectionTitle}>Allgemeine Hinweise</h3>
          <p className={styles.text}>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3 className={styles.subsectionTitle}>Datenerfassung auf dieser Website</h3>
          <p className={styles.text}>
            <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen 
            Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>

          <p className={styles.text}>
            <strong>Wie erfassen wir Ihre Daten?</strong><br />
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei 
            kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder bei 
            der Registrierung angeben.
          </p>
          <p className={styles.text}>
            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website 
            durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. 
            Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
          </p>

          <p className={styles.text}>
            <strong>Wofür nutzen wir Ihre Daten?</strong><br />
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
            gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
          </p>

          <p className={styles.text}>
            <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong><br />
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und 
            Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem 
            ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu 
            weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
          </p>
        </section>

        {/* Verantwortlicher */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Verantwortliche Stelle</h2>
          <p className={styles.text}>
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          
          {/* ⚠️ TODO: Mit echten Daten ersetzen! */}
          <div className={styles.contactBox}>
            <p>
              <strong>[Firmenname / Vor- und Nachname]</strong><br />
              [Straße und Hausnummer]<br />
              [PLZ] [Ort]<br /><br />
              <strong>E-Mail:</strong> datenschutz@monemee.app
            </p>
          </div>

          <p className={styles.text}>
            Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder 
            gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen 
            Daten entscheidet.
          </p>
        </section>

        {/* Rechte der Betroffenen */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Ihre Rechte</h2>
          
          <p className={styles.text}>
            Sie haben folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:
          </p>

          <ul className={styles.list}>
            <li><strong>Recht auf Auskunft</strong> (Art. 15 DSGVO)</li>
            <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
            <li><strong>Recht auf Löschung</strong> („Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
            <li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
            <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
            <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
            <li><strong>Recht auf Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</li>
            <li><strong>Beschwerderecht bei der Aufsichtsbehörde</strong> (Art. 77 DSGVO)</li>
          </ul>

          <p className={styles.text}>
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an die oben genannte verantwortliche Stelle.
          </p>
        </section>

        {/* Datenerfassung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Datenerfassung auf dieser Website</h2>

          <h3 className={styles.subsectionTitle}>Server-Log-Dateien</h3>
          <p className={styles.text}>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten 
            Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
          </p>
          <ul className={styles.list}>
            <li>Browsertyp und Browserversion</li>
            <li>verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
          <p className={styles.text}>
            Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. 
            Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
          </p>

          <h3 className={styles.subsectionTitle}>Registrierung auf dieser Website</h3>
          <p className={styles.text}>
            Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. 
            Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen 
            Angebotes oder Dienstes, für den Sie sich registriert haben.
          </p>
          <p className={styles.text}>
            Bei der Registrierung erfassen wir folgende Daten:
          </p>
          <ul className={styles.list}>
            <li>Name</li>
            <li>E-Mail-Adresse</li>
            <li>Passwort (verschlüsselt gespeichert)</li>
            <li>Optional: Profilbild, Bio, Social Media Links</li>
          </ul>
          <p className={styles.text}>
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* Externe Dienste */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Externe Dienste</h2>

          <h3 className={styles.subsectionTitle}>Firebase Authentication (Google)</h3>
          <p className={styles.text}>
            Wir nutzen Firebase Authentication von Google Ireland Limited zur Benutzerauthentifizierung. 
            Dabei werden folgende Daten verarbeitet:
          </p>
          <ul className={styles.list}>
            <li>E-Mail-Adresse</li>
            <li>Name (bei Google-Login)</li>
            <li>Profilbild-URL (bei Google-Login)</li>
            <li>Authentifizierungstoken</li>
          </ul>
          <p className={styles.text}>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Weitere Informationen: 
            <a 
              href="https://firebase.google.com/support/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            > Firebase Privacy Policy</a>
          </p>

          <h3 className={styles.subsectionTitle}>Stripe Payments</h3>
          <p className={styles.text}>
            Für die Zahlungsabwicklung nutzen wir Stripe, Inc. Bei einer Zahlung werden folgende 
            Daten an Stripe übermittelt:
          </p>
          <ul className={styles.list}>
            <li>Zahlungsdaten (Kreditkartennummer, Ablaufdatum, CVC)</li>
            <li>Rechnungsadresse</li>
            <li>E-Mail-Adresse</li>
            <li>Kaufbetrag und Transaktionsdetails</li>
          </ul>
          <p className={styles.text}>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Weitere Informationen: 
            <a 
              href="https://stripe.com/de/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            > Stripe Datenschutzerklärung</a>
          </p>

          <h3 className={styles.subsectionTitle}>Hosting</h3>
          <p className={styles.text}>
            Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser 
            Website erfasst werden, werden auf den Servern des Hosters gespeichert. Die Verarbeitung 
            erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        </section>

        {/* Datenspeicherung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Speicherdauer</h2>
          <p className={styles.text}>
            Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung der 
            Zwecke, für die sie erhoben wurden, erforderlich ist oder sofern dies gesetzlich 
            vorgeschrieben ist.
          </p>
          <ul className={styles.list}>
            <li><strong>Accountdaten:</strong> Bis zur Löschung des Accounts</li>
            <li><strong>Transaktionsdaten:</strong> 10 Jahre (gesetzliche Aufbewahrungspflicht)</li>
            <li><strong>Server-Logs:</strong> 7 Tage</li>
          </ul>
        </section>

        {/* Datensicherheit */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Datensicherheit</h2>
          <p className={styles.text}>
            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher 
            Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen 
            Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und 
            an dem Schloss-Symbol in Ihrer Browserzeile.
          </p>
          <p className={styles.text}>
            Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns 
            übermitteln, nicht von Dritten mitgelesen werden.
          </p>
        </section>

        {/* Änderungen */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Änderungen dieser Datenschutzerklärung</h2>
          <p className={styles.text}>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den 
            aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen 
            umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
        </section>

        {/* Footer Navigation */}
        <nav className={styles.footerNav}>
          <Link to="/impressum" className={styles.footerLink}>Impressum</Link>
          <Link to="/agb" className={styles.footerLink}>AGB</Link>
          <Link to="/widerruf" className={styles.footerLink}>Widerrufsbelehrung</Link>
        </nav>
      </main>
    </div>
  );
}

export default Datenschutz;