import type { Course, User, AuditLog, SystemConfig, AcademicRecord, GradeEntry, EnrollmentEntry, AttendanceRecord, Mission, MissionSubmission, GuardianLink, Invoice, Announcement, DirectMessage, SkillNode, InventoryItem, UserInventory, BossFight, StudentAppointment, SchoolReport } from '../types';
import { INITIAL_USERS, INITIAL_COURSES, INITIAL_AUDIT_LOGS, INITIAL_CONFIG, INITIAL_ATTENDANCE, INITIAL_MISSIONS, INITIAL_GUARDIAN_LINKS, INITIAL_INVOICES, INITIAL_ANNOUNCEMENTS, INITIAL_DIRECT_MESSAGES, INITIAL_SKILL_NODES, INITIAL_INVENTORY_ITEMS, INITIAL_BOSS_FIGHTS, INITIAL_STUDENT_APPOINTMENTS, INITIAL_SCHOOL_REPORTS } from './seedData';
import { resolveInvoicesStatus } from '../engine/FinancialEngine';
import { hashPassword } from '../engine/AuthUtils';

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
  GUARDIAN_LINKS: 'lms_guardian_links',
  INVOICES: 'lms_invoices',
  ANNOUNCEMENTS: 'lms_announcements',
  DIRECT_MESSAGES: 'lms_direct_messages',
  SKILL_NODES: 'lms_skill_nodes',
  INVENTORY_ITEMS: 'lms_inventory_items',
  USER_INVENTORIES: 'lms_user_inventories',
  BOSS_FIGHTS: 'lms_boss_fights',
  STUDENT_APPOINTMENTS: 'lms_student_appointments',
  SCHOOL_REPORTS: 'lms_school_reports',
};

