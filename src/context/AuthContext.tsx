import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { db } from '../db/database';
import { performDailyCheck, grantXp, shouldResetDailyProgress, createDefaultDailyProgress } from '../engine/EvolutionEngine';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  login: (userId: string) => void;
  logout: () => void;
  refreshUser: () => void;
  dailyLeveledUp: boolean;
  setDailyLeveledUp: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dailyLeveledUp, setDailyLeveledUp] = useState(false);

  const runDailyCheck = useCallback((user: User) => {
    if (!user.rpgCharacter || user.role !== 'STUDENT') return user;

    const char = user.rpgCharacter;
    let updatedChar = { ...char, dailyProgress: { ...char.dailyProgress } };

    // Initialize dailyProgress if missing
    if (!updatedChar.dailyProgress || !updatedChar.dailyProgress.lastDailyReset) {
      updatedChar.dailyProgress = createDefaultDailyProgress();
    }

    // Perform daily reset if needed
    if (shouldResetDailyProgress(updatedChar.dailyProgress)) {
      const result = performDailyCheck(updatedChar);
      updatedChar = result.character;

      if (result.leveledUp) {
        setDailyLeveledUp(true);
      }

      // Grant login XP
      const grantResult = grantXp(
        updatedChar,
        'daily_login',
        {
          title: 'Login Diário',
          description: `Dia ${updatedChar.dailyProgress.currentStreak + 1} consecutivo!`,
        }
      );
      updatedChar = grantResult.character;
    }

    if (updatedChar !== char) {
      const updatedUser = { ...user, rpgCharacter: updatedChar };
      db.updateUser(updatedUser);
      return updatedUser;
    }

    return user;
  }, []);

  useEffect(() => {
    // Load initial user and all users list
    const user = db.getCurrentUserWithEvolution() || db.getCurrentUser();
    if (user) {
      const checkedUser = runDailyCheck(user);
      setCurrentUser(checkedUser);
    }
    setAllUsers(db.getUsers());
  }, [runDailyCheck]);

  const login = (userId: string) => {
    db.setCurrentUser(userId);
    const user = db.getCurrentUserWithEvolution() || db.getCurrentUser();
    if (user) {
      const checkedUser = runDailyCheck(user);
      setCurrentUser(checkedUser);
    }
    // Reload user list in case logs or state changed
    setAllUsers(db.getUsers());
  };

  const logout = () => {
    db.logout();
    setCurrentUser(null);
  };

  const refreshUser = () => {
    const user = db.getCurrentUserWithEvolution() || db.getCurrentUser();
    if (user) {
      const checkedUser = runDailyCheck(user);
      setCurrentUser(checkedUser);
    }
    setAllUsers(db.getUsers());
  };

  return (
    <AuthContext.Provider value={{ currentUser, allUsers, login, logout, refreshUser, dailyLeveledUp, setDailyLeveledUp }}>
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
