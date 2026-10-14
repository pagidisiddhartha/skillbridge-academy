import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Course,
  Enrollment,
  InternshipApplication,
  Project,
  ProjectSubmission,
  Certificate,
  Announcement,
} from '../types';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Upload,
  User as UserIcon,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Send,
  Plus,
  X,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

interface DashboardStudentProps {
  initialSubTab?: string;
  onOpenClassroom: (courseId: string, lessonId?: string) => void;
  onNavigate: (tab: string, param?: string) => void;
}

export const DashboardStudent: React.FC<DashboardStudentProps> = ({
  initialSubTab = 'overview',
  onOpenClassroom,
  onNavigate,
}) => {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'internships' | 'projects' | 'certificates' | 'profile'>(
    (initialSubTab as any) || 'overview'
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Project submission modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [phone, setPhone] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  useEffect(() => {
    loadStudentDashboard();
  }, [user?.id]);

  useEffect(() => {
    if (profile && 'skills' in profile) {
      setUniversity(profile.university || '');
      setMajor(profile.major || '');
      setPhone(profile.phone || '');
      setGithubUrl(profile.githubUrl || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setPortfolioUrl(profile.portfolioUrl || '');
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const loadStudentDashboard = async () => {
    setLoading(true);
    try {
      const [coursesRes, appsRes, projsRes, subsRes, certsRes, annsRes] = await Promise.all([
        api.courses.getAll(),
        api.internships.getAllApplications(),
        api.projects.getAll(),
        api.projects.getAllSubmissions(),
        api.certificates.getAll(),
        api.announcements.getAll(),
      ]);

      setCourses(coursesRes.courses.filter((c) => c.isEnrolled));
      setApplications(appsRes.applications);
      setProjects(projsRes.projects);
      setSubmissions(subsRes.submissions);
      setCertificates(certsRes.certificates);
      setAnnouncements(annsRes.announcements);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this active application?')) return;
    try {
      await api.internships.withdraw(appId);
      loadStudentDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  const handleSubmitMilestoneWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmittingWork(true);
    try {
      await api.projects.submitWork(selectedProject.id, {
        milestoneId: selectedMilestoneId || undefined,
        repoUrl,
        demoUrl,
        notes: submissionNotes,
      });
      setSubmitModalOpen(false);
      setRepoUrl('');
      setDemoUrl('');
      setSubmissionNotes('');
      await loadStudentDashboard();
      alert('Your project milestone work has been submitted to your assigned mentor for evaluation!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit milestone work');
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileName,
        bio: profileBio,
        studentProfile: {
          university,
          major,
          phone,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          skills,
        },
      });
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getApplicationPipelineSteps = (status: string) => {
    const steps = ['applied', 'under_review', 'shortlisted', 'interview', 'selected'];
    const currentIdx = steps.indexOf(status);
    return steps.map((s, idx) => ({
      name: s.replace('_', ' ').toUpperCase(),
      passed: currentIdx >= idx,
      current: status === s,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Student Academic Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            You are enrolled in {courses.length} course{courses.length === 1 ? '' : 's'} with{' '}
            {applications.length} active internship application{applications.length === 1 ? '' : 's'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('courses')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            Browse Catalogue
          </button>
          <button
            onClick={() => onNavigate('internships')}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors shadow-sm"
          >
            Apply for Internships
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
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
            <span>My Courses ({courses.length})</span>
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
            <span>Internships ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Milestones & Submissions ({submissions.length})</span>
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
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-cyan-600 text-cyan-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile & CV</span>
          </button>
        </nav>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Enrolled Tracks
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{courses.length}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Active curriculum</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Internship Applications
              </span>
              <div className="text-2xl font-extrabold text-cyan-700 mt-1">{applications.length}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">In review pipeline</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Milestones Evaluated
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{submissions.length}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">By mentor Sarah Chen</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Issued Certificates
              </span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                {certificates.length}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Verifiable credentials</span>
            </div>
          </div>

          {/* Enrolled Courses Highlights */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Active Study Paths</h3>
              <button
                onClick={() => setActiveTab('courses')}
                className="text-xs font-semibold text-cyan-800 hover:text-cyan-900"
              >
                View all courses
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <p>You haven't enrolled in any courses yet.</p>
                <button
                  onClick={() => onNavigate('courses')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-md font-semibold text-xs"
                >
                  Explore Course Tracks
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="cyan" size="sm">
                          {course.category}
                        </Badge>
                        <span className="text-xs text-slate-500">{course.durationHours}h total</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{course.title}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Overall Progress</span>
                          <span className="font-bold">{course.progressPercent ?? 0}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-600 h-1.5 rounded-full"
                            style={{ width: `${course.progressPercent ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenClassroom(course.id)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-2xs mt-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Study</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Banner */}
          {announcements.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-cyan-700" />
                <span>Recent Platform Announcement</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{announcements[0].title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {announcements[0].content}
              </p>
              <span className="text-[10px] text-slate-500 block pt-1">
                Posted by {announcements[0].authorName} on{' '}
                {new Date(announcements[0].createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab: Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Enrolled Courses & Curriculums</h3>
            <button
              onClick={() => onNavigate('courses')}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Browse All Courses
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No course enrollments</h3>
              <p className="text-xs text-slate-500">
                Browse our curriculum catalogue to begin your study path.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="cyan" size="sm">
                        {course.category}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        {course.difficulty}
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{course.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{course.shortDescription}</p>

                    <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Completion</span>
                        <span className="font-bold text-cyan-800">{course.progressPercent ?? 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cyan-600 h-2 rounded-full"
                          style={{ width: `${course.progressPercent ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.durationHours} Hours Curriculum
                    </span>

                    <button
                      onClick={() => onOpenClassroom(course.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Open Classroom</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Internships */}
      {activeTab === 'internships' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Your Internship Applications</h3>
            <button
              onClick={() => onNavigate('internships')}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Browse Active Postings
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you satisfy module requirements, submit applications to partner company postings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const steps = getApplicationPipelineSteps(app.status);
                const isWithdrawn = app.status === 'withdrawn';
                const isRejected = app.status === 'rejected';

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase">
                            {app.organization || 'Company Partner'}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-400">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">
                          {app.internshipTitle || 'Internship Application'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
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
                          size="md"
                          className="capitalize font-semibold"
                        >
                          Status: {app.status.replace('_', ' ')}
                        </Badge>

                        {!isWithdrawn && !isRejected && app.status !== 'selected' && (
                          <button
                            onClick={() => handleWithdrawApplication(app.id)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-medium"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pipeline Stage Tracker */}
                    {!isWithdrawn && !isRejected && (
                      <div className="py-2">
                        <div className="grid grid-cols-5 gap-2 text-center text-xs">
                          {steps.map((st, i) => (
                            <div key={i} className="space-y-1">
                              <div
                                className={`h-2 rounded-full ${
                                  st.passed
                                    ? 'bg-cyan-600'
                                    : 'bg-slate-200'
                                }`}
                              />
                              <span
                                className={`text-[10px] block font-mono ${
                                  st.current
                                    ? 'text-cyan-800 font-bold'
                                    : st.passed
                                    ? 'text-slate-700 font-medium'
                                    : 'text-slate-400'
                                }`}
                              >
                                {st.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review Notes / Feedback if provided by Committee */}
                    {app.reviewNotes && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-slate-800">
                          Academic Committee / Employer Notes:
                        </span>
                        <p className="text-slate-600 leading-relaxed">{app.reviewNotes}</p>
                      </div>
                    )}

                    <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center gap-4 border-t border-slate-100">
                      <span>Resume File: <strong className="text-slate-700">{app.resumeFileName}</strong></span>
                      {app.portfolioUrl && (
                        <span>
                          Portfolio:{' '}
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-800 underline"
                          >
                            {app.portfolioUrl}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Projects & Submissions */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Capstone Project & Milestones</h3>
              <p className="text-xs text-slate-500">
                Submit deliverables for rubric evaluation and review by assigned mentor Sarah Chen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Active Project Instructions */}
            <div className="lg:col-span-6 space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="cyan" size="sm">
                      Capstone Specification
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Deadline: {new Date(proj.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Milestone Schedule
                    </h5>
                    <div className="space-y-2">
                      {proj.milestones.map((ms) => {
                        const sub = submissions.find((s) => s.milestoneId === ms.id);
                        return (
                          <div
                            key={ms.id}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{ms.title}</span>
                              <span className="text-[11px] text-slate-500">{ms.description}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {sub ? (
                                <Badge
                                  variant={sub.status === 'approved' ? 'success' : 'warning'}
                                  size="sm"
                                  className="capitalize"
                                >
                                  {sub.status.replace('_', ' ')}
                                  {sub.grade !== undefined ? ` (${sub.grade}%)` : ''}
                                </Badge>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedProject(proj);
                                    setSelectedMilestoneId(ms.id);
                                    setSubmitModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-md hover:bg-slate-800"
                                >
                                  Submit Work
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submissions & Mentor Feedback History */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  Mentor Reviews & Feedback History
                </h4>

                {submissions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No submissions uploaded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {sub.milestoneTitle || 'Milestone Submission'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Submitted {new Date(sub.submittedAt).toLocaleDateString()} · Version {sub.version}
                            </span>
                          </div>

                          <Badge
                            variant={sub.status === 'approved' ? 'success' : 'warning'}
                            size="sm"
                            className="capitalize"
                          >
                            {sub.status.replace('_', ' ')}
                            {sub.grade !== undefined ? ` · ${sub.grade}/100` : ''}
                          </Badge>
                        </div>

                        <div className="text-xs text-slate-600">
                          <div>Repository:{' '}
                            <a
                              href={sub.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-800 underline font-mono"
                            >
                              {sub.repoUrl}
                            </a>
                          </div>
                          {sub.demoUrl && (
                            <div className="mt-0.5">Live Demo:{' '}
                              <a
                                href={sub.demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-800 underline font-mono"
                              >
                                {sub.demoUrl}
                              </a>
                            </div>
                          )}
                        </div>

                        {sub.mentorFeedback && (
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                              Mentor Sarah Chen Feedback:
                            </span>
                            <p className="text-slate-700 leading-relaxed italic">
                              "{sub.mentorFeedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Certificates */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Earned Verifiable Credentials</h3>
            <button
              onClick={() => onNavigate('verify')}
              className="text-xs font-semibold text-cyan-800 hover:text-cyan-900 flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Verification Portal</span>
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No certificates issued yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete 100% of curriculum lessons and achieve passing grades on capstone milestones
                to receive an official credential.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-xl border-2 border-slate-900 p-6 shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-cyan-600" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Official Credential
                        </span>
                      </div>
                      <Badge variant="success" size="sm">
                        {cert.status.toUpperCase()}
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{cert.title}</h4>
                    <p className="text-xs text-slate-600">
                      Awarded to <strong>{cert.studentName}</strong> on{' '}
                      {new Date(cert.completionDate).toLocaleDateString()}
                    </p>
                    {cert.grade && (
                      <span className="text-xs font-semibold text-cyan-800 block">
                        Standing: {cert.grade}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <code className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                      {cert.certificateCode}
                    </code>

                    <button
                      onClick={() => onNavigate('verify', cert.certificateCode)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1 shadow-2xs"
                    >
                      <span>Verify Credential</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile & CV */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-2xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Student Profile & Engineering CV</h3>
            <p className="text-xs text-slate-500">
              Information displayed to mentor Sarah Chen and partner hiring managers during internship review.
            </p>
          </div>

          {profileSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile information successfully updated and saved!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Engineering Biography / Headline
              </label>
              <textarea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Brief summary of your technical interests and career trajectory..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University / Academic Institution
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. University of Oslo / Informatics"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Major / Field of Study
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Skills Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Skill Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-slate-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                        setSkills([...skills, skillInput.trim()]);
                        setSkillInput('');
                      }
                    }
                  }}
                  placeholder="Type skill and press Enter"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                      setSkills([...skills, skillInput.trim()]);
                      setSkillInput('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submit Work Modal */}
      {selectedProject && (
        <Modal
          isOpen={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          title={`Submit Work: ${selectedProject.title}`}
          description="Provide git repository and deployment links for mentor review."
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitMilestoneWork} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Repository URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your-username/repo-name"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Live Staging / Deployment URL (Optional)
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://your-app.vercel.app"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes for Mentor Sarah Chen
              </label>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Explain key architectural decisions, test instructions, or areas where you would like specific feedback..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingWork}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingWork ? 'Uploading...' : 'Submit to Mentor'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
