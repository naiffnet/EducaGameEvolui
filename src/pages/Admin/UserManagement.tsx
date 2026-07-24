import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../../db/database';
import type { User, UserRole, RpgClass, EnrollmentEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { createDefaultDailyProgress } from '../../engine/EvolutionEngine';
import { hashPassword } from '../../engine/AuthUtils';
import {
  ShieldCheck, UserPlus, Search, Trash2, Eye, Edit3, Save, X,
  BookOpen, GraduationCap, Users, TrendingUp, Check, Award, IdCard, KeyRound,
  Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Briefcase, UserCheck, ShieldAlert, Sparkles, Building2
} from 'lucide-react';
import { Profile } from '../Profile';
import { AcademicHistory } from '../Student/AcademicHistory';

type ViewMode = 'list' | 'profile' | 'academic';
type CategoryTab = 'ALL' | 'STUDENT' | 'INSTRUCTOR' | 'GUARDIAN' | 'MANAGEMENT' | 'ADMIN';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: 'Aluno',
  INSTRUCTOR: 'Professor',
  ADMIN: 'Administrador',
  MAINTENANCE: 'Suporte',
  GUARDIAN: 'Responsável',
  COORDINATOR: 'Coordenação',
  DIRECTOR: 'Direção'
};

const DEFAULT_STATS: Record<RpgClass, { strength: number; intelligence: number; dexterity: number }> = {
  MAGE: { strength: 8, intelligence: 30, dexterity: 14 },
  WARRIOR: { strength: 30, intelligence: 10, dexterity: 16 },
  RANGER: { strength: 12, intelligence: 16, dexterity: 28 },
  NECROMANCER: { strength: 10, intelligence: 28, dexterity: 14 },
  QUEEN: { strength: 16, intelligence: 22, dexterity: 20 },
  SCHOLAR: { strength: 6, intelligence: 32, dexterity: 12 },
  SMITH: { strength: 26, intelligence: 14, dexterity: 20 },
  PYROMANCER: { strength: 20, intelligence: 20, dexterity: 12 },
  PIRATE: { strength: 22, intelligence: 14, dexterity: 24 },
  JESTER: { strength: 8, intelligence: 22, dexterity: 30 },
  CHAMPION: { strength: 24, intelligence: 22, dexterity: 22 },
};

const INITIAL_SKILL: Record<RpgClass, string> = {
  MAGE: 'Projétil Arcano', WARRIOR: 'Golpe Flamejante', RANGER: 'Tiro Certeiro',
  NECROMANCER: 'Invocar Espectro', QUEEN: 'Aura Real', SCHOLAR: 'Leitura Arcana',
  SMITH: 'Forja Trovejante', PYROMANCER: 'Bola de Fogo', PIRATE: 'Golpe do Cutlass',
  JESTER: 'Ilusão Cômica', CHAMPION: 'Brado do Herói',
};

function ProgressBar({ pct, color = 'var(--primary)' }: { pct: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 28 }}>{pct}%</span>
    </div>
  );
}

