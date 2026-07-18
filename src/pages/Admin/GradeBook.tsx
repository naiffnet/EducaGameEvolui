import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import type { User, Course, GradeEntry } from '../../types';
import { BookOpen, Save, X, CheckCircle, Edit3, Plus, Search } from 'lucide-react';

interface CellEditorState {
  userId: string;
  courseId: string;
  value: string;
  concept: GradeEntry['concept'];
  observations: string;
  existingId?: string;
}

const CONCEPT_FOR_GRADE = (g: number): GradeEntry['concept'] =>
  g >= 9 ? 'Excelente' : g >= 7 ? 'Ótimo' : g >= 6 ? 'Bom' : g >= 5 ? 'Regular' : 'Insuficiente';

const GRADE_COLOR = (g: number | null) => {
  if (g === null) return 'rgba(255,255,255,0.06)';
  if (g >= 7) return 'rgba(34,197,94,0.15)';
  if (g >= 5) return 'rgba(234,179,8,0.15)';
  return 'rgba(239,68,68,0.15)';
};

const GRADE_TEXT_COLOR = (g: number | null) => {
  if (g === null) return 'rgba(255,255,255,0.2)';
  if (g >= 7) return '#22c55e';
  if (g >= 5) return '#eab308';
  return '#ef4444';
};

