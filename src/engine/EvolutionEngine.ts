import type { RpgCharacter, Milestone, DailyProgress, RpgClass } from '../types';

// ─── XP & Level Configuration ────────────────────────────────────────────────

const XP_PER_MINUTE = 3; // XP por minuto de aula assistida
const XP_LESSON_COMPLETE = 50;
const XP_EXERCISE_PASS = 75;
const XP_HIGH_GRADE = 100; // nota >= 9
const XP_PROJECT_DONE = 500;
const XP_STREAK_7 = 200;
const XP_STREAK_30 = 500;
const XP_COURSE_COMPLETE = 300;
const XP_BADGE_EARNED = 80;
const XP_TEACHER_FEEDBACK = 40;
const XP_LOGIN_BONUS_BASE = 10; // base + streak bonus
const XP_ATTENDANCE = 20; // XP fixo por presença confirmada em chamada

/** Get XP required for a given character level */
export function getXpForLevel(level: number): number {
  return level * 200;
}

/** Get the milestone requirements for a given level */
export function getMilestoneRequirements(level: number): { personal: number; hero: number } {
  if (level <= 1) return { personal: 1, hero: 0 };
  if (level === 2) return { personal: 2, hero: 0 };
  if (level === 3) return { personal: 2, hero: 1 };
  if (level === 4) return { personal: 2, hero: 2 };
  // Level 5+
  return { personal: 2, hero: level - 2 };
}

/** XP needed for the next level (including current XP) */
export function getXpProgress(character: RpgCharacter): { current: number; needed: number; percent: number } {
  const needed = getXpForLevel(character.level);
  const percent = Math.min(100, Math.round((character.xp / needed) * 100));
  return { current: character.xp, needed, percent };
}

/** Check if a character has enough milestones to level up */
export function canLevelUp(character: RpgCharacter): boolean {
  const req = getMilestoneRequirements(character.level);
  const personalCount = character.milestones.filter(m => m.type === 'PERSONAL').length;
  const heroCount = character.milestones.filter(m => m.type === 'HERO').length;
  return personalCount >= req.personal && heroCount >= req.hero && character.xp >= getXpForLevel(character.level);
}

/** Get remaining milestones needed to level up */
export function getRemainingMilestones(character: RpgCharacter): { personal: number; hero: number } {
  const req = getMilestoneRequirements(character.level);
  const personalCount = character.milestones.filter(m => m.type === 'PERSONAL').length;
  const heroCount = character.milestones.filter(m => m.type === 'HERO').length;
  return {
    personal: Math.max(0, req.personal - personalCount),
    hero: Math.max(0, req.hero - heroCount),
  };
}

// ─── Daily Progress ──────────────────────────────────────────────────────────

/** Check if the last activity was yesterday (to maintain streak) */
export function wasActiveYesterday(lastActivityDate: string): boolean {
  const last = new Date(lastActivityDate);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    last.getFullYear() === yesterday.getFullYear() &&
    last.getMonth() === yesterday.getMonth() &&
    last.getDate() === yesterday.getDate()
  );
}

/** Check if last activity was today */
export function wasActiveToday(lastActivityDate: string): boolean {
  const last = new Date(lastActivityDate);
  const today = new Date();
  return (
    last.getFullYear() === today.getFullYear() &&
    last.getMonth() === today.getMonth() &&
    last.getDate() === today.getDate()
  );
}

/** Check if the last activity was before yesterday (streak broken) */
export function isStreakBroken(lastActivityDate: string): boolean {
  if (!lastActivityDate) return true;
  return !wasActiveYesterday(lastActivityDate) && !wasActiveToday(lastActivityDate);
}

/** Create default DailyProgress for a new character */
export function createDefaultDailyProgress(): DailyProgress {
  return {
    lastActivityDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    xpGainedToday: 0,
    dailyTasksCompleted: [],
    lastDailyReset: new Date().toISOString(),
  };
}

/** Check if daily progress needs to be reset (new day) */
export function shouldResetDailyProgress(dailyProgress: DailyProgress): boolean {
  if (!dailyProgress.lastDailyReset) return true;
  const lastReset = new Date(dailyProgress.lastDailyReset);
  const today = new Date();
  return (
    lastReset.getFullYear() !== today.getFullYear() ||
    lastReset.getMonth() !== today.getMonth() ||
    lastReset.getDate() !== today.getDate()
  );
}

