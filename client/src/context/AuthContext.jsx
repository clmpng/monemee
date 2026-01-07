import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  EmailAuthProvider,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  deleteUser,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { usersService } from '../services';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Provides authentication state and methods to the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await usersService.getMe();
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in - fetch profile from backend
          // The backend will automatically create the user if they don't exist
          const profile = await fetchUserProfile();
          
          if (profile) {
            setUser({
              ...profile,
              firebaseUid: firebaseUser.uid,
              emailVerified: firebaseUser.emailVerified
            });
          } else {
            // Backend couldn't fetch user - might be network issue
            // Set basic info from Firebase
            setUser({
              id: null,
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              username: null,
              avatar: firebaseUser.photoURL,
              role: 'both',
              level: 1,
              totalEarnings: 0,
              isNewUser: true
            });
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Redirect login war erfolgreich - User wird durch onAuthStateChanged behandelt
          console.log('Redirect login successful');
        }
      } catch (err) {
        console.error('Redirect result error:', err);
        setError(getErrorMessage(err.code));
      }
    };
    
    checkRedirectResult();
  }, []);

  // Login with email/password
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Profile will be fetched automatically by onAuthStateChanged
      return { success: true, user: result.user };
    } catch (err) {
      const message = getErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Register with email/password
  const register = async (email, password, name) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name in Firebase
      if (name) {
        await firebaseUpdateProfile(result.user, { displayName: name });
      }
      
      // User will be created in backend automatically by auth middleware
      // Profile will be fetched by onAuthStateChanged
      return { success: true, user: result.user };
    } catch (err) {
      const message = getErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Mobile Detection - Redirect statt Popup verwenden
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Redirect-Flow für Mobile (zuverlässiger)
        await signInWithRedirect(auth, provider);
        // Diese Funktion kehrt nie zurück - Browser wird redirected
        return { success: true, redirect: true };
      }
      
      // Desktop: Popup verwenden
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (err) {
      const message = getErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await usersService.updateProfile(data);
      
      if (response.success) {
        setUser(prev => ({ ...prev, ...response.data }));
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Update fehlgeschlagen' };
    } catch (err) {
      const message = err.message || 'Update fehlgeschlagen';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Update user role
  const updateRole = async (role) => {
    try {
      const response = await usersService.updateRole(role);
      
      if (response.success) {
        setUser(prev => ({ ...prev, role: response.data.role }));
        return { success: true };
      }
      
      return { success: false, error: 'Update fehlgeschlagen' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      const profile = await fetchUserProfile();
      if (profile) {
        setUser(prev => ({
          ...prev,
          ...profile,
          firebaseUid: prev?.firebaseUid
        }));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Refresh user error:', err);
      return { success: false, error: err.message };
    }
  };

  // Check if user logged in with email/password (not OAuth)
  const isPasswordUser = () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;
    return firebaseUser.providerData.some(
      provider => provider.providerId === 'password'
    );
  };

  // Change password (requires current password for re-authentication)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        return { success: false, error: 'Nicht angemeldet' };
      }

      if (!isPasswordUser()) {
        return { success: false, error: 'Passwort kann nur für E-Mail-Accounts geändert werden' };
      }

      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err.code);
      return { success: false, error: message };
    }
  };

  // Delete account (requires password for re-authentication)
  const deleteAccount = async (password) => {
    try {
      setError(null);
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        return { success: false, error: 'Nicht angemeldet' };
      }

      // Re-authenticate user first (required for sensitive operations)
      if (isPasswordUser() && password) {
        const credential = EmailAuthProvider.credential(firebaseUser.email, password);
        await reauthenticateWithCredential(firebaseUser, credential);
      }

      // Delete user data from backend first
      try {
        await usersService.deleteAccount();
      } catch (backendErr) {
        console.error('Backend delete error:', backendErr);
        // Continue with Firebase deletion even if backend fails
      }

      // Delete Firebase account
      await deleteUser(firebaseUser);

      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('Delete account error:', err);
      const message = getErrorMessage(err.code);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user && !!user.id,
    isNewUser: user?.isNewUser || false,
    isPasswordUser,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    updateRole,
    refreshUser,
    changePassword,
    deleteAccount,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'Kein Account mit dieser E-Mail gefunden',
    'auth/wrong-password': 'Falsches Passwort',
    'auth/email-already-in-use': 'Diese E-Mail wird bereits verwendet',
    'auth/weak-password': 'Passwort muss mindestens 6 Zeichen haben',
    'auth/invalid-email': 'Ungültige E-Mail-Adresse',
    'auth/popup-closed-by-user': 'Anmeldung abgebrochen',
    'auth/network-request-failed': 'Netzwerkfehler - prüfe deine Verbindung',
    'auth/too-many-requests': 'Zu viele Versuche - bitte warte kurz',
    'auth/invalid-credential': 'Ungültige Anmeldedaten',
    'auth/operation-not-allowed': 'Diese Anmeldemethode ist nicht aktiviert',
    'auth/account-exists-with-different-credential': 'Ein Konto mit dieser E-Mail existiert bereits',
    'auth/requires-recent-login': 'Bitte melde dich erneut an'
  };
  
  return messages[code] || 'Ein Fehler ist aufgetreten';
}

export default AuthContext;
