import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common';
import { useAuth } from '../../context/AuthContext';
import ModuleCard from './ModuleCard';
import ModuleSheet from './ModuleSheet';
import PricingInfoModal from './PricingInfoModal';
import { PRODUCT_TYPES, PRODUCT_TEMPLATES } from '../../data/productTemplates';
import styles from '../../styles/components/ProductForm.module.css';

// Mindestpreis für kostenpflichtige Produkte (wegen Stripe-Gebühren)
const MIN_PRICE = 2.99;

// LocalStorage Key für Onboarding
const ONBOARDING_KEY = 'monemee_product_onboarding_seen';

/**
 * Product Form Component
 * Single-Page Accordion-basiertes Formular mit verbesserter Mobile UX
 */
function ProductForm({ initialData, onSubmit, onCancel, isLoading, showTypeSelection = true }) {
  // Auth Context für Stripe-Status
  const { user } = useAuth();
  const stripeComplete = user?.stripeComplete || false;

  // Basis-Produktdaten
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    isFree: initialData?.price === 0 || false,
    thumbnailFile: null,
    thumbnailPreview: initialData?.thumbnail_url || null,
    affiliateEnabled: initialData?.affiliate_commission > 0 || false,
    affiliateCommission: initialData?.affiliate_commission || 20,
    status: initialData?.status || 'draft'
  });

  // Startmodus: null = noch nicht gewählt, 'blank' = leere Seite, 'template' = mit Vorlage
  const [startMode, setStartMode] = useState(initialData ? 'blank' : null);

  // Produkttyp State
  const [selectedType, setSelectedType] = useState(initialData?.type || null);
  const [expandedType, setExpandedType] = useState(null);

  // Section Collapse State
  const [collapsedSections, setCollapsedSections] = useState({
    type: false,
    thumbnail: true,
    basics: true,
    modules: true,
    pricing: true
  });

  // Module State
  const [modules, setModules] = useState(initialData?.modules || []);
  const [showModuleSheet, setShowModuleSheet] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // Validation State - Inline-Fehler
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Rechtliche Bestätigung (DSA-konform)
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  // Modals
  const [showPricingInfo, setShowPricingInfo] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Refs für Scroll
  const sectionsRef = useRef({});
  const ctaRef = useRef(null);

  // CTA Visibility State für Adaptive CTA
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  // Check Onboarding beim Mount
  useEffect(() => {
    if (showTypeSelection && !initialData) {
      const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [showTypeSelection, initialData]);

  // Onboarding schließen und merken
  const handleCloseOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  // Berechne Fortschritt
  const calculateProgress = useCallback(() => {
    let completed = 0;
    let total = 5;

    if (selectedType) completed++;
    if (formData.title.trim()) completed++;
    if (formData.thumbnailPreview) completed++;
    if (modules.length > 0) completed++;
    if (formData.isFree || (formData.price && parseFloat(formData.price) >= MIN_PRICE)) completed++;

    return Math.round((completed / total) * 100);
  }, [selectedType, formData.title, formData.thumbnailPreview, formData.price, formData.isFree, modules.length]);

  // Adaptive CTA - Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        setShowFloatingCTA(!isVisible);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Öffne nächste Section wenn aktuelle fertig ist
  useEffect(() => {
    if (selectedType && collapsedSections.type === false) {
      setCollapsedSections(prev => ({ ...prev, type: true, thumbnail: false }));
    }
  }, [selectedType]);

  // Inline Validation bei Blur
  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'title':
        if (!value?.trim()) {
          newErrors.title = 'Titel ist erforderlich';
        } else {
          delete newErrors.title;
        }
        break;
      case 'price':
        if (!formData.isFree) {
          const price = parseFloat(value);
          if (!value || price <= 0) {
            newErrors.price = 'Bitte gib einen Preis ein';
          } else if (price < MIN_PRICE) {
            newErrors.price = `Mindestpreis: ${MIN_PRICE.toFixed(2).replace('.', ',')} €`;
          } else {
            delete newErrors.price;
          }
        } else {
          delete newErrors.price;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors, formData.isFree]);

  // Handle input changes mit Inline Validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Handle blur für Inline Validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Toggle Section
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if section is complete
  const isSectionComplete = (section) => {
    switch (section) {
      case 'type':
        return !!selectedType;
      case 'thumbnail':
        return !!formData.thumbnailPreview;
      case 'basics':
        return formData.title.trim().length > 0;
      case 'modules':
        return modules.length > 0;
      case 'pricing':
        return formData.isFree || (formData.price && parseFloat(formData.price) >= MIN_PRICE);
      default:
        return false;
    }
  };

  // Handle type selection
  const handleTypeSelect = (typeId) => {
    if (selectedType === typeId) {
      // Toggle expand wenn bereits ausgewählt
      setExpandedType(expandedType === typeId ? null : typeId);
    } else {
      setSelectedType(typeId);
      setExpandedType(null);
      // Auto-expand nächste Section
      setTimeout(() => {
        setCollapsedSections(prev => ({ ...prev, type: true, thumbnail: false }));
      }, 300);
    }
  };

  // Toggle type details
  const handleToggleTypeDetails = (e, typeId) => {
    e.stopPropagation();
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  // Handle template selection (aus Template-Browser oder Modal)
  const handleTemplateSelect = (template, typeId = null) => {
    if (template?.data) {
      setFormData(prev => ({
        ...prev,
        title: template.data.title || '',
        description: template.data.description || '',
        price: template.data.price || '',
        isFree: template.data.price === 0
      }));
      setModules(template.data.modules || []);

      // Typ automatisch setzen wenn aus Template-Browser
      if (typeId) {
        setSelectedType(typeId);
      }
    }
    setStartMode('blank'); // Wechsel zum normalen Formular
    setShowTemplateModal(false);
    setCollapsedSections({
      type: true,
      thumbnail: false,
      basics: false,
      modules: false,
      pricing: false
    });
  };

  // Handle Start-Modus Auswahl
  const handleStartModeSelect = (mode) => {
    setStartMode(mode);
    if (mode === 'blank') {
      // Bei leerer Seite: Typ-Section öffnen
      setCollapsedSections(prev => ({ ...prev, type: false }));
    }
  };

  // Alle Templates gruppiert nach Typ holen
  const getAllTemplatesGrouped = () => {
    return PRODUCT_TYPES
      .filter(type => !type.comingSoon && PRODUCT_TEMPLATES[type.id]?.length > 0)
      .map(type => ({
        type,
        templates: PRODUCT_TEMPLATES[type.id] || []
      }));
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, thumbnail: 'Bild darf max. 5MB groß sein' }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
      delete errors.thumbnail;
    }
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    if (formData.thumbnailPreview && formData.thumbnailFile) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }
    setFormData(prev => ({
      ...prev,
      thumbnailFile: null,
      thumbnailPreview: null
    }));
  };

  // Toggle free
  const toggleFree = () => {
    setFormData(prev => ({
      ...prev,
      isFree: !prev.isFree,
      price: !prev.isFree ? 0 : prev.price
    }));
    if (errors.price) {
      setErrors(prev => ({ ...prev, price: null }));
    }
  };

  // Module handlers
  const handleAddModule = useCallback((moduleData) => {
    if (editingModule !== null) {
      setModules(prev => prev.map((m, i) =>
        i === editingModule ? { ...moduleData, id: m.id } : m
      ));
      setEditingModule(null);
    } else {
      setModules(prev => [...prev, { ...moduleData, id: `temp_${Date.now()}` }]);
    }
    setShowModuleSheet(false);
  }, [editingModule]);

  const handleEditModule = useCallback((index) => {
    setEditingModule(index);
    setShowModuleSheet(true);
  }, []);

  const handleDeleteModule = useCallback((index) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleMoveModule = useCallback((index, direction) => {
    setModules(prev => {
      const newModules = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newModules.length) return prev;
      [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];
      return newModules;
    });
  }, []);

  // Full validation before submit
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }

    if (!formData.isFree) {
      const price = parseFloat(formData.price);
      if (!formData.price || price <= 0) {
        newErrors.price = 'Bitte gib einen Preis ein';
      } else if (price < MIN_PRICE) {
        newErrors.price = `Mindestpreis: ${MIN_PRICE.toFixed(2).replace('.', ',')} €`;
      }
    }

    if (!initialData && modules.length === 0) {
      newErrors.modules = 'Füge mindestens einen Inhalt hinzu';
    }

    // Rechte-Bestätigung ist Pflicht
    if (!rightsConfirmed) {
      newErrors.rights = 'Bitte bestätige, dass du die Rechte an den Inhalten besitzt';
    }

    setErrors(newErrors);
    setTouched({ title: true, price: true, modules: true, rights: true });
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (status) => {
    if (!validate()) {
      if (errors.title) {
        setCollapsedSections(prev => ({ ...prev, basics: false }));
      } else if (errors.modules) {
        setCollapsedSections(prev => ({ ...prev, modules: false }));
      } else if (errors.price) {
        setCollapsedSections(prev => ({ ...prev, pricing: false }));
      }
      // Für Rechte-Fehler: Scroll zum Rechte-Bereich
      return;
    }

    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.isFree ? 0 : parseFloat(formData.price),
      thumbnailFile: formData.thumbnailFile,
      affiliateCommission: formData.affiliateEnabled ? formData.affiliateCommission : 0,
      status: status,
      modules: modules.map((m, index) => ({
        ...m,
        sort_order: index,
        id: m.id?.toString().startsWith('temp_') ? undefined : m.id
      }))
    };

    onSubmit(productData);
  };

  // Progress percentage
  const progress = calculateProgress();

  // Get available templates for selected type
  const availableTemplates = selectedType ? PRODUCT_TEMPLATES[selectedType] || [] : [];

  // Get module type icons for empty state
  const moduleTypeIcons = [
    { icon: 'file', label: 'Datei' },
    { icon: 'link', label: 'Link' },
    { icon: 'type', label: 'Text' },
    { icon: 'mail', label: 'E-Mail' }
  ];

  return (
    <div className={styles.formContainer}>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <>
          <div className={styles.modalBackdrop} onClick={handleCloseOnboarding} />
          <div className={styles.onboardingModal}>
            <div className={styles.onboardingContent}>
              <div className={styles.onboardingIcon}>
                <Icon name="package" size="xl" />
              </div>
              <h2 className={styles.onboardingTitle}>Ein Produkt = Ein Paket</h2>
              <p className={styles.onboardingText}>
                Du kannst mehrere Inhalte zu einem Produkt kombinieren.
                So erstellst du wertvolle Pakete für deine Kunden.
              </p>

              <div className={styles.onboardingExample}>
                <div className={styles.onboardingExampleHeader}>
                  <span>Beispiel: Fitness Bundle</span>
                </div>
                <div className={styles.onboardingExampleItems}>
                  <div className={styles.onboardingExampleItem}>
                    <Icon name="file" size="sm" />
                    <span>30-Tage Plan (PDF)</span>
                  </div>
                  <div className={styles.onboardingExampleItem}>
                    <Icon name="link" size="sm" />
                    <span>Workout Videos</span>
                  </div>
                  <div className={styles.onboardingExampleItem}>
                    <Icon name="type" size="sm" />
                    <span>Ernährungstipps</span>
                  </div>
                </div>
              </div>

              <button
                className={styles.onboardingButton}
                onClick={handleCloseOnboarding}
              >
                Verstanden
              </button>
            </div>
          </div>
        </>
      )}

      {/* Startauswahl: Leere Seite vs. Mit Vorlage */}
      {showTypeSelection && startMode === null && (
        <div className={styles.startSelection}>
          <div className={styles.startSelectionHeader}>
            <h2 className={styles.startSelectionTitle}>Wie möchtest du starten?</h2>
            <p className={styles.startSelectionSubtitle}>
              Nutze eine Vorlage für einen schnellen Start oder beginne mit einer leeren Seite.
            </p>
          </div>

          <div className={styles.startSelectionOptions}>
            <button
              type="button"
              className={styles.startOption}
              onClick={() => handleStartModeSelect('template')}
            >
              <div className={styles.startOptionIcon} data-variant="template">
                <Icon name="zap" size="lg" />
              </div>
              <div className={styles.startOptionContent}>
                <span className={styles.startOptionTitle}>Mit Vorlage</span>
                <span className={styles.startOptionDescription}>
                  Fertige Struktur, schneller Start
                </span>
              </div>
              <span className={styles.startOptionBadge}>Empfohlen</span>
            </button>

            <button
              type="button"
              className={styles.startOption}
              onClick={() => handleStartModeSelect('blank')}
            >
              <div className={styles.startOptionIcon} data-variant="blank">
                <Icon name="filePlus" size="lg" />
              </div>
              <div className={styles.startOptionContent}>
                <span className={styles.startOptionTitle}>Leere Seite</span>
                <span className={styles.startOptionDescription}>
                  Volle Freiheit, selbst gestalten
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Template Browser */}
      {showTypeSelection && startMode === 'template' && (
        <div className={styles.templateBrowser}>
          <div className={styles.templateBrowserHeader}>
            <button
              type="button"
              className={styles.templateBrowserBack}
              onClick={() => setStartMode(null)}
            >
              <Icon name="chevronLeft" size="md" />
              <span>Zurück</span>
            </button>
            <h2 className={styles.templateBrowserTitle}>Vorlage wählen</h2>
          </div>

          <div className={styles.templateBrowserContent}>
            {getAllTemplatesGrouped().map(({ type, templates }) => (
              <div key={type.id} className={styles.templateGroup}>
                <div className={styles.templateGroupHeader}>
                  <div
                    className={styles.templateGroupIcon}
                    style={{ '--type-color': type.color }}
                  >
                    <Icon name={type.icon} size="sm" />
                  </div>
                  <span className={styles.templateGroupTitle}>{type.label}</span>
                  <span className={styles.templateGroupCount}>
                    {templates.length} {templates.length === 1 ? 'Vorlage' : 'Vorlagen'}
                  </span>
                </div>

                <div className={styles.templateGroupList}>
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className={styles.templateCard}
                      onClick={() => handleTemplateSelect(template, type.id)}
                      style={{ '--type-color': type.color }}
                    >
                      <div className={styles.templateCardIcon}>
                        <Icon name={template.preview} size="md" />
                      </div>
                      <div className={styles.templateCardContent}>
                        <span className={styles.templateCardName}>{template.name}</span>
                        <span className={styles.templateCardMeta}>
                          {template.data.modules?.length || 0} Inhalte · {template.data.price > 0 ? `${template.data.price.toFixed(2).replace('.', ',')} €` : 'Kostenlos'}
                        </span>
                      </div>
                      <Icon name="chevronRight" size="sm" className={styles.templateCardArrow} />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Option ohne Vorlage */}
            <button
              type="button"
              className={styles.templateBrowserBlank}
              onClick={() => handleStartModeSelect('blank')}
            >
              <Icon name="filePlus" size="md" />
              <span>Ohne Vorlage fortfahren</span>
            </button>
          </div>
        </div>
      )}

      {/* Normales Formular - nur wenn startMode 'blank' oder bei Edit */}
      {(startMode === 'blank' || !showTypeSelection) && (
        <>
          {/* Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{progress}% ausgefüllt</span>
          </div>

          <div className={styles.form}>
        {/* Type Selection Section */}
        {showTypeSelection && (
          <section
            className={`${styles.section} ${collapsedSections.type ? styles.sectionCollapsed : ''}`}
            ref={el => sectionsRef.current.type = el}
          >
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => toggleSection('type')}
            >
              <div className={styles.sectionIcon}>
                <Icon name="package" size="md" />
              </div>
              <div className={styles.sectionHeaderContent}>
                <h2 className={styles.sectionTitle}>Produkttyp</h2>
                {selectedType && collapsedSections.type && (
                  <span className={styles.sectionSummary}>
                    {PRODUCT_TYPES.find(t => t.id === selectedType)?.label}
                  </span>
                )}
              </div>
              {isSectionComplete('type') && (
                <div className={styles.sectionCheck}>
                  <Icon name="check" size="sm" />
                </div>
              )}
              <Icon
                name={collapsedSections.type ? 'chevronDown' : 'chevronUp'}
                size="md"
                className={styles.sectionToggle}
              />
            </button>

            {!collapsedSections.type && (
              <div className={styles.sectionContent}>
                <div className={styles.typeList}>
                  {PRODUCT_TYPES.map((type) => (
                    <div key={type.id} className={styles.typeCardWrapper}>
                      <button
                        type="button"
                        className={`${styles.typeCard} ${
                          selectedType === type.id ? styles.typeCardSelected : ''
                        } ${type.comingSoon ? styles.typeCardDisabled : ''}`}
                        onClick={() => !type.comingSoon && handleTypeSelect(type.id)}
                        disabled={type.comingSoon}
                        style={{ '--type-color': type.color }}
                      >
                        <div className={styles.typeCardMain}>
                          <div className={styles.typeIcon}>
                            <Icon name={type.icon} size="md" />
                          </div>
                          <div className={styles.typeCardContent}>
                            <span className={styles.typeLabel}>{type.label}</span>
                            <span className={styles.typeDescription}>{type.description}</span>
                          </div>
                          {selectedType === type.id && (
                            <div className={styles.typeCheck}>
                              <Icon name="check" size="xs" />
                            </div>
                          )}
                          {type.comingSoon && (
                            <span className={styles.typeBadge}>Bald</span>
                          )}
                          {type.popular && !type.comingSoon && (
                            <span className={styles.typePopularBadge}>Beliebt</span>
                          )}
                        </div>

                        {/* Details Toggle */}
                        {!type.comingSoon && type.details && (
                          <button
                            type="button"
                            className={styles.typeDetailsToggle}
                            onClick={(e) => handleToggleTypeDetails(e, type.id)}
                          >
                            <span>Geeignet für</span>
                            <Icon
                              name={expandedType === type.id ? 'chevronUp' : 'chevronDown'}
                              size="sm"
                            />
                          </button>
                        )}
                      </button>

                      {/* Expanded Details */}
                      {expandedType === type.id && type.details && (
                        <div className={styles.typeDetails} style={{ '--type-color': type.color }}>
                          <div className={styles.typeDetailSection}>
                            <span className={styles.typeDetailLabel}>Geeignet für:</span>
                            <ul className={styles.typeDetailList}>
                              {type.details.suitableFor.map((item, idx) => (
                                <li key={idx}>
                                  <Icon name="check" size="xs" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className={styles.typeDetailRow}>
                            <div className={styles.typeDetailItem}>
                              <Icon name="users" size="sm" />
                              <span>{type.details.idealCreators}</span>
                            </div>
                            <div className={styles.typeDetailItem}>
                              <Icon name="wallet" size="sm" />
                              <span>{type.details.priceRange}</span>
                            </div>
                          </div>

                          <div className={styles.typeDetailTip}>
                            <Icon name="lightbulb" size="sm" />
                            <span>{type.details.tip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Template Quick Start */}
                {selectedType && availableTemplates.length > 0 && (
                  <button
                    type="button"
                    className={styles.templateHint}
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <Icon name="zap" size="sm" />
                    <span>Mit Vorlage starten</span>
                    <Icon name="chevronRight" size="sm" />
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Thumbnail Section */}
        <section
          className={`${styles.section} ${collapsedSections.thumbnail ? styles.sectionCollapsed : ''}`}
          ref={el => sectionsRef.current.thumbnail = el}
        >
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => toggleSection('thumbnail')}
          >
            <div className={styles.sectionIcon}>
              <Icon name="image" size="md" />
            </div>
            <div className={styles.sectionHeaderContent}>
              <h2 className={styles.sectionTitle}>Vorschaubild</h2>
              {formData.thumbnailPreview && collapsedSections.thumbnail && (
                <span className={styles.sectionSummary}>Bild hochgeladen</span>
              )}
            </div>
            {isSectionComplete('thumbnail') && (
              <div className={styles.sectionCheck}>
                <Icon name="check" size="sm" />
              </div>
            )}
            <Icon
              name={collapsedSections.thumbnail ? 'chevronDown' : 'chevronUp'}
              size="md"
              className={styles.sectionToggle}
            />
          </button>

          {!collapsedSections.thumbnail && (
            <div className={styles.sectionContent}>
              {formData.thumbnailPreview ? (
                <div className={styles.thumbnailPreviewContainer}>
                  <div className={styles.thumbnailPreview}>
                    <img
                      src={formData.thumbnailPreview}
                      alt="Vorschau"
                      className={styles.thumbnailImage}
                    />
                    <button
                      type="button"
                      className={styles.thumbnailRemove}
                      onClick={removeThumbnail}
                    >
                      <Icon name="x" size="sm" />
                    </button>
                  </div>

                  <div className={styles.cardPreview}>
                    <span className={styles.cardPreviewLabel}>So sieht es aus:</span>
                    <div className={styles.miniCard}>
                      <div className={styles.miniCardImage}>
                        <img src={formData.thumbnailPreview} alt="" />
                      </div>
                      <div className={styles.miniCardContent}>
                        <span className={styles.miniCardTitle}>
                          {formData.title || 'Dein Produkttitel'}
                        </span>
                        <span className={styles.miniCardPrice}>
                          {formData.isFree
                            ? 'Kostenlos'
                            : formData.price
                              ? `${parseFloat(formData.price).toFixed(2).replace('.', ',')} €`
                              : '0,00 €'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <label className={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className={styles.uploadInput}
                  />
                  <div className={styles.uploadContent}>
                    <div className={styles.uploadIconWrapper}>
                      <Icon name="image" size="lg" />
                    </div>
                    <p className={styles.uploadTitle}>Bild hochladen</p>
                    <p className={styles.uploadSubtitle}>PNG, JPG bis 5MB</p>
                  </div>
                </label>
              )}
              {errors.thumbnail && (
                <p className={styles.errorText}>{errors.thumbnail}</p>
              )}
            </div>
          )}
        </section>

        {/* Basic Info Section */}
        <section
          className={`${styles.section} ${collapsedSections.basics ? styles.sectionCollapsed : ''}`}
          ref={el => sectionsRef.current.basics = el}
        >
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => toggleSection('basics')}
          >
            <div className={styles.sectionIcon}>
              <Icon name="edit" size="md" />
            </div>
            <div className={styles.sectionHeaderContent}>
              <h2 className={styles.sectionTitle}>Grundinfos</h2>
              {formData.title && collapsedSections.basics && (
                <span className={styles.sectionSummary}>{formData.title}</span>
              )}
            </div>
            {isSectionComplete('basics') && (
              <div className={styles.sectionCheck}>
                <Icon name="check" size="sm" />
              </div>
            )}
            <Icon
              name={collapsedSections.basics ? 'chevronDown' : 'chevronUp'}
              size="md"
              className={styles.sectionToggle}
            />
          </button>

          {!collapsedSections.basics && (
            <div className={styles.sectionContent}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Titel <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="z.B. Ultimate Fitness Guide"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${errors.title && touched.title ? styles.inputError : ''}`}
                />
                {errors.title && touched.title && (
                  <p className={styles.errorText}>{errors.title}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Beschreibung</label>
                <textarea
                  name="description"
                  placeholder="Beschreibe was dein Kunde bekommt..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={styles.textarea}
                />
              </div>
            </div>
          )}
        </section>

        {/* Content Modules Section */}
        <section
          className={`${styles.section} ${collapsedSections.modules ? styles.sectionCollapsed : ''}`}
          ref={el => sectionsRef.current.modules = el}
        >
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => toggleSection('modules')}
          >
            <div className={styles.sectionIcon}>
              <Icon name="layers" size="md" />
            </div>
            <div className={styles.sectionHeaderContent}>
              <h2 className={styles.sectionTitle}>Produkt-Inhalte</h2>
              {modules.length > 0 && collapsedSections.modules && (
                <span className={styles.sectionSummary}>
                  {modules.length} {modules.length === 1 ? 'Inhalt' : 'Inhalte'}
                </span>
              )}
            </div>
            {modules.length > 0 && (
              <span className={styles.moduleCount}>{modules.length}</span>
            )}
            {isSectionComplete('modules') && (
              <div className={styles.sectionCheck}>
                <Icon name="check" size="sm" />
              </div>
            )}
            <Icon
              name={collapsedSections.modules ? 'chevronDown' : 'chevronUp'}
              size="md"
              className={styles.sectionToggle}
            />
          </button>

          {!collapsedSections.modules && (
            <div className={styles.sectionContent}>
              {modules.length === 0 ? (
                /* Empty State */
                <div className={styles.modulesEmpty}>
                  <p className={styles.modulesEmptyTitle}>Was bekommt dein Kunde?</p>
                  <p className={styles.modulesEmptyText}>
                    Füge einen oder mehrere Inhalte hinzu. Du kannst verschiedene Typen kombinieren.
                  </p>

                  <div className={styles.modulesEmptyTypes}>
                    {moduleTypeIcons.map((type) => (
                      <div key={type.icon} className={styles.modulesEmptyType}>
                        <Icon name={type.icon} size="md" />
                        <span>{type.label}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.addModuleButtonPrimary}
                    onClick={() => {
                      setEditingModule(null);
                      setShowModuleSheet(true);
                    }}
                  >
                    <Icon name="plus" size="sm" />
                    <span>Inhalt hinzufügen</span>
                  </button>
                </div>
              ) : (
                /* Module List */
                <>
                  <div className={styles.moduleList}>
                    {modules.map((module, index) => (
                      <ModuleCard
                        key={module.id || index}
                        module={module}
                        index={index}
                        totalCount={modules.length}
                        onEdit={() => handleEditModule(index)}
                        onDelete={() => handleDeleteModule(index)}
                        onMoveUp={() => handleMoveModule(index, 'up')}
                        onMoveDown={() => handleMoveModule(index, 'down')}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.addModuleButton}
                    onClick={() => {
                      setEditingModule(null);
                      setShowModuleSheet(true);
                    }}
                  >
                    <Icon name="plus" size="sm" />
                    <span>Modul hinzufügen</span>
                  </button>

                  {/* Contextual tip based on module count */}
                  {modules.length === 1 && (
                    <p className={styles.moduleTip}>
                      <Icon name="lightbulb" size="sm" />
                      <span>Tipp: Bundles mit mehreren Inhalten erzielen höhere Preise</span>
                    </p>
                  )}
                </>
              )}

              {errors.modules && touched.modules && (
                <p className={styles.errorText}>{errors.modules}</p>
              )}
            </div>
          )}
        </section>

        {/* Pricing Section */}
        <section
          className={`${styles.section} ${collapsedSections.pricing ? styles.sectionCollapsed : ''}`}
          ref={el => sectionsRef.current.pricing = el}
        >
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => toggleSection('pricing')}
          >
            <div className={styles.sectionIcon}>
              <Icon name="wallet" size="md" />
            </div>
            <div className={styles.sectionHeaderContent}>
              <h2 className={styles.sectionTitle}>Preis & Provision</h2>
              {(formData.isFree || formData.price) && collapsedSections.pricing && (
                <span className={styles.sectionSummary}>
                  {formData.isFree
                    ? 'Kostenlos'
                    : `${parseFloat(formData.price || 0).toFixed(2).replace('.', ',')} €`}
                </span>
              )}
            </div>
            {isSectionComplete('pricing') && (
              <div className={styles.sectionCheck}>
                <Icon name="check" size="sm" />
              </div>
            )}
            <Icon
              name={collapsedSections.pricing ? 'chevronDown' : 'chevronUp'}
              size="md"
              className={styles.sectionToggle}
            />
          </button>

          {!collapsedSections.pricing && (
            <div className={styles.sectionContent}>
              <div className={styles.field}>
                <label className={styles.label}>Preis</label>
                <div className={styles.priceRow}>
                  <div className={styles.priceInputWrapper}>
                    <span className={styles.priceCurrency}>€</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      name="price"
                      placeholder="0.00"
                      value={formData.isFree ? '' : formData.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={formData.isFree}
                      min={MIN_PRICE}
                      step="0.01"
                      className={`${styles.priceInput} ${errors.price && touched.price ? styles.inputError : ''}`}
                    />
                  </div>
                  <button
                    type="button"
                    className={`${styles.freeToggle} ${formData.isFree ? styles.freeToggleActive : ''}`}
                    onClick={toggleFree}
                  >
                    <Icon name={formData.isFree ? 'check' : 'gift'} size="sm" />
                    <span>Kostenlos</span>
                  </button>
                </div>
                {errors.price && touched.price && (
                  <p className={styles.errorText}>{errors.price}</p>
                )}
                {!formData.isFree && (
                  <p className={styles.fieldHint}>
                    Mindestpreis: {MIN_PRICE.toFixed(2).replace('.', ',')} € ·{' '}
                    <button
                      type="button"
                      className={styles.hintLink}
                      onClick={() => setShowPricingInfo(true)}
                    >
                      Tipps zur Preisgestaltung
                    </button>
                  </p>
                )}
              </div>

              {/* Affiliate Toggle */}
              <div className={styles.field}>
                <button
                  type="button"
                  className={styles.affiliateToggle}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    affiliateEnabled: !prev.affiliateEnabled
                  }))}
                >
                  <div className={`${styles.checkbox} ${formData.affiliateEnabled ? styles.checkboxActive : ''}`}>
                    {formData.affiliateEnabled && <Icon name="check" size="xs" />}
                  </div>
                  <div className={styles.affiliateToggleContent}>
                    <span className={styles.affiliateToggleLabel}>Affiliate-Programm aktivieren</span>
                    <span className={styles.affiliateToggleHint}>Lass andere dein Produkt bewerben</span>
                  </div>
                </button>
              </div>

              {formData.affiliateEnabled && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Affiliate-Provision
                    <span className={styles.labelHint}>{formData.affiliateCommission}%</span>
                  </label>
                  <input
                    type="range"
                    name="affiliateCommission"
                    min="5"
                    max="50"
                    value={formData.affiliateCommission}
                    onChange={handleChange}
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                  <p className={styles.fieldHint}>
                    So viel verdienen Promoter pro Verkauf
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Rechtliche Bestätigung - DSA-konform */}
        <div className={styles.rightsSection}>
          <div className={styles.rightsBox}>
            <label className={styles.rightsLabel}>
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(e) => {
                  setRightsConfirmed(e.target.checked);
                  if (errors.rights) {
                    setErrors(prev => ({ ...prev, rights: null }));
                  }
                }}
                className={styles.rightsInput}
              />
              <span className={styles.rightsCheckbox}>
                {rightsConfirmed && <Icon name="check" size="xs" />}
              </span>
              <span className={styles.rightsText}>
                Ich bestätige, dass ich alle erforderlichen Rechte an den hochgeladenen
                Inhalten besitze und diese keine urheberrechtlich geschützten Werke Dritter,
                illegalen Inhalte oder Inhalte enthalten, die gegen die{' '}
                <Link to="/inhaltsrichtlinien" className={styles.rightsLink}>
                  Inhaltsrichtlinien
                </Link>{' '}
                verstoßen. <span className={styles.required}>*</span>
              </span>
            </label>
            {errors.rights && touched.rights && (
              <p className={styles.errorText}>{errors.rights}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stripe-Warnung wenn nicht eingerichtet */}
      {!stripeComplete && (
        <div className={styles.stripeWarning}>
          <div className={styles.stripeWarningIcon}>
            <Icon name="alertTriangle" size="md" />
          </div>
          <div className={styles.stripeWarningContent}>
            <p className={styles.stripeWarningTitle}>Zahlungen einrichten</p>
            <p className={styles.stripeWarningText}>
              Um Produkte zu verkaufen, musst du zuerst deine Zahlungsdaten hinterlegen.
            </p>
            <Link to="/settings?tab=stripe" className={styles.stripeWarningLink}>
              <span>Jetzt einrichten</span>
              <Icon name="arrowRight" size="sm" />
            </Link>
          </div>
        </div>
      )}

      {/* Static CTA */}
      <div className={styles.staticCTA} ref={ctaRef}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => handleSubmit('draft')}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <Icon name="save" size="sm" />
              <span>Als Entwurf</span>
            </>
          )}
        </button>
        <button
          type="button"
          className={`${styles.primaryButton} ${!stripeComplete ? styles.primaryButtonDisabled : ''}`}
          onClick={() => handleSubmit('active')}
          disabled={isLoading || !stripeComplete}
          title={!stripeComplete ? 'Bitte richte zuerst deine Zahlungsdaten ein' : ''}
        >
          {isLoading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <Icon name="rocket" size="sm" />
              <span>Veröffentlichen</span>
            </>
          )}
        </button>
      </div>

      {/* Floating CTA (Mobile) - nur wenn Stripe eingerichtet */}
      {showFloatingCTA && stripeComplete && (
        <div className={styles.floatingCTA}>
          <button
            type="button"
            className={styles.floatingButton}
            onClick={() => handleSubmit('active')}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <Icon name="rocket" size="sm" />
                <span>Veröffentlichen</span>
              </>
            )}
          </button>
        </div>
      )}
        </>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowTemplateModal(false)} />
          <div className={styles.templateModal}>
            <div className={styles.templateModalHeader}>
              <h3>Vorlage wählen</h3>
              <button
                type="button"
                className={styles.templateModalClose}
                onClick={() => setShowTemplateModal(false)}
              >
                <Icon name="x" size="md" />
              </button>
            </div>
            <div className={styles.templateModalContent}>
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={styles.templateOption}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div
                    className={styles.templateOptionIcon}
                    style={{ '--type-color': PRODUCT_TYPES.find(t => t.id === selectedType)?.color }}
                  >
                    <Icon name={template.preview} size="lg" />
                  </div>
                  <div className={styles.templateOptionContent}>
                    <span className={styles.templateOptionName}>{template.name}</span>
                    <span className={styles.templateOptionTitle}>{template.data.title}</span>
                    <span className={styles.templateOptionMeta}>
                      {template.data.modules?.length || 0} Inhalte · {template.data.price > 0 ? `${template.data.price.toFixed(2).replace('.', ',')} €` : 'Kostenlos'}
                    </span>
                  </div>
                  <Icon name="chevronRight" size="sm" className={styles.templateOptionArrow} />
                </button>
              ))}
              <button
                type="button"
                className={styles.templateOptionBlank}
                onClick={() => setShowTemplateModal(false)}
              >
                <Icon name="edit" size="md" />
                <span>Ohne Vorlage fortfahren</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Module Sheet */}
      <ModuleSheet
        isOpen={showModuleSheet}
        onClose={() => {
          setShowModuleSheet(false);
          setEditingModule(null);
        }}
        onSave={handleAddModule}
        editData={editingModule !== null ? modules[editingModule] : null}
      />

      {/* Pricing Info Modal */}
      <PricingInfoModal
        isOpen={showPricingInfo}
        onClose={() => setShowPricingInfo(false)}
      />
    </div>
  );
}

export default ProductForm;
