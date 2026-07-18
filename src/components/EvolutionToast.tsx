import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { Sparkles, Trophy, TrendingUp, Flame, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'xp' | 'milestone' | 'levelup' | 'streak';
  title: string;
  description: string;
  xpAmount?: number;
}

// ─── Individual Toast ─────────────────────────────────────────────────────────

interface EvolutionToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const EvolutionToast: React.FC<EvolutionToastProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setDismissing(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setDismissing(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'xp': return <TrendingUp size={20} style={{ color: 'var(--accent-green)' }} />;
      case 'milestone': return <Trophy size={20} style={{ color: 'var(--accent)' }} />;
      case 'levelup': return <Sparkles size={20} style={{ color: '#ffd700' }} />;
      case 'streak': return <Flame size={20} style={{ color: '#ff6b35' }} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'xp': return 'var(--accent-green)';
      case 'milestone': return 'var(--accent)';
      case 'levelup': return '#ffd700';
      case 'streak': return '#ff6b35';
    }
  };

  return (
    <div
      role="alert"
      style={{
        minWidth: '320px',
        maxWidth: '420px',
        background: 'var(--bg-secondary)',
        border: `1px solid ${getBorderColor()}40`,
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${getBorderColor()}20`,
        transform: visible && !dismissing ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.9)',
        opacity: visible && !dismissing ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        position: 'relative',
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: `${getBorderColor()}15`,
        border: `2px solid ${getBorderColor()}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        animation: visible ? 'xp-toast-pulse 2s ease-in-out infinite' : 'none',
      }}>
        {getIcon()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: '800',
          fontSize: '0.85rem',
          color: getBorderColor(),
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {toast.title}
          {toast.xpAmount && (
            <span style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: `${getBorderColor()}20`,
              fontSize: '0.7rem',
              color: 'var(--accent-green)',
            }}>
              +{toast.xpAmount} XP
            </span>
          )}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
        }}>
          {toast.description}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        aria-label="Dispensar notificação"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: `${getBorderColor()}20`,
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
        overflow: 'hidden',
      }}>
        <div
          style={{
            height: '100%',
            backgroundColor: getBorderColor(),
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            animation: 'xp-toast-timer 4s linear forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes xp-toast-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes xp-toast-timer {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// ─── Toast Manager Context ─────────────────────────────────────────────────────

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast render zone: fixed container that stacks toasts vertically */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <EvolutionToast toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
