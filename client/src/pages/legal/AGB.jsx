import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import styles from '../../styles/pages/Legal.module.css';

/**
 * Allgemeine Geschäftsbedingungen (AGB)
 * 
 * ⚠️ WICHTIG: Diese AGB sind ein Entwurf und sollten 
 * vor dem Live-Gang von einem Rechtsanwalt geprüft werden!
 */
function AGB() {
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
        <h1 className={styles.headerTitle}>AGB</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>Allgemeine Geschäftsbedingungen</h1>
        <p className={styles.lastUpdated}>Stand: Dezember 2024</p>

        {/* Geltungsbereich */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 1 Geltungsbereich</h2>
          <p className={styles.text}>
            (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge, 
            die über die Plattform MoneMee (nachfolgend „Plattform") zwischen dem Betreiber 
            (nachfolgend „Anbieter") und dem Nutzer (nachfolgend „Kunde") geschlossen werden.
          </p>
          <p className={styles.text}>
            (2) Die Plattform richtet sich sowohl an Verbraucher als auch an Unternehmer. 
            Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, 
            die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit 
            zugerechnet werden können.
          </p>
          <p className={styles.text}>
            (3) Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des 
            Kunden werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich 
            schriftlich zugestimmt.
          </p>
        </section>

        {/* Leistungsbeschreibung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 2 Leistungsbeschreibung</h2>
          <p className={styles.text}>
            (1) MoneMee ist eine Plattform für den Verkauf und Kauf von digitalen Produkten. 
            Die Plattform ermöglicht es Nutzern als „Creator" eigene digitale Produkte zu erstellen 
            und zu verkaufen sowie als „Käufer" digitale Produkte zu erwerben.
          </p>
          <p className={styles.text}>
            (2) Zusätzlich bietet die Plattform ein Affiliate-Programm (Promoter-System), über 
            welches Nutzer Provisionen für erfolgreiche Vermittlungen von Verkäufen erhalten können.
          </p>
          <p className={styles.text}>
            (3) Der Anbieter stellt lediglich die technische Infrastruktur zur Verfügung. 
            Der Kaufvertrag über digitale Produkte kommt direkt zwischen Creator und Käufer zustande.
          </p>
        </section>

        {/* Registrierung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 3 Registrierung und Nutzerkonto</h2>
          <p className={styles.text}>
            (1) Die Nutzung der Plattform als Creator oder Käufer setzt eine Registrierung voraus. 
            Die Registrierung ist kostenlos.
          </p>
          <p className={styles.text}>
            (2) Bei der Registrierung sind wahrheitsgemäße und vollständige Angaben zu machen. 
            Der Nutzer ist verpflichtet, seine Daten aktuell zu halten.
          </p>
          <p className={styles.text}>
            (3) Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten selbst verantwortlich. 
            Der Nutzer haftet für alle Aktivitäten, die über sein Nutzerkonto vorgenommen werden.
          </p>
          <p className={styles.text}>
            (4) Ein Anspruch auf Registrierung besteht nicht. Der Anbieter behält sich vor, 
            Registrierungen ohne Angabe von Gründen abzulehnen.
          </p>
        </section>

        {/* Vertragsschluss */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 4 Vertragsschluss</h2>
          <p className={styles.text}>
            (1) Die Darstellung der digitalen Produkte auf der Plattform stellt kein rechtlich 
            bindendes Angebot, sondern eine Aufforderung zur Abgabe einer Bestellung dar.
          </p>
          <p className={styles.text}>
            (2) Durch Klicken auf den Button „Jetzt kaufen" bzw. „Kostenlos herunterladen" gibt 
            der Käufer ein verbindliches Kaufangebot ab.
          </p>
          <p className={styles.text}>
            (3) Der Vertrag kommt zustande, wenn der Anbieter die Bestellung durch eine 
            Auftragsbestätigung per E-Mail annimmt oder das digitale Produkt bereitstellt.
          </p>
        </section>

        {/* Preise und Zahlung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 5 Preise und Zahlungsbedingungen</h2>
          <p className={styles.text}>
            (1) Alle angegebenen Preise sind Endpreise und verstehen sich inklusive der gesetzlichen 
            Mehrwertsteuer (sofern anwendbar).
          </p>
          <p className={styles.text}>
            (2) Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Es gelten die 
            Nutzungsbedingungen von Stripe.
          </p>
          <p className={styles.text}>
            (3) Die Zahlung ist sofort bei Bestellung fällig.
          </p>
        </section>

        {/* Bereitstellung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 6 Bereitstellung digitaler Produkte</h2>
          <p className={styles.text}>
            (1) Die digitalen Produkte werden unmittelbar nach erfolgreicher Zahlung zum Download 
            oder zur Online-Nutzung bereitgestellt.
          </p>
          <p className={styles.text}>
            (2) Der Käufer erhält eine nicht-exklusive, nicht-übertragbare Lizenz zur Nutzung des 
            digitalen Produkts für persönliche oder geschäftliche Zwecke, sofern vom Creator nicht 
            anders angegeben.
          </p>
          <p className={styles.text}>
            (3) Eine Weitergabe, Weiterverkauf oder öffentliche Zugänglichmachung des digitalen 
            Produkts ist ohne ausdrückliche Genehmigung des Creators nicht gestattet.
          </p>
        </section>

        {/* Widerrufsrecht */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 7 Widerrufsrecht</h2>
          <p className={styles.text}>
            (1) Verbrauchern steht grundsätzlich ein Widerrufsrecht zu. Die vollständige 
            Widerrufsbelehrung finden Sie unter{' '}
            <Link to="/widerruf" className={styles.link}>Widerrufsbelehrung</Link>.
          </p>
          
          <div className={styles.highlightBox}>
            <p>
              <strong>Wichtiger Hinweis zum Widerrufsrecht bei digitalen Inhalten:</strong><br />
              Das Widerrufsrecht erlischt bei Verträgen über die Lieferung von nicht auf einem 
              körperlichen Datenträger befindlichen digitalen Inhalten, wenn der Anbieter mit der 
              Ausführung des Vertrags begonnen hat, nachdem der Verbraucher ausdrücklich zugestimmt 
              hat, dass der Anbieter mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist 
              beginnt, und der Verbraucher seine Kenntnis davon bestätigt hat, dass er durch seine 
              Zustimmung mit Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert.
            </p>
          </div>
        </section>

        {/* Creator-Bestimmungen */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 8 Besondere Bestimmungen für Creator</h2>
          <p className={styles.text}>
            (1) Creator sind für die Inhalte ihrer digitalen Produkte selbst verantwortlich. 
            Sie garantieren, dass sie über alle erforderlichen Rechte an den angebotenen Inhalten 
            verfügen.
          </p>
          <p className={styles.text}>
            (2) Es ist untersagt, folgende Inhalte auf der Plattform anzubieten:
          </p>
          <ul className={styles.list}>
            <li>Rechtswidrige oder jugendgefährdende Inhalte</li>
            <li>Inhalte, die Rechte Dritter verletzen (Urheberrecht, Markenrecht, etc.)</li>
            <li>Irreführende oder betrügerische Angebote</li>
            <li>Schadsoftware oder schädliche Inhalte</li>
            <li>Inhalte, die gegen geltendes Recht verstoßen</li>
          </ul>
          <p className={styles.text}>
            (3) Der Anbieter behält sich vor, Produkte ohne Vorankündigung zu entfernen, wenn 
            diese gegen diese AGB oder geltendes Recht verstoßen.
          </p>
        </section>

        {/* Provisionen */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 9 Provisionen und Auszahlungen</h2>
          <p className={styles.text}>
            (1) Der Anbieter erhebt eine Plattformgebühr auf jeden Verkauf. Die aktuelle Höhe der 
            Gebühr ist im Nutzerbereich einsehbar und kann je nach Nutzerlevel variieren.
          </p>
          <p className={styles.text}>
            (2) Affiliate-Provisionen (Promoter-Provisionen) werden vom Creator festgelegt und 
            nach erfolgreichem Verkauf gutgeschrieben.
          </p>
          <p className={styles.text}>
            (3) Auszahlungen erfolgen nach Erreichen eines Mindestbetrags von 10,00 EUR. 
            Der Nutzer ist für die korrekte Angabe seiner Zahlungsdaten verantwortlich.
          </p>
          <p className={styles.text}>
            (4) Der Nutzer ist für die Versteuerung seiner Einnahmen selbst verantwortlich.
          </p>
        </section>

        {/* Haftung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 10 Haftung</h2>
          <p className={styles.text}>
            (1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des 
            Körpers oder der Gesundheit sowie für Schäden, die auf Vorsatz oder grober Fahrlässigkeit 
            beruhen.
          </p>
          <p className={styles.text}>
            (2) Im Übrigen ist die Haftung des Anbieters auf den vorhersehbaren, vertragstypischen 
            Schaden begrenzt.
          </p>
          <p className={styles.text}>
            (3) Der Anbieter haftet nicht für Inhalte, die von Creatorn auf der Plattform 
            eingestellt werden.
          </p>
        </section>

        {/* Kündigung */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 11 Vertragslaufzeit und Kündigung</h2>
          <p className={styles.text}>
            (1) Der Nutzungsvertrag wird auf unbestimmte Zeit geschlossen und kann von beiden 
            Seiten jederzeit ohne Angabe von Gründen gekündigt werden.
          </p>
          <p className={styles.text}>
            (2) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
          </p>
          <p className={styles.text}>
            (3) Bei Kündigung werden alle noch offenen Guthaben nach Ablauf eventueller 
            Rückgabefristen ausgezahlt.
          </p>
        </section>

        {/* Schlussbestimmungen */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>§ 12 Schlussbestimmungen</h2>
          <p className={styles.text}>
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
          </p>
          <p className={styles.text}>
            (2) Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder 
            öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle 
            Streitigkeiten aus diesem Vertrag der Geschäftssitz des Anbieters.
          </p>
          <p className={styles.text}>
            (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die 
            Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </section>

        {/* Footer Navigation */}
        <nav className={styles.footerNav}>
          <Link to="/impressum" className={styles.footerLink}>Impressum</Link>
          <Link to="/datenschutz" className={styles.footerLink}>Datenschutz</Link>
          <Link to="/widerruf" className={styles.footerLink}>Widerrufsbelehrung</Link>
        </nav>
      </main>
    </div>
  );
}

export default AGB;