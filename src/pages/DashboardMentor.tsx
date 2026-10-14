import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProjectSubmission, Project, User } from '../types';
import {
  Compass,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileCheck,
  Send,
  MessageSquare,
  Award,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const DashboardMentor: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [selectedSub, setSelectedSub] = useState<ProjectSubmission | null>(null);
  const [grade, setGrade] = useState<number>(92);
  const [feedback, setFeedback] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'needs_revision'>('approved');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadMentorDesk();
  }, [user?.id]);

  const loadMentorDesk = async () => {
    setLoading(true);
    try {
      const [subsRes, projsRes] = await Promise.all([
        api.projects.getAllSubmissions(),
        api.projects.getAll(),
      ]);
      setSubmissions(subsRes.submissions);
      setProjects(projsRes.projects);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (sub: ProjectSubmission) => {
    setSelectedSub(sub);
    setGrade(sub.grade ?? 90);
    setFeedback(
      sub.mentorFeedback ||
        'Great progress on this milestone! Clean code structure and adherence to REST architectural patterns. Approved.'
    );
    setReviewStatus(sub.status === 'needs_revision' ? 'needs_revision' : 'approved');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmittingReview(true);
    try {
      await api.projects.reviewSubmission(selectedSub.id, {
        grade: Number(grade),
        feedback,
        status: reviewStatus,
      });
      setSelectedSub(null);
      await loadMentorDesk();
      alert('Review and feedback saved successfully! Student notified.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mentor Guidance Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Mentor {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            You are overseeing technical milestones and architectural code quality for assigned
            SkillBridge cohort students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 border border-slate-700 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-mono">PENDING REVIEWS</span>
            <span className="text-xl font-bold text-cyan-400">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Grid: Assigned Students & Submissions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Submissions Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Submission Queue</h2>
              <p className="text-xs text-slate-500">
                Inspect GitHub repositories, verify milestone specifications, and record grades.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No submissions currently queued for evaluation.
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const isPending = sub.status === 'under_review' || sub.status === 'submitted';
                return (
                  <div
                    key={sub.id}
                    className={`bg-white rounded-xl border p-5 transition-all shadow-2xs space-y-4 ${
                      isPending ? 'border-cyan-300 ring-1 ring-cyan-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {sub.studentName || 'Student'}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">
                            Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-cyan-900">
                          {sub.milestoneTitle || 'Milestone Submission'}
                        </h3>
                        <span className="text-[11px] text-slate-500">{sub.projectTitle}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            sub.status === 'approved'
                              ? 'success'
                              : sub.status === 'needs_revision'
                              ? 'warning'
                              : 'primary'
                          }
                          size="md"
                          className="capitalize font-semibold"
                        >
                          {sub.status.replace('_', ' ')}
                          {sub.grade !== undefined ? ` · ${sub.grade}%` : ''}
                        </Badge>

                        <button
                          onClick={() => handleOpenReview(sub)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isPending
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isPending ? 'Review & Grade' : 'Edit Evaluation'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex flex-wrap items-center gap-4 text-slate-700">
                        <span className="flex items-center gap-1 font-mono">
                          <Code2 className="w-3.5 h-3.5 text-slate-400" />
                          Repo:{' '}
                          <a
                            href={sub.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-800 underline truncate max-w-xs"
                          >
                            {sub.repoUrl}
                          </a>
                        </span>
                        {sub.demoUrl && (
                          <span className="flex items-center gap-1 font-mono">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            Demo:{' '}
                            <a
                              href={sub.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-800 underline truncate max-w-xs"
                            >
                              {sub.demoUrl}
                            </a>
                          </span>
                        )}
                      </div>

                      {sub.notes && (
                        <p className="text-slate-600 pt-1 italic text-[11px]">
                          Student notes: "{sub.notes}"
                        </p>
                      )}
                    </div>

                    {sub.mentorFeedback && (
                      <div className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <strong className="text-slate-800">Your Recorded Feedback:</strong>{' '}
                        <span>"{sub.mentorFeedback}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Assigned Students & Mentorship Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assigned Student Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Cohort Mentees
            </h3>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Alex Rivera"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Alex Rivera</h4>
                  <p className="text-[11px] text-slate-500">student@skillbridge.edu</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div>Track: <strong className="text-slate-800">Full-Stack Web Engineering</strong></div>
                <div>Status: <span className="text-cyan-700 font-semibold">Active · 40% Complete</span></div>
                <div>Internship Application: <span className="text-purple-700 font-semibold">Under Review</span></div>
              </div>
            </div>
          </div>

          {/* Mentorship Rubric Standards */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Code Review Rubric Standards
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify TypeScript strict type boundaries (no blind \`any\` casting).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ensure backend route controllers enforce server-side role validation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Confirm database schema normalization and index optimization.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Provide actionable, constructive feedback on revision requests.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Review & Grade Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Evaluate Milestone: ${selectedSub.milestoneTitle || 'Submission'}`}
          description={`Student: ${selectedSub.studentName || 'Student'} · Project: ${selectedSub.projectTitle}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Repository Link:</span>
                <a
                  href={selectedSub.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-800 underline font-mono font-medium flex items-center gap-1 mt-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  {selectedSub.repoUrl}
                </a>
              </div>
              {selectedSub.demoUrl && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Live Demonstration:</span>
                  <a
                    href={selectedSub.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-800 underline font-mono font-medium flex items-center gap-1 mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {selectedSub.demoUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Evaluation Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evaluation Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus('approved')}
                  className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    reviewStatus === 'approved'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved & Qualified</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus('needs_revision')}
                  className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    reviewStatus === 'needs_revision'
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Request Revisions</span>
                </button>
              </div>
            </div>

            {/* Score */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numerical Grade (0 - 100%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            {/* Constructive Feedback */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mentor Rubric Feedback & Actionable Recommendations
              </label>
              <textarea
                required
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write specific feedback on code architecture, error handling, or performance..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'Recording Evaluation...' : 'Save & Publish Evaluation'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
