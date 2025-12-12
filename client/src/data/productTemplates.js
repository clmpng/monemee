/**
 * Product Templates Data
 * Vorgefertigte Vorlagen für schnellen Produktstart
 */

// Produkttypen mit Icons und Beschreibungen
export const PRODUCT_TYPES = [
    {
      id: 'ebook',
      icon: '📚',
      label: 'E-Book / Guide',
      description: 'PDF, Ratgeber, Anleitungen',
      color: '#6366f1',
      popular: true
    },
    {
      id: 'template',
      icon: '📋',
      label: 'Template',
      description: 'Notion, Canva, Excel',
      color: '#10b981'
    },
    {
      id: 'course',
      icon: '🎓',
      label: 'Online-Kurs',
      description: 'Video-Kurse, Tutorials',
      color: '#f59e0b'
    },
    {
      id: 'link',
      icon: '🔗',
      label: 'Digitaler Zugang',
      description: 'Links, Memberships',
      color: '#8b5cf6'
    },
    {
      id: 'coaching',
      icon: '📞',
      label: 'Coaching / Call',
      description: '1:1 Beratung, Calls',
      color: '#ef4444',
      comingSoon: true
    },
    {
      id: 'newsletter',
      icon: '📧',
      label: 'Newsletter',
      description: 'E-Mail-Zugang',
      color: '#06b6d4'
    }
  ];
  
  // Vorgefertigte Templates pro Produkttyp
  export const PRODUCT_TEMPLATES = {
    ebook: [
      {
        id: 'ebook-fitness',
        name: 'Fitness Guide',
        preview: '💪',
        data: {
          title: '30-Tage Fitness Challenge',
          description: 'Dein kompletter Trainingsplan für mehr Kraft und Ausdauer. Mit täglichen Übungen, Ernährungstipps und Motivations-Hacks.',
          price: 19.90,
          modules: [
            {
              type: 'file',
              title: '30-Tage Fitness Guide (PDF)',
              description: 'Der komplette Trainingsplan als PDF zum Download'
            }
          ]
        }
      },
      {
        id: 'ebook-recipe',
        name: 'Rezept-Sammlung',
        preview: '🍳',
        data: {
          title: 'Meine 50 liebsten Rezepte',
          description: 'Schnelle, leckere und gesunde Rezepte für jeden Tag. Von Frühstück bis Abendessen – alle Rezepte in unter 30 Minuten.',
          price: 9.90,
          modules: [
            {
              type: 'file',
              title: 'Rezeptbuch (PDF)',
              description: '50 Rezepte mit Fotos und Nährwertangaben'
            }
          ]
        }
      },
      {
        id: 'ebook-productivity',
        name: 'Produktivitäts-Guide',
        preview: '⚡',
        data: {
          title: 'Produktiv in 7 Tagen',
          description: 'Lerne die besten Methoden für mehr Fokus und weniger Stress. Time-Blocking, Deep Work und mehr.',
          price: 14.90,
          modules: [
            {
              type: 'file',
              title: 'Produktivitäts-Guide (PDF)',
              description: '7-Tage-System mit Worksheets'
            },
            {
              type: 'text',
              title: 'Bonus: Tägliche Checkliste',
              content: '## Deine tägliche Routine\n\n- [ ] Morgenroutine (15 Min)\n- [ ] Top 3 Aufgaben definieren\n- [ ] Deep Work Block (2h)\n- [ ] Abend-Review (10 Min)'
            }
          ]
        }
      },
      {
        id: 'ebook-finance',
        name: 'Finanz-Ratgeber',
        preview: '💰',
        data: {
          title: 'Finanzen meistern für Anfänger',
          description: 'Vom Sparen zum Investieren: Lerne, wie du dein Geld für dich arbeiten lässt. Einfach erklärt, ohne Fachchinesisch.',
          price: 24.90,
          modules: [
            {
              type: 'file',
              title: 'Finanz-Guide (PDF)',
              description: 'Kompletter Leitfaden mit Budgetplaner'
            }
          ]
        }
      }
    ],
    
    template: [
      {
        id: 'template-notion-planner',
        name: 'Notion Planner',
        preview: '📅',
        data: {
          title: 'Ultimate Notion Life Planner',
          description: 'Organisiere dein komplettes Leben in Notion. Aufgaben, Ziele, Habits, Finanzen – alles an einem Ort.',
          price: 29.90,
          modules: [
            {
              type: 'url',
              title: 'Notion Template',
              url: '',
              url_label: 'Template duplizieren',
              description: 'Klicke auf den Link und dupliziere das Template in deinen Notion Workspace'
            }
          ]
        }
      },
      {
        id: 'template-canva-social',
        name: 'Social Media Kit',
        preview: '📱',
        data: {
          title: 'Instagram Content Kit',
          description: '50+ editierbare Canva-Templates für Instagram Posts, Stories und Reels Cover. Perfekt für Creators und kleine Businesses.',
          price: 19.90,
          modules: [
            {
              type: 'url',
              title: 'Canva Templates',
              url: '',
              url_label: 'Templates öffnen',
              description: 'Zugang zu allen 50+ editierbaren Canva Templates'
            }
          ]
        }
      },
      {
        id: 'template-excel-budget',
        name: 'Excel Budget Tracker',
        preview: '📊',
        data: {
          title: 'Jahres-Budget Tracker',
          description: 'Behalte den Überblick über deine Finanzen. Automatische Berechnungen, Diagramme und Spar-Ziele.',
          price: 9.90,
          modules: [
            {
              type: 'file',
              title: 'Excel Budget Tracker',
              description: 'Excel-Datei mit allen Formeln und Anleitung'
            }
          ]
        }
      },
      {
        id: 'template-resume',
        name: 'Lebenslauf Template',
        preview: '📄',
        data: {
          title: 'Moderner Lebenslauf',
          description: 'ATS-optimierte Lebenslauf-Vorlage in 5 Farbvarianten. Einfach in Word oder Google Docs bearbeiten.',
          price: 7.90,
          modules: [
            {
              type: 'file',
              title: 'Lebenslauf Templates',
              description: 'Word & Google Docs Vorlagen (5 Designs)'
            },
            {
              type: 'text',
              title: 'Anleitung',
              content: '## So nutzt du das Template\n\n1. Lade die Datei herunter\n2. Öffne sie in Word oder Google Docs\n3. Ersetze die Beispieltexte mit deinen Infos\n4. Exportiere als PDF'
            }
          ]
        }
      }
    ],
    
    course: [
      {
        id: 'course-photography',
        name: 'Fotografie Basics',
        preview: '📸',
        data: {
          title: 'Fotografie für Anfänger',
          description: 'Lerne die Grundlagen der Fotografie. Von Kameraeinstellungen bis Bildkomposition – in 10 Video-Lektionen.',
          price: 49.90,
          modules: [
            {
              type: 'url',
              title: 'Modul 1: Kamera-Basics',
              url: '',
              url_label: 'Video ansehen',
              description: 'ISO, Blende, Verschlusszeit verstehen'
            },
            {
              type: 'url',
              title: 'Modul 2: Komposition',
              url: '',
              url_label: 'Video ansehen',
              description: 'Die Drittel-Regel und mehr'
            },
            {
              type: 'file',
              title: 'Bonus: Cheat Sheet',
              description: 'PDF mit allen wichtigen Einstellungen'
            }
          ]
        }
      },
      {
        id: 'course-social-media',
        name: 'Social Media Kurs',
        preview: '📲',
        data: {
          title: 'Instagram Growth Masterclass',
          description: 'Von 0 auf 10K Follower: Lerne die Strategien, die wirklich funktionieren. Algorithmus, Content, Engagement.',
          price: 79.90,
          modules: [
            {
              type: 'url',
              title: 'Lektion 1: Der Algorithmus',
              url: '',
              url_label: 'Video starten',
              description: 'Wie Instagram funktioniert'
            },
            {
              type: 'url',
              title: 'Lektion 2: Content Strategie',
              url: '',
              url_label: 'Video starten',
              description: 'Was du posten solltest'
            },
            {
              type: 'file',
              title: 'Content Kalender Template',
              description: 'Notion Template für deine Content Planung'
            }
          ]
        }
      }
    ],
    
    link: [
      {
        id: 'link-resource-library',
        name: 'Resource Library',
        preview: '📚',
        data: {
          title: 'Ultimate Resource Library',
          description: 'Zugang zu meiner kuratierten Sammlung der besten Tools, Templates und Ressourcen für Creator.',
          price: 19.90,
          modules: [
            {
              type: 'url',
              title: 'Resource Library',
              url: '',
              url_label: 'Zur Library',
              description: 'Notion-Datenbank mit 100+ kuratierten Ressourcen'
            }
          ]
        }
      },
      {
        id: 'link-community',
        name: 'Community Zugang',
        preview: '👥',
        data: {
          title: 'Exklusive Community',
          description: 'Werde Teil unserer privaten Community. Networking, Q&As und exklusive Inhalte.',
          price: 9.90,
          modules: [
            {
              type: 'url',
              title: 'Community Einladung',
              url: '',
              url_label: 'Discord beitreten',
              description: 'Einladungslink zu unserem Discord Server'
            }
          ]
        }
      }
    ],
    
    newsletter: [
      {
        id: 'newsletter-premium',
        name: 'Premium Newsletter',
        preview: '✉️',
        data: {
          title: 'Premium Newsletter',
          description: 'Wöchentliche Insights direkt in dein Postfach. Exklusive Tipps, die ich nirgendwo anders teile.',
          price: 5.90,
          modules: [
            {
              type: 'email',
              title: 'Newsletter-Zugang',
              newsletter_id: '',
              description: 'Du erhältst eine Willkommens-E-Mail mit Zugang zum Archiv'
            }
          ]
        }
      }
    ],
    
    coaching: []
  };
  
  // Hilfsfunktion: Template nach ID finden
  export const getTemplateById = (templateId) => {
    for (const [type, templates] of Object.entries(PRODUCT_TEMPLATES)) {
      const found = templates.find(t => t.id === templateId);
      if (found) {
        return { ...found, type };
      }
    }
    return null;
  };
  
  // Hilfsfunktion: Alle Templates als flache Liste
  export const getAllTemplates = () => {
    const all = [];
    for (const [type, templates] of Object.entries(PRODUCT_TEMPLATES)) {
      templates.forEach(template => {
        all.push({ ...template, type });
      });
    }
    return all;
  };