import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import type { Mission, MissionSubmission } from '../types';
import { getMissionBoard, submitMission, getWeeklyCompletionBonus, getSubmissionForMission, getActiveCommonMissionsFor } from '../engine/MissionEngine';
import { grantXp } from '../engine/EvolutionEngine';
import { Swords, Clock, Users, Zap, Send, CheckCircle2, HourglassIcon, XCircle, Sparkles } from 'lucide-react';

const TYPE_META: Record<Mission['type'], { label: string; color: string; icon: React.ReactNode }> = {
  COMMON: { label: 'Missão Comum', color: 'var(--accent-blue, #3b82f6)', icon: <Users size={14} /> },
  REQUESTED: { label: 'Missão Requisitada', color: 'var(--accent)', icon: <Swords size={14} /> },
  BLITZ: { label: 'Blitz', color: 'var(--accent-coral, #ff7253)', icon: <Zap size={14} /> },
};

function daysUntil(dueAt: string): string {
  const ms = new Date(dueAt).getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Vence hoje';
  if (days === 1) return '1 dia restante';
  return `${days} dias restantes`;
}

export const MissionBoard: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([]);
  const [evidenceDrafts, setEvidenceDrafts] = useState<Record<string, string>>({});
  const [justSubmitted, setJustSubmitted] = useState<string | null>(null);
  const [bonusToast, setBonusToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setMissions(db.getMissions());
    if (currentUser) setSubmissions(db.getSubmissionsForStudent(currentUser.id));
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  const board = useMemo(() => {
    if (!currentUser) return [];
    return getMissionBoard(missions, submissions, currentUser);
  }, [missions, submissions, currentUser]);

  const activeCommonMissions = useMemo(() => {
    if (!currentUser) return [];
    return getActiveCommonMissionsFor(missions, currentUser);
  }, [missions, currentUser]);

  const myPastSubmissions = useMemo(() => {
    return submissions
      .map(s => ({ submission: s, mission: missions.find(m => m.id === s.missionId) }))
      .filter((x): x is { submission: MissionSubmission; mission: Mission } => !!x.mission)
      .sort((a, b) => b.submission.submittedAt.localeCompare(a.submission.submittedAt));
  }, [submissions, missions]);

  const handleSubmit = (mission: Mission) => {
    if (!currentUser) return;
    const evidence = evidenceDrafts[mission.id]?.trim() || undefined;
    const submission = submitMission(mission, currentUser.id, evidence);
    db.addMissionSubmission(submission);

    // Missões sem validação (tipicamente Blitz) já nascem aprovadas: concede XP na hora,
    // pelo mesmo EvolutionEngine usado em toda a plataforma.
    if (submission.status === 'APPROVED' && currentUser.rpgCharacter) {
      const result = grantXp(currentUser.rpgCharacter, 'mission_completed', {
        title: mission.title,
        description: mission.description,
        relatedEntityId: mission.id,
        xpOverride: mission.xpReward,
        milestoneTypeOverride: mission.milestoneType,
      });
      let finalCharacter = result.character;
      db.updateUser({ ...currentUser, rpgCharacter: finalCharacter });

      // Regra M3: só missões Comuns entram no bônus de conclusão total da semana
      if (mission.type === 'COMMON') {
        const freshSubmissions = db.getSubmissionsForStudent(currentUser.id);
        const bonusResult = getWeeklyCompletionBonus(activeCommonMissions, freshSubmissions, currentUser.id, finalCharacter);
        if (bonusResult) {
          finalCharacter = bonusResult.character;
          db.updateUser({ ...currentUser, rpgCharacter: finalCharacter });
          setBonusToast(`+${bonusResult.xpGained} XP de bônus! Todas as Missões Comuns concluídas!`);
          setTimeout(() => setBonusToast(null), 4000);
        }
      }
    }

    setJustSubmitted(mission.id);
    setTimeout(() => setJustSubmitted(null), 2000);
    load();
    refreshUser();
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Swords size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Quadro de Missões</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Missões propostas pelo seu instrutor. Cumpra para ganhar XP e evoluir seu personagem.
      </p>

      {bonusToast && (
        <div className="evolution-card" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderColor: 'var(--success)' }}>
          <Sparkles size={20} color="var(--success)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bonusToast}</span>
        </div>
      )}

      {board.length === 0 ? (
        <div className="evolution-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <Swords size={36} style={{ opacity: 0.3, color: 'var(--text-tertiary)' }} />
          <p style={{ color: 'var(--text-tertiary)', marginTop: '10px' }}>Nenhuma missão ativa no momento. Volte mais tarde!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {board.map(mission => {
            const meta = TYPE_META[mission.type];
            const existing = getSubmissionForMission(mission.id, currentUser.id, submissions);
            return (
              <div key={mission.id} className="evolution-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: meta.color, marginBottom: '6px' }}>
                      {meta.icon} {meta.label}
                    </span>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{mission.title}</h3>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                    <Zap size={14} /> +{mission.xpReward} XP
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>{mission.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '14px' }}>
                  <Clock size={13} /> {daysUntil(mission.dueAt)}
                  {mission.requiresValidation && <span>· Precisa de validação do instrutor</span>}
                </div>

                {existing?.status === 'PENDING' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <HourglassIcon size={16} /> Aguardando validação do instrutor
                  </div>
                ) : justSubmitted === mission.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} /> Enviada!
                  </div>
                ) : (
                  <>
                    {mission.requiresValidation && (
                      <textarea
                        value={evidenceDrafts[mission.id] || ''}
                        onChange={e => setEvidenceDrafts(prev => ({ ...prev, [mission.id]: e.target.value }))}
                        placeholder="Descreva o que você fez (opcional, mas ajuda o instrutor a validar mais rápido)"
                        rows={2}
                        style={{
                          width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginBottom: '10px',
                          background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px',
                          color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical',
                        }}
                      />
                    )}
                    <button
                      onClick={() => handleSubmit(mission)}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
                    >
                      <Send size={14} /> {mission.type === 'BLITZ' ? 'Marcar como Concluída' : 'Entregar Missão'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {myPastSubmissions.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Entregas Anteriores</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {myPastSubmissions.slice(0, 8).map(({ submission, mission }) => (
              <div key={submission.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)', fontSize: '0.85rem',
              }}>
                <span style={{ color: 'var(--text-primary)' }}>{mission.title}</span>
                {submission.status === 'APPROVED' && <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} /> Aprovada</span>}
                {submission.status === 'PENDING' && <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4 }}><HourglassIcon size={14} /> Pendente</span>}
                {submission.status === 'REJECTED' && <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={14} /> Recusada</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
