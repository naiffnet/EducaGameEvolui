import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  Edit3, 
  Users, 
  Settings, 
  Terminal,
  User,
  GraduationCap,
  ClipboardCheck,
  Swords,
  DollarSign,
  MessageSquare,
  Building2,
  ShoppingBag,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
  ShieldCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupId: string;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  items: NavItem[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  activeTab, 
  setActiveTab, 
  children 
}) => {
  const { currentUser } = useAuth();
  const { config } = useSystem();

  // Track collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Track collapsed sidebar mode (icon-only vs full menu)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('lms_sidebar_collapsed') === 'true';
  });

  if (!currentUser) return <>{children}</>;

  const role = currentUser.role;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('lms_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case 'STUDENT':
        return [
          {
            groupId: 'student-main',
            title: 'Espaço do Aluno',
            icon: <GraduationCap size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'dashboard', label: 'Início & RPG', icon: <LayoutDashboard size={17} /> },
              { id: 'home', label: 'Catálogo de Cursos', icon: <BookOpen size={17} /> },
              { id: 'boss-fight', label: 'Boss Fight da Turma', icon: <Swords size={17} style={{ color: 'var(--danger)' }} /> },
              { id: 'student-shop', label: 'Loja de Recompensas', icon: <ShoppingBag size={17} style={{ color: 'var(--warning)' }} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
            ]
          },
          {
            groupId: 'student-support',
            title: 'Comunicação & Suporte',
            icon: <MessageSquare size={15} />,
            accentColor: 'var(--accent)',
            items: [
              { id: 'direct-messages', label: 'Mensagens Diretas', icon: <MessageSquare size={17} /> },
              { id: 'support-center', label: 'Ouvidoria & Denúncia', icon: <LifeBuoy size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'profile', label: 'Meu Perfil RPG', icon: <User size={17} /> },
            ]
          }
        ];

      case 'INSTRUCTOR':
        return [
          {
            groupId: 'instructor-teaching',
            title: 'Gestão Pedagógica',
            icon: <GraduationCap size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'gradebook', label: 'Diário de Classe & Notas', icon: <ClipboardCheck size={17} /> },
              { id: 'attendance', label: 'Frequência & Presença', icon: <Users size={17} /> },
              { id: 'user-management', label: 'Gestão de Alunos', icon: <Users size={17} /> },
              { id: 'academic-record', label: 'Histórico Escolar', icon: <BookOpen size={17} /> },
            ]
          },
          {
            groupId: 'instructor-creation',
            title: 'Cursos & Missões',
            icon: <Swords size={15} />,
            accentColor: 'var(--warning)',
            items: [
              { id: 'course-editor', label: 'Editor de Cursos', icon: <Edit3 size={17} /> },
              { id: 'mission-editor', label: 'Editor de Missões', icon: <Swords size={17} /> },
              { id: 'boss-fight', label: 'Boss Fight da Turma', icon: <Swords size={17} style={{ color: 'var(--danger)' }} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
            ]
          },
          {
            groupId: 'instructor-support',
            title: 'Comunicação & Sistema',
            icon: <MessageSquare size={15} />,
            accentColor: 'var(--success)',
            items: [
              { id: 'direct-messages', label: 'Mensagens Diretas', icon: <MessageSquare size={17} /> },
              { id: 'support-center', label: 'Central de Ouvidoria', icon: <LifeBuoy size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      case 'COORDINATOR':
      case 'DIRECTOR':
        return [
          {
            groupId: 'coord-academic',
            title: 'Coordenação Escolar',
            icon: <Building2 size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'user-management', label: 'Gestão de Usuários', icon: <Users size={17} /> },
              { id: 'academic-record', label: 'Prontuário Pedagógico', icon: <BookOpen size={17} /> },
              { id: 'gradebook', label: 'Visão Geral de Notas', icon: <ClipboardCheck size={17} /> },
              { id: 'attendance', label: 'Relatório de Frequência', icon: <Users size={17} /> },
            ]
          },
          {
            groupId: 'coord-financial',
            title: 'Financeiro & Gestão',
            icon: <DollarSign size={15} />,
            accentColor: 'var(--success)',
            items: [
              { id: 'financial', label: 'Módulo Financeiro', icon: <DollarSign size={17} /> },
              { id: 'course-editor', label: 'Grade Curricular', icon: <Edit3 size={17} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
            ]
          },
          {
            groupId: 'coord-support',
            title: 'Ouvidoria & Suporte',
            icon: <LifeBuoy size={15} />,
            accentColor: 'var(--warning)',
            items: [
              { id: 'support-center', label: 'Gestão de Ouvidoria', icon: <LifeBuoy size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'direct-messages', label: 'Mensagens Diretas', icon: <MessageSquare size={17} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      case 'ADMIN':
        return [
          {
            groupId: 'admin-main',
            title: 'Administração Geral',
            icon: <ShieldCheck size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'user-management', label: 'Gestão de Usuários', icon: <Users size={17} /> },
              { id: 'academic-record', label: 'Histórico dos Alunos', icon: <BookOpen size={17} /> },
              { id: 'gradebook', label: 'Diário de Classe', icon: <ClipboardCheck size={17} /> },
              { id: 'attendance', label: 'Frequência Escolar', icon: <Users size={17} /> },
              { id: 'financial', label: 'Gestão Financeira', icon: <DollarSign size={17} /> },
            ]
          },
          {
            groupId: 'admin-courses',
            title: 'Conteúdo & Gameficação',
            icon: <Gamepad2 size={15} />,
            accentColor: 'var(--warning)',
            items: [
              { id: 'course-editor', label: 'Editor de Cursos', icon: <Edit3 size={17} /> },
              { id: 'mission-editor', label: 'Editor de Missões', icon: <Swords size={17} /> },
              { id: 'boss-fight', label: 'Boss Fight da Turma', icon: <Swords size={17} style={{ color: 'var(--danger)' }} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
            ]
          },
          {
            groupId: 'admin-system',
            title: 'Suporte & Manutenção',
            icon: <Terminal size={15} />,
            accentColor: 'var(--success)',
            items: [
              { id: 'direct-messages', label: 'Mensagens Diretas', icon: <MessageSquare size={17} /> },
              { id: 'support-center', label: 'Central de Ouvidoria', icon: <LifeBuoy size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'system-logs', label: 'Logs & Status', icon: <Terminal size={17} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      case 'GUARDIAN':
        return [
          {
            groupId: 'family-main',
            title: 'Acompanhamento Familiar',
            icon: <Users size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'family-portal', label: 'Portal da Família', icon: <Users size={17} /> },
              { id: 'home', label: 'Catálogo de Cursos', icon: <BookOpen size={17} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      case 'MAINTENANCE':
        return [
          {
            groupId: 'maintenance-main',
            title: 'Manutenção do Sistema',
            icon: <Settings size={15} />,
            accentColor: 'var(--warning)',
            items: [
              { id: 'maintenance-status', label: 'Status do Sistema', icon: <Settings size={17} /> },
              { id: 'system-logs', label: 'Logs do Sistema', icon: <Terminal size={17} /> },
              { id: 'home', label: 'Visualizar Catálogo', icon: <BookOpen size={17} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      default:
        return [];
    }
  };

  const groups = getNavGroups();

  return (
    <div className={`dashboard-grid ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <aside 
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderRight: '1px solid var(--border)',
          padding: isSidebarCollapsed ? '16px 8px' : '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          overflowY: 'auto',
          transition: 'all 0.25s ease'
        }}
        aria-label="Menu Lateral de Navegação"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Contracting School Sidebar Logo/Branding Banner & Toggle */}
          <div style={{
            padding: isSidebarCollapsed ? '8px 4px' : '12px 14px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            gap: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            {!isSidebarCollapsed ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  {config.schoolLogoUrl ? (
                    <img
                      src={config.schoolLogoUrl}
                      alt={config.schoolName || 'Escola Contratante'}
                      style={{ height: 32, width: 'auto', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem'
                    }}>
                      🏫
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {config.schoolName || 'Colégio Evoluir & Saber'}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--primary)', fontWeight: 700 }}>
                      Plataforma Contratada
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="btn btn-secondary"
                  style={{ padding: '6px', width: 28, height: 28, minWidth: 28, borderRadius: 'var(--radius-sm)' }}
                  title="Recolher Menu (Modo Apenas Ícones)"
                >
                  <ChevronLeft size={16} />
                </button>
              </>
            ) : (
              <div className="nav-tooltip-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="btn btn-primary"
                  style={{ padding: '6px', width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Expandir Menu Lateral"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="nav-tooltip">
                  Expandir Menu ({config.schoolName || 'Escola'})
                </div>
              </div>
            )}
          </div>

          {groups.map(group => {
            const isCollapsed = !!collapsedGroups[group.groupId];

            if (isSidebarCollapsed) {
              return (
                <div key={group.groupId} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  {group.items.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <div key={item.id} className="nav-tooltip-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`nav-link ${isActive ? 'active' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-md)',
                            background: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                            color: isActive ? '#fff' : 'var(--text-primary)',
                            border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isActive ? '0 4px 12px rgba(139,92,246,0.3)' : 'none',
                          }}
                        >
                          {item.icon}
                        </button>
                        <div className="nav-tooltip">
                          {item.label}
                          {item.badge && <span style={{ marginLeft: 6, color: 'var(--accent)', fontWeight: 800 }}>({item.badge})</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div 
                key={group.groupId}
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.groupId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 4px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 24, 
                        height: 24, 
                        borderRadius: 'var(--radius-sm)', 
                        background: `${group.accentColor}22`,
                        color: group.accentColor,
                        flexShrink: 0
                      }}
                    >
                      {group.icon}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {group.title}
                    </span>
                  </div>

                  <span style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: 4 }}>
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </span>
                </button>

                {!isCollapsed && (
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    {group.items.map(item => {
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`nav-link ${isActive ? 'active' : ''}`}
                          aria-current={isActive ? 'page' : undefined}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            fontSize: '0.86rem',
                            fontWeight: isActive ? 800 : 600,
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: isActive ? `3px solid ${group.accentColor}` : '3px solid transparent',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            {item.icon}
                            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {item.label}
                            </span>
                          </div>

                          {item.badge && (
                            <span 
                              className="badge" 
                              style={{ 
                                fontSize: 9, 
                                padding: '2px 6px',
                                background: item.badgeColor ? `${item.badgeColor}22` : 'var(--primary-glow)',
                                color: item.badgeColor || 'var(--primary)',
                                border: `1px solid ${item.badgeColor || 'var(--primary)'}`
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info inside Sidebar */}
        {!isSidebarCollapsed ? (
          <div 
            style={{ 
              marginTop: '24px',
              padding: '12px 14px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              fontSize: '0.78rem',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <div 
              style={{ 
                width: 10, 
                height: 10, 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 8px var(--success)',
                flexShrink: 0
              }} 
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 11, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {config.schoolName || 'EducaGame Evolui'}
              </div>
              <div style={{ fontSize: 10 }}>Plataforma Interativa v{config.systemVersion}</div>
            </div>
          </div>
        ) : (
          <div className="nav-tooltip-container" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <div 
              style={{ 
                width: 12, 
                height: 12, 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 8px var(--success)'
              }} 
            />
            <div className="nav-tooltip">
              Sistema Operacional (v{config.systemVersion})
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Viewport */}
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};
