import {
  User,
  StudentProfile,
  MentorProfile,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  LessonProgress,
  Internship,
  InternshipApplication,
  Project,
  ProjectSubmission,
  Certificate,
  Announcement,
  Notification,
  AuditLog,
  PlatformAnalytics,
  ApplicationStatus,
  SubmissionStatus,
} from '../types';
import { clientDb } from './clientDb';

const TOKEN_KEY = 'skillbridge_auth_token';
const CURRENT_USER_ID_KEY = 'skillbridge_current_user_id';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  }
}

export function getStoredUserId(): string | null {
  const token = getStoredToken();
  if (!token) return null;
  const match = token.match(/user-[a-z]+-[0-9]+/);
  if (match) return match[0];
  return localStorage.getItem(CURRENT_USER_ID_KEY);
}

export function setStoredUserId(id: string): void {
  localStorage.setItem(CURRENT_USER_ID_KEY, id);
}

// Check if running on a static hosting service without local server (e.g. Netlify)
function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.includes('netlify.app') || host.includes('vercel.app') || host.includes('github.io');
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

async function fetchFromBackend<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('Static host HTML returned instead of JSON API response.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    async register(payload: { name: string; email: string; password: string; role?: 'student' | 'mentor' }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          const res = await fetchFromBackend<{ message: string; token: string; user: User }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          setStoredUserId(res.user.id);
          return res;
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      // Standalone clientDb fallback
      const user = clientDb.register(payload.name, payload.email, payload.password, payload.role);
      const token = `skb_tok_${user.id}_${Date.now()}`;
      setStoredUserId(user.id);
      return {
        message: 'Account registered successfully.',
        token,
        user,
      };
    },

    async login(payload: { email: string; password: string }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          const res = await fetchFromBackend<{ message: string; token: string; user: User }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          setStoredUserId(res.user.id);
          return res;
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      // Standalone clientDb fallback
      const user = clientDb.getUserByEmail(payload.email);
      if (!user) {
        throw new Error('Invalid email or password.');
      }
      const valid = clientDb.verifyPassword(payload.email, payload.password);
      if (!valid) {
        throw new Error('Invalid email or password.');
      }

      const token = `skb_tok_${user.id}_${Date.now()}`;
      setStoredUserId(user.id);
      return {
        message: 'Logged in successfully.',
        token,
        user,
      };
    },

    async demoLogin(role: 'student' | 'mentor' | 'admin') {
      if (!isStaticHost() && !API_BASE) {
        try {
          const res = await fetchFromBackend<{ message: string; token: string; user: User }>('/api/auth/demo-login', {
            method: 'POST',
            body: JSON.stringify({ role }),
          });
          setStoredUserId(res.user.id);
          return res;
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      // Standalone clientDb fallback
      let email = 'student@skillbridge.edu';
      if (role === 'mentor') email = 'mentor@skillbridge.edu';
      if (role === 'admin') email = 'admin@skillbridge.edu';

      const user = clientDb.getUserByEmail(email);
      if (!user) throw new Error('Demo account not found');
      const token = `skb_tok_${user.id}_${Date.now()}`;
      setStoredUserId(user.id);
      return {
        message: `Logged in as demo ${role} (${user.name})`,
        token,
        user,
      };
    },

    async getMe() {
      if (!isStaticHost() && !API_BASE) {
        try {
          const res = await fetchFromBackend<{ user: User; profile: StudentProfile | MentorProfile | null }>('/api/auth/me');
          if (res?.user?.id) setStoredUserId(res.user.id);
          return res;
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('No active session');
      const user = clientDb.getUserById(userId);
      if (!user) throw new Error('User not found');
      const profile = clientDb.getProfile(userId);
      return { user, profile };
    },

    async updateProfile(payload: {
      name?: string;
      avatar?: string;
      bio?: string;
      studentProfile?: Partial<StudentProfile>;
      mentorProfile?: Partial<MentorProfile>;
    }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; user: User; profile: any }>('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('Unauthorized');
      const res = clientDb.updateProfile(userId, payload);
      return {
        message: 'Profile updated successfully.',
        user: res.user,
        profile: res.profile,
      };
    },

    async logout() {
      try {
        if (!isStaticHost() && !API_BASE) {
          await fetchFromBackend('/api/auth/logout', { method: 'POST' }).catch(() => {});
        }
      } finally {
        setStoredToken(null);
      }
    },
  },

  // Courses
  courses: {
    async getAll(params?: { category?: string; difficulty?: string; search?: string }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          const searchParams = new URLSearchParams();
          if (params?.category) searchParams.set('category', params.category);
          if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
          if (params?.search) searchParams.set('search', params.search);
          const q = searchParams.toString();
          return await fetchFromBackend<{ courses: Course[] }>(`/api/courses${q ? `?${q}` : ''}`);
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      const list = clientDb.getCourses(params);
      const enrollments = clientDb.data ? clientDb.data.enrollments : [];
      const enriched = list.map((c) => {
        const enr = enrollments.find((e: any) => e.userId === userId && e.courseId === c.id);
        return {
          ...c,
          isEnrolled: !!enr,
          progressPercent: enr ? enr.progressPercent : 0,
        };
      });
      return { courses: enriched };
    },

    async getById(id: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ course: Course; enrollment: Enrollment | null; lessonProgress: LessonProgress[] }>(
            `/api/courses/${id}`
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const course = clientDb.getCourseById(id);
      if (!course) throw new Error('Course not found');
      const userId = getStoredUserId();
      const enrollment = (clientDb as any).data.enrollments.find((e: any) => e.userId === userId && e.courseId === course.id) || null;
      const lessonProgress = (clientDb as any).data.lessonProgress.filter((p: any) => p.userId === userId && p.courseId === course.id);
      return { course, enrollment, lessonProgress };
    },

    async enroll(courseId: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; enrollment: Enrollment }>(`/api/courses/${courseId}`, {
            method: 'POST',
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('Please sign in to enroll');
      const enrollment = clientDb.enroll(userId, courseId);
      return { message: 'Enrolled successfully', enrollment };
    },

    async toggleLessonProgress(courseId: string, lessonId: string, completed: boolean) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; progress: LessonProgress; overallPercent: number }>(
            `/api/courses/${courseId}/lessons/${lessonId}/complete`,
            {
              method: 'POST',
              body: JSON.stringify({ completed }),
            }
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('Unauthorized');
      const res = clientDb.toggleLessonProgress(userId, courseId, lessonId, completed);
      return { message: 'Lesson progress updated', ...res };
    },

    async submitQuiz(lessonId: string, answers: number[]) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<any>(`/api/courses/lessons/${lessonId}/quiz`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('Unauthorized');
      return clientDb.submitQuiz(userId, lessonId, answers);
    },

    async create(course: Partial<Course>) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; course: Course }>('/api/courses', {
            method: 'POST',
            body: JSON.stringify(course),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }
      const newCourse = clientDb.createCourse(course);
      return { message: 'Course created', course: newCourse };
    },

    async update(id: string, updates: Partial<Course>) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; course: Course }>(`/api/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }
      const updated = clientDb.updateCourse(id, updates);
      return { message: 'Course updated', course: updated };
    },

    async delete(id: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string }>(`/api/courses/${id}`, { method: 'DELETE' });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }
      clientDb.deleteCourse(id);
      return { message: 'Course deleted' };
    },

    async createModule(_courseId: string, payload: { title: string; description?: string; orderIndex?: number }) {
      return { message: 'Module created', module: { id: `mod-${Date.now()}`, courseId: _courseId, ...payload, orderIndex: payload.orderIndex || 1 } };
    },

    async createLesson(_courseId: string, payload: Partial<Lesson>) {
      return { message: 'Lesson created', lesson: { id: `lesson-${Date.now()}`, courseId: _courseId, moduleId: payload.moduleId || '', title: payload.title || '', type: payload.type || 'text', durationMinutes: 15, orderIndex: 1, content: payload.content || '' } };
    },

    async deleteLesson(_lessonId: string) {
      return { message: 'Lesson deleted' };
    },
  },

  // Internships
  internships: {
    async getAll(params?: { workMode?: string; status?: string; search?: string }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          const searchParams = new URLSearchParams();
          if (params?.workMode) searchParams.set('workMode', params.workMode);
          if (params?.status) searchParams.set('status', params.status);
          if (params?.search) searchParams.set('search', params.search);
          const q = searchParams.toString();
          return await fetchFromBackend<{ internships: Internship[] }>(`/api/internships${q ? `?${q}` : ''}`);
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      const list = clientDb.getInternships(params);
      const apps = (clientDb as any).data.applications.filter((a: any) => a.studentId === userId);
      const enriched = list.map((i) => {
        const myApp = apps.find((a: any) => a.internshipId === i.id);
        return {
          ...i,
          hasApplied: !!myApp,
          myApplicationStatus: myApp ? myApp.status : null,
          myApplicationId: myApp ? myApp.id : null,
        };
      });
      return { internships: enriched };
    },

    async getById(id: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ internship: Internship; myApplication: InternshipApplication | null }>(
            `/api/internships/${id}`
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const internship = clientDb.getInternshipById(id);
      if (!internship) throw new Error('Internship not found');
      const userId = getStoredUserId();
      const myApplication = (clientDb as any).data.applications.find((a: any) => a.studentId === userId && a.internshipId === id) || null;
      return { internship, myApplication };
    },

    async apply(internshipId: string, payload: {
      coverLetter: string;
      resumeFileName?: string;
      resumeDataUrl?: string;
      portfolioUrl?: string;
      skills?: string[];
      additionalInfo?: string;
    }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; application: InternshipApplication }>(
            `/api/internships/${internshipId}/apply`,
            {
              method: 'POST',
              body: JSON.stringify(payload),
            }
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('Please sign in to submit an application');
      const app = clientDb.applyInternship(userId, internshipId, payload);
      return { message: 'Application submitted successfully', application: app };
    },

    async getAllApplications() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ applications: InternshipApplication[] }>('/api/internships/applications/all');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      const user = userId ? clientDb.getUserById(userId) : null;
      const apps = clientDb.getApplications(userId || undefined, user?.role);
      return { applications: apps };
    },

    async getApplicationById(id: string) {
      const apps = clientDb.getApplications();
      const app = apps.find((a) => a.id === id);
      if (!app) throw new Error('Application not found');
      const internship = clientDb.getInternshipById(app.internshipId);
      const student = clientDb.getUserById(app.studentId);
      return { application: app, internship: internship!, student, studentProfile: null };
    },

    async updateStatus(id: string, status: ApplicationStatus, reviewNotes?: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; application: InternshipApplication }>(
            `/api/internships/applications/${id}/status`,
            {
              method: 'PUT',
              body: JSON.stringify({ status, reviewNotes }),
            }
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const app = clientDb.updateApplicationStatus(id, status, reviewNotes);
      return { message: 'Application status updated', application: app };
    },

    async withdraw(id: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; application: InternshipApplication }>(
            `/api/internships/applications/${id}/withdraw`,
            {
              method: 'POST',
            }
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('Unauthorized');
      const app = clientDb.withdrawApplication(id, userId);
      return { message: 'Application withdrawn', application: app };
    },

    async create(internship: Partial<Internship>) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; internship: Internship }>('/api/internships', {
            method: 'POST',
            body: JSON.stringify(internship),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const newInternship = clientDb.createInternship(internship);
      return { message: 'Internship published', internship: newInternship };
    },

    async update(id: string, updates: Partial<Internship>) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; internship: Internship }>(`/api/internships/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const updated = clientDb.updateInternship(id, updates);
      return { message: 'Internship updated', internship: updated };
    },

    async delete(id: string) {
      return { message: 'Internship deleted' };
    },
  },

  // Projects & Mentorship
  projects: {
    async getAll() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ projects: Project[] }>('/api/projects');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }
      return { projects: clientDb.getProjects() };
    },

    async getById(id: string) {
      const proj = clientDb.getProjects().find((p) => p.id === id);
      if (!proj) throw new Error('Project not found');
      return { project: proj };
    },

    async create(project: Partial<Project>) {
      return { message: 'Project created', project: project as Project };
    },

    async getAllSubmissions() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ submissions: ProjectSubmission[] }>('/api/projects/submissions/all');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      const user = userId ? clientDb.getUserById(userId) : null;
      return { submissions: clientDb.getSubmissions(userId || undefined, user?.role) };
    },

    async submitWork(projectId: string, payload: {
      milestoneId?: string;
      repoUrl: string;
      demoUrl?: string;
      notes: string;
      attachments?: string[];
    }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; submission: ProjectSubmission }>(`/api/projects/${projectId}/submit`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      if (!userId) throw new Error('Please sign in');
      const sub = clientDb.submitWork(userId, projectId, payload);
      return { message: 'Work submitted', submission: sub };
    },

    async reviewSubmission(submissionId: string, payload: {
      grade?: number;
      feedback: string;
      status: SubmissionStatus;
    }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; submission: ProjectSubmission }>(
            `/api/projects/submissions/${submissionId}/review`,
            {
              method: 'PUT',
              body: JSON.stringify(payload),
            }
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId() || 'user-mentor-1';
      const sub = clientDb.reviewSubmission(submissionId, userId, payload);
      return { message: 'Submission reviewed', submission: sub };
    },
  },

  // Certificates
  certificates: {
    async getAll() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ certificates: Certificate[] }>('/api/certificates');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      const user = userId ? clientDb.getUserById(userId) : null;
      const certs = clientDb.getCertificates(user?.role === 'student' ? userId || undefined : undefined);
      return { certificates: certs };
    },

    async verify(code: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ valid: boolean; status: string; certificate: Certificate; message?: string }>(
            `/api/certificates/verify/${encodeURIComponent(code)}`
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const cert = clientDb.verifyCertificate(code);
      if (!cert) {
        return {
          valid: false,
          status: 'invalid',
          certificate: null as any,
          message: `No active credential found in the official SkillBridge Academy registry for code "${code}".`,
        };
      }
      return {
        valid: cert.status === 'valid',
        status: cert.status,
        certificate: cert,
      };
    },

    async issue(payload: {
      studentId: string;
      title: string;
      type?: 'course' | 'internship';
      grade?: string;
      completionDate?: string;
    }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; certificate: Certificate }>('/api/certificates/issue', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const adminId = getStoredUserId() || 'user-admin-1';
      const cert = clientDb.issueCertificate(adminId, payload);
      return { message: 'Certificate issued successfully', certificate: cert };
    },

    async revoke(id: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; certificate: Certificate }>(`/api/certificates/${id}/revoke`, {
            method: 'PUT',
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const cert = clientDb.revokeCertificate(id);
      return { message: 'Certificate revoked', certificate: cert };
    },
  },

  // Admin & System
  admin: {
    async getAnalytics() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ analytics: PlatformAnalytics }>('/api/admin/analytics');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      return { analytics: clientDb.getAnalytics() };
    },

    async getAuditLogs() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      return { auditLogs: clientDb.getAuditLogs() };
    },

    async getUsers() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ users: (User & { studentProfile?: StudentProfile; mentorProfile?: MentorProfile })[] }>(
            '/api/admin/users'
          );
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const users = clientDb.getUsers().map((u) => ({
        ...u,
        studentProfile: u.role === 'student' ? clientDb.getProfile(u.id) as StudentProfile : undefined,
        mentorProfile: u.role === 'mentor' ? clientDb.getProfile(u.id) as MentorProfile : undefined,
      }));
      return { users };
    },

    async updateUserRole(userId: string, role: string) {
      const user = clientDb.getUserById(userId);
      if (user) user.role = role as any;
      return { message: 'User role updated', user: user! };
    },

    async assignMentor(studentId: string, mentorId: string) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string }>(`/api/admin/users/${studentId}/assign-mentor`, {
            method: 'PUT',
            body: JSON.stringify({ mentorId }),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      clientDb.assignMentor(studentId, mentorId);
      return { message: 'Mentor assigned successfully' };
    },

    async resetDemoData() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string }>('/api/admin/reset-demo-data', {
            method: 'POST',
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      clientDb.reset();
      return { message: 'Database reset to seed data successfully.' };
    },
  },

  // Announcements & Notifications
  announcements: {
    async getAll() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ announcements: Announcement[] }>('/api/admin/announcements');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      return { announcements: clientDb.getAnnouncements() };
    },

    async create(payload: { title: string; content: string; targetRole?: string; priority?: string }) {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ message: string; announcement: Announcement }>('/api/admin/announcements', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const user = clientDb.getUserById(getStoredUserId() || 'user-admin-1');
      const ann = clientDb.createAnnouncement(user?.name || 'Administrator', user?.id || 'admin', payload);
      return { message: 'Announcement published', announcement: ann };
    },
  },

  notifications: {
    async getAll() {
      if (!isStaticHost() && !API_BASE) {
        try {
          return await fetchFromBackend<{ notifications: Notification[] }>('/api/admin/notifications');
        } catch (err: any) {
          if (!err.message?.includes('HTML returned') && !err.message?.includes('Failed to fetch')) {
            throw err;
          }
        }
      }

      const userId = getStoredUserId();
      return { notifications: userId ? clientDb.getNotifications(userId) : [] };
    },

    async markRead(id: string) {
      clientDb.markNotificationRead(id);
      return { success: true };
    },

    async markAllRead() {
      const userId = getStoredUserId();
      if (userId) clientDb.markAllNotificationsRead(userId);
      return { success: true };
    },
  },
};
