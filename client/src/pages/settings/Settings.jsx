import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Icon, ToastContainer } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { usersService, stripeService, billingService } from '../../services';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { SellerTypeModal, BillingFormModal } from '../../components/billing';
import StorePreviewModal from '../../components/settings/StorePreviewModal';
import {
  getAllThemes,
  getAllLayouts,
  getAllAvatarStyles,
  getAllButtonStyles,
  getAllCardStyles,
  getAllHeaderBackgrounds,
  getAllFontFamilies,
  getAllSpacingOptions
} from '../../config/themes';
import styles from '../../styles/pages/Settings.module.css';

/**
 * Settings Page
 * Mit Seller-Type & Billing Sektion
 */
function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, refreshUser, isPasswordUser, changePassword, deleteAccount } = useAuth();
  const fileInputRef = useRef(null);
  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'payout') return 'stripe';
    if (tabParam === 'profile') return 'account'; // Legacy redirect
    const validTabs = ['account', 'store', 'stripe', 'purchases'];
    return validTabs.includes(tabParam) ? tabParam : 'account';
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
    storeSettings: {
      theme: 'classic',
      layout: {
        productGrid: 'two-column'
      },
      avatarStyle: 'round',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      headerBackground: 'solid',
      fontFamily: 'modern',
      spacing: 'normal'
    }
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

  // Stripe Connect states
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  // Seller Type & Billing states
  const [showSellerTypeModal, setShowSellerTypeModal] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [sellerTypeLoading, setSellerTypeLoading] = useState(false);
  const [sellerTypeError, setSellerTypeError] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);

  // Preview Modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('classic');

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Add toast
  const addToast = (message, variant = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant, duration }]);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fetch billing info when stripe tab is active and stripe is connected
  useEffect(() => {
    if (activeTab === 'stripe' && stripeStatus?.payoutsEnabled) {
      fetchBillingInfo();
    }
  }, [activeTab, stripeStatus?.payoutsEnabled]);

  // Fetch billing info
  const fetchBillingInfo = async () => {
    setBillingLoading(true);
    try {
      const response = await billingService.getBillingInfo();
      if (response.success) {
        setBillingInfo(response.data);
      }
    } catch (err) {
      console.error('Billing info error:', err);
    } finally {
      setBillingLoading(false);
    }
  };

  // Check for Stripe return status
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success' && activeTab === 'stripe') {
      setSuccess('Kontoeinrichtung erfolgreich! Dein Status wird aktualisiert.');
      fetchStripeStatus();
      
      // Prüfen ob seller_type Abfrage nötig ist
      billingService.getBillingInfo().then(res => {
        if (res.success) {
          setBillingInfo(res.data);
          // Nur Modal zeigen wenn noch nie gefragt (sellerType ist noch 'private' und keine billingInfo)
          if (res.data.sellerType === 'private' && !res.data.billingInfo) {
            setShowSellerTypeModal(true);
          }
        }
      }).catch(err => {
        console.error('Billing info check error:', err);
      });
      
    } else if (status === 'refresh' && activeTab === 'stripe') {
      setError('Die Einrichtung wurde unterbrochen. Bitte versuche es erneut.');
    }
  }, [searchParams, activeTab]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const defaultSettings = {
        theme: 'classic',
        layout: {
          productGrid: 'two-column'
        },
        avatarStyle: 'round',
        buttonStyle: 'rounded',
        cardStyle: 'elevated',
        headerBackground: 'solid',
        fontFamily: 'modern',
        spacing: 'normal'
      };

      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        storeSettings: {
          ...defaultSettings,
          ...(user.storeSettings || {})
        }
      });
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    if (user) {
      const userStoreSettings = user.storeSettings || { theme: 'classic', layout: { productGrid: 'two-column' } };
      const changed =
        formData.name !== (user.name || '') ||
        formData.username !== (user.username || '') ||
        formData.bio !== (user.bio || '') ||
        formData.avatar !== (user.avatar || '') ||
        JSON.stringify(formData.storeSettings) !== JSON.stringify(userStoreSettings);
      setHasChanges(changed);
    }
  }, [formData, user]);

  // Reset avatar error when avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [formData.avatar]);

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

  // Fetch Stripe status when stripe tab is active
  useEffect(() => {
    if (activeTab === 'stripe') {
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
      }
    } catch (err) {
      console.error('Stripe onboarding error:', err);
      setStripeError('Onboarding konnte nicht gestartet werden');
    } finally {
      setStripeLoading(false);
    }
  };

  // Continue Stripe onboarding
  const handleContinueOnboarding = async () => {
    setStripeLoading(true);
    setStripeError(null);
    try {
      const response = await stripeService.getOnboardingLink();
      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Stripe onboarding error:', err);
      setStripeError('Link konnte nicht erstellt werden');
    } finally {
      setStripeLoading(false);
    }
  };

  // Open Stripe Dashboard
  const handleOpenDashboard = async () => {
    setStripeLoading(true);
    try {
      const response = await stripeService.getDashboardLink();
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (err) {
      console.error('Stripe dashboard error:', err);
    } finally {
      setStripeLoading(false);
    }
  };

  // Handle seller type selection
  const handleSellerTypeSelect = async (type) => {
    setSellerTypeLoading(true);
    setSellerTypeError(null); // Clear any previous errors

    try {
      console.log('Setting seller type to:', type);
      const response = await billingService.setSellerType(type);
      console.log('Seller type response:', response);

      if (response.success) {
        // Close modal immediately
        setShowSellerTypeModal(false);
        setSellerTypeError(null);

        // Show success message
        setSuccess('Verkäufertyp gespeichert!');
        setTimeout(() => setSuccess(null), 3000);

        // Refresh data in background
        fetchBillingInfo().catch(err => console.error('Fetch billing info error:', err));
        refreshUser().catch(err => console.error('Refresh user error:', err));

        // Open billing form if business (with delay for smooth transition)
        if (type === 'business') {
          setTimeout(() => setShowBillingForm(true), 300);
        }
      } else {
        console.error('API returned success=false:', response);
        setSellerTypeError(response.message || 'Fehler beim Speichern');
      }
    } catch (err) {
      console.error('Set seller type error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Fehler beim Speichern';
      setSellerTypeError(errorMsg);
    } finally {
      setSellerTypeLoading(false);
    }
  };

  // Handle billing form save
  const handleBillingSave = async (data) => {
    setSellerTypeLoading(true);
    try {
      const response = await billingService.updateBillingInfo(data);
      if (response.success) {
        setShowBillingForm(false);
        setSuccess('Rechnungsangaben gespeichert!');
        setTimeout(() => setSuccess(null), 3000);
        await fetchBillingInfo();
        await refreshUser();
      }
    } catch (err) {
      console.error('Billing save error:', err);
      setError(err.response?.data?.message || err.message || 'Speichern fehlgeschlagen');
    } finally {
      setSellerTypeLoading(false);
    }
  };

  // Handle change seller type button
  const handleChangeSellerType = () => {
    setShowSellerTypeModal(true);
  };

  // Handle edit billing info
  const handleEditBillingInfo = () => {
    setShowBillingForm(true);
  };

  // Handle avatar click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Bild darf maximal 5MB groß sein');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Bitte wähle ein Bild aus');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);

      const fileExtension = file.name.split('.').pop();
      const fileName = `avatars/${user.id}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      setFormData(prev => ({ ...prev, avatar: downloadUrl }));
      setSuccess('Avatar hochgeladen');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError('Upload fehlgeschlagen');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges) return;

    if (usernameStatus === 'taken') {
      addToast('Dieser Username ist bereits vergeben', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData = {
        name: formData.name,
        username: formData.username.toLowerCase(),
        bio: formData.bio,
        avatar_url: formData.avatar,
        store_settings: formData.storeSettings
      };

      await updateProfile(updateData);
      await refreshUser();

      // Success feedback
      addToast('Einstellungen erfolgreich gespeichert', 'success');
      setSaveSuccess(true);
      setHasChanges(false);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Update error:', err);
      addToast(err.message || 'Speichern fehlgeschlagen', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Das neue Passwort muss mindestens 6 Zeichen haben');
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        addToast('Passwort erfolgreich geändert', 'success');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(result.error || 'Passwort konnte nicht geändert werden');
      }
    } catch (err) {
      setPasswordError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteError(null);

    // For password users, require password confirmation
    if (isPasswordUser() && !deletePassword) {
      setDeleteError('Bitte gib dein Passwort zur Bestätigung ein');
      return;
    }

    setDeleteLoading(true);
    try {
      const result = await deleteAccount(deletePassword);
      if (result.success) {
        navigate('/login');
      } else {
        setDeleteError(result.error || 'Account konnte nicht gelöscht werden');
      }
    } catch (err) {
      setDeleteError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Translate Stripe requirements
  const translateRequirement = (req) => {
    const translations = {
      'individual.first_name': 'Vorname',
      'individual.last_name': 'Nachname',
      'individual.dob.day': 'Geburtstag',
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

  // Get seller type display info
  const getSellerTypeInfo = () => {
    const sellerType = billingInfo?.sellerType || 'private';
    
    if (sellerType === 'business') {
      const isSmallBusiness = billingInfo?.billingInfo?.isSmallBusiness;
      return {
        type: 'business',
        label: isSmallBusiness ? 'Gewerblich (Kleinunternehmer)' : 'Gewerblich',
        icon: 'briefcase',
        color: 'var(--color-primary)'
      };
    }
    
    return {
      type: 'private',
      label: 'Privatverkäufer',
      icon: 'user',
      color: 'var(--color-text-secondary)'
    };
  };

  // Tab configuration
  const tabs = [
    { id: 'account', label: 'Account', icon: 'user' },
    { id: 'store', label: 'Store', icon: 'store' },
    { id: 'stripe', label: 'Stripe', icon: 'creditCard' },
    { id: 'purchases', label: 'Käufe', icon: 'shoppingBag' },
  ];

  const sellerTypeInfo = getSellerTypeInfo();

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
            {tab.id === 'stripe' && stripeStatus?.payoutsEnabled && (
              <span className={styles.statusDot} />
            )}
          </button>
        ))}
      </div>

      {/* Global Success/Error Messages */}
      {success && (
        <div className={styles.successBanner}>
          <Icon name="checkCircle" size="sm" />
          {success}
        </div>
      )}
      {error && (
        <div className={styles.errorBanner}>
          <Icon name="alertCircle" size="sm" />
          {error}
          <button onClick={() => setError(null)} className={styles.dismissButton}>×</button>
        </div>
      )}

      {/* Content */}
      <form onSubmit={handleSubmit} className={styles.content}>
        
        {/* ========== Account Tab ========== */}
        {activeTab === 'account' && (
          <>
            {/* Public Profile Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Öffentliches Profil</h2>
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
                  ) : formData.avatar && !avatarError ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className={styles.avatarInitials}>
                      {(formData.name || user?.email || '?').charAt(0)}
                    </span>
                  )}
                  <div className={styles.avatarOverlay}>
                    <Icon name="camera" size="sm" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className={styles.hiddenInput}
                />
                <p className={styles.avatarHint}>Klicke zum Ändern (max. 5MB)</p>
              </div>

              {/* Name */}
              <div className={styles.field}>
                <label className={styles.label}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Dein Name"
                  className={styles.input}
                />
              </div>

              {/* Username */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Username
                  {usernameStatus === 'checking' && (
                    <span className={styles.usernameChecking}>
                      <Icon name="loader" size="xs" className={styles.spinner} /> Prüfe...
                    </span>
                  )}
                  {usernameStatus === 'available' && (
                    <span className={styles.usernameAvailable}>
                      <Icon name="check" size="xs" /> Verfügbar
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className={styles.usernameTaken}>
                      <Icon name="x" size="xs" /> Vergeben
                    </span>
                  )}
                </label>
                <div className={styles.inputWithPrefix}>
                  <span className={styles.inputPrefix}>@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    }))}
                    placeholder="username"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className={styles.field}>
                <label className={styles.label}>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Erzähle etwas über dich..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>

            {/* Account Details Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Account-Details</h2>
              <p className={styles.sectionDescription}>
                Deine persönlichen Kontoinformationen.
              </p>

              {/* Email */}
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

              {/* Password Change (only for email/password users) */}
              {isPasswordUser() && (
                <div className={styles.field}>
                  <label className={styles.label}>Passwort</label>
                  {!showPasswordForm ? (
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(true)}
                      className={styles.changePasswordButton}
                    >
                      <Icon name="lock" size="sm" />
                      Passwort ändern
                    </button>
                  ) : (
                    <div className={styles.passwordForm}>
                      {passwordError && (
                        <div className={styles.passwordError}>
                          <Icon name="alertCircle" size="sm" />
                          {passwordError}
                        </div>
                      )}
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Aktuelles Passwort"
                        className={styles.input}
                      />
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Neues Passwort"
                        className={styles.input}
                      />
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Neues Passwort bestätigen"
                        className={styles.input}
                      />
                      <div className={styles.passwordActions}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordError(null);
                          }}
                          className={styles.cancelButton}
                        >
                          Abbrechen
                        </button>
                        <button
                          type="button"
                          onClick={handlePasswordChange}
                          disabled={passwordLoading}
                          className={styles.savePasswordButton}
                        >
                          {passwordLoading ? (
                            <>
                              <Icon name="loader" size="sm" className={styles.spinner} />
                              Speichern...
                            </>
                          ) : (
                            'Passwort speichern'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Danger Zone Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Gefahrenbereich</h2>
              <p className={styles.sectionDescription}>
                Aktionen, die nicht rückgängig gemacht werden können.
              </p>

              {/* Logout */}
              <div className={styles.dangerItem}>
                <div className={styles.dangerItemInfo}>
                  <h3>Abmelden</h3>
                  <p>Du wirst von deinem Account abgemeldet.</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  <Icon name="logOut" size="sm" />
                  Abmelden
                </button>
              </div>

              {/* Delete Account */}
              <div className={styles.dangerItem}>
                <div className={styles.dangerItemInfo}>
                  <h3>Account löschen</h3>
                  <p>Dein Account und alle Daten werden unwiderruflich gelöscht.</p>
                </div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className={styles.deleteButton}
                  >
                    <Icon name="trash2" size="sm" />
                    Account löschen
                  </button>
                ) : (
                  <div className={styles.deleteConfirmForm}>
                    {deleteError && (
                      <div className={styles.deleteError}>
                        <Icon name="alertCircle" size="sm" />
                        {deleteError}
                      </div>
                    )}
                    <p className={styles.deleteWarning}>
                      <Icon name="alertTriangle" size="sm" />
                      Diese Aktion kann nicht rückgängig gemacht werden!
                    </p>
                    {isPasswordUser() && (
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Passwort zur Bestätigung"
                        className={styles.input}
                      />
                    )}
                    <div className={styles.deleteActions}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                          setDeleteError(null);
                        }}
                        className={styles.cancelButton}
                      >
                        Abbrechen
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className={styles.confirmDeleteButton}
                      >
                        {deleteLoading ? (
                          <>
                            <Icon name="loader" size="sm" className={styles.spinner} />
                            Löschen...
                          </>
                        ) : (
                          'Endgültig löschen'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ========== Store Tab ========== */}
        {activeTab === 'store' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Store-Einstellungen</h2>
            <p className={styles.sectionDescription}>
              Personalisiere deinen öffentlichen Store.
            </p>

            {/* Store URL */}
            <div className={styles.field}>
              <label className={styles.label}>Deine Store-URL</label>
              <div className={styles.copyLinkField}>
                <input
                  type="text"
                  value={`monemee.de/@${user?.username || 'username'}`}
                  readOnly
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={async () => {
                    if (user?.username) {
                      await navigator.clipboard.writeText(`https://monemee.de/@${user.username}`);
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

            {/* Theme Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Store-Design</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Wähle ein Theme für deinen Store
              </p>
              <div className={styles.themeSelector}>
                {getAllThemes().map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`${styles.themeCard} ${formData.storeSettings.theme === theme.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        theme: theme.id
                      }
                    }))}
                  >
                    <div
                      className={styles.themePreview}
                      style={{ backgroundColor: theme.background }}
                    >
                      {/* Mini Button */}
                      <div
                        className={styles.themePreviewButton}
                        style={{ backgroundColor: theme.primary }}
                      >
                        <Icon name="check" size={10} />
                      </div>
                      {/* Mini Card */}
                      <div
                        className={styles.themePreviewCard}
                        style={{ backgroundColor: theme.backgroundSecondary }}
                      >
                        <div
                          className={styles.themePreviewCardTitle}
                          style={{ backgroundColor: theme.textPrimary }}
                        />
                        <div
                          className={styles.themePreviewCardText}
                          style={{ backgroundColor: theme.textSecondary }}
                        />
                        <div
                          className={styles.themePreviewCardText}
                          style={{ backgroundColor: theme.textSecondary }}
                        />
                      </div>
                    </div>
                    <div className={styles.themeName}>{theme.name}</div>
                    <div className={styles.themeDescription}>{theme.description}</div>
                    {formData.storeSettings.theme === theme.id && (
                      <div className={styles.themeActiveBadge}>
                        <Icon name="check" size="sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Produkt-Layout</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Anzahl der Spalten im Produkt-Grid
              </p>
              <div className={styles.layoutSelector}>
                {getAllLayouts().map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    className={`${styles.layoutOption} ${formData.storeSettings.layout.productGrid === layout.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        layout: {
                          productGrid: layout.id
                        }
                      }
                    }))}
                  >
                    {/* Mini Grid Preview */}
                    <div className={`${styles.layoutPreview} ${styles[`layoutPreview-${layout.columns}`]}`}>
                      {Array.from({ length: Math.min(layout.columns, 3) }).map((_, i) => (
                        <div key={i} className={styles.layoutPreviewCard} />
                      ))}
                    </div>
                    <div className={styles.layoutName}>{layout.name}</div>
                    <div className={styles.layoutDescription}>{layout.description}</div>
                  </button>
                ))}
              </div>

            </div>

            {/* Avatar Style Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Avatar-Form</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Form deines Profilbilds
              </p>
              <div className={styles.avatarStyleSelector}>
                {getAllAvatarStyles().map((avatarStyle) => (
                  <button
                    key={avatarStyle.id}
                    type="button"
                    className={`${styles.avatarStyleOption} ${formData.storeSettings.avatarStyle === avatarStyle.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        avatarStyle: avatarStyle.id
                      }
                    }))}
                  >
                    <div
                      className={styles.avatarStylePreview}
                      style={{
                        borderRadius: avatarStyle.borderRadius,
                        clipPath: avatarStyle.clipPath || 'none'
                      }}
                    >
                      {(formData.name || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.avatarStyleName}>{avatarStyle.name}</div>
                    <div className={styles.avatarStyleDescription}>{avatarStyle.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Button Style Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Button-Style</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Form deiner Buttons
              </p>
              <div className={styles.buttonStyleSelector}>
                {getAllButtonStyles().map((buttonStyle) => (
                  <button
                    key={buttonStyle.id}
                    type="button"
                    className={`${styles.buttonStyleOption} ${formData.storeSettings.buttonStyle === buttonStyle.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        buttonStyle: buttonStyle.id
                      }
                    }))}
                  >
                    <div
                      className={styles.buttonStylePreview}
                      style={{ borderRadius: buttonStyle.borderRadius }}
                    >
                      <Icon name="shoppingBag" size={14} />
                      Button
                    </div>
                    <div className={styles.buttonStyleName}>{buttonStyle.name}</div>
                    <div className={styles.buttonStyleDescription}>{buttonStyle.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Style Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Karten-Style</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Stil deiner Produkt-Karten
              </p>
              <div className={styles.cardStyleSelector}>
                {getAllCardStyles().map((cardStyle) => (
                  <button
                    key={cardStyle.id}
                    type="button"
                    className={`${styles.cardStyleOption} ${formData.storeSettings.cardStyle === cardStyle.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        cardStyle: cardStyle.id
                      }
                    }))}
                  >
                    <div
                      className={styles.cardStylePreview}
                      style={{
                        boxShadow: cardStyle.shadow,
                        border: cardStyle.border
                      }}
                    >
                      <div className={styles.cardPreviewLine} />
                      <div className={styles.cardPreviewLine} />
                    </div>
                    <div className={styles.cardStyleName}>{cardStyle.name}</div>
                    <div className={styles.cardStyleDescription}>{cardStyle.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Header Background Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Header-Hintergrund</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Stil des oberen Bereichs
              </p>
              <div className={styles.headerBackgroundSelector}>
                {getAllHeaderBackgrounds().map((headerBg) => (
                  <button
                    key={headerBg.id}
                    type="button"
                    className={`${styles.headerBackgroundOption} ${formData.storeSettings.headerBackground === headerBg.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        headerBackground: headerBg.id
                      }
                    }))}
                  >
                    <div className={styles.headerBackgroundPreview}>
                      <div
                        className={styles.headerPreviewBg}
                        style={
                          headerBg.type === 'gradient'
                            ? { background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }
                            : headerBg.type === 'pattern'
                            ? {
                                background: 'var(--color-primary)',
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                                backgroundSize: '12px 12px'
                              }
                            : { background: 'var(--color-primary)' }
                        }
                      />
                      <div className={styles.headerPreviewWave} />
                    </div>
                    <div className={styles.headerBackgroundName}>{headerBg.name}</div>
                    <div className={styles.headerBackgroundDescription}>{headerBg.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Schriftart</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Schrift für deinen Store
              </p>
              <div className={styles.fontFamilySelector}>
                {getAllFontFamilies().map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    className={`${styles.fontFamilyOption} ${formData.storeSettings.fontFamily === font.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        fontFamily: font.id
                      }
                    }))}
                  >
                    <div
                      className={styles.fontFamilyPreview}
                      style={{ fontFamily: font.fontFamily }}
                    >
                      Aa
                    </div>
                    <div className={styles.fontFamilyName}>{font.name}</div>
                    <div className={styles.fontFamilyDescription}>{font.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Abstände</label>
              <p className={styles.fieldHint} style={{ marginBottom: '12px' }}>
                Dichte des Layouts
              </p>
              <div className={styles.spacingSelector}>
                {getAllSpacingOptions().map((spacing) => (
                  <button
                    key={spacing.id}
                    type="button"
                    className={`${styles.spacingOption} ${formData.storeSettings.spacing === spacing.id ? styles.active : ''}`}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      storeSettings: {
                        ...prev.storeSettings,
                        spacing: spacing.id
                      }
                    }))}
                  >
                    <div className={styles.spacingStylePreview}>
                      <div className={styles.spacingPreviewBox} style={{ marginBottom: `${spacing.multiplier * 8}px` }} />
                      <div className={styles.spacingPreviewBox} style={{ marginBottom: `${spacing.multiplier * 8}px` }} />
                      <div className={styles.spacingPreviewBox} />
                    </div>
                    <div className={styles.spacingName}>{spacing.name}</div>
                    <div className={styles.spacingDescription}>{spacing.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== Stripe Tab ========== */}
        {activeTab === 'stripe' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Stripe-Konto</h2>
            <p className={styles.sectionDescription}>
              Verbinde dein Stripe-Konto, um Zahlungen zu empfangen.
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

            {/* Stripe Enabled - Stripe Connected Successfully */}
            {!stripeLoading && stripeStatus?.stripeConfigured && stripeStatus?.payoutsEnabled && (
              <>
                {/* Stripe Status Card */}
                <div className={styles.stripeEnabled}>
                  <div className={styles.stripeStatusCard}>
                    <div className={styles.stripeStatusIconSuccess}>
                      <Icon name="checkCircle" size="xl" />
                    </div>
                    <div className={styles.stripeStatusInfo}>
                      <h3>Stripe verbunden</h3>
                      <p>Dein Konto ist vollständig eingerichtet. Zahlungen werden automatisch überwiesen.</p>
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
                </div>

                {/* ========== SELLER TYPE & BILLING SECTION ========== */}
                <div className={styles.sellerTypeSection}>
                  <h3 className={styles.subsectionTitle}>Verkäufertyp & Rechnungen</h3>
                  
                  {billingLoading ? (
                    <div className={styles.billingLoading}>
                      <Icon name="loader" size="sm" className={styles.spinner} />
                      <span>Wird geladen...</span>
                    </div>
                  ) : (
                    <>
                      {/* Seller Type Card */}
                      <div className={styles.sellerTypeCard}>
                        <div 
                          className={styles.sellerTypeIcon} 
                          style={{ backgroundColor: sellerTypeInfo.color }}
                        >
                          <Icon name={sellerTypeInfo.icon} size="md" />
                        </div>
                        <div className={styles.sellerTypeInfo}>
                          <span className={styles.sellerTypeLabel}>Aktueller Status</span>
                          <span className={styles.sellerTypeValue}>{sellerTypeInfo.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleChangeSellerType}
                          className={styles.changeTypeButton}
                        >
                          <Icon name="edit2" size="sm" />
                          Ändern
                        </button>
                      </div>

                      {/* Info based on type */}
                      {sellerTypeInfo.type === 'private' ? (
                        <div className={styles.sellerTypeHint}>
                          <Icon name="info" size="sm" />
                          <p>
                            Als Privatverkäufer erhält dein Käufer automatisch einen <strong>Stripe-Beleg</strong>. 
                            Eine eigene Rechnung wird nicht erstellt.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className={styles.sellerTypeHint}>
                            <Icon name="fileText" size="sm" />
                            <p>
                              Als gewerblicher Verkäufer werden automatisch <strong>Rechnungen</strong> für deine Käufer erstellt.
                              Du findest alle Rechnungen unter <strong>Fortschritt → Rechnungen</strong>.
                            </p>
                          </div>

                          {/* Billing Info Display */}
                          {billingInfo?.billingInfo ? (
                            <div className={styles.billingInfoCard}>
                              <div className={styles.billingInfoHeader}>
                                <h4>Rechnungsangaben</h4>
                                <button
                                  type="button"
                                  onClick={handleEditBillingInfo}
                                  className={styles.editBillingButton}
                                >
                                  <Icon name="edit2" size="sm" />
                                  Bearbeiten
                                </button>
                              </div>
                              <div className={styles.billingInfoContent}>
                                <p><strong>{billingInfo.billingInfo.businessName}</strong></p>
                                <p>{billingInfo.billingInfo.street}</p>
                                <p>{billingInfo.billingInfo.zip} {billingInfo.billingInfo.city}</p>
                                {billingInfo.billingInfo.taxId && (
                                  <p className={styles.taxId}>
                                    {billingInfo.billingInfo.taxId.startsWith('DE') ? 'USt-IdNr.' : 'Steuernr.'}: {billingInfo.billingInfo.taxId}
                                  </p>
                                )}
                                {billingInfo.billingInfo.isSmallBusiness && (
                                  <p className={styles.smallBusinessBadge}>
                                    <Icon name="check" size="xs" />
                                    Kleinunternehmer §19 UStG
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Missing Billing Info Warning */
                            <div className={styles.billingWarning}>
                              <Icon name="alertTriangle" size="sm" />
                              <div>
                                <p><strong>Rechnungsangaben fehlen!</strong></p>
                                <p>Bitte hinterlege deine Geschäftsdaten, damit Rechnungen erstellt werden können.</p>
                              </div>
                              <button
                                type="button"
                                onClick={handleEditBillingInfo}
                                className={styles.addBillingButton}
                              >
                                Jetzt hinzufügen
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Stripe Incomplete */}
            {!stripeLoading && stripeStatus?.stripeConfigured && stripeStatus?.hasStripeAccount && !stripeStatus?.payoutsEnabled && (
              <div className={styles.stripeIncomplete}>
                <div className={styles.stripeStatusCard}>
                  <div className={styles.stripeStatusIconWarning}>
                    <Icon name="alertCircle" size="xl" />
                  </div>
                  <div className={styles.stripeStatusInfo}>
                    <h3>Einrichtung fortsetzen</h3>
                    <p>Die Kontoeinrichtung ist noch nicht abgeschlossen.</p>
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

            {/* No Stripe Account Yet */}
            {!stripeLoading && stripeStatus?.stripeConfigured && !stripeStatus?.hasStripeAccount && (
              <div className={styles.stripeSetup}>
                <div className={styles.stripeIntro}>
                  <div className={styles.stripeIntroIcon}>
                    <Icon name="creditCard" size="xl" />
                  </div>
                  <h3>Stripe-Konto einrichten</h3>
                  <p>Verbinde dein Bankkonto, um Zahlungen für deine Produkte zu erhalten.</p>
                </div>
                
                <div className={styles.stripeFeatures}>
                  <div className={styles.stripeFeature}>
                    <Icon name="shield" size="sm" />
                    <div>
                      <strong>Sicher</strong>
                      <p>Stripe ist der führende Zahlungsanbieter weltweit.</p>
                    </div>
                  </div>
                  <div className={styles.stripeFeature}>
                    <Icon name="zap" size="sm" />
                    <div>
                      <strong>Automatisch</strong>
                      <p>Verkäufe werden direkt auf dein Konto überwiesen.</p>
                    </div>
                  </div>
                  <div className={styles.stripeFeature}>
                    <Icon name="creditCard" size="sm" />
                    <div>
                      <strong>Flexibel</strong>
                      <p>Alle gängigen Zahlungsmethoden werden unterstützt.</p>
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

        {/* ========== Purchases Tab ========== */}
        {activeTab === 'purchases' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Meine Käufe</h2>
            <p className={styles.sectionDescription}>
              Produkte, die du gekauft hast.
            </p>

            <div className={styles.purchasesLink}>
              <div className={styles.purchasesLinkIcon}>
                <Icon name="shoppingBag" size="xl" />
              </div>
              <div className={styles.purchasesLinkInfo}>
                <h3>Gekaufte Produkte</h3>
                <p>Alle deine Käufe und Downloads an einem Ort.</p>
              </div>
              <Link to="/dashboard/purchases" className={styles.purchasesLinkButton}>
                <span>Käufe anzeigen</span>
                <Icon name="arrowRight" size="sm" />
              </Link>
            </div>
          </div>
        )}

        {/* Sticky Footer (für Account/Store) */}
        {(activeTab === 'account' || activeTab === 'store') && (
          <div className={styles.stickyFooter}>
            <div className={styles.footerContent}>
              {/* Preview Button (nur im Store Tab) */}
              {activeTab === 'store' && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewTheme(formData.storeSettings.theme);
                    setShowPreviewModal(true);
                  }}
                  className={styles.previewButton}
                >
                  <Icon name="eye" size="sm" />
                  Store-Vorschau
                </button>
              )}

              {/* Save Button (nur wenn Änderungen vorhanden oder gerade gespeichert) */}
              {(hasChanges || saveSuccess) && (
                <button
                  type="submit"
                  disabled={loading || usernameStatus === 'taken' || saveSuccess}
                  className={`${styles.saveButton} ${saveSuccess ? styles.saveButtonSuccess : ''}`}
                >
                  {loading ? (
                    <>
                      <Icon name="loader" size="sm" className={styles.spinner} />
                      Speichern...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Icon name="check" size="sm" />
                      Gespeichert!
                    </>
                  ) : (
                    <>
                      <Icon name="check" size="sm" />
                      Änderungen speichern
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Seller Type Modal */}
      <SellerTypeModal
        isOpen={showSellerTypeModal}
        onClose={() => {
          setShowSellerTypeModal(false);
          setSellerTypeError(null);
        }}
        onSelect={handleSellerTypeSelect}
        loading={sellerTypeLoading}
        error={sellerTypeError}
      />

      {/* Billing Form Modal */}
      <BillingFormModal
        isOpen={showBillingForm}
        onClose={() => setShowBillingForm(false)}
        onSave={handleBillingSave}
        initialData={billingInfo?.billingInfo}
        loading={sellerTypeLoading}
      />

      {/* Store Preview Modal */}
      <StorePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        settings={formData.storeSettings}
        onSettingsChange={(newSettings) => {
          setFormData(prev => ({
            ...prev,
            storeSettings: {
              ...prev.storeSettings,
              ...newSettings
            }
          }));
        }}
        userName={formData.name}
        userBio={formData.bio}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default Settings;