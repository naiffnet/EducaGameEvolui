import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import type { BossFight } from '../types';
import { Swords, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export const ClassBossFight: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const [fights, setFights] = useState<BossFight[]>(() => db.getBossFights());

  // Filter boss fights by student's class (or show all if admin/instructor)
  const currentClass = currentUser.schoolClass || '9º Ano A';
  const activeFights = currentUser.role === 'STUDENT'
    ? fights.filter(f => f.schoolClass === currentClass)
    : fights;

  if (activeFights.length === 0) return null;

  const handleAttackBoss = (boss: BossFight) => {
    const damage = 60; // 60 HP damage per student attack simulation
    const updated = db.dealDamageToBoss(boss.id, damage);
    if (updated) {
      setFights(db.getBossFights());
      if (updated.status === 'VICTORIOUS') {
        alert(`🏆 INCRÍVEL! A turma do ${updated.schoolClass} derrotou "${updated.bossName}"! Todos os alunos ganharam +${updated.rewardXp} XP e +${updated.rewardCoins} Moedas!`);
      } else {
        alert(`⚔️ Ataque realizado! Você causou ${damage} de dano a "${boss.bossName}"! HP restante do Boss: ${updated.currentHp}/${updated.maxHp}`);
      }
    }
  };

  return (
    <div className="card" style={{ padding: 24, textAlign: 'left', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Swords size={22} style={{ color: 'var(--danger)' }} /> Desafio Colaborativo da Turma (Boss Fight)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Unam forças! O esforço da turma (aulas assistidas e chamadas) causa dano direto ao Chefão.
          </p>
        </div>
        <span className="badge badge-instructor" style={{ fontSize: 10 }}>
          {currentClass}
        </span>
      </div>

      {activeFights.map(boss => {
        const hpPercent = Math.round((boss.currentHp / boss.maxHp) * 100);
        const isVictorious = boss.status === 'VICTORIOUS';

        return (
          <div
            key={boss.id}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: isVictorious ? '2px solid var(--success)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-full)',
                  background: isVictorious ? 'var(--success-glow)' : 'var(--danger-glow)',
                  border: `2px solid ${isVictorious ? 'var(--success)' : 'var(--danger)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  flexShrink: 0,
                }}
              >
                {boss.avatarSymbol || '🐉'}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {boss.bossName}
                  </h4>
                  <span style={{ fontSize: 12, fontWeight: 800, color: isVictorious ? 'var(--success)' : 'var(--danger)' }}>
                    {isVictorious ? 'DERROTADO! 🏆' : `HP: ${boss.currentHp} / ${boss.maxHp} (${hpPercent}%)`}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  {boss.description}
                </p>

                {/* Health Bar */}
                <div
                  style={{
                    width: '100%',
                    height: 14,
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: `${hpPercent}%`,
                      height: '100%',
                      background: isVictorious
                        ? 'linear-gradient(90deg, #34d399 0%, #059669 100%)'
                        : 'linear-gradient(90deg, #ff7253 0%, #dc2626 100%)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Boss Fight Rewards & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={14} /> Recompensa de Turma: +{boss.rewardXp} XP
                </span>
                <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={14} /> +{boss.rewardCoins} Moedas
                </span>
              </div>

              {!isVictorious ? (
                <button
                  onClick={() => handleAttackBoss(boss)}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Swords size={15} /> Atacar Chefão (-60 HP)
                </button>
              ) : (
                <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={16} /> Recompensa Coletiva Reivindicada!
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
