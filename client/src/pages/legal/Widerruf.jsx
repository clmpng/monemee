import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import styles from '../../styles/pages/Legal.module.css';

/**
 * Widerrufsbelehrung
 * Pflichtinformation für Verbraucher
 * 
 * ⚠️ WICHTIG: Diese Widerrufsbelehrung entspricht den gesetzlichen 
 * Anforderungen. Kontaktdaten müssen angepasst werden!
 */
function Widerruf() {
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
        <h1 className={styles.headerTitle}>Widerrufsbelehrung</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>Widerrufsbelehrung</h1>
        <p className={styles.lastUpdated}>für Verbraucher</p>

        {/* Widerrufsrecht */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Widerrufsrecht</h2>
          <p className={styles.text}>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag 
            zu widerrufen.
          </p>
          <p className={styles.text}>
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
          </p>
          <p className={styles.text}>
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
          </p>
          
          {/* ⚠️ TODO: Mit echten Daten ersetzen! */}
          <div className={styles.contactBox}>
            <p>
              <strong>[Firmenname / Vor- und Nachname]</strong><br />
              [Straße und Hausnummer]<br />
              [PLZ] [Ort]<br /><br />
              <strong>E-Mail:</strong> widerruf@monemee.app
            </p>
          </div>

          <p className={styles.text}>
            mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) 
            über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das 
            beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
          </p>
          <p className={styles.text}>
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung 
            des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>
        </section>

        {/* Folgen des Widerrufs */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Folgen des Widerrufs</h2>
          <p className={styles.text}>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen 
            erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, 
            die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns 
            angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens 
            binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren 
            Widerruf dieses Vertrags bei uns eingegangen ist.
          </p>
          <p className={styles.text}>
            Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der 
            ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich 
            etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung 
            Entgelte berechnet.
          </p>
        </section>

        {/* Besondere Hinweise */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Besondere Hinweise für digitale Inhalte</h2>
          
          <div className={styles.highlightBox}>
            <p>
              <strong>Vorzeitiges Erlöschen des Widerrufsrechts:</strong>
            </p>
          </div>

          <p className={styles.text}>
            Das Widerrufsrecht erlischt bei einem Vertrag über die Lieferung von nicht auf einem 
            körperlichen Datenträger befindlichen digitalen Inhalten, wenn der Unternehmer mit der 
            Ausführung des Vertrags begonnen hat, nachdem der Verbraucher
          </p>
          <ul className={styles.list}>
            <li>
              ausdrücklich zugestimmt hat, dass der Unternehmer mit der Ausführung des Vertrags 
              vor Ablauf der Widerrufsfrist beginnt, und
            </li>
            <li>
              seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der 
              Ausführung des Vertrags sein Widerrufsrecht verliert.
            </li>
          </ul>

          <div className={styles.infoBox}>
            <p>
              <strong>Das bedeutet:</strong> Wenn Sie beim Kauf eines digitalen Produkts 
              zustimmen, dass der Download bzw. Zugang sofort bereitgestellt wird, verzichten 
              Sie auf Ihr Widerrufsrecht. Dies geschieht durch Aktivierung der entsprechenden 
              Checkbox beim Kaufvorgang.
            </p>
          </div>
        </section>

        {/* Muster-Widerrufsformular */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Muster-Widerrufsformular</h2>
          <p className={styles.text}>
            (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus 
            und senden Sie es zurück.)
          </p>

          <div className={styles.widerrufForm}>
{`An:
[Firmenname / Vor- und Nachname]
[Straße und Hausnummer]
[PLZ] [Ort]
E-Mail: widerruf@monemee.app

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) 
abgeschlossenen Vertrag über den Kauf der folgenden 
Waren (*) / die Erbringung der folgenden Dienstleistung (*)

_________________________________________________

Bestellt am (*) / erhalten am (*): ________________

Name des/der Verbraucher(s): _____________________

Anschrift des/der Verbraucher(s): ________________

_________________________________________________

Datum: __________________________________________

Unterschrift des/der Verbraucher(s) 
(nur bei Mitteilung auf Papier): _________________

(*) Unzutreffendes streichen.`}
          </div>
        </section>

        {/* Ausschluss des Widerrufsrechts */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Fälle des Ausschlusses des Widerrufsrechts</h2>
          <p className={styles.text}>
            Das Widerrufsrecht besteht nicht bei folgenden Verträgen:
          </p>
          <ul className={styles.list}>
            <li>
              Verträge zur Lieferung von nicht auf einem körperlichen Datenträger befindlichen 
              digitalen Inhalten, wenn die Ausführung mit ausdrücklicher Zustimmung des 
              Verbrauchers vor Ende der Widerrufsfrist begonnen hat und nachdem der Verbraucher 
              seine Kenntnis vom Verlust des Widerrufsrechts bestätigt hat.
            </li>
            <li>
              Verträge zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes 
              oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der 
              Lieferung entfernt wurde.
            </li>
            <li>
              Verträge zur Lieferung von Waren, die nach Kundenspezifikation angefertigt werden 
              oder eindeutig auf die persönlichen Bedürfnisse zugeschnitten sind.
            </li>
          </ul>
        </section>

        {/* Kontakt */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Fragen zum Widerruf?</h2>
          <p className={styles.text}>
            Bei Fragen zum Widerrufsrecht können Sie uns jederzeit kontaktieren:
          </p>
          <p className={styles.text}>
            <strong>E-Mail:</strong>{' '}
            <a href="mailto:widerruf@monemee.app" className={styles.link}>
              widerruf@monemee.app
            </a>
          </p>
        </section>

        {/* Footer Navigation */}
        <nav className={styles.footerNav}>
          <Link to="/impressum" className={styles.footerLink}>Impressum</Link>
          <Link to="/datenschutz" className={styles.footerLink}>Datenschutz</Link>
          <Link to="/agb" className={styles.footerLink}>AGB</Link>
        </nav>
      </main>
    </div>
  );
}

export default Widerruf;