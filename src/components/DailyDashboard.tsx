import React, { useState } from 'react';
import type { RpgCharacter } from '../types';
import {
  Zap, Flame, Trophy, Target, TrendingUp, Calendar,
  Sword, Sparkles, Shield, Clock, CheckCircle2, Gift,
  Loader2
} from 'lucide-react';
import { getXpProgress, getRemainingMilestones, getMilestoneRequirements } from '../engine/EvolutionEngine';

interface DailyDashboardProps {
  character: RpgCharacter;
  onCompleteTask?: (taskId: string) => void;
}

const XP_LOGIN_BONUS_BASE = 10;

const DAILY_TASKS = [
  { id: 'watch_lesson', label: 'Assistir a uma aula (10+ min)', xp: 30, icon: <Clock size={16} />, activity: 'lesson_watched' as const },
  { id: 'complete_lesson', label: 'Completar uma aula', xp: 50, icon: <CheckCircle2 size={16} />, activity: 'lesson_completed' as const },
  { id: 'do_exercise', label: 'Fazer um exercício', xp: 75, icon: <Target size={16} />, activity: 'exercise_passed' as const },
  { id: 'login', label: 'Login diário', xp: XP_LOGIN_BONUS_BASE, icon: <Gift size={16} />, activity: 'daily_login' as const },
];

export const DailyDashboard: React.FC<DailyDashboardProps> = ({ character, onCompleteTask }) => {
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const xpProgress = getXpProgress(character);
  const remaining = getRemainingMilestones(character);
  const req = getMilestoneRequirements(character.level);
  const personalCount = character.milestones.filter(m => m.type === 'PERSONAL').length;
  const heroCount = character.milestones.filter(m => m.type === 'HERO').length;

  const todayMilestones = character.milestones.filter(m => {
    const today = new Date();
    const achieved = new Date(m.achievedAt);
    return achieved.getFullYear() === today.getFullYear() &&
      achieved.getMonth() === today.getMonth() &&
      achieved.getDate() === today.getDate();
  });

  const completedToday = character.dailyProgress.dailyTasksCompleted || [];
  const allDone = dailyTasks.length > 0 && dailyTasks.every(t => completedToday.includes(t.id));

  return (
    <div className="evolution-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} style={{ color: 'var(--accent)' }} /> Progresso Diário
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Atividade de hoje — {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Streak Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          background: character.dailyProgress.currentStreak >= 7
            ? 'linear-gradient(135deg, #ff6b35, #ffd700)'
            : character.dailyProgress.currentStreak >= 3
            ? 'linear-gradient(135deg, #ff9f43, #ffd700)'
            : 'var(--bg-tertiary)',
          color: character.dailyProgress.currentStreak >= 3 ? '#000' : 'var(--text-primary)',
          fontWeight: '800',
          fontSize: '0.85rem',
          border: '1px solid var(--border)'
        }}>
          <Flame size={18} style={{ color: character.dailyProgress.currentStreak >= 3 ? '#dc2626' : 'var(--accent)' }} />
          <span>Streak: <strong>{character.dailyProgress.currentStreak}</strong> dias</span>
        </div>
      </div>

      {/* XP Today */}
      <div style={{
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} style={{ color: 'var(--accent-green)' }} />XP Ganho Hoje
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent)' }}>
            +{character.dailyProgress.xpGainedToday} XP
          </span>
        </div>

        {/* XP to next level */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Nível {character.level}</span>
            <span>{xpProgress.current} / {xpProgress.needed} XP</span>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              width: `${xpProgress.percent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Daily Tasks Checklist */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} /> Tarefas Diárias
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DAILY_TASKS.map(task => {
            const done = completedToday.includes(task.id);
            const isCompleting = completingTask === task.id;
            const xpValue = task.id === 'login'
              ? XP_LOGIN_BONUS_BASE + character.dailyProgress.currentStreak * 2
              : task.xp;
            return (
              <div
                key={task.id}
                onClick={() => {
                  if (!done && !isCompleting && onCompleteTask) {
                    setCompletingTask(task.id);
                    setTimeout(() => setCompletingTask(null), 800);
                    onCompleteTask(task.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: done ? 'rgba(57, 219, 128, 0.1)' : isCompleting ? 'rgba(94, 58, 238, 0.1)' : 'var(--bg-primary)',
                  border: `1px solid ${done ? 'var(--accent-green)' : isCompleting ? 'var(--primary)' : 'var(--border)'}`,
                  opacity: done ? 0.8 : 1,
                  cursor: done ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
                role="button"
                tabIndex={done ? -1 : 0}
                aria-disabled={done}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !done && onCompleteTask) {
                    setCompletingTask(task.id);
                    setTimeout(() => setCompletingTask(null), 800);
                    onCompleteTask(task.id);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    backgroundColor: done ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done ? '#fff' : 'var(--text-tertiary)',
                    fontSize: '0.75rem', fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}>
                    {done ? '✓' : task.icon}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: done ? '500' : '600', color: done ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                    {task.label}
                  </span>
                </div>
                {!done && !isCompleting && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    +{xpValue} XP
                  </span>
                )}
                {isCompleting && (
                  <Loader2 size={16} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                )}
              </div>
            );
          })}
        </div>
        {allDone && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: 'rgba(57, 219, 128, 0.15)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            fontWeight: '800',
            fontSize: '0.85rem',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <Sparkles size={18} /> Todas as tarefas de hoje concluídas!
          </div>
        )}
      </div>

      {/* Milestone Progress */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={16} /> Progresso para Level Up (Nv. {character.level + 1})
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Personal Milestones */}
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} /> Marcos Pessoais
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
              {personalCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>/ {req.personal}</span>
            </div>
            {remaining.personal > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Faltam {remaining.personal}
              </div>
            )}
          </div>

          {/* Hero Milestones */}
          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={14} style={{ color: 'var(--accent)' }} /> Marcos de Herói
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent)' }}>
              {heroCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>/ {req.hero}</span>
            </div>
            {remaining.hero > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Faltam {remaining.hero}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Milestones Today */}
      {todayMilestones.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
            Conquistas de Hoje
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayMilestones.slice(0, showAllActivities ? undefined : 3).map((ms, idx) => (
              <div key={ms.id || idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 183, 39, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 183, 39, 0.2)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: ms.type === 'HERO' ? 'rgba(255, 183, 39, 0.2)' : 'rgba(94, 58, 238, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {ms.type === 'HERO' ? <Trophy size={16} style={{ color: 'var(--accent)' }} /> : <Sparkles size={16} style={{ color: 'var(--primary)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{ms.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{ms.description}</div>
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  backgroundColor: ms.type === 'HERO' ? 'rgba(255, 183, 39, 0.2)' : 'rgba(94, 58, 238, 0.2)',
                  color: ms.type === 'HERO' ? 'var(--accent)' : 'var(--primary)',
                }}>
                  {ms.type === 'HERO' ? 'Herói' : 'Pessoal'}
                </span>
              </div>
            ))}
            {todayMilestones.length > 3 && !showAllActivities && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '8px', width: '100%' }}
                onClick={() => setShowAllActivities(true)}
              >
                Ver mais {todayMilestones.length - 3} conquistas
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const XP_LOGIN_BONUS_BASE = 10;
