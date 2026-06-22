import { useState } from 'react';
import { apiClient } from '../api/client';
import { storage } from '../utils/storage';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storage.getToken());
  const [userId, setUserId] = useState(storage.getUserId());
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(username, password);
      if (res.success) {
        storage.setToken(res.token);
        storage.setUserId(res.userId);
        setToken(res.token);
        setUserId(res.userId);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, password, email) => {
    setIsLoading(true);
    try {
      const res = await apiClient.register(username, password, email);
      if (res.success) {
        storage.setToken(res.token);
        storage.setUserId(res.userId);
        setToken(res.token);
        setUserId(res.userId);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storage.clearAuth();
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, isLoggedIn: !!token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
