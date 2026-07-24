import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import type { SkillNode, UserInventory } from '../types';
import { Shield, Zap, Sparkles, Lock, CheckCircle2, Award, Flame, Crown, BookOpen, Anchor, Swords } from 'lucide-react';

export const SkillTree: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser || currentUser.role !== 'STUDENT' || !currentUser.rpgCharacter) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>A Árvore de Habilidades é exclusiva para a evolução de estudantes.</p>
      </div>
    );
  }

  const rpgClass = currentUser.rpgCharacter.selectedClass;
  const studentLevel = currentUser.rpgCharacter.level;

  const [allSkills] = useState<SkillNode[]>(() => db.getSkillNodes());
  const [inventory, setInventory] = useState<UserInventory>(() => db.getUserInventory(currentUser.id));
  const [activeTab, setActiveTab] = useState<'my_class' | 'all'>('my_class');

  const classSkills = allSkills.filter(s => s.className === rpgClass);
  const displayedSkills = activeTab === 'my_class' ? classSkills : allSkills;

  const handleUnlock = (skill: SkillNode) => {
    if (studentLevel < skill.requiredLevel) {
      alert(`Você precisa atingir o Nível ${skill.requiredLevel} para desbloquear esta habilidade!`);
      return;
    }

    if (inventory.unlockedSkillIds.includes(skill.id)) return;

    const updated: UserInventory = {
      ...inventory,
      unlockedSkillIds: [...inventory.unlockedSkillIds, skill.id],
    };
    db.saveUserInventory(currentUser.id, updated);
    setInventory(updated);
    alert(`🎉 Habilidade "${skill.title}" desbloqueada com sucesso!`);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield size={20} />;
      case 'Flame': return <Flame size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'Crown': return <Crown size={20} />;
      case 'BookOpen': return <BookOpen size={20} />;
      case 'Anchor': return <Anchor size={20} />;
      case 'Swords': return <Swords size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  return (
    <div className="card" style={{ padding: 24, textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={22} style={{ color: 'var(--primary)' }} /> Árvore de Habilidades de Classe
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Classe Atual: <strong style={{ color: 'var(--primary)' }}>{rpgClass}</strong> · Seu Nível: <strong>Nível {studentLevel}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn ${activeTab === 'my_class' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setActiveTab('my_class')}
          >
            Habilidades da Minha Classe ({classSkills.length})
          </button>
          <button
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setActiveTab('all')}
          >
            Todas as Classes ({allSkills.length})
          </button>
        </div>
      </div>

      {/* Grid of Skill Nodes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {displayedSkills.map((skill) => {
          const isUnlocked = inventory.unlockedSkillIds.includes(skill.id);
          const canUnlock = studentLevel >= skill.requiredLevel;

          return (
            <div
              key={skill.id}
              style={{
                backgroundColor: isUnlocked ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
                border: isUnlocked ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      background: isUnlocked ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: isUnlocked ? '#fff' : 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {renderIcon(skill.iconName)}
                  </div>
                  <span
                    className={`badge ${isUnlocked ? 'badge-student' : 'badge-maintenance'}`}
                    style={{ fontSize: 10 }}
                  >
                    {isUnlocked ? 'Desbloqueado' : `Requer Nível ${skill.requiredLevel}`}
                  </span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  {skill.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {skill.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  ⚡ Efeito: {skill.effect}
                </div>

                {!isUnlocked && (
                  <button
                    onClick={() => handleUnlock(skill)}
                    disabled={!canUnlock}
                    className={`btn ${canUnlock ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', padding: '6px 10px', fontSize: 12, opacity: canUnlock ? 1 : 0.6 }}
                  >
                    {canUnlock ? (
                      <>Desbloquear Habilidade</>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Lock size={12} /> Bloqueado (Nível {skill.requiredLevel})
                      </span>
                    )}
                  </button>
                )}

                {isUnlocked && (
                  <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} /> Ativo no seu perfil
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
