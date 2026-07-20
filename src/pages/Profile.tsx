import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { db } from '../db/database';
import type { User, RpgClass } from '../types';
import { RpgAvatar } from '../components/RpgAvatar';
import { AcademicHistory } from './Student/AcademicHistory';
import { 
  User as UserIcon, 
  Mail, 
  Trophy, 
  Zap, 
  Sparkles, 
  BookOpen, 
  Plus, 
  Trash2, 
  Award,
  ArrowLeft,
  MessageSquare,
  GraduationCap,
  IdCard,
  Phone
} from 'lucide-react';
import { DailyDashboard } from '../components/DailyDashboard';
import { StreakIndicator } from '../components/StreakIndicator';
import { createDefaultDailyProgress } from '../engine/EvolutionEngine';

type ProfileTab = 'geral' | 'historico' | 'pareceres' | 'rpg';

interface ProfileProps {
  userId?: string;
  onBack?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ userId, onBack }) => {
  const { currentUser: loggedInUser, refreshUser } = useAuth();
  const { addLog } = useSystem();
  
  const targetUser = userId 
    ? db.getUsers().find(u => u.id === userId) || loggedInUser 
    : loggedInUser;

  const [name, setName] = useState(targetUser?.name || '');
  const [email, setEmail] = useState(targetUser?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<ProfileTab>('geral');

  useEffect(() => {
    if (targetUser) {
      setName(targetUser.name);
      setEmail(targetUser.email);
    }
  }, [targetUser?.id]);

  if (!targetUser) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Usuário não encontrado</h2>
        {onBack && (
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Voltar
          </button>
        )}
      </div>
    );
  }

  const isSelf = targetUser.id === loggedInUser?.id;
  const isInstructorOrAdmin = loggedInUser?.role === 'INSTRUCTOR' || loggedInUser?.role === 'ADMIN';

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setSaveStatus('error');
      return;
    }

    const updatedUser: User = {
      ...targetUser,
      name,
      email,
    };

    db.updateUser(updatedUser);
    if (isSelf) {
      refreshUser();
    }
    setSaveStatus('success');
    setIsEditing(false);
    setTimeout(() => setSaveStatus('idle'), 3000);

    addLog(
      'Atualização de Perfil',
      `Dados do perfil de ${targetUser.name} foram atualizados.`
    );
  };

  const handleChangeClass = (newClass: RpgClass) => {
    const defaultStats = {
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
    }[newClass];

    const currentCharacter = targetUser.rpgCharacter || {
      level: 1,
      xp: 0,
      unlockedSkills: [],
      stats: defaultStats,
      milestones: [],
      dailyProgress: createDefaultDailyProgress(),
    };

    const initialSkill = {
      MAGE: 'Projétil Arcano',
      WARRIOR: 'Golpe Flamejante',
      RANGER: 'Tiro Certeiro',
      NECROMANCER: 'Invocar Espectro',
      QUEEN: 'Aura Real',
      SCHOLAR: 'Leitura Arcana',
      SMITH: 'Forja Trovejante',
      PYROMANCER: 'Bola de Fogo',
      PIRATE: 'Golpe do Cutlass',
      JESTER: 'Ilusão Cômica',
      CHAMPION: 'Brado do Herói'
    }[newClass];

    const updatedUser: User = {
      ...targetUser,
      rpgCharacter: {
        ...currentCharacter,
        selectedClass: newClass,
        unlockedSkills: [initialSkill, ...currentCharacter.unlockedSkills.filter(s => s !== initialSkill)],
        stats: defaultStats
      }
    };

    db.updateUser(updatedUser);
    if (isSelf) {
      refreshUser();
    } else {
      window.location.reload();
    }

    addLog(
      'Mudança de Classe',
      `Classe de RPG de ${targetUser.name} alterada para ${newClass}.`
    );
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      teacherName: loggedInUser?.name || 'Professor',
      text: newFeedbackText,
      date: new Date().toISOString()
    };

    const updatedUser: User = {
      ...targetUser,
      teacherNotes: [newNote, ...targetUser.teacherNotes]
    };

    db.updateUser(updatedUser);
    setNewFeedbackText('');
    if (isSelf) {
      refreshUser();
    } else {
      setName(updatedUser.name);
    }

    addLog(
      'Parecer Pedagógico',
      `Adicionado parecer pedagógico para o aluno ${targetUser.name} por ${loggedInUser?.name}`,
      'success'
    );
  };

  const handleDeleteFeedback = (noteId: string) => {
    const updatedUser: User = {
      ...targetUser,
      teacherNotes: targetUser.teacherNotes.filter(n => n.id !== noteId)
    };

    db.updateUser(updatedUser);
    if (isSelf) {
      refreshUser();
    } else {
      setName(updatedUser.name);
    }

    addLog(
      'Remoção de Parecer',
      `Parecer pedagógico removido do perfil de ${targetUser.name}`,
      'warning'
    );
  };

  const nextLevelXp = (targetUser.rpgCharacter?.level || 1) * 200;
  const xpPercent = targetUser.rpgCharacter 
    ? Math.min(100, (targetUser.rpgCharacter.xp / nextLevelXp) * 100)
    : 0;

  // Tab nav labels — only show RPG/historico tabs for students
  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'geral', label: 'Perfil Geral', icon: <UserIcon size={15} /> },
    ...(targetUser.role === 'STUDENT' ? [
      { id: 'historico' as ProfileTab, label: 'Histórico Escolar', icon: <GraduationCap size={15} /> },
      { id: 'pareceres' as ProfileTab, label: 'Pareceres', icon: <MessageSquare size={15} /> },
      { id: 'rpg' as ProfileTab, label: 'Personagem RPG', icon: <Zap size={15} /> },
    ] : [
      { id: 'pareceres' as ProfileTab, label: 'Pareceres', icon: <MessageSquare size={15} /> },
    ]),
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'left' }}>
      {onBack && (
        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} /> Voltar para Gerenciamento
        </button>
      )}

      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--primary-glow) 0%, rgba(30, 27, 46, 0.95) 100%)',
          border: '1px solid var(--border)',
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: 'var(--shadow-glow)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {targetUser.rpgCharacter?.selectedClass ? (
            <RpgAvatar 
              rpgClass={targetUser.rpgCharacter.selectedClass} 
              level={targetUser.rpgCharacter.level} 
              size={100}
            />
          ) : (
            <div 
              style={{
                width: '100px',
                height: '100px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--border)'
              }}
            >
              <UserIcon size={48} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          )}
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{targetUser.name}</h2>
              <span className={`badge badge-${targetUser.role.toLowerCase()}`}>
                {targetUser.role === 'STUDENT' && 'Aluno'}
                {targetUser.role === 'INSTRUCTOR' && 'Professor'}
                {targetUser.role === 'ADMIN' && 'Administrador'}
                {targetUser.role === 'MAINTENANCE' && 'Suporte'}
              </span>
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} /> {targetUser.email}
            </p>
            {targetUser.rpgCharacter?.selectedClass && (
              <p style={{ margin: '6px 0 0', fontWeight: 'bold', color: 'var(--accent)' }}>
                Nível {targetUser.rpgCharacter.level} — {targetUser.rpgCharacter.selectedClass}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isEditing ? (
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Editar Dados</button>
          )}
        </div>
      </div>

      {/* Cadastro Estendido (somente leitura) */}
      {targetUser.role === 'STUDENT' && (targetUser.registrationId || targetUser.birthDate || targetUser.phoneNumber || targetUser.guardianName) && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px',
          padding: '16px 20px', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        }}>
          {targetUser.registrationId && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}><IdCard size={13} /> Matrícula</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{targetUser.registrationId}</div>
            </div>
          )}
          {targetUser.birthDate && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Nascimento</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{new Date(targetUser.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
            </div>
          )}
          {targetUser.phoneNumber && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={13} /> Telefone</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{targetUser.phoneNumber}</div>
            </div>
          )}
          {targetUser.guardianName && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Responsável</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{targetUser.guardianName}{targetUser.guardianPhone && ` · ${targetUser.guardianPhone}`}</div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
              color: activeTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: -1,
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Histórico Escolar Tab */}
      {activeTab === 'historico' && (
        <AcademicHistory userId={targetUser.id} />
      )}

      {isEditing && (
        <div className="card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Atualizar Cadastro</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
            <div>
              <label htmlFor="edit-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Nome Completo</label>
              <input 
                id="edit-name"
                type="text" 
                className="form-input" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </div>
            <div>
              <label htmlFor="edit-email" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Endereço de E-mail</label>
              <input 
                id="edit-email"
                type="email" 
                className="form-input" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Salvar Alterações</button>
          </form>
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="badge badge-success" style={{ padding: '12px', fontSize: '1rem', width: '100%', marginBottom: '20px', textAlign: 'center' }}>
          Dados salvos com sucesso!
        </div>
      )}

      {activeTab === 'geral' && <div style={{ display: 'grid', gridTemplateColumns: targetUser.role === 'STUDENT' ? '2fr 1fr' : '1fr', gap: '32px' }}>
        <div>
          {targetUser.role === 'STUDENT' && targetUser.rpgCharacter && (
            <>
              {/* Daily Dashboard */}
              <div style={{ marginBottom: '32px' }}>
                <DailyDashboard character={targetUser.rpgCharacter} />
              </div>

              <div className="card" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} style={{ color: 'var(--accent)' }} /> Atributos e Evolução do Personagem
                </h3>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Progresso para o Próximo Nível</span>
                    <span>{targetUser.rpgCharacter.xp} / {nextLevelXp} XP</span>
                  </div>
                  <div style={{ height: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: xpPercent + '%', 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <StreakIndicator dailyProgress={targetUser.rpgCharacter.dailyProgress} size="md" />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>+{targetUser.rpgCharacter.dailyProgress.xpGainedToday} XP</span> hoje
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Força (Lógica)', val: targetUser.rpgCharacter.stats.strength, color: '#ff7253' },
                    { label: 'Inteligência (Conhecimento)', val: targetUser.rpgCharacter.stats.intelligence, color: '#7d62ff' },
                    { label: 'Destreza (Execução/Prática)', val: targetUser.rpgCharacter.stats.dexterity, color: '#39db80' }
                  ].map(stat => (
                    <div key={stat.label} style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{stat.label}</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: stat.color }}>{stat.val}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-secondary)' }}>Mudar Classe ou Resetar Herói</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['MAGE', 'WARRIOR', 'RANGER', 'NECROMANCER', 'QUEEN', 'SCHOLAR', 'SMITH', 'PYROMANCER', 'PIRATE', 'JESTER', 'CHAMPION'].map(cls => (
                      <button
                        key={cls}
                        className="btn btn-secondary"
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.8rem',
                          border: targetUser.rpgCharacter?.selectedClass === cls ? '2px solid var(--accent)' : '1px solid var(--border)',
                          backgroundColor: targetUser.rpgCharacter?.selectedClass === cls ? 'rgba(255, 183, 39, 0.1)' : 'transparent'
                        }}
                        onClick={() => handleChangeClass(cls as RpgClass)}
                      >
                        {cls === 'MAGE' && '🔮 Arcano'}
                        {cls === 'WARRIOR' && '⚔️ Cruzado'}
                        {cls === 'RANGER' && '🏹 Caçador'}
                        {cls === 'NECROMANCER' && '💀 Nigromante'}
                        {cls === 'QUEEN' && '👑 Soberana'}
                        {cls === 'SCHOLAR' && '📚 Erudito'}
                        {cls === 'SMITH' && '🔨 Ferreiro Rúnico'}
                        {cls === 'PYROMANCER' && '🔥 Flamejante'}
                        {cls === 'PIRATE' && '🏴‍☠️ Corsário'}
                        {cls === 'JESTER' && '🎭 Bufão'}
                        {cls === 'CHAMPION' && '🏆 Campeão'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: 'var(--primary)' }} /> Habilidades Especiais Desbloqueadas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {targetUser.rpgCharacter.unlockedSkills.map((skill, index) => (
                    <div 
                      key={index}
                      style={{ 
                        padding: '12px 16px', 
                        backgroundColor: 'var(--bg-secondary)', 
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{skill}</span>
                    </div>
                  ))}
                  {targetUser.rpgCharacter.unlockedSkills.length === 0 && (
                    <p style={{ color: 'var(--text-tertiary)', gridColumn: '1 / -1' }}>Nenhuma habilidade desbloqueada ainda.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Pareceres inline only shown in geral tab for non-students or when no pareceres tab */}
          {targetUser.role !== 'STUDENT' && <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> Parecer Pedagógico e Avaliações do Professor
            </h3>

            {isInstructorOrAdmin && (
              <form onSubmit={handleAddFeedback} style={{ marginBottom: '28px', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <label htmlFor="new-feedback" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>
                  Escrever Novo Parecer Pedagógico:
                </label>
                <textarea
                  id="new-feedback"
                  className="form-input"
                  style={{ width: '100%', minHeight: '80px', marginBottom: '12px', padding: '10px', fontSize: '0.9rem' }}
                  placeholder="Descreva a evolução do aluno, pontos fortes e recomendações de estudo..."
                  value={newFeedbackText}
                  onChange={(e) => setNewFeedbackText(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Adicionar Parecer
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {targetUser.teacherNotes.map((note) => (
                <div 
                  key={note.id}
                  className="card"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderLeft: '4px solid var(--accent)',
                    padding: '16px 20px',
                    position: 'relative'
                  }}
                >
                  {isInstructorOrAdmin && (
                    <button 
                      className="btn" 
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '12px', 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      onClick={() => handleDeleteFeedback(note.id)}
                      aria-label="Deletar Parecer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>{note.teacherName}</strong>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(note.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6', paddingRight: isInstructorOrAdmin ? '24px' : '0' }}>
                    {note.text}
                  </p>
                </div>
              ))}

              {targetUser.teacherNotes.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  Não há pareceres pedagógicos registrados para este perfil.
                </div>
              )}
            </div>
          </div>}
        </div>

        {targetUser.role === 'STUDENT' && (
          <div>
            <div className="card" style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} style={{ color: 'var(--accent)' }} /> Conquistas & Medalhas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {targetUser.unlockedBadges.map((badge, idx) => (
                  <div key={idx} className="card" style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,183,39,0.1)', display: 'flex', alignItems: 'center', color: 'var(--accent)', justifyContent: 'center' }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>{badge}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Medalha desbloqueada</span>
                    </div>
                  </div>
                ))}
                {targetUser.unlockedBadges.length === 0 && <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', margin: '12px 0' }}>Nenhuma medalha obtida.</p>}
              </div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Resumo Acadêmico
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Matrículas:</span>
                  <strong>{targetUser.enrolledCourses.length} cursos</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Aulas Assistidas:</span>
                  <strong>{targetUser.completedLessons.length} aulas</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pareceres:</span>
                  <strong>{targetUser.teacherNotes.length} pareceres</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>}
    </div>
  );
};
