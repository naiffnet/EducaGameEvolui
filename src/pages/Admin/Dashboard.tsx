import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { Course, User, AuditLog } from '../../types';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Terminal, 
  TrendingUp
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // Custom states for Teacher Feedback/Evolution description
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    setCourses(db.getCourses());
    setUsers(db.getUsers());
    setLogs(db.getLogs());
  }, []);

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !feedbackText) return;

    const newNote = {
      id: `note-${Date.now()}`,
      teacherName: currentUser?.name || 'Professor',
      text: feedbackText,
      date: new Date().toISOString()
    };

    const updatedUser = {
      ...selectedStudent,
      teacherNotes: [newNote, ...selectedStudent.teacherNotes]
    };

    db.updateUser(updatedUser);
    setUsers(db.getUsers());
    
    db.addLog(
      currentUser?.id || 'instructor',
      currentUser?.name || 'Professor',
      currentUser?.role || 'INSTRUCTOR',
      'Parecer Pedagógico',
      `Adicionou feedback para o aluno: ${selectedStudent.name}`,
      'success'
    );
    setLogs(db.getLogs());

    // Reset fields
    setSelectedStudent(null);
    setFeedbackText('');
  };

  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalInstructors = users.filter(u => u.role === 'INSTRUCTOR').length;
  
  // Calculate average course completion
  const getAverageCompletion = () => {
    const students = users.filter(u => u.role === 'STUDENT');
    if (students.length === 0) return 0;
    
    let totalProgress = 0;
    let enrollmentCount = 0;

    courses.forEach(course => {
      students.forEach(student => {
        if (student.enrolledCourses.includes(course.id)) {
          enrollmentCount++;
          
          let courseLessons = 0;
          let completed = 0;
          course.modules.forEach(m => {
            m.lessons.forEach(l => {
              courseLessons++;
              if (student.completedLessons.includes(l.id)) {
                completed++;
              }
            });
          });
          
          if (courseLessons > 0) {
            totalProgress += (completed / courseLessons) * 100;
          }
        }
      });
    });

    if (enrollmentCount === 0) return 0;
    return Math.round(totalProgress / enrollmentCount);
  };

  const avgCompletion = getAverageCompletion();

  // Find recent registrations or activities
  const recentLogs = logs.slice(0, 5);

  const isInstructorOnly = currentUser?.role === 'INSTRUCTOR';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }} role="region" aria-label="Painel Administrativo">
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
          {isInstructorOnly ? 'Painel do Instrutor' : 'Painel de Controle Administrativo'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isInstructorOnly 
            ? 'Monitore suas turmas, progresso dos alunos e gerencie seu conteúdo.' 
            : 'Relatórios do sistema, métricas de engajamento dos alunos e logs de auditoria global.'}
        </p>
      </div>

      {/* Metric Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '24px', 
          marginBottom: '40px' 
        }}
      >
        {/* Metric 1 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--primary-glow)', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={28} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>Estudantes Ativos</p>
            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>{totalStudents}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        {!isInstructorOnly && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: 'var(--accent-glow)', 
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GraduationCap size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>Professores</p>
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>{totalInstructors}</h3>
            </div>
          </div>
        )}

        {/* Metric 3 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--success-glow)', 
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BookOpen size={28} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>Cursos Ativos</p>
            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>{courses.length}</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--warning-glow)', 
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>Engajamento Médio</p>
            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>{avgCompletion}%</h3>
          </div>
        </div>
      </div>

      {/* Main Stats Panels */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: isInstructorOnly ? '1fr' : '2fr 1fr', 
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Student Progress Overview & Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div 
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px' 
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
              Desempenho de Matrículas e Conclusão
            </h3>

            {/* Custom SVG/CSS Bar Chart representing student distribution */}
            <div 
              style={{ 
                height: '240px', 
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderBottom: '2px solid var(--border)',
                marginBottom: '8px'
              }}
              role="img"
              aria-label="Gráfico de Barras mostrando engajamento semanal dos estudantes. Segunda-feira: 40%, Terça-feira: 75%, Quarta-feira: 60%, Quinta-feira: 90%, Sexta-feira: 55%, Sábado: 30%, Domingo: 20%"
            >
              {[
                { label: 'Seg', val: 40, col: 'var(--primary)' },
                { label: 'Ter', val: 75, col: 'var(--primary)' },
                { label: 'Qua', val: 60, col: 'var(--primary)' },
                { label: 'Qui', val: 90, col: 'var(--accent)' },
                { label: 'Sex', val: 55, col: 'var(--primary)' },
                { label: 'Sab', val: 30, col: 'var(--text-tertiary)' },
                { label: 'Dom', val: 20, col: 'var(--text-tertiary)' }
              ].map((bar, i) => (
                <div 
                  key={i} 
                  style={{ 
                    flex: '1', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    {bar.val}%
                  </div>
                  <div 
                    style={{ 
                      width: '32px', 
                      height: `${bar.val * 1.8}px`, 
                      backgroundColor: bar.col, 
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height var(--transition-normal)'
                    }} 
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>
                    {bar.label}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              Métrica de interações semanais agregadas de alunos assistindo aulas e enviando exercícios.
            </p>
          </div>

          {/* Feedback Editor Form */}
          {selectedStudent && (
            <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--primary)', backgroundColor: 'var(--bg-tertiary)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '12px', color: 'var(--primary)' }}>
                Novo Parecer Pedagógico para: {selectedStudent.name}
              </h3>
              <form onSubmit={handleAddFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="feedback-textarea" className="form-label">
                    Anotação de Evolução / Descrição do Aluno
                  </label>
                  <textarea
                    id="feedback-textarea"
                    className="form-input"
                    placeholder="Descreva o progresso do aluno, observações ou orientações sobre a matéria..."
                    style={{ height: '100px' }}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setSelectedStudent(null);
                      setFeedbackText('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar Feedback
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Student Status List */}
          <div className="card" style={{ padding: '24px 0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 24px 16px' }}>
              Status de Alunos Cadastrados
            </h3>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Cursos Ativos</th>
                    <th>Aulas Concluídas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'STUDENT').map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 'bold' }}>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        <span className="badge badge-student">
                          {student.enrolledCourses.length} cursos
                        </span>
                      </td>
                      <td>
                        <strong>{student.completedLessons.length}</strong> concluídas
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--primary)' }}
                          onClick={() => {
                            setSelectedStudent(student);
                            setFeedbackText('');
                          }}
                        >
                          Escrever Feedback
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Audits & System Info (Admins only) */}
        {!isInstructorOnly && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} style={{ color: 'var(--primary)' }} /> Atividade Recente
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentLogs.map((log) => (
                  <div 
                    key={log.id} 
                    style={{ 
                      paddingBottom: '12px', 
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{log.action}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </p>
                    <span 
                      className={`badge badge-${log.userRole.toLowerCase()}`}
                      style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: '6px' }}
                    >
                      {log.userName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
