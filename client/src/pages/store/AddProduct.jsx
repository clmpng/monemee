import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common';
import ProductTypeSelector from '../../components/products/ProductTypeSelector';
import ProductTemplates from '../../components/products/ProductTemplates';
import ProductForm from '../../components/products/ProductForm';
import { useProducts } from '../../context/ProductContext';
import { productsService } from '../../services';
import styles from '../../styles/pages/ProductPage.module.css';
import wizardStyles from '../../styles/components/ProductWizard.module.css';

/**
 * Add Product Page
 * 3-Schritt Wizard für Produkterstellung
 * 
 * Step 1: Produkttyp wählen
 * Step 2: Template wählen oder leer starten
 * Step 3: Formular ausfüllen
 */
function AddProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('right');

  // Step 1: Produkttyp auswählen
  const handleTypeSelect = useCallback((typeId) => {
    setSelectedType(typeId);
  }, []);

  // Step 2: Template auswählen
  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    setAnimationDirection('right');
    setCurrentStep(3);
  }, []);

  // Step 2: Ohne Template starten
  const handleSkipTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setAnimationDirection('right');
    setCurrentStep(3);
  }, []);

  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep === 1 && selectedType) {
      setAnimationDirection('right');
      setCurrentStep(2);
    }
  }, [currentStep, selectedType]);

  const goToPreviousStep = useCallback(() => {
    setAnimationDirection('left');
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedType(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedTemplate(null);
    }
  }, [currentStep]);

  // Formular absenden
  const handleSubmit = async (productData) => {
    setIsLoading(true);
    
    try {
      // 1. Upload thumbnail if present
      let thumbnailUrl = null;
      if (productData.thumbnailFile) {
        thumbnailUrl = await productsService.uploadFile(productData.thumbnailFile, 'thumbnail');
      }

      // 2. Upload files for file modules
      const processedModules = await Promise.all(
        (productData.modules || []).map(async (module) => {
          if (module.type === 'file' && module.file) {
            const fileUrl = await productsService.uploadFile(module.file, 'product');
            return {
              ...module,
              file_url: fileUrl,
              file: undefined
            };
          }
          return module;
        })
      );

      // 3. Create product via API
      const result = await addProduct({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        thumbnail_url: thumbnailUrl,
        affiliate_commission: productData.affiliateCommission,
        status: productData.status,
        modules: processedModules
      });

      if (result?.success !== false) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Fehler beim Erstellen des Produkts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Abbrechen
  const handleCancel = () => {
    if (currentStep > 1) {
      goToPreviousStep();
    } else {
      navigate(-1);
    }
  };

  // Initial data für das Formular (aus Template oder leer)
  const getInitialData = () => {
    if (selectedTemplate?.data) {
      return {
        title: selectedTemplate.data.title || '',
        description: selectedTemplate.data.description || '',
        price: selectedTemplate.data.price || 0,
        modules: selectedTemplate.data.modules || []
      };
    }
    return null;
  };

  // Header Titel basierend auf Step
  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Neues Produkt';
      case 2:
        return 'Vorlage wählen';
      case 3:
        return selectedTemplate ? 'Vorlage anpassen' : 'Produkt erstellen';
      default:
        return 'Neues Produkt';
    }
  };

  const getHeaderSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'Schritt 1 von 3';
      case 2:
        return 'Schritt 2 von 3';
      case 3:
        return 'Schritt 3 von 3';
      default:
        return '';
    }
  };

  // Animation Class
  const getAnimationClass = () => {
    return animationDirection === 'right' 
      ? wizardStyles.slideInRight 
      : wizardStyles.slideInLeft;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={handleCancel}
          className={styles.backButton}
          aria-label="Zurück"
        >
          <Icon name="chevronLeft" size="md" />
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{getHeaderTitle()}</h1>
          <p className={styles.subtitle}>{getHeaderSubtitle()}</p>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      {/* Progress Bar (nur bei Step 1 & 2) */}
      {currentStep < 3 && (
        <div className={wizardStyles.progressBar}>
          <div className={wizardStyles.progressStep}>
            <div className={`${wizardStyles.progressDot} ${currentStep >= 1 ? wizardStyles.active : ''} ${currentStep > 1 ? wizardStyles.completed : ''}`} />
            <span className={`${wizardStyles.progressLabel} ${currentStep === 1 ? wizardStyles.active : ''}`}>
              Typ
            </span>
          </div>
          <div className={`${wizardStyles.progressLine} ${currentStep > 1 ? wizardStyles.active : ''}`} />
          <div className={wizardStyles.progressStep}>
            <div className={`${wizardStyles.progressDot} ${currentStep >= 2 ? wizardStyles.active : ''} ${currentStep > 2 ? wizardStyles.completed : ''}`} />
            <span className={`${wizardStyles.progressLabel} ${currentStep === 2 ? wizardStyles.active : ''}`}>
              Vorlage
            </span>
          </div>
          <div className={`${wizardStyles.progressLine} ${currentStep > 2 ? wizardStyles.active : ''}`} />
          <div className={wizardStyles.progressStep}>
            <div className={`${wizardStyles.progressDot} ${currentStep >= 3 ? wizardStyles.active : ''}`} />
            <span className={`${wizardStyles.progressLabel} ${currentStep === 3 ? wizardStyles.active : ''}`}>
              Details
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.main}>
        {/* Step 1: Produkttyp wählen */}
        {currentStep === 1 && (
          <div key="step1" className={getAnimationClass()}>
            <ProductTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeSelect}
            />
            
            {/* Actions */}
            <div className={wizardStyles.wizardActions}>
              <button 
                className={wizardStyles.wizardBackButton}
                onClick={() => navigate(-1)}
              >
                <Icon name="x" size="md" />
              </button>
              <button
                className={wizardStyles.wizardNextButton}
                onClick={goToNextStep}
                disabled={!selectedType}
              >
                <span>Weiter</span>
                <Icon name="chevronRight" size="sm" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Template wählen */}
        {currentStep === 2 && (
          <div key="step2" className={getAnimationClass()}>
            <ProductTemplates
              productType={selectedType}
              onSelectTemplate={handleTemplateSelect}
              onSkip={handleSkipTemplate}
            />
            
            {/* Actions */}
            <div className={wizardStyles.wizardActions}>
              <button 
                className={wizardStyles.wizardBackButton}
                onClick={goToPreviousStep}
              >
                <Icon name="chevronLeft" size="md" />
              </button>
              <button
                className={wizardStyles.wizardNextButton}
                onClick={handleSkipTemplate}
              >
                <span>Ohne Vorlage</span>
                <Icon name="chevronRight" size="sm" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Formular */}
        {currentStep === 3 && (
          <div key="step3" className={getAnimationClass()}>
            <ProductForm
              initialData={getInitialData()}
              onSubmit={handleSubmit}
              onCancel={goToPreviousStep}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default AddProduct;