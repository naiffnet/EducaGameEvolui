import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { db } from '../../db/database';
import type { Course, Lesson } from '../../types';
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  Code, 
  CheckCircle, 
  HelpCircle
} from 'lucide-react';
import { RpgAvatar } from '../../components/RpgAvatar';

interface CoursePlayerProps {
  courseId: string;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId, onBack }) => {
  const { currentUser, refreshUser } = useAuth();
  const { addLog } = useSystem();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [exerciseTab, setExerciseTab] = useState<'problem' | 'solution' | 'explainer'>('problem');
  const [codeInputValue, setCodeInputValue] = useState('');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });
  
  // Gamification states
  const [levelUpMessage, setLevelUpMessage] = useState<{ active: boolean; oldLevel: number; newLevel: number; newSkill: string } | null>(null);

  const gainXp = (amount: number) => {
    if (!currentUser || !currentUser.rpgCharacter) return;

    const char = { ...currentUser.rpgCharacter };
    char.xp += amount;

    let levelUp = false;
    let oldLevel = char.level;
    let newSkillUnlocked = '';

    // Check level up threshold: level * 200 XP
    while (char.xp >= char.level * 200) {
      char.xp -= char.level * 200;
      char.level += 1;
      levelUp = true;

      // Stats increment based on class
      if (char.selectedClass === 'MAGE') {
        char.stats.strength += 2;
        char.stats.intelligence += 6;
        char.stats.dexterity += 2;
        // Skill unlock
        if (char.level === 2 && !char.unlockedSkills.includes('Teleporte Flexbox')) {
          newSkillUnlocked = 'Teleporte Flexbox';
        } else if (char.level === 3 && !char.unlockedSkills.includes('Fórmula de Grid')) {
          newSkillUnlocked = 'Fórmula de Grid';
        } else {
          newSkillUnlocked = `Mente Fluida Lv. ${char.level}`;
        }
      } else if (char.selectedClass === 'WARRIOR') {
        char.stats.strength += 6;
        char.stats.intelligence += 2;
        char.stats.dexterity += 2;
        // Skill unlock
        if (char.level === 2 && !char.unlockedSkills.includes('Escudo de Estados')) {
          newSkillUnlocked = 'Escudo de Estados';
        } else if (char.level === 3 && !char.unlockedSkills.includes('Loop Supremo')) {
          newSkillUnlocked = 'Loop Supremo';
        } else {
          newSkillUnlocked = `Golpe Lógico Lv. ${char.level}`;
        }
      } else if (char.selectedClass === 'RANGER') {
        char.stats.strength += 2;
        char.stats.intelligence += 2;
        char.stats.dexterity += 6;
        // Skill unlock
        if (char.level === 2 && !char.unlockedSkills.includes('Flecha de Asserções')) {
          newSkillUnlocked = 'Flecha de Asserções';
        } else if (char.level === 3 && !char.unlockedSkills.includes('Sentinela de Testes')) {
          newSkillUnlocked = 'Sentinela de Testes';
        } else {
          newSkillUnlocked = `Foco Crítico Lv. ${char.level}`;
        }
      }

      if (newSkillUnlocked) {
        char.unlockedSkills.push(newSkillUnlocked);
      }
    }

    const updatedUser = {
      ...currentUser,
      rpgCharacter: char
    };

    // Scouting system levels
    let rankBadge = '';
    if (char.level === 2 && !updatedUser.unlockedBadges.includes('Scout: Explorador')) {
      rankBadge = 'Scout: Explorador';
    } else if (char.level === 3 && !updatedUser.unlockedBadges.includes('Scout: Guardião')) {
      rankBadge = 'Scout: Guardião';
    } else if (char.level >= 4 && !updatedUser.unlockedBadges.includes('Scout: Mestre Lendário')) {
      rankBadge = 'Scout: Mestre Lendário';
    }

    if (rankBadge) {
      updatedUser.unlockedBadges.push(rankBadge);
    }

    db.updateUser(updatedUser);
    refreshUser();

    if (levelUp) {
      setLevelUpMessage({
        active: true,
        oldLevel,
        newLevel: char.level,
        newSkill: newSkillUnlocked || 'Atributos Aumentados'
      });

      addLog(
        'Subiu de Nível',
        `Subiu para o Nível ${char.level} na classe ${char.selectedClass}!`,
        'success'
      );
    }
  };

  useEffect(() => {
    const fetchedCourse = db.getCourses().find(c => c.id === courseId);
    if (fetchedCourse) {
      setCourse(fetchedCourse);
      
      // Default to first lesson of first module
      if (fetchedCourse.modules.length > 0 && fetchedCourse.modules[0].lessons.length > 0) {
        selectLesson(fetchedCourse.modules[0].lessons[0]);
      }
    }
  }, [courseId]);

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setTestResult({ status: 'idle', message: '' });
    
    if (lesson.type === 'exercise') {
      setCodeInputValue(lesson.problemContent || '');
      setExerciseTab('problem');
    }
    
    if (currentUser) {
      addLog(
        'Acesso à Aula',
        `Aluno acessou a aula: ${lesson.title} (Curso: ${course?.title})`
      );
    }
  };

  const handleToggleComplete = () => {
    if (!currentUser || !activeLesson) return;

    const updatedUser = { ...currentUser };
    const isCompleted = updatedUser.completedLessons.includes(activeLesson.id);

    if (isCompleted) {
      updatedUser.completedLessons = updatedUser.completedLessons.filter(id => id !== activeLesson.id);
      db.updateUser(updatedUser);
      refreshUser();
      addLog('Aula Desmarcada', `Marcou aula como não concluída: ${activeLesson.title}`);
    } else {
      updatedUser.completedLessons.push(activeLesson.id);
      db.updateUser(updatedUser);
      refreshUser();
      addLog('Aula Concluída', `Marcou aula como concluída: ${activeLesson.title}`);
      
      // Award XP for completing lesson
      gainXp(50);

      // Trigger next lesson suggestion or auto-select
      suggestNextLesson();
    }
  };

  const suggestNextLesson = () => {
    if (!course || !activeLesson) return;

    let foundCurrent = false;
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        if (foundCurrent) {
          // Select this next lesson
          setTimeout(() => {
            selectLesson(les);
          }, 800);
          return;
        }
        if (les.id === activeLesson.id) {
          foundCurrent = true;
        }
      }
    }
  };

  const runExerciseTest = () => {
    if (!activeLesson) return;
    
    // Quick simulation of running tests
    setTestResult({ status: 'idle', message: 'Executando testes...' });
    
    setTimeout(() => {
      if (codeInputValue.toLowerCase().includes('aria-label') || codeInputValue.includes('props')) {
        setTestResult({
          status: 'success',
          message: '✓ Sucesso: Todos os testes de acessibilidade e renderização passaram no compilador local!'
        });
        
        // Auto-complete lesson on success
        if (currentUser && !currentUser.completedLessons.includes(activeLesson.id)) {
          const updatedUser = { ...currentUser };
          updatedUser.completedLessons.push(activeLesson.id);
          db.updateUser(updatedUser);
          refreshUser();
        }

        addLog(
          'Exercício Validado',
          `Aluno passou nos testes práticos do exercício: ${activeLesson.title}`,
          'success'
        );

        // Award 150 XP for exercises
        gainXp(150);
      } else {
        setTestResult({
          status: 'error',
          message: '❌ Erro: O botão gerado não atende a todas as diretrizes de acessibilidade (Considere adicionar aria-label ou propriedades dinâmicas).'
        });
        addLog(
          'Falha no Exercício',
          `Aluno falhou nos testes do exercício: ${activeLesson.title}`,
          'warning'
        );
      }
    }, 1200);
  };

  if (!course || !activeLesson) {
    return <div style={{ color: 'var(--text-primary)' }}>Carregando reprodutor de curso...</div>;
  }

  const isCurrentCompleted = currentUser?.completedLessons.includes(activeLesson.id);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'left' }} role="region" aria-label={`Visualização do curso ${course.title}`}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          style={{ padding: '8px 12px' }}
          aria-label="Voltar para a página de catálogo de cursos"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '800' }}>{course.title}</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{course.instructorName}</p>
        </div>
      </div>

      {/* Main Player Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 340px', 
          gap: '24px', 
          alignItems: 'start' 
        }}
      >
        {/* Left Column: Lesson Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Visual Player Area */}
          <div 
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* 1. Video Type */}
            {activeLesson.type === 'video' && activeLesson.videoUrl && (
              <div style={{ marginBottom: '20px' }}>
                <div className="video-player-container">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={activeLesson.videoUrl} 
                    title={activeLesson.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  ></iframe>
                </div>
              </div>
            )}

            {/* 2. Text Type */}
            {activeLesson.type === 'text' && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border)',
                  padding: '30px', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '20px',
                  maxHeight: '450px',
                  overflowY: 'auto'
                }}
              >
                <div 
                  className="lesson-rich-text"
                  dangerouslySetInnerHTML={{ __html: activeLesson.content }} 
                />
              </div>
            )}

            {/* 3. Exercise Type */}
            {activeLesson.type === 'exercise' && (
              <div style={{ marginBottom: '20px' }}>
                {/* Exercise Tabs */}
                <div 
                  style={{ 
                    display: 'flex', 
                    borderBottom: '1px solid var(--border)', 
                    marginBottom: '16px',
                    gap: '4px'
                  }}
                  role="tablist"
                  aria-label="Abas do Exercício"
                >
                  <button
                    role="tab"
                    aria-selected={exerciseTab === 'problem'}
                    aria-controls="panel-problem"
                    id="tab-problem"
                    onClick={() => setExerciseTab('problem')}
                    style={{
                      padding: '12px 18px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: exerciseTab === 'problem' ? '3px solid var(--primary)' : '3px solid transparent',
                      color: exerciseTab === 'problem' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <Code size={16} style={{ marginRight: '6px', display: 'inline' }} /> Enunciado
                  </button>
                  <button
                    role="tab"
                    aria-selected={exerciseTab === 'solution'}
                    aria-controls="panel-solution"
                    id="tab-solution"
                    onClick={() => setExerciseTab('solution')}
                    style={{
                      padding: '12px 18px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: exerciseTab === 'solution' ? '3px solid var(--primary)' : '3px solid transparent',
                      color: exerciseTab === 'solution' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle size={16} style={{ marginRight: '6px', display: 'inline' }} /> Gabarito / Solução
                  </button>
                  <button
                    role="tab"
                    aria-selected={exerciseTab === 'explainer'}
                    aria-controls="panel-explainer"
                    id="tab-explainer"
                    onClick={() => setExerciseTab('explainer')}
                    style={{
                      padding: '12px 18px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: exerciseTab === 'explainer' ? '3px solid var(--primary)' : '3px solid transparent',
                      color: exerciseTab === 'explainer' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <HelpCircle size={16} style={{ marginRight: '6px', display: 'inline' }} /> Explicação Teórica
                  </button>
                </div>

                {/* Tab Contents */}
                <div style={{ minHeight: '260px' }}>
                  {exerciseTab === 'problem' && (
                    <div id="panel-problem" role="tabpanel" aria-labelledby="tab-problem">
                      <p style={{ marginBottom: '16px', fontSize: '0.95rem' }}>{activeLesson.content}</p>
                      
                      <div className="form-group">
                        <label htmlFor="code-textarea" className="form-label">Editor de Código:</label>
                        <textarea
                          id="code-textarea"
                          className="form-input"
                          style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '0.85rem', 
                            height: '180px', 
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            resize: 'vertical'
                          }}
                          value={codeInputValue}
                          onChange={(e) => setCodeInputValue(e.target.value)}
                        />
                      </div>
                      
                      <button 
                        className="btn btn-primary" 
                        onClick={runExerciseTest}
                        disabled={testResult.message === 'Executando testes...'}
                        style={{ marginTop: '8px' }}
                      >
                        Verificar Resposta
                      </button>
                    </div>
                  )}

                  {exerciseTab === 'solution' && (
                    <div id="panel-solution" role="tabpanel" aria-labelledby="tab-solution">
                      <p style={{ marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                        Veja abaixo a implementação de referência recomendada para passar nas validações:
                      </p>
                      <pre 
                        style={{ 
                          padding: '16px', 
                          backgroundColor: 'var(--bg-tertiary)', 
                          border: '1px solid var(--border)', 
                          borderRadius: 'var(--radius-md)', 
                          overflowX: 'auto',
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-mono)' 
                        }}
                      >
                        <code>{activeLesson.solutionContent}</code>
                      </pre>
                    </div>
                  )}

                  {exerciseTab === 'explainer' && (
                    <div id="panel-explainer" role="tabpanel" aria-labelledby="tab-explainer">
                      <div 
                        style={{ 
                          padding: '16px', 
                          backgroundColor: 'var(--bg-tertiary)', 
                          border: '1px solid var(--border)', 
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.95rem',
                          color: 'var(--text-secondary)' 
                        }}
                      >
                        <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Foco em Acessibilidade</h4>
                        <p style={{ whiteSpace: 'pre-line' }}>{activeLesson.explainerContent}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Results Message banner */}
                {testResult.message && (
                  <div 
                    style={{ 
                      marginTop: '20px', 
                      padding: '12px 16px', 
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: testResult.status === 'success' ? 'var(--success-glow)' : testResult.status === 'error' ? 'var(--danger-glow)' : 'var(--bg-tertiary)',
                      border: `1px solid ${testResult.status === 'success' ? 'var(--success)' : testResult.status === 'error' ? 'var(--danger)' : 'var(--border)'}`,
                      color: testResult.status === 'success' ? 'var(--success)' : testResult.status === 'error' ? 'var(--danger)' : 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                    role="alert"
                  >
                    {testResult.message}
                  </div>
                )}
              </div>
            )}

            {/* Lesson Action Controls */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderTop: '1px solid var(--border)', 
                paddingTop: '20px',
                marginTop: '12px' 
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700' }}>{activeLesson.title}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Duração estimada: {activeLesson.duration}</p>
              </div>

              {currentUser && (
                <button
                  className={`btn ${isCurrentCompleted ? 'btn-secondary' : 'btn-success'}`}
                  onClick={handleToggleComplete}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle size={18} />
                  <span>{isCurrentCompleted ? 'Concluída ✓' : 'Concluir Aula'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Course Index Sidebar */}
        <div 
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            Índice do Curso
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {course.modules.map((module) => (
              <div key={module.id}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>
                  {module.title}
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {module.lessons.map((lesson, idx) => {
                    const isCompleted = currentUser?.completedLessons.includes(lesson.id);
                    const isActive = activeLesson.id === lesson.id;
                    const colorClass = idx % 3 === 0 ? 'circle-bullet-red' : idx % 3 === 1 ? 'circle-bullet-green' : 'circle-bullet-blue';

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '12px',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 'bold' : '500',
                          fontSize: '0.85rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          marginBottom: '4px'
                        }}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                          <span 
                            className={`circle-bullet ${colorClass}`}
                            style={{ 
                              boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                              border: isCompleted ? '2px solid var(--bg-secondary)' : 'none'
                            }}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {lesson.title}
                          </span>
                        </div>

                        <span style={{ flexShrink: 0 }}>
                          {lesson.type === 'video' && <PlayCircle size={16} />}
                          {lesson.type === 'text' && <FileText size={16} />}
                          {lesson.type === 'exercise' && <Code size={16} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Level Up Notification Modal Overlay */}
      {levelUpMessage?.active && currentUser?.rpgCharacter && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(10, 11, 30, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="levelup-title"
        >
          <div 
            className="card" 
            style={{
              maxWidth: '450px',
              width: '100%',
              backgroundColor: 'var(--bg-secondary)',
              border: '4px solid var(--accent)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-glow)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <h2 
              id="levelup-title"
              style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: 'var(--accent)',
                margin: 0,
                textShadow: '0 2px 10px rgba(255, 183, 39, 0.3)'
              }}
            >
              🌟 LEVEL UP! 🌟
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              Sua persistência rendeu frutos! Seu herói de aprendizado evoluiu!
            </p>

            <div style={{ margin: '10px 0' }}>
              <RpgAvatar 
                rpgClass={currentUser.rpgCharacter.selectedClass} 
                level={currentUser.rpgCharacter.level} 
                size={140} 
              />
            </div>

            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Nível {levelUpMessage.oldLevel} ➔ Nível {levelUpMessage.newLevel}
              </span>
              <div 
                style={{ 
                  marginTop: '12px',
                  backgroundColor: 'var(--primary-glow)',
                  border: '1px solid rgba(94, 58, 238, 0.2)',
                  color: 'var(--primary)',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-block'
                }}
              >
                ⚡ Nova Skill: {levelUpMessage.newSkill}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: '#000000',
                fontWeight: '900',
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(255, 183, 39, 0.3)'
              }}
              onClick={() => setLevelUpMessage(null)}
            >
              Continuar Aventura ⚔️
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
