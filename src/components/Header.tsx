import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { Sun, Moon, Eye, Type, Users, ShieldAlert, Sparkles, Zap, LogOut } from 'lucide-react';
import { StreakIndicator } from './StreakIndicator';

interface HeaderProps {
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const { currentUser, allUsers, login, logout } = useAuth();
  const { theme, setTheme, fontSizeMultiplier, setFontSizeMultiplier, config } = useSystem();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      login(selectedId);
    }
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('high-contrast');
    else setTheme('light');
  };

  const increaseFontSize = () => {
    if (fontSizeMultiplier === 1) setFontSizeMultiplier(1.25);
    else if (fontSizeMultiplier === 1.25) setFontSizeMultiplier(1.5);
    else if (fontSizeMultiplier === 1.5) setFontSizeMultiplier(1.75);
    else if (fontSizeMultiplier === 1.75) setFontSizeMultiplier(2);
    else setFontSizeMultiplier(1);
  };

  const fontSizePercentage = Math.round(fontSizeMultiplier * 100);

  return (
    <header className="header-wrapper" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Top Accessibility Bar */}
      <div className="accessibility-bar" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px' }}>
        {/* Simulation Selector — só para Admin (é uma ferramenta de pré-visualização, não um atalho de login) */}
        {currentUser?.role === 'ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} aria-hidden="true" style={{ color: 'var(--primary)' }} />
            <label htmlFor="sim-profile-select" style={{ fontWeight: '600' }}>
              Simular Acesso:
            </label>
            <select
              id="sim-profile-select"
              className="form-select"
              style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto', minWidth: '160px' }}
              value={currentUser?.id || ''}
              onChange={handleRoleChange}
              aria-label="Selecione um perfil para simular acesso"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}
        {currentUser?.role !== 'ADMIN' && <div />}

        {/* Accessibility Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Maintenance Indicator */}
          {config.maintenanceMode && (
            <span 
              className="badge badge-maintenance" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              role="alert"
            >
              <ShieldAlert size={14} /> Modo Manutenção Ativo
            </span>
          )}

          {/* Size Multiplier Button */}
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={increaseFontSize}
            aria-label={`Aumentar tamanho da fonte. Atual: ${fontSizePercentage}%`}
          >
            <Type size={14} aria-hidden="true" />
            <span>Texto: {fontSizePercentage}%</span>
          </button>

          {/* Theme Button */}
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={cycleTheme}
            aria-label={`Mudar tema visual. Atual: ${theme === 'high-contrast' ? 'Alto Contraste' : theme === 'dark' ? 'Escuro' : 'Claro'}`}
          >
            {theme === 'light' && <Sun size={14} aria-hidden="true" />}
            {theme === 'dark' && <Moon size={14} aria-hidden="true" />}
            {theme === 'high-contrast' && <Eye size={14} aria-hidden="true" />}
            <span>Tema: {theme === 'high-contrast' ? 'Alto Contraste' : theme === 'dark' ? 'Escuro' : 'Claro'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div 
        className="container" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
              color: '#fff', 
              width: '40px', 
              height: '40px', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.25rem',
              boxShadow: 'var(--shadow-glow)'
            }}
            aria-hidden="true"
          >
            A
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Antigravity LMS <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            </h1>
            <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-tertiary)' }}>Plataforma de Ensino Inclusiva</p>
          </div>
        </div>

        {currentUser && currentUser.role === 'STUDENT' && currentUser.rpgCharacter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StreakIndicator dailyProgress={currentUser.rpgCharacter.dailyProgress} size="sm" />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'var(--accent)',
            }}>
              <Zap size={14} /> +{currentUser.rpgCharacter.dailyProgress.xpGainedToday} XP
            </div>
          </div>
        )}

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{currentUser.name}</div>
              <span className={`badge badge-${currentUser.role.toLowerCase()}`}>
                {currentUser.role === 'STUDENT' && 'Aluno'}
                {currentUser.role === 'INSTRUCTOR' && 'Professor'}
                {currentUser.role === 'ADMIN' && 'Administrador'}
                {currentUser.role === 'MAINTENANCE' && 'Suporte'}
              </span>
            </div>
            
            {/* Mock Avatar */}
            <button 
              onClick={onProfileClick}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: currentUser.role === 'ADMIN' ? 'var(--danger)' : currentUser.role === 'INSTRUCTOR' ? 'var(--accent)' : currentUser.role === 'MAINTENANCE' ? 'var(--warning)' : 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.1rem',
                border: '2px solid var(--border)',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Acessar meu perfil"
            >
              {currentUser.name[0]}
            </button>

            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label="Sair da conta"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
