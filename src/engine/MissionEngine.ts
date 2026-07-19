import type { Mission, MissionSubmission, RpgCharacter, User } from '../types';
import { grantXp, type XpGrantResult } from './EvolutionEngine';

/** Uma missão vencida (prazo expirado) nunca mais aparece como ativa */
export function isMissionExpired(mission: Mission, now: Date = new Date()): boolean {
  return new Date(mission.dueAt).getTime() < now.getTime();
}

function isMissionAvailableYet(mission: Mission, now: Date = new Date()): boolean {
  return new Date(mission.availableFrom).getTime() <= now.getTime();
}

function isMissionCurrentlyActive(mission: Mission, student: User, now: Date): boolean {
  return !mission.closedEarly
    && !isMissionExpired(mission, now)
    && isMissionAvailableYet(mission, now)
    && isMissionVisibleToStudent(mission, student);
}

/**
 * Todas as Missões Comuns atualmente ativas e visíveis para o estudante, independentemente
 * de já terem submissão ou não. Usado pela Regra M3 (bônus semanal) — precisa do conjunto
 * "cheio", não do Quadro (que já exclui as já submetidas), senão a missão que acabou de ser
 * aprovada sumiria da checagem de "completou todas".
 */
export function getActiveCommonMissionsFor(missions: Mission[], student: User, now: Date = new Date()): Mission[] {
  return missions.filter(m => m.type === 'COMMON' && isMissionCurrentlyActive(m, student, now));
}

/** Regra: Comum aparece pra quem está matriculado no curso; Requisitada só pra quem foi endereçado */
export function isMissionVisibleToStudent(mission: Mission, student: User): boolean {
  if (mission.type === 'REQUESTED') {
    return !!mission.targetStudentIds?.includes(student.id);
  }
  return student.enrolledCourses.includes(mission.courseId);
}

export function getSubmissionForMission(missionId: string, studentId: string, submissions: MissionSubmission[]): MissionSubmission | undefined {
  return submissions.find(s => s.missionId === missionId && s.studentId === studentId);
}

/**
 * O Quadro de Missões de um estudante: Comuns do curso dele + Requisitadas endereçadas a ele,
 * dentro da janela availableFrom–dueAt, excluindo as já submetidas (a menos que a submissão
 * tenha sido recusada — nesse caso a missão volta a aparecer para nova tentativa).
 */
export function getMissionBoard(missions: Mission[], submissions: MissionSubmission[], student: User, now: Date = new Date()): Mission[] {
  return missions.filter(m => {
    if (!isMissionCurrentlyActive(m, student, now)) return false;
    const existing = getSubmissionForMission(m.id, student.id, submissions);
    return !existing || existing.status === 'REJECTED';
  });
}

/**
 * Registra a entrega de uma Missão. Se ela não exige validação (tipicamente Blitz),
 * a submissão já nasce aprovada — sem fila de espera, priorizando ritmo (Regra M1).
 */
export function submitMission(mission: Mission, studentId: string, evidenceText?: string): MissionSubmission {
  const autoApproved = !mission.requiresValidation;
  const nowIso = new Date().toISOString();
  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    missionId: mission.id,
    studentId,
    status: autoApproved ? 'APPROVED' : 'PENDING',
    evidenceText,
    submittedAt: nowIso,
    reviewedAt: autoApproved ? nowIso : undefined,
  };
}

/**
 * Decisão do Instrutor sobre uma Submissão pendente. Ao aprovar, delega ao EvolutionEngine
 * (mesmo motor usado por toda a plataforma) a concessão de XP e a criação do Marco — o
 * MissionEngine nunca calcula XP/nível por conta própria.
 */
export function reviewSubmission(
  submission: MissionSubmission,
  mission: Mission,
  character: RpgCharacter | undefined,
  decision: 'APPROVED' | 'REJECTED',
  note?: string
): { submission: MissionSubmission; xpGrantResult?: XpGrantResult } {
  const updatedSubmission: MissionSubmission = {
    ...submission,
    status: decision,
    reviewedAt: new Date().toISOString(),
    reviewNote: note,
  };

  if (decision === 'APPROVED' && character) {
    const xpGrantResult = grantXp(character, 'mission_completed', {
      title: mission.title,
      description: mission.description,
      relatedEntityId: mission.id,
      xpOverride: mission.xpReward,
      milestoneTypeOverride: mission.milestoneType,
    });
    return { submission: updatedSubmission, xpGrantResult };
  }

  return { submission: updatedSubmission };
}

/**
 * Regra de Negócio M3 (bônus de conclusão total, inspirado no "Legado" do RPG pesquisado):
 * se o estudante já tem submissão APROVADA para TODAS as Missões Comuns atualmente ativas
 * (dentro do próprio Quadro), concede um bônus de XP igual à soma do XP de todas elas.
 * Dedup: a chave do Marco é o próprio conjunto de ids de missão, então um novo bônus só é
 * possível quando esse conjunto mudar (ex: o instrutor publica novas Missões Comuns) — nunca
 * duas vezes para o mesmo conjunto.
 */
export function getWeeklyCompletionBonus(
  activeCommonMissions: Mission[],
  submissions: MissionSubmission[],
  studentId: string,
  character: RpgCharacter
): XpGrantResult | null {
  if (activeCommonMissions.length === 0) return null;

  const allApproved = activeCommonMissions.every(m =>
    submissions.some(s => s.missionId === m.id && s.studentId === studentId && s.status === 'APPROVED')
  );
  if (!allApproved) return null;

  const bonusKey = `mission-weekly-bonus-${activeCommonMissions.map(m => m.id).sort().join('_')}`;
  const alreadyGranted = character.milestones.some(m => m.source === 'mission_completed' && m.relatedEntityId === bonusKey);
  if (alreadyGranted) return null;

  const totalXp = activeCommonMissions.reduce((sum, m) => sum + m.xpReward, 0);
  return grantXp(character, 'mission_completed', {
    title: '🏆 Todas as Missões em Dia!',
    description: 'Completou todas as Missões Comuns ativas antes do prazo — bônus em dobro do XP total!',
    relatedEntityId: bonusKey,
    xpOverride: totalXp,
    milestoneTypeOverride: 'HERO',
  });
}
