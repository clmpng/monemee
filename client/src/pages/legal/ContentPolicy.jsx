import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import styles from '../../styles/pages/Legal.module.css';

/**
 * Inhaltsrichtlinien / Content Policy
 *
 * DSA-konforme Richtlinien für erlaubte und verbotene Inhalte
 * Referenz: Art. 14 DSA (Allgemeine Geschäftsbedingungen)
 */
function ContentPolicy() {
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
        <h1 className={styles.headerTitle}>Inhaltsrichtlinien</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>Inhaltsrichtlinien</h1>
        <p className={styles.lastUpdated}>Stand: Januar 2025</p>

        {/* Einleitung */}
        <section className={styles.section}>
          <p className={styles.text}>
            Diese Inhaltsrichtlinien gelten für alle Produkte und Inhalte, die auf der
            MoneMee-Plattform angeboten werden. Als Creator bist du für die Einhaltung
            dieser Richtlinien verantwortlich. Verstöße können zur Entfernung von Inhalten
            und zur Sperrung deines Accounts führen.
          </p>
        </section>

        {/* Erlaubte Inhalte */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Erlaubte Inhalte</h2>
          <p className={styles.text}>
            Auf MoneMee kannst du folgende digitale Produkte verkaufen:
          </p>
          <ul className={styles.list}>
            <li>E-Books, Guides und Anleitungen</li>
            <li>Online-Kurse und Videoinhalte</li>
            <li>Templates und Vorlagen (z.B. Notion, Canva, Excel)</li>
            <li>Grafiken, Illustrationen und Design-Assets</li>
            <li>Musik, Soundeffekte und Audio-Inhalte (mit entsprechenden Rechten)</li>
            <li>Software, Plugins und digitale Tools</li>
            <li>Coaching- und Beratungsleistungen</li>
            <li>Mitgliedschaften und exklusive Inhalte</li>
          </ul>
        </section>

        {/* Verbotene Inhalte */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Verbotene Inhalte</h2>
          <p className={styles.text}>
            Folgende Inhalte sind auf MoneMee ausdrücklich verboten:
          </p>

          <h3 className={styles.subsectionTitle}>1. Rechtswidrige Inhalte</h3>
          <ul className={styles.list}>
            <li>Inhalte, die gegen deutsches oder EU-Recht verstoßen</li>
            <li>Volksverhetzung, Hasskriminalität und diskriminierende Inhalte</li>
            <li>Terroristische Inhalte oder Anleitungen zu Straftaten</li>
            <li>Kinderpornografische oder jugendgefährdende Inhalte</li>
            <li>Inhalte, die zur Gewalt aufrufen oder diese verherrlichen</li>
          </ul>

          <h3 className={styles.subsectionTitle}>2. Urheberrechtsverletzungen</h3>
          <ul className={styles.list}>
            <li>Raubkopien von Software, Musik, Filmen oder Büchern</li>
            <li>Inhalte, die fremde Urheberrechte, Markenrechte oder Patente verletzen</li>
            <li>Plagiate oder als eigene Arbeit ausgegebene fremde Werke</li>
            <li>Inhalte ohne entsprechende Lizenzen oder Nutzungsrechte</li>
          </ul>

          <h3 className={styles.subsectionTitle}>3. Betrug und Täuschung</h3>
          <ul className={styles.list}>
            <li>Produkte mit irreführenden oder falschen Beschreibungen</li>
            <li>Schneeballsysteme, Pyramidensysteme oder vergleichbare Modelle</li>
            <li>"Get-rich-quick"-Schemes mit unrealistischen Versprechungen</li>
            <li>Fake-Bewertungen oder manipulierte Testimonials</li>
            <li>Produkte, die nicht dem entsprechen, was beworben wird</li>
          </ul>

          <h3 className={styles.subsectionTitle}>4. Schädliche Inhalte</h3>
          <ul className={styles.list}>
            <li>Malware, Viren, Trojaner oder andere Schadsoftware</li>
            <li>Hacking-Tools oder Anleitungen für illegale Aktivitäten</li>
            <li>Phishing-Material oder Tools zum Identitätsdiebstahl</li>
            <li>Spam-Tools oder Bots für unlautere Zwecke</li>
          </ul>

          <h3 className={styles.subsectionTitle}>5. Sonstige verbotene Inhalte</h3>
          <ul className={styles.list}>
            <li>Nicht jugendfreie Inhalte ohne entsprechende Kennzeichnung</li>
            <li>Persönliche Daten Dritter ohne deren Einwilligung</li>
            <li>Gefälschte Dokumente oder Zertifikate</li>
            <li>Produkte, die zum Umgehen von Sicherheitsmaßnahmen dienen</li>
            <li>Waffen, Drogen oder kontrollierte Substanzen</li>
            <li>Medizinische Beratung ohne entsprechende Qualifikation</li>
          </ul>
        </section>

        {/* Rechte an Inhalten */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Rechte an Inhalten</h2>
          <p className={styles.text}>
            Als Creator garantierst du bei jedem Upload:
          </p>
          <ul className={styles.list}>
            <li>Du bist der Urheber oder hast alle erforderlichen Nutzungsrechte</li>
            <li>Du verletzt keine Urheberrechte, Markenrechte oder sonstigen Rechte Dritter</li>
            <li>Bei Verwendung von Stock-Material hast du die entsprechenden Lizenzen</li>
            <li>Bei Kooperationen hast du die Zustimmung aller Beteiligten</li>
          </ul>
        </section>

        {/* Moderation und Durchsetzung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Moderation und Durchsetzung</h2>
          <p className={styles.text}>
            MoneMee behält sich vor, Inhalte zu moderieren und bei Verstößen Maßnahmen zu ergreifen:
          </p>
          <ul className={styles.list}>
            <li><strong>Prüfung:</strong> Wir überprüfen gemeldete Inhalte zeitnah</li>
            <li><strong>Warnung:</strong> Bei erstmaligen, geringfügigen Verstößen erfolgt eine Warnung</li>
            <li><strong>Entfernung:</strong> Regelwidrige Inhalte werden entfernt</li>
            <li><strong>Sperrung:</strong> Bei schweren oder wiederholten Verstößen kann der Account gesperrt werden</li>
          </ul>
          <p className={styles.text}>
            Bei der Entfernung von Inhalten oder Sperrung des Accounts wirst du über die
            Gründe informiert und hast die Möglichkeit, Einspruch einzulegen.
          </p>
        </section>

        {/* Meldung von Inhalten */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inhalte melden</h2>
          <p className={styles.text}>
            Wenn du auf Inhalte stößt, die gegen diese Richtlinien verstoßen, kannst du
            diese über unser Meldeformular melden:
          </p>
          <div className={styles.contactBox}>
            <p>
              <strong>Inhalt melden:</strong><br />
              <Link to="/melden" className={styles.link}>
                Zum Meldeformular
              </Link>
            </p>
            <p style={{ marginTop: 'var(--spacing-md)' }}>
              Wir prüfen jede Meldung sorgfältig und ergreifen bei Verstößen
              entsprechende Maßnahmen. Du erhältst eine Bestätigung über den
              Eingang deiner Meldung.
            </p>
          </div>
        </section>

        {/* Rechtsbehelfe */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Rechtsbehelfe</h2>
          <p className={styles.text}>
            Wenn du der Meinung bist, dass deine Inhalte zu Unrecht entfernt wurden
            oder dein Account zu Unrecht gesperrt wurde, hast du folgende Möglichkeiten:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Interner Einspruch:</strong> Kontaktiere uns innerhalb von 6 Monaten
              nach der Entscheidung unter support@monemee.de
            </li>
            <li>
              <strong>Außergerichtliche Streitbeilegung:</strong> Du kannst dich an eine
              zertifizierte Streitbeilegungsstelle wenden
            </li>
            <li>
              <strong>Gerichtlicher Rechtsweg:</strong> Der Rechtsweg zu den ordentlichen
              Gerichten bleibt unberührt
            </li>
          </ul>
        </section>

        {/* Änderungen */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Änderungen der Richtlinien</h2>
          <p className={styles.text}>
            Wir können diese Inhaltsrichtlinien jederzeit anpassen. Wesentliche Änderungen
            werden dir mindestens 30 Tage vor Inkrafttreten mitgeteilt. Die weitere Nutzung
            der Plattform nach Inkrafttreten der Änderungen gilt als Zustimmung.
          </p>
        </section>

        {/* Kontakt */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Kontakt</h2>
          <p className={styles.text}>
            Bei Fragen zu diesen Inhaltsrichtlinien kannst du uns kontaktieren:
          </p>
          <div className={styles.contactBox}>
            <p>
              <strong>E-Mail:</strong> support@monemee.de<br />
              <strong>Meldeformular:</strong>{' '}
              <Link to="/melden" className={styles.link}>
                monemee.de/melden
              </Link>
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <nav className={styles.footerNav}>
          <Link to="/agb" className={styles.footerLink}>AGB</Link>
          <Link to="/datenschutz" className={styles.footerLink}>Datenschutz</Link>
          <Link to="/impressum" className={styles.footerLink}>Impressum</Link>
          <Link to="/melden" className={styles.footerLink}>Inhalt melden</Link>
        </nav>
      </main>
    </div>
  );
}

export default ContentPolicy;
