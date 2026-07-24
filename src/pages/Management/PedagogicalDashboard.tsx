import React, { useState } from 'react';
import { db } from '../../db/database';
import type { User, AttendanceRecord } from '../../types';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Printer, 
  CheckCircle2,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export const PedagogicalDashboard: React.FC = () => {
  const [users] = useState<User[]>(() => db.getUsers());
  const [attendance] = useState<AttendanceRecord[]>(() => db.getAttendanceRecords());

  const students = users.filter(u => u.role === 'STUDENT');
  const instructors = users.filter(u => u.role === 'INSTRUCTOR');

  // Compute school classes
  const schoolClasses = Array.from(new Set(students.map(s => s.schoolClass).filter((c): c is string => !!c))).sort();

  // Compute Attendance metrics
  const totalAttendanceCount = attendance.length;
  const presentCount = attendance.filter(a => a.present).length;
  const globalAttendanceRate = totalAttendanceCount > 0
    ? Math.round((presentCount / totalAttendanceCount) * 100)
    : 100;

  // Identify students needing support (< 75% attendance or 2+ absences)
  const studentAbsenceMap: Record<string, { student: User; absences: number; total: number }> = {};
  students.forEach(s => {
    studentAbsenceMap[s.id] = { student: s, absences: 0, total: 0 };
  });

  attendance.forEach(a => {
    if (studentAbsenceMap[a.studentId]) {
      studentAbsenceMap[a.studentId].total += 1;
      if (!a.present) studentAbsenceMap[a.studentId].absences += 1;
    }
  });

  const studentsAtRisk = Object.values(studentAbsenceMap).filter(item => item.absences > 0 || (item.total > 0 && (item.total - item.absences) / item.total < 0.75));

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'left' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={28} style={{ color: 'var(--primary)' }} /> Painel de Gestão da Coordenação & Direção
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Acompanhamento pedagógico executivo, controle de engajamento da escola e diagnóstico preventivo de frequência.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handlePrintReport}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Printer size={16} /> Imprimir / Exportar PDF
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Total de Alunos</span>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {students.length}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Em {schoolClasses.length} turmas ativas</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Frequência Global</span>
            <TrendingUp size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
            {globalAttendanceRate}%
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Média geral de presença na escola</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Corpo Docente</span>
            <GraduationCap size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {instructors.length}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Professores registrando chamadas</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Alertas de Atenção</span>
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>
            {studentsAtRisk.length}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Alunos requerendo apoio pedagógico</span>
        </div>
      </div>

      {/* Main Grid: Class Performance & At Risk Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Class Performance Table */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Frequência por Turma
          </h3>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Alunos</th>
                  <th>Presença Média</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schoolClasses.map(cName => {
                  const classStudentsCount = students.filter(s => s.schoolClass === cName).length;
                  const classAttendance = attendance.filter(a => a.schoolClass === cName);
                  const classPresents = classAttendance.filter(a => a.present).length;
                  const rate = classAttendance.length > 0 ? Math.round((classPresents / classAttendance.length) * 100) : 100;

                  return (
                    <tr key={cName}>
                      <td style={{ fontWeight: 800 }}>{cName}</td>
                      <td>{classStudentsCount} alunos</td>
                      <td style={{ fontWeight: 800, color: rate >= 85 ? 'var(--success)' : 'var(--warning)' }}>{rate}%</td>
                      <td>
                        <span className={`badge ${rate >= 85 ? 'badge-student' : 'badge-maintenance'}`}>
                          {rate >= 85 ? 'Excelente' : 'Acompanhar'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students At Risk Radar */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} /> Radar de Apoio Pedagógico Preventivo
          </h3>

          {studentsAtRisk.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--success)', fontWeight: 700 }}>
              <CheckCircle2 size={32} style={{ marginBottom: 8 }} />
              <div>Nenhum estudante em situação de risco de frequência!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {studentsAtRisk.map(item => (
                <div
                  key={item.student.id}
                  style={{
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--danger-glow)',
                    border: '1px solid var(--danger)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {item.student.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Turma: <strong>{item.student.schoolClass || 'Sem Turma'}</strong> · Responsável: {item.student.guardianName || 'Não Informado'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-admin" style={{ fontSize: 11 }}>
                      {item.absences} Faltas Registradas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
