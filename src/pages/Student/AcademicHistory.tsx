import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/database';
import {
  BookOpen, Award, TrendingUp, CheckCircle, Clock, XCircle,
  ChevronDown, ChevronUp, Printer, GraduationCap, ArrowLeft
} from 'lucide-react';

interface AcademicHistoryProps {
  userId?: string;
  onBack?: () => void;
}

const CONCEPT_COLOR: Record<string, string> = {
  'Excelente':    '#22c55e',
  'Ótimo':        '#84cc16',
  'Bom':          '#eab308',
  'Regular':      '#f97316',
  'Insuficiente': '#ef4444',
};

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:    { label: 'Ativo',      color: '#3b82f6', icon: <Clock size={14} />       },
  completed: { label: 'Concluído', color: '#22c55e', icon: <CheckCircle size={14} /> },
  dropped:   { label: 'Cancelado', color: '#ef4444', icon: <XCircle size={14} />     },
};

function GradeBar({ grade }: { grade: number }) {
  const pct = Math.round((grade / 10) * 100);
  const color = grade >= 7 ? '#22c55e' : grade >= 5 ? '#eab308' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ minWidth: 32, textAlign: 'right', fontWeight: 700, color, fontSize: 14 }}>{grade.toFixed(1)}</span>
    </div>
  );
}

function RadarChart({ strength, intelligence, dexterity }: { strength: number; intelligence: number; dexterity: number }) {
  const max = 30;
  const cx = 80, cy = 80, r = 60;
  const angles = [-90, 30, 150]; // top, bottom-right, bottom-left
  const vals = [strength, intelligence, dexterity];
  const labels = ['Força', 'Inteligência', 'Destreza'];
  const toXY = (angle: number, val: number) => {
    const norm = (val / max) * r;
    const rad = (angle * Math.PI) / 180;
    return { x: cx + norm * Math.cos(rad), y: cy + norm * Math.sin(rad) };
  };
  const outerPts = angles.map(a => toXY(a, max));
  const valPts = angles.map((a, i) => toXY(a, vals[i]));
  const polyOuter = outerPts.map(p => `${p.x},${p.y}`).join(' ');
  const polyVal = valPts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <polygon points={polyOuter} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      <polygon points={polyVal} fill="rgba(139,92,246,0.35)" stroke="#8b5cf6" strokeWidth={2} />
      {valPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#8b5cf6" />
      ))}
      {outerPts.map((p, i) => (
        <text key={i} x={p.x} y={p.y + (angles[i] === -90 ? -8 : 16)} textAnchor="middle"
          fontSize={10} fill="rgba(255,255,255,0.6)">{labels[i]}</text>
      ))}
    </svg>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center',
      flex: 1, minWidth: 160,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{value}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      </div>
    </div>
  );
}

