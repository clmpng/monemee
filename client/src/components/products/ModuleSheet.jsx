import React, { useState, useEffect } from 'react';
import { Icon } from '../common';
import styles from '../../styles/components/ModuleSheet.module.css';

/**
 * Module Types Configuration
 */
const MODULE_TYPES = [
  {
    type: 'file',
    icon: 'file',
    label: 'Datei',
    description: 'PDF, ZIP, Video, etc.',
    color: '#6366f1'
  },
  {
    type: 'url',
    icon: 'link',
    label: 'Link / URL',
    description: 'Notion, Videos, etc.',
    color: '#10b981'
  },
  {
    type: 'email',
    icon: 'mail',
    label: 'Newsletter-Zugang',
    description: 'E-Mail-Liste',
    color: '#f59e0b'
  },
  {
    type: 'text',
    icon: 'fileText',
    label: 'Text / Anleitung',
    description: 'Beschreibung, How-To',
    color: '#8b5cf6'
  },
  {
    type: 'videocall',
    icon: 'video',
    label: 'Videocall',
    description: 'Coaching, Beratung',
    color: '#ef4444',
    comingSoon: true
  }
];

/**
 * ModuleSheet Component
 * Bottom sheet for adding/editing modules
 */
function ModuleSheet({ isOpen, onClose, onSave, editData }) {
  const [step, setStep] = useState('select'); // 'select' | 'edit'
  const [selectedType, setSelectedType] = useState(null);
  const [moduleData, setModuleData] = useState({});

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setSelectedType(editData.type);
        setModuleData(editData);
        setStep('edit');
      } else {
        setStep('select');
        setSelectedType(null);
        setModuleData({});
      }
    }
  }, [isOpen, editData]);

  // Handle type selection
  const handleSelectType = (type) => {
    if (type.comingSoon) return;
    setSelectedType(type.type);
    setModuleData({ type: type.type });
    setStep('edit');
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setModuleData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('Datei darf max. 100MB groß sein');
        return;
      }
      setModuleData(prev => ({
        ...prev,
        file: file,
        file_name: file.name,
        file_size: file.size
      }));
    }
  };

  // Handle save
  const handleSave = () => {
    // Validate based on type
    if (selectedType === 'file' && !moduleData.file && !moduleData.file_url) {
      alert('Bitte lade eine Datei hoch');
      return;
    }
    if (selectedType === 'url' && !moduleData.url) {
      alert('Bitte gib eine URL ein');
      return;
    }

    onSave(moduleData);
  };

  // Handle back
  const handleBack = () => {
    if (editData) {
      onClose();
    } else {
      setStep('select');
      setSelectedType(null);
    }
  };

  // Render type-specific form
  const renderForm = () => {
    switch (selectedType) {
      case 'file':
        return <FileForm data={moduleData} onChange={handleChange} onFileChange={handleFileChange} />;
      case 'url':
        return <UrlForm data={moduleData} onChange={handleChange} />;
      case 'email':
        return <EmailForm data={moduleData} onChange={handleChange} />;
      case 'text':
        return <TextForm data={moduleData} onChange={handleChange} />;
      case 'videocall':
        return <VideocallForm data={moduleData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Sheet */}
      <div className={styles.sheet}>
        {/* Handle */}
        <div className={styles.handle} />

        {/* Header */}
        <div className={styles.header}>
          {step === 'edit' && (
            <button className={styles.backButton} onClick={handleBack}>
              <Icon name="chevronLeft" size="md" />
            </button>
          )}
          <h2 className={styles.title}>
            {step === 'select' ? 'Inhalt hinzufügen' : 
              editData ? 'Inhalt bearbeiten' : MODULE_TYPES.find(t => t.type === selectedType)?.label}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <Icon name="x" size="md" />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {step === 'select' ? (
            <div className={styles.typeList}>
              {MODULE_TYPES.map((type) => (
                <button
                  key={type.type}
                  className={`${styles.typeCard} ${type.comingSoon ? styles.typeCardDisabled : ''}`}
                  onClick={() => handleSelectType(type)}
                  disabled={type.comingSoon}
                >
                  <div 
                    className={styles.typeIcon}
                    style={{ backgroundColor: `${type.color}15`, color: type.color }}
                  >
                    <Icon name={type.icon} size="md" />
                  </div>
                  <div className={styles.typeInfo}>
                    <span className={styles.typeLabel}>{type.label}</span>
                    <span className={styles.typeDescription}>{type.description}</span>
                  </div>
                  {type.comingSoon && (
                    <span className={styles.comingSoon}>Bald</span>
                  )}
                  <Icon name="chevronRight" size="sm" className={styles.typeArrow} />
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.form}>
              {renderForm()}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'edit' && (
          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onClose}>
              Abbrechen
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              <Icon name="check" size="sm" />
              <span>Speichern</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ============================================
// Type-specific Form Components
// ============================================

function FileForm({ data, onChange, onFileChange }) {
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>Titel (optional)</label>
        <input
          type="text"
          name="title"
          placeholder="z.B. Trainingsplan PDF"
          value={data.title || ''}
          onChange={onChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Datei *</label>
        {data.file_name ? (
          <div className={styles.filePreview}>
            <div className={styles.fileIcon}>
              <Icon name="file" size="lg" />
            </div>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{data.file_name}</span>
              <span className={styles.fileSize}>{formatFileSize(data.file_size)}</span>
            </div>
            <button 
              type="button" 
              className={styles.fileRemove}
              onClick={() => onChange({ target: { name: 'file_name', value: '' } })}
            >
              <Icon name="x" size="sm" />
            </button>
          </div>
        ) : (
          <label className={styles.uploadArea}>
            <input
              type="file"
              onChange={onFileChange}
              className={styles.uploadInput}
            />
            <div className={styles.uploadContent}>
              <Icon name="upload" size="lg" />
              <span>Datei auswählen</span>
              <span className={styles.uploadHint}>PDF, ZIP, MP4, etc. bis 100MB</span>
            </div>
          </label>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Beschreibung (optional)</label>
        <textarea
          name="description"
          placeholder="Was enthält diese Datei?"
          value={data.description || ''}
          onChange={onChange}
          rows={3}
          className={styles.textarea}
        />
      </div>
    </>
  );
}

function UrlForm({ data, onChange }) {
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>Titel (optional)</label>
        <input
          type="text"
          name="title"
          placeholder="z.B. Notion Template"
          value={data.title || ''}
          onChange={onChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>URL *</label>
        <input
          type="url"
          name="url"
          placeholder="https://..."
          value={data.url || ''}
          onChange={onChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Button-Text (optional)</label>
        <input
          type="text"
          name="url_label"
          placeholder="z.B. Template öffnen"
          value={data.url_label || ''}
          onChange={onChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Beschreibung (optional)</label>
        <textarea
          name="description"
          placeholder="Was findet man unter diesem Link?"
          value={data.description || ''}
          onChange={onChange}
          rows={3}
          className={styles.textarea}
        />
      </div>
    </>
  );
}

function EmailForm({ data, onChange }) {
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>Titel (optional)</label>
        <input
          type="text"
          name="title"
          placeholder="z.B. Wöchentlicher Newsletter"
          value={data.title || ''}
          onChange={onChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Newsletter ID / Tag</label>
        <input
          type="text"
          name="newsletter_id"
          placeholder="z.B. premium-members"
          value={data.newsletter_id || ''}
          onChange={onChange}
          className={styles.input}
        />
        <p className={styles.fieldHint}>
          ID aus deinem E-Mail-Tool (Mailchimp, ConvertKit, etc.)
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Beschreibung *</label>
        <textarea
          name="description"
          placeholder="Was erhält der Käufer per E-Mail?"
          value={data.description || ''}
          onChange={onChange}
          rows={3}
          className={styles.textarea}
        />
      </div>
    </>
  );
}

function TextForm({ data, onChange }) {
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>Titel (optional)</label>
        <input
          type="text"
          name="title"
          placeholder="z.B. Schnellstart-Anleitung"
          value={data.title || ''}
          onChange={onChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Inhalt *</label>
        <textarea
          name="content"
          placeholder="Schreibe hier deinen Text, Anleitung oder How-To..."
          value={data.content || ''}
          onChange={onChange}
          rows={8}
          className={styles.textarea}
        />
        <p className={styles.fieldHint}>
          Markdown wird unterstützt
        </p>
      </div>
    </>
  );
}

function VideocallForm({ data, onChange }) {
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>Titel (optional)</label>
        <input
          type="text"
          name="title"
          placeholder="z.B. 1:1 Coaching Call"
          value={data.title || ''}
          onChange={onChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Dauer (Minuten)</label>
        <input
          type="number"
          name="duration"
          placeholder="30"
          value={data.duration || ''}
          onChange={onChange}
          min="15"
          max="180"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Buchungs-Link</label>
        <input
          type="url"
          name="booking_url"
          placeholder="https://calendly.com/..."
          value={data.booking_url || ''}
          onChange={onChange}
          className={styles.input}
        />
        <p className={styles.fieldHint}>
          Link zu Calendly, Cal.com oder ähnlich
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Beschreibung (optional)</label>
        <textarea
          name="description"
          placeholder="Was wird im Call besprochen?"
          value={data.description || ''}
          onChange={onChange}
          rows={3}
          className={styles.textarea}
        />
      </div>
    </>
  );
}

export default ModuleSheet;
