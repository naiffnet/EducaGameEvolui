import React from 'react';
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
  ClipboardCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  activeTab, 
  setActiveTab, 
  children 
}) => {
  const { currentUser } = useAuth();
  const { config } = useSystem();

  if (!currentUser) return <>{children}</>;

  const role = currentUser.role;

  // Determine which links are visible based on user role
  const renderNavLinks = () => {
    switch (role) {
      case 'STUDENT':
        return (
          <>
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              aria-current={activeTab === 'home' ? 'page' : undefined}
            >
              <BookOpen size={18} />
              <span>Meus Cursos</span>
            </button>
            <button
              onClick={() => setActiveTab('academic-history')}
              className={`nav-link ${activeTab === 'academic-history' ? 'active' : ''}`}
              aria-current={activeTab === 'academic-history' ? 'page' : undefined}
            >
              <GraduationCap size={18} />
              <span>Histórico Escolar</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              <User size={18} />
              <span>Meu Perfil</span>
            </button>
          </>
        );

      case 'INSTRUCTOR':
        return (
          <>
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              aria-current={activeTab === 'home' ? 'page' : undefined}
            >
              <BookOpen size={18} />
              <span>Visualizar Catálogo</span>
            </button>
            <button
              onClick={() => setActiveTab('instructor-dashboard')}
              className={`nav-link ${activeTab === 'instructor-dashboard' ? 'active' : ''}`}
              aria-current={activeTab === 'instructor-dashboard' ? 'page' : undefined}
            >
              <LayoutDashboard size={18} />
              <span>Painel do Instrutor</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`}
              aria-current={activeTab === 'attendance' ? 'page' : undefined}
            >
              <ClipboardCheck size={18} />
              <span>Chamada</span>
            </button>
            <button
              onClick={() => setActiveTab('course-editor')}
              className={`nav-link ${activeTab === 'course-editor' ? 'active' : ''}`}
              aria-current={activeTab === 'course-editor' ? 'page' : undefined}
            >
              <Edit3 size={18} />
              <span>Editor de Cursos</span>
            </button>
            <button
              onClick={() => setActiveTab('grade-book')}
              className={`nav-link ${activeTab === 'grade-book' ? 'active' : ''}`}
              aria-current={activeTab === 'grade-book' ? 'page' : undefined}
            >
              <GraduationCap size={18} />
              <span>Livro de Notas</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              <User size={18} />
              <span>Meu Perfil</span>
            </button>
          </>
        );

      case 'ADMIN':
        return (
          <>
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              aria-current={activeTab === 'home' ? 'page' : undefined}
            >
              <BookOpen size={18} />
              <span>Visualizar Catálogo</span>
            </button>
            <button
              onClick={() => setActiveTab('admin-dashboard')}
              className={`nav-link ${activeTab === 'admin-dashboard' ? 'active' : ''}`}
              aria-current={activeTab === 'admin-dashboard' ? 'page' : undefined}
            >
              <LayoutDashboard size={18} />
              <span>Painel do Admin</span>
            </button>
            <button
              onClick={() => setActiveTab('course-editor')}
              className={`nav-link ${activeTab === 'course-editor' ? 'active' : ''}`}
              aria-current={activeTab === 'course-editor' ? 'page' : undefined}
            >
              <Edit3 size={18} />
              <span>Editor de Cursos</span>
            </button>
            <button
              onClick={() => setActiveTab('user-management')}
              className={`nav-link ${activeTab === 'user-management' ? 'active' : ''}`}
              aria-current={activeTab === 'user-management' ? 'page' : undefined}
            >
              <Users size={18} />
              <span>Gerenciar Usuários</span>
            </button>
            <button
              onClick={() => setActiveTab('grade-book')}
              className={`nav-link ${activeTab === 'grade-book' ? 'active' : ''}`}
              aria-current={activeTab === 'grade-book' ? 'page' : undefined}
            >
              <GraduationCap size={18} />
              <span>Livro de Notas</span>
            </button>
            <button
              onClick={() => setActiveTab('system-logs')}
              className={`nav-link ${activeTab === 'system-logs' ? 'active' : ''}`}
              aria-current={activeTab === 'system-logs' ? 'page' : undefined}
            >
              <Terminal size={18} />
              <span>Logs & Manutenção</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              <User size={18} />
              <span>Meu Perfil</span>
            </button>
          </>
        );

      case 'MAINTENANCE':
        return (
          <>
            <button
              onClick={() => setActiveTab('maintenance-status')}
              className={`nav-link ${activeTab === 'maintenance-status' ? 'active' : ''}`}
              aria-current={activeTab === 'maintenance-status' ? 'page' : undefined}
            >
              <Settings size={18} />
              <span>Status do Sistema</span>
            </button>
            <button
              onClick={() => setActiveTab('system-logs')}
              className={`nav-link ${activeTab === 'system-logs' ? 'active' : ''}`}
              aria-current={activeTab === 'system-logs' ? 'page' : undefined}
            >
              <Terminal size={18} />
              <span>Logs do Sistema</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              aria-current={activeTab === 'home' ? 'page' : undefined}
            >
              <BookOpen size={18} />
              <span>Visualizar Catálogo</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              <User size={18} />
              <span>Meu Perfil</span>
            </button>
          </>
        );

      default:
        return null;
    }
  };

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
          height: '100%'
        }}
        aria-label="Menu Lateral de Navegação"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '16px' }}>
              Menu Navegação
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {renderNavLinks()}
            </nav>
          </div>
        </div>

        {/* User Info footer in sidebar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '0 12px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>Versão da Plataforma</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
              v{config.systemVersion}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        style={{ 
          padding: '40px 24px', 
          overflowY: 'auto', 
          backgroundColor: 'var(--bg-primary)',
          minHeight: '100vh'
        }}
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
};