export const GradeBook: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<CellEditorState | null>(null);
  const [saveFlash, setSaveFlash] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>('all');

  const loadData = useCallback(() => {
    const allUsers = db.getUsers();
    setStudents(allUsers.filter(u => u.role === 'STUDENT'));
    setCourses(db.getCourses());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const displayCourses = filterCourse === 'all' ? courses : courses.filter(c => c.id === filterCourse);

  const getGrade = (userId: string, courseId: string): GradeEntry | null => {
    const record = db.getAcademicRecord(userId);
    return record.grades.find(g => g.courseId === courseId) || null;
  };

  const classAverage = (courseId: string): number | null => {
    const grades = students
      .map(s => getGrade(s.id, courseId))
      .filter((g): g is GradeEntry => g !== null)
      .map(g => g.grade);
    if (!grades.length) return null;
    return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
  };

  const studentAverage = (userId: string): number | null => {
    const grades = courses
      .map(c => getGrade(userId, c.id))
      .filter((g): g is GradeEntry => g !== null)
      .map(g => g.grade);
    if (!grades.length) return null;
    return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
  };

  const openEditor = (userId: string, courseId: string) => {
    const existing = getGrade(userId, courseId);
    setEditing({
      userId,
      courseId,
      value: existing ? String(existing.grade) : '',
      concept: existing?.concept || 'Bom',
      observations: existing?.observations || '',
      existingId: existing?.id,
    });
  };

  const saveGrade = () => {
    if (!editing || !currentUser) return;
    const grade = parseFloat(editing.value);
    if (isNaN(grade) || grade < 0 || grade > 10) return;

    const course = courses.find(c => c.id === editing.courseId);
    const autoConept = CONCEPT_FOR_GRADE(grade);

    if (editing.existingId) {
      db.updateGrade(editing.userId, {
        id: editing.existingId,
        courseId: editing.courseId,
        courseName: course?.title || editing.courseId,
        grade,
        concept: autoConept,
        instructorName: currentUser.name,
        date: new Date().toISOString(),
        observations: editing.observations,
      });
    } else {
      db.addGrade(editing.userId, {
        courseId: editing.courseId,
        courseName: course?.title || editing.courseId,
        grade,
        concept: autoConept,
        instructorName: currentUser.name,
        date: new Date().toISOString(),
        observations: editing.observations,
      });
    }

    db.addLog(currentUser.id, currentUser.name, currentUser.role, 'Nota Lançada',
      `Nota ${grade} lançada para userId=${editing.userId} no curso ${course?.title}.`);

    setSaveFlash(`${editing.userId}-${editing.courseId}`);
    setTimeout(() => setSaveFlash(null), 1500);
    setEditing(null);
    loadData();
  };

  const removeGrade = (userId: string, courseId: string) => {
    const g = getGrade(userId, courseId);
    if (g) { db.removeGrade(userId, g.id); loadData(); }
  };

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'INSTRUCTOR') {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
        <BookOpen size={48} style={{ opacity: 0.3 }} />
        <p>Acesso restrito a professores e administradores.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>
          <BookOpen size={24} style={{ marginRight: 10, verticalAlign: 'middle', color: '#8b5cf6' }} />
          Livro de Notas
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: '6px 0 0' }}>
          Clique em qualquer célula para lançar ou editar uma nota.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar aluno..."
            style={{
              width: '100%', padding: '10px 12px 10px 38px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff',
              fontSize: 14, boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
          style={{
            padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 14,
          }}
        >
          <option value="all">Todos os cursos</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', minWidth: 180 }}>
                Aluno
              </th>
              {displayCourses.map(c => (
                <th key={c.id} style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', minWidth: 140 }}>
                  <div style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>{c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{c.difficulty} • {c.category}</div>
                  {(() => {
                    const avg = classAverage(c.id);
                    return avg !== null ? (
                      <div style={{ marginTop: 4, fontSize: 12, color: GRADE_TEXT_COLOR(avg), fontWeight: 700 }}>
                        Média turma: {avg}
                      </div>
                    ) : null;
                  })()}
                </th>
              ))}
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', minWidth: 90 }}>
                Média Aluno
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => {
              const avg = studentAverage(student.id);
              return (
                <tr key={student.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{student.rpgCharacter?.selectedClass || 'Sem classe'} • Nível {student.rpgCharacter?.level || 1}</div>
                  </td>
                  {displayCourses.map(c => {
                    const grade = getGrade(student.id, c.id);
                    const flashKey = `${student.id}-${c.id}`;
                    return (
                      <td
                        key={c.id}
                        onClick={() => openEditor(student.id, c.id)}
                        style={{
                          padding: '10px 12px', textAlign: 'center',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer', transition: 'background 0.2s',
                          background: saveFlash === flashKey ? 'rgba(34,197,94,0.2)' : GRADE_COLOR(grade?.grade ?? null),
                        }}
                        title={grade ? `${grade.concept} — ${grade.instructorName}` : 'Clique para lançar nota'}
                      >
                        {saveFlash === flashKey ? (
                          <CheckCircle size={18} color="#22c55e" />
                        ) : grade ? (
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: GRADE_TEXT_COLOR(grade.grade) }}>{grade.grade.toFixed(1)}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{grade.concept}</div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'rgba(255,255,255,0.2)' }}>
                            <Plus size={14} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ padding: '10px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {avg !== null ? (
                      <span style={{ fontWeight: 800, fontSize: 16, color: GRADE_TEXT_COLOR(avg) }}>{avg}</span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div style={{ padding: '50px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            Nenhum aluno encontrado.
          </div>
        )}
      </div>

      {/* Grade Editor Modal */}
      {editing && (() => {
        const student = students.find(s => s.id === editing.userId);
        const course = courses.find(c => c.id === editing.courseId);
        const gradeVal = parseFloat(editing.value);
        const isValid = !isNaN(gradeVal) && gradeVal >= 0 && gradeVal <= 10;
        const autoConceptPreview = isValid ? CONCEPT_FOR_GRADE(gradeVal) : null;
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          }}>
            <div style={{
              background: 'linear-gradient(145deg, #1e1b4b, #0f172a)', border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 24, padding: 32, width: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                  <Edit3 size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#8b5cf6' }} />
                  {editing.existingId ? 'Editar Nota' : 'Lançar Nota'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '8px 0 0', fontSize: 14 }}>
                  {student?.name} — {course?.title}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Nota (0–10)</label>
                  <input
                    type="number"
                    min={0} max={10} step={0.1}
                    autoFocus
                    value={editing.value}
                    onChange={e => setEditing({ ...editing, value: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.08)', border: `1px solid ${isValid ? 'rgba(139,92,246,0.4)' : 'rgba(239,68,68,0.4)'}`,
                      borderRadius: 10, color: '#fff', fontSize: 20, fontWeight: 700,
                    }}
                  />
                  {autoConceptPreview && (
                    <div style={{ marginTop: 6, fontSize: 13, color: GRADE_TEXT_COLOR(gradeVal), fontWeight: 600 }}>
                      → {autoConceptPreview}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Observação (opcional)</label>
                  <textarea
                    value={editing.observations}
                    onChange={e => setEditing({ ...editing, observations: e.target.value })}
                    rows={3}
                    placeholder="Comentário sobre o desempenho..."
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, color: '#fff', fontSize: 14, resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                {editing.existingId && (
                  <button
                    onClick={() => { removeGrade(editing.userId, editing.courseId); setEditing(null); }}
                    className="btn btn-danger"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px' }}
                  >
                    <X size={15} /> Remover
                  </button>
                )}
                <button
                  onClick={() => setEditing(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveGrade}
                  disabled={!isValid}
                  className="btn btn-primary"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Save size={15} /> Salvar Nota
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
