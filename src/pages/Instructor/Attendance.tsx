import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { db } from '../../db/database';
import type { User, AttendanceRecord } from '../../types';
import { grantXp } from '../../engine/EvolutionEngine';
import { ClipboardCheck, Check, X, CalendarDays, Sparkles } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

export const Attendance: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const { addLog } = useSystem();

  const [students, setStudents] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>(todayISO());
  const [todaysRecords, setTodaysRecords] = useState<AttendanceRecord[]>([]);
  const [justGrantedXp, setJustGrantedXp] = useState<Record<string, boolean>>({});

  const loadStudents = useCallback(() => {
    const all = db.getUsers().filter(u => u.role === 'STUDENT');
    setStudents(all);
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Every distinct schoolClass among students, so the instructor can pick a turma
  const schoolClasses = useMemo(() => {
    const set = new Set(students.map(s => s.schoolClass).filter((c): c is string => !!c));
    return Array.from(set).sort();
  }, [students]);

  useEffect(() => {
    if (!selectedClass && schoolClasses.length > 0) {
      setSelectedClass(schoolClasses[0]);
    }
  }, [schoolClasses, selectedClass]);

  const classStudents = useMemo(
    () => students.filter(s => s.schoolClass === selectedClass),
    [students, selectedClass]
  );

  const loadTodaysRecords = useCallback(() => {
    if (!selectedClass) return;
    setTodaysRecords(db.getAttendanceForClassAndDate(selectedClass, date));
  }, [selectedClass, date]);

  useEffect(() => { loadTodaysRecords(); }, [loadTodaysRecords]);

  const getStatus = (studentId: string): boolean | null => {
    const record = todaysRecords.find(r => r.studentId === studentId);
    return record ? record.present : null;
  };

  const markAttendance = (student: User, present: boolean) => {
    if (!currentUser || !selectedClass) return;

    const { xpShouldBeGranted } = db.recordAttendance(
      student.id,
      selectedClass,
      date,
      present,
      currentUser.id
    );

    // Grant XP through the same EvolutionEngine used everywhere else, only once per day/student
    if (xpShouldBeGranted && student.rpgCharacter) {
      const result = grantXp(student.rpgCharacter, 'attendance_confirmed', {
        title: 'Presença Confirmada',
        description: `Presença registrada em ${selectedClass} no dia ${date}.`,
        relatedEntityId: `${student.id}-${date}`,
      });
      const updatedStudent: User = { ...student, rpgCharacter: result.character };
      db.updateUser(updatedStudent);
      setJustGrantedXp(prev => ({ ...prev, [student.id]: true }));
      setTimeout(() => setJustGrantedXp(prev => ({ ...prev, [student.id]: false })), 2500);
    }

    addLog(
      'Chamada Registrada',
      `${present ? 'Presença' : 'Falta'} registrada para ${student.name} (${selectedClass}, ${date}).`
    );

    loadStudents();
    loadTodaysRecords();
    refreshUser();
  };

  const presentCount = classStudents.filter(s => getStatus(s.id) === true).length;

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <ClipboardCheck size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Chamada</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Registre a presença da turma. Cada presença confirmada concede 20 XP ao personagem do estudante, uma única vez por dia.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Turma</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', minWidth: '200px' }}
          >
            {schoolClasses.length === 0 && <option value="">Nenhuma turma cadastrada</option>}
            {schoolClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            <CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Data
          </label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {selectedClass && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          {presentCount} de {classStudents.length} presentes hoje nesta turma.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {classStudents.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)' }}>Nenhum estudante cadastrado nesta turma ainda.</p>
        )}
        {classStudents.map(student => {
          const status = getStatus(student.id);
          return (
            <div
              key={student.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</span>
                {justGrantedXp[student.id] && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success, #22c55e)' }}>
                    <Sparkles size={14} /> +20 XP
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => markAttendance(student, true)}
                  aria-pressed={status === true}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                    backgroundColor: status === true ? 'rgba(34,197,94,0.15)' : 'transparent',
                    color: status === true ? '#22c55e' : 'var(--text-secondary)',
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Check size={16} /> Presente
                </button>
                <button
                  onClick={() => markAttendance(student, false)}
                  aria-pressed={status === false}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                    backgroundColor: status === false ? 'rgba(239,68,68,0.15)' : 'transparent',
                    color: status === false ? '#ef4444' : 'var(--text-secondary)',
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <X size={16} /> Falta
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
