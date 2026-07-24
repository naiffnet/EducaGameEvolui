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
import { Financial } from './pages/Admin/Financial';
import { Attendance } from './pages/Instructor/Attendance';
import { MissionEditor } from './pages/Instructor/MissionEditor';
import { MissionBoard } from './components/MissionBoard';
import { DirectMessaging } from './components/DirectMessaging';
import { FamilyPortal } from './pages/Guardian/FamilyPortal';
import { PedagogicalDashboard } from './pages/Management/PedagogicalDashboard';
import { SkillTree } from './components/SkillTree';
import { InventoryShop } from './components/InventoryShop';
import { ClassBossFight } from './components/ClassBossFight';
import { GamificationManual } from './components/GamificationManual';
import { SupportCenter } from './components/SupportCenter';
import { SystemStatus } from './pages/Maintenance/SystemStatus';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { LevelUpModal } from './components/LevelUpModal';
import { ToastProvider } from './components/EvolutionToast';
import { getStatGainForLevelUp } from './engine/EvolutionEngine';

const AppContent: React.FC = () => {
  const { currentUser, dailyLeveledUp, setDailyLeveledUp, initializing } = useAuth();
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
      } else if (currentUser.role === 'GUARDIAN') {
        setActiveTab('family-portal');
      } else if (currentUser.role === 'COORDINATOR' || currentUser.role === 'DIRECTOR') {
        setActiveTab('pedagogical-dashboard');
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
      
      case 'family-portal':
        return <FamilyPortal />;

      case 'pedagogical-dashboard':
        return <PedagogicalDashboard />;

      case 'skill-tree':
        return <SkillTree />;

      case 'inventory-shop':
        return <InventoryShop />;

      case 'boss-fight':
        return <ClassBossFight />;

      case 'gamification-manual':
        return <GamificationManual />;

      case 'support-center':
        return <SupportCenter />;

      case 'instructor-dashboard':
      case 'admin-dashboard':
        return <AdminDashboard />;
        
      case 'course-editor':
        return <CourseEditor />;
        
      case 'user-management':
        return <UserManagement />;

      case 'grade-book':
        return <GradeBook />;

      case 'financial':
        return <Financial />;

      case 'direct-messages':
        return <DirectMessaging />;

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

  if (initializing) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>
        <h2>Carregando plataforma de ensino...</h2>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
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
