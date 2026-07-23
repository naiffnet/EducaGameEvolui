import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/database';
import type { User, UserRole, RpgClass, EnrollmentEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { createDefaultDailyProgress } from '../../engine/EvolutionEngine';
import { hashPassword } from '../../engine/AuthUtils';
import {
  ShieldCheck, UserPlus, Search, Trash2, Eye, Edit3, Save, X,
  BookOpen, GraduationCap, Users, TrendingUp, Check, Award, IdCard, KeyRound
} from 'lucide-react';
import { Profile } from '../Profile';
import { AcademicHistory } from '../Student/AcademicHistory';

type ViewMode = 'list' | 'profile' | 'academic';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: 'Aluno', INSTRUCTOR: 'Professor', ADMIN: 'Administrador', MAINTENANCE: 'Suporte'
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
// Nota de estilo: este modal (e o RegistrationModal logo abaixo) usam deliberadamente um
// fundo escuro fixo, independente do tema da página — mesmo padrão usado no Livro de Notas.
// Fundo escuro + texto claro são sempre pareados aqui, então continuam legíveis nos três
// temas; o que precisava de correção era o restante da página (fora dos modais).
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
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

// ─── Registration (Cadastro Estendido) Modal ─────────────────────────────────
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
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

// ─── Password Reset Modal (Entrega I) ────────────────────────────────────────
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
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

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

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

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [enrollModalUser, setEnrollModalUser] = useState<User | null>(null);
  const [registrationModalUser, setRegistrationModalUser] = useState<User | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newUserPassword, setNewUserPassword] = useState('');

  const loadUsers = useCallback(() => {
    setUsers(db.getUsers());
    refreshUser();
  }, [refreshUser]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Stats Summary ────────────────────────────────────────────────────────
  const students = users.filter(u => u.role === 'STUDENT');
  const avgProgress = students.length
    ? Math.round(students.reduce((acc, s) => acc + db.getOverallProgress(s.id), 0) / students.length)
    : 0;
  const totalGrades = students.reduce((acc, s) => acc + db.getAcademicRecord(s.id).grades.length, 0);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteUser = (userId: string, userName: string) => {
    if (!window.confirm(`Excluir "${userName}"? Todos os registros acadêmicos serão removidos.`)) return;
    db.deleteUser(userId);
    loadUsers();
    addLog('Exclusão de Usuário', `Usuário ${userName} excluído da base de dados.`, 'error');
  };

  // ── Inline Edit Save ─────────────────────────────────────────────────────
  const handleEditSave = (updated: User) => {
    db.updateUser(updated);
    setEditingUserId(null);
    loadUsers();
    addLog('Edição de Usuário', `Dados de ${updated.name} (${updated.role}) atualizados.`, 'success');
  };

  // ── Registration (Cadastro Estendido) Save ───────────────────────────────
  const handleRegistrationSave = (updated: User) => {
    db.updateUser(updated);
    setRegistrationModalUser(null);
    loadUsers();
    addLog('Cadastro Atualizado', `Cadastro estendido de ${updated.name} atualizado.`, 'success');
  };

  // ── Password Reset (Entrega I) ───────────────────────────────────────────
  const handlePasswordReset = (newPassword: string) => {
    if (!passwordResetUser) return;
    const updated: User = { ...passwordResetUser, passwordHash: hashPassword(newPassword, passwordResetUser.email) };
    db.updateUser(updated);
    setPasswordResetUser(null);
    loadUsers();
    addLog('Senha Redefinida', `Senha de ${updated.name} foi redefinida pelo administrador.`, 'warning');
  };

  // ── Create User ──────────────────────────────────────────────────────────
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

  const filteredUsers = users.filter(u =>
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (roleFilter === 'ALL' || u.role === roleFilter)
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4px 0' }} role="region" aria-label="Gerenciador de Usuários">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Gerenciamento de Usuários</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            CRUD completo · Matrículas · Histórico Escolar · Notas · RBAC
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { icon: <Users size={20} />, label: 'Usuários Total', value: users.length, color: 'var(--primary)' },
          { icon: <GraduationCap size={20} />, label: 'Alunos', value: students.length, color: 'var(--accent-blue, #3b82f6)' },
          { icon: <TrendingUp size={20} />, label: 'Progresso Médio', value: `${avgProgress}%`, color: 'var(--success)' },
          { icon: <Award size={20} />, label: 'Notas Lançadas', value: totalGrades, color: 'var(--warning)' },
        ].map(c => (
          <div key={c.label} style={{
            flex: 1, minWidth: 140, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: 28, borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Cadastrar Novo Usuário</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            <div>
              <label htmlFor="new-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Nome Completo</label>
              <input id="new-name" type="text" className="form-input" placeholder="Ex: João Souza"
                value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="new-email" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>E-mail</label>
              <input id="new-email" type="email" className="form-input" placeholder="joao@escola.com"
                value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="new-password" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Senha (mín. 4 caracteres)</label>
              <input id="new-password" type="password" className="form-input" placeholder="••••••••"
                value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required minLength={4} />
            </div>
            <div>
              <label htmlFor="new-role" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Função</label>
              <select id="new-role" className="form-select" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)}>
                <option value="STUDENT">Aluno</option>
                <option value="INSTRUCTOR">Professor</option>
                <option value="ADMIN">Administrador</option>
                <option value="MAINTENANCE">Suporte</option>
              </select>
            </div>
            {newUserRole === 'STUDENT' && (
              <div>
                <label htmlFor="new-school-class" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Turma</label>
                <input id="new-school-class" type="text" className="form-input" placeholder="Ex: 9º Ano A"
                  value={newUserSchoolClass} onChange={e => setNewUserSchoolClass(e.target.value)} />
              </div>
            )}
            {newUserRole === 'STUDENT' && (
              <div>
                <label htmlFor="new-class" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Classe RPG</label>
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
                  <label htmlFor="new-registration-id" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Matrícula</label>
                  <input id="new-registration-id" type="text" className="form-input" placeholder="Ex: 2026-0142"
                    value={newUserRegistrationId} onChange={e => setNewUserRegistrationId(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-birth-date" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Data de Nascimento</label>
                  <input id="new-birth-date" type="date" className="form-input"
                    value={newUserBirthDate} onChange={e => setNewUserBirthDate(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-phone" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Telefone</label>
                  <input id="new-phone" type="text" className="form-input" placeholder="(00) 00000-0000"
                    value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-guardian-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Nome do Responsável</label>
                  <input id="new-guardian-name" type="text" className="form-input" placeholder="Nome completo"
                    value={newUserGuardianName} onChange={e => setNewUserGuardianName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="new-guardian-phone" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Telefone do Responsável</label>
                  <input id="new-guardian-phone" type="text" className="form-input" placeholder="(00) 00000-0000"
                    value={newUserGuardianPhone} onChange={e => setNewUserGuardianPhone(e.target.value)} />
                </div>
              </>
            )}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary">Cadastrar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Buscar por nome ou e-mail..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: 13 }} />
        </div>
        <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '7px 12px', fontSize: 13 }}>
          <option value="ALL">Todos os Perfis</option>
          <option value="STUDENT">Alunos</option>
          <option value="INSTRUCTOR">Professores</option>
          <option value="ADMIN">Administradores</option>
          <option value="MAINTENANCE">Suporte</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Nome</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Email</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Perfil</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', minWidth: 130 }}>Progresso</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', minWidth: 320 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const progress = user.role === 'STUDENT' ? db.getOverallProgress(user.id) : null;
                const avg = user.role === 'STUDENT' ? db.getAverageGrade(user.id) : null;

                if (editingUserId === user.id) {
                  return <EditRow key={user.id} user={user} onSave={handleEditSave} onCancel={() => setEditingUserId(null)} />;
                }

                return (
                  <tr key={user.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{user.name}</div>
                      {user.rpgCharacter && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          ⚔️ Nv.{user.rpgCharacter.level} {user.rpgCharacter.selectedClass}
                          {user.schoolClass && <> · 🏫 {user.schoolClass}</>}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{user.email}</td>
                    <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                      <span className={`badge badge-${user.role.toLowerCase()}`}>{ROLE_LABEL[user.role]}</span>
                    </td>
                    <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', minWidth: 130 }}>
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
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => { setSelectedUserId(user.id); setView('profile'); }}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Ver Perfil"
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
                        <button
                          onClick={() => setEditingUserId(user.id)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Editar inline"
                        >
                          <Edit3 size={13} /> Editar
                        </button>
                        <button
                          onClick={() => setPasswordResetUser(user)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Redefinir senha"
                        >
                          <KeyRound size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          title="Excluir usuário"
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

      {/* RBAC Info */}
      <div style={{ marginTop: 28, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
          <ShieldCheck size={18} style={{ color: 'var(--success)' }} /> Controle de Acesso por Perfil (RBAC)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, fontSize: 13 }}>
          {[
            { label: 'Aluno', color: 'var(--primary)', desc: 'Catálogo, player de aulas, progresso, exercícios, histórico escolar.' },
            { label: 'Professor', color: 'var(--accent)', desc: 'Painel do instrutor, editor de cursos, livro de notas, pareceres.' },
            { label: 'Administrador', color: 'var(--danger)', desc: 'Controle total: cursos, usuários, matrículas, notas, auditoria.' },
            { label: 'Suporte', color: 'var(--warning)', desc: 'Modo de manutenção e auditoria de logs operacionais.' },
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
