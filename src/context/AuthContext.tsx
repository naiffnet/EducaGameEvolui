import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { db } from '../db/database';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  login: (userId: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load initial user and all users list
    setCurrentUser(db.getCurrentUser());
    setAllUsers(db.getUsers());
  }, []);

  const login = (userId: string) => {
    db.setCurrentUser(userId);
    const user = db.getCurrentUser();
    setCurrentUser(user);
    // Reload user list in case logs or state changed
    setAllUsers(db.getUsers());
  };

  const logout = () => {
    db.logout();
    setCurrentUser(null);
  };

  const refreshUser = () => {
    setCurrentUser(db.getCurrentUser());
    setAllUsers(db.getUsers());
  };

  return (
    <AuthContext.Provider value={{ currentUser, allUsers, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
