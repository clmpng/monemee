import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Provides authentication state and methods to the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    // TODO: Check Firebase auth state
    // For now, simulate logged in user for MVP
    const mockUser = {
      id: 1,
      email: 'max@example.com',
      name: 'Max Mustermann',
      username: 'maxmuster',
      avatar: null,
      role: 'creator', // 'creator' | 'promoter' | 'both'
      level: 2,
      createdAt: new Date().toISOString()
    };

    // Simulate auth check
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);
  }, []);

  // Login method
  const login = async (email, password) => {
    // TODO: Implement Firebase login
    console.log('Login:', email, password);
    return { success: true };
  };

  // Register method
  const register = async (email, password, name) => {
    // TODO: Implement Firebase registration
    console.log('Register:', email, name);
    return { success: true };
  };

  // Logout method
  const logout = async () => {
    // TODO: Implement Firebase logout
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (data) => {
    // TODO: Implement profile update
    setUser(prev => ({ ...prev, ...data }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
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

export default AuthContext;