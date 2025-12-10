import React from 'react';
import { Icon } from '../common';
import styles from '../../styles/components/ModuleCard.module.css';

/**
 * Module Type Configurations
 */
const MODULE_CONFIG = {
  file: {
    icon: 'file',
    label: 'Datei',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)'
  },
  url: {
    icon: 'link',
    label: 'Link',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  email: {
    icon: 'mail',
    label: 'Newsletter',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  text: {
    icon: 'fileText',
    label: 'Text',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)'
  },
  videocall: {
    icon: 'video',
    label: 'Videocall',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  }
};

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Get module subtitle based on type
 */
const getModuleSubtitle = (module) => {
  switch (module.type) {
    case 'file':
      return module.file_name 
        ? `${module.file_name}${module.file_size ? ` • ${formatFileSize(module.file_size)}` : ''}`
        : 'Datei hochladen';
    case 'url':
      return module.url || 'URL hinzufügen';
    case 'email':
      return module.description || 'Newsletter-Zugang';
    case 'text':
      return module.content 
        ? `${module.content.slice(0, 50)}${module.content.length > 50 ? '...' : ''}`
        : 'Text hinzufügen';
    case 'videocall':
      return module.duration ? `${module.duration} Minuten` : 'Videocall buchen';
    default:
      return '';
  }
};

/**
 * ModuleCard Component
 * Displays a single content module
 */
function ModuleCard({ 
  module, 
  index, 
  totalCount,
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown 
}) {
  const config = MODULE_CONFIG[module.type] || MODULE_CONFIG.file;
  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

  return (
    <div className={styles.card}>
      {/* Module Icon */}
      <div 
        className={styles.iconWrapper}
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color
        }}
      >
        <Icon name={config.icon} size="md" />
      </div>

      {/* Module Content */}
      <div className={styles.content} onClick={onEdit}>
        <div className={styles.header}>
          <span className={styles.typeLabel} style={{ color: config.color }}>
            {config.label}
          </span>
          {module.title && (
            <h4 className={styles.title}>{module.title}</h4>
          )}
        </div>
        <p className={styles.subtitle}>{getModuleSubtitle(module)}</p>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Reorder Buttons */}
        <div className={styles.reorderButtons}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.reorderButton}`}
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="Nach oben"
          >
            <Icon name="chevronUp" size="sm" />
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.reorderButton}`}
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title="Nach unten"
          >
            <Icon name="chevronDown" size="sm" />
          </button>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={onDelete}
          title="Löschen"
        >
          <Icon name="trash2" size="sm" />
        </button>
      </div>
    </div>
  );
}

export default ModuleCard;
