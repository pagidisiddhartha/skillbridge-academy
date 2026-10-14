import fs from 'fs';
import path from 'path';
import {
  User,
  StudentProfile,
  MentorProfile,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  LessonProgress,
  QuizAttempt,
  Internship,
  InternshipApplication,
  Project,
  ProjectSubmission,
  Certificate,
  Announcement,
  Notification,
  AuditLog,
} from './types.js';
import {
  initialUsers,
  initialStudentProfiles,
  initialMentorProfiles,
  initialCourses,
  initialModules,
  initialLessons,
  initialEnrollments,
  initialLessonProgress,
  initialInternships,
  initialApplications,
  initialProjects,
  initialSubmissions,
  initialCertificates,
  initialAnnouncements,
  initialNotifications,
  initialAuditLogs,
} from './seedData.js';

interface DatabaseSchema {
  users: User[];
  studentProfiles: StudentProfile[];
  mentorProfiles: MentorProfile[];
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  internships: Internship[];
  applications: InternshipApplication[];
  projects: Project[];
  submissions: ProjectSubmission[];
  certificates: Certificate[];
  announcements: Announcement[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private getDefaultData(): DatabaseSchema {
    return {
      users: [...initialUsers],
      studentProfiles: [...initialStudentProfiles],
      mentorProfiles: [...initialMentorProfiles],
      courses: [...initialCourses],
      modules: [...initialModules],
      lessons: [...initialLessons],
      enrollments: [...initialEnrollments],
      lessonProgress: [...initialLessonProgress],
      quizAttempts: [],
      internships: [...initialInternships],
      applications: [...initialApplications],
      projects: [...initialProjects],
      submissions: [...initialSubmissions],
      certificates: [...initialCertificates],
      announcements: [...initialAnnouncements],
      notifications: [...initialNotifications],
      auditLogs: [...initialAuditLogs],
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all collections exist
        const defaultData = this.getDefaultData();
        return {
          users: parsed.users || defaultData.users,
          studentProfiles: parsed.studentProfiles || defaultData.studentProfiles,
          mentorProfiles: parsed.mentorProfiles || defaultData.mentorProfiles,
          courses: parsed.courses || defaultData.courses,
          modules: parsed.modules || defaultData.modules,
          lessons: parsed.lessons || defaultData.lessons,
          enrollments: parsed.enrollments || defaultData.enrollments,
          lessonProgress: parsed.lessonProgress || defaultData.lessonProgress,
          quizAttempts: parsed.quizAttempts || defaultData.quizAttempts,
          internships: parsed.internships || defaultData.internships,
          applications: parsed.applications || defaultData.applications,
          projects: parsed.projects || defaultData.projects,
          submissions: parsed.submissions || defaultData.submissions,
          certificates: parsed.certificates || defaultData.certificates,
          announcements: parsed.announcements || defaultData.announcements,
          notifications: parsed.notifications || defaultData.notifications,
          auditLogs: parsed.auditLogs || defaultData.auditLogs,
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }

    const initial = this.getDefaultData();
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  public persist(): void {
    this.saveDatabase();
  }

  public resetToSeed(): void {
    this.data = this.getDefaultData();
    this.persist();
  }

  // --- Audit Log ---
  public addAuditLog(
    userId: string,
    userEmail: string,
    action: string,
    entityType: string,
    entityId: string,
    details: string,
    ipAddress = '127.0.0.1'
  ): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userEmail,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  // --- Users & Profiles ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[idx];
  }

  public getStudentProfile(userId: string): StudentProfile | undefined {
    return this.data.studentProfiles.find((p) => p.userId === userId);
  }

  public upsertStudentProfile(profile: StudentProfile): StudentProfile {
    const idx = this.data.studentProfiles.findIndex((p) => p.userId === profile.userId);
    if (idx !== -1) {
      this.data.studentProfiles[idx] = { ...this.data.studentProfiles[idx], ...profile };
    } else {
      this.data.studentProfiles.push(profile);
    }
    this.persist();
    return profile;
  }

  public getMentorProfile(userId: string): MentorProfile | undefined {
    return this.data.mentorProfiles.find((p) => p.userId === userId);
  }

  public upsertMentorProfile(profile: MentorProfile): MentorProfile {
    const idx = this.data.mentorProfiles.findIndex((p) => p.userId === profile.userId);
    if (idx !== -1) {
      this.data.mentorProfiles[idx] = { ...this.data.mentorProfiles[idx], ...profile };
    } else {
      this.data.mentorProfiles.push(profile);
    }
    this.persist();
    return profile;
  }

  // --- Courses, Modules & Lessons ---
  public getCourses(filter?: { category?: string; difficulty?: string; search?: string; publishedOnly?: boolean }): Course[] {
    let result = this.data.courses;
    if (filter?.publishedOnly) {
      result = result.filter((c) => c.published);
    }
    if (filter?.category && filter.category !== 'all') {
      result = result.filter((c) => c.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.difficulty && filter.difficulty !== 'all') {
      result = result.filter((c) => c.difficulty.toLowerCase() === filter.difficulty!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getCourseById(id: string, includeFullTree = true): Course | undefined {
    const course = this.data.courses.find((c) => c.id === id || c.slug === id);
    if (!course) return undefined;
    if (!includeFullTree) return course;

    const modules = this.data.modules
      .filter((m) => m.courseId === course.id)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((m) => ({
        ...m,
        lessons: this.data.lessons
          .filter((l) => l.moduleId === m.id)
          .sort((a, b) => a.orderIndex - b.orderIndex),
      }));

    return { ...course, modules };
  }

  public createCourse(course: Course): Course {
    this.data.courses.push(course);
    this.persist();
    return course;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.courses[idx] = {
      ...this.data.courses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.courses[idx];
  }

  public deleteCourse(id: string): boolean {
    const initialLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter((c) => c.id !== id);
    if (this.data.courses.length !== initialLen) {
      // Cascade delete modules & lessons
      const moduleIds = this.data.modules.filter((m) => m.courseId === id).map((m) => m.id);
      this.data.modules = this.data.modules.filter((m) => m.courseId !== id);
      this.data.lessons = this.data.lessons.filter((l) => !moduleIds.includes(l.moduleId));
      this.persist();
      return true;
    }
    return false;
  }

  public createModule(mod: CourseModule): CourseModule {
    this.data.modules.push(mod);
    this.persist();
    return mod;
  }

  public updateModule(id: string, updates: Partial<CourseModule>): CourseModule | undefined {
    const idx = this.data.modules.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.data.modules[idx] = { ...this.data.modules[idx], ...updates };
    this.persist();
    return this.data.modules[idx];
  }

  public deleteModule(id: string): boolean {
    const initialLen = this.data.modules.length;
    this.data.modules = this.data.modules.filter((m) => m.id !== id);
    if (this.data.modules.length !== initialLen) {
      this.data.lessons = this.data.lessons.filter((l) => l.moduleId !== id);
      this.persist();
      return true;
    }
    return false;
  }

  public createLesson(lesson: Lesson): Lesson {
    this.data.lessons.push(lesson);
    this.persist();
    return lesson;
  }

  public getLessonById(id: string): Lesson | undefined {
    return this.data.lessons.find((l) => l.id === id);
  }

  public updateLesson(id: string, updates: Partial<Lesson>): Lesson | undefined {
    const idx = this.data.lessons.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.data.lessons[idx] = { ...this.data.lessons[idx], ...updates };
    this.persist();
    return this.data.lessons[idx];
  }

  public deleteLesson(id: string): boolean {
    const initialLen = this.data.lessons.length;
    this.data.lessons = this.data.lessons.filter((l) => l.id !== id);
    if (this.data.lessons.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Enrollments & Progress ---
  public getEnrollments(userId?: string): Enrollment[] {
    if (userId) return this.data.enrollments.filter((e) => e.userId === userId);
    return this.data.enrollments;
  }

  public getEnrollment(userId: string, courseId: string): Enrollment | undefined {
    return this.data.enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  }

  public enrollUser(userId: string, courseId: string): Enrollment {
    const existing = this.getEnrollment(userId, courseId);
    if (existing) return existing;

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progressPercent: 0,
      status: 'active',
    };
    this.data.enrollments.push(newEnrollment);
    this.persist();
    return newEnrollment;
  }

  public getLessonProgress(userId: string, courseId: string): LessonProgress[] {
    return this.data.lessonProgress.filter((p) => p.userId === userId && p.courseId === courseId);
  }

  public toggleLessonProgress(userId: string, courseId: string, lessonId: string, completed: boolean): { progress: LessonProgress; overallPercent: number } {
    let prog = this.data.lessonProgress.find((p) => p.userId === userId && p.lessonId === lessonId);
    if (prog) {
      prog.completed = completed;
      prog.completedAt = completed ? new Date().toISOString() : undefined;
    } else {
      prog = {
        id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        courseId,
        lessonId,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
      this.data.lessonProgress.push(prog);
    }

    // Recalculate enrollment overall percentage
    const allCourseLessons = this.data.lessons.filter((l) => l.courseId === courseId);
    const completedCount = this.data.lessonProgress.filter(
      (p) => p.userId === userId && p.courseId === courseId && p.completed
    ).length;

    const totalLessons = allCourseLessons.length || 1;
    const overallPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

    const enrollment = this.getEnrollment(userId, courseId);
    if (enrollment) {
      enrollment.progressPercent = overallPercent;
      if (overallPercent === 100 && enrollment.status !== 'completed') {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date().toISOString();
      }
    }

    this.persist();
    return { progress: prog, overallPercent };
  }

  public recordQuizAttempt(attempt: QuizAttempt): QuizAttempt {
    this.data.quizAttempts.push(attempt);
    this.persist();
    return attempt;
  }

  public getQuizAttempts(userId: string, lessonId: string): QuizAttempt[] {
    return this.data.quizAttempts.filter((a) => a.userId === userId && a.lessonId === lessonId);
  }

  // --- Internships & Applications ---
  public getInternships(filter?: { workMode?: string; status?: string; search?: string }): Internship[] {
    let result = this.data.internships;
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((i) => i.status === filter.status);
    }
    if (filter?.workMode && filter.workMode !== 'all') {
      result = result.filter((i) => i.workMode === filter.workMode);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.organization.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getInternshipById(id: string): Internship | undefined {
    return this.data.internships.find((i) => i.id === id);
  }

  public createInternship(internship: Internship): Internship {
    this.data.internships.push(internship);
    this.persist();
    return internship;
  }

  public updateInternship(id: string, updates: Partial<Internship>): Internship | undefined {
    const idx = this.data.internships.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.data.internships[idx] = { ...this.data.internships[idx], ...updates };
    this.persist();
    return this.data.internships[idx];
  }

  public deleteInternship(id: string): boolean {
    const initialLen = this.data.internships.length;
    this.data.internships = this.data.internships.filter((i) => i.id !== id);
    if (this.data.internships.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getApplications(filter?: { studentId?: string; internshipId?: string }): InternshipApplication[] {
    let result = this.data.applications;
    if (filter?.studentId) {
      result = result.filter((a) => a.studentId === filter.studentId);
    }
    if (filter?.internshipId) {
      result = result.filter((a) => a.internshipId === filter.internshipId);
    }
    return result;
  }

  public getApplicationById(id: string): InternshipApplication | undefined {
    return this.data.applications.find((a) => a.id === id);
  }

  public createApplication(app: InternshipApplication): InternshipApplication {
    this.data.applications.push(app);
    this.persist();
    return app;
  }

  public updateApplication(id: string, updates: Partial<InternshipApplication>): InternshipApplication | undefined {
    const idx = this.data.applications.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.data.applications[idx] = {
      ...this.data.applications[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.applications[idx];
  }

  // --- Projects & Submissions ---
  public getProjects(): Project[] {
    return this.data.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public createProject(proj: Project): Project {
    this.data.projects.push(proj);
    this.persist();
    return proj;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.projects[idx] = { ...this.data.projects[idx], ...updates };
    this.persist();
    return this.data.projects[idx];
  }

  public getSubmissions(filter?: { studentId?: string; projectId?: string; mentorId?: string }): ProjectSubmission[] {
    let result = this.data.submissions;
    if (filter?.studentId) {
      result = result.filter((s) => s.studentId === filter.studentId);
    }
    if (filter?.projectId) {
      result = result.filter((s) => s.projectId === filter.projectId);
    }
    return result;
  }

  public getSubmissionById(id: string): ProjectSubmission | undefined {
    return this.data.submissions.find((s) => s.id === id);
  }

  public createSubmission(sub: ProjectSubmission): ProjectSubmission {
    this.data.submissions.push(sub);
    this.persist();
    return sub;
  }

  public updateSubmission(id: string, updates: Partial<ProjectSubmission>): ProjectSubmission | undefined {
    const idx = this.data.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.submissions[idx] = { ...this.data.submissions[idx], ...updates };
    this.persist();
    return this.data.submissions[idx];
  }

  // --- Certificates ---
  public getCertificates(studentId?: string): Certificate[] {
    if (studentId) return this.data.certificates.filter((c) => c.studentId === studentId);
    return this.data.certificates;
  }

  public getCertificateByCode(code: string): Certificate | undefined {
    return this.data.certificates.find((c) => c.certificateCode.toLowerCase() === code.trim().toLowerCase());
  }

  public issueCertificate(cert: Certificate): Certificate {
    this.data.certificates.push(cert);
    this.persist();
    return cert;
  }

  public updateCertificate(id: string, updates: Partial<Certificate>): Certificate | undefined {
    const idx = this.data.certificates.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.certificates[idx] = { ...this.data.certificates[idx], ...updates };
    this.persist();
    return this.data.certificates[idx];
  }

  // --- Announcements & Notifications ---
  public getAnnouncements(role?: string): Announcement[] {
    if (!role || role === 'admin') return this.data.announcements;
    return this.data.announcements.filter((a) => a.targetRole === 'all' || a.targetRole === role);
  }

  public createAnnouncement(ann: Announcement): Announcement {
    this.data.announcements.unshift(ann);
    this.persist();
    return ann;
  }

  public getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public addNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.persist();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.persist();
  }

  // --- Audit Logs ---
  public getAuditLogs(limit = 100): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // --- Aggregated Analytics ---
  public getAnalytics() {
    const totalStudents = this.data.users.filter((u) => u.role === 'student').length;
    const totalMentors = this.data.users.filter((u) => u.role === 'mentor').length;
    const publishedCourses = this.data.courses.filter((c) => c.published).length;
    const activeInternships = this.data.internships.filter((i) => i.status === 'published').length;
    const totalApplications = this.data.applications.length;
    const totalEnrollments = this.data.enrollments.length;
    const totalCertificatesIssued = this.data.certificates.length;
    const pendingSubmissions = this.data.submissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length;

    // Applications status breakdown
    const applicationsByStatus = {
      applied: this.data.applications.filter((a) => a.status === 'applied').length,
      under_review: this.data.applications.filter((a) => a.status === 'under_review').length,
      shortlisted: this.data.applications.filter((a) => a.status === 'shortlisted').length,
      interview: this.data.applications.filter((a) => a.status === 'interview').length,
      selected: this.data.applications.filter((a) => a.status === 'selected').length,
      rejected: this.data.applications.filter((a) => a.status === 'rejected').length,
      withdrawn: this.data.applications.filter((a) => a.status === 'withdrawn').length,
    };

    // Monthly enrollment trends
    const enrollmentTrends = [
      { month: 'Nov', enrollments: 12, completions: 4 },
      { month: 'Dec', enrollments: 19, completions: 9 },
      { month: 'Jan', enrollments: 28, completions: 14 },
      { month: 'Feb', enrollments: 34, completions: 20 },
      { month: 'Mar', enrollments: 42, completions: 28 },
    ];

    return {
      totalStudents,
      totalMentors,
      publishedCourses,
      activeInternships,
      totalApplications,
      totalEnrollments,
      totalCertificatesIssued,
      pendingSubmissions,
      applicationsByStatus,
      enrollmentTrends,
    };
  }
}

export const db = new DatabaseStore();
