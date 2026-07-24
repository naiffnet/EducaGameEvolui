export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'MAINTENANCE' | 'GUARDIAN' | 'COORDINATOR' | 'DIRECTOR';

// ─── Blueprint Fase 2 & 3 Domain Types ────────────────────────────────────────

export interface SkillNode {
  id: string;
  className: RpgClass;
  title: string;
  description: string;
  requiredLevel: number;
  iconName: string;
  category: 'PASSIVE' | 'ACTIVE' | 'ULTIMATE';
  effect: string;
}

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'avatar' | 'title' | 'badge' | 'xp_boost';
  description: string;
  cost: number;
  iconName: string;
  rarity: ItemRarity;
  value?: string; // ex: avatar symbol or title text
}

export interface UserInventory {
  coins: number;
  ownedItemIds: string[];
  equippedTitle?: string;
  equippedAvatar?: string;
  unlockedSkillIds: string[];
}

export interface BossFight {
  id: string;
  schoolClass: string;
  courseId: string;
  courseName: string;
  title: string;
  bossName: string;
  description: string;
  maxHp: number;
  currentHp: number;
  rewardXp: number;
  rewardCoins: number;
  status: 'ACTIVE' | 'VICTORIOUS';
  avatarSymbol: string;
  createdAt: string;
}

/** Relacionamento entre um Responsável (GUARDIAN) e um Estudante */
export interface GuardianLink {
  id: string;
  guardianUserId: string;
  studentUserId: string;
  relationship: string; // ex: "Pai", "Mãe", "Tutor Legal", "Outro"
  createdAt: string; // ISO datetime
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE';

/** Cobrança/Mensalidade financeira (Entrega F) */
export interface Invoice {
  id: string;
  studentId: string;
  description: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  paidAt?: string; // ISO datetime
  createdAt: string; // ISO datetime
}

export type AnnouncementAudience = 'SCHOOL' | { schoolClass: string };

/** Aviso do Mural de Comunicação (Entrega G) */
export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  createdAt: string; // ISO datetime
}

/** Mensagem Direta entre Responsável e Instrutor (Entrega G) */
export interface DirectMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  studentId?: string; // opcional: ID do estudante sobre o qual é a dúvida
  body: string;
  createdAt: string; // ISO datetime
  readAt?: string; // ISO datetime
}

export interface TeacherNote {
  id: string;
  teacherName: string;
  text: string;
  date: string;
}

export type RpgClass =
  | 'MAGE'
  | 'WARRIOR'
  | 'RANGER'
  | 'NECROMANCER'
  | 'QUEEN'
  | 'SCHOLAR'
  | 'SMITH'
  | 'PYROMANCER'
  | 'PIRATE'
  | 'JESTER'
  | 'CHAMPION';

// ─── Evolution Domain ────────────────────────────────────────────────────────

/** A milestone (marco) is an achievement that contributes to leveling up */
export interface Milestone {
  id: string;
  type: 'PERSONAL' | 'HERO';
  title: string;
  description: string;
  source: 'lesson_completed' | 'exercise_passed' | 'high_grade' | 'project_done' | 'streak_milestone' | 'course_completed' | 'badge_earned' | 'teacher_feedback' | 'attendance_confirmed' | 'mission_completed';
  achievedAt: string; // ISO date
  relatedEntityId?: string;
}

/** Tracks daily activity and streak data */
export interface DailyProgress {
  lastActivityDate: string; // ISO date of last activity
  currentStreak: number; // consecutive days with activity
  longestStreak: number;
  xpGainedToday: number;
  dailyTasksCompleted: string[]; // list of task IDs done today
  lastDailyReset: string; // ISO date of last reset
}

/** An activity suggested for the current day that grants extra XP when completed */
export interface DailyTask {
  id: string;
  label: string;
  xp: number;
  activity: 'lesson_watched' | 'lesson_completed' | 'exercise_passed' | 'daily_login';
}

export interface RpgCharacter {
  selectedClass: RpgClass | null;
  level: number;
  xp: number;
  avatarStyle?: 'EPIC_ADULT' | 'JUNIOR';
  unlockedSkills: string[];
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
  };
  // Evolution system fields
  milestones: Milestone[];
  dailyProgress: DailyProgress;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrolledCourses: string[];
  completedLessons: string[];
  unlockedBadges: string[];
  teacherNotes: TeacherNote[];
  rpgCharacter?: RpgCharacter;
  /** Turma administrativa do estudante (ex: "9º Ano A") — agrupamento leve, não uma entidade própria. Ver PLANO_IMPLEMENTACAO.md */
  schoolClass?: string;
  /** Cadastro Estendido (Entrega A) — todos opcionais para não quebrar usuários existentes */
  registrationId?: string; // matrícula
  birthDate?: string; // YYYY-MM-DD
  phoneNumber?: string;
  guardianName?: string;
  guardianPhone?: string;
  /** Entrega I — Autenticação com Senha Real. Nunca a senha em texto puro, ver engine/AuthUtils.ts */
  passwordHash?: string;
}

