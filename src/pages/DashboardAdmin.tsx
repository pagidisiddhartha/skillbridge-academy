import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlatformAnalytics,
  Course,
  Internship,
  InternshipApplication,
  Certificate,
  User,
  Announcement,
  AuditLog,
  ApplicationStatus,
} from '../types';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Briefcase,
  Award,
  FileText,
  Activity,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const DashboardAdmin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'courses' | 'internships' | 'applications' | 'users' | 'certificates' | 'announcements' | 'audit'
  >('analytics');

  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [createInternshipOpen, setCreateInternshipOpen] = useState(false);
  const [reviewAppOpen, setReviewAppOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
  const [issueCertOpen, setIssueCertOpen] = useState(false);
  const [createAnnOpen, setCreateAnnOpen] = useState(false);
  const [assignMentorOpen, setAssignMentorOpen] = useState(false);
  const [selectedStudentForMentor, setSelectedStudentForMentor] = useState<User | null>(null);

  // Forms state
  // 1. Create Course form
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Software Engineering');
  const [newCourseDifficulty, setNewCourseDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseDuration, setNewCourseDuration] = useState(30);

  // 2. Create Internship form
  const [newInternTitle, setNewInternTitle] = useState('');
  const [newInternOrg, setNewInternOrg] = useState('');
  const [newInternWorkMode, setNewInternWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('hybrid');
  const [newInternStipend, setNewInternStipend] = useState('€2,500 / month');
  const [newInternDuration, setNewInternDuration] = useState(6);
  const [newInternDesc, setNewInternDesc] = useState('');
  const [newInternDeadline, setNewInternDeadline] = useState('2026-12-31');

  // 3. Review App form
  const [appStatusToSet, setAppStatusToSet] = useState<ApplicationStatus>('shortlisted');
  const [appReviewNotes, setAppReviewNotes] = useState('');

  // 4. Issue Certificate form
  const [certStudentId, setCertStudentId] = useState('');
  const [certTitle, setCertTitle] = useState('Full-Stack Web Engineering: Production Architecture');
  const [certGrade, setCertGrade] = useState('Honors (96%)');

  // 5. Create Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annRole, setAnnRole] = useState<'all' | 'student' | 'mentor' | 'admin'>('all');

  // 6. Assign Mentor form
  const [mentorToAssignId, setMentorToAssignId] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        analyticsRes,
        coursesRes,
        internsRes,
        appsRes,
        usersRes,
        certsRes,
        annsRes,
        auditRes,
      ] = await Promise.all([
        api.admin.getAnalytics(),
        api.courses.getAll(),
        api.internships.getAll(),
        api.internships.getAllApplications(),
        api.admin.getUsers(),
        api.certificates.getAll(),
        api.announcements.getAll(),
        api.admin.getAuditLogs(),
      ]);

      setAnalytics(analyticsRes.analytics);
      setCourses(coursesRes.courses);
      setInternships(internsRes.internships);
      setApplications(appsRes.applications);
      setUsers(usersRes.users);
      setCertificates(certsRes.certificates);
      setAnnouncements(annsRes.announcements);
      setAuditLogs(auditRes.auditLogs);

      if (usersRes.users.filter((u) => u.role === 'student').length > 0) {
        setCertStudentId(usersRes.users.find((u) => u.role === 'student')?.id || '');
      }
      if (usersRes.users.filter((u) => u.role === 'mentor').length > 0) {
        setMentorToAssignId(usersRes.users.find((u) => u.role === 'mentor')?.id || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.courses.create({
        title: newCourseTitle,
        category: newCourseCategory,
        difficulty: newCourseDifficulty,
        description: newCourseDesc,
        shortDescription: newCourseDesc.slice(0, 140) + '...',
        durationHours: Number(newCourseDuration),
        published: true,
        instructor: user?.name || 'SkillBridge Faculty',
        learningOutcomes: ['Complete architectural foundations', 'Build milestone deliverables'],
      });
      setCreateCourseOpen(false);
      setNewCourseTitle('');
      setNewCourseDesc('');
      await loadAllAdminData();
      alert('Course successfully published!');
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    }
  };

  const handleToggleCoursePublish = async (course: Course) => {
    try {
      await api.courses.update(course.id, { published: !course.published });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course and all its modules?')) return;
    try {
      await api.courses.delete(courseId);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.internships.create({
        title: newInternTitle,
        organization: newInternOrg,
        workMode: newInternWorkMode,
        stipend: newInternStipend,
        durationMonths: Number(newInternDuration),
        description: newInternDesc,
        deadline: new Date(newInternDeadline).toISOString(),
        availablePositions: 2,
        status: 'published',
        responsibilities: ['Architect web features', 'Participate in agile sprints'],
        requiredSkills: ['TypeScript', 'React', 'Git'],
        eligibilityCriteria: ['Enrolled in SkillBridge program'],
      });
      setCreateInternshipOpen(false);
      setNewInternTitle('');
      setNewInternOrg('');
      setNewInternDesc('');
      await loadAllAdminData();
      alert('Internship listing published!');
    } catch (err: any) {
      alert(err.message || 'Failed to create internship');
    }
  };

  const handleOpenReviewApp = (app: InternshipApplication) => {
    setSelectedApp(app);
    setAppStatusToSet(app.status);
    setAppReviewNotes(app.reviewNotes || '');
    setReviewAppOpen(true);
  };

  const handleSubmitAppReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await api.internships.updateStatus(selectedApp.id, appStatusToSet, appReviewNotes);
      setReviewAppOpen(false);
      await loadAllAdminData();
      alert(`Application updated to ${appStatusToSet.toUpperCase()}! Student notified.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    }
  };

  const handleIssueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.certificates.issue({
        studentId: certStudentId,
        title: certTitle,
        grade: certGrade,
        type: 'course',
      });
      setIssueCertOpen(false);
      await loadAllAdminData();
      alert(`Certificate issued! Verifiable code: ${res.certificate.certificateCode}`);
    } catch (err: any) {
      alert(err.message || 'Failed to issue certificate');
    }
  };

  const handleRevokeCert = async (certId: string) => {
    if (!confirm('Are you sure you want to revoke this certificate?')) return;
    try {
      await api.certificates.revoke(certId);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke certificate');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.announcements.create({
        title: annTitle,
        content: annContent,
        targetRole: annRole,
      });
      setCreateAnnOpen(false);
      setAnnTitle('');
      setAnnContent('');
      await loadAllAdminData();
      alert('Announcement broadcasted to platform users!');
    } catch (err: any) {
      alert(err.message || 'Failed to create announcement');
    }
  };

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForMentor) return;
    try {
      await api.admin.assignMentor(selectedStudentForMentor.id, mentorToAssignId);
      setAssignMentorOpen(false);
      await loadAllAdminData();
      alert('Mentor assigned successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to assign mentor');
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset all demo database records back to pristine seed state?')) return;
    try {
      await api.admin.resetDemoData();
      await loadAllAdminData();
      alert('Database reset to initial demo seeds successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to reset data');
    }
  };

  // Prepare chart data from live analytics
  const appStatusChartData = analytics?.applicationsByStatus
    ? [
        { name: 'Applied', count: analytics.applicationsByStatus.applied },
        { name: 'Under Review', count: analytics.applicationsByStatus.under_review },
        { name: 'Shortlisted', count: analytics.applicationsByStatus.shortlisted },
        { name: 'Interview', count: analytics.applicationsByStatus.interview },
        { name: 'Selected', count: analytics.applicationsByStatus.selected },
      ]
    : [];

  const enrollmentTrendData = analytics?.enrollmentTrends || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academic Operations & Platform Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Director Console: Dr. Marcus Vance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time management of curriculums, partner internships, applicant review lifecycles,
            mentor assignments, and certificate issuance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCreateCourseOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Course</span>
          </button>
          <button
            onClick={() => setCreateInternshipOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Internship</span>
          </button>
          <button
            onClick={handleResetData}
            title="Reset database to initial demo state"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Platform Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'courses'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'internships'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Internships ({internships.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Applications ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Mentors ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'certificates'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificates ({certificates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'announcements'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Announcements</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: Analytics & Live Charts */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Registered Students
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {analytics.totalStudents}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                Live database count
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Internship Positions
              </span>
              <div className="text-3xl font-extrabold text-cyan-700 mt-1">
                {analytics.activeInternships}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Vetted European partners</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Applications Received
              </span>
              <div className="text-3xl font-extrabold text-indigo-700 mt-1">
                {analytics.totalApplications}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Across all active postings</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Credentials Issued
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                {analytics.totalCertificatesIssued}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Tamper-proof registry records</span>
            </div>
          </div>

          {/* Interactive Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Funnel Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Internship Candidate Pipeline Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Applicant volume across each screening stage
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appStatusChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} name="Candidates" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Enrollment Trend */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Enrollment & Completion Velocity
                </h3>
                <p className="text-xs text-slate-500">
                  Cohort matriculation and certificate award trends
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#1e3a8a"
                      strokeWidth={2}
                      name="New Enrollments"
                    />
                    <Line
                      type="monotone"
                      dataKey="completions"
                      stroke="#059669"
                      strokeWidth={2}
                      name="Graduated / Certified"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Courses Management */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Course Catalogue Management</h3>
              <p className="text-xs text-slate-500">Create, edit, publish, or retire course tracks.</p>
            </div>
            <button
              onClick={() => setCreateCourseOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-3.5">Course Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{c.title}</td>
                      <td className="p-3.5">{c.category}</td>
                      <td className="p-3.5">
                        <Badge variant="slate" size="sm">
                          {c.difficulty}
                        </Badge>
                      </td>
                      <td className="p-3.5">{c.durationHours} hrs</td>
                      <td className="p-3.5">
                        <Badge variant={c.published ? 'success' : 'slate'} size="sm">
                          {c.published ? 'PUBLISHED' : 'DRAFT'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleCoursePublish(c)}
                          className="text-cyan-800 hover:underline font-semibold"
                        >
                          {c.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Internships Management */}
      {activeTab === 'internships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Internship Postings Management</h3>
              <p className="text-xs text-slate-500">Manage verified partner company postings.</p>
            </div>
            <button
              onClick={() => setCreateInternshipOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Internship</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-3.5">Position Title</th>
                    <th className="p-3.5">Company Partner</th>
                    <th className="p-3.5">Work Mode</th>
                    <th className="p-3.5">Monthly Stipend</th>
                    <th className="p-3.5">Deadline</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {internships.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{i.title}</td>
                      <td className="p-3.5">{i.organization}</td>
                      <td className="p-3.5 capitalize">{i.workMode}</td>
                      <td className="p-3.5 font-bold text-emerald-700">{i.stipend}</td>
                      <td className="p-3.5">{new Date(i.deadline).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <Badge variant={i.status === 'published' ? 'success' : 'slate'} size="sm">
                          {i.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={async () => {
                            await api.internships.update(i.id, {
                              status: i.status === 'published' ? 'closed' : 'published',
                            });
                            loadAllAdminData();
                          }}
                          className="text-cyan-800 hover:underline font-semibold"
                        >
                          {i.status === 'published' ? 'Close' : 'Reopen'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Applications Review Lifecycle */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Internship Application Admissions</h3>
            <p className="text-xs text-slate-500">
              Review cover letters, student CV documents, and advance candidates through the hiring
              lifecycle (Applied → Under Review → Shortlisted → Interview → Selected).
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-3.5">Applicant Student</th>
                    <th className="p-3.5">Position & Company</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5">Resume File</th>
                    <th className="p-3.5">Current Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{app.studentName}</div>
                        <div className="text-[10px] text-slate-400">{app.studentEmail}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{app.internshipTitle}</div>
                        <div className="text-[10px] text-slate-500">{app.organization}</div>
                      </td>
                      <td className="p-3.5">{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td className="p-3.5 font-mono text-cyan-800">{app.resumeFileName}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            app.status === 'selected'
                              ? 'success'
                              : app.status === 'shortlisted' || app.status === 'interview'
                              ? 'purple'
                              : app.status === 'rejected' || app.status === 'withdrawn'
                              ? 'danger'
                              : 'primary'
                          }
                          size="sm"
                          className="capitalize font-semibold"
                        >
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenReviewApp(app)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold"
                        >
                          Review & Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Users & Mentors Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">User Roster & Mentor Assignment</h3>
            <p className="text-xs text-slate-500">
              Manage student enrollments, mentor assignments, and role permissions.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Current Role</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{u.name}</div>
                      </td>
                      <td className="p-3.5 font-mono">{u.email}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            u.role === 'admin' ? 'purple' : u.role === 'mentor' ? 'primary' : 'cyan'
                          }
                          size="sm"
                          className="uppercase font-semibold"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3.5">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-3.5 text-right space-x-2">
                        {u.role === 'student' && (
                          <button
                            onClick={() => {
                              setSelectedStudentForMentor(u);
                              setAssignMentorOpen(true);
                            }}
                            className="text-cyan-800 hover:underline font-semibold"
                          >
                            Assign Mentor
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Certificate Issuance Tool */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Certificate Registry & Issuance</h3>
              <p className="text-xs text-slate-500">
                Issue verifiable digital credentials tied to permanent registry codes.
              </p>
            </div>
            <button
              onClick={() => setIssueCertOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Issue New Certificate</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-3.5">Certificate Code</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Track / Title</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Validity Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {cert.certificateCode}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{cert.studentName}</td>
                      <td className="p-3.5">{cert.title}</td>
                      <td className="p-3.5">{new Date(cert.completionDate).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={cert.status === 'valid' ? 'success' : 'danger'}
                          size="sm"
                          className="uppercase font-semibold"
                        >
                          {cert.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {cert.status === 'valid' && (
                          <button
                            onClick={() => handleRevokeCert(cert.id)}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Revoke
                          </button>
                        )}
                        <a
                          href={`/verify/${encodeURIComponent(cert.certificateCode)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-800 hover:underline font-semibold"
                        >
                          Verify Link
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Platform Announcements</h3>
              <p className="text-xs text-slate-500">
                Broadcast messages to student or mentor dashboards.
              </p>
            </div>
            <button
              onClick={() => setCreateAnnOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                  <Badge variant="cyan" size="sm" className="uppercase">
                    Target: {ann.targetRole}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Posted by {ann.authorName} on {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: Live Audit Log Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Immutable Audit Trail</h3>
            <p className="text-xs text-slate-500">
              System logs capturing all important administrative, grading, and admission actions.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase sticky top-0">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Actor Email</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{log.action}</td>
                      <td className="p-3 text-slate-700">{log.userEmail}</td>
                      <td className="p-3">{log.entityType}</td>
                      <td className="p-3 font-sans text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create Course */}
      <Modal
        isOpen={createCourseOpen}
        onClose={() => setCreateCourseOpen(false)}
        title="Create New Academic Course"
        description="Add a curriculum pathway to the SkillBridge catalogue."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              required
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              placeholder="e.g. Distributed Cloud Architecture with Go & Kubernetes"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newCourseCategory}
                onChange={(e) => setNewCourseCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Product Design">Product Design</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={newCourseDifficulty}
                onChange={(e) => setNewCourseDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Curriculum Description
            </label>
            <textarea
              required
              rows={4}
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              placeholder="Describe curriculum objectives, architecture paradigms, and target career outcomes..."
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Duration Hours</label>
            <input
              type="number"
              min={10}
              max={120}
              value={newCourseDuration}
              onChange={(e) => setNewCourseDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateCourseOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Publish Course
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Create Internship */}
      <Modal
        isOpen={createInternshipOpen}
        onClose={() => setCreateInternshipOpen(false)}
        title="Publish Verified Internship Posting"
        description="Add a new partner company opening for students to apply."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateInternship} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
              <input
                type="text"
                required
                value={newInternTitle}
                onChange={(e) => setNewInternTitle(e.target.value)}
                placeholder="e.g. Junior Backend Systems Intern"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={newInternOrg}
                onChange={(e) => setNewInternOrg(e.target.value)}
                placeholder="e.g. Nordic Cloud Solutions"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={newInternWorkMode}
                onChange={(e) => setNewInternWorkMode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stipend</label>
              <input
                type="text"
                required
                value={newInternStipend}
                onChange={(e) => setNewInternStipend(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Months)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={newInternDuration}
                onChange={(e) => setNewInternDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Description & Expectations
            </label>
            <textarea
              required
              rows={3}
              value={newInternDesc}
              onChange={(e) => setNewInternDesc(e.target.value)}
              placeholder="Outline project squad embedding, mentor guidance, and daily responsibilities..."
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Date</label>
            <input
              type="date"
              required
              value={newInternDeadline}
              onChange={(e) => setNewInternDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateInternshipOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Review Application */}
      {selectedApp && (
        <Modal
          isOpen={reviewAppOpen}
          onClose={() => setReviewAppOpen(false)}
          title={`Review Candidate: ${selectedApp.studentName}`}
          description={`Position: ${selectedApp.internshipTitle} at ${selectedApp.organization}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitAppReview} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">COVER LETTER</span>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed mt-1">
                  {selectedApp.coverLetter}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4">
                <span>Resume Document: <strong className="text-slate-900">{selectedApp.resumeFileName}</strong></span>
                {selectedApp.portfolioUrl && (
                  <span>
                    Portfolio:{' '}
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-800 underline"
                    >
                      {selectedApp.portfolioUrl}
                    </a>
                  </span>
                )}
              </div>
            </div>

            {/* Advance Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admissions / Candidate Status
              </label>
              <select
                value={appStatusToSet}
                onChange={(e) => setAppStatusToSet(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
              >
                <option value="applied">Applied (Initial Intake)</option>
                <option value="under_review">Under Review (Committee Assessment)</option>
                <option value="shortlisted">Shortlisted (Forwarded to Technical Squad)</option>
                <option value="interview">Interview (Scheduled with Engineering Lead)</option>
                <option value="selected">Selected (Official Offer Extended)</option>
                <option value="rejected">Rejected (Does Not Meet Current Criteria)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Feedback & Notes (Visible to Student)
              </label>
              <textarea
                rows={3}
                value={appReviewNotes}
                onChange={(e) => setAppReviewNotes(e.target.value)}
                placeholder="Add notes explaining next steps, interview scheduling, or portfolio feedback..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewAppOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Save Decision & Notify Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: Issue Certificate */}
      <Modal
        isOpen={issueCertOpen}
        onClose={() => setIssueCertOpen(false)}
        title="Issue Official Verifiable Credential"
        description="Generates an immutable certificate code validated by our public registry."
        maxWidth="md"
      >
        <form onSubmit={handleIssueCert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Qualified Student
            </label>
            <select
              value={certStudentId}
              onChange={(e) => setCertStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            >
              {users
                .filter((u) => u.role === 'student')
                .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Credential Award Title
            </label>
            <input
              type="text"
              required
              value={certTitle}
              onChange={(e) => setCertTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Standing / Honors
            </label>
            <input
              type="text"
              value={certGrade}
              onChange={(e) => setCertGrade(e.target.value)}
              placeholder="e.g. Excellence (96%)"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIssueCertOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Issue Credential</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Assign Mentor */}
      {selectedStudentForMentor && (
        <Modal
          isOpen={assignMentorOpen}
          onClose={() => setAssignMentorOpen(false)}
          title={`Assign Technical Mentor: ${selectedStudentForMentor.name}`}
          description="Pair student with a verified enterprise practitioner for code reviews."
          maxWidth="sm"
        >
          <form onSubmit={handleAssignMentor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Mentor
              </label>
              <select
                value={mentorToAssignId}
                onChange={(e) => setMentorToAssignId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                {users
                  .filter((u) => u.role === 'mentor')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignMentorOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Assign
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 6: Create Announcement */}
      <Modal
        isOpen={createAnnOpen}
        onClose={() => setCreateAnnOpen(false)}
        title="Broadcast Platform Announcement"
        description="Publish news and cohort notices across student and mentor dashboards."
        maxWidth="md"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Headline Title
            </label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Autumn 2026 Internship Postings Now Live"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Audience
            </label>
            <select
              value={annRole}
              onChange={(e) => setAnnRole(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            >
              <option value="all">All Community (Students & Mentors)</option>
              <option value="student">Students Only</option>
              <option value="mentor">Mentors Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Body
            </label>
            <textarea
              required
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Detailed notification copy..."
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateAnnOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Broadcast Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
