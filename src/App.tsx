import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { Header } from './components/Header';
import { MaintenanceGuard } from './components/MaintenanceGuard';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Home } from './pages/Student/Home';
import { CoursePlayer } from './pages/Student/CoursePlayer';
import { AcademicHistory } from './pages/Student/AcademicHistory';
import { Dashboard as AdminDashboard } from './pages/Admin/Dashboard';
import { CourseEditor } from './pages/Admin/CourseEditor';
import { UserManagement } from './pages/Admin/UserManagement';
import { GradeBook } from './pages/Admin/GradeBook';
import { Attendance } from './pages/Instructor/Attendance';
import { MissionEditor } from './pages/Instructor/MissionEditor';
import { MissionBoard } from './components/MissionBoard';
import { SystemStatus } from './pages/Maintenance/SystemStatus';
import { Profile } from './pages/Profile';
import { LevelUpModal } from './components/LevelUpModal';
import { ToastProvider } from './components/EvolutionToast';
import { getStatGainForLevelUp } from './engine/EvolutionEngine';

const AppContent: React.FC = () => {
  const { currentUser, dailyLeveledUp, setDailyLeveledUp } = useAuth();
  const [levelUpChar, setLevelUpChar] = useState<{ char: any; stats: any } | null>(null);
  
  // Show level up modal when daily check detects a level up
  // Note: the actual level up was already processed by AuthContext.runDailyCheck
  // We just show the modal with the current character state and stat gains
  useEffect(() => {
    if (dailyLeveledUp && currentUser?.rpgCharacter) {
      setLevelUpChar({
        char: currentUser.rpgCharacter,
        stats: getStatGainForLevelUp(currentUser.rpgCharacter.selectedClass)
      });
      setDailyLeveledUp(false);
    }
  }, [dailyLeveledUp, currentUser]);
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // When user profile switches, auto-route to a valid tab for that user role
  useEffect(() => {
    if (currentUser) {
      // Clear course player context on switch
      setSelectedCourseId(null);

      // Default redirect based on role privileges
      if (currentUser.role === 'MAINTENANCE') {
        setActiveTab('maintenance-status');
      } else {
        setActiveTab('home');
      }
    }
  }, [currentUser?.role]);

  // Main page routing logic depending on the activeTab
  const renderTabContent = () => {
    if (selectedCourseId) {
      return (
        <CoursePlayer 
          courseId={selectedCourseId} 
          onBack={() => setSelectedCourseId(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <Home onSelectCourse={(id) => setSelectedCourseId(id)} />;
      
      case 'instructor-dashboard':
      case 'admin-dashboard':
        return <AdminDashboard />;
        
      case 'course-editor':
        return <CourseEditor />;
        
      case 'user-management':
        return <UserManagement />;

      case 'grade-book':
        return <GradeBook />;

      case 'attendance':
        return <Attendance />;

      case 'mission-editor':
        return <MissionEditor />;

      case 'mission-board':
        return <MissionBoard />;
        
      case 'academic-history':
        return <AcademicHistory />;
        
      case 'maintenance-status':
      case 'system-logs':
        return <SystemStatus />;
        
      case 'profile':
        return <Profile />;
        
      default:
        return <Home onSelectCourse={(id) => setSelectedCourseId(id)} />;
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
        <h2>Carregando plataforma de ensino...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Structural Accessible Skip Link */}
      <a href="#main-content" className="sr-only" style={{ display: 'block', padding: '10px', background: 'var(--primary)', color: '#fff', textAlign: 'center' }}>
        Pular para o conteúdo principal
      </a>

      <Header onProfileClick={() => { setSelectedCourseId(null); setActiveTab('profile'); }} />
      
      <MaintenanceGuard>
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderTabContent()}
        </DashboardLayout>
      </MaintenanceGuard>

      {/* Level Up Modal */}
      {levelUpChar && (
        <LevelUpModal
          character={levelUpChar.char}
          statsGained={levelUpChar.stats}
          onClose={() => setLevelUpChar(null)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </SystemProvider>
    </AuthProvider>
  );
}

export default App;
