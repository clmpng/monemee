import React from 'react';
import { Button, Icon } from '../../components/common';

/**
 * Promotion Hub Page
 */
function PromotionHub() {
  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Promotion</h1>
        <p className="page-subtitle">Bewerbe Produkte und verdiene Provisionen</p>
      </div>

      {/* Coming Soon State */}
      <div className="empty-state" style={{ marginTop: '40px' }}>
        <div className="empty-state-icon">
          <Icon name="rocket" size="xxl" />
        </div>
        <h3 className="empty-state-title">Coming Soon</h3>
        <p className="empty-state-text">
          Die Promoter-Funktionen werden bald verfügbar sein. 
          Bewerbe dann Produkte anderer Creator und verdiene Provisionen!
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <Button variant="secondary" disabled icon={<Icon name="link" size="sm" />}>
            Affiliate-Links erstellen
          </Button>
          <Button variant="secondary" disabled icon={<Icon name="search" size="sm" />}>
            Produkte entdecken
          </Button>
          <Button variant="secondary" disabled icon={<Icon name="users" size="sm" />}>
            Mein Netzwerk
          </Button>
        </div>
      </div>

      {/* Feature Preview */}
      <section className="section" style={{ marginTop: '48px' }}>
        <h2 className="section-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Was dich erwartet
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FeaturePreview 
            icon="link" 
            title="Affiliate-Links"
            description="Generiere einzigartige Links für Produkte und tracke deine Conversions"
          />
          <FeaturePreview 
            icon="wallet" 
            title="Provisionen"
            description="Verdiene bis zu 30% Provision für jeden Verkauf über deinen Link"
          />
          <FeaturePreview 
            icon="chart" 
            title="Statistiken"
            description="Detaillierte Analytics zu Klicks, Conversions und Einnahmen"
          />
          <FeaturePreview 
            icon="users" 
            title="Netzwerk"
            description="Sieh wer für dich promotet und wer deine Top-Performer sind"
          />
        </div>
      </section>
    </div>
  );
}

// Feature Preview Card
function FeaturePreview({ icon, title, description }) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon name={icon} size="md" />
      </div>
      <div>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: 'var(--color-text-primary)',
          marginBottom: '4px'
        }}>
          {title}
        </h3>
        <p style={{ 
          fontSize: '13px', 
          color: 'var(--color-text-secondary)',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default PromotionHub;