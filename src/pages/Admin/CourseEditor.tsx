import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import type { Course, Module, Lesson } from '../../types';
import { useSystem } from '../../context/SystemContext';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  FolderPlus, 
  ArrowLeft
} from 'lucide-react';

export const CourseEditor: React.FC = () => {
  const { addLog } = useSystem();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Form states for Course
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseDiff, setNewCourseDiff] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [newCourseImg, setNewCourseImg] = useState('');

  // Form states for Modules & Lessons
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'text' | 'exercise'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState('10 min');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonVideo, setNewLessonVideo] = useState('');
  const [newLessonProblem, setNewLessonProblem] = useState('');
  const [newLessonSolution, setNewLessonSolution] = useState('');
  const [newLessonExplainer, setNewLessonExplainer] = useState('');

  useEffect(() => {
    setCourses(db.getCourses());
  }, []);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseDesc) return;

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: newCourseTitle,
      description: newCourseDesc,
      instructorId: 'user-instructor',
      instructorName: 'Prof. Marcos Paulo',
      category: newCourseCategory || 'Geral',
      difficulty: newCourseDiff,
      image: newCourseImg || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      modules: []
    };

    db.addCourse(newCourse);
    setCourses(db.getCourses());
    addLog(
      'Criação de Curso',
      `Criou um novo curso no catálogo: ${newCourse.title}`,
      'success'
    );

    // Reset fields
    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseCategory('');
    setNewCourseImg('');
  };

  const handleSaveCourseEdits = () => {
    if (!selectedCourse) return;
    
    db.updateCourse(selectedCourse);
    setCourses(db.getCourses());
    addLog(
      'Edição de Curso',
      `Salvou alterações no curso: ${selectedCourse.title}`,
      'success'
    );
    setSelectedCourse(null);
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !newModuleTitle) return;

    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: newModuleTitle,
      lessons: []
    };

    const updated = {
      ...selectedCourse,
      modules: [...selectedCourse.modules, newModule]
    };

    setSelectedCourse(updated);
    setNewModuleTitle('');
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !activeModuleId || !newLessonTitle) return;

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: newLessonTitle,
      type: newLessonType,
      duration: newLessonDuration,
      content: newLessonContent,
      videoUrl: newLessonType === 'video' ? newLessonVideo || 'https://www.youtube.com/embed/dQw4w9WgXcQ' : undefined,
      problemContent: newLessonType === 'exercise' ? newLessonProblem : undefined,
      solutionContent: newLessonType === 'exercise' ? newLessonSolution : undefined,
      explainerContent: newLessonType === 'exercise' ? newLessonExplainer : undefined
    };

    const updatedModules = selectedCourse.modules.map(mod => {
      if (mod.id === activeModuleId) {
        return {
          ...mod,
          lessons: [...mod.lessons, newLesson]
        };
      }
      return mod;
    });

    setSelectedCourse({
      ...selectedCourse,
      modules: updatedModules
    });

    // Reset lesson form fields
    setNewLessonTitle('');
    setNewLessonDuration('10 min');
    setNewLessonContent('');
    setNewLessonVideo('');
    setNewLessonProblem('');
    setNewLessonSolution('');
    setNewLessonExplainer('');
    setActiveModuleId(null);
  };

  const handleDeleteCourse = (courseId: string, title: string) => {
    if (window.confirm(`Tem certeza de que deseja deletar o curso "${title}"?`)) {
      const updated = courses.filter(c => c.id !== courseId);
      db.saveCourses(updated);
      setCourses(updated);
      addLog(
        'Exclusão de Curso',
        `Deletou o curso: ${title} do sistema`,
        'warning'
      );
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }} role="region" aria-label="Editor de Conteúdo de Cursos">
      {selectedCourse ? (
        /* Edit Course Panel View */
        <div>
          {/* Back Action Bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setSelectedCourse(null)}
              style={{ padding: '8px 12px' }}
            >
              <ArrowLeft size={16} /> Voltar para Cursos
            </button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>
              Editando: {selectedCourse.title}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'start' }}>
            {/* Edit Modules & Lessons (Left) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Module Creator form */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', fontWeight: '800' }}>Adicionar Novo Módulo</h3>
                <form onSubmit={handleAddModule} style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Título do módulo (ex: Módulo 3: Hooks Avançados)"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> Criar Módulo
                  </button>
                </form>
              </div>

              {/* Modules Listing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedCourse.modules.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px' }}>
                    Nenhum módulo adicionado ainda neste curso. Crie um acima!
                  </p>
                ) : (
                  selectedCourse.modules.map((mod) => (
                    <div key={mod.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: '700' }}>{mod.title}</h4>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          onClick={() => setActiveModuleId(activeModuleId === mod.id ? null : mod.id)}
                        >
                          <FolderPlus size={14} /> Adicionar Aula
                        </button>
                      </div>

                      {/* Add Lesson inline form */}
                      {activeModuleId === mod.id && (
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                          <h5 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Nova Aula para {mod.title}</h5>
                          <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Título da aula"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                required
                              />
                              <select 
                                className="form-select"
                                value={newLessonType}
                                onChange={(e) => setNewLessonType(e.target.value as any)}
                              >
                                <option value="video">Vídeo</option>
                                <option value="text">Artigo Texto</option>
                                <option value="exercise">Exercício Prático</option>
                              </select>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Duração (ex: 15 min)"
                                value={newLessonDuration}
                                onChange={(e) => setNewLessonDuration(e.target.value)}
                                required
                              />
                            </div>

                            {/* Specific content fields based on type */}
                            {newLessonType === 'video' && (
                              <input
                                type="url"
                                className="form-input"
                                placeholder="URL do Iframe do Vídeo (ex: https://www.youtube.com/embed/dQw4w9WgXcQ)"
                                value={newLessonVideo}
                                onChange={(e) => setNewLessonVideo(e.target.value)}
                              />
                            )}

                            {newLessonType === 'text' && (
                              <textarea
                                className="form-input"
                                placeholder="Conteúdo do Artigo em HTML ou Texto corrido"
                                style={{ height: '100px' }}
                                value={newLessonContent}
                                onChange={(e) => setNewLessonContent(e.target.value)}
                              />
                            )}

                            {newLessonType === 'exercise' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <textarea
                                  className="form-input"
                                  placeholder="Descrição do Exercício / Problema"
                                  value={newLessonContent}
                                  onChange={(e) => setNewLessonContent(e.target.value)}
                                />
                                <textarea
                                  className="form-input"
                                  placeholder="Estrutura Inicial / Código com TODOs (Problem)"
                                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', height: '80px' }}
                                  value={newLessonProblem}
                                  onChange={(e) => setNewLessonProblem(e.target.value)}
                                />
                                <textarea
                                  className="form-input"
                                  placeholder="Gabarito de Implementação Esperado (Solution)"
                                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', height: '80px' }}
                                  value={newLessonSolution}
                                  onChange={(e) => setNewLessonSolution(e.target.value)}
                                />
                                <textarea
                                  className="form-input"
                                  placeholder="Conceitos teóricos e Acessibilidade (Explainer)"
                                  style={{ height: '60px' }}
                                  value={newLessonExplainer}
                                  onChange={(e) => setNewLessonExplainer(e.target.value)}
                                />
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              <button type="button" className="btn btn-secondary" onClick={() => setActiveModuleId(null)}>
                                Cancelar
                              </button>
                              <button type="submit" className="btn btn-success">
                                Salvar Aula
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Lessons list in module */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mod.lessons.length === 0 ? (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>Nenhuma aula adicionada neste módulo.</p>
                        ) : (
                          mod.lessons.map(les => (
                            <div 
                              key={les.id} 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '8px 12px',
                                backgroundColor: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem'
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginRight: '8px' }}>
                                  [{les.type.toUpperCase()}]
                                </span>
                                <span>{les.title}</span>
                              </div>
                              <span style={{ color: 'var(--text-tertiary)' }}>{les.duration}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Course Settings Form (Right) */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Dados do Curso</h3>
              
              <div className="form-group">
                <label className="form-label">Título do Curso</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedCourse.title}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-input"
                  style={{ height: '120px' }}
                  value={selectedCourse.description}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dificuldade</label>
                <select
                  className="form-select"
                  value={selectedCourse.difficulty}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, difficulty: e.target.value as any })}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Categoria</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedCourse.category}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL da Imagem</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedCourse.image}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, image: e.target.value })}
                />
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '12px' }}
                onClick={handleSaveCourseEdits}
              >
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Course Listing & Addition View */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
          
          {/* Courses List (Left) */}
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '24px' }}>Cursos Ativos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {courses.map((c) => (
                <div 
                  key={c.id} 
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: '16px',
                    padding: '16px 24px' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img 
                      src={c.image} 
                      alt="" 
                      style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} 
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{c.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        {c.category} • {c.difficulty} • {c.modules.length} módulos
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      onClick={() => setSelectedCourse(c)}
                      aria-label={`Editar conteúdo do curso ${c.title}`}
                    >
                      <Edit size={14} /> Editar
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      onClick={() => handleDeleteCourse(c.id, c.title)}
                      aria-label={`Deletar curso ${c.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Course Form (Right) */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px' }}>Criar Novo Curso</h2>
            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="c-title" className="form-label">Título do Curso</label>
                <input
                  id="c-title"
                  type="text"
                  className="form-input"
                  placeholder="Ex: CSS Flexbox e Grid do Básico ao Avançado"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="c-desc" className="form-label">Descrição</label>
                <textarea
                  id="c-desc"
                  className="form-input"
                  placeholder="Descreva o que o aluno aprenderá nesse curso..."
                  style={{ height: '80px' }}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="c-diff" className="form-label">Dificuldade</label>
                <select
                  id="c-diff"
                  className="form-select"
                  value={newCourseDiff}
                  onChange={(e) => setNewCourseDiff(e.target.value as any)}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="c-cat" className="form-label">Categoria</label>
                <input
                  id="c-cat"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Programação, Design, Negócios"
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="c-img" className="form-label">URL da Imagem de Capa</label>
                <input
                  id="c-img"
                  type="text"
                  className="form-input"
                  placeholder="URL opcional da imagem Unsplash..."
                  value={newCourseImg}
                  onChange={(e) => setNewCourseImg(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} /> Criar Curso
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
