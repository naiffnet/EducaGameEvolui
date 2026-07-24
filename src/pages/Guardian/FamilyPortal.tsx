import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import { getRpgClassName } from '../../types';
import type { User, AttendanceRecord, Invoice } from '../../types';
import { RpgAvatar } from '../../components/RpgAvatar';
import { AnnouncementBoard } from '../../components/AnnouncementBoard';
import { DirectMessaging } from '../../components/DirectMessaging';
import {
  Users, Award, Calendar, GraduationCap, DollarSign, BookOpen,
  CheckCircle2, XCircle, ShieldAlert, MessageSquare
} from 'lucide-react';

export const FamilyPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'academic' | 'attendance' | 'financial' | 'notes' | 'messages'>('academic');

  useEffect(() => {
    if (currentUser && currentUser.role === 'GUARDIAN') {
      const linked = db.getStudentsForGuardian(currentUser.id);
      setStudents(linked);
      if (linked.length > 0 && !selectedStudentId) {
        setSelectedStudentId(linked[0].id);
      }
    }
  }, [currentUser, selectedStudentId]);

  if (!currentUser || currentUser.role !== 'GUARDIAN') {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--warning)', marginBottom: 16 }} />
        <h2>Acesso Restrito</h2>
        <p>Esta página é reservada exclusivamente para contas de Responsáveis (Família).</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="card" style={{ maxWidth: 650, margin: '40px auto', padding: 40, textAlign: 'center' }}>
        <Users size={56} style={{ color: 'var(--primary)', marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
          Nenhum Dependente Vinculado
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Sua conta de Responsável (<strong>{currentUser.name}</strong>) ainda não possui nenhum estudante vinculado na secretaria escolar.
        </p>
        <div style={{ padding: '14px 18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-tertiary)' }}>
          💡 Solicite à coordenação ou administração da escola para vincular seu e-mail (<code>{currentUser.email}</code>) à matrícula do seu filho.
        </div>
      </div>
    );
  }

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const academicRecord = db.getAcademicRecord(selectedStudent.id);
  const overallProgress = db.getOverallProgress(selectedStudent.id);
  const averageGrade = db.getAverageGrade(selectedStudent.id);

  // Attendance calculation
  const allAttendance: AttendanceRecord[] = db.getAttendanceRecords();
  const studentAttendance = allAttendance.filter((a: AttendanceRecord) => a.studentId === selectedStudent.id);
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter((a: AttendanceRecord) => a.present).length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Invoices (Entrega F)
  const invoices = db.getInvoicesForStudent(selectedStudent.id);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 0' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 28px',
        marginBottom: 24, boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <Users size={16} /> PORTAL DA FAMÍLIA · ACOMPANHAMENTO PEDAGÓGICO
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Bem-vindo(a), {currentUser.name}
            </h1>
          </div>

          {/* Student Selector Tab Bar */}
          {students.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-primary)', padding: 6, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', paddingLeft: 6 }}>Dependente:</span>
              {students.map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`btn ${selectedStudentId === st.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: 13, fontWeight: 700 }}
                >
                  {st.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Student Overview Box */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16,
          background: 'var(--bg-primary)', padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
        }}>
          {/* Avatar & RPG info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <RpgAvatar
              rpgClass={selectedStudent.rpgCharacter?.selectedClass || null}
              level={selectedStudent.rpgCharacter?.level || 1}
              size={64}
            />
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedStudent.name}
              </h3>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {selectedStudent.schoolClass ? `Turma ${selectedStudent.schoolClass}` : 'Sem Turma'} · {selectedStudent.email}
              </div>
              {selectedStudent.rpgCharacter && (
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
                  ⚔️ Nível {selectedStudent.rpgCharacter.level} · {getRpgClassName(selectedStudent.rpgCharacter.selectedClass)} ({selectedStudent.rpgCharacter.xp} XP)
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: averageGrade !== null && averageGrade >= 7 ? 'var(--success)' : 'var(--warning)' }}>
                {averageGrade !== null ? averageGrade : 'N/A'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Média Escolar</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: attendanceRate >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                {attendanceRate}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Frequência ({presentDays}/{totalDays} dias)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                {overallProgress}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Conclusão Cursos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Board */}
      <AnnouncementBoard />

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('academic')}
          className={`btn ${activeTab === 'academic' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
        >
          <GraduationCap size={16} /> Desempenho & Boletim
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
        >
          <Calendar size={16} /> Frequência ({attendanceRate}%)
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`btn ${activeTab === 'financial' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
        >
          <DollarSign size={16} /> Financeiro
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`btn ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
        >
          <MessageSquare size={16} /> Pareceres ({selectedStudent.teacherNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
        >
          <MessageSquare size={16} /> Mensagens Diretas
        </button>
      </div>

      {/* TAB CONTENT: Academic / Boletim */}
      {activeTab === 'academic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} style={{ color: 'var(--primary)' }} /> Boletim Escolar (Somente Leitura)
            </h3>
            {academicRecord.grades.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Nenhuma nota ou avaliação lançada até o momento.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12 }}>Disciplina / Curso</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12 }}>Nota (0-10)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12 }}>Conceito</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12 }}>Professor</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12 }}>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicRecord.grades.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13 }}>{g.courseName}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: g.grade >= 7 ? 'var(--success)' : g.grade >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                          {g.grade.toFixed(1)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span className="badge badge-info">{g.concept}</span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{g.instructorName}</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-tertiary)' }}>{g.observations || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enrolled Courses Progress */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} style={{ color: 'var(--accent)' }} /> Cursos Matriculados & Progresso
            </h3>
            {academicRecord.enrollmentHistory.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>O estudante não está matriculado em cursos no momento.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {academicRecord.enrollmentHistory.map(e => (
                  <div key={e.id} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{e.courseName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                      <span>Status: <strong style={{ color: 'var(--primary)' }}>{e.status === 'active' ? 'Em andamento' : e.status === 'completed' ? 'Concluído' : 'Trancado'}</strong></span>
                      <span>{e.progressPercent}% concluído</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${e.progressPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Attendance */}
      {activeTab === 'attendance' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} /> Histórico de Presença na Chamada
          </h3>
          {studentAttendance.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Nenhum registro de chamada realizado para este estudante ainda.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12 }}>Data</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12 }}>Turma</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttendance.slice().reverse().map((att: AttendanceRecord) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>
                        {new Date(att.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{att.schoolClass}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {att.present ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 700, fontSize: 13 }}>
                            <CheckCircle2 size={16} /> Presente
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--danger)', fontWeight: 700, fontSize: 13 }}>
                            <XCircle size={16} /> Ausente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Financial */}
      {activeTab === 'financial' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={18} style={{ color: 'var(--success)' }} /> Extrato Financeiro & Mensalidades (Somente Leitura)
          </h3>
          {invoices.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--success)', marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Nenhuma cobrança pendente ou lançada.</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>Todas as mensalidades do estudante estão em dia.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12 }}>Descrição</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12 }}>Vencimento</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12 }}>Valor</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: Invoice) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13 }}>{inv.description}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(inv.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, fontSize: 13 }}>
                        R$ {inv.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {inv.status === 'PAID' && <span className="badge badge-success">PAGO</span>}
                        {inv.status === 'PENDING' && <span className="badge badge-warning">PENDENTE</span>}
                        {inv.status === 'OVERDUE' && <span className="badge badge-danger">ATRASADO</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Teacher Notes */}
      {activeTab === 'notes' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> Pareceres e Observações dos Professores
          </h3>
          {selectedStudent.teacherNotes.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Nenhum parecer cadastrado pelos professores até o momento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selectedStudent.teacherNotes.map(n => (
                <div key={n.id} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{n.teacherName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(n.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    "{n.text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Direct Messages */}
      {activeTab === 'messages' && <DirectMessaging />}
    </div>
  );
};