export const AcademicHistory: React.FC<AcademicHistoryProps> = ({ userId, onBack }) => {
  const { currentUser: loggedInUser } = useAuth();
  const targetId = userId || loggedInUser?.id || '';
  const user = db.getUsers().find(u => u.id === targetId);
  const record = db.getAcademicRecord(targetId);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  const averageGrade = useMemo(() => {
    if (!record.grades.length) return null;
    return Math.round((record.grades.reduce((a, g) => a + g.grade, 0) / record.grades.length) * 10) / 10;
  }, [record.grades]);

  const overallProgress = useMemo(() => db.getOverallProgress(targetId), [targetId]);

  const activeEnrollments = record.enrollmentHistory.filter(e => e.status === 'active').length;
  const completedEnrollments = record.enrollmentHistory.filter(e => e.status === 'completed').length;

  if (!user) {
    return <div style={{ padding: 40, color: '#fff' }}>Usuário não encontrado.</div>;
  }

  const rpg = user.rpgCharacter;

  const handlePrint = () => window.print();

  return (
    <div className="academic-history" style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        {onBack && (
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Voltar
          </button>
        )}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>
            <GraduationCap size={26} style={{ marginRight: 10, verticalAlign: 'middle', color: '#8b5cf6' }} />
            Histórico Escolar
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>{user.name} • {user.email}</p>
        </div>
        <button onClick={handlePrint} className="btn btn-secondary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}>
          <Printer size={16} /> Imprimir Boletim
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <SummaryCard icon={<Award size={22} />} label="Média Geral" value={averageGrade !== null ? averageGrade : '—'} color="#8b5cf6" />
        <SummaryCard icon={<TrendingUp size={22} />} label="Progresso Geral" value={`${overallProgress}%`} color="#3b82f6" />
        <SummaryCard icon={<BookOpen size={22} />} label="Matrículas Ativas" value={activeEnrollments} color="#22c55e" />
        <SummaryCard icon={<Award size={22} />} label="Cursos Concluídos" value={completedEnrollments} color="#eab308" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Grade Book Table */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="#eab308" /> Boletim de Notas
          </h2>
          {record.grades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
              <Award size={40} style={{ opacity: 0.3 }} />
              <p style={{ marginTop: 12 }}>Nenhuma nota lançada ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {record.grades.map(g => (
                <div key={g.id}>
                  <div
                    onClick={() => setExpandedGrade(expandedGrade === g.id ? null : g.id)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
                      display: 'grid', gridTemplateColumns: '1fr 180px 100px 28px',
                      alignItems: 'center', gap: 16, transition: 'background 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{g.courseName}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {g.instructorName} • {new Date(g.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <GradeBar grade={g.grade} />
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${CONCEPT_COLOR[g.concept]}22`, color: CONCEPT_COLOR[g.concept],
                      textAlign: 'center',
                    }}>{g.concept}</span>
                    {expandedGrade === g.id ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
                  </div>
                  {expandedGrade === g.id && g.observations && (
                    <div style={{
                      margin: '4px 0 0', padding: '12px 18px', borderRadius: '0 0 12px 12px',
                      background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                      color: 'rgba(255,255,255,0.7)', fontSize: 14, fontStyle: 'italic',
                    }}>
                      💬 {g.observations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollment History */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color="#3b82f6" /> Histórico de Matrículas
          </h2>
          {record.enrollmentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.3)' }}>
              <BookOpen size={36} style={{ opacity: 0.3 }} />
              <p style={{ marginTop: 10, fontSize: 14 }}>Nenhuma matrícula registrada.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {record.enrollmentHistory.map(e => {
                const meta = STATUS_META[e.status];
                return (
                  <div key={e.id} style={{
                    background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px',
                    border: `1px solid ${meta.color}33`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{e.courseName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: meta.color, fontWeight: 600 }}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 6, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${e.progressPercent}%`, height: '100%', background: meta.color, transition: 'width 0.6s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      <span>Início: {new Date(e.enrolledAt).toLocaleDateString('pt-BR')}</span>
                      <span>{e.progressPercent}% concluído</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RPG Stats + Observations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rpg && (
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>⚔️ Stats do Personagem</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RadarChart strength={rpg.stats.strength} intelligence={rpg.stats.intelligence} dexterity={rpg.stats.dexterity} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                {([
                  ['💪 Força', rpg.stats.strength],
                  ['🧠 Intel.', rpg.stats.intelligence],
                  ['🏃 Destr.', rpg.stats.dexterity],
                ] as [string, number][]).map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#8b5cf6' }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Observations */}
          {record.generalObservations && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>📋 Observações Gerais</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>{record.generalObservations}</p>
            </div>
          )}

          {/* Teacher Notes */}
          {user.teacherNotes && user.teacherNotes.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>💬 Pareceres Pedagógicos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {user.teacherNotes.map(n => (
                  <div key={n.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#8b5cf6', fontSize: 13 }}>{n.teacherName}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '4px 0', lineHeight: 1.6 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{new Date(n.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-friendly styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .academic-history { background: white !important; color: black !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
};
