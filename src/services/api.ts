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

const TOKEN_KEY = 'skillbridge_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

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
      return request<{ message: string; token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async login(payload: { email: string; password: string }) {
      return request<{ message: string; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async demoLogin(role: 'student' | 'mentor' | 'admin') {
      return request<{ message: string; token: string; user: User }>('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
    },
    async getMe() {
      return request<{ user: User; profile: StudentProfile | MentorProfile | null }>('/api/auth/me');
    },
    async updateProfile(payload: {
      name?: string;
      avatar?: string;
      bio?: string;
      studentProfile?: Partial<StudentProfile>;
      mentorProfile?: Partial<MentorProfile>;
    }) {
      return request<{ message: string; user: User; profile: any }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    async logout() {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },
  },

  // Courses
  courses: {
    async getAll(params?: { category?: string; difficulty?: string; search?: string }) {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
      if (params?.search) searchParams.set('search', params.search);
      const q = searchParams.toString();
      return request<{ courses: Course[] }>(`/api/courses${q ? `?${q}` : ''}`);
    },
    async getById(id: string) {
      return request<{ course: Course; enrollment: Enrollment | null; lessonProgress: LessonProgress[] }>(
        `/api/courses/${id}`
      );
    },
    async enroll(courseId: string) {
      return request<{ message: string; enrollment: Enrollment }>(`/api/courses/${courseId}`, {
        method: 'POST',
      });
    },
    async toggleLessonProgress(courseId: string, lessonId: string, completed: boolean) {
      return request<{ message: string; progress: LessonProgress; overallPercent: number }>(
        `/api/courses/${courseId}/lessons/${lessonId}/complete`,
        {
          method: 'POST',
          body: JSON.stringify({ completed }),
        }
      );
    },
    async submitQuiz(lessonId: string, answers: number[]) {
      return request<{
        scorePercent: number;
        passed: boolean;
        passingScorePercent: number;
        feedback: { questionId: string; question: string; chosen: number; correctIndex: number; isCorrect: boolean; explanation: string }[];
      }>(`/api/courses/lessons/${lessonId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
    },
    async create(course: Partial<Course>) {
      return request<{ message: string; course: Course }>('/api/courses', {
        method: 'POST',
        body: JSON.stringify(course),
      });
    },
    async update(id: string, updates: Partial<Course>) {
      return request<{ message: string; course: Course }>(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async delete(id: string) {
      return request<{ message: string }>(`/api/courses/${id}`, { method: 'DELETE' });
    },
    async createModule(courseId: string, payload: { title: string; description?: string; orderIndex?: number }) {
      return request<{ message: string; module: CourseModule }>(`/api/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async createLesson(courseId: string, payload: Partial<Lesson>) {
      return request<{ message: string; lesson: Lesson }>(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async deleteLesson(lessonId: string) {
      return request<{ message: string }>(`/api/courses/lessons/${lessonId}`, { method: 'DELETE' });
    },
  },

  // Internships
  internships: {
    async getAll(params?: { workMode?: string; status?: string; search?: string }) {
      const searchParams = new URLSearchParams();
      if (params?.workMode) searchParams.set('workMode', params.workMode);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      const q = searchParams.toString();
      return request<{ internships: Internship[] }>(`/api/internships${q ? `?${q}` : ''}`);
    },
    async getById(id: string) {
      return request<{ internship: Internship; myApplication: InternshipApplication | null }>(
        `/api/internships/${id}`
      );
    },
    async apply(internshipId: string, payload: {
      coverLetter: string;
      resumeFileName?: string;
      resumeDataUrl?: string;
      portfolioUrl?: string;
      skills?: string[];
      additionalInfo?: string;
    }) {
      return request<{ message: string; application: InternshipApplication }>(
        `/api/internships/${internshipId}/apply`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
    },
    async getAllApplications() {
      return request<{ applications: InternshipApplication[] }>('/api/internships/applications/all');
    },
    async getApplicationById(id: string) {
      return request<{ application: InternshipApplication; internship: Internship; student: any; studentProfile: any }>(
        `/api/internships/applications/${id}`
      );
    },
    async updateStatus(id: string, status: ApplicationStatus, reviewNotes?: string) {
      return request<{ message: string; application: InternshipApplication }>(
        `/api/internships/applications/${id}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ status, reviewNotes }),
        }
      );
    },
    async withdraw(id: string) {
      return request<{ message: string; application: InternshipApplication }>(
        `/api/internships/applications/${id}/withdraw`,
        {
          method: 'POST',
        }
      );
    },
    async create(internship: Partial<Internship>) {
      return request<{ message: string; internship: Internship }>('/api/internships', {
        method: 'POST',
        body: JSON.stringify(internship),
      });
    },
    async update(id: string, updates: Partial<Internship>) {
      return request<{ message: string; internship: Internship }>(`/api/internships/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async delete(id: string) {
      return request<{ message: string }>(`/api/internships/${id}`, { method: 'DELETE' });
    },
  },

  // Projects & Mentorship
  projects: {
    async getAll() {
      return request<{ projects: Project[] }>('/api/projects');
    },
    async getById(id: string) {
      return request<{ project: Project }>(`/api/projects/${id}`);
    },
    async create(project: Partial<Project>) {
      return request<{ message: string; project: Project }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
    },
    async getAllSubmissions() {
      return request<{ submissions: ProjectSubmission[] }>('/api/projects/submissions/all');
    },
    async submitWork(projectId: string, payload: {
      milestoneId?: string;
      repoUrl: string;
      demoUrl?: string;
      notes: string;
      attachments?: string[];
    }) {
      return request<{ message: string; submission: ProjectSubmission }>(`/api/projects/${projectId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async reviewSubmission(submissionId: string, payload: {
      grade?: number;
      feedback: string;
      status: SubmissionStatus;
    }) {
      return request<{ message: string; submission: ProjectSubmission }>(
        `/api/projects/submissions/${submissionId}/review`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );
    },
  },

  // Certificates
  certificates: {
    async getAll() {
      return request<{ certificates: Certificate[] }>('/api/certificates');
    },
    async verify(code: string) {
      return request<{ valid: boolean; status: string; certificate: Certificate; message?: string }>(
        `/api/certificates/verify/${encodeURIComponent(code)}`
      );
    },
    async issue(payload: {
      studentId: string;
      title: string;
      type?: 'course' | 'internship';
      grade?: string;
      completionDate?: string;
    }) {
      return request<{ message: string; certificate: Certificate }>('/api/certificates/issue', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async revoke(id: string) {
      return request<{ message: string; certificate: Certificate }>(`/api/certificates/${id}/revoke`, {
        method: 'PUT',
      });
    },
  },

  // Admin & System
  admin: {
    async getAnalytics() {
      return request<{ analytics: PlatformAnalytics }>('/api/admin/analytics');
    },
    async getAuditLogs() {
      return request<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs');
    },
    async getUsers() {
      return request<{ users: (User & { studentProfile?: StudentProfile; mentorProfile?: MentorProfile })[] }>(
        '/api/admin/users'
      );
    },
    async updateUserRole(userId: string, role: string) {
      return request<{ message: string; user: User }>(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },
    async assignMentor(studentId: string, mentorId: string) {
      return request<{ message: string }>(`/api/admin/users/${studentId}/assign-mentor`, {
        method: 'PUT',
        body: JSON.stringify({ mentorId }),
      });
    },
    async resetDemoData() {
      return request<{ message: string }>('/api/admin/reset-demo-data', {
        method: 'POST',
      });
    },
  },

  // Announcements & Notifications
  announcements: {
    async getAll() {
      return request<{ announcements: Announcement[] }>('/api/admin/announcements');
    },
    async create(payload: { title: string; content: string; targetRole?: string; priority?: string }) {
      return request<{ message: string; announcement: Announcement }>('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  notifications: {
    async getAll() {
      return request<{ notifications: Notification[] }>('/api/admin/notifications');
    },
    async markRead(id: string) {
      return request<{ success: boolean }>(`/api/admin/notifications/${id}/read`, {
        method: 'PUT',
      });
    },
    async markAllRead() {
      return request<{ success: boolean }>('/api/admin/notifications/read-all', {
        method: 'PUT',
      });
    },
  },
};
