import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // הגדרת נתוני המנהל שיוצגו בראש העמוד ובכל המערכת
  useEffect(() => {
    setUser({
      id: 1,
      fullName: 'דוד מדריך',
      email: 'david.guide@company.com',
      agentCode: 'ADMIN_001',
      idNumber: '123456789',
      role: 'ADMIN',
      rank: 5,
      // הוספת כתובת תמונה עבור האייקון שיופיע בפינה השמאלית
      pictureUrl: 'https://i.pravatar.cc/150?u=david_admin'
    });
  }, []);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
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