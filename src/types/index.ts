export type UserRole = 'student' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  userId: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  resumeFileName?: string;
  resumeDataUrl?: string;
  assignedMentorId?: string;
}

export interface MentorProfile {
  userId: string;
  company: string;
  jobTitle: string;
  expertise: string[];
  yearsExperience: number;
  assignedStudentIds: string[];
  bio?: string;
}

export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LessonQuiz {
  passingScorePercent: number;
  questions: LessonQuizQuestion[];
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'code' | 'archive';
  url: string;
  size?: string;
}

export type LessonType = 'text' | 'video' | 'quiz' | 'assignment' | 'resource';

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  orderIndex: number;
  content: string;
  videoUrl?: string;
  assignmentPrompt?: string;
  resources?: LessonResource[];
  quiz?: LessonQuiz;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons?: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  instructorAvatar?: string;
  instructorBio?: string;
  thumbnail: string;
  durationHours: number;
  learningOutcomes: string[];
  prerequisites: string[];
  published: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  modules?: CourseModule[];
  isEnrolled?: boolean;
  progressPercent?: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt?: string;
  status: 'active' | 'completed';
}

export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  scorePercent: number;
  passed: boolean;
  answers: number[];
  attemptedAt: string;
}

export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type InternshipStatus = 'published' | 'closed';

export interface Internship {
  id: string;
  title: string;
  organization: string;
  logo: string;
  location: string;
  workMode: WorkMode;
  durationMonths: number;
  stipend: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  eligibilityCriteria: string[];
  deadline: string;
  availablePositions: number;
  status: InternshipStatus;
  featured?: boolean;
  createdAt: string;
  hasApplied?: boolean;
  myApplicationStatus?: ApplicationStatus | null;
  myApplicationId?: string | null;
}

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export interface InternshipApplication {
  id: string;
  internshipId: string;
  studentId: string;
  coverLetter: string;
  resumeFileName: string;
  resumeDataUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  additionalInfo?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  reviewNotes?: string;
  internshipTitle?: string;
  organization?: string;
  organizationLogo?: string;
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  orderIndex: number;
  dueDate: string;
}

export interface Project {
  id: string;
  courseId?: string;
  title: string;
  description: string;
  instructions: string;
  requirements: string[];
  deliverables: string[];
  deadline: string;
  milestones: ProjectMilestone[];
  createdAt: string;
}

export type SubmissionStatus = 'submitted' | 'under_review' | 'needs_revision' | 'approved';

export interface ProjectSubmission {
  id: string;
  projectId: string;
  milestoneId?: string;
  studentId: string;
  repoUrl: string;
  demoUrl?: string;
  notes: string;
  attachments?: string[];
  status: SubmissionStatus;
  grade?: number;
  mentorFeedback?: string;
  mentorId?: string;
  submittedAt: string;
  reviewedAt?: string;
  version: number;
  projectTitle?: string;
  milestoneTitle?: string;
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string;
}

export interface Certificate {
  id: string;
  certificateCode: string;
  studentId: string;
  studentName: string;
  title: string;
  type: 'course' | 'internship';
  completionDate: string;
  issuingOrg: string;
  verificationUrl: string;
  status: 'valid' | 'revoked';
  grade?: string;
  issuedByUserId: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'student' | 'mentor' | 'admin';
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  authorName: string;
  authorId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PlatformAnalytics {
  totalStudents: number;
  totalMentors: number;
  publishedCourses: number;
  activeInternships: number;
  totalApplications: number;
  totalEnrollments: number;
  totalCertificatesIssued: number;
  pendingSubmissions: number;
  applicationsByStatus: {
    applied: number;
    under_review: number;
    shortlisted: number;
    interview: number;
    selected: number;
    rejected: number;
    withdrawn: number;
  };
  enrollmentTrends: {
    month: string;
    enrollments: number;
    completions: number;
  }[];
}
