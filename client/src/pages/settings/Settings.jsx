import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { usersService, stripeService } from '../../services';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import styles from '../../styles/pages/Settings.module.css';

/**
 * Settings Page
 * All settings on one page with tab navigation and sticky save button
 */
function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['profile', 'store', 'payout', 'account'];
    return validTabs.includes(tabParam) ? tabParam : 'profile';
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

  // Stripe Connect states
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  // Check for Stripe return status
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success' && activeTab === 'payout') {
      setSuccess('Kontoeinrichtung erfolgreich! Dein Status wird aktualisiert.');
      fetchStripeStatus();
    } else if (status === 'refresh' && activeTab === 'payout') {
      setError('Die Einrichtung wurde unterbrochen. Bitte versuche es erneut.');
    }
  }, [searchParams, activeTab]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    if (user) {
      const changed = 
        formData.name !== (user.name || '') ||
        formData.username !== (user.username || '') ||
        formData.bio !== (user.bio || '') ||
        formData.avatar !== (user.avatar || '');
      setHasChanges(changed);
    }
  }, [formData, user]);

  // Debounced username check
  useEffect(() => {
    if (!formData.username || formData.username === user?.username) {
      setUsernameStatus(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (formData.username.length < 3) {
        setUsernameStatus(null);
        return;
      }
      
      setUsernameStatus('checking');
      try {
        const response = await usersService.checkUsername(formData.username);
        setUsernameStatus(response.data?.available ? 'available' : 'taken');
      } catch (err) {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, user?.username]);

  // Fetch Stripe status when payout tab is active
  useEffect(() => {
    if (activeTab === 'payout') {
      fetchStripeStatus();
    }
  }, [activeTab]);

  // Fetch Stripe Connect status
  const fetchStripeStatus = async () => {
    setStripeLoading(true);
    setStripeError(null);
    try {
      const response = await stripeService.getConnectStatus();
      if (response.success) {
        setStripeStatus(response.data);
      }
    } catch (err) {
      console.error('Stripe status error:', err);
      setStripeError('Status konnte nicht geladen werden');
    } finally {
      setStripeLoading(false);
    }
  };

  // Start Stripe onboarding
  const handleStartOnboarding = async () => {
    setStripeLoading(true);
    setStripeError(null);
    try {
      const response = await stripeService.startOnboarding();
      if (response.success && response.data?.onboardingUrl) {
        window.location.href = response.data.onboardingUrl;
      } else {
        setStripeError(response.message || 'Fehler beim Starten der Einrichtung');
      }
    } catch (err) {
      console.error('Start onboarding error:', err);
      setStripeError(err.message || 'Fehler beim Starten der Einrichtung');
    } finally {
      setStripeLoading(false);
    }
  };

  // Continue Stripe onboarding
  const handleContinueOnboarding = async () => {
    setStripeLoading(true);
    setStripeError(null);
    try {
      const response = await stripeService.continueOnboarding();
      if (response.success && response.data?.onboardingUrl) {
        window.location.href = response.data.onboardingUrl;
      } else {
        setStripeError(response.message || 'Fehler beim Fortsetzen der Einrichtung');
      }
    } catch (err) {
      setStripeError(err.message || 'Fehler beim Fortsetzen der Einrichtung');
    } finally {
      setStripeLoading(false);
    }
  };

  // Open Stripe Dashboard
  const handleOpenDashboard = async () => {
    setStripeLoading(true);
    try {
      const response = await stripeService.getDashboardLink();
      if (response.success && response.data?.dashboardUrl) {
        window.open(response.data.dashboardUrl, '_blank');
      }
    } catch (err) {
      setStripeError('Dashboard konnte nicht geöffnet werden');
    } finally {
      setStripeLoading(false);
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name || name.trim() === '') return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toLowerCase().replace(/[^a-z0-9_]/g, '')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError(null);
    setSuccess(null);
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Bitte wähle ein Bild aus');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Bild darf maximal 5MB groß sein');
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      const ext = file.name.split('.').pop();
      const filename = `avatars/${user.id}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({
        ...prev,
        avatar: downloadURL
      }));
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError('Fehler beim Hochladen des Bildes');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges) return;
    
    if (!formData.name.trim()) {
      setError('Name darf nicht leer sein');
      return;
    }
    
    if (formData.username && formData.username.length < 3) {
      setError('Username muss mindestens 3 Zeichen haben');
      return;
    }
    
    if (usernameStatus === 'taken') {
      setError('Dieser Username ist bereits vergeben');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
        username: formData.username || undefined,
        bio: formData.bio,
        avatar_url: formData.avatar || null
      });

      if (result.success) {
        setSuccess('Änderungen gespeichert');
        setHasChanges(false);
        await refreshUser();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Helper to translate Stripe requirements
  const translateRequirement = (req) => {
    const translations = {
      'individual.verification.document': 'Ausweisdokument',
      'individual.verification.additional_document': 'Zusätzliches Dokument',
      'individual.first_name': 'Vorname',
      'individual.last_name': 'Nachname',
      'individual.dob.day': 'Geburtsdatum',
      'individual.dob.month': 'Geburtsmonat',
      'individual.dob.year': 'Geburtsjahr',
      'individual.address.line1': 'Adresse',
      'individual.address.city': 'Stadt',
      'individual.address.postal_code': 'Postleitzahl',
      'external_account': 'Bankverbindung',
      'tos_acceptance.date': 'AGB-Akzeptierung',
      'tos_acceptance.ip': 'AGB-Akzeptierung'
    };
    return translations[req] || req;
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'user' },
    { id: 'store', label: 'Store', icon: 'store' },
    { id: 'payout', label: 'Auszahlung', icon: 'wallet' },
    { id: 'account', label: 'Account', icon: 'lock' },
  ];

  return (
    <div className={`page ${styles.settingsPage}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Einstellungen</h1>
        <p className={styles.subtitle}>Verwalte dein Profil und deinen Store</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size="sm" />
            <span>{tab.label}</span>
            {tab.id === 'payout' && stripeStatus?.payoutsEnabled && (
              <span className={styles.statusDot} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className={styles.content}>
        
        {/* ========== Profile Tab ========== */}
        {activeTab === 'profile' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Profil-Informationen</h2>
            <p className={styles.sectionDescription}>
              Diese Informationen werden öffentlich angezeigt.
            </p>

            {/* Avatar */}
            <div className={styles.avatarSection}>
              <div 
                className={styles.avatarPreview}
                onClick={handleAvatarClick}
              >
                {uploadingAvatar ? (
                  <div className={styles.avatarLoading}>
                    <Icon name="loader" size="lg" className={styles.spinner} />
                  </div>
                ) : formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" />
                ) : (
                  <span className={styles.avatarInitials}>
                    {getInitials(formData.name)}
                  </span>
                )}
                <div className={styles.avatarOverlay}>
                  <Icon name="camera" size="md" />
                </div>
              </div>
              <div className={styles.avatarInfo}>
                <button 
                  type="button" 
                  className={styles.avatarButton}
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? 'Wird hochgeladen...' : 'Bild ändern'}
                </button>
                <p className={styles.avatarHint}>JPG, PNG oder GIF. Max 5MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.hiddenInput}
              />
            </div>

            {/* Name */}
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Dein Name"
              />
            </div>

            {/* Username */}
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>
                Username
                {usernameStatus === 'checking' && (
                  <span className={styles.usernameChecking}>
                    <Icon name="loader" size={14} className={styles.spinner} />
                  </span>
                )}
                {usernameStatus === 'available' && (
                  <span className={styles.usernameAvailable}>
                    <Icon name="check" size={14} /> Verfügbar
                  </span>
                )}
                {usernameStatus === 'taken' && (
                  <span className={styles.usernameTaken}>
                    <Icon name="close" size={14} /> Vergeben
                  </span>
                )}
              </label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="username"
                />
              </div>
              <p className={styles.fieldHint}>
                Dein öffentlicher Store-Link: monemee.app/@{formData.username || 'username'}
              </p>
            </div>

            {/* Bio */}
            <div className={styles.field}>
              <label htmlFor="bio" className={styles.label}>Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Erzähle etwas über dich..."
                rows={4}
              />
              <p className={styles.fieldHint}>
                {formData.bio.length}/500 Zeichen
              </p>
            </div>
          </div>
        )}

        {/* ========== Store Tab ========== */}
        {activeTab === 'store' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Store-Einstellungen</h2>
            <p className={styles.sectionDescription}>
              Konfiguriere wie dein Store für Besucher aussieht.
            </p>

            {/* Store Preview Card */}
            <div className={styles.storePreviewCard}>
              <div className={styles.storePreviewHeader}>
                <div className={styles.storePreviewAvatar}>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" />
                  ) : (
                    <span>{getInitials(formData.name)}</span>
                  )}
                </div>
                <div className={styles.storePreviewInfo}>
                  <h3>{formData.name || 'Dein Name'}</h3>
                  <p>@{formData.username || 'username'}</p>
                </div>
              </div>
              {formData.bio && (
                <p className={styles.storePreviewBio}>{formData.bio}</p>
              )}
              <div className={styles.storePreviewActions}>
                <a 
                  href={user?.username ? `/store/${user.username}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.previewButton}
                  onClick={(e) => {
                    if (!user?.username) {
                      e.preventDefault();
                      setError('Speichere zuerst einen Username, um die Vorschau zu sehen');
                    }
                  }}
                >
                  <Icon name="externalLink" size="sm" />
                  Store-Vorschau öffnen
                </a>
              </div>
            </div>

            {/* Public Link */}
            <div className={styles.field}>
              <label className={styles.label}>Dein öffentlicher Store-Link</label>
              <div className={styles.copyLinkField}>
                <input
                  type="text"
                  value={user?.username ? `monemee.app/@${user.username}` : 'Kein Username gesetzt'}
                  className={styles.input}
                  readOnly
                />
                <button 
                  type="button"
                  className={styles.copyButton}
                  onClick={() => {
                    if (user?.username) {
                      navigator.clipboard.writeText(`https://monemee.app/@${user.username}`);
                      setSuccess('Link kopiert!');
                      setTimeout(() => setSuccess(null), 2000);
                    }
                  }}
                  disabled={!user?.username}
                >
                  <Icon name="copy" size="sm" />
                </button>
              </div>
              <p className={styles.fieldHint}>
                Teile diesen Link mit deinen Kunden und Followern.
              </p>
            </div>
          </div>
        )}

        {/* ========== Payout Tab (Stripe Connect) ========== */}
        {activeTab === 'payout' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Auszahlungskonto</h2>
            <p className={styles.sectionDescription}>
              Verbinde dein Bankkonto, um Auszahlungen zu erhalten.
            </p>

            {/* Loading State */}
            {stripeLoading && !stripeStatus && (
              <div className={styles.stripeLoading}>
                <Icon name="loader" size="lg" className={styles.spinner} />
                <p>Status wird geladen...</p>
              </div>
            )}

            {/* Error State */}
            {stripeError && (
              <div className={styles.stripeError}>
                <Icon name="alertCircle" size="lg" />
                <p>{stripeError}</p>
                <button 
                  type="button" 
                  onClick={fetchStripeStatus}
                  className={styles.retryButton}
                >
                  Erneut versuchen
                </button>
              </div>
            )}

            {/* Stripe Not Configured */}
            {!stripeLoading && !stripeError && stripeStatus && !stripeStatus.stripeConfigured && (
              <div className={styles.stripeNotConfigured}>
                <Icon name="alertTriangle" size="xl" />
                <h3>Zahlungen noch nicht verfügbar</h3>
                <p>Die Zahlungsfunktion wird derzeit eingerichtet. Bitte versuche es später erneut.</p>
              </div>
            )}

            {/* Stripe Enabled (fully set up) */}
            {!stripeLoading && stripeStatus?.stripeConfigured && stripeStatus?.payoutsEnabled && (
              <div className={styles.stripeEnabled}>
                <div className={styles.stripeStatusCard}>
                  <div className={styles.stripeStatusIconSuccess}>
                    <Icon name="checkCircle" size="xl" />
                  </div>
                  <div className={styles.stripeStatusInfo}>
                    <h3>Auszahlungen aktiviert</h3>
                    <p>Dein Konto ist vollständig eingerichtet. Auszahlungen werden automatisch auf dein Bankkonto überwiesen.</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleOpenDashboard}
                  disabled={stripeLoading}
                  className={styles.stripeSecondaryButton}
                >
                  <Icon name="externalLink" size="sm" />
                  Stripe Dashboard öffnen
                </button>
                
                <p className={styles.fieldHint}>
                  Im Stripe Dashboard kannst du deine Bankverbindung verwalten und alle Transaktionen einsehen.
                </p>
              </div>
            )}

            {/* Stripe Account exists but incomplete */}
            {!stripeLoading && stripeStatus?.stripeConfigured && stripeStatus?.hasStripeAccount && !stripeStatus?.payoutsEnabled && (
              <div className={styles.stripeIncomplete}>
                <div className={styles.stripeStatusCard}>
                  <div className={styles.stripeStatusIconWarning}>
                    <Icon name="alertCircle" size="xl" />
                  </div>
                  <div className={styles.stripeStatusInfo}>
                    <h3>Einrichtung fortsetzen</h3>
                    <p>Die Kontoeinrichtung ist noch nicht abgeschlossen. Bitte vervollständige deine Angaben.</p>
                    {stripeStatus.stripeDetails?.requirements?.length > 0 && (
                      <div className={styles.requirementsList}>
                        <strong>Noch erforderlich:</strong>
                        <ul>
                          {stripeStatus.stripeDetails.requirements.slice(0, 3).map((req, i) => (
                            <li key={i}>{translateRequirement(req)}</li>
                          ))}
                          {stripeStatus.stripeDetails.requirements.length > 3 && (
                            <li>...und {stripeStatus.stripeDetails.requirements.length - 3} weitere</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleContinueOnboarding}
                  disabled={stripeLoading}
                  className={styles.stripePrimaryButton}
                >
                  {stripeLoading ? (
                    <>
                      <Icon name="loader" size="sm" className={styles.spinner} />
                      Wird geladen...
                    </>
                  ) : (
                    <>
                      <Icon name="arrowRight" size="sm" />
                      Einrichtung fortsetzen
                    </>
                  )}
                </button>
              </div>
            )}

            {/* No Stripe Account yet */}
            {!stripeLoading && stripeStatus?.stripeConfigured && !stripeStatus?.hasStripeAccount && (
              <div className={styles.stripeSetup}>
                <div className={styles.stripeIntro}>
                  <div className={styles.stripeIntroIcon}>
                    <Icon name="wallet" size="xl" />
                  </div>
                  <h3>Bankkonto verbinden</h3>
                  <p>Um Auszahlungen zu erhalten, musst du einmalig dein Bankkonto bei unserem Zahlungspartner Stripe verifizieren.</p>
                </div>

                <div className={styles.stripeFeatures}>
                  <div className={styles.stripeFeature}>
                    <Icon name="shield" size="md" />
                    <div>
                      <strong>Sicher</strong>
                      <p>Deine Bankdaten werden verschlüsselt bei Stripe gespeichert</p>
                    </div>
                  </div>
                  <div className={styles.stripeFeature}>
                    <Icon name="zap" size="md" />
                    <div>
                      <strong>Schnell</strong>
                      <p>Auszahlungen in 2-3 Werktagen auf deinem Konto</p>
                    </div>
                  </div>
                  <div className={styles.stripeFeature}>
                    <Icon name="clock" size="md" />
                    <div>
                      <strong>Einmalig</strong>
                      <p>Die Einrichtung dauert nur wenige Minuten</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartOnboarding}
                  disabled={stripeLoading}
                  className={styles.stripePrimaryButton}
                >
                  {stripeLoading ? (
                    <>
                      <Icon name="loader" size="sm" className={styles.spinner} />
                      Wird geladen...
                    </>
                  ) : (
                    <>
                      <Icon name="arrowRight" size="sm" />
                      Jetzt einrichten
                    </>
                  )}
                </button>

                <p className={styles.stripeDisclaimer}>
                  Du wirst zu Stripe weitergeleitet, um deine Identität zu verifizieren und dein Bankkonto hinzuzufügen.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== Account Tab ========== */}
        {activeTab === 'account' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Account</h2>
            <p className={styles.sectionDescription}>
              Verwalte deinen Account und deine Sicherheitseinstellungen.
            </p>

            {/* Email (read-only) */}
            <div className={styles.field}>
              <label className={styles.label}>E-Mail</label>
              <div className={styles.readOnlyField}>
                <Icon name="mail" size="sm" />
                <span>{user?.email}</span>
              </div>
              <p className={styles.fieldHint}>
                Die E-Mail kann derzeit nicht geändert werden.
              </p>
            </div>

            {/* Level */}
            <div className={styles.field}>
              <label className={styles.label}>Level</label>
              <div className={styles.levelBadge}>
                <Icon name="star" size="sm" />
                <span>Level {user?.level || 1}</span>
              </div>
              <p className={styles.fieldHint}>
                Dein Level basiert auf deinen Gesamteinnahmen.
              </p>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerZone}>
              <h3 className={styles.dangerTitle}>Abmelden</h3>
              <p className={styles.dangerDescription}>
                Du wirst von deinem Account abgemeldet.
              </p>
              <button 
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                <Icon name="logout" size="sm" />
                Abmelden
              </button>
            </div>
          </div>
        )}

        {/* Sticky Footer with Save Button */}
        <div className={styles.stickyFooter}>
          <div className={styles.footerContent}>
            {/* Status Messages */}
            {error && (
              <div className={styles.errorMessage}>
                <Icon name="alertCircle" size="sm" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className={styles.successMessage}>
                <Icon name="checkCircle" size="sm" />
                <span>{success}</span>
              </div>
            )}

            {/* Save Button (only show for profile/store tabs) */}
            {(activeTab === 'profile' || activeTab === 'store') && (
              <button
                type="submit"
                className={styles.saveButton}
                disabled={!hasChanges || loading || usernameStatus === 'taken'}
              >
                {loading ? (
                  <>
                    <Icon name="loader" size="sm" className={styles.spinner} />
                    Speichern...
                  </>
                ) : (
                  'Änderungen speichern'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;