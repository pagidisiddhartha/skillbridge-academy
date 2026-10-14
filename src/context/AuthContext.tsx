import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, MentorProfile } from '../types';
import { api, setStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | MentorProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'student' | 'mentor') => Promise<void>;
  demoLogin: (role: 'student' | 'mentor' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.warn('Session expired or invalid, clearing credentials:', err);
      setStoredToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setStoredToken(res.token);
      setUser(res.user);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: 'student' | 'mentor') => {
    setIsLoading(true);
    try {
      const res = await api.auth.register({ name, email, password, role });
      setStoredToken(res.token);
      setUser(res.user);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'student' | 'mentor' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.auth.demoLogin(role);
      setStoredToken(res.token);
      setUser(res.user);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateProfile = async (data: any) => {
    const res = await api.auth.updateProfile(data);
    setUser(res.user);
    setProfile(res.profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
