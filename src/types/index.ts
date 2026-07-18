export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'MAINTENANCE';

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

export interface RpgCharacter {
  selectedClass: RpgClass | null;
  level: number;
  xp: number;
  unlockedSkills: string[];
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
  };
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
}
