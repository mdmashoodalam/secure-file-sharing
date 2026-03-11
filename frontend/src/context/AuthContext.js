import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create a context so any component can access auth state
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

// Wrap the entire app with this to provide auth state everywhere
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, check if user is already logged in
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      const userData = result.data;
      setUser({ email: userData.email, name: userData.name, role: userData.role });
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'ROLE_ADMIN',
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