// ─── Enrollment Modal ─────────────────────────────────────────────────────────
interface EnrollModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}
const EnrollModal: React.FC<EnrollModalProps> = ({ user, onClose, onSave }) => {
  const courses = db.getCourses();
  const record = db.getAcademicRecord(user.id);

  const getEnrollStatus = (courseId: string): EnrollmentEntry['status'] | null => {
    const e = record.enrollmentHistory.find(x => x.courseId === courseId);
    return e?.status ?? null;
  };

  const toggle = (courseId: string, courseName: string, currentStatus: EnrollmentEntry['status'] | null) => {
    if (currentStatus === 'active') {
      db.updateEnrollmentStatus(user.id, courseId, 'dropped');
    } else {
      db.addEnrollment(user.id, {
        courseId,
        courseName,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progressPercent: 0,
      });
    }
    onSave();
  };

  const markComplete = (courseId: string) => {
    db.updateEnrollmentStatus(user.id, courseId, 'completed');
    onSave();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'linear-gradient(145deg,#1e1b4b,#0f172a)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: 32, width: 480, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
            <BookOpen size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#8b5cf6' }} />
            Matrículas — {user.name}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {courses.map(c => {
            const status = getEnrollStatus(c.id);
            const isActive = status === 'active';
            const isDone = status === 'completed';
            return (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : isDone ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{c.difficulty} • {c.category}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isActive && (
                      <button onClick={() => markComplete(c.id)} title="Marcar como concluído"
                        style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '4px 8px', color: '#8b5cf6', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={12} /> Concluir
                      </button>
                    )}
                    <button
                      onClick={() => toggle(c.id, c.title, status)}
                      style={{
                        background: isActive ? 'rgba(239,68,68,0.15)' : isDone ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.15)',
                        border: `1px solid ${isActive ? 'rgba(239,68,68,0.4)' : isDone ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.4)'}`,
                        borderRadius: 8, padding: '4px 10px', cursor: isDone ? 'not-allowed' : 'pointer', color: isActive ? '#ef4444' : isDone ? 'rgba(255,255,255,0.4)' : '#22c55e',
                        fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                      }}
                      disabled={isDone}
                    >
                      {isActive ? 'Cancelar' : isDone ? '✓ Concluído' : '+ Matricular'}
                    </button>
                  </div>
                </div>
                {status && (
                  <div style={{ fontSize: 11, color: isActive ? '#22c55e' : isDone ? '#8b5cf6' : '#ef4444', fontWeight: 600 }}>
                    {isActive ? '● Ativo' : isDone ? '✓ Concluído' : '✗ Cancelado'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: 24 }}>Fechar</button>
      </div>
    </div>
  );
};

// ─── Registration Modal ───────────────────────────────────────────────────────
interface RegistrationModalProps {
  user: User;
  onClose: () => void;
  onSave: (updated: User) => void;
}
const RegistrationModal: React.FC<RegistrationModalProps> = ({ user, onClose, onSave }) => {
  const [registrationId, setRegistrationId] = useState(user.registrationId || '');
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [guardianName, setGuardianName] = useState(user.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(user.guardianPhone || '');

  const fieldStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '10px 12px',
    color: '#fff', fontSize: 14,
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 };

  const handleSave = () => {
    onSave({
      ...user,
      registrationId: registrationId.trim() || undefined,
      birthDate: birthDate || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      guardianPhone: guardianPhone.trim() || undefined,
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'linear-gradient(145deg,#1e1b4b,#0f172a)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: 32, width: 460, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
            <IdCard size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#8b5cf6' }} />
            Cadastro — {user.name}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Matrícula</label>
            <input style={fieldStyle} value={registrationId} onChange={e => setRegistrationId(e.target.value)} placeholder="Ex: 2026-0142" />
          </div>
          <div>
            <label style={labelStyle}>Data de Nascimento</label>
            <input type="date" style={fieldStyle} value={birthDate} onChange={e => setBirthDate(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Telefone</label>
            <input style={fieldStyle} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
            <label style={labelStyle}>Nome do Responsável</label>
            <input style={fieldStyle} value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <label style={labelStyle}>Telefone do Responsável</label>
            <input style={fieldStyle} value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Save size={15} /> Salvar Cadastro
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Password Reset Modal ────────────────────────────────────────────────────
interface PasswordResetModalProps {
  user: User;
  onClose: () => void;
  onSave: (newPassword: string) => void;
}
const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ user, onClose, onSave }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const fieldStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '10px 12px',
    color: '#fff', fontSize: 14,
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 600 };

  const canSave = password.length >= 4 && password === confirm;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'linear-gradient(145deg,#1e1b4b,#0f172a)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: 32, width: 400, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
            <KeyRound size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#8b5cf6' }} />
            Redefinir Senha
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>Nova senha para <strong style={{ color: '#fff' }}>{user.name}</strong>.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nova senha (mín. 4 caracteres)</label>
            <input type="password" style={fieldStyle} value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={labelStyle}>Confirmar senha</label>
            <input type="password" style={fieldStyle} value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {password && confirm && password !== confirm && (
            <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>As senhas não coincidem.</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={() => onSave(password)} disabled={!canSave} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Save size={15} /> Salvar Senha
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Guardian Link Modal ─────────────────────────────────────────────────────
interface GuardianLinkModalProps {
  user: User;
  allUsers: User[];
  onClose: () => void;
  onRefresh: () => void;
}
const GuardianLinkModal: React.FC<GuardianLinkModalProps> = ({ user, allUsers, onClose, onRefresh }) => {
  const [relationship, setRelationship] = useState('Pai');
  const [selectedTargetId, setSelectedTargetId] = useState('');

  const isGuardian = user.role === 'GUARDIAN';
  const isStudent = user.role === 'STUDENT';

  const targetCandidates = allUsers.filter(u => isGuardian ? u.role === 'STUDENT' : u.role === 'GUARDIAN');
  const currentLinks = isGuardian ? db.getStudentsForGuardian(user.id) : db.getGuardiansForStudent(user.id);
  const rawLinks = db.getGuardianLinks();

  const handleAddLink = () => {
    if (!selectedTargetId) return;
    const guardianUserId = isGuardian ? user.id : selectedTargetId;
    const studentUserId = isStudent ? user.id : selectedTargetId;

    db.addGuardianLink({
      id: `link-${Date.now()}`,
      guardianUserId,
      studentUserId,
      relationship,
      createdAt: new Date().toISOString()
    });
    setSelectedTargetId('');
    onRefresh();
  };

  const handleRemoveLink = (linkId: string) => {
    db.removeGuardianLink(linkId);
    onRefresh();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'linear-gradient(145deg,#1e1b4b,#0f172a)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: 32, width: 480, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: '#8b5cf6' }} />
            {isGuardian ? `Dependentes de ${user.name}` : `Responsáveis de ${user.name}`}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 10 }}>Vínculos Atuais:</h4>
          {isGuardian ? (
            (currentLinks as User[]).length === 0 ? (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Nenhum estudante vinculado ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(currentLinks as User[]).map(st => {
                  const linkObj = rawLinks.find(l => l.guardianUserId === user.id && l.studentUserId === st.id);
                  return (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{st.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{st.email} · {st.schoolClass || 'Sem Turma'} ({linkObj?.relationship || 'Responsável'})</div>
                      </div>
                      {linkObj && (
                        <button onClick={() => handleRemoveLink(linkObj.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11, color: '#ef4444' }}>
                          Desvincular
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            (currentLinks as { guardian: User; relationship: string; linkId: string }[]).length === 0 ? (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Nenhum responsável vinculado ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(currentLinks as { guardian: User; relationship: string; linkId: string }[]).map(g => (
                  <div key={g.linkId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{g.guardian.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{g.guardian.email} ({g.relationship})</div>
                    </div>
                    <button onClick={() => handleRemoveLink(g.linkId)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11, color: '#ef4444' }}>
                      Desvincular
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
          <h4 style={{ color: '#fff', fontSize: 13, marginBottom: 12 }}>Adicionar Novo Vínculo</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                {isGuardian ? 'Selecionar Estudante' : 'Selecionar Responsável'}
              </label>
              <select
                value={selectedTargetId}
                onChange={e => setSelectedTargetId(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13 }}
              >
                <option value="" style={{ background: '#0f172a' }}>-- Selecionar --</option>
                {targetCandidates.map(tc => (
                  <option key={tc.id} value={tc.id} style={{ background: '#0f172a' }}>
                    {tc.name} ({tc.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Grau de Parentesco / Relação</label>
              <input
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="Ex: Pai, Mãe, Tutor Legal"
                style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13 }}
              />
            </div>
            <button
              onClick={handleAddLink}
              disabled={!selectedTargetId}
              className="btn btn-primary"
              style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <UserPlus size={15} /> Vincular Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Inline Edit Row ──────────────────────────────────────────────────────────
interface EditRowProps {
  user: User;
  onSave: (updated: User) => void;
  onCancel: () => void;
}
const EditRow: React.FC<EditRowProps> = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [schoolClass, setSchoolClass] = useState(user.schoolClass || '');

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    onSave({ ...user, name: name.trim(), email: email.trim(), role, schoolClass: schoolClass.trim() || undefined });
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-tertiary)', border: '1px solid var(--primary)',
    borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 13, width: '100%',
  };

  return (
    <tr style={{ background: 'rgba(139,92,246,0.08)' }}>
      <td style={{ padding: '10px 16px' }}>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        {role === 'STUDENT' && (
          <input
            style={{ ...inputStyle, marginTop: 6 }}
            value={schoolClass}
            onChange={e => setSchoolClass(e.target.value)}
            placeholder="Turma (ex: 9º Ano A)"
          />
        )}
      </td>
      <td style={{ padding: '10px 16px' }}><input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} type="email" /></td>
      <td style={{ padding: '10px 16px' }}>
        <select value={role} onChange={e => setRole(e.target.value as UserRole)}
          style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="STUDENT">Aluno</option>
          <option value="INSTRUCTOR">Professor</option>
          <option value="COORDINATOR">Coordenação</option>
          <option value="DIRECTOR">Direção</option>
          <option value="GUARDIAN">Responsável</option>
          <option value="ADMIN">Administrador</option>
          <option value="MAINTENANCE">Suporte</option>
        </select>
      </td>
      <td style={{ padding: '10px 16px' }} colSpan={2}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Save size={13} /> Salvar
          </button>
          <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={13} /> Cancelar
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const UserManagement: React.FC = () => {
  const { refreshUser } = useAuth();
  const { addLog } = useSystem();

  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Categorization & Filtering States
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form & Modals States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT');
  const [newUserClass, setNewUserClass] = useState<RpgClass>('MAGE');
  const [newUserSchoolClass, setNewUserSchoolClass] = useState('');
  const [newUserRegistrationId, setNewUserRegistrationId] = useState('');
  const [newUserBirthDate, setNewUserBirthDate] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserGuardianName, setNewUserGuardianName] = useState('');
  const [newUserGuardianPhone, setNewUserGuardianPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [enrollModalUser, setEnrollModalUser] = useState<User | null>(null);
  const [registrationModalUser, setRegistrationModalUser] = useState<User | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [guardianLinkUser, setGuardianLinkUser] = useState<User | null>(null);

  const loadUsers = useCallback(() => {
    setUsers(db.getUsers());
    refreshUser();
  }, [refreshUser]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedClassFilter, itemsPerPage]);

  // ── Available Classes Filter List ──────────────────────────────────────────
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => {
      if (u.schoolClass) set.add(u.schoolClass);
    });
    return Array.from(set).sort();
  }, [users]);

  // ── Tab Category Counts ────────────────────────────────────────────────────
  const counts = useMemo(() => {
    return {
      ALL: users.length,
      STUDENT: users.filter(u => u.role === 'STUDENT').length,
      INSTRUCTOR: users.filter(u => u.role === 'INSTRUCTOR').length,
      GUARDIAN: users.filter(u => u.role === 'GUARDIAN').length,
      MANAGEMENT: users.filter(u => u.role === 'COORDINATOR' || u.role === 'DIRECTOR').length,
      ADMIN: users.filter(u => u.role === 'ADMIN' || u.role === 'MAINTENANCE').length,
    };
  }, [users]);

  // ── Metrics Summary ────────────────────────────────────────────────────────
  const students = useMemo(() => users.filter(u => u.role === 'STUDENT'), [users]);
  const avgProgress = useMemo(() => students.length
    ? Math.round(students.reduce((acc, s) => acc + db.getOverallProgress(s.id), 0) / students.length)
    : 0, [students]);
  const totalGrades = useMemo(() => students.reduce((acc, s) => acc + db.getAcademicRecord(s.id).grades.length, 0), [students]);

  // ── Filtering Logic ────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter(u => {
      // Tab Category Filter
      let tabMatch = true;
      if (activeTab === 'STUDENT') tabMatch = u.role === 'STUDENT';
      else if (activeTab === 'INSTRUCTOR') tabMatch = u.role === 'INSTRUCTOR';
      else if (activeTab === 'GUARDIAN') tabMatch = u.role === 'GUARDIAN';
      else if (activeTab === 'MANAGEMENT') tabMatch = u.role === 'COORDINATOR' || u.role === 'DIRECTOR';
      else if (activeTab === 'ADMIN') tabMatch = u.role === 'ADMIN' || u.role === 'MAINTENANCE';

      if (!tabMatch) return false;

      // Class Filter
      if (selectedClassFilter !== 'ALL') {
        if (u.schoolClass !== selectedClassFilter) return false;
      }

      // Search Query Filter (Name, Email, RegistrationId, SchoolClass)
      if (q) {
        const nameMatch = u.name.toLowerCase().includes(q);
        const emailMatch = u.email.toLowerCase().includes(q);
        const regMatch = u.registrationId ? u.registrationId.toLowerCase().includes(q) : false;
        const classMatch = u.schoolClass ? u.schoolClass.toLowerCase().includes(q) : false;
        if (!nameMatch && !emailMatch && !regMatch && !classMatch) return false;
      }

      return true;
    });
  }, [users, activeTab, searchQuery, selectedClassFilter]);

  // ── Pagination Calculation ─────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDeleteUser = (userId: string, userName: string) => {
    if (!window.confirm(`Excluir "${userName}"? Todos os registros acadêmicos serão removidos.`)) return;
    db.deleteUser(userId);
    loadUsers();
    addLog('Exclusão de Usuário', `Usuário ${userName} excluído da base de dados.`, 'error');
  };

  const handleEditSave = (updated: User) => {
    db.updateUser(updated);
    setEditingUserId(null);
    loadUsers();
    addLog('Edição de Usuário', `Dados de ${updated.name} (${updated.role}) atualizados.`, 'success');
  };

  const handleRegistrationSave = (updated: User) => {
    db.updateUser(updated);
    setRegistrationModalUser(null);
    loadUsers();
    addLog('Cadastro Atualizado', `Cadastro estendido de ${updated.name} atualizado.`, 'success');
  };

  const handlePasswordReset = (newPassword: string) => {
    if (!passwordResetUser) return;
    const updated: User = { ...passwordResetUser, passwordHash: hashPassword(newPassword, passwordResetUser.email) };
    db.updateUser(updated);
    setPasswordResetUser(null);
    loadUsers();
    addLog('Senha Redefinida', `Senha de ${updated.name} foi redefinida pelo administrador.`, 'warning');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    if (newUserPassword.length < 4) {
      alert('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (db.getUsers().some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      alert('Este e-mail já está sendo utilizado!');
      return;
    }
    const newId = `user-${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      passwordHash: hashPassword(newUserPassword, newUserEmail.trim()),
      role: newUserRole,
      schoolClass: newUserRole === 'STUDENT' && newUserSchoolClass.trim() ? newUserSchoolClass.trim() : undefined,
      registrationId: newUserRole === 'STUDENT' && newUserRegistrationId.trim() ? newUserRegistrationId.trim() : undefined,
      birthDate: newUserRole === 'STUDENT' && newUserBirthDate ? newUserBirthDate : undefined,
      phoneNumber: newUserRole === 'STUDENT' && newUserPhone.trim() ? newUserPhone.trim() : undefined,
      guardianName: newUserRole === 'STUDENT' && newUserGuardianName.trim() ? newUserGuardianName.trim() : undefined,
      guardianPhone: newUserRole === 'STUDENT' && newUserGuardianPhone.trim() ? newUserGuardianPhone.trim() : undefined,
      enrolledCourses: [],
      completedLessons: [],
      unlockedBadges: newUserRole === 'STUDENT' ? ['Recruta Arcano'] : [],
      teacherNotes: [],
      rpgCharacter: newUserRole === 'STUDENT' ? {
        selectedClass: newUserClass,
        level: 1,
        xp: 0,
        unlockedSkills: [INITIAL_SKILL[newUserClass]],
        stats: DEFAULT_STATS[newUserClass],
        milestones: [],
        dailyProgress: createDefaultDailyProgress(),
      } : undefined,
    };
    db.addUser(newUser);
    setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('STUDENT'); setNewUserSchoolClass('');
    setNewUserRegistrationId(''); setNewUserBirthDate(''); setNewUserPhone('');
    setNewUserGuardianName(''); setNewUserGuardianPhone(''); setShowAddForm(false);
    loadUsers();
    addLog('Criação de Usuário', `Novo usuário criado: ${newUser.name} (${newUser.role})`, 'success');
  };

  // ── Sub-views ────────────────────────────────────────────────────────────
  if (view === 'profile' && selectedUserId) {
    return <Profile userId={selectedUserId} onBack={() => { setView('list'); setSelectedUserId(null); loadUsers(); }} />;
  }
  if (view === 'academic' && selectedUserId) {
    return <AcademicHistory userId={selectedUserId} onBack={() => { setView('list'); setSelectedUserId(null); loadUsers(); }} />;
  }

  const TABS_CONFIG: { id: CategoryTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'ALL', label: 'Todos os Registros', icon: <Users size={16} />, count: counts.ALL },
    { id: 'STUDENT', label: 'Alunos', icon: <GraduationCap size={16} />, count: counts.STUDENT },
    { id: 'INSTRUCTOR', label: 'Professores', icon: <UserCheck size={16} />, count: counts.INSTRUCTOR },
    { id: 'GUARDIAN', label: 'Responsáveis', icon: <Users size={16} />, count: counts.GUARDIAN },
    { id: 'MANAGEMENT', label: 'Gestão & Coordenação', icon: <Building2 size={16} />, count: counts.MANAGEMENT },
    { id: 'ADMIN', label: 'Admin & Suporte', icon: <ShieldAlert size={16} />, count: counts.ADMIN },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4px 0' }} role="region" aria-label="Gerenciador de Usuários">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={28} style={{ color: 'var(--primary)' }} /> Gestão Integrada de Usuários
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Controle de perfis por categoria · Filtros de turma · Matrículas · Vínculos familiares · RBAC
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 14 }}>
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: <Users size={22} />, label: 'Usuários Cadastrados', value: users.length, color: 'var(--primary)' },
          { icon: <GraduationCap size={22} />, label: 'Estudantes Ativos', value: students.length, color: '#3b82f6' },
          { icon: <TrendingUp size={22} />, label: 'Engajamento Médio', value: `${avgProgress}%`, color: 'var(--success)' },
          { icon: <Award size={22} />, label: 'Notas Registradas', value: totalGrades, color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: 28, borderLeft: '4px solid var(--primary)', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={20} style={{ color: 'var(--primary)' }} /> Cadastrar Novo Usuário no Sistema
          </h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            <div>
              <label htmlFor="new-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Nome Completo</label>
              <input id="new-name" type="text" className="form-input" placeholder="Ex: João Souza"
                value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="new-email" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>E-mail de Acesso</label>
              <input id="new-email" type="email" className="form-input" placeholder="joao@escola.com"
                value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="new-password" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Senha Padrão (mín. 4 chars)</label>
              <input id="new-password" type="password" className="form-input" placeholder="••••••••"
                value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required minLength={4} />
            </div>
            <div>
              <label htmlFor="new-role" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Perfil / Função</label>
              <select id="new-role" className="form-select" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)}>
                <option value="STUDENT">Aluno</option>
                <option value="INSTRUCTOR">Professor</option>
                <option value="COORDINATOR">Coordenação Pedagógica</option>
                <option value="DIRECTOR">Direção Escolar</option>
                <option value="GUARDIAN">Responsável (Família)</option>
                <option value="ADMIN">Administrador</option>
                <option value="MAINTENANCE">Suporte Técnico</option>
              </select>
            </div>
            {newUserRole === 'STUDENT' && (
              <div>
                <label htmlFor="new-school-class" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Turma</label>
                <input id="new-school-class" type="text" className="form-input" placeholder="Ex: 9º Ano A"
                  value={newUserSchoolClass} onChange={e => setNewUserSchoolClass(e.target.value)} />
              </div>
            )}
            {newUserRole === 'STUDENT' && (
              <div>
                <label htmlFor="new-class" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Classe RPG</label>
                <select id="new-class" className="form-select" value={newUserClass} onChange={e => setNewUserClass(e.target.value as RpgClass)}>
                  <option value="MAGE">🔮 Arcano</option>
                  <option value="WARRIOR">⚔️ Cruzado</option>
                  <option value="RANGER">🏹 Caçador</option>
                  <option value="NECROMANCER">💀 Nigromante</option>
                  <option value="QUEEN">👑 Soberana</option>
                  <option value="SCHOLAR">📚 Erudito</option>
                  <option value="SMITH">🔨 Ferreiro Rúnico</option>
                  <option value="PYROMANCER">🔥 Flamejante</option>
                  <option value="PIRATE">🏴‍☠️ Corsário</option>
                  <option value="JESTER">🎭 Bufão</option>
                  <option value="CHAMPION">🏆 Campeão</option>
                </select>
              </div>
            )}
            {newUserRole === 'STUDENT' && (
              <>
                <div>
                  <label htmlFor="new-registration-id" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Matrícula</label>
                  <input id="new-registration-id" type="text" className="form-input" placeholder="Ex: 2026-0142"
                    value={newUserRegistrationId} onChange={e => setNewUserRegistrationId(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-birth-date" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Data de Nascimento</label>
                  <input id="new-birth-date" type="date" className="form-input"
                    value={newUserBirthDate} onChange={e => setNewUserBirthDate(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-phone" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Telefone</label>
                  <input id="new-phone" type="text" className="form-input" placeholder="(00) 00000-0000"
                    value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-guardian-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Nome do Responsável</label>
                  <input id="new-guardian-name" type="text" className="form-input" placeholder="Nome completo"
                    value={newUserGuardianName} onChange={e => setNewUserGuardianName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-guardian-phone" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Telefone do Responsável</label>
                  <input id="new-guardian-phone" type="text" className="form-input" placeholder="(00) 00000-0000"
                    value={newUserGuardianPhone} onChange={e => setNewUserGuardianPhone(e.target.value)} />
                </div>
              </>
            )}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Cadastrar Usuário</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS_CONFIG.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 14px rgba(139,92,246,0.3)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-tertiary)',
                color: isActive ? '#fff' : 'var(--text-tertiary)', fontWeight: 800
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Controls Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', borderRadius: 16 }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '8px 14px', borderRadius: 12, border: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, matrícula ou turma..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: 13 }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* School Class Filter */}
        {(activeTab === 'ALL' || activeTab === 'STUDENT') && availableClasses.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
            <select
              className="form-select"
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 10 }}
            >
              <option value="ALL">Todas as Turmas</option>
              {availableClasses.map(ac => (
                <option key={ac} value={ac}>{ac}</option>
              ))}
            </select>
          </div>
        )}

        {/* Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>Exibir:</span>
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
            style={{ padding: '8px 10px', fontSize: 13, borderRadius: 10 }}
          >
            <option value={10}>10 por pág.</option>
            <option value={25}>25 por pág.</option>
            <option value={50}>50 por pág.</option>
            <option value={100}>100 por pág.</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuário / Detalhes</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contato / Matrícula</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Perfil / Função</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 140 }}>Desempenho</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: 320 }}>Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, idx) => {
                const progress = user.role === 'STUDENT' ? db.getOverallProgress(user.id) : null;
                const avg = user.role === 'STUDENT' ? db.getAverageGrade(user.id) : null;

                if (editingUserId === user.id) {
                  return <EditRow key={user.id} user={user} onSave={handleEditSave} onCancel={() => setEditingUserId(null)} />;
                }

                return (
                  <tr key={user.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 12,
                          background: user.role === 'STUDENT' ? 'rgba(139,92,246,0.15)' : user.role === 'INSTRUCTOR' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                          color: user.role === 'STUDENT' ? '#8b5cf6' : user.role === 'INSTRUCTOR' ? '#3b82f6' : '#f59e0b', fontSize: 14
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{user.name}</div>
                          {user.rpgCharacter ? (
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                              <span>⚔️ Nv.{user.rpgCharacter.level} {user.rpgCharacter.selectedClass}</span>
                              {user.schoolClass && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>· 🏫 {user.schoolClass}</span>}
                            </div>
                          ) : (
                            user.schoolClass && <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>🏫 {user.schoolClass}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                      <div>{user.email}</div>
                      {user.registrationId && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          Matrícula: <strong style={{ color: 'var(--text-secondary)' }}>{user.registrationId}</strong>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                      <span className={`badge badge-${user.role.toLowerCase()}`} style={{ fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                        {ROLE_LABEL[user.role]}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', minWidth: 140 }}>
                      {progress !== null ? (
                        <div>
                          <ProgressBar pct={progress} color={progress >= 70 ? 'var(--success)' : progress >= 40 ? 'var(--warning)' : 'var(--danger)'} />
                          {avg !== null && (
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                              Média: <span style={{ color: avg >= 7 ? 'var(--success)' : avg >= 5 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>{avg}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>N/A</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { setSelectedUserId(user.id); setView('profile'); }}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Ver Perfil Detalhado"
                        >
                          <Eye size={13} /> Perfil
                        </button>

                        {user.role === 'STUDENT' && (
                          <>
                            <button
                              onClick={() => { setSelectedUserId(user.id); setView('academic'); }}
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                              title="Histórico Escolar"
                            >
                              <GraduationCap size={13} /> Histórico
                            </button>
                            <button
                              onClick={() => setEnrollModalUser(user)}
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                              title="Gerenciar Matrículas"
                            >
                              <BookOpen size={13} /> Matrículas
                            </button>
                            <button
                              onClick={() => setRegistrationModalUser(user)}
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                              title="Cadastro Estendido"
                            >
                              <IdCard size={13} /> Cadastro
                            </button>
                          </>
                        )}

                        {(user.role === 'GUARDIAN' || user.role === 'STUDENT') && (
                          <button
                            onClick={() => setGuardianLinkUser(user)}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                            title="Gerenciar Vínculos Familiares"
                          >
                            <Users size={13} /> Vínculos
                          </button>
                        )}

                        <button
                          onClick={() => setEditingUserId(user.id)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Editar Registro"
                        >
                          <Edit3 size={13} /> Editar
                        </button>

                        <button
                          onClick={() => setPasswordResetUser(user)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Redefinir Senha de Acesso"
                        >
                          <KeyRound size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          title="Excluir Usuário"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-tertiary)' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Nenhum usuário encontrado</div>
                    <div style={{ fontSize: 13 }}>Tente ajustar a busca por nome/e-mail ou trocar de aba.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {filteredUsers.length > 0 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border)',
            flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text-secondary)'
          }}>
            <div>
              Exibindo <strong style={{ color: 'var(--text-primary)' }}>{startIndex + 1}</strong> a <strong style={{ color: 'var(--text-primary)' }}>{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{filteredUsers.length}</strong> usuários
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: 12, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                title="Primeira Página"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: 12, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                title="Página Anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ padding: '0 8px', fontWeight: 600 }}>
                Página <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: 12, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                title="Próxima Página"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: 12, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                title="Última Página"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      {enrollModalUser && (
        <EnrollModal
          user={enrollModalUser}
          onClose={() => { setEnrollModalUser(null); loadUsers(); }}
          onSave={loadUsers}
        />
      )}

      {/* Registration Modal */}
      {registrationModalUser && (
        <RegistrationModal
          user={registrationModalUser}
          onClose={() => setRegistrationModalUser(null)}
          onSave={handleRegistrationSave}
        />
      )}

      {/* Password Reset Modal */}
      {passwordResetUser && (
        <PasswordResetModal
          user={passwordResetUser}
          onClose={() => setPasswordResetUser(null)}
          onSave={handlePasswordReset}
        />
      )}

      {/* Guardian Link Modal */}
      {guardianLinkUser && (
        <GuardianLinkModal
          user={guardianLinkUser}
          allUsers={users}
          onClose={() => setGuardianLinkUser(null)}
          onRefresh={loadUsers}
        />
      )}

      {/* RBAC Info */}
      <div style={{ marginTop: 28, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <ShieldCheck size={18} style={{ color: 'var(--success)' }} /> Controle de Acesso por Perfil (RBAC)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, fontSize: 13 }}>
          {[
            { label: 'Aluno', color: 'var(--primary)', desc: 'Catálogo, player de aulas, progresso, exercícios, histórico escolar.' },
            { label: 'Professor', color: 'var(--accent)', desc: 'Painel do instrutor, editor de cursos, diário de classe e missões.' },
            { label: 'Coordenação / Direção', color: '#ec4899', desc: 'Painel pedagógico, diagnósticos de engajamento e relatórios.' },
            { label: 'Responsável', color: '#10b981', desc: 'Portal da Família em modo leitura, boletins e extrato financeiro.' },
            { label: 'Administrador', color: 'var(--danger)', desc: 'Controle total: cursos, usuários, matrículas, notas e financeiro.' },
          ].map(r => (
            <div key={r.label}>
              <strong style={{ color: r.color }}>{r.label}</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