// ─── Turma & Chamada Domain ───────────────────────────────────────────────────

/** Registro de presença/falta de um estudante numa data. Chave natural: studentId + date */
export interface AttendanceRecord {
  id: string;
  studentId: string;
  schoolClass: string;
  date: string; // formato YYYY-MM-DD
  present: boolean;
  /** Uma vez true, nunca volta a false — garante que o XP de presença nunca é concedido duas vezes no mesmo dia, mesmo que present seja alternado várias vezes */
  xpGranted: boolean;
  recordedByInstructorId: string;
  recordedAt: string; // ISO datetime
}

// ─── Academic Record Domain ───────────────────────────────────────────────────

/** Grade/concept entry for a student in a specific course */
export interface GradeEntry {
  id: string;
  courseId: string;
  courseName: string;
  grade: number; // 0–10
  concept: 'Excelente' | 'Ótimo' | 'Bom' | 'Regular' | 'Insuficiente';
  instructorName: string;
  date: string; // ISO string
  observations?: string;
}

/** Historical enrollment record for a student */
export interface EnrollmentEntry {
  id: string;
  courseId: string;
  courseName: string;
  enrolledAt: string; // ISO string
  completedAt?: string; // ISO string
  status: 'active' | 'completed' | 'dropped';
  progressPercent: number; // 0–100 snapshot
}

/** Full academic record aggregate for a student — loaded on demand, not embedded in User */
export interface AcademicRecord {
  userId: string;
  grades: GradeEntry[];
  enrollmentHistory: EnrollmentEntry[];
  generalObservations: string;
  updatedAt: string;
}

// ─── Course / Lesson Domain ───────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'exercise';
  duration: string;
  content: string;
  videoUrl?: string;
  problemContent?: string;
  solutionContent?: string;
  explainerContent?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  image: string;
  modules: Module[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export interface SystemConfig {
  maintenanceMode: boolean;
  allowStudentRegistration: boolean;
  systemVersion: string;
  /** Nome da Instituição de Ensino Contratante (White-label Branding) */
  schoolName?: string;
  /** URL/Ícone da Logomarca da Escola Contratante */
  schoolLogoUrl?: string;
}

// ─── Missões Domain ───────────────────────────────────────────────────────────

export type MissionType = 'COMMON' | 'REQUESTED' | 'BLITZ';

/** Uma atividade pedagógica criada por um Instrutor, com prazo e XP próprios */
export interface Mission {
  id: string;
  courseId: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string;
  type: MissionType;
  xpReward: number;
  milestoneType: 'PERSONAL' | 'HERO';
  /** Regra M2: se milestoneType === 'HERO', isto deve ser sempre true */
  requiresValidation: boolean;
  /** Obrigatório e não-vazio apenas quando type === 'REQUESTED' */
  targetStudentIds?: string[];
  availableFrom: string; // ISO date
  dueAt: string; // ISO date
  relatedLessonId?: string;
  createdAt: string; // ISO datetime
  /** Instrutor encerrou antes do prazo original */
  closedEarly?: boolean;
}

/** Registro de que um estudante entregou/cumpriu uma Missão */
export interface MissionSubmission {
  id: string;
  missionId: string;
  studentId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  evidenceText?: string;
  submittedAt: string; // ISO datetime
  reviewedAt?: string; // ISO datetime
  reviewNote?: string;
}

// ─── Central de Atendimento & Ouvidoria Escolar ────────────────────────────

export interface StudentAppointment {
  id: string;
  studentId: string;
  studentName: string;
  targetStaffId: string;
  targetStaffName: string;
  targetStaffRole: 'INSTRUCTOR' | 'COORDINATOR' | 'DIRECTOR' | 'COUNSELOR';
  mode: 'PRESENTIAL' | 'VIRTUAL';
  category: 'ACADEMIC_DOUBT' | 'PEDAGOGICAL_SUPPORT' | 'EMOTIONAL_SUPPORT' | 'COMPLAINT_SUGGESTION';
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30"
  subject: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  meetingLink?: string;
  createdAt: string;
}

export interface SchoolReport {
  id: string;
  protocolNumber: string;
  isAnonymous: boolean;
  reporterStudentId?: string;
  reporterStudentName?: string;
  category: 'BULLYING' | 'CYBERBULLYING' | 'AGGRESSION' | 'DISCRIMINATION' | 'VANDALISM' | 'OTHER';
  urgency: 'NORMAL' | 'HIGH' | 'URGENT';
  location: string;
  incidentDate: string;
  description: string;
  involvedPeople?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'ARCHIVED';
  resolutionNotes?: string;
  createdAt: string;
}
