import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common';

/**
 * Onboarding Page
 * User chooses their role: Creator or Promoter
 */
function Onboarding() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'creator',
      icon: '🎨',
      title: 'Creator',
      subtitle: 'Geld verdienen als Creator',
      description: 'Verkaufe digitale Produkte wie E-Books, Templates, Kurse und mehr.',
      benefits: [
        'Eigener Store in Minuten',
        'Affiliate-System integriert',
        'Level-System mit sinkenden Gebühren'
      ]
    },
    {
      id: 'promoter',
      icon: '📣',
      title: 'Promoter',
      subtitle: 'Geld verdienen als Promoter',
      description: 'Bewerbe Produkte anderer Creator und verdiene Provisionen.',
      benefits: [
        'Bis zu 30% Provision',
        'Keine eigenen Produkte nötig',
        'Einfaches Link-Tracking'
      ]
    }
  ];

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // TODO: Save role to user profile
    console.log('Selected role:', selectedRole);
    
    // Navigate to appropriate setup
    if (selectedRole === 'creator') {
      navigate('/setup-store');
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="page" style={{ paddingTop: '40px', maxWidth: '500px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Wie möchtest du starten?
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Du kannst später jederzeit beides machen
        </p>
      </div>

      {/* Role Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isSelected={selectedRole === role.id}
            onSelect={() => setSelectedRole(role.id)}
          />
        ))}
      </div>

      {/* Continue Button */}
      <Button 
        fullWidth 
        disabled={!selectedRole}
        onClick={handleContinue}
      >
        Weiter
      </Button>

      {/* Skip */}
      <button 
        style={{ 
          width: '100%', 
          padding: '16px', 
          color: 'var(--color-text-tertiary)',
          fontSize: '14px',
          marginTop: '8px'
        }}
        onClick={() => navigate('/')}
      >
        Später entscheiden
      </button>
    </div>
  );
}

/**
 * Role Selection Card
 */
function RoleCard({ role, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '20px',
        background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-bg-secondary)',
        border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          flexShrink: 0
        }}>
          {role.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '4px' 
          }}>
            {role.title}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--color-text-secondary)',
            marginBottom: '12px'
          }}>
            {role.description}
          </p>

          {/* Benefits */}
          <ul style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)'
          }}>
            {role.benefits.map((benefit, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)' }}>✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Selection Indicator */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
          background: isSelected ? 'var(--color-primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isSelected && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;