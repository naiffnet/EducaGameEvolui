import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { db } from '../../db/database';
import type { Course, User, Mission, MissionSubmission, MissionType } from '../../types';
import { reviewSubmission, getActiveCommonMissionsFor, getWeeklyCompletionBonus } from '../../engine/MissionEngine';
import { Swords, Plus, Users, Zap, HourglassIcon, CheckCircle2, XCircle, Ban, Trophy } from 'lucide-react';

const TYPE_LABEL: Record<MissionType, string> = {
  COMMON: 'Comum (turma toda)',
  REQUESTED: 'Requisitada (aluno/grupo específico)',
  BLITZ: 'Blitz (conclusão imediata, sem validação)',
};

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export const MissionEditor: React.FC = () => {
  const { currentUser } = useAuth();
  const { addLog } = useSystem();

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MissionType>('COMMON');
  const [xpReward, setXpReward] = useState(100);
  const [milestoneType, setMilestoneType] = useState<'PERSONAL' | 'HERO'>('PERSONAL');
  const [requiresValidation, setRequiresValidation] = useState(true);
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return toDateInputValue(d.toISOString());
  });
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);

  const load = useCallback(() => {
    if (!currentUser) return;
    const allCourses = db.getCourses();
    const myCourses = currentUser.role === 'ADMIN' ? allCourses : allCourses.filter(c => c.instructorId === currentUser.id);
    setCourses(myCourses);
    setSelectedCourseId(prev => prev || (myCourses.length > 0 ? myCourses[0].id : ''));
    setStudents(db.getUsers().filter(u => u.role === 'STUDENT'));
    setMissions(db.getMissions());
    setSubmissions(db.getMissionSubmissions());
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  // Regra M2: Missão de valor Herói exige validação sempre — força e trava o checkbox
  useEffect(() => {
    if (milestoneType === 'HERO') setRequiresValidation(true);
  }, [milestoneType]);

  // Regra M1: Blitz por padrão não exige validação (mas o usuário ainda pode marcar, exceto se Herói)
  useEffect(() => {
    if (milestoneType === 'HERO') return;
    setRequiresValidation(type !== 'BLITZ');
  }, [type, milestoneType]);

  const courseMissions = useMemo(
    () => missions.filter(m => m.courseId === selectedCourseId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [missions, selectedCourseId]
  );

  const courseStudents = useMemo(
    () => students.filter(s => s.enrolledCourses.includes(selectedCourseId)),
    [students, selectedCourseId]
  );

  const pendingQueue = useMemo(() => {
    if (!currentUser) return [];
    // Regra da User Story 20: Admin gerencia Missões de qualquer curso, com os mesmos
    // poderes de um instrutor — inclui a fila de validação inteira, não só a própria.
    const relevantMissionIds = new Set(
      (currentUser.role === 'ADMIN' ? missions : missions.filter(m => m.instructorId === currentUser.id))
        .map(m => m.id)
    );
    return submissions
      .filter(s => s.status === 'PENDING' && relevantMissionIds.has(s.missionId))
      .map(s => ({ submission: s, mission: missions.find(m => m.id === s.missionId) }))
      .filter((x): x is { submission: MissionSubmission; mission: Mission } => !!x.mission);
  }, [currentUser, missions, submissions]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setType('COMMON'); setXpReward(100);
    setMilestoneType('PERSONAL'); setRequiresValidation(true); setTargetStudentIds([]);
    const d = new Date(); d.setDate(d.getDate() + 7);
    setDueAt(toDateInputValue(d.toISOString()));
    setShowForm(false);
  };

  const handleCreate = () => {
    if (!currentUser || !selectedCourseId || !title.trim()) return;
    if (type === 'REQUESTED' && targetStudentIds.length === 0) return;

    const mission: Mission = {
      id: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      courseId: selectedCourseId,
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      title: title.trim(),
      description: description.trim(),
      type,
      xpReward,
      milestoneType,
      requiresValidation,
      targetStudentIds: type === 'REQUESTED' ? targetStudentIds : undefined,
      availableFrom: new Date().toISOString(),
      dueAt: new Date(dueAt + 'T23:59:59').toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.addMission(mission);
    addLog('Missão Criada', `"${mission.title}" (${TYPE_LABEL[type]}) criada para o curso.`);
    resetForm();
    load();
  };

  const handleCloseEarly = (mission: Mission) => {
    db.updateMission({ ...mission, closedEarly: true });
    addLog('Missão Encerrada', `"${mission.title}" encerrada antecipadamente.`);
    load();
  };

  const handleReview = (submissionId: string, mission: Mission, decision: 'APPROVED' | 'REJECTED') => {
    const submission = db.getMissionSubmissions().find(s => s.id === submissionId);
    if (!submission) return;
    const student = db.getUsers().find(u => u.id === submission.studentId);

    const { submission: updatedSubmission, xpGrantResult } = reviewSubmission(
      submission, mission, student?.rpgCharacter, decision, reviewNotes[submissionId]?.trim() || undefined
    );
    db.updateMissionSubmission(updatedSubmission);

    if (xpGrantResult && student) {
      let finalCharacter = xpGrantResult.character;
      db.updateUser({ ...student, rpgCharacter: finalCharacter });

      // Regra M3: se essa foi uma Missão Comum, verifica o bônus de conclusão total
      if (mission.type === 'COMMON') {
        const activeCommon = getActiveCommonMissionsFor(db.getMissions(), student);
        const freshSubmissions = db.getSubmissionsForStudent(student.id);
        const bonus = getWeeklyCompletionBonus(activeCommon, freshSubmissions, student.id, finalCharacter);
        if (bonus) {
          db.updateUser({ ...student, rpgCharacter: bonus.character });
        }
      }
    }

    addLog(
      decision === 'APPROVED' ? 'Submissão Aprovada' : 'Submissão Recusada',
      `Missão "${mission.title}" de ${student?.name || submission.studentId}.`
    );
    setReviewNotes(prev => { const next = { ...prev }; delete next[submissionId]; return next; });
    load();
  };

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'INSTRUCTOR') {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Swords size={48} style={{ opacity: 0.3 }} />
        <p>Acesso restrito a professores e administradores.</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14,
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Swords size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Missões</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Proponha desafios para sua turma. Cada Missão concluída (e validada, quando exigido) concede XP ao personagem do estudante.
      </p>

      {/* Fila de validação */}
      {pendingQueue.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <HourglassIcon size={18} color="var(--warning)" /> Fila de Validação ({pendingQueue.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingQueue.map(({ submission, mission }) => {
              const student = students.find(s => s.id === submission.studentId);
              return (
                <div key={submission.id} style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{student?.name || submission.studentId}</strong>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}> — {mission.title}</span>
                    </div>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={13} /> +{mission.xpReward} XP
                    </span>
                  </div>
                  {submission.evidenceText && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, fontStyle: 'italic' }}>"{submission.evidenceText}"</p>
                  )}
                  <input
                    placeholder="Observação (opcional)"
                    value={reviewNotes[submission.id] || ''}
                    onChange={e => setReviewNotes(prev => ({ ...prev, [submission.id]: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 10, fontSize: 13, padding: '8px 10px' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleReview(submission.id, mission, 'APPROVED')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 13 }}>
                      <CheckCircle2 size={14} /> Aprovar
                    </button>
                    <button onClick={() => handleReview(submission.id, mission, 'REJECTED')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 13 }}>
                      <XCircle size={14} /> Recusar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seletor de curso */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>Curso</label>
          <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
            {courses.length === 0 && <option value="">Nenhum curso encontrado</option>}
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px' }} disabled={!selectedCourseId}>
          <Plus size={16} /> Nova Missão
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Ex: Pesquisa sobre Componentes Reutilizáveis" />
          </div>
          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="O que o estudante precisa fazer" />
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={labelStyle}>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as MissionType)} style={inputStyle}>
                {(Object.keys(TYPE_LABEL) as MissionType[]).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </div>
            <div style={{ width: 140 }}>
              <label style={labelStyle}>XP</label>
              <input type="number" min={1} value={xpReward} onChange={e => setXpReward(Math.max(1, parseInt(e.target.value) || 0))} style={inputStyle} />
            </div>
            <div style={{ width: 160 }}>
              <label style={labelStyle}>Prazo</label>
              <input type="date" value={dueAt} onChange={e => setDueAt(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={labelStyle}>Marco gerado</label>
              <select value={milestoneType} onChange={e => setMilestoneType(e.target.value as 'PERSONAL' | 'HERO')} style={inputStyle}>
                <option value="PERSONAL">Pessoal</option>
                <option value="HERO">Herói (alto valor)</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, opacity: milestoneType === 'HERO' ? 0.6 : 1 }}>
              <input type="checkbox" checked={requiresValidation} disabled={milestoneType === 'HERO'} onChange={e => setRequiresValidation(e.target.checked)} />
              Exige validação do instrutor{milestoneType === 'HERO' && ' (obrigatório para Herói)'}
            </label>
          </div>
          {type === 'REQUESTED' && (
            <div>
              <label style={labelStyle}>Endereçada a</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {courseStudents.length === 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Nenhum estudante matriculado neste curso.</span>}
                {courseStudents.map(s => {
                  const checked = targetStudentIds.includes(s.id);
                  return (
                    <label key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8,
                      border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
                      background: checked ? 'var(--primary-glow)' : 'transparent', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer',
                    }}>
                      <input
                        type="checkbox" checked={checked}
                        onChange={() => setTargetStudentIds(prev => checked ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                      />
                      {s.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button onClick={resetForm} className="btn btn-secondary">Cancelar</button>
            <button
              onClick={handleCreate}
              className="btn btn-primary"
              disabled={!title.trim() || (type === 'REQUESTED' && targetStudentIds.length === 0)}
            >
              Criar Missão
            </button>
          </div>
        </div>
      )}

      {/* Lista de missões do curso */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {courseMissions.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)' }}>Nenhuma Missão criada para este curso ainda.</p>
        )}
        {courseMissions.map(mission => {
          const submissions = db.getMissionSubmissions().filter(s => s.missionId === mission.id);
          const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;
          const audienceSize = mission.type === 'REQUESTED' ? (mission.targetStudentIds?.length || 0) : courseStudents.length;
          const expired = new Date(mission.dueAt).getTime() < Date.now();
          return (
            <div key={mission.id} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', opacity: mission.closedEarly || expired ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{mission.title}</strong>
                    {mission.milestoneType === 'HERO' && <Trophy size={14} color="var(--accent)" />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {TYPE_LABEL[mission.type]} · +{mission.xpReward} XP · <Users size={11} style={{ verticalAlign: 'middle' }} /> {approvedCount}/{audienceSize} concluíram
                    {mission.closedEarly && ' · Encerrada'}
                    {!mission.closedEarly && expired && ' · Vencida'}
                  </div>
                </div>
                {!mission.closedEarly && !expired && (
                  <button onClick={() => handleCloseEarly(mission)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: 12 }}>
                    <Ban size={12} /> Encerrar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
