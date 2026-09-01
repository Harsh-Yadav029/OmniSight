import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const getStoredToken = () => {
    const t = localStorage.getItem('omnisight_jwt_token');
    if (!t || t === 'undefined' || t === 'null') {
      localStorage.removeItem('omnisight_jwt_token');
      return null;
    }
    return t;
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
        } catch (err) {
          console.warn('Auth token expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    const validToken = data.accessToken || data.token;
    setToken(validToken);
    setUser(data.user);
    if (validToken) {
      localStorage.setItem('omnisight_jwt_token', validToken);
    }
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('omnisight_jwt_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
