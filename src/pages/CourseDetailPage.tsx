import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course, CourseModule, Lesson, Enrollment, LessonProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  Video,
  FileText,
  HelpCircle,
  Code2,
  ChevronDown,
  Play,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface CourseDetailPageProps {
  courseId: string;
  onBack: () => void;
  onOpenClassroom: (courseId: string, lessonId?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  courseId,
  onBack,
  onOpenClassroom,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId, user?.id]);

  const loadCourseDetails = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getById(courseId);
      setCourse(res.course);
      setEnrollment(res.enrollment);
      setLessonProgress(res.lessonProgress || []);
      if (res.course.modules && res.course.modules.length > 0) {
        setOpenModuleId(res.course.modules[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    if (user?.role !== 'student') {
      alert('Only registered students can enroll in courses. Switch to student account or register.');
      return;
    }

    setEnrolling(true);
    try {
      const res = await api.courses.enroll(courseId);
      setEnrollment(res.enrollment);
      // Immediately open classroom
      onOpenClassroom(courseId);
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading syllabus details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Course not found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some((p) => p.lessonId === lessonId && p.completed);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'assignment':
        return <Code2 className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="pb-20 space-y-10">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-6">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="sm" className="bg-cyan-950 text-cyan-300 border-cyan-800">
                  {course.category}
                </Badge>
                <Badge variant="slate" size="sm" className="bg-slate-800 text-slate-300 border-slate-700">
                  {course.difficulty} Level
                </Badge>
                {enrollment && (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {course.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  {course.durationHours} Hours Self-Paced & Mentor Reviews
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  {course.modules?.length || 0} Modules Structured
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verifiable Completion Credential Included
                </span>
              </div>
            </div>

            {/* Sticky Action Card */}
            <div className="lg:col-span-4">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-xl space-y-5">
                <div className="rounded-lg overflow-hidden h-40 bg-slate-900 border border-slate-700">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {enrollment ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Your Progress</span>
                        <span className="text-cyan-400 font-bold">{enrollment.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenClassroom(course.id)}
                      className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume Study in Classroom</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Tuition</span>
                      <span className="text-xl font-bold text-white">Included in Cohort</span>
                    </div>

                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{enrolling ? 'Enrolling...' : 'Enroll & Begin Module 1'}</span>
                    </button>

                    <p className="text-[11px] text-slate-400 text-center">
                      Instant classroom access. Retains lesson progress across all sessions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Curriculum & Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Learning Outcomes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">What You Will Master</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Modules Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Curriculum Syllabus</h2>
                  <p className="text-xs text-slate-500">
                    Structured lessons, video walkthroughs, and knowledge assessments.
                  </p>
                </div>
                {enrollment && (
                  <button
                    onClick={() => onOpenClassroom(course.id)}
                    className="text-xs font-bold text-cyan-800 hover:text-cyan-900 flex items-center gap-1"
                  >
                    Open in Classroom Player
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {course.modules?.map((mod, modIdx) => {
                  const isOpen = openModuleId === mod.id;
                  const lessons = mod.lessons || [];
                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                    >
                      <button
                        onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                            {modIdx + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium">
                            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180 text-cyan-600' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                          {lessons.map((lesson) => {
                            const completed = isLessonCompleted(lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                className="p-3.5 pl-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {getLessonIcon(lesson.type)}
                                  <div>
                                    <span className="text-xs font-semibold text-slate-800 block">
                                      {lesson.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 capitalize">
                                      {lesson.type} · {lesson.durationMinutes} mins
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {completed && (
                                    <Badge variant="success" size="sm">
                                      Completed
                                    </Badge>
                                  )}
                                  {enrollment ? (
                                    <button
                                      onClick={() => onOpenClassroom(course.id, lesson.id)}
                                      className="px-2.5 py-1 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-md"
                                    >
                                      Study
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">Locked</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Instructor & Prerequisites */}
          <div className="lg:col-span-4 space-y-6">
            {/* Instructor Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Lead Track Instructor
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={course.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                  alt={course.instructor}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{course.instructor}</h4>
                  <p className="text-xs text-slate-500">Principal Systems Architect</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {course.instructorBio ||
                  'Experienced engineering leader dedicated to code quality, security architecture, and guiding career transitions into top tech organizations.'}
              </p>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Prerequisites & Preparation
              </h3>
              <ul className="space-y-2">
                {course.prerequisites.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
