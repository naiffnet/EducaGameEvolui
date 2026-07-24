import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { Sun, Moon, Eye, ShieldAlert, Zap, LogOut, GraduationCap, SlidersHorizontal, Settings2 } from 'lucide-react';
import { StreakIndicator } from './StreakIndicator';

interface HeaderProps {
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const { currentUser, allUsers, login, logout } = useAuth();
  const { theme, setTheme, fontSizeMultiplier, setFontSizeMultiplier, config } = useSystem();
  
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      login(selectedId);
    }
  };

  const fontSizePercentage = Math.round(fontSizeMultiplier * 100);
  const schoolName = config.schoolName || 'Instituição de Ensino';

  return (
    <header className="header-wrapper" style={{ width: '100%', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', position: 'relative', zIndex: 50 }}>
      {/* Main Header Content Bar */}
      <div
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 28px', backgroundColor: 'var(--bg-secondary)', flexWrap: 'wrap', gap: 16,
        }}
      >
        {/* Left Side: WHITE-LABEL SCHOOL BRANDING SLOT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {config.schoolLogoUrl ? (
            <img
              src={config.schoolLogoUrl}
              alt={schoolName}
              style={{ height: 42, width: 'auto', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)',
              }}
              aria-hidden="true"
              title={`Logomarca da Instituição: ${schoolName}`}
            >
              <GraduationCap size={24} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {schoolName}
              </h2>
              <span className="badge badge-primary" style={{ fontSize: 9, padding: '2px 6px', opacity: 0.9 }}>
                PRO
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
              <span>Plataforma Educacional Gamificada</span>
              <span>·</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>EducaGame Evolui</span>
            </div>
          </div>
        </div>

        {/* Middle: RPG Student Stats */}
        {currentUser && currentUser.role === 'STUDENT' && currentUser.rpgCharacter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StreakIndicator dailyProgress={currentUser.rpgCharacter.dailyProgress} size="sm" />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px',
              borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent)',
            }}>
              <Zap size={14} /> +{currentUser.rpgCharacter.dailyProgress.xpGainedToday} XP Hoje
            </div>
          </div>
        )}

        {/* Right Side: Settings Icon Dropdown, User Profile & Session */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Maintenance Warning Badge if Active */}
            {config.maintenanceMode && (
              <span
                className="badge badge-maintenance"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 11 }}
                role="alert"
              >
                <ShieldAlert size={13} /> Manutenção
              </span>
            )}

            {/* VISUAL & ACCESSIBILITY SETTINGS ICON BUTTON */}
            <div style={{ position: 'relative' }} ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`btn ${showSettings ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                title="Ajustes de Acessibilidade, Fonte e Tema"
                aria-label="Ajustes de Acessibilidade e Tema"
                aria-expanded={showSettings}
              >
                <SlidersHorizontal size={16} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Ajustes</span>
              </button>

              {/* POPOVER MENU */}
              {showSettings && (
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 290,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 16,
                  }}
                  role="dialog"
                  aria-label="Painel de Ajustes de Exibição"
                >
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                    <Settings2 size={16} style={{ color: 'var(--primary)' }} /> Ajustes Visuais & Acessibilidade
                  </div>

                  {/* Text Size Section */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Tamanho do Texto (WCAG): <strong style={{ color: 'var(--primary)' }}>{fontSizePercentage}%</strong>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                      {[1, 1.25, 1.5, 1.75, 2].map((scale) => (
                        <button
                          key={scale}
                          className={`btn ${fontSizeMultiplier === scale ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '6px 0', fontSize: 10, fontWeight: 700 }}
                          onClick={() => setFontSizeMultiplier(scale)}
                        >
                          {Math.round(scale * 100)}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Selector Section */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Tema Visual:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <button
                        className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 4px', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        onClick={() => setTheme('light')}
                      >
                        <Sun size={12} /> Claro
                      </button>
                      <button
                        className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 4px', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        onClick={() => setTheme('dark')}
                      >
                        <Moon size={12} /> Escuro
                      </button>
                      <button
                        className={`btn ${theme === 'high-contrast' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 4px', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        onClick={() => setTheme('high-contrast')}
                      >
                        <Eye size={12} /> Contraste
                      </button>
                    </div>
                  </div>

                  {/* Admin Simulation Section */}
                  {currentUser.role === 'ADMIN' && (
                    <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <label htmlFor="pop-sim-select" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Simular Perfil de Usuário:
                      </label>
                      <select
                        id="pop-sim-select"
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        value={currentUser.id}
                        onChange={handleRoleChange}
                      >
                        {allUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>{currentUser.name}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                <span className={`badge badge-${currentUser.role.toLowerCase()}`} style={{ fontSize: 10 }}>
                  {currentUser.role === 'STUDENT' && 'Aluno'}
                  {currentUser.role === 'INSTRUCTOR' && 'Professor'}
                  {currentUser.role === 'ADMIN' && 'Administrador'}
                  {currentUser.role === 'MAINTENANCE' && 'Suporte'}
                  {currentUser.role === 'GUARDIAN' && 'Responsável'}
                </span>
              </div>
            </div>

            {/* Avatar Button */}
            <button
              onClick={onProfileClick}
              style={{
                width: '42px', height: '42px', borderRadius: 'var(--radius-full)',
                backgroundColor: currentUser.role === 'ADMIN' ? 'var(--danger)' : currentUser.role === 'INSTRUCTOR' ? 'var(--accent)' : currentUser.role === 'MAINTENANCE' ? 'var(--warning)' : 'var(--primary)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', fontSize: '1.1rem', border: '2px solid var(--border)',
                cursor: 'pointer', padding: 0, transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
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
              title="Acessar Meu Perfil"
            >
              {currentUser.name[0]}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label="Sair da conta"
              title="Sair da Plataforma"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
