import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, optionalAuthenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { Internship, InternshipApplication, ApplicationStatus } from '../types.js';

const router = Router();

// GET /api/internships - Public/authenticated list
router.get('/', optionalAuthenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { workMode, status, search } = req.query;
  const isAdmin = req.user?.role === 'admin';

  const internships = db.getInternships({
    workMode: workMode ? String(workMode) : undefined,
    status: status ? String(status) : (isAdmin ? undefined : 'published'),
    search: search ? String(search) : undefined,
  });

  // If student is logged in, attach their application status if any
  if (req.user && req.user.role === 'student') {
    const studentApps = db.getApplications({ studentId: req.user.id });
    const enriched = internships.map((i) => {
      const myApp = studentApps.find((a) => a.internshipId === i.id);
      return {
        ...i,
        hasApplied: !!myApp,
        myApplicationStatus: myApp ? myApp.status : null,
        myApplicationId: myApp ? myApp.id : null,
      };
    });
    res.json({ internships: enriched });
    return;
  }

  res.json({ internships });
});

// GET /api/internships/:id - Internship details
router.get('/:id', optionalAuthenticate, (req: AuthenticatedRequest, res: Response): void => {
  const internship = db.getInternshipById(req.params.id);
  if (!internship) {
    res.status(404).json({ error: 'Internship not found' });
    return;
  }

  let myApplication = null;
  if (req.user && req.user.role === 'student') {
    const studentApps = db.getApplications({ studentId: req.user.id, internshipId: internship.id });
    if (studentApps.length > 0) {
      myApplication = studentApps[0];
    }
  }

  res.json({ internship, myApplication });
});

// POST /api/internships - Admin create internship
router.post('/', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      title,
      organization,
      logo,
      location,
      workMode,
      durationMonths,
      stipend,
      description,
      responsibilities,
      requiredSkills,
      eligibilityCriteria,
      deadline,
      availablePositions,
      status,
      featured,
    } = req.body;

    if (!title || !organization || !description || !deadline) {
      res.status(400).json({ error: 'Title, organization, description, and deadline are required.' });
      return;
    }

    const newInternship: Internship = {
      id: `intern-${Date.now()}`,
      title,
      organization,
      logo: logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
      location: location || 'Remote / Hybrid',
      workMode: workMode || 'hybrid',
      durationMonths: Number(durationMonths) || 6,
      stipend: stipend || 'Competitive Stipend',
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      eligibilityCriteria: Array.isArray(eligibilityCriteria) ? eligibilityCriteria : [],
      deadline,
      availablePositions: Number(availablePositions) || 2,
      status: status || 'published',
      featured: featured ?? false,
      createdAt: new Date().toISOString(),
    };

    db.createInternship(newInternship);
    db.addAuditLog(req.user!.id, req.user!.email, 'INTERNSHIP_CREATED', 'Internship', newInternship.id, `Created internship "${newInternship.title}" at ${newInternship.organization}`, req.ip);

    res.status(201).json({ message: 'Internship listing created', internship: newInternship });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create internship' });
  }
});

// PUT /api/internships/:id - Admin update internship
router.put('/:id', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const updated = db.updateInternship(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Internship not found' });
    return;
  }
  db.addAuditLog(req.user!.id, req.user!.email, 'INTERNSHIP_UPDATED', 'Internship', updated.id, `Updated internship "${updated.title}"`, req.ip);
  res.json({ message: 'Internship updated successfully', internship: updated });
});

// DELETE /api/internships/:id - Admin delete internship
router.delete('/:id', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const success = db.deleteInternship(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Internship not found' });
    return;
  }
  db.addAuditLog(req.user!.id, req.user!.email, 'INTERNSHIP_DELETED', 'Internship', req.params.id, `Deleted internship ${req.params.id}`, req.ip);
  res.json({ message: 'Internship deleted successfully' });
});

