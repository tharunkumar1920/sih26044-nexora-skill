import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS = {
  student: { email: 'student@ayush.gov.in', password: 'password123', label: 'Aarav Sharma (Student)' },
  recruiter: { email: 'recruiter@ayushhealthtech.com', password: 'password123', label: 'HealthTech HR (Recruiter)' },
  faculty: { email: 'faculty@ayushinstitute.edu.in', password: 'password123', label: 'Dr. Rajesh Kumar (Faculty)' },
  institution_admin: { email: 'admin@ayush.gov.in', password: 'password123', label: 'Ayush Admin (Institution)' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sih_token'));
  const [role, setRole] = useState<UserRole | null>((localStorage.getItem('sih_role') as UserRole) || null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data);
          setRole(res.data.role);
          localStorage.setItem('sih_role', res.data.role);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    const newToken = res.data.access_token;
    const userData = res.data.user;
    localStorage.setItem('sih_token', newToken);
    localStorage.setItem('sih_role', userData.role);
    setToken(newToken);
    setUser(userData);
    setRole(userData.role);
  };

  const logout = () => {
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const switchDemoUser = async (targetRole: UserRole) => {
    const creds = DEMO_USERS[targetRole];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
