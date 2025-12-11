import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/common';
import styles from '../../styles/pages/LandingPage.module.css';

/**
 * Landing Page - Monemee
 * Modern, clean design for digital product creators
 */
function LandingPage() {
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const reviewsRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, observerOptions);

    // Observe all animated sections
    const sections = document.querySelectorAll(`.${styles.animateOnScroll}`);
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: 'zap',
      title: 'In Minuten online',
      description: 'Erstelle deinen Store und lade dein erstes Produkt in weniger als 5 Minuten hoch.'
    },
    {
      icon: 'shield',
      title: 'Sichere Zahlungen',
      description: 'Stripe-Integration für sichere Transaktionen. Deine Einnahmen direkt auf dein Konto.'
    },
    {
      icon: 'trendingUp',
      title: 'Live-Statistiken',
      description: 'Verfolge Verkäufe, Views und Einnahmen in Echtzeit auf deinem Dashboard.'
    },
    {
      icon: 'link',
      title: 'Dein eigener Link',
      description: 'Teile deinen persönlichen Store-Link: monemee.app/@deinname'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Account erstellen',
      description: 'Kostenlos registrieren – dauert nur 30 Sekunden.'
    },
    {
      number: '02',
      title: 'Produkt hochladen',
      description: 'E-Book, Template, Kurs oder Guide – lade dein digitales Produkt hoch.'
    },
    {
      number: '03',
      title: 'Link teilen & verdienen',
      description: 'Teile deinen Store-Link und verdiene bei jedem Verkauf.'
    }
  ];

  const reviews = [
    {
      name: 'Sarah M.',
      role: 'Content Creator',
      avatar: 'S',
      rating: 5,
      text: 'Endlich eine Plattform, die einfach funktioniert! Mein E-Book war in 10 Minuten online und ich hatte noch am selben Tag meinen ersten Verkauf.',
      earnings: '847€'
    },
    {
      name: 'Tim K.',
      role: 'Designer',
      avatar: 'T',
      rating: 5,
      text: 'Die beste Entscheidung für mein Side-Business. Keine versteckten Kosten, super einfache Bedienung. Kann ich nur empfehlen!',
      earnings: '2.340€'
    },
    {
      name: 'Lisa W.',
      role: 'Coach',
      avatar: 'L',
      rating: 5,
      text: 'Ich verkaufe meine Worksheets und Vorlagen hier. Der Support ist top und die Auszahlungen kommen zuverlässig. Perfekt!',
      earnings: '1.120€'
    }
  ];

  return (
    <div className={styles.landingPage}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>
                <Icon name="dollarCircle" size="lg" />
          </span>
            <span className={styles.logoText}>MoneMee</span>
          </Link>
          <div className={styles.navActions}>
            <Link to="/login" className={styles.navLink}>
              Anmelden
            </Link>
            <Link to="/register" className={styles.navButton}>
              Kostenlos starten
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Icon name="star" size="sm" />
              <span>Du zahlst nur, wenn du verdienst</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Dein Wissen.<br />
              <span className={styles.heroHighlight}>Dein Einkommen.</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              Verkaufe digitale Produkte wie E-Books, Templates oder Kurse – 
              mit nur wenigen Klicks. Kein Technik-Stress, keine Startkosten.
            </p>
            
            <div className={styles.heroCtas}>
              <Link to="/register" className={styles.ctaPrimary}>
                Jetzt kostenlos starten
                <Icon name="arrowRight" size="sm" />
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Ich habe bereits ein Konto
              </Link>
            </div>
            
            <div className={styles.heroTrust}>
              <div className={styles.trustItem}>
                <Icon name="check" size="sm" />
                <span>100% kostenlos starten</span>
              </div>
              <div className={styles.trustItem}>
                <Icon name="check" size="sm" />
                <span>Keine monatlichen Gebühren</span>
              </div>
              <div className={styles.trustItem}>
                <Icon name="check" size="sm" />
                <span>In 5 Min. online</span>
              </div>
            </div>
          </div>
          
          <div className={styles.heroVisual}>
            <div className={styles.mockupCard}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDots}>
                  <span></span><span></span><span></span>
                </div>
                <span className={styles.mockupUrl}>monemee.app/@maxmuster</span>
              </div>
              <div className={styles.mockupContent}>
                <div className={styles.mockupProfile}>
                  <div className={styles.mockupAvatar}>M</div>
                  <div>
                    <div className={styles.mockupName}>Max Mustermann</div>
                    <div className={styles.mockupHandle}>@maxmuster</div>
                  </div>
                </div>
                <div className={styles.mockupProducts}>
                  <div className={styles.mockupProduct}>
                    <div className={styles.mockupProductIcon}>📘</div>
                    <div className={styles.mockupProductInfo}>
                      <span>Productivity Guide</span>
                      <strong>29,99 €</strong>
                    </div>
                  </div>
                  <div className={styles.mockupProduct}>
                    <div className={styles.mockupProductIcon}>🎨</div>
                    <div className={styles.mockupProductInfo}>
                      <span>Design Templates</span>
                      <strong>49,99 €</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
              <Icon name="dollarCircle" size="sm" />
              <span>+29,99 € Verkauf!</span>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
              <Icon name="eye" size="sm" />
              <span>234 Views heute</span>
            </div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className={styles.heroBgGradient}></div>
      </section>

      {/* Social Proof Bar */}
      <section className={styles.socialProof}>
        <div className={styles.socialProofContainer}>
          <div className={styles.proofStat}>
            <strong>500+</strong>
            <span>Creator</span>
          </div>
          <div className={styles.proofDivider}></div>
          <div className={styles.proofStat}>
            <strong>2.500+</strong>
            <span>Produkte</span>
          </div>
          <div className={styles.proofDivider}></div>
          <div className={styles.proofStat}>
            <strong>50.000€+</strong>
            <span>ausgezahlt</span>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className={styles.steps} ref={stepsRef}>
        <div className={styles.sectionContainer}>
          <div className={`${styles.sectionHeader} ${styles.animateOnScroll}`}>
            <span className={styles.sectionLabel}>So funktioniert's</span>
            <h2 className={styles.sectionTitle}>
              In 3 Schritten zum<br />eigenen Online-Business
            </h2>
          </div>
          
          <div className={styles.stepsGrid}>
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`${styles.stepCard} ${styles.animateOnScroll}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className={styles.stepNumber}>{step.number}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} ref={featuresRef}>
        <div className={styles.sectionContainer}>
          <div className={`${styles.sectionHeader} ${styles.animateOnScroll}`}>
            <span className={styles.sectionLabel}>Features</span>
            <h2 className={styles.sectionTitle}>
              Alles was du brauchst,<br />um erfolgreich zu verkaufen
            </h2>
          </div>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`${styles.featureCard} ${styles.animateOnScroll}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.featureIcon}>
                  <Icon name={feature.icon} size="lg" />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className={styles.reviews} ref={reviewsRef}>
        <div className={styles.sectionContainer}>
          <div className={`${styles.sectionHeader} ${styles.animateOnScroll}`}>
            <span className={styles.sectionLabel}>Das sagen unsere Creator</span>
            <h2 className={styles.sectionTitle}>
              Teile dein Wissen.<br />Verdiene damit.
            </h2>
          </div>
          
          <div className={styles.reviewsGrid}>
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className={`${styles.reviewCard} ${styles.animateOnScroll}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewAvatar}>{review.avatar}</div>
                  <div className={styles.reviewMeta}>
                    <strong>{review.name}</strong>
                    <span>{review.role}</span>
                  </div>
                  <div className={styles.reviewEarnings}>
                    <span>Verdient</span>
                    <strong>{review.earnings}</strong>
                  </div>
                </div>
                <div className={styles.reviewStars}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Icon key={i} name="star" size="sm" />
                  ))}
                </div>
                <p className={styles.reviewText}>"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <div className={`${styles.ctaCard} ${styles.animateOnScroll}`}>
            <h2 className={styles.ctaTitle}>
              Bereit, mit deinem Wissen Geld zu verdienen?
            </h2>
            <p className={styles.ctaSubtitle}>
              Starte jetzt kostenlos – du zahlst nur eine kleine Gebühr, wenn du verkaufst.
            </p>
            <Link to="/register" className={styles.ctaPrimaryLarge}>
              Kostenlos registrieren
              <Icon name="arrowRight" size="md" />
            </Link>
            <span className={styles.ctaNote}>
              Keine Kreditkarte erforderlich · In unter 2 Minuten startklar
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
            <span className={styles.logoIcon}>
                <Icon name="dollarCircle" size="lg" />
            </span>
              <span className={styles.logoText}>MoneMee</span>
            </div>
            <p className={styles.footerTagline}>
              Die einfachste Art, digitale Produkte zu verkaufen.
            </p>
          </div>
          
          <div className={styles.footerLinks}>
            <Link to="/impressum">Impressum</Link>
            <Link to="/datenschutz">Datenschutz</Link>
            <Link to="/agb">AGB</Link>
          </div>
          
          <div className={styles.footerCopyright}>
            © {new Date().getFullYear()} MoneMee. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;