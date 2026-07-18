import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SystemConfig, AuditLog } from '../types';
import { db } from '../db/database';
import { useAuth } from './AuthContext';

type ThemeType = 'light' | 'dark' | 'high-contrast';

interface SystemContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  logs: AuditLog[];
  addLog: (action: string, details: string, status?: 'success' | 'warning' | 'error') => void;
  clearLogs: () => void;
  resetSystem: () => void;
  fontSizeMultiplier: number;
  setFontSizeMultiplier: (multiplier: number) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Theme state
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('lms_theme');
    return (saved as ThemeType) || 'light';
  });

  // Font Size Accessibility multiplier
  const [fontSizeMultiplier, setFontSizeMultiplierState] = useState<number>(() => {
    const saved = localStorage.getItem('lms_font_size');
    return saved ? parseFloat(saved) : 1;
  });

  // Config & Logs state
  const [config, setConfig] = useState<SystemConfig>(db.getConfig());
  const [logs, setLogs] = useState<AuditLog[]>(db.getLogs());

  // Apply theme class/attribute on load & change
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('lms_theme', theme);
  }, [theme]);

  // Apply Font Size multiplier on load & change
  useEffect(() => {
    const root = document.documentElement;
    // Base font size is 18px (defined in CSS). We scale it:
    root.style.fontSize = `${18 * fontSizeMultiplier}px`;
    localStorage.setItem('lms_font_size', fontSizeMultiplier.toString());
  }, [fontSizeMultiplier]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    if (currentUser) {
      db.addLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Alteração de Tema',
        `Tema alterado para ${newTheme}.`
      );
      setLogs(db.getLogs());
    }
  };

  const setFontSizeMultiplier = (multiplier: number) => {
    setFontSizeMultiplierState(multiplier);
    if (currentUser) {
      db.addLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Acessibilidade - Escala de Fonte',
        `Tamanho da fonte escalado para ${multiplier * 100}%.`
      );
      setLogs(db.getLogs());
    }
  };

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    const updated = { ...config, ...newConfig };
    db.saveConfig(updated);
    setConfig(updated);

    if (currentUser) {
      db.addLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Configuração do Sistema',
        `Configurações do sistema atualizadas: ${JSON.stringify(newConfig)}`
      );
      setLogs(db.getLogs());
    }
  };

  const addLog = (action: string, details: string, status: 'success' | 'warning' | 'error' = 'success') => {
    if (currentUser) {
      db.addLog(currentUser.id, currentUser.name, currentUser.role, action, details, status);
    } else {
      db.addLog('anonymous', 'Visitante Anonimo', 'STUDENT' as any, action, details, status);
    }
    setLogs(db.getLogs());
  };

  const clearLogs = () => {
    db.clearLogs();
    setLogs([]);
    if (currentUser) {
      db.addLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Limpeza de Logs',
        'Todos os logs de auditoria foram limpos pelo administrador.',
        'warning'
      );
      setLogs(db.getLogs());
    }
  };

  const resetSystem = () => {
    db.resetDB();
    setConfig(db.getConfig());
    setLogs(db.getLogs());
    // Reset local multiplier & theme
    setFontSizeMultiplierState(1);
    setThemeState('light');
  };

  return (
    <SystemContext.Provider
      value={{
        theme,
        setTheme,
        config,
        updateConfig,
        logs,
        addLog,
        clearLogs,
        resetSystem,
        fontSizeMultiplier,
        setFontSizeMultiplier,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
