import React, { useState } from 'react';
import { Input, Button } from '../common';
import styles from '../../styles/components/ProductForm.module.css';

/**
 * Product Form Component
 * Used for creating and editing products
 */
function ProductForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    isFree: initialData?.price === 0 || false,
    thumbnail: initialData?.thumbnail || null,
    file: initialData?.file || null,
    fileName: initialData?.fileName || '',
    fileSize: initialData?.fileSize || 0,
    affiliateCommission: initialData?.affiliateCommission || 20,
    status: initialData?.status || 'draft'
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, thumbnail: 'Bild darf max. 5MB groß sein' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle product file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setErrors(prev => ({ ...prev, file: 'Datei darf max. 100MB groß sein' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          file: reader.result,
          fileName: file.name,
          fileSize: file.size
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null }));
  };

  // Remove file
  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null, fileName: '', fileSize: 0 }));
  };

  // Toggle free
  const toggleFree = () => {
    setFormData(prev => ({
      ...prev,
      isFree: !prev.isFree,
      price: !prev.isFree ? 0 : prev.price
    }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      zip: '📦',
      mp4: '🎬',
      mp3: '🎵',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊'
    };
    return icons[ext] || '📁';
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }
    
    if (!formData.isFree && (!formData.price || parseFloat(formData.price) <= 0)) {
      newErrors.price = 'Bitte gib einen Preis ein';
    }

    if (!formData.file) {
      newErrors.file = 'Bitte lade eine Datei hoch';
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
      thumbnail: formData.thumbnail,
      file: formData.file,
      fileName: formData.fileName,
      fileSize: formData.fileSize,
      affiliateCommission: formData.affiliateCommission,
      status: status
    };

    onSubmit(productData);
  };

  return (
    <div className={styles.form}>
      {/* Thumbnail Upload */}
      <div>
        <p className={styles.sectionTitle}>Vorschaubild</p>
        {formData.thumbnail ? (
          <div className={styles.thumbnailPreview}>
            <img 
              src={formData.thumbnail} 
              alt="Vorschau" 
              className={styles.thumbnailImage}
            />
            <button 
              type="button"
              className={styles.thumbnailRemove}
              onClick={removeThumbnail}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={styles.uploadArea}>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className={styles.uploadInput}
            />
            <div className={styles.uploadIcon}>🖼️</div>
            <p className={styles.uploadTitle}>Bild hochladen</p>
            <p className={styles.uploadSubtitle}>PNG, JPG bis 5MB</p>
          </div>
        )}
        {errors.thumbnail && (
          <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '8px' }}>
            {errors.thumbnail}
          </p>
        )}
      </div>

      {/* Product File Upload */}
      <div>
        <p className={styles.sectionTitle}>Produkt-Datei *</p>
        {formData.file ? (
          <div className={styles.filePreview}>
            <div className={styles.fileIcon}>
              {getFileIcon(formData.fileName)}
            </div>
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{formData.fileName}</p>
              <p className={styles.fileSize}>{formatFileSize(formData.fileSize)}</p>
            </div>
            <button 
              type="button"
              className={styles.fileRemove}
              onClick={removeFile}
            >
              🗑️
            </button>
          </div>
        ) : (
          <div className={`${styles.uploadArea} ${errors.file ? styles.uploadAreaError : ''}`}>
            <input
              type="file"
              onChange={handleFileChange}
              className={styles.uploadInput}
            />
            <div className={styles.uploadIcon}>📁</div>
            <p className={styles.uploadTitle}>Datei hochladen</p>
            <p className={styles.uploadSubtitle}>PDF, ZIP, MP4, etc. bis 100MB</p>
          </div>
        )}
        {errors.file && (
          <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '8px' }}>
            {errors.file}
          </p>
        )}
      </div>

      {/* Title */}
      <Input
        label="Titel *"
        name="title"
        placeholder="z.B. Ultimate Productivity Guide"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
      />

      {/* Description */}
      <Input.Textarea
        label="Beschreibung"
        name="description"
        placeholder="Beschreibe dein Produkt..."
        value={formData.description}
        onChange={handleChange}
        rows={4}
      />

      {/* Price */}
      <div>
        <label style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '4px',
          display: 'block'
        }}>
          Preis
        </label>
        <div className={styles.priceWrapper}>
          <span className={styles.priceSymbol}>€</span>
          <input
            type="number"
            name="price"
            placeholder="0.00"
            value={formData.isFree ? '' : formData.price}
            onChange={handleChange}
            disabled={formData.isFree}
            min="0"
            step="0.01"
            className={styles.priceInput}
            style={{
              width: '100%',
              padding: '12px 16px',
              paddingLeft: '36px',
              fontSize: '16px',
              background: 'var(--color-bg-tertiary)',
              border: `1px solid ${errors.price ? 'var(--color-danger)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              color: formData.isFree ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)'
            }}
          />
        </div>
        {errors.price && (
          <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
            {errors.price}
          </p>
        )}
        
        {/* Free Toggle */}
        <div 
          className={styles.freeToggle} 
          onClick={toggleFree}
          style={{ marginTop: '12px' }}
        >
          <div className={`${styles.checkbox} ${formData.isFree ? styles.checkboxChecked : ''}`}>
            {formData.isFree && '✓'}
          </div>
          <span className={styles.freeLabel}>Kostenlos anbieten</span>
        </div>
      </div>

      {/* Affiliate Commission */}
      <div className={styles.commissionSection}>
        <div className={styles.commissionHeader}>
          <span className={styles.commissionLabel}>Affiliate-Provision</span>
          <span className={styles.commissionValue}>{formData.affiliateCommission}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={formData.affiliateCommission}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            affiliateCommission: parseInt(e.target.value) 
          }))}
          className={styles.commissionSlider}
        />
        <p className={styles.commissionHint}>
          Promoter erhalten {formData.affiliateCommission}% vom Verkaufspreis
        </p>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Button 
          variant="secondary" 
          onClick={() => handleSubmit('draft')}
          disabled={isLoading}
        >
          Als Entwurf
        </Button>
        <Button 
          onClick={() => handleSubmit('active')}
          loading={isLoading}
        >
          Veröffentlichen
        </Button>
      </div>
    </div>
  );
}

export default ProductForm;