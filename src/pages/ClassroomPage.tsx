import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Course, CourseModule, Lesson, LessonProgress } from '../types';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  Video,
  HelpCircle,
  Code2,
  ChevronRight,
  ChevronLeft,
  Download,
  AlertCircle,
  Sparkles,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface ClassroomPageProps {
  courseId: string;
  initialLessonId?: string;
  onBack: () => void;
}

export const ClassroomPage: React.FC<ClassroomPageProps> = ({
  courseId,
  initialLessonId,
  onBack,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    scorePercent: number;
    passed: boolean;
    passingScorePercent: number;
    feedback: any[];
  } | null>(null);

  useEffect(() => {
    loadClassroom();
  }, [courseId]);

  const loadClassroom = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getById(courseId);
      setCourse(res.course);
      setProgressList(res.lessonProgress || []);

      // Find initial lesson or first available
      const allLessons = res.course.modules?.flatMap((m) => m.lessons || []) || [];
      let target = allLessons[0];
      if (initialLessonId) {
        const found = allLessons.find((l) => l.id === initialLessonId);
        if (found) target = found;
      }
      setCurrentLesson(target || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = (lessonId: string) => {
    return progressList.some((p) => p.lessonId === lessonId && p.completed);
  };

  const handleToggleComplete = async (completed: boolean) => {
    if (!currentLesson) return;
    setMarking(true);
    try {
      const res = await api.courses.toggleLessonProgress(courseId, currentLesson.id, completed);

      setProgressList((prev) => {
        const idx = prev.findIndex((p) => p.lessonId === currentLesson.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = res.progress;
          return updated;
        }
        return [...prev, res.progress];
      });

      if (completed) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update progress');
    } finally {
      setMarking(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentLesson || !currentLesson.quiz) return;
    const questions = currentLesson.quiz.questions;
    const answers = questions.map((_, idx) => selectedAnswers[idx] ?? -1);

    if (answers.includes(-1)) {
      alert('Please answer all questions before submitting the assessment.');
      return;
    }

    try {
      const res = await api.courses.submitQuiz(currentLesson.id, answers);
      setQuizResult(res);
      setQuizSubmitted(true);

      if (res.passed) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        // Mark lesson completed in local state
        setProgressList((prev) => {
          const idx = prev.findIndex((p) => p.lessonId === currentLesson.id);
          const newEntry: LessonProgress = {
            id: `prog-${Date.now()}`,
            userId: '',
            courseId,
            lessonId: currentLesson.id,
            completed: true,
          };
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx].completed = true;
            return copy;
          }
          return [...prev, newEntry];
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  // Lesson traversal
  const allLessons = course?.modules?.flatMap((m) => m.lessons || []) || [];
  const currentIdx = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => isCompleted(l.id)).length;
  const overallPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Opening interactive classroom player...
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Classroom content unavailable</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
        >
          Return to Course Overview
        </button>
      </div>
    );
  }

  const currentIsCompleted = isCompleted(currentLesson.id);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Classroom Top Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit classroom"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">{course.title}</h1>
            <span className="text-[11px] text-slate-400">
              Module Lesson {currentIdx + 1} of {totalLessons}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400">Course Progress:</span>
            <span className="text-xs font-bold text-cyan-400">{overallPercent}%</span>
            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Curriculum Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Course Curriculum
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>

          <div className="max-h-[calc(100vh-240px)] overflow-y-auto divide-y divide-slate-100">
            {course.modules?.map((mod) => (
              <div key={mod.id} className="py-2">
                <div className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-50/50">
                  {mod.title}
                </div>
                <div className="space-y-0.5 mt-1">
                  {mod.lessons?.map((lesson) => {
                    const active = lesson.id === currentLesson.id;
                    const done = isCompleted(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLesson(lesson);
                          setSelectedAnswers({});
                          setQuizSubmitted(false);
                          setQuizResult(null);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                          active
                            ? 'bg-blue-50 text-blue-900 font-bold border-l-4 border-blue-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono shrink-0">
                          {lesson.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Player Pane */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col min-h-[640px]">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={
                    currentLesson.type === 'quiz'
                      ? 'purple'
                      : currentLesson.type === 'video'
                      ? 'danger'
                      : currentLesson.type === 'assignment'
                      ? 'warning'
                      : 'cyan'
                  }
                  size="sm"
                  className="uppercase font-mono tracking-wider"
                >
                  {currentLesson.type} Lesson
                </Badge>
                <span className="text-xs text-slate-400">
                  Est. {currentLesson.durationMinutes} Minutes
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{currentLesson.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleComplete(!currentIsCompleted)}
                disabled={marking}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentIsCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{currentIsCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>
            </div>
          </div>

          {/* Body Content based on Lesson Type */}
          <div className="p-6 sm:p-8 flex-1 space-y-6">
            {/* Video Lesson Embed */}
            {currentLesson.type === 'video' && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center relative shadow-inner">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="text-xs text-slate-500 italic">
                  Tip: Take notes on core architecture diagrams. Quiz questions and milestone
                  assessments directly reference these lecture walkthroughs.
                </div>
              </div>
            )}

            {/* Markdown / Text Content */}
            <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line space-y-4 font-sans">
              {currentLesson.content}
            </div>

            {/* Downloadable Resources */}
            {currentLesson.resources && currentLesson.resources.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Lesson Materials & Downloads
                </h4>
                <div className="divide-y divide-slate-200/80">
                  {currentLesson.resources.map((res) => (
                    <div
                      key={res.id}
                      className="py-2 flex items-center justify-between text-xs text-slate-700"
                    >
                      <span className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-700" />
                        {res.title}
                        {res.size && <span className="text-slate-400">({res.size})</span>}
                      </span>
                      <a
                        href={res.url}
                        download
                        className="text-cyan-800 hover:text-cyan-900 font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practical Assignment Prompt */}
            {currentLesson.type === 'assignment' && currentLesson.assignmentPrompt && (
              <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Code2 className="w-4 h-4 text-amber-600" />
                  <span>Hands-On Assignment Specification</span>
                </div>
                <div className="text-xs text-amber-950 whitespace-pre-line leading-relaxed">
                  {currentLesson.assignmentPrompt}
                </div>
              </div>
            )}

            {/* Interactive Quiz Engine */}
            {currentLesson.type === 'quiz' && currentLesson.quiz && (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Module Knowledge Verification Assessment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Passing Grade Requirement: {currentLesson.quiz.passingScorePercent}%
                    </p>
                  </div>
                  {quizResult && (
                    <Badge variant={quizResult.passed ? 'success' : 'danger'} size="md">
                      Score: {quizResult.scorePercent}% · {quizResult.passed ? 'PASSED' : 'RETRY'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-6">
                  {currentLesson.quiz.questions.map((q, qIndex) => {
                    const fb = quizResult?.feedback?.[qIndex];
                    return (
                      <div
                        key={q.id}
                        className="p-4 bg-white rounded-lg border border-slate-200 space-y-3"
                      >
                        <p className="text-xs font-bold text-slate-900">
                          {qIndex + 1}. {q.question}
                        </p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIndex) => {
                            const isChosen = selectedAnswers[qIndex] === optIndex;
                            let optionClass =
                              'border-slate-200 hover:bg-slate-50 text-slate-700';

                            if (quizSubmitted && fb) {
                              if (optIndex === fb.correctIndex) {
                                optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                              } else if (isChosen && !fb.isCorrect) {
                                optionClass = 'border-rose-500 bg-rose-50 text-rose-900';
                              }
                            } else if (isChosen) {
                              optionClass = 'border-cyan-600 bg-cyan-50/70 text-cyan-950 font-medium';
                            }

                            return (
                              <label
                                key={optIndex}
                                onClick={() => handleSelectAnswer(qIndex, optIndex)}
                                className={`w-full p-2.5 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${optionClass}`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-q-${qIndex}`}
                                  checked={isChosen}
                                  onChange={() => {}}
                                  disabled={quizSubmitted}
                                  className="w-4 h-4 text-cyan-600 border-slate-300 focus:ring-cyan-500"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>

                        {quizSubmitted && fb && (
                          <div
                            className={`p-2.5 rounded-md text-xs leading-relaxed ${
                              fb.isCorrect
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            <span className="font-bold">
                              {fb.isCorrect ? 'Correct! ' : 'Explanation: '}
                            </span>
                            {fb.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {quizSubmitted ? (
                    <button
                      onClick={handleResetQuiz}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Retake Quiz Assessment
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4 text-cyan-400" />
                      <span>Submit Answers for Evaluation</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Classroom Navigation Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
            {prevLesson ? (
              <button
                onClick={() => {
                  setCurrentLesson(prevLesson);
                  setSelectedAnswers({});
                  setQuizSubmitted(false);
                  setQuizResult(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous:</span> {prevLesson.title.slice(0, 24)}...
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                onClick={() => {
                  setCurrentLesson(nextLesson);
                  setSelectedAnswers({});
                  setQuizSubmitted(false);
                  setQuizResult(null);
                }}
                className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span className="hidden sm:inline">Next:</span> {nextLesson.title.slice(0, 24)}...
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onBack}
                className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg hover:bg-emerald-200 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Curriculum Complete! Return to Overview</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
