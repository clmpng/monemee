import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
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
          const profile = await fetchUserProfile();
          
          if (profile) {
            setUser({
              ...profile,
              firebaseUid: firebaseUser.uid,
              emailVerified: firebaseUser.emailVerified
            });
          } else {
            // User exists in Firebase but not in DB yet (new user)
            setUser({
              id: null,
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'Neuer User',
              username: null,
              avatar: firebaseUser.photoURL,
              role: null,
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
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Login with email/password
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (err) {
      const message = getErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // Register with email/password
  const register = async (email, password, name) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name in Firebase
      await firebaseUpdateProfile(result.user, { displayName: name });
      
      return { success: true, user: result.user };
    } catch (err) {
      const message = getErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (err) {
      const message = getErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await usersService.updateProfile(data);
      
      if (response.success) {
        setUser(prev => ({ ...prev, ...response.data }));
        return { success: true };
      }
      
      return { success: false, error: 'Update fehlgeschlagen' };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update user role
  const updateRole = async (role) => {
    try {
      const response = await usersService.updateRole(role);
      
      if (response.success) {
        setUser(prev => ({ ...prev, role: response.data.role, isNewUser: false }));
        return { success: true };
      }
      
      return { success: false, error: 'Update fehlgeschlagen' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    const profile = await fetchUserProfile();
    if (profile) {
      setUser(prev => ({ ...prev, ...profile }));
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user && !user.isNewUser,
    isNewUser: user?.isNewUser || false,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    updateRole,
    refreshUser,
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
    'auth/invalid-credential': 'Ungültige Anmeldedaten'
  };
  
  return messages[code] || 'Ein Fehler ist aufgetreten';
}

export default AuthContext;