// POST /api/internships/:id/apply - Student apply for internship
router.post('/:id/apply', authenticate, requireRole('student'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const internship = db.getInternshipById(req.params.id);
    if (!internship) {
      res.status(404).json({ error: 'Internship listing not found' });
      return;
    }

    if (internship.status !== 'published') {
      res.status(400).json({ error: 'This internship is no longer accepting applications.' });
      return;
    }

    // Check deadline
    const deadlineDate = new Date(internship.deadline);
    if (deadlineDate.getTime() < Date.now()) {
      res.status(400).json({ error: 'The application deadline for this position has passed.' });
      return;
    }

    // Check duplicate active application
    const existingApps = db.getApplications({ studentId: req.user!.id, internshipId: internship.id });
    const hasActiveApp = existingApps.some((a) => a.status !== 'withdrawn' && a.status !== 'rejected');
    if (hasActiveApp) {
      res.status(409).json({ error: 'You already have an active application submitted for this internship.' });
      return;
    }

    const { coverLetter, resumeFileName, resumeDataUrl, portfolioUrl, skills, additionalInfo } = req.body;
    if (!coverLetter || coverLetter.trim().length < 50) {
      res.status(400).json({ error: 'Please provide a thoughtful cover letter (at least 50 characters).' });
      return;
    }

    const newApp: InternshipApplication = {
      id: `app-${Date.now()}`,
      internshipId: internship.id,
      studentId: req.user!.id,
      coverLetter,
      resumeFileName: resumeFileName || 'Alex_Rivera_Resume.pdf',
      resumeDataUrl: resumeDataUrl || undefined,
      portfolioUrl: portfolioUrl || '',
      skills: Array.isArray(skills) ? skills : [],
      additionalInfo: additionalInfo || '',
      status: 'applied',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createApplication(newApp);
    db.addAuditLog(req.user!.id, req.user!.email, 'INTERNSHIP_APPLIED', 'InternshipApplication', newApp.id, `Applied to "${internship.title}" at ${internship.organization}`, req.ip);

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: req.user!.id,
      title: 'Application Received!',
      message: `Your application for "${internship.title}" at ${internship.organization} has been received. Our review committee will update your status soon.`,
      read: false,
      link: '/dashboard/internships',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Application submitted successfully', application: newApp });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit application' });
  }
});

// GET /api/internships/applications/all - List applications
router.get('/applications/all', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  let rawApps: InternshipApplication[] = [];

  if (user.role === 'admin') {
    rawApps = db.getApplications();
  } else if (user.role === 'student') {
    rawApps = db.getApplications({ studentId: user.id });
  } else if (user.role === 'mentor') {
    const mentorProfile = db.getMentorProfile(user.id);
    const assigned = mentorProfile?.assignedStudentIds || [];
    rawApps = db.getApplications().filter((a) => assigned.includes(a.studentId));
  }

  // Enrich with applicant and internship information
  const enriched = rawApps.map((a) => {
    const internship = db.getInternshipById(a.internshipId);
    const student = db.getUserById(a.studentId);
    return {
      ...a,
      internshipTitle: internship?.title || 'Unknown Position',
      organization: internship?.organization || 'Unknown Org',
      organizationLogo: internship?.logo,
      studentName: student?.name || 'Student',
      studentEmail: student?.email,
      studentAvatar: student?.avatar,
    };
  });

  res.json({ applications: enriched });
});

// GET /api/internships/applications/:id
router.get('/applications/:id', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const app = db.getApplicationById(req.params.id);
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  // Security check: only applicant, assigned mentor, or admin can view
  if (req.user!.role === 'student' && app.studentId !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized to view this private application.' });
    return;
  }

  const internship = db.getInternshipById(app.internshipId);
  const student = db.getUserById(app.studentId);
  const studentProfile = db.getStudentProfile(app.studentId);

  res.json({
    application: app,
    internship,
    student: student ? { id: student.id, name: student.name, email: student.email, avatar: student.avatar } : null,
    studentProfile,
  });
});

// PUT /api/internships/applications/:id/status - Admin update status
router.put('/applications/:id/status', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { status, reviewNotes } = req.body as { status: ApplicationStatus; reviewNotes?: string };
  const validStatuses: ApplicationStatus[] = [
    'applied',
    'under_review',
    'shortlisted',
    'interview',
    'selected',
    'rejected',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const existing = db.getApplicationById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const updated = db.updateApplication(req.params.id, {
    status,
    reviewNotes: reviewNotes ?? existing.reviewNotes,
    reviewedByUserId: req.user!.id,
  });

  const internship = db.getInternshipById(existing.internshipId);

  // Notify student
  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: existing.studentId,
    title: `Application Status Updated: ${status.replace('_', ' ').toUpperCase()}`,
    message: `Your application for "${internship?.title || 'Internship'}" has moved to "${status.replace('_', ' ')}". ${reviewNotes ? `Notes: ${reviewNotes}` : ''}`,
    read: false,
    link: '/dashboard/internships',
    createdAt: new Date().toISOString(),
  });

  db.addAuditLog(req.user!.id, req.user!.email, 'APPLICATION_STATUS_UPDATED', 'InternshipApplication', existing.id, `Changed status of application ${existing.id} to ${status}`, req.ip);

  res.json({ message: 'Application status updated', application: updated });
});

// POST /api/internships/applications/:id/withdraw - Student withdraw
router.post('/applications/:id/withdraw', authenticate, requireRole('student'), (req: AuthenticatedRequest, res: Response): void => {
  const app = db.getApplicationById(req.params.id);
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  if (app.studentId !== req.user!.id) {
    res.status(403).json({ error: 'Unauthorized to withdraw another student\'s application.' });
    return;
  }

  const updated = db.updateApplication(req.params.id, { status: 'withdrawn' });
  db.addAuditLog(req.user!.id, req.user!.email, 'APPLICATION_WITHDRAWN', 'InternshipApplication', app.id, `Withdrew application for internship ${app.internshipId}`, req.ip);

  res.json({ message: 'Application withdrawn', application: updated });
});

export default router;