/** Reset daily progress, handling streak */
export function resetDailyProgress(dailyProgress: DailyProgress): DailyProgress {
  const today = new Date().toISOString();
  let newStreak = dailyProgress.currentStreak;

  // Check streak
  if (dailyProgress.lastActivityDate) {
    if (wasActiveYesterday(dailyProgress.lastActivityDate)) {
      newStreak += 1;
    } else if (!wasActiveToday(dailyProgress.lastActivityDate)) {
      newStreak = 0;
    }
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(dailyProgress.longestStreak, newStreak);

  return {
    lastActivityDate: dailyProgress.lastActivityDate || today,
    currentStreak: newStreak,
    longestStreak,
    xpGainedToday: 0,
    dailyTasksCompleted: [],
    lastDailyReset: today,
  };
}

/** Perform daily check on character - should be called on app load */
export function performDailyCheck(character: RpgCharacter): {
  character: RpgCharacter;
  leveledUp: boolean;
  newMilestones: Milestone[];
} {
  let updated = { ...character };
  const leveledUp = false;
  const newMilestones: Milestone[] = [];

  // Reset daily progress if needed
  if (shouldResetDailyProgress(updated.dailyProgress)) {
    updated.dailyProgress = resetDailyProgress(updated.dailyProgress);
  }

  // Check for pending level up (on Sundays or when conditions are met)
  if (canLevelUp(updated)) {
    // Process level up
    const levelUpResult = processLevelUp(updated);
    updated = levelUpResult.character;
  }

  return { character: updated, leveledUp, newMilestones };
}

// ─── XP Grants ────────────────────────────────────────────────────────────────

export interface XpGrantResult {
  character: RpgCharacter;
  xpGained: number;
  milestoneEarned?: Milestone;
  leveledUp: boolean;
  newMilestones: Milestone[];
}

/** Grant XP for an activity and check for milestones/level ups */
export function grantXp(
  character: RpgCharacter,
  activity: 'lesson_watched' | 'lesson_completed' | 'exercise_passed' | 'high_grade' | 'project_done' | 'course_completed' | 'badge_earned' | 'teacher_feedback' | 'daily_login' | 'attendance_confirmed' | 'mission_completed',
  details: { title: string; description: string; durationMinutes?: number; relatedEntityId?: string; xpOverride?: number; milestoneTypeOverride?: 'PERSONAL' | 'HERO' }
): XpGrantResult {
  let xpGained = 0;
  const newMilestones: Milestone[] = [];
  let leveledUp = false;

  switch (activity) {
    case 'lesson_watched':
      xpGained = (details.durationMinutes || 10) * XP_PER_MINUTE;
      break;
    case 'lesson_completed':
      xpGained = XP_LESSON_COMPLETE;
      break;
    case 'exercise_passed':
      xpGained = XP_EXERCISE_PASS;
      break;
    case 'high_grade':
      xpGained = XP_HIGH_GRADE;
      break;
    case 'project_done':
      xpGained = XP_PROJECT_DONE;
      break;
    case 'course_completed':
      xpGained = XP_COURSE_COMPLETE;
      break;
    case 'badge_earned':
      xpGained = XP_BADGE_EARNED;
      break;
    case 'teacher_feedback':
      xpGained = XP_TEACHER_FEEDBACK;
      break;
    case 'daily_login':
      xpGained = XP_LOGIN_BONUS_BASE + character.dailyProgress.currentStreak * 2;
      break;
    case 'attendance_confirmed':
      xpGained = XP_ATTENDANCE;
      break;
    case 'mission_completed':
      // XP vem da própria Missão (details.xpOverride), não de uma constante fixa —
      // única atividade com valor de XP variável (ver PLANO_IMPLEMENTACAO.md)
      xpGained = details.xpOverride ?? 0;
      break;
  }

  // Check if this activity earns a milestone
  const milestoneSourceMap: Record<string, Milestone['source']> = {
    lesson_completed: 'lesson_completed',
    exercise_passed: 'exercise_passed',
    high_grade: 'high_grade',
    project_done: 'project_done',
    course_completed: 'course_completed',
    badge_earned: 'badge_earned',
    teacher_feedback: 'teacher_feedback',
    attendance_confirmed: 'attendance_confirmed',
    mission_completed: 'mission_completed',
  };

  const milestoneSource = milestoneSourceMap[activity];
  if (milestoneSource) {
    const milestoneType = details.milestoneTypeOverride ?? ((activity === 'project_done' || activity === 'course_completed' || activity === 'high_grade')
      ? 'HERO' as const
      : 'PERSONAL' as const);

    // Check if milestone for this entity already exists
    const alreadyEarned = character.milestones.some(
      m => m.source === milestoneSource && m.relatedEntityId === details.relatedEntityId
    );

    if (!alreadyEarned) {
      const milestone: Milestone = {
        id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: milestoneType,
        title: details.title,
        description: details.description,
        source: milestoneSource,
        achievedAt: new Date().toISOString(),
        relatedEntityId: details.relatedEntityId,
      };
      newMilestones.push(milestone);
    }
  }

  // Update character
  const updated = { ...character };
  updated.xp += xpGained;
  updated.dailyProgress = {
    ...updated.dailyProgress,
    xpGainedToday: updated.dailyProgress.xpGainedToday + xpGained,
    lastActivityDate: new Date().toISOString(),
  };

  if (newMilestones.length > 0) {
    updated.milestones = [...updated.milestones, ...newMilestones];
  }

  // Check for daily streak milestones
  const streak = updated.dailyProgress.currentStreak;
  if (streak === 7 && !updated.milestones.some(m => m.source === 'streak_milestone' && m.title.includes('7'))) {
    updated.milestones.push({
      id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'HERO',
      title: '🔥 Semana de Foco!',
      description: 'Manteve uma sequência de 7 dias consecutivos de estudo!',
      source: 'streak_milestone',
      achievedAt: new Date().toISOString(),
    });
    updated.xp += XP_STREAK_7;
    updated.dailyProgress.xpGainedToday += XP_STREAK_7;
  }
  if (streak === 30 && !updated.milestones.some(m => m.source === 'streak_milestone' && m.title.includes('30'))) {
    updated.milestones.push({
      id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'HERO',
      title: '🌋 Mês de Dedicacão!',
      description: 'Manteve uma sequência de 30 dias consecutivos de estudo!',
      source: 'streak_milestone',
      achievedAt: new Date().toISOString(),
    });
    updated.xp += XP_STREAK_30;
    updated.dailyProgress.xpGainedToday += XP_STREAK_30;
  }

  // Check level up
  if (canLevelUp(updated)) {
    const levelUpResult = processLevelUp(updated);
    updated.level = levelUpResult.character.level;
    updated.xp = levelUpResult.character.xp;
    updated.stats = levelUpResult.character.stats;
    leveledUp = true;
  }

  return {
    character: updated,
    xpGained,
    milestoneEarned: newMilestones.length > 0 ? newMilestones[0] : undefined,
    leveledUp,
    newMilestones,
  };
}

// ─── Level Up ────────────────────────────────────────────────────────────────

export interface LevelUpResult {
  character: RpgCharacter;
  statsGained: { strength: number; intelligence: number; dexterity: number };
}

/** Process a level up: increase level, consume XP, grant stats */
export function processLevelUp(character: RpgCharacter): LevelUpResult {
  const updated = { ...character };
  const xpNeeded = getXpForLevel(updated.level);

  // Consume XP for the level up
  updated.xp -= xpNeeded;
  updated.level += 1;

  // Grant stat points based on class
  const statGain = getStatGainForLevelUp(updated.selectedClass);
  updated.stats = {
    strength: updated.stats.strength + statGain.strength,
    intelligence: updated.stats.intelligence + statGain.intelligence,
    dexterity: updated.stats.dexterity + statGain.dexterity,
  };

  // Remove used milestones? No - keep them as history
  // But we could mark them differently if needed

  return {
    character: updated,
    statsGained: statGain,
  };
}

/** Get stat gain for a level up based on class */
export function getStatGainForLevelUp(rpgClass: RpgClass | null): { strength: number; intelligence: number; dexterity: number } {
  switch (rpgClass) {
    case 'WARRIOR':
    case 'CHAMPION':
      return { strength: 3, intelligence: 1, dexterity: 2 };
    case 'MAGE':
    case 'NECROMANCER':
    case 'SCHOLAR':
      return { strength: 1, intelligence: 3, dexterity: 2 };
    case 'RANGER':
    case 'JESTER':
    case 'PIRATE':
      return { strength: 2, intelligence: 1, dexterity: 3 };
    case 'QUEEN':
    case 'PYROMANCER':
      return { strength: 2, intelligence: 2, dexterity: 2 };
    case 'SMITH':
      return { strength: 3, intelligence: 2, dexterity: 1 };
    default:
      return { strength: 2, intelligence: 2, dexterity: 2 };
  }
}

// ─── Activity Logging ────────────────────────────────────────────────────────

export interface ActivityLogEntry {
  id: string;
  userId: string;
  activity: string;
  xpGained: number;
  timestamp: string;
  details: string;
}

const ACTIVITY_LOG_KEY = 'lms_activity_log';

export function getActivityLog(userId: string): ActivityLogEntry[] {
  try {
    const data = localStorage.getItem(ACTIVITY_LOG_KEY);
    const logs: ActivityLogEntry[] = data ? JSON.parse(data) : [];
    return logs.filter(l => l.userId === userId).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

export function addActivityLog(entry: ActivityLogEntry) {
  try {
    const data = localStorage.getItem(ACTIVITY_LOG_KEY);
    const logs: ActivityLogEntry[] = data ? JSON.parse(data) : [];
    logs.push(entry);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
  } catch {
    // Silently fail
  }
}