// Auto-initialize LocalStorage with Seed Data if empty
export const initializeDB = (forceReset = false) => {
  if (forceReset || !localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  } else {
    // Backfill: garante que todos os usuários legados possuam passwordHash
    try {
      const stored: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      let updated = false;
      const currentMap = new Map(stored.map(u => [u.id, u]));

      // Merge missing initial seed users (ex: user-guardian-paulo ou novas contas)
      for (const initUser of INITIAL_USERS) {
        if (!currentMap.has(initUser.id)) {
          stored.push(initUser);
          updated = true;
        }
      }

      for (let i = 0; i < stored.length; i++) {
        if (!stored[i].passwordHash) {
          stored[i].passwordHash = hashPassword('estudar123', stored[i].email);
          updated = true;
        }
      }

      if (updated) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(stored));
      }
    } catch {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
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
  if (forceReset || !localStorage.getItem(KEYS.GUARDIAN_LINKS)) {
    localStorage.setItem(KEYS.GUARDIAN_LINKS, JSON.stringify(INITIAL_GUARDIAN_LINKS));
  }
  if (forceReset || !localStorage.getItem(KEYS.INVOICES)) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  }
  if (forceReset || !localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }
  if (forceReset || !localStorage.getItem(KEYS.DIRECT_MESSAGES)) {
    localStorage.setItem(KEYS.DIRECT_MESSAGES, JSON.stringify(INITIAL_DIRECT_MESSAGES));
  }
  if (forceReset || !localStorage.getItem(KEYS.SKILL_NODES)) {
    localStorage.setItem(KEYS.SKILL_NODES, JSON.stringify(INITIAL_SKILL_NODES));
  }
  if (forceReset || !localStorage.getItem(KEYS.INVENTORY_ITEMS)) {
    localStorage.setItem(KEYS.INVENTORY_ITEMS, JSON.stringify(INITIAL_INVENTORY_ITEMS));
  }
  if (forceReset || !localStorage.getItem(KEYS.BOSS_FIGHTS)) {
    localStorage.setItem(KEYS.BOSS_FIGHTS, JSON.stringify(INITIAL_BOSS_FIGHTS));
  }
  if (forceReset || !localStorage.getItem(KEYS.STUDENT_APPOINTMENTS)) {
    localStorage.setItem(KEYS.STUDENT_APPOINTMENTS, JSON.stringify(INITIAL_STUDENT_APPOINTMENTS));
  }
  if (forceReset || !localStorage.getItem(KEYS.SCHOOL_REPORTS)) {
    localStorage.setItem(KEYS.SCHOOL_REPORTS, JSON.stringify(INITIAL_SCHOOL_REPORTS));
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

  // ── Guardian Links ──────────────────────────────────────────────────────────
  getGuardianLinks(): GuardianLink[] {
    const data = localStorage.getItem(KEYS.GUARDIAN_LINKS);
    return data ? JSON.parse(data) : [];
  },

  saveGuardianLinks(links: GuardianLink[]) {
    localStorage.setItem(KEYS.GUARDIAN_LINKS, JSON.stringify(links));
  },

  getStudentsForGuardian(guardianUserId: string): User[] {
    const links = this.getGuardianLinks().filter(l => l.guardianUserId === guardianUserId);
    const studentIds = new Set(links.map(l => l.studentUserId));
    return this.getUsers().filter(u => studentIds.has(u.id));
  },

  getGuardiansForStudent(studentUserId: string): { guardian: User; relationship: string; linkId: string }[] {
    const links = this.getGuardianLinks().filter(l => l.studentUserId === studentUserId);
    const users = this.getUsers();
    return links
      .map(l => {
        const guardian = users.find(u => u.id === l.guardianUserId);
        return guardian ? { guardian, relationship: l.relationship, linkId: l.id } : null;
      })
      .filter((item): item is { guardian: User; relationship: string; linkId: string } => item !== null);
  },

  addGuardianLink(link: GuardianLink) {
    const links = this.getGuardianLinks();
    if (!links.some(l => l.guardianUserId === link.guardianUserId && l.studentUserId === link.studentUserId)) {
      links.push(link);
      this.saveGuardianLinks(links);
    }
  },

  removeGuardianLink(linkId: string) {
    const links = this.getGuardianLinks().filter(l => l.id !== linkId);
    this.saveGuardianLinks(links);
  },

  // ── Financial / Invoices (Entrega F) ──────────────────────────────────────
  getRawInvoices(): Invoice[] {
    const data = localStorage.getItem(KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },

  saveInvoices(invoices: Invoice[]) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },

  getInvoices(): Invoice[] {
    const raw = this.getRawInvoices();
    const resolved = resolveInvoicesStatus(raw);
    if (JSON.stringify(raw) !== JSON.stringify(resolved)) {
      this.saveInvoices(resolved);
    }
    return resolved;
  },

  getInvoicesForStudent(studentId: string): Invoice[] {
    return this.getInvoices().filter(inv => inv.studentId === studentId);
  },

  addInvoice(invoice: Invoice) {
    const invoices = this.getRawInvoices();
    invoices.push(invoice);
    this.saveInvoices(invoices);
  },

  markInvoicePaid(invoiceId: string) {
    const invoices = this.getRawInvoices();
    const idx = invoices.findIndex(i => i.id === invoiceId);
    if (idx !== -1) {
      invoices[idx] = {
        ...invoices[idx],
        status: 'PAID',
        paidAt: new Date().toISOString(),
      };
      this.saveInvoices(invoices);
    }
  },

  deleteInvoice(invoiceId: string) {
    const invoices = this.getRawInvoices().filter(i => i.id !== invoiceId);
    this.saveInvoices(invoices);
  },

  // ── Communication / Announcements (Entrega G) ─────────────────────────────
  getAnnouncements(): Announcement[] {
    const data = localStorage.getItem(KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : [];
  },

  saveAnnouncements(announcements: Announcement[]) {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  },

  addAnnouncement(announcement: Announcement) {
    const list = this.getAnnouncements();
    list.unshift(announcement);
    this.saveAnnouncements(list);
  },

  deleteAnnouncement(id: string) {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    this.saveAnnouncements(list);
  },

  /** Regra G1: Filtra avisos por audiência (Escola toda ou Turma do Aluno/Responsável) */
  getAnnouncementsForUser(user: User): Announcement[] {
    const all = this.getAnnouncements();
    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      return all;
    }

    if (user.role === 'STUDENT') {
      return all.filter(a =>
        a.audience === 'SCHOOL' ||
        (typeof a.audience === 'object' && a.audience.schoolClass === user.schoolClass)
      );
    }

    if (user.role === 'GUARDIAN') {
      const students = this.getStudentsForGuardian(user.id);
      const studentClasses = new Set(students.map(s => s.schoolClass).filter(Boolean));
      return all.filter(a =>
        a.audience === 'SCHOOL' ||
        (typeof a.audience === 'object' && studentClasses.has(a.audience.schoolClass))
      );
    }

    return all.filter(a => a.audience === 'SCHOOL');
  },

  // ── Communication / Direct Messages (Entrega G) ────────────────────────────
  getDirectMessages(): DirectMessage[] {
    const data = localStorage.getItem(KEYS.DIRECT_MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  saveDirectMessages(messages: DirectMessage[]) {
    localStorage.setItem(KEYS.DIRECT_MESSAGES, JSON.stringify(messages));
  },

  sendDirectMessage(fromUser: User, toUser: User, body: string, studentId?: string): DirectMessage {
    const list = this.getDirectMessages();
    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      toUserId: toUser.id,
      toUserName: toUser.name,
      studentId,
      body,
      createdAt: new Date().toISOString(),
    };
    list.push(newMsg);
    this.saveDirectMessages(list);
    return newMsg;
  },

  getDirectMessagesForUser(userId: string): DirectMessage[] {
    const all = this.getDirectMessages();
    return all.filter(m => m.fromUserId === userId || m.toUserId === userId);
  },

  // ── Skill Nodes (Árvore de Habilidades) ──────────────────────────────────
  getSkillNodes(): SkillNode[] {
    const data = localStorage.getItem(KEYS.SKILL_NODES);
    return data ? JSON.parse(data) : INITIAL_SKILL_NODES;
  },

  // ── Inventory Items (Loja de Inventário) ──────────────────────────────────
  getInventoryItems(): InventoryItem[] {
    const data = localStorage.getItem(KEYS.INVENTORY_ITEMS);
    return data ? JSON.parse(data) : INITIAL_INVENTORY_ITEMS;
  },

  getUserInventory(userId: string): UserInventory {
    try {
      const data = localStorage.getItem(KEYS.USER_INVENTORIES);
      const dict: Record<string, UserInventory> = data ? JSON.parse(data) : {};
      if (dict[userId]) return dict[userId];
    } catch {}
    return { coins: 120, ownedItemIds: [], unlockedSkillIds: ['skill-warrior-1', 'skill-mage-1', 'skill-queen-1', 'skill-pirate-1'] };
  },

  saveUserInventory(userId: string, inv: UserInventory) {
    try {
      const data = localStorage.getItem(KEYS.USER_INVENTORIES);
      const dict: Record<string, UserInventory> = data ? JSON.parse(data) : {};
      dict[userId] = inv;
      localStorage.setItem(KEYS.USER_INVENTORIES, JSON.stringify(dict));
    } catch {}
  },

  // ── Boss Fights (Desafios Colaborativos da Turma) ─────────────────────────
  getBossFights(): BossFight[] {
    const data = localStorage.getItem(KEYS.BOSS_FIGHTS);
    return data ? JSON.parse(data) : INITIAL_BOSS_FIGHTS;
  },

  saveBossFight(boss: BossFight) {
    const fights = this.getBossFights();
    const idx = fights.findIndex(b => b.id === boss.id);
    if (idx >= 0) fights[idx] = boss;
    else fights.push(boss);
    localStorage.setItem(KEYS.BOSS_FIGHTS, JSON.stringify(fights));
  },

  dealDamageToBoss(bossId: string, damage: number): BossFight | null {
    const fights = this.getBossFights();
    const boss = fights.find(b => b.id === bossId);
    if (!boss || boss.status === 'VICTORIOUS') return null;

    boss.currentHp = Math.max(0, boss.currentHp - damage);
    if (boss.currentHp === 0) {
      boss.status = 'VICTORIOUS';
    }
    this.saveBossFight(boss);
    return boss;
  },

  // ── Central de Atendimento (Agendamento) ──────────────────────────────────
  getStudentAppointments(): StudentAppointment[] {
    const data = localStorage.getItem(KEYS.STUDENT_APPOINTMENTS);
    return data ? JSON.parse(data) : INITIAL_STUDENT_APPOINTMENTS;
  },

  saveStudentAppointment(app: StudentAppointment) {
    const list = this.getStudentAppointments();
    const idx = list.findIndex(a => a.id === app.id);
    if (idx >= 0) list[idx] = app;
    else list.push(app);
    localStorage.setItem(KEYS.STUDENT_APPOINTMENTS, JSON.stringify(list));
  },

  // ── Ouvidoria Escolar (Canal de Denúncias Seguras) ───────────────────────
  getSchoolReports(): SchoolReport[] {
    const data = localStorage.getItem(KEYS.SCHOOL_REPORTS);
    return data ? JSON.parse(data) : INITIAL_SCHOOL_REPORTS;
  },

  saveSchoolReport(rep: SchoolReport) {
    const list = this.getSchoolReports();
    const idx = list.findIndex(r => r.id === rep.id);
    if (idx >= 0) list[idx] = rep;
    else list.push(rep);
    localStorage.setItem(KEYS.SCHOOL_REPORTS, JSON.stringify(list));
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
