import React, { useState, useCallback } from 'react';
import { Icon } from '../common';
import ModuleCard from './ModuleCard';
import ModuleSheet from './ModuleSheet';
import PricingInfoModal from './PricingInfoModal';
import styles from '../../styles/components/ProductForm.module.css';

// Mindestpreis für kostenpflichtige Produkte (wegen Stripe-Gebühren)
const MIN_PRICE = 2.99;

/**
 * Product Form Component
 * Modulares System für Produkterstellung
 */
function ProductForm({ initialData, onSubmit, onCancel, isLoading }) {
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

  // Module State
  const [modules, setModules] = useState(initialData?.modules || []);
  const [showModuleSheet, setShowModuleSheet] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Pricing Info Modal State
  const [showPricingInfo, setShowPricingInfo] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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
    // Clear price error when toggling
    if (errors.price) {
      setErrors(prev => ({ ...prev, price: null }));
    }
  };

  // Module handlers
  const handleAddModule = useCallback((moduleData) => {
    if (editingModule !== null) {
      // Update existing module
      setModules(prev => prev.map((m, i) => 
        i === editingModule ? { ...moduleData, id: m.id } : m
      ));
      setEditingModule(null);
    } else {
      // Add new module
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

  // Validate form
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

    // Mindestens ein Modul bei neuen Produkten
    if (!initialData && modules.length === 0) {
      newErrors.modules = 'Füge mindestens einen Inhalt hinzu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (status) => {
    if (!validate()) return;

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
        // Entferne temporäre IDs
        id: m.id?.toString().startsWith('temp_') ? undefined : m.id
      }))
    };

    onSubmit(productData);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.form}>
        {/* Thumbnail Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎨</span>
            <h2 className={styles.sectionTitle}>Vorschaubild</h2>
          </div>
          
          {formData.thumbnailPreview ? (
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
        </section>

        {/* Basic Info Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📝</span>
            <h2 className={styles.sectionTitle}>Grundinfos</h2>
          </div>

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
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            />
            {errors.title && <p className={styles.errorText}>{errors.title}</p>}
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
        </section>

        {/* Content Modules Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📦</span>
            <h2 className={styles.sectionTitle}>Produkt-Inhalte</h2>
            <span className={styles.moduleCount}>{modules.length}</span>
          </div>
          
          <p className={styles.sectionDescription}>
            Was erhält dein Kunde nach dem Kauf?
          </p>

          {/* Module List */}
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

          {/* Add Module Button */}
          <button
            type="button"
            className={styles.addModuleButton}
            onClick={() => {
              setEditingModule(null);
              setShowModuleSheet(true);
            }}
          >
            <Icon name="plus" size="sm" />
            <span>Inhalt hinzufügen</span>
          </button>

          {errors.modules && (
            <p className={styles.errorText}>{errors.modules}</p>
          )}
        </section>

        {/* Pricing Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💰</span>
            <h2 className={styles.sectionTitle}>Preis & Provision</h2>
            <button
              type="button"
              className={styles.infoButton}
              onClick={() => setShowPricingInfo(true)}
              aria-label="Tipps zur Preisgestaltung"
            >
              <Icon name="info" size="sm" />
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Preis</label>
            <div className={styles.priceRow}>
              <div className={styles.priceInputWrapper}>
                <span className={styles.priceCurrency}>€</span>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={formData.isFree ? '' : formData.price}
                  onChange={handleChange}
                  disabled={formData.isFree}
                  min={MIN_PRICE}
                  step="0.01"
                  className={`${styles.priceInput} ${errors.price ? styles.inputError : ''}`}
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
            {errors.price && <p className={styles.errorText}>{errors.price}</p>}
            {!formData.isFree && (
              <p className={styles.fieldHint}>
                Mindestpreis: {MIN_PRICE.toFixed(2).replace('.', ',')} € · <button 
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

          {/* Affiliate Commission Slider - nur wenn aktiviert */}
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
        </section>
      </div>

      {/* Sticky CTA */}
      <div className={styles.stickyCTA}>
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
          className={styles.primaryButton}
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
