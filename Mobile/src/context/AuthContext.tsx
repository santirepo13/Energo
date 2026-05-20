// Authentication Context - manages auth state across the app
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getDashboard } from '../api/dashboard';
import { UserInfo } from '../api/shared-types';

interface AuthUser {
  username: string;
  role: string | null;
  status: string | null;
  personalDataFilled?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'energo_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Check if we have a session marker in SecureStore
      const hasSession = await SecureStore.getItemAsync(AUTH_KEY);
      if (hasSession) {
        // Try to fetch user profile to verify session is still valid
        const data = await getDashboard();
        if (data.user) {
          setUser({
            username: data.user.username,
            role: data.user.role,
            status: data.user.status,
            personalDataFilled: data.personal_data_filled,
          });
        }
      }
    } catch (error) {
      // Session invalid or expired
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }

  async function clearSession() {
    await SecureStore.deleteItemAsync(AUTH_KEY);
    setUser(null);
  }

  async function login() {
    // This is called after successful login
    // Mark session as active
    await SecureStore.setItemAsync(AUTH_KEY, '1');
    await refreshUser();
  }

  async function logout() {
    // Clear session - isAuthenticated becomes false, AppNavigator switches to AuthNavigator
    await clearSession();
  }

  async function refreshUser() {
    try {
      const data = await getDashboard();
      if (data.user) {
        setUser({
          username: data.user.username,
          role: data.user.role,
          status: data.user.status,
          personalDataFilled: data.personal_data_filled,
        });
      }
    } catch (error) {
      await clearSession();
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to normalize role for checks
export function normalizeRole(role: string | null): 'admin' | 'audit' | 'user' | null {
  if (!role) return null;
  const norm = role.toLowerCase();
  if (norm === 'admin' || norm === 'administrator' || norm === 'administrador') return 'admin';
  if (norm === 'audit' || norm === 'auditor' || norm === 'auditoría' || norm === 'auditoria') return 'audit';
  return 'user';
}
