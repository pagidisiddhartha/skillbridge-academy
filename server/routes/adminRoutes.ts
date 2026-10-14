import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requireRole, optionalAuthenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { Announcement } from '../types.js';

const router = Router();

// GET /api/admin/analytics - Computed platform statistics
router.get('/analytics', authenticate, requireRole('admin', 'mentor'), (req: AuthenticatedRequest, res: Response): void => {
  const stats = db.getAnalytics();
  res.json({ analytics: stats });
});

// GET /api/admin/audit-logs - Administrative audit trail
router.get('/audit-logs', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const logs = db.getAuditLogs(100);
  res.json({ auditLogs: logs });
});

// GET /api/admin/users - Users list with profile data
router.get('/users', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const users = db.getUsers().map((u) => {
    const { passwordHash: _, ...safeUser } = u;
    const studentProfile = u.role === 'student' ? db.getStudentProfile(u.id) : undefined;
    const mentorProfile = u.role === 'mentor' ? db.getMentorProfile(u.id) : undefined;
    return {
      ...safeUser,
      studentProfile,
      mentorProfile,
    };
  });
  res.json({ users });
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { role } = req.body;
  if (!['student', 'mentor', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Invalid role specified.' });
    return;
  }

  const updated = db.updateUser(req.params.id, { role });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  db.addAuditLog(req.user!.id, req.user!.email, 'USER_ROLE_CHANGED', 'User', updated.id, `Changed role of ${updated.email} to ${role}`, req.ip);
  const { passwordHash: _, ...safeUser } = updated;
  res.json({ message: 'User role updated', user: safeUser });
});

// PUT /api/admin/users/:id/assign-mentor - Assign mentor to student
router.put('/users/:id/assign-mentor', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { mentorId } = req.body;
  const student = db.getUserById(req.params.id);
  if (!student || student.role !== 'student') {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const mentor = db.getUserById(mentorId);
  if (!mentor || mentor.role !== 'mentor') {
    res.status(404).json({ error: 'Mentor not found.' });
    return;
  }

  // Update student profile
  const stProfile = db.getStudentProfile(student.id) || { userId: student.id, skills: [] };
  stProfile.assignedMentorId = mentor.id;
  db.upsertStudentProfile(stProfile);

  // Update mentor profile
  const mProfile = db.getMentorProfile(mentor.id) || {
    userId: mentor.id,
    company: 'Enterprise',
    jobTitle: 'Senior Engineer',
    expertise: [],
    yearsExperience: 5,
    assignedStudentIds: [],
  };
  if (!mProfile.assignedStudentIds.includes(student.id)) {
    mProfile.assignedStudentIds.push(student.id);
    db.upsertMentorProfile(mProfile);
  }

  db.addAuditLog(req.user!.id, req.user!.email, 'MENTOR_ASSIGNED', 'User', student.id, `Assigned mentor ${mentor.name} to ${student.name}`, req.ip);

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: student.id,
    title: 'Mentor Assigned!',
    message: `${mentor.name} (${mProfile.company}) has been assigned as your technical mentor.`,
    read: false,
    link: '/dashboard',
    createdAt: new Date().toISOString(),
  });

  res.json({ message: 'Mentor assigned successfully' });
});

// GET /api/announcements - Public/authenticated announcements
router.get('/announcements', optionalAuthenticate, (req: AuthenticatedRequest, res: Response): void => {
  const role = req.user?.role;
  const announcements = db.getAnnouncements(role);
  res.json({ announcements });
});

// POST /api/announcements - Admin create announcement
router.post('/announcements', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { title, content, targetRole, priority } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    targetRole: targetRole || 'all',
    priority: priority || 'normal',
    createdAt: new Date().toISOString(),
    authorName: `${req.user!.name} (${req.user!.role.toUpperCase()})`,
    authorId: req.user!.id,
  };

  db.createAnnouncement(newAnn);
  db.addAuditLog(req.user!.id, req.user!.email, 'ANNOUNCEMENT_CREATED', 'Announcement', newAnn.id, `Created announcement "${newAnn.title}"`, req.ip);

  res.status(201).json({ message: 'Announcement published', announcement: newAnn });
});

// GET /api/notifications - User's notifications
router.get('/notifications', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const notifs = db.getNotifications(req.user!.id);
  res.json({ notifications: notifs });
});

// PUT /api/notifications/:id/read - Mark one notification read
router.put('/notifications/:id/read', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const success = db.markNotificationAsRead(req.params.id, req.user!.id);
  res.json({ success });
});

// PUT /api/notifications/read-all - Mark all read
router.put('/notifications/read-all', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  db.markAllNotificationsAsRead(req.user!.id);
  res.json({ success: true });
});

// POST /api/admin/reset-demo-data
router.post('/reset-demo-data', authenticate, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  db.resetToSeed();
  db.addAuditLog(req.user!.id, req.user!.email, 'DATABASE_RESET', 'Database', 'all', 'Reset database to initial seed data', req.ip);
  res.json({ message: 'Database reset to seed data successfully.' });
});

export default router;
