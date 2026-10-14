import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { Project, ProjectSubmission, SubmissionStatus } from '../types.js';

const router = Router();

// GET /api/projects
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const projects = db.getProjects();
  res.json({ projects });
});

// GET /api/projects/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json({ project });
});

// POST /api/projects - Admin create project
router.post('/', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { title, description, instructions, requirements, deliverables, deadline, milestones } = req.body;
    if (!title || !description || !instructions) {
      res.status(400).json({ error: 'Title, description, and instructions are required.' });
      return;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title,
      description,
      instructions,
      requirements: Array.isArray(requirements) ? requirements : [],
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      deadline: deadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: Array.isArray(milestones) ? milestones : [],
      createdAt: new Date().toISOString(),
    };

    db.createProject(newProject);
    db.addAuditLog(req.user!.id, req.user!.email, 'PROJECT_CREATED', 'Project', newProject.id, `Created project "${newProject.title}"`, req.ip);

    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project' });
  }
});

// GET /api/projects/submissions/all
router.get('/submissions/all', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  let rawSubs: ProjectSubmission[] = [];

  if (user.role === 'admin') {
    rawSubs = db.getSubmissions();
  } else if (user.role === 'student') {
    rawSubs = db.getSubmissions({ studentId: user.id });
  } else if (user.role === 'mentor') {
    const mentorProfile = db.getMentorProfile(user.id);
    const assigned = mentorProfile?.assignedStudentIds || [];
    rawSubs = db.getSubmissions().filter((s) => assigned.includes(s.studentId) || s.mentorId === user.id);
  }

  // Enrich submissions with project title & student details
  const enriched = rawSubs.map((s) => {
    const proj = db.getProjectById(s.projectId);
    const student = db.getUserById(s.studentId);
    const milestone = proj?.milestones.find((m) => m.id === s.milestoneId);
    return {
      ...s,
      projectTitle: proj?.title || 'Capstone Project',
      milestoneTitle: milestone?.title || 'General Submission',
      studentName: student?.name || 'Student',
      studentEmail: student?.email,
      studentAvatar: student?.avatar,
    };
  });

  res.json({ submissions: enriched });
});

// POST /api/projects/:id/submit - Student submit work
router.post('/:id/submit', authenticate, requireRole('student'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { milestoneId, repoUrl, demoUrl, notes, attachments } = req.body;
    if (!repoUrl) {
      res.status(400).json({ error: 'A repository or deliverable URL is required.' });
      return;
    }

    // Check existing submissions for this milestone
    const existing = db.getSubmissions({ studentId: req.user!.id, projectId: project.id })
      .filter((s) => s.milestoneId === milestoneId);

    const version = existing.length + 1;

    const newSub: ProjectSubmission = {
      id: `sub-${Date.now()}`,
      projectId: project.id,
      milestoneId: milestoneId || undefined,
      studentId: req.user!.id,
      repoUrl,
      demoUrl: demoUrl || '',
      notes: notes || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      version,
    };

    db.createSubmission(newSub);
    db.addAuditLog(req.user!.id, req.user!.email, 'PROJECT_SUBMITTED', 'ProjectSubmission', newSub.id, `Submitted version ${version} for project "${project.title}"`, req.ip);

    // Notify assigned mentor if any
    const studentProfile = db.getStudentProfile(req.user!.id);
    if (studentProfile?.assignedMentorId) {
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: studentProfile.assignedMentorId,
        title: 'New Student Submission to Review',
        message: `${req.user!.name} submitted work for "${project.title}".`,
        read: false,
        link: '/mentor/submissions',
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ message: 'Submission uploaded successfully', submission: newSub });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit project work' });
  }
});

// PUT /api/projects/submissions/:id/review - Mentor/Admin reviews submission
router.put('/submissions/:id/review', authenticate, requireRole('mentor', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { grade, feedback, status } = req.body;
    const sub = db.getSubmissionById(req.params.id);

    if (!sub) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const validStatuses: SubmissionStatus[] = ['under_review', 'needs_revision', 'approved'];
    const newStatus: SubmissionStatus = validStatuses.includes(status) ? status : 'approved';

    const updated = db.updateSubmission(sub.id, {
      grade: typeof grade === 'number' ? grade : sub.grade,
      mentorFeedback: feedback || sub.mentorFeedback,
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      mentorId: req.user!.id,
    });

    const project = db.getProjectById(sub.projectId);

    // Notify student
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: sub.studentId,
      title: newStatus === 'approved' ? 'Project Submission Approved!' : 'Revisions Requested on Project Submission',
      message: `${req.user!.name} reviewed your submission for "${project?.title || 'Project'}". Status: ${newStatus.replace('_', ' ').toUpperCase()}${grade !== undefined ? ` (Grade: ${grade}%)` : ''}`,
      read: false,
      link: '/dashboard/projects',
      createdAt: new Date().toISOString(),
    });

    db.addAuditLog(req.user!.id, req.user!.email, 'SUBMISSION_REVIEWED', 'ProjectSubmission', sub.id, `Reviewed submission ${sub.id}: status=${newStatus}, grade=${grade}`, req.ip);

    res.json({ message: 'Submission reviewed successfully', submission: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to review submission' });
  }
});

export default router;
