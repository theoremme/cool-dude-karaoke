import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: load backend URL and stored token, then verify
  useEffect(() => {
    (async () => {
      try {
        const backendUrl = await window.api.backendUrlGet();
        authService.setBaseURL(backendUrl);

        const token = await window.api.authTokenGet();
        if (token) {
          authService.setToken(token);
          const data = await authService.getMe();
          setUser(data.user || data);
        }
      } catch (err) {
        // Token expired or invalid — clear it
        console.warn('Auth restore failed:', err.message);
        await window.api.authTokenClear();
        authService.setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    authService.setToken(data.token);
    await window.api.authTokenSet(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const data = await authService.register(email, password, name);
    authService.setToken(data.token);
    await window.api.authTokenSet(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    authService.setToken(null);
    await window.api.authTokenClear();
    await window.api.sessionClear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
