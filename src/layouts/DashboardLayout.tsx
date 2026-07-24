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
  Award,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
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

  // Track collapsed groups (default: all expanded for quick access)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  if (!currentUser) return <>{children}</>;

  const role = currentUser.role;

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Build categorized navigation groups based on user role
  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case 'STUDENT':
        return [
          {
            groupId: 'student-academic',
            title: 'Aprendizado & Cursos',
            icon: <BookOpen size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'home', label: 'Meus Cursos', icon: <BookOpen size={17} /> },
              { id: 'academic-history', label: 'Histórico Escolar', icon: <GraduationCap size={17} /> },
            ]
          },
          {
            groupId: 'student-rpg',
            title: 'Gamificação & Evolução',
            icon: <Gamepad2 size={15} />,
            accentColor: 'var(--accent)',
            items: [
              { id: 'mission-board', label: 'Quadro de Missões', icon: <Swords size={17} /> },
              { id: 'skill-tree', label: 'Habilidades RPG', icon: <Award size={17} /> },
              { id: 'boss-fight', label: 'Boss Fight da Turma', icon: <Swords size={17} style={{ color: 'var(--danger)' }} />, badge: 'TURMA', badgeColor: 'var(--danger)' },
              { id: 'inventory-shop', label: 'Loja de Recompensas', icon: <ShoppingBag size={17} style={{ color: 'var(--accent)' }} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
            ]
          },
          {
            groupId: 'student-support',
            title: 'Atendimento & Ouvidoria',
            icon: <ShieldCheck size={15} />,
            accentColor: 'var(--success)',
            items: [
              { id: 'support-center', label: 'Apoio & Ouvidoria', icon: <LifeBuoy size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      case 'INSTRUCTOR':
        return [
          {
            groupId: 'instructor-class',
            title: 'Gestão de Sala & Turmas',
            icon: <LayoutDashboard size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'instructor-dashboard', label: 'Painel do Instrutor', icon: <LayoutDashboard size={17} /> },
              { id: 'attendance', label: 'Diário de Chamada', icon: <ClipboardCheck size={17} /> },
              { id: 'grade-book', label: 'Livro de Notas', icon: <GraduationCap size={17} /> },
            ]
          },
          {
            groupId: 'instructor-content',
            title: 'Conteúdos & Missões',
            icon: <BookOpen size={15} />,
            accentColor: 'var(--accent)',
            items: [
              { id: 'home', label: 'Catálogo de Cursos', icon: <BookOpen size={17} /> },
              { id: 'course-editor', label: 'Editor de Cursos', icon: <Edit3 size={17} /> },
              { id: 'mission-editor', label: 'Editor de Missões', icon: <Swords size={17} /> },
              { id: 'boss-fight', label: 'Boss Fight da Turma', icon: <Swords size={17} style={{ color: 'var(--danger)' }} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
            ]
          },
          {
            groupId: 'instructor-communication',
            title: 'Comunicação & Suporte',
            icon: <MessageSquare size={15} />,
            accentColor: 'var(--success)',
            items: [
              { id: 'direct-messages', label: 'Mensagens Diretas', icon: <MessageSquare size={17} /> },
              { id: 'support-center', label: 'Apoio & Ouvidoria', icon: <LifeBuoy size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      case 'COORDINATOR':
      case 'DIRECTOR':
        return [
          {
            groupId: 'management-executive',
            title: 'Gestão Executiva Escolar',
            icon: <Building2 size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'pedagogical-dashboard', label: 'Painel Executivo', icon: <Building2 size={17} /> },
              { id: 'user-management', label: 'Alunos e Turmas', icon: <Users size={17} /> },
              { id: 'grade-book', label: 'Boletins & Notas', icon: <GraduationCap size={17} /> },
              { id: 'financial', label: 'Financeiro Escolar', icon: <DollarSign size={17} /> },
              { id: 'gamification-manual', label: 'Manual Pedagógico', icon: <BookOpen size={17} style={{ color: 'var(--primary)' }} /> },
            ]
          },
          {
            groupId: 'management-support',
            title: 'Atendimento & Ouvidoria',
            icon: <ShieldCheck size={15} />,
            accentColor: 'var(--success)',
            items: [
              { id: 'support-center', label: 'Central de Ouvidoria', icon: <LifeBuoy size={17} style={{ color: 'var(--primary)' }} /> },
              { id: 'profile', label: 'Meu Perfil', icon: <User size={17} /> },
            ]
          }
        ];

      case 'ADMIN':
        return [
          {
            groupId: 'admin-management',
            title: 'Gestão Geral da Escola',
            icon: <Building2 size={15} />,
            accentColor: 'var(--primary)',
            items: [
              { id: 'pedagogical-dashboard', label: 'Painel da Coordenação', icon: <Building2 size={17} /> },
              { id: 'admin-dashboard', label: 'Painel do Admin', icon: <LayoutDashboard size={17} /> },
              { id: 'user-management', label: 'Gerenciar Usuários', icon: <Users size={17} /> },
              { id: 'grade-book', label: 'Livro de Notas', icon: <GraduationCap size={17} /> },
              { id: 'financial', label: 'Financeiro Escolar', icon: <DollarSign size={17} /> },
            ]
          },
          {
            groupId: 'admin-content',
            title: 'Conteúdos & Gamificação',
            icon: <Gamepad2 size={15} />,
            accentColor: 'var(--accent)',
            items: [
              { id: 'home', label: 'Visualizar Catálogo', icon: <BookOpen size={17} /> },
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
    <div className="dashboard-grid">
      {/* Sidebar Navigation */}
      <aside 
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderRight: '1px solid var(--border)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          overflowY: 'auto'
        }}
        aria-label="Menu Lateral de Navegação"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {groups.map(group => {
            const isCollapsed = !!collapsedGroups[group.groupId];

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
                {/* Sleek Category Accordion Header */}
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

                {/* Submenu Nav Items */}
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
      </aside>

      {/* Main Content Viewport */}
      <main style={{ padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};
