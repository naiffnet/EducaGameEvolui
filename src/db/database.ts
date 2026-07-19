import type { Course, User, AuditLog, SystemConfig, AcademicRecord, GradeEntry, EnrollmentEntry, AttendanceRecord, Mission, MissionSubmission } from '../types';
import { INITIAL_USERS, INITIAL_COURSES, INITIAL_AUDIT_LOGS, INITIAL_CONFIG, INITIAL_ATTENDANCE, INITIAL_MISSIONS } from './seedData';

const KEYS = {
  USERS: 'lms_users',
  COURSES: 'lms_courses',
  LOGS: 'lms_audit_logs',
  CONFIG: 'lms_config',
  CURRENT_USER_ID: 'lms_current_user_id',
  ACADEMIC_RECORDS: 'lms_academic_records',
  ATTENDANCE: 'lms_attendance',
  MISSIONS: 'lms_missions',
  MISSION_SUBMISSIONS: 'lms_mission_submissions',
};

// Auto-initialize LocalStorage with Seed Data if empty
export const initializeDB = (forceReset = false) => {
  if (forceReset || !localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (forceReset || !localStorage.getItem(KEYS.COURSES)) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  }
  if (forceReset || !localStorage.getItem(KEYS.LOGS)) {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
  if (forceReset || !localStorage.getItem(KEYS.CONFIG)) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
  }
  if (forceReset || !localStorage.getItem(KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, 'user-student');
  }
  if (forceReset || !localStorage.getItem(KEYS.ACADEMIC_RECORDS)) {
    localStorage.setItem(KEYS.ACADEMIC_RECORDS, JSON.stringify([]));
  }
  if (forceReset || !localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (forceReset || !localStorage.getItem(KEYS.MISSIONS)) {
    localStorage.setItem(KEYS.MISSIONS, JSON.stringify(INITIAL_MISSIONS));
  }
  if (forceReset || !localStorage.getItem(KEYS.MISSION_SUBMISSIONS)) {
    localStorage.setItem(KEYS.MISSION_SUBMISSIONS, JSON.stringify([]));
  }
};

// Run initialization immediately
initializeDB();

// ─── Core DB operations ───────────────────────────────────────────────────────
export const db = {
  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers(): User[] {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: User[]) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  updateUser(updatedUser: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
    }
  },

  addUser(user: User) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    // Initialize empty academic record
    this.initAcademicRecord(user.id);
  },

  deleteUser(userId: string) {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.saveUsers(users);
    // Clean up academic record
    const records = this.getAllAcademicRecords().filter(r => r.userId !== userId);
    localStorage.setItem(KEYS.ACADEMIC_RECORDS, JSON.stringify(records));
  },

  // ── Courses ────────────────────────────────────────────────────────────────
  getCourses(): Course[] {
    const data = localStorage.getItem(KEYS.COURSES);
    return data ? JSON.parse(data) : [];
  },

  saveCourses(courses: Course[]) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  },

  addCourse(course: Course) {
    const courses = this.getCourses();
    courses.push(course);
    this.saveCourses(courses);
  },

  updateCourse(updatedCourse: Course) {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === updatedCourse.id);
    if (index !== -1) {
      courses[index] = updatedCourse;
      this.saveCourses(courses);
    }
  },

  // ── Logs ───────────────────────────────────────────────────────────────────
  getLogs(): AuditLog[] {
    const data = localStorage.getItem(KEYS.LOGS);
    const logs: AuditLog[] = data ? JSON.parse(data) : [];
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addLog(userId: string, userName: string, role: string, action: string, details: string, status: 'success' | 'warning' | 'error' = 'success') {
    const logs = this.getLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole: role as any,
      action,
      details,
      status,
    };
    logs.push(newLog);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  clearLogs() {
    localStorage.setItem(KEYS.LOGS, JSON.stringify([]));
  },

  // ── Config ─────────────────────────────────────────────────────────────────
  getConfig(): SystemConfig {
    const data = localStorage.getItem(KEYS.CONFIG);
    return data ? JSON.parse(data) : INITIAL_CONFIG;
  },

  saveConfig(config: SystemConfig) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  // ── Auth/Session ───────────────────────────────────────────────────────────
  getCurrentUserId(): string | null {
    return localStorage.getItem(KEYS.CURRENT_USER_ID);
  },

  getCurrentUser(): User | null {
    const userId = this.getCurrentUserId();
    if (!userId) return null;
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  getCurrentUserWithEvolution(): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    return this.ensureEvolutionData(user);
  },

  setCurrentUser(userId: string) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
    const user = this.getUsers().find(u => u.id === userId);
    if (user) {
      this.addLog(
        user.id,
        user.name,
        user.role,
        'Mudança de Perfil',
        `Usuário mudou de perfil ativo para ${user.name} (${user.role}).`
      );
    }
  },

  logout() {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  },

  resetDB() {
    initializeDB(true);
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addLog(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'Restauração de Sistema',
        'Banco de dados restaurado com sucesso para as configurações originais de fábrica.',
        'warning'
      );
    }
  },

  // ── Academic Records ───────────────────────────────────────────────────────

  getAllAcademicRecords(): AcademicRecord[] {
    const data = localStorage.getItem(KEYS.ACADEMIC_RECORDS);
    return data ? JSON.parse(data) : [];
  },

  initAcademicRecord(userId: string): AcademicRecord {
    const records = this.getAllAcademicRecords();
    const existing = records.find(r => r.userId === userId);
    if (existing) return existing;

    const user = this.getUsers().find(u => u.id === userId);
    const courses = this.getCourses();

    // Build initial enrollment history from the User's enrolledCourses
    const enrollmentHistory: EnrollmentEntry[] = (user?.enrolledCourses || []).map(courseId => {
      const course = courses.find(c => c.id === courseId);
      const totalLessons = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 1;
      const completed = (user?.completedLessons || []).filter(lid =>
        course?.modules.some(m => m.lessons.some(l => l.id === lid))
      ).length;
      return {
        id: `enroll-${userId}-${courseId}`,
        courseId,
        courseName: course?.title || courseId,
        enrolledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        status: 'active' as const,
        progressPercent: Math.round((completed / totalLessons) * 100),
      };
    });

    const newRecord: AcademicRecord = {
      userId,
      grades: [],
      enrollmentHistory,
      generalObservations: '',
      updatedAt: new Date().toISOString(),
    };

    records.push(newRecord);
    localStorage.setItem(KEYS.ACADEMIC_RECORDS, JSON.stringify(records));
    return newRecord;
  },

  getAcademicRecord(userId: string): AcademicRecord {
    const records = this.getAllAcademicRecords();
    return records.find(r => r.userId === userId) || this.initAcademicRecord(userId);
  },

  saveAcademicRecord(record: AcademicRecord) {
    const records = this.getAllAcademicRecords();
    const index = records.findIndex(r => r.userId === record.userId);
    const updated = { ...record, updatedAt: new Date().toISOString() };
    if (index !== -1) {
      records[index] = updated;
    } else {
      records.push(updated);
    }
    localStorage.setItem(KEYS.ACADEMIC_RECORDS, JSON.stringify(records));
  },

  addGrade(userId: string, entry: Omit<GradeEntry, 'id'>): GradeEntry {
    const record = this.getAcademicRecord(userId);
    const newEntry: GradeEntry = { ...entry, id: `grade-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    record.grades.push(newEntry);
    this.saveAcademicRecord(record);
    return newEntry;
  },

  updateGrade(userId: string, entry: GradeEntry) {
    const record = this.getAcademicRecord(userId);
    const idx = record.grades.findIndex(g => g.id === entry.id);
    if (idx !== -1) record.grades[idx] = entry;
    this.saveAcademicRecord(record);
  },

  removeGrade(userId: string, gradeId: string) {
    const record = this.getAcademicRecord(userId);
    record.grades = record.grades.filter(g => g.id !== gradeId);
    this.saveAcademicRecord(record);
  },

  addEnrollment(userId: string, entry: Omit<EnrollmentEntry, 'id'>): EnrollmentEntry {
    const record = this.getAcademicRecord(userId);
    const newEntry: EnrollmentEntry = { ...entry, id: `enroll-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    // Remove duplicate if exists
    record.enrollmentHistory = record.enrollmentHistory.filter(e => e.courseId !== entry.courseId);
    record.enrollmentHistory.push(newEntry);
    this.saveAcademicRecord(record);

    // Also update User.enrolledCourses
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user && !user.enrolledCourses.includes(entry.courseId)) {
      user.enrolledCourses.push(entry.courseId);
      this.updateUser(user);
    }
    return newEntry;
  },

  updateEnrollmentStatus(userId: string, courseId: string, status: EnrollmentEntry['status']) {
    const record = this.getAcademicRecord(userId);
    const entry = record.enrollmentHistory.find(e => e.courseId === courseId);
    if (entry) {
      entry.status = status;
      if (status === 'completed') entry.completedAt = new Date().toISOString();
    }
    this.saveAcademicRecord(record);

    // Sync User.enrolledCourses
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      if (status === 'dropped') {
        user.enrolledCourses = user.enrolledCourses.filter(id => id !== courseId);
      }
      this.updateUser(user);
    }
  },

  updateGeneralObservations(userId: string, text: string) {
    const record = this.getAcademicRecord(userId);
    record.generalObservations = text;
    this.saveAcademicRecord(record);
  },

  // ── Turma & Chamada ────────────────────────────────────────────────────────

  getAttendanceRecords(): AttendanceRecord[] {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

  getAttendanceForStudent(studentId: string): AttendanceRecord[] {
    return this.getAttendanceRecords()
      .filter(r => r.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getAttendanceForClassAndDate(schoolClass: string, date: string): AttendanceRecord[] {
    return this.getAttendanceRecords().filter(r => r.schoolClass === schoolClass && r.date === date);
  },

  /**
   * Registra a presença/falta de um estudante numa data (chave natural: studentId + date).
   * Idempotente (Regra de Negócio B1): chamar de novo para a mesma data apenas atualiza o
   * registro existente — nunca duplica. `xpShouldBeGranted` só vem `true` uma única vez por
   * studentId+date, para sempre — mesmo que o instrutor alterne presente/falta várias vezes
   * no mesmo dia. É o próprio módulo que garante essa invariante (campo `xpGranted`, que uma
   * vez `true` nunca volta a `false`), não quem o chama.
   */
  recordAttendance(studentId: string, schoolClass: string, date: string, present: boolean, instructorId: string): { record: AttendanceRecord; xpShouldBeGranted: boolean } {
    const records = this.getAttendanceRecords();
    const idx = records.findIndex(r => r.studentId === studentId && r.date === date);
    const existing = idx !== -1 ? records[idx] : null;
    const xpShouldBeGranted = present && !existing?.xpGranted;

    const record: AttendanceRecord = {
      id: existing?.id ?? `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      schoolClass,
      date,
      present,
      xpGranted: !!existing?.xpGranted || xpShouldBeGranted,
      recordedByInstructorId: instructorId,
      recordedAt: new Date().toISOString(),
    };

    if (idx !== -1) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
    return { record, xpShouldBeGranted };
  },

  // ── Missões ────────────────────────────────────────────────────────────────

  getMissions(): Mission[] {
    const data = localStorage.getItem(KEYS.MISSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveMissions(missions: Mission[]) {
    localStorage.setItem(KEYS.MISSIONS, JSON.stringify(missions));
  },

  addMission(mission: Mission) {
    const missions = this.getMissions();
    missions.push(mission);
    this.saveMissions(missions);
  },

  updateMission(updated: Mission) {
    const missions = this.getMissions();
    const idx = missions.findIndex(m => m.id === updated.id);
    if (idx !== -1) {
      missions[idx] = updated;
      this.saveMissions(missions);
    }
  },

  getMissionSubmissions(): MissionSubmission[] {
    const data = localStorage.getItem(KEYS.MISSION_SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveMissionSubmissions(submissions: MissionSubmission[]) {
    localStorage.setItem(KEYS.MISSION_SUBMISSIONS, JSON.stringify(submissions));
  },

  addMissionSubmission(submission: MissionSubmission) {
    const submissions = this.getMissionSubmissions();
    submissions.push(submission);
    this.saveMissionSubmissions(submissions);
  },

  updateMissionSubmission(updated: MissionSubmission) {
    const submissions = this.getMissionSubmissions();
    const idx = submissions.findIndex(s => s.id === updated.id);
    if (idx !== -1) {
      submissions[idx] = updated;
      this.saveMissionSubmissions(submissions);
    }
  },

  getSubmissionsForStudent(studentId: string): MissionSubmission[] {
    return this.getMissionSubmissions().filter(s => s.studentId === studentId);
  },

  /** Compute average grade for a student (returns null if no grades) */
  getAverageGrade(userId: string): number | null {
    const record = this.getAcademicRecord(userId);
    if (!record.grades.length) return null;
    const sum = record.grades.reduce((acc, g) => acc + g.grade, 0);
    return Math.round((sum / record.grades.length) * 10) / 10;
  },

  /** Check if user has evolution data, and migrate if needed */
  ensureEvolutionData(user: User): User {
    if (user.role !== 'STUDENT') return user;
    if (!user.rpgCharacter) return user;
    
    const char = user.rpgCharacter;
    let needsUpdate = false;
    
    if (!char.dailyProgress) {
      (char as any).dailyProgress = {
        lastActivityDate: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        xpGainedToday: 0,
        dailyTasksCompleted: [],
        lastDailyReset: new Date().toISOString(),
      };
      needsUpdate = true;
    }
    
    if (!char.milestones) {
      (char as any).milestones = [];
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      this.updateUser(user);
    }
    
    return user;
  },

  /** Compute overall completion percentage for a student across enrolled courses */
  getOverallProgress(userId: string): number {
    const user = this.getUsers().find(u => u.id === userId);
    if (!user || !user.enrolledCourses.length) return 0;
    const courses = this.getCourses();
    let totalLessons = 0;
    let completedLessons = 0;
    user.enrolledCourses.forEach(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      const lessons = course.modules.flatMap(m => m.lessons);
      totalLessons += lessons.length;
      completedLessons += lessons.filter(l => user.completedLessons.includes(l.id)).length;
    });
    return totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  },
};

// ─── Evolution Migration (run after db is defined) ────────────────────────────

/** Migrate existing users to include evolution fields if missing */
export function migrateEvolutionFields() {
  try {
    const users = db.getUsers();
    let changed = false;

    const migrated = users.map(user => {
      if (user.role !== 'STUDENT' || !user.rpgCharacter) return user;
      const char = user.rpgCharacter;
      const needsMigration = !(char as any).dailyProgress || !(char as any).milestones;
      if (!needsMigration) return user;

      changed = true;
      return {
        ...user,
        rpgCharacter: {
          ...char,
          dailyProgress: (char as any).dailyProgress || {
            lastActivityDate: new Date().toISOString(),
            currentStreak: 0,
            longestStreak: 0,
            xpGainedToday: 0,
            dailyTasksCompleted: [],
            lastDailyReset: new Date().toISOString(),
          },
          milestones: (char as any).milestones || [],
        },
      };
    });

    if (changed) {
      db.saveUsers(migrated);
    }
  } catch (e) {
    // Silent fail on migration
  }
}

// Run migration
try {
  migrateEvolutionFields();
} catch (e) {
  // Silent fail
}
