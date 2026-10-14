import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { authenticate, generateToken, revokeToken, authRateLimiter, AuthenticatedRequest } from '../middleware/auth.js';
import { User, StudentProfile, MentorProfile } from '../types.js';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'mentor']).default('student'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { name, email, password, role } = parseResult.data;

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user-${role}-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    if (role === 'student') {
      const studentProfile: StudentProfile = {
        userId,
        skills: [],
      };
      db.upsertStudentProfile(studentProfile);
    } else if (role === 'mentor') {
      const mentorProfile: MentorProfile = {
        userId,
        company: 'Partner Enterprise',
        jobTitle: 'Senior Technical Lead',
        expertise: ['Full-Stack', 'Systems Architecture'],
        yearsExperience: 5,
        assignedStudentIds: [],
      };
      db.upsertMentorProfile(mentorProfile);
    }

    db.addAuditLog(userId, email, 'USER_REGISTERED', 'User', userId, `Registered as ${role}`, req.ip);

    // Initial welcome notification
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId,
      title: 'Welcome to SkillBridge Academy!',
      message: 'Explore courses, apply for industry internships, and connect with technical mentors.',
      read: false,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(newUser);
    const { passwordHash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0].message });
      return;
    }

    const { email, password } = parseResult.data;
    const user = db.getUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    db.addAuditLog(user.id, user.email, 'USER_LOGIN', 'User', user.id, 'Successful login', req.ip);

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// POST /api/auth/demo-login - Quick 1-click login for test roles
router.post('/demo-login', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    let targetEmail = 'student@skillbridge.edu';
    if (role === 'mentor') targetEmail = 'mentor@skillbridge.edu';
    if (role === 'admin') targetEmail = 'admin@skillbridge.edu';

    const user = db.getUserByEmail(targetEmail);
    if (!user) {
      res.status(404).json({ error: 'Demo account not found.' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: `Logged in as demo ${user.role} (${user.name})`,
      token,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Demo login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { passwordHash: _, ...safeUser } = user;

  let profile = null;
  if (user.role === 'student') {
    profile = db.getStudentProfile(user.id);
  } else if (user.role === 'mentor') {
    profile = db.getMentorProfile(user.id);
  }

  res.json({
    user: safeUser,
    profile,
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { name, avatar, bio, studentProfile, mentorProfile } = req.body;

    // Update base user
    const updatedUser = db.updateUser(user.id, {
      name: name ?? user.name,
      avatar: avatar ?? user.avatar,
      bio: bio ?? user.bio,
    });

    let updatedProfile = null;
    if (user.role === 'student' && studentProfile) {
      updatedProfile = db.upsertStudentProfile({
        ...studentProfile,
        userId: user.id,
      });
    } else if (user.role === 'mentor' && mentorProfile) {
      updatedProfile = db.upsertMentorProfile({
        ...mentorProfile,
        userId: user.id,
      });
    }

    db.addAuditLog(user.id, user.email, 'PROFILE_UPDATED', 'User', user.id, 'Updated profile information', req.ip);

    const { passwordHash: _, ...safeUser } = updatedUser!;
    res.json({
      message: 'Profile updated successfully.',
      user: safeUser,
      profile: updatedProfile,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) revokeToken(token);
  }
  res.json({ message: 'Logged out successfully.' });
});

export default router;
