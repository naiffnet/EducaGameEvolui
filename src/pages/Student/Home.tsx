import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { db } from '../../db/database';
import type { Course, User, RpgClass } from '../../types';
import { RpgAvatar } from '../../components/RpgAvatar';
import { CharacterCreator } from '../../components/CharacterCreator';
import { 
  Search, 
  GraduationCap, 
  Clock, 
  BookOpen, 
  MessageSquare,
  Trophy,
  HelpCircle,
  Zap,
  Shield,
  Sword
} from 'lucide-react';

interface HomeProps {
  onSelectCourse: (courseId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectCourse }) => {
  const { currentUser, refreshUser } = useAuth();
  const { addLog } = useSystem();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterEnrolled, setFilterEnrolled] = useState(false);
  const [selectedYearRange, setSelectedYearRange] = useState<string>('All');
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'evolution'>('catalog');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    setCourses(db.getCourses());
    setAllUsers(db.getUsers());
  }, []);

  const handleSelectClass = (selectedClass: RpgClass) => {
    if (!currentUser) return;
    
    const rpgCharacter = {
      selectedClass,
      level: 1,
      xp: 0,
      unlockedSkills: [
        selectedClass === 'MAGE' ? 'Alquimia das Cores' :
        selectedClass === 'WARRIOR' ? 'Espada de Funções' : 'Visão WCAG'
      ],
      stats: {
        strength: selectedClass === 'WARRIOR' ? 28 : selectedClass === 'RANGER' ? 10 : 8,
        intelligence: selectedClass === 'MAGE' ? 24 : selectedClass === 'RANGER' ? 14 : 12,
        dexterity: selectedClass === 'RANGER' ? 26 : selectedClass === 'WARRIOR' ? 16 : 14
      }
    };
    
    const updated = {
      ...currentUser,
      rpgCharacter
    };
    
    db.updateUser(updated);
    refreshUser();
    
    addLog(
      'Escolha de Classe',
      `Estudante escolheu a classe de RPG: ${selectedClass}`,
      'success'
    );
  };

  const handleEnroll = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser };
    if (!updatedUser.enrolledCourses.includes(courseId)) {
      updatedUser.enrolledCourses.push(courseId);
      db.updateUser(updatedUser);
      refreshUser();
      
      const courseName = courses.find(c => c.id === courseId)?.title || courseId;
      addLog(
        'Matrícula em Curso',
        `Estudante matriculou-se no curso: ${courseName}`
      );
    }
  };

  const getCourseProgress = (course: Course) => {
    if (!currentUser) return 0;
    
    let totalLessons = 0;
    let completedLessonsCount = 0;

    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalLessons++;
        if (currentUser.completedLessons.includes(lesson.id)) {
          completedLessonsCount++;
        }
      });
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedLessonsCount / totalLessons) * 100);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    
    // Simulate matching "Year Range" (Year Level filter) from image
    let matchesYear = true;
    if (selectedYearRange !== 'All') {
      if (selectedYearRange === 'Year 7-9' && course.difficulty !== 'Iniciante') matchesYear = false;
      if (selectedYearRange === 'Year 10-11' && course.difficulty !== 'Intermediário') matchesYear = false;
      if (selectedYearRange === 'Year 12-13' && course.difficulty !== 'Avançado') matchesYear = false;
      if (selectedYearRange === 'Year 14-15') matchesYear = true; // matches all
      if (selectedYearRange === 'Year 16-17') matchesYear = true; // matches all
    }

    const isEnrolled = currentUser?.enrolledCourses.includes(course.id);
    const matchesEnrollment = !filterEnrolled || isEnrolled;

    return matchesSearch && matchesCategory && matchesYear && matchesEnrollment;
  });

  // Get distinct categories
  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  // Simulated study stats

  if (currentUser?.role === 'STUDENT' && !currentUser.rpgCharacter?.selectedClass) {
    return <CharacterCreator onSelectClass={handleSelectClass} />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      
      {/* ONBOARDING HERO BANNER: Inspired by the image "Let's Learn With Lots Of Fun!" */}
      <div className="hero-card" style={{ marginBottom: '32px' }}>
        <div style={{ maxWidth: '600px' }}>
          <span 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              color: '#ffffff', 
              padding: '6px 16px', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.75rem', 
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px',
              display: 'inline-block'
            }}
          >
            Acessibilidade & Acolhimento
          </span>
          <h2 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '16px', fontWeight: '800', lineHeight: '1.2' }}>
            Let's Learn With Lots Of Fun!
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', margin: 0 }}>
            Aprender com diversão e inclusão é o nosso lema. Explore novos conhecimentos de forma lúdica, responsiva e com total acessibilidade!
          </p>
        </div>

        {/* Big Yellow Interactive Go button from mockup */}
        <div>
          <button 
            className="btn" 
            style={{ 
              backgroundColor: 'var(--accent)', 
              color: '#000000', 
              width: '80px', 
              height: '80px', 
              borderRadius: 'var(--radius-full)',
              fontSize: '1.2rem',
              fontWeight: '800',
              border: 'none',
              boxShadow: '0 8px 20px rgba(255, 183, 39, 0.4)',
              cursor: 'pointer',
              transition: 'transform var(--transition-fast)'
            }}
            onClick={() => {
              setActiveSubTab('catalog');
              document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Ir para catálogo de cursos"
          >
            Go
          </button>
        </div>
      </div>

      {/* TABS: Catalog vs Evolution */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '2px solid var(--border)', 
          marginBottom: '32px',
          gap: '8px'
        }}
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={activeSubTab === 'catalog'}
          aria-controls="catalog-tab-panel"
          id="tab-catalog"
          className="btn"
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'catalog' ? '4px solid var(--primary)' : '4px solid transparent',
            color: activeSubTab === 'catalog' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '800',
            borderRadius: 0,
            fontSize: '1.1rem'
          }}
          onClick={() => setActiveSubTab('catalog')}
        >
          <BookOpen size={18} /> Catálogo de Cursos
        </button>
        
        {currentUser && (
          <button
            role="tab"
            aria-selected={activeSubTab === 'evolution'}
            aria-controls="evolution-tab-panel"
            id="tab-evolution"
            className="btn"
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeSubTab === 'evolution' ? '4px solid var(--primary)' : '4px solid transparent',
              color: activeSubTab === 'evolution' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '800',
              borderRadius: 0,
              fontSize: '1.1rem'
            }}
            onClick={() => setActiveSubTab('evolution')}
          >
            <Trophy size={18} style={{ color: 'var(--accent)' }} /> Minha Evolução & Feedbacks
          </button>
        )}
      </div>

      {/* CATALOG VIEW */}
      {activeSubTab === 'catalog' && (
        <div id="catalog-tab-panel" role="tabpanel" aria-labelledby="tab-catalog">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '280px 1fr', 
              gap: '32px',
              alignItems: 'start'
            }}
            id="catalog-section"
          >
            {/* Left Sidebar: Levels Pill Inspired Selector from Mockup */}
            <aside aria-label="Níveis escolares e filtros secundários">
              <div className="evolution-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={18} /> Nível Escolar (Filtro)
                </h3>

                <div className="level-container">
                  {[
                    { label: 'Todos os Níveis', val: 'All', cls: 'level-capsule-purple' },
                    { label: 'Year 7-9 (Iniciante)', val: 'Year 7-9', cls: 'level-capsule-green' },
                    { label: 'Year 10-11 (Intermediário)', val: 'Year 10-11', cls: 'level-capsule-blue' },
                    { label: 'Year 12-13 (Avançado)', val: 'Year 12-13', cls: 'level-capsule-coral' },
                    { label: 'Year 14-15 (Superior)', val: 'Year 14-15', cls: 'level-capsule-pink' },
                  ].map((level, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedYearRange(level.val)}
                      className={`level-capsule ${level.cls}`}
                      style={{ 
                        opacity: selectedYearRange === level.val ? 1 : 0.7,
                        transform: selectedYearRange === level.val ? 'scale(1.03)' : 'scale(1)',
                        boxShadow: selectedYearRange === level.val ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        border: selectedYearRange === level.val ? '2px solid #ffffff' : '1px solid transparent'
                      }}
                      aria-label={`Filtrar por nível: ${level.label}`}
                    >
                      <span>{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Side: Filters Bar + Courses Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Category Pills + Search Bar */}
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Search */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="O que você quer aprender hoje? Digite palavras-chave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Buscar cursos"
                  />
                </div>

                {/* Horizontal Category pills exactly like "UI Case Study", "Webflow" pills in mockup */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Categorias:</span>
                  {categories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCategory(cat)}
                      className={`pill-filter ${selectedCategory === cat ? 'active' : ''}`}
                    >
                      {cat === 'All' ? 'Todos' : cat}
                    </button>
                  ))}

                  {/* Enrollment toggle button */}
                  {currentUser && (
                    <button
                      className={`btn ${filterEnrolled ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => setFilterEnrolled(!filterEnrolled)}
                      style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
                      aria-pressed={filterEnrolled}
                    >
                      {filterEnrolled ? 'Ver Todos Cursos' : 'Ver Meus Matriculados'}
                    </button>
                  )}
                </div>
              </div>

              {/* Courses Grid */}
              {filteredCourses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <BookOpen size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
                  <h3>Nenhum curso correspondente</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Ajuste os filtros de busca ou selecione outro Nível Escolar.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
                  {filteredCourses.map((course) => {
                    const isEnrolled = currentUser?.enrolledCourses.includes(course.id);
                    const progress = getCourseProgress(course);

                    return (
                      <div 
                        key={course.id} 
                        className="card"
                        style={{ 
                          cursor: 'pointer', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          height: '100%',
                          padding: 0,
                          overflow: 'hidden',
                          border: '2px solid var(--border)'
                        }}
                        onClick={() => onSelectCourse(course.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onSelectCourse(course.id);
                          }
                        }}
                        aria-label={`Curso ${course.title} ministrado por ${course.instructorName}. Dificuldade: ${course.difficulty}.`}
                      >
                        {/* Course Image */}
                        <div style={{ width: '100%', height: '170px', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={course.image} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(94, 58, 238, 0.95)', color: '#ffffff', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: '800' }}>
                            {course.category}
                          </span>
                        </div>

                        {/* Course Info */}
                        <div style={{ padding: '20px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className="badge badge-student" style={{ fontSize: '0.65rem' }}>{course.difficulty}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {course.modules.length} Módulos
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', lineHeight: '1.3', fontWeight: '800' }}>{course.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {course.description}
                            </p>
                          </div>

                          <div>
                            {isEnrolled ? (
                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
                                  <span style={{ color: 'var(--primary)' }}>Progresso</span>
                                  <span style={{ color: 'var(--text-primary)' }}>{progress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                  <div 
                                    style={{ 
                                      width: `${progress}%`, 
                                      height: '100%', 
                                      backgroundColor: progress === 100 ? 'var(--accent-green)' : 'var(--primary)',
                                      borderRadius: 'var(--radius-full)'
                                    }} 
                                  />
                                </div>
                              </div>
                            ) : (
                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                                <button
                                  className="btn btn-primary"
                                  style={{ width: '100%', fontSize: '0.85rem', backgroundColor: 'var(--primary)' }}
                                  onClick={(e) => handleEnroll(course.id, e)}
                                >
                                  Matricular-se Grátis
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EVOLUTION & FEEDBACKS VIEW */}
      {activeSubTab === 'evolution' && currentUser && (
        <div id="evolution-tab-panel" role="tabpanel" aria-labelledby="tab-evolution">
          
          {/* RPG and Stats Panels Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px', alignItems: 'start', marginBottom: '32px' }}>
            
            {/* Column 1: RPG character sheet */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="evolution-card" style={{ textAlign: 'center', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 12px 0', alignSelf: 'flex-start' }}>
                  Ficha do Herói RPG
                </h3>
                
                {currentUser.rpgCharacter ? (
                  <>
                    <RpgAvatar rpgClass={currentUser.rpgCharacter.selectedClass} level={currentUser.rpgCharacter.level} size={130} />
                    
                    <div style={{ marginTop: '12px' }}>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                        {currentUser.rpgCharacter.selectedClass === 'MAGE' && 'Mago do Design'}
                        {currentUser.rpgCharacter.selectedClass === 'WARRIOR' && 'Guerreiro do Código'}
                        {currentUser.rpgCharacter.selectedClass === 'RANGER' && 'Patrulheiro da Qualidade'}
                      </h4>
                      <p style={{ color: 'var(--primary)', fontWeight: '800', margin: '4px 0 0 0', fontSize: '1.05rem' }}>
                        Nível {currentUser.rpgCharacter.level}
                      </p>
                    </div>

                    {/* XP Progress Bar */}
                    <div style={{ width: '100%', marginTop: '16px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Experiência (XP)</span>
                        <span>{currentUser.rpgCharacter.xp} / {currentUser.rpgCharacter.level * 200} XP</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.min(100, (currentUser.rpgCharacter.xp / (currentUser.rpgCharacter.level * 200)) * 100)}%`, 
                            height: '100%', 
                            backgroundColor: 'var(--accent)',
                            borderRadius: 'var(--radius-full)'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Stats details */}
                    <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Atributos:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                        
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                            <span><Sword size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Força (Lógica)</span>
                            <strong>{currentUser.rpgCharacter.stats.strength}</strong>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)' }}>
                            <div style={{ width: `${Math.min(100, (currentUser.rpgCharacter.stats.strength / 40) * 100)}%`, height: '100%', backgroundColor: 'var(--accent-coral)', borderRadius: 'var(--radius-full)' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                            <span><Zap size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Inteligência (Código)</span>
                            <strong>{currentUser.rpgCharacter.stats.intelligence}</strong>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)' }}>
                            <div style={{ width: `${Math.min(100, (currentUser.rpgCharacter.stats.intelligence / 40) * 100)}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-full)' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                            <span><Shield size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Destreza (Arquitetura)</span>
                            <strong>{currentUser.rpgCharacter.stats.dexterity}</strong>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)' }}>
                            <div style={{ width: `${Math.min(100, (currentUser.rpgCharacter.stats.dexterity / 40) * 100)}%`, height: '100%', backgroundColor: 'var(--accent-green)', borderRadius: 'var(--radius-full)' }} />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Unlocked RPG Skills tree list */}
                    <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Habilidades Aprendidas:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {currentUser.rpgCharacter.unlockedSkills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            style={{ 
                              fontSize: '0.75rem', 
                              backgroundColor: 'var(--primary-glow)', 
                              color: 'var(--primary)', 
                              padding: '4px 10px', 
                              borderRadius: 'var(--radius-full)', 
                              fontWeight: 'bold', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              border: '1px solid rgba(94, 58, 238, 0.2)'
                            }}
                          >
                            ⚡ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p>Carregando dados de RPG...</p>
                )}

              </div>
            </div>

            {/* Column 2: Leaderboard (Mural de Heróis da Turma) */}
            <div className="evolution-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} style={{ color: 'var(--accent)' }} /> Mural de Heróis da Turma (Ranking)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Veja e compare as classes RPG, níveis de aventura e crachás de escoteiro dos seus colegas de turma!
              </p>

              <div className="table-container" style={{ border: 'none', padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Herói / Aluno</th>
                      <th>Classe</th>
                      <th>Nível RPG</th>
                      <th>Conquistas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.filter(u => u.role === 'STUDENT').map((student) => {
                      const char = student.rpgCharacter;
                      return (
                        <tr key={student.id} style={{ backgroundColor: student.id === currentUser.id ? 'var(--primary-glow)' : 'transparent' }}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' }}>
                            <RpgAvatar rpgClass={char?.selectedClass || null} level={char?.level || 1} size={40} />
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.9rem' }}>{student.name}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{student.email}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {char?.selectedClass === 'MAGE' && '🔮 Mago'}
                            {char?.selectedClass === 'WARRIOR' && '⚔️ Guerreiro'}
                            {char?.selectedClass === 'RANGER' && '🏹 Patrulheiro'}
                          </td>
                          <td style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>
                            Lv. {char?.level || 1}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {student.unlockedBadges.slice(0, 3).map((badge, idx) => (
                                <span 
                                  key={idx} 
                                  className="badge" 
                                  style={{ 
                                    fontSize: '0.6rem', 
                                    padding: '2px 6px', 
                                    backgroundColor: 'var(--bg-tertiary)', 
                                    color: 'var(--text-secondary)',
                                    borderRadius: 'var(--radius-sm)'
                                  }}
                                >
                                  {badge}
                                </span>
                              ))}
                              {student.unlockedBadges.length > 3 && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>
                                  +{student.unlockedBadges.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Lower Row: General Achievements & Pedagogical Feedback */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Left Side: General Badges List */}
            <div className="evolution-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Medalhas de Escotismo</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Crachás de progressão conquistados ao concluir trilhas e módulos de estudo.
              </p>
              
              {currentUser.unlockedBadges.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Conclua aulas e passe em exercícios para ganhar crachás!</p>
              ) : (
                <div className="badge-grid" style={{ marginTop: '16px' }}>
                  {currentUser.unlockedBadges.map((badge, idx) => (
                    <div key={idx} className="badge-item">
                      <div 
                        className="badge-icon-wrapper"
                        style={{
                          backgroundColor: idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--accent-coral)' : 'var(--accent)'
                        }}
                      >
                        <Trophy size={20} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Feedbacks from Teacher */}
            <div className="evolution-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                Parecer Pedagógico do Professor
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Estas anotações de evolução e feedbacks foram inseridos diretamente pelo professor do seu curso.
              </p>

              {currentUser.teacherNotes && currentUser.teacherNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <HelpCircle size={28} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nenhum parecer pedagógico cadastrado ainda.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentUser.teacherNotes?.map((note) => (
                    <div key={note.id} className="note-sticker">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.8 }}>
                        <span>De: {note.teacherName}</span>
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
